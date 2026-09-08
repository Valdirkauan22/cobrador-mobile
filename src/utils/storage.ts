import { AppConfig, OfflineAction, ProofItem } from '../types';

const STORAGE_KEY = 'cobradorCfg';
const OFFLINE_QUEUE_KEY = 'cobradorOfflineQueue';
export const DEFAULT_URL =
  'https://script.google.com/macros/s/AKfycbx4Hm5Nh2J8HeEhctvlRBdKKFDy-QY3miBFz1qZxq_QEHEleF-skUIhfceUL4k8bPxEdg/exec';
// A chave deve ser informada pelo usuário e nunca publicada no repositório.
export const DEFAULT_KEY = '';

export function loadConfig(): AppConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        url: DEFAULT_URL,
        key: DEFAULT_KEY,
        pixKey: '',
        nomeAssociacao: 'Associação de Moradores',
        isDemo: false
      };
    }
    const parsed = JSON.parse(raw);
    const url = parsed.url && parsed.url.trim() !== '' ? parsed.url.trim() : DEFAULT_URL;
    const key = parsed.key && parsed.key.trim() !== '' ? parsed.key.trim() : DEFAULT_KEY;
    const isDemo = parsed.isDemo === true && !parsed.url ? false : (parsed.isDemo ?? false);

    return {
      url,
      key,
      pixKey: parsed.pixKey || '',
      nomeAssociacao: parsed.nomeAssociacao || 'Associação de Moradores',
      isDemo
    };
  } catch {
    return {
      url: DEFAULT_URL,
      key: DEFAULT_KEY,
      pixKey: '',
      nomeAssociacao: 'Associação de Moradores',
      isDemo: false
    };
  }
}

export function saveConfig(cfg: AppConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
}

// Offline Queue Handling
export function getOfflineQueue(): OfflineAction[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp'>): OfflineAction {
  const queue = getOfflineQueue();
  const newAction: OfflineAction = {
    ...action,
    id: 'offline-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    timestamp: Date.now()
  };
  queue.push(newAction);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  return newAction;
}

export function removeOfflineAction(id: string): void {
  const queue = getOfflineQueue().filter((a) => a.id !== id);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export function clearOfflineQueue(): void {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
}

export function getOfflineQueueCount(): number {
  return getOfflineQueue().length;
}

// IndexedDB for Proof Attachments
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('CobradorMobile', 2);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('proofs')) {
        db.createObjectStore('proofs', { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveProofAttachment(
  codigo: string,
  morador: string,
  file: File,
  observacao?: string
): Promise<ProofItem> {
  const db = await openDb();
  const id = `${Date.now()}-${codigo}`;
  
  // Convert to DataURL for easy preview & persistence
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const item: ProofItem = {
    id,
    codigo,
    morador,
    nome: file.name,
    tipo: file.type,
    data: new Date().toISOString(),
    dataUrl,
    observacao
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction('proofs', 'readwrite');
    const store = tx.objectStore('proofs');
    store.put(item);
    tx.oncomplete = () => resolve(item);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getProofsForResident(codigo: string): Promise<ProofItem[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('proofs', 'readonly');
    const store = tx.objectStore('proofs');
    const req = store.getAll();
    req.onsuccess = () => {
      const all: ProofItem[] = req.result || [];
      resolve(all.filter((p) => String(p.codigo) === String(codigo)));
    };
    req.onerror = () => reject(req.error);
  });
}

import { AppConfig, ProofItem } from '../types';

const STORAGE_KEY = 'cobradorCfg';

export function loadConfig(): AppConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { url: '', key: '', isDemo: true };
    const parsed = JSON.parse(raw);
    return {
      url: parsed.url || '',
      key: parsed.key || '',
      isDemo: parsed.isDemo ?? (!parsed.url || !parsed.key)
    };
  } catch {
    return { url: '', key: '', isDemo: true };
  }
}

export function saveConfig(cfg: AppConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
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

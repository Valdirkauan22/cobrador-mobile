import React, { useState, useEffect } from 'react';
import { AppConfig } from '../../types';
import { DEFAULT_KEY, DEFAULT_URL, getOfflineQueueCount } from '../../utils/storage';
import { ModalWrapper } from './ModalWrapper';
import {
  Building2,
  Database,
  HelpCircle,
  Key,
  Link as LinkIcon,
  QrCode,
  RefreshCw,
  Sparkles,
  WifiOff
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  config: AppConfig;
  onClose: () => void;
  onSave: (config: AppConfig) => Promise<void>;
  onUseDemo: () => void;
  onSyncOffline?: () => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  config,
  onClose,
  onSave,
  onUseDemo,
  onSyncOffline
}) => {
  const [url, setUrl] = useState(config.url || DEFAULT_URL);
  const [key, setKey] = useState(config.key || DEFAULT_KEY);
  const [pixKey, setPixKey] = useState(config.pixKey || '');
  const [nomeAssociacao, setNomeAssociacao] = useState(
    config.nomeAssociacao || 'Associação de Moradores'
  );
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineCount, setOfflineCount] = useState(getOfflineQueueCount());
  const [showAdvancedConnection, setShowAdvancedConnection] = useState(false);

  useEffect(() => {
    setUrl(config.url || DEFAULT_URL);
    setKey(config.key || DEFAULT_KEY);
    setPixKey(config.pixKey || '');
    setNomeAssociacao(config.nomeAssociacao || 'Associação de Moradores');
    setOfflineCount(getOfflineQueueCount());
  }, [config, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      alert('Informe a Chave de acesso. O endereço do Web App já está configurado automaticamente.');
      return;
    }
    setIsTesting(true);
    try {
      await onSave({
        ...config,
        url: url.trim() || DEFAULT_URL,
        key: key.trim(),
        pixKey: pixKey.trim(),
        nomeAssociacao: nomeAssociacao.trim(),
        isDemo: false
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Falha ao conectar ao backend.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSetDemo = () => {
    onUseDemo();
    onClose();
  };

  const handleTriggerSync = async () => {
    if (!onSyncOffline) return;
    setIsSyncing(true);
    try {
      await onSyncOffline();
      setOfflineCount(getOfflineQueueCount());
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Configurações do Cobrador">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Offline items notice if any */}
        {offlineCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-amber-900 font-medium">
              <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>{offlineCount}</strong> ação(ões) pendente(s) para sincronizar.
              </span>
            </div>
            {onSyncOffline && (
              <button
                type="button"
                onClick={handleTriggerSync}
                disabled={isSyncing}
                className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando' : 'Sincronizar'}</span>
              </button>
            )}
          </div>
        )}

        <div className="bg-[#e7f1fb] p-3 rounded-xl text-xs text-[#123b66] border border-[#bcd7f2] flex items-start gap-2.5">
          <HelpCircle className="w-5 h-5 shrink-0 text-[#1769aa] mt-0.5" />
          <p>
            Para sincronizar com sua planilha do Google Sheets, implante o script{' '}
            <code className="bg-white/80 px-1 py-0.5 rounded font-mono font-bold">
              Backend_Planilha_v8_2.gs
            </code>{' '}
            como Web App (acesso: "Qualquer pessoa") e insira o link terminado em{' '}
            <code className="bg-white/80 px-1 py-0.5 rounded font-mono">/exec</code>.
          </p>
        </div>

        {/* Nome da Associação */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <LinkIcon className="w-4 h-4 text-emerald-700 shrink-0" />
              <div className="min-w-0"><strong className="block text-xs text-emerald-900">Endereço configurado automaticamente</strong><span className="block text-[10px] text-emerald-700 truncate">Google Apps Script da Associação</span></div>
            </div>
            <button type="button" onClick={()=>setShowAdvancedConnection(!showAdvancedConnection)} className="text-[10px] font-bold text-[#1769aa] bg-white px-2.5 py-1.5 rounded-lg border border-emerald-200">{showAdvancedConnection?'Ocultar':'Alterar'}</button>
          </div>
        </div>

        {showAdvancedConnection && <div>
          <label className="block text-xs font-bold text-[#68778a] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>Nome da Associação / Condomínio</span>
          </label>
          <input
            id="nomeAssociacao"
            type="text"
            value={nomeAssociacao}
            onChange={(e) => setNomeAssociacao(e.target.value)}
            placeholder="Ex: Associação dos Moradores do Bairro"
            className="w-full bg-[#fbfdff] border border-[#cad5e1] rounded-xl p-3 text-xs text-[#172033] outline-none focus:border-[#1769aa]"
          />
          <p className="text-[10px] text-amber-700 mt-1">Altere somente se uma nova implantação do Apps Script for criada.</p>
        </div>}

        {/* Chave PIX */}
        <div>
          <label className="block text-xs font-bold text-[#68778a] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5" />
            <span>Chave PIX da Associação (para cobrança rápida)</span>
          </label>
          <input
            id="pixKey"
            type="text"
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
            placeholder="Ex: associacao@email.com ou CNPJ / Chave Aleatória"
            className="w-full bg-[#fbfdff] border border-[#cad5e1] rounded-xl p-3 text-xs text-[#172033] outline-none focus:border-[#1769aa]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#68778a] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5" />
            <span>URL do Web App (/exec)</span>
          </label>
          <input
            id="url"
            type="url"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="w-full bg-[#fbfdff] border border-[#cad5e1] rounded-xl p-3 text-xs text-[#172033] font-mono outline-none focus:border-[#1769aa]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#68778a] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5" />
            <span>Chave de acesso</span>
          </label>
          <input
            id="key"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Sua chave secreta configurada no script"
            className="w-full bg-[#fbfdff] border border-[#cad5e1] rounded-xl p-3 text-xs text-[#172033] outline-none focus:border-[#1769aa]"
          />
        </div>

        <button
          type="submit"
          disabled={isTesting}
          className="w-full bg-[#1769aa] hover:bg-[#125a96] text-white py-3 px-4 rounded-xl font-bold tracking-wide uppercase shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          <Database className="w-4 h-4" />
          <span>{isTesting ? 'Salvando…' : 'SALVAR CONFIGURAÇÕES'}</span>
        </button>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-slate-400 text-xs uppercase font-semibold">ou</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <button
          type="button"
          onClick={handleSetDemo}
          className="w-full bg-slate-100 hover:bg-slate-200 text-[#173a5e] py-3 px-4 rounded-xl font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>USAR MODO DEMONSTRAÇÃO (LOCAL)</span>
        </button>
      </form>
    </ModalWrapper>
  );
};

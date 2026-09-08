import React, { useState, useEffect } from 'react';
import { AppConfig } from '../../types';
import { ModalWrapper } from './ModalWrapper';
import { Database, HelpCircle, Key, Link as LinkIcon, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  config: AppConfig;
  onClose: () => void;
  onSave: (config: AppConfig) => Promise<void>;
  onUseDemo: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  config,
  onClose,
  onSave,
  onUseDemo
}) => {
  const [url, setUrl] = useState(config.url || '');
  const [key, setKey] = useState(config.key || '');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setUrl(config.url || '');
    setKey(config.key || '');
  }, [config, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) {
      alert('Informe a URL do Web App (/exec) e a Chave de acesso.');
      return;
    }
    setIsTesting(true);
    try {
      await onSave({
        url: url.trim(),
        key: key.trim(),
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

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Conectar à planilha">
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <span>{isTesting ? 'Conectando…' : 'SALVAR E CONECTAR'}</span>
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

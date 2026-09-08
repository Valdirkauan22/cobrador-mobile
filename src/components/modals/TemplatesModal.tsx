import React, { useState, useEffect } from 'react';
import { Templates } from '../../types';
import { ModalWrapper } from './ModalWrapper';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchTemplates: () => Promise<Templates>;
  onSaveTemplates: (templates: Templates) => Promise<void>;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  fetchTemplates,
  onSaveTemplates
}) => {
  const [templates, setTemplates] = useState<Templates>({
    lembrete: '',
    vence_hoje: '',
    primeira: '',
    segunda: '',
    agradecimento: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetchTemplates()
        .then((t) => setTemplates(t))
        .catch((err) => alert(err.message || 'Erro ao carregar modelos'))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, fetchTemplates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveTemplates(templates);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar mensagens.');
    } finally {
      setIsSaving(false);
    }
  };

  const labels: Record<string, string> = {
    lembrete: 'Lembrete prévio de vencimento',
    vence_hoje: 'Aviso: Vence hoje',
    primeira: '1ª Notificação de atraso',
    segunda: '2ª Notificação de atraso',
    agradecimento: 'Mensagem de agradecimento / recibo'
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Mensagens automáticas">
      {isLoading ? (
        <div className="text-center py-8 text-slate-500 text-sm">Carregando modelos…</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-xl text-xs text-[#123b66] border border-blue-100">
            <strong>Variáveis disponíveis:</strong>
            <p className="mt-1">
              Use <code className="bg-white px-1.5 py-0.5 rounded font-mono">[nome]</code>,{' '}
              <code className="bg-white px-1.5 py-0.5 rounded font-mono">[competencia]</code>,{' '}
              <code className="bg-white px-1.5 py-0.5 rounded font-mono">[valor]</code> e{' '}
              <code className="bg-white px-1.5 py-0.5 rounded font-mono">[vencimento]</code>.
            </p>
          </div>

          {Object.entries(templates).map(([key, val]) => (
            <div key={key}>
              <label className="block text-xs font-bold text-[#68778a] uppercase tracking-wider mb-1">
                {labels[key] || key.replace('_', ' ')}
              </label>
              <textarea
                rows={2}
                value={val}
                onChange={(e) =>
                  setTemplates((prev) => ({ ...prev, [key]: e.target.value }))
                }
                className="w-full bg-[#fbfdff] border border-[#cad5e1] rounded-xl p-3 text-xs text-[#172033] outline-none focus:border-[#1769aa]"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-[#1769aa] hover:bg-[#125a96] text-white py-3.5 px-4 rounded-xl font-bold tracking-wide uppercase shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? 'Salvando...' : 'SALVAR MENSAGENS'}
          </button>
        </form>
      )}
    </ModalWrapper>
  );
};

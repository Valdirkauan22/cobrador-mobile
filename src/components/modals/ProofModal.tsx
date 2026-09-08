import React, { useState } from 'react';
import { PagoItem } from '../../types';
import { ModalWrapper } from './ModalWrapper';

interface ProofModalProps {
  isOpen: boolean;
  item: PagoItem | null;
  onClose: () => void;
  onConfirm: (file: File, observacao: string) => Promise<void>;
}

export const ProofModal: React.FC<ProofModalProps> = ({
  isOpen,
  item,
  onClose,
  onConfirm
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [obs, setObs] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Selecione o arquivo do comprovante (foto ou PDF).');
      return;
    }
    setIsSubmitting(true);
    try {
      await onConfirm(file, obs);
      setFile(null);
      setObs('');
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao anexar comprovante.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Anexar comprovante">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <span className="block text-xs font-bold text-[#68778a] uppercase">Morador</span>
          <strong className="text-sm font-bold text-[#172033]">{item.morador}</strong>
          <span className="text-xs text-[#68778a] block mt-0.5">Cód. {item.codigo} • Pago {item.valor_pago}</span>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#68778a] uppercase tracking-wider mb-1">
            Foto ou PDF do comprovante
          </label>
          <input
            id="proofFile"
            type="file"
            required
            accept="image/*,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full bg-[#fbfdff] border border-[#cad5e1] rounded-xl p-3 text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#e8f0f8] file:text-[#123b66] hover:file:bg-[#d8e6f5]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#68778a] uppercase tracking-wider mb-1">
            Observação
          </label>
          <textarea
            id="proofObs"
            rows={3}
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Ex: Comprovante de PIX enviado pelo WhatsApp..."
            className="w-full bg-[#fbfdff] border border-[#cad5e1] rounded-xl p-3 text-[#172033] outline-none focus:border-[#1769aa]"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#1769aa] hover:bg-[#125a96] text-white py-3 px-4 rounded-xl font-bold tracking-wide uppercase shadow-md transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? 'Anexando...' : 'ANEXAR'}
        </button>
      </form>
    </ModalWrapper>
  );
};

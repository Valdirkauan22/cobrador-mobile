import React, { useState } from 'react';
import { PendenteItem } from '../../types';
import { ModalWrapper } from './ModalWrapper';

interface PaymentModalProps {
  isOpen: boolean;
  item: PendenteItem | null;
  onClose: () => void;
  onConfirm: (data: {
    valor: number;
    data: string;
    forma: string;
    file?: File;
    observacao: string;
  }) => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  item,
  onClose,
  onConfirm
}) => {
  const defaultVal = item ? item.saldo.replace('R$', '').trim().replace(',', '.') : '';
  const [valor, setValor] = useState<string>('');
  const [data, setData] = useState<string>(new Date().toISOString().slice(0, 10));
  const [forma, setForma] = useState<string>('PIX');
  const [file, setFile] = useState<File | undefined>(undefined);
  const [obs, setObs] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  React.useEffect(() => {
    if (item) {
      const cleanVal = item.saldo.replace(/[^\d,]/g, '').replace(',', '.');
      setValor(cleanVal);
      setData(new Date().toISOString().slice(0, 10));
      setForma('PIX');
      setFile(undefined);
      setObs('');
    }
  }, [item]);

  if (!item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numVal = parseFloat(valor.replace(',', '.'));
    if (isNaN(numVal) || numVal <= 0) {
      alert('Informe um valor válido maior que zero.');
      return;
    }

    // Convert date YYYY-MM-DD to DD/MM/YYYY
    const formattedDate = data.split('-').reverse().join('/');

    setIsSubmitting(true);
    try {
      await onConfirm({
        valor: numVal,
        data: formattedDate,
        forma,
        file,
        observacao: obs
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar pagamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Registrar pagamento">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#68778a] uppercase tracking-wider mb-1">
            Morador
          </label>
          <input
            type="text"
            disabled
            value={`${item.morador} (Cód. ${item.codigo})`}
            className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-slate-700 font-semibold cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#68778a] uppercase tracking-wider mb-1">
              Valor (R$)
            </label>
            <input
              id="pValue"
              type="text"
              inputMode="decimal"
              required
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              className="w-full bg-[#fbfdff] border border-[#cad5e1] rounded-xl p-3 font-bold text-[#172033] outline-none focus:border-[#1769aa]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#68778a] uppercase tracking-wider mb-1">
              Data do pagamento
            </label>
            <input
              id="pDate"
              type="date"
              required
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full bg-[#fbfdff] border border-[#cad5e1] rounded-xl p-3 text-[#172033] outline-none focus:border-[#1769aa]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#68778a] uppercase tracking-wider mb-1">
            Forma de pagamento
          </label>
          <select
            id="pMethod"
            value={forma}
            onChange={(e) => setForma(e.target.value)}
            className="w-full bg-[#fbfdff] border border-[#cad5e1] rounded-xl p-3 text-[#172033] outline-none focus:border-[#1769aa]"
          >
            <option value="PIX">PIX</option>
            <option value="Dinheiro">Dinheiro</option>
            <option value="Transferencia">Transferência Bancária</option>
            <option value="Boleto">Boleto</option>
            <option value="Cartao">Cartão</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#68778a] uppercase tracking-wider mb-1">
            Comprovante (Foto ou PDF)
          </label>
          <input
            id="pFile"
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setFile(e.target.files?.[0])}
            className="w-full bg-[#fbfdff] border border-[#cad5e1] rounded-xl p-2.5 text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#e8f0f8] file:text-[#123b66] hover:file:bg-[#d8e6f5]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#68778a] uppercase tracking-wider mb-1">
            Observação
          </label>
          <textarea
            id="pObs"
            rows={2}
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Ex: Pago adiantado, transferência confirmada..."
            className="w-full bg-[#fbfdff] border border-[#cad5e1] rounded-xl p-3 text-[#172033] outline-none focus:border-[#1769aa]"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#1769aa] hover:bg-[#125a96] text-white py-3.5 px-4 rounded-xl font-bold tracking-wide uppercase shadow-md transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? 'Confirmando...' : 'CONFIRMAR PAGAMENTO'}
        </button>
      </form>
    </ModalWrapper>
  );
};

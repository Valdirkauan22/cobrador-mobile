import React, { useEffect, useState } from 'react';
import { MesAnual } from '../../types';
import { ModalWrapper } from './ModalWrapper';

interface AnnualModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchAnnualData: (ano?: number) => Promise<{ ano: number; meses: MesAnual[] }>;
}

export const AnnualModal: React.FC<AnnualModalProps> = ({
  isOpen,
  onClose,
  fetchAnnualData
}) => {
  const [ano, setAno] = useState(new Date().getFullYear());
  const [meses, setMeses] = useState<MesAnual[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetchAnnualData(ano)
        .then((res) => {
          setAno(res.ano);
          setMeses(res.meses);
        })
        .catch((err) => console.error('Erro anual:', err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, ano, fetchAnnualData]);

  const parseVal = (str: string) =>
    parseFloat(str.replace(/[^\d,]/g, '').replace(',', '.')) || 0;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={`Painel anual ${ano}`}>
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-slate-500 text-sm">Carregando painel anual…</div>
        ) : (
          meses.map((m) => {
            const p = parseVal(m.previsto) || 1;
            const v = parseVal(m.pago) || 0;
            const pct = Math.min(100, Math.round((v / p) * 100));

            return (
              <article
                key={m.mes}
                className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm"
              >
                <div className="flex justify-between items-center text-sm">
                  <b className="font-bold text-[#172033]">{m.competencia}</b>
                  <span className="text-xs font-semibold text-emerald-700">{pct}% arrecadado</span>
                </div>

                <div className="flex justify-between text-xs text-[#68778a] mt-1">
                  <span>Recebido: <strong className="text-emerald-700">{m.pago}</strong></span>
                  <span>Pendente: <strong className="text-amber-700">{m.pendente}</strong></span>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 bg-[#e8edf2] rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-[#1e8e5a] transition-all duration-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </article>
            );
          })
        )}
      </div>
    </ModalWrapper>
  );
};

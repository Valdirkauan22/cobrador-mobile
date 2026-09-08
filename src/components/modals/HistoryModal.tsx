import React, { useEffect, useState } from 'react';
import { HistoricoItem, ProofItem } from '../../types';
import { getProofsForResident } from '../../utils/storage';
import { ModalWrapper } from './ModalWrapper';
import { FileText, Image as ImageIcon } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  codigo: string | null;
  moradorNome: string;
  onClose: () => void;
  fetchHistory: (codigo: string) => Promise<HistoricoItem[]>;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  codigo,
  moradorNome,
  onClose,
  fetchHistory
}) => {
  const [history, setHistory] = useState<HistoricoItem[]>([]);
  const [proofs, setProofs] = useState<ProofItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && codigo) {
      setIsLoading(true);
      Promise.all([fetchHistory(codigo), getProofsForResident(codigo)])
        .then(([hist, prfs]) => {
          setHistory(hist);
          setProofs(prfs);
        })
        .catch((err) => console.error('Erro ao carregar histórico:', err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, codigo, fetchHistory]);

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={`Histórico: ${moradorNome}`}>
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-6 text-slate-500 text-sm">Carregando histórico…</div>
        ) : (
          <>
            {/* Stored Proofs in IndexedDB */}
            {proofs.length > 0 && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="block text-xs font-bold text-[#68778a] uppercase mb-2">
                  Comprovantes Anexados ({proofs.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {proofs.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2.5 text-xs"
                    >
                      {p.tipo.includes('pdf') ? (
                        <FileText className="w-5 h-5 text-red-500 shrink-0" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-blue-500 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800 truncate">{p.nome}</p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(p.data).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {p.dataUrl && (
                        <a
                          href={p.dataUrl}
                          download={p.nome}
                          className="bg-[#e8f0f8] hover:bg-[#d8e6f5] text-[#123b66] px-2 py-1 rounded font-bold text-[11px]"
                        >
                          Ver
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* General Action Logs */}
            <div className="space-y-2.5">
              <span className="block text-xs font-bold text-[#68778a] uppercase">
                Ocorrências e Pagamentos
              </span>
              {history.length === 0 ? (
                <p className="text-slate-500 text-center py-4 bg-slate-50 rounded-xl">
                  Sem histórico registrado para este morador.
                </p>
              ) : (
                history.map((h, i) => (
                  <article
                    key={i}
                    className="bg-white rounded-xl p-3.5 border border-slate-100 shadow-sm"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <b className="font-bold text-[#172033]">
                        {h.tipo} — {h.resultado}
                      </b>
                      <span className="text-[#68778a]">{h.data}</span>
                    </div>
                    {h.competencia && (
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Competência: {h.competencia} {h.canal ? `• Canal: ${h.canal}` : ''}
                      </div>
                    )}
                    {h.observacao && (
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed bg-slate-50 p-2 rounded-lg">
                        {h.observacao}
                      </p>
                    )}
                  </article>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </ModalWrapper>
  );
};

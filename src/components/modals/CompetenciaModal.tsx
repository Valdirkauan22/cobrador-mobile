import React from 'react';
import { ModalWrapper } from './ModalWrapper';
import { Calendar, CheckCircle2, ChevronRight, PlusCircle } from 'lucide-react';

interface CompetenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCompetencia: string;
  availableCompetencias: string[];
  onSelectCompetencia: (comp: string) => void;
  onAdvanceCompetence: () => void;
}

export const CompetenciaModal: React.FC<CompetenciaModalProps> = ({
  isOpen,
  onClose,
  currentCompetencia,
  availableCompetencias,
  onSelectCompetencia,
  onAdvanceCompetence
}) => {
  // Ensure we display unique competencies and current is included
  const list = Array.from(new Set([currentCompetencia, ...availableCompetencias].filter(Boolean)));

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Alternar Competência">
      <div className="space-y-4">
        <p className="text-xs text-slate-600">
          Selecione uma competência para visualizar os pagamentos e relatórios correspondentes:
        </p>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {list.map((comp) => {
            const isSelected = comp === currentCompetencia;
            return (
              <button
                key={comp}
                onClick={() => {
                  onSelectCompetencia(comp);
                  onClose();
                }}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/80 border-[#1769aa] ring-2 ring-[#1769aa]/20'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#1769aa] text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-sm font-bold text-slate-900 leading-snug">
                      Competência {comp}
                    </strong>
                    <span className="text-[11px] text-slate-500">
                      {isSelected ? 'Competência atualmente em exibição' : 'Toque para carregar'}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-[#1769aa] shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => {
              onClose();
              onAdvanceCompetence();
            }}
            className="w-full bg-[#1e8e5a] hover:bg-[#167347] active:scale-95 text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Encerrar e Iniciar Próxima Competência</span>
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

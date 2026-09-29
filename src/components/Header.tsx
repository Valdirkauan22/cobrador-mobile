import React from 'react';
import { Building2, ChevronDown, Settings } from 'lucide-react';

interface HeaderProps {
  competencia: string;
  isDemo?: boolean;
  monthClosed?: boolean;
  allPaid?: boolean;
  onOpenSettings: () => void;
  onOpenCompetenciaModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  competencia,
  isDemo,
  monthClosed,
  allPaid,
  onOpenSettings,
  onOpenCompetenciaModal
}) => {
  return (
    <header
      id="app-header"
      className="app-header-safe sticky top-0 z-20 px-4 flex justify-between items-center text-white backdrop-blur-md"
      style={{
        background: 'linear-gradient(135deg, #0a2540 0%, #155e9c 100%)',
        boxShadow: '0 4px 20px rgba(10, 37, 64, 0.25)'
      }}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-sky-200 shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black tracking-tight leading-tight">
              Cobrador Mobile
            </h1>
            {isDemo && (
              <span
                id="badge-demo"
                className="text-[9px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-md uppercase tracking-wider shadow-xs"
              >
                DEMO
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <button
              onClick={onOpenCompetenciaModal}
              title="Clique para alternar competência"
              className="inline-flex items-center gap-1 text-[#cce2f7] hover:text-white text-[11px] font-medium leading-none py-0.5 px-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span id="competencia">
                {competencia ? `Competência ${competencia}` : 'Associação de Moradores'}
              </span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>
            {monthClosed ? (
              <span className="text-[9px] font-extrabold bg-rose-500/80 text-white px-1.5 py-0.5 rounded shadow-xs leading-none uppercase tracking-wider">
                Fechado
              </span>
            ) : allPaid ? (
              <span className="text-[9px] font-extrabold bg-emerald-500/80 text-white px-1.5 py-0.5 rounded shadow-xs leading-none uppercase tracking-wider">
                100% Quitado
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <button
        id="btn-open-settings"
        onClick={onOpenSettings}
        aria-label="Configurações da conexão"
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer shadow-xs"
      >
        <Settings className="w-4 h-4" />
      </button>
    </header>
  );
};

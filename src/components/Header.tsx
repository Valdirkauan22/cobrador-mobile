import React from 'react';
import { Settings } from 'lucide-react';

interface HeaderProps {
  competencia: string;
  isDemo?: boolean;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ competencia, isDemo, onOpenSettings }) => {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-20 px-4 py-3.5 flex justify-between items-center text-white shadow-md"
      style={{
        background: 'linear-gradient(135deg, #0d3156, #1769aa)',
        boxShadow: '0 4px 18px rgba(18, 59, 102, 0.2)'
      }}
    >
      <div>
        <div className="flex items-center gap-2">
          <b className="text-xl font-bold tracking-tight">Cobrador Mobile</b>
          {isDemo && (
            <span
              id="badge-demo"
              className="text-[10px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full uppercase tracking-wider"
            >
              Demo
            </span>
          )}
        </div>
        <small id="competencia" className="block text-[#dceaf7] text-xs font-medium mt-0.5">
          {competencia ? `Competência ${competencia}` : 'Associação de Moradores'}
        </small>
      </div>

      <button
        id="btn-open-settings"
        onClick={onOpenSettings}
        aria-label="Configurações da conexão"
        className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/15 border border-white/20 text-white hover:bg-white/25 active:scale-95 transition-all"
      >
        <Settings className="w-5 h-5" />
      </button>
    </header>
  );
};

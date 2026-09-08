import React from 'react';
import { CheckCircle2, Clock, MoreHorizontal, Users } from 'lucide-react';

export type NavTab = 'pendentes' | 'pagos' | 'moradores' | 'mais';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  qtdPendentes?: number;
  qtdPagos?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  qtdPendentes,
  qtdPagos
}) => {
  return (
    <nav
      id="bottom-nav"
      className="app-bottom-nav-safe fixed bottom-0 left-0 right-0 z-30 bg-white/92 backdrop-blur-md grid grid-cols-4 px-3 pt-2 shadow-[0_-6px_24px_rgba(15,23,42,0.08)] border-t border-slate-200/80"
    >
      {/* Pendentes */}
      <button
        id="nav-btn-pendentes"
        onClick={() => onTabChange('pendentes')}
        className={`relative py-1.5 px-1 rounded-xl font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
          currentTab === 'pendentes'
            ? 'text-[#125a96]'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div className="relative">
          <Clock className="w-5 h-5 mb-0.5" />
          {typeof qtdPendentes === 'number' && qtdPendentes > 0 && (
            <span className="absolute -top-1.5 -right-3 text-[9px] bg-amber-500 text-white font-black px-1.5 py-0.2 rounded-full leading-tight shadow-xs">
              {qtdPendentes}
            </span>
          )}
        </div>
        <span className="text-[11px] font-bold">A pagar</span>
        {currentTab === 'pendentes' && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#125a96] mt-0.5" />
        )}
      </button>

      {/* Pagos */}
      <button
        id="nav-btn-pagos"
        onClick={() => onTabChange('pagos')}
        className={`relative py-1.5 px-1 rounded-xl font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
          currentTab === 'pagos'
            ? 'text-emerald-700'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div className="relative">
          <CheckCircle2 className="w-5 h-5 mb-0.5" />
          {typeof qtdPagos === 'number' && qtdPagos > 0 && (
            <span className="absolute -top-1.5 -right-3 text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.2 rounded-full leading-tight shadow-xs">
              {qtdPagos}
            </span>
          )}
        </div>
        <span className="text-[11px] font-bold">Pagos</span>
        {currentTab === 'pagos' && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5" />
        )}
      </button>

      {/* Moradores */}
      <button
        id="nav-btn-moradores"
        onClick={() => onTabChange('moradores')}
        className={`relative py-1.5 px-1 rounded-xl font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
          currentTab === 'moradores'
            ? 'text-[#125a96]'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Users className="w-5 h-5 mb-0.5" />
        <span className="text-[11px] font-bold">Moradores</span>
        {currentTab === 'moradores' && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#125a96] mt-0.5" />
        )}
      </button>

      {/* Mais */}
      <button
        id="nav-btn-mais"
        onClick={() => onTabChange('mais')}
        className={`relative py-1.5 px-1 rounded-xl font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
          currentTab === 'mais'
            ? 'text-[#125a96]'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <MoreHorizontal className="w-5 h-5 mb-0.5" />
        <span className="text-[11px] font-bold">Mais</span>
        {currentTab === 'mais' && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#125a96] mt-0.5" />
        )}
      </button>
    </nav>
  );
};

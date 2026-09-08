import React from 'react';

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
      className="fixed bottom-0 left-0 right-0 z-30 bg-white grid grid-cols-4 px-2 pt-2 pb-3 shadow-[0_-5px_22px_rgba(24,50,76,0.12)] border-t border-slate-100"
    >
      <button
        id="nav-btn-pendentes"
        onClick={() => onTabChange('pendentes')}
        className={`relative py-2.5 px-1 rounded-xl text-sm font-semibold transition-all flex flex-col items-center justify-center ${
          currentTab === 'pendentes'
            ? 'bg-[#e7f1fb] text-[#125a96]'
            : 'bg-white text-[#667589] hover:bg-slate-50'
        }`}
      >
        <span>A pagar</span>
        {typeof qtdPendentes === 'number' && qtdPendentes > 0 && (
          <span className="text-[10px] bg-[#e98b19] text-white px-1.5 py-0.2 rounded-full mt-0.5 leading-tight font-bold">
            {qtdPendentes}
          </span>
        )}
      </button>

      <button
        id="nav-btn-pagos"
        onClick={() => onTabChange('pagos')}
        className={`relative py-2.5 px-1 rounded-xl text-sm font-semibold transition-all flex flex-col items-center justify-center ${
          currentTab === 'pagos'
            ? 'bg-[#e7f1fb] text-[#125a96]'
            : 'bg-white text-[#667589] hover:bg-slate-50'
        }`}
      >
        <span>Pagos</span>
        {typeof qtdPagos === 'number' && qtdPagos > 0 && (
          <span className="text-[10px] bg-[#1e8e5a] text-white px-1.5 py-0.2 rounded-full mt-0.5 leading-tight font-bold">
            {qtdPagos}
          </span>
        )}
      </button>

      <button
        id="nav-btn-moradores"
        onClick={() => onTabChange('moradores')}
        className={`py-2.5 px-1 rounded-xl text-sm font-semibold transition-all flex flex-col items-center justify-center ${
          currentTab === 'moradores'
            ? 'bg-[#e7f1fb] text-[#125a96]'
            : 'bg-white text-[#667589] hover:bg-slate-50'
        }`}
      >
        <span>Moradores</span>
      </button>

      <button
        id="nav-btn-mais"
        onClick={() => onTabChange('mais')}
        className={`py-2.5 px-1 rounded-xl text-sm font-semibold transition-all flex flex-col items-center justify-center ${
          currentTab === 'mais'
            ? 'bg-[#e7f1fb] text-[#125a96]'
            : 'bg-white text-[#667589] hover:bg-slate-50'
        }`}
      >
        <span>Mais</span>
      </button>
    </nav>
  );
};

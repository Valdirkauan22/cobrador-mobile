import React from 'react';

interface MetricCardsProps {
  totalMoradores: number | string;
  qtdPagos: number | string;
  qtdPendentes: number | string;
  totalPendente: string;
  totalPago: string;
  totalPrevisto: string;
  isLoading?: boolean;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalMoradores,
  qtdPagos,
  qtdPendentes,
  totalPendente,
  totalPago,
  totalPrevisto,
  isLoading
}) => {
  return (
    <section id="metric-cards-section" className="mb-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Moradores */}
        <article
          id="card-moradores"
          className="bg-white rounded-2xl p-3.5 shadow-sm border-t-4 border-[#1769aa]"
          style={{ boxShadow: '0 5px 18px rgba(24, 50, 76, 0.07)' }}
        >
          <span className="block text-[#68778a] text-xs font-bold uppercase tracking-wider">
            Moradores
          </span>
          <strong id="cMor" className="block text-xl sm:text-2xl font-extrabold text-[#172033] mt-1">
            {isLoading ? '—' : totalMoradores}
          </strong>
        </article>

        {/* Pagos */}
        <article
          id="card-pagos"
          className="bg-white rounded-2xl p-3.5 shadow-sm border-t-4 border-[#1e8e5a]"
          style={{ boxShadow: '0 5px 18px rgba(24, 50, 76, 0.07)' }}
        >
          <span className="block text-[#68778a] text-xs font-bold uppercase tracking-wider">
            Pagos
          </span>
          <strong id="cPag" className="block text-xl sm:text-2xl font-extrabold text-[#1e8e5a] mt-1">
            {isLoading ? '—' : qtdPagos}
          </strong>
        </article>

        {/* A pagar */}
        <article
          id="card-pendentes"
          className="bg-white rounded-2xl p-3.5 shadow-sm border-t-4 border-[#e98b19]"
          style={{ boxShadow: '0 5px 18px rgba(24, 50, 76, 0.07)' }}
        >
          <span className="block text-[#68778a] text-xs font-bold uppercase tracking-wider">
            A pagar
          </span>
          <strong id="cPen" className="block text-xl sm:text-2xl font-extrabold text-[#e98b19] mt-1">
            {isLoading ? '—' : qtdPendentes}
          </strong>
        </article>

        {/* Em aberto */}
        <article
          id="card-aberto"
          className="bg-white rounded-2xl p-3.5 shadow-sm border-t-4 border-[#c44242]"
          style={{ boxShadow: '0 5px 18px rgba(24, 50, 76, 0.07)' }}
        >
          <span className="block text-[#68778a] text-xs font-bold uppercase tracking-wider">
            Em aberto
          </span>
          <strong id="cVal" className="block text-lg sm:text-xl font-extrabold text-[#c44242] mt-1 truncate">
            {isLoading ? '—' : totalPendente}
          </strong>
        </article>
      </div>

      <div
        id="status"
        className="text-xs sm:text-sm text-[#536579] font-medium my-2.5 px-1 flex items-center justify-between"
      >
        <span>
          {isLoading
            ? 'Sincronizando com a planilha…'
            : `Recebido ${totalPago} • Previsto ${totalPrevisto}`}
        </span>
      </div>
    </section>
  );
};

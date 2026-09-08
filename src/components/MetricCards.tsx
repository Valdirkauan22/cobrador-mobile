import React from 'react';
import { CheckCircle2, Clock, Users, Wallet } from 'lucide-react';

interface MetricCardsProps {
  totalMoradores: number | string;
  qtdPagos: number | string;
  qtdPendentes: number | string;
  totalPendente: string;
  totalPago: string;
  totalPrevisto: string;
  isLoading?: boolean;
}

function parseCurrency(val: string): number {
  if (!val) return 0;
  const num = parseFloat(
    val
      .replace(/[^\d,-]/g, '')
      .replace('.', '')
      .replace(',', '.')
  );
  return isNaN(num) ? 0 : num;
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
  const pagoNum = parseCurrency(totalPago);
  const previstoNum = parseCurrency(totalPrevisto);
  const percentual =
    previstoNum > 0 ? Math.min(100, Math.round((pagoNum / previstoNum) * 100)) : 0;

  return (
    <section id="metric-cards-section" className="mb-4 space-y-3">
      {/* 4 Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Moradores */}
        <article
          id="card-moradores"
          className="bg-white rounded-2xl p-3.5 border border-slate-100/90 shadow-xs flex flex-col justify-between"
          style={{ boxShadow: '0 4px 16px rgba(18, 43, 73, 0.05)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[#64748b] text-[11px] font-bold uppercase tracking-wider">
              Moradores
            </span>
            <div className="w-6 h-6 rounded-lg bg-sky-50 text-[#1769aa] flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <strong
            id="cMor"
            className="block text-xl sm:text-2xl font-black text-[#0f172a] mt-2 tracking-tight tabular-nums"
          >
            {isLoading ? '—' : totalMoradores}
          </strong>
        </article>

        {/* Pagos */}
        <article
          id="card-pagos"
          className="bg-white rounded-2xl p-3.5 border border-slate-100/90 shadow-xs flex flex-col justify-between"
          style={{ boxShadow: '0 4px 16px rgba(18, 43, 73, 0.05)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[#64748b] text-[11px] font-bold uppercase tracking-wider">
              Pagos
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <strong
            id="cPag"
            className="block text-xl sm:text-2xl font-black text-emerald-600 mt-2 tracking-tight tabular-nums"
          >
            {isLoading ? '—' : qtdPagos}
          </strong>
        </article>

        {/* A pagar */}
        <article
          id="card-pendentes"
          className="bg-white rounded-2xl p-3.5 border border-slate-100/90 shadow-xs flex flex-col justify-between"
          style={{ boxShadow: '0 4px 16px rgba(18, 43, 73, 0.05)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[#64748b] text-[11px] font-bold uppercase tracking-wider">
              A Pagar
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <strong
            id="cPen"
            className="block text-xl sm:text-2xl font-black text-amber-600 mt-2 tracking-tight tabular-nums"
          >
            {isLoading ? '—' : qtdPendentes}
          </strong>
        </article>

        {/* Em aberto */}
        <article
          id="card-aberto"
          className="bg-white rounded-2xl p-3.5 border border-slate-100/90 shadow-xs flex flex-col justify-between"
          style={{ boxShadow: '0 4px 16px rgba(18, 43, 73, 0.05)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[#64748b] text-[11px] font-bold uppercase tracking-wider">
              Em Aberto
            </span>
            <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <strong
            id="cVal"
            className="block text-lg sm:text-xl font-black text-rose-600 mt-2 tracking-tight truncate tabular-nums"
          >
            {isLoading ? '—' : totalPendente}
          </strong>
        </article>
      </div>

      {/* Progress & Target Overview Card */}
      <div
        id="status"
        className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs"
        style={{ boxShadow: '0 4px 16px rgba(18, 43, 73, 0.04)' }}
      >
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <span>Arrecadação do Mês</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-extrabold">
              {percentual}%
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Recebido: <strong className="text-emerald-700 font-bold">{totalPago}</strong> /{' '}
            <span className="text-slate-600">Meta: {totalPrevisto}</span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentual}%` }}
          />
        </div>
      </div>
    </section>
  );
};

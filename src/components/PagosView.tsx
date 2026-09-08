import React, { useState } from 'react';
import { PagoItem } from '../types';
import { getAvatarStyle, getInitials } from '../utils/avatar';
import {
  Calendar,
  CheckCircle2,
  FileCheck,
  Home,
  Paperclip,
  Phone,
  RefreshCw,
  Search,
  Wallet,
  XCircle
} from 'lucide-react';

interface PagosViewProps {
  items: PagoItem[];
  onRefresh: () => void;
  onReceipt: (item: PagoItem) => void;
  onProof: (item: PagoItem) => void;
  onHistory: (codigo: string, nome: string) => void;
  isLoading?: boolean;
}

export const PagosView: React.FC<PagosViewProps> = ({
  items,
  onRefresh,
  onReceipt,
  onProof,
  onHistory,
  isLoading
}) => {
  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const units = Array.from(new Set(items.map(x=>x.unidade).filter(Boolean) as string[])).sort();
  const methods = Array.from(new Set(items.map(x=>x.forma_pagamento).filter(Boolean))).sort();

  const filtered = items.filter((x) => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || (
      (x.morador || '').toLowerCase().includes(q) ||
      (x.codigo || '').toLowerCase().includes(q) ||
      (x.telefone || '').includes(q) ||
      (x.unidade || '').toLowerCase().includes(q)
    );
    return matchesSearch && (!unitFilter || x.unidade===unitFilter) && (!methodFilter || x.forma_pagamento===methodFilter);
  });

  return (
    <section id="pagos-view" className="space-y-3 pb-24">
      {/* Toolbar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
          <input
            id="searchG"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por pagador, unidade ou código..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#1769aa] focus:ring-2 focus:ring-[#1769aa]/15 transition-all shadow-xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          id="btn-refresh-pagos"
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Atualizar dados"
          className="w-11 h-11 flex items-center justify-center bg-[#1769aa] text-white rounded-xl hover:bg-[#125a96] active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-xs shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select value={methodFilter} onChange={e=>setMethodFilter(e.target.value)} className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"><option value="">Todas as formas</option>{methods.map(m=><option key={m}>{m}</option>)}</select>
        <select value={unitFilter} onChange={e=>setUnitFilter(e.target.value)} className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"><option value="">Todas as unidades</option>{units.map(u=><option key={u}>{u}</option>)}</select>
      </div>

      {/* Info indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
        <span>Contribuições liquidadas</span>
        <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-200/50">
          {filtered.length} {filtered.length === 1 ? 'pagamento' : 'pagamentos'}
        </span>
      </div>

      {/* List */}
      <div id="listG" className="grid gap-3">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800">Nenhum pagamento registrado</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Os pagamentos confirmados nesta competência aparecerão aqui com comprovantes e recibos.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-xs">
            <p className="text-sm font-semibold text-slate-700">Nenhum pagamento encontrado</p>
            <p className="text-xs text-slate-500 mt-1">
              Nenhum registro corresponde à busca "{search}".
            </p>
            <button
              onClick={() => setSearch('')}
              className="mt-3 text-xs font-bold text-[#1769aa] hover:underline"
            >
              Limpar busca
            </button>
          </div>
        ) : (
          filtered.map((x) => {
            const initials = getInitials(x.morador);
            const avatarColor = getAvatarStyle(x.morador);

            return (
              <article
                key={x.codigo + '-' + (x.linha || x.data_pagamento)}
                id={`person-pago-${x.codigo}`}
                className="bg-white rounded-2xl p-4 border border-slate-100/90 shadow-xs transition-all hover:shadow-sm"
                style={{ boxShadow: '0 4px 16px rgba(18, 43, 73, 0.05)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${avatarColor}`}
                    >
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug truncate">
                          {x.morador}
                        </h3>
                        {x.unidade && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#e8f0f8] text-[#123b66] px-2 py-0.5 rounded-md shrink-0">
                            <Home className="w-3 h-3" />
                            {x.unidade}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 mt-1">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {x.telefone}
                        </span>
                        <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {x.data_pagamento || 'Data não informada'}
                        </span>
                        {x.forma_pagamento && (
                          <span className="text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded font-medium text-[11px]">
                            {x.forma_pagamento}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Pago
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">#{x.codigo}</span>
                  </div>
                </div>

                {/* Amount */}
                <div className="mt-2.5 pt-2.5 border-t border-slate-100/80 flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-slate-500">Valor recebido:</span>
                  <strong className="text-lg sm:text-xl font-black text-emerald-600 tabular-nums">
                    {x.valor_pago}
                  </strong>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <button
                    id={`btn-receipt-${x.codigo}`}
                    onClick={() => onReceipt(x)}
                    className="bg-[#1e8e5a] hover:bg-[#177044] active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Recibo</span>
                  </button>

                  <button
                    id={`btn-proof-${x.codigo}`}
                    onClick={() => onProof(x)}
                    className="bg-[#1769aa] hover:bg-[#125a96] active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Comprovante</span>
                  </button>

                  <button
                    id={`btn-hist-pago-${x.codigo}`}
                    onClick={() => onHistory(x.codigo, x.morador)}
                    className="bg-[#e8f0f8] hover:bg-[#d8e6f5] active:scale-95 text-[#123b66] text-xs font-bold px-2.5 py-2 rounded-xl transition-all cursor-pointer ml-auto"
                  >
                    Histórico
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { PagoItem } from '../types';
import { RefreshCw, Search } from 'lucide-react';

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

  const filtered = items.filter((x) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (x.morador || '').toLowerCase().includes(q) ||
      (x.codigo || '').toLowerCase().includes(q) ||
      (x.telefone || '').includes(q)
    );
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
            placeholder="Buscar pagador ou código..."
            className="w-full bg-[#fbfdff] border border-[#cad5e1] rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#1769aa] focus:ring-1 focus:ring-[#1769aa] transition-all"
          />
        </div>
        <button
          id="btn-refresh-pagos"
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Atualizar dados"
          className="w-12 flex items-center justify-center bg-[#1769aa] text-white rounded-xl hover:bg-[#125a96] disabled:opacity-50 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* List */}
      <div id="listG" className="grid gap-2.5">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-[#68778a] shadow-sm">
            Nenhum pagamento encontrado.
          </div>
        ) : (
          filtered.map((x) => (
            <article
              key={x.codigo + '-' + (x.linha || x.data_pagamento)}
              id={`person-pago-${x.codigo}`}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
              style={{ boxShadow: '0 4px 16px rgba(24, 50, 76, 0.06)' }}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-base font-bold text-[#172033] leading-snug">
                  {x.morador}
                </h3>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-md border border-emerald-200">
                  Pago
                </span>
              </div>

              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#68778a] mt-1.5 font-medium">
                <span>📱 {x.telefone}</span>
                <span>• {x.data_pagamento || 'Data não informada'}</span>
                {x.forma_pagamento && <span>• {x.forma_pagamento}</span>}
              </div>

              <div className="text-lg font-extrabold text-[#177044] mt-2">
                {x.valor_pago}
              </div>

              <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-slate-50">
                <button
                  id={`btn-receipt-${x.codigo}`}
                  onClick={() => onReceipt(x)}
                  className="bg-[#1e8e5a] hover:bg-[#177044] text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Emitir / enviar recibo</span>
                </button>

                <button
                  id={`btn-proof-${x.codigo}`}
                  onClick={() => onProof(x)}
                  className="bg-[#1769aa] hover:bg-[#125a96] text-white text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Anexar comprovante
                </button>

                <button
                  id={`btn-hist-pago-${x.codigo}`}
                  onClick={() => onHistory(x.codigo, x.morador)}
                  className="bg-[#e8f0f8] hover:bg-[#d8e6f5] text-[#123b66] text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Histórico
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
};

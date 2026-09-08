import React, { useState } from 'react';
import { PendenteItem } from '../types';
import { openWhatsApp } from '../utils/pdf';
import { RefreshCw, Search } from 'lucide-react';

interface PendentesViewProps {
  items: PendenteItem[];
  onRefresh: () => void;
  onPayment: (item: PendenteItem) => void;
  onHistory: (codigo: string, nome: string) => void;
  isLoading?: boolean;
}

export const PendentesView: React.FC<PendentesViewProps> = ({
  items,
  onRefresh,
  onPayment,
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

  const handleCharge = (item: PendenteItem) => {
    const msg =
      item.mensagem ||
      `Olá ${item.morador}, consta uma contribuição de ${item.saldo} em aberto referente à Associação de Moradores.`;
    openWhatsApp(item.telefone, msg);
  };

  return (
    <section id="pendentes-view" className="space-y-3 pb-24">
      {/* Toolbar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
          <input
            id="searchP"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar morador ou código..."
            className="w-full bg-[#fbfdff] border border-[#cad5e1] rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#1769aa] focus:ring-1 focus:ring-[#1769aa] transition-all"
          />
        </div>
        <button
          id="btn-refresh-pendentes"
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Atualizar dados"
          className="w-12 flex items-center justify-center bg-[#1769aa] text-white rounded-xl hover:bg-[#125a96] disabled:opacity-50 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* List */}
      <div id="listP" className="grid gap-2.5">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-[#68778a] shadow-sm">
            Nenhuma pendência encontrada.
          </div>
        ) : (
          filtered.map((x) => (
            <article
              key={x.codigo + '-' + x.linha}
              id={`person-pendente-${x.codigo}`}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
              style={{ boxShadow: '0 4px 16px rgba(24, 50, 76, 0.06)' }}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-base font-bold text-[#172033] leading-snug">
                  {x.morador}
                </h3>
                <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md">
                  Cód. {x.codigo}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#68778a] mt-1.5 font-medium">
                <span>📱 {x.telefone}</span>
                <span>• Vence {x.vencimento}</span>
              </div>

              <div className="text-lg font-extrabold text-[#c44242] mt-2">
                {x.saldo}
              </div>

              <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-slate-50">
                <button
                  id={`btn-charge-${x.codigo}`}
                  onClick={() => handleCharge(x)}
                  className="bg-[#1e8e5a] hover:bg-[#177044] text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>WhatsApp</span>
                </button>

                <button
                  id={`btn-pay-${x.codigo}`}
                  onClick={() => onPayment(x)}
                  className="bg-[#1769aa] hover:bg-[#125a96] text-white text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Registrar pagamento
                </button>

                <button
                  id={`btn-hist-${x.codigo}`}
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

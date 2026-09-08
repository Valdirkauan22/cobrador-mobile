import React, { useState } from 'react';
import { MoradorItem } from '../types';
import { Plus, Search } from 'lucide-react';

interface MoradoresViewProps {
  items: MoradorItem[];
  onNewResident: () => void;
  onEditResident: (item: MoradorItem) => void;
}

export const MoradoresView: React.FC<MoradoresViewProps> = ({
  items,
  onNewResident,
  onEditResident
}) => {
  const [search, setSearch] = useState('');

  const filtered = items.filter((x) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (x.nome || '').toLowerCase().includes(q) ||
      (x.codigo || '').toLowerCase().includes(q) ||
      (x.telefone || '').includes(q) ||
      (x.situacao || '').toLowerCase().includes(q)
    );
  });

  return (
    <section id="moradores-view" className="space-y-3 pb-24">
      <button
        id="btn-new-resident"
        onClick={onNewResident}
        className="w-full bg-[#1769aa] hover:bg-[#125a96] text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
      >
        <Plus className="w-5 h-5" />
        <span>NOVO MORADOR</span>
      </button>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
        <input
          id="searchM"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar morador cadastrado..."
          className="w-full bg-[#fbfdff] border border-[#cad5e1] rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#1769aa] focus:ring-1 focus:ring-[#1769aa] transition-all"
        />
      </div>

      {/* List */}
      <div id="listM" className="grid gap-2.5">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-[#68778a] shadow-sm">
            Nenhum morador cadastrado.
          </div>
        ) : (
          filtered.map((x) => (
            <article
              key={x.codigo}
              id={`person-morador-${x.codigo}`}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between"
              style={{ boxShadow: '0 4px 16px rgba(24, 50, 76, 0.06)' }}
            >
              <div>
                <h3 className="text-base font-bold text-[#172033] leading-snug">
                  {x.nome}
                </h3>
                <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-xs text-[#68778a] mt-1 font-medium">
                  <span className="font-semibold text-slate-700">Cód. {x.codigo}</span>
                  <span>• 📱 {x.telefone}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[11px] font-bold ${
                      x.situacao === 'Inativo'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {x.situacao || 'Ativo'}
                  </span>
                </div>
              </div>

              <div className="actions">
                <button
                  id={`btn-edit-resident-${x.codigo}`}
                  onClick={() => onEditResident(x)}
                  className="bg-[#e8f0f8] hover:bg-[#d8e6f5] text-[#123b66] text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Editar
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
};

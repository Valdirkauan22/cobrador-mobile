import React, { useState } from 'react';
import { MoradorItem } from '../types';
import { isValidPhone } from '../utils/pdf';
import { getAvatarStyle, getInitials } from '../utils/avatar';
import { AlertCircle, Home, Phone, Plus, Search, Users, XCircle } from 'lucide-react';

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
  const [filterActiveOnly, setFilterActiveOnly] = useState<boolean>(true);

  // Apenas moradores com nome cadastrado
  const cadastradosValidos = items.filter((x) => String(x.nome ?? '').trim() !== '');

  const filtered = cadastradosValidos.filter((x) => {
    if (filterActiveOnly && String(x.situacao ?? '').trim() === 'Inativo') {
      return false;
    }
    const q = String(search || '').toLowerCase().trim();
    if (!q) return true;
    return (
      String(x.nome || '').toLowerCase().includes(q) ||
      String(x.codigo || '').toLowerCase().includes(q) ||
      String(x.telefone || '').includes(q) ||
      String(x.unidade || '').toLowerCase().includes(q) ||
      String(x.situacao || '').toLowerCase().includes(q)
    );
  });

  const qtdAtivos = cadastradosValidos.filter((x) => x.situacao !== 'Inativo').length;
  const qtdInativos = cadastradosValidos.filter((x) => x.situacao === 'Inativo').length;

  return (
    <section id="moradores-view" className="space-y-3 pb-24">
      {/* Primary Action */}
      <button
        id="btn-new-resident"
        onClick={onNewResident}
        className="w-full bg-[#1769aa] hover:bg-[#125a96] active:scale-[0.99] text-white py-3 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
      >
        <Plus className="w-5 h-5" />
        <span>NOVO MORADOR</span>
      </button>

      {/* Filter Chips / Badges */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterActiveOnly(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterActiveOnly
                ? 'bg-[#1769aa] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Ativos ({qtdAtivos})
          </button>
          {qtdInativos > 0 && (
            <button
              type="button"
              onClick={() => setFilterActiveOnly(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !filterActiveOnly
                  ? 'bg-[#1769aa] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Todos ({cadastradosValidos.length})
            </button>
          )}
        </div>
        <span className="text-[11px] text-slate-500 font-medium">
          {filtered.length} {filtered.length === 1 ? 'morador' : 'moradores'}
        </span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
        <input
          id="searchM"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar morador, unidade ou código..."
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

      {/* List */}
      <div id="listM" className="grid gap-2.5">
        {cadastradosValidos.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800">Nenhum morador cadastrado</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Clique em "NOVO MORADOR" acima para registrar os dados dos moradores e suas unidades.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-xs">
            <p className="text-sm font-semibold text-slate-700">Nenhum morador encontrado</p>
            <p className="text-xs text-slate-500 mt-1">
              Nenhum resultado corresponde a "{search}".
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
            const hasValidPhone = isValidPhone(x.telefone);
            const initials = getInitials(x.nome);
            const avatarColor = getAvatarStyle(x.nome);

            return (
              <article
                key={x.codigo}
                id={`person-morador-${x.codigo}`}
                className="bg-white rounded-2xl p-4 border border-slate-100/90 shadow-xs flex items-center justify-between gap-3 transition-all hover:shadow-sm"
                style={{ boxShadow: '0 4px 16px rgba(18, 43, 73, 0.05)' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${avatarColor}`}
                  >
                    {initials}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug truncate">
                        {x.nome}
                      </h3>
                      {x.unidade && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#e8f0f8] text-[#123b66] px-2 py-0.5 rounded-md shrink-0">
                          <Home className="w-3 h-3" />
                          {x.unidade}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-xs text-slate-500 mt-1 font-medium items-center">
                      <span className="font-mono text-slate-600">#{x.codigo}</span>
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {x.telefone || 'Sem telefone'}
                      </span>
                      {!hasValidPhone && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                          <AlertCircle className="w-3 h-3" />
                          Telefone inválido
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.2 rounded-full text-[11px] font-bold ${
                          x.situacao === 'Inativo'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        }`}
                      >
                        {x.situacao || 'Ativo'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="actions shrink-0">
                  <button
                    id={`btn-edit-resident-${x.codigo}`}
                    onClick={() => onEditResident(x)}
                    className="bg-[#e8f0f8] hover:bg-[#d8e6f5] active:scale-95 text-[#123b66] text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    Editar
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

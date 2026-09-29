import React, { useState, useMemo } from 'react';
import { PendenteItem } from '../types';
import { openWhatsApp } from '../utils/pdf';
import { getAvatarStyle, getInitials } from '../utils/avatar';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Home,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Sparkles,
  ListChecks,
  XCircle
} from 'lucide-react';

interface PendentesViewProps {
  items: PendenteItem[];
  pixKey?: string;
  competencia?: string;
  qtdPagos?: number;
  monthClosed?: boolean;
  onRefresh: () => void;
  onPayment: (item: PendenteItem) => void;
  onHistory: (codigo: string, nome: string) => void;
  onMarkSent?: (item: PendenteItem) => void;
  onPostpone?: (item: PendenteItem) => void;
  onNotify?: (msg: string) => void;
  onAdvanceCompetence?: () => void;
  onGoToPagos?: () => void;
  isLoading?: boolean;
}

export const PendentesView: React.FC<PendentesViewProps> = ({
  items,
  pixKey,
  competencia,
  qtdPagos = 0,
  monthClosed = false,
  onRefresh,
  onPayment,
  onHistory,
  onMarkSent,
  onPostpone,
  onNotify,
  onAdvanceCompetence,
  onGoToPagos,
  isLoading
}) => {
  const [search, setSearch] = useState('');
  const [sentCodes, setSentCodes] = useState<Set<string>>(new Set());
  const [unitFilter, setUnitFilter] = useState('');
  const [stateFilter, setStateFilter] = useState<'todos'|'nao_enviados'|'enviados'|'vencidos'|'recorrentes'>('todos');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batch, setBatch] = useState<PendenteItem[]>([]);
  const [batchIndex, setBatchIndex] = useState(0);

  const getDaysOverdue = (value: string): number => {
    const m = String(value || '').match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!m) return 0;
    const end = new Date(Number(m[3]), Number(m[2])-1, Number(m[1]), 23, 59, 59);
    const diff = Date.now() - end.getTime();
    return diff > 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) : 0;
  };

  const isOverdue = (value: string) => {
    return getDaysOverdue(value) > 0;
  };

  const isRecorrente = (item: PendenteItem): boolean => {
    // 1. Atraso há mais de 30 dias (meses anteriores)
    if (getDaysOverdue(item.vencimento) >= 30) return true;

    // 2. Prioridade 1 (2ª notificação no backend)
    if (item.prioridade === 1) return true;

    // 3. Menção a meses anteriores, segunda notificação ou débito acumulado
    const msg = (item.mensagem || '').toLowerCase();
    if (
      msg.includes('2ª') ||
      msg.includes('segunda') ||
      msg.includes('meses') ||
      msg.includes('anterior') ||
      msg.includes('acumulad')
    ) {
      return true;
    }

    // 4. Vencimento em mês/ano anterior ao atual
    const m = String(item.vencimento || '').match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (m) {
      const dueMonth = Number(m[2]);
      const dueYear = Number(m[3]);
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      if (dueYear < currentYear || (dueYear === currentYear && dueMonth < currentMonth)) {
        return true;
      }
    }

    return false;
  };

  const recurrentCount = useMemo(() => items.filter(isRecorrente).length, [items]);
  const units = Array.from(new Set(items.map(x=>x.unidade).filter(Boolean) as string[])).sort();

  const filtered = items.filter((x) => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || (
      (x.morador || '').toLowerCase().includes(q) ||
      (x.codigo || '').toLowerCase().includes(q) ||
      (x.telefone || '').includes(q) ||
      (x.unidade || '').toLowerCase().includes(q)
    );
    const sent = sentCodes.has(x.codigo) || x.enviadoHoje;
    const matchesState =
      stateFilter === 'todos' ||
      (stateFilter === 'enviados' && sent) ||
      (stateFilter === 'nao_enviados' && !sent) ||
      (stateFilter === 'vencidos' && isOverdue(x.vencimento)) ||
      (stateFilter === 'recorrentes' && isRecorrente(x));
    return matchesSearch && (!unitFilter || x.unidade === unitFilter) && matchesState;
  });

  const handleCharge = (item: PendenteItem) => {
    let msg =
      item.mensagem ||
      `Olá ${item.morador}, consta uma contribuição de ${item.saldo} em aberto referente à Associação de Moradores.`;
    if (pixKey) {
      msg += `\n\nChave PIX: ${pixKey}`;
    }
    openWhatsApp(item.telefone, msg);

    // Offer to mark as sent
    setSentCodes((prev) => new Set(prev).add(item.codigo));
    if (onMarkSent) {
      onMarkSent(item);
    }
  };

  const handleQuickMarkSent = (item: PendenteItem) => {
    setSentCodes((prev) => new Set(prev).add(item.codigo));
    if (onMarkSent) {
      onMarkSent(item);
    }
  };

  const handleCopyPix = () => {
    if (!pixKey) return;
    navigator.clipboard.writeText(pixKey);
    onNotify?.('Chave PIX copiada para a área de transferência!');
  };

  const toggle = (codigo: string) => setSelected(prev => { const n=new Set(prev); n.has(codigo)?n.delete(codigo):n.add(codigo); return n; });
  const startBatch = () => { const list=filtered.filter(x=>selected.has(x.codigo)); if(!list.length) return; setBatch(list); setBatchIndex(0); };
  const sendBatchCurrent = () => {
    const item = batch[batchIndex];
    if (!item) return;
    handleCharge(item);
    if (batchIndex < batch.length - 1) {
      setBatchIndex(batchIndex + 1);
    } else {
      setBatch([]);
      setSelected(new Set());
      onNotify?.('Envio em lote concluído com sucesso!');
    }
  };
  const skipBatchCurrent = () => {
    if (batchIndex < batch.length - 1) {
      setBatchIndex(batchIndex + 1);
    } else {
      setBatch([]);
      setSelected(new Set());
      onNotify?.('Lote finalizado.');
    }
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
            placeholder="Buscar por morador, unidade ou código..."
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
          id="btn-refresh-pendentes"
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Atualizar dados"
          className="w-11 h-11 flex items-center justify-center bg-[#1769aa] text-white rounded-xl hover:bg-[#125a96] active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-xs shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <select
          value={stateFilter}
          onChange={e=>setStateFilter(e.target.value as any)}
          className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#1769aa]"
        >
          <option value="todos">Todos os pendentes ({items.length})</option>
          <option value="recorrentes">⚠️ Meses anteriores ({recurrentCount})</option>
          <option value="nao_enviados">Ainda não enviados</option>
          <option value="enviados">Já enviados</option>
          <option value="vencidos">Vencidos (geral)</option>
        </select>
        <select
          value={unitFilter}
          onChange={e=>setUnitFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#1769aa]"
        >
          <option value="">Todas as unidades</option>
          {units.map(u=><option key={u}>{u}</option>)}
        </select>
      </div>

      {/* Botão de Destaque para Inadimplentes Crônicos de Meses Anteriores */}
      {recurrentCount > 0 && (
        <button
          type="button"
          id="btn-filter-recorrentes"
          onClick={() => setStateFilter(stateFilter === 'recorrentes' ? 'todos' : 'recorrentes')}
          className={`w-full text-left rounded-xl p-3 border transition-all flex items-center justify-between gap-2 shadow-xs cursor-pointer ${
            stateFilter === 'recorrentes'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400/20 text-rose-950'
              : 'bg-amber-50 hover:bg-amber-100/70 border-amber-200 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${stateFilter === 'recorrentes' ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <strong className="block text-xs font-bold leading-tight">
                {recurrentCount} {recurrentCount === 1 ? 'morador com pendências recorrentes' : 'moradores com pendências recorrentes'}
              </strong>
              <span className="block text-[11px] opacity-80 truncate">
                {stateFilter === 'recorrentes'
                  ? 'Exibindo apenas inadimplentes de meses anteriores (toque para ver todos)'
                  : 'Débitos acumulados ou atraso superior a 30 dias detectados'}
              </span>
            </div>
          </div>
          <span className={`text-[11px] font-extrabold px-2.5 py-1.5 rounded-lg shrink-0 transition-colors ${
            stateFilter === 'recorrentes'
              ? 'bg-rose-600 text-white'
              : 'bg-amber-600 text-white'
          }`}>
            {stateFilter === 'recorrentes' ? 'Filtrado ✓' : 'Ver Crônicos'}
          </span>
        </button>
      )}

      {filtered.length>0 && <div className="bg-white border border-blue-100 rounded-xl p-2.5 flex items-center justify-between gap-2">
        <button onClick={()=>setSelected(selected.size===filtered.length?new Set():new Set(filtered.map(x=>x.codigo)))} className="text-xs font-bold text-[#1769aa]">{selected.size===filtered.length?'Desmarcar todos':'Selecionar visíveis'}</button>
        <button onClick={startBatch} disabled={!selected.size} className="bg-[#1769aa] disabled:opacity-40 text-white rounded-lg px-3 py-2 text-xs font-bold flex items-center gap-1.5"><ListChecks className="w-4 h-4"/>Cobrar selecionados ({selected.size})</button>
      </div>}

      {batch.length>0 && <div className="sticky top-24 z-10 bg-[#0a2540] text-white rounded-2xl p-4 shadow-xl border border-white/10">
        <p className="text-[11px] text-blue-200 font-bold uppercase">Lote {batchIndex+1} de {batch.length}</p><strong className="block mt-1">{batch[batchIndex]?.morador}</strong><p className="text-xs text-blue-100 mt-1">Abra o WhatsApp, envie a mensagem, volte ao aplicativo e continue.</p>
        <div className="flex gap-2 mt-3"><button onClick={sendBatchCurrent} className="flex-1 bg-[#1e8e5a] rounded-xl py-2.5 text-xs font-bold">Abrir WhatsApp e avançar</button><button onClick={()=>setBatch([])} className="px-3 bg-white/10 rounded-xl text-xs">Cancelar</button></div>
      </div>}

      {/* PIX Quick Bar if Configured */}
      {pixKey && (
        <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-950 shadow-xs">
          <div className="flex items-center gap-2 overflow-hidden mr-2">
            <span className="font-extrabold text-emerald-800 shrink-0 text-[11px] uppercase tracking-wider">
              PIX Copia & Cola:
            </span>
            <code className="bg-white/80 border border-emerald-200/60 px-2 py-0.5 rounded-lg font-mono text-[11px] truncate text-emerald-900">
              {pixKey}
            </code>
          </div>
          <button
            onClick={handleCopyPix}
            className="shrink-0 flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copiar</span>
          </button>
        </div>
      )}

      {/* Header Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
        <span>Moradores com cobrança aberta</span>
        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
          {filtered.length} {filtered.length === 1 ? 'pendência' : 'pendências'}
        </span>
      </div>

      {/* List */}
      <div id="listP" className="grid gap-3">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 sm:p-8 text-center border border-slate-100 shadow-xs space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-800 tracking-tight">
                {qtdPagos > 0
                  ? `Competência ${competencia || 'atual'} 100% quitada!`
                  : 'Tudo em dia!'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-md mx-auto leading-relaxed">
                {qtdPagos > 0
                  ? `Todos os ${qtdPagos} moradores cadastrados já realizaram o pagamento. Não há pendências para ${competencia || 'este mês'}.`
                  : 'Nenhuma cobrança em aberto encontrada para esta competência.'}
              </p>
            </div>

            {qtdPagos > 0 && onAdvanceCompetence && (
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  id="btn-advance-competence-empty"
                  onClick={onAdvanceCompetence}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1e8e5a] hover:bg-[#167347] active:scale-95 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Encerrar {competencia || 'mês'} e Avançar Competência</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {onGoToPagos && (
                  <button
                    onClick={onGoToPagos}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-semibold text-xs px-4 py-3 rounded-xl transition-all cursor-pointer"
                  >
                    Ver recebidos ({qtdPagos})
                  </button>
                )}
              </div>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-xs">
            <p className="text-sm font-semibold text-slate-700">Nenhum morador encontrado</p>
            <p className="text-xs text-slate-500 mt-1">
              Nenhum resultado corresponde à busca "{search}".
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
            const isAlreadySent = sentCodes.has(x.codigo) || x.enviadoHoje;
            const initials = getInitials(x.morador);
            const avatarColor = getAvatarStyle(x.morador);
            const isChronic = isRecorrente(x);
            const daysOver = getDaysOverdue(x.vencimento);

            return (
              <article
                key={x.codigo + '-' + (x.linha || '')}
                id={`person-pendente-${x.codigo}`}
                className={`bg-white rounded-2xl p-4 border transition-all hover:shadow-sm ${
                  isChronic
                    ? 'border-rose-300 ring-1 ring-rose-300/40 bg-rose-50/20'
                    : 'border-slate-100/90'
                }`}
                style={{ boxShadow: '0 4px 16px rgba(18, 43, 73, 0.05)' }}
              >
                <label className="float-left mr-2 mt-1"><input type="checkbox" checked={selected.has(x.codigo)} onChange={()=>toggle(x.codigo)} className="w-4 h-4 accent-[#1769aa]" aria-label={`Selecionar ${x.morador}`} /></label>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Avatar with Initials */}
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
                        <span className={`inline-flex items-center gap-1 font-medium ${isChronic ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                          <Calendar className={`w-3 h-3 ${isChronic ? 'text-rose-500' : 'text-slate-400'}`} />
                          Vence {x.vencimento} {daysOver >= 30 ? `(${daysOver} dias atrás)` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <span className="text-[11px] bg-slate-100 text-slate-600 font-mono font-bold px-2 py-0.5 rounded-md">
                      #{x.codigo}
                    </span>
                    {isChronic && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-full shrink-0">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Crônico {daysOver >= 30 ? `(+${daysOver}d)` : ''}
                      </span>
                    )}
                    {isAlreadySent && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Enviado
                      </span>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div className="mt-2.5 pt-2.5 border-t border-slate-100/80 flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-slate-500">Valor em aberto:</span>
                  <strong className="text-lg sm:text-xl font-black text-rose-600 tabular-nums">
                    {x.saldo}
                  </strong>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <button
                    id={`btn-charge-${x.codigo}`}
                    onClick={() => handleCharge(x)}
                    className="bg-[#1e8e5a] hover:bg-[#177044] active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    id={`btn-pay-${x.codigo}`}
                    onClick={() => onPayment(x)}
                    className="bg-[#1769aa] hover:bg-[#125a96] active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    Registrar pagamento
                  </button>

                  <button
                    id={`btn-quick-sent-${x.codigo}`}
                    onClick={() => handleQuickMarkSent(x)}
                    title="Marcar como enviado sem abrir WhatsApp"
                    className="bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-semibold px-2.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Enviado</span>
                  </button>

                  {onPostpone && (
                    <button
                      id={`btn-postpone-${x.codigo}`}
                      onClick={() => onPostpone(x)}
                      title="Adiar notificação por 1 dia"
                      className="bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-800 text-xs font-semibold px-2.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Adiar 1d</span>
                    </button>
                  )}

                  <button
                    id={`btn-hist-${x.codigo}`}
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

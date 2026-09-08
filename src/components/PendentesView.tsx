import React, { useState } from 'react';
import { PendenteItem } from '../types';
import { openWhatsApp } from '../utils/pdf';
import { getAvatarStyle, getInitials } from '../utils/avatar';
import {
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
  XCircle
} from 'lucide-react';

interface PendentesViewProps {
  items: PendenteItem[];
  pixKey?: string;
  onRefresh: () => void;
  onPayment: (item: PendenteItem) => void;
  onHistory: (codigo: string, nome: string) => void;
  onMarkSent?: (item: PendenteItem) => void;
  onPostpone?: (item: PendenteItem) => void;
  onNotify?: (msg: string) => void;
  isLoading?: boolean;
}

export const PendentesView: React.FC<PendentesViewProps> = ({
  items,
  pixKey,
  onRefresh,
  onPayment,
  onHistory,
  onMarkSent,
  onPostpone,
  onNotify,
  isLoading
}) => {
  const [search, setSearch] = useState('');
  const [sentCodes, setSentCodes] = useState<Set<string>>(new Set());

  const filtered = items.filter((x) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (x.morador || '').toLowerCase().includes(q) ||
      (x.codigo || '').toLowerCase().includes(q) ||
      (x.telefone || '').includes(q) ||
      (x.unidade || '').toLowerCase().includes(q)
    );
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
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800">Tudo em dia!</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Nenhuma cobrança em aberto encontrada para esta competência.
            </p>
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

            return (
              <article
                key={x.codigo + '-' + (x.linha || '')}
                id={`person-pendente-${x.codigo}`}
                className="bg-white rounded-2xl p-4 border border-slate-100/90 shadow-xs transition-all hover:shadow-sm"
                style={{ boxShadow: '0 4px 16px rgba(18, 43, 73, 0.05)' }}
              >
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
                        <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Vence {x.vencimento}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <span className="text-[11px] bg-slate-100 text-slate-600 font-mono font-bold px-2 py-0.5 rounded-md">
                      #{x.codigo}
                    </span>
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

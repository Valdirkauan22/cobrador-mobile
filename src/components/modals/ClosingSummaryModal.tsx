import React, { useState } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { DashboardData } from '../../types';
import { openWhatsApp } from '../../utils/pdf';
import { CheckCircle2, Copy, FileText, MessageSquare, Share2 } from 'lucide-react';

interface ClosingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboard: DashboardData;
  nomeAssociacao?: string;
  onDownloadMonthlyReport?: () => void;
}

function parseVal(val: string): number {
  if (!val) return 0;
  const num = parseFloat(
    val
      .replace(/[^\d,-]/g, '')
      .replace('.', '')
      .replace(',', '.')
  );
  return isNaN(num) ? 0 : num;
}

export const ClosingSummaryModal: React.FC<ClosingSummaryModalProps> = ({
  isOpen,
  onClose,
  dashboard,
  nomeAssociacao,
  onDownloadMonthlyReport
}) => {
  const [copied, setCopied] = useState(false);

  // Group by payment method
  const methodStats = React.useMemo(() => {
    const acc: Record<string, { total: number; count: number }> = {};
    (dashboard.pagos || []).forEach((it) => {
      const m = it.forma_pagamento || 'Outro';
      if (!acc[m]) acc[m] = { total: 0, count: 0 };
      acc[m].total += parseVal(it.valor_pago);
      acc[m].count += 1;
    });
    return acc;
  }, [dashboard.pagos]);

  const totalPagoNum = parseVal(dashboard.total_pago);
  const totalPrevistoNum = parseVal(dashboard.total_previsto);
  const percentual =
    totalPrevistoNum > 0 ? Math.min(100, Math.round((totalPagoNum / totalPrevistoNum) * 100)) : 100;
  const is100 = dashboard.qtd_pendentes === 0 && dashboard.qtd_pagos > 0;

  // Format WhatsApp Message
  const whatsappMessage = React.useMemo(() => {
    const lines = [
      `📢 *Fechamento de Competência — ${nomeAssociacao || 'Associação de Moradores'}*`,
      `📅 *Competência:* ${dashboard.competencia || 'Atual'}`,
      `📊 *Arrecadação:* ${percentual}% da meta (${is100 ? '100% Quitado' : `${dashboard.qtd_pendentes} pendente(s)`})`,
      `💰 *Total Recebido:* ${dashboard.total_pago}`,
      `🎯 *Meta Prevista:* ${dashboard.total_previsto}`,
      `👥 *Moradores Pagos:* ${dashboard.qtd_pagos} de ${dashboard.total_moradores}`,
      '',
      `📋 *Detalhamento por Forma:*`
    ];

    Object.entries(methodStats).forEach(([metodo, data]) => {
      const valStr = data.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      lines.push(`• *${metodo}:* ${valStr} (${data.count} pagto${data.count > 1 ? 's' : ''})`);
    });

    if (dashboard.qtd_pendentes > 0) {
      lines.push('');
      lines.push(`⚠️ *Saldo Pendente:* ${dashboard.total_pendente} (${dashboard.qtd_pendentes} moradores)`);
    } else {
      lines.push('');
      lines.push(`✅ *Meta atingida com sucesso! Todos os moradores em dia.*`);
    }

    lines.push('');
    lines.push(`_Relatório emitido pelo Cobrador Mobile em ${new Date().toLocaleDateString('pt-BR')}._`);
    return lines.join('\n');
  }, [dashboard, methodStats, percentual, is100, nomeAssociacao]);

  const handleCopy = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    openWhatsApp('', whatsappMessage);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Resumo do Mês (WhatsApp)">
      <div className="space-y-4">
        {/* Banner */}
        <div className={`p-4 rounded-2xl border ${is100 ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className={`w-5 h-5 ${is100 ? 'text-emerald-600' : 'text-blue-600'}`} />
            <strong className={`text-sm ${is100 ? 'text-emerald-950' : 'text-blue-950'}`}>
              Competência {dashboard.competencia} — {is100 ? '100% Quitada' : `${percentual}% Arrecadado`}
            </strong>
          </div>
          <p className="text-xs text-slate-600">
            {dashboard.qtd_pagos} moradores pagos • Total de {dashboard.total_pago} arrecadado
          </p>
        </div>

        {/* Methods Chips */}
        {Object.keys(methodStats).length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Arrecadação por forma de pagamento:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(methodStats).map(([metodo, data]) => (
                <div key={metodo} className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
                  <span className="text-[11px] font-bold text-slate-500 block truncate">{metodo}</span>
                  <strong className="text-xs font-black text-slate-900 block mt-0.5">
                    {data.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </strong>
                  <span className="text-[10px] text-slate-500">{data.count} pagamento(s)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Text Preview Box */}
        <div>
          <label className="block text-xs font-bold text-[#68778a] uppercase tracking-wider mb-1">
            Texto formatado para WhatsApp:
          </label>
          <pre className="w-full bg-[#fbfdff] border border-[#cad5e1] rounded-xl p-3 text-xs text-slate-800 font-sans whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
            {whatsappMessage}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleShareWhatsApp}
            className="w-full bg-[#1e8e5a] hover:bg-[#167347] active:scale-95 text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Enviar no WhatsApp</span>
          </button>

          <button
            onClick={handleCopy}
            className="w-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-slate-300/70 transition-all cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            <span>{copied ? 'Copiado para área de transferência!' : 'Copiar Mensagem'}</span>
          </button>
        </div>

        {onDownloadMonthlyReport && (
          <button
            onClick={onDownloadMonthlyReport}
            className="w-full bg-blue-50 hover:bg-blue-100 active:scale-95 text-[#1769aa] py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Baixar Relatório Mensal em PDF</span>
          </button>
        )}
      </div>
    </ModalWrapper>
  );
};

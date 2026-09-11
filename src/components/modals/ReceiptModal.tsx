import React from 'react';
import { PagoItem } from '../../types';
import { downloadReceipt, openWhatsApp, shareOrDownloadReceipt } from '../../utils/pdf';
import { ModalWrapper } from './ModalWrapper';
import { Download, Share2 } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  item: PagoItem | null;
  competencia: string;
  nomeAssociacao?: string;
  operatorName?: string;
  whatsappMode?: 'auto' | 'standard' | 'business';
  onClose: () => void;
  onNotify: (msg: string) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  item,
  competencia,
  nomeAssociacao = 'Associação de Moradores',
  operatorName,
  whatsappMode = 'auto',
  onClose,
  onNotify
}) => {
  if (!item) return null;
  const reciboNumero = `${String(competencia || '').replace(/\D/g, '')}-${item.codigo}-${String(item.data_pagamento || '').replace(/\D/g, '').slice(0, 8)}`;

  const handleDownload = () => {
    downloadReceipt(item, competencia, nomeAssociacao, operatorName);
    onNotify('Recibo PDF baixado com sucesso.');
  };

  const handleShare = async () => {
    await shareOrDownloadReceipt(
      item,
      competencia,
      onNotify,
      nomeAssociacao,
      operatorName,
      whatsappMode
    );
  };

  const handleWhatsAppOnly = () => {
    const msg = `Olá ${item.morador}${item.unidade ? ` (${item.unidade})` : ''}, confirmamos o recebimento da contribuição referente a ${competencia}, no valor de ${item.valor_pago} via ${item.forma_pagamento}. A ${nomeAssociacao} agradece sua colaboração!`;
    openWhatsApp(item.telefone, msg);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Recibo de contribuição">
      <div className="space-y-4">
        {/* Printable/Preview Receipt Card */}
        <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-5 shadow-inner">
          <div className="text-center pb-3 border-b border-dashed border-slate-300">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
              {nomeAssociacao}
            </span>
            <h3 className="text-lg font-black text-[#123b66] mt-0.5">RECIBO DE PAGAMENTO</h3>
            <p className="text-[10px] text-slate-500 mt-1">Nº {reciboNumero}</p>
          </div>

          <div className="py-4 space-y-2.5 text-xs text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">Morador:</span>
              <strong className="text-slate-900 font-bold text-right">{item.morador}</strong>
            </div>
            {item.unidade && (
              <div className="flex justify-between">
                <span className="text-slate-500">Unidade:</span>
                <strong className="text-slate-900 font-semibold">{item.unidade}</strong>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Código do Morador:</span>
              <strong className="text-slate-900">{item.codigo}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Competência:</span>
              <strong className="text-slate-900">{competencia}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Data do Pagamento:</span>
              <strong className="text-slate-900">{item.data_pagamento}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Forma de Pagamento:</span>
              <strong className="text-slate-900">{item.forma_pagamento}</strong>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
              <span className="font-bold text-slate-900">Valor Recebido:</span>
              <strong className="font-black text-[#1e8e5a] text-base">{item.valor_pago}</strong>
            </div>
          </div>

          <p className="text-[11px] text-center text-slate-500 italic pt-2 border-t border-dashed border-slate-300">
            Recebemos o valor acima referente à contribuição da Associação. Obrigado pela colaboração!
          </p>
          <div className="mt-3 pt-3 border-t border-dashed border-slate-300 text-center">
            <p className="text-[10px] text-slate-500">
              {operatorName ? `Responsável: ${operatorName}` : 'Emitido eletronicamente pelo Cobrador Mobile'}
            </p>
            <p className="text-[9px] font-mono text-slate-400 mt-1">
              Verificação: {reciboNumero.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={handleShare}
            className="w-full bg-[#1e8e5a] hover:bg-[#177044] text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer text-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartilhar / Enviar</span>
          </button>

          <button
            onClick={handleDownload}
            className="w-full bg-[#1769aa] hover:bg-[#125a96] text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer text-xs"
          >
            <Download className="w-4 h-4" />
            <span>Baixar PDF</span>
          </button>
        </div>

        <button
          onClick={handleWhatsAppOnly}
          className="w-full bg-[#e8f0f8] hover:bg-[#d8e6f5] text-[#123b66] py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer"
        >
          Enviar mensagem de confirmação no WhatsApp
        </button>
      </div>
    </ModalWrapper>
  );
};

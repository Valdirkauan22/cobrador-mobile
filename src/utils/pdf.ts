import { PagoItem } from '../types';

export function createPdfBlob(item: PagoItem, competencia: string): Blob {
  const clean = (s: string | undefined | null) =>
    String(s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[()\\]/g, ' ');

  const lines = [
    'RECIBO DE CONTRIBUICAO',
    'Associacao de Moradores',
    '',
    'Morador: ' + clean(item.morador),
    'Competencia: ' + clean(competencia),
    'Valor recebido: ' + clean(item.valor_pago),
    'Data: ' + clean(item.data_pagamento),
    'Forma: ' + clean(item.forma_pagamento),
    '',
    'Recebemos o valor acima referente a contribuicao da Associacao.',
    'Obrigado pela colaboracao.'
  ];

  const content =
    'BT /F1 16 Tf 55 790 Td ' +
    lines.map((l, i) => `${i ? '0 -30 Td ' : ''}(${clean(l)}) Tj`).join(' ') +
    ' ET';

  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  ];

  let pdf = '%PDF-1.4\n';
  const offs = [0];

  objs.forEach((o, i) => {
    offs.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });

  const xr = pdf.length;
  pdf +=
    'xref\n0 6\n0000000000 65535 f \n' +
    offs
      .slice(1)
      .map((n) => String(n).padStart(10, '0') + ' 00000 n \n')
      .join('') +
    `trailer << /Size 6 /Root 1 0 R >>\nstartxref\n${xr}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

export function formatPhone(phone: string): string {
  const n = String(phone || '').replace(/\D/g, '');
  return n.startsWith('55') ? n : '55' + n;
}

export function openWhatsApp(phone: string, message: string): void {
  const cleanPhone = formatPhone(phone);
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

export function downloadReceipt(item: PagoItem, competencia: string): void {
  const blob = createPdfBlob(item, competencia);
  const fileName = `recibo_${item.codigo}_${(competencia || '').replace('/', '-')}.pdf`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function shareOrDownloadReceipt(
  item: PagoItem,
  competencia: string,
  onNotify: (msg: string) => void
): Promise<void> {
  const blob = createPdfBlob(item, competencia);
  const fileName = `recibo_${item.codigo}_${(competencia || '').replace('/', '-')}.pdf`;
  const message = `Olá ${item.morador}, segue o recibo de pagamento da contribuição referente a ${competencia}. Obrigado pela colaboração!`;

  try {
    const file = new File([blob], fileName, { type: 'application/pdf' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: 'Recibo de pagamento',
        text: message,
        files: [file]
      });
      return;
    }
  } catch (err: unknown) {
    if ((err as Error)?.name === 'AbortError') return;
  }

  // Fallback download and WhatsApp
  downloadReceipt(item, competencia);
  openWhatsApp(item.telefone, message);
  onNotify('Recibo baixado. Anexe-o na conversa do WhatsApp.');
}

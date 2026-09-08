import { DashboardData, PagoItem } from '../types';

export function createPdfBlob(item: PagoItem, competencia: string, nomeAssociacao?: string): Blob {
  const clean = (s: string | undefined | null) =>
    String(s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[()\\]/g, ' ');

  const moradorLinha = item.unidade
    ? `Morador: ${clean(item.morador)} (${clean(item.unidade)})`
    : `Morador: ${clean(item.morador)}`;

  const lines = [
    'RECIBO DE CONTRIBUICAO',
    clean(nomeAssociacao || 'Associacao de Moradores'),
    '',
    moradorLinha,
    'Codigo: ' + clean(item.codigo),
    'Competencia: ' + clean(competencia),
    'Valor recebido: ' + clean(item.valor_pago),
    'Data: ' + clean(item.data_pagamento),
    'Forma: ' + clean(item.forma_pagamento),
    '',
    'Recebemos o valor acima referente a contribuicao da Associacao.',
    'Obrigado pela colaboracao.'
  ];

  const content =
    'BT /F1 14 Tf 55 790 Td ' +
    lines.map((l, i) => `${i ? '0 -28 Td ' : ''}(${clean(l)}) Tj`).join(' ') +
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

export function createMonthlyReportPdfBlob(
  data: DashboardData,
  nomeAssociacao?: string
): Blob {
  const clean = (s: string | undefined | null) =>
    String(s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[()\\]/g, ' ');

  const parseVal = (str: string) =>
    parseFloat(str.replace(/[^\d,]/g, '').replace(',', '.')) || 0;

  const totalPagoNum = parseVal(data.total_pago);
  const totalPrevistoNum = parseVal(data.total_previsto);
  const taxaAdimplencia =
    totalPrevistoNum > 0
      ? Math.min(100, Math.round((totalPagoNum / totalPrevistoNum) * 100))
      : 0;

  const dataEmissao = new Date().toLocaleDateString('pt-BR');

  const lines: string[] = [
    'RELATORIO MENSAL DE ARRECADACAO',
    clean(nomeAssociacao || 'Associacao de Moradores'),
    `Competencia: ${clean(data.competencia)} - Emissao: ${dataEmissao}`,
    '------------------------------------------------------------',
    `Total de Moradores Cadastrados: ${data.total_moradores}`,
    `Pagamentos Confirmados: ${data.qtd_pagos}  |  Pendencias: ${data.qtd_pendentes}`,
    `Taxa de Arrecadacao: ${taxaAdimplencia}%`,
    '',
    `Total Previsto:  ${clean(data.total_previsto)}`,
    `Total Recebido:  ${clean(data.total_pago)}`,
    `Total Pendente:  ${clean(data.total_pendente)}`,
    '------------------------------------------------------------',
    'PAGAMENTOS CONFIRMADOS:'
  ];

  if (data.pagos && data.pagos.length > 0) {
    data.pagos.slice(0, 15).forEach((p) => {
      const unid = p.unidade ? ` [${clean(p.unidade)}]` : '';
      lines.push(
        `- ${clean(p.morador)}${unid}: ${clean(p.valor_pago)} em ${clean(p.data_pagamento)} (${clean(p.forma_pagamento)})`
      );
    });
    if (data.pagos.length > 15) {
      lines.push(`... e mais ${data.pagos.length - 15} pagamento(s) confirmado(s)`);
    }
  } else {
    lines.push('Nenhum pagamento registrado nesta competencia.');
  }

  lines.push('');
  lines.push('PENDENCIAS A RECEBER:');
  if (data.pendentes && data.pendentes.length > 0) {
    data.pendentes.slice(0, 15).forEach((p) => {
      const unid = p.unidade ? ` [${clean(p.unidade)}]` : '';
      lines.push(
        `- ${clean(p.morador)}${unid}: ${clean(p.saldo)} (Venc. ${clean(p.vencimento)})`
      );
    });
    if (data.pendentes.length > 15) {
      lines.push(`... e mais ${data.pendentes.length - 15} pendencia(s)`);
    }
  } else {
    lines.push('Parabens! Nenhuma pendencia nesta competencia.');
  }

  lines.push('------------------------------------------------------------');
  lines.push('Relatorio gerado automaticamente pelo Cobrador Mobile v8.2');

  const content =
    'BT /F1 10 Tf 45 800 Td ' +
    lines.map((l, i) => `${i ? '0 -17 Td ' : ''}(${clean(l)}) Tj`).join(' ') +
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

export function downloadMonthlyReportPdf(data: DashboardData, nomeAssociacao?: string): void {
  const blob = createMonthlyReportPdfBlob(data, nomeAssociacao);
  const fileName = `relatorio_mensal_${(data.competencia || 'geral').replace('/', '-')}.pdf`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function formatPhone(phone: string): string {
  const n = String(phone || '').replace(/\D/g, '');
  return n.startsWith('55') ? n : '55' + n;
}

export function isValidPhone(phone: string): boolean {
  const n = String(phone || '').replace(/\D/g, '');
  return n.length >= 10 && n.length <= 13;
}

export function openWhatsApp(phone: string, message: string): void {
  const cleanPhone = formatPhone(phone);
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

export function downloadReceipt(item: PagoItem, competencia: string, nomeAssociacao?: string): void {
  const blob = createPdfBlob(item, competencia, nomeAssociacao);
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
  onNotify: (msg: string) => void,
  nomeAssociacao?: string
): Promise<void> {
  const blob = createPdfBlob(item, competencia, nomeAssociacao);
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
  downloadReceipt(item, competencia, nomeAssociacao);
  openWhatsApp(item.telefone, message);
  onNotify('Recibo baixado. Anexe-o na conversa do WhatsApp.');
}

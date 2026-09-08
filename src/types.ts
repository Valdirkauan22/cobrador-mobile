export interface PendenteItem {
  linha?: number;
  codigo: string;
  morador: string;
  telefone: string;
  saldo: string;
  vencimento: string;
  mensagem?: string;
  prioridade?: number;
}

export interface PagoItem {
  linha?: number;
  codigo: string;
  morador: string;
  telefone: string;
  valor_pago: string;
  data_pagamento: string;
  forma_pagamento: string;
}

export interface MoradorItem {
  linha?: number;
  codigo: string;
  nome: string;
  telefone: string;
  situacao: 'Ativo' | 'Inativo' | string;
}

export interface HistoricoItem {
  data: string;
  competencia: string;
  tipo: string;
  canal: string;
  resultado: string;
  observacao: string;
}

export interface MesAnual {
  mes: number;
  competencia: string;
  previsto: string;
  pago: string;
  pendente: string;
  qtd_pagos: number;
  qtd_pendentes: number;
}

export interface Templates {
  lembrete: string;
  vence_hoje: string;
  primeira: string;
  segunda: string;
  agradecimento: string;
  [key: string]: string;
}

export interface AppConfig {
  url: string;
  key: string;
  isDemo?: boolean;
}

export interface DashboardData {
  competencia: string;
  total_moradores: number;
  qtd_pagos: number;
  qtd_pendentes: number;
  total_previsto: string;
  total_pago: string;
  total_pendente: string;
  pagos: PagoItem[];
  pendentes: PendenteItem[];
  moradores: MoradorItem[];
}

export interface ProofItem {
  id: string;
  codigo: string;
  morador?: string;
  nome: string;
  tipo: string;
  data: string;
  dataUrl?: string;
  observacao?: string;
}

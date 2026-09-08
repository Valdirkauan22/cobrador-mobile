import {
  AppConfig,
  DashboardData,
  HistoricoItem,
  MesAnual,
  MoradorItem,
  PagoItem,
  PendenteItem,
  Templates
} from '../types';

export function formatBRL(v: number): string {
  const parts = Number(v || 0).toFixed(2).split('.');
  return 'R$ ' + parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + parts[1];
}

const DEFAULT_TEMPLATES: Templates = {
  lembrete:
    'Olá [nome], tudo bem? A Associação de Moradores informa que a contribuição referente a [competencia], no valor de [valor], vencerá em [vencimento]. Agradecemos pela colaboração.',
  vence_hoje:
    'Olá [nome], tudo bem? A contribuição da Associação de Moradores referente a [competencia], no valor de [valor], vence hoje. Agradecemos pela colaboração.',
  primeira:
    'Olá [nome], tudo bem? A contribuição referente a [competencia], no valor de [valor], permanece em aberto desde [vencimento]. Caso já tenha pago, desconsidere e nos informe. Obrigado.',
  segunda:
    'Olá [nome]. Reforçamos que a contribuição referente a [competencia], no valor de [valor], continua pendente. Pedimos a gentileza de regularizar ou entrar em contato. Obrigado.',
  agradecimento:
    'Olá [nome], recebemos seu pagamento de [valor] referente a [competencia]. Muito obrigado pela colaboração com a Associação de Moradores!'
};

const DEMO_STORAGE_KEY = 'cobrador_demo_store';

interface DemoStore {
  competencia: string;
  moradores: MoradorItem[];
  pendentes: PendenteItem[];
  pagos: PagoItem[];
  historico: Record<string, HistoricoItem[]>;
  templates: Templates;
}

function getInitialDemoStore(): DemoStore {
  const now = new Date();
  const mes = String(now.getMonth() + 1).padStart(2, '0');
  const ano = now.getFullYear();
  const comp = `${mes}/${ano}`;

  return {
    competencia: comp,
    moradores: [
      { linha: 4, codigo: '101', nome: 'Carlos Eduardo Mendes', telefone: '11987654321', situacao: 'Ativo' },
      { linha: 5, codigo: '102', nome: 'Mariana Alves Souza', telefone: '11976543210', situacao: 'Ativo' },
      { linha: 6, codigo: '103', nome: 'Roberto Firmino Castro', telefone: '11965432109', situacao: 'Ativo' },
      { linha: 7, codigo: '104', nome: 'Ana Paula Nogueira', telefone: '11954321098', situacao: 'Ativo' },
      { linha: 8, codigo: '105', nome: 'Fernando Henrique Dias', telefone: '11943210987', situacao: 'Ativo' },
      { linha: 9, codigo: '106', nome: 'Juliana Paes Rodrigues', telefone: '11932109876', situacao: 'Ativo' },
      { linha: 10, codigo: '107', nome: 'Marcos Vinicius Lima', telefone: '11921098765', situacao: 'Inativo' },
    ],
    pendentes: [
      {
        linha: 4,
        codigo: '101',
        morador: 'Carlos Eduardo Mendes',
        telefone: '11987654321',
        saldo: 'R$ 150,00',
        vencimento: `10/${comp}`,
        mensagem: `Olá Carlos Eduardo Mendes, tudo bem? A contribuição referente a ${comp}, no valor de R$ 150,00, permanece em aberto. Obrigado.`
      },
      {
        linha: 6,
        codigo: '103',
        morador: 'Roberto Firmino Castro',
        telefone: '11965432109',
        saldo: 'R$ 150,00',
        vencimento: `10/${comp}`,
        mensagem: `Olá Roberto Firmino Castro, tudo bem? A contribuição referente a ${comp}, no valor de R$ 150,00, permanece em aberto. Obrigado.`
      },
      {
        linha: 8,
        codigo: '105',
        morador: 'Fernando Henrique Dias',
        telefone: '11943210987',
        saldo: 'R$ 300,00',
        vencimento: `10/${comp}`,
        mensagem: `Olá Fernando Henrique Dias, tudo bem? A contribuição referente a ${comp}, no valor de R$ 300,00, permanece em aberto. Obrigado.`
      }
    ],
    pagos: [
      {
        linha: 5,
        codigo: '102',
        morador: 'Mariana Alves Souza',
        telefone: '11976543210',
        valor_pago: 'R$ 150,00',
        data_pagamento: `05/${comp}`,
        forma_pagamento: 'PIX'
      },
      {
        linha: 7,
        codigo: '104',
        morador: 'Ana Paula Nogueira',
        telefone: '11954321098',
        valor_pago: 'R$ 150,00',
        data_pagamento: `06/${comp}`,
        forma_pagamento: 'Transferencia'
      },
      {
        linha: 9,
        codigo: '106',
        morador: 'Juliana Paes Rodrigues',
        telefone: '11932109876',
        valor_pago: 'R$ 150,00',
        data_pagamento: `08/${comp}`,
        forma_pagamento: 'Dinheiro'
      }
    ],
    historico: {
      '101': [
        {
          data: `02/${comp} 09:30`,
          competencia: comp,
          tipo: 'LEMBRETE',
          canal: 'WhatsApp',
          resultado: 'ENVIADO',
          observacao: 'Lembrete de vencimento enviado'
        }
      ],
      '102': [
        {
          data: `05/${comp} 14:20`,
          competencia: comp,
          tipo: 'PAGAMENTO',
          canal: 'PIX',
          resultado: 'PAGO',
          observacao: 'Pagamento de R$ 150,00 via PIX'
        }
      ],
      '104': [
        {
          data: `06/${comp} 11:15`,
          competencia: comp,
          tipo: 'PAGAMENTO',
          canal: 'Transferencia',
          resultado: 'PAGO',
          observacao: 'Comprovante conferido'
        }
      ]
    },
    templates: { ...DEFAULT_TEMPLATES }
  };
}

function loadDemoStore(): DemoStore {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) {
      const initial = getInitialDemoStore();
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialDemoStore();
  }
}

function saveDemoStore(store: DemoStore): void {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(store));
}

// Live Google Apps Script API invoker
async function callRemoteApi(
  cfg: AppConfig,
  action: string,
  body?: Record<string, unknown>
): Promise<any> {
  if (!cfg.url || !cfg.key) {
    throw new Error('Configure a URL do Web App e a chave de acesso.');
  }

  let response: Response;
  if (body) {
    response = await fetch(cfg.url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...body, acao: action, chave: cfg.key })
    });
  } else {
    const params = new URLSearchParams({ acao: action, chave: cfg.key });
    response = await fetch(`${cfg.url}?${params.toString()}`);
  }

  const json = await response.json();
  if (!json.ok) {
    throw new Error(json.erro || 'Falha na operação com a planilha.');
  }
  return json;
}

export class CobradorApi {
  constructor(private cfg: AppConfig) {}

  public isUsingDemo(): boolean {
    return !!this.cfg.isDemo || !this.cfg.url || !this.cfg.key;
  }

  async health(): Promise<{ ok: boolean; versao: string; planilha?: string }> {
    if (this.isUsingDemo()) {
      return { ok: true, versao: '8.2 (Modo Demonstração)', planilha: 'Planilha Local / Demonstração' };
    }
    return callRemoteApi(this.cfg, 'health');
  }

  async getDashboardData(): Promise<DashboardData> {
    if (this.isUsingDemo()) {
      const store = loadDemoStore();
      const parseVal = (str: string) =>
        parseFloat(str.replace(/[^\d,]/g, '').replace(',', '.')) || 0;

      const totalPrevistoNum =
        store.pendentes.reduce((acc, cur) => acc + parseVal(cur.saldo), 0) +
        store.pagos.reduce((acc, cur) => acc + parseVal(cur.valor_pago), 0);

      const totalPagoNum = store.pagos.reduce((acc, cur) => acc + parseVal(cur.valor_pago), 0);
      const totalPendenteNum = store.pendentes.reduce((acc, cur) => acc + parseVal(cur.saldo), 0);

      return {
        competencia: store.competencia,
        total_moradores: store.moradores.length,
        qtd_pagos: store.pagos.length,
        qtd_pendentes: store.pendentes.length,
        total_previsto: formatBRL(totalPrevistoNum),
        total_pago: formatBRL(totalPagoNum),
        total_pendente: formatBRL(totalPendenteNum),
        pagos: store.pagos,
        pendentes: store.pendentes,
        moradores: store.moradores
      };
    }

    const [c, m] = await Promise.all([
      callRemoteApi(this.cfg, 'consulta'),
      callRemoteApi(this.cfg, 'moradores')
    ]);

    return {
      competencia: c.competencia || '',
      total_moradores: c.total_moradores || 0,
      qtd_pagos: c.qtd_pagos || 0,
      qtd_pendentes: c.qtd_pendentes || 0,
      total_previsto: c.total_previsto || 'R$ 0,00',
      total_pago: c.total_pago || 'R$ 0,00',
      total_pendente: c.total_pendente || 'R$ 0,00',
      pagos: c.pagos || [],
      pendentes: c.pendentes || [],
      moradores: m.moradores || []
    };
  }

  async getHistorico(codigo: string): Promise<HistoricoItem[]> {
    if (this.isUsingDemo()) {
      const store = loadDemoStore();
      return store.historico[codigo] || [];
    }
    const params = new URLSearchParams({ acao: 'historico', chave: this.cfg.key, codigo });
    const res = await fetch(`${this.cfg.url}?${params.toString()}`);
    const json = await res.json();
    return json.historico || [];
  }

  async registrarPagamento(params: {
    codigo: string;
    morador: string;
    telefone: string;
    valor: number;
    data: string;
    forma: string;
    observacao: string;
  }): Promise<void> {
    if (this.isUsingDemo()) {
      const store = loadDemoStore();
      const valBRL = formatBRL(params.valor);

      // Remove or reduce pending
      const pIndex = store.pendentes.findIndex((x) => x.codigo === params.codigo);
      if (pIndex >= 0) {
        store.pendentes.splice(pIndex, 1);
      }

      // Add to paid list
      store.pagos.unshift({
        codigo: params.codigo,
        morador: params.morador,
        telefone: params.telefone,
        valor_pago: valBRL,
        data_pagamento: params.data,
        forma_pagamento: params.forma
      });

      // Add to history
      if (!store.historico[params.codigo]) {
        store.historico[params.codigo] = [];
      }
      store.historico[params.codigo].unshift({
        data: `${params.data} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
        competencia: store.competencia,
        tipo: 'PAGAMENTO',
        canal: params.forma,
        resultado: 'PAGO',
        observacao: `Pagamento de ${valBRL} em ${params.data} via ${params.forma}${
          params.observacao ? ' — ' + params.observacao : ''
        }`
      });

      saveDemoStore(store);
      return;
    }

    await callRemoteApi(this.cfg, 'registrar_pagamento', {
      codigo: params.codigo,
      valor: params.valor,
      data: params.data,
      forma: params.forma,
      observacao: params.observacao
    });
  }

  async anexarComprovante(params: {
    codigo: string;
    morador: string;
    arquivo: string;
    observacao: string;
  }): Promise<void> {
    if (this.isUsingDemo()) {
      const store = loadDemoStore();
      if (!store.historico[params.codigo]) {
        store.historico[params.codigo] = [];
      }
      store.historico[params.codigo].unshift({
        data: new Date().toLocaleString('pt-BR'),
        competencia: store.competencia,
        tipo: 'COMPROVANTE',
        canal: 'Arquivo local',
        resultado: 'ANEXADO',
        observacao: `Comprovante: ${params.arquivo}${params.observacao ? ' — ' + params.observacao : ''}`
      });
      saveDemoStore(store);
      return;
    }

    await callRemoteApi(this.cfg, 'anexar_comprovante', params);
  }

  async salvarMorador(params: {
    linha?: number;
    codigo: string;
    nome: string;
    telefone: string;
    situacao: string;
  }): Promise<void> {
    if (this.isUsingDemo()) {
      const store = loadDemoStore();
      const existingIdx = store.moradores.findIndex((m) => m.codigo === params.codigo);
      if (existingIdx >= 0) {
        store.moradores[existingIdx] = {
          ...store.moradores[existingIdx],
          nome: params.nome,
          telefone: params.telefone,
          situacao: params.situacao
        };
      } else {
        store.moradores.push({
          linha: store.moradores.length + 4,
          codigo: params.codigo || String(100 + store.moradores.length + 1),
          nome: params.nome,
          telefone: params.telefone,
          situacao: params.situacao
        });
      }
      saveDemoStore(store);
      return;
    }

    await callRemoteApi(this.cfg, 'salvar_morador', params);
  }

  async getTemplates(): Promise<Templates> {
    if (this.isUsingDemo()) {
      const store = loadDemoStore();
      return store.templates || DEFAULT_TEMPLATES;
    }
    const res = await callRemoteApi(this.cfg, 'templates');
    return res.templates || DEFAULT_TEMPLATES;
  }

  async salvarTemplates(templates: Templates): Promise<void> {
    if (this.isUsingDemo()) {
      const store = loadDemoStore();
      store.templates = templates;
      saveDemoStore(store);
      return;
    }
    await callRemoteApi(this.cfg, 'salvar_templates', { templates });
  }

  async getPainelAnual(ano?: number): Promise<{ ano: number; meses: MesAnual[] }> {
    const anoAtual = ano || new Date().getFullYear();
    if (this.isUsingDemo()) {
      const meses: MesAnual[] = [];
      for (let m = 1; m <= 12; m++) {
        const comp = `${String(m).padStart(2, '0')}/${anoAtual}`;
        const prev = 1050.0;
        const isPast = m <= new Date().getMonth() + 1;
        const pago = isPast ? (m === new Date().getMonth() + 1 ? 450.0 : 900.0) : 0;
        const pend = isPast ? prev - pago : prev;
        meses.push({
          mes: m,
          competencia: comp,
          previsto: formatBRL(prev),
          pago: formatBRL(pago),
          pendente: formatBRL(pend),
          qtd_pagos: isPast ? (m === new Date().getMonth() + 1 ? 3 : 6) : 0,
          qtd_pendentes: isPast ? (m === new Date().getMonth() + 1 ? 3 : 1) : 7
        });
      }
      return { ano: anoAtual, meses };
    }

    const params = new URLSearchParams({ acao: 'anual', chave: this.cfg.key, ano: String(anoAtual) });
    const res = await fetch(`${this.cfg.url}?${params.toString()}`);
    const json = await res.json();
    return json;
  }

  async backup(): Promise<{ ok: boolean; nome: string }> {
    if (this.isUsingDemo()) {
      return { ok: true, nome: `Backup_Local_${new Date().toISOString().slice(0, 10)}.json` };
    }
    return callRemoteApi(this.cfg, 'backup');
  }

  async ativarBackup(): Promise<{ ok: boolean; mensagem: string }> {
    if (this.isUsingDemo()) {
      return { ok: true, mensagem: 'Backup automático diário ativado para as 02:00.' };
    }
    return callRemoteApi(this.cfg, 'ativar_backup');
  }
}

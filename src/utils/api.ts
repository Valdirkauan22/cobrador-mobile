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
import { Capacitor } from '@capacitor/core';

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
      { linha: 4, codigo: '101', nome: 'Morador Demonstração 1', telefone: '00000000000', situacao: 'Ativo', unidade: 'Casa 01' },
      { linha: 5, codigo: '102', nome: 'Morador Demonstração 2', telefone: '00000000000', situacao: 'Ativo', unidade: 'Casa 02' },
      { linha: 6, codigo: '103', nome: 'Morador Demonstração 3', telefone: '00000000000', situacao: 'Ativo', unidade: 'Casa 03' },
      { linha: 7, codigo: '104', nome: 'Morador Demonstração 4', telefone: '00000000000', situacao: 'Ativo', unidade: 'Casa 04' },
      { linha: 8, codigo: '105', nome: 'Morador Demonstração 5', telefone: '00000000000', situacao: 'Ativo', unidade: 'Casa 05' },
      { linha: 9, codigo: '106', nome: 'Morador Demonstração 6', telefone: '00000000000', situacao: 'Ativo', unidade: 'Casa 06' },
      { linha: 10, codigo: '107', nome: 'Morador Demonstração 7', telefone: '00000000000', situacao: 'Inativo', unidade: 'Casa 07' },
    ],
    pendentes: [
      {
        linha: 4,
        codigo: '101',
        morador: 'Morador Demonstração 1',
        telefone: '00000000000',
        saldo: 'R$ 150,00',
        vencimento: `10/${comp}`,
        unidade: 'Casa 12',
        mensagem: `Olá Morador Demonstração 1, tudo bem? A contribuição referente a ${comp}, no valor de R$ 150,00, permanece em aberto. Obrigado.`
      },
      {
        linha: 6,
        codigo: '103',
        morador: 'Morador Demonstração 3',
        telefone: '00000000000',
        saldo: 'R$ 150,00',
        vencimento: `10/${comp}`,
        unidade: 'Casa 08',
        mensagem: `Olá Morador Demonstração 3, tudo bem? A contribuição referente a ${comp}, no valor de R$ 150,00, permanece em aberto. Obrigado.`
      },
      {
        linha: 8,
        codigo: '105',
        morador: 'Morador Demonstração 5',
        telefone: '00000000000',
        saldo: 'R$ 300,00',
        vencimento: `10/${comp}`,
        unidade: 'Casa 21',
        mensagem: `Olá Morador Demonstração 5, tudo bem? A contribuição referente a ${comp}, no valor de R$ 300,00, permanece em aberto. Obrigado.`
      }
    ],
    pagos: [
      {
        linha: 5,
        codigo: '102',
        morador: 'Morador Demonstração 2',
        telefone: '00000000000',
        valor_pago: 'R$ 150,00',
        data_pagamento: `05/${comp}`,
        forma_pagamento: 'PIX',
        unidade: 'Lote 05'
      },
      {
        linha: 7,
        codigo: '104',
        morador: 'Morador Demonstração 4',
        telefone: '00000000000',
        valor_pago: 'R$ 150,00',
        data_pagamento: `06/${comp}`,
        forma_pagamento: 'Transferencia',
        unidade: 'Quadra B - Lote 02'
      },
      {
        linha: 9,
        codigo: '106',
        morador: 'Morador Demonstração 6',
        telefone: '00000000000',
        valor_pago: 'R$ 150,00',
        data_pagamento: `08/${comp}`,
        forma_pagamento: 'Dinheiro',
        unidade: 'Apto 102'
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

// Live Google Apps Script API invoker via /api/sheets proxy
async function callRemoteApi(
  cfg: AppConfig,
  action: string,
  body?: Record<string, unknown>,
  queryParams?: Record<string, string>
): Promise<any> {
  if (!cfg.url || !cfg.key) {
    throw new Error('Configure a URL do Web App e a chave de acesso.');
  }

  let response: Response;
  if (body) {
    const native = Capacitor.isNativePlatform();
    response = await fetch(native ? cfg.url : '/api/sheets', {
      method: 'POST',
      headers: { 'Content-Type': native ? 'text/plain;charset=utf-8' : 'application/json' },
      body: JSON.stringify({
        ...(native ? {} : { url: cfg.url }),
        acao: action,
        chave: cfg.key,
        ...body
      })
    });
  } else {
    const native = Capacitor.isNativePlatform();
    const params = new URLSearchParams({
      ...(native ? {} : { url: cfg.url }),
      acao: action,
      chave: cfg.key,
      ...(queryParams || {})
    });
    response = await fetch(`${native ? cfg.url : '/api/sheets'}?${params.toString()}`);
  }

  if (!response.ok) {
    let errMsg = 'Falha na requisição ao servidor proxy.';
    try {
      const errJson = await response.json();
      errMsg = errJson.erro || errMsg;
    } catch {}
    throw new Error(errMsg);
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
    const parseVal = (val: unknown) => {
      if (typeof val === 'number') return isNaN(val) ? 0 : val;
      const str = String(val ?? '');
      return parseFloat(str.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    };

    const toStr = (val: unknown) => String(val ?? '').trim();
    const toLower = (val: unknown) => toStr(val).toLowerCase();

    if (this.isUsingDemo()) {
      const store = loadDemoStore();
      const moradoresCadastrados = (store.moradores || []).filter(
        (m) => toStr(m.nome) !== '' && toStr(m.situacao) !== 'Inativo'
      );
      const codigosSet = new Set(moradoresCadastrados.map((m) => toStr(m.codigo)).filter(Boolean));
      const nomesSet = new Set(moradoresCadastrados.map((m) => toLower(m.nome)).filter(Boolean));

      const mapaUnidades = new Map<string, string>();
      moradoresCadastrados.forEach((m) => {
        const u = toStr(m.unidade);
        const cod = toStr(m.codigo);
        const nome = toLower(m.nome);
        if (u) {
          if (cod) mapaUnidades.set(cod, u);
          if (nome) mapaUnidades.set(nome, u);
        }
      });

      const pendentesFiltrados = store.pendentes
        .filter((p) => {
          const cod = toStr(p.codigo);
          const nome = toLower(p.morador);
          return (cod && codigosSet.has(cod)) || (nome && nomesSet.has(nome));
        })
        .map((p) => {
          const cod = toStr(p.codigo);
          const nome = toLower(p.morador);
          return {
            ...p,
            codigo: cod,
            morador: toStr(p.morador),
            unidade: toStr(p.unidade) || mapaUnidades.get(cod) || mapaUnidades.get(nome) || ''
          };
        });

      const pagosFiltrados = store.pagos
        .filter((p) => {
          const cod = toStr(p.codigo);
          const nome = toLower(p.morador);
          return (cod && codigosSet.has(cod)) || (nome && nomesSet.has(nome));
        })
        .map((p) => {
          const cod = toStr(p.codigo);
          const nome = toLower(p.morador);
          return {
            ...p,
            codigo: cod,
            morador: toStr(p.morador),
            unidade: toStr(p.unidade) || mapaUnidades.get(cod) || mapaUnidades.get(nome) || ''
          };
        });

      const totalPagoNum = pagosFiltrados.reduce((acc, cur) => acc + parseVal(cur.valor_pago), 0);
      const totalPendenteNum = pendentesFiltrados.reduce((acc, cur) => acc + parseVal(cur.saldo), 0);
      const totalPrevistoNum = totalPagoNum + totalPendenteNum;

      return {
        competencia: toStr(store.competencia),
        total_moradores: moradoresCadastrados.length,
        qtd_pagos: pagosFiltrados.length,
        qtd_pendentes: pendentesFiltrados.length,
        total_previsto: formatBRL(totalPrevistoNum),
        total_pago: formatBRL(totalPagoNum),
        total_pendente: formatBRL(totalPendenteNum),
        pagos: pagosFiltrados,
        pendentes: pendentesFiltrados,
        moradores: moradoresCadastrados
      };
    }

    const [c, m] = await Promise.all([
      callRemoteApi(this.cfg, 'consulta'),
      callRemoteApi(this.cfg, 'moradores')
    ]);

    // Filtrar apenas moradores devidamente cadastrados (com nome e não inativos)
    const moradoresCadastrados: MoradorItem[] = (m.moradores || []).map((x: any) => ({
      ...x,
      codigo: toStr(x.codigo),
      nome: toStr(x.nome),
      telefone: toStr(x.telefone),
      unidade: toStr(x.unidade),
      situacao: toStr(x.situacao) || 'Ativo'
    })).filter(
      (x: MoradorItem) => x.nome !== '' && x.situacao !== 'Inativo'
    );

    const codigosCadastrados = new Set(
      moradoresCadastrados
        .map((x) => toStr(x.codigo))
        .filter(Boolean)
    );
    const nomesCadastrados = new Set(
      moradoresCadastrados
        .map((x) => toLower(x.nome))
        .filter(Boolean)
    );

    const mapaUnidades = new Map<string, string>();
    moradoresCadastrados.forEach((x) => {
      const u = toStr(x.unidade);
      const cod = toStr(x.codigo);
      const nome = toLower(x.nome);
      if (u) {
        if (cod) mapaUnidades.set(cod, u);
        if (nome) mapaUnidades.set(nome, u);
      }
    });

    // Se houver lista de moradores cadastrados, exibir APENAS moradores cadastrados nas pendências e pagamentos
    let rawPendentes: PendenteItem[] = (c.pendentes || []).map((p: any) => ({
      ...p,
      codigo: toStr(p.codigo),
      morador: toStr(p.morador),
      telefone: toStr(p.telefone),
      saldo: typeof p.saldo === 'number' ? formatBRL(p.saldo) : toStr(p.saldo),
      vencimento: toStr(p.vencimento),
      unidade: toStr(p.unidade)
    }));

    let rawPagos: PagoItem[] = (c.pagos || []).map((p: any) => ({
      ...p,
      codigo: toStr(p.codigo),
      morador: toStr(p.morador),
      telefone: toStr(p.telefone),
      valor_pago: typeof p.valor_pago === 'number' ? formatBRL(p.valor_pago) : toStr(p.valor_pago),
      data_pagamento: toStr(p.data_pagamento),
      forma_pagamento: toStr(p.forma_pagamento),
      unidade: toStr(p.unidade)
    }));

    let pendentesFiltrados: PendenteItem[] = rawPendentes;
    let pagosFiltrados: PagoItem[] = rawPagos;

    if (moradoresCadastrados.length > 0) {
      pendentesFiltrados = pendentesFiltrados
        .filter((p) => {
          const cod = toStr(p.codigo);
          const nome = toLower(p.morador);
          return (cod && codigosCadastrados.has(cod)) || (nome && nomesCadastrados.has(nome));
        })
        .map((p) => {
          const cod = toStr(p.codigo);
          const nome = toLower(p.morador);
          return {
            ...p,
            codigo: cod,
            unidade: p.unidade || mapaUnidades.get(cod) || mapaUnidades.get(nome) || ''
          };
        });

      pagosFiltrados = pagosFiltrados
        .filter((p) => {
          const cod = toStr(p.codigo);
          const nome = toLower(p.morador);
          return (cod && codigosCadastrados.has(cod)) || (nome && nomesCadastrados.has(nome));
        })
        .map((p) => {
          const cod = toStr(p.codigo);
          const nome = toLower(p.morador);
          return {
            ...p,
            codigo: cod,
            unidade: p.unidade || mapaUnidades.get(cod) || mapaUnidades.get(nome) || ''
          };
        });
    }

    const totalPagoNum = pagosFiltrados.reduce((acc, cur) => acc + parseVal(cur.valor_pago), 0);
    const totalPendenteNum = pendentesFiltrados.reduce((acc, cur) => acc + parseVal(cur.saldo), 0);
    const totalPrevistoNum = totalPagoNum + totalPendenteNum;

    return {
      competencia: toStr(c.competencia),
      total_moradores: moradoresCadastrados.length > 0 ? moradoresCadastrados.length : (c.total_moradores || 0),
      qtd_pagos: pagosFiltrados.length,
      qtd_pendentes: pendentesFiltrados.length,
      total_previsto: formatBRL(totalPrevistoNum),
      total_pago: formatBRL(totalPagoNum),
      total_pendente: formatBRL(totalPendenteNum),
      pagos: pagosFiltrados,
      pendentes: pendentesFiltrados,
      moradores: moradoresCadastrados.length > 0 ? moradoresCadastrados : (m.moradores || [])
    };
  }

  async getHistorico(codigo: string): Promise<HistoricoItem[]> {
    if (this.isUsingDemo()) {
      const store = loadDemoStore();
      return store.historico[codigo] || [];
    }
    const res = await callRemoteApi(this.cfg, 'historico', undefined, { codigo });
    return res.historico || [];
  }

  async marcar(params: {
    linha?: number;
    codigo?: string;
    resultado: 'ENVIADO' | 'ADIAR_1_DIA' | 'PAGO' | 'ERRO';
    observacao?: string;
  }): Promise<void> {
    if (this.isUsingDemo()) {
      if (params.codigo) {
        const store = loadDemoStore();
        if (!store.historico[params.codigo]) {
          store.historico[params.codigo] = [];
        }
        store.historico[params.codigo].unshift({
          data: new Date().toLocaleString('pt-BR'),
          resultado: params.resultado,
          observacao: params.observacao || 'Marcado via Cobrador Mobile'
        });
        saveDemoStore(store);
      }
      return;
    }
    if (params.linha) {
      await callRemoteApi(this.cfg, 'marcar', {
        linha: params.linha,
        resultado: params.resultado,
        observacao: params.observacao || 'Cobrador Mobile v8.2'
      });
    }
  }

  async registrarPagamento(params: {
    codigo: string;
    morador: string;
    telefone: string;
    valor: number;
    data: string;
    forma: string;
    observacao: string;
    operacao_id?: string;
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
      observacao: params.observacao,
      operacao_id: params.operacao_id
    });
  }

  async anexarComprovante(params: {
    codigo: string;
    morador: string;
    arquivo: string;
    observacao: string;
    arquivo_base64?: string;
    mime_type?: string;
    operacao_id?: string;
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
    unidade?: string;
  }): Promise<void> {
    if (this.isUsingDemo()) {
      const store = loadDemoStore();
      const existingIdx = store.moradores.findIndex((m) => m.codigo === params.codigo);
      if (existingIdx >= 0) {
        store.moradores[existingIdx] = {
          ...store.moradores[existingIdx],
          nome: params.nome,
          telefone: params.telefone,
          situacao: params.situacao,
          unidade: params.unidade || store.moradores[existingIdx].unidade
        };
      } else {
        store.moradores.push({
          linha: store.moradores.length + 4,
          codigo: params.codigo || String(100 + store.moradores.length + 1),
          nome: params.nome,
          telefone: params.telefone,
          situacao: params.situacao,
          unidade: params.unidade
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

    const res = await callRemoteApi(this.cfg, 'anual', undefined, { ano: String(anoAtual) });
    return res;
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

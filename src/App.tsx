import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AppConfig,
  DashboardData,
  MoradorItem,
  PagoItem,
  PendenteItem,
  Templates
} from './types';
import { CobradorApi } from './utils/api';
import { loadConfig, saveConfig, saveProofAttachment } from './utils/storage';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { BottomNav, NavTab } from './components/BottomNav';
import { PendentesView } from './components/PendentesView';
import { PagosView } from './components/PagosView';
import { MoradoresView } from './components/MoradoresView';
import { MaisView } from './components/MaisView';
import { Toast } from './components/Toast';
import { PaymentModal } from './components/modals/PaymentModal';
import { ProofModal } from './components/modals/ProofModal';
import { ResidentModal } from './components/modals/ResidentModal';
import { HistoryModal } from './components/modals/HistoryModal';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { TemplatesModal } from './components/modals/TemplatesModal';
import { AnnualModal } from './components/modals/AnnualModal';
import { SettingsModal } from './components/modals/SettingsModal';

export const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>(() => loadConfig());
  const [currentTab, setCurrentTab] = useState<NavTab>('pendentes');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [dashboard, setDashboard] = useState<DashboardData>({
    competencia: '',
    total_moradores: 0,
    qtd_pagos: 0,
    qtd_pendentes: 0,
    total_previsto: 'R$ 0,00',
    total_pago: 'R$ 0,00',
    total_pendente: 'R$ 0,00',
    pagos: [],
    pendentes: [],
    moradores: []
  });

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [paymentItem, setPaymentItem] = useState<PendenteItem | null>(null);
  const [proofItem, setProofItem] = useState<PagoItem | null>(null);
  const [residentModalItem, setResidentModalItem] = useState<MoradorItem | null>(null);
  const [isResidentModalOpen, setIsResidentModalOpen] = useState<boolean>(false);
  const [historyModal, setHistoryModal] = useState<{
    isOpen: boolean;
    codigo: string | null;
    nome: string;
  }>({
    isOpen: false,
    codigo: null,
    nome: ''
  });
  const [receiptItem, setReceiptItem] = useState<PagoItem | null>(null);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState<boolean>(false);
  const [isAnnualOpen, setIsAnnualOpen] = useState<boolean>(false);

  const api = useMemo(() => new CobradorApi(config), [config]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getDashboardData();
      setDashboard(data);
    } catch (err: any) {
      showToast('Erro ao sincronizar: ' + (err.message || 'Verifique a conexão'));
    } finally {
      setIsLoading(false);
    }
  }, [api, showToast]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Handle Save Settings
  const handleSaveSettings = async (newCfg: AppConfig) => {
    saveConfig(newCfg);
    setConfig(newCfg);
    const testApi = new CobradorApi(newCfg);
    const h = await testApi.health();
    showToast('Conectado: ' + h.versao);
  };

  const handleUseDemo = () => {
    const demoCfg: AppConfig = { url: '', key: '', isDemo: true };
    saveConfig(demoCfg);
    setConfig(demoCfg);
    showToast('Modo Demonstração ativado');
  };

  // Payment confirmation
  const handleConfirmPayment = async (data: {
    valor: number;
    data: string;
    forma: string;
    file?: File;
    observacao: string;
  }) => {
    if (!paymentItem) return;

    let obs = data.observacao;
    if (data.file) {
      await saveProofAttachment(paymentItem.codigo, paymentItem.morador, data.file, data.observacao);
      obs += (obs ? ' — ' : '') + 'Comprovante: ' + data.file.name;
    }

    await api.registrarPagamento({
      codigo: paymentItem.codigo,
      morador: paymentItem.morador,
      telefone: paymentItem.telefone,
      valor: data.valor,
      data: data.data,
      forma: data.forma,
      observacao: obs
    });

    await refreshAll();
    showToast('Pagamento registrado com sucesso!');

    // Prepare paid item for receipt preview
    const newlyPaid: PagoItem = {
      codigo: paymentItem.codigo,
      morador: paymentItem.morador,
      telefone: paymentItem.telefone,
      valor_pago: `R$ ${data.valor.toFixed(2).replace('.', ',')}`,
      data_pagamento: data.data,
      forma_pagamento: data.forma
    };

    setReceiptItem(newlyPaid);
  };

  // Proof upload
  const handleConfirmProof = async (file: File, observacao: string) => {
    if (!proofItem) return;
    await saveProofAttachment(proofItem.codigo, proofItem.morador, file, observacao);
    await api.anexarComprovante({
      codigo: proofItem.codigo,
      morador: proofItem.morador,
      arquivo: file.name,
      observacao
    });
    showToast('Comprovante anexado ao histórico');
  };

  // Resident save
  const handleSaveResident = async (data: {
    linha?: number;
    codigo: string;
    nome: string;
    telefone: string;
    situacao: string;
  }) => {
    await api.salvarMorador(data);
    await refreshAll();
    showToast('Morador salvo com sucesso!');
  };

  // Templates save
  const handleSaveTemplates = async (templates: Templates) => {
    await api.salvarTemplates(templates);
    showToast('Modelos de mensagens atualizados');
  };

  // Backup
  const handleBackup = async () => {
    try {
      const res = await api.backup();
      showToast('Backup criado: ' + res.nome);
    } catch (err: any) {
      alert(err.message || 'Erro ao realizar backup');
    }
  };

  // Daily backup
  const handleDailyBackup = async () => {
    try {
      const res = await api.ativarBackup();
      alert(res.mensagem);
    } catch (err: any) {
      alert(err.message || 'Erro ao ativar backup diário');
    }
  };

  // CSV export
  const handleExportCSV = () => {
    const rows = [
      ['Status', 'Código', 'Morador', 'Telefone', 'Valor'],
      ...(dashboard.pagos || []).map((x) => ['Pago', x.codigo, x.morador, x.telefone, x.valor_pago]),
      ...(dashboard.pendentes || []).map((x) => ['A pagar', x.codigo, x.morador, x.telefone, x.saldo])
    ];

    const csvContent =
      '\ufeff' +
      rows
        .map((r) => r.map((v) => '"' + String(v || '').replace(/"/g, '""') + '"').join(';'))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relacao_${(dashboard.competencia || 'geral').replace('/', '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Relação CSV exportada com sucesso.');
  };

  return (
    <div className="min-h-screen bg-[#eef3f8] flex flex-col selection:bg-[#1769aa] selection:text-white">
      {/* Header */}
      <Header
        competencia={dashboard.competencia}
        isDemo={api.isUsingDemo()}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-3 sm:px-4 pt-3.5">
        {/* Metric Cards Banner */}
        <MetricCards
          totalMoradores={dashboard.total_moradores}
          qtdPagos={dashboard.qtd_pagos}
          qtdPendentes={dashboard.qtd_pendentes}
          totalPendente={dashboard.total_pendente}
          totalPago={dashboard.total_pago}
          totalPrevisto={dashboard.total_previsto}
          isLoading={isLoading}
        />

        {/* Tab Views */}
        {currentTab === 'pendentes' && (
          <PendentesView
            items={dashboard.pendentes}
            onRefresh={refreshAll}
            onPayment={(item) => setPaymentItem(item)}
            onHistory={(codigo, nome) =>
              setHistoryModal({ isOpen: true, codigo, nome })
            }
            isLoading={isLoading}
          />
        )}

        {currentTab === 'pagos' && (
          <PagosView
            items={dashboard.pagos}
            onRefresh={refreshAll}
            onReceipt={(item) => setReceiptItem(item)}
            onProof={(item) => setProofItem(item)}
            onHistory={(codigo, nome) =>
              setHistoryModal({ isOpen: true, codigo, nome })
            }
            isLoading={isLoading}
          />
        )}

        {currentTab === 'moradores' && (
          <MoradoresView
            items={dashboard.moradores}
            onNewResident={() => {
              setResidentModalItem(null);
              setIsResidentModalOpen(true);
            }}
            onEditResident={(item) => {
              setResidentModalItem(item);
              setIsResidentModalOpen(true);
            }}
          />
        )}

        {currentTab === 'mais' && (
          <MaisView
            onLoadAnnual={() => setIsAnnualOpen(true)}
            onEditTemplates={() => setIsTemplatesOpen(true)}
            onBackup={handleBackup}
            onDailyBackup={handleDailyBackup}
            onExportCSV={handleExportCSV}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        qtdPendentes={dashboard.qtd_pendentes}
        qtdPagos={dashboard.qtd_pagos}
      />

      {/* Toast */}
      <Toast message={toastMessage} />

      {/* Modals */}
      <PaymentModal
        isOpen={!!paymentItem}
        item={paymentItem}
        onClose={() => setPaymentItem(null)}
        onConfirm={handleConfirmPayment}
      />

      <ProofModal
        isOpen={!!proofItem}
        item={proofItem}
        onClose={() => setProofItem(null)}
        onConfirm={handleConfirmProof}
      />

      <ResidentModal
        isOpen={isResidentModalOpen}
        item={residentModalItem}
        onClose={() => setIsResidentModalOpen(false)}
        onSave={handleSaveResident}
      />

      <HistoryModal
        isOpen={historyModal.isOpen}
        codigo={historyModal.codigo}
        moradorNome={historyModal.nome}
        onClose={() => setHistoryModal({ isOpen: false, codigo: null, nome: '' })}
        fetchHistory={(cod) => api.getHistorico(cod)}
      />

      <ReceiptModal
        isOpen={!!receiptItem}
        item={receiptItem}
        competencia={dashboard.competencia}
        onClose={() => setReceiptItem(null)}
        onNotify={showToast}
      />

      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        fetchTemplates={() => api.getTemplates()}
        onSaveTemplates={handleSaveTemplates}
      />

      <AnnualModal
        isOpen={isAnnualOpen}
        onClose={() => setIsAnnualOpen(false)}
        fetchAnnualData={(ano) => api.getPainelAnual(ano)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        config={config}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        onUseDemo={handleUseDemo}
      />
    </div>
  );
};
export default App;

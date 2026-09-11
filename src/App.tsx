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
import {
  addOfflineAction,
  getOfflineQueue,
  getOfflineQueueCount,
  loadConfig,
  removeOfflineAction,
  saveConfig,
  saveProofAttachment
} from './utils/storage';
import { downloadMonthlyReportPdf } from './utils/pdf';
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
import { SecurityModal } from './components/modals/SecurityModal';
import { LockScreen } from './components/LockScreen';
import { configureBillingNotifications, checkLatestRelease, APP_VERSION } from './utils/native';
import { App as CapacitorApp } from '@capacitor/app';

export const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>(() => loadConfig());
  const [currentTab, setCurrentTab] = useState<NavTab>('pendentes');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [offlineCount, setOfflineCount] = useState<number>(getOfflineQueueCount());

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
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(() => !!loadConfig().pinHash);
  const [monthClosed, setMonthClosed] = useState(false);
  const backgroundAt = React.useRef<number | null>(null);

  const api = useMemo(() => new CobradorApi(config), [config]);
  const newOperationId = () =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `op-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const isNetworkFailure = (err: unknown) =>
    !navigator.onLine || err instanceof TypeError || /network|fetch|conexão/i.test(String((err as any)?.message || err));

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
      setOfflineCount(getOfflineQueueCount());
    } catch (err: any) {
      showToast('Erro ao sincronizar: ' + (err.message || 'Verifique a conexão'));
    } finally {
      setIsLoading(false);
    }
  }, [api, showToast]);

  // Offline queue processor
  const processOfflineQueue = useCallback(async () => {
    const queue = getOfflineQueue();
    if (queue.length === 0) return;
    setIsLoading(true);
    let synced = 0;

    for (const action of queue) {
      try {
        if (action.type === 'pagamento') {
          await api.registrarPagamento(action.payload);
        } else if (action.type === 'morador') {
          await api.salvarMorador(action.payload);
        } else if (action.type === 'comprovante') {
          await api.anexarComprovante(action.payload);
        } else if (action.type === 'marcar') {
          await api.marcar(action.payload);
        }
        removeOfflineAction(action.id);
        synced++;
      } catch (err) {
        console.error('Falha ao processar item offline:', action, err);
        break;
      }
    }

    setOfflineCount(getOfflineQueueCount());
    if (synced > 0) {
      showToast(`${synced} ação(ões) offline sincronizada(s)!`);
      await refreshAll();
    }
    setIsLoading(false);
  }, [api, refreshAll, showToast]);

  // Online / Offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Conexão restabelecida! Sincronizando fila...');
      processOfflineQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Modo offline: ações serão guardadas para envio posterior.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [processOfflineQueue, showToast]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    let handle: { remove: () => Promise<void> } | undefined;
    CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) backgroundAt.current = Date.now();
      else if (config.pinHash && backgroundAt.current && Date.now() - backgroundAt.current > (config.lockTimeoutMinutes || 5) * 60000) setIsLocked(true);
    }).then(h => { handle = h; });
    return () => { handle?.remove(); };
  }, [config.pinHash, config.lockTimeoutMinutes]);

  useEffect(() => {
    if (!api.isUsingDemo()) api.getClosingStatus().then(x => setMonthClosed(x.fechado)).catch(()=>{});
  }, [api, dashboard.competencia]);

  // Handle Save Settings
  const handleSaveSettings = async (newCfg: AppConfig) => {
    saveConfig(newCfg);
    setConfig(newCfg);
    if (!newCfg.isDemo && newCfg.url) {
      const testApi = new CobradorApi(newCfg);
      const h = await testApi.health();
      showToast('Conectado: ' + (h.versao || 'OK'));
    } else {
      showToast('Configurações salvas!');
    }
    await refreshAll();
  };

  const handleUseDemo = () => {
    const demoCfg: AppConfig = {
      url: '',
      key: '',
      pixKey: config.pixKey || '',
      nomeAssociacao: config.nomeAssociacao || 'Associação de Moradores',
      isDemo: true,
      operatorName: config.operatorName || '',
      whatsappMode: config.whatsappMode || 'auto'
    };
    saveConfig(demoCfg);
    setConfig(demoCfg);
    showToast('Modo Demonstração ativado');
  };

  // Payment confirmation with offline fallback
  const handleConfirmPayment = async (data: {
    valor: number;
    data: string;
    forma: string;
    file?: File;
    observacao: string;
  }) => {
    if (!paymentItem) return;

    let obs = data.observacao;
    if (config.operatorName) {
      obs += (obs ? ' — ' : '') + 'Responsável: ' + config.operatorName;
    }
    let proof: Awaited<ReturnType<typeof saveProofAttachment>> | null = null;
    if (data.file) {
      proof = await saveProofAttachment(paymentItem.codigo, paymentItem.morador, data.file, data.observacao);
      obs += (obs ? ' — ' : '') + 'Comprovante: ' + data.file.name;
    }

    const payload = {
      codigo: paymentItem.codigo,
      morador: paymentItem.morador,
      telefone: paymentItem.telefone,
      valor: data.valor,
      data: data.data,
      forma: data.forma,
      observacao: obs,
      operacao_id: newOperationId()
    };
    const proofPayload = proof ? {
      codigo: paymentItem.codigo,
      morador: paymentItem.morador,
      arquivo: proof.nome,
      arquivo_base64: proof.dataUrl,
      mime_type: proof.tipo,
      observacao: proof.observacao || '',
      operacao_id: newOperationId()
    } : null;

    try {
      await api.registrarPagamento(payload);
      showToast('Pagamento registrado com sucesso!');
    } catch (err: any) {
      if (!api.isUsingDemo() && isNetworkFailure(err)) {
        addOfflineAction({
          type: 'pagamento',
          payload
        });
        if (proofPayload) addOfflineAction({ type: 'comprovante', payload: proofPayload });
        setOfflineCount(getOfflineQueueCount());
        showToast('Sem conexão. Pagamento salvo na fila offline!');
        await refreshAll();
        return;
      } else {
        throw err;
      }
    }

    if (proofPayload) {
      try {
        await api.anexarComprovante(proofPayload);
      } catch (err: any) {
        if (!api.isUsingDemo() && isNetworkFailure(err)) {
          addOfflineAction({ type: 'comprovante', payload: proofPayload });
          setOfflineCount(getOfflineQueueCount());
          showToast('Pagamento confirmado; comprovante aguardando sincronização.');
        } else {
          showToast('Pagamento confirmado, mas o comprovante falhou: ' + (err.message || 'erro desconhecido'));
        }
      }
    }

    await refreshAll();

    // Prepare paid item for receipt preview
    const newlyPaid: PagoItem = {
      codigo: paymentItem.codigo,
      morador: paymentItem.morador,
      telefone: paymentItem.telefone,
      unidade: paymentItem.unidade,
      valor_pago: `R$ ${data.valor.toFixed(2).replace('.', ',')}`,
      data_pagamento: data.data,
      forma_pagamento: data.forma
    };

    setReceiptItem(newlyPaid);
  };

  // Proof upload
  const handleConfirmProof = async (file: File, observacao: string) => {
    if (!proofItem) return;
    const proof = await saveProofAttachment(proofItem.codigo, proofItem.morador, file, observacao);

    const proofObservation = observacao + (config.operatorName
      ? (observacao ? ' — ' : '') + 'Responsável: ' + config.operatorName
      : '');
    const payload = {
      codigo: proofItem.codigo,
      morador: proofItem.morador,
      arquivo: file.name,
      arquivo_base64: proof.dataUrl,
      mime_type: proof.tipo,
      observacao: proofObservation,
      operacao_id: newOperationId()
    };

    try {
      await api.anexarComprovante(payload);
      showToast('Comprovante anexado ao histórico');
    } catch (err: any) {
      if (!api.isUsingDemo() && isNetworkFailure(err)) {
        addOfflineAction({
          type: 'comprovante',
          payload
        });
        setOfflineCount(getOfflineQueueCount());
        showToast('Comprovante salvo na fila offline.');
      } else throw err;
    }
  };

  // Resident save with offline fallback
  const handleSaveResident = async (data: {
    linha?: number;
    codigo: string;
    nome: string;
    telefone: string;
    situacao: string;
    unidade?: string;
  }) => {
    try {
      await api.salvarMorador(data);
      showToast('Morador salvo com sucesso!');
    } catch (err: any) {
      if (!api.isUsingDemo() && isNetworkFailure(err)) {
        addOfflineAction({
          type: 'morador',
          payload: data
        });
        setOfflineCount(getOfflineQueueCount());
        showToast('Sem conexão. Morador salvo na fila offline!');
      } else throw err;
    }
    await refreshAll();
  };

  // Quick action: Mark as sent
  const handleMarkSent = async (item: PendenteItem) => {
    const payload = {
      linha: item.linha,
      codigo: item.codigo,
      resultado: 'ENVIADO',
      observacao: `Envio confirmado manualmente em ${new Date().toLocaleDateString('pt-BR')}${config.operatorName ? ' por ' + config.operatorName : ''}.`
    };
    try {
      await api.marcar(payload);
      showToast(`Cobrança de ${item.morador} registrada como enviada.`);
    } catch (err: any) {
      if (!api.isUsingDemo() && isNetworkFailure(err)) {
        addOfflineAction({ type: 'marcar', payload });
        setOfflineCount(getOfflineQueueCount());
        showToast('Sem conexão. Confirmação de envio guardada para sincronizar.');
      } else {
        showToast(`Não foi possível registrar o envio: ${err.message || 'erro desconhecido'}`);
      }
    }
  };

  // Quick action: Postpone 1 day
  const handlePostpone = async (item: PendenteItem) => {
    try {
      await api.marcar({
        linha: item.linha,
        codigo: item.codigo,
        resultado: 'ADIAR_1_DIA',
        observacao: `Cobrança adiada por 1 dia em ${new Date().toLocaleDateString('pt-BR')}`
      });
      showToast(`Cobrança de ${item.morador} adiada por 1 dia.`);
    } catch (err: any) {
      showToast(`Não foi possível adiar: ${err.message || 'erro desconhecido'}`);
    }
  };

  // Monthly report generation
  const handleMonthlyReport = () => {
    downloadMonthlyReportPdf(dashboard, config.nomeAssociacao || 'Associação de Moradores');
    showToast('Relatório Mensal PDF gerado com sucesso!');
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
      ['Status', 'Código', 'Unidade', 'Morador', 'Telefone', 'Valor'],
      ...(dashboard.pagos || []).map((x) => [
        'Pago',
        x.codigo,
        x.unidade || '',
        x.morador,
        x.telefone,
        x.valor_pago
      ]),
      ...(dashboard.pendentes || []).map((x) => [
        'A pagar',
        x.codigo,
        x.unidade || '',
        x.morador,
        x.telefone,
        x.saldo
      ])
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

  const handleNotifications = async () => {
    const next = !config.notificationsEnabled;
    const enabled = await configureBillingNotifications(next);
    const updated = { ...config, notificationsEnabled: enabled };
    saveConfig(updated); setConfig(updated);
    showToast(enabled ? 'Notificações mensais ativadas às 08:00.' : next ? 'Permissão de notificações não concedida.' : 'Notificações desativadas.');
  };

  const handleClosing = async () => {
    const text = monthClosed ? 'Reabrir esta competência e permitir alterações?' : 'Fechar esta competência? Pagamentos ficarão bloqueados até a reabertura.';
    if (!window.confirm(text)) return;
    try { const status = await api.setMonthClosed(!monthClosed); setMonthClosed(status.fechado); showToast(status.fechado ? 'Competência fechada com segurança.' : 'Competência reaberta.'); }
    catch (e:any) { alert((e.message || e) + '\n\nAtualize também o Backend_Planilha_v8_2.gs para utilizar esta função.'); }
  };

  const handleRestore = async () => {
    try {
      const backups = await api.getBackups();
      if (!backups.length) return alert('Nenhum backup encontrado.');
      const options = backups.slice(0,10).map((b,i)=>`${i+1}. ${b.nome} — ${b.data}`).join('\n');
      const chosen = Number(window.prompt(`Escolha o número do backup para criar uma cópia recuperada:\n\n${options}`));
      if (!chosen || !backups[chosen-1]) return;
      if (!confirm(`Criar cópia recuperada de "${backups[chosen-1].nome}"? A planilha atual não será sobrescrita.`)) return;
      const result = await api.restoreBackup(backups[chosen-1].id); showToast(`Cópia criada: ${result.nome}`); if(result.url && confirm('Abrir a cópia recuperada?')) window.open(result.url,'_blank');
    } catch(e:any) { alert((e.message||e)+'\n\nAtualize também o Backend_Planilha_v8_2.gs.'); }
  };

  const handleCheckUpdate = async () => {
    try { const r = await checkLatestRelease(APP_VERSION); if(r.available && r.url) { if(confirm(`Nova versão ${r.version} disponível. Abrir página de atualização?`)) window.open(r.url,'_blank'); } else showToast(`Você já está usando a versão ${APP_VERSION}.`); }
    catch(e:any){ showToast(e.message || 'Falha ao verificar atualização.'); }
  };

  return (
    <div className="app-shell bg-[#eef3f8] flex flex-col selection:bg-[#1769aa] selection:text-white">
      {/* Header */}
      <Header
        competencia={dashboard.competencia}
        isDemo={api.isUsingDemo()}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="app-main-safe flex-1 w-full max-w-3xl mx-auto px-3 sm:px-4 pt-3.5">
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
            pixKey={config.pixKey}
            onRefresh={refreshAll}
            onPayment={(item) => setPaymentItem(item)}
            onHistory={(codigo, nome) =>
              setHistoryModal({ isOpen: true, codigo, nome })
            }
            onMarkSent={handleMarkSent}
            onPostpone={handlePostpone}
            onNotify={showToast}
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
            onMonthlyReport={handleMonthlyReport}
            offlineCount={offlineCount}
            onSyncOffline={processOfflineQueue}
            isOnline={isOnline}
            onSecurity={() => setIsSecurityOpen(true)}
            onNotifications={handleNotifications}
            onRestore={handleRestore}
            onClosing={handleClosing}
            onCheckUpdate={handleCheckUpdate}
            monthClosed={monthClosed}
            notificationsEnabled={!!config.notificationsEnabled}
            appVersion={APP_VERSION}
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
        nomeAssociacao={config.nomeAssociacao}
        operatorName={config.operatorName}
        whatsappMode={config.whatsappMode}
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
        onSyncOffline={processOfflineQueue}
      />
      <SecurityModal isOpen={isSecurityOpen} config={config} onClose={()=>setIsSecurityOpen(false)} onSave={(next)=>{saveConfig(next);setConfig(next);showToast('Proteção atualizada.');}} />
      {isLocked && config.pinHash && <LockScreen pinHash={config.pinHash} biometrics={config.biometricsEnabled} onUnlock={()=>setIsLocked(false)} />}
    </div>
  );
};
export default App;

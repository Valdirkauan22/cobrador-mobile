import React from 'react';
import {
  BarChart3,
  CalendarClock,
  CloudUpload,
  Download,
  FileText,
  Mail,
  RefreshCw,
  Settings,
  Wifi,
  WifiOff
  ,ShieldCheck, BellRing, LockKeyhole, RotateCcw, Smartphone
} from 'lucide-react';

interface MaisViewProps {
  onLoadAnnual: () => void;
  onEditTemplates: () => void;
  onBackup: () => void;
  onDailyBackup: () => void;
  onExportCSV: () => void;
  onOpenSettings: () => void;
  onMonthlyReport?: () => void;
  offlineCount?: number;
  onSyncOffline?: () => void;
  isOnline?: boolean;
  onSecurity: () => void;
  onNotifications: () => void;
  onRestore: () => void;
  onClosing: () => void;
  onCheckUpdate: () => void;
  monthClosed?: boolean;
  notificationsEnabled?: boolean;
  appVersion?: string;
}

export const MaisView: React.FC<MaisViewProps> = ({
  onLoadAnnual,
  onEditTemplates,
  onBackup,
  onDailyBackup,
  onExportCSV,
  onOpenSettings,
  onMonthlyReport,
  offlineCount = 0,
  onSyncOffline,
  isOnline = true,
  onSecurity, onNotifications, onRestore, onClosing, onCheckUpdate,
  monthClosed = false, notificationsEnabled = false, appVersion = ''
}) => {
  return (
    <section id="mais-view" className="space-y-4 pb-24">
      {/* Network / Offline Queue Banner */}
      <div className="bg-white border border-[#d6e0ea] rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          </div>
          <div>
            <strong className="block text-xs font-bold text-[#172033]">
              {isOnline ? 'Dispositivo Online' : 'Modo Offline Ativo'}
            </strong>
            <span className="text-[11px] text-[#68778a]">
              {offlineCount > 0
                ? `${offlineCount} ação(ões) pendente(s) de envio`
                : 'Todas as ações estão sincronizadas'}
            </span>
          </div>
        </div>

        {offlineCount > 0 && onSyncOffline && (
          <button
            onClick={onSyncOffline}
            className="bg-[#1769aa] hover:bg-[#125a96] text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sincronizar</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button onClick={onSecurity} className="bg-white border border-[#d6e0ea] rounded-2xl p-4 min-h-[76px] text-left flex items-center gap-3.5 shadow-sm"><div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center"><ShieldCheck className="w-5 h-5"/></div><div><strong className="block text-sm">Segurança e biometria</strong><span className="text-xs text-[#68778a]">PIN, biometria e bloqueio automático</span></div></button>
        <button onClick={onNotifications} className="bg-white border border-[#d6e0ea] rounded-2xl p-4 min-h-[76px] text-left flex items-center gap-3.5 shadow-sm"><div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><BellRing className="w-5 h-5"/></div><div><strong className="block text-sm">Notificações {notificationsEnabled?'ativas':'desativadas'}</strong><span className="text-xs text-[#68778a]">Lembrete, vencimento e cobrança</span></div></button>
        <button onClick={onClosing} className={`border rounded-2xl p-4 min-h-[76px] text-left flex items-center gap-3.5 shadow-sm ${monthClosed?'bg-rose-50 border-rose-200':'bg-white border-[#d6e0ea]'}`}><div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center"><LockKeyhole className="w-5 h-5"/></div><div><strong className="block text-sm">{monthClosed?'Mês fechado':'Fechar competência'}</strong><span className="text-xs text-[#68778a]">{monthClosed?'Toque para reabrir':'Bloquear alterações após conferência'}</span></div></button>
        <button onClick={onRestore} className="bg-white border border-[#d6e0ea] rounded-2xl p-4 min-h-[76px] text-left flex items-center gap-3.5 shadow-sm"><div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center"><RotateCcw className="w-5 h-5"/></div><div><strong className="block text-sm">Recuperar backup</strong><span className="text-xs text-[#68778a]">Criar uma cópia recuperada segura</span></div></button>
        <button onClick={onCheckUpdate} className="bg-white border border-[#d6e0ea] rounded-2xl p-4 min-h-[76px] text-left flex items-center gap-3.5 shadow-sm"><div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center"><Smartphone className="w-5 h-5"/></div><div><strong className="block text-sm">Atualização do aplicativo</strong><span className="text-xs text-[#68778a]">Verificar uma nova versão</span></div></button>
        {onMonthlyReport && (
          <button
            id="btn-menu-monthly-report"
            onClick={onMonthlyReport}
            className="bg-white hover:bg-slate-50 text-[#173a5e] border border-blue-200 rounded-2xl p-4 min-h-[76px] text-left flex items-center gap-3.5 shadow-sm transition-all cursor-pointer ring-1 ring-blue-100"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-100/70 text-[#1769aa] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <strong className="block text-sm font-bold text-[#172033]">
                Relatório Mensal (PDF)
              </strong>
              <span className="text-xs text-[#68778a]">
                Balanço com arrecadação e pendências
              </span>
            </div>
          </button>
        )}

        <button
          id="btn-menu-annual"
          onClick={onLoadAnnual}
          className="bg-white hover:bg-slate-50 text-[#173a5e] border border-[#d6e0ea] rounded-2xl p-4 min-h-[76px] text-left flex items-center gap-3.5 shadow-sm transition-all cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#1769aa] flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <strong className="block text-sm font-bold text-[#172033]">Painel anual</strong>
            <span className="text-xs text-[#68778a]">Estatísticas mensais de arrecadação</span>
          </div>
        </button>

        <button
          id="btn-menu-templates"
          onClick={onEditTemplates}
          className="bg-white hover:bg-slate-50 text-[#173a5e] border border-[#d6e0ea] rounded-2xl p-4 min-h-[76px] text-left flex items-center gap-3.5 shadow-sm transition-all cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <strong className="block text-sm font-bold text-[#172033]">Mensagens automáticas</strong>
            <span className="text-xs text-[#68778a]">Personalizar modelos de WhatsApp</span>
          </div>
        </button>

        <button
          id="btn-menu-backup"
          onClick={onBackup}
          className="bg-white hover:bg-slate-50 text-[#173a5e] border border-[#d6e0ea] rounded-2xl p-4 min-h-[76px] text-left flex items-center gap-3.5 shadow-sm transition-all cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <CloudUpload className="w-5 h-5" />
          </div>
          <div>
            <strong className="block text-sm font-bold text-[#172033]">Backup agora</strong>
            <span className="text-xs text-[#68778a]">Criar cópia de segurança na nuvem</span>
          </div>
        </button>

        <button
          id="btn-menu-daily-backup"
          onClick={onDailyBackup}
          className="bg-white hover:bg-slate-50 text-[#173a5e] border border-[#d6e0ea] rounded-2xl p-4 min-h-[76px] text-left flex items-center gap-3.5 shadow-sm transition-all cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <strong className="block text-sm font-bold text-[#172033]">Ativar backup diário</strong>
            <span className="text-xs text-[#68778a]">Agendamento automático às 02:00</span>
          </div>
        </button>

        <button
          id="btn-menu-export-csv"
          onClick={onExportCSV}
          className="bg-white hover:bg-slate-50 text-[#173a5e] border border-[#d6e0ea] rounded-2xl p-4 min-h-[76px] text-left flex items-center gap-3.5 shadow-sm transition-all cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#1e8e5a] flex items-center justify-center shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <strong className="block text-sm font-bold text-[#172033]">Exportar relação</strong>
            <span className="text-xs text-[#68778a]">Planilha CSV (pagos e a pagar)</span>
          </div>
        </button>

        <button
          id="btn-menu-settings"
          onClick={onOpenSettings}
          className="bg-white hover:bg-slate-50 text-[#173a5e] border border-[#d6e0ea] rounded-2xl p-4 min-h-[76px] text-left flex items-center gap-3.5 shadow-sm transition-all cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <strong className="block text-sm font-bold text-[#172033]">Configuração</strong>
            <span className="text-xs text-[#68778a]">Chave PIX, Associação e Conexão</span>
          </div>
        </button>
      </div>
      {appVersion && (
        <p className="text-center text-[10px] font-semibold text-slate-400">
          Cobrador Mobile v{appVersion}
        </p>
      )}
    </section>
  );
};

import React from 'react';
import {
  BarChart3,
  CalendarClock,
  CloudUpload,
  Download,
  Mail,
  Settings
} from 'lucide-react';

interface MaisViewProps {
  onLoadAnnual: () => void;
  onEditTemplates: () => void;
  onBackup: () => void;
  onDailyBackup: () => void;
  onExportCSV: () => void;
  onOpenSettings: () => void;
}

export const MaisView: React.FC<MaisViewProps> = ({
  onLoadAnnual,
  onEditTemplates,
  onBackup,
  onDailyBackup,
  onExportCSV,
  onOpenSettings
}) => {
  return (
    <section id="mais-view" className="space-y-4 pb-24">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <span className="text-xs text-[#68778a]">Conexão Google Apps Script</span>
          </div>
        </button>
      </div>
    </section>
  );
};

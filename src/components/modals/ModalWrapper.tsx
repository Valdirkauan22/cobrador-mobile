import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 bg-[#0d2038]/70 backdrop-blur-[2px] z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        id="modal-sheet"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-xl max-h-[92vh] flex flex-col rounded-t-[22px] sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in slide-in-from-bottom duration-200"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-[#172033] m-0">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar janela"
            className="w-8 h-8 rounded-full bg-[#e8f0f8] hover:bg-[#d8e6f5] text-[#123b66] flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-sm text-[#172033]">
          {children}
        </div>
      </div>
    </div>
  );
};

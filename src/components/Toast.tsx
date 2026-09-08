import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      id="toast"
      className="fixed left-1/2 bottom-20 -translate-x-1/2 bg-[#10243b] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl z-50 shadow-lg border border-white/10 animate-in fade-in slide-in-from-bottom duration-200 pointer-events-none"
    >
      {message}
    </div>
  );
};

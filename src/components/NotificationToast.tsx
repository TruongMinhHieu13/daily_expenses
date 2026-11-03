import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface NotificationToastProps {
  message: string | null;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900/95 text-white shadow-xl shadow-slate-900/20 text-xs font-semibold backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-4 duration-200 border border-slate-700/50 max-w-[90vw]">
      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
      <span className="truncate">{message}</span>
    </div>
  );
};

export default NotificationToast;

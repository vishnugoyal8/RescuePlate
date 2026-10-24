import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useDonations } from '../../context/DonationContext';

export function NotificationToast() {
  const { toast, closeToast } = useDonations();

  if (!toast) return null;

  const isInfo = toast.type === 'info';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className={`p-4 rounded-xl shadow-xl border flex items-start gap-3 backdrop-blur-md ${
        isError 
          ? 'bg-red-50/95 border-red-200 text-red-900' 
          : isInfo
            ? 'bg-sky-50/95 border-sky-200 text-sky-950'
            : 'bg-white/95 border-forest-200 text-stone-900 shadow-forest-900/10'
      }`}>
        <div className="flex-shrink-0 mt-0.5">
          {isError ? (
            <AlertCircle className="w-5 h-5 text-red-600" />
          ) : isInfo ? (
            <Info className="w-5 h-5 text-sky-600" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-forest-600" />
          )}
        </div>
        <div className="flex-1 text-sm font-medium leading-relaxed">
          {toast.message}
        </div>
        <button
          onClick={closeToast}
          className="flex-shrink-0 text-stone-400 hover:text-stone-600 transition-colors p-1"
          aria-label="Dismiss message"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

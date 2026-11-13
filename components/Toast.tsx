'use client';

import React from 'react';
import { HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiX } from 'react-icons/hi';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 flex flex-col space-y-3 max-w-sm sm:max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 ${
            toast.type === 'success'
              ? 'bg-white/95 border-green-200 text-navy-900 shadow-green-500/10'
              : toast.type === 'error'
              ? 'bg-white/95 border-red-200 text-navy-900 shadow-red-500/10'
              : 'bg-white/95 border-primary-200 text-navy-900 shadow-primary-500/10'
          }`}
          role="alert"
        >
          <div className="shrink-0 mr-3 mt-0.5">
            {toast.type === 'success' && <HiCheckCircle className="w-5 h-5 text-green-500" />}
            {toast.type === 'error' && <HiExclamationCircle className="w-5 h-5 text-red-500" />}
            {toast.type === 'info' && <HiInformationCircle className="w-5 h-5 text-primary-500" />}
          </div>
          <div className="flex-1 text-sm font-semibold leading-snug">{toast.message}</div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="shrink-0 ml-3 text-navy-400 hover:text-navy-700 transition-colors p-1"
            aria-label="Close notification"
          >
            <HiX className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

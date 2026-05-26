import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error';

interface ToastMessage {
  type: ToastType;
  content: string;
}

interface ToastContextType {
  triggerMessage: (type: ToastType, content: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState<ToastMessage | null>(null);

  const triggerMessage = (type: ToastType, content: string) => {
    setMessage({ type, content });
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <ToastContext.Provider value={{ triggerMessage }}>
      {children}
      {message && (
        <div className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-xl flex items-center gap-3 z-[9999] animate-in fade-in slide-in-from-bottom-4 ${message.type === 'success' ? 'bg-[#1E5C2F] text-white' : 'bg-red-500 text-white'}`}>
          {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <p className="font-body-md text-sm font-medium">{message.content}</p>
          <button onClick={() => setMessage(null)} className="ml-2 hover:bg-white/20 p-1 rounded-full transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

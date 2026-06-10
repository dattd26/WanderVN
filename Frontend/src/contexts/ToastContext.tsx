import React, { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { gsap } from 'gsap';

type ToastType = 'success' | 'error';

interface ToastMessage {
  id: string;
  type: ToastType;
  content: string;
}

interface ToastContextType {
  triggerMessage: (type: ToastType, content: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Thành phần đại diện cho từng Toast đơn lẻ để quản lý vòng đời và hoạt họa GSAP độc lập
const ToastItem: React.FC<{
  toast: ToastMessage;
  onClose: (id: string) => void;
}> = ({ toast, onClose }) => {
  const elRef = useRef<HTMLDivElement>(null);

  const handleDismiss = useCallback(() => {
    const el = elRef.current;
    if (!el) {
      onClose(toast.id);
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      onClose(toast.id);
    } else {
      // Hoạt họa trượt ngược lại trước khi unmount khỏi DOM
      gsap.to(el, {
        opacity: 0,
        x: 50,
        scale: 0.95,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          onClose(toast.id);
        }
      });
    }
  }, [toast.id, onClose]);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      gsap.set(el, { opacity: 1, x: 0, scale: 1 });
    } else {
      // Hoạt họa trượt nhẹ từ phải qua và scale nhẹ
      gsap.fromTo(el,
        { opacity: 0, x: 50, scale: 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: 0.35, ease: 'power2.out' }
      );
    }

    // Tự động đóng sau 4 giây
    const timer = setTimeout(() => {
      handleDismiss();
    }, 4000);

    return () => clearTimeout(timer);
  }, [handleDismiss]);

  const isSuccess = toast.type === 'success';

  return (
    <div
      ref={elRef}
      className={`flex items-center gap-3 p-4 bg-[#fdf9f4] border border-[#e6e2dd] rounded-[4px] shadow-[0_12px_24px_rgba(28,28,25,0.06)] min-w-[300px] max-w-[420px] transition-all border-l-4 pointer-events-auto ${isSuccess ? 'border-l-[#735c00]' : 'border-l-[#9a2436]'
        }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-5 w-5 text-[#735c00] shrink-0" />
      ) : (
        <AlertCircle className="h-5 w-5 text-[#9a2436] shrink-0" />
      )}
      <p className="text-sm font-medium text-[#1a1a1a] flex-1 leading-normal font-sans">
        {toast.content}
      </p>
      <button
        onClick={handleDismiss}
        className="text-[#8c8c8c] hover:text-[#1a1a1a] p-1 hover:bg-[#e6e2dd]/40 rounded transition-colors duration-200 shrink-0"
        aria-label="Đóng thông báo"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const triggerMessage = (type: ToastType, content: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, content }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ triggerMessage }}>
      {children}
      {/* Container xếp chồng thông báo từ dưới lên */}
      <div className="fixed bottom-6 right-6 flex flex-col-reverse gap-3 z-[9999] pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};


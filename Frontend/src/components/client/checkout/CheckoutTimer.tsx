import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, RefreshCw } from 'lucide-react';

interface CheckoutTimerProps {
  durationMinutes?: number;
  onExpire: () => void;
  label?: string;
}

export const CheckoutTimer: React.FC<CheckoutTimerProps> = ({
  durationMinutes = 15,
  onExpire,
  label = 'Giá vé được giữ trong',
}) => {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const isExpired = secondsLeft <= 0;

  useEffect(() => {
    if (secondsLeft <= 0) {
      const t = setTimeout(() => {
        onExpire();
      }, 0);
      return () => clearTimeout(t);
    }
  }, [secondsLeft, onExpire]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  const isCritical = secondsLeft <= 120;
  const isWarning = secondsLeft <= 300;

  if (isExpired) {
    return (
      <div className="flex items-center gap-3 px-5 py-3.5 bg-red-50 border border-red-200 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
        <p className="text-sm text-red-700 font-medium flex-1">
          Phiên giữ giá đã hết hạn. Vui lòng tìm kiếm lại để cập nhật giá vé mới nhất.
        </p>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-red-700 hover:text-red-900 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Tìm lại
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3.5 border rounded-lg transition-colors duration-500 ${
        isCritical
          ? 'bg-red-50 border-red-200'
          : isWarning
          ? 'bg-amber-50 border-amber-200'
          : 'bg-surface-container-lowest border-outline-variant/30'
      }`}
    >
      <Clock
        className={`h-4 w-4 shrink-0 transition-colors ${
          isCritical ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-secondary'
        }`}
      />
      <p
        className={`text-sm font-medium flex-1 transition-colors ${
          isCritical ? 'text-red-700' : isWarning ? 'text-amber-700' : 'text-on-surface-variant'
        }`}
      >
        {label}
      </p>
      <span
        className={`font-mono text-base font-bold tabular-nums transition-colors ${
          isCritical ? 'text-red-700' : isWarning ? 'text-amber-700' : 'text-primary'
        }`}
      >
        {pad(minutes)}:{pad(seconds)}
      </span>
    </div>
  );
};

export default CheckoutTimer;

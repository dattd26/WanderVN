import React, { useState, useEffect } from 'react';

interface PasswordStrengthBarProps {
  password?: string;
}

export const PasswordStrengthBar: React.FC<PasswordStrengthBarProps> = ({ password }) => {
  const [strength, setStrength] = useState({ score: 0, label: '', color: '' });

  useEffect(() => {
    if (!password) {
      setStrength({ score: 0, label: '', color: '' });
      return;
    }

    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    let label = 'Yếu';
    let color = 'bg-red-500';

    if (score === 2) {
      label = 'Trung bình';
      color = 'bg-yellow-500';
    } else if (score >= 3) {
      label = 'Mạnh';
      color = 'bg-green-600';
    }

    setStrength({ score, label, color });
  }, [password]);

  if (!password) return null;

  return (
    <div className="mt-2 animate-fade-in">
      <div className="flex justify-between items-center mb-1">
        <span className="font-caption text-[11px] text-on-surface-variant">
          Độ mạnh: <strong className="font-semibold">{strength.label}</strong>
        </span>
      </div>
      <div className="w-full bg-surface-variant/40 h-1 rounded-full overflow-hidden flex gap-0.5">
        <div className={`h-full transition-all duration-500 ${strength.color} ${strength.score >= 1 ? 'w-1/3' : 'w-0'}`}></div>
        <div className={`h-full transition-all duration-500 ${strength.color} ${strength.score >= 2 ? 'w-1/3' : 'w-0'}`}></div>
        <div className={`h-full transition-all duration-500 ${strength.color} ${strength.score >= 3 ? 'w-1/3' : 'w-0'}`}></div>
      </div>
    </div>
  );
};

export default PasswordStrengthBar;

import React from 'react';

interface ContactFormProps {
  email: string;
  phone: string;
  onChange: (field: 'email' | 'phone', value: string) => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ email, phone, onChange }) => {
  return (
    <section className="border border-outline-variant/30 rounded-lg bg-surface-container-lowest overflow-hidden">
      <div className="px-6 py-5 border-b border-outline-variant/20 flex items-center gap-4">
        <span className="text-sm font-semibold text-outline tabular-nums">01</span>
        <h2 className="text-base font-semibold text-primary tracking-tight">
          Thông Tin Người Đặt
        </h2>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
            Địa chỉ Email nhận xác nhận
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="email@example.com"
            className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-b-primary transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
            Số điện thoại liên hệ
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="+84 901 234 567"
            className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-b-primary transition-colors"
          />
        </div>
      </div>
    </section>
  );
};

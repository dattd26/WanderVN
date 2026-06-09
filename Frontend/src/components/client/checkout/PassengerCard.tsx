import React, { useState, useMemo } from 'react';
import { Info, Copy, UserCheck } from 'lucide-react';
import { useFlightCheckout, type CheckoutPassenger } from './FlightCheckoutContext';

const SEAT_PREFERENCES = ['Tiêu chuẩn (Hãng quyết định)', 'Cửa sổ (Window)', 'Lối đi (Aisle)'];
const MEAL_PREFERENCES = ['Mặc định', 'Chay (Vegetarian)', 'Đạo Hồi (Halal)', 'Thuần chay (Vegan)'];

interface PassengerCardProps {
  index: number;
  passenger: CheckoutPassenger;
}

export const PassengerCard: React.FC<PassengerCardProps> = ({ index, passenger }) => {
  const { updatePassenger, contactForm } = useFlightCheckout();
  const [showSavedSelector, setShowSavedSelector] = useState(false);

  // Đọc danh sách hành khách đã lưu từ LocalStorage
  const savedPassengers = useMemo(() => {
    try {
      const saved = localStorage.getItem('saved_passengers');
      if (saved) {
        const parsed = JSON.parse(saved) as CheckoutPassenger[];
        // Lọc những hành khách cùng loại (adult/child/infant)
        return parsed.filter(p => p.type === passenger.type);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  }, [passenger.type]);

  const handleCopyContact = () => {
    updatePassenger(index, {
      email: contactForm.email,
      phoneNumber: contactForm.phone,
    });
  };

  const handleSelectSaved = (savedPax: CheckoutPassenger) => {
    updatePassenger(index, {
      title: savedPax.title,
      familyName: savedPax.familyName.toUpperCase(),
      givenName: savedPax.givenName.toUpperCase(),
      bornOn: savedPax.bornOn,
      gender: savedPax.gender,
      passportNumber: savedPax.passportNumber.toUpperCase(),
      seatPreference: savedPax.seatPreference || SEAT_PREFERENCES[0],
      mealPreference: savedPax.mealPreference || MEAL_PREFERENCES[0],
    });
    setShowSavedSelector(false);
  };

  const getPassengerTypeLabel = () => {
    switch (passenger.type) {
      case 'adult':
        return 'Người lớn';
      case 'child':
        return 'Trẻ em (2 - 12 tuổi)';
      case 'infant':
        return 'Em bé (< 2 tuổi)';
      default:
        return 'Hành khách';
    }
  };

  return (
    <div className="p-6 border border-outline-variant/20 rounded-xl bg-surface-container-low/30 space-y-6">
      {/* Header hành khách */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/15">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary">{index + 1}</span>
          </div>
          <span className="text-sm font-semibold text-on-surface">
            Hành khách {getPassengerTypeLabel()}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Nút copy thông tin liên hệ (Chỉ khả dụng cho người lớn đầu tiên) */}
          {passenger.type === 'adult' && index === 0 && (
            <button
              type="button"
              onClick={handleCopyContact}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/30 text-[10px] font-semibold text-on-surface-variant hover:text-primary hover:bg-white/5 transition-all uppercase tracking-wider"
            >
              <Copy className="w-3 h-3" />
              Sao chép thông tin liên hệ
            </button>
          )}

          {/* Chọn nhanh từ danh sách đã lưu */}
          {savedPassengers.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSavedSelector(!showSavedSelector)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/30 text-[10px] font-semibold text-on-surface-variant hover:text-primary hover:bg-white/5 transition-all uppercase tracking-wider"
              >
                <UserCheck className="w-3 h-3" />
                Hành khách đã lưu
              </button>

              {showSavedSelector && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#161616] border border-white/10 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] z-50 py-1">
                  <div className="px-3 py-2 text-[10px] font-semibold text-white/40 border-b border-white/5 uppercase tracking-wider">
                    Chọn nhanh khách hàng
                  </div>
                  {savedPassengers.map((saved, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectSaved(saved)}
                      className="px-3 py-2 cursor-pointer hover:bg-white/5 text-xs text-white transition-colors"
                    >
                      <div className="font-semibold">{saved.familyName} {saved.givenName}</div>
                      <div className="text-[10px] text-white/40">CCCD/Hộ chiếu: {saved.passportNumber}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Grid thông tin chính */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
            Danh xưng
          </label>
          <select
            value={passenger.title}
            onChange={(e) => updatePassenger(index, { title: e.target.value })}
            className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm text-on-surface focus:outline-none focus:border-b-primary transition-colors cursor-pointer"
          >
            <option value="mr">Ông (Mr.)</option>
            <option value="ms">Bà (Ms.)</option>
            <option value="mrs">Cô/Chị (Mrs.)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
            Giới tính
          </label>
          <select
            value={passenger.gender}
            onChange={(e) => updatePassenger(index, { gender: e.target.value })}
            className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm text-on-surface focus:outline-none focus:border-b-primary transition-colors cursor-pointer"
          >
            <option value="m">Nam (Male)</option>
            <option value="f">Nữ (Female)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
            Họ (Family Name)
          </label>
          <input
            type="text"
            required
            value={passenger.familyName}
            onChange={(e) => updatePassenger(index, { familyName: e.target.value.toUpperCase() })}
            placeholder="VD: NGUYEN"
            className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm uppercase font-mono text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-b-primary transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
            Tên đệm & Tên (Given Name)
          </label>
          <input
            type="text"
            required
            value={passenger.givenName}
            onChange={(e) => updatePassenger(index, { givenName: e.target.value.toUpperCase() })}
            placeholder="VD: VAN A"
            className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm uppercase font-mono text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-b-primary transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
            Ngày sinh
          </label>
          <input
            type="date"
            required
            value={passenger.bornOn}
            onChange={(e) => updatePassenger(index, { bornOn: e.target.value })}
            className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm text-on-surface focus:outline-none focus:border-b-primary transition-colors [color-scheme:dark]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
            Số Hộ Chiếu / CCCD
          </label>
          <input
            type="text"
            required
            value={passenger.passportNumber}
            onChange={(e) => updatePassenger(index, { passportNumber: e.target.value.toUpperCase() })}
            placeholder="VD: B1234567"
            className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm uppercase font-mono text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-b-primary transition-colors"
          />
        </div>
      </div>

      {/* Lựa chọn ưu tiên dịch vụ (Không bắt buộc với bé nằm nôi) */}
      {passenger.type !== 'infant' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-outline-variant/15">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
              Ưu tiên chỗ ngồi
            </label>
            <select
              value={passenger.seatPreference}
              onChange={(e) => updatePassenger(index, { seatPreference: e.target.value })}
              className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm text-on-surface focus:outline-none focus:border-b-primary transition-colors cursor-pointer"
            >
              {SEAT_PREFERENCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
              Suất ăn trên máy bay
            </label>
            <select
              value={passenger.mealPreference}
              onChange={(e) => updatePassenger(index, { mealPreference: e.target.value })}
              className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm text-on-surface focus:outline-none focus:border-b-primary transition-colors cursor-pointer"
            >
              {MEAL_PREFERENCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Ghi chú pháp lý */}
      <div className="flex items-start gap-2.5 p-3 bg-blue-50/50 border border-blue-200/30 rounded-lg">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-[10px] text-blue-700 leading-relaxed">
          Tên hành khách phải khớp chính xác với giấy tờ tùy thân (không dấu, viết hoa). Hệ thống không chịu trách nhiệm nếu thông tin bị sai lệch.
        </p>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { X, Landmark, RefreshCw, Search, Check, ChevronDown } from 'lucide-react';
import partnerService from '../../services/partner/partnerService';
import type { UpdateBankInfoPayload } from '../../types';

interface BankItem {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
}

interface UpdateBankInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialBankName?: string | null;
  initialBankAccountNumber?: string | null;
  initialBankAccountName?: string | null;
  initialBankBin?: string | null;
}

export const UpdateBankInfoModal: React.FC<UpdateBankInfoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialBankName,
  initialBankAccountNumber,
  initialBankAccountName,
  initialBankBin,
}) => {
  const [bankName, setBankName] = useState(initialBankName || '');
  const [bankAccountNumber, setBankAccountNumber] = useState(initialBankAccountNumber || '');
  const [bankAccountName, setBankAccountName] = useState(initialBankAccountName || '');
  const [bankBin, setBankBin] = useState(initialBankBin || '');

  const [banks, setBanks] = useState<BankItem[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch VietQR Banks List
  useEffect(() => {
    const fetchBanks = async () => {
      if (!isOpen) return;
      setLoadingBanks(true);
      try {
        const response = await fetch('https://api.vietqr.io/v2/banks');
        const json = await response.json();
        if (json && json.code === '00') {
          setBanks(json.data);
        } else {
          console.error('Failed to get bank list:', json.desc);
        }
      } catch (err) {
        console.error('Failed to fetch bank list:', err);
      } finally {
        setLoadingBanks(false);
      }
    };

    fetchBanks();
  }, [isOpen]);

  // Không cần useEffect đồng bộ dữ liệu vì component được mount/unmount động ở component cha

  if (!isOpen) return null;

  const filteredBanks = banks.filter(
    (bank) =>
      bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectBank = (bank: BankItem) => {
    // Lưu shortName làm bankName hiển thị (ví dụ: Vietcombank, Techcombank...)
    setBankName(bank.shortName);
    setBankBin(bank.bin);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bankName.trim() || !bankBin.trim()) {
      setError('Vui lòng chọn ngân hàng liên kết từ danh sách.');
      return;
    }
    if (!bankAccountNumber.trim()) {
      setError('Số tài khoản không được để trống.');
      return;
    }
    if (!bankAccountName.trim()) {
      setError('Tên chủ tài khoản không được để trống.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: UpdateBankInfoPayload = {
        bankName: bankName.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
        bankAccountName: bankAccountName.trim().toUpperCase(),
        bankBin: bankBin.trim(),
      };

      await partnerService.updateBankInfo(payload);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Lỗi khi cập nhật tài khoản ngân hàng:', err);
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại sau.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1C1C19]/60 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#FAF6F0] w-full max-w-[480px] rounded-2xl shadow-2xl border border-[#E6E2DD] overflow-visible p-6 relative animate-in fade-in zoom-in duration-300">

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute top-4 right-4 text-[#444748] hover:text-[#1C1C19] p-1.5 rounded-full hover:bg-[#F1EDE8] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#E6E2DD]">
          <div className="p-2 rounded-lg bg-[#735C00]/10 text-[#735C00]">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display-lg text-lg font-bold text-[#1C1C19]">
              Cấu hình Tài khoản Ngân hàng
            </h3>
            <p className="text-xs text-[#444748] mt-0.5">
              Thiết lập thông tin nhận thanh toán doanh thu đối soát.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs leading-relaxed">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Ngân Hàng Selection (Searchable Combobox) */}
          <div className="space-y-1.5 relative" ref={dropdownRef}>
            <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold">
              Ngân hàng liên kết *
            </label>

            <button
              type="button"
              onClick={() => !submitting && setIsDropdownOpen(!isDropdownOpen)}
              disabled={submitting}
              className="w-full bg-[#F1EDE8] border border-[#E6E2DD] rounded-lg px-3.5 py-2.5 text-xs md:text-sm text-[#1C1C19] flex justify-between items-center focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-colors text-left"
            >
              <span className={bankName ? 'text-[#1C1C19] font-medium' : 'text-[#8E8F8F]'}>
                {bankName ? `${bankName} (${bankBin})` : 'Chọn ngân hàng từ danh sách...'}
              </span>
              <ChevronDown className="h-4 w-4 text-[#444748]" />
            </button>

            {/* Dropdown Container */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 mt-1.5 bg-[#FAF6F0] border border-[#E6E2DD] rounded-xl shadow-xl z-[210] overflow-hidden max-h-[300px] flex flex-col">
                {/* Search Header */}
                <div className="p-2 border-b border-[#E6E2DD] bg-[#F1EDE8]/50 flex items-center gap-2">
                  <Search className="h-4 w-4 text-[#444748] shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm ngân hàng (tên, mã, shortName)..."
                    className="w-full bg-transparent border-none text-xs outline-none focus:ring-0 text-[#1C1C19] py-1"
                    autoFocus
                  />
                </div>

                {/* Bank Items List */}
                <div className="overflow-y-auto divide-y divide-[#E6E2DD]/30 max-h-[220px]">
                  {loadingBanks ? (
                    <div className="p-4 text-center text-xs text-[#444748] flex items-center justify-center gap-2">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#735C00]" />
                      Đang tải danh sách ngân hàng...
                    </div>
                  ) : filteredBanks.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#8E8F8F]">
                      Không tìm thấy ngân hàng nào.
                    </div>
                  ) : (
                    filteredBanks.map((bank) => {
                      const isSelected = bank.bin === bankBin;
                      return (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => handleSelectBank(bank)}
                          className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between hover:bg-[#F1EDE8] transition-colors ${isSelected ? 'bg-[#735C00]/5 text-[#735C00] font-bold' : 'text-[#1C1C19]'
                            }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {bank.logo ? (
                              <img
                                src={bank.logo}
                                alt={bank.shortName}
                                className="h-6 w-12 object-contain bg-white rounded p-0.5 border border-[#E6E2DD]/50 shrink-0"
                              />
                            ) : (
                              <div className="h-6 w-12 bg-white rounded border border-[#E6E2DD]/50 flex items-center justify-center text-[8px] text-gray-400 font-bold uppercase shrink-0">
                                {bank.code}
                              </div>
                            )}
                            <div className="truncate">
                              <p className="font-bold truncate text-[#1C1C19]">{bank.shortName}</p>
                              <p className="text-[10px] text-[#444748] truncate">{bank.name}</p>
                            </div>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-[#735C00] shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold">
              Số tài khoản *
            </label>
            <input
              type="text"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              placeholder="Nhập số tài khoản ngân hàng..."
              disabled={submitting}
              className="w-full bg-[#F1EDE8] border border-[#E6E2DD] rounded-lg px-3.5 py-2.5 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-colors font-mono tracking-wider"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold">
              Tên chủ tài khoản *
            </label>
            <input
              type="text"
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value)}
              placeholder="Ví dụ: NGUYEN VAN A"
              disabled={submitting}
              className="w-full bg-[#F1EDE8] border border-[#E6E2DD] rounded-lg px-3.5 py-2.5 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-colors font-mono uppercase"
              required
            />
          </div>

          <div className="pt-4 border-t border-[#E6E2DD] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-[#E6E2DD] rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#F1EDE8] transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#1C1C19] hover:bg-[#735C00] text-[#FAF6F0] rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {submitting && <RefreshCw className="h-3 w-3 animate-spin text-[#FAF6F0]" />}
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudCheck, Hotel } from 'lucide-react';

interface PartnerHeaderProps {
  /** Nhãn trạng thái lưu nháp (vd: "Đã lưu nháp lúc 10:45") — ẩn nếu để trống */
  draftStatus?: string;
  /** Đường dẫn quay về khi bấm "Lưu & Thoát". Mặc định: '/' */
  exitTo?: string;
}

/**
 * Header tối giản cho luồng onboarding partner (không có menu điều hướng chính).
 * Lấy cảm hứng từ giao diện Stitch nhưng đồng bộ light theme "Warm Paper" của WanderVN.
 */
export const PartnerHeader: React.FC<PartnerHeaderProps> = ({
  draftStatus,
  exitTo = '/',
}) => {
  const navigate = useNavigate();

  return (
    <header className="w-full h-16 border-b border-outline-variant/40 flex items-center justify-between px-margin-mobile md:px-margin-desktop bg-background/95 backdrop-blur-md sticky top-0 z-50">
      {/* Thương hiệu WanderVN Partner */}
      <button
        onClick={() => navigate('/partner')}
        className="flex items-center gap-3 group"
      >
        <div className="bg-primary text-on-primary p-2 rounded-lg group-hover:bg-secondary transition-colors duration-300">
          <Hotel className="h-5 w-5" />
        </div>
        <div className="flex flex-col text-left leading-tight">
          <span className="font-display-lg text-headline-md text-primary tracking-tight">
            WanderVN
          </span>
          <span className="font-label-md text-[10px] uppercase tracking-[0.2em] text-secondary">
            Partner Portal
          </span>
        </div>
      </button>

      {/* Trạng thái lưu nháp + nút thoát */}
      <div className="flex items-center gap-6">
        {draftStatus && (
          <span className="hidden sm:flex items-center gap-2 font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant">
            <CloudCheck className="h-4 w-4 text-secondary" />
            {draftStatus}
          </span>
        )}
        <button
          onClick={() => navigate(exitTo)}
          className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors duration-200"
        >
          Lưu &amp; Thoát
        </button>
      </div>
    </header>
  );
};

export default PartnerHeader;

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-surface py-section-gap border-t border-on-primary-container/20 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-start px-margin-mobile md:px-margin-desktop gap-gutter max-w-container-max mx-auto opacity-90 hover:opacity-100 transition-opacity duration-300">
        
        {/* Brand Column */}
        <div className="mb-12 md:mb-0 max-w-sm">
          <h2 className="font-display-lg text-headline-md text-surface-container-low mb-4 tracking-tighter">
            WanderVN
          </h2>
          <p className="font-body-md text-body-md text-surface-variant/70 leading-relaxed">
            Kiến tạo những hành trình lưu trú tinh hoa, đưa bạn chạm đến vẻ đẹp di sản và chiều sâu văn hóa Việt Nam.
          </p>
        </div>

        {/* Link Columns */}
        <div className="flex flex-col sm:flex-row gap-12 md:gap-24">
          <div className="flex flex-col gap-4">
            <span className="font-label-md text-label-md uppercase tracking-wider text-secondary-fixed">Tìm hiểu thêm</span>
            <ul className="space-y-3">
              <li>
                <a href="#" className="font-body-md text-body-md text-surface-variant/70 hover:text-secondary-fixed-dim transition-colors duration-200">
                  Câu chuyện thương hiệu
                </a>
              </li>
              <li>
                <a href="#" className="font-body-md text-body-md text-surface-variant/70 hover:text-secondary-fixed-dim transition-colors duration-200">
                  Bộ sưu tập phòng nghỉ
                </a>
              </li>
              <li>
                <a href="#" className="font-body-md text-body-md text-surface-variant/70 hover:text-secondary-fixed-dim transition-colors duration-200">
                  Phát triển bền vững
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <span className="font-label-md text-label-md uppercase tracking-wider text-secondary-fixed">Hỗ trợ & Pháp lý</span>
            <ul className="space-y-3">
              <li>
                <a href="/booking-lookup" className="font-body-md text-body-md text-surface-variant/70 hover:text-secondary-fixed-dim transition-colors duration-200">
                  Tra cứu Booking
                </a>
              </li>
              <li>
                <a href="#" className="font-body-md text-body-md text-surface-variant/70 hover:text-secondary-fixed-dim transition-colors duration-200">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="font-body-md text-body-md text-surface-variant/70 hover:text-secondary-fixed-dim transition-colors duration-200">
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a href="#" className="font-body-md text-body-md text-surface-variant/70 hover:text-secondary-fixed-dim transition-colors duration-200">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mt-16 pt-8 border-t border-surface/10">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="font-body-md text-body-md text-surface-variant/50">
            © 2026 WanderVN. Được thiết kế dành cho các Lữ khách tinh hoa.
          </p>
          <div className="flex gap-6 text-surface-variant/40 font-caption text-caption">
            <span>Hà Giang</span>
            <span>Hội An</span>
            <span>Đà Nẵng</span>
            <span>Phú Quốc</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;

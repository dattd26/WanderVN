import React, { useState, useEffect, useRef } from 'react';
import { HotelSearchForm } from '../HotelSearchForm';

import halongImg from '../../../assets/images/halongbay-hero.jpg';
import hoianImg from '../../../assets/images/hoian-hero.jpg';
import ninhbinhImg from '../../../assets/images/ninhbinh-hero.jpg';
import sapaImg from '../../../assets/images/sapa-hero.jpeg';

// Dữ liệu 4 điểm đến di sản Việt Nam chất lượng cao siêu sắc nét (w=1920)
const DESTINATIONS = [
  {
    id: 1,
    locationId: 1,
    name: 'Hạ Long',
    subtitle: 'Vịnh ngọc biển Đông',
    coords: '20.9101° N · Vịnh Đá Vôi',
    image: halongImg,
  },
  {
    id: 2,
    locationId: 102,
    name: 'Hội An',
    subtitle: 'Thành phố Đèn lồng Thế giới',
    coords: '15.8801° N · Phố Cổ Đèn Lồng',
    image: hoianImg,
  },
  {
    id: 3,
    locationId: 3,
    name: 'Ninh Bình',
    subtitle: 'Vùng đất Đá Vàng mùa lúa',
    coords: '20.2543° N · Đồng Lúa Vàng',
    image: ninhbinhImg,
  },
  {
    id: 4,
    locationId: 4,
    name: 'Sa Pa',
    subtitle: 'Bản mây Fansipan huyền bí',
    coords: '22.3364° N · Bản Mây Sương Mù',
    image: sapaImg,
  },
] as const;

// Hằng số điều phối animation timeline (ms)
const CYCLE_MS = 10000;     // Kéo dài một vòng đầy đủ lên 10 giây thong thả
const FLIGHT_START = 1200;  // Máy bay bắt đầu xuất hiện
const FLIGHT_DUR = 3800;    // Giảm tốc độ bay (tăng thời gian bay lên 3.8 giây)
// const TEXT_SWAP_AT = 4600;  // Thời điểm đổi text destination

// --- Toán học Quadratic Bezier ---
// Cấu hình đường bay dâng thẳng từ đáy (105%) lên đỉnh (-15%) uốn lượn nhẹ hình chữ S
const BZ = { x0: 38, y0: 105, cx: 62, cy: 45, x1: 42, y1: -15 };

function bezierPoint(t: number) {
  const mt = 1 - t;
  return {
    x: mt * mt * BZ.x0 + 2 * mt * t * BZ.cx + t * t * BZ.x1,
    y: mt * mt * BZ.y0 + 2 * mt * t * BZ.cy + t * t * BZ.y1,
  };
}

function bezierAngleDeg(t: number) {
  const mt = 1 - t;
  const dx = 2 * mt * (BZ.cx - BZ.x0) + 2 * t * (BZ.x1 - BZ.cx);
  const dy = 2 * mt * (BZ.cy - BZ.y0) + 2 * t * (BZ.y1 - BZ.cy);
  // Vì đầu máy bay trong plane.svg hướng thẳng đứng lên trên (0 độ),
  // ta cộng thêm 90 độ để bù đắp góc lệch vector toán học của atan2
  return Math.atan2(dy, dx) * (180 / Math.PI) + 90;
}

// Tính độ dài đường cong Bézier để cấu hình strokeDasharray chuẩn xác
function approximateBezierLength(steps = 60): number {
  let len = 0;
  let prev = bezierPoint(0);
  for (let i = 1; i <= steps; i++) {
    const curr = bezierPoint(i / steps);
    len += Math.hypot(curr.x - prev.x, curr.y - prev.y);
    prev = curr;
  }
  return len;
}
const PATH_LENGTH = approximateBezierLength();
const SVG_PATH_D = `M ${BZ.x0} ${BZ.y0} Q ${BZ.cx} ${BZ.cy} ${BZ.x1} ${BZ.y1}`;

export const JourneyRevealHero: React.FC = () => {
  // Chỉ lưu trữ duy nhất 1 index chỉ số ảnh đang hiển thị
  // Giúp giảm số lượng phần tử img trong DOM xuống tối đa 2 (1 ảnh hiện tại, 1 ảnh kế tiếp)
  const [activeIndex, setActiveIndex] = useState(0);
  const [revealIndex, setRevealIndex] = useState(1); // Chỉ số ảnh của lớp Reveal Layer quét phía trên

  // Các states hỗ trợ text transition
  const [textIndex, setTextIndex] = useState(0);
  const [textVisible, setTextVisible] = useState(true);
  const [textKey, setTextKey] = useState(0);

  // DOM Refs phục vụ thay đổi trực tiếp (bypass React render giúp đạt 60fps mượt mà)
  const baseImgRef = useRef<HTMLImageElement>(null);
  const revealLayerRef = useRef<HTMLDivElement>(null);
  const revealImgRef = useRef<HTMLImageElement>(null);
  const airplaneRef = useRef<HTMLDivElement>(null);
  const flightLineRef = useRef<SVGPathElement>(null);
  const flightLineGlowRef = useRef<SVGPathElement>(null); // Ref đường bay phát sáng mờ phía dưới

  const rafRef = useRef<number>(0);
  const cycleStartRef = useRef<number | null>(null);
  const textSwappedRef = useRef(false);
  const swappedInCycleRef = useRef(false); // Flag kiểm soát hoán đổi ảnh tĩnh trong chu kỳ

  // Lấy ra ảnh hiện tại và ảnh kế tiếp trong chu kỳ
  const nextIndex = (activeIndex + 1) % DESTINATIONS.length;
  const currentDest = DESTINATIONS[activeIndex];
  const nextDest = DESTINATIONS[revealIndex];

  // Animation Loop chạy liên tục qua requestAnimationFrame (sử dụng Ref để tránh lặp render hoặc lỗi closure/dependency)
  const tickRef = useRef<(ts: number) => void>(() => { });

  useEffect(() => {
    tickRef.current = (ts: number) => {
      if (cycleStartRef.current === null) {
        cycleStartRef.current = ts;
        textSwappedRef.current = false;
        swappedInCycleRef.current = false;
      }

      const elapsed = ts - cycleStartRef.current;

      // === ĐỒNG BỘ HÓA KEN BURNS CẢ HAI LAYER (JS-DRIVEN TO AVOID SIZE JUMPS) ===
      // Zoom out từ 1.08 nhẹ nhàng về 1.03 trong suốt chu kỳ 9s để tạo chiều sâu
      const scale = 1.08 - (elapsed / CYCLE_MS) * 0.05;
      if (baseImgRef.current) {
        baseImgRef.current.style.transform = `scale3d(${scale}, ${scale}, 1)`;
      }
      if (revealImgRef.current) {
        revealImgRef.current.style.transform = `scale3d(${scale}, ${scale}, 1)`;
      }

      // === GIAI ĐOẠN BAY (FLIGHT PHASE) ===
      const inFlight = elapsed >= FLIGHT_START && elapsed < FLIGHT_START + FLIGHT_DUR;
      const flightT = inFlight
        ? Math.min((elapsed - FLIGHT_START) / FLIGHT_DUR, 1)
        : elapsed >= FLIGHT_START + FLIGHT_DUR ? 1 : 0;

      // 1. Cập nhật đường bay SVG (Stroke drawing - Đồng bộ cả nét vẽ và vệt phát sáng mờ)
      if (flightLineRef.current) {
        if (inFlight) {
          const drawn = PATH_LENGTH * flightT;
          flightLineRef.current.style.strokeDashoffset = String(PATH_LENGTH - drawn);
          flightLineRef.current.style.opacity = '0.9';

          if (flightLineGlowRef.current) {
            flightLineGlowRef.current.style.strokeDashoffset = String(PATH_LENGTH - drawn);
            flightLineGlowRef.current.style.opacity = '0.55';
          }
        } else if (elapsed < FLIGHT_START) {
          flightLineRef.current.style.opacity = '0';
          flightLineRef.current.style.strokeDashoffset = String(PATH_LENGTH);

          if (flightLineGlowRef.current) {
            flightLineGlowRef.current.style.opacity = '0';
            flightLineGlowRef.current.style.strokeDashoffset = String(PATH_LENGTH);
          }
        }
      }

      // 2. Cập nhật Máy bay & Lớp phủ Reveal Layer
      if (airplaneRef.current && revealLayerRef.current) {
        if (elapsed >= FLIGHT_START && elapsed < FLIGHT_START + FLIGHT_DUR) {
          const pos = bezierPoint(flightT);
          const angle = bezierAngleDeg(flightT);

          // Fade in/out máy bay ở hai đầu mượt mà
          const fadeIn = Math.min(flightT / 0.08, 1);
          const fadeOut = flightT > 0.92 ? Math.max(0, (1 - flightT) / 0.08) : 1;

          // Sử dụng translate3d thúc đẩy GPU rendering, tránh lag tuyệt đối khi scroll
          airplaneRef.current.style.opacity = String(fadeIn * fadeOut);
          airplaneRef.current.style.transform = `translate3d(${pos.x}vw, ${pos.y}vh, 0) rotate(${angle}deg)`;

          // Tính toán tỷ lệ phần trăm dâng lên từ dưới đáy màn hình
          // Do pos.y tính từ đỉnh (0) xuống đáy (100), nên phần trăm từ đáy lên sẽ bằng 100 - pos.y
          const percent = 100 - pos.y;

          // Cập nhật mask linear-gradient kéo rèm từ dưới lên mượt mà theo máy bay
          const maskStr = `linear-gradient(to top, white 0%, white ${percent - 12}%, transparent ${percent + 8}%)`;
          revealLayerRef.current.style.opacity = '1';
          revealLayerRef.current.style.maskImage = maskStr;
          revealLayerRef.current.style.webkitMaskImage = maskStr;
        } else if (elapsed < FLIGHT_START) {
          airplaneRef.current.style.opacity = '0';
          revealLayerRef.current.style.opacity = '0';
        }
      }

      // === GIAI ĐOẠN ĐỔI TEXT (TEXT TRANSITION) ===
      // Đổi chữ mượt mà ngay giữa lúc máy bay đang bay (khoảng t=0.5) để tạo sự nhịp điệu
      const textSwapTarget = FLIGHT_START + (FLIGHT_DUR * 0.45);
      if (elapsed >= textSwapTarget && !textSwappedRef.current) {
        textSwappedRef.current = true;
        setTextVisible(false);
        setTimeout(() => {
          setTextIndex(nextIndex);
          setTextKey(k => k + 1);
          setTextVisible(true);
        }, 350);
      }

      // === PIXEL-PERFECT SWAP NGAY KHI MÁY BAY BAY XONG (KẾT THÚC QUÉT) ===
      // Thay vì đợi đến 9.0s, ta swap ảnh tĩnh dưới ngay khi máy bay bay hết màn hình (mốc 4.0s)
      const flightEnd = FLIGHT_START + FLIGHT_DUR;
      if (elapsed >= flightEnd && !swappedInCycleRef.current) {
        swappedInCycleRef.current = true;

        // 1. Đồng bộ hóa ảnh nền chính ở lớp dưới thành ảnh mới
        setActiveIndex(nextIndex);

        // 2. Trì hoãn 500ms để trình duyệt có đủ thời gian âm thầm giải nén (decoding) ảnh mới dưới nền
        // Do cả hai ảnh A & B đều chạy chung công thức scale động, khi ẩn Reveal Layer đi sẽ trùng khớp 100% không vết gợn!
        setTimeout(() => {
          if (revealLayerRef.current) {
            revealLayerRef.current.style.opacity = '0';
            revealLayerRef.current.style.maskImage = 'none';
            revealLayerRef.current.style.webkitMaskImage = 'none';
          }
          if (airplaneRef.current) {
            airplaneRef.current.style.opacity = '0';
          }
          if (flightLineRef.current) {
            flightLineRef.current.style.opacity = '0';
            flightLineRef.current.style.strokeDashoffset = String(PATH_LENGTH);
          }
          if (flightLineGlowRef.current) {
            flightLineGlowRef.current.style.opacity = '0';
            flightLineGlowRef.current.style.strokeDashoffset = String(PATH_LENGTH);
          }
        }, 500);
      }

      // === KẾT THÚC CHU KỲ (BẮT ĐẦU CHU KỲ MỚI SAU KHOẢNG NGHỈ TĨNH) ===
      if (elapsed >= CYCLE_MS) {
        setRevealIndex((activeIndex + 1) % DESTINATIONS.length);
        cycleStartRef.current = null;
      }

      rafRef.current = requestAnimationFrame((timestamp) => tickRef.current(timestamp));
    };
  });

  useEffect(() => {
    rafRef.current = requestAnimationFrame((timestamp) => tickRef.current(timestamp));
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const dest = DESTINATIONS[textIndex];
  const slideNum = String(textIndex + 1).padStart(2, '0');
  const totalNum = String(DESTINATIONS.length).padStart(2, '0');

  return (
    <header className="relative min-h-[90vh] md:h-screen w-full flex items-center justify-center overflow-visible">

      {/* ── Layer 1: Background chính phía dưới (Tĩnh + Ken Burns, chỉ dùng 1 thẻ img) ── */}
      <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
        <img
          ref={baseImgRef}
          src={currentDest.image}
          alt={currentDest.name}
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ willChange: 'transform', transform: 'scale3d(1.08, 1.08, 1)' }}
        />
        {/* Lớp phủ màu di sản tối ấm áp */}
        <div
          className="absolute inset-0 z-[1]"
          style={{ background: 'linear-gradient(to top, rgba(17,16,14,0.9) 0%, rgba(17,16,14,0.3) 50%, rgba(17,16,14,0.2) 100%)' }}
        />
        <div className="hero-vignette absolute inset-0 z-[2]" />
      </div>

      {/* ── Layer 2: Film Grain Texture ── */}
      <div className="hero-film-grain absolute inset-0 z-[2] pointer-events-none" />

      {/* ── Layer 3: Lantern Ambient Glow góc phải ── */}
      <div
        className="absolute right-0 top-1/4 w-[40vw] h-[60vh] z-[3] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at right center, rgba(214,168,79,0.06) 0%, transparent 70%)' }}
      />

      {/* ── Layer 4: Reveal Layer (Chỉ chứa duy nhất 1 thẻ ảnh tiếp theo) ── */}
      <div
        ref={revealLayerRef}
        className="absolute inset-0 z-[4] overflow-hidden select-none pointer-events-none"
        style={{
          opacity: 0,
          maskImage: 'none',
          WebkitMaskImage: 'none',
          willChange: 'mask-image, -webkit-mask-image, opacity'
        }}
      >
        <img
          ref={revealImgRef}
          src={nextDest.image}
          alt={nextDest.name}
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ willChange: 'transform', transform: 'scale3d(1.08, 1.08, 1)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(17,16,14,0.9) 0%, rgba(17,16,14,0.3) 50%, rgba(17,16,14,0.2) 100%)' }}
        />
        <div className="hero-vignette absolute inset-0" />
      </div>

      {/* ── Layer 5: SVG Flight Path (Đường bay vàng thanh lịch, không dùng filter nặng) ── */}
      <svg
        className="absolute inset-0 w-full h-full z-[10] pointer-events-none select-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          {/* Gradient đứng cho nét vẽ chính sắc nét (Vàng ấm -> Vàng rực -> Trắng sáng) */}
          <linearGradient id="brush-trail" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#C8943B" stopOpacity="0.2" />
            <stop offset="60%" stopColor="#F5D28E" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFF8E7" stopOpacity="1" />
          </linearGradient>
          {/* Gradient đứng cho vệt phát sáng mờ phía dưới */}
          <linearGradient id="brush-glow" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#D6A84F" stopOpacity="0" />
            <stop offset="50%" stopColor="#E2A93E" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FAD483" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* 1. Nét phát sáng mờ phía dưới (Glow layer - Dày hơn và có CSS blur tạo hiệu ứng tỏa sáng rực rỡ) */}
        <path
          ref={flightLineGlowRef}
          d={SVG_PATH_D}
          fill="none"
          stroke="url(#brush-glow)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={String(PATH_LENGTH)}
          strokeDashoffset={String(PATH_LENGTH)}
          style={{
            opacity: 0,
            vectorEffect: 'non-scaling-stroke',
            filter: 'blur(6px)',
            willChange: 'stroke-dashoffset, opacity',
            transition: 'opacity 0.3s'
          }}
        />

        <path
          ref={flightLineRef}
          d={SVG_PATH_D}
          fill="none"
          stroke="url(#brush-trail)"
          strokeWidth="5.45"
          strokeLinecap="round"
          strokeDasharray={String(PATH_LENGTH)}
          strokeDashoffset={String(PATH_LENGTH)}
          style={{
            opacity: 0,
            vectorEffect: 'non-scaling-stroke',
            willChange: 'stroke-dashoffset, opacity',
            transition: 'opacity 0.3s'
          }}
        />
      </svg>

      {/* ── Layer 5.5: Hardware-Accelerated Airplane (Tách biệt hoàn toàn khỏi SVG, sử dụng máy bay hoạt hình mới) ── */}
      <div
        ref={airplaneRef}
        className="absolute top-0 left-0 w-10 h-10 z-[11] pointer-events-none select-none flex items-center justify-center"
        style={{
          opacity: 0,
          transform: 'translate3d(-10vw, 90vh, 0) rotate(0deg)',
          willChange: 'transform, opacity',
          transition: 'opacity 0.2s',
          backfaceVisibility: 'hidden'
        }}
      >
        <svg viewBox="0 0 72 72" className="w-full h-full" style={{ color: '#D6A84F' }}>
          {/* Thân và cánh máy bay hoạt hình mới */}
          <path
            d="M36 6C39.7 6 42.8 8.8 43.2 12.5L45.1 29.5L61.1 39.8C62.9 40.9 64 42.9 64 45V48.2C64 50.8 61.1 52.4 58.9 51L46.6 43.3L45.2 54.8L50.3 59.5C51.4 60.5 52 61.9 52 63.4V66L36 61.6L20 66V63.4C20 61.9 20.6 60.5 21.7 59.5L26.8 54.8L25.4 43.3L13.1 51C10.9 52.4 8 50.8 8 48.2V45C8 42.9 9.1 40.9 10.9 39.8L26.9 29.5L28.8 12.5C29.2 8.8 32.3 6 36 6Z"
            fill="currentColor"
          />
          {/* Kính cabin lái */}
          <ellipse cx="36" cy="18" rx="4" ry="4.5" fill="white" opacity="0.9" />
          <ellipse cx="36" cy="30" rx="4" ry="4.5" fill="white" opacity="0.9" />
          {/* Điểm nhấn gió/độ sâu đuôi máy bay */}
          <path
            d="M27.5 37.5C30.4 39.4 33.2 40.3 36 40.3C38.8 40.3 41.6 39.4 44.5 37.5"
            fill="none"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>
      </div>

      {/* ── Layer 6: Editorial Typography ── */}
      <div className="relative z-[30] text-center px-6 md:px-16 max-w-4xl mx-auto pb-28 md:pb-0 select-none">
        <p
          key={`label-${textKey}`}
          className={[
            'font-mono text-xs uppercase tracking-[0.35em] mb-5',
            textVisible ? 'opacity-100 translate-y-0 hero-text-enter' : 'opacity-0 translate-y-2',
          ].join(' ')}
          style={{ color: '#D6A84F' }}
        >
          Hành trình Di sản · {dest.coords.split('·')[1]?.trim()}
        </p>

        <h1
          key={`h1-${textKey}`}
          className={[
            'text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight mb-5 select-none transition-all duration-700 delay-100',
            textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
          ].join(' ')}
          style={{
            color: '#FFFFFF',
            fontFamily: 'Georgia, "Times New Roman", serif',
            textShadow: '0 2px 30px rgba(17,16,14,0.45)'
          }}
        >
          Khám phá Việt Nam
          <br />
          <span style={{ color: '#D6A84F' }}>Vẻ đẹp bất tận</span>
          <br />
          {/* Hành trình của bạn */}
        </h1>

        <p
          key={`sub-${textKey}`}
          className={[
            'text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-10 select-none transition-all duration-700 delay-200',
            textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
          ].join(' ')}
          style={{ color: 'rgba(239,227,200,0.75)' }}
        >
          Tuyển chọn những khách sạn nghệ thuật, khu nghỉ dưỡng cao cấp và trải nghiệm văn hóa bản địa độc bản tại Việt Nam.
        </p>
      </div>

      {/* ── Layer 7: Floating Search Bar (Dark Glassmorphism) ── */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-full max-w-container-max px-margin-mobile md:px-margin-desktop z-[45]">
        <HotelSearchForm theme="dark" />
      </div>

      {/* ── Layer 8: Bottom Corner Metadata ── */}
      <div className="hidden md:block absolute bottom-10 left-6 md:left-10 z-[30] select-none pointer-events-none">
        <p
          key={`meta-name-${textKey}`}
          className={[
            'font-semibold text-lg tracking-wide transition-all duration-500',
            textVisible ? 'opacity-100 hero-text-enter' : 'opacity-0',
          ].join(' ')}
          style={{ color: '#FFFFFF' }}
        >
          {dest.name}
          <span className="ml-2 font-light" style={{ color: '#D6A84F' }}>Việt Nam</span>
        </p>
        <p
          key={`meta-coord-${textKey}`}
          className={[
            'text-xs tracking-widest uppercase mt-1 transition-all duration-500 delay-100',
            textVisible ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
          style={{ color: 'rgba(239,227,200,0.5)' }}
        >
          {dest.coords}
        </p>
      </div>

      <div className="hidden md:block absolute bottom-10 right-6 md:right-10 z-[30] flex items-baseline gap-1 select-none pointer-events-none">
        <span className="text-xl font-light" style={{ color: '#D6A84F', fontVariantNumeric: 'tabular-nums' }}>
          {slideNum}
        </span>
        <span className="text-xs" style={{ color: 'rgba(239,227,200,0.35)' }}>/ {totalNum}</span>
      </div>

      <div
        className="hidden md:block absolute bottom-10 right-20 md:right-24 z-[30] w-12 h-[1px] select-none pointer-events-none"
        style={{ background: 'rgba(214,168,79,0.4)' }}
      />
    </header>
  );
};

export default JourneyRevealHero;

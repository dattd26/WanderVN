import { useMemo, useState } from 'react';

type HotelStatus = 'pending' | 'approved' | 'rejected';

interface HotelSubmission {
  id: string;
  name: string;
  location: string;
  category: string;
  partnerName: string;
  partnerCode: string;
  submittedAt: string;
  submittedTime: string;
  status: HotelStatus;
  thumbnail: string;
  gallery: string[];
  description: string;
  area: string;
  scale: string;
  roomTypes: Array<{
    name: string;
    summary: string;
    icon: string;
    price: string;
  }>;
}

const MOCK_HOTELS: HotelSubmission[] = [
  {
    id: 'HTL-4421',
    name: 'Grand Horizon Resort',
    location: 'Đà Nẵng, Việt Nam',
    category: 'Resort & Spa',
    partnerName: 'Trần Hoàng Long',
    partnerCode: 'Partner #4421',
    submittedAt: '12/10/2023',
    submittedTime: '14:30 - 12/10/2023',
    status: 'pending',
    thumbnail:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCdxldUYcyWBIHNPIf-8XJagrGJCWNpcnvDjPLUcgTaCeK79pj7rk0KAvxpHl9RhvFNbbgU3h3_r5BVtonb0uS07x-VlCzvrQWYrI0bTRID73FpwfNGj7RoEb-d_hMjbwg2PzStatQpGWXsfK0cqgaEZyJSv83FurMkut2_JeXQ5eKt1IX4yGcycehCHsUifY1KsAs2VteFuQJksOnJxn-W3Y5kroWKRn4hv-4d7qhuQOQsFnHhiHsJUiWY-oqEJt_2SGMIGZDFW-o',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBzK7zqOKpUZO0sO96RXM4f8v9zdkgRY2ZJSxGASdswWG4OLgqpXKJ_EOFQn8shx8LRA_5XF4_E5hnYs6TjMC9N9YHJ2oN4o2cknFaxvvma-vYmfGmMB31eA4y0gOD3bV68z653BVO9Oz7bxWCrGPuNJHKPBGhfa5y6_qeH423RPrDFUHMRs-jslISiEPnTgeKcOGm52dymzen-kCiq3tjW0TmnPdM2oRx9nafDUMbTgFAmO-Hho0GLnWm09nDCG346E3wg0ij76i0',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDGaqKON-8in9cIy1n5Ik0MXwJFfSwenZQW19mIv0GPnD2DkPY12iNZUChSHdIl4OObhIFM3duwQ2TwO4nLXGrX6Ar2Etf39oK-LjkHeGQTewY_fhjBcvpktW9Cuefkyd3g5pTc_oMoR23Cysi5zOPoGUSM-3fU6v15oURRd62cFnT4q_JMSwBmyckHn0VGSXTbIKr0ztVllf1wcfwX32B2-7bMHwWvoZahFUgWAhW6cRnFpZzTTSv63KYFehUJflZ3EjoYW0rvV0Y',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC__76HXNRLwWXbYto2uBHH76vJ5egN1wyGW2aFIidwe9nhhgGVb65Q6zh3EpsUYk2rIxyTncdD9h340RKbwJbKQF4An5p3B8idqeajPD8TOqefyK2HxaiFKwTzjMvvg7-P9tuXio2u7b0sGlOnkXJQwu5u57wqGKsvL5cj2cnJBTtvAbSOOP16GMY8HnEKqSaeVNqw1f9TkdIA5SgQ3jXxP0nmChOc28ARuUhMPVhAeYA7MhVqSHreInouppsLeDKyTyMXG78GV3o',
    ],
    description:
      'Nằm tại vị trí đắc địa nhất của bờ biển Mỹ Khê, Grand Horizon Resort mang đến trải nghiệm nghỉ dưỡng đẳng cấp với 150 phòng view biển, hệ thống spa tiêu chuẩn quốc tế và 3 nhà hàng ẩm thực đa dạng.',
    area: '12,000 m²',
    scale: '150 Phòng',
    roomTypes: [
      {
        name: 'Deluxe Ocean View',
        summary: '45m² • 1 Giường đôi • Ban công',
        icon: 'king_bed',
        price: '3,200k',
      },
      {
        name: 'Premium Suite',
        summary: '85m² • Phòng khách riêng • Bồn tắm',
        icon: 'apartment',
        price: '5,800k',
      },
    ],
  },
  {
    id: 'HTL-4390',
    name: 'Urban Boutique Hotel',
    location: 'TP. Hồ Chí Minh',
    category: 'Boutique Hotel',
    partnerName: 'Nguyễn Minh Anh',
    partnerCode: 'Partner #4390',
    submittedAt: '10/10/2023',
    submittedTime: '09:15 - 10/10/2023',
    status: 'approved',
    thumbnail:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD6ZXP6_RrKjV7HO32LaRUgqGudJfRZcFei00qCNudYBidAx14X_qg_yExzl1tBlELLMUxgNy_cVIYlAZ_AyTxAMcc3E8ml-ZWmNub6ht_H-KqMIhk-WfCg7huUbLt0oNats5MgT62GRn3BLmvs5LU5630NPNnhUetu8laYJUU_AfZ34Sz6bmEOYovTo2bjNvOq0cnt0PQroGCnTHKDE0c3CXtmNNzgDFOp6Qb9BDGTmV4WHwE9qXJrRrJpZNfJl01my6BzKgo0oM8',
    gallery: [],
    description:
      'Khách sạn boutique nằm tại trung tâm Quận 1, kiến trúc hiện đại pha trộn tinh tế với nét cổ điển Pháp thuộc, phù hợp khách doanh nhân và du lịch ngắn ngày.',
    area: '1,800 m²',
    scale: '42 Phòng',
    roomTypes: [
      {
        name: 'Classic Room',
        summary: '28m² • 1 Giường King • Bàn làm việc',
        icon: 'bed',
        price: '1,650k',
      },
    ],
  },
];

const STATUS_TABS: Array<{ key: HotelStatus; label: string }> = [
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'approved', label: 'Đã duyệt' },
  { key: 'rejected', label: 'Bị từ chối' },
];

const STATUS_BADGE: Record<HotelStatus, { label: string; className: string }> = {
  pending: {
    label: 'Chờ duyệt',
    className: 'bg-admin-secondary-fixed text-admin-on-secondary-fixed-variant',
  },
  approved: {
    label: 'Đã duyệt',
    className: 'bg-admin-surface-container-highest text-admin-on-surface-variant',
  },
  rejected: {
    label: 'Bị từ chối',
    className: 'bg-admin-error/10 text-admin-error',
  },
};

export function PartnerHotelReviewTab() {
  const [activeStatus, setActiveStatus] = useState<HotelStatus>('pending');
  const [hotels] = useState<HotelSubmission[]>(MOCK_HOTELS);
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_HOTELS[0]?.id ?? null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredHotels = useMemo(
    () => hotels.filter((h) => h.status === activeStatus),
    [hotels, activeStatus],
  );

  const counts = useMemo(
    () => ({
      pending: hotels.filter((h) => h.status === 'pending').length,
      approved: hotels.filter((h) => h.status === 'approved').length,
      rejected: hotels.filter((h) => h.status === 'rejected').length,
    }),
    [hotels],
  );

  const selectedHotel = useMemo(
    () => hotels.find((h) => h.id === selectedId) ?? null,
    [hotels, selectedId],
  );

  const handleSelectHotel = (id: string) => {
    setSelectedId(id);
    setIsRejecting(false);
    setRejectionReason('');
  };

  const handleApprove = () => {
    if (!selectedHotel) return;
    alert(`Đã duyệt hồ sơ "${selectedHotel.name}" thành công!`);
  };

  const handleConfirmReject = () => {
    if (!selectedHotel) return;
    if (!rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối.');
      return;
    }
    alert(`Đã từ chối hồ sơ "${selectedHotel.name}".\nLý do: ${rejectionReason}`);
    setIsRejecting(false);
    setRejectionReason('');
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[600px]">
      <div className="flex-1 flex flex-col p-admin-lg space-y-admin-lg overflow-y-auto">
        <div className="flex items-end justify-between">
          <div>
            <nav className="flex space-x-admin-sm mb-admin-xs text-admin-outline text-admin-body-sm">
              <span>Quản lý đối tác</span>
              <span>/</span>
              <span className="text-admin-primary font-medium">Duyệt hồ sơ khách sạn</span>
            </nav>
            <h2 className="text-admin-display-lg font-admin-sans text-admin-primary">
              Duyệt hồ sơ khách sạn
            </h2>
          </div>
          <button
            type="button"
            className="bg-admin-primary text-admin-on-primary px-admin-lg py-admin-sm rounded-lg flex items-center space-x-admin-sm hover:opacity-90 transition-opacity active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            <span className="text-admin-label-caps font-admin-sans">Xuất báo cáo</span>
          </button>
        </div>

        <div className="flex space-x-admin-xl border-b border-admin-outline-variant">
          {STATUS_TABS.map((tab) => {
            const isActive = activeStatus === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveStatus(tab.key)}
                className={`pb-admin-md text-admin-label-caps font-admin-sans transition-colors ${
                  isActive
                    ? 'border-b-2 border-admin-primary text-admin-primary font-bold'
                    : 'text-admin-on-surface-variant hover:text-admin-primary'
                }`}
              >
                {tab.label} ({counts[tab.key]})
              </button>
            );
          })}
        </div>

        <div className="bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl overflow-hidden shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-admin-surface-container-low text-left">
                <th className="px-admin-lg py-admin-md text-admin-label-caps font-admin-sans text-admin-on-surface-variant">
                  KHÁCH SẠN & VỊ TRÍ
                </th>
                <th className="px-admin-lg py-admin-md text-admin-label-caps font-admin-sans text-admin-on-surface-variant">
                  ĐỐI TÁC
                </th>
                <th className="px-admin-lg py-admin-md text-admin-label-caps font-admin-sans text-admin-on-surface-variant">
                  NGÀY GỬI
                </th>
                <th className="px-admin-lg py-admin-md text-admin-label-caps font-admin-sans text-admin-on-surface-variant">
                  TRẠNG THÁI
                </th>
                <th className="px-admin-lg py-admin-md text-admin-label-caps font-admin-sans text-admin-on-surface-variant text-right">
                  THAO TÁC
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-outline-variant/30">
              {filteredHotels.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-admin-lg py-admin-xl text-center text-admin-on-surface-variant text-admin-body-md"
                  >
                    Không có hồ sơ ở trạng thái này.
                  </td>
                </tr>
              )}
              {filteredHotels.map((hotel) => {
                const isSelected = hotel.id === selectedId;
                const badge = STATUS_BADGE[hotel.status];
                return (
                  <tr
                    key={hotel.id}
                    className={`hover:bg-admin-surface-container-low/50 transition-colors cursor-pointer ${
                      isSelected ? 'bg-admin-surface-container-high/20' : ''
                    }`}
                    onClick={() => handleSelectHotel(hotel.id)}
                  >
                    <td className="px-admin-lg py-admin-lg">
                      <div className="flex items-center space-x-admin-md">
                        <div className="w-12 h-12 rounded-lg bg-admin-surface-container overflow-hidden">
                          <img
                            alt={hotel.name}
                            src={hotel.thumbnail}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-admin-primary">{hotel.name}</p>
                          <p className="text-admin-body-sm text-admin-on-surface-variant">
                            {hotel.location}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-admin-lg py-admin-lg">
                      <p className="text-admin-body-md font-medium">{hotel.partnerName}</p>
                      <p className="text-admin-body-sm text-admin-outline">{hotel.partnerCode}</p>
                    </td>
                    <td className="px-admin-lg py-admin-lg text-admin-body-md text-admin-on-surface-variant">
                      {hotel.submittedAt}
                    </td>
                    <td className="px-admin-lg py-admin-lg">
                      <span
                        className={`px-admin-sm py-1 text-[11px] font-bold rounded-sm uppercase tracking-wider ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-admin-lg py-admin-lg text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectHotel(hotel.id);
                        }}
                        className="text-admin-secondary font-bold text-admin-label-caps hover:underline"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedHotel && (
        <aside className="w-full lg:w-[480px] bg-admin-surface-container-lowest border-l border-admin-outline-variant flex flex-col shadow-2xl relative z-10">
          <div className="p-admin-lg border-b border-admin-outline-variant flex justify-between items-start">
            <div>
              <h3 className="text-admin-headline-sm font-admin-sans text-admin-primary mb-1">
                Chi tiết hồ sơ
              </h3>
              <p className="text-admin-body-sm text-admin-on-surface-variant flex items-center">
                <span className="material-symbols-outlined text-[16px] mr-1">history</span>
                Gửi lúc: {selectedHotel.submittedTime}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="p-2 hover:bg-admin-surface-container rounded-full text-admin-on-surface-variant"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-admin-lg space-y-admin-xl">
            <div className="space-y-admin-md">
              <div className="h-48 rounded-xl overflow-hidden bg-admin-surface-container border border-admin-outline-variant">
                <img
                  alt={`${selectedHotel.name} - Ảnh chính`}
                  src={selectedHotel.gallery[0] ?? selectedHotel.thumbnail}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-3 gap-admin-md">
                {selectedHotel.gallery.slice(1, 3).map((src, idx) => (
                  <div
                    key={src + idx}
                    className="h-20 rounded-lg overflow-hidden border border-admin-outline-variant"
                  >
                    <img
                      alt={`${selectedHotel.name} - Ảnh ${idx + 2}`}
                      src={src}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {selectedHotel.gallery.length > 3 && (
                  <div className="h-20 bg-admin-surface-container-low rounded-lg border border-admin-outline-variant flex flex-col items-center justify-center text-admin-on-surface-variant cursor-pointer hover:bg-admin-surface-container transition-colors">
                    <span className="material-symbols-outlined">add_photo_alternate</span>
                    <span className="text-[10px] font-bold">
                      +{selectedHotel.gallery.length - 3} ảnh
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-admin-md">
              <div>
                <span className="px-admin-sm py-1 bg-admin-primary-container text-admin-on-primary-container text-[10px] font-bold rounded uppercase tracking-widest mb-admin-xs inline-block">
                  {selectedHotel.category}
                </span>
                <h4 className="text-admin-headline-md font-admin-sans text-admin-primary">
                  {selectedHotel.name}
                </h4>
              </div>
              <p className="text-admin-body-md text-admin-on-surface-variant leading-relaxed">
                {selectedHotel.description}
              </p>
              <div className="grid grid-cols-2 gap-admin-md">
                <div className="p-admin-md bg-admin-surface-container-low rounded-lg border border-admin-outline-variant">
                  <p className="text-admin-label-caps font-admin-sans text-admin-outline mb-admin-xs">
                    DIỆN TÍCH
                  </p>
                  <p className="font-bold text-admin-primary">{selectedHotel.area}</p>
                </div>
                <div className="p-admin-md bg-admin-surface-container-low rounded-lg border border-admin-outline-variant">
                  <p className="text-admin-label-caps font-admin-sans text-admin-outline mb-admin-xs">
                    QUY MÔ
                  </p>
                  <p className="font-bold text-admin-primary">{selectedHotel.scale}</p>
                </div>
              </div>
            </div>

            <div className="space-y-admin-md">
              <h5 className="text-admin-label-caps font-admin-sans text-admin-primary border-b border-admin-outline-variant pb-admin-xs">
                LOẠI PHÒNG ĐĂNG KÝ
              </h5>
              <div className="space-y-admin-sm">
                {selectedHotel.roomTypes.map((room) => (
                  <div
                    key={room.name}
                    className="flex items-center justify-between p-admin-md border border-admin-outline-variant rounded-lg"
                  >
                    <div className="flex items-center space-x-admin-md">
                      <span className="material-symbols-outlined text-admin-secondary">
                        {room.icon}
                      </span>
                      <div>
                        <p className="font-bold text-admin-primary">{room.name}</p>
                        <p className="text-admin-body-sm text-admin-outline">{room.summary}</p>
                      </div>
                    </div>
                    <p className="font-bold text-admin-secondary">{room.price}</p>
                  </div>
                ))}
              </div>
            </div>

            {isRejecting && (
              <div className="space-y-admin-md bg-admin-error/10 p-admin-md rounded-xl border border-admin-error/20">
                <label
                  htmlFor="rejection-reason"
                  className="text-admin-label-caps font-admin-sans text-admin-error font-bold block"
                >
                  LÝ DO TỪ CHỐI *
                </label>
                <textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  autoFocus
                  placeholder="Nhập lý do cụ thể để đối tác điều chỉnh..."
                  className="w-full rounded-lg border border-admin-outline-variant bg-white text-admin-body-md focus:ring-2 focus:ring-admin-error focus:border-admin-error p-admin-sm"
                />
              </div>
            )}
          </div>

          {selectedHotel.status === 'pending' && (
            <div className="p-admin-lg bg-admin-surface-container-low border-t border-admin-outline-variant">
              {!isRejecting ? (
                <div className="flex space-x-admin-md">
                  <button
                    type="button"
                    onClick={() => setIsRejecting(true)}
                    className="flex-1 px-admin-lg py-admin-md border border-admin-error text-admin-error font-bold rounded-lg hover:bg-admin-error/5 transition-colors active:scale-95 text-admin-label-caps font-admin-sans"
                  >
                    Từ chối
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="flex-[2] px-admin-lg py-admin-md bg-admin-primary-container text-admin-on-primary-container font-bold rounded-lg hover:opacity-90 transition-opacity active:scale-95 text-admin-label-caps font-admin-sans"
                  >
                    Duyệt hồ sơ
                  </button>
                </div>
              ) : (
                <div className="flex space-x-admin-md">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRejecting(false);
                      setRejectionReason('');
                    }}
                    className="flex-1 px-admin-lg py-admin-md border border-admin-outline text-admin-outline font-bold rounded-lg hover:bg-admin-surface-container-highest transition-colors text-admin-label-caps font-admin-sans"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReject}
                    className="flex-[2] px-admin-lg py-admin-md bg-admin-error text-admin-on-primary font-bold rounded-lg hover:opacity-90 transition-opacity text-admin-label-caps font-admin-sans"
                  >
                    Xác nhận từ chối
                  </button>
                </div>
              )}
            </div>
          )}
        </aside>
      )}
    </div>
  );
}

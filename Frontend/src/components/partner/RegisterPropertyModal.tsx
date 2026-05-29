import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Info,
  Check,
  Star,
  X,
  ChevronRight,
  ChevronLeft,
  Compass,
  Sparkles,
  Upload,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { partnerService, searchService } from '../../services';
import type { PropertyType, SearchAutocompleteDto } from '../../types';

// Định nghĩa Props đầu vào cho RegisterPropertyModal
interface RegisterPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newHotelId: number) => void;
  availablePropertyTypes: PropertyType[];
  triggerMessage: (type: 'success' | 'error', content: string) => void;
}

// Marker tùy biến — pin vàng gold WanderVN đại diện cho di sản
const partnerPinIcon = L.divIcon({
  className: '',
  html: `
    <div class="relative" style="transform: translate(-50%, -100%);">
      <div class="w-11 h-11 bg-[#FAF6F0] rounded-full flex items-center justify-center border-2 border-[#735C00] shadow-[0_4px_20px_rgba(115,92,0,0.35)]">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#735C00" stroke="none">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
        </svg>
      </div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#735C00] rounded-full animate-ping opacity-40 -z-10"></div>
    </div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

// Component con di chuyển máy quay bản đồ (FlyToLocation)
const FlyToLocation: React.FC<{ lat: number | null; lng: number | null }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) {
      map.flyTo([lat, lng], 15, { duration: 0.8 });
    }
  }, [lat, lng, map]);
  return null;
};

// Component con lắng nghe sự kiện click trên bản đồ
const MapEventsHandler: React.FC<{ onClick: (lat: number, lng: number) => void }> = ({ onClick }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

export const RegisterPropertyModal: React.FC<RegisterPropertyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  availablePropertyTypes,
  triggerMessage
}) => {
  const [newHotelStep, setNewHotelStep] = useState<number>(1);
  const [isSubmittingHotel, setIsSubmittingHotel] = useState(false);
  const [hotelUploadStep, setHotelUploadStep] = useState<string>('');

  // Trạng thái biểu mẫu tạo cơ sở di sản mới
  const [newHotelForm, setNewHotelForm] = useState({
    name: '',
    address: '',
    starRating: 5,
    description: '',
    cancellationPolicy: 'flexible',
    locationId: 102, // Mặc định Hội An
    locationName: 'Hội An',
    propertyTypeId: 1,
    latitude: 15.8801,
    longitude: 108.3380,
    amenityIds: [] as number[],
    images: [] as File[],
    imagePreviews: [] as string[]
  });

  // State hỗ trợ autocomplete tìm kiếm địa điểm
  const [locationQuery, setLocationQuery] = useState('Hội An');
  const [locationSuggestions, setLocationSuggestions] = useState<SearchAutocompleteDto[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    if (availablePropertyTypes.length > 0 && !newHotelForm.propertyTypeId) {
      const timer = setTimeout(() => {
        setNewHotelForm(prev => {
          if (!prev.propertyTypeId) {
            return { ...prev, propertyTypeId: availablePropertyTypes[0].id };
          }
          return prev;
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [availablePropertyTypes, newHotelForm.propertyTypeId]);

  // debounce logic tìm kiếm địa chỉ tỉnh/thành phố
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!locationQuery.trim()) {
        setLocationSuggestions([]);
        return;
      }

      setIsSearchingLocation(true);
      try {
        const data = await searchService.getAutocomplete(locationQuery);
        // Chỉ lọc các kết quả gợi ý là Điểm đến (Location)
        setLocationSuggestions(data.filter(item => item.type === 'Location'));
      } catch (err) {
        console.warn('⚠️ Lỗi gợi ý vị trí autocomplete:', err);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [locationQuery]);

  if (!isOpen) return null;

  // Chọn địa điểm từ danh sách gợi ý dropdown
  const handleSelectLocation = (item: SearchAutocompleteDto) => {
    setNewHotelForm(prev => ({
      ...prev,
      locationId: item.targetId,
      locationName: item.name
    }));
    setLocationQuery(item.name);
    setLocationSuggestions([]);
  };

  // Tra cứu tọa độ GPS bằng OpenStreetMap (Nominatim) theo địa chỉ nhập vào
  const handleGeocodeAddress = async () => {
    if (!newHotelForm.address.trim()) {
      triggerMessage('error', 'Vui lòng nhập địa chỉ chi tiết trước khi định vị.');
      return;
    }
    setIsGeocoding(true);
    try {
      const searchTerms = `${newHotelForm.address}, ${newHotelForm.locationName}, Việt Nam`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerms)}&countrycodes=vn&limit=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'vi' } });
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setNewHotelForm(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng
        }));
        triggerMessage('success', 'Đã xác định vị trí di sản của bạn trên bản đồ!');
      } else {
        triggerMessage('error', 'Không tìm thấy tọa độ tự động. Bạn có thể kéo thả ghim thủ công.');
      }
    } catch (err) {
      console.error('⚠️ Geocoding error:', err);
      triggerMessage('error', 'Lỗi kết nối dịch vụ định vị.');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Nhận tọa độ khi click trên bản đồ
  const handleMapCoordinateSelect = (lat: number, lng: number) => {
    setNewHotelForm(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
  };

  // Thêm file ảnh vào danh sách preview nháp
  const handleAddHotelFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);

    setNewHotelForm(prev => {
      const newFiles = [...prev.images, ...filesArray];
      const newPreviews = [...prev.imagePreviews, ...filesArray.map(file => URL.createObjectURL(file))];
      return {
        ...prev,
        images: newFiles,
        imagePreviews: newPreviews
      };
    });
  };

  // Gỡ bỏ file ảnh nháp đã chọn
  const handleRemoveSelectedFile = (index: number) => {
    setNewHotelForm(prev => {
      const newFiles = prev.images.filter((_, i) => i !== index);
      const newPreviews = prev.imagePreviews.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newFiles,
        imagePreviews: newPreviews
      };
    });
  };

  // Nộp hồ sơ đăng ký cơ sở di sản mới lên Backend (Metadata và Sequential upload ảnh)
  const handleRegisterHotelSubmit = async () => {
    if (!newHotelForm.name.trim()) {
      triggerMessage('error', 'Tên cơ sở lưu trú không được để trống.');
      return;
    }
    if (!newHotelForm.address.trim()) {
      triggerMessage('error', 'Địa chỉ chi tiết không được để trống.');
      return;
    }
    if (!newHotelForm.description.trim()) {
      triggerMessage('error', 'Vui lòng mô tả ngắn gọn về nét đặc sắc di sản của bạn.');
      return;
    }
    if (newHotelForm.images.length === 0) {
      triggerMessage('error', 'Vui lòng cung cấp ít nhất 1 hình ảnh đại diện cho cơ sở.');
      return;
    }

    setIsSubmittingHotel(true);
    setHotelUploadStep('Đang gửi thông tin hồ sơ lên hệ thống...');
    try {
      // 1. Gửi thông tin thuộc tính cơ bản của khách sạn
      const payload = {
        name: newHotelForm.name.trim(),
        address: newHotelForm.address.trim(),
        starRating: newHotelForm.starRating,
        description: newHotelForm.description.trim(),
        cancellationPolicy: newHotelForm.cancellationPolicy,
        locationId: newHotelForm.locationId,
        propertyTypeId: newHotelForm.propertyTypeId,
        latitude: newHotelForm.latitude,
        longitude: newHotelForm.longitude,
        amenityIds: newHotelForm.amenityIds
      };

      const result = await partnerService.submitHotel(payload);
      const newHotelId = result.hotelId;

      // 2. Upload tuần tự từng ảnh đã chọn lên hệ thống Cloudinary
      for (let i = 0; i < newHotelForm.images.length; i++) {
        setHotelUploadStep(`Đang tải lên ảnh ${i + 1}/${newHotelForm.images.length}...`);
        const file = newHotelForm.images[i];
        const isPrimary = i === 0; // Ảnh đầu tiên được thiết lập làm ảnh bìa đại diện chính
        await partnerService.uploadHotelImage(newHotelId, file, isPrimary);
      }

      triggerMessage('success', 'Đăng ký thành công! Cơ sở đã được gửi lên hệ thống và đang chờ phê duyệt.');
      onSuccess(newHotelId);

      // Reset form trạng thái mặc định
      setNewHotelForm({
        name: '',
        address: '',
        starRating: 5,
        description: '',
        cancellationPolicy: 'flexible',
        locationId: 102,
        locationName: 'Hội An',
        propertyTypeId: availablePropertyTypes[0]?.id || 1,
        latitude: 15.8801,
        longitude: 108.3380,
        amenityIds: [],
        images: [],
        imagePreviews: []
      });
      setLocationQuery('Hội An');
      setNewHotelStep(1);
      onClose();
    } catch (err: unknown) {
      console.error('⚠️ Đăng ký cơ sở thất bại:', err);
      const errMsg = err instanceof Error ? err.message : 'Lỗi xử lý kết nối máy chủ.';
      triggerMessage('error', errMsg);
    } finally {
      setIsSubmittingHotel(false);
      setHotelUploadStep('');
    }
  };

  const handleCancelAndClose = () => {
    if (confirm('Bạn có chắc chắn muốn hủy bỏ tiến trình đăng ký này? Dữ liệu nháp sẽ bị xóa.')) {
      setNewHotelStep(1);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1C19]/60 backdrop-blur-md overflow-y-auto">
      {/* Tăng kích thước modal lên tối đa max-w-5xl và nâng cao tính thoáng đãng của chữ tiếng Việt */}
      <div className="bg-[#FAF6F0] w-full max-w-[980px] rounded-2xl shadow-2xl border border-[#E6E2DD] overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[680px] relative max-h-[95vh] animate-in fade-in zoom-in duration-300">

        {/* Sidebar Chỉ báo Tiến trình bên trái */}
        <div className="w-full md:w-[270px] bg-[#1C1C19] p-7 text-[#FAF6F0] flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div className="space-y-1.5">
              <h3 className="font-display-lg text-xl font-bold text-[#E6E2DD] tracking-wide">WanderVN</h3>
              <p className="font-label-md text-[9px] uppercase tracking-widest text-[#735C00] font-bold">Heritage Registration</p>
            </div>

            {/* Các bước đăng ký */}
            <div className="space-y-4.5 pt-4">
              {[
                { step: 1, label: 'Chào mừng' },
                { step: 2, label: 'Thông tin chung' },
                { step: 3, label: 'Vị trí & Địa chỉ' },
                { step: 4, label: 'Tiện ích' },
                { step: 5, label: 'Hình ảnh' },
                { step: 6, label: 'Xem lại & Gửi' }
              ].map((s) => {
                const isCompleted = newHotelStep > s.step;
                const isActive = newHotelStep === s.step;
                return (
                  <div key={s.step} className="flex items-center gap-3.5 group">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border ${isCompleted
                        ? 'bg-[#735C00] border-[#735C00] text-[#FAF6F0]'
                        : isActive
                          ? 'bg-[#FAF6F0] border-[#FAF6F0] text-[#1C1C19] ring-2 ring-[#735C00]/40'
                          : 'border-[#444748] text-[#8C8A85]'
                      }`}>
                      {isCompleted ? <Check className="w-4 h-4" /> : s.step}
                    </div>
                    <span className={`font-label-md text-xs md:text-sm tracking-wide transition-colors ${isActive ? 'text-[#FAF6F0] font-bold' : isCompleted ? 'text-[#FAF6F0]/80' : 'text-[#8C8A85]'
                      }`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="hidden md:block pt-6 border-t border-[#E6E2DD]/10">
            <p className="font-body-md text-[10px] text-[#8C8A85] leading-relaxed">
              Bằng cách tham gia cùng WanderVN, bạn đang góp phần bảo tồn và tôn vinh những giá trị văn hóa, kiến trúc lịch sử đặc sắc của Việt Nam.
            </p>
          </div>
        </div>

        {/* Nội dung bên phải modal */}
        <div className="flex-1 flex flex-col justify-between p-7 md:p-9 overflow-y-auto">

          {/* Nút đóng */}
          <button
            type="button"
            onClick={handleCancelAndClose}
            className="absolute top-5 right-5 text-[#444748] hover:text-[#1C1C19] p-2 rounded-full hover:bg-[#FAF6F0] transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Biểu mẫu từng bước */}
          <div className="flex-1 min-h-0">

            {/* BƯỚC 1: CHÀO MỪNG */}
            {newHotelStep === 1 && (
              <div className="space-y-6 py-4 animate-in fade-in duration-300">
                <div className="space-y-2.5">
                  <h2 className="font-display-lg text-2xl font-bold text-[#1C1C19] leading-tight">
                    Trở thành đối tác di sản của WanderVN
                  </h2>
                  <p className="font-body-md text-xs md:text-sm text-[#444748] leading-relaxed">
                    Chúng tôi giúp kết nối các cơ sở lưu trú mang nét di sản văn hóa, lịch sử và nghệ thuật độc đáo tại Việt Nam tới du khách quốc tế tinh tế.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#F1EDE8] p-5 rounded-xl border border-[#E6E2DD] space-y-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#735C00]/10 flex items-center justify-center text-[#735C00]">
                      <Compass className="w-5 h-5" />
                    </div>
                    <h4 className="font-display-lg text-sm md:text-base font-bold text-[#1C1C19]">Tập khách hàng cao cấp</h4>
                    <p className="font-body-md text-xs text-[#444748] leading-relaxed">
                      Du khách của WanderVN là những người tìm kiếm trải nghiệm văn hóa chân thực và sẵn sàng chi trả cao cho các dịch vụ đậm đà bản sắc.
                    </p>
                  </div>

                  <div className="bg-[#F1EDE8] p-5 rounded-xl border border-[#E6E2DD] space-y-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#735C00]/10 flex items-center justify-center text-[#735C00]">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h4 className="font-display-lg text-sm md:text-base font-bold text-[#1C1C19]">Quảng bá hình ảnh chuyên nghiệp</h4>
                    <p className="font-body-md text-xs text-[#444748] leading-relaxed">
                      Hỗ trợ xây dựng hình ảnh, câu chuyện thương hiệu và phong cách nghệ thuật đậm chất điện ảnh riêng biệt của cơ sở bạn.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-[#FEF9EC] border border-[#FBE3A4] rounded-xl flex gap-3.5 text-xs text-[#8F6B00] leading-relaxed">
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Lưu ý quan trọng:</strong> Hồ sơ của bạn sau khi hoàn thành sẽ được duyệt thủ công bởi Ban quản trị WanderVN trong vòng 24 giờ. Vui lòng cung cấp hình ảnh chân thực và địa chỉ chính xác để đẩy nhanh tiến độ phê duyệt.
                  </div>
                </div>
              </div>
            )}

            {/* BƯỚC 2: THÔNG TIN CHUNG */}
            {newHotelStep === 2 && (
              <div className="space-y-5 py-2 animate-in fade-in duration-300">
                <div className="space-y-1">
                  <h2 className="font-display-lg text-xl font-bold text-[#1C1C19]">Thông tin chung cơ sở</h2>
                  <p className="font-body-md text-xs text-[#444748]">
                    Điền các thông số cơ bản tạo nên bộ mặt thương hiệu của khu nghỉ dưỡng.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold">Tên cơ sở lưu trú *</label>
                    <input
                      type="text"
                      required
                      value={newHotelForm.name}
                      onChange={e => setNewHotelForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ví dụ: Hội An Heritage River Resort"
                      className="w-full bg-[#F1EDE8] border border-[#E6E2DD] rounded-lg px-4 py-3 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold">Loại hình lưu trú *</label>
                      <select
                        value={newHotelForm.propertyTypeId}
                        onChange={e => setNewHotelForm(prev => ({ ...prev, propertyTypeId: parseInt(e.target.value) || 1 }))}
                        className="w-full bg-[#F1EDE8] border border-[#E6E2DD] rounded-lg px-4 py-3 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-colors appearance-none"
                      >
                        {availablePropertyTypes.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold block mb-1">Xếp hạng sao chính thức *</label>
                      <div className="flex items-center gap-2 pt-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewHotelForm(prev => ({ ...prev, starRating: star }))}
                            className="focus:outline-none hover:scale-110 transition-transform"
                          >
                            <Star className={`h-6 w-6 ${star <= newHotelForm.starRating ? 'text-[#735C00] fill-[#735C00]' : 'text-[#8C8A85]'
                              }`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold">Mô tả nét di sản độc đáo *</label>
                    <textarea
                      required
                      rows={4}
                      value={newHotelForm.description}
                      onChange={e => setNewHotelForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Chia sẻ về nguồn cảm hứng thiết kế di sản, lịch sử căn nhà hay các nét trải nghiệm văn hóa địa phương mà cơ sở lưu trú của bạn đem lại cho du khách..."
                      className="w-full bg-[#F1EDE8] border border-[#E6E2DD] rounded-lg px-4 py-3 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none leading-relaxed transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* BƯỚC 3: VỊ TRÍ & ĐỊA CHỈ */}
            {newHotelStep === 3 && (
              <div className="space-y-4 py-1 animate-in fade-in duration-300 flex flex-col h-full">
                <div className="space-y-1 shrink-0">
                  <h2 className="font-display-lg text-xl font-bold text-[#1C1C19]">Địa điểm & Bản đồ di sản</h2>
                  <p className="font-body-md text-xs text-[#444748]">
                    Định vị tọa độ chính xác giúp du khách dễ dàng tìm thấy cơ sở trên bản đồ hành trình WanderVN.
                  </p>
                </div>

                <div className="grid grid-cols-12 gap-5 flex-grow min-h-0 overflow-y-auto">

                  {/* Cột trái: Form nhập liệu */}
                  <div className="col-span-12 md:col-span-5 space-y-4">

                    {/* Autocomplete địa danh */}
                    <div className="space-y-1.5 relative">
                      <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold">Tỉnh / Thành phố di sản *</label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={locationQuery}
                          onChange={e => setLocationQuery(e.target.value)}
                          placeholder="Tìm thành phố (Hà Nội, Hội An...)"
                          className="w-full bg-[#F1EDE8] border border-[#E6E2DD] rounded-lg pl-4 pr-10 py-3 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-colors"
                        />
                        {isSearchingLocation && (
                          <div className="absolute right-3.5 w-4 h-4 border-2 border-[#735C00] border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>

                      {/* Dropdown Autocomplete gợi ý */}
                      {locationSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto divide-y divide-[#E6E2DD]/50">
                          {locationSuggestions.map(item => (
                            <button
                              type="button"
                              key={item.id}
                              onClick={() => handleSelectLocation(item)}
                              className="w-full text-left px-4 py-3 text-xs md:text-sm hover:bg-[#F1EDE8] transition-colors flex items-center gap-2.5"
                            >
                              <MapPin className="h-4 w-4 text-[#735C00] shrink-0" />
                              <span className="truncate">{item.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Chi tiết địa chỉ */}
                    <div className="space-y-1.5">
                      <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold">Địa chỉ chi tiết *</label>
                      <textarea
                        required
                        rows={2}
                        value={newHotelForm.address}
                        onChange={e => setNewHotelForm(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Số nhà, tên đường, phường/xã..."
                        className="w-full bg-[#F1EDE8] border border-[#E6E2DD] rounded-lg px-4 py-2.5 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none resize-none leading-relaxed transition-colors"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={isGeocoding}
                      onClick={handleGeocodeAddress}
                      className="w-full py-2.5 bg-[#1C1C19] text-[#FAF6F0] rounded-lg text-xs font-label-md uppercase tracking-wider hover:bg-[#735C00] transition-colors flex items-center justify-center gap-2 font-bold"
                    >
                      {isGeocoding ? (
                        <div className="w-3.5 h-3.5 border-2 border-[#FAF6F0] border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <MapPin className="h-4 w-4 text-[#B59A5A]" />
                      )}
                      {isGeocoding ? 'Đang định vị...' : 'Tự động định vị bản đồ'}
                    </button>
                  </div>

                  {/* Cột phải: Bản đồ Leaflet */}
                  <div className="col-span-12 md:col-span-7 h-[250px] md:h-full min-h-[220px] rounded-xl overflow-hidden border border-[#E6E2DD] relative z-10">
                    <MapContainer
                      center={[newHotelForm.latitude, newHotelForm.longitude]}
                      zoom={14}
                      scrollWheelZoom={true}
                      className="w-full h-full"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[newHotelForm.latitude, newHotelForm.longitude]} icon={partnerPinIcon} />
                      <FlyToLocation lat={newHotelForm.latitude} lng={newHotelForm.longitude} />
                      <MapEventsHandler onClick={handleMapCoordinateSelect} />
                    </MapContainer>
                    <div className="absolute bottom-2 left-2 bg-[#FAF6F0]/90 border border-[#E6E2DD] px-3 py-1.5 rounded-lg text-[9px] font-mono shadow text-[#1C1C19] z-[1000] pointer-events-none">
                      Tọa độ: {newHotelForm.latitude.toFixed(5)}, {newHotelForm.longitude.toFixed(5)}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* BƯỚC 4: TIỆN ÍCH */}
            {newHotelStep === 4 && (
              <div className="space-y-5 py-2 animate-in fade-in duration-300">
                <div className="space-y-1">
                  <h2 className="font-display-lg text-xl font-bold text-[#1C1C19]">Trải nghiệm & Điều khoản</h2>
                  <p className="font-body-md text-xs text-[#444748]">
                    Giới thiệu các dịch vụ gia tăng cao cấp cùng điều khoản hoàn hủy của khách sạn.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold block mb-1">
                      Các tiện ích di sản cao cấp được chọn lọc
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { id: 1, label: 'Wi-Fi miễn phí' },
                        { id: 2, label: 'Bể bơi vô cực' },
                        { id: 3, label: 'Spa & Massage' },
                        { id: 4, label: 'Nhà hàng ẩm thực' },
                        { id: 5, label: 'Phòng Gym hiện đại' },
                        { id: 6, label: 'Sky Bar hoàng hôn' },
                        { id: 7, label: 'Đỗ xe miễn phí' }
                      ].map((amenity) => {
                        const isChecked = newHotelForm.amenityIds.includes(amenity.id);
                        return (
                          <button
                            type="button"
                            key={amenity.id}
                            onClick={() => {
                              setNewHotelForm(prev => {
                                const active = prev.amenityIds.includes(amenity.id)
                                  ? prev.amenityIds.filter(id => id !== amenity.id)
                                  : [...prev.amenityIds, amenity.id];
                                return { ...prev, amenityIds: active };
                              });
                            }}
                            className={`p-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${isChecked
                                ? 'border-[#735C00] bg-[#FEF9EC] text-[#735C00] font-bold shadow-sm'
                                : 'border-[#E6E2DD] bg-[#FAF6F0] hover:border-[#735C00]/40 text-[#444748]'
                              }`}
                          >
                            <span>{amenity.label}</span>
                            <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${isChecked ? 'bg-[#735C00] border-[#735C00] text-[#FAF6F0]' : 'border-[#8C8A85]'
                              }`}>
                              {isChecked && <Check className="w-3 h-3" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold block">Chính sách hủy đặt phòng *</label>
                    <select
                      value={newHotelForm.cancellationPolicy}
                      onChange={e => setNewHotelForm(prev => ({ ...prev, cancellationPolicy: e.target.value }))}
                      className="w-full bg-[#F1EDE8] border border-[#E6E2DD] rounded-lg px-4 py-3 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none appearance-none transition-colors"
                    >
                      <option value="flexible">Linh hoạt (Hủy miễn phí trước 24h nhận phòng)</option>
                      <option value="moderate">Vừa phải (Hủy miễn phí trước 5 ngày nhận phòng)</option>
                      <option value="strict">Nghiêm ngặt (Không hoàn lại sau khi đặt)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* BƯỚC 5: HÌNH ẢNH */}
            {newHotelStep === 5 && (
              <div className="space-y-5 py-2 animate-in fade-in duration-300">
                <div className="space-y-1">
                  <h2 className="font-display-lg text-xl font-bold text-[#1C1C19]">Hình ảnh di sản độc bản</h2>
                  <p className="font-body-md text-xs text-[#444748]">
                    Tải lên các góc chụp đặc trưng, nghệ thuật nhất của khuôn viên, nội thất và không gian nghỉ dưỡng của bạn.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="border-2 border-dashed border-[#E6E2DD] hover:border-[#735C00] rounded-2xl p-7 flex flex-col items-center justify-center gap-2.5 cursor-pointer bg-[#F1EDE8]/50 hover:bg-[#F1EDE8] transition-all duration-300 select-none">
                    <Upload className="h-9 w-9 text-[#735C00] animate-bounce" />
                    <span className="font-label-md text-xs md:text-sm tracking-wider text-[#1C1C19] font-bold">Chọn tệp hình ảnh di sản</span>
                    <span className="font-body-md text-[10px] text-[#8C8A85]">Hỗ trợ JPG, PNG, WEBP lên đến 10MB mỗi tệp</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleAddHotelFiles}
                      className="hidden"
                    />
                  </label>

                  {newHotelForm.imagePreviews.length > 0 && (
                    <div className="space-y-2">
                      <label className="font-label-md text-[9px] uppercase tracking-wider text-[#8C8A85] font-bold block">
                        Tệp đã chọn ({newHotelForm.imagePreviews.length}) - Tấm đầu tiên sẽ là ảnh bìa chính
                      </label>
                      <div className="grid grid-cols-4 gap-3 max-h-[190px] overflow-y-auto p-2 bg-[#FAF6F0] rounded-xl border border-[#E6E2DD]">
                        {newHotelForm.imagePreviews.map((url, idx) => (
                          <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-[#E6E2DD] group">
                            <img src={url} alt="Hotel preview selection" className="w-full h-full object-cover" />

                            {idx === 0 && (
                              <div className="absolute top-1 left-1 bg-[#735C00] text-[#FAF6F0] px-2 py-0.5 rounded text-[8px] font-label-md uppercase tracking-wider font-bold">
                                Ảnh bìa
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveSelectedFile(idx)}
                              className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BƯỚC 6: XEM LẠI & GỬI */}
            {newHotelStep === 6 && (
              <div className="space-y-4 py-1 animate-in fade-in duration-300 max-h-[380px] overflow-y-auto pr-1">
                <div className="space-y-1">
                  <h2 className="font-display-lg text-xl font-bold text-[#1C1C19]">Xem lại hồ sơ đăng ký</h2>
                  <p className="font-body-md text-xs text-[#444748]">
                    Vui lòng rà soát lại toàn bộ thông tin chi tiết trước khi chính thức nộp hồ sơ xin cấp phép.
                  </p>
                </div>

                <div className="bg-[#F1EDE8] border border-[#E6E2DD] rounded-xl p-5 space-y-4 text-xs md:text-sm">

                  <div className="flex justify-between items-start border-b border-[#E6E2DD]/80 pb-3">
                    <div className="space-y-1">
                      <span className="font-label-md text-[9px] uppercase tracking-widest text-[#735C00] font-bold">Tên di sản đăng ký</span>
                      <h4 className="font-display-lg text-base md:text-lg font-bold text-[#1C1C19]">{newHotelForm.name || 'Chưa đặt tên'}</h4>
                    </div>
                    <div className="text-right">
                      <span className="font-label-md text-[9px] uppercase tracking-widest text-[#8C8A85] block font-bold">Xếp hạng</span>
                      <div className="flex items-center gap-0.5 pt-1.5 justify-end">
                        {Array.from({ length: newHotelForm.starRating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-[#735C00] fill-[#735C00]" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 leading-relaxed">
                    <div className="space-y-3">
                      <div>
                        <span className="block font-label-md text-[9px] uppercase tracking-wider text-[#8C8A85] font-bold">Địa chỉ chi tiết</span>
                        <span className="text-[#1C1C19] font-semibold">{newHotelForm.address || 'Chưa cung cấp'}</span>
                      </div>
                      <div>
                        <span className="block font-label-md text-[9px] uppercase tracking-wider text-[#8C8A85] font-bold">Thành phố di sản</span>
                        <span className="text-[#1C1C19] font-semibold">{newHotelForm.locationName}</span>
                      </div>
                      <div>
                        <span className="block font-label-md text-[9px] uppercase tracking-wider text-[#8C8A85] font-bold">Chính sách hủy</span>
                        <span className="text-[#1C1C19] font-semibold uppercase tracking-wide">
                          {newHotelForm.cancellationPolicy === 'flexible' && 'Linh hoạt'}
                          {newHotelForm.cancellationPolicy === 'moderate' && 'Trung bình'}
                          {newHotelForm.cancellationPolicy === 'strict' && 'Nghiêm ngặt'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="block font-label-md text-[9px] uppercase tracking-wider text-[#8C8A85] font-bold">Tọa độ định vị GPS</span>
                        <span className="text-[#1C1C19] font-mono text-xs font-semibold">
                          {newHotelForm.latitude.toFixed(5)}, {newHotelForm.longitude.toFixed(5)}
                        </span>
                      </div>
                      <div>
                        <span className="block font-label-md text-[9px] uppercase tracking-wider text-[#8C8A85] font-bold">Tiện ích đã chọn ({newHotelForm.amenityIds.length})</span>
                        <div className="flex flex-wrap gap-1 pt-1.5">
                          {newHotelForm.amenityIds.map(id => {
                            const labels: Record<number, string> = { 1: 'Wifi', 2: 'Bể bơi', 3: 'Spa', 4: 'Nhà hàng', 5: 'Gym', 6: 'Sky Bar', 7: 'Đỗ xe' };
                            return (
                              <span key={id} className="bg-[#FAF6F0] border border-[#E6E2DD] px-2.5 py-0.5 rounded-full text-[9px] text-[#735C00] font-bold">
                                {labels[id]}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <span className="block font-label-md text-[9px] uppercase tracking-wider text-[#8C8A85] font-bold">Số lượng hình ảnh tải lên</span>
                        <span className="text-[#1C1C19] font-semibold">{newHotelForm.images.length} tệp tin</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>

          {/* Các nút hành động ở chân modal */}
          <div className="pt-4 border-t border-[#E6E2DD] flex justify-between gap-3 shrink-0">
            <button
              type="button"
              disabled={newHotelStep === 1}
              onClick={() => setNewHotelStep(prev => Math.max(1, prev - 1))}
              className="px-5 py-2.5 border border-[#E6E2DD] text-xs font-label-md uppercase tracking-wider text-[#444748] hover:bg-[#F1EDE8] rounded-xl disabled:opacity-30 transition-all flex items-center gap-1.5 font-bold"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
              Quay lại
            </button>

            {newHotelStep < 6 ? (
              <button
                type="button"
                onClick={() => {
                  // Xác thực các bước trước khi cho chuyển trang stepper
                  if (newHotelStep === 2) {
                    if (!newHotelForm.name.trim()) {
                      triggerMessage('error', 'Vui lòng cung cấp tên cơ sở di sản.');
                      return;
                    }
                    if (!newHotelForm.description.trim()) {
                      triggerMessage('error', 'Vui lòng điền mô tả nét di sản.');
                      return;
                    }
                  }
                  if (newHotelStep === 3) {
                    if (!newHotelForm.address.trim()) {
                      triggerMessage('error', 'Vui lòng nhập địa chỉ chi tiết.');
                      return;
                    }
                  }
                  if (newHotelStep === 5) {
                    if (newHotelForm.images.length === 0) {
                      triggerMessage('error', 'Cung cấp tối thiểu 1 ảnh đại diện để tiếp tục.');
                      return;
                    }
                  }
                  setNewHotelStep(prev => Math.min(6, prev + 1));
                }}
                className="px-5 py-2.5 bg-[#1C1C19] hover:bg-[#735C00] text-[#FAF6F0] text-xs font-label-md uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 font-bold"
              >
                Tiếp tục
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRegisterHotelSubmit}
                className="px-6 py-2.5 bg-[#735C00] hover:bg-[#1C1C19] text-[#FAF6F0] text-xs font-label-md uppercase tracking-wider rounded-xl transition-all duration-300 font-bold flex items-center gap-1.5 hover:scale-[1.02]"
              >
                <CheckCircle className="h-4.5 w-4.5" />
                Gửi hồ sơ duyệt
              </button>
            )}
          </div>

        </div>

        {/* Lớp phủ hiển thị trạng thái đang xử lý nộp hồ sơ */}
        {isSubmittingHotel && (
          <div className="absolute inset-0 bg-[#FAF6F0]/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-200">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-[#735C00]/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#735C00] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-center space-y-1.5">
              <h4 className="font-display-lg text-[#1C1C19] font-bold text-sm uppercase tracking-widest">Đang xử lý hồ sơ</h4>
              <p className="font-body-md text-xs text-[#735C00] animate-pulse font-bold">{hotelUploadStep}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

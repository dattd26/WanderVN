// Kiểu dữ liệu cho luồng onboarding partner (chủ khách sạn) — chỉ phía client cho tới khi backend sẵn sàng.

export type PropertyCategory =
  | 'boutique'
  | 'resort'
  | 'villa'
  | 'heritage'
  | 'homestay'
  | 'apartment';

export interface PropertyCategoryOption {
  value: PropertyCategory;
  label: string;
  description: string;
}

export const PROPERTY_CATEGORIES: PropertyCategoryOption[] = [
  { value: 'boutique', label: 'Boutique Hotel', description: 'Khách sạn nhỏ, độc đáo, giàu cá tính' },
  { value: 'resort', label: 'Luxury Resort', description: 'Khu nghỉ dưỡng cao cấp đa tiện ích' },
  { value: 'villa', label: 'Private Villa', description: 'Biệt thự riêng tư cho thuê nguyên căn' },
  { value: 'heritage', label: 'Heritage Stay', description: 'Lưu trú di sản, kiến trúc cổ kính' },
  { value: 'homestay', label: 'Homestay', description: 'Nhà nghỉ chủ địa phương, gần gũi' },
  { value: 'apartment', label: 'Serviced Apartment', description: 'Căn hộ dịch vụ tiêu chuẩn cao' },
];

export interface PartnerPhoto {
  /** ID local sinh bằng crypto.randomUUID() — chỉ dùng phía client cho list/reorder */
  id: string;
  /** Object URL preview (URL.createObjectURL) */
  previewUrl: string;
  file: File;
  caption?: string;
}

export interface PartnerRoomType {
  id: string;
  name: string;
  description: string;
  capacity: number;
  pricePerNight: number;
  quantity: number;
}

export interface PartnerOnboardingData {
  // ── Step 1: Welcome — không có field, chỉ là intro
  acceptedPartnerTerms: boolean;

  // ── Step 2: Property Info
  propertyName: string;
  propertyType: PropertyCategory | '';
  starRating: 3 | 4 | 5 | null;
  streetAddress: string;
  latitude: number | null;
  longitude: number | null;
  description: string;

  // ── Step 3: Photos
  photos: PartnerPhoto[];

  // ── Step 4: Pricing — danh sách loại phòng cơ bản
  roomTypes: PartnerRoomType[];
  /** Chính sách hủy phòng — preset đơn giản */
  cancellationPolicy: 'flexible' | 'moderate' | 'strict' | '';
}

export const DEFAULT_ONBOARDING_DATA: PartnerOnboardingData = {
  acceptedPartnerTerms: false,
  propertyName: '',
  propertyType: '',
  starRating: 4,
  streetAddress: '',
  latitude: null,
  longitude: null,
  description: '',
  photos: [],
  roomTypes: [],
  cancellationPolicy: '',
};

/** Kết quả autocomplete từ Nominatim OpenStreetMap (subset các trường ta dùng) */
export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

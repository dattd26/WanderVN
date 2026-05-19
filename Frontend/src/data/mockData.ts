// Dữ liệu cấu hình hỗ trợ phân cấp địa danh tại Việt Nam

import type { LocationDto } from '../types';

// Danh sách địa điểm phân cấp tại Việt Nam khớp với Cập nhật Cơ sở Dữ liệu của chúng ta
export const MOCK_LOCATIONS: LocationDto[] = [
  // Tỉnh/Thành phố lớn
  { id: 1, name: 'Hà Giang', type: 'Province' },
  { id: 2, name: 'Hà Nội', type: 'City' },
  { id: 3, name: 'Đà Nẵng', type: 'Province' },
  { id: 18, name: 'Quảng Nam', type: 'Province' },
  { id: 32, name: 'Kiên Giang', type: 'Province' },
  { id: 4, name: 'Lâm Đồng', type: 'Province' },
  { id: 5, name: 'Khánh Hòa', type: 'Province' },

  // Quận/Huyện thuộc tỉnh/thành
  { id: 101, name: 'Phú Quốc', type: 'District', parentId: 32 },
  { id: 102, name: 'Hội An', type: 'District', parentId: 18 },
  { id: 103, name: 'Quận Hải Châu', type: 'District', parentId: 3 },
  { id: 104, name: 'Quận Ngũ Hành Sơn', type: 'District', parentId: 3 },
  { id: 105, name: 'Đồng Văn', type: 'District', parentId: 1 },
  { id: 106, name: 'Mèo Vạc', type: 'District', parentId: 1 },
  { id: 107, name: 'Quận Hoàn Kiếm', type: 'District', parentId: 2 },
  { id: 108, name: 'Đà Lạt', type: 'District', parentId: 4 },
  { id: 109, name: 'Nha Trang', type: 'District', parentId: 5 },

  // Khu vực/Phường xã
  { id: 501, name: 'Bãi Trường', type: 'Area', parentId: 101 },
  { id: 502, name: 'Dương Đông', type: 'Area', parentId: 101 },
  { id: 504, name: 'Cẩm Châu', type: 'Area', parentId: 102 },

  // Địa danh du lịch/Danh lam thắng cảnh
  { id: 503, name: 'Bãi Sao', type: 'Attraction', parentId: 101 },
  { id: 505, name: 'Phố Cổ Hội An', type: 'Attraction', parentId: 102 },
  { id: 506, name: 'Biển Mỹ Khê', type: 'Attraction', parentId: 104 },
  { id: 507, name: 'Hồ Hoàn Kiếm', type: 'Attraction', parentId: 107 }
];

// Bản đồ dịch các loại địa điểm sang tiếng Việt để hiển thị trong gợi ý gợi ý Autocomplete
export const LOCATION_TYPE_LABELS: Record<string, string> = {
  Province: 'Tỉnh/Thành phố',
  City: 'Thành phố lớn',
  District: 'Quận/Huyện',
  Area: 'Khu vực/Phường xã',
  Attraction: 'Điểm du lịch/Danh lam'
};

import type { LocationDto, SearchHotelsDto } from '../types';

// Danh sách địa điểm phân cấp tại Việt Nam khớp với Cập nhật Cơ sở Dữ liệu của chúng ta
export const MOCK_LOCATIONS: LocationDto[] = [
  // Tỉnh/Thành phố lớn
  { id: 1, name: 'Hà Giang', type: 'Province' },
  { id: 2, name: 'Hà Nội', type: 'Province' },
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

// Danh sách khách sạn dự phòng (Fallback) phong cách Luxury Editorial
export const MOCK_HOTELS: SearchHotelsDto[] = [
  {
    id: 1,
    name: 'The Ancient Lantern Retreat',
    address: 'Đường Trần Phú, Phố Cổ Hội An, Quảng Nam',
    starRating: 5,
    description: 'Nằm ngay trung tâm phố cổ Hội An, ngôi nhà cổ thế kỷ 19 được phục dựng tỉ mỉ này mang đến một không gian thanh bình tuyệt đối. Thức dậy với hương hoa nhài và ánh sáng dịu nhẹ của đèn lồng lụa phản chiếu trên bức tường đá vôi cổ kính.',
    locationName: 'Hội An',
    primaryImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    minPrice: 2800000
  },
  {
    id: 2,
    name: 'Anantara River Oasis',
    address: 'Đường Huyền Trân Công Chúa, Cẩm Châu, Hội An',
    starRating: 5,
    description: 'Khu nghỉ dưỡng ven sông thanh bình kết hợp hài hòa giữa nét thanh lịch của kiến trúc thuộc địa Pháp và phong cách thiết kế truyền thống Việt Nam. Thưởng thức những bữa tối độc bản bên dòng sông Thu Bồn lững lờ trôi.',
    locationName: 'Hội An',
    primaryImage: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    minPrice: 4500000
  },
  {
    id: 3,
    name: 'WanderVN InterContinental Phu Quoc',
    address: 'Bãi Trường, Dương Tơ, Phú Quốc, Kiên Giang',
    starRating: 5,
    description: 'Tận hưởng sự sang trọng tinh tế trên hòn đảo ngọc Phú Quốc. Khu nghỉ dưỡng sở hữu tầm nhìn vô cực hướng biển Tây tuyệt đẹp, những căn suite đẳng cấp và dịch vụ spa nổi tiếng trên mặt nước hồ sen tĩnh lặng.',
    locationName: 'Phú Quốc',
    primaryImage: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
    minPrice: 3800000
  },
  {
    id: 4,
    name: 'Ha Giang Misty Peaks Lodge',
    address: 'Thị trấn Đồng Văn, Đồng Văn, Hà Giang',
    starRating: 4,
    description: 'Ẩn hiện giữa những đỉnh núi đá vôi mờ sương của cao nguyên đá Đồng Văn, căn lodge mộc mạc mang lại trải nghiệm bản địa cao cấp vượt bậc. Nơi hoàn hảo để ngắm nhìn bình minh rực rỡ len qua làn sương ban mai.',
    locationName: 'Hà Giang',
    primaryImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
    minPrice: 1900000
  }
];

// Bản đồ dịch các loại địa điểm sang tiếng Việt để hiển thị trong gợi ý gợi ý Autocomplete
export const LOCATION_TYPE_LABELS: Record<string, string> = {
  Province: 'Tỉnh/Thành phố',
  District: 'Quận/Huyện',
  Area: 'Khu vực/Phường xã',
  Attraction: 'Điểm du lịch/Danh lam'
};

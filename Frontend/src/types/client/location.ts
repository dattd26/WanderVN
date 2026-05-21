// Định nghĩa địa điểm phân cấp địa lý (Tỉnh/Thành phố, Quận/Huyện, Khu vực/Phường xã)

export interface LocationDto {
  id: number;
  name: string;
  type: 'Province' | 'District' | 'Area' | 'Attraction' | 'City';
  parentId?: number;
}

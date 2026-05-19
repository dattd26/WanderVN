// Định nghĩa loại hình lưu trú (Khách sạn, Resort, Villa, Homestay...)

export interface PropertyType {
  id: number;
  name: string;
  code: string; // HOTEL, RESORT, VILLA, HOMESTAY...
}

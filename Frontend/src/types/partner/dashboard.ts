/**
 * DTO mô tả cấu trúc dữ liệu khách sạn trả về cho trang dashboard của đối tác.
 * Đồng bộ chính xác với class PartnerHotelDto của C# backend.
 */
export interface PartnerHotelDto {
  /** ID duy nhất của khách sạn trong cơ sở dữ liệu */
  id: number;
  
  /** Tên cơ sở lưu trú */
  name: string;
  
  /** Địa chỉ chi tiết */
  address?: string;
  
  /** Hạng sao (thường từ 1 - 5) */
  starRating?: number;
  
  /** Mô tả giới thiệu về khách sạn */
  description?: string;
  
  /** 
   * Trạng thái phê duyệt khách sạn:
   * 0 = Pending (Đang chờ duyệt)
   * 1 = Approved (Đã phê duyệt / Hoạt động)
   * 2 = Rejected (Bị từ chối)
   */
  status: number;
  
  /** Tên hiển thị dạng chữ của trạng thái (ví dụ: "Pending", "Approved", "Rejected") */
  statusName: string;
  
  /** Chính sách hủy phòng đã chọn */
  cancellationPolicy?: string;
  
  /** Lý do bị admin từ chối duyệt (chỉ có khi status = 2) */
  rejectReason?: string;
  
  /** Thời điểm gửi yêu cầu duyệt */
  submittedAt?: string;
  
  /** Thời điểm được admin phê duyệt */
  approvedAt?: string;
  
  /** Thời điểm tạo bản ghi */
  createdAt?: string;
  
  /** Tên điểm đến/vùng địa lý (ví dụ: "Hội An", "Hà Nội") */
  locationName?: string;
  
  /** Tên loại hình bất động sản bằng tiếng Việt (ví dụ: "Khu nghỉ dưỡng", "Biệt thự") */
  propertyTypeName?: string;
  
  /** Mã code loại hình bất động sản (ví dụ: "resort", "villa") */
  propertyTypeCode?: string;
  
  /** Đường dẫn ảnh đại diện chính của khách sạn (lấy từ bảng HotelImages) */
  primaryImageUrl?: string;
  
  /** Số lượng loại phòng đã cấu hình (RoomTypeCount) */
  roomTypeCount: number;
  
  /** Tổng số lượng booking đang hoạt động của khách sạn này (TotalBookings) */
  totalBookings: number;
}

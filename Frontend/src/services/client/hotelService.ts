import { request } from '../shared/apiClient';
import type { HotelDetailDto, CreateHotelBookingRequest, HotelBookingResponse ,HotelBookingHistoryDto} from '../../types';

export const hotelService = {
  /**
   * Lấy chi tiết thông tin khách sạn và danh sách các hạng phòng có sẵn theo ID
   */

  async getHotelDetail(id: number | string): Promise<HotelDetailDto> {
    return request<HotelDetailDto>(`/hotels/${id}`);
  },

  /**
   * Thực hiện đặt phòng khách sạn thông qua API và lưu vào cơ sở dữ liệu
   */
  async createHotelBooking(bookingRequest: CreateHotelBookingRequest): Promise<HotelBookingResponse> {
    return request<HotelBookingResponse>('/bookings/hotel', {
      method: 'POST',
      body: JSON.stringify(bookingRequest),
    });
  },
  async getMyHotelBookings(): Promise<HotelBookingHistoryDto[]> {
    return request<HotelBookingHistoryDto[]>('/bookings/history');
  }
  
};


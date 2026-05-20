// Dịch vụ API xử lý Tìm kiếm chuyến bay và Đặt vé máy bay

import { request } from './apiClient';
import type { FlightSearchQuery, DuffelResponse, CreateFlightBookingRequest, FlightBookingResponse } from '../types';

const BASE_URL = 'http://localhost:5096/api/v1';

export const flightService = {
  /**
    * Tìm kiếm chuyến bay thời gian thực.
    * Endpoint này trả về trực tiếp JSON thô từ Duffel (không bọc qua ApiResponse).
    * Do đó chúng ta tự thực hiện fetch thuần để lấy đúng cấu trúc.
    */
  async searchFlights(query: FlightSearchQuery): Promise<DuffelResponse> {
    const response = await fetch(`${BASE_URL}/search/flights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`Lỗi tìm kiếm chuyến bay từ Duffel Sandbox: ${response.status} ${response.statusText}. Chi tiết: ${errorBody}`);
    }

    return response.json();
  },

  /**
    * Đặt vé máy bay và lưu thông tin vào SQL Server DB.
    * Phản hồi ở đây bọc qua ApiResponse chuẩn nên dùng hàm helper request.
    */
  async createBooking(bookingRequest: CreateFlightBookingRequest): Promise<FlightBookingResponse> {
    return request<FlightBookingResponse>('/bookings/flight', {
      method: 'POST',
      body: JSON.stringify(bookingRequest),
    });
  }
};

export default flightService;

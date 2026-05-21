import { request } from '../shared/apiClient';
import type { FlightSearchQuery, FlightOfferDto, CreateFlightBookingRequest, FlightBookingResponse } from '../../types';

export const flightService = {
  /**
    * Tìm kiếm chuyến bay thời gian thực, trả về danh sách DTO tối giản.
    */
  async searchFlights(query: FlightSearchQuery): Promise<FlightOfferDto[]> {
    return request<FlightOfferDto[]>('/search/flights', {
      method: 'POST',
      body: JSON.stringify(query),
    });
  },

  /**
    * Đặt vé máy bay và lưu thông tin vào SQL Server DB.
    */
  async createBooking(bookingRequest: CreateFlightBookingRequest): Promise<FlightBookingResponse> {
    return request<FlightBookingResponse>('/bookings/flight', {
      method: 'POST',
      body: JSON.stringify(bookingRequest),
    });
  }
};

export default flightService;

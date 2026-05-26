import { request } from '../shared/apiClient';
import type { FlightSearchQuery, FlightOfferDto, CreateFlightBookingRequest, FlightBookingResponse, FlightOfferDetailDto } from '../../types';

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
    * Lấy chi tiết đầy đủ một Offer từ backend theo offerId.
    * Gọi endpoint: GET /api/v1/flights/validate-offer/{offerId}
    */
  async getOfferDetail(offerId: string): Promise<FlightOfferDetailDto> {
    const url = `/flights/validate-offer/${offerId}`;
    console.log('offerId:', offerId);
    console.log('API URL:', url);
    const result = await request<FlightOfferDetailDto>(url);
    console.log('API Response:', result);
    return result;
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

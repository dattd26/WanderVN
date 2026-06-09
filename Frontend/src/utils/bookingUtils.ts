import type { BookingHistoryDto, HotelBookingHistoryDetail, FlightBookingHistoryDetail, FlightPassengerInfo } from '../types';

export interface RawBookingData {
  bookingId?: number;
  bookingCode?: string;
  totalPrice?: number;
  status?: string;
  createdAt?: string;
  serviceType?: string;
  hotelDetails?: HotelBookingHistoryDetail | null;
  flightDetails?: FlightBookingHistoryDetail | null;
  hotelId?: number;
  hotelName?: string;
  hotelAddress?: string;
  hotelImage?: string;
  roomTypeName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  airlineName?: string;
  airlineLogo?: string;
  flightNumber?: string;
  depAirportCode?: string;
  arrAirportCode?: string;
  depAirportCity?: string;
  arrAirportCity?: string;
  depTime?: string;
  arrTime?: string;
  passengers?: FlightPassengerInfo[];
}

export const normalizeBookingData = (data: RawBookingData): BookingHistoryDto => {
  if (data.serviceType && (data.hotelDetails || data.flightDetails)) {
    return data as BookingHistoryDto;
  }

  const isFlight = !!data.airlineName || !!data.flightNumber;
  const isHotel = !!data.hotelName || !!data.hotelId;
  const serviceType = isFlight ? 'Flight' : (isHotel ? 'Hotel' : 'Unknown');

  return {
    bookingId: data.bookingId ?? 0,
    bookingCode: data.bookingCode ?? '',
    totalPrice: data.totalPrice ?? 0,
    status: data.status ?? '',
    createdAt: data.createdAt ?? '',
    serviceType: serviceType,
    hotelDetails: serviceType === 'Hotel' ? {
      hotelId: data.hotelId ?? 0,
      hotelName: data.hotelName ?? '',
      hotelAddress: data.hotelAddress ?? '',
      hotelImage: data.hotelImage ?? '',
      roomTypeName: data.roomTypeName ?? '',
      checkInDate: data.checkInDate ?? '',
      checkOutDate: data.checkOutDate ?? '',
    } : null,
    flightDetails: serviceType === 'Flight' ? {
      airlineName: data.airlineName ?? '',
      airlineLogo: data.airlineLogo ?? '',
      flightNumber: data.flightNumber ?? '',
      depAirportCode: data.depAirportCode ?? '',
      arrAirportCode: data.arrAirportCode ?? '',
      depAirportCity: data.depAirportCity ?? '',
      arrAirportCity: data.arrAirportCity ?? '',
      depTime: data.depTime ?? '',
      arrTime: data.arrTime ?? '',
      passengers: data.passengers || []
    } : null,
  };
};

export interface HotelBookingHistoryDetail {
  hotelId: number;
  hotelName: string;
  hotelAddress: string;
  hotelImage: string;
  roomTypeName: string;
  checkInDate: string; // yyyy-MM-dd
  checkOutDate: string; // yyyy-MM-dd
}

export interface FlightPassengerInfo {
  passengerName: string;
  passportNumber: string;
  seatNumber: string;
}

export interface FlightBookingHistoryDetail {
  airlineName: string;
  airlineLogo: string;
  flightNumber: string;
  depAirportCode: string;
  arrAirportCode: string;
  depAirportCity: string;
  arrAirportCity: string;
  depTime: string; // yyyy-MM-dd HH:mm
  arrTime: string; // yyyy-MM-dd HH:mm
  passengers?: FlightPassengerInfo[];
}

export interface BookingHistoryDto {
  bookingId: number;
  bookingCode: string;
  totalPrice: number;
  status: string; // 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | etc.
  createdAt: string;
  serviceType: string; // 'Hotel' | 'Flight'
  hotelDetails: HotelBookingHistoryDetail | null;
  flightDetails: FlightBookingHistoryDetail | null;
}

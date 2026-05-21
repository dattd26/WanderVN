// Định nghĩa các interface liên quan đến Tìm kiếm & Đặt vé máy bay (Duffel API)

export interface FlightSearchQuery {
  origin: string;
  destination: string;
  departureDate: string;
  passengerType?: string;
  returnOffers?: boolean;
}

export interface FlightOfferDto {
  id: string; // ID của ưu đãi Duffel (off_...)
  totalAmount: number; // Tổng chi phí đã quy đổi
  totalCurrency: string; // Đồng tiền thanh toán (ví dụ: USD, VND)
  passengerId: string; // ID hành khách mock
  duration: string; // Thời lượng bay (ví dụ: PT2H15M)
  originCode: string; // Mã sân bay đi (ví dụ: HAN)
  originName: string; // Tên sân bay đi
  destinationCode: string; // Mã sân bay đến (ví dụ: SGN)
  destinationName: string; // Tên sân bay đến
  departingAt: string; // Thời gian khởi hành (ISO string)
  arrivingAt: string; // Thời gian đến nơi (ISO string)
  carrierCode: string; // Mã hãng bay (ví dụ: VN, VJ)
  carrierName: string; // Tên hãng bay
  carrierLogoUrl: string; // URL Logo thương gia
  aircraftName: string; // Dòng máy bay
  duffelAirwaysOfferId: string; // ID Duffel Airways Offer dùng để đặt vé sandbox thành công 100%
  duffelAirwaysPassengerId: string; // ID hành khách tương ứng của Duffel Airways
}

export interface PassengerDto {
  id: string; // ID của hành khách lấy từ Duffel Offer
  title: string; // mr, ms, mrs
  familyName: string;
  givenName: string;
  bornOn: string; // YYYY-MM-DD
  email: string;
  phoneNumber: string;
  gender: string; // m, f
  passportNumber: string;
}

export interface CreateFlightBookingRequest {
  userId: number;
  offerId: string;
  totalPrice: number;
  passengers: PassengerDto[];
}

export interface FlightBookingResponse {
  bookingId: number;
  bookingCode: string;
  totalPrice: number;
  status: string;
}

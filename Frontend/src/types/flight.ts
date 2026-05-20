// Định nghĩa các interface liên quan đến Tìm kiếm & Đặt vé máy bay (Duffel API)

export interface FlightSearchQuery {
  origin: string;
  destination: string;
  departureDate: string;
  passengerType?: string;
  returnOffers?: boolean;
}

export interface DuffelCarrier {
  iata_code: string;
  name: string;
  logo_symbol_url: string | null;
}

export interface DuffelAircraft {
  name: string;
}

export interface DuffelLocation {
  iata_code: string;
  name: string;
  city_name: string;
}

export interface DuffelSegment {
  id: string;
  duration: string;
  origin: DuffelLocation;
  destination: DuffelLocation;
  departing_at: string;
  arriving_at: string;
  operating_carrier: DuffelCarrier;
  aircraft: DuffelAircraft | null;
}

export interface DuffelSlice {
  id: string;
  duration: string;
  segments: DuffelSegment[];
}

export interface DuffelOffer {
  id: string;
  total_amount: string;
  total_currency: string;
  passengers: {
    id: string;
    type: string;
  }[];
  slices: DuffelSlice[];
  owner: DuffelCarrier;
}

export interface DuffelResponse {
  data: {
    offers: DuffelOffer[];
  };
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

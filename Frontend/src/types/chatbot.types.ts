export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  hotelSuggestions?: HotelSuggestion[];
  flightSearchUrl?: string;
}

export interface HotelSuggestion {
  hotelId: number;
  name: string;
  address?: string;
  starRating?: number;
  price?: number;
  reason?: string;
}

export interface ChatbotRequest {
  userId?: number;
  message: string;
  conversationId?: number;
  checkInDate?: string;
  checkOutDate?: string;
  location?: string;
  guests?: number;
}

export interface ChatbotResponse {
  id?: number;
  reply?: string;
  timestamp?: string;
  hotelSuggestions?: HotelSuggestion[];
  flightSearchUrl?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data?: T;
}

export interface ChatHistoryMessage {
  text: string;
  isFromBot: boolean;
  sentAt: string;
}

export interface ChatHistoryResponse {
  messages: ChatHistoryMessage[];
}

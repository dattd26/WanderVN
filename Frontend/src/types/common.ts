// Định nghĩa các interface chung cho API phản hồi từ ASP.NET Core Backend

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
}

export interface SearchAutocompleteDto {
  id: string;      // loc_xxx hoặc hotel_xxx
  type: 'Location' | 'Hotel';
  name: string;
  subtitle: string;
  targetId: number;
}

// Interface TypeScript ánh xạ với UserDto từ ASP.NET Core Backend

export interface UserDto {
  id: number;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  roleName?: string;
  isActive?: boolean;
  createdAt?: string; // ISO 8601 string từ DateTimeOffset
}

// Interface ánh xạ với UserDetailsDto từ Backend (dùng cho xem chi tiết 1 người dùng)
export interface UserHotelDto {
  id: number;
  name: string;
  address?: string;
  starRating?: number;
}

export interface UserDetailsDto {
  id: number;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  roleName?: string;
  hotels?: UserHotelDto[];
}

// Interface ánh xạ với PagedResult<T> từ Backend
export interface PagedResult<T> {
  items: T[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Query params cho API GET /users/customers
export interface GetUsersQuery {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  pageNumber?: number;
  pageSize?: number;
}

// Dịch vụ API xử lý tìm kiếm lưu trú và gợi ý tự động (Autocomplete)

import { request } from '../shared/apiClient';
import type { SearchHotelsDto, SearchHotelsQuery, SearchAutocompleteDto, AirportDto } from '../../types';

export const searchService = {
  /**
   * Tìm kiếm danh sách các khách sạn theo bộ lọc chỉ định
   */
  async searchHotels(query: SearchHotelsQuery): Promise<SearchHotelsDto[]> {
    const params = new URLSearchParams();
    if (query.locationId !== undefined) params.append('LocationId', query.locationId.toString());
    if (query.checkInDate) params.append('CheckInDate', query.checkInDate);
    if (query.checkOutDate) params.append('CheckOutDate', query.checkOutDate);
    if (query.capacity !== undefined) params.append('Capacity', query.capacity.toString());
    if (query.minPrice !== undefined) params.append('MinPrice', query.minPrice.toString());
    if (query.maxPrice !== undefined) params.append('MaxPrice', query.maxPrice.toString());
    if (query.pageNumber !== undefined) params.append('PageNumber', query.pageNumber.toString());
    if (query.pageSize !== undefined) params.append('PageSize', query.pageSize.toString());

    return request<SearchHotelsDto[]>(`/search/hotels?${params.toString()}`);
  },

  /**
   * Truy vấn danh mục gợi ý tự động (Autocomplete) dựa trên từ khóa người dùng gõ
   */
  async getAutocomplete(keyword: string): Promise<SearchAutocompleteDto[]> {
    if (!keyword.trim()) return [];
    return request<SearchAutocompleteDto[]>(`/search/autocomplete?Keyword=${encodeURIComponent(keyword)}`);
  },

  /**
   * Truy vấn danh sách sân bay cho form tìm kiếm chuyến bay
   */
  async getAirports(keyword?: string): Promise<AirportDto[]> {
    const params = keyword?.trim() ? `?keyword=${encodeURIComponent(keyword.trim())}` : '';
    return request<AirportDto[]>(`/search/airports${params}`);
  }
};

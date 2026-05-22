// Dịch vụ API quản lý người dùng - kết nối với UsersController ASP.NET Core

import { request } from './apiClient';
import type { UserDto, UserDetailsDto, PagedResult, GetUsersQuery } from '../types';

export const userService = {
  /**
   * Lấy danh sách khách hàng (Customer) với tìm kiếm và phân trang
   * GET api/v1/users/customers?FullName=...&Email=...&PageNumber=1&PageSize=10
   */
  async getCustomers(query?: GetUsersQuery): Promise<PagedResult<UserDto>> {
    const params = new URLSearchParams();
    if (query?.fullName) params.append('FullName', query.fullName);
    if (query?.email) params.append('Email', query.email);
    if (query?.phoneNumber) params.append('PhoneNumber', query.phoneNumber);
    if (query?.pageNumber !== undefined) params.append('PageNumber', query.pageNumber.toString());
    if (query?.pageSize !== undefined) params.append('PageSize', query.pageSize.toString());

    const queryString = params.toString();
    return request<PagedResult<UserDto>>(`/users/customers${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Lấy thông tin chi tiết 1 khách hàng theo ID
   * GET api/v1/users/customers/{id}
   */
  async getCustomerById(id: number): Promise<UserDetailsDto> {
    return request<UserDetailsDto>(`/users/customers/${id}`);
  },
};

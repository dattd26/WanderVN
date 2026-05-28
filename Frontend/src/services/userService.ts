// Dịch vụ API quản lý người dùng - kết nối với UsersController ASP.NET Core

import { request } from './shared/apiClient';
import type { UserDto, UserDetailsDto, PagedResult, GetUsersQuery, CreateCustomerPayload, UpdateCustomerPayload, ChangePartnerPasswordPayload } from '../types';

export const userService = {
  async getCustomers(query?: GetUsersQuery): Promise<PagedResult<UserDto>> {
    const params = new URLSearchParams();
    if (query?.fullName) params.append('FullName', query.fullName);
    if (query?.email) params.append('Email', query.email);
    if (query?.phoneNumber) params.append('PhoneNumber', query.phoneNumber);
    if (query?.pageNumber !== undefined) params.append('PageNumber', query.pageNumber.toString());
    if (query?.pageSize !== undefined) params.append('PageSize', query.pageSize.toString());
    if (query?.isActive !== undefined) params.append('IsActive', query.isActive.toString());

    const queryString = params.toString();
    return request<PagedResult<UserDto>>(`/users/customers${queryString ? `?${queryString}` : ''}`);
  },
  async getCustomerById(id: number): Promise<UserDetailsDto> {
    return request<UserDetailsDto>(`/users/customers/${id}`);
  },

  async createCustomer(payload: CreateCustomerPayload): Promise<UserDto> {
    return request<UserDto>('/users/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async updateCustomer(id: number, payload: UpdateCustomerPayload): Promise<UserDto> {
    return request<UserDto>(`/users/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async deleteCustomer(id: number): Promise<boolean> {
    return request<boolean>(`/users/customers/${id}`, {
      method: 'DELETE',
    });
  },
  async getPartners(query?: GetUsersQuery): Promise<PagedResult<UserDto>> {
    const params = new URLSearchParams();
    if (query?.fullName) params.append('FullName', query.fullName);
    if (query?.email) params.append('Email', query.email);
    if (query?.phoneNumber) params.append('PhoneNumber', query.phoneNumber);
    if (query?.pageNumber !== undefined) params.append('PageNumber', query.pageNumber.toString());
    if (query?.pageSize !== undefined) params.append('PageSize', query.pageSize.toString());
    if (query?.isActive !== undefined) params.append('IsActive', query.isActive.toString());
    if (query?.status !== undefined) params.append('Status', query.status.toString());
    if (query?.roleName) params.append('RoleName', query.roleName);

    const queryString = params.toString();
    return request<PagedResult<UserDto>>(`/users/partners${queryString ? `?${queryString}` : ''}`);
  },
  async toggleActive(id: number, isActive: boolean): Promise<UserDto> {
    return request<UserDto>(`/users/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });
  },

  async getPartnerById(id: number): Promise<UserDetailsDto> {
    return request<UserDetailsDto>(`/users/partners/${id}`);
  },

  async changePartnerPassword(id: number, payload: ChangePartnerPasswordPayload): Promise<boolean> {
    return request<boolean>(`/users/partners/${id}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async approvePartner(id: number): Promise<boolean> {
    return request<boolean>(`/users/partners/${id}/approve`, {
      method: 'POST',
    });
  },

  async rejectPartner(id: number, rejectReason: string): Promise<boolean> {
    return request<boolean>(`/users/partners/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rejectReason }),
    });
  }
};

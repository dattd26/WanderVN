// Dịch vụ API tải danh sách vai trò (Roles) - kết nối RolesController ASP.NET Core

import { request } from './shared/apiClient';
import type { RoleDto } from '../types';

export const roleService = {
  async getRoles(): Promise<RoleDto[]> {
    return request<RoleDto[]>('/roles');
  },
};

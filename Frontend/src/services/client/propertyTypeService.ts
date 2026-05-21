// Dịch vụ API tải danh mục loại hình lưu trú

import { request } from '../shared/apiClient';
import type { PropertyType } from '../../types';

export const propertyTypeService = {
  /**
   * Lấy danh sách toàn bộ loại hình lưu trú đang hoạt động từ ASP.NET Core Backend
   */
  async getPropertyTypes(): Promise<PropertyType[]> {
    return request<PropertyType[]>('/property-types');
  }
};

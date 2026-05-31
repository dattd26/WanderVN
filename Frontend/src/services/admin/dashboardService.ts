// Dịch vụ API cho Admin Dashboard — kết nối với AdminDashboardController

import { request } from '../shared/apiClient';
import type { AdminDashboardStatsDto } from '../../types';

export const dashboardService = {
  /**
   * Lấy toàn bộ thống kê cho trang Admin Dashboard.
   * GET /api/v1/admin/dashboard/stats
   */
  async getStats(): Promise<AdminDashboardStatsDto> {
    return request<AdminDashboardStatsDto>('/admin/dashboard/stats');
  }
};

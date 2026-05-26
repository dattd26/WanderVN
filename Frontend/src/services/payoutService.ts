// Dịch vụ API tài chính (Partner Payouts) - kết nối với PayoutsController ASP.NET Core

import { request } from './apiClient';
import type {
  PagedResult,
  PayoutDto,
  PayoutStatsDto,
  GetPayoutsQuery,
  ConfirmPayoutPayload,
} from '../types';

export const payoutService = {
  async getPayouts(query?: GetPayoutsQuery): Promise<PagedResult<PayoutDto>> {
    const params = new URLSearchParams();
    if (query?.keyword) params.append('Keyword', query.keyword);
    if (query?.status) params.append('Status', query.status);
    if (query?.fromDate) params.append('FromDate', query.fromDate);
    if (query?.toDate) params.append('ToDate', query.toDate);
    if (query?.pageNumber !== undefined) params.append('PageNumber', query.pageNumber.toString());
    if (query?.pageSize !== undefined) params.append('PageSize', query.pageSize.toString());

    const qs = params.toString();
    return request<PagedResult<PayoutDto>>(`/payouts${qs ? `?${qs}` : ''}`);
  },

  async getStats(): Promise<PayoutStatsDto> {
    return request<PayoutStatsDto>('/payouts/stats');
  },

  async confirmPayout(id: number, payload?: ConfirmPayoutPayload): Promise<boolean> {
    return request<boolean>(`/payouts/${id}/confirm`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload ?? {}),
    });
  },
};

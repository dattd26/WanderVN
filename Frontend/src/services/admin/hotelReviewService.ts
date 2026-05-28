// Service gọi API Admin để duyệt hồ sơ khách sạn

import { request } from '../shared/apiClient';
import type {
    AdminHotelDetailDto,
    AdminHotelPagedResult,
    HotelReviewCounts,
} from '../../types';

export const adminHotelReviewService = {
    /**
     * Lấy danh sách hồ sơ khách sạn để duyệt.
     * @param params.status 0=Pending, 1=Approved, 2=Rejected, undefined=tất cả
     */
    getHotelsForReview(params: {
        status?: number;
        pageNumber?: number;
        pageSize?: number;
    }): Promise<AdminHotelPagedResult> {
        const qs = new URLSearchParams();
        if (params.status !== undefined) qs.append('status', String(params.status));
        qs.append('pageNumber', String(params.pageNumber ?? 1));
        qs.append('pageSize', String(params.pageSize ?? 10));
        return request<AdminHotelPagedResult>(`/admin/hotels?${qs.toString()}`);
    },

    getCounts(): Promise<HotelReviewCounts> {
        return request<HotelReviewCounts>('/admin/hotels/counts');
    },

    getHotelDetail(id: number): Promise<AdminHotelDetailDto> {
        return request<AdminHotelDetailDto>(`/admin/hotels/${id}`);
    },

    async approveHotel(id: number): Promise<void> {
        await request<unknown>(`/admin/hotels/${id}/approve`, { method: 'POST' });
    },

    async rejectHotel(id: number, reason: string): Promise<void> {
        await request<unknown>(`/admin/hotels/${id}/reject`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        });
    },
};

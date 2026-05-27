import { request } from '../shared/apiClient';
import type { PagedResult } from '../../types';

export interface ReviewRoomType {
  name: string;
  summary: string;
  icon: string;
  price: string;
}

export interface HotelReviewDto {
  id: number;
  name: string;
  location: string;
  category: string;
  partnerName: string;
  partnerCode: string;
  submittedAt: string;
  submittedTime: string;
  status: 'pending' | 'approved' | 'rejected';
  thumbnail: string;
  gallery: string[];
  description: string;
  area: string;
  scale: string;
  roomTypes: ReviewRoomType[];
  rejectReason?: string;
}

export const hotelReviewService = {
  async getHotelsReview(params: {
    status?: number; // 0: pending, 1: approved, 2: rejected
    pageNumber: number;
    pageSize: number;
  }): Promise<PagedResult<HotelReviewDto>> {
    const urlParams = new URLSearchParams();
    if (params.status !== undefined) urlParams.append('status', params.status.toString());
    urlParams.append('pageNumber', params.pageNumber.toString());
    urlParams.append('pageSize', params.pageSize.toString());

    return request<PagedResult<HotelReviewDto>>(`/hotels/review?${urlParams.toString()}`);
  },

  async approveHotel(id: number): Promise<boolean> {
    return request<boolean>(`/hotels/${id}/approve`, {
      method: 'POST',
    });
  },

  async rejectHotel(id: number, rejectReason: string): Promise<boolean> {
    return request<boolean>(`/hotels/${id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rejectReason }),
    });
  },
};

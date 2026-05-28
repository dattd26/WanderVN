export type HotelReviewStatus = 0 | 1 | 2; // 0=Pending, 1=Approved, 2=Rejected

export interface AdminHotelListItemDto {
    id: number;
    name: string;
    address?: string | null;
    status: HotelReviewStatus;
    statusName: string;
    rejectReason?: string | null;
    submittedAt?: string | null;
    approvedAt?: string | null;
    createdAt?: string | null;
    starRating?: number | null;
    propertyTypeName?: string | null;
    propertyTypeCode?: string | null;
    locationName?: string | null;
    primaryImageUrl?: string | null;
    ownerName?: string | null;
    ownerEmail?: string | null;
}

export interface AdminHotelRoomTypeDto {
    id: number;
    name: string;
    basePrice: number;
    capacity: number;
    totalRooms: number;
    description?: string | null;
}

export interface AdminHotelDetailDto extends AdminHotelListItemDto {
    description?: string | null;
    cancellationPolicy?: string | null;
    ownerPhone?: string | null;
    imageUrls: string[];
    roomTypes: AdminHotelRoomTypeDto[];
}

// Khớp shape `PagedResult<T>` của backend (dùng totalCount + totalPages)
export interface AdminHotelPagedResult {
    items: AdminHotelListItemDto[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface HotelReviewCounts {
    pending: number;
    approved: number;
    rejected: number;
}

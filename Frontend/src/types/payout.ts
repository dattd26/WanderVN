// Kiểu dữ liệu cho Tài chính / Đối soát thanh toán Partner

export type PayoutStatus = 'Pending' | 'Processing' | 'Paid' | 'Failed' | 'Cancelled';

export type ServiceType = 'Hotel' | 'Flight' | string;

export interface PayoutDto {
  id: number;

  partnerId: number;
  partnerName?: string | null;
  partnerEmail?: string | null;
  partnerAvatarUrl?: string | null;

  bookingId: number;
  bookingCode: string;
  serviceType: string;
  bookingStatus?: string | null;
  paymentStatus?: string | null;
  bookingCreatedAt?: string | null;

  grossAmount: number;
  commissionAmount: number;
  netAmount: number;

  status: PayoutStatus;
  payoutMethod: string;
  paidAt?: string | null;
  transactionReference?: string | null;
  checkedOutAt?: string | null;
  createdAt: string;
}

export interface PayoutStatsDto {
  totalNetPending: number;
  totalCommission: number;
  totalRevenue: number;
  activePartners: number;
}

export interface GetPayoutsQuery {
  keyword?: string;
  status?: PayoutStatus | '';
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface ConfirmPayoutPayload {
  transactionReference?: string;
  payoutMethod?: string;
}

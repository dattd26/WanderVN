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

export interface PartnerPayoutSummaryDto {
  grossTotal: number;
  commissionTotal: number;
  netTotal: number;
  pendingBalance: number;
  paidThisMonth: number;
  commissionRate: number; // e.g., 0.10 for 10%
}

export interface BatchPayoutDto {
  id: number;
  bookingCode: string;
  netAmount: number;
}

export interface PartnerBatchDto {
  id: number;
  batchCode: string;
  totalGross: number;
  totalCommission: number;
  totalNet: number;
  bookingCount: number;
  status: string; // "Processing", "Paid", "Cancelled"
  note?: string;
  paidAt?: string;
  transactionReference?: string;
  createdAt: string;
  payouts?: BatchPayoutDto[];
}

export interface GetPartnerTransactionsQuery {
  status?: PayoutStatus | '';
  pageNumber?: number;
  pageSize?: number;
}

export interface GetPartnerBatchesQuery {
  pageNumber?: number;
  pageSize?: number;
}

export const PAYOUT_STATUS_LABEL: Record<PayoutStatus, string> = {
  Pending: 'Chờ chi trả',
  Processing: 'Đang xử lý',
  Paid: 'Đã chi trả',
  Failed: 'Từ chối / Thất bại',
  Cancelled: 'Bị hủy',
};

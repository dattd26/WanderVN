import { request } from '../shared/apiClient';

export interface CreateVNPayUrlRequest {
  bookingId: number;
}

export interface CreateZaloPayUrlRequest {
  bookingId: number;
}

export const paymentService = {
  /**
   * Khởi tạo URL thanh toán VNPay cho đơn hàng.
   */
  async createVNPayUrl(req: CreateVNPayUrlRequest): Promise<string> {
    return request<string>('/payments/create-vnpay-url', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  /**
   * Khởi tạo URL thanh toán ZaloPay cho đơn hàng.
   */
  async createZaloPayUrl(req: CreateZaloPayUrlRequest): Promise<string> {
    return request<string>('/payments/create-zalopay-url', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }
};

export default paymentService;

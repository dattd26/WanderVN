// API Client helper cho kết nối backend dùng fetch thuần gọn nhẹ và hiệu năng cao

import type { ApiResponse } from '../../types';

const BASE_URL = 'http://localhost:5096/api/v1';

export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  // Lấy JWT token từ localStorage của trình duyệt
  const token = localStorage.getItem('token');
  
  // Xác định xem body gửi đi có phải là định dạng FormData (để upload ảnh/file) hay không
  const isFormData = options?.body instanceof FormData;
  
  // Khởi tạo đối tượng headers trống
  const headers: Record<string, string> = {};
  
  // Chỉ cấu hình Content-Type là JSON nếu dữ liệu gửi đi không phải là FormData
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Ghép các cấu hình headers tùy chọn được truyền vào từ tham số hàm
  if (options?.headers) {
    Object.assign(headers, options.headers);
  }
  
  // Tự động đính kèm mã JWT dưới dạng Bearer Token vào header Authorization nếu tìm thấy
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = errorData?.message || `Lỗi kết nối API: ${response.statusText} (${response.status})`;
    throw new Error(message);
  }

  const result: ApiResponse<T> = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Lỗi xử lý nghiệp vụ tại C# Backend');
  }

  return result.data;
}


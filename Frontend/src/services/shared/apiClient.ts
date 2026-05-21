// API Client helper cho kết nối backend dùng fetch thuần gọn nhẹ và hiệu năng cao

import type { ApiResponse } from '../../types';

const BASE_URL = 'http://localhost:5096/api/v1';

export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
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

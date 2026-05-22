// Dịch vụ Geocoding kết nối tới Backend WanderVN — backend sẽ cache kết quả Nominatim trong DB

import { request } from '../shared/apiClient';
import type { GeocodeLocationDto } from '../../types';

export const geocodingService = {
  /**
   * Lấy tọa độ lat/lng của một Location đã có trong DB.
   * Backend sẽ tự động gọi Nominatim API nếu DB chưa có (lần đầu), và cache cho lần sau.
   */
  async geocodeLocation(locationId: number): Promise<GeocodeLocationDto> {
    return request<GeocodeLocationDto>(`/geocoding/location/${locationId}`);
  }
};

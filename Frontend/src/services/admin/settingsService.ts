import { request } from '../shared/apiClient';

export interface SettingDto {
  key: string;
  value: string;
}

export const settingsService = {
  getSetting: async (key: string): Promise<SettingDto> => {
    return request<SettingDto>(`/settings/${key}`);
  },

  updateSetting: async (key: string, value: string): Promise<SettingDto> => {
    return request<SettingDto>(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  },
};

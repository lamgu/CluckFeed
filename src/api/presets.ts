import { api } from './client';
import type { PresetItem } from '../types';

export const presetsApi = {
  getAll: () => api.get<PresetItem[]>('/presets'),
  create: (data: Omit<PresetItem, 'id'>) => api.post<PresetItem>('/presets', data),
  update: (id: string, data: Partial<PresetItem>) => api.put<PresetItem>(`/presets/${id}`, data),
  remove: (id: string) => api.delete<{ success: boolean }>(`/presets/${id}`),
};


import { api } from './client';
import type { HopperItem } from '../types';

export const hoppersApi = {
  getAll: () => api.get<HopperItem[]>('/hoppers'),
  update: (id: number, data: Partial<HopperItem>) => api.put<HopperItem>(`/hoppers/${id}`, data),
  provision: (hoppers: { id: number; ingredientName: string; targetKg: number; icon: string }[]) =>
    api.post<HopperItem[]>('/hoppers/provision', { hoppers }),
};


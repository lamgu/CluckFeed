import { api } from './client';
import type { HistoryFormulaItem } from '../types';

export const historyApi = {
  getAll: () => api.get<HistoryFormulaItem[]>('/history'),
  create: (data: Omit<HistoryFormulaItem, 'id'> & { id?: string }) => api.post<HistoryFormulaItem>('/history', data),
  update: (id: string, data: Partial<HistoryFormulaItem>) => api.put<HistoryFormulaItem>(`/history/${id}`, data),
  remove: (id: string) => api.delete<{ success: boolean }>(`/history/${id}`),
};


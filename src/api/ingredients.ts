import { api } from './client';
import type { Ingredient } from '../types';

export const ingredientsApi = {
  getAll: () => api.get<Ingredient[]>('/ingredients'),
  update: (id: string, data: Partial<Ingredient>) => api.put<Ingredient>(`/ingredients/${id}`, data),
  create: (data: Omit<Ingredient, 'id'> & { id?: string }) => api.post<Ingredient>('/ingredients', data),
  remove: (id: string) => api.delete<{ success: boolean }>(`/ingredients/${id}`),
};


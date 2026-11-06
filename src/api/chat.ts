import { api } from './client';
import type { ChatMessage } from '../types';

export const chatApi = {
  getHistory: (sessionId: string) => api.get<ChatMessage[]>(`/chat/${sessionId}`),
  saveMessage: (data: Omit<ChatMessage, 'id'> & { id?: string; sessionId?: string }) =>
    api.post<ChatMessage>('/chat', data),
  clearSession: (sessionId: string) => api.delete<{ success: boolean }>(`/chat/${sessionId}`),
};


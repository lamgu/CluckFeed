import { api } from './client';

export interface FarmConfig {
  farm_name: string;
  farm_location: string;
  owner_name: string;
  iot_status: string;
  app_version: string;
  [key: string]: string;
}

export interface KandangItem {
  id: string;
  nama: string;
  fase: string;
  populasi: number;
  umurHari: number;
  bobotRataKg: number;
}

export interface SensorData {
  suhu: number;
  kelembaban: number;
  sisaPakanKg: number;
  targetFcr: number;
  recordedAt?: string;
}

export interface FeedScheduleItem {
  id: number;
  jam: string;
  label: string;
  porsiKg: number;
  status: 'selesai' | 'standby' | 'terjadwal';
  notes: string;
}

export const farmApi = {
  getConfig: () => api.get<FarmConfig>('/farm/config'),
  updateConfig: (data: Partial<FarmConfig>) => api.put<FarmConfig>('/farm/config', data),
  getKandang: () => api.get<KandangItem[]>('/farm/kandang'),
  updateKandang: (id: string, data: Partial<KandangItem>) => api.put<KandangItem>(`/farm/kandang/${id}`, data),
  getLatestSensor: () => api.get<SensorData>('/farm/sensor/latest'),
  postSensor: (data: SensorData) => api.post<{ success: boolean }>('/farm/sensor', data),
  getFeedSchedule: () => api.get<FeedScheduleItem[]>('/farm/feed-schedule'),
  updateFeedSchedule: (id: number, data: Partial<FeedScheduleItem>) => api.put<FeedScheduleItem>(`/farm/feed-schedule/${id}`, data),
};


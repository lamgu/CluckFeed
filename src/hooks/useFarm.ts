import { useState, useEffect, useCallback } from 'react';
import { farmApi, type FarmConfig, type KandangItem, type SensorData, type FeedScheduleItem } from '../api/farm';

const DEFAULT_CONFIG: FarmConfig = {
  farm_name: 'Peternakan Berkah Sejahtera',
  farm_location: 'Blitar',
  owner_name: 'Pak Budi',
  iot_status: 'terhubung',
  app_version: 'v1.4.0',
};

const DEFAULT_KANDANG: KandangItem[] = [
  { id: 'kandang-a', nama: 'Kandang A', fase: 'Fase Finisher', populasi: 2500, umurHari: 32, bobotRataKg: 1.85 },
  { id: 'kandang-b', nama: 'Kandang B', fase: 'Fase Grower', populasi: 1800, umurHari: 14, bobotRataKg: 0.52 },
];

const DEFAULT_SENSOR: SensorData = { suhu: 29.4, kelembaban: 68, sisaPakanKg: 1250, targetFcr: 1.48 };

const DEFAULT_SCHEDULE: FeedScheduleItem[] = [
  { id: 1, jam: '07:00', label: 'Pemberian Pagi (Kandang A & B)', porsiKg: 150, status: 'selesai', notes: 'Porsi 150 kg Broiler Finisher' },
  { id: 2, jam: '12:00', label: 'Pemberian Siang', porsiKg: 150, status: 'selesai', notes: 'Porsi 150 kg + Elektrolit Air Minum' },
  { id: 3, jam: '16:30', label: 'Pemberian Sore', porsiKg: 200, status: 'standby', notes: 'Porsi 200 kg Menjelang Istirahat' },
];

export function useFarm() {
  const [config, setConfig] = useState<FarmConfig>(DEFAULT_CONFIG);
  const [kandang, setKandang] = useState<KandangItem[]>(DEFAULT_KANDANG);
  const [sensor, setSensor] = useState<SensorData>(DEFAULT_SENSOR);
  const [schedule, setSchedule] = useState<FeedScheduleItem[]>(DEFAULT_SCHEDULE);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [cfg, knd, sen, sched] = await Promise.all([
        farmApi.getConfig(),
        farmApi.getKandang(),
        farmApi.getLatestSensor(),
        farmApi.getFeedSchedule(),
      ]);
      setConfig(cfg);
      setKandang(knd);
      setSensor(sen);
      setSchedule(sched);
      setOffline(false);
    } catch (e) {
      console.warn('[useFarm] API unavailable, using defaults:', e);
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updateKandang = useCallback(async (id: string, data: Partial<KandangItem>) => {
    setKandang(prev => prev.map(k => k.id === id ? { ...k, ...data } : k));
    if (!offline) farmApi.updateKandang(id, data).catch(console.error);
  }, [offline]);

  const updateConfig = useCallback(async (data: Partial<FarmConfig>) => {
    setConfig(prev => ({ ...prev, ...(data as Record<string, string>) }));
    if (!offline) farmApi.updateConfig(data).catch(console.error);
  }, [offline]);

  const updateScheduleStatus = useCallback(async (id: number, status: FeedScheduleItem['status']) => {
    setSchedule(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    if (!offline) farmApi.updateFeedSchedule(id, { status }).catch(console.error);
  }, [offline]);

  return { config, kandang, sensor, schedule, loading, offline, updateKandang, updateConfig, updateScheduleStatus, refetch: fetchAll };
}


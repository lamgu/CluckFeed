import { useState, useEffect, useCallback } from 'react';
import { hoppersApi } from '../api/hoppers';
import { INITIAL_HOPPERS } from '../data/mockData';
import type { HopperItem } from '../types';

export function useHoppers() {
  const [hoppers, setHoppers] = useState<HopperItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  const fetchHoppers = useCallback(async () => {
    try {
      const data = await hoppersApi.getAll();
      setHoppers(data);
      setOffline(false);
    } catch (e) {
      console.warn('[useHoppers] API unavailable:', e);
      setHoppers(INITIAL_HOPPERS);
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHoppers(); }, [fetchHoppers]);

  const updateHopper = useCallback(async (id: number, data: Partial<HopperItem>) => {
    setHoppers(prev => prev.map(h => h.id === id ? { ...h, ...data } : h));
    if (!offline) hoppersApi.update(id, data).catch(console.error);
  }, [offline]);

  return { hoppers, loading, offline, updateHopper, refetch: fetchHoppers };
}


import { useState, useEffect, useCallback } from 'react';
import { presetsApi } from '../api/presets';
import { INITIAL_PRESETS } from '../data/mockData';
import type { PresetItem } from '../types';

const STORAGE_KEY = 'cluckfeed_presets_store';

export function usePresets() {
  const [presets, setPresets] = useState<PresetItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse presets from localStorage', e);
    }
    return INITIAL_PRESETS;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncState = (items: PresetItem[]) => {
    setPresets(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to persist presets to localStorage', e);
    }
  };

  const fetchPresets = useCallback(async () => {
    try {
      const data = await presetsApi.getAll();
      syncState(data);
      setError(null);
    } catch (e) {
      console.warn('[usePresets] API unavailable, using cached/local data:', e);
      setError('offline');
      if (localStorage.getItem(STORAGE_KEY) === null) {
        syncState(INITIAL_PRESETS);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  const addPreset = useCallback(async (data: Omit<PresetItem, 'id'>) => {
    if (error !== 'offline') {
      try {
        const created = await presetsApi.create(data);
        setPresets(prev => {
          const next = [created, ...prev.filter(p => p.id !== created.id)];
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
          return next;
        });
        return created;
      } catch (err) {
        console.warn('Failed to add preset via API', err);
      }
    }
    const newPreset: PresetItem = {
      ...data,
      id: 'p-' + Date.now(),
      isCustom: true
    };
    setPresets(prev => {
      const next = [newPreset, ...prev.filter(p => p.id !== newPreset.id)];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    return newPreset;
  }, [error]);

  const updatePreset = useCallback(async (id: string, patch: Partial<PresetItem>) => {
    if (error !== 'offline') {
      try {
        const updated = await presetsApi.update(id, patch);
        setPresets(prev => {
          const next = prev.map(p => p.id === id ? updated : p);
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
          return next;
        });
        return updated;
      } catch (err) {
        console.warn('Failed to update preset via API', err);
      }
    }
    let updatedItem: PresetItem | undefined;
    setPresets(prev => {
      const next = prev.map(p => {
        if (p.id === id) {
          updatedItem = { ...p, ...patch };
          return updatedItem;
        }
        return p;
      });
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    return updatedItem;
  }, [error]);

  const removePreset = useCallback(async (id: string) => {
    setPresets(prev => {
      const next = prev.filter(p => p.id !== id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    if (error !== 'offline') {
      try {
        await presetsApi.remove(id);
      } catch (err) {
        console.warn('Failed to remove preset via API', err);
      }
    }
  }, [error]);

  const clearAllPresets = useCallback(async () => {
    const current = [...presets];
    syncState([]);
    if (error !== 'offline') {
      await Promise.all(current.map(p => presetsApi.remove(p.id).catch(() => {})));
    }
  }, [presets, error]);

  return {
    presets,
    loading,
    error,
    addPreset,
    updatePreset,
    removePreset,
    clearAllPresets,
    refetch: fetchPresets
  };
}

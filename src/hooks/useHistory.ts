import { useState, useEffect, useCallback } from 'react';
import { historyApi } from '../api/history';
import { INITIAL_HISTORY } from '../data/mockData';
import type { HistoryFormulaItem } from '../types';

const STORAGE_KEY = 'cluckfeed_formula_history_store';

export function useHistory() {
  const [history, setHistory] = useState<HistoryFormulaItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse history from localStorage', e);
    }
    return INITIAL_HISTORY;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncState = (items: HistoryFormulaItem[]) => {
    setHistory(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to persist history to localStorage', e);
    }
  };

  const fetchHistory = useCallback(async () => {
    try {
      const data = await historyApi.getAll();
      syncState(data);
      setError(null);
    } catch (e) {
      console.warn('[useHistory] API unavailable, using cached/local data:', e);
      setError('offline');
      // If nothing in localStorage, initialize with INITIAL_HISTORY
      if (localStorage.getItem(STORAGE_KEY) === null) {
        syncState(INITIAL_HISTORY);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const addHistory = useCallback(async (data: Omit<HistoryFormulaItem, 'id'> & { id?: string }) => {
    if (error !== 'offline') {
      try {
        const created = await historyApi.create(data);
        setHistory(prev => {
          const next = [created, ...prev.filter(h => h.id !== created.id)];
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
          return next;
        });
        return created;
      } catch (err) {
        console.warn('Failed to add via API, falling back to local', err);
      }
    }
    const newItem: HistoryFormulaItem = {
      ...data,
      id: data.id || ('hist-' + Date.now()),
    } as HistoryFormulaItem;
    setHistory(prev => {
      const next = [newItem, ...prev.filter(h => h.id !== newItem.id)];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    return newItem;
  }, [error]);

  const updateHistory = useCallback(async (id: string, patch: Partial<HistoryFormulaItem>) => {
    if (error !== 'offline') {
      try {
        const updated = await historyApi.update(id, patch);
        setHistory(prev => {
          const next = prev.map(h => h.id === id ? updated : h);
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
          return next;
        });
        return updated;
      } catch (err) {
        console.warn('Failed to update via API, falling back to local', err);
      }
    }
    let updatedItem: HistoryFormulaItem | undefined;
    setHistory(prev => {
      const next = prev.map(h => {
        if (h.id === id) {
          updatedItem = { ...h, ...patch };
          return updatedItem;
        }
        return h;
      });
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    return updatedItem;
  }, [error]);

  const removeHistory = useCallback(async (id: string) => {
    setHistory(prev => {
      const next = prev.filter(h => h.id !== id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    if (error !== 'offline') {
      try {
        await historyApi.remove(id);
      } catch (err) {
        console.warn('Failed to remove via API', err);
      }
    }
  }, [error]);

  const clearAllHistory = useCallback(async () => {
    const current = [...history];
    syncState([]);
    if (error !== 'offline') {
      await Promise.all(current.map(h => historyApi.remove(h.id).catch(() => {})));
    }
  }, [history, error]);

  return {
    history,
    loading,
    error,
    addHistory,
    updateHistory,
    removeHistory,
    clearAllHistory,
    refetch: fetchHistory
  };
}

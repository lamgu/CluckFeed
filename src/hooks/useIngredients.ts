import { useState, useEffect, useCallback } from 'react';
import { ingredientsApi } from '../api/ingredients';
import { INITIAL_INGREDIENTS } from '../data/mockData'; // fallback
import type { Ingredient } from '../types';

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIngredients = useCallback(async () => {
    try {
      const data = await ingredientsApi.getAll();
      setIngredients(data);
      setError(null);
    } catch (e) {
      console.warn('[useIngredients] API unavailable, using mock data:', e);
      setIngredients(INITIAL_INGREDIENTS);
      setError('offline');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchIngredients(); }, [fetchIngredients]);

  const toggleIngredient = useCallback(async (id: string) => {
    const ing = ingredients.find(i => i.id === id);
    if (!ing) return;
    const updated = { ...ing, selected: !ing.selected };
    setIngredients(prev => prev.map(i => i.id === id ? updated : i));
    if (error !== 'offline') {
      ingredientsApi.update(id, { selected: updated.selected }).catch(console.error);
    }
  }, [ingredients, error]);

  const updateIngredient = useCallback(async (id: string, data: Partial<Ingredient>) => {
    setIngredients(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
    if (error !== 'offline') {
      ingredientsApi.update(id, data).catch(console.error);
    }
  }, [error]);

  const addIngredient = useCallback(async (data: Omit<Ingredient, 'id'> & { id?: string }) => {
    if (error !== 'offline') {
      const created = await ingredientsApi.create(data);
      setIngredients(prev => [...prev, created]);
      return created;
    } else {
      const newIng: Ingredient = { ...data, id: 'custom-' + Date.now() } as Ingredient;
      setIngredients(prev => [...prev, newIng]);
      return newIng;
    }
  }, [error]);

  const removeIngredient = useCallback(async (id: string) => {
    setIngredients(prev => prev.filter(i => i.id !== id));
    if (error !== 'offline') {
      ingredientsApi.remove(id).catch(console.error);
    }
  }, [error]);

  const resetDefaults = useCallback(async () => {
    setIngredients(prev => prev.map(i => ({ ...i, selected: INITIAL_INGREDIENTS.find(d => d.id === i.id)?.selected ?? i.selected })));
    if (error !== 'offline') {
      INITIAL_INGREDIENTS.forEach(d => {
        ingredientsApi.update(d.id, { selected: d.selected }).catch(console.error);
      });
    }
  }, [error]);

  return { ingredients, loading, error, toggleIngredient, updateIngredient, addIngredient, removeIngredient, resetDefaults, refetch: fetchIngredients };
}


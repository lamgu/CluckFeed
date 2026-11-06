import { useState, useEffect, useCallback } from 'react';
import { farmApi } from '../api/farm';

export interface MarketPrices {
  broiler: number; // Rp / kg pakan komersil pakan jadi
  layer: number;   // Rp / kg pakan komersil pakan jadi
}

const STORAGE_KEY = 'cluckfeed_market_prices';
const DEFAULT_PRICES: MarketPrices = {
  broiler: 8500,
  layer: 7500,
};

export function useMarketPrices() {
  const [marketPrices, setMarketPrices] = useState<MarketPrices>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse market prices from localStorage', e);
    }
    return DEFAULT_PRICES;
  });

  // Sync from farm config if available
  useEffect(() => {
    farmApi.getConfig().then((cfg) => {
      const broilerPrice = cfg.market_price_broiler ? Number(cfg.market_price_broiler) : null;
      const layerPrice = cfg.market_price_layer ? Number(cfg.market_price_layer) : null;
      if (broilerPrice || layerPrice) {
        setMarketPrices(prev => {
          const updated = {
            broiler: broilerPrice || prev.broiler,
            layer: layerPrice || prev.layer,
          };
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
          return updated;
        });
      }
    }).catch(() => {
      // Offline mode or server not running
    });
  }, []);

  const updateMarketPrices = useCallback(async (newPrices: Partial<MarketPrices>) => {
    setMarketPrices(prev => {
      const next = { ...prev, ...newPrices };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save market prices to localStorage', e);
      }
      return next;
    });

    try {
      const configPatch: Record<string, string> = {};
      if (newPrices.broiler !== undefined) configPatch.market_price_broiler = String(newPrices.broiler);
      if (newPrices.layer !== undefined) configPatch.market_price_layer = String(newPrices.layer);
      await farmApi.updateConfig(configPatch);
    } catch (e) {
      // Silently fall back to localStorage
    }
  }, []);

  return {
    marketPrices,
    updateMarketPrices,
  };
}


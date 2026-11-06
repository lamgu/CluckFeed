import { Ingredient, PresetItem, HistoryFormulaItem, HopperItem } from '../types';
import { CSV_SHEET1_INGREDIENTS } from './sheet1Ingredients';

export const INITIAL_INGREDIENTS: Ingredient[] = CSV_SHEET1_INGREDIENTS;

import { SPEK_CSV_PRESETS } from './spekTemplateData';

export const INITIAL_PRESETS: PresetItem[] = [
  ...SPEK_CSV_PRESETS,
  {
    id: 'p-custom-hemat',
    title: 'Hemat Broiler Mandiri',
    phase: '13–28 hari',
    category: 'custom',
    standardBadge: 'Custom Peternak',
    pk: '19.2%',
    em: '2.980 kkal',
    ca: '0.90%',
    note: 'Formula racik hemat biaya kandang sendiri',
    icon: 'star',
    isCustom: true,
    isFavorite: true
  }
];

export const INITIAL_HISTORY: HistoryFormulaItem[] = [
  {
    id: 'hist-1',
    title: 'Broiler Finisher 500 kg',
    batchInfo: 'Batch #14 • Kandang A (32 Hari)',
    timeStr: 'Hari ini, 09:30 WIB',
    status: 'layak',
    statusLabel: 'Layak SNI',
    pills: ['Jagung 52%', 'SBM 20%', 'Dedak 20%', 'Premix 8%'],
    totalWeight: 500,
    costPerKg: 6850,
    totalCost: 3425000,
    icon: 'grain',
    category: 'layak'
  },
  {
    id: 'hist-2',
    title: 'Broiler Starter Premium',
    batchInfo: 'Batch #13 • Kandang B (Fase Awal)',
    timeStr: '12 Okt 2024, 14:15 WIB',
    status: 'layak',
    statusLabel: 'Layak SNI',
    pills: ['Jagung 48%', 'SBM 28%', 'Minyak Ikan 4%', 'Asam Amino 2%'],
    totalWeight: 250,
    costPerKg: 7100,
    totalCost: 1775000,
    icon: 'egg_alt',
    category: 'layak'
  },
  {
    id: 'hist-3',
    title: 'Layer Masa Pullet (14 Mgg)',
    batchInfo: 'Eksperimen #02 • Ras Lohmann Brown',
    timeStr: '08 Okt 2024, 11:00 WIB',
    status: 'koreksi',
    statusLabel: 'Perlu Koreksi',
    pills: ['Jagung 60%', 'Dedak 25%', 'SBM 15%'],
    totalWeight: 100,
    costPerKg: 5950,
    totalCost: 595000,
    icon: 'science',
    category: 'koreksi',
    correctionAlert: 'Defisit Kalsium 0.4% — Tambahkan tepung cangkang kerang sebelum mixing.'
  }
];

export const INITIAL_HOPPERS: HopperItem[] = [
  {
    id: 1,
    name: 'Hopper 1: Jagung Kuning',
    ingredientName: 'Jagung Kuning',
    targetKg: 260.0,
    currentKg: 260.0,
    status: 'selesai',
    icon: 'grain'
  },
  {
    id: 2,
    name: 'Hopper 2: Bungkil Kedelai',
    ingredientName: 'Bungkil Kedelai (SBM)',
    targetKg: 100.0,
    currentKg: 52.5,
    status: 'menimbang',
    icon: 'eco'
  },
  {
    id: 3,
    name: 'Hopper 3: Dedak Padi',
    ingredientName: 'Dedak Padi Halus',
    targetKg: 100.0,
    currentKg: 0.0,
    status: 'antrean',
    icon: 'spa'
  },
  {
    id: 4,
    name: 'Hopper 4: Mikro & Premix',
    ingredientName: 'Premix & Mineral',
    targetKg: 40.0,
    currentKg: 0.0,
    status: 'antrean',
    icon: 'medication'
  }
];

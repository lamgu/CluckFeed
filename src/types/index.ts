export type CategoryType = 'semua' | 'energi' | 'protein' | 'mineral' | 'aditif';

export interface Ingredient {
  id: string;
  name: string;
  subname: string;
  category: 'energi' | 'protein' | 'mineral' | 'aditif';
  defaultPrice: number;
  currentPrice: number;
  protein: number; // in %
  energy: number;  // in kkal/kg (EM)
  calcium: number; // in %
  phosphorus: number; // in %
  fiber?: number; // in %
  lysine?: number; // in %
  methionine?: number; // in %
  fat?: number; // in %
  minConstraint?: number; // %
  maxConstraint?: number; // %
  hasConstraint: boolean;
  isFixed?: boolean;
  fixedPercent?: number;
  icon: string;
  selected: boolean;
  inStockKg: number;
  tag1?: string;
  tag2?: string;
}

export type LivestockType = 'broiler' | 'layer';
export type AgeUnit = 'hari' | 'minggu';

export interface TargetNutrisi {
  pkMin: number;
  pkMax: number;
  emMin: number;
  emMax: number;
  caMin: number;
  caMax: number;
  pMin: number;
  pMax: number;
  lysMetMin: number;
  lysMetMax: number;
}

export interface FormulaResultData {
  id: string;
  batchName: string;
  batchNumber: string;
  dateStr: string;
  livestock: LivestockType;
  phase: string;
  totalBatchKg: number;
  isFeasible: boolean;
  totalCost: number;
  costPerKg: number;
  savingPercent: number;
  savingAmount: number;
  ingredients: {
    id: string;
    name: string;
    percentage: number;
    kg: number;
    costPerKg: number;
    totalCost: number;
    color: string;
    icon: string;
  }[];
  nutrients: {
    pk: { val: number; min: number; max: number; ok: boolean; percentProgress: number };
    em: { val: number; min: number; max: number; ok: boolean; percentProgress: number };
    ca: { val: number; min: number; max: number; ok: boolean; percentProgress: number };
    p:  { val: number; min: number; max: number; ok: boolean; percentProgress: number };
  };
  deficits?: {
    name: string;
    target: string;
    current: string;
    gap: string;
    progressPercent: number;
    color: string;
  }[];
  causeText?: string;
  expertAdvice?: string;
}

export interface PresetItem {
  id: string;
  title: string;
  phase: string;
  category: 'broiler' | 'layer' | 'custom';
  standardBadge: string;
  pk: string;
  em: string;
  ca: string;
  note: string;
  icon: string;
  isCustom?: boolean;
  isFavorite?: boolean;
}

export interface HopperItem {
  id: number;
  name: string;
  ingredientName: string;
  targetKg: number;
  currentKg: number;
  status: 'selesai' | 'menimbang' | 'antrean';
  icon: string;
}

export interface HistoryFormulaItem {
  id: string;
  title: string;
  batchInfo: string;
  timeStr: string;
  status: 'layak' | 'koreksi';
  statusLabel: string;
  pills: string[];
  totalWeight: number;
  costPerKg: number;
  totalCost: number;
  icon: string;
  category: 'layak' | 'koreksi';
  correctionAlert?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  richCard?: {
    type: 'substitution';
    title: string;
    matchRate: string;
    headline: string;
    desc: string;
    pkCurrent: string;
    pkTarget: string;
    costImpact: string;
    totalCost: string;
    note: string;
  };
  isOffline?: boolean;
}

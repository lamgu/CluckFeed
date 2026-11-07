export type CategoryType = 'semua' | 'energi' | 'protein' | 'mineral' | 'aditif';

export interface Ingredient {
  id: string;
  name: string;
  subname: string;
  category: 'energi' | 'protein' | 'mineral' | 'aditif';
  defaultPrice: number;
  currentPrice: number;
  protein: number;       // Protein Kasar (%)
  energy: number;        // Energi Met (kkal/kg)
  fat?: number;          // Lemak (%)
  fiber?: number;        // Serat Kasar (%)
  pati?: number;         // Pati (%)
  moisture?: number;     // Kadar Air (%)
  dryMatter?: number;    // Bahan Kering (%)
  ash?: number;          // Abu (%)
  calcium: number;       // Calcium (%)
  phosphorus: number;    // Phos Total (%)
  phosAvailable?: number;// Phos Available (%)
  sodium?: number;       // Na (%)
  chloride?: number;     // Cl (%)
  lysine?: number;       // Lysine tercerna (%)
  methionine?: number;   // Methionine tercerna (%)
  metCys?: number;       // Met+Cys tercerna (%)
  threonine?: number;    // Threonine tercerna (%)
  tryptophan?: number;   // Tryptophane tercerna (%)
  arginine?: number;     // Arginine tercerna (%)
  isoleucine?: number;   // Isoleucine tercerna (%)
  valine?: number;       // Valine tercerna (%)
  choline?: number;      // Choline (mg/kg)
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

export interface NutrientConstraint {
  min: number | null;
  max: number | null;
  enabled: boolean;
}

export interface TargetNutrisi {
  pkMin?: number;
  pkMax?: number;
  emMin?: number;
  emMax?: number;
  caMin?: number;
  caMax?: number;
  pMin?: number;
  pMax?: number;
  lysMetMin?: number;
  lysMetMax?: number;
  nutrients?: Record<string, NutrientConstraint>;
}

export interface LPNutrientResult {
  id: string;
  name: string;
  unit: string;
  min: number | null;
  max: number | null;
  calculated: number;
  status: 'ok' | 'below_min' | 'above_max' | 'unconstrained';
  enabled: boolean;
}

export interface LPIngredientResult {
  id: string;
  name: string;
  percentage: number;      // 0-100
  kg: number;
  costPerKg: number;
  totalCost: number;
  color: string;
  icon: string;
}

export type LPSolverStatus = 'optimal' | 'infeasible' | 'error';

export type FormulaIngredientItem = {
  id: string;
  name: string;
  percentage: number;
  kg: number;
  costPerKg: number;
  totalCost: number;
  color: string;
  icon: string;
};

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
  costPerTon?: number;
  marketPrice?: number;
  savingPercent: number;
  savingAmount: number;
  ingredients: FormulaIngredientItem[];
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
  solverStatus?: LPSolverStatus;
  solverMessage?: string;
  nutrientResults?: LPNutrientResult[];
  totalFormulaPct?: number;
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

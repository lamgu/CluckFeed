/**
 * CluckFeed Least Cost Linear Programming Solver
 * Uses javascript-lp-solver for deterministic optimization
 * Model: MIN Z = Σ(price_i × x_i) subject to constraints
 */

import { Ingredient, LPNutrientResult, LPIngredientResult, LPSolverStatus } from '../types';
// @ts-ignore
import solverPkg from 'javascript-lp-solver';

const solver = (solverPkg as any).default || solverPkg;

export interface NutrientConstraintSpec {
  id: string;
  name: string;
  unit: string;
  field: keyof Ingredient; // which field on Ingredient holds the lab value
  min: number | null;
  max: number | null;
  enabled: boolean;
}

export interface LPSolverInput {
  ingredients: Ingredient[]; // all selected ingredients
  nutrientConstraints: NutrientConstraintSpec[];
  batchKg: number;
  marketPricePerKg?: number; // for saving calculation
}

export interface LPSolverOutput {
  status: LPSolverStatus;
  message: string;
  costPerKg: number;
  costPerTon: number;
  totalCost: number;
  totalFormulaPct: number;
  ingredients: LPIngredientResult[];
  nutrients: LPNutrientResult[];
  savingPercent: number;
  savingAmount: number;
}

/** 22 standard nutrient constraint specs matching laboratory & Excel reference */
export const NUTRIENT_SPECS: Omit<NutrientConstraintSpec, 'min' | 'max' | 'enabled'>[] = [
  { id: 'em',            name: 'Energi Metabolis',          unit: 'kkal/kg', field: 'energy' },
  { id: 'protein',       name: 'Protein Kasar (PK)',        unit: '%',       field: 'protein' },
  { id: 'fat',           name: 'Lemak',                     unit: '%',       field: 'fat' },
  { id: 'fiber',         name: 'Serat Kasar',               unit: '%',       field: 'fiber' },
  { id: 'pati',          name: 'Pati',                      unit: '%',       field: 'pati' },
  { id: 'moisture',      name: 'Kadar Air',                 unit: '%',       field: 'moisture' },
  { id: 'dryMatter',     name: 'Bahan Kering',              unit: '%',       field: 'dryMatter' },
  { id: 'ash',           name: 'Abu',                       unit: '%',       field: 'ash' },
  { id: 'calcium',       name: 'Calcium (Ca)',              unit: '%',       field: 'calcium' },
  { id: 'phosphorus',    name: 'Phosphorus Total',          unit: '%',       field: 'phosphorus' },
  { id: 'phosAvailable', name: 'Phosphorus Available (aP)', unit: '%',       field: 'phosAvailable' },
  { id: 'sodium',        name: 'Natrium (Na)',              unit: '%',       field: 'sodium' },
  { id: 'chloride',      name: 'Chlorida (Cl)',             unit: '%',       field: 'chloride' },
  { id: 'lysine',        name: 'Lysine Tercerna',           unit: '%',       field: 'lysine' },
  { id: 'methionine',    name: 'Methionine Tercerna',       unit: '%',       field: 'methionine' },
  { id: 'metCys',        name: 'Met+Cys Tercerna',          unit: '%',       field: 'metCys' },
  { id: 'threonine',     name: 'Threonine Tercerna',        unit: '%',       field: 'threonine' },
  { id: 'tryptophan',    name: 'Tryptophan Tercerna',       unit: '%',       field: 'tryptophan' },
  { id: 'arginine',      name: 'Arginine Tercerna',         unit: '%',       field: 'arginine' },
  { id: 'isoleucine',    name: 'Isoleucine Tercerna',       unit: '%',       field: 'isoleucine' },
  { id: 'valine',        name: 'Valine Tercerna',           unit: '%',       field: 'valine' },
  { id: 'choline',       name: 'Choline',                   unit: 'mg/kg',   field: 'choline' },
];

/** Build full 22-nutrient spec list from a preset dictionary */
export function buildConstraintsFromPreset(preset: Record<string, [number | null, number | null]>): NutrientConstraintSpec[] {
  return NUTRIENT_SPECS.map(spec => {
    const val = preset[spec.id];
    const [mn, mx] = val ?? [null, null];
    return {
      ...spec,
      min: mn,
      max: mx,
      enabled: mn !== null || mx !== null,
    };
  });
}

/** Phase presets matching exact Excel "Speck" sheet specifications */
export const PHASE_PRESETS: Record<string, Record<string, [number | null, number | null]>> = {
  // Ayam Pedaging (Broiler)
  'broiler-starter': {
    em: [2900, null],
    protein: [21.0, null],
    pati: [37.0, null],
    calcium: [0.96, 1.00],
    phosphorus: [0.60, null],
    phosAvailable: [0.58, null],
    sodium: [0.18, 0.20],
    chloride: [0.18, 0.30],
    lysine: [1.26, null],
    methionine: [0.48, null],
    metCys: [0.94, null],
    threonine: [0.86, null],
    tryptophan: [0.21, null],
    arginine: [1.36, null],
    isoleucine: [0.81, null],
    valine: [0.96, null],
    choline: [1600, null],
  },
  'broiler-grower': {
    em: [2950, null],
    protein: [19.0, null],
    pati: [36.0, null],
    calcium: [0.80, 1.00],
    phosphorus: [0.60, null],
    phosAvailable: [0.50, null],
    sodium: [0.18, 0.20],
    chloride: [0.18, 0.30],
    lysine: [1.16, null],
    methionine: [0.47, null],
    metCys: [0.88, null],
    threonine: [0.78, null],
    tryptophan: [0.20, null],
    arginine: [1.25, null],
    isoleucine: [0.75, null],
    valine: [0.88, null],
    choline: [1600, null],
  },
  'broiler-finisher': {
    em: [3050, null],
    protein: [18.0, null],
    pati: [36.0, null],
    calcium: [0.74, 1.00],
    phosphorus: [0.60, null],
    phosAvailable: [0.37, null],
    sodium: [0.18, 0.20],
    chloride: [0.18, 0.30],
    lysine: [1.06, null],
    methionine: [0.44, null],
    metCys: [0.82, null],
    threonine: [0.70, null],
    tryptophan: [0.19, null],
    arginine: [1.16, null],
    isoleucine: [0.69, null],
    valine: [0.82, null],
    choline: [1600, null],
  },

  // Ayam Petelur (Layer)
  'layer-starter': {
    em: [2950, null],
    protein: [20.5, null],
    pati: [37.0, null],
    calcium: [0.80, 1.10],
    phosphorus: [0.60, null],
    phosAvailable: [0.44, null],
    sodium: [0.18, null],
    chloride: [0.16, 0.21],
    lysine: [1.03, null],
    methionine: [0.56, null],
    metCys: [0.89, null],
    threonine: [0.71, null],
    tryptophan: [0.23, null],
    arginine: [1.08, null],
    isoleucine: [0.77, null],
    valine: [0.87, null],
    choline: [1600, null],
  },
  'layer-grower': {
    em: [2850, null],
    protein: [19.0, null],
    pati: [36.0, null],
    calcium: [0.70, 1.00],
    phosphorus: [0.60, null],
    phosAvailable: [0.39, null],
    sodium: [0.18, null],
    chloride: [0.16, 0.21],
    lysine: [0.87, null],
    methionine: [0.45, null],
    metCys: [0.75, null],
    threonine: [0.60, null],
    tryptophan: [0.19, null],
    arginine: [0.91, null],
    isoleucine: [0.65, null],
    valine: [0.74, null],
    choline: [1600, null],
  },
  'layer-developer': {
    em: [2700, null],
    protein: [16.4, null],
    pati: [36.0, null],
    calcium: [0.70, 1.00],
    phosphorus: [0.60, null],
    phosAvailable: [0.38, null],
    sodium: [0.17, null],
    chloride: [0.16, 0.21],
    lysine: [0.67, null],
    methionine: [0.36, null],
    metCys: [0.59, null],
    threonine: [0.46, null],
    tryptophan: [0.16, null],
    arginine: [0.71, null],
    isoleucine: [0.52, null],
    valine: [0.58, null],
    choline: [1500, null],
  },
  'layer-prelayer': {
    em: [2700, null],
    protein: [16.8, null],
    pati: [36.0, null],
    calcium: [2.20, 2.50],
    phosphorus: [0.60, null],
    phosAvailable: [0.38, null],
    sodium: [0.16, null],
    chloride: [0.16, 0.21],
    lysine: [0.73, null],
    methionine: [0.39, null],
    metCys: [0.62, null],
    threonine: [0.50, null],
    tryptophan: [0.17, null],
    arginine: [0.75, null],
    isoleucine: [0.57, null],
    valine: [0.77, null],
    choline: [1400, null],
  },
  'layer-1': {
    em: [2700, 2800],
    protein: [18.0, null],
    pati: [35.0, null],
    calcium: [3.80, null],
    phosphorus: [0.60, null],
    phosAvailable: [0.35, null],
    sodium: [0.16, 0.16],
    chloride: [0.16, 0.21],
    lysine: [0.78, null],
    methionine: [0.390, null],
    metCys: [0.710, null],
    threonine: [0.546, null],
    tryptophan: [0.172, null],
    arginine: [0.811, null],
    isoleucine: [0.624, null],
    valine: [0.686, null],
    choline: [1200, null],
  },
  'layer-2': {
    em: [2700, 2800],
    protein: [17.0, null],
    pati: [35.0, null],
    calcium: [3.90, null],
    phosphorus: [0.60, null],
    phosAvailable: [0.34, null],
    sodium: [0.16, null],
    chloride: [0.16, 0.21],
    lysine: [0.76, null],
    methionine: [0.38, null],
    metCys: [0.692, null],
    threonine: [0.532, null],
    tryptophan: [0.167, null],
    arginine: [0.79, null],
    isoleucine: [0.608, null],
    valine: [0.669, null],
    choline: [1400, null],
  },
  'layer-3': {
    em: [2700, 2800],
    protein: [16.0, null],
    pati: [35.0, null],
    calcium: [4.00, null],
    phosphorus: [0.60, null],
    phosAvailable: [0.32, null],
    sodium: [0.16, null],
    chloride: [0.16, 0.21],
    lysine: [0.74, null],
    methionine: [0.37, null],
    metCys: [0.673, null],
    threonine: [0.518, null],
    tryptophan: [0.163, null],
    arginine: [0.77, null],
    isoleucine: [0.592, null],
    valine: [0.651, null],
    choline: [1400, null],
  },
};

const CHART_COLORS = [
  '#22c55e', '#006e2f', '#7cf994', '#ef9900', '#38bdf8', '#f97316',
  '#a855f7', '#ec4899', '#14b8a6', '#8b5cf6', '#f59e0b', '#06b6d4',
  '#10b981', '#6366f1', '#84cc16', '#f43f5e', '#0ea5e9', '#d946ef',
  '#78716c', '#64748b'
];

/**
 * Pre-solve validation per PRD section 10.
 */
export function validateLPInput(input: LPSolverInput): string[] {
  const errors: string[] = [];
  const { ingredients, nutrientConstraints, batchKg } = input;

  if (!ingredients || ingredients.length === 0) {
    errors.push('Minimal 1 bahan baku harus dipilih untuk formulasi.');
    return errors;
  }
  if (batchKg <= 0 || isNaN(batchKg)) {
    errors.push('Ukuran batch produksi harus lebih dari 0 kg.');
  }

  for (const ing of ingredients) {
    if (ing.currentPrice < 0 || isNaN(ing.currentPrice)) {
      errors.push(`Harga bahan "${ing.name}" tidak boleh bernilai negatif.`);
    }
    const mn = ing.minConstraint ?? 0;
    const mx = ing.maxConstraint ?? 100;
    if (mn < 0 || mx > 100 || mn > mx) {
      errors.push(`Batas inklusi "${ing.name}" tidak valid (Min: ${mn}%, Max: ${mx}%).`);
    }
  }

  // Verify total inclusion ranges
  const sumMins = ingredients.reduce((s, i) => s + (i.minConstraint ?? 0), 0);
  const sumMaxs = ingredients.reduce((s, i) => s + (i.maxConstraint ?? 100), 0);
  if (sumMins > 100.01) {
    errors.push(`Total batas minimum bahan (${sumMins.toFixed(1)}%) melebihi 100%.`);
  }
  if (sumMaxs < 99.99) {
    errors.push(`Total batas maksimum bahan (${sumMaxs.toFixed(1)}%) kurang dari 100%.`);
  }

  for (const nc of nutrientConstraints) {
    if (!nc.enabled) continue;
    if (nc.min !== null && nc.max !== null && nc.min > nc.max) {
      errors.push(`Target "${nc.name}": Min (${nc.min}) tidak boleh lebih besar dari Max (${nc.max}).`);
    }
  }

  return errors;
}

/**
 * Executes Deterministic Linear Programming (Simplex LP).
 * Minimizes Z = Σ (currentPrice_i × x_i)
 * Subject to:
 *   Σ x_i = 1
 *   minInclusion_i <= x_i <= maxInclusion_i
 *   Σ (a_ij × x_i) >= minNutrient_j
 *   Σ (a_ij × x_i) <= maxNutrient_j
 */
export function runLPSolver(input: LPSolverInput): LPSolverOutput {
  const { ingredients, nutrientConstraints, batchKg, marketPricePerKg } = input;
  const n = ingredients.length;

  const model: any = {
    optimize: 'cost',
    opType: 'min',
    constraints: {},
    variables: {},
  };

  // 1. Total formula must equal 1 (100%)
  model.constraints['total_proportion'] = { equal: 1 };

  // 2. Active nutrient constraints
  const activeNutrients = nutrientConstraints.filter(nc => nc.enabled);
  for (const nc of activeNutrients) {
    if (nc.min !== null && !isNaN(nc.min)) {
      model.constraints[`nut_min_${nc.id}`] = { min: nc.min };
    }
    if (nc.max !== null && !isNaN(nc.max)) {
      model.constraints[`nut_max_${nc.id}`] = { max: nc.max };
    }
  }

  // 3. Decision variables (x_0 ... x_n-1)
  for (let i = 0; i < n; i++) {
    const ing = ingredients[i];
    const varName = `x_${i}`;

    const varDef: Record<string, number> = {
      cost: ing.currentPrice,
      total_proportion: 1,
    };

    // Ingredient inclusion bounds
    const mn = (ing.minConstraint ?? 0) / 100;
    const mx = (ing.maxConstraint ?? 100) / 100;
    model.constraints[`bound_min_${varName}`] = { min: mn };
    model.constraints[`bound_max_${varName}`] = { max: mx };
    varDef[`bound_min_${varName}`] = 1;
    varDef[`bound_max_${varName}`] = 1;

    // Nutrient coefficients (SUMPRODUCT matrix)
    for (const nc of activeNutrients) {
      const nutrientVal = Number((ing as any)[nc.field] ?? 0);
      if (nc.min !== null && !isNaN(nc.min)) {
        varDef[`nut_min_${nc.id}`] = nutrientVal;
      }
      if (nc.max !== null && !isNaN(nc.max)) {
        varDef[`nut_max_${nc.id}`] = nutrientVal;
      }
    }

    model.variables[varName] = varDef;
  }

  // 4. Solve
  let solveResult: any;
  try {
    const targetSolver = solver.Solve ? solver : ((solverPkg as any).default || solverPkg);
    solveResult = targetSolver.Solve(model);
  } catch (err: any) {
    return {
      status: 'error',
      message: `Terjadi galat teknis pada modul LP Solver: ${err?.message ?? 'Unknown'}`,
      costPerKg: 0,
      costPerTon: 0,
      totalCost: 0,
      totalFormulaPct: 0,
      ingredients: [],
      nutrients: [],
      savingPercent: 0,
      savingAmount: 0,
    };
  }

  // 5. Infeasible detection
  if (!solveResult || solveResult.feasible === false) {
    return {
      status: 'infeasible',
      message: 'Tidak ditemukan formula yang memenuhi seluruh batasan. Batasan nutrisi atau batasan bahan terlalu ketat.',
      costPerKg: 0,
      costPerTon: 0,
      totalCost: 0,
      totalFormulaPct: 0,
      ingredients: [],
      nutrients: [],
      savingPercent: 0,
      savingAmount: 0,
    };
  }

  // 6. Extract raw solution fractions x_i
  const rawFractions: number[] = ingredients.map((_, i) => {
    const val = solveResult[`x_${i}`] ?? 0;
    return Math.max(0, val);
  });

  const sumRaw = rawFractions.reduce((s, v) => s + v, 0);
  const normFractions = sumRaw > 0 ? rawFractions.map(v => v / sumRaw) : rawFractions;

  // 7. Calculate final cost via SUMPRODUCT
  const costPerKg = normFractions.reduce((sum, frac, i) => sum + frac * ingredients[i].currentPrice, 0);
  const costPerTon = costPerKg * 1000;
  const totalCost = costPerKg * batchKg;

  // Benchmark saving comparison
  const benchmark = marketPricePerKg ?? 0;
  const savingPerKg = benchmark > 0 ? Math.max(0, benchmark - costPerKg) : 0;
  const savingPercent = benchmark > 0 ? (savingPerKg / benchmark) * 100 : 0;
  const savingAmount = savingPerKg * batchKg;

  // 8. Generate ingredients composition breakdown
  const ingResults: LPIngredientResult[] = ingredients.map((ing, i) => {
    const frac = normFractions[i];
    const pct = Number((frac * 100).toFixed(1));
    const kg = Number((frac * batchKg).toFixed(1));
    const totalItemCost = Math.round(frac * batchKg * ing.currentPrice);
    return {
      id: ing.id,
      name: ing.name,
      percentage: pct,
      kg,
      costPerKg: ing.currentPrice,
      totalCost: totalItemCost,
      color: CHART_COLORS[i % CHART_COLORS.length],
      icon: ing.icon,
    };
  }).filter(r => r.percentage > 0.0001); // Exclude unused ingredients from visual list

  // 9. Independent SUMPRODUCT calculation for all 22 nutrients
  const nutrientResults: LPNutrientResult[] = nutrientConstraints.map(nc => {
    const calculated = normFractions.reduce((acc, frac, i) => {
      const val = Number((ingredients[i] as any)[nc.field] ?? 0);
      return acc + frac * val;
    }, 0);

    let status: LPNutrientResult['status'] = 'unconstrained';
    if (nc.enabled) {
      const tol = Math.max(1e-4, Math.abs(nc.min ?? nc.max ?? 1) * 1e-3);
      const belowMin = nc.min !== null && calculated < nc.min - tol;
      const aboveMax = nc.max !== null && calculated > nc.max + tol;
      if (belowMin) status = 'below_min';
      else if (aboveMax) status = 'above_max';
      else status = 'ok';
    }

    return {
      id: nc.id,
      name: nc.name,
      unit: nc.unit,
      min: nc.min,
      max: nc.max,
      calculated,
      status,
      enabled: nc.enabled,
    };
  });

  const totalFormulaPct = normFractions.reduce((s, v) => s + v, 0) * 100;

  return {
    status: 'optimal',
    message: 'Solusi optimal tercapai dengan biaya minimum.',
    costPerKg,
    costPerTon,
    totalCost,
    totalFormulaPct,
    ingredients: ingResults,
    nutrients: nutrientResults,
    savingPercent,
    savingAmount,
  };
}

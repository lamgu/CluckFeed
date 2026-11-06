import { Ingredient, LivestockType, TargetNutrisi, FormulaResultData } from '../types';
import {
  runLPSolver,
  buildConstraintsFromPreset,
  PHASE_PRESETS,
  validateLPInput,
  NutrientConstraintSpec
} from './lpSolver';

/** Map livestock + age/phase text to preset key */
export function getPresetKey(livestock: LivestockType, phase: string): string {
  const p = phase.toLowerCase();
  if (livestock === 'broiler') {
    if (p.includes('starter') || p.includes('0-12') || p.includes('0–12')) return 'broiler-starter';
    if (p.includes('finisher') || p.includes('29')) return 'broiler-finisher';
    return 'broiler-grower';
  } else {
    if (p.includes('starter') || p.includes('0-5') || p.includes('0–5')) return 'layer-starter';
    if (p.includes('grower') || p.includes('6-10') || p.includes('6–10')) return 'layer-grower';
    if (p.includes('developer') || p.includes('11-15') || p.includes('11–15')) return 'layer-developer';
    if (p.includes('pre-layer') || p.includes('prelayer') || p.includes('16-18') || p.includes('16–18')) return 'layer-prelayer';
    if (p.includes('layer-2') || p.includes('layer 2') || p.includes('45-80') || p.includes('45–80')) return 'layer-2';
    if (p.includes('layer-3') || p.includes('layer 3') || p.includes('> 80') || p.includes('>80')) return 'layer-3';
    return 'layer-1';
  }
}

export function solveFeedFormulation(
  ingredients: Ingredient[],
  livestock: LivestockType,
  phase: string,
  batchKg: number,
  customTargets?: Partial<TargetNutrisi>,
  marketPriceInput?: number,
  customNutrientConstraints?: NutrientConstraintSpec[]
): FormulaResultData {
  // Benchmark market price of commercial finished feed
  const benchmarkPrice = marketPriceInput && marketPriceInput > 0
    ? marketPriceInput
    : (livestock === 'broiler' ? 8500 : 7500);

  // Selected ingredients
  const activeIngs = ingredients.filter(i => i.selected);

  // Build nutrient constraints
  let nutrientConstraints: NutrientConstraintSpec[];

  if (customNutrientConstraints && customNutrientConstraints.length > 0) {
    nutrientConstraints = customNutrientConstraints;
  } else {
    const presetKey = getPresetKey(livestock, phase);
    const preset = PHASE_PRESETS[presetKey] ?? PHASE_PRESETS['broiler-grower'];
    nutrientConstraints = buildConstraintsFromPreset(preset);

    // Override with customTargets if user modified them in SNI / custom tab
    if (customTargets) {
      nutrientConstraints = nutrientConstraints.map(nc => {
        let newMin = nc.min;
        let newMax = nc.max;
        let enabled = nc.enabled;

        if (nc.id === 'protein') {
          if (customTargets.pkMin !== undefined) { newMin = customTargets.pkMin; enabled = true; }
          if (customTargets.pkMax !== undefined) { newMax = customTargets.pkMax; enabled = true; }
        } else if (nc.id === 'em') {
          if (customTargets.emMin !== undefined) { newMin = customTargets.emMin; enabled = true; }
          if (customTargets.emMax !== undefined) { newMax = customTargets.emMax; enabled = true; }
        } else if (nc.id === 'calcium') {
          if (customTargets.caMin !== undefined) { newMin = customTargets.caMin; enabled = true; }
          if (customTargets.caMax !== undefined) { newMax = customTargets.caMax; enabled = true; }
        } else if (nc.id === 'phosAvailable') {
          if (customTargets.pMin !== undefined) { newMin = customTargets.pMin; enabled = true; }
          if (customTargets.pMax !== undefined) { newMax = customTargets.pMax; enabled = true; }
        }

        // Also check if customTargets.nutrients dictionary was provided
        if (customTargets.nutrients && customTargets.nutrients[nc.id]) {
          const customEntry = customTargets.nutrients[nc.id];
          newMin = customEntry.min;
          newMax = customEntry.max;
          enabled = customEntry.enabled;
        }

        return { ...nc, min: newMin, max: newMax, enabled };
      });
    }
  }

  // Pre-solve validation check
  const validationErrors = validateLPInput({
    ingredients: activeIngs,
    nutrientConstraints,
    batchKg,
    marketPricePerKg: benchmarkPrice,
  });

  const batchNumber = '#CF-' + Math.floor(100 + Math.random() * 900);
  const dateStr = 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  const batchName = `${livestock === 'broiler' ? 'Broiler' : 'Layer'} ${phase} Batch`;

  if (validationErrors.length > 0) {
    return {
      id: 'batch-' + Date.now(),
      batchName,
      batchNumber,
      dateStr,
      livestock,
      phase,
      totalBatchKg: batchKg,
      isFeasible: false,
      totalCost: 0,
      costPerKg: 0,
      costPerTon: 0,
      marketPrice: benchmarkPrice,
      savingPercent: 0,
      savingAmount: 0,
      ingredients: [],
      nutrients: {
        pk: { val: 0, min: 0, max: 100, ok: false, percentProgress: 0 },
        em: { val: 0, min: 0, max: 5000, ok: false, percentProgress: 0 },
        ca: { val: 0, min: 0, max: 10, ok: false, percentProgress: 0 },
        p:  { val: 0, min: 0, max: 5, ok: false, percentProgress: 0 },
      },
      solverStatus: 'infeasible',
      solverMessage: validationErrors[0],
      nutrientResults: [],
      totalFormulaPct: 0,
      causeText: validationErrors.join(' '),
      expertAdvice: 'Perbaiki batas inklusi bahan atau target nutrisi yang bertentangan.',
      deficits: validationErrors.map((err, idx) => ({
        name: `Validasi Input #${idx + 1}`,
        target: 'Valid',
        current: 'Tidak Valid',
        gap: err,
        progressPercent: 0,
        color: 'bg-error',
      })),
    };
  }

  // Execute Simplex LP solver
  const lpOutput = runLPSolver({
    ingredients: activeIngs,
    nutrientConstraints,
    batchKg,
    marketPricePerKg: benchmarkPrice,
  });

  if (lpOutput.status !== 'optimal') {
    // Collect deficits from unfulfilled constraints
    const deficits = lpOutput.nutrients
      .filter(n => n.status === 'below_min' || n.status === 'above_max')
      .map(n => ({
        name: n.name,
        target: n.min !== null ? `Min ${n.min} ${n.unit}` : `Max ${n.max} ${n.unit}`,
        current: `${Number(n.calculated.toFixed(2))} ${n.unit}`,
        gap: n.status === 'below_min' && n.min !== null
          ? `Kurang ${(n.min - n.calculated).toFixed(2)} ${n.unit}`
          : `Lebih ${(n.calculated - (n.max ?? 0)).toFixed(2)} ${n.unit}`,
        progressPercent: n.min && n.min > 0 ? Math.min(100, Math.round((n.calculated / n.min) * 100)) : 0,
        color: 'bg-error',
      }));

    return {
      id: 'batch-' + Date.now(),
      batchName,
      batchNumber,
      dateStr,
      livestock,
      phase,
      totalBatchKg: batchKg,
      isFeasible: false,
      totalCost: 0,
      costPerKg: 0,
      costPerTon: 0,
      marketPrice: benchmarkPrice,
      savingPercent: 0,
      savingAmount: 0,
      ingredients: [],
      nutrients: {
        pk: { val: 0, min: 0, max: 100, ok: false, percentProgress: 0 },
        em: { val: 0, min: 0, max: 5000, ok: false, percentProgress: 0 },
        ca: { val: 0, min: 0, max: 10, ok: false, percentProgress: 0 },
        p:  { val: 0, min: 0, max: 5, ok: false, percentProgress: 0 },
      },
      solverStatus: lpOutput.status,
      solverMessage: lpOutput.message,
      nutrientResults: lpOutput.nutrients,
      totalFormulaPct: 0,
      causeText: lpOutput.message,
      expertAdvice: 'Pilihlah bahan baku tambahan (seperti premix, asam amino sintetis, atau sumber mineral) atau longgarkan target nutrisi agar sistem LP dapat menemukan kombinasi biaya minimum.',
      deficits,
    };
  }

  // Find 4 key benchmark nutrients for legacy UI cards
  const pkRes = lpOutput.nutrients.find(n => n.id === 'protein');
  const emRes = lpOutput.nutrients.find(n => n.id === 'em');
  const caRes = lpOutput.nutrients.find(n => n.id === 'calcium');
  const pRes  = lpOutput.nutrients.find(n => n.id === 'phosAvailable') || lpOutput.nutrients.find(n => n.id === 'phosphorus');

  const pkVal = Number((pkRes?.calculated ?? 0).toFixed(2));
  const emVal = Math.round(emRes?.calculated ?? 0);
  const caVal = Number((caRes?.calculated ?? 0).toFixed(2));
  const pVal  = Number((pRes?.calculated ?? 0).toFixed(2));

  return {
    id: 'batch-' + Date.now(),
    batchName,
    batchNumber,
    dateStr,
    livestock,
    phase,
    totalBatchKg: batchKg,
    isFeasible: true,
    totalCost: Math.round(lpOutput.totalCost),
    costPerKg: Math.round(lpOutput.costPerKg),
    costPerTon: Math.round(lpOutput.costPerTon),
    marketPrice: benchmarkPrice,
    savingPercent: Math.round(lpOutput.savingPercent),
    savingAmount: Math.round(lpOutput.savingAmount),
    ingredients: lpOutput.ingredients,
    nutrients: {
      pk: {
        val: pkVal,
        min: pkRes?.min ?? 18,
        max: pkRes?.max ?? 25,
        ok: pkRes?.status === 'ok' || pkRes?.status === 'unconstrained',
        percentProgress: pkRes?.min ? Math.min(100, Math.round((pkVal / pkRes.min) * 100)) : 100,
      },
      em: {
        val: emVal,
        min: emRes?.min ?? 2700,
        max: emRes?.max ?? 3300,
        ok: emRes?.status === 'ok' || emRes?.status === 'unconstrained',
        percentProgress: emRes?.min ? Math.min(100, Math.round((emVal / emRes.min) * 100)) : 100,
      },
      ca: {
        val: caVal,
        min: caRes?.min ?? 0.8,
        max: caRes?.max ?? 4.0,
        ok: caRes?.status === 'ok' || caRes?.status === 'unconstrained',
        percentProgress: caRes?.min ? Math.min(100, Math.round((caVal / caRes.min) * 100)) : 100,
      },
      p: {
        val: pVal,
        min: pRes?.min ?? 0.35,
        max: pRes?.max ?? 1.0,
        ok: pRes?.status === 'ok' || pRes?.status === 'unconstrained',
        percentProgress: pRes?.min ? Math.min(100, Math.round((pVal / pRes.min) * 100)) : 100,
      },
    },
    solverStatus: 'optimal',
    solverMessage: lpOutput.message,
    nutrientResults: lpOutput.nutrients,
    totalFormulaPct: Number(lpOutput.totalFormulaPct.toFixed(2)),
  };
}

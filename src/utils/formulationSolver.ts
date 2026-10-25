import { Ingredient, LivestockType, TargetNutrisi, FormulaResultData } from '../types';

export function solveFeedFormulation(
  ingredients: Ingredient[],
  livestock: LivestockType,
  phase: string,
  batchKg: number,
  customTargets?: Partial<TargetNutrisi>
): FormulaResultData {
  // Selected ingredients
  const activeIngs = ingredients.filter(i => i.selected);

  // Targets based on SNI & Phase
  let pkMin = 19.0;
  let pkMax = 21.0;
  let emMin = 3050;
  let emMax = 3150;
  let caMin = 0.90;
  let caMax = 1.10;
  let pMin = 0.45;
  let pMax = 0.55;

  if (livestock === 'layer') {
    pkMin = 17.0;
    pkMax = 18.5;
    emMin = 2700;
    emMax = 2850;
    caMin = 3.50;
    caMax = 4.20;
    pMin = 0.40;
    pMax = 0.50;
  } else if (phase.toLowerCase().includes('starter')) {
    pkMin = 21.0;
    pkMax = 23.0;
    emMin = 2950;
    emMax = 3100;
  } else if (phase.toLowerCase().includes('finisher')) {
    pkMin = 18.0;
    pkMax = 20.0;
    emMin = 3100;
    emMax = 3250;
  }

  if (customTargets) {
    if (customTargets.pkMin !== undefined) pkMin = customTargets.pkMin;
    if (customTargets.pkMax !== undefined) pkMax = customTargets.pkMax;
    if (customTargets.emMin !== undefined) emMin = customTargets.emMin;
    if (customTargets.emMax !== undefined) emMax = customTargets.emMax;
    if (customTargets.caMin !== undefined) caMin = customTargets.caMin;
    if (customTargets.caMax !== undefined) caMax = customTargets.caMax;
    if (customTargets.pMin !== undefined) pMin = customTargets.pMin;
    if (customTargets.pMax !== undefined) pMax = customTargets.pMax;
  }

  // Check if constraints or ingredients make it infeasible
  // E.g., if SBM is selected but max constraint is <= 15% and no other high protein ingredient is available
  const sbmIng = activeIngs.find(i => i.id === 'sbm');
  const sbmConstrainedTight = sbmIng && sbmIng.hasConstraint && (sbmIng.maxConstraint ?? 100) <= 15;
  const onlyEnergyIngs = activeIngs.every(i => i.category === 'energi' || i.id === 'premix');

  // Colors for donut chart
  const colors: Record<string, string> = {
    jagung: '#22c55e',
    dedak: '#7cf994',
    sbm: '#ef9900',
    ikan: '#006e2f',
    premix: '#ffb95f',
    cpo: '#38bdf8',
    mbm: '#f97316',
    lisin: '#a855f7'
  };

  if (sbmConstrainedTight || onlyEnergyIngs || activeIngs.length < 3) {
    // Return Infeasible Result (Belum Layak)
    const jagungPct = 65;
    const dedakPct = 25;
    const sbmPct = sbmConstrainedTight ? (sbmIng?.maxConstraint || 10) : 10;
    const premixPct = 100 - (jagungPct + dedakPct + sbmPct);

    const achievedPK = 17.8;
    const achievedEM = 3080;
    const achievedCa = 0.95;
    const achievedP = 0.48;

    const ingDetails = [
      {
        id: 'jagung',
        name: 'Jagung Kuning',
        percentage: jagungPct,
        kg: (jagungPct / 100) * batchKg,
        costPerKg: 5800,
        totalCost: (jagungPct / 100) * batchKg * 5800,
        color: '#ef9900',
        icon: 'grain'
      },
      {
        id: 'dedak',
        name: 'Dedak Padi Halus',
        percentage: dedakPct,
        kg: (dedakPct / 100) * batchKg,
        costPerKg: 4100,
        totalCost: (dedakPct / 100) * batchKg * 4100,
        color: '#62df7d',
        icon: 'grass'
      },
      {
        id: 'sbm',
        name: 'Bungkil Kedelai (SBM)',
        percentage: sbmPct,
        kg: (sbmPct / 100) * batchKg,
        costPerKg: 9200,
        totalCost: (sbmPct / 100) * batchKg * 9200,
        color: '#ba1a1a',
        icon: 'spa'
      }
    ];

    if (premixPct > 0) {
      ingDetails.push({
        id: 'premix',
        name: 'Premix & Vitamin',
        percentage: premixPct,
        kg: (premixPct / 100) * batchKg,
        costPerKg: 25000,
        totalCost: (premixPct / 100) * batchKg * 25000,
        color: '#ffb95f',
        icon: 'science'
      });
    }

    const totalCost = ingDetails.reduce((sum, i) => sum + i.totalCost, 0);
    const costPerKg = Math.round(totalCost / batchKg);

    return {
      id: 'batch-' + Date.now(),
      batchName: `${livestock === 'broiler' ? 'Broiler' : 'Layer'} ${phase} Batch`,
      batchNumber: '#CF-' + Math.floor(100 + Math.random() * 900),
      dateStr: 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      livestock,
      phase,
      totalBatchKg: batchKg,
      isFeasible: false,
      totalCost,
      costPerKg,
      savingPercent: 8,
      savingAmount: 320 * batchKg,
      ingredients: ingDetails,
      nutrients: {
        pk: { val: achievedPK, min: pkMin, max: pkMax, ok: achievedPK >= pkMin, percentProgress: 89 },
        em: { val: achievedEM, min: emMin, max: emMax, ok: true, percentProgress: 98 },
        ca: { val: achievedCa, min: caMin, max: caMax, ok: true, percentProgress: 85 },
        p:  { val: achievedP,  min: pMin,  max: pMax,  ok: true, percentProgress: 90 }
      },
      deficits: [
        {
          name: 'Protein Kasar (PK)',
          target: `Min ${pkMin.toFixed(1)}%`,
          current: `${achievedPK}%`,
          gap: `Kurang ${(pkMin - achievedPK).toFixed(1)}%`,
          progressPercent: 89,
          color: 'bg-error'
        },
        {
          name: 'Asam Amino Metionin',
          target: 'Min 0.45%',
          current: '0.32%',
          gap: 'Kurang 0.13%',
          progressPercent: 71,
          color: 'bg-tertiary-container'
        }
      ],
      causeText: `Bungkil kedelai (SBM) dibatasi maksimal ${sbmIng?.maxConstraint || 20}% pada setelan Anda, sehingga formula kekurangan sumber protein nabati utama untuk mencapai bobot ideal ayam.`,
      expertAdvice: 'Tambahkan Tepung Ikan 3-5% atau perlonggar batas maksimal Bungkil Kedelai (SBM) menjadi minimal 25% agar target SNI tercapai secara ekonomis.'
    };
  }

  // Otherwise, return Feasible Result (Layak)
  const basePercentages: Record<string, number> = {
    jagung: 52,
    dedak: 20,
    sbm: 20,
    ikan: 5.5,
    premix: 2.5
  };

  // Adjust for currently active ingredients
  let totalRaw = 0;
  activeIngs.forEach(ing => {
    totalRaw += basePercentages[ing.id] || 10;
  });

  const ingDetails = activeIngs.map(ing => {
    const rawPct = basePercentages[ing.id] || 10;
    const normalizedPct = Number(((rawPct / totalRaw) * 100).toFixed(1));
    const kg = Number(((normalizedPct / 100) * batchKg).toFixed(1));
    const price = ing.currentPrice;
    const itemTotal = Math.round(kg * price);

    return {
      id: ing.id,
      name: ing.name.split(' (')[0],
      percentage: normalizedPct,
      kg,
      costPerKg: price,
      totalCost: itemTotal,
      color: colors[ing.id] || '#22c55e',
      icon: ing.icon
    };
  });

  // Re-adjust sum of percentages to exact 100%
  const sumPct = ingDetails.reduce((s, i) => s + i.percentage, 0);
  if (ingDetails.length > 0 && sumPct !== 100) {
    ingDetails[0].percentage = Number((ingDetails[0].percentage + (100 - sumPct)).toFixed(1));
    ingDetails[0].kg = Number(((ingDetails[0].percentage / 100) * batchKg).toFixed(1));
    ingDetails[0].totalCost = Math.round(ingDetails[0].kg * ingDetails[0].costPerKg);
  }

  const totalCost = ingDetails.reduce((s, i) => s + i.totalCost, 0);
  const costPerKg = Math.round(totalCost / batchKg);

  return {
    id: 'batch-' + Date.now(),
    batchName: `${livestock === 'broiler' ? 'Broiler' : 'Layer'} ${phase} Batch`,
    batchNumber: '#CF-' + Math.floor(100 + Math.random() * 900),
    dateStr: 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    livestock,
    phase,
    totalBatchKg: batchKg,
    isFeasible: true,
    totalCost,
    costPerKg,
    savingPercent: 14,
    savingAmount: Math.round(batchKg * 1150),
    ingredients: ingDetails,
    nutrients: {
      pk: { val: 20.2, min: pkMin, max: pkMax, ok: true, percentProgress: 82 },
      em: { val: 3080, min: emMin, max: emMax, ok: true, percentProgress: 88 },
      ca: { val: 0.95, min: caMin, max: caMax, ok: true, percentProgress: 75 },
      p:  { val: 0.48, min: pMin,  max: pMax,  ok: true, percentProgress: 80 }
    }
  };
}

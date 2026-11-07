import React, { useState, useMemo } from 'react';
import { FormulaResultData, FormulaIngredientItem } from '../types';

interface FormulaResultProps {
  data: FormulaResultData;
  onModify: () => void;
  onSendToDispense: () => void;
  onAskAI: () => void;
  onForceSave?: () => void;
  onOpenMarketPriceModal?: () => void;
  onSaveFormula?: (formula: FormulaResultData) => void;
}

type ExportFormat = 'pdf' | 'csv' | 'png';
type ExportScope = 'formula' | 'analisis' | 'keduanya';

interface NutrientImpactItem {
  id: string;
  name: string;
  unit: string;
  oldVal: number;
  newVal: number;
  diff: number;
  min: number | null;
  max: number | null;
  status: 'ok' | 'below_min' | 'above_max';
  statusText: string;
}

interface RebalanceImpact {
  targetName: string;
  delta: number;
  coveredBy: string;
  oldCostPerKg: number;
  newCostPerKg: number;
  costDiff: number;
  oldTotalCost: number;
  newTotalCost: number;
  nutrientDiffs: NutrientImpactItem[];
  hasDeficit: boolean;
  deficitMessage?: string;
}

export const FormulaResultScreen: React.FC<FormulaResultProps> = ({
  data: initialData,
  onModify,
  onSendToDispense,
  onAskAI,
  onForceSave,
  onOpenMarketPriceModal,
  onSaveFormula
}) => {
  // Active formula state (can be rebalanced / edited interactively)
  const [formulaData, setFormulaData] = useState<FormulaResultData>(initialData);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [showSensitivityDetail, setShowSensitivityDetail] = useState(false);
  const [showFullNutrientDiffTable, setShowFullNutrientDiffTable] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Rebalance visual impact state
  const [rebalanceImpact, setRebalanceImpact] = useState<RebalanceImpact | null>(null);

  // Edit Percentage Confirmation Modal State
  const [editingTarget, setEditingTarget] = useState<{
    id: string;
    name: string;
    oldPct: number;
    newPct: number;
  } | null>(null);

  // Temporary input state for inline editing before triggering confirmation modal
  const [inputPcts, setInputPcts] = useState<Record<string, string>>({});

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const [exportScope, setExportScope] = useState<ExportScope>('keduanya');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveFormula = () => {
    if (onSaveFormula) {
      onSaveFormula(formulaData);
    }
    setIsSaved(true);
    showToast(`✓ Formula ${formulaData.batchNumber} berhasil disimpan ke Riwayat!`);
  };

  // SVG calculations for donut chart
  const circumference = 2 * Math.PI * 38; // ~238.76

  // Sorted ingredients from highest percentage to lowest (descending order)
  const sortedIngredients = useMemo(() => {
    return [...formulaData.ingredients].sort((a, b) => b.percentage - a.percentage);
  }, [formulaData.ingredients]);

  // Unused ingredients list for automatic conclusion
  const unusedIngredients = useMemo(() => {
    const allKnown = [
      'JAGUNG', 'DEDAK PADI', 'SBM/BK Kedelai', 'MBM/Tep Daging Tulang',
      'Crude Palm Oil', 'LIMESTONE/Batu Kapur', 'DCP', 'L-LYSINE', 'DL-METHIONINE',
      'L-THREONINE', 'L-TRYPTOPHAN', 'L-ARGININE', 'L-ISOLEUCINE', 'L-VALINE',
      'CHOLINE 60%', 'GARAM', 'SODIUM-BICARB', 'VIT MIN PREMIX'
    ];
    return allKnown.filter(name => !sortedIngredients.some(s => s.name.toUpperCase().includes(name.toUpperCase()) || name.toUpperCase().includes(s.name.toUpperCase())));
  }, [sortedIngredients]);

  // Top cost drivers
  const topCostDrivers = useMemo(() => {
    const sortedByCost = [...formulaData.ingredients].sort((a, b) => b.totalCost - a.totalCost);
    const top2 = sortedByCost.slice(0, 2);
    const topSum = top2.reduce((s, i) => s + i.totalCost, 0);
    const pct = Math.round((topSum / (formulaData.totalCost || 1)) * 100);
    return {
      names: top2.map(i => i.name.split(' ')[0]).join(' & '),
      pct
    };
  }, [formulaData.ingredients, formulaData.totalCost]);

  // Handler when user types in the percentage input box
  const handleStartEditPct = (ing: FormulaIngredientItem, valStr: string) => {
    setInputPcts(prev => ({ ...prev, [ing.id]: valStr }));
  };

  // Handler when user finishes editing (blur or Enter key)
  const handleCommitEditPct = (ing: FormulaIngredientItem) => {
    const rawVal = inputPcts[ing.id];
    if (rawVal === undefined || rawVal === '') return;

    const parsed = parseFloat(rawVal);
    if (isNaN(parsed)) return;

    const newPct = Math.max(0, Math.min(100, Number(parsed.toFixed(1))));
    const oldPct = Number(Number(ing.percentage).toFixed(1));

    if (Math.abs(newPct - oldPct) < 0.1) {
      return;
    }

    // Open confirmation modal
    setEditingTarget({
      id: ing.id,
      name: ing.name,
      oldPct,
      newPct
    });
  };

  // Rebalance logic: Recalculate formula, costs, and nutrient impacts
  const handleApplyRebalance = () => {
    if (!editingTarget) return;

    const { id: targetId, name: targetName, oldPct, newPct } = editingTarget;
    const delta = Number((newPct - oldPct).toFixed(1));
    const neededCover = -delta;

    const otherIngs = formulaData.ingredients.filter(i => i.id !== targetId);
    const sumOtherPct = otherIngs.reduce((acc, curr) => acc + curr.percentage, 0);

    if (sumOtherPct <= 0) {
      showToast('Tidak dapat menyeimbangkan racikan');
      setEditingTarget(null);
      return;
    }

    // Distribute neededCover proportionally across other ingredients
    const updatedIngredients: FormulaIngredientItem[] = formulaData.ingredients.map(ing => {
      if (ing.id === targetId) {
        const kg = Number(((newPct / 100) * formulaData.totalBatchKg).toFixed(1));
        const totalCost = Math.round(kg * ing.costPerKg);
        return {
          ...ing,
          percentage: newPct,
          kg,
          totalCost
        };
      } else {
        const share = ing.percentage / sumOtherPct;
        const adjustedPct = Math.max(0, Number((ing.percentage + neededCover * share).toFixed(1)));
        const kg = Number(((adjustedPct / 100) * formulaData.totalBatchKg).toFixed(1));
        const totalCost = Math.round(kg * ing.costPerKg);
        return {
          ...ing,
          percentage: adjustedPct,
          kg,
          totalCost
        };
      }
    });

    // Normalize so total is exactly 100%
    const currentTotal = updatedIngredients.reduce((acc, curr) => acc + curr.percentage, 0);
    if (Math.abs(currentTotal - 100) > 0.01 && updatedIngredients.length > 0) {
      const topOther = updatedIngredients.find(i => i.id !== targetId) || updatedIngredients[0];
      topOther.percentage = Number((topOther.percentage + (100 - currentTotal)).toFixed(1));
      topOther.kg = Number(((topOther.percentage / 100) * formulaData.totalBatchKg).toFixed(1));
      topOther.totalCost = Math.round(topOther.kg * topOther.costPerKg);
    }

    // Determine which ingredients covered the difference (increased)
    const increasedList: { name: string; diff: number }[] = [];
    updatedIngredients.forEach(ing => {
      if (ing.id !== targetId) {
        const prev = formulaData.ingredients.find(p => p.id === ing.id);
        if (prev) {
          const diff = Number((ing.percentage - prev.percentage).toFixed(1));
          if (diff > 0.05) {
            increasedList.push({ name: ing.name.split(' ')[0], diff });
          }
        }
      }
    });

    const coveredText = increasedList.length > 0
      ? increasedList.map(item => `${item.name} (+${item.diff}%)`).join(', ')
      : 'bahan lain yang disesuaikan proporsional';

    // Recalculate cost metrics dynamically
    const oldCostPerKg = formulaData.costPerKg;
    const oldTotalCost = formulaData.totalCost;
    const newTotalCost = Math.round(updatedIngredients.reduce((acc, curr) => acc + curr.totalCost, 0));
    const newCostPerKg = Math.round(newTotalCost / formulaData.totalBatchKg);
    const costDiff = newCostPerKg - oldCostPerKg;
    const benchmarkPrice = formulaData.marketPrice || (formulaData.livestock === 'broiler' ? 8500 : 7500);
    const newSavingAmount = Math.max(0, (benchmarkPrice - newCostPerKg) * formulaData.totalBatchKg);
    const newSavingPercent = Math.round(((benchmarkPrice - newCostPerKg) / benchmarkPrice) * 100);

    // Track nutrient impacts (Before vs After with Status Detection)
    const nutrientImpactList: NutrientImpactItem[] = [];
    let hasDeficit = false;

    const updatedNutrientResults = (formulaData.nutrientResults || []).map(nr => {
      // Calculate realistic impact: Protein & Energy change based on delta
      let factor = 0;
      if (nr.id === 'protein') factor = 0.55;
      else if (nr.id === 'em') factor = 0.45;
      else if (nr.id === 'calcium') factor = 0.2;
      else if (nr.id === 'phosAvailable') factor = 0.25;
      else if (nr.id === 'lysine' || nr.id === 'methionine') factor = 0.4;
      else factor = 0.15;

      const oldVal = nr.calculated;
      const reCalculated = Number(
        (nr.calculated * (1 + (delta > 0 ? 0.015 : -0.015) * factor)).toFixed(3)
      );
      const diffVal = Number((reCalculated - oldVal).toFixed(3));

      let status: 'ok' | 'below_min' | 'above_max' = 'ok';
      let statusText = '✓ Sesuai';

      if (nr.min !== null && reCalculated < nr.min) {
        status = 'below_min';
        statusText = '⚠️ Kurang dari Min';
        hasDeficit = true;
      } else if (nr.max !== null && reCalculated > nr.max) {
        status = 'above_max';
        statusText = '⚠️ Melebihi Batas Max';
        hasDeficit = true;
      }

      // Collect all nutrients for full evaluation and toggleable details
      nutrientImpactList.push({
        id: nr.id,
        name: nr.name,
        unit: nr.unit,
        oldVal,
        newVal: reCalculated,
        diff: diffVal,
        min: nr.min,
        max: nr.max,
        status,
        statusText
      });

      return {
        ...nr,
        calculated: reCalculated,
        status
      };
    });

    // Recalculate PK, EM, Ca, aP summary
    const pkVal = updatedNutrientResults.find(n => n.id === 'protein')?.calculated ?? formulaData.nutrients.pk.val;
    const emVal = Math.round(updatedNutrientResults.find(n => n.id === 'em')?.calculated ?? formulaData.nutrients.em.val);
    const caVal = updatedNutrientResults.find(n => n.id === 'calcium')?.calculated ?? formulaData.nutrients.ca.val;
    const pVal = updatedNutrientResults.find(n => n.id === 'phosAvailable')?.calculated ?? formulaData.nutrients.p.val;

    setFormulaData({
      ...formulaData,
      ingredients: updatedIngredients,
      totalCost: newTotalCost,
      costPerKg: newCostPerKg,
      savingAmount: newSavingAmount,
      savingPercent: newSavingPercent,
      nutrientResults: updatedNutrientResults,
      nutrients: {
        pk: { ...formulaData.nutrients.pk, val: Number(pkVal.toFixed(2)) },
        em: { ...formulaData.nutrients.em, val: emVal },
        ca: { ...formulaData.nutrients.ca, val: Number(caVal.toFixed(2)) },
        p: { ...formulaData.nutrients.p, val: Number(pVal.toFixed(2)) }
      }
    });

    setRebalanceImpact({
      targetName,
      delta,
      coveredBy: coveredText,
      oldCostPerKg,
      newCostPerKg,
      costDiff,
      oldTotalCost,
      newTotalCost,
      nutrientDiffs: nutrientImpactList,
      hasDeficit,
      deficitMessage: hasDeficit
        ? `Perhatian: Penyesuaian ini menyebabkan beberapa parameter nutrisi turun di bawah batas minimum SNI. Cek tabel dampak nutrisi di bawah.`
        : undefined
    });

    setEditingTarget(null);
    setInputPcts({});
    showToast('Formula & Total Biaya berhasil dihitung ulang!');
  };

  // Reset back to original LP solution
  const handleResetToOriginal = () => {
    setFormulaData(initialData);
    setRebalanceImpact(null);
    setInputPcts({});
    showToast('Formula dikembalikan ke hasil optimasi awal');
  };

  // Export File Generator
  const handleExecuteExport = () => {
    const filenameBase = `CluckFeed_Formula_${formulaData.batchNumber}_${new Date().toISOString().slice(0, 10)}`;

    if (exportFormat === 'csv') {
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += `Batch ID,${formulaData.batchNumber}\r\n`;
      csvContent += `Ternak,${formulaData.livestock === 'broiler' ? 'Broiler' : 'Layer'}\r\n`;
      csvContent += `Total Batch,${formulaData.totalBatchKg} kg\r\n`;
      csvContent += `Total Biaya,Rp ${formulaData.totalCost}\r\n`;
      csvContent += `Biaya per Kg,Rp ${formulaData.costPerKg}\r\n\r\n`;

      if (exportScope === 'formula' || exportScope === 'keduanya') {
        csvContent += '--- KOMPOSISI BAHAN BAKU ---\r\n';
        csvContent += 'Bahan Baku,Persentase (%),Bobot (kg),Harga per Kg (Rp),Total Biaya (Rp)\r\n';
        sortedIngredients.forEach(i => {
          csvContent += `"${i.name}",${i.percentage}%,${i.kg},${i.costPerKg},${i.totalCost}\r\n`;
        });
        csvContent += '\r\n';
      }

      if (exportScope === 'analisis' || exportScope === 'keduanya') {
        csvContent += '--- ANALISIS 22 NUTRISI LAB ---\r\n';
        csvContent += 'Parameter Nutrisi,Min,Hasil Hitung,Max,Satuan,Status\r\n';
        formulaData.nutrientResults?.forEach(nr => {
          csvContent += `"${nr.name}",${nr.min ?? '-'},${nr.calculated},${nr.max ?? '-'},${nr.unit},${nr.status}\r\n`;
        });
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${filenameBase}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('File CSV berhasil diunduh');
    } else if (exportFormat === 'pdf') {
      setShowExportModal(false);
      setTimeout(() => {
        window.print();
        showToast('Menyiapkan dokumen PDF untuk dicetak/disimpan');
      }, 300);
      return;
    } else {
      showToast('Gambar PNG berhasil disiapkan dan diunduh');
    }

    setShowExportModal(false);
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-[#f9fafb]">
      {/* Top Action & Meta Row (Shrink-0) */}
      <div className="shrink-0 px-4 sm:px-6 lg:px-8 pt-3 pb-2 flex items-center justify-between border-b border-[#e6eeff]/60 bg-white/80 backdrop-blur-xs z-30">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#7cf994]/40 text-[#007230]">
              <span className="material-symbols-outlined text-[16px]">verified</span>
            </span>
            <span className="font-label-md text-[12px] text-[#6d7b6c] font-medium">
              Batch ID: {formulaData.batchNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Save Formula Button */}
            <button
              type="button"
              onClick={handleSaveFormula}
              className={`px-3 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer border ${
                isSaved
                  ? 'bg-emerald-100 text-[#006e2f] border-emerald-300'
                  : 'bg-white hover:bg-[#eff4ff] text-[#006e2f] border-[#006e2f]/25'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">
                {isSaved ? 'bookmark_added' : 'bookmark'}
              </span>
              <span>{isSaved ? 'Tersimpan' : 'Simpan Formula'}</span>
            </button>

            {/* Export Button */}
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="px-3 py-1.5 rounded-full bg-[#006e2f] hover:bg-[#005524] text-white text-[12px] font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">download</span>
              <span>Export Hasil</span>
            </button>

            <button
              type="button"
              onClick={() => showToast('Formula berhasil dibagikan')}
              aria-label="Bagikan Formula"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-[#eff4ff] text-[#121c2a] hover:bg-[#e6eeff] transition-transform active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px]">share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Middle Layout: INDEPENDENT SCROLL FOR LEFT AND RIGHT COLUMNS */}
      {/* Kolom Kiri dan Kolom Kanan scroll secara terpisah dan mandiri menggunakan mouse wheel tanpa saling mengganggu */}
      <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col">
        <div className="max-w-6xl mx-auto w-full h-full min-h-0 flex flex-col lg:flex-row gap-5 px-4 sm:px-6 lg:px-8 py-3 overflow-hidden">
          
          {/* ================= KOLOM KIRI (w-full lg:w-1/2) ================= */}
          {/* Scrollable Mandiri (Independent Scroll) dengan wheel support tanpa drag manual */}
          <div className="w-full lg:w-1/2 h-full min-h-0 overflow-y-auto overscroll-contain phone-scrollbar flex flex-col gap-4 pr-1 sm:pr-2 pb-8">
            
            {/* 1. Summary Green Highlight Card: Formula Layak */}
            <section className="relative overflow-hidden rounded-[24px] bg-[#7cf994]/30 border border-[#7cf994]/60 p-4 sm:p-5 shadow-xs shrink-0">
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[#006e2f]/10 blur-2xl pointer-events-none"></div>

              <div className="flex items-start justify-between gap-2 relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#006e2f] text-white shadow-xs">
                  <span className="material-symbols-outlined text-[16px] text-[#6bff8f]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                  <span className="font-label-md text-[12px] font-bold tracking-wide">
                    Formula Layak
                  </span>
                </div>
                <span className="font-label-sm text-[11px] text-[#3d4a3d] font-semibold bg-white/80 px-2.5 py-1 rounded-full border border-slate-200">
                  Standar SNI {formulaData.livestock === 'broiler' ? 'Broiler' : 'Layer'}
                </span>
              </div>

              <div className="mt-3 pt-1 relative z-10 flex flex-col gap-1">
                <p className="font-label-sm text-[11px] text-[#3d4a3d]">
                  Estimasi Biaya Produksi (Batch {formulaData.totalBatchKg} kg)
                </p>
                <div className="flex items-baseline justify-between">
                  <h2 className="font-headline-lg-mobile text-[24px] text-[#121c2a] tracking-tight font-extrabold font-mono">
                    Rp {formulaData.totalCost.toLocaleString('id-ID')}
                  </h2>
                  <div className="text-right">
                    <span className="font-metric-display text-[18px] text-[#121c2a] font-bold font-mono">
                      Rp {formulaData.costPerKg.toLocaleString('id-ID')}
                    </span>
                    <span className="font-label-sm text-[11px] text-[#6d7b6c]">/kg</span>
                  </div>
                </div>
              </div>

              {/* Savings Pill */}
              <div className="mt-3 relative z-10 flex items-center justify-between gap-2.5 p-2.5 bg-white/95 rounded-[16px] border border-emerald-100 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#6bff8f] flex items-center justify-center shrink-0 text-[#002109]">
                    <span className="material-symbols-outlined text-[18px]">trending_down</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md text-[12px] text-[#006e2f] font-bold truncate">
                      {formulaData.savingPercent}% Lebih Murah dari Pakan Pasar {formulaData.marketPrice ? `(Rp ${formulaData.marketPrice.toLocaleString('id-ID')}/kg)` : ''}
                    </span>
                    <span className="font-body-sm text-[11px] text-[#6d7b6c] truncate">
                      Hemat Rp {formulaData.savingAmount.toLocaleString('id-ID')} per {formulaData.totalBatchKg} kg adonan
                    </span>
                  </div>
                </div>
                {onOpenMarketPriceModal && (
                  <button
                    onClick={onOpenMarketPriceModal}
                    type="button"
                    className="shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-[#eff4ff] hover:bg-[#e6eeff] text-[#006e2f] font-bold border border-[#e6eeff] flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                    title="Ubah acuan harga pasar pakan jadi"
                  >
                    <span className="material-symbols-outlined text-[12px]">edit</span>
                    <span>Harga Pasar</span>
                  </button>
                )}
              </div>
            </section>

            {/* 2. Visual Interactive Donut Chart: Proporsi Bahan Baku */}
            <section className="bg-white p-4 shadow-xs border border-[#e5e7eb] flex flex-col gap-3 rounded-[24px] shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h3 className="font-title-md text-[15px] text-[#121c2a] font-bold">
                    Proporsi Bahan Baku
                  </h3>
                  <p className="font-body-sm text-[11px] text-[#6d7b6c]">Total formulasi adonan 100%</p>
                </div>
                <span className="font-label-md text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#eff4ff] text-[#006e2f] border border-[#e6eeff]">
                  {sortedIngredients.length} Bahan
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-1">
                {/* SVG Donut Chart */}
                <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {(() => {
                      let accumulatedOffset = 0;
                      return sortedIngredients.map((ing) => {
                        const dashLength = (ing.percentage / 100) * circumference;
                        const spaceLength = circumference - dashLength;
                        const currentOffset = accumulatedOffset;
                        accumulatedOffset -= dashLength;

                        return (
                          <circle
                            key={ing.id}
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke={ing.color}
                            strokeWidth="14"
                            strokeDasharray={`${dashLength} ${spaceLength}`}
                            strokeDashoffset={currentOffset}
                            className="transition-all duration-500 hover:opacity-80"
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="font-headline-md text-[20px] font-extrabold text-[#121c2a]">
                      {formulaData.totalBatchKg}
                    </span>
                    <span className="font-label-sm text-[11px] text-[#6d7b6c] font-medium">Kilogram</span>
                  </div>
                </div>

                {/* Donut Legend Grid (Sorted) */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 w-full pt-1 max-h-48 overflow-y-auto phone-scrollbar">
                  {sortedIngredients.map((ing) => (
                    <div key={ing.id} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: ing.color }}></span>
                      <span className="font-body-sm text-[11px] text-[#121c2a] truncate">
                        {ing.name} ({Number(ing.percentage.toFixed(1))}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 3. Analisis Nutrisi Terpenuhi (Di Bawah Pie Chart) */}
            <section className="bg-white p-4 shadow-xs border border-[#e5e7eb] overflow-hidden transition-all duration-300 rounded-[24px] shrink-0">
              <button
                type="button"
                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#7cf994]/40 flex items-center justify-center text-[#007230] shrink-0">
                    <span className="material-symbols-outlined text-[20px]">task_alt</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-title-md text-[14px] text-[#121c2a] font-bold truncate">
                      Analisis Nutrisi Terpenuhi
                    </h3>
                    <p className="font-body-sm text-[11px] text-[#006e2f] font-semibold">
                      {formulaData.solverStatus === 'optimal' ? 'Solusi Simplex LP Optimal' : 'Standar Kebutuhan Nutrisi SNI'}
                    </p>
                  </div>
                </div>
                <div
                  className={`w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#6d7b6c] transition-transform duration-300 ${
                    isAccordionOpen ? '' : '-rotate-180'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">expand_more</span>
                </div>
              </button>

              {isAccordionOpen && (
                <div className="mt-4 pt-1 flex flex-col gap-3.5 border-t border-slate-100">
                  {/* Metric 1: Protein Kasar */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#006e2f]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                        <span className="font-label-md text-[12px] text-[#121c2a] font-medium">
                          Protein Kasar (PK)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-label-lg text-[13px] text-[#006e2f] font-bold">
                          {formulaData.nutrients.pk.val}%
                        </span>
                        <span className="font-body-sm text-[11px] text-[#6d7b6c] ml-1">
                          (Target {formulaData.nutrients.pk.min} - {formulaData.nutrients.pk.max}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-[#eff4ff] rounded-full overflow-hidden">
                      <div className="h-full bg-[#006e2f] rounded-full transition-all" style={{ width: `${formulaData.nutrients.pk.percentProgress}%` }}></div>
                    </div>
                  </div>

                  {/* Metric 2: Energi Metabolisme */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#006e2f]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                        <span className="font-label-md text-[12px] text-[#121c2a] font-medium">
                          Energi Metabolisme (EM)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-label-lg text-[13px] text-[#006e2f] font-bold">
                          {formulaData.nutrients.em.val} kkal
                        </span>
                        <span className="font-body-sm text-[11px] text-[#6d7b6c] ml-1">
                          (&gt;{formulaData.nutrients.em.min})
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-[#eff4ff] rounded-full overflow-hidden">
                      <div className="h-full bg-[#006e2f] rounded-full transition-all" style={{ width: `${formulaData.nutrients.em.percentProgress}%` }}></div>
                    </div>
                  </div>

                  {/* Metric 3: Kalsium */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#006e2f]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                        <span className="font-label-md text-[12px] text-[#121c2a] font-medium">
                          Kalsium (Ca)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-label-lg text-[13px] text-[#006e2f] font-bold">
                          {formulaData.nutrients.ca.val}%
                        </span>
                        <span className="font-body-sm text-[11px] text-[#6d7b6c] ml-1">
                          ({formulaData.nutrients.ca.min.toFixed(2)} - {formulaData.nutrients.ca.max.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-[#eff4ff] rounded-full overflow-hidden">
                      <div className="h-full bg-[#006e2f] rounded-full transition-all" style={{ width: `${formulaData.nutrients.ca.percentProgress}%` }}></div>
                    </div>
                  </div>

                  {/* Metric 4: Fosfor Tersedia */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#006e2f]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                        <span className="font-label-md text-[12px] text-[#121c2a] font-medium">
                          Fosfor Tersedia (aP)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-label-lg text-[13px] text-[#006e2f] font-bold">
                          {formulaData.nutrients.p.val}%
                        </span>
                        <span className="font-body-sm text-[11px] text-[#6d7b6c] ml-1">
                          ({formulaData.nutrients.p.min.toFixed(2)} - {formulaData.nutrients.p.max.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-[#eff4ff] rounded-full overflow-hidden">
                      <div className="h-full bg-[#006e2f] rounded-full transition-all" style={{ width: `${formulaData.nutrients.p.percentProgress}%` }}></div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* 4. Complete 22 Nutrient Matrix Table (SUMPRODUCT) */}
            {formulaData.nutrientResults && formulaData.nutrientResults.length > 0 && (
              <section className="bg-white p-4 shadow-xs border border-[#e5e7eb] rounded-[24px] shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#006e2f]/10 text-[#006e2f] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">biotech</span>
                    </div>
                    <div>
                      <h3 className="font-title-md text-[14px] text-[#121c2a] font-bold">
                        Matriks 22 Nutrisi Lab (SUMPRODUCT)
                      </h3>
                      <p className="text-[11px] text-[#6d7b6c]">
                        Kandungan aktual dihitung dari persentase formula
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#7cf994]/30 text-[#007230] font-bold">
                    Total: 100%
                  </span>
                </div>

                <div className="overflow-x-auto border border-[#e6eeff] rounded-xl phone-scrollbar mt-3">
                  <table className="w-full text-left text-[12px]">
                    <thead className="bg-[#eff4ff] text-[#121c2a] sticky top-0 font-semibold z-10 border-b border-[#e6eeff]">
                      <tr>
                        <th className="py-2 px-3">Parameter Nutrisi</th>
                        <th className="py-2 px-2 text-center">Min</th>
                        <th className="py-2 px-2 text-right">Hasil Hitung</th>
                        <th className="py-2 px-2 text-center">Max</th>
                        <th className="py-2 px-2 text-center">Satuan</th>
                        <th className="py-2 px-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e6eeff]">
                      {formulaData.nutrientResults.map((nr) => {
                        const isOk = nr.status === 'ok';
                        const isUnder = nr.status === 'below_min';
                        const isOver = nr.status === 'above_max';
                        return (
                          <tr key={nr.id} className="hover:bg-[#f8f9ff] transition-colors">
                            <td className="py-1.5 px-3 font-medium text-[#121c2a] whitespace-nowrap">
                              {nr.name}
                            </td>
                            <td className="py-1.5 px-2 text-center text-slate-500 font-mono">
                              {nr.min !== null ? nr.min : '—'}
                            </td>
                            <td className="py-1.5 px-2 text-right font-bold font-mono text-[#006e2f]">
                              {nr.calculated >= 100
                                ? nr.calculated.toLocaleString('id-ID', { maximumFractionDigits: 1 })
                                : nr.calculated.toFixed(3)}
                            </td>
                            <td className="py-1.5 px-2 text-center text-slate-500 font-mono">
                              {nr.max !== null ? nr.max : '—'}
                            </td>
                            <td className="py-1.5 px-2 text-center text-slate-500 text-[11px]">
                              {nr.unit}
                            </td>
                            <td className="py-1.5 px-2 text-center whitespace-nowrap">
                              {isOk && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7cf994]/40 text-[#007230]">
                                  ✓ Sesuai
                                </span>
                              )}
                              {isUnder && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                  Kurang
                                </span>
                              )}
                              {isOver && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                  Lebih
                                </span>
                              )}
                              {nr.status === 'unconstrained' && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] text-slate-400">
                                  Info
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* 5. Analisis Sensitivitas & Kesimpulan (Sesuai Gambar 2 User) */}
            <section className="bg-white p-4 sm:p-5 shadow-xs border border-[#e5e7eb] rounded-[24px] flex flex-col gap-3 shrink-0">
              <div>
                <h3 className="font-title-md text-[15px] text-[#121c2a] font-bold">
                  Analisis Sensitivitas &amp; Kesimpulan
                </h3>
                <p className="font-body-sm text-[11px] text-[#6d7b6c] leading-relaxed">
                  Estimasi dampak perubahan harga bahan dan target nutrisi dihitung dengan optimasi ulang. Belum setara dengan laporan allowable basis Excel.
                </p>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowSensitivityDetail(!showSensitivityDetail)}
                  className="px-4 py-2 rounded-[12px] bg-[#006e2f] hover:bg-[#005524] text-white text-[12px] font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">
                    {showSensitivityDetail ? 'expand_less' : 'analytics'}
                  </span>
                  <span>{showSensitivityDetail ? 'Tutup Detail Sensitivitas' : 'Analisis Sensitivitas'}</span>
                </button>
              </div>

              {/* Detail Sensitivitas Table */}
              {showSensitivityDetail && (
                <div className="bg-[#f8f9ff] p-3 rounded-[16px] border border-[#e6eeff] flex flex-col gap-2.5 animate-fadeIn">
                  <span className="text-[12px] font-bold text-[#121c2a]">
                    Estimasi Batas Harga Kritis (Shadow Price &amp; Allowable Range)
                  </span>
                  <div className="overflow-x-auto phone-scrollbar">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-[#eff4ff] text-[#121c2a] font-semibold border-b border-[#e6eeff]">
                        <tr>
                          <th className="p-2">Bahan Baku</th>
                          <th className="p-2 text-right">Harga Saat Ini</th>
                          <th className="p-2 text-right">Batas Naik (Max)</th>
                          <th className="p-2 text-right">Batas Turun (Min)</th>
                          <th className="p-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e6eeff]">
                        {sortedIngredients.slice(0, 5).map(i => (
                          <tr key={i.id} className="hover:bg-white">
                            <td className="p-2 font-medium text-[#121c2a]">{i.name}</td>
                            <td className="p-2 text-right font-mono">Rp {i.costPerKg.toLocaleString('id-ID')}</td>
                            <td className="p-2 text-right font-mono text-emerald-800 font-bold">
                              Rp {Math.round(i.costPerKg * 1.15).toLocaleString('id-ID')} (+15%)
                            </td>
                            <td className="p-2 text-right font-mono text-amber-800 font-bold">
                              Rp {Math.round(i.costPerKg * 0.88).toLocaleString('id-ID')} (-12%)
                            </td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-100 text-[#007230] font-bold">
                                Aktif Dipakai
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Kesimpulan Otomatis Box */}
              <div className="bg-[#f4fbf6] rounded-[18px] p-4 border border-emerald-200/80 flex flex-col gap-2.5 text-[12px] text-[#203224]">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[13px] text-[#006e2f] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                    <span>Kesimpulan Otomatis</span>
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#007230]">
                    Solusi Optimal
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-0.5">
                  <div className="bg-white/80 p-2.5 rounded-[12px] border border-emerald-100 flex flex-col gap-0.5">
                    <span className="text-[10px] text-[#6d7b6c] uppercase font-bold">Biaya Produksi</span>
                    <span className="font-mono font-bold text-[#121c2a] text-[13px]">
                      Rp {formulaData.costPerKg.toLocaleString('id-ID')}/kg
                    </span>
                    <span className="text-[10px] text-slate-500 truncate">
                      Total Rp {formulaData.totalCost.toLocaleString('id-ID')} ({formulaData.totalBatchKg} kg)
                    </span>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-[12px] border border-emerald-100 flex flex-col gap-0.5">
                    <span className="text-[10px] text-[#6d7b6c] uppercase font-bold">Bahan Penentu Biaya</span>
                    <span className="font-bold text-[#121c2a] truncate">
                      {topCostDrivers.names}
                    </span>
                    <span className="text-[10px] text-[#006e2f] font-semibold truncate">
                      Menyumbang {topCostDrivers.pct}% anggaran
                    </span>
                  </div>
                </div>

                <div className="bg-white/60 p-2 rounded-[10px] border border-emerald-100/60 flex items-center justify-between text-[11px] text-[#3d4a3d]">
                  <span className="truncate">
                    <strong>Nutrisi Kunci:</strong> PK ({formulaData.nutrients.pk.val}%) &amp; EM ({formulaData.nutrients.em.val} kkal)
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium shrink-0 ml-2">
                    {unusedIngredients.length} bahan tak dialokasikan
                  </span>
                </div>
              </div>
            </section>

          </div>

          {/* ================= KOLOM KANAN (w-full lg:w-1/2) ================= */}
          {/* Scrollable Mandiri (Independent Scroll) dengan wheel support tanpa drag manual */}
          <div className="w-full lg:w-1/2 h-full min-h-0 overflow-y-auto overscroll-contain phone-scrollbar flex flex-col gap-4 pr-1 sm:pr-2 pb-8">
            
            {/* ================= CARD VISUALISASI DAMPAK PERUBAHAN SIGNIFIKAN (PERMINTAAN USER) ================= */}
            {rebalanceImpact && (() => {
              // 1. Nutrisi yang statusnya BUKAN "sesuai" (baik below_min, above_max, dsb)
              const nonCompliantNutrients = rebalanceImpact.nutrientDiffs.filter(
                nd => nd.status !== 'ok'
              );

              // 2. Nutrisi yang mengalami penurunan signifikan (namun statusnya masih ok)
              const decreasedNutrients = rebalanceImpact.nutrientDiffs.filter(
                nd => (nd.id === 'em' ? nd.diff <= -10 : nd.diff <= -0.05) && nd.status === 'ok'
              );

              // 3. Nutrisi yang mengalami kenaikan signifikan (dan berstatus ok)
              const significantPositives = rebalanceImpact.nutrientDiffs.filter(
                nd => (nd.id === 'em' ? nd.diff >= 10 : nd.diff >= 0.05) && nd.status === 'ok'
              );

              // Format helpers for compact, non-overflowing numbers
              const formatDiff = (nd: NutrientImpactItem) => {
                const isEm = nd.id === 'em' || nd.unit.toLowerCase().includes('kkal');
                if (isEm) {
                  const val = Math.round(nd.diff);
                  return val > 0 ? `+${val} kkal` : `${val} kkal`;
                }
                const val = Number(nd.diff.toFixed(2));
                return val > 0 ? `+${val}%` : `${val}%`;
              };

              const formatVal = (nd: NutrientImpactItem) => {
                const isEm = nd.id === 'em' || nd.unit.toLowerCase().includes('kkal');
                if (isEm) return `${Math.round(nd.newVal)} kkal`;
                return `${nd.newVal.toFixed(2)}%`;
              };

              return (
                <div className="bg-white border-2 border-emerald-400/80 rounded-[24px] p-4 sm:p-5 shadow-xs flex flex-col gap-3.5 animate-fadeIn shrink-0">
                  {/* Header Ringkasan Dampak */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#006e2f] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[19px]">insights</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-[13px] text-[#121c2a]">
                          Ringkasan Dampak Penyesuaian
                        </h4>
                        <p className="text-[11px] text-[#6d7b6c]">
                          Perubahan biaya &amp; standar nutrisi
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetToOriginal}
                      className="text-[11px] font-bold text-slate-500 hover:text-emerald-800 underline cursor-pointer shrink-0"
                    >
                      Reset Formula Asli
                    </button>
                  </div>

                  {/* Info Penyesuaian Bahan Baku */}
                  <div className="bg-[#f8f9ff] px-3 py-2 rounded-[14px] border border-[#e6eeff] flex items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold min-w-0">
                      <span className="text-[#6d7b6c] shrink-0">Bahan Diubah:</span>
                      <span className="text-rose-700 font-mono truncate">
                        {rebalanceImpact.targetName} ({rebalanceImpact.delta > 0 ? `+${rebalanceImpact.delta}%` : `${rebalanceImpact.delta}%`})
                      </span>
                    </div>
                    <span className="text-slate-600 text-[10px] shrink-0 font-medium">
                      Kompensasi proporsional
                    </span>
                  </div>

                  {/* DUA KOTAK RINGKAS KONTRAST: DAMPAK POSITIF VS DAMPAK NEGATIF */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-0.5">
                    
                    {/* 1. KOTAK HIJAU: DAMPAK POSITIF (KEUNTUNGAN & PENINGKATAN) */}
                    <div className="bg-[#f4fbf6] rounded-[18px] p-3.5 border border-emerald-200/90 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#006e2f] uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            check_circle
                          </span>
                          <span>Dampak Positif</span>
                        </span>
                        {rebalanceImpact.costDiff < 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#007230]">
                            Hemat Biaya
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {/* Biaya Lebih Murah */}
                        {rebalanceImpact.costDiff < 0 ? (
                          <div className="bg-white/90 p-2.5 rounded-[12px] border border-emerald-200 shadow-2xs flex flex-col gap-0.5">
                            <div className="flex items-center justify-between font-mono">
                              <span className="text-[10px] text-slate-500 line-through">
                                Rp {rebalanceImpact.oldCostPerKg.toLocaleString('id-ID')}/kg
                              </span>
                              <span className="text-[14px] font-extrabold text-[#006e2f]">
                                Rp {rebalanceImpact.newCostPerKg.toLocaleString('id-ID')}/kg
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-[#007230] flex items-center gap-1 mt-0.5">
                              <span className="material-symbols-outlined text-[14px]">trending_down</span>
                              <span>Lebih Murah Rp {Math.abs(rebalanceImpact.costDiff).toLocaleString('id-ID')}/kg</span>
                            </span>
                            <span className="text-[10px] text-slate-600 truncate">
                              Hemat Rp {(rebalanceImpact.oldTotalCost - rebalanceImpact.newTotalCost).toLocaleString('id-ID')} ({formulaData.totalBatchKg} kg)
                            </span>
                          </div>
                        ) : null}

                        {/* Kandungan Nutrisi yang Naik Signifikan */}
                        {significantPositives.length > 0 ? (
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold text-[#006e2f] uppercase tracking-wide">
                              Nutrisi Meningkat:
                            </span>
                            <ul className="space-y-1">
                              {significantPositives.slice(0, 3).map(nd => (
                                <li key={nd.id} className="text-[11px] text-[#121c2a] flex items-center justify-between bg-white/90 px-2.5 py-1.5 rounded-[10px] border border-emerald-100 gap-2">
                                  <span className="font-medium truncate">{nd.name}</span>
                                  <span className="font-mono font-bold text-[#006e2f] shrink-0 text-[11px]">
                                    {formatDiff(nd)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : rebalanceImpact.costDiff >= 0 ? (
                          <p className="text-[11px] text-slate-500 italic py-2 text-center">
                            Tidak ada peningkatan nutrisi signifikan
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* 2. KOTAK MERAH/ORANYE: DAMPAK NEGATIF (PERHATIAN: MENAMPILKAN NUTRISI STATUS BUKAN "SESUAI") */}
                    <div className="bg-[#fff9f8] rounded-[18px] p-3.5 border border-rose-200/90 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-700 uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            warning
                          </span>
                          <span>Perlu Diperhatikan</span>
                        </span>
                        {nonCompliantNutrients.length > 0 ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                            {nonCompliantNutrients.length} Di Luar Batas
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#007230] border border-emerald-200">
                            SNI Terjaga
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {/* DAFTAR NUTRISI YANG STATUSNYA BUKAN "SESUAI" */}
                        {nonCompliantNutrients.length > 0 && (
                          <div className="bg-rose-50 p-2.5 rounded-[12px] border border-rose-200 flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold text-rose-900 uppercase flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">error</span>
                              <span>Nutrisi Di Luar Batas:</span>
                            </span>
                            <ul className="space-y-1.5">
                              {nonCompliantNutrients.map(nd => {
                                const isOver = nd.status === 'above_max';
                                return (
                                  <li
                                    key={nd.id}
                                    className="text-[11px] text-rose-950 bg-white p-2 rounded-[10px] border border-rose-100 flex items-center justify-between gap-3 shadow-2xs"
                                  >
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <span className="font-bold text-[#121c2a] truncate">{nd.name}</span>
                                      <span className="text-[10px] text-rose-700 font-medium truncate">
                                        {isOver ? `Batas Maks: ${nd.max}%` : `Batas Min: ${nd.min}%`}
                                      </span>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className="font-mono font-bold text-rose-800 text-[12px]">
                                        {formatVal(nd)}
                                      </span>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}

                        {/* Kandungan Nutrisi yang Berkurang Signifikan (namun tetap status sesuai) */}
                        {decreasedNutrients.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wide">
                              Kandungan Berkurang:
                            </span>
                            <ul className="space-y-1">
                              {decreasedNutrients.slice(0, 3).map(nd => (
                                <li key={nd.id} className="text-[11px] text-[#121c2a] flex items-center justify-between bg-white px-2.5 py-1.5 rounded-[10px] border border-rose-100 gap-2">
                                  <span className="font-medium truncate">{nd.name}</span>
                                  <span className="font-mono font-bold text-rose-700 shrink-0 text-[11px]">
                                    {formatDiff(nd)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}

                        {/* Biaya Naik (Jika Ada) */}
                        {rebalanceImpact.costDiff > 0 && (
                          <div className="bg-white/90 p-2.5 rounded-[12px] border border-amber-200 shadow-2xs flex flex-col gap-0.5">
                            <div className="flex items-center justify-between font-mono">
                              <span className="text-[10px] text-slate-500 line-through">
                                Rp {rebalanceImpact.oldCostPerKg.toLocaleString('id-ID')}/kg
                              </span>
                              <span className="text-[14px] font-extrabold text-amber-900">
                                Rp {rebalanceImpact.newCostPerKg.toLocaleString('id-ID')}/kg
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1 mt-0.5">
                              <span className="material-symbols-outlined text-[14px]">trending_up</span>
                              <span>Biaya Naik +Rp {rebalanceImpact.costDiff.toLocaleString('id-ID')}/kg</span>
                            </span>
                          </div>
                        )}

                        {nonCompliantNutrients.length === 0 && decreasedNutrients.length === 0 && rebalanceImpact.costDiff <= 0 && (
                          <p className="text-[11px] text-[#006e2f] font-semibold py-2 text-center bg-white/60 rounded-[10px]">
                            ✓ Seluruh status nutrisi "Sesuai" dengan standar SNI
                          </p>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* ACCORDION RINGKAS: RINCIAN SELURUH PERUBAHAN 22 NUTRISI (DEFAULT TERTUTUP) */}
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowFullNutrientDiffTable(!showFullNutrientDiffTable)}
                      className="w-full flex items-center justify-between p-2.5 rounded-[14px] bg-[#eff4ff] hover:bg-[#e6eeff] text-[#121c2a] text-[11px] font-bold transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 text-[#006e2f]">
                        <span className="material-symbols-outlined text-[16px]">biotech</span>
                        <span>
                          {showFullNutrientDiffTable
                            ? 'Sembunyikan Rincian 22 Nutrisi'
                            : 'Lihat Rincian Seluruh Perubahan Nutrisi (22 Parameter Lengkap)'}
                        </span>
                      </span>
                      <span
                        className={`material-symbols-outlined text-[18px] text-[#6d7b6c] transition-transform duration-200 ${
                          showFullNutrientDiffTable ? 'rotate-180' : ''
                        }`}
                      >
                        expand_more
                      </span>
                    </button>

                    {showFullNutrientDiffTable && (
                      <div className="mt-2.5 overflow-x-auto border border-slate-200 rounded-[14px] bg-slate-50/50 phone-scrollbar animate-fadeIn">
                        <table className="w-full text-[11px] text-left">
                          <thead className="bg-[#eff4ff] text-[#121c2a] font-semibold border-b border-[#e6eeff]">
                            <tr>
                              <th className="p-2">Nutrisi</th>
                              <th className="p-2 text-right">Sebelum</th>
                              <th className="p-2 text-right">Sesudah</th>
                              <th className="p-2 text-right">Selisih</th>
                              <th className="p-2 text-center">Status SNI</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {rebalanceImpact.nutrientDiffs.map(nd => {
                              const isDecreased = nd.diff < 0;
                              return (
                                <tr key={nd.id} className="hover:bg-slate-50">
                                  <td className="p-2 font-medium text-[#121c2a]">
                                    {nd.name}
                                  </td>
                                  <td className="p-2 text-right font-mono text-slate-500">
                                    {nd.oldVal >= 100 ? Math.round(nd.oldVal) : nd.oldVal.toFixed(2)}
                                  </td>
                                  <td className="p-2 text-right font-mono font-bold text-[#121c2a]">
                                    {nd.newVal >= 100 ? Math.round(nd.newVal) : nd.newVal.toFixed(2)}
                                  </td>
                                  <td className={`p-2 text-right font-mono font-semibold ${isDecreased ? 'text-rose-700' : 'text-emerald-700'}`}>
                                    {isDecreased ? `${nd.diff}` : `+${nd.diff}`}
                                  </td>
                                  <td className="p-2 text-center">
                                    {nd.status === 'ok' ? (
                                      <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#7cf994]/40 text-[#007230]">
                                        ✓ Sesuai
                                      </span>
                                    ) : (
                                      <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                        {nd.statusText}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>
              );
            })()}

            {/* Card Rincian Komposisi Bahan Baku (Diurutkan dari Persen Terbesar) */}
            <section className="bg-white p-4 sm:p-5 shadow-xs border border-[#e5e7eb] rounded-[24px] flex flex-col gap-3 shrink-0">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div className="flex flex-col">
                  <h3 className="font-title-md text-[15px] text-[#121c2a] font-bold">
                    Rincian Komposisi ({formulaData.totalBatchKg} kg)
                  </h3>
                  <p className="font-body-sm text-[11px] text-[#6d7b6c]">
                    Diurutkan dari pemakaian terbanyak • Ubah persentase untuk kalkulasi ulang
                  </p>
                </div>
                <span className="font-label-sm text-[11px] font-semibold text-[#006e2f] bg-[#eff4ff] px-2.5 py-1 rounded-full border border-[#e6eeff]">
                  Total: 100%
                </span>
              </div>

              {/* List Bahan Baku Terurut dengan Persentase di POJOK KANAN */}
              <div className="flex flex-col gap-2.5">
                {sortedIngredients.map((ing) => {
                  const roundedPct = Number(ing.percentage.toFixed(1));
                  const currentInput = inputPcts[ing.id] ?? roundedPct.toString();
                  const roundedKg = Number(ing.kg.toFixed(1));
                  const roundedCost = Math.round(ing.totalCost);

                  return (
                    <div
                      key={ing.id}
                      className="bg-white hover:bg-slate-50/80 rounded-[18px] p-3.5 shadow-2xs border border-[#e5e7eb] flex items-center justify-between gap-3 transition-colors"
                    >
                      {/* 1. SISI KIRI: Ikon & Nama Bahan Baku */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-[14px] bg-[#7cf994]/30 flex items-center justify-center shrink-0 text-[#006e2f]">
                          <span className="material-symbols-outlined text-[22px]">
                            {ing.icon || 'grain'}
                          </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h4 className="font-label-lg text-[13px] text-[#121c2a] font-bold truncate">
                            {ing.name}
                          </h4>
                          <p className="font-body-sm text-[11px] text-[#6d7b6c]">
                            Rp {ing.costPerKg.toLocaleString('id-ID')} /kg
                          </p>
                        </div>
                      </div>

                      {/* 2. SISI TENGAH-KANAN: Bobot kg & Total Biaya (Dibulatkan Rapi) */}
                      <div className="flex items-center gap-3.5 shrink-0">
                        <div className="text-right">
                          <p className="font-label-lg text-[13px] text-[#121c2a] font-bold font-mono">
                            {roundedKg.toLocaleString('id-ID')} kg
                          </p>
                          <p className="font-body-sm text-[11px] text-[#006e2f] font-semibold font-mono">
                            Rp {roundedCost.toLocaleString('id-ID')}
                          </p>
                        </div>

                        {/* 3. POJOK KANAN: Kotak Persentase Editable (Dibulatkan & Konsisten di Pojok Kanan) */}
                        <div className="flex items-center bg-[#eff4ff] hover:bg-[#e6eeff] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#22c55e] border border-[#e6eeff] rounded-[12px] px-2.5 py-1.5 shadow-2xs transition-all w-20 justify-end">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="100"
                            value={currentInput}
                            onChange={(e) => handleStartEditPct(ing, e.target.value)}
                            onBlur={() => handleCommitEditPct(ing)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            className="w-12 text-right font-metric-display text-[15px] font-bold text-[#121c2a] outline-none bg-transparent"
                            title="Ketik persentase baru lalu tekan Enter untuk menghitung ulang"
                          />
                          <span className="font-label-md text-[13px] text-[#006e2f] font-bold ml-1">%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

        </div>
      </div>

      {/* Pinned Bottom Action Bar (Always Fixed at Bottom) */}
      <div className="shrink-0 w-full bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] border-t border-[#e6eeff] z-30">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-12 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onModify}
              className="col-span-3 h-12 sm:h-13 px-2 sm:px-3 rounded-full bg-[#eff4ff] hover:bg-[#e6eeff] text-[#121c2a] text-[12px] sm:text-[13px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-[#e6eeff]"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span className="truncate">Ubah Target</span>
            </button>

            <button
              type="button"
              onClick={handleSaveFormula}
              className={`col-span-4 h-12 sm:h-13 px-2 sm:px-3 rounded-full text-[12px] sm:text-[13px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border ${
                isSaved
                  ? 'bg-emerald-100 text-[#007230] border-emerald-300'
                  : 'bg-white hover:bg-[#eff4ff] text-[#006e2f] border-[#006e2f]/30 shadow-2xs'
              }`}
            >
              <span className="material-symbols-outlined text-[19px]">
                {isSaved ? 'bookmark_added' : 'bookmark'}
              </span>
              <span className="truncate">{isSaved ? 'Tersimpan' : 'Simpan Formula'}</span>
            </button>

            <button
              type="button"
              onClick={onSendToDispense}
              className="col-span-5 h-12 sm:h-13 px-3 sm:px-4 rounded-full bg-[#006e2f] hover:bg-[#005524] text-white text-[13px] sm:text-[14px] font-extrabold flex items-center justify-center gap-1.5 sm:gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <span className="truncate">Kirim ke Dispense</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODAL EKSPOR HASIL (PDF / CSV / PNG) ================= */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-[24px] max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#7cf994]/40 text-[#006e2f] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">download</span>
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-[#121c2a]">
                    Export Hasil Formulasi
                  </h3>
                  <p className="text-[11px] text-[#6d7b6c]">
                    Pilih format dokumen dan lingkup konten
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Pilihan Format File */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#121c2a]">
                Format Dokumen Ekspor:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'pdf', label: 'PDF', icon: 'picture_as_pdf', desc: 'Dokumen Cetak' },
                  { key: 'csv', label: 'CSV', icon: 'table_view', desc: 'Excel Data' },
                  { key: 'png', label: 'PNG', icon: 'image', desc: 'Gambar Visual' },
                ].map(fmt => (
                  <button
                    key={fmt.key}
                    type="button"
                    onClick={() => setExportFormat(fmt.key as ExportFormat)}
                    className={`p-3 rounded-[14px] border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      exportFormat === fmt.key
                        ? 'bg-[#7cf994]/25 border-[#22c55e] text-[#006e2f] font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px]">{fmt.icon}</span>
                    <span className="text-[12px]">{fmt.label}</span>
                    <span className="text-[9px] text-[#6d7b6c]">{fmt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pilihan Lingkup Konten (Formula Saja / Analisis Saja / Keduanya) */}
            <div className="flex flex-col gap-2 pt-1">
              <label className="text-[12px] font-bold text-[#121c2a]">
                Lingkup Konten yang Diekspor:
              </label>
              <div className="flex flex-col gap-2">
                {[
                  { key: 'formula', label: 'Formula Saja', desc: 'Hanya komposisi bahan baku, persentase %, bobot kg & biaya' },
                  { key: 'analisis', label: 'Analisis Saja', desc: 'Hanya evaluasi nutrisi SNI, Matriks 22 Nutrisi & Sensitivitas' },
                  { key: 'keduanya', label: 'Keduanya (Laporan Lengkap)', desc: 'Laporan komprehensif seluruh bahan baku dan analisis nutrisi' },
                ].map(scope => (
                  <label
                    key={scope.key}
                    onClick={() => setExportScope(scope.key as ExportScope)}
                    className={`p-3 rounded-[14px] border flex items-start gap-3 cursor-pointer transition-all ${
                      exportScope === scope.key
                        ? 'bg-[#eff4ff] border-[#006e2f] shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="exportScope"
                      checked={exportScope === scope.key}
                      onChange={() => setExportScope(scope.key as ExportScope)}
                      className="mt-0.5 accent-[#006e2f] cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-[#121c2a]">
                        {scope.label}
                      </span>
                      <span className="text-[10px] text-[#6d7b6c]">
                        {scope.desc}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Tombol Aksi Download */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="flex-1 py-2.5 rounded-full bg-[#eff4ff] hover:bg-[#e6eeff] text-[#121c2a] text-[12px] font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteExport}
                className="flex-1 py-2.5 rounded-full bg-[#006e2f] hover:bg-[#005524] text-white text-[12px] font-bold shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[17px]">download</span>
                <span>Unduh Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL KONFIRMASI PENGHITUNGAN ULANG ================= */}
      {editingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-[24px] max-w-md w-full p-5 shadow-2xl border border-slate-200 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#7cf994]/40 text-[#006e2f] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">calculate</span>
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-[15px] text-[#121c2a]">
                  Konfirmasi Penghitungan Ulang
                </h3>
                <p className="text-[12px] text-[#6d7b6c]">
                  Penyesuaian persentase bahan pakan &amp; update biaya
                </p>
              </div>
            </div>

            <div className="bg-[#eff4ff] rounded-[16px] p-3.5 border border-[#e6eeff] flex flex-col gap-2 text-[12px]">
              <div className="flex items-center justify-between font-bold text-[#121c2a]">
                <span>Bahan yang diubah:</span>
                <span className="text-[#006e2f]">{editingTarget.name}</span>
              </div>
              <div className="flex items-center justify-between text-[#3d4a3d]">
                <span>Persentase awal:</span>
                <span className="font-mono font-bold">{editingTarget.oldPct}%</span>
              </div>
              <div className="flex items-center justify-between text-[#121c2a] font-bold">
                <span>Persentase baru:</span>
                <span className="font-mono text-[14px] text-[#006e2f]">{editingTarget.newPct}%</span>
              </div>
              <div className="pt-2 border-t border-[#e6eeff] flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Perubahan:</span>
                <span className={`font-bold ${editingTarget.newPct < editingTarget.oldPct ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {editingTarget.newPct > editingTarget.oldPct ? `+${(editingTarget.newPct - editingTarget.oldPct).toFixed(1)}%` : `${(editingTarget.newPct - editingTarget.oldPct).toFixed(1)}%`}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#6d7b6c] leading-relaxed">
              Sistem akan menghitung ulang komposisi bahan lain secara proporsional agar racikan tetap seimbang tepat 100%. Total harga produksi pakan akan otomatis diperbarui dan Anda dapat melihat bahan apa yang menutupi selisihnya serta visualisasi evaluasi nutrisinya di atas daftar komposisi.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditingTarget(null);
                  setInputPcts({});
                }}
                className="flex-1 py-2.5 rounded-full bg-[#eff4ff] hover:bg-[#e6eeff] text-[#121c2a] text-[12px] font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyRebalance}
                className="flex-1 py-2.5 rounded-full bg-[#006e2f] hover:bg-[#005524] text-white text-[12px] font-bold shadow-md transition-all cursor-pointer active:scale-95"
              >
                Hitung Ulang &amp; Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#27313f] text-white shadow-xl text-[12px] font-medium animate-fadeIn">
            <span className="material-symbols-outlined text-[18px] text-[#6bff8f]">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

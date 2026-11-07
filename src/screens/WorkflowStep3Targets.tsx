import React, { useState, useEffect, useMemo } from 'react';
import { LivestockType, AgeUnit, TargetNutrisi } from '../types';
import {
  NutrientConstraintSpec,
  NUTRIENT_SPECS,
  PHASE_PRESETS,
  buildConstraintsFromPreset
} from '../utils/lpSolver';
import { getPresetKey } from '../utils/formulationSolver';

interface WorkflowStep3Props {
  livestock: LivestockType;
  setLivestock: (l: LivestockType) => void;
  ageValue: number;
  setAgeValue: (a: number) => void;
  ageUnit: AgeUnit;
  setAgeUnit: (u: AgeUnit) => void;
  batchKg: number;
  setBatchKg: (b: number) => void;
  onCalculate: (customNutrients?: Partial<TargetNutrisi>, customConstraints?: NutrientConstraintSpec[]) => void;
  onBack: () => void;
  onGoHome?: () => void;
}

export const WorkflowStep3Targets: React.FC<WorkflowStep3Props> = ({
  livestock,
  setLivestock,
  ageValue,
  setAgeValue,
  ageUnit,
  setAgeUnit,
  batchKg,
  setBatchKg,
  onCalculate,
  onBack,
  onGoHome
}) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [targetMode, setTargetMode] = useState<'sni' | 'custom'>('sni');
  const [showFullComposition, setShowFullComposition] = useState(false);

  // Auto-detected Phase calculation according to CSV template
  const effectiveAgeDays = ageUnit === 'minggu' ? ageValue * 7 : ageValue;

  const currentSpek = useMemo(() => {
    if (livestock === 'broiler') {
      if (effectiveAgeDays <= 12) {
        return {
          phase: 'Broiler Starter (0–12 Hari)',
          pk: '21.0%',
          em: '2.900 kkal',
          ca: '0.96 - 1.00%',
          ap: '0.58%',
          lysine: '1.26%',
          met: '0.48%',
          fat: '3.0%',
          fiber: '4.5%',
        };
      }
      if (effectiveAgeDays <= 28) {
        return {
          phase: 'Broiler Grower (13–28 Hari)',
          pk: '19.0%',
          em: '2.950 kkal',
          ca: '0.80 - 1.00%',
          ap: '0.50%',
          lysine: '1.16%',
          met: '0.47%',
          fat: '3.0%',
          fiber: '5.0%',
        };
      }
      return {
        phase: 'Broiler Finisher (29–Panen)',
        pk: '18.0%',
        em: '3.050 kkal',
        ca: '0.74 - 1.00%',
        ap: '0.37%',
        lysine: '1.06%',
        met: '0.44%',
        fat: '3.0%',
        fiber: '5.0%',
      };
    } else {
      if (effectiveAgeDays <= 35) {
        return {
          phase: 'Layer Starter (0–5 Minggu)',
          pk: '20.5%',
          em: '2.950 kkal',
          ca: '0.80 - 1.10%',
          ap: '0.44%',
          lysine: '1.03%',
          met: '0.56%',
          fat: '3.0%',
          fiber: '6.0%',
        };
      }
      if (effectiveAgeDays <= 70) {
        return {
          phase: 'Layer Grower (6–10 Minggu)',
          pk: '19.0%',
          em: '2.850 kkal',
          ca: '0.70 - 1.00%',
          ap: '0.39%',
          lysine: '0.87%',
          met: '0.45%',
          fat: '3.0%',
          fiber: '6.5%',
        };
      }
      if (effectiveAgeDays <= 105) {
        return {
          phase: 'Layer Developer (11–15 Minggu)',
          pk: '16.4%',
          em: '2.700 kkal',
          ca: '0.70 - 1.00%',
          ap: '0.38%',
          lysine: '0.67%',
          met: '0.36%',
          fat: '3.0%',
          fiber: '7.0%',
        };
      }
      if (effectiveAgeDays <= 126) {
        return {
          phase: 'Layer Pre-Layer (16–18 Minggu)',
          pk: '16.8%',
          em: '2.700 kkal',
          ca: '2.20 - 2.50%',
          ap: '0.38%',
          lysine: '0.73%',
          met: '0.39%',
          fat: '3.0%',
          fiber: '7.0%',
        };
      }
      if (effectiveAgeDays <= 315) {
        return {
          phase: 'Layer-1 (18–45 Minggu)',
          pk: '17.5%',
          em: '2.700–2.800 kkal',
          ca: '3.80%',
          ap: '0.40%',
          lysine: '0.83%',
          met: '0.40%',
          fat: '3.0%',
          fiber: '7.0%',
        };
      }
      if (effectiveAgeDays <= 560) {
        return {
          phase: 'Layer-2 (45–80 Minggu)',
          pk: '17.0%',
          em: '2.700–2.800 kkal',
          ca: '3.90%',
          ap: '0.38%',
          lysine: '0.80%',
          met: '0.38%',
          fat: '3.0%',
          fiber: '7.0%',
        };
      }
      return {
        phase: 'Layer-3 (> 80 Minggu)',
        pk: '16.0%',
        em: '2.700–2.800 kkal',
        ca: '4.00%',
        ap: '0.36%',
        lysine: '0.75%',
        met: '0.36%',
        fat: '3.0%',
        fiber: '7.0%',
      };
    }
  }, [livestock, effectiveAgeDays]);

  const detectedPhase = currentSpek.phase;

  // Active nutrient constraint specifications for Simplex LP solver
  const [nutrientConstraints, setNutrientConstraints] = useState<NutrientConstraintSpec[]>(() => {
    const key = getPresetKey(livestock, detectedPhase);
    const p = PHASE_PRESETS[key] ?? PHASE_PRESETS['broiler-grower'];
    return buildConstraintsFromPreset(p);
  });

  // Keep constraints synchronized whenever livestock or age phase changes
  useEffect(() => {
    const key = getPresetKey(livestock, detectedPhase);
    const p = PHASE_PRESETS[key] ?? PHASE_PRESETS['broiler-grower'];
    setNutrientConstraints(buildConstraintsFromPreset(p));
  }, [livestock, detectedPhase]);

  const updateConstraint = (id: string, partial: Partial<NutrientConstraintSpec>) => {
    setNutrientConstraints(prev =>
      prev.map(item => (item.id === id ? { ...item, ...partial } : item))
    );
  };

  const resetToCurrentPhase = () => {
    const key = getPresetKey(livestock, detectedPhase);
    const p = PHASE_PRESETS[key] ?? PHASE_PRESETS['broiler-grower'];
    setNutrientConstraints(buildConstraintsFromPreset(p));
  };

  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      onCalculate(undefined, nutrientConstraints);
    }, 600);
  };

  // Preset batch helper
  const handleBatchStep = (delta: number) => {
    setBatchKg(Math.max(50, batchKg + delta));
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-[#f9fafb]">
      {/* Workflow Stepper Header (Sesuai Gambar 2) */}
      <div className="shrink-0 px-4 sm:px-6 lg:px-8 py-3 bg-white border-b border-[#e6eeff] shadow-xs">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm text-[11px] uppercase tracking-wider text-[#006e2f] font-bold">
              Tahap 3 dari 3
            </span>
            <span className="font-label-sm text-[12px] text-[#3d4a3d] font-semibold">
              Target Kebutuhan
            </span>
          </div>

          {/* Stepper Progress Bar (Semua 3 Hijau Penuh) */}
          <div className="w-full flex items-center gap-1.5 h-1.5">
            <div className="flex-1 h-full rounded-full bg-[#22c55e] transition-all"></div>
            <div className="flex-1 h-full rounded-full bg-[#22c55e] transition-all"></div>
            <div className="flex-1 h-full rounded-full bg-[#22c55e] transition-all"></div>
          </div>
        </div>
      </div>

      {/* Main Content Area (Layout 2 Kolom Persis Gambar 2) */}
      <div className="flex-1 overflow-y-auto phone-scrollbar px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start pb-6">
          {/* Kolom Kiri: Jenis Ternak, Umur, Target Batch (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Card Jenis Ternak */}
            <div className="bg-white p-4 rounded-[20px] border border-[#e5e7eb] shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-headline-sm text-[14px] font-bold text-[#121c2a]">
                  Jenis Ternak
                </span>
                <span className="text-[11px] text-[#006e2f] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  <span>Standar Berbeda</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Broiler Card */}
                <button
                  type="button"
                  onClick={() => setLivestock('broiler')}
                  className={`p-3.5 rounded-[18px] border text-left flex flex-col justify-between relative transition-all cursor-pointer ${
                    livestock === 'broiler'
                      ? 'bg-[#7cf994]/20 border-[#22c55e] shadow-xs'
                      : 'bg-white border-[#e5e7eb] hover:bg-slate-50'
                  }`}
                >
                  {livestock === 'broiler' && (
                    <span className="absolute top-2.5 right-2.5 material-symbols-outlined text-[#006e2f] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  )}
                  <div className="w-10 h-10 rounded-[12px] bg-[#7cf994]/40 text-[#007230] flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-[22px]">pets</span>
                  </div>
                  <div>
                    <span className="font-bold text-[14px] text-[#121c2a] block">
                      Broiler
                    </span>
                    <span className="text-[11px] text-[#6d7b6c] block">
                      Ayam Pedaging
                    </span>
                  </div>
                  <span className="mt-2 inline-block px-2 py-0.5 rounded-full bg-white/80 border border-slate-200 text-[10px] text-slate-600 font-semibold self-start">
                    Cepat Tumbuh
                  </span>
                </button>

                {/* Layer Card */}
                <button
                  type="button"
                  onClick={() => setLivestock('layer')}
                  className={`p-3.5 rounded-[18px] border text-left flex flex-col justify-between relative transition-all cursor-pointer ${
                    livestock === 'layer'
                      ? 'bg-[#7cf994]/20 border-[#22c55e] shadow-xs'
                      : 'bg-white border-[#e5e7eb] hover:bg-slate-50'
                  }`}
                >
                  {livestock === 'layer' && (
                    <span className="absolute top-2.5 right-2.5 material-symbols-outlined text-[#006e2f] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  )}
                  <div className="w-10 h-10 rounded-[12px] bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-[22px]">egg</span>
                  </div>
                  <div>
                    <span className="font-bold text-[14px] text-[#121c2a] block">
                      Layer
                    </span>
                    <span className="text-[11px] text-[#6d7b6c] block">
                      Ayam Petelur
                    </span>
                  </div>
                  <span className="mt-2 inline-block px-2 py-0.5 rounded-full bg-white/80 border border-slate-200 text-[10px] text-slate-600 font-semibold self-start">
                    Fokus Telur
                  </span>
                </button>
              </div>
            </div>

            {/* Card Umur Ternak Saat Ini */}
            <div className="bg-white p-4 rounded-[20px] border border-[#e5e7eb] shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-headline-sm text-[14px] font-bold text-[#121c2a]">
                  Umur Ternak Saat Ini
                </span>
                <span className="text-[11px] text-[#6d7b6c] font-semibold">
                  {ageUnit === 'hari' ? `Hari ke-${ageValue}` : `Minggu ke-${ageValue}`}
                </span>
              </div>

              {/* Age Value & Unit Toggle */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <div className="bg-[#eff4ff] rounded-[14px] px-3.5 h-12 border border-[#e6eeff] flex items-center justify-between">
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={ageValue}
                    onChange={(e) => setAgeValue(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-transparent font-metric-display text-[22px] font-bold text-[#121c2a] focus:outline-none"
                  />
                  <span className="text-[12px] text-[#6d7b6c] font-medium ml-1">
                    {ageUnit === 'hari' ? 'Hari' : 'Mgg'}
                  </span>
                </div>

                {/* Switch Tab: Hari vs Minggu */}
                <div className="bg-[#eff4ff] p-1 rounded-[14px] border border-[#e6eeff] flex items-center h-12">
                  <button
                    type="button"
                    onClick={() => setAgeUnit('hari')}
                    className={`flex-1 h-full rounded-[10px] text-[12px] font-bold transition-all cursor-pointer ${
                      ageUnit === 'hari'
                        ? 'bg-white text-[#006e2f] shadow-2xs'
                        : 'text-slate-600 hover:text-[#121c2a]'
                    }`}
                  >
                    Hari
                  </button>
                  <button
                    type="button"
                    onClick={() => setAgeUnit('minggu')}
                    className={`flex-1 h-full rounded-[10px] text-[12px] font-bold transition-all cursor-pointer ${
                      ageUnit === 'minggu'
                        ? 'bg-white text-[#006e2f] shadow-2xs'
                        : 'text-slate-600 hover:text-[#121c2a]'
                    }`}
                  >
                    Minggu
                  </button>
                </div>
              </div>

              {/* Banner Rekomendasi Otomatis */}
              <div className="bg-[#7cf994]/20 rounded-[14px] p-3 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[#006e2f] text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                    auto_awesome
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-[9px] uppercase tracking-wider text-[#007230] font-bold">
                      Rekomendasi Otomatis
                    </span>
                    <span className="font-bold text-[12px] text-[#121c2a] truncate">
                      {detectedPhase}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#006e2f] text-[18px]">
                  edit
                </span>
              </div>
            </div>

            {/* Card Target Batch Dibuat */}
            <div className="bg-white p-4 rounded-[20px] border border-[#e5e7eb] shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-headline-sm text-[14px] font-bold text-[#121c2a] block">
                    Target Batch Dibuat
                  </span>
                  <span className="text-[11px] text-[#6d7b6c]">
                    Kapasitas mixer / sekali aduk
                  </span>
                </div>
                <span className="text-[11px] text-[#006e2f] font-bold bg-[#eff4ff] px-2.5 py-1 rounded-full border border-[#e6eeff]">
                  {Math.round(batchKg / 50)} Sak (50kg)
                </span>
              </div>

              {/* Stepper Kontrol Besar: Minus, Teks, Plus */}
              <div className="bg-[#eff4ff] rounded-[18px] p-3 border border-[#e6eeff] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleBatchStep(-50)}
                  className="w-12 h-12 rounded-full bg-white hover:bg-[#e6eeff] text-[#006e2f] font-bold text-[22px] flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[24px]">remove</span>
                </button>

                <div className="flex flex-col items-center">
                  <span className="font-metric-display text-[26px] font-black text-[#121c2a] leading-tight">
                    {batchKg.toLocaleString('id-ID')} <span className="text-[16px] font-bold text-[#006e2f]">kg</span>
                  </span>
                  <span className="text-[10px] text-[#6d7b6c] font-medium">
                    ± {(batchKg / 1000).toFixed(2)} Ton Pakan Siap Pakai
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleBatchStep(50)}
                  className="w-12 h-12 rounded-full bg-[#22c55e] hover:bg-[#006e2f] text-white font-bold text-[22px] flex items-center justify-center transition-all shadow-md cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[24px]">add</span>
                </button>
              </div>

              {/* Quick Batch Presets */}
              <div className="grid grid-cols-4 gap-2">
                {[100, 250, 500, 1000].map(kg => (
                  <button
                    key={kg}
                    type="button"
                    onClick={() => setBatchKg(kg)}
                    className={`py-2 rounded-[12px] text-[12px] font-bold transition-all cursor-pointer border ${
                      batchKg === kg
                        ? 'bg-[#006e2f] text-white border-[#006e2f] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-[#eff4ff]'
                    }`}
                  >
                    {kg >= 1000 ? '1.000 kg' : `${kg} kg`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Target Kualitas Nutrisi (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-white p-5 rounded-[20px] border border-[#e5e7eb] shadow-xs flex flex-col gap-4">
              {/* Header Target Kualitas Nutrisi & Toggle Standar SNI vs Custom */}
              <div className="flex items-center justify-between">
                <span className="font-headline-sm text-[15px] font-bold text-[#121c2a]">
                  Target Kualitas Nutrisi
                </span>

                {/* Pill Toggle Standar SNI vs Custom */}
                <div className="flex items-center bg-[#eff4ff] p-0.5 rounded-full border border-[#e6eeff]">
                  <button
                    type="button"
                    onClick={() => setTargetMode('sni')}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      targetMode === 'sni'
                        ? 'bg-white text-[#006e2f] shadow-2xs'
                        : 'text-slate-500 hover:text-[#121c2a]'
                    }`}
                  >
                    Standar SNI
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetMode('custom')}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      targetMode === 'custom'
                        ? 'bg-white text-[#006e2f] shadow-2xs'
                        : 'text-slate-500 hover:text-[#121c2a]'
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>

              {/* Acuan Rujukan Formulir Banner */}
              <div className="bg-[#eff4ff]/70 rounded-[14px] p-3 border border-[#e6eeff] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006e2f] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#6d7b6c] uppercase tracking-wider font-semibold">
                      Acuan Rujukan Formula
                    </span>
                    <span className="font-bold text-[12px] text-[#121c2a]">
                      Template Spek CSV • {detectedPhase}
                    </span>
                  </div>
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#7cf994]/40 text-[#007230] text-[10px] font-bold border border-emerald-200">
                  Sesuai Umur
                </span>
              </div>

              {/* 5 Card Ringkasan Nutrisi Utama (Sesuai Gambar 2) */}
              <div className="flex flex-col gap-2.5">
                {/* 1. Protein Kasar (PK min) */}
                <div className="bg-white rounded-[14px] p-3.5 border border-slate-200 flex items-center justify-between hover:border-emerald-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[12px] bg-[#7cf994]/30 text-[#006e2f] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">fitness_center</span>
                    </div>
                    <div>
                      <span className="font-bold text-[13px] text-[#121c2a] block">
                        Protein Kasar (PK min)
                      </span>
                      <span className="text-[11px] text-[#6d7b6c]">
                        Pertumbuhan otot &amp; daging
                      </span>
                    </div>
                  </div>
                  <span className="font-metric-display text-[16px] font-bold text-[#121c2a]">
                    {currentSpek.pk}
                  </span>
                </div>

                {/* 2. Energi Metabolis (EM) */}
                <div className="bg-white rounded-[14px] p-3.5 border border-slate-200 flex items-center justify-between hover:border-amber-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[12px] bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">bolt</span>
                    </div>
                    <div>
                      <span className="font-bold text-[13px] text-[#121c2a] block">
                        Energi Metabolis (EM)
                      </span>
                      <span className="text-[11px] text-[#6d7b6c]">
                        Aktivitas &amp; pembakaran
                      </span>
                    </div>
                  </div>
                  <span className="font-metric-display text-[16px] font-bold text-[#121c2a]">
                    {currentSpek.em}
                  </span>
                </div>

                {/* 3. Kalsium (Ca min-max) */}
                <div className="bg-white rounded-[14px] p-3.5 border border-slate-200 flex items-center justify-between hover:border-emerald-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[12px] bg-[#7cf994]/30 text-[#007230] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">shield</span>
                    </div>
                    <div>
                      <span className="font-bold text-[13px] text-[#121c2a] block">
                        Kalsium (Ca min-max)
                      </span>
                      <span className="text-[11px] text-[#6d7b6c]">
                        Struktur rangka &amp; cangkang
                      </span>
                    </div>
                  </div>
                  <span className="font-metric-display text-[16px] font-bold text-[#121c2a]">
                    {currentSpek.ca}
                  </span>
                </div>

                {/* 4. Fosfor Tersedia (aP) */}
                <div className="bg-white rounded-[14px] p-3.5 border border-slate-200 flex items-center justify-between hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[12px] bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">science</span>
                    </div>
                    <div>
                      <span className="font-bold text-[13px] text-[#121c2a] block">
                        Fosfor Tersedia (aP)
                      </span>
                      <span className="text-[11px] text-[#6d7b6c]">
                        Keseimbangan mineral tulang
                      </span>
                    </div>
                  </div>
                  <span className="font-metric-display text-[16px] font-bold text-[#121c2a]">
                    {currentSpek.ap}
                  </span>
                </div>

                {/* 5. Lisin & Metionin */}
                <div className="bg-white rounded-[14px] p-3.5 border border-slate-200 flex items-center justify-between hover:border-purple-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[12px] bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">biotech</span>
                    </div>
                    <div>
                      <span className="font-bold text-[13px] text-[#121c2a] block">
                        Lisin &amp; Metionin
                      </span>
                      <span className="text-[11px] text-[#6d7b6c]">
                        Asam amino esensial tercerna
                      </span>
                    </div>
                  </div>
                  <span className="font-metric-display text-[14px] font-bold text-[#121c2a]">
                    Lys {currentSpek.lysine} • Met {currentSpek.met}
                  </span>
                </div>
              </div>

              {/* FITUR TAMBAHAN SESUAI PERMINTAAN USER: "Lihat Komposisi Target yang Lengkap" */}
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setShowFullComposition(!showFullComposition)}
                  className={`w-full py-2.5 px-4 rounded-[14px] text-[12px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                    showFullComposition
                      ? 'bg-[#006e2f] text-white shadow-xs'
                      : 'bg-[#eff4ff] text-[#006e2f] hover:bg-[#e6eeff]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">
                      {showFullComposition ? 'tune' : 'list_alt'}
                    </span>
                    <span>
                      {showFullComposition ? 'Tutup Komposisi Target' : 'Lihat Komposisi Target yang Lengkap (22 Parameter)'}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[18px]">
                    {showFullComposition ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {/* Expandable 22 Parameters Detailed Targets Panel */}
                {showFullComposition && (
                  <div className="bg-[#f8f9ff] rounded-[16px] p-4 border border-[#e6eeff] flex flex-col gap-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-bold text-[12px] text-[#121c2a]">
                          Batasan Matematika Target Nutrisi Optimasi
                        </span>
                        <span className="text-[10px] text-[#6d7b6c]">
                          {targetMode === 'custom'
                            ? 'Mode Custom aktif: Anda dapat mengubah batas Min dan Max setiap parameter di bawah.'
                            : 'Nilai standar SNI diterapkan sebagai batasan optimasi least cost.'}
                        </span>
                      </div>
                      {targetMode === 'custom' && (
                        <button
                          type="button"
                          onClick={resetToCurrentPhase}
                          className="text-[11px] font-bold text-[#006e2f] hover:underline cursor-pointer"
                        >
                          Reset ke Spek SNI
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto phone-scrollbar pr-1">
                      {nutrientConstraints.map((nc) => {
                        const isCustomEditable = targetMode === 'custom';
                        return (
                          <div
                            key={nc.id}
                            className="bg-white rounded-[10px] p-2.5 border border-slate-200 flex items-center justify-between gap-2 shadow-2xs"
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-[11px] text-[#121c2a] truncate">
                                {nc.name}
                              </span>
                              <span className="text-[9px] text-[#6d7b6c] font-mono">
                                {nc.unit}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
                              {/* Min Box */}
                              <div className="flex items-center gap-1 bg-[#eff4ff] px-2 py-1 rounded-[6px] border border-[#e6eeff]">
                                <span className="text-[9px] text-[#6d7b6c] font-semibold">Min:</span>
                                {isCustomEditable ? (
                                  <input
                                    type="number"
                                    step={nc.unit === 'kkal/kg' ? 10 : 0.05}
                                    value={nc.min ?? ''}
                                    placeholder="—"
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? null : Number(e.target.value);
                                      updateConstraint(nc.id, { min: val });
                                    }}
                                    className="w-12 text-right outline-none font-bold text-[11px] bg-transparent text-[#121c2a]"
                                  />
                                ) : (
                                  <span className="font-bold text-[11px] text-[#121c2a]">
                                    {nc.min !== null ? nc.min : '—'}
                                  </span>
                                )}
                              </div>

                              {/* Max Box */}
                              <div className="flex items-center gap-1 bg-[#eff4ff] px-2 py-1 rounded-[6px] border border-[#e6eeff]">
                                <span className="text-[9px] text-[#6d7b6c] font-semibold">Max:</span>
                                {isCustomEditable ? (
                                  <input
                                    type="number"
                                    step={nc.unit === 'kkal/kg' ? 10 : 0.05}
                                    value={nc.max ?? ''}
                                    placeholder="—"
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? null : Number(e.target.value);
                                      updateConstraint(nc.id, { max: val });
                                    }}
                                    className="w-12 text-right outline-none font-bold text-[11px] bg-transparent text-[#121c2a]"
                                  />
                                ) : (
                                  <span className="font-bold text-[11px] text-[#121c2a]">
                                    {nc.max !== null ? nc.max : '—'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pinned Bottom Action Bar */}
      <div className="shrink-0 w-full bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] border-t border-[#e6eeff] z-30">
        <div className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3.5">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onBack}
              className="h-12 sm:h-13 px-5 rounded-full bg-[#eff4ff] text-[#121c2a] text-[12px] sm:text-[13px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#e6eeff] active:bg-[#d0dbed] transition-colors shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px]">arrow_back</span>
              <span>Matriks Nutrisi (2/3)</span>
            </button>

            {onGoHome && (
              <button
                type="button"
                onClick={onGoHome}
                className="h-12 sm:h-13 px-4 rounded-full bg-[#eff4ff] text-[#121c2a] text-[12px] sm:text-[13px] font-bold flex items-center gap-1.5 hover:bg-[#e6eeff] transition-all cursor-pointer shadow-xs"
                title="Kembali ke Beranda"
              >
                <span className="material-symbols-outlined text-[19px]">home</span>
                <span className="hidden sm:inline">Beranda</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={isCalculating}
              onClick={handleCalculate}
              className="flex-1 sm:flex-initial h-12 sm:h-13 px-8 sm:px-10 rounded-full bg-[#006e2f] hover:bg-[#005524] text-white text-[13px] sm:text-[14px] font-extrabold flex items-center justify-center gap-2.5 active:scale-95 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              {isCalculating ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">
                    progress_activity
                  </span>
                  <span>Menghitung Formulasi Least Cost...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    auto_awesome
                  </span>
                  <span>Hitung Formula Pakan</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Credibility Footnote */}
        <div className="max-w-6xl mx-auto w-full pt-1.5 flex items-center justify-center gap-1 text-[10px] text-[#6d7b6c]">
          <span className="material-symbols-outlined text-[13px] text-[#006e2f]">verified</span>
          <span>Optimasi deterministik Simplex Linear Programming berbasis data bahan Tahap 2 &amp; target Tahap 3</span>
        </div>
      </div>
    </div>
  );
};

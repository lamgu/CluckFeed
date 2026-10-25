import React, { useState } from 'react';
import { LivestockType, AgeUnit, TargetNutrisi } from '../types';

interface WorkflowStep3Props {
  livestock: LivestockType;
  setLivestock: (l: LivestockType) => void;
  ageValue: number;
  setAgeValue: (a: number) => void;
  ageUnit: AgeUnit;
  setAgeUnit: (u: AgeUnit) => void;
  batchKg: number;
  setBatchKg: (b: number) => void;
  onCalculate: (customNutrients?: Partial<TargetNutrisi>) => void;
  onBack: () => void;
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
  onBack
}) => {
  const [nutrientTab, setNutrientTab] = useState<'sni' | 'custom'>('sni');
  const [saveAsPreset, setSaveAsPreset] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Custom nutrient inputs
  const [customPkMin, setCustomPkMin] = useState<number>(20.5);
  const [customPkMax, setCustomPkMax] = useState<number>(22.5);
  const [customEmMin, setCustomEmMin] = useState<number>(3050);
  const [customEmMax, setCustomEmMax] = useState<number>(3150);

  // Auto-detected Phase calculation
  const effectiveAgeDays = ageUnit === 'minggu' ? ageValue * 7 : ageValue;
  const detectedPhase = React.useMemo(() => {
    if (livestock === 'broiler') {
      if (effectiveAgeDays <= 14) return 'Broiler Starter (0-14 Hari)';
      if (effectiveAgeDays <= 28) return 'Broiler Grower (15-28 Hari)';
      return 'Broiler Finisher (> 28 Hari)';
    } else {
      if (effectiveAgeDays <= 56) return 'Layer Starter / Starter Pullet (0-8 Minggu)';
      if (effectiveAgeDays <= 112) return 'Layer Pullet / Developer (9-16 Minggu)';
      return 'Layer Produksi / Layer Peak (> 17 Minggu)';
    }
  }, [livestock, effectiveAgeDays]);

  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      if (nutrientTab === 'custom') {
        onCalculate({
          pkMin: customPkMin,
          pkMax: customPkMax,
          emMin: customEmMin,
          emMax: customEmMax
        });
      } else {
        onCalculate();
      }
    }, 700);
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Step Progress Sub-header (Shrink-0) */}
      <div className="shrink-0 px-4 py-3 bg-white border-b border-[#e6eeff] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-label-sm text-[11px] text-[#006e2f] font-bold uppercase tracking-wider">
            Langkah 3 dari 3
          </span>
          <span className="font-label-sm text-[12px] text-[#3d4a3d] font-semibold">
            Target Kebutuhan
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 w-full">
          <div className="h-1.5 rounded-full bg-[#22c55e]"></div>
          <div className="h-1.5 rounded-full bg-[#22c55e]"></div>
          <div className="h-1.5 rounded-full bg-[#22c55e]"></div>
        </div>
      </div>

      {/* Scrollable Middle Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 flex flex-col gap-5">
        {/* Section 1: Livestock Selection */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="font-headline-sm text-[15px] text-[#121c2a] font-bold">
              Jenis Ternak
            </label>
            <span className="font-label-sm text-[11px] text-[#006e2f] font-semibold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">info</span> Standar Berbeda
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-1">
            {/* Active Broiler Card */}
            <button
              type="button"
              onClick={() => setLivestock('broiler')}
              className={`relative flex flex-col items-center text-center p-4 transition-all rounded-[20px] border shadow-xs ${
                livestock === 'broiler'
                  ? 'bg-[#7cf994]/25 border-[#22c55e]'
                  : 'bg-white border-[#e5e7eb] hover:border-slate-300'
              }`}
            >
              {livestock === 'broiler' && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#006e2f] flex items-center justify-center text-white shadow-xs">
                  <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                </div>
              )}
              <div
                className={`w-12 h-12 flex items-center justify-center mb-2 rounded-[14px] ${
                  livestock === 'broiler' ? 'bg-[#7cf994]/50 text-[#006e2f]' : 'bg-[#eff4ff] text-[#6d7b6c]'
                }`}
              >
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  pest_control_rodent
                </span>
              </div>
              <span className="font-title-md text-[15px] text-[#121c2a] font-bold leading-tight">
                Broiler
              </span>
              <span className="font-body-sm text-[11px] text-[#3d4a3d] mt-0.5">
                Ayam Pedaging
              </span>
              <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-md bg-white text-[#006e2f] font-label-sm text-[10px] font-bold border border-[#7cf994]">
                Cepat Tumbuh
              </span>
            </button>

            {/* Layer Card */}
            <button
              type="button"
              onClick={() => setLivestock('layer')}
              className={`relative flex flex-col items-center text-center p-4 transition-all rounded-[20px] border shadow-xs ${
                livestock === 'layer'
                  ? 'bg-[#7cf994]/25 border-[#22c55e]'
                  : 'bg-white border-[#e5e7eb] hover:border-slate-300'
              }`}
            >
              {livestock === 'layer' && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#006e2f] flex items-center justify-center text-white shadow-xs">
                  <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                </div>
              )}
              <div
                className={`w-12 h-12 flex items-center justify-center mb-2 rounded-[14px] ${
                  livestock === 'layer' ? 'bg-[#7cf994]/50 text-[#006e2f]' : 'bg-[#eff4ff] text-[#6d7b6c]'
                }`}
              >
                <span className="material-symbols-outlined text-[28px]">egg</span>
              </div>
              <span className="font-title-md text-[15px] text-[#121c2a] font-bold leading-tight">
                Layer
              </span>
              <span className="font-body-sm text-[11px] text-[#3d4a3d] mt-0.5">
                Ayam Petelur
              </span>
              <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-md bg-[#eff4ff] text-[#3d4a3d] font-label-sm text-[10px] font-medium border border-[#e6eeff]">
                Fokus Telur
              </span>
            </button>
          </div>
        </div>

        {/* Section 2: Umur & Fase Ternak */}
        <div className="flex flex-col gap-2.5 bg-white p-4 shadow-xs border border-[#e5e7eb] rounded-[20px]">
          <div className="flex items-center justify-between">
            <label className="font-title-md text-[14px] text-[#121c2a] font-bold">
              Umur Ternak Saat Ini
            </label>
            <span className="font-body-sm text-[12px] text-[#6d7b6c] font-medium">
              {ageUnit === 'hari' ? `Hari ke-${ageValue}` : `Minggu ke-${ageValue}`}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 items-stretch">
            {/* Numeric Age Field */}
            <div className="h-12 bg-[#eff4ff] px-3.5 flex items-center justify-between rounded-[14px] border border-[#e6eeff]">
              <input
                type="number"
                min="1"
                max={ageUnit === 'hari' ? 90 : 80}
                value={ageValue}
                onChange={(e) => setAgeValue(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-transparent font-metric-display text-[20px] font-bold text-[#121c2a] focus:outline-none tracking-tight"
              />
              <span className="font-label-lg text-[13px] text-[#6d7b6c] font-medium shrink-0 ml-1">
                {ageUnit === 'hari' ? 'Hari' : 'Minggu'}
              </span>
            </div>

            {/* Segmented Unit Toggle */}
            <div className="h-12 bg-[#eff4ff] p-1 rounded-[14px] flex items-center border border-[#e6eeff]">
              <button
                type="button"
                onClick={() => setAgeUnit('hari')}
                className={`flex-1 h-full rounded-[10px] font-label-md text-[12px] transition-all flex items-center justify-center ${
                  ageUnit === 'hari'
                    ? 'bg-white font-bold text-[#121c2a] shadow-xs'
                    : 'text-[#6d7b6c] font-medium hover:text-[#121c2a]'
                }`}
              >
                Hari
              </button>
              <button
                type="button"
                onClick={() => setAgeUnit('minggu')}
                className={`flex-1 h-full rounded-[10px] font-label-md text-[12px] transition-all flex items-center justify-center ${
                  ageUnit === 'minggu'
                    ? 'bg-white font-bold text-[#121c2a] shadow-xs'
                    : 'text-[#6d7b6c] font-medium hover:text-[#121c2a]'
                }`}
              >
                Minggu
              </button>
            </div>
          </div>

          {/* Auto-detected Phase Notification Chip */}
          <div className="mt-1 p-3 bg-[#7cf994]/30 flex items-center justify-between gap-2 rounded-[14px] border border-[#7cf994]/50">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#006e2f]/15 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[16px] text-[#006e2f]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-label-sm text-[10px] text-[#006e2f] font-bold uppercase tracking-wider leading-none">
                  Rekomendasi Otomatis
                </p>
                <p className="font-label-md text-[13px] text-[#121c2a] font-bold truncate mt-0.5">
                  {detectedPhase}
                </p>
              </div>
            </div>
            <button
              type="button"
              title="Ubah Fase Manual"
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#6d7b6c] hover:text-[#006e2f] transition-colors shrink-0 shadow-xs border border-slate-200"
            >
              <span className="material-symbols-outlined text-[17px]">edit</span>
            </button>
          </div>
        </div>

        {/* Section 3: Target Jumlah Produksi (Batch) */}
        <div className="flex flex-col bg-white p-4 shadow-xs border border-[#e5e7eb] rounded-[20px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <span className="font-title-md text-[14px] text-[#121c2a] font-bold">
                Target Batch Dibuat
              </span>
              <span className="font-body-sm text-[11px] text-[#6d7b6c]">
                Kapasitas mixer / sekali aduk
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#eff4ff] text-[#121c2a] font-label-sm text-[11px] font-semibold border border-[#e6eeff]">
              {(batchKg / 50).toFixed(0)} Sak (50kg)
            </span>
          </div>

          {/* Stepper Controls */}
          <div className="flex items-center justify-between bg-[#eff4ff] p-2.5 rounded-[16px] border border-[#e6eeff]">
            <button
              type="button"
              aria-label="Kurangi pakan"
              onClick={() => setBatchKg(Math.max(50, batchKg - 50))}
              className="w-12 h-12 rounded-full bg-[#7cf994]/40 hover:bg-[#7cf994]/60 active:scale-95 text-[#007230] flex items-center justify-center transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[24px] font-bold">remove</span>
            </button>

            <div className="flex flex-col items-center">
              <div className="flex items-baseline gap-1">
                <span className="font-headline-lg-mobile text-[26px] font-bold text-[#006e2f] tracking-tight">
                  {batchKg.toLocaleString('id-ID')}
                </span>
                <span className="font-title-md text-[16px] text-[#6d7b6c] font-semibold">
                  kg
                </span>
              </div>
              <span className="font-label-sm text-[11px] text-[#6d7b6c] mt-0.5">
                ± {(batchKg / 1000).toFixed(2)} Ton Pakan Siap Pakai
              </span>
            </div>

            <button
              type="button"
              aria-label="Tambah pakan"
              onClick={() => setBatchKg(batchKg + 50)}
              className="w-12 h-12 rounded-full bg-[#7cf994]/40 hover:bg-[#7cf994]/60 active:scale-95 text-[#007230] flex items-center justify-center transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[24px] font-bold">add</span>
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex items-center justify-between gap-2 mt-3">
            {[100, 250, 500, 1000].map((kg) => (
              <button
                key={kg}
                type="button"
                onClick={() => setBatchKg(kg)}
                className={`flex-1 py-1.5 rounded-lg font-label-sm text-[11px] transition-all border ${
                  batchKg === kg
                    ? 'bg-[#006e2f]/10 text-[#006e2f] font-bold border-[#22c55e]'
                    : 'bg-[#eff4ff] text-[#3d4a3d] font-medium border-[#e6eeff] hover:bg-[#e6eeff]'
                }`}
              >
                {kg.toLocaleString('id-ID')} kg
              </button>
            ))}
          </div>
        </div>

        {/* Section 4: Target Nutrisi (Standar vs Custom) */}
        <div className="flex flex-col gap-3">
          {/* Segmented Tab Header */}
          <div className="flex items-center justify-between">
            <label className="font-headline-sm text-[15px] text-[#121c2a] font-bold">
              Target Kualitas Nutrisi
            </label>
            <div className="flex bg-[#eff4ff] p-1 rounded-full border border-[#e6eeff]">
              <button
                type="button"
                onClick={() => setNutrientTab('sni')}
                className={`px-3.5 py-1 rounded-full font-label-md text-[12px] transition-all ${
                  nutrientTab === 'sni'
                    ? 'bg-white font-bold text-[#121c2a] shadow-xs'
                    : 'text-[#6d7b6c] font-medium'
                }`}
              >
                Standar SNI
              </button>
              <button
                type="button"
                onClick={() => setNutrientTab('custom')}
                className={`px-3.5 py-1 rounded-full font-label-md text-[12px] transition-all ${
                  nutrientTab === 'custom'
                    ? 'bg-white font-bold text-[#121c2a] shadow-xs'
                    : 'text-[#6d7b6c] font-medium'
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          {/* SNI Panel */}
          {nutrientTab === 'sni' && (
            <div className="flex flex-col bg-white p-4 shadow-xs border border-[#e5e7eb] rounded-[20px]">
              <label className="font-label-sm text-[11px] text-[#6d7b6c] font-medium mb-1.5">
                Acuan Rujukan Formulir:
              </label>
              <div className="flex items-center justify-between p-3 bg-[#eff4ff] rounded-[12px] border border-[#e6eeff]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[20px] text-[#006e2f]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                  <span className="font-label-md text-[12px] text-[#121c2a] font-semibold truncate">
                    SNI 2015 {livestock === 'broiler' ? 'Broiler Grower / Cobb 500' : 'Layer Masa Produksi'}
                  </span>
                </div>
                <span className="material-symbols-outlined text-[20px] text-[#6d7b6c]">unfold_more</span>
              </div>

              {/* Nutrient Detail Cards */}
              <div className="flex flex-col gap-2 mt-3">
                <div className="flex items-center justify-between p-2.5 bg-[#f8f9ff] hover:bg-[#eff4ff] transition-colors rounded-[12px] border border-[#e6eeff]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-[#006e2f]/10 text-[#006e2f] flex items-center justify-center shrink-0 rounded-lg">
                      <span className="material-symbols-outlined text-[20px]">fitness_center</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-[12px] text-[#121c2a] font-semibold">
                        Protein Kasar (PK)
                      </span>
                      <span className="font-body-sm text-[10px] text-[#6d7b6c]">
                        Pertumbuhan otot &amp; daging
                      </span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 bg-[#eff4ff] px-2.5 py-1 rounded-md border border-[#e6eeff]">
                    <span className="font-label-lg text-[13px] font-bold text-[#121c2a]">
                      {livestock === 'broiler' ? '19.0 - 21.0' : '17.0 - 18.5'}
                    </span>
                    <span className="font-label-sm text-[11px] text-[#6d7b6c]">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[#f8f9ff] hover:bg-[#eff4ff] transition-colors rounded-[12px] border border-[#e6eeff]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-[#ef9900]/20 text-[#855300] flex items-center justify-center shrink-0 rounded-lg">
                      <span className="material-symbols-outlined text-[20px]">bolt</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-[12px] text-[#121c2a] font-semibold">
                        Energi Metabolis (EM)
                      </span>
                      <span className="font-body-sm text-[10px] text-[#6d7b6c]">
                        Aktivitas &amp; pembakaran
                      </span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 bg-[#eff4ff] px-2.5 py-1 rounded-md border border-[#e6eeff]">
                    <span className="font-label-lg text-[13px] font-bold text-[#121c2a]">
                      {livestock === 'broiler' ? '3050 - 3150' : '2700 - 2850'}
                    </span>
                    <span className="font-label-sm text-[11px] text-[#6d7b6c]">kkal</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[#f8f9ff] hover:bg-[#eff4ff] transition-colors rounded-[12px] border border-[#e6eeff]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-[#7cf994]/40 text-[#007230] flex items-center justify-center shrink-0 rounded-lg">
                      <span className="material-symbols-outlined text-[20px]">format_h4</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-[12px] text-[#121c2a] font-semibold">
                        Kalsium (Ca)
                      </span>
                      <span className="font-body-sm text-[10px] text-[#6d7b6c]">
                        Struktur rangka &amp; cangkang
                      </span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 bg-[#eff4ff] px-2.5 py-1 rounded-md border border-[#e6eeff]">
                    <span className="font-label-lg text-[13px] font-bold text-[#121c2a]">
                      {livestock === 'broiler' ? '0.90 - 1.10' : '3.50 - 4.20'}
                    </span>
                    <span className="font-label-sm text-[11px] text-[#6d7b6c]">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[#f8f9ff] hover:bg-[#eff4ff] transition-colors rounded-[12px] border border-[#e6eeff]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-[#dee9fc] text-[#3d4a3d] flex items-center justify-center shrink-0 rounded-lg">
                      <span className="material-symbols-outlined text-[20px]">science</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-[12px] text-[#121c2a] font-semibold">
                        Fosfor Tersedia (aP)
                      </span>
                      <span className="font-body-sm text-[10px] text-[#6d7b6c]">
                        Keseimbangan mineral
                      </span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 bg-[#eff4ff] px-2.5 py-1 rounded-md border border-[#e6eeff]">
                    <span className="font-label-lg text-[13px] font-bold text-[#121c2a]">0.45 - 0.55</span>
                    <span className="font-label-sm text-[11px] text-[#6d7b6c]">%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Custom Panel */}
          {nutrientTab === 'custom' && (
            <div className="flex flex-col bg-white p-4 rounded-[20px] shadow-xs border border-[#e5e7eb] gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ef9900] animate-pulse"></span>
                  <span className="font-label-md text-[12px] font-bold text-[#121c2a]">
                    Parameter Nutrisi Disesuaikan
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setNutrientTab('sni')}
                  className="font-label-sm text-[11px] text-[#006e2f] font-bold hover:underline flex items-center gap-0.5"
                >
                  <span className="material-symbols-outlined text-[14px]">restart_alt</span>
                  Reset ke standar
                </button>
              </div>

              {/* Protein Kasar Input */}
              <div className="flex flex-col gap-1.5 p-3 bg-[#f8f9ff] rounded-[14px] border border-[#e6eeff]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-md text-[13px] text-[#121c2a] font-bold">
                      Protein Kasar (PK)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#ffddb8] text-[#653e00] font-label-sm text-[10px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#855300]"></span> Diubah
                    </span>
                  </div>
                  <span className="font-body-sm text-[11px] text-[#6d7b6c]">Standar: 19.0 - 21.0%</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-[10px] text-[#6d7b6c] mb-0.5">Min (%)</span>
                    <div className="bg-[#eff4ff] px-3 py-1.5 rounded-[10px] flex items-center justify-between border border-[#e6eeff]">
                      <input
                        type="number"
                        step="0.1"
                        value={customPkMin}
                        onChange={(e) => setCustomPkMin(parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent font-title-md text-[14px] font-bold text-[#121c2a] focus:outline-none"
                      />
                      <span className="font-body-sm text-[12px] text-[#6d7b6c]">%</span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <span className="font-label-sm text-[10px] text-[#6d7b6c] mb-0.5">Maks (%)</span>
                    <div className="bg-[#eff4ff] px-3 py-1.5 rounded-[10px] flex items-center justify-between border border-[#e6eeff]">
                      <input
                        type="number"
                        step="0.1"
                        value={customPkMax}
                        onChange={(e) => setCustomPkMax(parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent font-title-md text-[14px] font-bold text-[#121c2a] focus:outline-none"
                      />
                      <span className="font-body-sm text-[12px] text-[#6d7b6c]">%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] bg-[#ffddb8]/50 text-[#653e00]">
                  <span className="material-symbols-outlined text-[16px] text-[#855300] shrink-0">warning</span>
                  <span className="font-body-sm text-[11px]">
                    Nilai sedikit di atas target grower standard, pakan berpotensi lebih mahal.
                  </span>
                </div>
              </div>

              {/* Energi Metabolis Input */}
              <div className="flex flex-col gap-1.5 p-3 bg-[#f8f9ff] rounded-[14px] border border-[#e6eeff]">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-[13px] text-[#121c2a] font-bold">
                    Energi Metabolis (EM)
                  </span>
                  <span className="font-body-sm text-[11px] text-[#6d7b6c]">Standar: 3050 - 3150 kkal</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-[10px] text-[#6d7b6c] mb-0.5">Min (kkal)</span>
                    <div className="bg-[#eff4ff] px-3 py-1.5 rounded-[10px] flex items-center justify-between border border-[#e6eeff]">
                      <input
                        type="number"
                        value={customEmMin}
                        onChange={(e) => setCustomEmMin(parseInt(e.target.value) || 0)}
                        className="w-full bg-transparent font-title-md text-[14px] font-bold text-[#121c2a] focus:outline-none"
                      />
                      <span className="font-label-sm text-[10px] text-[#6d7b6c]">kkal</span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <span className="font-label-sm text-[10px] text-[#6d7b6c] mb-0.5">Maks (kkal)</span>
                    <div className="bg-[#eff4ff] px-3 py-1.5 rounded-[10px] flex items-center justify-between border border-[#e6eeff]">
                      <input
                        type="number"
                        value={customEmMax}
                        onChange={(e) => setCustomEmMax(parseInt(e.target.value) || 0)}
                        className="w-full bg-transparent font-title-md text-[14px] font-bold text-[#121c2a] focus:outline-none"
                      />
                      <span className="font-label-sm text-[10px] text-[#6d7b6c]">kkal</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save as preset switch */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <div className="flex flex-col">
                  <span className="font-label-md text-[12px] text-[#121c2a] font-semibold">
                    Simpan sebagai preset baru
                  </span>
                  <span className="font-body-sm text-[10px] text-[#6d7b6c]">
                    Gunakan lagi untuk racikan berikutnya
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSaveAsPreset(!saveAsPreset)}
                  className={`w-12 h-6 rounded-full relative flex items-center p-0.5 transition-colors ${
                    saveAsPreset ? 'bg-[#006e2f]' : 'bg-[#d9e3f6]'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                      saveAsPreset ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pinned Bottom Action Bar (Always Fixed at Bottom) */}
      <div className="shrink-0 w-full p-4 bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.08)] border-t border-[#e6eeff] z-30">
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="h-12 px-4 rounded-full bg-[#eff4ff] text-[#121c2a] font-label-lg text-[13px] font-semibold flex items-center justify-center gap-1 active:bg-[#d0dbed] transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[19px]">arrow_back</span>
              <span>Ubah</span>
            </button>

            <button
              type="button"
              onClick={handleCalculate}
              disabled={isCalculating}
              className="flex-1 h-12 bg-[#006e2f] hover:bg-[#004b1e] active:scale-[0.98] text-white font-label-lg text-[14px] font-bold rounded-full flex items-center justify-center gap-2 shadow-md transition-all"
            >
              {isCalculating ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                  <span>Mengoptimalkan Formula...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    auto_awesome
                  </span>
                  <span>Hitung Formula Pakan</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </div>

          <p className="text-center font-label-sm text-[10px] text-[#6d7b6c] flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[13px] text-[#006e2f]">security</span>
            Divalidasi algoritma Least-Cost Feed Formulation (LCF)
          </p>
        </div>
      </div>
    </div>
  );
};

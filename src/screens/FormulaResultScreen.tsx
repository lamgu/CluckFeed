import React, { useState } from 'react';
import { FormulaResultData } from '../types';

interface FormulaResultProps {
  data: FormulaResultData;
  onModify: () => void;
  onSendToDispense: () => void;
  onAskAI: () => void;
  onForceSave?: () => void;
}

export const FormulaResultScreen: React.FC<FormulaResultProps> = ({
  data,
  onModify,
  onSendToDispense,
  onAskAI,
  onForceSave
}) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // SVG calculations for donut chart
  const circumference = 2 * Math.PI * 38; // ~238.76

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Top Action & Meta Row (Shrink-0) */}
      <div className="shrink-0 px-4 pt-3 pb-2 flex items-center justify-between border-b border-[#e6eeff]/60 bg-white/60 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#7cf994]/40 text-[#007230]">
            <span className="material-symbols-outlined text-[16px]">verified</span>
          </span>
          <span className="font-label-md text-[12px] text-[#6d7b6c] font-medium">
            Batch ID: {data.batchNumber}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => showToast('Formula berhasil dibagikan')}
            aria-label="Bagikan Formula"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#eff4ff] text-[#121c2a] hover:bg-[#e6eeff] transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined text-[19px]">share</span>
          </button>
          <button
            type="button"
            onClick={() => showToast('Mengunduh dokumen PDF formula ransum...')}
            aria-label="Unduh PDF"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#eff4ff] text-[#121c2a] hover:bg-[#e6eeff] transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined text-[19px]">download</span>
          </button>
        </div>
      </div>

      {/* Scrollable Middle Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 flex flex-col gap-4">
        {data.isFeasible ? (
          /* ================= LAYAK (FEASIBLE) VIEW ================= */
          <>
            {/* Summary Green Highlight Card */}
            <section className="relative overflow-hidden rounded-[24px] bg-[#7cf994]/30 border border-[#7cf994]/60 p-4 shadow-xs">
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
                  Standar SNI {data.livestock === 'broiler' ? 'Broiler' : 'Layer'}
                </span>
              </div>

              <div className="mt-3 pt-1 relative z-10 flex flex-col gap-1">
                <p className="font-label-sm text-[11px] text-[#3d4a3d]">
                  Estimasi Biaya Produksi (Batch {data.totalBatchKg} kg)
                </p>
                <div className="flex items-baseline justify-between">
                  <h2 className="font-headline-lg-mobile text-[24px] text-[#121c2a] tracking-tight font-extrabold">
                    Rp {data.totalCost.toLocaleString('id-ID')}
                  </h2>
                  <div className="text-right">
                    <span className="font-metric-display text-[18px] text-[#121c2a] font-bold">
                      Rp {data.costPerKg.toLocaleString('id-ID')}
                    </span>
                    <span className="font-label-sm text-[11px] text-[#6d7b6c]">/kg</span>
                  </div>
                </div>
              </div>

              {/* Savings Pill */}
              <div className="mt-3 relative z-10 flex items-center gap-2.5 p-2.5 bg-white/95 rounded-[16px] border border-emerald-100 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-[#6bff8f] flex items-center justify-center shrink-0 text-[#002109]">
                  <span className="material-symbols-outlined text-[18px]">trending_down</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-[12px] text-[#006e2f] font-bold truncate">
                    {data.savingPercent}% Lebih Murah dari Pakan Komersil
                  </span>
                  <span className="font-body-sm text-[11px] text-[#6d7b6c] truncate">
                    Hemat Rp {data.savingAmount.toLocaleString('id-ID')} per {data.totalBatchKg} kg adonan
                  </span>
                </div>
              </div>
            </section>

            {/* Visual Interactive Donut Chart Section */}
            <section className="bg-white p-4 shadow-xs border border-[#e5e7eb] flex flex-col gap-3 rounded-[24px]">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h3 className="font-title-md text-[15px] text-[#121c2a] font-bold">
                    Proporsi Bahan Baku
                  </h3>
                  <p className="font-body-sm text-[11px] text-[#6d7b6c]">Total formulasi adonan 100%</p>
                </div>
                <span className="font-label-md text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#eff4ff] text-[#006e2f] border border-[#e6eeff]">
                  {data.ingredients.length} Bahan
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-1">
                {/* SVG Donut Chart */}
                <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {(() => {
                      let accumulatedOffset = 0;
                      return data.ingredients.map((ing) => {
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
                      {data.totalBatchKg}
                    </span>
                    <span className="font-label-sm text-[11px] text-[#6d7b6c] font-medium">Kilogram</span>
                  </div>
                </div>

                {/* Donut Legend Grid */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 w-full pt-1">
                  {data.ingredients.map((ing) => (
                    <div key={ing.id} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: ing.color }}></span>
                      <span className="font-body-sm text-[11px] text-[#121c2a] truncate">
                        {ing.name} ({ing.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Ingredients Detail List */}
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-title-md text-[14px] text-[#121c2a] font-bold">
                  Rincian Komposisi ({data.totalBatchKg} kg)
                </h3>
                <span className="font-label-sm text-[11px] text-[#6d7b6c]">Harga Pasar Terkini</span>
              </div>

              {data.ingredients.map((ing) => (
                <div
                  key={ing.id}
                  className="bg-white rounded-[18px] p-3.5 shadow-xs border border-[#e5e7eb] flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-[14px] bg-[#7cf994]/30 flex items-center justify-center shrink-0 text-[#006e2f]">
                      <span className="material-symbols-outlined text-[22px]">
                        {ing.icon}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-label-lg text-[13px] text-[#121c2a] font-bold truncate">
                          {ing.name}
                        </h4>
                        <span className="px-1.5 py-0.5 rounded-full bg-[#eff4ff] text-[#3d4a3d] font-label-sm text-[10px] font-semibold">
                          {ing.percentage}%
                        </span>
                      </div>
                      <p className="font-body-sm text-[11px] text-[#6d7b6c]">
                        Rp {ing.costPerKg.toLocaleString('id-ID')} /kg
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-label-lg text-[13px] text-[#121c2a] font-bold">
                      {ing.kg} kg
                    </p>
                    <p className="font-body-sm text-[11px] text-[#006e2f] font-semibold">
                      Rp {ing.totalCost.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </section>

            {/* Collapsible Accordion: Analisis Nutrisi Terpenuhi */}
            <section className="bg-white p-4 shadow-xs border border-[#e5e7eb] overflow-hidden transition-all duration-300 rounded-[24px]">
              <button
                type="button"
                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                className="w-full flex items-center justify-between text-left focus:outline-none"
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
                      4 Parameter Sesuai SNI Broiler
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
                          {data.nutrients.pk.val}%
                        </span>
                        <span className="font-body-sm text-[11px] text-[#6d7b6c] ml-1">
                          (Target {data.nutrients.pk.min} - {data.nutrients.pk.max}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-[#eff4ff] rounded-full overflow-hidden">
                      <div className="h-full bg-[#006e2f] rounded-full" style={{ width: `${data.nutrients.pk.percentProgress}%` }}></div>
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
                          {data.nutrients.em.val} kkal
                        </span>
                        <span className="font-body-sm text-[11px] text-[#6d7b6c] ml-1">
                          (&gt;{data.nutrients.em.min})
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-[#eff4ff] rounded-full overflow-hidden">
                      <div className="h-full bg-[#006e2f] rounded-full" style={{ width: `${data.nutrients.em.percentProgress}%` }}></div>
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
                          {data.nutrients.ca.val}%
                        </span>
                        <span className="font-body-sm text-[11px] text-[#6d7b6c] ml-1">
                          ({data.nutrients.ca.min.toFixed(2)} - {data.nutrients.ca.max.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-[#eff4ff] rounded-full overflow-hidden">
                      <div className="h-full bg-[#006e2f] rounded-full" style={{ width: `${data.nutrients.ca.percentProgress}%` }}></div>
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
                          Fosfor Tersedia (P)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-label-lg text-[13px] text-[#006e2f] font-bold">
                          {data.nutrients.p.val}%
                        </span>
                        <span className="font-body-sm text-[11px] text-[#6d7b6c] ml-1">
                          ({data.nutrients.p.min.toFixed(2)} - {data.nutrients.p.max.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-[#eff4ff] rounded-full overflow-hidden">
                      <div className="h-full bg-[#006e2f] rounded-full" style={{ width: `${data.nutrients.p.percentProgress}%` }}></div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Delight Visual Tip Card */}
            <div className="bg-[#eff4ff] p-4 flex items-center gap-3 rounded-[20px] border border-[#e6eeff]">
              <div className="w-10 h-10 rounded-full bg-[#22c55e]/20 flex items-center justify-center shrink-0 text-[#006e2f]">
                <span className="material-symbols-outlined text-[22px]">lightbulb</span>
              </div>
              <p className="font-body-sm text-[12px] text-[#3d4a3d] leading-snug">
                Formula ini siap langsung diteruskan ke mesin dispenser pakan otomatis kandang atau disimpan sebagai resep tetap.
              </p>
            </div>
          </>
        ) : (
          /* ================= BELUM LAYAK (UNFEASIBLE) VIEW ================= */
          <>
            {/* Warning Banner / Summary Warning Card */}
            <div className="bg-[#ffddb8]/40 border border-[#ffddb8] rounded-[24px] p-4 shadow-xs relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#ef9900]/20 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex items-start justify-between gap-2 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ef9900] text-white font-label-md text-[12px] font-bold shadow-xs">
                  <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    warning
                  </span>
                  Belum Layak (Perlu Penyesuaian)
                </span>
                <span className="font-label-sm text-[10px] text-[#653e00] font-semibold bg-[#ffddb8] px-2 py-0.5 rounded-full">
                  Revisi #2
                </span>
              </div>

              <p className="mt-2.5 font-body-md text-[13px] text-[#653e00] leading-relaxed">
                Nutrisi belum memenuhi target minimum SNI atau batasan takaran bahan terlalu ketat pada kandang Anda.
              </p>

              {/* Key Metrics Row */}
              <div className="mt-3 grid grid-cols-2 gap-3 bg-white/90 rounded-[16px] p-3 shadow-xs border border-amber-200">
                <div className="flex flex-col">
                  <span className="font-label-sm text-[11px] text-[#6d7b6c]">Estimasi Biaya Pakan</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-headline-md text-[18px] font-bold text-[#121c2a]">
                      Rp {data.costPerKg.toLocaleString('id-ID')}
                    </span>
                    <span className="font-label-sm text-[11px] text-[#6d7b6c]">/kg</span>
                  </div>
                  <span className="font-label-sm text-[11px] text-[#006e2f] flex items-center gap-0.5 mt-0.5 font-semibold">
                    <span className="material-symbols-outlined text-[13px]">trending_down</span>
                    Lebih murah Rp 320
                  </span>
                </div>

                <div className="flex flex-col border-l border-slate-200 pl-3">
                  <span className="font-label-sm text-[11px] text-[#6d7b6c]">Status Formulasi</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-headline-md text-[18px] font-bold text-[#ba1a1a]">
                      2 Defisit
                    </span>
                  </div>
                  <span className="font-label-sm text-[11px] text-[#ba1a1a] font-bold flex items-center gap-0.5 mt-0.5">
                    <span className="material-symbols-outlined text-[13px]">error</span>
                    Wajib Diperbaiki
                  </span>
                </div>
              </div>
            </div>

            {/* Failed Nutrients Card ("Daftar Nutrisi Kurang") */}
            <div className="bg-white rounded-[24px] p-4 shadow-xs border border-[#e5e7eb]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] animate-pulse"></div>
                  <h2 className="font-headline-sm text-[15px] text-[#121c2a] font-bold">
                    Daftar Nutrisi Kurang
                  </h2>
                </div>
                <span className="font-label-sm text-[11px] text-[#ba1a1a] bg-[#ffdad6] px-2.5 py-0.5 rounded-full font-bold">
                  2 Kritis
                </span>
              </div>

              {/* Deficit Items */}
              <div className="flex flex-col gap-2.5">
                {data.deficits?.map((def, idx) => (
                  <div key={idx} className="bg-[#ffdad6]/35 rounded-[16px] p-3 border border-[#ffdad6]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-title-md text-[13px] text-[#121c2a] font-bold">
                            {def.name}
                          </span>
                          <span className="material-symbols-outlined text-[#ba1a1a] text-[16px]">
                            priority_high
                          </span>
                        </div>
                        <p className="font-body-sm text-[11px] text-[#6d7b6c] mt-0.5">
                          Target Standar SNI: {def.target}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-[#ba1a1a] text-white font-label-md text-[10px] font-bold">
                          {def.gap}
                        </span>
                        <p className="font-headline-sm text-[15px] font-bold text-[#ba1a1a] mt-0.5">
                          {def.current}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar Indicator */}
                    <div className="mt-2">
                      <div className="w-full h-2.5 bg-[#dee9fc] rounded-full overflow-hidden flex">
                        <div className="h-full bg-[#ba1a1a] rounded-full transition-all duration-700" style={{ width: `${def.progressPercent}%` }}></div>
                      </div>
                      <div className="flex justify-between items-center mt-1 font-label-sm text-[10px] text-[#6d7b6c]">
                        <span>Capaian saat ini: {def.current}</span>
                        <span className="font-medium text-[#121c2a]">Sasaran: {def.target}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fulfilled nutrients teaser */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[#006e2f]">
                <span className="font-body-sm text-[12px] font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#006e2f]">check_circle</span>
                  4 Parameter Nutrisi Lain Terpenuhi (ME, Ca, P, Lys)
                </span>
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </div>
            </div>

            {/* Diagnostic Insight Box */}
            <div className="bg-[#eff4ff] rounded-[20px] p-4 shadow-xs border border-[#e6eeff] flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#dee9fc] flex-shrink-0 flex items-center justify-center text-[#006e2f] mt-0.5">
                <span className="material-symbols-outlined text-[20px]">lightbulb</span>
              </div>
              <div>
                <h3 className="font-label-lg text-[13px] text-[#121c2a] font-bold">Penyebab Terdeteksi:</h3>
                <p className="mt-0.5 font-body-md text-[12px] text-[#3d4a3d] leading-relaxed">
                  {data.causeText || 'Batasan persentase bahan protein terlalu rendah, silakan naikkan kuota SBM atau tepung ikan.'}
                </p>
              </div>
            </div>

            {/* Donut Chart & Composition Breakdown */}
            <div className="bg-white rounded-[24px] p-4 shadow-xs border border-[#e5e7eb]">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="font-headline-sm text-[14px] text-[#121c2a] font-bold">
                    Komposisi Campuran Saat Ini
                  </h2>
                  <p className="font-body-sm text-[11px] text-[#6d7b6c]">Total: 100% (Batch {data.totalBatchKg} kg)</p>
                </div>
                <span className="font-label-sm text-[10px] text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.5 rounded-full font-bold">
                  Tidak Seimbang
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
                {/* Visual Donut Chart SVG */}
                <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#d9e3f6" strokeWidth="14"></circle>
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#ef9900" strokeWidth="14" strokeDasharray="155.2 238.8" strokeDashoffset="0"></circle>
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#62df7d" strokeWidth="14" strokeDasharray="59.7 238.8" strokeDashoffset="-155.2"></circle>
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#ba1a1a" strokeWidth="14" strokeDasharray="23.9 238.8" strokeDashoffset="-214.9"></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-label-sm text-[10px] text-[#6d7b6c]">Total</span>
                    <span className="font-headline-sm text-[16px] text-[#121c2a] font-bold leading-none">100%</span>
                    <span className="font-label-sm text-[9px] text-[#6d7b6c] mt-0.5">3 Bahan</span>
                  </div>
                </div>

                {/* Legend list */}
                <div className="flex-1 w-full flex flex-col gap-2">
                  {data.ingredients.map((ing) => (
                    <div
                      key={ing.id}
                      className={`flex items-center justify-between p-2.5 rounded-[12px] border ${
                        ing.id === 'sbm' ? 'bg-[#ffdad6]/30 border-[#ffdad6]' : 'bg-[#eff4ff] border-[#e6eeff]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: ing.color }}></span>
                        <div>
                          <p className="font-label-lg text-[12px] text-[#121c2a] font-semibold">{ing.name}</p>
                          <p className="font-body-sm text-[10px] text-[#6d7b6c]">
                            {ing.id === 'sbm' ? 'Kurang untuk protein' : 'Bahan formulasi'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-headline-sm text-[13px] font-bold ${ing.id === 'sbm' ? 'text-[#ba1a1a]' : 'text-[#121c2a]'}`}>
                          {ing.percentage}%
                        </p>
                        <p className="font-body-sm text-[10px] text-[#6d7b6c]">{ing.kg} kg</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Expert Advice Card */}
            <div className="bg-white rounded-[20px] p-4 shadow-xs border border-[#e5e7eb] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#7cf994]/40 flex items-center justify-center shrink-0 text-[#006e2f]">
                <span className="material-symbols-outlined text-[22px]">psychology</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-label-sm text-[10px] text-[#006e2f] font-bold uppercase tracking-wider">
                  Saran Peternak Ahli
                </span>
                <p className="font-body-sm text-[12px] text-[#121c2a] mt-0.5 leading-snug">
                  {data.expertAdvice || 'Tambahkan Konsentrat Broiler atau MBM 5% untuk menaikkan PK tanpa melanggar batas stok SBM Anda.'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Pinned Bottom Action Bar (Always Fixed at Bottom) */}
      <div className="shrink-0 w-full bg-white/95 backdrop-blur-md px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] border-t border-[#e6eeff] z-30">
        <div className="w-full">
          {data.isFeasible ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onModify}
                className="w-1/3 min-h-[48px] px-4 rounded-full bg-[#eff4ff] hover:bg-[#e6eeff] text-[#121c2a] font-label-lg text-[13px] font-semibold flex items-center justify-center transition-all active:scale-95"
              >
                Ubah
              </button>
              <button
                type="button"
                onClick={onSendToDispense}
                className="w-2/3 min-h-[48px] px-5 rounded-full bg-[#22c55e] text-white font-label-lg text-[13px] font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#006e2f] transition-all active:scale-95"
              >
                <span>Kirim ke Dispense</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={onAskAI}
                className="w-full h-12 rounded-full bg-[#22c55e] text-white font-label-lg text-[13px] font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#006e2f] transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
                <span>Tanya Asisten AI (Rekomendasi Cepat)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onModify}
                  className="w-full h-11 rounded-full bg-[#eff4ff] hover:bg-[#e6eeff] text-[#121c2a] font-label-md text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors border border-[#e6eeff]"
                >
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                  <span>Ubah Batasan</span>
                </button>
                <button
                  type="button"
                  onClick={onForceSave || onSendToDispense}
                  className="w-full h-11 text-center font-label-md text-[12px] text-[#6d7b6c] hover:text-[#ba1a1a] transition-colors flex items-center justify-center font-medium"
                >
                  <span>Paksa Tetap Simpan</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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

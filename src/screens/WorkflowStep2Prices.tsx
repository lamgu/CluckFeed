import React from 'react';
import { Ingredient } from '../types';

interface WorkflowStep2Props {
  ingredients: Ingredient[];
  onUpdatePrice: (id: string, price: number) => void;
  onToggleConstraint: (id: string) => void;
  onUpdateConstraint: (id: string, min?: number, max?: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export const WorkflowStep2Prices: React.FC<WorkflowStep2Props> = ({
  ingredients,
  onUpdatePrice,
  onToggleConstraint,
  onUpdateConstraint,
  onNext,
  onBack
}) => {
  const selectedIngredients = ingredients.filter(i => i.selected);

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Stepper Sub-header (Shrink-0) */}
      <div className="shrink-0 px-4 py-3 bg-white border-b border-[#e6eeff] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-label-sm text-[11px] uppercase tracking-wider text-[#006e2f] font-bold">
            Langkah 2 dari 3
          </span>
          <span className="font-label-sm text-[12px] text-[#3d4a3d] font-semibold">
            Harga Bahan Baku
          </span>
        </div>
        <div className="w-full flex items-center gap-1.5 h-1.5">
          <div className="flex-1 h-full rounded-full bg-[#22c55e] transition-all"></div>
          <div className="flex-1 h-full rounded-full bg-[#22c55e] transition-all"></div>
          <div className="flex-1 h-full rounded-full bg-[#d9e3f6] transition-all"></div>
        </div>
      </div>

      {/* Scrollable Middle Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 flex flex-col gap-3">
        {/* Educational Info Callout Banner */}
        <div className="bg-[#eff4ff] rounded-[18px] p-4 shadow-xs border border-[#e6eeff] flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#e6eeff] flex items-center justify-center flex-shrink-0 text-[#006e2f]">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              calculate
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-title-md text-[14px] text-[#121c2a] font-bold">
              Kalkulasi Otomatis (LCF)
            </span>
            <p className="font-body-sm text-[11px] text-[#3d4a3d] leading-relaxed">
              Masukkan harga pasar terkini untuk mendapatkan formulasi nutrisi terstandar SNI dengan biaya termurah.
            </p>
          </div>
        </div>

        {/* Ingredients Price & Constraint List */}
        <div className="flex flex-col gap-3">
        {selectedIngredients.map((ing) => {
          return (
            <div
              key={ing.id}
              className="bg-white rounded-[20px] p-4 shadow-xs border border-[#e5e7eb] flex flex-col gap-3.5"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-[16px] bg-[#7cf994]/30 flex items-center justify-center text-[#006e2f] flex-shrink-0">
                    <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {ing.icon}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-headline-sm text-[14px] text-[#121c2a] font-bold truncate">
                      {ing.name}
                    </span>
                    <span className="font-body-sm text-[11px] text-[#3d4a3d] truncate">
                      {ing.subname}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Input */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-[11px] text-[#6d7b6c] font-medium" htmlFor={`price-${ing.id}`}>
                  Harga Bahan per Kg
                </label>
                <div className="flex items-center bg-[#eff4ff] rounded-[14px] px-3.5 h-12 border border-[#e6eeff] focus-within:bg-white focus-within:border-[#22c55e] focus-within:shadow-xs transition-all">
                  <span className="font-label-lg text-[13px] text-[#006e2f] font-bold mr-1">
                    Rp
                  </span>
                  <input
                    id={`price-${ing.id}`}
                    type="number"
                    value={ing.currentPrice || ''}
                    onChange={(e) => onUpdatePrice(ing.id, Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-transparent font-metric-display text-[18px] text-[#121c2a] text-right font-bold focus:outline-none"
                  />
                  <span className="font-label-md text-[12px] text-[#6d7b6c] ml-2">/kg</span>
                </div>
              </div>

              {/* Constraint Section */}
              {ing.isFixed ? (
                /* Fixed Constraint Display */
                <div className="pt-1 flex items-center justify-between bg-[#eff4ff] rounded-[14px] p-3 border border-[#e6eeff]">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#ef9900] text-[18px]">lock</span>
                    <span className="font-label-md text-[12px] text-[#121c2a] font-semibold">
                      Takaran Dosis Standar
                    </span>
                  </div>
                  <div className="bg-white px-3 py-1 rounded-full shadow-xs border border-slate-200">
                    <span className="font-label-lg text-[12px] text-[#006e2f] font-bold">
                      Tetap {ing.fixedPercent || 2.5}%
                    </span>
                  </div>
                </div>
              ) : (
                /* Toggle Constraint */
                <div className="pt-1 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label
                      onClick={() => onToggleConstraint(ing.id)}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <span className={`material-symbols-outlined text-[19px] ${ing.hasConstraint ? 'text-[#006e2f]' : 'text-[#6d7b6c]'}`}>
                        tune
                      </span>
                      <span className="font-label-md text-[12px] text-[#121c2a] font-medium">
                        Batasi persentase campuran
                      </span>
                    </label>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={ing.hasConstraint}
                      onClick={() => onToggleConstraint(ing.id)}
                      className={`w-12 h-7 rounded-full p-1 transition-colors relative flex items-center ${
                        ing.hasConstraint ? 'bg-[#006e2f] justify-end' : 'bg-[#d9e3f6] justify-start'
                      }`}
                    >
                      <span className="w-5 h-5 bg-white rounded-full shadow-xs transition-transform"></span>
                    </button>
                  </div>

                  {/* Collapsible Content */}
                  {ing.hasConstraint && (
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <div className="bg-[#eff4ff] rounded-[12px] p-2.5 flex flex-col gap-1 border border-[#e6eeff]">
                        <span className="font-label-sm text-[10px] text-[#6d7b6c] font-medium">Batas Minimal</span>
                        <div className="flex items-center justify-between bg-white rounded-[8px] px-2.5 h-9 border border-slate-200 shadow-xs">
                          <input
                            type="number"
                            value={ing.minConstraint ?? 0}
                            onChange={(e) => onUpdateConstraint(ing.id, Number(e.target.value) || 0, ing.maxConstraint)}
                            className="w-full bg-transparent font-title-md text-[13px] text-[#121c2a] focus:outline-none text-right font-bold"
                          />
                          <span className="font-label-md text-[11px] text-[#006e2f] ml-1 font-bold">%</span>
                        </div>
                      </div>

                      <div className="bg-[#eff4ff] rounded-[12px] p-2.5 flex flex-col gap-1 border border-[#e6eeff]">
                        <span className="font-label-sm text-[10px] text-[#6d7b6c] font-medium">Batas Maksimal</span>
                        <div className="flex items-center justify-between bg-white rounded-[8px] px-2.5 h-9 border border-slate-200 shadow-xs">
                          <input
                            type="number"
                            value={ing.maxConstraint ?? 100}
                            onChange={(e) => onUpdateConstraint(ing.id, ing.minConstraint, Number(e.target.value) || 100)}
                            className="w-full bg-transparent font-title-md text-[13px] text-[#121c2a] focus:outline-none text-right font-bold"
                          />
                          <span className="font-label-md text-[11px] text-[#006e2f] ml-1 font-bold">%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>

      {/* Pinned Bottom Navigation Bar (Always Fixed at Bottom) */}
      <div className="shrink-0 w-full bg-white/95 backdrop-blur-md px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] border-t border-[#e6eeff] z-30">
        <div className="w-full flex items-center gap-3">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="h-12 px-5 rounded-full bg-[#eff4ff] text-[#121c2a] font-label-lg text-[13px] font-semibold flex items-center justify-center gap-1 active:bg-[#d0dbed] transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[19px]">arrow_back</span>
            <span>Kembali</span>
          </button>

          {/* Primary Action CTA */}
          <button
            onClick={onNext}
            className="flex-1 h-12 rounded-full bg-[#22c55e] text-white font-label-lg text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-[#006e2f] active:scale-95 shadow-md transition-all"
          >
            <span>Lanjut ke Nutrisi</span>
            <span className="material-symbols-outlined text-[19px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

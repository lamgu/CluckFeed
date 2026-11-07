import React, { useState, useMemo } from 'react';
import { Ingredient } from '../types';
import { INGREDIENT_NUTRIENT_COLUMNS, NutrientColumnDef } from '../data/sheet1Ingredients';

interface WorkflowStep2NutrientsProps {
  ingredients: Ingredient[]; // All ingredients from session
  masterIngredients: Ingredient[]; // Default values from master Matrix Bahan Baku
  customOverrides: Record<string, Record<string, number>>;
  onUpdateNutrient: (ingredientId: string, field: keyof Ingredient, value: number) => void;
  onResetIngredient: (ingredientId: string) => void;
  onResetAll: () => void;
  isCustom: (ingredientId: string) => boolean;
  onNext: () => void;
  onBack: () => void;
  onGoHome?: () => void;
}

export const WorkflowStep2Nutrients: React.FC<WorkflowStep2NutrientsProps> = ({
  ingredients,
  masterIngredients,
  customOverrides,
  onUpdateNutrient,
  onResetIngredient,
  onResetAll,
  isCustom,
  onNext,
  onBack,
  onGoHome
}) => {
  // Only inspect selected ingredients
  const selectedIngredients = useMemo(() => {
    return ingredients.filter(i => i.selected);
  }, [ingredients]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeNutrientGroup, setActiveNutrientGroup] = useState<'semua' | 'makro' | 'mineral' | 'asam_amino'>('semua');
  const [inspectDiffId, setInspectDiffId] = useState<string | null>(null);

  // Filter columns based on group
  const displayColumns = useMemo(() => {
    if (activeNutrientGroup === 'semua') return INGREDIENT_NUTRIENT_COLUMNS;
    if (activeNutrientGroup === 'makro') {
      return INGREDIENT_NUTRIENT_COLUMNS.filter(c => c.category === 'energi' || c.category === 'makro');
    }
    return INGREDIENT_NUTRIENT_COLUMNS.filter(c => c.category === activeNutrientGroup);
  }, [activeNutrientGroup]);

  // Filter ingredients by search
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return selectedIngredients;
    const q = searchQuery.toLowerCase();
    return selectedIngredients.filter(i =>
      i.name.toLowerCase().includes(q) || (i.subname || '').toLowerCase().includes(q)
    );
  }, [selectedIngredients, searchQuery]);

  // Count total custom modifications
  const totalCustomCount = useMemo(() => {
    return selectedIngredients.filter(i => isCustom(i.id)).length;
  }, [selectedIngredients, isCustom]);

  // Total modified cells
  const totalModifiedCells = useMemo(() => {
    let count = 0;
    for (const ing of selectedIngredients) {
      const overrides = customOverrides[ing.id];
      if (overrides) {
        count += Object.keys(overrides).length;
      }
    }
    return count;
  }, [selectedIngredients, customOverrides]);

  // Helper to get master default value
  const getDefaultVal = (ingId: string, field: keyof Ingredient): number => {
    const master = masterIngredients.find(m => m.id === ingId);
    return Number((master as any)?.[field] ?? 0);
  };

  // Helper to get current effective value
  const getEffectiveVal = (ing: Ingredient, field: keyof Ingredient): number => {
    const override = customOverrides[ing.id]?.[field as string];
    if (override !== undefined) return override;
    return Number((ing as any)?.[field] ?? 0);
  };

  // Check if a specific cell is custom
  const isCellCustom = (ingId: string, field: keyof Ingredient): boolean => {
    return customOverrides[ingId]?.[field as string] !== undefined;
  };

  // Get diffs for inspect modal/accordion
  const selectedDiffs = useMemo(() => {
    if (!inspectDiffId) return [];
    const ing = selectedIngredients.find(i => i.id === inspectDiffId);
    if (!ing) return [];
    const overrides = customOverrides[inspectDiffId] || {};
    return Object.entries(overrides).map(([fieldStr, customVal]) => {
      const field = fieldStr as keyof Ingredient;
      const defaultVal = getDefaultVal(inspectDiffId, field);
      const colDef = INGREDIENT_NUTRIENT_COLUMNS.find(c => c.key === field);
      return {
        field,
        label: colDef?.label || fieldStr,
        unit: colDef?.unit || '%',
        defaultVal,
        customVal,
        diff: Number((customVal - defaultVal).toFixed(3))
      };
    });
  }, [inspectDiffId, selectedIngredients, customOverrides, masterIngredients]);

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-[#f9fafb]">
      {/* Workflow Stepper Header */}
      <div className="shrink-0 px-4 sm:px-6 lg:px-8 py-3 bg-white border-b border-[#e6eeff] shadow-xs">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#006e2f] text-white font-label-sm text-[10px] font-bold uppercase tracking-wider">
                Tahap 2 dari 3
              </span>
              <span className="font-headline-sm text-[14px] sm:text-[15px] font-bold text-[#121c2a]">
                Pemeriksaan &amp; Penyesuaian Matriks Nutrisi
              </span>
            </div>

            <div className="flex items-center gap-2">
              {totalCustomCount > 0 ? (
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-label-md text-[11px] font-bold flex items-center gap-1 shadow-2xs">
                  <span className="material-symbols-outlined text-[15px]">edit_note</span>
                  <span>{totalCustomCount} Bahan Disesuaikan ({totalModifiedCells} Nilai Custom)</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-[#7cf994]/40 text-[#007230] font-label-md text-[11px] font-bold flex items-center gap-1 shadow-2xs">
                  <span className="material-symbols-outlined text-[15px]">check_circle</span>
                  <span>Semua Nilai Bawaan (Default Matrix)</span>
                </span>
              )}
            </div>
          </div>

          {/* Stepper Progress Bar (Step 1 & 2 Active) */}
          <div className="grid grid-cols-3 gap-2 w-full">
            <div className="h-2 rounded-full bg-[#22c55e] transition-all"></div>
            <div className="h-2 rounded-full bg-[#22c55e] transition-all"></div>
            <div className="h-2 rounded-full bg-[#d9e3f6] transition-all"></div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto phone-scrollbar flex flex-col">
        <div className="max-w-6xl mx-auto w-full flex flex-col flex-1 px-4 sm:px-6 lg:px-8 py-4 gap-3.5">
          {/* Quick Info & Notice Banner */}
          <div className="w-full bg-[#eff4ff] p-3 rounded-[16px] border border-[#e6eeff] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px]">
            <div className="flex items-center gap-2 text-[#3d4a3d] min-w-0">
              <span className="material-symbols-outlined text-[20px] text-[#006e2f] shrink-0">science</span>
              <span>
                Periksa dan sesuaikan kandungan nutrisi bahan baku di bawah sebelum menentukan target. <strong>Perubahan Custom di sini hanya berlaku untuk sesi formulasi aktif ini</strong> dan tidak akan mengubah database master.
              </span>
            </div>
            {totalCustomCount > 0 && (
              <button
                type="button"
                onClick={onResetAll}
                className="text-[12px] font-bold text-amber-700 hover:text-amber-900 underline shrink-0 cursor-pointer self-end sm:self-center"
              >
                Reset Semua ke Default
              </button>
            )}
          </div>

          {/* Search, Filter Groups & Action Header */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6d7b6c] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari bahan terpilih..."
                className="w-full h-10 pl-10 pr-9 rounded-[12px] bg-white border border-[#e5e7eb] shadow-xs text-[#121c2a] placeholder:text-[#9aa599] text-[12px] focus:outline-none focus:border-[#22c55e] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6d7b6c] hover:text-[#121c2a]"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Nutrient Group Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {[
                { key: 'semua', label: 'Semua 22 Nutrisi', count: 22 },
                { key: 'makro', label: 'Energi & Makro', count: 4 },
                { key: 'mineral', label: 'Mineral', count: 6 },
                { key: 'asam_amino', label: 'Asam Amino & Lainnya', count: 12 },
              ].map(group => {
                const isActive = activeNutrientGroup === group.key;
                return (
                  <button
                    key={group.key}
                    type="button"
                    onClick={() => setActiveNutrientGroup(group.key as any)}
                    className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-[#006e2f] text-white shadow-sm'
                        : 'bg-white text-[#3d4a3d] border border-[#e5e7eb] hover:bg-[#eff4ff]'
                    }`}
                  >
                    <span>{group.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        isActive ? 'bg-white/30 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {group.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Nutrients Table */}
          <div className="bg-white rounded-[20px] border border-[#e5e7eb] shadow-xs overflow-hidden flex flex-col">
            <div className="overflow-x-auto phone-scrollbar max-h-[58vh]">
              <table className="w-full border-collapse text-[12px] text-left">
                <thead className="sticky top-0 z-20 bg-[#eff4ff] shadow-xs">
                  <tr className="border-b border-[#e6eeff]">
                    {/* Sticky Column: Bahan Baku */}
                    <th className="p-3 font-bold text-[#121c2a] min-w-[220px] sticky left-0 z-30 bg-[#eff4ff] border-r border-[#e6eeff] shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                      Bahan Baku ({filteredList.length})
                    </th>

                    {/* Status Source Badge Column */}
                    <th className="p-3 font-semibold text-[#6d7b6c] min-w-[120px] text-center border-r border-[#e6eeff]">
                      Status Sumber
                    </th>

                    {/* Dynamic 22 Nutrient Columns */}
                    {displayColumns.map(col => (
                      <th
                        key={col.key}
                        className="p-3 font-semibold text-[#3d4a3d] min-w-[115px] text-right border-r border-[#e6eeff] whitespace-nowrap"
                        title={col.description}
                      >
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-[11px] text-[#121c2a]">{col.label}</span>
                          <span className="text-[10px] text-[#6d7b6c] font-normal font-mono">({col.unit})</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={displayColumns.length + 2} className="p-8 text-center text-slate-400">
                        Tidak ada bahan baku yang dipilih atau cocok dengan pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((ing) => {
                      const isIngCustom = isCustom(ing.id);
                      const isInspecting = inspectDiffId === ing.id;

                      return (
                        <tr
                          key={ing.id}
                          className={`transition-colors ${
                            isIngCustom
                              ? 'bg-amber-50/40 hover:bg-amber-50/70'
                              : 'bg-white hover:bg-[#eff4ff]/40'
                          }`}
                        >
                          {/* Sticky Left Column: Ingredient Info */}
                          <td className="p-3 sticky left-0 z-10 bg-inherit border-r border-[#e6eeff] shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 ${
                                  isIngCustom
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-[#7cf994]/30 text-[#006e2f]'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  {ing.icon || 'grain'}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-[13px] text-[#121c2a] block truncate">
                                  {ing.name}
                                </span>
                                <span className="text-[10px] text-[#6d7b6c] truncate block">
                                  {ing.subname || 'Bahan baku pakan'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Status Badge: Default vs Custom */}
                          <td className="p-3 text-center border-r border-[#e6eeff]">
                            {isIngCustom ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
                                  <span className="material-symbols-outlined text-[12px]">edit</span>
                                  <span>Custom</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setInspectDiffId(isInspecting ? null : ing.id)}
                                  className="text-[10px] text-[#006e2f] hover:underline font-semibold"
                                  title="Lihat riwayat perubahan nilai"
                                >
                                  {isInspecting ? 'Tutup' : 'Diff'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onResetIngredient(ing.id)}
                                  className="text-[10px] text-slate-400 hover:text-amber-800"
                                  title="Reset kembali ke default matrix"
                                >
                                  <span className="material-symbols-outlined text-[14px]">replay</span>
                                </button>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#007230] border border-emerald-200">
                                <span className="material-symbols-outlined text-[12px]">lock</span>
                                <span>Default</span>
                              </span>
                            )}
                          </td>

                          {/* Editable Nutrient Cells */}
                          {displayColumns.map(col => {
                            const effectiveVal = getEffectiveVal(ing, col.key);
                            const defaultVal = getDefaultVal(ing.id, col.key);
                            const isModified = isCellCustom(ing.id, col.key);

                            return (
                              <td
                                key={col.key}
                                className={`p-2 text-right border-r border-[#e6eeff] transition-colors ${
                                  isModified ? 'bg-amber-100/50' : ''
                                }`}
                              >
                                <div className="flex flex-col items-end gap-0.5">
                                  <div
                                    className={`inline-flex items-center justify-end rounded-[6px] px-1.5 py-0.5 border ${
                                      isModified
                                        ? 'bg-white border-amber-400 ring-1 ring-amber-300'
                                        : 'bg-white border-slate-200 focus-within:border-[#006e2f]'
                                    }`}
                                  >
                                    <input
                                      type="number"
                                      step={col.unit === 'kkal/kg' ? 10 : 0.01}
                                      value={effectiveVal}
                                      onChange={(e) => {
                                        const val = Number(e.target.value) || 0;
                                        onUpdateNutrient(ing.id, col.key, val);
                                      }}
                                      className={`w-16 text-right outline-none font-bold text-[12px] bg-transparent font-mono ${
                                        isModified ? 'text-amber-900' : 'text-[#121c2a]'
                                      }`}
                                    />
                                  </div>

                                  {/* Quick default reference & reset shortcut */}
                                  {isModified && (
                                    <button
                                      type="button"
                                      onClick={() => onUpdateNutrient(ing.id, col.key, defaultVal)}
                                      className="text-[9px] text-amber-700 hover:text-amber-900 font-mono underline"
                                      title={`Nilai default asli: ${defaultVal}. Klik untuk mengembalikan.`}
                                    >
                                      Def: {defaultVal}
                                    </button>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inspect Diff Panel (Shown when user clicks 'Diff' on a modified ingredient) */}
          {inspectDiffId && selectedDiffs.length > 0 && (
            <div className="bg-white rounded-[16px] p-4 border border-amber-300 shadow-sm flex flex-col gap-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-700 text-[20px]">history_toggle_off</span>
                  <span className="font-bold text-[13px] text-[#121c2a]">
                    Riwayat Perubahan Nilai Nutrisi: {selectedIngredients.find(i => i.id === inspectDiffId)?.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onResetIngredient(inspectDiffId)}
                    className="text-[11px] font-bold text-amber-800 hover:underline cursor-pointer"
                  >
                    Reset Bahan Ini ke Default
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectDiffId(null)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {selectedDiffs.map(d => (
                  <div key={d.field} className="bg-amber-50/70 p-2.5 rounded-[10px] border border-amber-200 text-[11px] flex flex-col gap-1">
                    <span className="font-bold text-[#121c2a] truncate">{d.label}</span>
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-500">Default: <strong>{d.defaultVal} {d.unit}</strong></span>
                      <span className="material-symbols-outlined text-[14px] text-amber-700">arrow_forward</span>
                      <span className="text-amber-900 font-bold">Custom: <strong>{d.customVal} {d.unit}</strong></span>
                    </div>
                    <span className={`text-[10px] font-semibold text-right ${d.diff > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      Selisih: {d.diff > 0 ? `+${d.diff}` : d.diff} {d.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pinned Bottom Navigation Bar */}
      <div className="shrink-0 w-full bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] border-t border-[#e6eeff] z-30">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {onGoHome && (
              <button
                type="button"
                onClick={onGoHome}
                className="h-12 sm:h-13 px-4 rounded-full bg-[#eff4ff] text-[#121c2a] text-[12px] sm:text-[13px] font-bold flex items-center gap-1.5 hover:bg-[#e6eeff] transition-all cursor-pointer"
                title="Kembali ke Beranda"
              >
                <span className="material-symbols-outlined text-[20px]">home</span>
                <span className="hidden sm:inline">Beranda</span>
              </button>
            )}

            <div className="flex flex-col min-w-0">
              <span className="text-[13px] sm:text-[14px] font-bold text-[#121c2a] truncate">
                {selectedIngredients.length} Bahan Siap
              </span>
              <span className="text-[11px] text-[#6d7b6c] truncate">
                {totalCustomCount > 0 ? `${totalCustomCount} bahan menggunakan nutrisi custom` : 'Semua nutrisi menggunakan master default'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onBack}
              className="h-12 sm:h-13 px-5 rounded-full bg-[#eff4ff] text-[#121c2a] text-[12px] sm:text-[13px] font-bold flex items-center gap-1.5 hover:bg-[#e6eeff] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px]">arrow_back</span>
              <span className="hidden sm:inline">Kembali</span>
            </button>

            <button
              type="button"
              onClick={onNext}
              className="h-12 sm:h-13 px-6 sm:px-8 rounded-full bg-[#006e2f] hover:bg-[#005524] text-white text-[13px] sm:text-[14px] font-extrabold flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <span>Lanjut ke Target Nutrisi (3/3)</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

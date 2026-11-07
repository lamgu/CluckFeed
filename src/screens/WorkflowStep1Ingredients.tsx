import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Ingredient, CategoryType } from '../types';

interface WorkflowStep1Props {
  ingredients: Ingredient[];
  onToggleIngredient: (id: string) => void;
  onSelectAll?: (select: boolean) => void;
  onUpdatePrice: (id: string, price: number) => void;
  onUpdateConstraint: (id: string, min?: number, max?: number) => void;
  onResetDefaults: () => void;
  onNext: () => void;
  onBack: () => void;
  onGoHome?: () => void;
}

const CATEGORY_BADGES: Record<string, string> = {
  energi: 'bg-amber-100 text-amber-800 border-amber-200',
  protein: 'bg-[#7cf994]/40 text-[#007230] border-emerald-200',
  mineral: 'bg-blue-100 text-blue-800 border-blue-200',
  aditif: 'bg-purple-100 text-purple-800 border-purple-200',
};

export const WorkflowStep1Ingredients: React.FC<WorkflowStep1Props> = ({
  ingredients,
  onToggleIngredient,
  onSelectAll,
  onUpdatePrice,
  onUpdateConstraint,
  onResetDefaults,
  onNext,
  onBack,
  onGoHome
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryType>('semua');

  // Multi-drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const dragTargetStateRef = useRef<boolean | null>(null);

  const selectedCount = useMemo(() => {
    return ingredients.filter(i => i.selected).length;
  }, [ingredients]);

  const categories: { key: CategoryType; label: string; count: number }[] = useMemo(() => [
    { key: 'semua', label: 'Semua', count: ingredients.length },
    { key: 'energi', label: 'Energi', count: ingredients.filter(i => i.category === 'energi').length },
    { key: 'protein', label: 'Protein', count: ingredients.filter(i => i.category === 'protein').length },
    { key: 'mineral', label: 'Mineral', count: ingredients.filter(i => i.category === 'mineral').length },
    { key: 'aditif', label: 'Aditif', count: ingredients.filter(i => i.category === 'aditif').length }
  ], [ingredients]);

  const filteredIngredients = useMemo(() => {
    return ingredients.filter(item => {
      const matchCat = activeCategory === 'semua' || item.category === activeCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.subname || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [ingredients, activeCategory, searchQuery]);

  const allFilteredSelected = useMemo(() => {
    if (filteredIngredients.length === 0) return false;
    return filteredIngredients.every(i => i.selected);
  }, [filteredIngredients]);

  const handleToggleAllFiltered = () => {
    const nextState = !allFilteredSelected;
    if (onSelectAll && activeCategory === 'semua' && !searchQuery.trim()) {
      onSelectAll(nextState);
      return;
    }
    filteredIngredients.forEach(ing => {
      if (ing.selected !== nextState) {
        onToggleIngredient(ing.id);
      }
    });
  };

  // Drag selection listener for global mouse up
  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
      dragTargetStateRef.current = null;
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Row selection handler: toggle on click anywhere on row (except inputs)
  const handleRowMouseDown = (ing: Ingredient, e: React.MouseEvent) => {
    // If target is an input or inside input, do not toggle selection to allow user editing
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' && target.getAttribute('type') === 'number') {
      return;
    }
    if (target.closest('input[type="number"]')) {
      return;
    }

    // Toggle current item and begin drag session
    const nextState = !ing.selected;
    dragTargetStateRef.current = nextState;
    setIsDragging(true);
    onToggleIngredient(ing.id);
  };

  // Hover over other rows while dragging
  const handleRowMouseEnter = (ing: Ingredient) => {
    if (isDragging && dragTargetStateRef.current !== null) {
      if (ing.selected !== dragTargetStateRef.current) {
        onToggleIngredient(ing.id);
      }
    }
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-[#f9fafb]">
      {/* Workflow Stepper Header */}
      <div className="shrink-0 px-4 sm:px-6 lg:px-8 py-3 bg-white border-b border-[#e6eeff] shadow-xs">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#006e2f] text-white font-label-sm text-[10px] font-bold uppercase tracking-wider">
                Tahap 1 dari 3
              </span>
              <span className="font-headline-sm text-[14px] sm:text-[15px] font-bold text-[#121c2a]">
                Pemilihan Bahan Baku &amp; Batasan
              </span>
            </div>

            <div className="px-3 py-1 rounded-full bg-[#7cf994]/40 text-[#007230] font-label-md text-[12px] font-bold flex items-center gap-1.5 shadow-xs">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{selectedCount} Bahan Aktif</span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-3 gap-2 w-full">
            <div className="h-2 rounded-full bg-[#22c55e] transition-all"></div>
            <div className="h-2 rounded-full bg-[#d9e3f6] transition-all"></div>
            <div className="h-2 rounded-full bg-[#d9e3f6] transition-all"></div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto phone-scrollbar flex flex-col">
        <div className="max-w-6xl mx-auto w-full flex flex-col flex-1 px-4 sm:px-6 lg:px-8 py-4 gap-3.5">
          {/* Quick Notice Banner & Helper Tips */}
          <div className="w-full bg-[#eff4ff] p-3 rounded-[16px] border border-[#e6eeff] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px]">
            <div className="flex items-center gap-2 text-[#3d4a3d] min-w-0">
              <span className="material-symbols-outlined text-[20px] text-[#006e2f] shrink-0">touch_app</span>
              <span>
                <strong>Klik baris</strong> atau <strong>seret (drag)</strong> mouse melintasi beberapa baris untuk memilih cepat. Harga &amp; batasan dapat diedit langsung.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={handleToggleAllFiltered}
                className="text-[12px] font-bold text-[#006e2f] hover:underline cursor-pointer"
              >
                {allFilteredSelected ? 'Batal Semua' : 'Pilih Semua'}
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={onResetDefaults}
                className="text-[12px] font-bold text-slate-600 hover:text-[#006e2f] cursor-pointer"
              >
                Reset Default
              </button>
            </div>
          </div>

          {/* Search + Category Filter Cluster */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6d7b6c] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari bahan (misal: Jagung, SBM, DCP)..."
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

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setActiveCategory(cat.key)}
                    className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-[#22c55e] text-white shadow-sm'
                        : 'bg-white text-[#3d4a3d] border border-[#e5e7eb] hover:bg-[#eff4ff]'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        isActive ? 'bg-white/30 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Table with Row-Click & Drag-Select (Tahap 1) */}
          <div className="bg-white rounded-[20px] border border-[#e5e7eb] shadow-xs overflow-hidden flex flex-col select-none">
            <div className="overflow-x-auto phone-scrollbar">
              <table className="w-full border-collapse text-[12px] text-left">
                <thead>
                  <tr className="bg-[#eff4ff] border-b border-[#e6eeff]">
                    <th className="p-3 w-12 text-center border-r border-[#e6eeff]">
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        onChange={handleToggleAllFiltered}
                        title="Pilih / Batalkan semua bahan terfilter"
                        className="w-4.5 h-4.5 rounded text-[#006e2f] accent-[#006e2f] cursor-pointer"
                      />
                    </th>
                    <th className="p-3 font-bold text-[#121c2a] min-w-[200px] border-r border-[#e6eeff]">
                      Bahan Baku
                    </th>
                    <th className="p-3 font-semibold text-[#6d7b6c] min-w-[100px] text-center border-r border-[#e6eeff]">
                      Kategori
                    </th>
                    <th className="p-3 font-semibold text-[#6d7b6c] min-w-[140px] text-right border-r border-[#e6eeff]">
                      Harga (Rp/kg)
                    </th>
                    <th className="p-3 font-semibold text-[#6d7b6c] min-w-[110px] text-right border-r border-[#e6eeff]">
                      Batas Min (%)
                    </th>
                    <th className="p-3 font-semibold text-[#6d7b6c] min-w-[110px] text-right border-r border-[#e6eeff]">
                      Batas Max (%)
                    </th>
                    <th className="p-3 font-semibold text-[#6d7b6c] min-w-[110px] text-right">
                      Stok Tersedia
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredIngredients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Tidak ada bahan baku yang cocok dengan pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredIngredients.map((ing) => {
                      const isSelected = ing.selected;
                      return (
                        <tr
                          key={ing.id}
                          onMouseDown={(e) => handleRowMouseDown(ing, e)}
                          onMouseEnter={() => handleRowMouseEnter(ing)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#7cf994]/15 hover:bg-[#7cf994]/25 border-l-4 border-l-[#006e2f]'
                              : 'bg-white hover:bg-[#eff4ff]/60 border-l-4 border-l-transparent opacity-85 hover:opacity-100'
                          }`}
                        >
                          {/* Checkbox Cell */}
                          <td className="p-3 text-center border-r border-[#e6eeff]">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => onToggleIngredient(ing.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-5 h-5 rounded text-[#006e2f] accent-[#006e2f] cursor-pointer transition-transform active:scale-90"
                            />
                          </td>

                          {/* Ingredient Name & Icon */}
                          <td className="p-3 border-r border-[#e6eeff]">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0 transition-colors ${
                                  isSelected
                                    ? 'bg-[#7cf994]/40 text-[#007230]'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[20px]">
                                  {ing.icon || 'grain'}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`font-bold text-[13px] block truncate ${
                                      isSelected ? 'text-[#121c2a]' : 'text-slate-600 line-through decoration-slate-300'
                                    }`}
                                  >
                                    {ing.name}
                                  </span>
                                  {isSelected && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shrink-0" />
                                  )}
                                </div>
                                <span className="text-[11px] text-[#6d7b6c] truncate block">
                                  {ing.subname || 'Bahan baku pakan'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td className="p-3 text-center border-r border-[#e6eeff]">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                                CATEGORY_BADGES[ing.category] || 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {ing.category}
                            </span>
                          </td>

                          {/* Editable Price Input */}
                          <td
                            className="p-3 text-right border-r border-[#e6eeff]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center gap-1 bg-white border border-[#d1d5db] focus-within:border-[#006e2f] focus-within:ring-2 focus-within:ring-[#7cf994]/40 rounded-[8px] px-2.5 py-1 shadow-2xs">
                              <span className="text-[11px] text-slate-400 font-semibold">Rp</span>
                              <input
                                type="number"
                                min={0}
                                step={100}
                                value={ing.currentPrice ?? 0}
                                onChange={(e) => onUpdatePrice(ing.id, Number(e.target.value) || 0)}
                                className="w-20 text-right outline-none font-bold text-[12px] text-[#121c2a] bg-transparent cursor-text"
                              />
                            </div>
                          </td>

                          {/* Editable Min Constraint */}
                          <td
                            className="p-3 text-right border-r border-[#e6eeff]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center gap-1 bg-white border border-[#d1d5db] focus-within:border-[#006e2f] focus-within:ring-2 focus-within:ring-[#7cf994]/40 rounded-[8px] px-2.5 py-1 shadow-2xs">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                step={0.5}
                                value={ing.minConstraint ?? 0}
                                onChange={(e) =>
                                  onUpdateConstraint(ing.id, Number(e.target.value) || 0, ing.maxConstraint)
                                }
                                className="w-12 text-right outline-none font-bold text-[12px] text-[#121c2a] bg-transparent cursor-text"
                              />
                              <span className="text-[11px] text-[#6d7b6c] font-semibold">%</span>
                            </div>
                          </td>

                          {/* Editable Max Constraint */}
                          <td
                            className="p-3 text-right border-r border-[#e6eeff]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center gap-1 bg-white border border-[#d1d5db] focus-within:border-[#006e2f] focus-within:ring-2 focus-within:ring-[#7cf994]/40 rounded-[8px] px-2.5 py-1 shadow-2xs">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                step={0.5}
                                value={ing.maxConstraint ?? 100}
                                onChange={(e) =>
                                  onUpdateConstraint(ing.id, ing.minConstraint, Number(e.target.value) || 100)
                                }
                                className="w-12 text-right outline-none font-bold text-[12px] text-[#121c2a] bg-transparent cursor-text"
                              />
                              <span className="text-[11px] text-[#6d7b6c] font-semibold">%</span>
                            </div>
                          </td>

                          {/* Stock Info */}
                          <td className="p-3 text-right font-medium text-[12px] text-[#3d4a3d]">
                            <span className="font-bold">{ing.inStockKg ?? 0}</span>
                            <span className="text-slate-400 text-[11px] ml-1">kg</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pinned Bottom Bar (Always Fixed at Bottom) */}
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
                {selectedCount} Bahan Terpilih
              </span>
              <span className="text-[11px] text-[#6d7b6c] truncate">
                Siap diperiksa matriks nutrisinya
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
              disabled={selectedCount === 0}
              onClick={onNext}
              className={`h-12 sm:h-13 px-6 sm:px-8 rounded-full text-[13px] sm:text-[14px] font-extrabold flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer ${
                selectedCount > 0
                  ? 'bg-[#006e2f] hover:bg-[#005524] text-white active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Lanjut ke Matriks Nutrisi (2/3)</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

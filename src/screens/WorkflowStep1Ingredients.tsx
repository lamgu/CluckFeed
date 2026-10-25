import React, { useState, useMemo } from 'react';
import { Ingredient, CategoryType } from '../types';

interface WorkflowStep1Props {
  ingredients: Ingredient[];
  onToggleIngredient: (id: string) => void;
  onResetDefaults: () => void;
  onNext: () => void;
  onBack: () => void;
}

export const WorkflowStep1Ingredients: React.FC<WorkflowStep1Props> = ({
  ingredients,
  onToggleIngredient,
  onResetDefaults,
  onNext,
  onBack
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryType>('semua');

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
                          item.subname.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [ingredients, activeCategory, searchQuery]);

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Workflow Context Sub-bar (Shrink-0) */}
      <div className="shrink-0 px-4 py-3 bg-white border-b border-[#e6eeff] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="font-label-sm text-[11px] font-bold tracking-wider text-[#006e2f] uppercase">
              Langkah 1 dari 3
            </span>
            <span className="w-1 h-1 rounded-full bg-[#bccbb9]"></span>
            <span className="font-label-md text-[13px] font-semibold text-[#121c2a]">
              Pilih Bahan Pakan
            </span>
          </div>

          <div className="px-3 py-1 rounded-full bg-[#7cf994]/40 text-[#007230] font-label-md text-[12px] font-bold flex items-center gap-1 shadow-xs">
            <span className="material-symbols-outlined text-[15px]">check_circle</span>
            <span>{selectedCount} Dipilih</span>
          </div>
        </div>

        {/* Step Progress Line */}
        <div className="grid grid-cols-3 gap-1.5 w-full">
          <div className="h-1.5 rounded-full bg-[#22c55e] transition-all"></div>
          <div className="h-1.5 rounded-full bg-[#d9e3f6] transition-all"></div>
          <div className="h-1.5 rounded-full bg-[#d9e3f6] transition-all"></div>
        </div>
      </div>

      {/* Scrollable Middle Body: Search, Filters & Ingredient Cards */}
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
        {/* Search & Filter Cluster */}
        <div className="px-4 pt-3 pb-2 flex flex-col gap-3">
        {/* Search Bar */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6d7b6c] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari bahan pakan (misal: Jagung, Bekatul)..."
            className="w-full h-12 pl-11 pr-10 rounded-full bg-white border border-[#e5e7eb] shadow-xs text-[#121c2a] placeholder:text-[#6d7b6c] font-body-md text-[13px] focus:outline-none focus:border-[#22c55e] focus:bg-[#eff4ff]/30 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#e6eeff] text-[#3d4a3d] flex items-center justify-center hover:bg-[#d0dbed]"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar -mx-4 px-4">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full font-label-md text-[12px] shadow-xs transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#22c55e] text-white font-bold'
                    : 'bg-white text-[#3d4a3d] border border-[#e5e7eb] hover:bg-[#eff4ff]'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#e6eeff] text-[#3d4a3d]'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Smart Quick Helper Banner */}
      <div className="px-4 my-1">
        <div className="w-full bg-gradient-to-r from-[#eff4ff] to-[#7cf994]/20 p-3.5 flex items-center justify-between gap-2.5 rounded-2xl border border-[#7cf994]/30 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#22c55e]/20 flex items-center justify-center flex-shrink-0 text-[#006e2f]">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                eco
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-[13px] text-[#121c2a] font-bold truncate">
                Rekomendasi Starter Broiler
              </span>
              <span className="font-body-sm text-[11px] text-[#3d4a3d] truncate">
                5 bahan standar SNI sudah ditandai
              </span>
            </div>
          </div>
          <button
            onClick={onResetDefaults}
            className="text-[#006e2f] font-label-md text-[12px] font-bold whitespace-nowrap active:opacity-75 hover:underline px-2 py-1"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Ingredients List */}
      <div className="px-4 flex flex-col gap-2.5 pt-2">
        {filteredIngredients.map((ing) => {
          const isSelected = ing.selected;
          return (
            <div
              key={ing.id}
              onClick={() => onToggleIngredient(ing.id)}
              className={`cursor-pointer w-full p-4 transition-all shadow-xs active:scale-[0.99] flex items-center justify-between gap-3 rounded-2xl border ${
                isSelected
                  ? 'bg-[#7cf994]/25 border-[#22c55e]'
                  : 'bg-white border-[#e5e7eb] hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-12 h-12 flex items-center justify-center flex-shrink-0 rounded-xl transition-colors ${
                    isSelected
                      ? 'bg-[#7cf994]/60 text-[#006e2f]'
                      : 'bg-[#eff4ff] text-[#6d7b6c]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[26px]">
                    {ing.icon}
                  </span>
                </div>

                <div className="flex flex-col min-w-0">
                  <h2 className="font-headline-sm text-[14px] text-[#121c2a] font-bold truncate">
                    {ing.name}
                  </h2>
                  <p className="font-body-sm text-[11px] text-[#3d4a3d] truncate">
                    {ing.subname}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {ing.tag1 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#e6eeff] font-label-sm text-[10px] text-[#3d4a3d] font-semibold">
                        {ing.tag1}
                      </span>
                    )}
                    {ing.tag2 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#e6eeff] font-label-sm text-[10px] text-[#3d4a3d] font-semibold">
                        {ing.tag2}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-white/70 border border-slate-200 font-label-sm text-[10px] text-slate-600">
                      Rp {ing.currentPrice.toLocaleString('id-ID')}/kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkbox Indicator */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-xs transition-transform ${
                  isSelected
                    ? 'bg-[#22c55e] text-white scale-105'
                    : 'bg-[#e6eeff] text-[#6d7b6c]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] font-bold">
                  {isSelected ? 'check' : 'add'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty Search Feedback */}
      {filteredIngredients.length === 0 && (
        <div className="px-4 py-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#e6eeff] flex items-center justify-center mb-3 text-[#3d4a3d]">
            <span className="material-symbols-outlined text-[32px]">inventory_2</span>
          </div>
          <p className="font-headline-sm text-[16px] text-[#121c2a] font-bold">Bahan Tidak Ditemukan</p>
          <p className="font-body-sm text-[12px] text-[#3d4a3d] max-w-xs mt-1">
            Coba kata kunci lain atau pilih dari kategori yang tersedia.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategory('semua'); }}
            className="mt-3 px-4 py-1.5 rounded-full bg-[#006e2f] text-white font-label-md text-[12px]"
          >
            Lihat Semua Bahan
          </button>
        </div>
      )}

      </div>

      {/* Pinned Bottom Action Dock (Always Fixed at Bottom) */}
      <div className="shrink-0 w-full px-4 py-3 bg-white/95 backdrop-blur-md border-t border-[#e6eeff] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-30">
        <div className="w-full flex items-center justify-between gap-3">
          {/* Left info */}
          <div className="flex flex-col min-w-0 pl-1">
            <div className="flex items-center gap-1.5">
              <span className="font-headline-sm text-[16px] text-[#121c2a] font-bold">
                {selectedCount} Bahan
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#006e2f]"></span>
            </div>
            <p className="font-body-sm text-[11px] text-[#3d4a3d] truncate">
              {selectedCount >= 3 ? 'Siap dihitung rasio & harga' : 'Pilih minimal 3 bahan pakan'}
            </p>
          </div>

          {/* Right CTA */}
          <button
            onClick={onNext}
            disabled={selectedCount < 2}
            className={`h-12 px-6 rounded-full font-label-lg text-[13px] font-bold shadow-md flex items-center gap-1.5 flex-shrink-0 transition-all active:scale-95 ${
              selectedCount < 2
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-[#22c55e] text-white hover:bg-[#006e2f]'
            }`}
          >
            <span>Lanjut ke Harga</span>
            <span className="material-symbols-outlined text-[19px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

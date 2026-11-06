import React, { useState } from 'react';
import type { Ingredient, CategoryType } from '../types';
import { INGREDIENT_NUTRIENT_COLUMNS, AI_FEED_KNOWLEDGE_BASE, CSV_SHEET1_INGREDIENTS } from '../data/sheet1Ingredients';

interface MatrixBahanBakuScreenProps {
  ingredients: Ingredient[];
  onUpdateIngredient: (id: string, data: Partial<Ingredient>) => void;
  onAddIngredient: (data: Omit<Ingredient, 'id'> & { id?: string }) => Promise<Ingredient>;
  onRemoveIngredient: (id: string) => void;
}

const CATEGORIES: { key: CategoryType; label: string; icon: string; color: string }[] = [
  { key: 'semua', label: 'Semua Kategori', icon: 'apps', color: '' },
  { key: 'energi', label: 'Energi', icon: 'bolt', color: 'text-[#ef9900]' },
  { key: 'protein', label: 'Protein', icon: 'nutrition', color: 'text-[#006e2f]' },
  { key: 'mineral', label: 'Mineral', icon: 'diamond', color: 'text-[#0284c7]' },
  { key: 'aditif', label: 'Aditif & Asam Amino', icon: 'science', color: 'text-[#7c3aed]' },
];

const CATEGORY_BADGE: Record<string, string> = {
  energi: 'bg-amber-100 text-amber-800 border-amber-200',
  protein: 'bg-[#7cf994]/40 text-[#007230] border-emerald-200',
  mineral: 'bg-blue-100 text-blue-800 border-blue-200',
  aditif: 'bg-purple-100 text-purple-800 border-purple-200',
};

const EMPTY_FORM_DATA: Omit<Ingredient, 'id'> = {
  name: '',
  subname: '',
  category: 'energi',
  defaultPrice: 5000,
  currentPrice: 5000,
  inStockKg: 500,
  energy: 0,
  protein: 0,
  fat: 0,
  fiber: 0,
  pati: 0,
  moisture: 10,
  dryMatter: 90,
  ash: 2,
  calcium: 0,
  phosphorus: 0,
  phosAvailable: 0,
  sodium: 0,
  chloride: 0,
  lysine: 0,
  methionine: 0,
  metCys: 0,
  threonine: 0,
  tryptophan: 0,
  arginine: 0,
  isoleucine: 0,
  valine: 0,
  choline: 0,
  hasConstraint: false,
  minConstraint: 0,
  maxConstraint: 100,
  icon: 'grain',
  selected: true,
};

export const MatrixBahanBakuScreen: React.FC<MatrixBahanBakuScreenProps> = ({
  ingredients: rawIngredients,
  onUpdateIngredient,
  onAddIngredient,
  onRemoveIngredient,
}) => {
  // Fall back to CSV_SHEET1_INGREDIENTS if empty
  const ingredients = rawIngredients && rawIngredients.length > 0 ? rawIngredients : CSV_SHEET1_INGREDIENTS;

  // View Mode: 'cards' or 'table'
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [activeFilter, setActiveFilter] = useState<CategoryType>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Expandable cards state
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Add / Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Ingredient, 'id'>>(EMPTY_FORM_DATA);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // Sorting for table
  const [sortKey, setSortKey] = useState<keyof Ingredient>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Filter + search + sort
  const filtered = ingredients
    .filter(i => activeFilter === 'semua' || i.category === activeFilter)
    .filter(i => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return i.name.toLowerCase().includes(q) || (i.subname || '').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const aVal = a[sortKey] ?? 0;
      const bVal = b[sortKey] ?? 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc ? (Number(aVal) - Number(bVal)) : (Number(bVal) - Number(aVal));
    });

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setFormData(EMPTY_FORM_DATA);
    setAiMessage(null);
    setShowModal(true);
  };

  const openEditModal = (ing: Ingredient) => {
    setModalMode('edit');
    setEditingId(ing.id);
    const { id, ...rest } = ing;
    setFormData(rest);
    setAiMessage(null);
    setShowModal(true);
  };

  // AI Assistant Auto-Fill Helper
  const handleAiAutoFill = () => {
    const rawName = formData.name.trim().toLowerCase();
    if (!rawName) {
      setAiMessage('Ketikkan nama bahan baku terlebih dahulu (misal: "Bungkil Sawit", "Tepung Ikan", "Maggot BSF")');
      return;
    }

    setIsAiLoading(true);
    setAiMessage(null);

    setTimeout(() => {
      setIsAiLoading(false);

      // Search best match from local agricultural feed database
      let matchKey = Object.keys(AI_FEED_KNOWLEDGE_BASE).find(k => rawName.includes(k) || k.includes(rawName));

      if (matchKey && AI_FEED_KNOWLEDGE_BASE[matchKey]) {
        const aiValues = AI_FEED_KNOWLEDGE_BASE[matchKey];
        setFormData(prev => ({
          ...prev,
          ...aiValues,
          subname: prev.subname || `Bahan pakan terverifikasi standar lab`,
          tag1: `PK ${(aiValues.protein || 0).toFixed(1)}%`,
          tag2: `EM ${(aiValues.energy || 0)} kkal`,
        }));
        setAiMessage(`✨ Nilai 23 parameter nutrisi untuk "${formData.name}" berhasil diisi otomatis oleh AI!`);
      } else {
        // Intelligent heuristic approximation for custom feed material
        const isProteinSource = rawName.includes('ikan') || rawName.includes('daging') || rawName.includes('bungkil') || rawName.includes('kedelai') || rawName.includes('maggot') || rawName.includes('ulat');
        const isMineralSource = rawName.includes('batu') || rawName.includes('kapur') || rawName.includes('garam') || rawName.includes('cangkang') || rawName.includes('dcp');

        const estimatedCategory = isProteinSource ? 'protein' : isMineralSource ? 'mineral' : 'energi';
        const estProtein = isProteinSource ? 38.0 : isMineralSource ? 0.0 : 10.5;
        const estEnergy = isProteinSource ? 2400 : isMineralSource ? 0 : 3100;
        const estCa = isMineralSource ? 28.0 : isProteinSource ? 1.5 : 0.05;
        const estP = isMineralSource ? 10.0 : isProteinSource ? 0.8 : 0.25;

        setFormData(prev => ({
          ...prev,
          category: estimatedCategory,
          protein: estProtein,
          energy: estEnergy,
          fat: isProteinSource ? 6.5 : 3.0,
          fiber: isProteinSource ? 4.5 : 3.5,
          calcium: estCa,
          phosphorus: estP,
          phosAvailable: estP * 0.4,
          moisture: 11.5,
          dryMatter: 88.5,
          ash: isMineralSource ? 80.0 : 5.0,
          lysine: estProtein * 0.05,
          methionine: estProtein * 0.02,
          metCys: estProtein * 0.035,
          threonine: estProtein * 0.035,
          arginine: estProtein * 0.06,
          valine: estProtein * 0.04,
          choline: isProteinSource ? 1500 : 800,
        }));
        setAiMessage(`✨ AI memperkirakan parameter gizi untuk "${formData.name}". Silakan sesuaikan bila perlu.`);
      }
    }, 500);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (modalMode === 'create') {
      const newIng = {
        ...formData,
        id: 'ing-' + Date.now(),
        tag1: `PK ${formData.protein.toFixed(1)}%`,
        tag2: `EM ${formData.energy} kkal`,
      };
      await onAddIngredient(newIng);
    } else if (modalMode === 'edit' && editingId) {
      onUpdateIngredient(editingId, {
        ...formData,
        tag1: `PK ${formData.protein.toFixed(1)}%`,
        tag2: `EM ${formData.energy} kkal`,
      });
    }

    setShowModal(false);
  };

  const handleDelete = (ing: Ingredient) => {
    if (window.confirm(`Hapus bahan baku "${ing.name}" dari database?`)) {
      onRemoveIngredient(ing.id);
    }
  };

  const totalBahan = ingredients.length;
  const totalStok = ingredients.reduce((s, i) => s + (i.inStockKg || 0), 0);
  const avgProtein = ingredients.length ? (ingredients.reduce((s, i) => s + (i.protein || 0), 0) / ingredients.length).toFixed(1) : '0';

  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto phone-scrollbar pb-24 md:pb-12 flex flex-col overscroll-contain bg-[#f9fafb]">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-[#e6eeff] px-4 sm:px-6 lg:px-8 py-3.5 sticky top-0 z-30 flex items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-sm text-[16px] sm:text-[18px] font-bold text-[#121c2a] leading-tight">
              Matrix Bahan Baku
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">verified</span>
              Sheet1 CSV Standar Lab
            </span>
          </div>
          <p className="font-label-sm text-[11px] sm:text-[12px] text-[#6d7b6c]">
            Database 23 Parameter Nutrisi Lengkap ({totalBahan} Bahan Baku Terdaftar)
          </p>
        </div>

        {/* View Switcher & Action CTA */}
        <div className="flex items-center gap-2">
          <div className="bg-[#eff4ff] p-1 rounded-full border border-[#e6eeff] flex items-center">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-full text-[12px] font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'cards'
                  ? 'bg-[#006e2f] text-white shadow-xs'
                  : 'text-[#6d7b6c] hover:text-[#121c2a]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              <span className="hidden sm:inline">Tampilan Kartu</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-full text-[12px] font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-[#006e2f] text-white shadow-xs'
                  : 'text-[#6d7b6c] hover:text-[#121c2a]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">table_chart</span>
              <span className="hidden sm:inline">Tabel Matriks</span>
            </button>
          </div>

          <button
            onClick={openCreateModal}
            className="bg-[#22c55e] hover:bg-[#006e2f] text-white font-label-md text-[12px] font-bold px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1 shadow-xs active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="hidden md:inline">Tambah Bahan</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Row */}
      <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-2 grid grid-cols-3 gap-3">
        <div className="bg-white rounded-[18px] p-3.5 shadow-xs border border-[#e5e7eb] flex flex-col gap-0.5">
          <span className="font-label-sm text-[11px] text-[#6d7b6c]">Total Bahan Baku</span>
          <span className="font-headline-sm text-[20px] font-bold text-[#121c2a]">{totalBahan}</span>
          <span className="font-label-sm text-[10px] text-[#006e2f]">18 Bahan Standar CSV</span>
        </div>
        <div className="bg-white rounded-[18px] p-3.5 shadow-xs border border-[#e5e7eb] flex flex-col gap-0.5">
          <span className="font-label-sm text-[11px] text-[#6d7b6c]">Total Stok Gudang</span>
          <span className="font-headline-sm text-[20px] font-bold text-[#121c2a]">{totalStok.toLocaleString('id-ID')}</span>
          <span className="font-label-sm text-[10px] text-[#006e2f]">kg pakan tersedia</span>
        </div>
        <div className="bg-white rounded-[18px] p-3.5 shadow-xs border border-[#e5e7eb] flex flex-col gap-0.5">
          <span className="font-label-sm text-[11px] text-[#6d7b6c]">Rata-rata Protein (PK)</span>
          <span className="font-headline-sm text-[20px] font-bold text-[#121c2a]">{avgProtein}%</span>
          <span className="font-label-sm text-[10px] text-[#006e2f]">kualitas ransum</span>
        </div>
      </div>

      {/* Search + Category Filter Bar */}
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-2.5">
        <div className="flex items-center gap-2 bg-white rounded-[14px] border border-[#e5e7eb] px-3.5 py-2.5 shadow-xs">
          <span className="material-symbols-outlined text-[20px] text-[#6d7b6c]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari bahan baku (misal: Jagung, SBM, MBM, Lysine, DCP)..."
            className="flex-1 outline-none bg-transparent font-body-sm text-[13px] text-[#121c2a] placeholder:text-[#aab4aa]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-[#6d7b6c] hover:text-[#121c2a]">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map(cat => {
            const count = ingredients.filter(i => cat.key === 'semua' || i.category === cat.key).length;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveFilter(cat.key)}
                className={`whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-label-md text-[12px] transition-all shadow-xs ${
                  activeFilter === cat.key
                    ? 'bg-[#22c55e] text-white font-bold'
                    : 'bg-[#eff4ff] text-[#3d4a3d] hover:bg-[#e6eeff]'
                }`}
              >
                <span className={`material-symbols-outlined text-[15px] ${activeFilter === cat.key ? 'text-white' : cat.color}`}>
                  {cat.icon}
                </span>
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeFilter === cat.key ? 'bg-white/30 text-white' : 'bg-slate-200 text-[#3d4a3d]'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 1: TAMPILAN KARTU RESPONSIVE */}
      {viewMode === 'cards' && (
        <div className="px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
          {filtered.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-[24px] border border-dashed border-[#d1d5db] p-8 shadow-xs">
              <span className="material-symbols-outlined text-[36px] text-slate-400 mb-2">grain</span>
              <h3 className="font-bold text-[16px] text-slate-800">Bahan Baku Tidak Ditemukan</h3>
              <p className="text-slate-500 text-[12px] mt-1">Coba sesuaikan kata kunci pencarian atau tambah bahan baru.</p>
            </div>
          ) : (
            filtered.map((ing) => {
              const isExpanded = !!expandedCards[ing.id];
              return (
                <div
                  key={ing.id}
                  className="bg-white rounded-[22px] p-4 shadow-xs border border-[#e5e7eb] flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-[#22c55e]/50"
                >
                  <div className="flex flex-col gap-2.5">
                    {/* Header Row: Icon, Name, Category */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 ${
                            ing.category === 'energi' ? 'bg-amber-100 text-amber-800' :
                            ing.category === 'protein' ? 'bg-[#7cf994]/30 text-[#006e2f]' :
                            ing.category === 'mineral' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[22px]">
                            {ing.icon || 'grain'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-headline-sm text-[15px] font-bold text-[#121c2a] truncate">
                            {ing.name}
                          </h3>
                          <p className="font-body-sm text-[11px] text-[#6d7b6c] truncate">
                            {ing.subname || 'Bahan baku pakan ternak'}
                          </p>
                        </div>
                      </div>

                      {/* Checkbox toggle selected */}
                      <button
                        type="button"
                        onClick={() => onUpdateIngredient(ing.id, { selected: !ing.selected })}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          ing.selected ? 'bg-[#006e2f] text-white shadow-xs' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                        title={ing.selected ? 'Dipakai dalam formulasi' : 'Dinonaktifkan'}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {ing.selected ? 'check' : 'remove'}
                        </span>
                      </button>
                    </div>

                    {/* Price & Stock Strip */}
                    <div className="flex items-center justify-between bg-[#eff4ff] px-3 py-2 rounded-[12px] border border-[#e6eeff]">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#6d7b6c] font-medium">Harga Pasar/Beli</span>
                        <span className="font-bold text-[13px] text-[#121c2a]">
                          Rp {ing.currentPrice.toLocaleString('id-ID')}<span className="text-[10px] text-[#6d7b6c] font-normal">/kg</span>
                        </span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] text-[#6d7b6c] font-medium">Stok Gudang</span>
                        <span className="font-bold text-[13px] text-[#006e2f]">
                          {ing.inStockKg.toLocaleString('id-ID')} <span className="text-[10px] text-[#6d7b6c] font-normal">kg</span>
                        </span>
                      </div>
                    </div>

                    {/* Nutrisi Utama 4 Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-[#f8f9ff] p-2 rounded-[10px] border border-[#e6eeff] flex flex-col">
                        <span className="text-[#6d7b6c] text-[10px]">Protein (PK)</span>
                        <span className="font-bold text-[#121c2a] text-[13px] mt-0.5">{ing.protein.toFixed(2)}%</span>
                      </div>
                      <div className="bg-[#f8f9ff] p-2 rounded-[10px] border border-[#e6eeff] flex flex-col">
                        <span className="text-[#6d7b6c] text-[10px]">Energi (EM)</span>
                        <span className="font-bold text-[#121c2a] text-[13px] mt-0.5">{ing.energy.toLocaleString('id-ID')} kkal</span>
                      </div>
                      <div className="bg-[#f8f9ff] p-2 rounded-[10px] border border-[#e6eeff] flex flex-col">
                        <span className="text-[#6d7b6c] text-[10px]">Kalsium (Ca)</span>
                        <span className="font-bold text-[#006e2f] text-[13px] mt-0.5">{ing.calcium.toFixed(2)}%</span>
                      </div>
                      <div className="bg-[#f8f9ff] p-2 rounded-[10px] border border-[#e6eeff] flex flex-col">
                        <span className="text-[#6d7b6c] text-[10px]">Fosfor (P)</span>
                        <span className="font-bold text-[#121c2a] text-[13px] mt-0.5">{ing.phosphorus.toFixed(2)}%</span>
                      </div>
                    </div>

                    {/* Expanded 23 Parameters Section */}
                    {isExpanded && (
                      <div className="p-2.5 bg-[#f8f9ff] rounded-[14px] border border-[#e6eeff] flex flex-col gap-2 mt-1 animate-fadeIn">
                        <span className="text-[10px] font-bold text-[#006e2f] uppercase tracking-wider">
                          23 Parameter Nutrisi Lab (Sheet1)
                        </span>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                          <div className="flex justify-between border-b border-slate-100 py-0.5">
                            <span className="text-slate-500">Lemak:</span>
                            <span className="font-semibold">{ing.fat ?? 0}%</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 py-0.5">
                            <span className="text-slate-500">Serat K:</span>
                            <span className="font-semibold">{ing.fiber ?? 0}%</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 py-0.5">
                            <span className="text-slate-500">Pati:</span>
                            <span className="font-semibold">{ing.pati ?? 0}%</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 py-0.5">
                            <span className="text-slate-500">K. Air:</span>
                            <span className="font-semibold">{ing.moisture ?? 0}%</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 py-0.5">
                            <span className="text-slate-500">B Kering:</span>
                            <span className="font-semibold">{ing.dryMatter ?? 0}%</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 py-0.5">
                            <span className="text-slate-500">Abu:</span>
                            <span className="font-semibold">{ing.ash ?? 0}%</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 py-0.5">
                            <span className="text-slate-500">Phos Av:</span>
                            <span className="font-semibold">{ing.phosAvailable ?? 0}%</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 py-0.5">
                            <span className="text-slate-500">Na:</span>
                            <span className="font-semibold">{ing.sodium ?? 0}%</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 py-0.5">
                            <span className="text-slate-500">Cl:</span>
                            <span className="font-semibold">{ing.chloride ?? 0}%</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 py-0.5">
                            <span className="text-slate-500">Lysine ter:</span>
                            <span className="font-semibold">{ing.lysine ?? 0}%</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 py-0.5">
                            <span className="text-slate-500">Methionine ter:</span>
                            <span className="font-semibold">{ing.methionine ?? 0}%</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 py-0.5">
                            <span className="text-slate-500">Met+Cys ter:</span>
                            <span className="font-semibold">{ing.metCys ?? 0}%</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 py-0.5">
                            <span className="text-slate-500">Threonine ter:</span>
                            <span className="font-semibold">{ing.threonine ?? 0}%</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 py-0.5">
                            <span className="text-slate-500">Tryptophan ter:</span>
                            <span className="font-semibold">{ing.tryptophan ?? 0}%</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 py-0.5">
                            <span className="text-slate-500">Arginine ter:</span>
                            <span className="font-semibold">{ing.arginine ?? 0}%</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 py-0.5">
                            <span className="text-slate-500">Isoleucine ter:</span>
                            <span className="font-semibold">{ing.isoleucine ?? 0}%</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 py-0.5">
                            <span className="text-slate-500">Valine terc:</span>
                            <span className="font-semibold">{ing.valine ?? 0}%</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 py-0.5">
                            <span className="text-slate-500">Choline:</span>
                            <span className="font-semibold">{ing.choline ?? 0} mg</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Toggle Accordion Button */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(ing.id)}
                      className="text-[11px] text-[#006e2f] font-semibold flex items-center justify-center gap-1 py-1 hover:underline"
                    >
                      <span>{isExpanded ? 'Sembunyikan Spek' : 'Lihat 23 Parameter Nutrisi'}</span>
                      <span className="material-symbols-outlined text-[16px]">
                        {isExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-label-sm text-[10px] font-bold border ${CATEGORY_BADGE[ing.category]}`}>
                      {ing.category.charAt(0).toUpperCase() + ing.category.slice(1)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(ing)}
                        title="Edit Bahan"
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[#6d7b6c] hover:bg-[#eff4ff] hover:text-[#006e2f] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(ing)}
                        title="Hapus Bahan"
                        className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete_outline</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: TAMPILAN TABEL MATRIKS LENGKAP 23 KOLOM SESUAI CSV */}
      {viewMode === 'table' && (
        <div className="px-4 sm:px-6 lg:px-8 pb-8 flex-1">
          <div className="bg-white rounded-[22px] border border-[#e5e7eb] shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto phone-scrollbar">
              <table className="w-full border-collapse text-[12px] text-left">
                <thead>
                  <tr className="bg-[#eff4ff] border-b border-[#e6eeff]">
                    {/* Sticky column 1: Bahan Baku */}
                    <th className="p-3 sticky left-0 z-20 bg-[#eff4ff] font-bold text-[#121c2a] min-w-[200px] border-r border-[#e6eeff]">
                      BAHAN BAKU
                    </th>
                    <th className="p-3 font-semibold text-[#6d7b6c] min-w-[100px] text-center border-r border-[#e6eeff]">
                      Kategori
                    </th>
                    <th className="p-3 font-semibold text-[#6d7b6c] min-w-[110px] text-right border-r border-[#e6eeff]">
                      Harga/kg
                    </th>
                    <th className="p-3 font-semibold text-[#6d7b6c] min-w-[100px] text-right border-r border-[#e6eeff]">
                      Stok (kg)
                    </th>
                    {INGREDIENT_NUTRIENT_COLUMNS.map(col => (
                      <th
                        key={col.key}
                        className="p-3 font-semibold text-[#6d7b6c] min-w-[95px] text-right border-r border-[#e6eeff] whitespace-nowrap"
                        title={col.description}
                      >
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-[#121c2a]">{col.label}</span>
                          <span className="text-[10px] text-slate-400">({col.unit})</span>
                        </div>
                      </th>
                    ))}
                    <th className="p-3 font-semibold text-[#6d7b6c] min-w-[90px] text-center">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((ing, idx) => (
                    <tr
                      key={ing.id}
                      className={`hover:bg-[#eff4ff]/60 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#fafbfe]'
                      }`}
                    >
                      {/* Sticky 1: Bahan Baku */}
                      <td className="p-3 sticky left-0 z-10 bg-inherit border-r border-[#e6eeff] shadow-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-[10px] bg-[#7cf994]/20 flex items-center justify-center text-[#006e2f] shrink-0">
                            <span className="material-symbols-outlined text-[18px]">{ing.icon || 'grain'}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[13px] text-[#121c2a] truncate">{ing.name}</p>
                            <p className="text-[10px] text-[#6d7b6c] truncate">{ing.subname}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3 text-center border-r border-[#e6eeff]">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${CATEGORY_BADGE[ing.category]}`}>
                          {ing.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="p-3 text-right font-semibold text-[#121c2a] border-r border-[#e6eeff]">
                        Rp {ing.currentPrice.toLocaleString('id-ID')}
                      </td>

                      {/* Stock */}
                      <td className="p-3 text-right font-semibold text-[#006e2f] border-r border-[#e6eeff]">
                        {ing.inStockKg.toLocaleString('id-ID')}
                      </td>

                      {/* 22 Nutrient Parameters */}
                      {INGREDIENT_NUTRIENT_COLUMNS.map(col => {
                        const val = ing[col.key];
                        const isMain = col.key === 'energy' || col.key === 'protein' || col.key === 'calcium';
                        return (
                          <td
                            key={col.key}
                            className={`p-3 text-right border-r border-[#e6eeff] ${
                              isMain ? 'font-bold text-[#121c2a]' : 'text-slate-600'
                            }`}
                          >
                            {typeof val === 'number' ? val.toLocaleString('id-ID') : (val || '-')}
                          </td>
                        );
                      })}

                      {/* Action */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(ing)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[#6d7b6c] hover:bg-[#eff4ff] hover:text-[#006e2f]"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(ing)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50"
                            title="Hapus"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete_outline</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH & EDIT BAHAN BAKU DENGAN BANTUAN AI */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-t-[28px] sm:rounded-[24px] w-full max-w-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006e2f] text-[24px]">
                  {modalMode === 'create' ? 'add_box' : 'edit_square'}
                </span>
                <h3 className="font-headline-sm text-[16px] sm:text-[18px] text-[#121c2a] font-bold">
                  {modalMode === 'create' ? 'Tambah Bahan Baku Baru' : 'Edit Parameter Bahan Baku'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-[#eff4ff] hover:bg-[#e6eeff] flex items-center justify-center text-[#6d7b6c] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* AI Assistant Banner */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-[18px] p-3.5 border border-emerald-200 flex flex-col gap-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006e2f] text-[22px]">psychology</span>
                  <span className="font-bold text-[13px] text-[#006e2f]">
                    Bantuan AI Pengisi Nutrisi Otomatis
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAiAutoFill}
                  disabled={isAiLoading}
                  className="bg-[#006e2f] hover:bg-[#22c55e] active:scale-95 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isAiLoading ? 'progress_activity' : 'auto_awesome'}
                  </span>
                  <span>{isAiLoading ? 'Menganalisis Gizi...' : '✨ Isi Otomatis dengan AI'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Ketik nama bahan baku pakan di bawah (misal: <em>Bungkil Sawit</em>, <em>Tepung Maggot</em>, <em>Tepung Ikan</em>), lalu klik <strong>"✨ Isi Otomatis dengan AI"</strong> untuk mengisi 23 parameter nutrisi lab secara instan.
              </p>
              {aiMessage && (
                <div className="mt-1 p-2 rounded-xl bg-white/90 border border-emerald-300 text-[11px] text-[#006e2f] font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">check_circle</span>
                  <span>{aiMessage}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              {/* SECTION 1: IDENTITAS & HARGA */}
              <div className="flex flex-col gap-3 bg-white p-3.5 rounded-[16px] border border-slate-200">
                <span className="text-[11px] font-bold text-[#006e2f] uppercase tracking-wider">
                  1. Identitas &amp; Stok Bahan
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Nama Bahan Baku</label>
                    <input
                      type="text"
                      required
                      placeholder="Misal: Tepung Ikan Lokal Super"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-[10px] bg-[#eff4ff] border border-[#e6eeff] text-[13px] font-bold text-[#121c2a] focus:outline-none focus:border-[#22c55e]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Subname / Keterangan</label>
                    <input
                      type="text"
                      placeholder="Misal: Sumber Protein Hewani 55%"
                      value={formData.subname}
                      onChange={e => setFormData({ ...formData, subname: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-[10px] bg-[#eff4ff] border border-[#e6eeff] text-[13px] text-[#121c2a] focus:outline-none focus:border-[#22c55e]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Kategori</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full mt-1 px-3 py-2 rounded-[10px] bg-[#eff4ff] border border-[#e6eeff] text-[12px] font-semibold text-[#121c2a] focus:outline-none"
                    >
                      <option value="energi">Energi</option>
                      <option value="protein">Protein</option>
                      <option value="mineral">Mineral</option>
                      <option value="aditif">Aditif</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Harga Pasar (Rp/kg)</label>
                    <input
                      type="number"
                      required
                      value={formData.currentPrice}
                      onChange={e => setFormData({ ...formData, currentPrice: Number(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 rounded-[10px] bg-[#eff4ff] border border-[#e6eeff] text-[12px] font-bold text-[#121c2a]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Stok Gudang (kg)</label>
                    <input
                      type="number"
                      required
                      value={formData.inStockKg}
                      onChange={e => setFormData({ ...formData, inStockKg: Number(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 rounded-[10px] bg-[#eff4ff] border border-[#e6eeff] text-[12px] font-bold text-[#006e2f]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: NUTRISI MAKRO */}
              <div className="flex flex-col gap-3 bg-white p-3.5 rounded-[16px] border border-slate-200">
                <span className="text-[11px] font-bold text-[#006e2f] uppercase tracking-wider">
                  2. Parameter Nutrisi Makro (Laboratorium)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Energi Met (kkal)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.energy}
                      onChange={e => setFormData({ ...formData, energy: Number(e.target.value) })}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-[8px] bg-[#eff4ff] border border-[#e6eeff] text-[12px] font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Protein PK (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.protein}
                      onChange={e => setFormData({ ...formData, protein: Number(e.target.value) })}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-[8px] bg-[#eff4ff] border border-[#e6eeff] text-[12px] font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Lemak (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.fat ?? 0}
                      onChange={e => setFormData({ ...formData, fat: Number(e.target.value) })}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-[8px] bg-[#eff4ff] border border-[#e6eeff] text-[12px] font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Serat Kasar (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.fiber ?? 0}
                      onChange={e => setFormData({ ...formData, fiber: Number(e.target.value) })}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-[8px] bg-[#eff4ff] border border-[#e6eeff] text-[12px] font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Pati (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.pati ?? 0}
                      onChange={e => setFormData({ ...formData, pati: Number(e.target.value) })}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-[8px] bg-[#eff4ff] border border-[#e6eeff] text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Kadar Air (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.moisture ?? 0}
                      onChange={e => setFormData({ ...formData, moisture: Number(e.target.value) })}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-[8px] bg-[#eff4ff] border border-[#e6eeff] text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Bahan Kering (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.dryMatter ?? 0}
                      onChange={e => setFormData({ ...formData, dryMatter: Number(e.target.value) })}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-[8px] bg-[#eff4ff] border border-[#e6eeff] text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Abu (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.ash ?? 0}
                      onChange={e => setFormData({ ...formData, ash: Number(e.target.value) })}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-[8px] bg-[#eff4ff] border border-[#e6eeff] text-[12px]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: MINERAL & ELEKTROLIT */}
              <div className="flex flex-col gap-3 bg-white p-3.5 rounded-[16px] border border-slate-200">
                <span className="text-[11px] font-bold text-[#006e2f] uppercase tracking-wider">
                  3. Mineral &amp; Elektrolit
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Calcium (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.calcium}
                      onChange={e => setFormData({ ...formData, calcium: Number(e.target.value) })}
                      className="w-full mt-1 px-2 py-1.5 rounded-[8px] bg-[#eff4ff] border border-[#e6eeff] text-[12px] font-bold text-[#006e2f]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Phos Tot (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.phosphorus}
                      onChange={e => setFormData({ ...formData, phosphorus: Number(e.target.value) })}
                      className="w-full mt-1 px-2 py-1.5 rounded-[8px] bg-[#eff4ff] border border-[#e6eeff] text-[12px] font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Phos Av (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.phosAvailable ?? 0}
                      onChange={e => setFormData({ ...formData, phosAvailable: Number(e.target.value) })}
                      className="w-full mt-1 px-2 py-1.5 rounded-[8px] bg-[#eff4ff] border border-[#e6eeff] text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Na (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sodium ?? 0}
                      onChange={e => setFormData({ ...formData, sodium: Number(e.target.value) })}
                      className="w-full mt-1 px-2 py-1.5 rounded-[8px] bg-[#eff4ff] border border-[#e6eeff] text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Cl (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.chloride ?? 0}
                      onChange={e => setFormData({ ...formData, chloride: Number(e.target.value) })}
                      className="w-full mt-1 px-2 py-1.5 rounded-[8px] bg-[#eff4ff] border border-[#e6eeff] text-[12px]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: ASAM AMINO TERCERNA & CHOLINE */}
              <div className="flex flex-col gap-3 bg-white p-3.5 rounded-[16px] border border-slate-200">
                <span className="text-[11px] font-bold text-[#006e2f] uppercase tracking-wider">
                  4. Asam Amino Tercerna (%) &amp; Choline (mg/kg)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Lysine ter (%)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.lysine ?? 0}
                      onChange={e => setFormData({ ...formData, lysine: Number(e.target.value) })}
                      className="w-full mt-1 px-2 py-1.5 rounded-[8px] bg-[#eff4ff] border border-[#e6eeff] text-[12px] font-semibold text-purple-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Methionine ter (%)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.methionine ?? 0}
                      onChange={e => setFormData({ ...formData, methionine: Number(e.target.value) })}
                      className="w-full mt-1 px-2 py-1.5 rounded-[8px] bg-[#eff4ff] border border-[#e6eeff] text-[12px] font-semibold text-purple-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Met+Cys ter (%)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.metCys ?? 0}
                      onChange={e => setFormData({ ...formData, metCys: Number(e.target.value) })}
                      className="w-full mt-1 px-2 py-1.5 rounded-[8px] bg-[#eff4ff] border border-[#e6eeff] text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Threonine ter (%)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.threonine ?? 0}
                      onChange={e => setFormData({ ...formData, threonine: Number(e.target.value) })}
                      className="w-full mt-1 px-2 py-1.5 rounded-[8px] bg-[#eff4ff] border border-[#e6eeff] text-[12px]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Tryptophan ter (%)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.tryptophan ?? 0}
                      onChange={e => setFormData({ ...formData, tryptophan: Number(e.target.value) })}
                      className="w-full mt-1 px-2 py-1.5 rounded-[8px] bg-[#eff4ff] border border-[#e6eeff] text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Arginine ter (%)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.arginine ?? 0}
                      onChange={e => setFormData({ ...formData, arginine: Number(e.target.value) })}
                      className="w-full mt-1 px-2 py-1.5 rounded-[8px] bg-[#eff4ff] border border-[#e6eeff] text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Isoleucine ter (%)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.isoleucine ?? 0}
                      onChange={e => setFormData({ ...formData, isoleucine: Number(e.target.value) })}
                      className="w-full mt-1 px-2 py-1.5 rounded-[8px] bg-[#eff4ff] border border-[#e6eeff] text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Valine terc (%)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.valine ?? 0}
                      onChange={e => setFormData({ ...formData, valine: Number(e.target.value) })}
                      className="w-full mt-1 px-2 py-1.5 rounded-[8px] bg-[#eff4ff] border border-[#e6eeff] text-[12px]"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-500">Choline (mg/kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.choline ?? 0}
                      onChange={e => setFormData({ ...formData, choline: Number(e.target.value) })}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-[8px] bg-[#eff4ff] border border-[#e6eeff] text-[12px] font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-full bg-[#eff4ff] hover:bg-[#e6eeff] text-[#121c2a] font-bold text-[13px] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-full bg-[#22c55e] hover:bg-[#006e2f] text-white font-bold text-[13px] shadow-md transition-all active:scale-95"
                >
                  {modalMode === 'create' ? 'Simpan Bahan Baku' : 'Perbarui Bahan Baku'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

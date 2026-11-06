import React, { useState } from 'react';
import { PresetItem } from '../types';
import { INITIAL_PRESETS } from '../data/mockData';
import {
  BROILER_SPEK_COLUMNS,
  LAYER_SPEK_COLUMNS,
  NUTRIENT_ROWS,
  SPEK_CSV_PRESETS
} from '../data/spekTemplateData';

interface PresetNutrisiProps {
  presets?: PresetItem[];
  onSelectPreset: (preset: PresetItem) => void;
  onAddPreset?: (preset: Omit<PresetItem, 'id'>) => Promise<PresetItem>;
  onUpdatePreset?: (id: string, patch: Partial<PresetItem>) => Promise<PresetItem | undefined>;
  onDeletePreset?: (id: string) => void;
  onBack: () => void;
}

const AVAILABLE_ICONS = [
  { id: 'grain', label: 'Broiler / Biji' },
  { id: 'egg', label: 'Layer / Telur' },
  { id: 'star', label: 'Bintang' },
  { id: 'eco', label: 'Organik / Eco' },
  { id: 'science', label: 'Laboratorium' },
  { id: 'fitness_center', label: 'Bobot / Otot' },
];

const STANDARD_BADGES = [
  'Spek Resmi CSV',
  'Standar SNI',
  'Strain Resmi',
  'Custom Peternak',
  'Formula Riset',
  'Komersil Efisien'
];

export const PresetNutrisiScreen: React.FC<PresetNutrisiProps> = ({
  presets: externalPresets,
  onSelectPreset,
  onAddPreset,
  onUpdatePreset,
  onDeletePreset,
  onBack
}) => {
  const [localPresets, setLocalPresets] = useState<PresetItem[]>(INITIAL_PRESETS);
  const presets = externalPresets && externalPresets.length > 0 ? externalPresets : localPresets;

  // View Mode: 'cards' or 'table' (CSV Matrix Template)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [tableFilter, setTableFilter] = useState<'all' | 'broiler' | 'layer'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'broiler' | 'layer' | 'custom'>('all');

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [phase, setPhase] = useState('Broiler Finisher');
  const [category, setCategory] = useState<'broiler' | 'layer' | 'custom'>('broiler');
  const [standardBadge, setStandardBadge] = useState('Spek Resmi CSV');
  const [pk, setPk] = useState('19.0%');
  const [em, setEm] = useState('2.950 kkal');
  const [ca, setCa] = useState('0.80 - 1.00%');
  const [note, setNote] = useState('Standar Spek Nutrisi CSV');
  const [selectedIcon, setSelectedIcon] = useState('grain');

  const filteredPresets = presets.filter(p => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'broiler') return p.category === 'broiler';
    if (activeFilter === 'layer') return p.category === 'layer';
    if (activeFilter === 'custom') return p.category === 'custom' || p.isCustom;
    return true;
  });

  const countBroiler = presets.filter(p => p.category === 'broiler').length;
  const countLayer = presets.filter(p => p.category === 'layer').length;
  const countCustom = presets.filter(p => p.category === 'custom' || p.isCustom).length;

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setTitle('');
    setPhase('Broiler Finisher');
    setCategory('custom');
    setStandardBadge('Custom Peternak');
    setPk('19.5%');
    setEm('3.000 kkal');
    setCa('0.90%');
    setNote('Formula ransum kustom peternak');
    setSelectedIcon('star');
    setShowModal(true);
  };

  const openEditModal = (preset: PresetItem) => {
    setModalMode('edit');
    setEditingId(preset.id);
    setTitle(preset.title);
    setPhase(preset.phase);
    setCategory(preset.category);
    setStandardBadge(preset.standardBadge);
    setPk(preset.pk);
    setEm(preset.em);
    setCa(preset.ca);
    setNote(preset.note);
    setSelectedIcon(preset.icon || 'grain');
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (modalMode === 'create') {
      const newPresetData: Omit<PresetItem, 'id'> = {
        title: title.trim(),
        phase: phase.trim(),
        category,
        standardBadge,
        pk: pk.trim().endsWith('%') ? pk.trim() : `${pk.trim()}%`,
        em: em.trim().toLowerCase().includes('kkal') ? em.trim() : `${em.trim()} kkal`,
        ca: ca.trim().endsWith('%') ? ca.trim() : `${ca.trim()}%`,
        note: note.trim() || 'Preset nutrisi CluckFeed',
        icon: selectedIcon,
        isCustom: true
      };

      if (onAddPreset) {
        await onAddPreset(newPresetData);
      } else {
        const item: PresetItem = { ...newPresetData, id: 'p-' + Date.now() };
        setLocalPresets([item, ...localPresets]);
      }
    } else if (modalMode === 'edit' && editingId) {
      const updateData: Partial<PresetItem> = {
        title: title.trim(),
        phase: phase.trim(),
        category,
        standardBadge,
        pk: pk.trim().endsWith('%') ? pk.trim() : `${pk.trim()}%`,
        em: em.trim().toLowerCase().includes('kkal') ? em.trim() : `${em.trim()} kkal`,
        ca: ca.trim().endsWith('%') ? ca.trim() : `${ca.trim()}%`,
        note: note.trim() || 'Preset nutrisi CluckFeed',
        icon: selectedIcon
      };

      if (onUpdatePreset) {
        await onUpdatePreset(editingId, updateData);
      } else {
        setLocalPresets(localPresets.map(p => p.id === editingId ? { ...p, ...updateData } : p));
      }
    }

    setShowModal(false);
  };

  const handleDeletePreset = (preset: PresetItem) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus preset "${preset.title}"?`);
    if (!confirmDelete) return;

    if (onDeletePreset) {
      onDeletePreset(preset.id);
    } else {
      setLocalPresets(localPresets.filter(p => p.id !== preset.id));
    }
  };

  // Select from CSV Table column
  const handleSelectFromColumn = (colId: string) => {
    const foundPreset = SPEK_CSV_PRESETS.find(p => p.id === `p-${colId}`);
    if (foundPreset) {
      onSelectPreset(foundPreset);
    } else {
      // Fallback find by name/category
      const genericPreset = presets.find(p => p.id.includes(colId)) || presets[0];
      onSelectPreset(genericPreset);
    }
  };

  const displayColumns = [
    ...(tableFilter === 'all' || tableFilter === 'broiler' ? BROILER_SPEK_COLUMNS : []),
    ...(tableFilter === 'all' || tableFilter === 'layer' ? LAYER_SPEK_COLUMNS : []),
  ];

  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto phone-scrollbar pb-28 md:pb-12 flex flex-col overscroll-contain bg-[#f9fafb]">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-[#e6eeff] px-4 sm:px-6 lg:px-8 py-3.5 sticky top-0 z-30 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#eff4ff] hover:bg-[#e6eeff] flex items-center justify-center text-[#121c2a] transition-colors"
            title="Kembali ke Beranda"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline-sm text-[16px] sm:text-[18px] font-bold text-[#121c2a] leading-tight">
                Target & Preset Nutrisi
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold hidden sm:inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">verified</span>
                Template CSV Speck
              </span>
            </div>
            <p className="font-label-sm text-[11px] sm:text-[12px] text-[#6d7b6c]">
              Template Dasar Sesuai Standar Pakan Unggas Resmi ({presets.length} Formula)
            </p>
          </div>
        </div>

        {/* View Switcher Toggle & New Preset CTA */}
        <div className="flex items-center gap-2">
          <div className="bg-[#eff4ff] p-1 rounded-full border border-[#e6eeff] flex items-center">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-full text-[12px] font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-[#006e2f] text-white shadow-xs'
                  : 'text-[#6d7b6c] hover:text-[#121c2a]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">table_chart</span>
              <span className="hidden sm:inline">Tabel Template Spek</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-full text-[12px] font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'cards'
                  ? 'bg-[#006e2f] text-white shadow-xs'
                  : 'text-[#6d7b6c] hover:text-[#121c2a]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              <span className="hidden sm:inline">Kartu Preset</span>
            </button>
          </div>

          <button
            onClick={openCreateModal}
            className="bg-[#22c55e] hover:bg-[#006e2f] text-white font-label-md text-[12px] font-bold px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1 shadow-xs active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="hidden md:inline">Preset Baru</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: TABEL TEMPLATE MATRIKS SESUAI FILE CSV */}
      {viewMode === 'table' && (
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4">
          {/* Subheader & filter chips for table */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-[20px] border border-[#e5e7eb] shadow-xs">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006e2f] text-[20px]">description</span>
                <h2 className="font-headline-sm text-[15px] font-bold text-[#121c2a]">
                  Template Matriks Nutrisi Pakan (Speck CSV)
                </h2>
              </div>
              <p className="font-body-sm text-[12px] text-[#6d7b6c] mt-0.5">
                Kolom fase pertumbuhan, rentang umur, dan nilai parameter nutrisi lengkap. Klik <strong>"Pakai Formula"</strong> pada kolom mana pun untuk langsung meracik.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-[#eff4ff] p-1 rounded-full border border-[#e6eeff] shrink-0 self-stretch sm:self-auto justify-center">
              <button
                onClick={() => setTableFilter('all')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  tableFilter === 'all'
                    ? 'bg-[#22c55e] text-white shadow-xs'
                    : 'text-[#3d4a3d] hover:bg-[#e6eeff]'
                }`}
              >
                Semua (10 Kolom)
              </button>
              <button
                onClick={() => setTableFilter('broiler')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  tableFilter === 'broiler'
                    ? 'bg-[#22c55e] text-white shadow-xs'
                    : 'text-[#3d4a3d] hover:bg-[#e6eeff]'
                }`}
              >
                Ayam Pedaging (3 Fase)
              </button>
              <button
                onClick={() => setTableFilter('layer')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  tableFilter === 'layer'
                    ? 'bg-[#22c55e] text-white shadow-xs'
                    : 'text-[#3d4a3d] hover:bg-[#e6eeff]'
                }`}
              >
                Ayam Petelur (7 Fase)
              </button>
            </div>
          </div>

          {/* Interactive Matrix Table */}
          <div className="bg-white rounded-[22px] border border-[#e5e7eb] shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto phone-scrollbar">
              <table className="w-full border-collapse text-[12px] text-left">
                {/* Header 1: Jenis Ternak */}
                <thead>
                  <tr className="bg-[#eff4ff] border-b border-[#e6eeff]">
                    <th className="p-3 sticky left-0 z-20 bg-[#eff4ff] font-bold text-[#121c2a] min-w-[210px] border-r border-[#e6eeff]">
                      Parameter Nutrisi / Spek
                    </th>
                    {(tableFilter === 'all' || tableFilter === 'broiler') && (
                      <th
                        colSpan={BROILER_SPEK_COLUMNS.length}
                        className="p-3 text-center font-bold text-[#006e2f] bg-[#7cf994]/25 border-r border-[#e6eeff] uppercase tracking-wider text-[11px]"
                      >
                        🐔 AYAM PEDAGING (BROILER)
                      </th>
                    )}
                    {(tableFilter === 'all' || tableFilter === 'layer') && (
                      <th
                        colSpan={LAYER_SPEK_COLUMNS.length}
                        className="p-3 text-center font-bold text-amber-800 bg-amber-50 uppercase tracking-wider text-[11px]"
                      >
                        🥚 AYAM PETELUR (LAYER)
                      </th>
                    )}
                  </tr>

                  {/* Header 2: Rentang Umur */}
                  <tr className="bg-[#f8f9ff] border-b border-[#e6eeff]">
                    <th className="p-2.5 sticky left-0 z-20 bg-[#f8f9ff] font-semibold text-[#6d7b6c] border-r border-[#e6eeff] text-[11px]">
                      Rentang Umur Ternak
                    </th>
                    {displayColumns.map((col) => (
                      <th
                        key={col.id + '-age'}
                        className={`p-2.5 text-center font-bold text-[11px] whitespace-nowrap min-w-[125px] border-r border-[#e6eeff] ${
                          col.category === 'broiler' ? 'text-[#006e2f] bg-[#7cf994]/10' : 'text-amber-900 bg-amber-50/50'
                        }`}
                      >
                        {col.ageRange}
                      </th>
                    ))}
                  </tr>

                  {/* Header 3: Spesifikasi Pakan & Action Button */}
                  <tr className="bg-white border-b-2 border-slate-200">
                    <th className="p-3 sticky left-0 z-20 bg-white font-bold text-[#121c2a] border-r border-[#e6eeff]">
                      Spesifikasi Pakan
                    </th>
                    {displayColumns.map((col) => (
                      <th
                        key={col.id + '-name'}
                        className={`p-3 text-center font-bold text-[13px] border-r border-[#e6eeff] ${
                          col.category === 'broiler' ? 'text-[#121c2a] bg-emerald-50/30' : 'text-[#121c2a] bg-amber-50/30'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="font-extrabold">{col.name}</span>
                          <button
                            type="button"
                            onClick={() => handleSelectFromColumn(col.id)}
                            className="bg-[#22c55e] hover:bg-[#006e2f] text-white font-bold text-[10px] px-2.5 py-1 rounded-full transition-all shadow-xs active:scale-95 flex items-center gap-1"
                          >
                            <span>Pakai Formula</span>
                            <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Body Rows: Exactly the nutrient parameters from CSV */}
                <tbody className="divide-y divide-slate-100">
                  {NUTRIENT_ROWS.map((rowDef, idx) => {
                    const isKeyNutrient = ['em', 'pk', 'ca', 'pAvailable', 'lysine'].includes(rowDef.key);
                    return (
                      <tr
                        key={rowDef.key}
                        className={`hover:bg-[#eff4ff]/60 transition-colors ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-[#fafbfe]'
                        } ${isKeyNutrient ? 'font-medium' : ''}`}
                      >
                        {/* Sticky Left Column: Parameter Name */}
                        <td className="p-3 sticky left-0 z-10 bg-inherit border-r border-[#e6eeff] flex flex-col shadow-xs">
                          <span className={`text-[12px] font-bold ${isKeyNutrient ? 'text-[#006e2f]' : 'text-[#121c2a]'}`}>
                            {rowDef.label}
                          </span>
                          <span className="text-[10px] text-[#6d7b6c]">
                            {rowDef.unit} • {rowDef.description}
                          </span>
                        </td>

                        {/* Values for each phase column */}
                        {displayColumns.map((col) => {
                          const val = col[rowDef.key];
                          return (
                            <td
                              key={col.id + '-' + rowDef.key}
                              className={`p-3 text-center border-r border-[#e6eeff] text-[12px] ${
                                isKeyNutrient
                                  ? 'font-bold text-[#121c2a]'
                                  : 'text-[#3d4a3d]'
                              }`}
                            >
                              {val || '-'}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>

                {/* Bottom Row: Quick Action */}
                <tfoot>
                  <tr className="bg-[#eff4ff] border-t-2 border-slate-200">
                    <td className="p-3 sticky left-0 z-20 bg-[#eff4ff] font-bold text-[#121c2a] border-r border-[#e6eeff]">
                      Aksi Cepat Formulasi
                    </td>
                    {displayColumns.map((col) => (
                      <td key={col.id + '-footer'} className="p-2.5 text-center border-r border-[#e6eeff]">
                        <button
                          type="button"
                          onClick={() => handleSelectFromColumn(col.id)}
                          className="w-full bg-[#006e2f] hover:bg-[#22c55e] text-white font-bold text-[11px] py-1.5 px-2 rounded-xl transition-all shadow-xs active:scale-95"
                        >
                          Racik {col.name}
                        </button>
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: KARTU PRESET RESPONSIVE DENGAN FILTER & CRUD */}
      {viewMode === 'cards' && (
        <>
          {/* Filter Pill Chips */}
          <div className="w-full overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-8 pt-3 pb-3 flex gap-2 items-center bg-white border-b border-[#e6eeff]">
            <button
              onClick={() => setActiveFilter('all')}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full font-label-md text-[12px] transition-all shadow-xs flex items-center gap-1.5 ${
                activeFilter === 'all'
                  ? 'bg-[#22c55e] text-white font-bold'
                  : 'bg-[#eff4ff] text-[#3d4a3d] hover:bg-[#e6eeff]'
              }`}
            >
              <span>Semua Preset</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeFilter === 'all' ? 'bg-white/30 text-white' : 'bg-slate-200 text-[#3d4a3d]'}`}>
                {presets.length}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('broiler')}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full font-label-md text-[12px] transition-all flex items-center gap-1.5 ${
                activeFilter === 'broiler'
                  ? 'bg-[#22c55e] text-white font-bold shadow-xs'
                  : 'bg-[#eff4ff] text-[#3d4a3d] hover:bg-[#e6eeff]'
              }`}
            >
              <span>Ayam Broiler</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeFilter === 'broiler' ? 'bg-white/30 text-white' : 'bg-slate-200 text-[#3d4a3d]'}`}>
                {countBroiler}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('layer')}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full font-label-md text-[12px] transition-all flex items-center gap-1.5 ${
                activeFilter === 'layer'
                  ? 'bg-[#22c55e] text-white font-bold shadow-xs'
                  : 'bg-[#eff4ff] text-[#3d4a3d] hover:bg-[#e6eeff]'
              }`}
            >
              <span>Ayam Layer</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeFilter === 'layer' ? 'bg-white/30 text-white' : 'bg-slate-200 text-[#3d4a3d]'}`}>
                {countLayer}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('custom')}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full font-label-md text-[12px] transition-all flex items-center gap-1.5 ${
                activeFilter === 'custom'
                  ? 'bg-[#22c55e] text-white font-bold shadow-xs'
                  : 'bg-[#eff4ff] text-[#3d4a3d] hover:bg-[#e6eeff]'
              }`}
            >
              <span>Preset Kustom</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeFilter === 'custom' ? 'bg-white/30 text-white' : 'bg-slate-200 text-[#3d4a3d]'}`}>
                {countCustom}
              </span>
            </button>
          </div>

          {/* Presets Grid */}
          <div className="px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pb-6">
            {filteredPresets.length === 0 ? (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-[24px] border border-dashed border-[#d1d5db] p-8 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#6d7b6c] mb-3">
                  <span className="material-symbols-outlined text-[32px]">bookmarks</span>
                </div>
                <h3 className="font-headline-sm text-[16px] font-bold text-[#121c2a]">
                  Belum Ada Preset di Kategori Ini
                </h3>
                <p className="font-body-sm text-[12px] text-[#6d7b6c] max-w-sm mt-1 mb-4">
                  Anda belum menambahkan preset pada filter ini. Buat preset kustom sendiri dengan target nutrisi spesifik peternakan Anda.
                </p>
                <button
                  onClick={openCreateModal}
                  className="bg-[#22c55e] hover:bg-[#006e2f] text-white font-label-md text-[13px] font-bold px-5 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-xs active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Buat Preset Baru</span>
                </button>
              </div>
            ) : (
              filteredPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="bg-white rounded-[20px] p-4 shadow-xs border border-[#e5e7eb] relative flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-[#22c55e]/50"
                >
                  <div>
                    {/* Header row of card */}
                    <div className="flex items-start justify-between gap-2.5 mb-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 ${
                            preset.category === 'custom' || preset.isCustom
                              ? 'bg-[#ffddb8] text-[#855300]'
                              : preset.category === 'layer'
                              ? 'bg-amber-100/80 text-amber-800'
                              : 'bg-[#7cf994]/30 text-[#006e2f]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[26px]">
                            {preset.icon || (preset.category === 'layer' ? 'egg' : 'grain')}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-headline-sm text-[15px] font-bold text-[#121c2a] leading-tight truncate">
                            {preset.title}
                          </h3>
                          <div className="flex items-center flex-wrap gap-1.5 mt-1">
                            <span className="bg-[#eff4ff] text-[#3d4a3d] font-label-sm text-[10px] px-2 py-0.5 rounded-full font-medium truncate">
                              {preset.phase}
                            </span>
                            <span
                              className={`font-label-sm text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                preset.category === 'custom' || preset.isCustom
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-[#7cf994]/50 text-[#007230]'
                              }`}
                            >
                              {preset.standardBadge}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEditModal(preset)}
                          title="Edit Preset Nutrisi"
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[#6d7b6c] hover:bg-[#eff4ff] hover:text-[#006e2f] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeletePreset(preset)}
                          title="Hapus Preset"
                          className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete_outline</span>
                        </button>
                      </div>
                    </div>

                    {/* Nutrisi Matrix Summary */}
                    <div className="grid grid-cols-3 gap-2 mt-3 bg-[#eff4ff] p-2.5 rounded-[14px] border border-[#e6eeff]">
                      <div className="flex flex-col">
                        <span className="font-label-sm text-[10px] text-[#6d7b6c]">Protein (PK)</span>
                        <span className="font-label-lg text-[13px] font-bold text-[#121c2a] mt-0.5">{preset.pk}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-[10px] text-[#6d7b6c]">Energi (EM)</span>
                        <span className="font-label-lg text-[13px] font-bold text-[#121c2a] mt-0.5">{preset.em}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-[10px] text-[#6d7b6c]">Kalsium (Ca)</span>
                        <span className="font-label-lg text-[13px] font-bold text-[#006e2f] mt-0.5">{preset.ca}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action CTA */}
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 gap-2">
                    <span className="font-body-sm text-[11px] text-[#6d7b6c] flex items-center gap-1 truncate" title={preset.note}>
                      <span className="material-symbols-outlined text-[15px] text-[#006e2f] shrink-0">check_circle</span>
                      <span className="truncate">{preset.note}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => onSelectPreset(preset)}
                      className="bg-[#22c55e] hover:bg-[#006e2f] text-white font-label-md text-[12px] font-bold px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1 shadow-xs active:scale-95 shrink-0"
                    >
                      <span>Pakai Formula</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Info Banner Peternak */}
      <div className="px-4 sm:px-6 lg:px-8 mt-2">
        <div className="bg-[#eff4ff] rounded-[18px] p-4 flex items-center gap-3 border border-[#e6eeff] shadow-xs">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 text-[#006e2f] shadow-xs">
            <span className="material-symbols-outlined text-[22px]">lightbulb</span>
          </div>
          <p className="font-body-sm text-[12px] text-[#3d4a3d] leading-snug">
            Kadar nutrisi spek template pakan di atas tersimpan permanen di SQLite dan sinkron dengan CSV standar spek pakan unggas. Anda dapat memakai salah satu formula langsung atau menyesuaikannya dengan bahan gudang Anda.
          </p>
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-20 right-4 z-40">
        <button
          onClick={openCreateModal}
          aria-label="Tambah Preset Baru"
          className="h-14 px-5 rounded-full bg-[#22c55e] text-white shadow-lg hover:shadow-xl hover:bg-[#006e2f] active:scale-95 transition-all flex items-center gap-2 group"
        >
          <span className="material-symbols-outlined text-[26px]">add</span>
          <span className="font-label-lg text-[13px] pr-1 font-bold">Preset Baru</span>
        </button>
      </div>

      {/* Modal CRUD: Create & Edit Preset */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-t-[28px] sm:rounded-[24px] w-full max-w-lg p-5 sm:p-6 flex flex-col gap-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006e2f] text-[24px]">
                  {modalMode === 'create' ? 'add_box' : 'edit_square'}
                </span>
                <h3 className="font-headline-sm text-[16px] sm:text-[18px] text-[#121c2a] font-bold">
                  {modalMode === 'create' ? 'Buat Preset Nutrisi Baru' : 'Edit Preset Nutrisi'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-[#eff4ff] hover:bg-[#e6eeff] flex items-center justify-center text-[#6d7b6c] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-3.5">
              {/* Nama Preset */}
              <div>
                <label className="text-[11px] font-bold text-[#6d7b6c] uppercase">Nama Preset Formula</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Broiler Finisher Hemat Super"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 rounded-[12px] bg-[#eff4ff] border border-[#e6eeff] text-[#121c2a] text-[13px] font-medium focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              {/* Kategori Ternak & Fase */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#6d7b6c] uppercase">Jenis / Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as 'broiler' | 'layer' | 'custom')}
                    className="w-full mt-1 px-3 py-2.5 rounded-[12px] bg-[#eff4ff] border border-[#e6eeff] text-[#121c2a] text-[13px] font-medium focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="broiler">Ayam Broiler</option>
                    <option value="layer">Ayam Layer (Petelur)</option>
                    <option value="custom">Preset Kustom</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#6d7b6c] uppercase">Fase Pertumbuhan</label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: Finisher (29-Panen)"
                    value={phase}
                    onChange={(e) => setPhase(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 rounded-[12px] bg-[#eff4ff] border border-[#e6eeff] text-[#121c2a] text-[13px] font-medium focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              {/* Standar Mutu Badge */}
              <div>
                <label className="text-[11px] font-bold text-[#6d7b6c] uppercase">Standar Mutu / Label</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {STANDARD_BADGES.map((badge) => (
                    <button
                      key={badge}
                      type="button"
                      onClick={() => setStandardBadge(badge)}
                      className={`text-[11px] px-3 py-1 rounded-full font-bold transition-all ${
                        standardBadge === badge
                          ? 'bg-[#006e2f] text-white shadow-xs'
                          : 'bg-[#eff4ff] text-[#3d4a3d] hover:bg-[#e6eeff]'
                      }`}
                    >
                      {badge}
                    </button>
                  ))}
                </div>
              </div>

              {/* Matrix Nutrisi: PK, EM, Ca */}
              <div className="p-3 bg-[#eff4ff] rounded-[14px] border border-[#e6eeff]">
                <span className="text-[11px] font-bold text-[#006e2f] uppercase block mb-2">
                  Parameter Nutrisi Utama
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-[#6d7b6c]">Protein (PK)</label>
                    <input
                      type="text"
                      required
                      placeholder="19.0%"
                      value={pk}
                      onChange={(e) => setPk(e.target.value)}
                      className="w-full mt-1 px-2.5 py-2 rounded-[10px] bg-white border border-[#e6eeff] text-[#121c2a] text-[12px] font-bold text-center focus:outline-none focus:border-[#22c55e]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-[#6d7b6c]">Energi (EM)</label>
                    <input
                      type="text"
                      required
                      placeholder="2.950 kkal"
                      value={em}
                      onChange={(e) => setEm(e.target.value)}
                      className="w-full mt-1 px-2.5 py-2 rounded-[10px] bg-white border border-[#e6eeff] text-[#121c2a] text-[12px] font-bold text-center focus:outline-none focus:border-[#22c55e]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-[#6d7b6c]">Kalsium (Ca)</label>
                    <input
                      type="text"
                      required
                      placeholder="0.80 - 1.00%"
                      value={ca}
                      onChange={(e) => setCa(e.target.value)}
                      className="w-full mt-1 px-2.5 py-2 rounded-[10px] bg-white border border-[#e6eeff] text-[#121c2a] text-[12px] font-bold text-center focus:outline-none focus:border-[#22c55e]"
                    />
                  </div>
                </div>
              </div>

              {/* Catatan / Keterangan */}
              <div>
                <label className="text-[11px] font-bold text-[#6d7b6c] uppercase">Catatan / Rekomendasi</label>
                <input
                  type="text"
                  placeholder="Misal: Cocok untuk bobot panen cepat musim kemarau"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-[12px] bg-[#eff4ff] border border-[#e6eeff] text-[#121c2a] text-[12px] font-medium focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              {/* Pilihan Ikon */}
              <div>
                <label className="text-[11px] font-bold text-[#6d7b6c] uppercase block mb-1">Pilih Ikon</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_ICONS.map((ic) => (
                    <button
                      key={ic.id}
                      type="button"
                      onClick={() => setSelectedIcon(ic.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] border transition-all text-[11px] ${
                        selectedIcon === ic.id
                          ? 'border-[#006e2f] bg-[#7cf994]/20 text-[#006e2f] font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{ic.id}</span>
                      <span>{ic.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-2 pt-3 border-t border-slate-100">
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
                  {modalMode === 'create' ? 'Simpan Preset' : 'Perbarui Preset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { PresetItem } from '../types';
import { INITIAL_PRESETS } from '../data/mockData';

interface PresetNutrisiProps {
  onSelectPreset: (preset: PresetItem) => void;
  onBack: () => void;
}

export const PresetNutrisiScreen: React.FC<PresetNutrisiProps> = ({
  onSelectPreset,
  onBack
}) => {
  const [presets, setPresets] = useState<PresetItem[]>(INITIAL_PRESETS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'broiler' | 'layer' | 'custom'>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPhase, setNewPhase] = useState('Broiler Finisher');
  const [newLivestock, setNewLivestock] = useState<'broiler' | 'layer'>('broiler');
  const [newPK, setNewPK] = useState('19.5%');
  const [newEM, setNewEM] = useState('3.100 kkal');
  const [newCa, setNewCa] = useState('1.00%');

  const filteredPresets = presets.filter(p => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'broiler') return p.category === 'broiler';
    if (activeFilter === 'layer') return p.category === 'layer';
    if (activeFilter === 'custom') return p.category === 'custom';
    return true;
  });

  const handleCreatePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newPreset: PresetItem = {
      id: 'p-' + Date.now(),
      title: newTitle.trim(),
      phase: newPhase,
      category: 'custom',
      standardBadge: 'Custom Peternak',
      pk: newPK,
      em: newEM,
      ca: newCa,
      note: 'Dibuat khusus untuk kandang',
      icon: 'star',
      isCustom: true
    };

    setPresets([newPreset, ...presets]);
    setShowAddModal(false);
    setNewTitle('');
  };

  const handleDeletePreset = (id: string) => {
    setPresets(presets.filter(p => p.id !== id));
  };

  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto phone-scrollbar pb-28 flex flex-col overscroll-contain [&>*]:shrink-0">
      {/* Filter Pill Chips */}
      <div className="w-full overflow-x-auto no-scrollbar px-4 pt-3 pb-3 flex gap-2 items-center bg-white border-b border-[#e6eeff]">
        <button
          onClick={() => setActiveFilter('all')}
          className={`whitespace-nowrap px-4 py-2 rounded-full font-label-md text-[12px] transition-all shadow-xs ${
            activeFilter === 'all'
              ? 'bg-[#22c55e] text-white font-bold'
              : 'bg-[#eff4ff] text-[#3d4a3d] hover:bg-[#e6eeff]'
          }`}
        >
          Semua Preset
        </button>
        <button
          onClick={() => setActiveFilter('broiler')}
          className={`whitespace-nowrap px-4 py-2 rounded-full font-label-md text-[12px] transition-all ${
            activeFilter === 'broiler'
              ? 'bg-[#22c55e] text-white font-bold shadow-xs'
              : 'bg-[#eff4ff] text-[#3d4a3d] hover:bg-[#e6eeff]'
          }`}
        >
          Ayam Broiler
        </button>
        <button
          onClick={() => setActiveFilter('layer')}
          className={`whitespace-nowrap px-4 py-2 rounded-full font-label-md text-[12px] transition-all ${
            activeFilter === 'layer'
              ? 'bg-[#22c55e] text-white font-bold shadow-xs'
              : 'bg-[#eff4ff] text-[#3d4a3d] hover:bg-[#e6eeff]'
          }`}
        >
          Ayam Layer
        </button>
        <button
          onClick={() => setActiveFilter('custom')}
          className={`whitespace-nowrap px-4 py-2 rounded-full font-label-md text-[12px] transition-all ${
            activeFilter === 'custom'
              ? 'bg-[#22c55e] text-white font-bold shadow-xs'
              : 'bg-[#eff4ff] text-[#3d4a3d] hover:bg-[#e6eeff]'
          }`}
        >
          Preset Kustom Saya
        </button>
      </div>

      {/* Presets List */}
      <div className="px-4 flex flex-col gap-3.5 mt-3">
        {filteredPresets.map((preset) => (
          <div
            key={preset.id}
            className="bg-white rounded-[20px] p-4 shadow-xs border border-[#e5e7eb] relative overflow-hidden transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2.5 mb-2.5">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 ${
                    preset.category === 'custom' ? 'bg-[#ffddb8] text-[#855300]' : 'bg-[#7cf994]/30 text-[#006e2f]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[26px]">
                    {preset.icon}
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-[15px] font-bold text-[#121c2a] leading-tight">
                    {preset.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="bg-[#eff4ff] text-[#3d4a3d] font-label-sm text-[10px] px-2 py-0.5 rounded-full font-medium">
                      {preset.phase}
                    </span>
                    <span
                      className={`font-label-sm text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        preset.category === 'custom'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-[#7cf994]/50 text-[#007230]'
                      }`}
                    >
                      {preset.standardBadge}
                    </span>
                  </div>
                </div>
              </div>

              {preset.isCustom && (
                <button
                  onClick={() => handleDeletePreset(preset.id)}
                  aria-label="Hapus Preset"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">delete_outline</span>
                </button>
              )}
            </div>

            {/* Nutrisi Matrix Summary */}
            <div className="grid grid-cols-3 gap-2 mt-2 bg-[#eff4ff] p-2.5 rounded-[14px] border border-[#e6eeff]">
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

            {/* Quick Action CTA */}
            <div className="flex items-center justify-between mt-3 pt-1 border-t border-slate-100">
              <span className="font-body-sm text-[11px] text-[#6d7b6c] flex items-center gap-1 truncate">
                <span className="material-symbols-outlined text-[15px] text-[#006e2f]">check_circle</span>
                {preset.note}
              </span>

              <button
                type="button"
                onClick={() => onSelectPreset(preset)}
                className="bg-[#22c55e] hover:bg-[#006e2f] text-white font-label-md text-[12px] font-bold px-4 py-2 rounded-full transition-colors flex items-center gap-1 shadow-xs active:scale-95 shrink-0"
              >
                <span>Pakai Formula</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        ))}

        {/* Info Banner Peternak */}
        <div className="bg-[#eff4ff] rounded-[18px] p-4 flex items-center gap-3 border border-[#e6eeff] shadow-xs">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 text-[#006e2f] shadow-xs">
            <span className="material-symbols-outlined text-[22px]">lightbulb</span>
          </div>
          <p className="font-body-sm text-[12px] text-[#3d4a3d] leading-snug">
            Kadar nutrisi dapat disesuaikan otomatis dengan bahan pakan lokal yang Anda miliki di gudang.
          </p>
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setShowAddModal(true)}
          aria-label="Tambah Preset Baru"
          className="h-14 px-5 rounded-full bg-[#22c55e] text-white shadow-lg hover:shadow-xl hover:bg-[#006e2f] active:scale-95 transition-all flex items-center gap-2 group"
        >
          <span className="material-symbols-outlined text-[26px]">add</span>
          <span className="font-label-lg text-[13px] pr-1 font-bold">Preset Baru</span>
        </button>
      </div>

      {/* Add Preset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-t-[28px] sm:rounded-[24px] w-full max-w-md p-5 flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006e2f] text-[22px]">add_box</span>
                <h3 className="font-headline-sm text-[16px] text-[#121c2a] font-bold">Buat Preset Baru</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#6d7b6c]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePreset} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#6d7b6c] uppercase">Nama Preset</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Broiler Finisher Organik"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 rounded-[12px] bg-[#eff4ff] border border-[#e6eeff] text-[#121c2a] text-[13px] font-medium focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#6d7b6c] uppercase">Jenis Ternak</label>
                  <select
                    value={newLivestock}
                    onChange={(e) => setNewLivestock(e.target.value as 'broiler' | 'layer')}
                    className="w-full mt-1 px-3 py-2.5 rounded-[12px] bg-[#eff4ff] border border-[#e6eeff] text-[#121c2a] text-[13px] font-medium focus:outline-none"
                  >
                    <option value="broiler">Ayam Broiler</option>
                    <option value="layer">Ayam Layer</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#6d7b6c] uppercase">Fase Pertumbuhan</label>
                  <input
                    type="text"
                    value={newPhase}
                    onChange={(e) => setNewPhase(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 rounded-[12px] bg-[#eff4ff] border border-[#e6eeff] text-[#121c2a] text-[13px] font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#6d7b6c] uppercase">Protein (PK)</label>
                  <input
                    type="text"
                    value={newPK}
                    onChange={(e) => setNewPK(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-[10px] bg-[#eff4ff] border border-[#e6eeff] text-[#121c2a] text-[12px] font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#6d7b6c] uppercase">Energi (EM)</label>
                  <input
                    type="text"
                    value={newEM}
                    onChange={(e) => setNewEM(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-[10px] bg-[#eff4ff] border border-[#e6eeff] text-[#121c2a] text-[12px] font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#6d7b6c] uppercase">Kalsium (Ca)</label>
                  <input
                    type="text"
                    value={newCa}
                    onChange={(e) => setNewCa(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-[10px] bg-[#eff4ff] border border-[#e6eeff] text-[#121c2a] text-[12px] font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-full bg-[#eff4ff] text-[#121c2a] font-bold text-[13px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-full bg-[#22c55e] text-white font-bold text-[13px] hover:bg-[#006e2f] shadow-md"
                >
                  Simpan Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

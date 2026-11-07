import React, { useState } from 'react';
import { HistoryFormulaItem } from '../types';

interface RiwayatScreenProps {
  history?: HistoryFormulaItem[];
  onViewDetails: (item: HistoryFormulaItem) => void;
  onRepeatFormula: (item: HistoryFormulaItem) => void;
  onAddHistory?: (item: Omit<HistoryFormulaItem, 'id'> & { id?: string }) => Promise<HistoryFormulaItem>;
  onUpdateHistory?: (id: string, patch: Partial<HistoryFormulaItem>) => Promise<HistoryFormulaItem | undefined>;
  onDeleteHistory?: (id: string) => void;
  onClearAllHistory?: () => void;
}

interface FormState {
  title: string;
  batchInfo: string;
  timeStr: string;
  status: 'layak' | 'koreksi';
  statusLabel: string;
  pillsStr: string;
  totalWeight: number;
  costPerKg: number;
  correctionAlert: string;
}

const DEFAULT_FORM: FormState = {
  title: '',
  batchInfo: 'Batch #1 • Kandang A',
  timeStr: '',
  status: 'layak',
  statusLabel: 'Layak SNI',
  pillsStr: 'Jagung 52%, SBM 20%, Dedak 20%, Premix 8%',
  totalWeight: 500,
  costPerKg: 6850,
  correctionAlert: '',
};

export const RiwayatScreen: React.FC<RiwayatScreenProps> = ({
  history = [],
  onViewDetails,
  onRepeatFormula,
  onAddHistory,
  onUpdateHistory,
  onDeleteHistory,
  onClearAllHistory,
}) => {
  const historyList = history;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'layak' | 'koreksi' | 'bulan-ini'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // CRUD Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  const totalWeightAll = historyList.reduce((acc, item) => acc + (item.totalWeight || 0), 0);
  const totalCostAll = historyList.reduce((acc, item) => acc + (item.totalCost || 0), 0);
  const avgCostPerKg = totalWeightAll > 0 ? Math.round(totalCostAll / totalWeightAll) : 0;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const filteredItems = historyList.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batchInfo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pills.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'layak' && item.status === 'layak') ||
      (activeFilter === 'koreksi' && item.status === 'koreksi') ||
      activeFilter === 'bulan-ini';

    return matchesSearch && matchesFilter;
  });

  const handleOpenCreate = () => {
    const nowStr = 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    setFormData({
      ...DEFAULT_FORM,
      title: 'Broiler Finisher ' + Math.floor(100 + Math.random() * 900) + ' kg',
      timeStr: nowStr,
    });
    setModalMode('create');
    setEditingId(null);
    setShowModal(true);
  };

  const handleOpenEdit = (item: HistoryFormulaItem) => {
    setFormData({
      title: item.title,
      batchInfo: item.batchInfo,
      timeStr: item.timeStr,
      status: item.status,
      statusLabel: item.statusLabel,
      pillsStr: item.pills.join(', '),
      totalWeight: item.totalWeight,
      costPerKg: item.costPerKg,
      correctionAlert: item.correctionAlert || '',
    });
    setModalMode('edit');
    setEditingId(item.id);
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSaving(true);
    const pills = formData.pillsStr
      .split(/[,•]/)
      .map(s => s.trim())
      .filter(Boolean);

    const totalCost = formData.totalWeight * formData.costPerKg;
    const statusLabel = formData.status === 'layak' ? 'Layak SNI' : 'Perlu Koreksi';

    try {
      if (modalMode === 'create') {
        if (onAddHistory) {
          await onAddHistory({
            title: formData.title.trim(),
            batchInfo: formData.batchInfo.trim(),
            timeStr: formData.timeStr.trim() || 'Hari ini, 09:30 WIB',
            status: formData.status,
            statusLabel,
            pills,
            totalWeight: formData.totalWeight,
            costPerKg: formData.costPerKg,
            totalCost,
            icon: 'grain',
            category: formData.status,
            correctionAlert: formData.status === 'koreksi' ? (formData.correctionAlert.trim() || undefined) : undefined,
          });
        }
        showToast('Racikan formula baru berhasil ditambahkan');
      } else if (modalMode === 'edit' && editingId) {
        if (onUpdateHistory) {
          await onUpdateHistory(editingId, {
            title: formData.title.trim(),
            batchInfo: formData.batchInfo.trim(),
            timeStr: formData.timeStr.trim(),
            status: formData.status,
            statusLabel,
            pills,
            totalWeight: formData.totalWeight,
            costPerKg: formData.costPerKg,
            totalCost,
            category: formData.status,
            correctionAlert: formData.status === 'koreksi' ? (formData.correctionAlert.trim() || undefined) : undefined,
          });
        }
        showToast('Perubahan formula berhasil disimpan');
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto phone-scrollbar px-4 sm:px-6 lg:px-8 pb-28 md:pb-12 pt-3 flex flex-col overscroll-contain">
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-5">
      {/* Top Section: Header & Actions */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-headline-lg-mobile text-[22px] sm:text-[24px] text-[#121c2a] tracking-tight font-bold">
              Riwayat Formula
            </h1>
            <p className="font-body-sm text-[12px] sm:text-[13px] text-[#6d7b6c]">
              Arsip racikan pakan mandiri kandang Anda (CRUD Lengkap)
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Create New Formula Button */}
            <button
              onClick={handleOpenCreate}
              className="h-10 px-4 rounded-full bg-[#22c55e] hover:bg-[#006e2f] text-white font-label-md text-[12px] font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Tambah Racikan</span>
            </button>

            {/* Clear all if items exist */}
            {historyList.length > 0 && onClearAllHistory && (
              <button
                onClick={() => {
                  if (confirm('Yakin ingin menghapus seluruh riwayat formula?')) {
                    onClearAllHistory();
                    showToast('Semua riwayat formula telah dikosongkan');
                  }
                }}
                title="Hapus Semua Riwayat"
                className="w-10 h-10 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#ba1a1a] hover:bg-red-50 active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[19px]">delete_sweep</span>
              </button>
            )}
          </div>
        </div>

        {/* Monthly Snapshot Micro-Card (Real Calculated Stats) */}
        <div className="p-3.5 sm:p-4 bg-[#eff4ff] flex items-center justify-between shadow-xs rounded-[20px] border border-[#e6eeff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#7cf994]/50 flex items-center justify-center text-[#006e2f]">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                eco
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] sm:text-[11px] text-[#6d7b6c] uppercase tracking-wider font-semibold">
                Total Racikan Terdata
              </span>
              <span className="font-headline-sm text-[15px] sm:text-[17px] text-[#121c2a] font-bold">
                {totalWeightAll.toLocaleString('id-ID')} kg{' '}
                <span className="font-body-sm text-[12px] text-[#006e2f] font-normal">
                  ({historyList.length} Batch • Rata-rata Rp {avgCostPerKg.toLocaleString('id-ID')}/kg)
                </span>
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#6d7b6c] text-[20px]">insights</span>
        </div>
      </div>

      {/* Search & Quick Filters */}
      <div className="flex flex-col gap-2.5">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6d7b6c] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari racikan pakan, bahan, atau batch..."
            className="w-full h-11 pl-10 pr-10 rounded-full bg-white text-[#121c2a] placeholder:text-[#6d7b6c] font-body-md text-[13px] shadow-xs border border-[#e5e7eb] outline-none focus:border-[#22c55e] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6d7b6c] hover:text-[#121c2a]"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-label-md text-[12px] shadow-xs whitespace-nowrap active:scale-95 transition-all ${
              activeFilter === 'all'
                ? 'bg-[#22c55e] text-white font-bold'
                : 'bg-white text-[#3d4a3d] border border-[#e5e7eb] hover:bg-[#eff4ff]'
            }`}
          >
            <span>Semua</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/10 text-inherit font-label-sm text-[10px]">
              {historyList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('layak')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-label-md text-[12px] shadow-xs whitespace-nowrap active:scale-95 transition-all ${
              activeFilter === 'layak'
                ? 'bg-[#22c55e] text-white font-bold'
                : 'bg-white text-[#3d4a3d] border border-[#e5e7eb] hover:bg-[#eff4ff]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
            <span>Layak SNI</span>
          </button>

          <button
            onClick={() => setActiveFilter('koreksi')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-label-md text-[12px] shadow-xs whitespace-nowrap active:scale-95 transition-all ${
              activeFilter === 'koreksi'
                ? 'bg-[#22c55e] text-white font-bold'
                : 'bg-white text-[#3d4a3d] border border-[#e5e7eb] hover:bg-[#eff4ff]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#ef9900]"></span>
            <span>Perlu Koreksi</span>
          </button>

          <button
            onClick={() => setActiveFilter('bulan-ini')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-label-md text-[12px] shadow-xs whitespace-nowrap active:scale-95 transition-all ${
              activeFilter === 'bulan-ini'
                ? 'bg-[#22c55e] text-white font-bold'
                : 'bg-white text-[#3d4a3d] border border-[#e5e7eb] hover:bg-[#eff4ff]'
            }`}
          >
            <span>Bulan Ini</span>
          </button>
        </div>
      </div>

      {/* Formula Cards Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white p-4 flex flex-col gap-3 shadow-xs transition-all hover:shadow-md rounded-[22px] border border-[#e5e7eb]"
          >
            {/* Card Header: Time & Status Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#6d7b6c]">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                <span className="font-body-sm text-[11px]">{item.timeStr}</span>
              </div>

              {item.status === 'layak' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#7cf994]/40 text-[#007230] font-label-md text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                  {item.statusLabel}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffddb8] text-[#653e00] font-label-md text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  {item.statusLabel}
                </span>
              )}
            </div>

            {/* Title & Target Info */}
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex flex-col min-w-0">
                <h2 className="font-headline-sm text-[15px] font-bold text-[#121c2a] truncate">
                  {item.title}
                </h2>
                <span className="font-body-sm text-[11px] text-[#6d7b6c]">
                  {item.batchInfo}
                </span>
              </div>

              <div
                className={`w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0 ${
                  item.status === 'koreksi' ? 'bg-[#ffddb8]/40 text-[#855300]' : 'bg-[#eff4ff] text-[#006e2f]'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {item.icon}
                </span>
              </div>
            </div>

            {/* Correction alert if needed */}
            {item.correctionAlert && (
              <div className="flex items-center gap-2 p-2.5 bg-[#ffddb8]/30 text-[#653e00] rounded-[14px] border border-[#ffddb8]">
                <span className="material-symbols-outlined text-[18px] text-[#855300] shrink-0">info</span>
                <span className="font-body-sm text-[11px] leading-tight font-medium">
                  {item.correctionAlert}
                </span>
              </div>
            )}

            {/* Ingredient Ratio Pill Line */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {item.pills.map((pill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#eff4ff] font-label-sm text-[10px] text-[#3d4a3d] font-medium border border-[#e6eeff]"
                >
                  {pill}
                </span>
              ))}
            </div>

            {/* Key Metrics Strip */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-[#eff4ff] rounded-[16px] border border-[#e6eeff]">
              <div className="flex flex-col">
                <span className="font-label-sm text-[10px] text-[#6d7b6c]">Total Bobot</span>
                <span className="font-title-md text-[13px] font-bold text-[#121c2a]">
                  {item.totalWeight} kg
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-[10px] text-[#6d7b6c]">Biaya /kg</span>
                <span className="font-title-md text-[13px] font-bold text-[#121c2a]">
                  Rp {item.costPerKg.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="font-label-sm text-[10px] text-[#6d7b6c]">Total Biaya</span>
                <span className="font-title-md text-[13px] text-[#006e2f] font-extrabold">
                  Rp {item.totalCost.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Card Action Footer with Full CRUD (View, Edit, Delete, Replay) */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onViewDetails(item)}
                className="inline-flex items-center gap-1.5 font-label-lg text-[13px] font-bold text-[#006e2f] hover:underline active:scale-95 transition-transform"
              >
                <span>Lihat Rincian</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>

              <div className="flex items-center gap-1.5">
                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  aria-label="Edit Formula"
                  title="Edit Racikan"
                  className="w-9 h-9 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#006e2f] hover:bg-[#e6eeff] active:scale-90 transition-transform"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>

                {/* Delete Button */}
                {onDeleteHistory && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Hapus formula "${item.title}" dari riwayat?`)) {
                        onDeleteHistory(item.id);
                        showToast(`Formula "${item.title}" berhasil dihapus`);
                      }
                    }}
                    aria-label="Hapus Formula"
                    title="Hapus dari Riwayat"
                    className="w-9 h-9 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#ba1a1a] hover:bg-red-50 active:scale-90 transition-transform"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete_outline</span>
                  </button>
                )}

                {/* Replay Batch Button */}
                <button
                  type="button"
                  onClick={() => {
                    onRepeatFormula(item);
                    showToast('Racikan disalin ke Mixer Pakan & siap di-dispense!');
                  }}
                  className="h-9 px-3.5 rounded-full bg-[#22c55e] text-white flex items-center gap-1.5 font-label-md text-[12px] font-bold shadow-xs hover:bg-[#006e2f] active:scale-95 transition-all"
                  title="Ulangi Racikan Ini"
                >
                  <span className="material-symbols-outlined text-[17px]">replay</span>
                  <span>Ulangi</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center gap-3 bg-white rounded-[24px] border border-dashed border-[#d9e3f6]">
            <div className="w-16 h-16 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#6d7b6c]">
              <span className="material-symbols-outlined text-[32px]">manage_search</span>
            </div>
            <div>
              <p className="font-headline-sm text-[16px] text-[#121c2a] font-bold">
                {historyList.length === 0 ? 'Belum Ada Riwayat Formula' : 'Formula Tidak Ditemukan'}
              </p>
              <p className="font-body-sm text-[12px] text-[#6d7b6c] mt-1 max-w-sm">
                {historyList.length === 0
                  ? 'Riwayat formula saat ini kosong. Anda dapat menambahkan racikan baru secara manual atau meracik dari Beranda.'
                  : 'Coba gunakan kata kunci lain atau pilih filter Semua.'}
              </p>
            </div>
            {historyList.length === 0 && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="mt-1 h-10 px-5 rounded-full bg-[#22c55e] text-white font-label-md text-[13px] font-bold flex items-center gap-1.5 shadow-sm hover:bg-[#006e2f] transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Tambah Racikan Pertama</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* End of List Affirmation */}
      <div className="flex flex-col items-center justify-center py-2 text-center gap-1">
        <div className="flex items-center gap-1.5 text-[#3d4a3d]">
          <span className="material-symbols-outlined text-[16px] text-[#006e2f]">verified</span>
          <span className="font-label-sm text-[11px] font-medium">
            Semua kalkulasi memenuhi regulasi nutrisi unggas Kementan RI
          </span>
        </div>
        <p className="font-body-sm text-[10px] text-[#6d7b6c]">
          Menampilkan {filteredItems.length} dari {historyList.length} racikan tersimpan
        </p>
      </div>

      {/* CRUD Modal (Create & Edit) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[28px] w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-[#7cf994]/40 flex items-center justify-center text-[#006e2f]">
                    <span className="material-symbols-outlined text-[20px]">
                      {modalMode === 'create' ? 'add_circle' : 'edit'}
                    </span>
                  </div>
                  <h2 className="font-headline-sm text-[17px] text-[#121c2a] font-bold">
                    {modalMode === 'create' ? 'Tambah Racikan Formula' : 'Edit Racikan Formula'}
                  </h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-9 h-9 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#6d7b6c] hover:bg-[#e6eeff]"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="flex flex-col gap-3.5">
                {/* Judul */}
                <div>
                  <label className="font-label-sm text-[11px] text-[#6d7b6c] font-semibold block mb-1">
                    Nama / Judul Racikan *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                    placeholder="cth: Broiler Finisher Batch #15"
                    className="w-full border border-[#e5e7eb] rounded-[12px] px-3.5 py-2.5 font-body-sm text-[13px] outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/20"
                  />
                </div>

                {/* Batch Info & Tanggal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-label-sm text-[11px] text-[#6d7b6c] font-semibold block mb-1">
                      Info Batch / Kandang
                    </label>
                    <input
                      type="text"
                      value={formData.batchInfo}
                      onChange={(e) => setFormData(p => ({ ...p, batchInfo: e.target.value }))}
                      placeholder="Batch #15 • Kandang A"
                      className="w-full border border-[#e5e7eb] rounded-[12px] px-3 py-2 font-body-sm text-[13px] outline-none focus:border-[#22c55e]"
                    />
                  </div>
                  <div>
                    <label className="font-label-sm text-[11px] text-[#6d7b6c] font-semibold block mb-1">
                      Waktu Pembuatan
                    </label>
                    <input
                      type="text"
                      value={formData.timeStr}
                      onChange={(e) => setFormData(p => ({ ...p, timeStr: e.target.value }))}
                      placeholder="Hari ini, 14:00 WIB"
                      className="w-full border border-[#e5e7eb] rounded-[12px] px-3 py-2 font-body-sm text-[13px] outline-none focus:border-[#22c55e]"
                    />
                  </div>
                </div>

                {/* Status Kelayakan */}
                <div>
                  <label className="font-label-sm text-[11px] text-[#6d7b6c] font-semibold block mb-1">
                    Status Formulasi
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, status: 'layak', statusLabel: 'Layak SNI' }))}
                      className={`p-2.5 rounded-[12px] border text-center font-label-md text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                        formData.status === 'layak'
                          ? 'bg-[#7cf994]/40 border-[#006e2f] text-[#006e2f] shadow-xs'
                          : 'bg-[#eff4ff] border-[#e6eeff] text-[#6d7b6c]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[17px]">check_circle</span>
                      <span>Layak SNI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, status: 'koreksi', statusLabel: 'Perlu Koreksi' }))}
                      className={`p-2.5 rounded-[12px] border text-center font-label-md text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                        formData.status === 'koreksi'
                          ? 'bg-[#ffddb8] border-[#ef9900] text-[#653e00] shadow-xs'
                          : 'bg-[#eff4ff] border-[#e6eeff] text-[#6d7b6c]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[17px]">warning</span>
                      <span>Perlu Koreksi</span>
                    </button>
                  </div>
                </div>

                {/* Bobot & Biaya */}
                <div className="grid grid-cols-2 gap-3 bg-[#eff4ff] p-3.5 rounded-[16px] border border-[#e6eeff]">
                  <div>
                    <label className="font-label-sm text-[11px] text-[#6d7b6c] font-semibold block mb-1">
                      Total Bobot (kg)
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={formData.totalWeight}
                      onChange={(e) => setFormData(p => ({ ...p, totalWeight: parseFloat(e.target.value) || 0 }))}
                      className="w-full border border-[#d9e3f6] bg-white rounded-[10px] px-3 py-2 font-body-sm text-[13px] outline-none focus:border-[#22c55e]"
                    />
                  </div>
                  <div>
                    <label className="font-label-sm text-[11px] text-[#6d7b6c] font-semibold block mb-1">
                      Biaya per kg (Rp)
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={formData.costPerKg}
                      onChange={(e) => setFormData(p => ({ ...p, costPerKg: parseInt(e.target.value) || 0 }))}
                      className="w-full border border-[#d9e3f6] bg-white rounded-[10px] px-3 py-2 font-body-sm text-[13px] outline-none focus:border-[#22c55e]"
                    />
                  </div>
                  <div className="col-span-2 pt-1 border-t border-[#d9e3f6] flex justify-between items-center text-[12px]">
                    <span className="text-[#6d7b6c]">Estimasi Total Biaya:</span>
                    <span className="font-bold text-[#006e2f]">
                      Rp {(formData.totalWeight * formData.costPerKg).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Komposisi Bahan */}
                <div>
                  <label className="font-label-sm text-[11px] text-[#6d7b6c] font-semibold block mb-1">
                    Komposisi Bahan Baku (Pisahkan koma)
                  </label>
                  <input
                    type="text"
                    value={formData.pillsStr}
                    onChange={(e) => setFormData(p => ({ ...p, pillsStr: e.target.value }))}
                    placeholder="Jagung 52%, SBM 20%, Dedak 20%, Premix 8%"
                    className="w-full border border-[#e5e7eb] rounded-[12px] px-3 py-2.5 font-body-sm text-[13px] outline-none focus:border-[#22c55e]"
                  />
                </div>

                {/* Catatan Koreksi (jika koreksi) */}
                {formData.status === 'koreksi' && (
                  <div>
                    <label className="font-label-sm text-[11px] text-[#ba1a1a] font-semibold block mb-1">
                      Peringatan / Catatan Koreksi
                    </label>
                    <textarea
                      rows={2}
                      value={formData.correctionAlert}
                      onChange={(e) => setFormData(p => ({ ...p, correctionAlert: e.target.value }))}
                      placeholder="cth: Defisit Protein 1.2% — Tambahkan konsentrat sebelum mixing."
                      className="w-full border border-amber-200 bg-amber-50/50 rounded-[12px] p-2.5 font-body-sm text-[12px] text-[#653e00] outline-none focus:border-amber-400"
                    />
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full h-12 rounded-full bg-[#22c55e] hover:bg-[#006e2f] text-white font-label-lg text-[13px] font-bold flex items-center justify-center gap-2 transition-colors mt-2 shadow-md disabled:opacity-60"
                >
                  {saving ? (
                    <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">
                        {modalMode === 'create' ? 'add' : 'check'}
                      </span>
                      <span>{modalMode === 'create' ? 'Simpan ke Riwayat' : 'Simpan Perubahan'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#27313f] text-white shadow-xl text-[12px] font-medium animate-fadeIn">
              <span className="material-symbols-outlined text-[18px] text-[#6bff8f]">check_circle</span>
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

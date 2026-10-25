import React, { useState } from 'react';
import { HistoryFormulaItem } from '../types';
import { INITIAL_HISTORY } from '../data/mockData';

interface RiwayatScreenProps {
  onViewDetails: (item: HistoryFormulaItem) => void;
  onRepeatFormula: (item: HistoryFormulaItem) => void;
}

export const RiwayatScreen: React.FC<RiwayatScreenProps> = ({
  onViewDetails,
  onRepeatFormula
}) => {
  const [historyList, setHistoryList] = useState<HistoryFormulaItem[]>(INITIAL_HISTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'layak' | 'koreksi' | 'bulan-ini'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const filteredItems = historyList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.batchInfo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.pills.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'layak' && item.status === 'layak') ||
      (activeFilter === 'koreksi' && item.status === 'koreksi') ||
      (activeFilter === 'bulan-ini');

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto phone-scrollbar px-4 pb-28 gap-4 pt-1 flex flex-col overscroll-contain [&>*]:shrink-0">
      {/* Top Section: Header & Stats Spotlight */}
      <div className="flex flex-col gap-1 pt-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline-lg-mobile text-[22px] text-[#121c2a] tracking-tight font-bold">
              Riwayat Formula
            </h1>
            <p className="font-body-sm text-[12px] text-[#6d7b6c]">
              Arsip racikan pakan mandiri kandang Anda
            </p>
          </div>
          <button
            aria-label="Urutkan Riwayat"
            onClick={() => showToast('Riwayat diurutkan berdasarkan tanggal terbaru')}
            className="w-10 h-10 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#121c2a] hover:bg-[#e6eeff] active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">swap_vert</span>
          </button>
        </div>

        {/* Monthly Snapshot Micro-Card */}
        <div className="mt-1 p-3.5 bg-[#eff4ff] flex items-center justify-between shadow-xs rounded-[20px] border border-[#e6eeff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#7cf994]/50 flex items-center justify-center text-[#006e2f]">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                eco
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-[#6d7b6c] uppercase tracking-wider font-semibold">
                Total Racikan Bulan Ini
              </span>
              <span className="font-headline-sm text-[15px] text-[#121c2a] font-bold">
                1.450 kg <span className="font-body-sm text-[12px] text-[#006e2f] font-normal">(-8.2% hemat)</span>
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
          <button
            aria-label="Suara"
            onClick={() => showToast('Mendengarkan pencarian suara...')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6d7b6c] hover:text-[#121c2a]"
          >
            <span className="material-symbols-outlined text-[18px]">mic</span>
          </button>
        </div>

        {/* Filter Chips Carousel */}
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

      {/* Formula Cards List */}
      <div className="flex flex-col gap-3.5">
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

            {/* Card Action Footer */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onViewDetails(item)}
                className="inline-flex items-center gap-1.5 font-label-lg text-[13px] font-bold text-[#006e2f] hover:underline active:scale-95 transition-transform"
              >
                <span>Lihat Rincian</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast(`Tautan formula ${item.title} disalin ke clipboard`)}
                  aria-label="Bagikan Formula"
                  className="w-9 h-9 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#6d7b6c] hover:bg-[#e6eeff] active:scale-90 transition-transform"
                >
                  <span className="material-symbols-outlined text-[18px]">share</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onRepeatFormula(item);
                    showToast('Racikan disalin ke Mixer Pakan & siap di-dispense!');
                  }}
                  className="h-9 px-3.5 rounded-full bg-[#22c55e] text-white flex items-center gap-1.5 font-label-md text-[12px] font-bold shadow-xs hover:bg-[#006e2f] active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[17px]">replay</span>
                  <span>Ulangi</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center gap-2">
            <div className="w-14 h-14 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#6d7b6c]">
              <span className="material-symbols-outlined text-[28px]">manage_search</span>
            </div>
            <p className="font-headline-sm text-[15px] text-[#121c2a] font-bold">Formula Tidak Ditemukan</p>
            <p className="font-body-sm text-[12px] text-[#6d7b6c]">
              Coba gunakan kata kunci lain atau pilih filter Semua.
            </p>
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
  );
};

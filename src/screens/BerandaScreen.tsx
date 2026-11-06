import React from 'react';
import type { HistoryFormulaItem, PresetItem } from '../types';
import type { FarmConfig, KandangItem, SensorData, FeedScheduleItem } from '../api/farm';
import { INITIAL_PRESETS } from '../data/mockData';

interface BerandaScreenProps {
  farmConfig?: FarmConfig;
  kandang?: KandangItem[];
  sensor?: SensorData;
  schedule?: FeedScheduleItem[];
  history?: HistoryFormulaItem[];
  presets?: PresetItem[];
  onSelectPreset?: (preset: PresetItem) => void;
  onRepeatFormula?: (item: HistoryFormulaItem) => void;
  onDeleteHistory?: (id: string) => void;
  onStartFormulation: () => void;
  onOpenIngredients: () => void;
  onOpenPrices: () => void;
  onOpenMarketPriceModal?: () => void;
  onOpenTargets: () => void;
  onOpenDispense: () => void;
  onOpenStock: () => void;
  onOpenHistory: () => void;
  onOpenAssistant: () => void;
  onViewLastFormula: (item?: HistoryFormulaItem) => void;
}

export const BerandaScreen: React.FC<BerandaScreenProps> = ({
  farmConfig,
  kandang,
  sensor,
  schedule,
  history,
  presets,
  onSelectPreset,
  onRepeatFormula,
  onDeleteHistory,
  onStartFormulation,
  onOpenIngredients,
  onOpenPrices,
  onOpenMarketPriceModal,
  onOpenTargets,
  onOpenDispense,
  onOpenStock,
  onOpenHistory,
  onOpenAssistant,
  onViewLastFormula
}) => {
  const lastFormula: HistoryFormulaItem | null = history && history.length > 0 ? history[0] : null;
  const presetsList = presets && presets.length > 0 ? presets : INITIAL_PRESETS;

  const defaultKandang: KandangItem[] = [
    { id: 'kandang-a', nama: 'Kandang A', fase: 'Fase Finisher', populasi: 2500, umurHari: 32, bobotRataKg: 1.85 },
    { id: 'kandang-b', nama: 'Kandang B', fase: 'Fase Grower', populasi: 1800, umurHari: 14, bobotRataKg: 0.52 }
  ];
  const activeKandang = kandang && kandang.length > 0 ? kandang : defaultKandang;
  const totalPopulasi = activeKandang.reduce((sum, k) => sum + k.populasi, 0);

  const defaultSchedule: FeedScheduleItem[] = [
    { id: 1, jam: '07:00', label: 'Pemberian Pagi (Kandang A & B)', porsiKg: 150, status: 'selesai', notes: 'Porsi 150 kg Broiler Finisher' },
    { id: 2, jam: '12:00', label: 'Pemberian Siang', porsiKg: 150, status: 'selesai', notes: 'Porsi 150 kg + Elektrolit Air Minum' },
    { id: 3, jam: '16:30', label: 'Pemberian Sore', porsiKg: 200, status: 'standby', notes: 'Porsi 200 kg Menjelang Istirahat' }
  ];
  const activeSchedule = schedule && schedule.length > 0 ? schedule : defaultSchedule;

  const ownerName = farmConfig?.owner_name || 'Pak Budi';
  const farmLocation = farmConfig?.farm_location || 'Blitar';
  const farmName = farmConfig?.farm_name || 'Peternakan Berkah Sejahtera';
  const iotStatus = farmConfig?.iot_status || 'terhubung';

  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto phone-scrollbar px-4 sm:px-6 lg:px-8 pb-24 md:pb-12 gap-6 pt-3 flex flex-col overscroll-contain">
      {/* 1. Top Greeting & IoT Hardware Status */}
      <section className="shrink-0 flex items-center justify-between pt-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h1 className="font-headline-md text-[21px] sm:text-[24px] text-[#121c2a] tracking-tight font-extrabold">
              Halo, {ownerName}
            </h1>
            <span className="text-xl sm:text-2xl select-none">👋</span>
          </div>
          <p className="font-body-sm text-[12px] sm:text-[13px] text-[#3d4a3d] flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[15px] text-[#006e2f]">location_on</span>
            {farmName}, {farmLocation}
          </p>
        </div>

        {/* IoT Status Pill */}
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#7cf994]/30 text-[#007230] shadow-xs border border-[#7cf994]/60">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]"></span>
          </span>
          <span className="font-label-sm text-[11px] sm:text-[12px] font-bold tracking-wide flex items-center gap-1 capitalize">
            <span className="material-symbols-outlined text-[14px]">sensors</span>
            {iotStatus}
          </span>
        </div>
      </section>

      {/* Main Responsive Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Primary Column (Hero, Menu Utama, Formula Terakhir, Kandang) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          {/* 2. Hero Card: Formula Pakan (GoPay/Gojek Tactile Gradient) */}
          <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#22c55e] via-[#006e2f] to-[#004b1e] p-5 sm:p-6 lg:p-7 text-white shadow-md min-h-[210px] flex flex-col justify-between">
            {/* Abstract Geometric Farm Watermark Pattern */}
            <div className="absolute -right-6 -bottom-8 w-44 sm:w-56 h-44 sm:h-56 opacity-15 pointer-events-none select-none text-white">
              <svg className="w-full h-full" fill="currentColor" viewBox="0 0 100 100">
                <path d="M50 15 C30 15 20 35 20 50 C20 70 35 85 50 85 C65 85 80 70 80 50 C80 35 70 15 50 15 Z M50 25 C60 25 70 35 70 48 C60 52 45 42 35 55 C32 40 40 25 50 25 Z"></path>
                <circle cx="68" cy="38" r="4"></circle>
                <path d="M58 20 C62 10 74 12 70 24" fill="none" stroke="currentColor" strokeWidth="2"></path>
                <path d="M78 46 L90 44 L80 54 Z"></path>
              </svg>
            </div>

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="font-label-sm text-[11px] uppercase tracking-wider text-[#d4ffe0] bg-[#004b1e]/40 px-2.5 py-1 rounded-full border border-white/10 font-bold backdrop-blur-xs">
                  Sistem Optimasi Ransum SNI
                </span>
                <h2 className="font-headline-lg-mobile text-[22px] sm:text-[26px] font-extrabold mt-2 leading-tight">
                  Formulasi Presisi Pakan Unggas
                </h2>
                <p className="font-body-sm text-[12px] sm:text-[13px] text-white/80 mt-1 max-w-sm">
                  Kalkulasi biaya termurah berbasis Linear Programming dengan nutrisi SNI 2024.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <span className="material-symbols-outlined text-[28px] text-[#7cf994]">science</span>
                </div>
              </div>
            </div>

            {/* Quick Action Dock Inside Hero Card */}
            <div className="relative z-10 mt-5 pt-4 border-t border-white/15 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-white/90 font-label-md text-[12px]">
                <span className="material-symbols-outlined text-[18px] text-[#7cf994]">verified</span>
                <span>Standar Broiler &amp; Layer</span>
              </div>

              <button
                onClick={onStartFormulation}
                className="px-5 py-2.5 rounded-full bg-[#7cf994] text-[#004b1e] font-label-lg text-[13px] font-extrabold flex items-center gap-1.5 shadow-md hover:bg-white hover:scale-105 active:scale-95 transition-all"
              >
                <span>Mulai Racik Formula</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </section>

          {/* 3. Menu Utama 7 Grid (Responsive: 4 cols mobile, 7 cols desktop) */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-0.5">
              <h3 className="font-headline-sm text-[16px] text-[#121c2a] font-bold">Fitur Utama</h3>
              <span className="font-label-sm text-[11px] text-[#006e2f] font-semibold">Semua Alat Lengkap</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-y-4 gap-x-2.5 sm:gap-x-3">
              {/* 1. Harga Pasar (Input Harga Pakan Jadi) */}
              <button
                onClick={onOpenMarketPriceModal || onOpenPrices}
                className="flex flex-col items-center gap-1.5 text-center group active:scale-95 transition-transform"
                title="Input Harga Pasar Pakan Jadi Komersil"
              >
                <div className="w-14 h-14 rounded-[20px] bg-[#7cf994]/30 flex items-center justify-center text-[#006e2f] group-hover:bg-[#7cf994]/50 group-hover:scale-105 transition-all shadow-xs border border-[#7cf994]/40">
                  <span className="material-symbols-outlined text-[28px]">storefront</span>
                </div>
                <span className="font-label-md text-[12px] text-[#121c2a] font-semibold truncate w-full">Harga Pasar</span>
              </button>

              {/* 2. Target */}
              <button
                onClick={onOpenTargets}
                className="flex flex-col items-center gap-1.5 text-center group active:scale-95 transition-transform"
              >
                <div className="w-14 h-14 rounded-[20px] bg-[#7cf994]/30 flex items-center justify-center text-[#006e2f] group-hover:bg-[#7cf994]/50 group-hover:scale-105 transition-all shadow-xs border border-[#7cf994]/40">
                  <span className="material-symbols-outlined text-[28px]">adjust</span>
                </div>
                <span className="font-label-md text-[12px] text-[#121c2a] font-semibold truncate w-full">Target</span>
              </button>

              {/* 3. Formula */}
              <button
                onClick={onStartFormulation}
                className="flex flex-col items-center gap-1.5 text-center group active:scale-95 transition-transform"
              >
                <div className="w-14 h-14 rounded-[20px] bg-[#7cf994]/30 flex items-center justify-center text-[#006e2f] group-hover:bg-[#7cf994]/50 group-hover:scale-105 transition-all shadow-xs border border-[#7cf994]/40">
                  <span className="material-symbols-outlined text-[28px]">calculate</span>
                </div>
                <span className="font-label-md text-[12px] text-[#121c2a] font-semibold truncate w-full">Formula</span>
              </button>

              {/* 4. Dispense */}
              <button
                onClick={onOpenDispense}
                className="flex flex-col items-center gap-1.5 text-center group active:scale-95 transition-transform"
              >
                <div className="w-14 h-14 rounded-[20px] bg-[#7cf994]/30 flex items-center justify-center text-[#006e2f] group-hover:bg-[#7cf994]/50 group-hover:scale-105 transition-all shadow-xs border border-[#7cf994]/40">
                  <span className="material-symbols-outlined text-[28px]">tune</span>
                </div>
                <span className="font-label-md text-[12px] text-[#121c2a] font-semibold truncate w-full">Dispense</span>
              </button>

              {/* 5. Stok */}
              <button
                onClick={onOpenStock}
                className="flex flex-col items-center gap-1.5 text-center group active:scale-95 transition-transform"
              >
                <div className="w-14 h-14 rounded-[20px] bg-[#7cf994]/30 flex items-center justify-center text-[#006e2f] group-hover:bg-[#7cf994]/50 group-hover:scale-105 transition-all shadow-xs border border-[#7cf994]/40">
                  <span className="material-symbols-outlined text-[28px]">inventory_2</span>
                </div>
                <span className="font-label-md text-[12px] text-[#121c2a] font-semibold truncate w-full">Stok</span>
              </button>

              {/* 6. Riwayat */}
              <button
                onClick={onOpenHistory}
                className="flex flex-col items-center gap-1.5 text-center group active:scale-95 transition-transform"
              >
                <div className="w-14 h-14 rounded-[20px] bg-[#7cf994]/30 flex items-center justify-center text-[#006e2f] group-hover:bg-[#7cf994]/50 group-hover:scale-105 transition-all shadow-xs border border-[#7cf994]/40">
                  <span className="material-symbols-outlined text-[28px]">history</span>
                </div>
                <span className="font-label-md text-[12px] text-[#121c2a] font-semibold truncate w-full">Riwayat</span>
              </button>

              {/* 7. Asisten AI */}
              <button
                onClick={onOpenAssistant}
                className="flex flex-col items-center gap-1.5 text-center group active:scale-95 transition-transform"
              >
                <div className="relative w-14 h-14 rounded-[20px] bg-[#7cf994]/30 flex items-center justify-center text-[#006e2f] group-hover:bg-[#7cf994]/50 group-hover:scale-105 transition-all shadow-xs border border-[#7cf994]/40">
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    psychology
                  </span>
                  <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ef9900]"></span>
                  </span>
                </div>
                <span className="font-label-md text-[12px] text-[#121c2a] font-semibold truncate w-full">Asisten AI</span>
              </button>
            </div>
          </section>

          {/* 4. Formula Terakhir Card Section (Truly dynamic from history[0]) */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#006e2f] text-[20px]">science</span>
                <h3 className="font-headline-sm text-[16px] text-[#121c2a] font-bold">Formula Terakhir</h3>
              </div>
              <button
                onClick={onOpenHistory}
                className="font-label-sm text-[12px] text-[#006e2f] font-bold hover:underline"
              >
                Lihat Semua ({history?.length || 0})
              </button>
            </div>

            {/* Dynamic Content Card or Empty State */}
            {lastFormula ? (
              <div className="rounded-[24px] bg-white p-4 sm:p-5 shadow-xs border border-[#e5e7eb] flex flex-col gap-4">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-title-md text-[16px] text-[#121c2a] font-bold truncate">
                        {lastFormula.title}
                      </h4>
                      {lastFormula.status === 'layak' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#7cf994]/50 text-[#007230] font-label-sm text-[11px] font-bold flex items-center gap-0.5 border border-[#7cf994]">
                          <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          {lastFormula.statusLabel || 'Layak'}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-label-sm text-[11px] font-bold flex items-center gap-0.5 border border-amber-300">
                          <span className="material-symbols-outlined text-[13px]">warning</span>
                          {lastFormula.statusLabel || 'Perlu Koreksi'}
                        </span>
                      )}
                    </div>
                    <p className="font-body-sm text-[12px] text-[#6d7b6c] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      Dibuat: {lastFormula.timeStr} • {lastFormula.batchInfo}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {onDeleteHistory && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus formula "${lastFormula.title}" dari riwayat?`)) {
                            onDeleteHistory(lastFormula.id);
                          }
                        }}
                        title="Hapus Formula Ini"
                        className="w-9 h-9 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#ba1a1a] hover:bg-red-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete_outline</span>
                      </button>
                    )}
                    <button
                      onClick={() => onViewLastFormula(lastFormula)}
                      className="w-9 h-9 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#6d7b6c] hover:bg-[#e6eeff] transition-colors"
                      title="Lihat Detail"
                    >
                      <span className="material-symbols-outlined text-[19px]">more_vert</span>
                    </button>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-[18px] bg-[#eff4ff] text-[#121c2a] border border-[#e6eeff]">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-[11px] text-[#6d7b6c]">Total Bobot</span>
                    <span className="font-headline-sm text-[16px] font-bold text-[#121c2a] tracking-tight">
                      {lastFormula.totalWeight} <span className="font-label-sm text-[11px] text-[#6d7b6c] font-normal">kg</span>
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-[11px] text-[#6d7b6c]">Biaya/kg</span>
                    <span className="font-headline-sm text-[16px] font-bold text-[#121c2a] tracking-tight">
                      Rp {lastFormula.costPerKg.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex flex-col text-right sm:text-left">
                    <span className="font-label-sm text-[11px] text-[#6d7b6c]">Total Biaya</span>
                    <span className="font-headline-sm text-[16px] font-bold text-[#006e2f] tracking-tight">
                      Rp {lastFormula.totalCost.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Visual Ingredient Distribution */}
                {lastFormula.pills && lastFormula.pills.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between font-label-sm text-[11px] text-[#6d7b6c] truncate">
                      <span className="font-semibold text-[#121c2a] shrink-0">Komposisi:</span>
                      <span className="truncate ml-2">{lastFormula.pills.join(' • ')}</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-[#d9e3f6] overflow-hidden flex">
                      <div className="h-full bg-[#22c55e]" style={{ width: '50%' }}></div>
                      <div className="h-full bg-[#ef9900]" style={{ width: '25%' }}></div>
                      <div className="h-full bg-[#006e2f]" style={{ width: '15%' }}></div>
                      <div className="h-full bg-[#38bdf8]" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                )}

                {/* Action Footer Link */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <button
                    onClick={() => onViewLastFormula(lastFormula)}
                    className="inline-flex items-center gap-1 text-[#006e2f] font-label-lg text-[13px] font-bold hover:gap-2 transition-all"
                  >
                    <span>Lihat Rincian &amp; Dispense</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>

                  <button
                    onClick={() => onRepeatFormula ? onRepeatFormula(lastFormula) : onOpenDispense()}
                    aria-label="Ulangi Batch"
                    title="Dispense ke Mesin"
                    className="h-9 px-3.5 rounded-full bg-[#7cf994]/40 text-[#006e2f] flex items-center gap-1.5 text-[12px] font-bold active:scale-90 transition-transform hover:bg-[#7cf994]/60"
                  >
                    <span className="material-symbols-outlined text-[17px]">replay</span>
                    <span>Ulangi Batch</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Empty state if history is empty */
              <div className="rounded-[24px] bg-white p-6 shadow-xs border border-[#e5e7eb] flex flex-col items-center justify-center text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[#eff4ff] text-[#006e2f] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px]">science</span>
                </div>
                <div>
                  <h4 className="font-title-md text-[16px] text-[#121c2a] font-bold">Belum Ada Formula Ransum</h4>
                  <p className="font-body-sm text-[12px] text-[#6d7b6c] mt-0.5 max-w-sm">
                    Mulai racik formula pakan mandiri pertama Anda sesuai target SNI dan stok bahan baku.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onStartFormulation}
                  className="h-10 px-5 rounded-full bg-[#22c55e] text-white font-label-md text-[13px] font-bold flex items-center gap-1.5 shadow-sm hover:bg-[#006e2f] transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Buat Formula Baru</span>
                </button>
              </div>
            )}
          </section>

          {/* 8. Kandang & Populasi Ayam Aktif (Dynamic from kandang) */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-0.5">
              <h3 className="font-headline-sm text-[16px] text-[#121c2a] font-bold">Kandang &amp; Populasi Ternak</h3>
              <span className="font-label-sm text-[11px] text-[#006e2f] font-semibold">Total {totalPopulasi.toLocaleString('id-ID')} Ekor</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeKandang.map((k) => (
                <div key={k.id} className="bg-white rounded-[22px] p-4 shadow-xs border border-[#e5e7eb] flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#006e2f] text-[20px]">roofing</span>
                      <span className="font-label-md text-[14px] font-bold text-[#121c2a]">{k.nama}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#7cf994]/40 text-[#007230] text-[11px] font-bold">
                      {k.fase}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 bg-[#eff4ff] p-3 rounded-[16px] border border-[#e6eeff] text-center">
                    <div className="flex flex-col items-center justify-center px-1">
                      <span className="text-[#6d7b6c] text-[11px] font-medium">Populasi</span>
                      <span className="font-bold text-[14px] text-[#121c2a] mt-0.5">{k.populasi.toLocaleString('id-ID')} Ekor</span>
                    </div>
                    <div className="flex flex-col items-center justify-center px-1 border-x border-[#d9e3f6]">
                      <span className="text-[#6d7b6c] text-[11px] font-medium">Umur Ayam</span>
                      <span className="font-bold text-[14px] text-[#121c2a] mt-0.5">{k.umurHari} Hari</span>
                    </div>
                    <div className="flex flex-col items-center justify-center px-1">
                      <span className="text-[#6d7b6c] text-[11px] font-medium">Bobot Rata-rata</span>
                      <span className="font-bold text-[14px] text-[#006e2f] mt-0.5">{k.bobotRataKg} kg</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right / Secondary Column (Tips, Preset Formula, Feed Schedule) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
          {/* 5. Quick Tips Card */}
          <section className="rounded-[22px] bg-[#ffddb8]/40 border border-[#ffddb8] p-4 flex items-start gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-full bg-[#ef9900] text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[22px]">lightbulb</span>
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-label-md text-[13px] text-[#2a1700] font-bold">Tips Hemat Hari Ini</span>
                <span className="px-2 py-0.5 rounded-full bg-[#ef9900]/20 text-[#653e00] font-label-sm text-[10px] font-bold">
                  Pasar Pakan
                </span>
              </div>
              <p className="font-body-sm text-[12px] text-[#653e00] leading-snug">
                Harga <span className="font-semibold text-[#2a1700]">jagung giling</span> stabil di pasar Blitar. Segera sesuaikan rasio premix untuk margin kandang lebih optimal!
              </p>
            </div>
          </section>

          {/* 6. Preset Formula Tersimpan Section (Replacement as requested) */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#006e2f] text-[20px]">bookmarks</span>
                <h3 className="font-headline-sm text-[16px] text-[#121c2a] font-bold">Preset Formula</h3>
              </div>
              <button
                type="button"
                onClick={onOpenTargets}
                className="font-label-sm text-[12px] text-[#006e2f] font-bold hover:underline"
              >
                Lihat Semua ({presetsList.length})
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {presetsList.slice(0, 4).map((preset) => (
                <div
                  key={preset.id}
                  className="rounded-[22px] bg-white p-3.5 sm:p-4 flex flex-col justify-between gap-3 shadow-xs border border-[#e5e7eb] hover:border-[#22c55e] transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 ${
                          preset.category === 'custom' ? 'bg-[#ffddb8] text-[#855300]' : 'bg-[#7cf994]/30 text-[#006e2f]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[22px]">{preset.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-title-md text-[13px] font-bold text-[#121c2a] truncate">
                          {preset.title}
                        </h4>
                        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                          <span className="bg-[#eff4ff] text-[#3d4a3d] font-label-sm text-[10px] px-1.5 py-0.2 rounded-full">
                            {preset.phase}
                          </span>
                          <span
                            className={`font-label-sm text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
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
                  </div>

                  {/* Nutrisi Matrix Mini */}
                  <div className="grid grid-cols-3 gap-1 bg-[#eff4ff] p-2 rounded-[12px] border border-[#e6eeff] text-center">
                    <div>
                      <span className="font-label-sm text-[9px] text-[#6d7b6c] block">PK</span>
                      <span className="font-label-lg text-[11px] font-bold text-[#121c2a]">{preset.pk}</span>
                    </div>
                    <div className="border-x border-[#d9e3f6]">
                      <span className="font-label-sm text-[9px] text-[#6d7b6c] block">EM</span>
                      <span className="font-label-lg text-[11px] font-bold text-[#121c2a]">{preset.em}</span>
                    </div>
                    <div>
                      <span className="font-label-sm text-[9px] text-[#6d7b6c] block">Ca</span>
                      <span className="font-label-lg text-[11px] font-bold text-[#006e2f]">{preset.ca}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectPreset ? onSelectPreset(preset) : onOpenTargets()}
                    className="w-full h-8 rounded-full bg-[#22c55e] hover:bg-[#006e2f] text-white font-label-sm text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs transition-colors active:scale-95"
                  >
                    <span>Gunakan Formula</span>
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* 7. Jadwal Pemberian Pakan Hari Ini (Dynamic Feed Schedule Timeline) */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-0.5">
              <h3 className="font-headline-sm text-[16px] text-[#121c2a] font-bold">Jadwal Pemberian Pakan Hari Ini</h3>
              <span className="font-label-sm text-[11px] text-[#6d7b6c]">{activeSchedule.length} Sesi / Hari</span>
            </div>

            <div className="bg-white rounded-[24px] p-4 shadow-xs border border-[#e5e7eb] flex flex-col gap-3">
              {activeSchedule.map((s, idx) => (
                <div
                  key={s.id}
                  className={`flex items-center justify-between pb-2.5 ${
                    idx < activeSchedule.length - 1 ? 'border-b border-slate-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[12px] ${
                        s.status === 'selesai'
                          ? 'bg-[#7cf994]/40 text-[#007230]'
                          : 'bg-[#eff4ff] text-[#006e2f] border border-[#e6eeff]'
                      }`}
                    >
                      {s.jam}
                    </div>
                    <div>
                      <p className="font-label-md text-[13px] font-bold text-[#121c2a]">{s.label}</p>
                      <p className="font-body-sm text-[11px] text-[#6d7b6c]">{s.notes}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-label-sm text-[10px] font-bold ${
                      s.status === 'selesai'
                        ? 'bg-[#7cf994]/40 text-[#007230]'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {s.status === 'selesai' ? 'Selesai' : 'Standby'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* 9. Standar Mutu SNI Affirmation Footer */}
      <div className="shrink-0 flex flex-col items-center justify-center py-4 text-center gap-1 text-[#6d7b6c]">
        <div className="flex items-center gap-1.5 text-[#006e2f] font-semibold text-[12px]">
          <span className="material-symbols-outlined text-[16px]">verified</span>
          <span>Divalidasi Standar SNI 01-3930-2006 Kementan RI</span>
        </div>
        <p className="text-[11px] text-[#6d7b6c]">
          CluckFeed IoT System {farmConfig?.app_version || 'v1.4.0'} • Siap Dispense Kandang
        </p>
      </div>
    </div>
  );
};

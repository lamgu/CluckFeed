import React from 'react';

interface BerandaScreenProps {
  onStartFormulation: () => void;
  onOpenIngredients: () => void;
  onOpenPrices: () => void;
  onOpenTargets: () => void;
  onOpenDispense: () => void;
  onOpenStock: () => void;
  onOpenHistory: () => void;
  onOpenAssistant: () => void;
  onViewLastFormula: () => void;
}

export const BerandaScreen: React.FC<BerandaScreenProps> = ({
  onStartFormulation,
  onOpenIngredients,
  onOpenPrices,
  onOpenTargets,
  onOpenDispense,
  onOpenStock,
  onOpenHistory,
  onOpenAssistant,
  onViewLastFormula
}) => {
  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto phone-scrollbar px-4 sm:px-5 pb-32 gap-6 pt-3 flex flex-col overscroll-contain [&>*]:shrink-0">
      {/* 1. Top Greeting & IoT Hardware Status */}
      <section className="shrink-0 flex items-center justify-between pt-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h1 className="font-headline-md text-[21px] text-[#121c2a] tracking-tight font-extrabold">
              Halo, Pak Budi
            </h1>
            <span className="text-xl select-none">👋</span>
          </div>
          <p className="font-body-sm text-[12px] text-[#3d4a3d] flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[15px] text-[#006e2f]">location_on</span>
            Peternakan Berkah Sejahtera, Blitar
          </p>
        </div>

        {/* IoT Status Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#7cf994]/30 text-[#007230] shadow-xs border border-[#7cf994]/60">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]"></span>
          </span>
          <span className="font-label-sm text-[11px] font-bold tracking-wide flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">sensors</span>
            Terhubung
          </span>
        </div>
      </section>

      {/* 2. Hero Card: Formula Pakan (GoPay/Gojek Tactile Gradient) */}
      <section className="shrink-0 relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#22c55e] via-[#006e2f] to-[#004b1e] p-5 sm:p-6 text-white shadow-md min-h-[210px] flex flex-col justify-between">
        {/* Abstract Geometric Farm Watermark Pattern */}
        <div className="absolute -right-6 -bottom-8 w-44 h-44 opacity-15 pointer-events-none select-none text-white">
          <svg className="w-full h-full" fill="currentColor" viewBox="0 0 100 100">
            <path d="M50 15 C30 15 20 35 20 50 C20 70 35 85 50 85 C65 85 80 70 80 50 C80 35 70 15 50 15 Z M50 25 C60 25 70 35 70 48 C60 52 45 42 35 55 C32 40 40 25 50 25 Z"></path>
            <circle cx="68" cy="38" r="4"></circle>
            <path d="M58 20 C62 10 74 12 70 24" fill="none" stroke="currentColor" strokeWidth="2"></path>
            <path d="M78 46 L90 44 L80 54 Z"></path>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col gap-3.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md w-fit border border-white/20">
            <span className="material-symbols-outlined text-[16px] text-[#7ffc97]">auto_awesome</span>
            <span className="font-label-sm text-[11px] text-[#7ffc97] font-bold">Smart Precision Feed SNI</span>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="font-headline-lg-mobile text-[24px] sm:text-[26px] text-white font-extrabold leading-tight">
              Hitung Formula Pakan
            </h2>
            <p className="font-body-sm text-[13px] text-white/90 max-w-sm leading-relaxed">
              Optimalkan nutrisi harian (Protein Kasar &amp; Energi Metabolisme) &amp; hemat biaya pakan ternak ayam secara cerdas.
            </p>
          </div>

          <div className="pt-1 flex items-center gap-3">
            <button
              onClick={onStartFormulation}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#004b1e] font-label-lg text-[14px] font-bold shadow-md active:scale-95 transition-all hover:bg-[#eff4ff] hover:shadow-lg"
            >
              <span>Mulai Sekarang</span>
              <span className="material-symbols-outlined text-[19px]">arrow_forward</span>
            </button>

            <button
              onClick={onViewLastFormula}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full bg-white/15 text-white font-label-lg text-[13px] font-semibold border border-white/20 backdrop-blur-xs hover:bg-white/25 active:scale-95 transition-all"
            >
              <span>Batch #14</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Quick Features Grid (2 rows x 4 columns) */}
      <section className="shrink-0 flex flex-col gap-3">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="font-headline-sm text-[16px] text-[#121c2a] font-bold">Menu Utama</h3>
          <span className="font-label-sm text-[11px] text-[#006e2f] font-semibold">Semua Alat Lengkap</span>
        </div>

        <div className="grid grid-cols-4 gap-y-4 gap-x-2.5 sm:gap-x-4">
          {/* 1. Bahan */}
          <button
            onClick={onOpenIngredients}
            className="flex flex-col items-center gap-1.5 text-center group active:scale-95 transition-transform"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-[#7cf994]/30 flex items-center justify-center text-[#006e2f] group-hover:bg-[#7cf994]/50 group-hover:scale-105 transition-all shadow-xs border border-[#7cf994]/40">
              <span className="material-symbols-outlined text-[28px] sm:text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                grain
              </span>
            </div>
            <span className="font-label-md text-[12px] text-[#121c2a] font-semibold truncate w-full">Bahan</span>
          </button>

          {/* 2. Harga */}
          <button
            onClick={onOpenPrices}
            className="flex flex-col items-center gap-1.5 text-center group active:scale-95 transition-transform"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-[#7cf994]/30 flex items-center justify-center text-[#006e2f] group-hover:bg-[#7cf994]/50 group-hover:scale-105 transition-all shadow-xs border border-[#7cf994]/40">
              <span className="material-symbols-outlined text-[28px] sm:text-[30px]">payments</span>
            </div>
            <span className="font-label-md text-[12px] text-[#121c2a] font-semibold truncate w-full">Harga</span>
          </button>

          {/* 3. Target */}
          <button
            onClick={onOpenTargets}
            className="flex flex-col items-center gap-1.5 text-center group active:scale-95 transition-transform"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-[#7cf994]/30 flex items-center justify-center text-[#006e2f] group-hover:bg-[#7cf994]/50 group-hover:scale-105 transition-all shadow-xs border border-[#7cf994]/40">
              <span className="material-symbols-outlined text-[28px] sm:text-[30px]">adjust</span>
            </div>
            <span className="font-label-md text-[12px] text-[#121c2a] font-semibold truncate w-full">Target</span>
          </button>

          {/* 4. Formula */}
          <button
            onClick={onStartFormulation}
            className="flex flex-col items-center gap-1.5 text-center group active:scale-95 transition-transform"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-[#7cf994]/30 flex items-center justify-center text-[#006e2f] group-hover:bg-[#7cf994]/50 group-hover:scale-105 transition-all shadow-xs border border-[#7cf994]/40">
              <span className="material-symbols-outlined text-[28px] sm:text-[30px]">calculate</span>
            </div>
            <span className="font-label-md text-[12px] text-[#121c2a] font-semibold truncate w-full">Formula</span>
          </button>

          {/* 5. Dispense */}
          <button
            onClick={onOpenDispense}
            className="flex flex-col items-center gap-1.5 text-center group active:scale-95 transition-transform"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-[#7cf994]/30 flex items-center justify-center text-[#006e2f] group-hover:bg-[#7cf994]/50 group-hover:scale-105 transition-all shadow-xs border border-[#7cf994]/40">
              <span className="material-symbols-outlined text-[28px] sm:text-[30px]">tune</span>
            </div>
            <span className="font-label-md text-[12px] text-[#121c2a] font-semibold truncate w-full">Dispense</span>
          </button>

          {/* 6. Stok */}
          <button
            onClick={onOpenStock}
            className="flex flex-col items-center gap-1.5 text-center group active:scale-95 transition-transform"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-[#7cf994]/30 flex items-center justify-center text-[#006e2f] group-hover:bg-[#7cf994]/50 group-hover:scale-105 transition-all shadow-xs border border-[#7cf994]/40">
              <span className="material-symbols-outlined text-[28px] sm:text-[30px]">inventory_2</span>
            </div>
            <span className="font-label-md text-[12px] text-[#121c2a] font-semibold truncate w-full">Stok</span>
          </button>

          {/* 7. Riwayat */}
          <button
            onClick={onOpenHistory}
            className="flex flex-col items-center gap-1.5 text-center group active:scale-95 transition-transform"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-[#7cf994]/30 flex items-center justify-center text-[#006e2f] group-hover:bg-[#7cf994]/50 group-hover:scale-105 transition-all shadow-xs border border-[#7cf994]/40">
              <span className="material-symbols-outlined text-[28px] sm:text-[30px]">history</span>
            </div>
            <span className="font-label-md text-[12px] text-[#121c2a] font-semibold truncate w-full">Riwayat</span>
          </button>

          {/* 8. Asisten AI */}
          <button
            onClick={onOpenAssistant}
            className="flex flex-col items-center gap-1.5 text-center group active:scale-95 transition-transform"
          >
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-[#7cf994]/30 flex items-center justify-center text-[#006e2f] group-hover:bg-[#7cf994]/50 group-hover:scale-105 transition-all shadow-xs border border-[#7cf994]/40">
              <span className="material-symbols-outlined text-[28px] sm:text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>
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

      {/* 4. Formula Terakhir Card Section */}
      <section className="shrink-0 flex flex-col gap-3">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#006e2f] text-[20px]">science</span>
            <h3 className="font-headline-sm text-[16px] text-[#121c2a] font-bold">Formula Terakhir</h3>
          </div>
          <button
            onClick={onOpenHistory}
            className="font-label-sm text-[12px] text-[#006e2f] font-bold hover:underline"
          >
            Lihat Semua
          </button>
        </div>

        {/* Content Card */}
        <div className="rounded-[24px] bg-white p-4 sm:p-5 shadow-xs border border-[#e5e7eb] flex flex-col gap-4">
          {/* Card Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="font-title-md text-[16px] text-[#121c2a] font-bold truncate">
                  Broiler Finisher Batch #14
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-[#7cf994]/50 text-[#007230] font-label-sm text-[11px] font-bold flex items-center gap-0.5 border border-[#7cf994]">
                  <span className="material-symbols-outlined text-[13px]">check_circle</span>
                  Layak
                </span>
              </div>
              <p className="font-body-sm text-[12px] text-[#6d7b6c] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                Dibuat: Hari ini, 09:30 WIB • Kandang A
              </p>
            </div>

            <button
              onClick={onViewLastFormula}
              className="w-9 h-9 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#6d7b6c] hover:bg-[#e6eeff] transition-colors"
            >
              <span className="material-symbols-outlined text-[19px]">more_vert</span>
            </button>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-[18px] bg-[#eff4ff] text-[#121c2a] border border-[#e6eeff]">
            <div className="flex flex-col">
              <span className="font-label-sm text-[11px] text-[#6d7b6c]">Total</span>
              <span className="font-headline-sm text-[16px] font-bold text-[#121c2a] tracking-tight">
                500 <span className="font-label-sm text-[11px] text-[#6d7b6c] font-normal">kg</span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[11px] text-[#6d7b6c]">Biaya/kg</span>
              <span className="font-headline-sm text-[16px] font-bold text-[#121c2a] tracking-tight">
                Rp 6.850
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[11px] text-[#6d7b6c]">Efisiensi</span>
              <span className="font-headline-sm text-[16px] text-[#006e2f] font-bold tracking-tight flex items-center">
                +12%
                <span className="material-symbols-outlined text-[17px] text-[#006e2f]">trending_up</span>
              </span>
            </div>
          </div>

          {/* Visual Ingredient Distribution */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between font-label-sm text-[11px] text-[#6d7b6c]">
              <span className="font-semibold text-[#121c2a]">Komposisi Utama</span>
              <span>Jagung 55% • Bekatul 25% • SBM &amp; Premix 20%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-[#d9e3f6] overflow-hidden flex">
              <div className="h-full bg-[#22c55e]" style={{ width: '55%' }} title="Jagung 55%"></div>
              <div className="h-full bg-[#ef9900]" style={{ width: '25%' }} title="Bekatul 25%"></div>
              <div className="h-full bg-[#006e2f]" style={{ width: '20%' }} title="SBM &amp; Premix 20%"></div>
            </div>
          </div>

          {/* Action Footer Link */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              onClick={onViewLastFormula}
              className="inline-flex items-center gap-1 text-[#006e2f] font-label-lg text-[13px] font-bold hover:gap-2 transition-all"
            >
              <span>Lihat Rincian &amp; Dispense</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>

            <button
              onClick={onOpenDispense}
              aria-label="Ulangi Batch"
              title="Dispense ke Mesin"
              className="h-9 px-3 rounded-full bg-[#7cf994]/40 text-[#006e2f] flex items-center gap-1 text-[12px] font-bold active:scale-90 transition-transform hover:bg-[#7cf994]/60"
            >
              <span className="material-symbols-outlined text-[17px]">replay</span>
              <span>Ulangi Batch</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. Quick Tips Card */}
      <section className="shrink-0 rounded-[22px] bg-[#ffddb8]/40 border border-[#ffddb8] p-4 flex items-start gap-3.5 shadow-xs">
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
            Harga <span className="font-semibold text-[#2a1700]">jagung giling</span> turun 5% di pasar lokal. Segera sesuaikan rasio premix untuk margin kandang lebih optimal!
          </p>
        </div>
      </section>

      {/* 6. Farm Activity Snapshot (Pantauan Kandang) */}
      <section className="shrink-0 flex flex-col gap-3">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="font-headline-sm text-[16px] text-[#121c2a] font-bold">Pantauan Kandang &amp; Iklim</h3>
          <span className="font-label-sm text-[11px] text-[#006e2f] font-semibold">Sensor IoT Aktif</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Mini Card 1: Suhu */}
          <div className="rounded-[22px] bg-white p-4 flex flex-col gap-2 shadow-xs border border-[#e5e7eb]">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-[#6d7b6c] font-semibold">Suhu Kandang</span>
              <span className="material-symbols-outlined text-[20px] text-[#855300]">thermostat</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-headline-md text-[24px] font-extrabold text-[#121c2a]">29.4</span>
              <span className="font-body-sm text-[13px] text-[#6d7b6c]">°C</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
              <span className="font-label-sm text-[11px] text-[#006e2f] font-bold">Ideal untuk Broiler</span>
            </div>
          </div>

          {/* Mini Card 2: Sisa Pakan */}
          <div className="rounded-[22px] bg-white p-4 flex flex-col gap-2 shadow-xs border border-[#e5e7eb]">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-[#6d7b6c] font-semibold">Sisa Pakan Silo</span>
              <span className="material-symbols-outlined text-[20px] text-[#006e2f]">scale</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-headline-md text-[24px] font-extrabold text-[#121c2a]">1.250</span>
              <span className="font-body-sm text-[13px] text-[#6d7b6c]">kg</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ef9900]"></span>
              <span className="font-label-sm text-[11px] text-[#5c3800] font-bold">Cukup 3,5 hari</span>
            </div>
          </div>

          {/* Mini Card 3: Kelembaban */}
          <div className="rounded-[22px] bg-white p-4 flex flex-col gap-2 shadow-xs border border-[#e5e7eb]">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-[#6d7b6c] font-semibold">Kelembaban</span>
              <span className="material-symbols-outlined text-[20px] text-[#0284c7]">humidity_mid</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-headline-md text-[24px] font-extrabold text-[#121c2a]">68</span>
              <span className="font-body-sm text-[13px] text-[#6d7b6c]">%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
              <span className="font-label-sm text-[11px] text-[#006e2f] font-bold">Sirkulasi Optimal</span>
            </div>
          </div>

          {/* Mini Card 4: FCR Target */}
          <div className="rounded-[22px] bg-white p-4 flex flex-col gap-2 shadow-xs border border-[#e5e7eb]">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-[#6d7b6c] font-semibold">Target FCR</span>
              <span className="material-symbols-outlined text-[20px] text-[#006e2f]">trending_down</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-headline-md text-[24px] font-extrabold text-[#006e2f]">1.48</span>
              <span className="font-body-sm text-[11px] text-[#6d7b6c]">efisien</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
              <span className="font-label-sm text-[11px] text-[#006e2f] font-bold">+14% Hemat Pakan</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Jadwal Pemberian Pakan Hari Ini (Feed Schedule Timeline) */}
      <section className="shrink-0 flex flex-col gap-3">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="font-headline-sm text-[16px] text-[#121c2a] font-bold">Jadwal Pemberian Pakan Hari Ini</h3>
          <span className="font-label-sm text-[11px] text-[#6d7b6c]">3 Sesi / Hari</span>
        </div>

        <div className="bg-white rounded-[24px] p-4 shadow-xs border border-[#e5e7eb] flex flex-col gap-3">
          {/* Schedule 1 */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#7cf994]/40 text-[#007230] flex items-center justify-center font-bold text-[12px]">
                07:00
              </div>
              <div>
                <p className="font-label-md text-[13px] font-bold text-[#121c2a]">Pemberian Pagi (Kandang A &amp; B)</p>
                <p className="font-body-sm text-[11px] text-[#6d7b6c]">Porsi 150 kg Broiler Finisher</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#7cf994]/40 text-[#007230] font-label-sm text-[10px] font-bold">
              Selesai
            </span>
          </div>

          {/* Schedule 2 */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#7cf994]/40 text-[#007230] flex items-center justify-center font-bold text-[12px]">
                12:00
              </div>
              <div>
                <p className="font-label-md text-[13px] font-bold text-[#121c2a]">Pemberian Siang</p>
                <p className="font-body-sm text-[11px] text-[#6d7b6c]">Porsi 150 kg + Elektrolit Air Minum</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#7cf994]/40 text-[#007230] font-label-sm text-[10px] font-bold">
              Selesai
            </span>
          </div>

          {/* Schedule 3 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#eff4ff] text-[#006e2f] border border-[#e6eeff] flex items-center justify-center font-bold text-[12px]">
                16:30
              </div>
              <div>
                <p className="font-label-md text-[13px] font-bold text-[#121c2a]">Pemberian Sore</p>
                <p className="font-body-sm text-[11px] text-[#6d7b6c]">Porsi 200 kg Menjelang Istirahat</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-label-sm text-[10px] font-bold">
              Standby
            </span>
          </div>
        </div>
      </section>

      {/* 8. Kandang & Populasi Ayam Aktif */}
      <section className="shrink-0 flex flex-col gap-3">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="font-headline-sm text-[16px] text-[#121c2a] font-bold">Kandang &amp; Populasi Ternak</h3>
          <span className="font-label-sm text-[11px] text-[#006e2f] font-semibold">Total 4.300 Ekor</span>
        </div>

        <div className="flex flex-col gap-3">
          {/* Kandang A */}
          <div className="bg-white rounded-[22px] p-4 shadow-xs border border-[#e5e7eb] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006e2f] text-[20px]">roofing</span>
                <span className="font-label-md text-[14px] font-bold text-[#121c2a]">Kandang A</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#7cf994]/40 text-[#007230] text-[11px] font-bold">
                Fase Finisher
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-[#eff4ff] p-3 rounded-[16px] border border-[#e6eeff] text-center">
              <div className="flex flex-col items-center justify-center px-1">
                <span className="text-[#6d7b6c] text-[11px] font-medium">Populasi</span>
                <span className="font-bold text-[14px] text-[#121c2a] mt-0.5">2.500 Ekor</span>
              </div>
              <div className="flex flex-col items-center justify-center px-1 border-x border-[#d9e3f6]">
                <span className="text-[#6d7b6c] text-[11px] font-medium">Umur Ayam</span>
                <span className="font-bold text-[14px] text-[#121c2a] mt-0.5">32 Hari</span>
              </div>
              <div className="flex flex-col items-center justify-center px-1">
                <span className="text-[#6d7b6c] text-[11px] font-medium">Bobot Rata-rata</span>
                <span className="font-bold text-[14px] text-[#006e2f] mt-0.5">1.85 kg</span>
              </div>
            </div>
          </div>

          {/* Kandang B */}
          <div className="bg-white rounded-[22px] p-4 shadow-xs border border-[#e5e7eb] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006e2f] text-[20px]">roofing</span>
                <span className="font-label-md text-[14px] font-bold text-[#121c2a]">Kandang B</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#3d4a3d] text-[11px] font-bold">
                Fase Grower
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-[#eff4ff] p-3 rounded-[16px] border border-[#e6eeff] text-center">
              <div className="flex flex-col items-center justify-center px-1">
                <span className="text-[#6d7b6c] text-[11px] font-medium">Populasi</span>
                <span className="font-bold text-[14px] text-[#121c2a] mt-0.5">1.800 Ekor</span>
              </div>
              <div className="flex flex-col items-center justify-center px-1 border-x border-[#d9e3f6]">
                <span className="text-[#6d7b6c] text-[11px] font-medium">Umur Ayam</span>
                <span className="font-bold text-[14px] text-[#121c2a] mt-0.5">14 Hari</span>
              </div>
              <div className="flex flex-col items-center justify-center px-1">
                <span className="text-[#6d7b6c] text-[11px] font-medium">Bobot Rata-rata</span>
                <span className="font-bold text-[14px] text-[#006e2f] mt-0.5">0.52 kg</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Standar Mutu SNI Affirmation Footer */}
      <div className="shrink-0 flex flex-col items-center justify-center py-2 text-center gap-1 text-[#6d7b6c]">
        <div className="flex items-center gap-1.5 text-[#006e2f] font-semibold text-[12px]">
          <span className="material-symbols-outlined text-[16px]">verified</span>
          <span>Divalidasi Standar SNI 01-3930-2006 Kementan RI</span>
        </div>
        <p className="text-[11px] text-[#6d7b6c]">
          CluckFeed IoT System v1.4.0 • Siap Dispense Kandang
        </p>
      </div>
    </div>
  );
};

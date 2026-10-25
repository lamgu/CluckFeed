import React from 'react';
import { BUDI_AVATAR_URL } from '../components/Header';

interface ProfilScreenProps {
  onOpenPresets: () => void;
  onOpenStock: () => void;
  onOpenCalibration: () => void;
  onOpenSNIGuide: () => void;
  onContactSupport: () => void;
}

export const ProfilScreen: React.FC<ProfilScreenProps> = ({
  onOpenPresets,
  onOpenStock,
  onOpenCalibration,
  onOpenSNIGuide,
  onContactSupport
}) => {
  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto phone-scrollbar px-4 pb-28 gap-4 pt-1 flex flex-col overscroll-contain [&>*]:shrink-0">
      {/* Farmer Profile Header */}
      <div className="bg-white rounded-[24px] p-4 shadow-xs border border-[#e5e7eb] flex flex-col gap-3 relative overflow-hidden">
        {/* Subtle accent blur */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#7cf994]/20 rounded-full blur-xl pointer-events-none"></div>

        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <img
              alt="Budi Santoso"
              src={BUDI_AVATAR_URL}
              className="w-16 h-16 rounded-full object-cover shadow-xs border-2 border-white"
            />
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
              <span className="material-symbols-outlined text-[#006e2f] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
            </div>
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <h2 className="font-headline-sm text-[17px] text-[#121c2a] font-bold truncate">
              Budi Santoso
            </h2>
            <p className="font-body-sm text-[12px] text-[#6d7b6c] truncate">+62 812-3456-7890</p>
            <div className="mt-1 flex items-center gap-1 bg-[#7cf994]/30 px-2.5 py-0.5 rounded-full w-fit">
              <span className="material-symbols-outlined text-[#006e2f] text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                shield
              </span>
              <span className="font-label-sm text-[10px] text-[#006e2f] font-bold">
                Peternak Mandiri Terverifikasi
              </span>
            </div>
          </div>
        </div>

        {/* Kandang Location Tag */}
        <div className="flex items-center gap-2 bg-[#eff4ff] px-3 py-2 rounded-[14px] text-[#3d4a3d] border border-[#e6eeff]">
          <span className="material-symbols-outlined text-[#006e2f] text-[18px]">roofing</span>
          <span className="font-body-sm text-[11px] font-semibold truncate">
            Peternakan Berkah Sejahtera, Blitar
          </span>
        </div>
      </div>

      {/* IoT Hardware Connection Card */}
      <div className="bg-white rounded-[24px] p-4 shadow-xs border border-[#e5e7eb] flex flex-col gap-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[12px] bg-[#7cf994]/30 flex items-center justify-center text-[#006e2f]">
              <span className="material-symbols-outlined text-[19px]">memory</span>
            </div>
            <h3 className="font-title-md text-[14px] text-[#121c2a] font-bold">
              Koneksi Mesin Mixer &amp; Dispenser
            </h3>
          </div>
          <span className="bg-[#eff4ff] text-[#3d4a3d] px-2 py-0.5 rounded-full font-label-sm text-[10px] font-bold border border-[#e6eeff]">
            OTG Direct
          </span>
        </div>

        <div className="bg-[#eff4ff] p-3 rounded-[16px] flex flex-col gap-2 border border-[#e6eeff]">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-[12px] text-[#121c2a] font-bold">
              ESP32 Auto-Mixer v2.1
            </span>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]"></span>
              </span>
              <span className="font-label-sm text-[11px] text-[#006e2f] font-bold">Terhubung</span>
            </div>
          </div>
          <p className="font-body-sm text-[11px] text-[#6d7b6c] flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-[#6d7b6c]">usb</span>
            Terhubung via USB-C / OTG • Siap Kalibrasi
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-0.5">
          <button
            type="button"
            onClick={onOpenCalibration}
            className="flex-1 py-2.5 px-3 rounded-full bg-[#eff4ff] text-[#006e2f] font-label-md text-[12px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#e6eeff] active:scale-95 transition-all border border-[#e6eeff]"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>Konfigurasi Alat</span>
          </button>
          <button
            type="button"
            onClick={onOpenCalibration}
            className="py-2.5 px-4 rounded-full bg-[#eff4ff] text-[#3d4a3d] font-label-md text-[12px] font-bold flex items-center justify-center gap-1 hover:bg-[#e6eeff] active:scale-95 transition-all border border-[#e6eeff]"
            title="Hubungkan Alat Baru"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Baru</span>
          </button>
        </div>
      </div>

      {/* Group 1: Pengaturan Formulasi */}
      <div className="flex flex-col gap-1.5">
        <span className="font-label-md text-[11px] text-[#6d7b6c] px-1 font-bold uppercase tracking-wider">
          Pengaturan Formulasi
        </span>
        <div className="bg-white rounded-[22px] shadow-xs border border-[#e5e7eb] overflow-hidden flex flex-col">
          {/* Row 1: Target & Preset */}
          <button
            type="button"
            onClick={onOpenPresets}
            className="flex items-center justify-between p-3.5 hover:bg-[#eff4ff]/60 active:bg-[#eff4ff] transition-colors text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-[14px] bg-[#7cf994]/30 flex items-center justify-center text-[#006e2f] shrink-0">
                <span className="material-symbols-outlined text-[22px]">adjust</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-lg text-[13px] text-[#121c2a] font-bold truncate">
                  Target &amp; Preset Nutrisi
                </span>
                <span className="font-body-sm text-[11px] text-[#6d7b6c] truncate">
                  Kelola preset aktif (Broiler &amp; Layer)
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#6d7b6c] text-[20px] shrink-0">chevron_right</span>
          </button>

          <div className="h-[1px] bg-[#f0f4ff] mx-3"></div>

          {/* Row 2: Stok Gudang */}
          <button
            type="button"
            onClick={onOpenStock}
            className="flex items-center justify-between p-3.5 hover:bg-[#eff4ff]/60 active:bg-[#eff4ff] transition-colors text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-[14px] bg-[#7cf994]/30 flex items-center justify-center text-[#006e2f] shrink-0">
                <span className="material-symbols-outlined text-[22px]">inventory_2</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-lg text-[13px] text-[#121c2a] font-bold truncate">
                  Stok &amp; Gudang Bahan Pakan
                </span>
                <span className="font-body-sm text-[11px] text-[#6d7b6c] truncate">
                  Kelola sisa stok &amp; harga bahan lokal
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#6d7b6c] text-[20px] shrink-0">chevron_right</span>
          </button>

          <div className="h-[1px] bg-[#f0f4ff] mx-3"></div>

          {/* Row 3: Kalibrasi Hopper */}
          <button
            type="button"
            onClick={onOpenCalibration}
            className="flex items-center justify-between p-3.5 hover:bg-[#eff4ff]/60 active:bg-[#eff4ff] transition-colors text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-[14px] bg-[#7cf994]/30 flex items-center justify-center text-[#006e2f] shrink-0">
                <span className="material-symbols-outlined text-[22px]">balance</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-lg text-[13px] text-[#121c2a] font-bold truncate">
                  Riwayat Kalibrasi Hopper
                </span>
                <span className="font-body-sm text-[11px] text-[#6d7b6c] truncate">
                  Kalibrasi terakhir: 3 hari lalu (Presisi ±5g)
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#6d7b6c] text-[20px] shrink-0">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Group 2: Bantuan & Standar */}
      <div className="flex flex-col gap-1.5">
        <span className="font-label-md text-[11px] text-[#6d7b6c] px-1 font-bold uppercase tracking-wider">
          Bantuan &amp; Standar
        </span>
        <div className="bg-white rounded-[22px] shadow-xs border border-[#e5e7eb] overflow-hidden flex flex-col">
          {/* Row 4 */}
          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-[14px] bg-[#7cf994]/30 flex items-center justify-center text-[#006e2f] shrink-0">
                <span className="material-symbols-outlined text-[22px]">cloud_sync</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-lg text-[13px] text-[#121c2a] font-bold truncate">
                  Mode Offline &amp; Sinkronisasi
                </span>
                <span className="font-body-sm text-[11px] text-[#6d7b6c] truncate">
                  Otomatis sinkron saat ada sinyal di kandang
                </span>
              </div>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Aktif
            </span>
          </div>

          <div className="h-[1px] bg-[#f0f4ff] mx-3"></div>

          {/* Row 5 */}
          <button
            type="button"
            onClick={onOpenSNIGuide}
            className="flex items-center justify-between p-3.5 hover:bg-[#eff4ff]/60 active:bg-[#eff4ff] transition-colors text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-[14px] bg-[#7cf994]/30 flex items-center justify-center text-[#006e2f] shrink-0">
                <span className="material-symbols-outlined text-[22px]">menu_book</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-lg text-[13px] text-[#121c2a] font-bold truncate">
                  Panduan &amp; Standar SNI Pakan
                </span>
                <span className="font-body-sm text-[11px] text-[#6d7b6c] truncate">
                  SNI 01-3930-2006 &amp; tips formulasi
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#6d7b6c] text-[20px] shrink-0">chevron_right</span>
          </button>

          <div className="h-[1px] bg-[#f0f4ff] mx-3"></div>

          {/* Row 6 */}
          <button
            type="button"
            onClick={onContactSupport}
            className="flex items-center justify-between p-3.5 hover:bg-[#eff4ff]/60 active:bg-[#eff4ff] transition-colors text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-[14px] bg-[#7cf994]/30 flex items-center justify-center text-[#006e2f] shrink-0">
                <span className="material-symbols-outlined text-[22px]">support_agent</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-lg text-[13px] text-[#121c2a] font-bold truncate">
                  Hubungi Teknisi &amp; CS
                </span>
                <span className="font-body-sm text-[11px] text-[#6d7b6c] truncate">
                  Respon cepat WhatsApp teknisi mesin
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#6d7b6c] text-[20px] shrink-0">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Group 3: Akun */}
      <div className="flex flex-col gap-1.5">
        <span className="font-label-md text-[11px] text-[#6d7b6c] px-1 font-bold uppercase tracking-wider">
          Akun
        </span>
        <div className="bg-white rounded-[22px] shadow-xs border border-[#e5e7eb] overflow-hidden flex flex-col">
          <button
            type="button"
            onClick={() => alert('Sesi peternak Pak Budi tetap tersimpan di penyimpanan aman ponsel.')}
            className="w-full flex items-center justify-between p-3.5 hover:bg-red-50 active:bg-red-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-[14px] bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a] shrink-0">
                <span className="material-symbols-outlined text-[22px]">logout</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-lg text-[13px] text-[#ba1a1a] font-bold truncate">
                  Keluar Akun
                </span>
                <span className="font-body-sm text-[11px] text-[#ba1a1a]/80 truncate">
                  Keluar dari sesi perangkat ini
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#ba1a1a] text-[20px] shrink-0">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* App Version Footer */}
      <div className="flex flex-col items-center justify-center text-center pt-2 pb-2">
        <div className="flex items-center gap-1.5 text-[#6d7b6c]">
          <span className="material-symbols-outlined text-[16px] text-[#006e2f]">eco</span>
          <span className="font-label-sm text-[11px] font-bold text-[#121c2a]">CluckFeed v1.4.0</span>
        </div>
        <p className="font-body-sm text-[11px] text-[#6d7b6c] mt-0.5">
          Dibuat dengan bangga untuk Peternak Indonesia
        </p>
      </div>
    </div>
  );
};

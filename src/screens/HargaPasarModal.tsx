import React, { useState } from 'react';
import { MarketPrices } from '../hooks/useMarketPrices';

interface HargaPasarModalProps {
  currentPrices: MarketPrices;
  onSave: (newPrices: MarketPrices) => void;
  onClose: () => void;
}

const BROILER_PRESETS = [8000, 8250, 8500, 8750, 9000];
const LAYER_PRESETS = [7000, 7250, 7500, 7750, 8000];

export const HargaPasarModal: React.FC<HargaPasarModalProps> = ({
  currentPrices,
  onSave,
  onClose,
}) => {
  const [broilerPrice, setBroilerPrice] = useState<number>(currentPrices.broiler || 8500);
  const [layerPrice, setLayerPrice] = useState<number>(currentPrices.layer || 7500);

  // Example sample calculation based on Rp 6.850 / kg self-mix cost
  const sampleSelfMixCost = 6850;
  const sampleBatchKg = 500;
  const savingPerKg = Math.max(0, broilerPrice - sampleSelfMixCost);
  const savingPercent = Math.round((savingPerKg / broilerPrice) * 100);
  const totalBatchSaving = savingPerKg * sampleBatchKg;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      broiler: Number(broilerPrice) || 8500,
      layer: Number(layerPrice) || 7500,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-t-[28px] sm:rounded-[24px] w-full max-w-lg p-5 sm:p-6 flex flex-col gap-4 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#7cf994]/30 flex items-center justify-center text-[#006e2f]">
              <span className="material-symbols-outlined text-[24px]">storefront</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-[16px] sm:text-[18px] text-[#121c2a] font-bold">
                Harga Pasar Pakan Jadi
              </h3>
              <p className="font-label-sm text-[11px] text-[#6d7b6c]">
                Acuan pakan komersil untuk kalkulasi persentase hemat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eff4ff] hover:bg-[#e6eeff] flex items-center justify-center text-[#6d7b6c] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Info banner */}
        <div className="bg-[#eff4ff] rounded-[16px] p-3.5 border border-[#e6eeff] flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[#006e2f] text-[20px] shrink-0 mt-0.5">
            info
          </span>
          <p className="font-body-sm text-[12px] text-[#3d4a3d] leading-relaxed">
            Masukkan harga pakan komersil siap pakai yang berlaku di toko atau distributor daerah Anda. Sistem akan membandingkan hasil formula ransum mandiri dengan harga ini untuk menentukan <strong>persentase efisiensi (% lebih murah)</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Input 1: Harga Pakan Broiler */}
          <div className="bg-white rounded-[18px] p-4 border border-[#e5e7eb] flex flex-col gap-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006e2f] text-[20px]">grain</span>
                <label className="text-[13px] font-bold text-[#121c2a]">
                  Pakan Jadi Broiler (Pedaging)
                </label>
              </div>
              <span className="text-[11px] text-[#6d7b6c] bg-[#eff4ff] px-2 py-0.5 rounded-full font-medium">
                Pabrikan Komersil
              </span>
            </div>

            <div className="flex items-center bg-[#eff4ff] rounded-[14px] px-3.5 py-2.5 border border-[#e6eeff]">
              <span className="font-bold text-[14px] text-[#6d7b6c] mr-2">Rp</span>
              <input
                type="number"
                min="1000"
                step="50"
                required
                value={broilerPrice}
                onChange={(e) => setBroilerPrice(Number(e.target.value))}
                className="w-full bg-transparent font-headline-sm text-[18px] font-bold text-[#121c2a] focus:outline-none"
                placeholder="8500"
              />
              <span className="font-semibold text-[13px] text-[#6d7b6c] shrink-0">/ kg</span>
            </div>

            {/* Quick Chips & Sak conversion */}
            <div className="flex items-center justify-between flex-wrap gap-1 text-[11px] text-[#6d7b6c]">
              <span>Setara <strong>Rp {(broilerPrice * 50).toLocaleString('id-ID')}</strong> / sak (50 kg)</span>
              <div className="flex items-center gap-1">
                {BROILER_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setBroilerPrice(p)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                      broilerPrice === p
                        ? 'bg-[#006e2f] text-white'
                        : 'bg-slate-100 text-[#3d4a3d] hover:bg-slate-200'
                    }`}
                  >
                    {(p / 1000).toFixed(1)}k
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input 2: Harga Pakan Layer */}
          <div className="bg-white rounded-[18px] p-4 border border-[#e5e7eb] flex flex-col gap-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006e2f] text-[20px]">egg</span>
                <label className="text-[13px] font-bold text-[#121c2a]">
                  Pakan Jadi Layer (Petelur)
                </label>
              </div>
              <span className="text-[11px] text-[#6d7b6c] bg-[#eff4ff] px-2 py-0.5 rounded-full font-medium">
                Pabrikan Komersil
              </span>
            </div>

            <div className="flex items-center bg-[#eff4ff] rounded-[14px] px-3.5 py-2.5 border border-[#e6eeff]">
              <span className="font-bold text-[14px] text-[#6d7b6c] mr-2">Rp</span>
              <input
                type="number"
                min="1000"
                step="50"
                required
                value={layerPrice}
                onChange={(e) => setLayerPrice(Number(e.target.value))}
                className="w-full bg-transparent font-headline-sm text-[18px] font-bold text-[#121c2a] focus:outline-none"
                placeholder="7500"
              />
              <span className="font-semibold text-[13px] text-[#6d7b6c] shrink-0">/ kg</span>
            </div>

            {/* Quick Chips & Sak conversion */}
            <div className="flex items-center justify-between flex-wrap gap-1 text-[11px] text-[#6d7b6c]">
              <span>Setara <strong>Rp {(layerPrice * 50).toLocaleString('id-ID')}</strong> / sak (50 kg)</span>
              <div className="flex items-center gap-1">
                {LAYER_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setLayerPrice(p)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                      layerPrice === p
                        ? 'bg-[#006e2f] text-white'
                        : 'bg-slate-100 text-[#3d4a3d] hover:bg-slate-200'
                    }`}
                  >
                    {(p / 1000).toFixed(1)}k
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-[#7cf994]/20 rounded-[18px] p-3.5 border border-[#7cf994]/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#006e2f] text-[22px]">trending_down</span>
              <div>
                <p className="font-label-sm text-[11px] text-[#006e2f] font-bold uppercase">
                  Simulasi Penghematan Broiler
                </p>
                <p className="font-body-sm text-[12px] text-[#121c2a] font-medium mt-0.5">
                  Jika racikan mandiri <strong>Rp {sampleSelfMixCost.toLocaleString('id-ID')}/kg</strong> vs pasar <strong>Rp {broilerPrice.toLocaleString('id-ID')}/kg</strong>:
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="font-headline-sm text-[15px] font-bold text-[#006e2f] block">
                {savingPercent > 0 ? `${savingPercent}% Lebih Murah` : 'Sama dengan Pasar'}
              </span>
              <span className="text-[11px] text-[#6d7b6c]">
                Hemat Rp {totalBatchSaving.toLocaleString('id-ID')} / 500kg
              </span>
            </div>
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="flex gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full bg-[#eff4ff] hover:bg-[#e6eeff] text-[#121c2a] font-bold text-[13px] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-full bg-[#22c55e] hover:bg-[#006e2f] text-white font-bold text-[13px] shadow-md transition-all active:scale-95"
            >
              Simpan Harga Pasar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


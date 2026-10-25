import React, { useState } from 'react';

interface HardwareCalibrationModalProps {
  onClose: () => void;
}

export const HardwareCalibrationModal: React.FC<HardwareCalibrationModalProps> = ({ onClose }) => {
  const [calibrating, setCalibrating] = useState<number | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);

  const hoppers = [
    { id: 1, name: 'Hopper 1 (Jagung)', pin: 'GPIO 21 / LoadCell A', precision: '± 5 gram' },
    { id: 2, name: 'Hopper 2 (Bungkil SBM)', pin: 'GPIO 22 / LoadCell B', precision: '± 4 gram' },
    { id: 3, name: 'Hopper 3 (Dedak Padi)', pin: 'GPIO 23 / LoadCell C', precision: '± 5 gram' },
    { id: 4, name: 'Hopper 4 (Mikro/Premix)', pin: 'GPIO 25 / LoadCell D', precision: '± 1 gram' },
  ];

  const handleTare = (id: number) => {
    setCalibrating(id);
    setTimeout(() => {
      setCalibrating(null);
      setSuccessId(id);
      setTimeout(() => setSuccessId(null), 2000);
    }, 1500);
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-t-[28px] sm:rounded-[24px] w-full max-w-md p-5 flex flex-col gap-4 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006e2f] text-[24px]">memory</span>
            <div>
              <h3 className="font-headline-sm text-[16px] text-[#121c2a] font-bold">Kalibrasi Mesin &amp; Hopper</h3>
              <p className="text-[11px] text-[#6d7b6c]">ESP32 Auto-Mixer v2.1 (OTG USB-C)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#6d7b6c]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Hardware Status */}
        <div className="p-3.5 bg-[#eff4ff] rounded-[16px] border border-[#e6eeff] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#22c55e] animate-ping"></span>
            <div>
              <p className="text-[12px] font-bold text-[#121c2a]">Mikrokontroler ESP32 Siap</p>
              <p className="text-[10px] text-[#6d7b6c]">Firmware v2.1.4 • Baudrate 115200</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-white rounded-full text-[10px] font-bold text-[#006e2f] border border-slate-200">
            Stabil
          </span>
        </div>

        {/* Hoppers List */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-bold uppercase text-[#6d7b6c] tracking-wider">
            Kalibrasi Titik Nol (Tare)
          </span>
          {hoppers.map((h) => (
            <div
              key={h.id}
              className="p-3 bg-white rounded-[16px] border border-[#e5e7eb] shadow-xs flex items-center justify-between"
            >
              <div>
                <p className="text-[13px] font-bold text-[#121c2a]">{h.name}</p>
                <p className="text-[10px] text-[#6d7b6c]">{h.pin} • {h.precision}</p>
              </div>

              <button
                onClick={() => handleTare(h.id)}
                disabled={calibrating === h.id}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold shadow-xs transition-all flex items-center gap-1 ${
                  successId === h.id
                    ? 'bg-emerald-100 text-[#006e2f]'
                    : 'bg-[#eff4ff] text-[#006e2f] hover:bg-[#22c55e] hover:text-white'
                }`}
              >
                {calibrating === h.id ? (
                  <>
                    <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                    <span>Menimbang...</span>
                  </>
                ) : successId === h.id ? (
                  <>
                    <span className="material-symbols-outlined text-[14px]">check</span>
                    <span>Nol Pas!</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[14px]">scale</span>
                    <span>Tare (Nol)</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Motor Test */}
        <div className="p-3 bg-[#f8f9ff] rounded-[16px] border border-[#e6eeff] flex items-center justify-between">
          <div>
            <p className="text-[12px] font-bold text-[#121c2a]">Uji Putaran Motor Mixer</p>
            <p className="text-[10px] text-[#6d7b6c]">Putar pelan 3 detik untuk tes mekanik</p>
          </div>
          <button
            onClick={() => alert('Motor mixer berputar uji 3 detik: Normal tanpa getaran berlebih.')}
            className="px-3.5 py-1.5 rounded-full bg-[#006e2f] text-white text-[11px] font-bold hover:bg-[#004b1e] active:scale-95"
          >
            Uji Motor
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-full bg-[#eff4ff] text-[#121c2a] font-bold text-[13px] hover:bg-[#e6eeff]"
        >
          Selesai &amp; Tutup
        </button>
      </div>
    </div>
  );
};

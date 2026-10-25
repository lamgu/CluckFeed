import React, { useState, useEffect } from 'react';
import { HopperItem } from '../types';
import { INITIAL_HOPPERS } from '../data/mockData';

interface DispenseScreenProps {
  batchName?: string;
  batchKg?: number;
  onBack: () => void;
}

export const DispenseScreen: React.FC<DispenseScreenProps> = ({
  batchName = 'Broiler Grower 500 kg',
  batchKg = 500,
  onBack
}) => {
  const [hoppers, setHoppers] = useState<HopperItem[]>(INITIAL_HOPPERS);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [mixerStatus, setMixerStatus] = useState<'Standby' | 'Mengaduk' | 'Selesai'>('Standby');
  const [isEmergencyStopped, setIsEmergencyStopped] = useState<boolean>(false);

  // Calculate overall progress
  const totalTargetKg = hoppers.reduce((acc, h) => acc + h.targetKg, 0);
  const totalCurrentKg = hoppers.reduce((acc, h) => acc + h.currentKg, 0);
  const overallPercentage = Math.min(100, Math.round((totalCurrentKg / totalTargetKg) * 100));

  // Live simulation ticker when running
  useEffect(() => {
    if (!isRunning || isEmergencyStopped || overallPercentage >= 100) return;

    const interval = setInterval(() => {
      setHoppers((prevHoppers) => {
        // Find first hopper that is not completed
        const next = [...prevHoppers];
        const activeIdx = next.findIndex(h => h.status === 'menimbang');

        if (activeIdx !== -1) {
          const hopper = { ...next[activeIdx] };
          hopper.currentKg = Math.min(hopper.targetKg, Number((hopper.currentKg + 2.5).toFixed(1)));
          
          if (hopper.currentKg >= hopper.targetKg) {
            hopper.status = 'selesai';
            // Start next hopper if available
            if (activeIdx + 1 < next.length) {
              next[activeIdx + 1] = {
                ...next[activeIdx + 1],
                status: 'menimbang',
                currentKg: 2.5
              };
            } else {
              setMixerStatus('Mengaduk');
            }
          }
          next[activeIdx] = hopper;
          return next;
        } else {
          // If all complete, start mixer
          setMixerStatus('Mengaduk');
          return next;
        }
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isRunning, isEmergencyStopped, overallPercentage]);

  const handleToggleDispense = () => {
    if (isEmergencyStopped) {
      setIsEmergencyStopped(false);
      setIsRunning(true);
      return;
    }
    setIsRunning(!isRunning);
  };

  const handleEmergencyStop = () => {
    setIsEmergencyStopped(true);
    setIsRunning(false);
  };

  const handleResetSimulation = () => {
    setHoppers(INITIAL_HOPPERS);
    setIsEmergencyStopped(false);
    setIsRunning(true);
    setMixerStatus('Standby');
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Scrollable Middle Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Top Context & Live Status Header */}
        <section className="px-4 pt-3 pb-3 flex flex-col gap-2.5">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block text-[11px] font-body-sm text-[#6d7b6c] font-semibold">
                Batch #084-BG
              </span>
              <h2 className="text-[20px] font-headline-md font-bold text-[#121c2a]">
                {batchName}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#7cf994]/40 flex items-center justify-center text-[#006e2f]">
              <span className="material-symbols-outlined text-[24px]">precision_manufacturing</span>
            </div>
          </div>

          {/* Status Chips Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eff4ff] text-[#3d4a3d] text-[11px] font-semibold shadow-xs border border-[#e6eeff]">
              <span className="material-symbols-outlined text-[15px] text-[#6d7b6c]">tune</span>
              <span>Mode Otomatis IoT</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#006e2f] text-[11px] font-bold shadow-xs border border-emerald-100">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isEmergencyStopped ? 'bg-red-500' : 'bg-[#22c55e]'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isEmergencyStopped ? 'bg-red-500' : 'bg-[#22c55e]'}`}></span>
              </span>
              <span className="text-[#121c2a]">
                {isEmergencyStopped ? 'STOP DARURAT AKTIF' : 'ESP32 / USB-C Terhubung'}
              </span>
            </div>
          </div>
        </section>

        {/* Emergency Alert Banner if stopped */}
        {isEmergencyStopped && (
          <div className="mx-4 mb-3 p-3 bg-red-100 border border-red-300 rounded-[18px] flex items-center justify-between gap-2 text-red-900">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600 text-[22px]">warning</span>
              <span className="text-[12px] font-bold">Mesin dihentikan secara darurat. Motor dispenser mati.</span>
            </div>
            <button
              onClick={handleResetSimulation}
              className="px-3 py-1 bg-red-600 text-white text-[11px] font-bold rounded-full hover:bg-red-700"
            >
              Reset
            </button>
          </div>
        )}

        {/* Overall Progress Card */}
      <section className="px-4 mb-3">
        <div className="bg-white rounded-[24px] p-4 shadow-xs border border-[#e5e7eb] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-[14px] bg-[#7cf994]/30 flex items-center justify-center text-[#006e2f]">
                <span className="material-symbols-outlined text-[22px]">scale</span>
              </div>
              <div>
                <span className="text-[11px] font-label-sm text-[#6d7b6c] uppercase tracking-wider font-semibold">
                  Progres Keseluruhan
                </span>
                <div className="text-[17px] font-headline-sm font-bold text-[#121c2a]">
                  {totalCurrentKg.toFixed(1)} <span className="text-[12px] text-[#6d7b6c] font-normal">/ {totalTargetKg.toFixed(1)} kg</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[24px] font-metric-display text-[#006e2f] font-extrabold">
                {overallPercentage}%
              </span>
            </div>
          </div>

          {/* Linear High-Glance Progress Bar */}
          <div className="w-full bg-[#eff4ff] h-3.5 rounded-full overflow-hidden p-0.5 border border-[#e6eeff]">
            <div
              className="bg-[#22c55e] h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-1"
              style={{ width: `${overallPercentage}%` }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs"></span>
            </div>
          </div>

          {/* Time estimate & Sub metrics */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-[#6d7b6c]">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#855300]">hourglass_top</span>
              <span className="font-medium text-[#121c2a]">
                {overallPercentage >= 100 ? 'Selesai ditimbang!' : 'Estimasi selesai: ± 3-4 Menit'}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[#006e2f] font-bold">
              <span className="material-symbols-outlined text-[15px]">speed</span>
              <span>1.8 kg/dtk</span>
            </div>
          </div>
        </div>
      </section>

      {/* Hopper Feeder List */}
      <section className="px-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[14px] font-headline-sm text-[#121c2a] font-bold">
            Status Wadah Bahan (Hopper)
          </h3>
          <span className="text-[11px] text-[#6d7b6c] font-medium">4 Wadah Aktif</span>
        </div>

        {hoppers.map((hopper) => {
          const hopperPct = Math.min(100, Math.round((hopper.currentKg / hopper.targetKg) * 100));
          const isDone = hopper.status === 'selesai' || hopperPct >= 100;
          const isActive = hopper.status === 'menimbang' && !isDone;

          return (
            <div
              key={hopper.id}
              className={`rounded-[20px] p-4 shadow-xs border transition-all flex flex-col gap-2.5 relative overflow-hidden ${
                isActive
                  ? 'bg-white border-[#22c55e] shadow-md'
                  : isDone
                  ? 'bg-white border-[#e5e7eb]'
                  : 'bg-white/80 border-[#e5e7eb] opacity-85'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#22c55e]"></div>
              )}

              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={`w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 transition-colors ${
                      isDone
                        ? 'bg-[#7cf994]/40 text-[#006e2f]'
                        : isActive
                        ? 'bg-[#7cf994]/30 text-[#006e2f]'
                        : 'bg-[#eff4ff] text-[#6d7b6c]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[24px]">
                      {hopper.icon}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-[13px] font-title-md font-bold text-[#121c2a] truncate">
                      {hopper.name}
                    </h4>
                    <div className="text-[11px] text-[#6d7b6c] truncate">
                      Target: <span className="font-semibold text-[#121c2a]">{hopper.targetKg.toFixed(1)} kg</span>
                    </div>
                  </div>
                </div>

                {/* Status Chip */}
                {isDone ? (
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#7cf994]/50 text-[#007230] text-[11px] font-bold shrink-0">
                    <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                    <span>Selesai</span>
                  </div>
                ) : isActive ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006e2f] text-white text-[11px] font-bold shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[13px] animate-spin">settings</span>
                    <span>Menimbang</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#eff4ff] text-[#6d7b6c] text-[11px] font-medium shrink-0">
                    <span className="material-symbols-outlined text-[13px]">schedule</span>
                    <span>Antrean</span>
                  </div>
                )}
              </div>

              {/* Progress Detail */}
              <div className="space-y-1.5 pt-1 pl-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#6d7b6c] font-medium">
                    {isActive ? 'Sedang Mengalir' : 'Tertimbang'}
                  </span>
                  <span className={`font-semibold ${isDone ? 'text-[#006e2f]' : 'text-[#121c2a]'}`}>
                    {hopper.currentKg.toFixed(1)} / {hopper.targetKg.toFixed(1)} kg ({hopperPct}%)
                  </span>
                </div>

                <div className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden border border-[#e6eeff]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 relative ${
                      isDone ? 'bg-[#22c55e]' : isActive ? 'bg-[#006e2f]' : 'bg-slate-300'
                    }`}
                    style={{ width: `${hopperPct}%` }}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-white/30 w-full animate-pulse"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Mixer Status Mini-bar Banner */}
      <section className="px-4 mt-4 mb-2">
        <div className="bg-[#eff4ff] rounded-[20px] p-4 flex items-center gap-3 text-[#121c2a] shadow-xs border border-[#e6eeff]">
          <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0 ${
            mixerStatus === 'Mengaduk' ? 'bg-[#22c55e] text-white animate-spin' : 'bg-[#e6eeff] text-[#006e2f]'
          }`}>
            <span className="material-symbols-outlined text-[20px]">blender</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-bold text-[#121c2a]">Status Mesin Mixer:</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                mixerStatus === 'Mengaduk'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-white text-[#6d7b6c] border border-slate-200'
              }`}>
                {mixerStatus}
              </span>
            </div>
            <p className="text-[11px] text-[#6d7b6c] truncate mt-0.5">
              {mixerStatus === 'Mengaduk'
                ? 'Sedang mencampur adonan ransum merata (15 menit)'
                : 'Akan menyala otomatis setelah penimbangan semua hopper selesai'}
            </p>
          </div>
        </div>
      </section>
      </div>

      {/* Pinned Bottom Control Panel (Always Fixed at Bottom) */}
      <div className="shrink-0 w-full bg-white/95 backdrop-blur-md px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-[#e6eeff] z-30">
        <div className="w-full flex items-center gap-3">
          {/* Emergency Stop Button */}
          <button
            type="button"
            onClick={handleEmergencyStop}
            className="h-12 px-4 rounded-full bg-[#ffdad6] text-[#93000a] flex items-center justify-center gap-1.5 font-label-lg text-[13px] font-bold active:scale-95 transition-all flex-shrink-0 border border-red-200"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              error
            </span>
            <span>Stop Darurat</span>
          </button>

          {/* Main Action Pill Button */}
          <button
            type="button"
            onClick={handleToggleDispense}
            className={`h-12 flex-1 rounded-full text-white flex items-center justify-center gap-2 font-label-lg text-[13px] font-bold shadow-md transition-all active:scale-95 ${
              isRunning ? 'bg-[#ef9900] hover:bg-[#855300]' : 'bg-[#22c55e] hover:bg-[#006e2f]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">
              {isRunning ? 'pause' : 'play_arrow'}
            </span>
            <span>{isRunning ? 'Jeda Dispense' : 'Lanjutkan Dispense'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

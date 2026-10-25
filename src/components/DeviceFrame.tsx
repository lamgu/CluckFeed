import React, { useState } from 'react';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const [deviceColor, setDeviceColor] = useState<'graphite' | 'silver' | 'emerald'>('graphite');
  const [showFrameOnDesktop, setShowFrameOnDesktop] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<'normal' | 'compact'>('normal');

  // Color styles for device border
  const borderColorClasses = {
    graphite: 'border-[#1e293b] ring-[#0f172a] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)]',
    silver: 'border-[#94a3b8] ring-[#64748b] shadow-[0_25px_60px_-15px_rgba(100,116,139,0.35)]',
    emerald: 'border-[#064e3b] ring-[#022c22] shadow-[0_25px_60px_-15px_rgba(6,78,59,0.4)]'
  };

  const buttonAccentClasses = {
    graphite: 'bg-[#334155]',
    silver: 'bg-[#cbd5e1]',
    emerald: 'bg-[#047857]'
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 md:bg-gradient-to-br md:from-slate-950 md:via-slate-900 md:to-emerald-950 flex flex-col items-center justify-start md:justify-center py-2 md:py-4 overflow-y-auto relative selection:bg-emerald-500 selection:text-white">
      {/* Background Decorative Ambient Gradients (Desktop) */}
      <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse [animation-delay:1.5s]"></div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* Desktop Preview Header Toolbar */}
      <div className="hidden md:flex items-center justify-between w-full max-w-4xl px-6 py-3.5 z-30 mb-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/60 shadow-sm text-xs font-semibold text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-3.5"></span>
            <span>CluckFeed Mobile UI Preview</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span className="px-2 py-0.5 rounded-md bg-slate-800/60 border border-slate-700/40 text-slate-300">
              412 × 860 px
            </span>
            <span className="text-slate-500">•</span>
            <span>Android / iOS App</span>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Color Switcher */}
          <div className="flex items-center bg-slate-800/80 backdrop-blur-md p-1 rounded-full border border-slate-700/60">
            <button
              onClick={() => setDeviceColor('graphite')}
              title="Warna Titanium Hitam"
              className={`w-6 h-6 rounded-full bg-slate-800 border-2 transition-all ${
                deviceColor === 'graphite' ? 'border-emerald-400 scale-110' : 'border-transparent opacity-60'
              }`}
            />
            <button
              onClick={() => setDeviceColor('silver')}
              title="Warna Titanium Silver"
              className={`w-6 h-6 rounded-full bg-slate-400 border-2 transition-all ml-1 ${
                deviceColor === 'silver' ? 'border-emerald-400 scale-110' : 'border-transparent opacity-60'
              }`}
            />
            <button
              onClick={() => setDeviceColor('emerald')}
              title="Warna Farm Emerald"
              className={`w-6 h-6 rounded-full bg-emerald-700 border-2 transition-all ml-1 ${
                deviceColor === 'emerald' ? 'border-emerald-400 scale-110' : 'border-transparent opacity-60'
              }`}
            />
          </div>

          {/* Zoom toggle */}
          <button
            onClick={() => setZoomLevel(zoomLevel === 'normal' ? 'compact' : 'normal')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/60 transition-all"
            title="Ubah skala tampilan"
          >
            <span className="material-symbols-outlined text-[15px]">aspect_ratio</span>
            <span>{zoomLevel === 'normal' ? '100%' : '90%'}</span>
          </button>

          {/* Status Label */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 text-emerald-400 text-xs font-semibold border border-slate-700/60 shadow-xs">
            <span className="material-symbols-outlined text-[16px]">smartphone</span>
            <span>Ukuran HP Konstan (412px)</span>
          </div>
        </div>
      </div>

      {/* Main Wrapper: Constant Smartphone Shell */}
      <div className="w-full flex justify-center items-center relative z-20 py-1 md:py-2">
        <div
          className={`relative transition-all duration-300 ${
            zoomLevel === 'compact' ? 'scale-90 origin-center' : 'scale-100'
          }`}
        >
          {/* Phone Physical Buttons (Left Side: Volume Up & Down & Action) */}
          <div className="hidden md:block absolute -left-[14px] top-28 w-[4px] h-9 rounded-l-md bg-slate-700 shadow-xs" />
          <div className="hidden md:block absolute -left-[14px] top-42 w-[4px] h-12 rounded-l-md bg-slate-700 shadow-xs" />
          <div className="hidden md:block absolute -left-[14px] top-58 w-[4px] h-12 rounded-l-md bg-slate-700 shadow-xs" />

          {/* Phone Physical Buttons (Right Side: Power Button) */}
          <div className="hidden md:block absolute -right-[14px] top-36 w-[4px] h-16 rounded-r-md bg-slate-700 shadow-xs" />

          {/* Outer Bezel (Curved Smartphone Edge) */}
          <div
            className={`w-[412px] max-w-[100vw] h-screen md:h-[860px] md:max-h-[94vh] rounded-none md:rounded-[50px] border-0 md:border-[11px] md:ring-1 bg-[#121c2a] flex flex-col relative overflow-hidden transition-all duration-300 shadow-2xl ${borderColorClasses[deviceColor]}`}
          >
            {/* Inner Gloss Edge Highlight (Simulating 2.5D Curved Glass) */}
            <div className="hidden md:block absolute inset-0 rounded-[39px] pointer-events-none border border-white/10 z-50"></div>

            {/* Status Bar / Dynamic Island (Desktop Only) */}
            <div className="hidden md:flex w-full h-10 shrink-0 bg-white/95 backdrop-blur-md items-center justify-between px-7 z-40 border-b border-[#e6eeff]/60 select-none">
              {/* Status Time */}
              <span className="text-[13px] font-bold tracking-tight text-slate-800">09:41</span>

              {/* Dynamic Island Pill Notch */}
              <div className="w-24 h-5 rounded-full bg-black flex items-center justify-end pr-2 gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#1e293b] border border-slate-700/60"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </div>

              {/* Status Icons (Signal, Wifi, Battery) */}
              <div className="flex items-center gap-1.5 text-slate-800">
                <span className="material-symbols-outlined text-[15px]">signal_cellular_4_bar</span>
                <span className="material-symbols-outlined text-[15px]">wifi</span>
                <div className="flex items-center gap-0.5 border border-slate-800/80 rounded-xs px-0.5 h-3">
                  <span className="w-3.5 h-2 bg-[#22c55e] rounded-2xs"></span>
                </div>
              </div>
            </div>

            {/* Screen Inner Viewport Container */}
            <div
              id="phone-screen-container"
              className="w-full flex-1 bg-[#f8f9ff] flex flex-col relative overflow-hidden min-h-0"
            >
              {children}
            </div>

            {/* Phone Bottom Home Bar Indicator (Desktop Only) */}
            <div className="hidden md:flex w-full h-5 shrink-0 bg-white items-center justify-center pointer-events-none z-40 border-t border-[#e6eeff]/60">
              <div className="w-32 h-1 bg-slate-900/30 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer subtle attribution */}
      <div className="hidden md:flex items-center justify-center gap-2 text-xs text-slate-500 py-3 z-20">
        <span>Pratinjau Mobile Responsif</span>
        <span>•</span>
        <span>Aplikasi Formulasi Pakan &amp; Mesin Mixer IoT Ternak Ayam</span>
      </div>
    </div>
  );
};

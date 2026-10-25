import React from 'react';

export type TabKey = 'beranda' | 'riwayat' | 'asisten-ai' | 'profil';

interface BottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'beranda', label: 'Beranda', icon: 'home' },
    { key: 'riwayat', label: 'Riwayat', icon: 'history' },
    { key: 'asisten-ai', label: 'Asisten AI', icon: 'smart_toy' },
    { key: 'profil', label: 'Profil', icon: 'account_circle' }
  ];

  return (
    <nav className="shrink-0 w-full z-30 bg-[#ffffff]/95 backdrop-blur-xl border-t border-[#e6eeff] shadow-[0_-2px_12px_rgba(0,0,0,0.05)]">
      <div className="w-full mx-auto flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all select-none ${
                isActive
                  ? 'text-[#006e2f] font-semibold'
                  : 'text-[#6d7b6c] hover:text-[#121c2a]'
              }`}
            >
              <div
                className={`px-3.5 py-1 rounded-full flex items-center justify-center transition-all ${
                  isActive ? 'bg-[#7cf994]/40 scale-105' : 'bg-transparent'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {tab.icon}
                </span>
              </div>
              <span className="font-label-sm text-[11px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

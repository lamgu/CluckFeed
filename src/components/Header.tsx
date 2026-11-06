import React from 'react';
import { TabKey } from './BottomNav';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  onHomeClick?: () => void;
  activeTab?: TabKey;
  onTabChange?: (tab: TabKey) => void;
  showNavTabs?: boolean;
}

export const CLUCKFEED_LOGO_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuBN-c5tesNYueb9YcewleNxz-dJiXGLUNzrUkZSQg7IYEbkf3ie16kCT_-iMLBcM5WnAJ-1ivFJPpk0sZFwhLxg1MIz8mcBygdod6UYSgOBXrmP1cHhRQOTgZtLilPJytI_HsGIRAL7PipP8fmzyvx-mwLu8hfw2qDOIiDN6IZ07joIX8jghi4Q13SuXzK_3MNM4pWp5Uv8hH2XgLEMrzkWDJPrzn8NLNMf3SDIi4CwojjO9RDo3gWR";
export const BUDI_AVATAR_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuCmd2baTHUlE3ByLaSwjCaA5qWKkvGNuvRhKlMigv6gmIzOdxTBtbSLPMBm2wlbO971dIi965QVcftYP7rh2Xqv5DMLxMV8d-AjRRW9jG2Jql8hvzA7L91_gdLSY90iw8aP0HpsK-LhtO_f3AdRSZZxVdqSX9Vjh6z-GXWghZPu9x_Cd3JzyvHlZ5bH3_8qsEBwnkz3who9fDbP1dbCtqD1U5_hU1v45gDjhgFm2YqfRydCdBEQc_k2";

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  onNotificationClick,
  onProfileClick,
  onHomeClick,
  activeTab,
  onTabChange,
  showNavTabs = false
}) => {
  const desktopTabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'beranda', label: 'Beranda', icon: 'home' },
    { key: 'riwayat', label: 'Riwayat', icon: 'history' },
    { key: 'asisten-ai', label: 'Asisten AI', icon: 'smart_toy' },
    { key: 'matrix', label: 'Matrix', icon: 'table_chart' },
    { key: 'profil', label: 'Profil', icon: 'account_circle' }
  ];

  return (
    <header className="shrink-0 w-full z-30 bg-[#ffffff]/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e6eeff]">
      <div className="max-w-7xl w-full mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <div
          onClick={onHomeClick}
          className={`flex items-center gap-3 min-w-0 ${onHomeClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
          title={onHomeClick ? 'Klik untuk kembali ke Beranda' : undefined}
        >
          {showBack && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onBack) onBack();
              }}
              aria-label="Kembali"
              className="w-10 h-10 -ml-1 flex items-center justify-center rounded-full text-[#121c2a] hover:bg-[#eff4ff] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
          )}

          <img
            alt="CluckFeed Logo"
            className="h-8 w-auto object-contain shrink-0"
            src={CLUCKFEED_LOGO_URL}
          />

          <div className="flex flex-col min-w-0">
            {title ? (
              <h1 className="font-headline-sm text-[16px] text-[#121c2a] font-semibold truncate leading-tight">
                {title}
              </h1>
            ) : (
              <span className="font-headline-sm text-[17px] text-[#006e2f] font-bold tracking-tight leading-none">
                CluckFeed
              </span>
            )}
            <span className="font-label-sm text-[11px] text-[#3d4a3d] font-medium leading-tight truncate">
              {subtitle || 'Formulasi Pakan Presisi'}
            </span>
          </div>
        </div>

        {/* Desktop Web Navigation Tabs */}
        {showNavTabs && onTabChange && (
          <nav className="hidden md:flex items-center gap-1 bg-[#eff4ff] p-1.5 rounded-full border border-[#e6eeff] shadow-xs">
            {desktopTabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => onTabChange(tab.key)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-[#006e2f] shadow-xs font-bold'
                      : 'text-[#6d7b6c] hover:text-[#121c2a] hover:bg-white/60'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-2 shrink-0">
          {onHomeClick && (
            <button
              onClick={onHomeClick}
              aria-label="Ke Beranda"
              title="Kembali ke Beranda"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#eff4ff] hover:bg-[#e6eeff] text-[#006e2f] border border-[#e6eeff] font-label-md text-[12px] font-bold shadow-xs active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">home</span>
              <span className="hidden sm:inline">Beranda</span>
            </button>
          )}

          <button
            onClick={onNotificationClick}
            aria-label="Notifikasi"
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#3d4a3d] hover:bg-[#eff4ff] transition-colors relative"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ef9900]" />
          </button>

          <button
            onClick={onProfileClick}
            aria-label="Profil Peternak"
            className="w-8 h-8 rounded-full bg-[#006e2f] flex items-center justify-center hover:opacity-90 active:scale-95 transition-all overflow-hidden border border-emerald-600 shadow-xs"
          >
            <span className="material-symbols-outlined text-white text-[18px]">person</span>
          </button>
        </div>
      </div>
    </header>
  );
};

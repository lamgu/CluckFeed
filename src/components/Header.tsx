import React from 'react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
}

export const CLUCKFEED_LOGO_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuBN-c5tesNYueb9YcewleNxz-dJiXGLUNzrUkZSQg7IYEbkf3ie16kCT_-iMLBcM5WnAJ-1ivFJPpk0sZFwhLxg1MIz8mcBygdod6UYSgOBXrmP1cHhRQOTgZtLilPJytI_HsGIRAL7PipP8fmzyvx-mwLu8hfw2qDOIiDN6IZ07joIX8jghi4Q13SuXzK_3MNM4pWp5Uv8hH2XgLEMrzkWDJPrzn8NLNMf3SDIi4CwojjO9RDo3gWR";
export const BUDI_AVATAR_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuCmd2baTHUlE3ByLaSwjCaA5qWKkvGNuvRhKlMigv6gmIzOdxTBtbSLPMBm2wlbO971dIi965QVcftYP7rh2Xqv5DMLxMV8d-AjRRW9jG2Jql8hvzA7L91_gdLSY90iw8aP0HpsK-LhtO_f3AdRSZZxVdqSX9Vjh6z-GXWghZPu9x_Cd3JzyvHlZ5bH3_8qsEBwnkz3who9fDbP1dbCtqD1U5_hU1v45gDjhgFm2YqfRydCdBEQc_k2";

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  onNotificationClick,
  onProfileClick
}) => {
  return (
    <header className="shrink-0 w-full z-30 bg-[#ffffff]/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e6eeff]">
      <div className="w-full mx-auto h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {showBack && (
            <button
              onClick={onBack}
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

        <div className="flex items-center gap-1.5 shrink-0">
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

import React from 'react';
import { Shirt, MessageSquare, Sun, Moon } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  profile?: UserProfile;
  wardrobeCount: number;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab: _currentTab,
  setCurrentTab,
  profile,
  wardrobeCount,
  theme,
  setTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-studio-bg/95 backdrop-blur-xl border-b border-studio-border px-4 md:px-8 py-3.5 flex items-center justify-between transition-colors duration-200">
      {/* Editorial Brand Identity */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
        <div className="w-9 h-9 rounded-lg bg-studio-text text-studio-bg flex items-center justify-center font-display font-black text-sm tracking-tighter shadow-studio-sm">
          DV
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold tracking-tight text-studio-text font-display">
              DRIPVERSE
            </h1>
            <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-studio-secondary text-studio-text border border-studio-border font-semibold">
              WHITE STUDIO
            </span>
          </div>
          <p className="hidden md:block text-[10px] text-studio-muted font-normal tracking-wide">
            AI PERSONAL FASHION STUDIO
          </p>
        </div>
      </div>

      {/* Center Actions / Quick Stats */}
      <div className="hidden lg:flex items-center space-x-4">
        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-studio-secondary border border-studio-border text-xs">
          <Shirt className="w-3.5 h-3.5 text-studio-text" />
          <span className="text-studio-muted font-medium">Vault:</span>
          <span className="text-studio-text font-semibold">{wardrobeCount} pieces</span>
        </div>

        <button
          onClick={() => setCurrentTab('stylist')}
          className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-studio-secondary hover:bg-studio-border/50 border border-studio-border text-xs font-semibold text-studio-text transition-all"
        >
          <MessageSquare className="w-3.5 h-3.5 text-studio-text" />
          <span>Ask MIRA Stylist</span>
        </button>
      </div>

      {/* Right End: Theme Switcher & User Profile */}
      <div className="flex items-center space-x-3 md:space-x-4">
        {/* Theme Toggle Pill (Light Studio vs Dark Studio) */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-studio-secondary border border-studio-border hover:border-studio-text/40 text-xs font-medium text-studio-text transition-all"
          title={`Switch to ${theme === 'light' ? 'Dark Studio' : 'Light Studio'}`}
        >
          {theme === 'light' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline text-[11px] font-semibold">Light Studio</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-violet-400" />
              <span className="hidden sm:inline text-[11px] font-semibold">Dark Studio</span>
            </>
          )}
        </button>

        {/* User Profile Pill */}
        <button
          onClick={() => setCurrentTab('settings')}
          className="flex items-center space-x-2.5 p-1 md:pr-3 rounded-full bg-studio-secondary border border-studio-border hover:border-studio-text/40 transition-all shadow-studio-sm"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-inner bg-studio-text"
          >
            {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : 'A'}
          </div>
          <span className="hidden md:inline text-xs font-semibold text-studio-text">
            {profile?.display_name || 'Alex Rivera'}
          </span>
        </button>
      </div>
    </header>
  );
};

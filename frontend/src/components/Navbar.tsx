import React from 'react';
import { Sparkles, Shirt, MessageSquare, Cpu, User } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  profile?: UserProfile;
  wardrobeCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  profile,
  wardrobeCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-drip-dark/80 backdrop-blur-xl border-b border-white/[0.08] px-4 md:px-8 py-3.5 flex items-center justify-between">
      {/* Brand Identity */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-500 to-indigo-500 p-0.5 flex items-center justify-center shadow-glow-sm">
          <div className="w-full h-full bg-drip-dark rounded-[10px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-violet-400 animate-pulse-subtle" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight text-white font-display">
              DRIP<span className="text-violet-400">VERSE</span>
            </h1>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
              Studio v1.0
            </span>
          </div>
          <p className="hidden md:block text-[11px] text-zinc-400">
            Your Wardrobe. Your Creativity. Your Style.
          </p>
        </div>
      </div>

      {/* Center Actions / Quick Stats */}
      <div className="hidden lg:flex items-center space-x-6">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-white/10 text-xs">
          <Shirt className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-zinc-400 font-medium">Wardrobe:</span>
          <span className="text-white font-semibold">{wardrobeCount} items</span>
        </div>

        <button
          onClick={() => setCurrentTab('stylist')}
          className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-600/20 to-purple-600/20 hover:from-violet-600/30 hover:to-purple-600/30 border border-violet-500/30 text-xs font-medium text-violet-300 transition-all hover:scale-[1.02]"
        >
          <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
          <span>Ask MIRA Stylist</span>
        </button>
      </div>

      {/* Right End: AI Status & User */}
      <div className="flex items-center space-x-3 md:space-x-4">
        {/* Active AI Engine Badge */}
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <Cpu className="w-3 h-3 text-emerald-400" />
          <span>Neural Engine Active</span>
        </div>

        {/* User Profile Pill */}
        <button
          onClick={() => setCurrentTab('settings')}
          className="flex items-center space-x-2.5 p-1 md:pr-3 rounded-full bg-zinc-900/90 border border-white/10 hover:border-violet-500/40 transition-all"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-inner"
            style={{ backgroundColor: profile?.skin_tone || '#8b5cf6' }}
          >
            {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : 'A'}
          </div>
          <span className="hidden md:block text-xs font-medium text-zinc-200">
            {profile?.display_name || 'Alex Rivera'}
          </span>
        </button>
      </div>
    </header>
  );
};

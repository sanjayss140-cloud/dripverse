import React from 'react';
import {
  Home,
  Shirt,
  Sparkles,
  UserCheck,
  Bot,
  Layers,
  Swords,
  Palette,
  BookmarkCheck,
  Calendar,
  Sliders,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home, badge: null },
    { id: 'wardrobe', label: 'My Wardrobe', icon: Shirt, badge: 'Vault' },
    { id: 'tryon', label: 'Virtual Try-On', icon: Sparkles, badge: 'Signature' },
    { id: 'avatar-studio', label: 'Avatar Studio', icon: UserCheck, badge: '6 Models' },
    { id: 'stylist', label: 'AI Stylist MIRA', icon: Bot, badge: 'Pro' },
    { id: 'outfit-creator', label: 'Outfit Creator', icon: Layers, badge: 'Surprise' },
    { id: 'outfit-battle', label: 'Outfit Battle', icon: Swords, badge: 'A vs B' },
    { id: 'color-lab', label: 'Colour Match Lab', icon: Palette, badge: null },
    { id: 'saved-looks', label: 'Saved Looks', icon: BookmarkCheck, badge: null },
    { id: 'planner', label: 'Outfit Planner', icon: Calendar, badge: 'Weekly' },
    { id: 'settings', label: 'Profile & Settings', icon: Sliders, badge: null },
  ];

  const handleSelect = (id: string) => {
    setCurrentTab(id);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="p-3.5 rounded-full bg-violet-600 text-white shadow-glow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          {isOpenMobile ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 md:top-[65px] left-0 z-40 h-full md:h-[calc(100vh-65px)] w-64 bg-[#09090e] md:bg-transparent border-r border-white/[0.07] p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          <div className="px-3 pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-display">
              Navigation
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-violet-600/15 text-violet-300 border border-violet-500/30 shadow-glow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-violet-400' : 'text-zinc-500 group-hover:text-zinc-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? 'bg-violet-500/20 text-violet-300'
                          : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* MIRA Banner Pill */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-950/40 via-purple-900/20 to-zinc-900/80 border border-violet-500/20 mt-6">
          <div className="flex items-center space-x-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-violet-300">MIRA Online</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed mb-2.5">
            Ready to give respectful fashion guidance on any look.
          </p>
          <button
            onClick={() => handleSelect('stylist')}
            className="w-full py-1.5 px-3 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/30 text-white text-[11px] font-medium flex items-center justify-center space-x-1.5 transition-all"
          >
            <span>Consult MIRA</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </aside>
    </>
  );
};

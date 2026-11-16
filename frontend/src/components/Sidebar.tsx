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
    { id: 'dashboard', num: '01', label: 'Home', icon: Home },
    { id: 'wardrobe', num: '02', label: 'My Wardrobe', icon: Shirt },
    { id: 'tryon', num: '03', label: 'Virtual Try-On', icon: Sparkles },
    { id: 'avatar-studio', num: '04', label: 'Avatar Studio', icon: UserCheck },
    { id: 'stylist', num: '05', label: 'AI Stylist MIRA', icon: Bot },
    { id: 'outfit-creator', num: '06', label: 'Outfit Creator', icon: Layers },
    { id: 'outfit-battle', num: '07', label: 'Outfit Battle', icon: Swords },
    { id: 'color-lab', num: '08', label: 'Colour Match Lab', icon: Palette },
    { id: 'saved-looks', num: '09', label: 'Saved Looks', icon: BookmarkCheck },
    { id: 'planner', num: '10', label: 'Outfit Planner', icon: Calendar },
    { id: 'settings', num: '11', label: 'Profile & Settings', icon: Sliders },
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
          className="p-3.5 rounded-full bg-studio-text text-studio-bg shadow-studio-md flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          {isOpenMobile ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 md:top-[65px] left-0 z-40 h-full md:h-[calc(100vh-65px)] w-64 bg-studio-bg border-r border-studio-border p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          <div className="px-3 pt-2 flex items-center justify-between border-b border-studio-border pb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-studio-muted">
              STUDIO NAVIGATION
            </span>
            <span className="text-[10px] font-mono text-studio-subtle">v1.0</span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all group ${
                    isActive
                      ? 'bg-studio-text text-studio-bg font-semibold shadow-studio-sm'
                      : 'text-studio-muted hover:text-studio-text hover:bg-studio-secondary'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`text-[10px] font-mono ${isActive ? 'text-studio-bg/60' : 'text-studio-subtle'}`}>
                      {item.num}
                    </span>
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-studio-bg' : 'text-studio-muted group-hover:text-studio-text'
                      }`}
                    />
                    <span className="font-medium tracking-tight">{item.label}</span>
                  </div>

                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-studio-bg" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Minimal MIRA Editorial Box */}
        <div className="p-3.5 rounded-2xl bg-studio-secondary border border-studio-border mt-6">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold tracking-tight text-studio-text">MIRA STYLIST</span>
            </div>
            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-studio-bg text-studio-muted border border-studio-border">
              ONLINE
            </span>
          </div>
          <p className="text-[11px] text-studio-muted leading-relaxed mb-3">
            Respectful fashion guidance calibrated to your wardrobe.
          </p>
          <button
            onClick={() => handleSelect('stylist')}
            className="w-full py-1.5 px-3 rounded-lg bg-studio-text hover:bg-studio-text/90 text-studio-bg text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-studio-sm"
          >
            <span>Consult MIRA</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </aside>
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { UploadModal } from './components/UploadModal';
import { EditItemModal } from './components/EditItemModal';

import { DashboardView } from './views/DashboardView';
import { WardrobeView } from './views/WardrobeView';
import { TryOnView } from './views/TryOnView';
import { AvatarStudioView } from './views/AvatarStudioView';
import { StylistView } from './views/StylistView';
import { OutfitCreatorView } from './views/OutfitCreatorView';
import { OutfitBattleView } from './views/OutfitBattleView';
import { ColorLabView } from './views/ColorLabView';
import { SavedLooksView } from './views/SavedLooksView';
import { PlannerView } from './views/PlannerView';
import { SettingsView } from './views/SettingsView';

import { User, UserProfile, WardrobeItem, VirtualModelOption, TryOnResponse } from './types';
import { api } from './api';
import { Loader2 } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [models, setModels] = useState<VirtualModelOption[]>([]);
  const [outfits, setOutfits] = useState<TryOnResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals & Navigation Bridge State
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<WardrobeItem | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Hand-off states between views
  const [selectedTryOnUpper, setSelectedTryOnUpper] = useState<WardrobeItem | null>(null);
  const [miraPreloadedOutfit, setMiraPreloadedOutfit] = useState<TryOnResponse | null>(null);

  const loadInitialData = async () => {
    try {
      const [userData, wardrobeData, modelsData, outfitsData] = await Promise.all([
        api.getMe(),
        api.getWardrobeItems(),
        api.getVirtualModels(),
        api.getTryOnHistory(),
      ]);

      setUser(userData);
      setWardrobe(wardrobeData);
      setModels(modelsData);
      setOutfits(outfitsData);
    } catch (err) {
      console.error('Data loading note:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Handlers for cross-view actions
  const handleSelectForTryOn = (item: WardrobeItem) => {
    if (item.category === 'UPPERWEAR') setSelectedTryOnUpper(item);
    setCurrentTab('tryon');
  };

  const handleAskMira = (outfit: TryOnResponse) => {
    setMiraPreloadedOutfit(outfit);
    setCurrentTab('stylist');
  };

  const handleSendItemsToTryOn = (items: WardrobeItem[]) => {
    const upper = items.find((i) => i.category === 'UPPERWEAR');
    if (upper) setSelectedTryOnUpper(upper);
    setCurrentTab('tryon');
  };

  const handleReopenTryOn = (outfit: TryOnResponse) => {
    setCurrentTab('tryon');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-drip-dark flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center animate-bounce">
          <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
        </div>
        <p className="text-xs font-semibold text-zinc-400 font-display tracking-widest uppercase">
          Initializing DRIPVERSE Studio...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-drip-dark text-zinc-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        profile={user?.profile}
        wardrobeCount={wardrobe.length}
      />

      {/* Main Body with Sidebar + Active View */}
      <div className="flex-1 flex w-full">
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          isOpenMobile={isMobileSidebarOpen}
          setIsOpenMobile={setIsMobileSidebarOpen}
        />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              wardrobe={wardrobe}
              outfits={outfits}
              profile={user?.profile}
              setCurrentTab={setCurrentTab}
              openUploadModal={() => setIsUploadOpen(true)}
            />
          )}

          {currentTab === 'wardrobe' && (
            <WardrobeView
              wardrobe={wardrobe}
              onRefresh={async () => {
                const updated = await api.getWardrobeItems();
                setWardrobe(updated);
              }}
              openUploadModal={() => setIsUploadOpen(true)}
              onEditItem={(item) => setEditingItem(item)}
              onSelectForTryOn={handleSelectForTryOn}
            />
          )}

          {currentTab === 'tryon' && (
            <TryOnView
              wardrobe={wardrobe}
              models={models}
              profile={user?.profile}
              initialSelectedUpper={selectedTryOnUpper}
              onOutfitGenerated={(newOutfit) => {
                setOutfits((prev) => [newOutfit, ...prev]);
              }}
              onAskMira={handleAskMira}
            />
          )}

          {currentTab === 'avatar-studio' && (
            <AvatarStudioView
              models={models}
              profile={user?.profile}
              onProfileUpdated={(updated) => {
                setUser((prev) => (prev ? { ...prev, profile: updated } : null));
              }}
            />
          )}

          {currentTab === 'stylist' && (
            <StylistView
              wardrobe={wardrobe}
              outfits={outfits}
              preloadedOutfit={miraPreloadedOutfit}
              onSelectWardrobeItem={handleSelectForTryOn}
            />
          )}

          {currentTab === 'outfit-creator' && (
            <OutfitCreatorView
              wardrobe={wardrobe}
              onSendToTryOn={handleSendItemsToTryOn}
            />
          )}

          {currentTab === 'outfit-battle' && (
            <OutfitBattleView wardrobe={wardrobe} />
          )}

          {currentTab === 'color-lab' && (
            <ColorLabView
              wardrobe={wardrobe}
              onSelectForTryOn={handleSelectForTryOn}
            />
          )}

          {currentTab === 'saved-looks' && (
            <SavedLooksView
              outfits={outfits}
              onReopenTryOn={handleReopenTryOn}
              onRefreshOutfits={async () => {
                const refreshed = await api.getTryOnHistory();
                setOutfits(refreshed);
              }}
            />
          )}

          {currentTab === 'planner' && (
            <PlannerView
              outfits={outfits}
              onOpenTryOn={handleReopenTryOn}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              profile={user?.profile}
              onProfileUpdated={(updated) => {
                setUser((prev) => (prev ? { ...prev, profile: updated } : null));
              }}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={(newItems) => {
          setWardrobe((prev) => [...newItems, ...prev]);
        }}
      />

      <EditItemModal
        item={editingItem}
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        onSave={(updated) => {
          setWardrobe((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
        }}
      />
    </div>
  );
}

export default App;

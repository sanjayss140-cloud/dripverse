import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Shuffle,
  X,
  Star,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { WardrobeItem } from '../types';
import { api } from '../api';
import confetti from 'canvas-confetti';

interface OutfitCreatorViewProps {
  wardrobe: WardrobeItem[];
  onSendToTryOn: (items: WardrobeItem[]) => void;
}

export const OutfitCreatorView: React.FC<OutfitCreatorViewProps> = ({
  wardrobe,
  onSendToTryOn,
}) => {
  const [selectedItems, setSelectedItems] = useState<WardrobeItem[]>([]);
  const [excludedIds, setExcludedIds] = useState<number[]>([]);
  const [isSurpriseLoading, setIsSurpriseLoading] = useState<boolean>(false);
  const [surpriseResult, setSurpriseResult] = useState<any>(null);

  const toggleSelectItem = (item: WardrobeItem) => {
    if (selectedItems.some((i) => i.id === item.id)) {
      setSelectedItems((prev) => prev.filter((i) => i.id !== item.id));
    } else {
      setSelectedItems((prev) => [...prev, item]);
    }
  };

  const toggleExcludeItem = (itemId: number) => {
    if (excludedIds.includes(itemId)) {
      setExcludedIds((prev) => prev.filter((id) => id !== itemId));
    } else {
      setExcludedIds((prev) => [...prev, itemId]);
      setSelectedItems((prev) => prev.filter((i) => i.id !== itemId));
    }
  };

  const handleSurpriseMe = async () => {
    setIsSurpriseLoading(true);
    setSurpriseResult(null);

    try {
      const res = await api.surpriseMe({
        excluded_item_ids: excludedIds,
        preferred_occasion: 'Casual Day Out',
      });
      setSurpriseResult(res);
      setSelectedItems(res.selected_items || []);

      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#171717', '#7547D9', '#EAEAEA'],
        });
      } catch (e) {}
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSurpriseLoading(false);
    }
  };

  // Color & Style Harmony calculation
  const colors = selectedItems.map((i) => i.main_color);
  const isDiverse = new Set(colors).size <= 3;
  const compatibilityScore = selectedItems.length >= 2 ? (isDiverse ? 9.6 : 9.1) : 8.5;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-studio-border pb-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-studio-secondary border border-studio-border text-studio-text text-[11px] font-mono tracking-widest uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-studio-text" />
            <span>WARDROBE COMBINATOR • WHITE STUDIO</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-studio-text font-display">Outfit Creator</h2>
          <p className="text-xs text-studio-muted">
            Experiment with garment layering or let our anti-repetition Surprise Me algorithm compose fresh looks.
          </p>
        </div>

        {/* Surprise Me Signature Button */}
        <button
          onClick={handleSurpriseMe}
          disabled={isSurpriseLoading}
          className="px-6 py-3 rounded-xl bg-studio-text hover:bg-studio-text/90 disabled:opacity-40 text-studio-bg font-extrabold text-xs sm:text-sm flex items-center space-x-2.5 transition-all shadow-studio-sm hover:scale-[1.01]"
        >
          {isSurpriseLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-studio-bg" />
              <span>Synthesizing Combinations...</span>
            </>
          ) : (
            <>
              <Shuffle className="w-4 h-4 text-studio-bg" />
              <span>SURPRISE ME FIT</span>
            </>
          )}
        </button>
      </div>

      {/* Two Column Layout: Active Canvas + Wardrobe Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Stage (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl border border-studio-border bg-studio-bg space-y-5 shadow-studio-card">
            <div className="flex items-center justify-between pb-3 border-b border-studio-border">
              <h3 className="text-sm font-bold text-studio-text font-display">
                Current Combination ({selectedItems.length})
              </h3>
              <div className="flex items-center space-x-1.5 text-xs text-studio-text font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{compatibilityScore}/10 Synergy</span>
              </div>
            </div>

            {selectedItems.length === 0 ? (
              <div className="text-center py-12 text-studio-muted text-xs space-y-2">
                <p className="font-semibold text-studio-text">No garments selected yet.</p>
                <p className="text-[11px] text-studio-muted">
                  Select items from the right, or press <span className="text-studio-text font-bold">SURPRISE ME FIT</span>.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-studio-secondary border border-studio-border flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.clean_image_url || item.image_url}
                        alt={item.name}
                        className="w-12 h-12 object-contain rounded-lg bg-studio-bg p-1 border border-studio-border"
                      />
                      <div>
                        <p className="text-xs font-semibold text-studio-text truncate max-w-[170px]">{item.name}</p>
                        <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-studio-muted">
                          <span className="font-mono">{item.category}</span>
                          <span>•</span>
                          <span>{item.main_color}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSelectItem(item)}
                      className="p-1.5 rounded-lg text-studio-muted hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Surprise Me Notes / MIRA feedback */}
            {surpriseResult && (
              <div className="p-4 rounded-2xl bg-studio-secondary border border-studio-border space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-studio-text font-semibold">
                  <Sparkles className="w-4 h-4 text-studio-text" />
                  <span>{surpriseResult.title}</span>
                </div>
                <p className="text-[11px] text-studio-muted leading-relaxed font-normal">
                  {surpriseResult.stylist_appreciation}
                </p>
              </div>
            )}

            {/* Launch to Try-On Action */}
            <button
              onClick={() => onSendToTryOn(selectedItems)}
              disabled={selectedItems.length === 0}
              className="w-full py-3 rounded-xl bg-studio-text hover:bg-studio-text/90 disabled:opacity-40 text-studio-bg font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-studio-sm"
            >
              <span>Transfer to Virtual Try-On Studio</span>
              <ArrowRight className="w-4 h-4 text-studio-bg" />
            </button>
          </div>
        </div>

        {/* Wardrobe Drawer for Selection (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl border border-studio-border bg-studio-bg space-y-4 shadow-studio-card">
            <div className="flex items-center justify-between pb-3 border-b border-studio-border">
              <div>
                <h3 className="text-sm font-bold text-studio-text font-display">Your Wardrobe Vault</h3>
                <p className="text-[11px] text-studio-muted">Click to add/remove. Click exclude to lock from Surprise Me.</p>
              </div>
              <span className="text-xs font-mono text-studio-muted">{wardrobe.length} Available</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {wardrobe.map((item) => {
                const isSelected = selectedItems.some((i) => i.id === item.id);
                const isExcluded = excludedIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => !isExcluded && toggleSelectItem(item)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative group ${
                      isExcluded
                        ? 'opacity-30 border-studio-border bg-studio-secondary'
                        : isSelected
                        ? 'border-studio-text bg-studio-secondary shadow-studio-sm font-semibold'
                        : 'border-studio-border bg-studio-bg hover:border-studio-text/40'
                    }`}
                  >
                    <div className="aspect-square w-full rounded-xl bg-studio-secondary p-2 flex items-center justify-center mb-2 overflow-hidden border border-studio-border">
                      <img
                        src={item.clean_image_url || item.image_url}
                        alt={item.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-studio-text truncate">{item.name}</p>
                      <p className="text-[10px] text-studio-muted font-mono">{item.subcategory}</p>
                    </div>

                    {/* Exclude Toggle Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExcludeItem(item.id);
                      }}
                      className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-studio-bg/90 backdrop-blur-md border border-studio-border text-studio-muted hover:text-studio-text shadow-sm"
                      title={isExcluded ? 'Include in Surprise Me' : 'Exclude from Surprise Me'}
                    >
                      {isExcluded ? 'Locked' : 'Lock'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

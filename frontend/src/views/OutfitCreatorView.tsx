import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Shuffle,
  Eye,
  Check,
  X,
  Star,
  Sliders,
  ShieldCheck,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { WardrobeItem, TryOnResponse } from '../types';
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
      // Remove from selected if excluded
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
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#ec4899', '#3b82f6'],
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
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5 text-violet-400" />
            <span>Wardrobe Combinator & Anti-Repetition Generator</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-display">Outfit Creator</h2>
          <p className="text-xs text-zinc-400">
            Experiment with garment layering or let our anti-repetition Surprise Me algorithm build fresh combinations.
          </p>
        </div>

        {/* Surprise Me Signature Button */}
        <button
          onClick={handleSurpriseMe}
          disabled={isSurpriseLoading}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-extrabold text-xs sm:text-sm flex items-center space-x-2.5 transition-all shadow-glow-md hover:scale-[1.03]"
        >
          {isSurpriseLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Synthesizing Combinations...</span>
            </>
          ) : (
            <>
              <Shuffle className="w-4 h-4 animate-bounce" />
              <span>SURPRISE ME</span>
            </>
          )}
        </button>
      </div>

      {/* Two Column Layout: Active Canvas + Wardrobe Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Stage (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white font-display">
                Current Combination ({selectedItems.length})
              </h3>
              <div className="flex items-center space-x-1.5 text-xs text-violet-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{compatibilityScore}/10 Synergy</span>
              </div>
            </div>

            {selectedItems.length === 0 ? (
              <div className="text-center py-10 text-zinc-400 text-xs space-y-2">
                <p>No garments selected yet.</p>
                <p className="text-[11px] text-zinc-500">
                  Select items from the right, or press <span className="text-violet-400 font-semibold">SURPRISE ME</span>.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-zinc-900/80 border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.clean_image_url || item.image_url}
                        alt={item.name}
                        className="w-12 h-12 object-contain rounded-lg bg-black/40 p-1"
                      />
                      <div>
                        <p className="text-xs font-semibold text-white truncate max-w-[170px]">{item.name}</p>
                        <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-zinc-400">
                          <span className="text-violet-400">{item.category}</span>
                          <span>•</span>
                          <span>{item.main_color}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSelectItem(item)}
                      className="p-1 rounded-lg text-zinc-500 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Surprise Me Notes / MIRA feedback */}
            {surpriseResult && (
              <div className="p-4 rounded-2xl bg-violet-950/20 border border-violet-500/20 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-violet-300 font-semibold">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span>{surpriseResult.title}</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-normal">
                  {surpriseResult.stylist_appreciation}
                </p>
              </div>
            )}

            {/* Launch to Try-On Action */}
            <button
              onClick={() => onSendToTryOn(selectedItems)}
              disabled={selectedItems.length === 0}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-glow-sm"
            >
              <span>Transfer to Virtual Try-On Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Wardrobe Drawer for Selection (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white font-display">Your Wardrobe Vault</h3>
                <p className="text-[11px] text-zinc-400">Click to add/remove. Click lock to exclude from Surprise Me.</p>
              </div>
              <span className="text-xs text-zinc-400">{wardrobe.length} Available</span>
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
                        ? 'opacity-40 border-red-500/30 bg-red-950/10'
                        : isSelected
                        ? 'border-violet-500 bg-violet-600/20 shadow-glow-sm'
                        : 'border-white/10 bg-zinc-900/60 hover:border-white/20'
                    }`}
                  >
                    <div className="aspect-square w-full rounded-xl bg-black/40 p-2 flex items-center justify-center mb-2 overflow-hidden">
                      <img
                        src={item.clean_image_url || item.image_url}
                        alt={item.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                      <p className="text-[10px] text-zinc-400">{item.subcategory}</p>
                    </div>

                    {/* Exclude Toggle Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExcludeItem(item.id);
                      }}
                      className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] bg-black/70 text-zinc-400 hover:text-white"
                      title={isExcluded ? 'Include in Surprise Me' : 'Exclude from Surprise Me'}
                    >
                      {isExcluded ? 'Excluded' : 'Exclude'}
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

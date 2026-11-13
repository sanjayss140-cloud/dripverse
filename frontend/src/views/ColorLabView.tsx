import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Info,
  CheckCircle,
  ShieldCheck,
  Shirt,
  ArrowRight
} from 'lucide-react';
import { WardrobeItem, ColorMatchResponse } from '../types';
import { api } from '../api';

interface ColorLabViewProps {
  wardrobe: WardrobeItem[];
  onSelectForTryOn: (item: WardrobeItem) => void;
}

export const ColorLabView: React.FC<ColorLabViewProps> = ({
  wardrobe,
  onSelectForTryOn,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<number | null>(
    wardrobe[0]?.id || null
  );
  const [colorData, setColorData] = useState<ColorMatchResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Auto-analyze first item
  React.useEffect(() => {
    if (selectedItemId) {
      loadColorAnalysis(selectedItemId);
    }
  }, [selectedItemId]);

  const loadColorAnalysis = async (id: number) => {
    setIsLoading(true);
    try {
      const res = await api.analyzeColor(id);
      setColorData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedItem = wardrobe.find((w) => w.id === selectedItemId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-2">
          <Palette className="w-3.5 h-3.5 text-violet-400" />
          <span>Color Theory & Harmony Studio</span>
        </div>
        <h2 className="text-2xl font-bold text-white font-display">Colour Match Lab</h2>
        <p className="text-xs text-zinc-400">
          Select any garment in your wardrobe to generate complementary, analogous, and neutral harmony pairings with matching vault pieces.
        </p>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Garment Selector Carousel (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Select Garment to Coordinate
          </h3>

          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {wardrobe.map((item) => {
              const isSelected = selectedItemId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center space-x-3.5 ${
                    isSelected
                      ? 'bg-violet-600/20 border-violet-500 shadow-glow-sm'
                      : 'bg-zinc-900/60 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl bg-black/40 p-1.5 flex items-center justify-center shrink-0">
                    <img
                      src={item.clean_image_url || item.image_url}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{item.subcategory}</p>

                    <div className="flex items-center space-x-2 mt-1.5">
                      <span
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: item.main_color_hex || '#18181b' }}
                      />
                      <span className="text-[10px] text-zinc-300 font-medium">{item.main_color}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Harmony Palettes & Recommendations (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {colorData ? (
            <div className="space-y-6">
              {/* Garment Hero Card */}
              <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="w-28 h-28 rounded-2xl bg-black/40 p-3 flex items-center justify-center shrink-0 border border-white/10">
                  <img
                    src={colorData.item.clean_image_url || colorData.item.image_url}
                    alt={colorData.item.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-semibold uppercase">
                    Base Anchor
                  </span>
                  <h3 className="text-base font-bold text-white font-display">{colorData.item.name}</h3>
                  <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs text-zinc-300">
                    <span
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: colorData.dominant_hex }}
                    />
                    <span className="font-semibold text-white">{colorData.dominant_color}</span>
                    <span className="text-zinc-500 font-mono text-[11px]">({colorData.dominant_hex})</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed font-light">{colorData.styling_tip}</p>
                </div>
              </div>

              {/* Harmony Palettes Showcase */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Calculated Color Harmonies
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(colorData.palettes).map(([key, pal]) => (
                    <div key={key} className="glass-card p-5 rounded-2xl border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white">{pal.name}</h4>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">{pal.description}</p>

                      {/* Color Swatch Bars */}
                      <div className="flex items-center space-x-2 pt-1">
                        {pal.hex_colors.map((hex, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center space-y-1">
                            <div
                              className="w-full h-9 rounded-xl border border-white/10 shadow-sm"
                              style={{ backgroundColor: hex }}
                            />
                            <span className="text-[10px] font-mono text-zinc-400 uppercase">{hex}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matching Pieces in User's Wardrobe */}
              {colorData.recommended_matching_items?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Matching Pieces From Your Closet
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {colorData.recommended_matching_items.map((matchItem) => (
                      <div
                        key={matchItem.id}
                        className="glass-card p-3 rounded-2xl border border-white/10 flex flex-col justify-between group"
                      >
                        <div className="aspect-square bg-black/40 rounded-xl p-2 mb-2 flex items-center justify-center">
                          <img
                            src={matchItem.clean_image_url || matchItem.image_url}
                            alt={matchItem.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          />
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-white truncate">{matchItem.name}</p>
                          <p className="text-[10px] text-zinc-400">{matchItem.subcategory}</p>
                        </div>

                        <button
                          onClick={() => onSelectForTryOn(matchItem)}
                          className="mt-2 w-full py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white text-[10px] font-semibold transition-all"
                        >
                          Pair in Try-On
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-12 rounded-3xl text-center text-zinc-400 text-xs">
              Select a garment to calculate color harmonies.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

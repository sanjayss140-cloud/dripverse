import React, { useState } from 'react';
import {
  Palette
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
  const [_isLoading, setIsLoading] = useState<boolean>(false);

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

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-studio-accentSubtle border border-studio-accent/20 text-studio-accent text-xs font-semibold mb-2">
          <Palette className="w-3.5 h-3.5" />
          <span>Color Theory & Harmony Studio</span>
        </div>
        <h2 className="text-2xl font-bold text-studio-text font-display">Colour Match Lab</h2>
        <p className="text-xs text-studio-muted">
          Select any garment in your wardrobe to generate complementary, analogous, and neutral harmony pairings with matching vault pieces.
        </p>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Garment Selector Carousel (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-studio-muted">
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
                      ? 'bg-studio-accentSubtle border-studio-accent shadow-studio-sm font-semibold'
                      : 'bg-studio-secondary border-studio-border hover:border-studio-accent/40'
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl bg-studio-card border border-studio-border p-1.5 flex items-center justify-center shrink-0">
                    <img
                      src={item.clean_image_url || item.image_url}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-studio-text truncate">{item.name}</h4>
                    <p className="text-[11px] text-studio-muted mt-0.5">{item.subcategory}</p>

                    <div className="flex items-center space-x-2 mt-1.5">
                      <span
                        className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: item.main_color_hex || '#18181b' }}
                      />
                      <span className="text-[10px] text-studio-muted font-medium">{item.main_color}</span>
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
              <div className="glass-card p-6 rounded-3xl border border-studio-border flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 shadow-studio-card">
                <div className="w-28 h-28 rounded-2xl bg-studio-secondary p-3 flex items-center justify-center shrink-0 border border-studio-border">
                  <img
                    src={colorData.item.clean_image_url || colorData.item.image_url}
                    alt={colorData.item.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-studio-accentSubtle text-studio-accent font-semibold uppercase border border-studio-accent/20">
                    Base Anchor
                  </span>
                  <h3 className="text-base font-bold text-studio-text font-display">{colorData.item.name}</h3>
                  <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs text-studio-text">
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: colorData.dominant_hex }}
                    />
                    <span className="font-semibold">{colorData.dominant_color}</span>
                    <span className="text-studio-muted font-mono text-[11px]">({colorData.dominant_hex})</span>
                  </div>
                  <p className="text-xs text-studio-muted leading-relaxed font-normal">{colorData.styling_tip}</p>
                </div>
              </div>

              {/* Harmony Palettes Showcase */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-studio-muted">
                  Calculated Color Harmonies
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(colorData.palettes).map(([key, pal]) => (
                    <div key={key} className="glass-card p-5 rounded-2xl border border-studio-border space-y-3 shadow-studio-card">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-studio-text">{pal.name}</h4>
                      </div>
                      <p className="text-[11px] text-studio-muted leading-relaxed">{pal.description}</p>

                      {/* Color Swatch Bars */}
                      <div className="flex items-center space-x-2 pt-1">
                        {pal.hex_colors.map((hex, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center space-y-1">
                            <div
                              className="w-full h-9 rounded-xl border border-black/10 shadow-sm"
                              style={{ backgroundColor: hex }}
                            />
                            <span className="text-[10px] font-mono text-studio-muted uppercase">{hex}</span>
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
                  <h3 className="text-xs font-bold uppercase tracking-wider text-studio-muted">
                    Matching Pieces From Your Closet
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {colorData.recommended_matching_items.map((matchItem) => (
                      <div
                        key={matchItem.id}
                        className="glass-card p-3 rounded-2xl border border-studio-border flex flex-col justify-between group shadow-studio-card"
                      >
                        <div className="aspect-square bg-studio-secondary rounded-xl p-2 mb-2 flex items-center justify-center border border-studio-border">
                          <img
                            src={matchItem.clean_image_url || matchItem.image_url}
                            alt={matchItem.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          />
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-studio-text truncate">{matchItem.name}</p>
                          <p className="text-[10px] text-studio-muted">{matchItem.subcategory}</p>
                        </div>

                        <button
                          onClick={() => onSelectForTryOn(matchItem)}
                          className="mt-2.5 w-full py-1.5 rounded-lg bg-studio-accentSubtle hover:bg-studio-accent text-studio-accent hover:text-white border border-studio-accent/20 text-[10px] font-semibold transition-all"
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
            <div className="glass-card p-12 rounded-3xl text-center text-studio-muted text-xs border border-studio-border">
              Select a garment to calculate color harmonies.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

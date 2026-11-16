import React, { useState } from 'react';
import {
  Swords,
  Sparkles,
  Trophy,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { WardrobeItem, OutfitBattleResponse } from '../types';
import { api } from '../api';
import confetti from 'canvas-confetti';

interface OutfitBattleViewProps {
  wardrobe: WardrobeItem[];
}

export const OutfitBattleView: React.FC<OutfitBattleViewProps> = ({ wardrobe }) => {
  const [outfitAIds, setOutfitAIds] = useState<number[]>([]);
  const [outfitBIds, setOutfitBIds] = useState<number[]>([]);
  const [occasion, setOccasion] = useState<string>('Casual Outing');
  const [isBattling, setIsBattling] = useState<boolean>(false);
  const [battleResult, setBattleResult] = useState<OutfitBattleResponse | null>(null);

  // Initialize with samples if available
  React.useEffect(() => {
    if (wardrobe.length >= 4 && outfitAIds.length === 0 && outfitBIds.length === 0) {
      setOutfitAIds([wardrobe[0].id, wardrobe[3]?.id].filter(Boolean));
      setOutfitBIds([wardrobe[1]?.id, wardrobe[4]?.id].filter(Boolean));
    }
  }, [wardrobe]);

  const itemsA = wardrobe.filter((w) => outfitAIds.includes(w.id));
  const itemsB = wardrobe.filter((w) => outfitBIds.includes(w.id));

  const toggleItemForOutfit = (itemId: number, outfitKey: 'A' | 'B') => {
    if (outfitKey === 'A') {
      setOutfitAIds((prev) =>
        prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
      );
    } else {
      setOutfitBIds((prev) =>
        prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
      );
    }
  };

  const handleRunBattle = async () => {
    if (outfitAIds.length === 0 || outfitBIds.length === 0) return;
    setIsBattling(true);
    setBattleResult(null);

    try {
      const res = await api.runOutfitBattle({
        outfit_a_ids: outfitAIds,
        outfit_b_ids: outfitBIds,
        occasion,
      });
      setBattleResult(res);

      try {
        confetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#171717', '#7547D9', '#EAEAEA'],
        });
      } catch (e) {}
    } catch (err) {
      console.error(err);
    } finally {
      setIsBattling(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-studio-border pb-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-studio-secondary border border-studio-border text-studio-text text-[11px] font-mono tracking-widest uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-studio-text" />
            <span>CONSTRUCTIVE FASHION DUEL • WHITE STUDIO</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-studio-text font-display">Outfit Battle Arena</h2>
          <p className="text-xs text-studio-muted">
            Compare two aesthetics side-by-side. MIRA breaks down styling strengths with empowering, constructive advice.
          </p>
        </div>

        {/* Occasion selector */}
        <div className="flex items-center space-x-2 bg-studio-secondary px-3.5 py-2 rounded-xl border border-studio-border text-xs">
          <span className="text-studio-muted font-medium">Target Occasion:</span>
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="bg-transparent text-studio-text font-semibold focus:outline-none cursor-pointer"
          >
            <option value="Casual Outing">Casual Outing</option>
            <option value="Streetwear Showcase">Streetwear Showcase</option>
            <option value="Date Night">Date Night</option>
            <option value="Office Presentation">Office Presentation</option>
            <option value="Evening Party">Evening Party</option>
          </select>
        </div>
      </div>

      {/* Side-by-Side Dual Arena */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Versus Divider Badge */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-studio-text text-studio-bg font-extrabold text-xs items-center justify-center border-4 border-studio-bg shadow-studio-card">
          VS
        </div>

        {/* Stage Outfit A */}
        <div className="p-6 rounded-3xl border border-studio-border bg-studio-bg space-y-4 shadow-studio-card">
          <div className="flex items-center justify-between pb-3 border-b border-studio-border">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-studio-text text-studio-bg font-bold text-xs flex items-center justify-center">
                A
              </span>
              <h3 className="text-sm font-bold text-studio-text font-display">Outfit A</h3>
            </div>
            <span className="text-xs font-mono text-studio-muted">{itemsA.length} Pieces</span>
          </div>

          <div className="grid grid-cols-2 gap-2 min-h-[140px] bg-studio-secondary p-3 rounded-2xl border border-studio-border">
            {itemsA.map((item) => (
              <div key={item.id} className="p-2 rounded-xl bg-studio-bg border border-studio-border flex items-center space-x-2 text-xs">
                <img src={item.clean_image_url || item.image_url} alt={item.name} className="w-10 h-10 object-contain rounded" />
                <span className="text-studio-text truncate text-[11px] font-medium">{item.name}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-studio-muted">Add to Outfit A:</label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
              {wardrobe.map((item) => {
                const isSelected = outfitAIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItemForOutfit(item.id, 'A')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                      isSelected
                        ? 'bg-studio-text border-studio-text text-studio-bg font-semibold'
                        : 'bg-studio-secondary border-studio-border text-studio-muted hover:text-studio-text'
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stage Outfit B */}
        <div className="p-6 rounded-3xl border border-studio-border bg-studio-bg space-y-4 shadow-studio-card">
          <div className="flex items-center justify-between pb-3 border-b border-studio-border">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-studio-secondary text-studio-text border border-studio-border font-bold text-xs flex items-center justify-center">
                B
              </span>
              <h3 className="text-sm font-bold text-studio-text font-display">Outfit B</h3>
            </div>
            <span className="text-xs font-mono text-studio-muted">{itemsB.length} Pieces</span>
          </div>

          <div className="grid grid-cols-2 gap-2 min-h-[140px] bg-studio-secondary p-3 rounded-2xl border border-studio-border">
            {itemsB.map((item) => (
              <div key={item.id} className="p-2 rounded-xl bg-studio-bg border border-studio-border flex items-center space-x-2 text-xs">
                <img src={item.clean_image_url || item.image_url} alt={item.name} className="w-10 h-10 object-contain rounded" />
                <span className="text-studio-text truncate text-[11px] font-medium">{item.name}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-studio-muted">Add to Outfit B:</label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
              {wardrobe.map((item) => {
                const isSelected = outfitBIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItemForOutfit(item.id, 'B')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                      isSelected
                        ? 'bg-studio-text border-studio-text text-studio-bg font-semibold'
                        : 'bg-studio-secondary border-studio-border text-studio-muted hover:text-studio-text'
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Battle Trigger Button */}
      <div className="text-center">
        <button
          onClick={handleRunBattle}
          disabled={isBattling || itemsA.length === 0 || itemsB.length === 0}
          className="px-8 py-3.5 rounded-2xl bg-studio-text hover:bg-studio-text/90 text-studio-bg font-extrabold text-sm flex items-center space-x-2 mx-auto transition-all shadow-studio-sm disabled:opacity-50 hover:scale-[1.01]"
        >
          {isBattling ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-studio-bg" />
              <span>MIRA is evaluating aesthetics...</span>
            </>
          ) : (
            <>
              <Swords className="w-4 h-4 text-studio-bg" />
              <span>Run Outfit Battle</span>
            </>
          )}
        </button>
      </div>

      {/* Battle Results Verdict Card */}
      {battleResult && (
        <div className="p-6 sm:p-8 rounded-3xl border border-studio-border bg-studio-bg space-y-6 shadow-studio-card">
          {/* Universal Appreciation */}
          <div className="p-4 rounded-2xl bg-studio-secondary border border-studio-border space-y-1">
            <div className="flex items-center space-x-2 text-studio-text font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-studio-text" />
              <span>MIRA's Universal Appreciation</span>
            </div>
            <p className="text-xs text-studio-muted leading-relaxed font-normal">
              {battleResult.appreciation_both}
            </p>
          </div>

          {/* Breakdown A & B */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-studio-secondary border border-studio-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-studio-text">Outfit A Analysis</span>
                <span className="text-xs font-mono font-bold text-studio-text">{battleResult.outfit_a_analysis.score}/10</span>
              </div>
              <p className="text-[11px] text-studio-muted italic font-medium">Vibe: {battleResult.outfit_a_analysis.vibe}</p>
              <ul className="space-y-1.5 text-xs text-studio-muted">
                {battleResult.outfit_a_analysis.key_advantages.map((adv, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-studio-text shrink-0 mt-0.5" />
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-studio-secondary border border-studio-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-studio-text">Outfit B Analysis</span>
                <span className="text-xs font-mono font-bold text-studio-text">{battleResult.outfit_b_analysis.score}/10</span>
              </div>
              <p className="text-[11px] text-studio-muted italic font-medium">Vibe: {battleResult.outfit_b_analysis.vibe}</p>
              <ul className="space-y-1.5 text-xs text-studio-muted">
                {battleResult.outfit_b_analysis.key_advantages.map((adv, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-studio-text shrink-0 mt-0.5" />
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Stylist Verdict & Upgrade Tips */}
          <div className="p-5 rounded-2xl bg-studio-secondary border border-studio-border space-y-3">
            <div className="flex items-center space-x-2 text-studio-text font-bold text-xs uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Stylist Recommendation for {occasion}</span>
            </div>
            <p className="text-xs text-studio-text leading-relaxed font-normal">
              {battleResult.stylist_verdict}
            </p>

            <div className="pt-2 border-t border-studio-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-studio-muted block">Practical Upgrades:</span>
              {battleResult.actionable_upgrades.map((upg, i) => (
                <p key={i} className="text-[11px] text-studio-muted flex items-center space-x-1.5">
                  <span className="text-studio-text">•</span>
                  <span>{upg}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

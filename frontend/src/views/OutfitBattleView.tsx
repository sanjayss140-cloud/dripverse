import React, { useState } from 'react';
import {
  Swords,
  Sparkles,
  Trophy,
  Star,
  CheckCircle,
  ShieldCheck,
  ChevronRight,
  Loader2,
  Flame
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
          colors: ['#a855f7', '#ec4899', '#f59e0b'],
        });
      } catch (e) {}
    } catch (err) {
      console.error(err);
    } finally {
      setIsBattling(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-2">
            <Swords className="w-3.5 h-3.5 text-violet-400" />
            <span>Constructive Fashion Duel</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-display">Outfit Battle Arena</h2>
          <p className="text-xs text-zinc-400">
            Compare two aesthetics side-by-side. MIRA breaks down styling strengths with empowering, constructive advice.
          </p>
        </div>

        {/* Occasion selector */}
        <div className="flex items-center space-x-2 bg-zinc-900 px-3 py-2 rounded-xl border border-white/10 text-xs">
          <span className="text-zinc-400">Target Occasion:</span>
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="bg-transparent text-white font-semibold focus:outline-none"
          >
            <option value="Casual Outing" className="bg-zinc-900">Casual Outing</option>
            <option value="Streetwear Showcase" className="bg-zinc-900">Streetwear Showcase</option>
            <option value="Date Night" className="bg-zinc-900">Date Night</option>
            <option value="Office Presentation" className="bg-zinc-900">Office Presentation</option>
            <option value="Evening Party" className="bg-zinc-900">Evening Party</option>
          </select>
        </div>
      </div>

      {/* Side-by-Side Dual Arena */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Versus Divider Badge */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-violet-600 text-white font-extrabold text-sm items-center justify-center border-4 border-drip-dark shadow-glow-md">
          VS
        </div>

        {/* Stage Outfit A */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center">
                A
              </span>
              <h3 className="text-sm font-bold text-white font-display">Outfit A</h3>
            </div>
            <span className="text-xs text-zinc-400">{itemsA.length} Pieces Selected</span>
          </div>

          <div className="grid grid-cols-2 gap-2 min-h-[140px] bg-black/40 p-3 rounded-2xl border border-white/5">
            {itemsA.map((item) => (
              <div key={item.id} className="p-2 rounded-xl bg-zinc-900/80 flex items-center space-x-2 text-xs">
                <img src={item.clean_image_url || item.image_url} alt={item.name} className="w-10 h-10 object-contain rounded" />
                <span className="text-white truncate text-[11px] font-medium">{item.name}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-zinc-500">Add to Outfit A:</label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
              {wardrobe.map((item) => {
                const isSelected = outfitAIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItemForOutfit(item.id, 'A')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-500 text-white'
                        : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white'
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
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center">
                B
              </span>
              <h3 className="text-sm font-bold text-white font-display">Outfit B</h3>
            </div>
            <span className="text-xs text-zinc-400">{itemsB.length} Pieces Selected</span>
          </div>

          <div className="grid grid-cols-2 gap-2 min-h-[140px] bg-black/40 p-3 rounded-2xl border border-white/5">
            {itemsB.map((item) => (
              <div key={item.id} className="p-2 rounded-xl bg-zinc-900/80 flex items-center space-x-2 text-xs">
                <img src={item.clean_image_url || item.image_url} alt={item.name} className="w-10 h-10 object-contain rounded" />
                <span className="text-white truncate text-[11px] font-medium">{item.name}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-zinc-500">Add to Outfit B:</label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
              {wardrobe.map((item) => {
                const isSelected = outfitBIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItemForOutfit(item.id, 'B')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                      isSelected
                        ? 'bg-purple-600/30 border-purple-500 text-white'
                        : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white'
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
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-sm flex items-center space-x-2 mx-auto transition-all shadow-glow-md disabled:opacity-50 hover:scale-[1.02]"
        >
          {isBattling ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>MIRA is evaluating aesthetics...</span>
            </>
          ) : (
            <>
              <Swords className="w-4 h-4" />
              <span>Run Outfit Battle</span>
            </>
          )}
        </button>
      </div>

      {/* Battle Results Verdict Card */}
      {battleResult && (
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-violet-500/30 space-y-6 shadow-glow-sm">
          {/* Universal Appreciation (Mandatory rule: Never call either outfit ugly) */}
          <div className="p-4 rounded-2xl bg-violet-950/20 border border-violet-500/20 space-y-1">
            <div className="flex items-center space-x-2 text-violet-300 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>MIRA's Universal Appreciation</span>
            </div>
            <p className="text-xs text-zinc-200 leading-relaxed font-normal">
              {battleResult.appreciation_both}
            </p>
          </div>

          {/* Breakdown A & B */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400">Outfit A Analysis</span>
                <span className="text-xs font-bold text-white">{battleResult.outfit_a_analysis.score}/10</span>
              </div>
              <p className="text-[11px] text-zinc-400 italic font-medium">Vibe: {battleResult.outfit_a_analysis.vibe}</p>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {battleResult.outfit_a_analysis.key_advantages.map((adv, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400">Outfit B Analysis</span>
                <span className="text-xs font-bold text-white">{battleResult.outfit_b_analysis.score}/10</span>
              </div>
              <p className="text-[11px] text-zinc-400 italic font-medium">Vibe: {battleResult.outfit_b_analysis.vibe}</p>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {battleResult.outfit_b_analysis.key_advantages.map((adv, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Stylist Verdict & Upgrade Tips */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-violet-950/40 border border-white/10 space-y-3">
            <div className="flex items-center space-x-2 text-violet-400 font-bold text-xs uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>Stylist Recommendation for {occasion}</span>
            </div>
            <p className="text-xs text-zinc-200 leading-relaxed font-normal">
              {battleResult.stylist_verdict}
            </p>

            <div className="pt-2 border-t border-white/10 space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Practical Upgrades:</span>
              {battleResult.actionable_upgrades.map((upg, i) => (
                <p key={i} className="text-[11px] text-zinc-400 flex items-center space-x-1.5">
                  <span className="text-violet-400">•</span>
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

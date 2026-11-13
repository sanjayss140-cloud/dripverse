import React from 'react';
import {
  Sparkles,
  Shirt,
  Layers,
  Swords,
  Palette,
  ArrowRight,
  TrendingUp,
  Star,
  Clock,
  CheckCircle,
  Eye,
  Plus
} from 'lucide-react';
import { WardrobeItem, TryOnResponse, UserProfile } from '../types';

interface DashboardViewProps {
  wardrobe: WardrobeItem[];
  outfits: TryOnResponse[];
  profile?: UserProfile;
  setCurrentTab: (tab: string) => void;
  openUploadModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  wardrobe,
  outfits,
  profile,
  setCurrentTab,
  openUploadModal,
}) => {
  const recentOutfits = outfits.slice(0, 3);
  const recentUploads = wardrobe.slice(0, 6);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-950/40 via-purple-900/20 to-zinc-950 p-6 sm:p-8 md:p-10 border border-violet-500/20 shadow-glow-sm">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>AI Personal Fashion Studio</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight font-display mb-3">
            Welcome back, {profile?.display_name || 'Alex'}.
          </h2>
          <p className="text-sm md:text-base text-zinc-300 leading-relaxed mb-6 font-light">
            "Your Wardrobe. Your Creativity. Your Style." Upload physical clothes, compose signature aesthetics, and explore your fits on our 6 virtual fashion models.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCurrentTab('tryon')}
              className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs md:text-sm flex items-center space-x-2.5 transition-all shadow-glow-sm hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Virtual Try-On</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={openUploadModal}
              className="px-5 py-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-white border border-white/10 font-semibold text-xs md:text-sm flex items-center space-x-2 transition-all"
            >
              <Plus className="w-4 h-4 text-violet-400" />
              <span>Upload Clothing</span>
            </button>

            <button
              onClick={() => setCurrentTab('outfit-creator')}
              className="px-4 py-3 rounded-xl bg-violet-950/40 hover:bg-violet-900/50 text-violet-300 border border-violet-500/20 font-semibold text-xs md:text-sm flex items-center space-x-2 transition-all"
            >
              <Layers className="w-4 h-4 text-violet-400" />
              <span>Surprise Me Fit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Wardrobe Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-400">Total Wardrobe</span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Shirt className="w-4 h-4 text-violet-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-display">{wardrobe.length}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Classified items in vault</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-400">Try-On Looks</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-display">{outfits.length}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Multi-angle synthesized</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-400">Stylist Harmony</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Star className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-display">9.4/10</div>
          <p className="text-[11px] text-emerald-400/90 mt-1">Cohesive wardrobe synergy</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-400">Signature Style</span>
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-pink-400" />
            </div>
          </div>
          <div className="text-base font-bold text-white truncate font-display">
            {profile?.style_preference || 'Streetwear'}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Personal styling profile</p>
        </div>
      </div>

      {/* MIRA Daily Stylist Recommendation Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-violet-950/30 border border-violet-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-400">MIRA Stylist Insight</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-semibold">Today's Vibe</span>
            </div>
            <p className="text-sm text-zinc-200 mt-1 font-normal leading-relaxed">
              "First of all, your black graphic tee and desert cargo pants create an impeccably balanced silhouette! Anchor the contrast with white chunky sneakers for effortless street elegance."
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentTab('stylist')}
          className="px-4 py-2 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/30 text-white text-xs font-semibold shrink-0 transition-all"
        >
          Chat with MIRA
        </button>
      </div>

      {/* Quick Launchpad Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setCurrentTab('outfit-creator')}
          className="glass-card-hover p-6 rounded-2xl cursor-pointer border border-white/10 group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-sm font-bold text-white font-display mb-1">Outfit Creator</h3>
          <p className="text-xs text-zinc-400 leading-relaxed mb-4">
            Build custom looks layer-by-layer with live color harmony scoring and anti-repetition Surprise Me.
          </p>
          <span className="text-xs text-indigo-400 font-semibold inline-flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
            <span>Open Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => setCurrentTab('outfit-battle')}
          className="glass-card-hover p-6 rounded-2xl cursor-pointer border border-white/10 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Swords className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-sm font-bold text-white font-display mb-1">Outfit Battle</h3>
          <p className="text-xs text-zinc-400 leading-relaxed mb-4">
            Compare two outfits side-by-side. MIRA highlights the unique strengths of both and advises on occasion fit.
          </p>
          <span className="text-xs text-purple-400 font-semibold inline-flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
            <span>Start Battle</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => setCurrentTab('color-lab')}
          className="glass-card-hover p-6 rounded-2xl cursor-pointer border border-white/10 group"
        >
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Palette className="w-5 h-5 text-pink-400" />
          </div>
          <h3 className="text-sm font-bold text-white font-display mb-1">Colour Match Lab</h3>
          <p className="text-xs text-zinc-400 leading-relaxed mb-4">
            Extract garment color harmonies: Complementary, Analogous, Triadic, and Neutrals with matching closet items.
          </p>
          <span className="text-xs text-pink-400 font-semibold inline-flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
            <span>Explore Palettes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Recently Uploaded Clothes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white font-display">Recently Uploaded Clothes</h3>
            <p className="text-xs text-zinc-400">Garments digitized in your personal fashion vault</p>
          </div>
          <button
            onClick={() => setCurrentTab('wardrobe')}
            className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center space-x-1"
          >
            <span>View All ({wardrobe.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {recentUploads.map((item) => (
            <div
              key={item.id}
              onClick={() => setCurrentTab('wardrobe')}
              className="glass-card-hover p-3 rounded-xl border border-white/10 cursor-pointer flex flex-col items-center group"
            >
              <div className="w-full aspect-square rounded-lg bg-zinc-900/80 p-2 mb-2 flex items-center justify-center overflow-hidden">
                <img
                  src={item.clean_image_url || item.image_url}
                  alt={item.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <p className="text-xs font-semibold text-white truncate w-full text-center">{item.name}</p>
              <span className="text-[10px] text-zinc-400 mt-0.5">{item.subcategory}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Generated Looks */}
      {recentOutfits.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white font-display">Recent Try-On Looks</h3>
              <p className="text-xs text-zinc-400">Synthesized visualizations on your virtual models</p>
            </div>
            <button
              onClick={() => setCurrentTab('saved-looks')}
              className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center space-x-1"
            >
              <span>View Collections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recentOutfits.map((outfit) => (
              <div
                key={outfit.outfit_id}
                onClick={() => setCurrentTab('tryon')}
                className="glass-card-hover rounded-2xl overflow-hidden border border-white/10 cursor-pointer flex flex-col"
              >
                <div className="relative aspect-[3/4] bg-zinc-950 overflow-hidden">
                  <img
                    src={outfit.generated_image_url}
                    alt={outfit.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-drip-dark/80 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-white">
                    {outfit.occasion}
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-violet-600/90 text-[10px] font-bold text-white flex items-center space-x-1 shadow-glow-sm">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{outfit.rating}</span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white truncate mb-1">{outfit.name}</h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {outfit.stylist_notes}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-[11px] text-zinc-500">
                    <span>{outfit.wardrobe_items?.length || 0} pieces combined</span>
                    <span className="text-violet-400 font-medium">Reopen Studio →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

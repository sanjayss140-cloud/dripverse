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
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      {/* Luxury Editorial Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-studio-secondary p-6 sm:p-8 md:p-10 border border-studio-border shadow-studio-card">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-studio-bg border border-studio-border text-studio-text text-[11px] font-mono tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-studio-text" />
              <span>EDITORIAL COLLECTION Nº21 • WHITE STUDIO</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-studio-text tracking-tight font-display leading-[1.1]">
              Your Wardrobe.<br />
              <span className="text-studio-muted font-light">Your Personal Studio.</span>
            </h2>

            <p className="text-xs md:text-sm text-studio-muted leading-relaxed font-normal max-w-xl">
              Upload clothes you own, calibrate fits on our 6 distinct virtual fashion models (Anime, Human & Atelier Mannequin), and receive professional styling curation powered by MIRA.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setCurrentTab('tryon')}
                className="px-6 py-3 rounded-xl bg-studio-text hover:bg-studio-text/90 text-studio-bg font-semibold text-xs flex items-center space-x-2.5 transition-all shadow-studio-sm hover:scale-[1.01]"
              >
                <Sparkles className="w-4 h-4 text-studio-bg" />
                <span>Launch Virtual Try-On</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={openUploadModal}
                className="px-5 py-3 rounded-xl bg-studio-bg hover:bg-studio-secondary text-studio-text border border-studio-border font-semibold text-xs flex items-center space-x-2 transition-all shadow-studio-sm"
              >
                <Plus className="w-4 h-4 text-studio-text" />
                <span>Upload Clothes</span>
              </button>

              <button
                onClick={() => setCurrentTab('avatar-studio')}
                className="px-5 py-3 rounded-xl bg-studio-secondary hover:bg-studio-border/60 text-studio-text border border-studio-border font-semibold text-xs flex items-center space-x-2 transition-all"
              >
                <span>6 Fashion Models</span>
              </button>
            </div>
          </div>

          {/* Premium Hero Right Panel: 6 Model Preview Strip */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-2">
            {[
              { id: 'model_a_anime_male', label: 'Kaito', type: 'Anime' },
              { id: 'model_b_anime_female', label: 'Aoi', type: 'Anime' },
              { id: 'model_c_human_male', label: 'Marcus', type: 'Human' },
              { id: 'model_d_human_female', label: 'Elena', type: 'Human' },
              { id: 'model_e_mannequin_male', label: 'Atelier M', type: 'Mannequin' },
              { id: 'model_f_mannequin_female', label: 'Atelier F', type: 'Mannequin' },
            ].map((m) => (
              <div
                key={m.id}
                onClick={() => setCurrentTab('tryon')}
                className="group relative rounded-2xl overflow-hidden bg-studio-secondary border border-studio-border cursor-pointer"
                style={{ aspectRatio: '3/5' }}
              >
                <img
                  src={`/api/media/models/${m.id}.png`}
                  alt={m.label}
                  className="w-full h-full object-cover object-top group-hover:scale-104 transition-transform duration-500"
                  style={{ transform: 'scale(1)', transition: 'transform 0.5s ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-2">
                  <p className="text-[9px] text-white/60 font-mono uppercase">{m.type}</p>
                  <p className="text-[11px] text-white font-bold leading-tight">{m.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wardrobe Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-studio-secondary border border-studio-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-studio-muted">Wardrobe Vault</span>
            <div className="w-7 h-7 rounded-lg bg-studio-bg border border-studio-border flex items-center justify-center">
              <Shirt className="w-3.5 h-3.5 text-studio-text" />
            </div>
          </div>
          <div className="text-2xl font-black text-studio-text font-display">{wardrobe.length}</div>
          <p className="text-[10px] text-studio-muted mt-1 uppercase tracking-wider font-mono">Classified Pieces</p>
        </div>

        <div className="p-5 rounded-2xl bg-studio-secondary border border-studio-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-studio-muted">Atelier Looks</span>
            <div className="w-7 h-7 rounded-lg bg-studio-bg border border-studio-border flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-studio-text" />
            </div>
          </div>
          <div className="text-2xl font-black text-studio-text font-display">{outfits.length}</div>
          <p className="text-[10px] text-studio-muted mt-1 uppercase tracking-wider font-mono">Multi-Angle Renders</p>
        </div>

        <div className="p-5 rounded-2xl bg-studio-secondary border border-studio-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-studio-muted">Stylist Harmony</span>
            <div className="w-7 h-7 rounded-lg bg-studio-bg border border-studio-border flex items-center justify-center">
              <Star className="w-3.5 h-3.5 text-studio-text" />
            </div>
          </div>
          <div className="text-2xl font-black text-studio-text font-display">9.6 / 10</div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 font-mono uppercase tracking-wider">High Synergy</p>
        </div>

        <div className="p-5 rounded-2xl bg-studio-secondary border border-studio-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-studio-muted">Default Model</span>
            <div className="w-7 h-7 rounded-lg bg-studio-bg border border-studio-border flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-studio-text" />
            </div>
          </div>
          <div className="text-sm font-bold text-studio-text truncate font-display mt-1">
            {profile?.preferred_model_type ? profile.preferred_model_type.replace(/_/g, ' ').toUpperCase() : 'ANIME MALE (KAITO)'}
          </div>
          <p className="text-[10px] text-studio-muted mt-1 font-mono uppercase tracking-wider">Calibrated Profile</p>
        </div>
      </div>

      {/* MIRA Daily Stylist Recommendation Card */}
      <div className="p-6 rounded-2xl bg-studio-secondary border border-studio-border shadow-studio-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-9 h-9 rounded-xl bg-studio-bg border border-studio-border flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-studio-text" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-studio-text">MIRA STYLIST INSIGHT</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-studio-bg text-studio-muted border border-studio-border font-semibold">TODAY</span>
            </div>
            <p className="text-xs sm:text-sm text-studio-text mt-1 font-normal leading-relaxed">
              "Your tailored oxford shirt paired with raw selvedge jeans provides a timeless architectural silhouette. Anchor the look with mocha suede boots for effortless everyday sophistication."
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentTab('stylist')}
          className="px-4 py-2 rounded-xl bg-studio-text hover:bg-studio-text/90 text-studio-bg text-xs font-semibold shrink-0 transition-all shadow-studio-sm"
        >
          Consult MIRA
        </button>
      </div>

      {/* Section 1: Recent Atelier Try-On Looks */}
      {recentOutfits.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-studio-border pb-3">
            <div>
              <h3 className="text-xl font-bold text-studio-text font-display">Recent Virtual Try-Ons</h3>
              <p className="text-xs text-studio-muted">Multi-angle fashion visualizations on your selectable virtual models</p>
            </div>
            <button
              onClick={() => setCurrentTab('saved-looks')}
              className="text-xs text-studio-text hover:underline font-semibold flex items-center space-x-1"
            >
              <span>View All ({outfits.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recentOutfits.map((outfit) => (
              <div
                key={outfit.outfit_id}
                onClick={() => setCurrentTab('tryon')}
                className="outfit-card"
              >
                {/* 3:4 Portrait Stage */}
                <div className="outfit-card-stage">
                  <img
                    src={outfit.generated_image_url}
                    alt={outfit.name}
                  />
                  <div className="absolute top-3 left-3 badge">
                    {outfit.model_type?.split('_').slice(-2).join(' ') || 'MODEL'}
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-studio-text text-[10px] font-bold text-studio-bg">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{outfit.rating}</span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between gap-2.5">
                  <div>
                    <h4 className="text-sm font-bold text-studio-text truncate mb-1">{outfit.name}</h4>
                    <p className="text-[11px] text-studio-muted line-clamp-2 leading-relaxed">
                      {outfit.stylist_notes}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2.5 border-t border-studio-border">
                    <span className="badge">{outfit.occasion}</span>
                    <span className="text-xs text-studio-text font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Open Studio
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Recently Uploaded Wardrobe Pieces */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-studio-border pb-3">
          <div>
            <h3 className="text-xl font-bold text-studio-text font-display">Curated Wardrobe Pieces</h3>
            <p className="text-xs text-studio-muted">Digitized studio product photography with automated clean cutouts</p>
          </div>
          <button
            onClick={() => setCurrentTab('wardrobe')}
            className="text-xs text-studio-text hover:underline font-semibold flex items-center space-x-1"
          >
            <span>Explore Vault ({wardrobe.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {recentUploads.map((item) => (
            <div
              key={item.id}
              onClick={() => setCurrentTab('wardrobe')}
              className="rounded-2xl bg-studio-bg border border-studio-border hover:border-studio-text/30 cursor-pointer flex flex-col items-center group shadow-studio-card transition-all overflow-hidden hover:-translate-y-1"
            >
              <div className="w-full aspect-square bg-studio-secondary p-3 flex items-center justify-center overflow-hidden border-b border-studio-border">
                <img
                  src={item.clean_image_url || item.image_url}
                  alt={item.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.08))' }}
                />
              </div>
              <div className="p-2.5 w-full text-center">
                <p className="text-[11px] font-semibold text-studio-text truncate w-full">{item.name}</p>
                <span className="text-[10px] text-studio-muted font-mono">{item.subcategory}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Studio Fashion Labs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => setCurrentTab('outfit-creator')}
          className="p-6 rounded-2xl bg-studio-secondary border border-studio-border hover:border-studio-text/40 cursor-pointer group shadow-studio-card transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-studio-bg border border-studio-border flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Layers className="w-4 h-4 text-studio-text" />
          </div>
          <h3 className="text-sm font-bold text-studio-text font-display mb-1">Outfit Creator</h3>
          <p className="text-xs text-studio-muted leading-relaxed mb-4">
            Build custom looks layer-by-layer with live color harmony scoring and anti-repetition Surprise Me generator.
          </p>
          <span className="text-xs text-studio-text font-semibold inline-flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
            <span>Open Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => setCurrentTab('outfit-battle')}
          className="p-6 rounded-2xl bg-studio-secondary border border-studio-border hover:border-studio-text/40 cursor-pointer group shadow-studio-card transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-studio-bg border border-studio-border flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Swords className="w-4 h-4 text-studio-text" />
          </div>
          <h3 className="text-sm font-bold text-studio-text font-display mb-1">Outfit Battle Arena</h3>
          <p className="text-xs text-studio-muted leading-relaxed mb-4">
            Compare two outfits side-by-side. MIRA highlights the unique strengths of both and advises on occasion fit.
          </p>
          <span className="text-xs text-studio-text font-semibold inline-flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
            <span>Start Battle</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => setCurrentTab('color-lab')}
          className="p-6 rounded-2xl bg-studio-secondary border border-studio-border hover:border-studio-text/40 cursor-pointer group shadow-studio-card transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-studio-bg border border-studio-border flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Palette className="w-4 h-4 text-studio-text" />
          </div>
          <h3 className="text-sm font-bold text-studio-text font-display mb-1">Colour Match Lab</h3>
          <p className="text-xs text-studio-muted leading-relaxed mb-4">
            Extract garment color harmonies: Complementary, Analogous, Triadic, and Neutrals with matching closet items.
          </p>
          <span className="text-xs text-studio-text font-semibold inline-flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
            <span>Explore Palettes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};

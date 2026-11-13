import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Shirt,
  UserCheck,
  RotateCw,
  Download,
  Bookmark,
  MessageSquare,
  Check,
  AlertCircle,
  Loader2,
  ChevronRight,
  Maximize2,
  Star,
  Info,
  ShieldCheck,
  Box
} from 'lucide-react';
import { WardrobeItem, VirtualModelOption, TryOnResponse, UserProfile } from '../types';
import { ThreeDViewer } from '../components/ThreeDViewer';
import { api } from '../api';
import confetti from 'canvas-confetti';

interface TryOnViewProps {
  wardrobe: WardrobeItem[];
  models: VirtualModelOption[];
  profile?: UserProfile;
  initialSelectedUpper?: WardrobeItem | null;
  onOutfitGenerated: (outfit: TryOnResponse) => void;
  onAskMira: (outfit: TryOnResponse) => void;
}

export const TryOnView: React.FC<TryOnViewProps> = ({
  wardrobe,
  models,
  profile,
  initialSelectedUpper,
  onOutfitGenerated,
  onAskMira,
}) => {
  // Slots
  const [selectedUpper, setSelectedUpper] = useState<WardrobeItem | null>(initialSelectedUpper || null);
  const [selectedBottom, setSelectedBottom] = useState<WardrobeItem | null>(null);
  const [selectedOuter, setSelectedOuter] = useState<WardrobeItem | null>(null);
  const [selectedShoe, setSelectedShoe] = useState<WardrobeItem | null>(null);
  const [selectedAccessories, setSelectedAccessories] = useState<WardrobeItem[]>([]);

  // Model & Occasion
  const [selectedModelId, setSelectedModelId] = useState<string>(
    profile?.preferred_model_type || 'model_a_anime_male'
  );
  const [occasion, setOccasion] = useState<string>('Casual Outing');
  const [outfitName, setOutfitName] = useState<string>('Weekend Signature Look');

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [activeView, setActiveView] = useState<'FRONT' | 'BACK' | 'LEFT' | 'RIGHT' | '3D'>('FRONT');
  const [currentResult, setCurrentResult] = useState<TryOnResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-select smart defaults if slots are empty
  useEffect(() => {
    if (!selectedUpper) {
      const u = wardrobe.find((w) => w.category === 'UPPERWEAR');
      if (u) setSelectedUpper(u);
    }
    if (!selectedBottom) {
      const b = wardrobe.find((w) => w.category === 'BOTTOMWEAR');
      if (b) setSelectedBottom(b);
    }
    if (!selectedShoe) {
      const s = wardrobe.find((w) => w.category === 'FOOTWEAR');
      if (s) setSelectedShoe(s);
    }
    if (selectedAccessories.length === 0) {
      const a = wardrobe.find((w) => w.category === 'ACCESSORIES');
      if (a) setSelectedAccessories([a]);
    }
  }, [wardrobe]);

  // Handle Try-On Generation
  const handleGenerate = async () => {
    setErrorMsg(null);
    setIsGenerating(true);

    const steps = [
      'Parsing uploaded garment geometry & texture maps...',
      'Aligning garments to selected virtual model anatomy...',
      'Simulating ambient occlusion, fabric weight & crease drapes...',
      'Rendering multi-angle perspectives (Front, Back, Left, Right)...'
    ];

    let stepIndex = 0;
    setGenerationStep(steps[0]);
    const timer = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setGenerationStep(steps[stepIndex]);
      }
    }, 600);

    try {
      const accessoryIds = selectedAccessories.map((a) => a.id);
      const res = await api.generateVirtualTryOn({
        upperwear_id: selectedUpper?.id,
        bottomwear_id: selectedBottom?.id,
        outerwear_id: selectedOuter?.id,
        footwear_id: selectedShoe?.id,
        accessory_ids: accessoryIds,
        model_type: selectedModelId,
        model_settings: {
          skin_tone: profile?.skin_tone || '#d8b29c',
          body_proportions: profile?.body_proportions || 'regular',
        },
        name: outfitName || 'Custom Signature Look',
        occasion,
      });

      clearInterval(timer);
      setCurrentResult(res);
      setActiveView('FRONT');
      onOutfitGenerated(res);

      // Trigger subtle celebration confetti
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#8b5cf6', '#a855f7', '#10b981'],
        });
      } catch (e) {}
    } catch (err: any) {
      clearInterval(timer);
      setErrorMsg(err.message || 'Virtual try-on generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!currentResult) return;
    const viewUrl = currentResult.views[activeView] || currentResult.generated_image_url;
    const a = document.createElement('a');
    a.href = viewUrl;
    a.download = `dripverse-${outfitName.toLowerCase().replace(/\s+/g, '-')}-${activeView.toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Garment Preservation Engine v1.0</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-display">Virtual Try-On Studio</h2>
          <p className="text-xs text-zinc-400">
            Combine items from your vault, select your virtual model, and generate 4-view photorealistic visualizations.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || (!selectedUpper && !selectedBottom)}
          className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center space-x-2.5 transition-all shadow-glow-md hover:scale-[1.02]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Studio Render...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Virtual Try-On</span>
            </>
          )}
        </button>
      </div>

      {/* Main Studio Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Canvas & Multi-Angle Display (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-card rounded-3xl p-5 border border-white/10 relative overflow-hidden flex flex-col items-center">
            {/* Top View Selector Bar */}
            <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center space-x-1.5 overflow-x-auto">
                {(['FRONT', 'BACK', 'LEFT', 'RIGHT'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setActiveView(v)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                      activeView === v
                        ? 'bg-violet-600 text-white shadow-glow-sm'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {v} View
                  </button>
                ))}

                {/* 3D Orbit Studio Tab */}
                <button
                  onClick={() => setActiveView('3D')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                    activeView === '3D'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-glow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>3D Orbit</span>
                </button>
              </div>

              {currentResult && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDownload}
                    className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                    title="Download Generated High-Res View"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Stage Canvas Area */}
            <div className="relative w-full aspect-[3/4] max-h-[580px] rounded-2xl overflow-hidden bg-[#0a0a0f] border border-white/5 flex items-center justify-center">
              {isGenerating ? (
                /* Rich Loading State */
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
                    <Sparkles className="w-6 h-6 text-violet-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-display mb-1">Synthesizing Fit</h4>
                    <p className="text-xs text-violet-300 animate-pulse">{generationStep}</p>
                  </div>
                  <p className="text-[11px] text-zinc-500 max-w-xs">
                    Faithfully applying colors, logos, and textures to {models.find((m) => m.id === selectedModelId)?.name || 'model'}.
                  </p>
                </div>
              ) : activeView === '3D' ? (
                /* Three.js Interactive 3D Canvas */
                <ThreeDViewer
                  modelType={selectedModelId}
                  upperwearColor={selectedUpper?.main_color_hex || '#18181b'}
                  bottomwearColor={selectedBottom?.main_color_hex || '#1e3a8a'}
                  outerwearColor={selectedOuter?.main_color_hex}
                  footwearColor={selectedShoe?.main_color_hex || '#f4f4f5'}
                  skinTone={profile?.skin_tone || '#d8b29c'}
                  bodyProportions={profile?.body_proportions || 'regular'}
                />
              ) : currentResult ? (
                /* Generated AI View Image */
                <div className="relative w-full h-full">
                  <img
                    src={currentResult.views[activeView] || currentResult.generated_image_url}
                    alt={`${outfitName} - ${activeView}`}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-violet-300 border border-white/10 uppercase tracking-wider">
                    {activeView} VIEW
                  </div>
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-violet-600/90 text-white text-[11px] font-bold flex items-center space-x-1 shadow-glow-sm">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{currentResult.rating}</span>
                  </div>
                </div>
              ) : (
                /* Initial Placeholder Stage */
                <div className="text-center p-8 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto text-violet-400">
                    <UserCheck className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">Outfit Stage Ready</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    Select your garments on the right, pick one of the 6 virtual models, and press{' '}
                    <span className="text-violet-400 font-semibold">Generate Virtual Try-On</span> to see the result.
                  </p>
                </div>
              )}
            </div>

            {/* Garment Preservation Guarantee Pill */}
            <div className="w-full mt-4 p-3 rounded-xl bg-violet-950/20 border border-violet-500/20 flex items-center justify-between text-xs text-zinc-300">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px]">
                  <strong className="text-white">Garment Fidelity Guaranteed:</strong> Exact colors, patterns & styles preserved.
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 hidden sm:block">Model: {models.find((m) => m.id === selectedModelId)?.name}</span>
            </div>
          </div>

          {/* MIRA Evaluation Accordion (If result available) */}
          {currentResult && (
            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-violet-600/20 flex items-center justify-center text-violet-400">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">MIRA Fashion Critique</h4>
                </div>
                <button
                  onClick={() => onAskMira(currentResult)}
                  className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center space-x-1"
                >
                  <span>Chat with MIRA</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-zinc-200 leading-relaxed font-normal whitespace-pre-line bg-zinc-900/60 p-3.5 rounded-xl border border-white/5">
                {currentResult.stylist_notes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Wardrobe Slots & Model Selection (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Virtual Model Selector (The 6 models) */}
          <div className="glass-card p-5 rounded-3xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-display">Virtual Model Selection</h3>
                <p className="text-[11px] text-zinc-400">Choose from 6 distinct aesthetic presentations</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-semibold">
                6 Available
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {models.map((m) => {
                const isSelected = selectedModelId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModelId(m.id)}
                    className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-violet-600/20 border-violet-500 text-white shadow-glow-sm'
                        : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase font-bold text-violet-400">
                          {m.type_category}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-violet-400" />}
                      </div>
                      <p className="text-xs font-bold text-white truncate">{m.name}</p>
                    </div>
                    <p className="text-[10px] text-zinc-400 line-clamp-1 mt-1">{m.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wardrobe Slot Selection Controls */}
          <div className="glass-card p-5 rounded-3xl border border-white/10 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white font-display">Outfit Wardrobe Slots</h3>
              <p className="text-[11px] text-zinc-400">Pick garments to composite onto the model</p>
            </div>

            {/* Upperwear Slot */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-300 flex items-center justify-between">
                <span>1. Upperwear (Tees, Shirts, Hoodies)</span>
                {selectedUpper && <span className="text-[10px] text-violet-400 font-mono">{selectedUpper.main_color}</span>}
              </label>
              <select
                value={selectedUpper?.id || ''}
                onChange={(e) => {
                  const item = wardrobe.find((w) => w.id === Number(e.target.value));
                  setSelectedUpper(item || null);
                }}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
              >
                <option value="">-- None Selected --</option>
                {wardrobe
                  .filter((w) => w.category === 'UPPERWEAR')
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.main_color} • {w.pattern})
                    </option>
                  ))}
              </select>
            </div>

            {/* Bottomwear Slot */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-300 flex items-center justify-between">
                <span>2. Bottomwear (Jeans, Trousers, Cargo)</span>
                {selectedBottom && <span className="text-[10px] text-violet-400 font-mono">{selectedBottom.main_color}</span>}
              </label>
              <select
                value={selectedBottom?.id || ''}
                onChange={(e) => {
                  const item = wardrobe.find((w) => w.id === Number(e.target.value));
                  setSelectedBottom(item || null);
                }}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
              >
                <option value="">-- None Selected --</option>
                {wardrobe
                  .filter((w) => w.category === 'BOTTOMWEAR')
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.main_color} • {w.subcategory})
                    </option>
                  ))}
              </select>
            </div>

            {/* Outerwear Slot (Optional) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-300 flex items-center justify-between">
                <span>3. Outerwear (Jackets, Blazers, Coats)</span>
                <span className="text-[10px] text-zinc-500">Optional</span>
              </label>
              <select
                value={selectedOuter?.id || ''}
                onChange={(e) => {
                  const item = wardrobe.find((w) => w.id === Number(e.target.value));
                  setSelectedOuter(item || null);
                }}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
              >
                <option value="">-- No Outerwear Layer --</option>
                {wardrobe
                  .filter((w) => w.category === 'OUTERWEAR')
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.main_color})
                    </option>
                  ))}
              </select>
            </div>

            {/* Footwear Slot */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-300 flex items-center justify-between">
                <span>4. Footwear (Sneakers, Boots, Shoes)</span>
                {selectedShoe && <span className="text-[10px] text-violet-400 font-mono">{selectedShoe.main_color}</span>}
              </label>
              <select
                value={selectedShoe?.id || ''}
                onChange={(e) => {
                  const item = wardrobe.find((w) => w.id === Number(e.target.value));
                  setSelectedShoe(item || null);
                }}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
              >
                <option value="">-- None Selected --</option>
                {wardrobe
                  .filter((w) => w.category === 'FOOTWEAR')
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.subcategory})
                    </option>
                  ))}
              </select>
            </div>

            {/* Accessories Chips Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-zinc-300 block">
                5. Accessories (Watches, Chains, Sunglasses)
              </label>
              <div className="flex flex-wrap gap-2">
                {wardrobe
                  .filter((w) => w.category === 'ACCESSORIES')
                  .map((acc) => {
                    const isSelected = selectedAccessories.some((a) => a.id === acc.id);
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedAccessories((prev) => prev.filter((a) => a.id !== acc.id));
                          } else {
                            setSelectedAccessories((prev) => [...prev, acc]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-violet-600/30 border-violet-500 text-white shadow-glow-sm'
                            : 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {acc.name}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Occasion & Outfit Name */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
              <div>
                <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Occasion</label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="Casual Outing">Casual Outing</option>
                  <option value="Streetwear Fit">Streetwear Fit</option>
                  <option value="Office & Work">Office & Work</option>
                  <option value="Date Night">Date Night</option>
                  <option value="College">College</option>
                  <option value="Party & Nightclub">Party & Nightclub</option>
                  <option value="Wedding / Festive">Wedding / Festive</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Look Name</label>
                <input
                  type="text"
                  value={outfitName}
                  onChange={(e) => setOutfitName(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

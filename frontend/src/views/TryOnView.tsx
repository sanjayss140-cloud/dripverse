import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Download,
  Check,
  Loader2,
  ChevronRight,
  Star,
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
  theme?: 'light' | 'dark';
  onOutfitGenerated: (outfit: TryOnResponse) => void;
  onAskMira: (outfit: TryOnResponse) => void;
}

export const TryOnView: React.FC<TryOnViewProps> = ({
  wardrobe,
  models,
  profile,
  initialSelectedUpper,
  theme = 'light',
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
  const [outfitName, setOutfitName] = useState<string>('Tokyo Minimalist Streetwear');

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [activeView, setActiveView] = useState<'FRONT' | 'BACK' | 'LEFT' | 'RIGHT' | '3D'>('FRONT');
  const [currentResult, setCurrentResult] = useState<TryOnResponse | null>(null);
  const [_errorMsg, setErrorMsg] = useState<string | null>(null);

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
      'Extracting physical garment textures, drape & silhouette geometry...',
      'Mapping authentic clothing layers to model anatomical landmarks...',
      'Simulating directional studio keylight, contact shadows & fabric tension...',
      'Synthesizing 4-perspective high-resolution White Studio renders...'
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
          skin_tone: profile?.skin_tone || '#e8c4a2',
          body_proportions: profile?.body_proportions || 'regular',
        },
        name: outfitName || 'Custom Signature Look',
        occasion,
      });

      clearInterval(timer);
      setCurrentResult(res);
      setActiveView('FRONT');
      onOutfitGenerated(res);

      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#171717', '#7547D9', '#EAEAEA'],
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

  const currentModelObj = models.find((m) => m.id === selectedModelId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-studio-border pb-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-studio-secondary border border-studio-border text-studio-text text-[11px] font-mono uppercase tracking-widest mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-studio-text" />
            <span>NEURAL COMPOSITION ENGINE • WHITE STUDIO</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-studio-text font-display">Virtual Try-On Atelier</h2>
          <p className="text-xs text-studio-muted">
            Combine items from your vault, select your virtual model, and generate 4-view photorealistic visualizations.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || (!selectedUpper && !selectedBottom)}
          className="px-6 py-3 rounded-xl bg-studio-text hover:bg-studio-text/90 disabled:opacity-40 text-studio-bg font-bold text-xs sm:text-sm flex items-center space-x-2.5 transition-all shadow-studio-sm hover:scale-[1.01]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-studio-bg" />
              <span>Synthesizing Studio Render...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-studio-bg" />
              <span>Generate Virtual Try-On</span>
            </>
          )}
        </button>
      </div>

      {/* Main Studio Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Canvas & Multi-Angle Display (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl p-5 border border-studio-border bg-studio-bg relative overflow-hidden flex flex-col items-center shadow-studio-card">
            {/* Top View Selector Bar */}
            <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-studio-border">
              <div className="flex items-center space-x-1.5 overflow-x-auto">
                {(['FRONT', 'BACK', 'LEFT', 'RIGHT'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setActiveView(v)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                      activeView === v
                        ? 'bg-studio-text text-studio-bg font-bold shadow-studio-sm'
                        : 'bg-studio-secondary text-studio-muted hover:text-studio-text border border-studio-border'
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
                      ? 'bg-studio-text text-studio-bg font-bold shadow-studio-sm'
                      : 'bg-studio-secondary text-studio-muted hover:text-studio-text border border-studio-border'
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
                    className="p-1.5 rounded-lg bg-studio-secondary text-studio-muted hover:text-studio-text hover:bg-studio-card border border-studio-border transition-colors"
                    title="Download Generated High-Res View"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Stage Canvas Area */}
            <div className="relative w-full aspect-[3/4] max-h-[580px] studio-canvas flex items-center justify-center">
              {isGenerating ? (
                /* Rich Loading State */
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-5">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-[3px] border-studio-border border-t-studio-text animate-spin" />
                    <Sparkles className="w-5 h-5 text-studio-text absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-studio-text font-display mb-1.5">Compositing Outfit</h4>
                    <p className="text-[11px] text-studio-muted animate-pulse font-mono leading-relaxed max-w-xs">{generationStep}</p>
                  </div>
                </div>
              ) : activeView === '3D' ? (
                /* Three.js Interactive 3D Canvas */
                <ThreeDViewer
                  modelType={selectedModelId}
                  upperwearColor={selectedUpper?.main_color_hex || '#18181b'}
                  bottomwearColor={selectedBottom?.main_color_hex || '#1e3a8a'}
                  outerwearColor={selectedOuter?.main_color_hex}
                  footwearColor={selectedShoe?.main_color_hex || '#f4f4f5'}
                  skinTone={profile?.skin_tone || '#e8c4a2'}
                  bodyProportions={profile?.body_proportions || 'regular'}
                  theme={theme}
                />
              ) : currentResult ? (
                /* Generated AI View Image */
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={currentResult.views[activeView] || currentResult.generated_image_url}
                    alt={`${outfitName} - ${activeView}`}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-3 left-3 badge badge-dark">
                    {activeView} VIEW
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-studio-text text-studio-bg text-[11px] font-bold shadow-studio-sm">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{currentResult.rating}</span>
                  </div>
                </div>
              ) : (
                /* Pre-Try-On Stage: Real Selected Model Preview */
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <img
                    src={(() => {
                      const id = selectedModelId;
                      const fn = id.includes('anime_male') ? 'model_a_anime_male'
                        : id.includes('anime_female') ? 'model_b_anime_female'
                        : id.includes('human_male') ? 'model_c_human_male'
                        : id.includes('human_female') ? 'model_d_human_female'
                        : id.includes('mannequin_male') ? 'model_e_mannequin_male'
                        : id.includes('mannequin_female') ? 'model_f_mannequin_female'
                        : id;
                      return `/api/media/models/${fn}.png`;
                    })()}
                    alt={currentModelObj?.name || 'Selected Model'}
                    className="w-full h-full object-contain max-h-[500px]"
                    style={{ padding: '8px' }}
                  />
                  <div className="absolute bottom-3 inset-x-3 p-3 rounded-xl bg-white/90 dark:bg-black/80 backdrop-blur-sm border border-studio-border flex items-center justify-between shadow-studio-sm">
                    <div>
                      <p className="text-[11px] font-bold text-studio-text uppercase tracking-wider">{currentModelObj?.name?.split('—')[0] || 'Model'}</p>
                      <p className="text-[10px] text-studio-muted">Select clothes & click Generate Try-On</p>
                    </div>
                    <span className="badge">READY</span>
                  </div>
                </div>
              )}
            </div>

            {/* Garment Preservation Guarantee Pill */}
            <div className="w-full mt-4 p-3 rounded-xl bg-studio-secondary border border-studio-border flex items-center justify-between text-xs text-studio-text">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-studio-text shrink-0" />
                <span className="text-[11px]">
                  <strong className="text-studio-text font-semibold">Authentic Wardrobe Fidelity:</strong> Original physical garments preserved with true drape.
                </span>
              </div>
              <span className="text-[10px] text-studio-muted hidden sm:block font-mono">{currentModelObj?.name}</span>
            </div>
          </div>

          {/* MIRA Evaluation Accordion */}
          {currentResult && (
            <div className="rounded-2xl p-5 border border-studio-border bg-studio-bg space-y-3 shadow-studio-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-studio-secondary flex items-center justify-center text-studio-text">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-studio-text">MIRA Fashion Critique</h4>
                </div>
                <button
                  onClick={() => onAskMira(currentResult)}
                  className="text-xs font-semibold text-studio-text hover:underline flex items-center space-x-1"
                >
                  <span>Chat with MIRA</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-studio-text leading-relaxed font-normal whitespace-pre-line bg-studio-secondary p-3.5 rounded-xl border border-studio-border">
                {currentResult.stylist_notes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Wardrobe Slots & Model Selection (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Virtual Model Selector — Premium Large Cards */}
          <div className="p-5 rounded-3xl border border-studio-border bg-studio-bg space-y-4 shadow-studio-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-studio-text font-display">Virtual Model Selection</h3>
                <p className="text-[11px] text-studio-muted">Choose your fashion model for try-on</p>
              </div>
              <span className="badge">6 Models</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {models.map((m) => {
                const isSelected = selectedModelId === m.id;
                // Map model id to correct filename
                const imgFilename = m.id.includes('anime_male') ? 'model_a_anime_male'
                  : m.id.includes('anime_female') ? 'model_b_anime_female'
                  : m.id.includes('human_male') ? 'model_c_human_male'
                  : m.id.includes('human_female') ? 'model_d_human_female'
                  : m.id.includes('mannequin_male') ? 'model_e_mannequin_male'
                  : m.id.includes('mannequin_female') ? 'model_f_mannequin_female'
                  : m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModelId(m.id)}
                    className={`model-card ${isSelected ? 'selected' : ''}`}
                    title={m.name}
                  >
                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-studio-text flex items-center justify-center z-10">
                        <Check className="w-3 h-3 text-studio-bg" />
                      </div>
                    )}

                    {/* Model Image */}
                    <div className="model-card-image w-full">
                      <img
                        src={`/api/media/models/${imgFilename}.png`}
                        alt={m.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `/api/media/models/${m.id}.png`;
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="w-full text-center space-y-0.5">
                      <span className="text-[8px] font-mono uppercase tracking-widest font-bold text-studio-muted block">
                        {m.type_category}
                      </span>
                      <p className="text-[11px] font-bold text-studio-text leading-tight">
                        {m.name.split('—')[0].split(' ')[0]}
                      </p>
                      <p className="text-[9px] text-studio-muted capitalize">{m.gender}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wardrobe Slot Selection Controls */}
          <div className="p-5 rounded-3xl border border-studio-border bg-studio-bg space-y-4 shadow-studio-card">
            <div>
              <h3 className="text-sm font-bold text-studio-text font-display">Outfit Wardrobe Slots</h3>
              <p className="text-[11px] text-studio-muted">Select garments to composite onto the model</p>
            </div>

            {/* Upperwear Slot */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-studio-text flex items-center justify-between">
                <span>1. Upperwear (Tees, Shirts, Hoodies)</span>
                {selectedUpper && <span className="text-[10px] text-studio-muted font-mono">{selectedUpper.main_color}</span>}
              </label>
              <select
                value={selectedUpper?.id || ''}
                onChange={(e) => {
                  const item = wardrobe.find((w) => w.id === Number(e.target.value));
                  setSelectedUpper(item || null);
                }}
                className="w-full bg-studio-secondary border border-studio-border rounded-xl px-3 py-2 text-xs text-studio-text focus:outline-none focus:border-studio-text"
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
              <label className="text-[11px] font-semibold text-studio-text flex items-center justify-between">
                <span>2. Bottomwear (Jeans, Trousers, Cargo)</span>
                {selectedBottom && <span className="text-[10px] text-studio-muted font-mono">{selectedBottom.main_color}</span>}
              </label>
              <select
                value={selectedBottom?.id || ''}
                onChange={(e) => {
                  const item = wardrobe.find((w) => w.id === Number(e.target.value));
                  setSelectedBottom(item || null);
                }}
                className="w-full bg-studio-secondary border border-studio-border rounded-xl px-3 py-2 text-xs text-studio-text focus:outline-none focus:border-studio-text"
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
              <label className="text-[11px] font-semibold text-studio-text flex items-center justify-between">
                <span>3. Outerwear (Jackets, Blazers, Coats)</span>
                <span className="text-[10px] text-studio-muted">Optional</span>
              </label>
              <select
                value={selectedOuter?.id || ''}
                onChange={(e) => {
                  const item = wardrobe.find((w) => w.id === Number(e.target.value));
                  setSelectedOuter(item || null);
                }}
                className="w-full bg-studio-secondary border border-studio-border rounded-xl px-3 py-2 text-xs text-studio-text focus:outline-none focus:border-studio-text"
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
              <label className="text-[11px] font-semibold text-studio-text flex items-center justify-between">
                <span>4. Footwear (Sneakers, Boots, Shoes)</span>
                {selectedShoe && <span className="text-[10px] text-studio-muted font-mono">{selectedShoe.main_color}</span>}
              </label>
              <select
                value={selectedShoe?.id || ''}
                onChange={(e) => {
                  const item = wardrobe.find((w) => w.id === Number(e.target.value));
                  setSelectedShoe(item || null);
                }}
                className="w-full bg-studio-secondary border border-studio-border rounded-xl px-3 py-2 text-xs text-studio-text focus:outline-none focus:border-studio-text"
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
              <label className="text-[11px] font-semibold text-studio-text block">
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
                            ? 'bg-studio-text border-studio-text text-studio-bg font-semibold shadow-studio-sm'
                            : 'bg-studio-secondary border-studio-border text-studio-muted hover:text-studio-text'
                        }`}
                      >
                        {acc.name}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Occasion & Outfit Name */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-studio-border">
              <div>
                <label className="text-[10px] text-studio-muted font-semibold block mb-1">Occasion</label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full bg-studio-secondary border border-studio-border rounded-xl px-2.5 py-1.5 text-xs text-studio-text focus:outline-none"
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
                <label className="text-[10px] text-studio-muted font-semibold block mb-1">Look Name</label>
                <input
                  type="text"
                  value={outfitName}
                  onChange={(e) => setOutfitName(e.target.value)}
                  className="w-full bg-studio-secondary border border-studio-border rounded-xl px-2.5 py-1.5 text-xs text-studio-text focus:outline-none focus:border-studio-text"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

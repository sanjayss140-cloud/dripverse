import React, { useState } from 'react';
import {
  Check,
  Palette,
  Sliders,
  Save,
  CheckCircle2
} from 'lucide-react';
import { VirtualModelOption, UserProfile } from '../types';
import { api } from '../api';

interface AvatarStudioViewProps {
  models: VirtualModelOption[];
  profile?: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
}

const SKIN_TONES = [
  { name: 'Porcelain Ivory', hex: '#f7ded0' },
  { name: 'Warm Beige', hex: '#e8c4a2' },
  { name: 'Desert Sand', hex: '#d8b29c' },
  { name: 'Golden Honey', hex: '#c68b59' },
  { name: 'Rich Caramel', hex: '#8d5524' },
  { name: 'Deep Espresso', hex: '#492816' },
];

const HAIR_STYLES = [
  'Modern Textured Quiff',
  'Clean Taper Fade',
  'Middle Part Curtains',
  'Layered Wavy Bob',
  'Sleek High Ponytail',
  'Minimalist Buzz Cut',
  'Curled Afro Taper',
  'Shoulder Length Waves',
];

const HAIR_COLORS = [
  { name: 'Midnight Jet', hex: '#18181b' },
  { name: 'Dark Mocha', hex: '#3d2b1f' },
  { name: 'Warm Chestnut', hex: '#5c3a21' },
  { name: 'Platinum Blonde', hex: '#e2d6b5' },
  { name: 'Silver Ash', hex: '#94a3b8' },
  { name: 'Charcoal Black', hex: '#262626' },
];

const BODY_PROPORTIONS = [
  { id: 'slim', label: 'Slim & Tailored', desc: 'Sleek, streamlined runway drape' },
  { id: 'regular', label: 'Contemporary Regular', desc: 'Standard balanced everyday fit' },
  { id: 'athletic', label: 'Athletic V-Taper', desc: 'Broader shoulders & tapered waist' },
  { id: 'tall', label: 'Elongated Tall', desc: 'Extended leg drape & tall silhouette' },
];

export const AvatarStudioView: React.FC<AvatarStudioViewProps> = ({
  models,
  profile,
  onProfileUpdated,
}) => {
  const [selectedModel, setSelectedModel] = useState<string>(
    profile?.preferred_model_type || 'model_a_anime_male'
  );
  const [skinTone, setSkinTone] = useState<string>(profile?.skin_tone || '#e8c4a2');
  const [hairStyle, setHairStyle] = useState<string>(profile?.hair_style || 'Modern Textured Quiff');
  const [hairColor, setHairColor] = useState<string>(profile?.hair_color || '#18181b');
  const [proportions, setProportions] = useState<string>(profile?.body_proportions || 'regular');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSavePreferences = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await api.customizeAvatar({
        model_type: selectedModel,
        skin_tone: skinTone,
        hair_style: hairStyle,
        hair_color: hairColor,
        body_proportions: proportions,
      });
      onProfileUpdated(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-studio-border pb-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-studio-secondary border border-studio-border text-studio-text text-[11px] font-mono tracking-widest uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-studio-text" />
            <span>SELECTABLE FASHION MODELS • WHITE STUDIO</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-studio-text font-display">Avatar & Model Studio</h2>
          <p className="text-xs text-studio-muted">
            Never locked to one style. Choose from 6 distinct virtual models & calibrate individual styling proportions.
          </p>
        </div>

        <button
          onClick={handleSavePreferences}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-studio-text hover:bg-studio-text/90 disabled:opacity-50 text-studio-bg font-semibold text-xs flex items-center space-x-2 transition-all shadow-studio-sm"
        >
          {saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Preferences Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-studio-bg" />
              <span>{isSaving ? 'Saving...' : 'Set as Default Model'}</span>
            </>
          )}
        </button>
      </div>

      {/* The 6 Models Showcase Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-studio-muted">
            THE 6 SELECTABLE VIRTUAL MODELS
          </h3>
          <span className="text-[10px] font-mono text-studio-subtle">ANIME • HUMAN • MANNEQUIN</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((m) => {
            const isSelected = selectedModel === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                className={`rounded-2xl border cursor-pointer flex flex-col justify-between transition-all relative overflow-hidden shadow-studio-card bg-studio-bg group ${
                  isSelected
                    ? 'border-studio-text ring-1 ring-studio-text shadow-studio-md'
                    : 'border-studio-border hover:border-studio-text/40'
                }`}
              >
                {/* Visual Model Preview Header with 3:4 Tall Portrait Display */}
                <div className="relative aspect-[3/4] bg-studio-secondary overflow-hidden border-b border-studio-border flex items-center justify-center p-3">
                  <img
                    src={`/api/media/models/${m.id}.png`}
                    alt={m.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded bg-studio-bg/95 backdrop-blur-md text-studio-text text-[9px] font-mono uppercase tracking-wider border border-studio-border shadow-sm font-bold">
                    {m.type_category} • {m.gender}
                  </div>
                  {isSelected && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-studio-text text-studio-bg text-[10px] font-mono font-bold flex items-center space-x-1 shadow-studio-sm">
                      <Check className="w-3.5 h-3.5" />
                      <span>SELECTED</span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-studio-text font-display mb-1">{m.name}</h4>
                    <p className="text-xs text-studio-muted leading-relaxed">{m.description}</p>
                  </div>

                  <div className="pt-3 border-t border-studio-border flex flex-wrap gap-1.5">
                    {m.features.map((f, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-mono px-2 py-0.5 rounded bg-studio-secondary text-studio-muted border border-studio-border font-medium"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customization Controls: Skin Tone, Hair, Proportions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Skin Tone Palette */}
        <div className="p-6 rounded-3xl border border-studio-border bg-studio-bg space-y-4 shadow-studio-card">
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-studio-text" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-studio-text">Skin Tone Swatches</h4>
          </div>
          <p className="text-xs text-studio-muted">
            Calibrated studio lighting skin reflectance for high-fidelity fabric drape.
          </p>

          <div className="grid grid-cols-3 gap-2.5">
            {SKIN_TONES.map((st) => {
              const isPicked = skinTone.toLowerCase() === st.hex.toLowerCase();
              return (
                <button
                  key={st.hex}
                  type="button"
                  onClick={() => setSkinTone(st.hex)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center space-y-1.5 transition-all ${
                    isPicked
                      ? 'border-studio-text bg-studio-secondary shadow-studio-sm'
                      : 'border-studio-border bg-studio-bg hover:border-studio-text/40'
                  }`}
                >
                  <span
                    className="w-7 h-7 rounded-full shadow-inner border border-black/10"
                    style={{ backgroundColor: st.hex }}
                  />
                  <span className="text-[10px] font-medium text-studio-text text-center leading-tight">
                    {st.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hair Styling */}
        <div className="p-6 rounded-3xl border border-studio-border bg-studio-bg space-y-4 shadow-studio-card">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-studio-text" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-studio-text">Hair Styling & Shade</h4>
          </div>
          <p className="text-xs text-studio-muted">
            Editorial coiffure options tailored to the anime and human models.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-semibold text-studio-muted uppercase block mb-1">
                Hair Cut Style
              </label>
              <select
                value={hairStyle}
                onChange={(e) => setHairStyle(e.target.value)}
                className="w-full bg-studio-secondary border border-studio-border rounded-xl px-3 py-2 text-xs text-studio-text focus:outline-none focus:border-studio-text"
              >
                {HAIR_STYLES.map((hs) => (
                  <option key={hs} value={hs}>
                    {hs}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-studio-muted uppercase block mb-1">
                Hair Color Tone
              </label>
              <div className="grid grid-cols-3 gap-2">
                {HAIR_COLORS.map((hc) => {
                  const isPicked = hairColor.toLowerCase() === hc.hex.toLowerCase();
                  return (
                    <button
                      key={hc.hex}
                      type="button"
                      onClick={() => setHairColor(hc.hex)}
                      className={`p-2 rounded-xl border flex items-center space-x-1.5 transition-all ${
                        isPicked
                          ? 'border-studio-text bg-studio-secondary'
                          : 'border-studio-border bg-studio-bg'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: hc.hex }}
                      />
                      <span className="text-[10px] font-medium text-studio-text truncate">
                        {hc.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Body Proportions */}
        <div className="p-6 rounded-3xl border border-studio-border bg-studio-bg space-y-4 shadow-studio-card">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-studio-text" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-studio-text">Body Frame & Build</h4>
          </div>
          <p className="text-xs text-studio-muted">
            Configures garment drape tension, shoulder width, and hem proportions.
          </p>

          <div className="space-y-2">
            {BODY_PROPORTIONS.map((bp) => {
              const isSelected = proportions === bp.id;
              return (
                <button
                  key={bp.id}
                  type="button"
                  onClick={() => setProportions(bp.id)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-studio-text bg-studio-secondary shadow-studio-sm font-semibold'
                      : 'border-studio-border bg-studio-bg hover:border-studio-text/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-studio-text">{bp.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-studio-text" />}
                  </div>
                  <p className="text-[11px] text-studio-muted mt-0.5">{bp.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

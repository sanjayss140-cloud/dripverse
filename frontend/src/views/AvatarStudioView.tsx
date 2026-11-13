import React, { useState } from 'react';
import {
  UserCheck,
  Sparkles,
  Check,
  Palette,
  Scissors,
  Sliders,
  ShieldCheck,
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
  { name: 'Violet Tint', hex: '#7c3aed' },
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
  const [skinTone, setSkinTone] = useState<string>(profile?.skin_tone || '#d8b29c');
  const [hairStyle, setHairStyle] = useState<string>(profile?.hair_style || 'Modern Textured Quiff');
  const [hairColor, setHairColor] = useState<string>(profile?.hair_color || '#18181b');
  const [proportions, setProportions] = useState<string>(profile?.body_proportions || 'regular');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const activeModelMeta = models.find((m) => m.id === selectedModel);

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
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-2">
            <UserCheck className="w-3.5 h-3.5 text-violet-400" />
            <span>Inclusive Virtual Runway</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-display">Avatar & Model Studio</h2>
          <p className="text-xs text-zinc-400">
            Never locked to one style. Switch between 6 distinct virtual models & configure personal body proportions.
          </p>
        </div>

        <button
          onClick={handleSavePreferences}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center space-x-2 transition-all shadow-glow-sm"
        >
          {saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Preferences Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Default Model'}</span>
            </>
          )}
        </button>
      </div>

      {/* The 6 Models Showcase Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
          The 6 Selectable Virtual Models
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((m) => {
            const isSelected = selectedModel === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                className={`glass-card-hover p-5 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all relative ${
                  isSelected
                    ? 'border-violet-500 bg-violet-950/20 shadow-glow-sm'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-zinc-800 text-violet-400">
                      {m.type_category} • {m.gender}
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-white">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white font-display mb-1">{m.name}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">{m.description}</p>
                </div>

                <div className="space-y-2 pt-3 border-t border-white/5">
                  <div className="flex flex-wrap gap-1.5">
                    {m.features.map((f, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 border border-white/5 font-medium"
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
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-violet-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Skin Tone Swatches</h4>
          </div>
          <p className="text-xs text-zinc-400">
            Natural studio lighting calibration for realistic garment rendering.
          </p>

          <div className="grid grid-cols-3 gap-2.5">
            {SKIN_TONES.map((st) => {
              const isPicked = skinTone.toLowerCase() === st.hex.toLowerCase();
              return (
                <button
                  key={st.hex}
                  onClick={() => setSkinTone(st.hex)}
                  className={`p-2 rounded-xl border flex flex-col items-center space-y-2 transition-all ${
                    isPicked ? 'border-violet-500 bg-violet-950/30' : 'border-white/10 bg-zinc-900/60'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full shadow-inner border border-white/20"
                    style={{ backgroundColor: st.hex }}
                  />
                  <span className="text-[10px] text-zinc-300 font-medium text-center truncate w-full">
                    {st.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hairstyle & Hair Color */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center space-x-2">
            <Scissors className="w-4 h-4 text-violet-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Hair Styling</h4>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-zinc-400 font-semibold uppercase">Cut & Texture</label>
            <select
              value={hairStyle}
              onChange={(e) => setHairStyle(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
            >
              {HAIR_STYLES.map((hs) => (
                <option key={hs} value={hs}>
                  {hs}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-[10px] text-zinc-400 font-semibold uppercase">Color Tone</label>
            <div className="flex items-center space-x-2">
              {HAIR_COLORS.map((hc) => (
                <button
                  key={hc.hex}
                  onClick={() => setHairColor(hc.hex)}
                  title={hc.name}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    hairColor.toLowerCase() === hc.hex.toLowerCase()
                      ? 'border-violet-500 scale-110'
                      : 'border-white/20'
                  }`}
                  style={{ backgroundColor: hc.hex }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Body Proportions */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-violet-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Body Proportions</h4>
          </div>
          <p className="text-xs text-zinc-400">Calibrates garment drape, waist tapering & shoulder breadth.</p>

          <div className="space-y-2">
            {BODY_PROPORTIONS.map((bp) => {
              const isChosen = proportions === bp.id;
              return (
                <button
                  key={bp.id}
                  onClick={() => setProportions(bp.id)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isChosen
                      ? 'border-violet-500 bg-violet-950/20 text-white'
                      : 'border-white/10 bg-zinc-900/60 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold text-white">{bp.label}</p>
                    <p className="text-[10px] text-zinc-400">{bp.desc}</p>
                  </div>
                  {isChosen && <Check className="w-3.5 h-3.5 text-violet-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

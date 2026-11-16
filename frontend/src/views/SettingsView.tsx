import React, { useState, useEffect } from 'react';
import {
  Sliders,
  CheckCircle2,
  Eye,
  EyeOff,
  Cpu,
  Sun,
  Moon,
  Sparkles,
  Download,
  ShieldCheck,
  Check
} from 'lucide-react';
import { UserProfile } from '../types';
import { api } from '../api';

interface SettingsViewProps {
  profile?: UserProfile;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onProfileUpdated: (updated: UserProfile) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  theme,
  setTheme,
  onProfileUpdated,
}) => {
  const [displayName, setDisplayName] = useState(profile?.display_name || 'Alex Rivera');
  const [stylePreference, setStylePreference] = useState(profile?.style_preference || 'Streetwear & Casual');
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [settingsData, setSettingsData] = useState<any>(null);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [keySaveMessage, setKeySaveMessage] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettingsData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateProfile({
        display_name: displayName,
        style_preference: stylePreference,
      });
      onProfileUpdated(updated);
      alert('Profile preferences updated!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingKey(true);
    setKeySaveMessage(null);

    try {
      const res = await api.updateApiKeys({ gemini: geminiKeyInput });
      setKeySaveMessage(res.message);
      setGeminiKeyInput('');
      fetchSettings();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await api.exportWardrobe();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dripverse-wardrobe-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-studio-accentSubtle border border-studio-accent/20 text-studio-accent text-xs font-semibold mb-2">
          <Sliders className="w-3.5 h-3.5" />
          <span>System & Preferences</span>
        </div>
        <h2 className="text-2xl font-bold text-studio-text font-display">Profile & Settings</h2>
        <p className="text-xs text-studio-muted">
          Manage your studio theme, AI engine credentials, stylist profile, and wardrobe backups.
        </p>
      </div>

      {/* Theme Selection: Light Studio (Default) vs Dark Studio (Optional) */}
      <div className="glass-card p-6 rounded-3xl border border-studio-border space-y-4 shadow-studio-card">
        <div className="flex items-center justify-between pb-3 border-b border-studio-border">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-studio-accentSubtle flex items-center justify-center text-studio-accent">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-studio-text font-display">Studio Visual Theme</h3>
              <p className="text-[11px] text-studio-muted">Switch between Luxury White Fashion Studio (default) and Dark Studio</p>
            </div>
          </div>

          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-studio-accentSubtle text-studio-accent border border-studio-accent/20">
            {theme === 'light' ? 'Light Studio Active' : 'Dark Studio Active'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Light Studio Card */}
          <div
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
              theme === 'light'
                ? 'border-studio-accent bg-studio-accentSubtle/40 ring-2 ring-studio-accent shadow-studio-sm'
                : 'border-studio-border bg-studio-secondary hover:border-studio-accent/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-amber-500 shadow-sm">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Light Studio (Default)</h4>
                  <span className="text-[10px] text-gray-500">Luxury editorial white showroom</span>
                </div>
              </div>
              {theme === 'light' && <Check className="w-4 h-4 text-studio-accent" />}
            </div>

            {/* Mini Color Swatches */}
            <div className="flex items-center space-x-1.5 pt-2">
              <span className="w-6 h-6 rounded-md bg-[#FFFFFF] border border-gray-300 shadow-sm" title="#FFFFFF Base" />
              <span className="w-6 h-6 rounded-md bg-[#F8F8F8] border border-gray-300 shadow-sm" title="#F8F8F8 Secondary" />
              <span className="w-6 h-6 rounded-md bg-[#7547D9] shadow-sm" title="#7547D9 Purple Accent" />
              <span className="w-6 h-6 rounded-md bg-[#F3EEFF] border border-purple-200" title="#F3EEFF Subtle Accent" />
              <span className="w-6 h-6 rounded-md bg-[#171717]" title="#171717 Primary Typography" />
            </div>
          </div>

          {/* Dark Studio Card */}
          <div
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
              theme === 'dark'
                ? 'border-studio-accent bg-studio-accentSubtle/40 ring-2 ring-studio-accent shadow-studio-sm'
                : 'border-studio-border bg-studio-secondary hover:border-studio-accent/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-violet-400 shadow-sm">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-studio-text">Dark Studio (Optional)</h4>
                  <span className="text-[10px] text-studio-muted">Midnight charcoal atmosphere</span>
                </div>
              </div>
              {theme === 'dark' && <Check className="w-4 h-4 text-studio-accent" />}
            </div>

            {/* Mini Color Swatches */}
            <div className="flex items-center space-x-1.5 pt-2">
              <span className="w-6 h-6 rounded-md bg-[#0B0B0F] border border-zinc-700" title="#0B0B0F Base" />
              <span className="w-6 h-6 rounded-md bg-[#16161F] border border-zinc-700" title="#16161F Secondary" />
              <span className="w-6 h-6 rounded-md bg-[#8B5CF6]" title="#8B5CF6 Purple Accent" />
              <span className="w-6 h-6 rounded-md bg-[#272738]" title="#272738 Border" />
              <span className="w-6 h-6 rounded-md bg-[#F4F4F6]" title="#F4F4F6 Typography" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Engine Status & Configuration */}
      <div className="glass-card p-6 rounded-3xl border border-studio-border space-y-4 shadow-studio-card">
        <div className="flex items-center justify-between pb-3 border-b border-studio-border">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-studio-accentSubtle flex items-center justify-center text-studio-accent">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-studio-text font-display">AI Engine Architecture</h3>
              <p className="text-[11px] text-studio-muted">Original AI visuals & garment compositing pipeline</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{settingsData?.active_ai_provider || 'Neural Garment Compositor Active'}</span>
          </div>
        </div>

        <p className="text-xs text-studio-muted leading-relaxed font-normal">
          DRIPVERSE operates with a provider-independent AI engine. By default, our built-in{' '}
          <strong className="text-studio-text font-semibold">Neural Garment Compositing Engine</strong> faithfully preserves uploaded clothing
          geometry and generates 4-view multi-angle renders. You can also configure a{' '}
          <strong className="text-studio-text font-semibold">Google Gemini API Key</strong> for enhanced multimodal visual classification.
        </p>

        {/* API Key Form */}
        <form onSubmit={handleSaveApiKey} className="space-y-3 pt-2">
          <label className="text-[10px] uppercase font-bold text-studio-muted block">
            Gemini API Key (Optional)
          </label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder={settingsData?.masked_gemini_key || 'AIzaSy... (leave blank to use Built-in Engine)'}
                value={geminiKeyInput}
                onChange={(e) => setGeminiKeyInput(e.target.value)}
                className="w-full bg-studio-secondary border border-studio-border rounded-xl px-4 py-2.5 text-xs text-studio-text placeholder-studio-subtle focus:outline-none focus:border-studio-accent"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-studio-muted hover:text-studio-text"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={isSavingKey || !geminiKeyInput.trim()}
              className="px-5 py-2.5 bg-studio-accent hover:bg-studio-accentHover disabled:opacity-40 text-white font-semibold text-xs rounded-xl transition-all shadow-studio-sm"
            >
              {isSavingKey ? 'Saving...' : 'Connect Key'}
            </button>
          </div>
          {keySaveMessage && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{keySaveMessage}</span>
            </p>
          )}
        </form>
      </div>

      {/* Profile Preferences Card */}
      <div className="glass-card p-6 rounded-3xl border border-studio-border space-y-4 shadow-studio-card">
        <h3 className="text-sm font-bold text-studio-text font-display pb-3 border-b border-studio-border">
          Personal Stylist Profile
        </h3>

        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-studio-muted block mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-studio-secondary border border-studio-border rounded-xl px-3 py-2 text-studio-text focus:outline-none focus:border-studio-accent"
                required
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-studio-muted block mb-1">Default Fashion Style</label>
              <select
                value={stylePreference}
                onChange={(e) => setStylePreference(e.target.value)}
                className="w-full bg-studio-secondary border border-studio-border rounded-xl px-3 py-2 text-studio-text focus:outline-none cursor-pointer"
              >
                <option value="Streetwear & Casual">Streetwear & Casual</option>
                <option value="Contemporary Minimalist">Contemporary Minimalist</option>
                <option value="Sartorial & Formal">Sartorial & Formal</option>
                <option value="Date Night & Evening">Date Night & Evening</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-studio-accent hover:bg-studio-accentHover text-white font-semibold transition-all shadow-studio-sm"
          >
            Save Profile
          </button>
        </form>
      </div>

      {/* Privacy & Wardrobe Backup */}
      <div className="glass-card p-6 rounded-3xl border border-studio-border space-y-4 shadow-studio-card">
        <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
          <h3 className="text-sm font-bold font-display">Privacy & Data Security</h3>
        </div>

        <p className="text-xs text-studio-muted leading-relaxed font-normal">
          DRIPVERSE is built with strict privacy standards. Your uploaded clothing photographs are stored in your private local vault and are never publicly indexed or shared.
        </p>

        <div className="pt-2">
          <button
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-xl bg-studio-secondary hover:bg-studio-border border border-studio-border text-studio-text text-xs font-semibold flex items-center space-x-2 transition-all shadow-studio-sm"
          >
            <Download className="w-4 h-4 text-studio-accent" />
            <span>Export Wardrobe Backup (JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

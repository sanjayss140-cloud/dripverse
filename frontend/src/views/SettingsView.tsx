import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Key,
  ShieldCheck,
  Download,
  Trash2,
  CheckCircle2,
  Eye,
  EyeOff,
  Cpu,
  Sparkles,
  Info
} from 'lucide-react';
import { UserProfile } from '../types';
import { api } from '../api';

interface SettingsViewProps {
  profile?: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ profile, onProfileUpdated }) => {
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
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-2">
          <Sliders className="w-3.5 h-3.5 text-violet-400" />
          <span>System & Preferences</span>
        </div>
        <h2 className="text-2xl font-bold text-white font-display">Profile & Settings</h2>
        <p className="text-xs text-zinc-400">
          Manage your stylist profile, AI engine credentials, wardrobe backups, and privacy controls.
        </p>
      </div>

      {/* AI Engine Status & Configuration */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center text-violet-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">AI Engine Architecture</h3>
              <p className="text-[11px] text-zinc-400">Provider-independent synthesis & vision pipeline</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{settingsData?.active_ai_provider || 'Neural Garment Compositor Active'}</span>
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed font-light">
          DRIPVERSE operates with a provider-independent AI engine. By default, our built-in{' '}
          <strong className="text-white">Neural Garment Compositing Engine</strong> faithfully preserves uploaded clothing
          geometry and generates 4-view renders. You can also configure a{' '}
          <strong className="text-white">Google Gemini API Key</strong> for enhanced multimodal visual classification.
        </p>

        {/* API Key Form */}
        <form onSubmit={handleSaveApiKey} className="space-y-3 pt-2">
          <label className="text-[10px] uppercase font-bold text-zinc-400 block">
            Gemini API Key (Optional)
          </label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder={settingsData?.masked_gemini_key || 'AIzaSy... (leave blank to use Built-in Engine)'}
                value={geminiKeyInput}
                onChange={(e) => setGeminiKeyInput(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={isSavingKey || !geminiKeyInput.trim()}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-semibold text-xs rounded-xl transition-all shadow-glow-sm"
            >
              {isSavingKey ? 'Saving...' : 'Connect Key'}
            </button>
          </div>
          {keySaveMessage && (
            <p className="text-xs text-emerald-400 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{keySaveMessage}</span>
            </p>
          )}
        </form>
      </div>

      {/* Profile Preferences Card */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white font-display pb-3 border-b border-white/10">
          Personal Stylist Profile
        </h3>

        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                required
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Default Fashion Style</label>
              <select
                value={stylePreference}
                onChange={(e) => setStylePreference(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white"
              >
                <option value="Streetwear & Casual">Streetwear & Casual</option>
                <option value="Contemporary Minimalist">Contemporary Minimalist</option>
                <option value="Sartorial & Formal">Sartorial & Formal</option>
                <option value="Date Night & Evening">Date Night & Evening</option>
                <option value="Traditional Indian">Traditional Indian</option>
                <option value="Athletic & Street">Athletic & Street</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs rounded-xl shadow-glow-sm"
          >
            Save Profile
          </button>
        </form>
      </div>

      {/* Privacy & Wardrobe Data Export */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white font-display">Privacy & Data Security</h3>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          DRIPVERSE is built with strict privacy standards. Your uploaded clothing photographs are stored in your
          private local vault and are never publicly indexed or shared.
        </p>

        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-semibold text-xs flex items-center space-x-2"
          >
            <Download className="w-4 h-4 text-violet-400" />
            <span>Export Wardrobe Backup (JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Check, Save, Sparkles } from 'lucide-react';
import { WardrobeItem, WardrobeCategory } from '../types';
import { api } from '../api';

interface EditItemModalProps {
  item: WardrobeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: WardrobeItem) => void;
}

const CATEGORIES: WardrobeCategory[] = ['UPPERWEAR', 'BOTTOMWEAR', 'OUTERWEAR', 'FOOTWEAR', 'ACCESSORIES', 'OTHER'];
const PATTERNS = ['Solid', 'Striped', 'Checked', 'Graphic', 'Printed', 'Floral', 'Textured'];
const MATERIALS = ['Cotton', 'Denim', 'Leather', 'Knit', 'Silk', 'Linen', 'Wool', 'Synthetic'];
const STYLES = ['Casual', 'Streetwear', 'Formal', 'Minimalist', 'Traditional', 'Athletic'];

export const EditItemModal: React.FC<EditItemModalProps> = ({ item, isOpen, onClose, onSave }) => {
  if (!isOpen || !item) return null;

  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState<WardrobeCategory>(item.category);
  const [subcategory, setSubcategory] = useState(item.subcategory);
  const [mainColor, setMainColor] = useState(item.main_color);
  const [mainColorHex, setMainColorHex] = useState(item.main_color_hex || '#18181b');
  const [pattern, setPattern] = useState(item.pattern);
  const [material, setMaterial] = useState(item.material);
  const [style, setStyle] = useState(item.style);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await api.updateWardrobeItem(item.id, {
        name,
        category,
        subcategory,
        main_color: mainColor,
        main_color_hex: mainColorHex,
        pattern,
        material,
        style,
      });
      onSave(updated);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-drip-card border border-white/10 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">Edit Wardrobe Classification</h3>
              <p className="text-[11px] text-zinc-400">Fine-tune AI detection tags & styling attributes</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Garment Preview & Name */}
          <div className="flex items-center space-x-3 p-3 bg-zinc-900/60 rounded-xl border border-white/5">
            <img
              src={item.clean_image_url || item.image_url}
              alt={item.name}
              className="w-14 h-14 object-contain rounded-lg bg-black/40 p-1"
            />
            <div className="flex-1">
              <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Item Title</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-violet-500"
                required
              />
            </div>
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as WardrobeCategory)}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-violet-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Subcategory</label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-violet-500"
                required
              />
            </div>
          </div>

          {/* Color & Hex */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Color Name</label>
              <input
                type="text"
                value={mainColor}
                onChange={(e) => setMainColor(e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-violet-500"
                required
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Hex Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={mainColorHex}
                  onChange={(e) => setMainColorHex(e.target.value)}
                  className="w-7 h-7 rounded border border-white/10 bg-transparent cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={mainColorHex}
                  onChange={(e) => setMainColorHex(e.target.value)}
                  className="flex-1 bg-zinc-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono uppercase focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>

          {/* Pattern, Material & Style */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Pattern</label>
              <select
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs"
              >
                {PATTERNS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Material</label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs"
              >
                {MATERIALS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs"
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold flex items-center space-x-1.5 transition-all shadow-glow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

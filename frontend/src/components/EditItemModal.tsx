import React, { useState } from 'react';
import { X, Save, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-lg bg-studio-card border border-studio-border rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-studio-border mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-studio-accentSubtle border border-studio-accent/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-studio-accent" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-studio-text font-display">Edit Wardrobe Classification</h3>
              <p className="text-[11px] text-studio-muted">Fine-tune AI detection tags & styling attributes</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-studio-muted hover:text-studio-text hover:bg-studio-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Garment Preview & Name */}
          <div className="flex items-center space-x-3 p-3 bg-studio-secondary rounded-xl border border-studio-border">
            <img
              src={item.clean_image_url || item.image_url}
              alt={item.name}
              className="w-14 h-14 object-contain rounded-lg bg-studio-card p-1 border border-studio-border"
            />
            <div className="flex-1">
              <label className="text-[10px] text-studio-muted font-semibold block mb-1">Item Title</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-studio-card border border-studio-border rounded-lg px-2.5 py-1.5 text-studio-text text-xs focus:outline-none focus:border-studio-accent"
                required
              />
            </div>
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-studio-muted font-semibold block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as WardrobeCategory)}
                className="w-full bg-studio-secondary border border-studio-border rounded-lg px-2.5 py-1.5 text-studio-text text-xs focus:outline-none focus:border-studio-accent"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-studio-muted font-semibold block mb-1">Subcategory</label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full bg-studio-secondary border border-studio-border rounded-lg px-2.5 py-1.5 text-studio-text text-xs focus:outline-none focus:border-studio-accent"
                required
              />
            </div>
          </div>

          {/* Color & Hex */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-studio-muted font-semibold block mb-1">Color Name</label>
              <input
                type="text"
                value={mainColor}
                onChange={(e) => setMainColor(e.target.value)}
                className="w-full bg-studio-secondary border border-studio-border rounded-lg px-2.5 py-1.5 text-studio-text text-xs focus:outline-none focus:border-studio-accent"
                required
              />
            </div>
            <div>
              <label className="text-[10px] text-studio-muted font-semibold block mb-1">Hex Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={mainColorHex}
                  onChange={(e) => setMainColorHex(e.target.value)}
                  className="w-7 h-7 rounded border border-studio-border bg-transparent cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={mainColorHex}
                  onChange={(e) => setMainColorHex(e.target.value)}
                  className="flex-1 bg-studio-secondary border border-studio-border rounded-lg px-2.5 py-1.5 text-studio-text text-xs font-mono uppercase focus:outline-none focus:border-studio-accent"
                />
              </div>
            </div>
          </div>

          {/* Pattern, Material & Style */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="text-[10px] text-studio-muted font-semibold block mb-1">Pattern</label>
              <select
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="w-full bg-studio-secondary border border-studio-border rounded-lg px-2 py-1.5 text-studio-text text-xs"
              >
                {PATTERNS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-studio-muted font-semibold block mb-1">Material</label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full bg-studio-secondary border border-studio-border rounded-lg px-2 py-1.5 text-studio-text text-xs"
              >
                {MATERIALS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-studio-muted font-semibold block mb-1">Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-studio-secondary border border-studio-border rounded-lg px-2 py-1.5 text-studio-text text-xs"
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
          <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-studio-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-studio-muted hover:text-studio-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-1.5 rounded-lg bg-studio-accent hover:bg-studio-accentHover text-white font-semibold flex items-center space-x-1.5 transition-all shadow-studio-sm"
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

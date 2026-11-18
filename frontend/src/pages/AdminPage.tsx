import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Tag,
  Package,
  ShoppingBag,
  DollarSign,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  RefreshCw,
  Search,
  Mail,
  Phone,
  Shield,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Lock,
  Upload,
  Camera,
  Image as ImageIcon,
  Wand2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import { useStore, Order, CustomerInquiry } from '../store/StoreContext';
import { Product } from '../data/products';
import {
  getFallbackImage,
  cleanImageUrl,
  compressImageFile,
  frameImageSource,
  FASHION_PRESETS,
} from '../utils/imageHelper';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPage() {
  const { state, dispatch } = useStore();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'inquiries'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Passcode / Auth state
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Modals state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [quickImageTarget, setQuickImageTarget] = useState<Product | null>(null);
  const [quickImageValue, setQuickImageValue] = useState<string>('');

  // Quick inline edit state { [productId]: { price, originalPrice, stock } }
  const [inlineEdits, setInlineEdits] = useState<
    Record<string, { price: number; originalPrice?: number; stock: number }>
  >({});
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);
  const [healNotice, setHealNotice] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // New Product Form State
  const [newProd, setNewProd] = useState<Partial<Product>>({
    name: '',
    price: 2499,
    originalPrice: 2999,
    category: 'clothing',
    subcategory: 't-shirts',
    description: '',
    material: '100% Organic Cotton',
    fit: 'Regular',
    stock: 50,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White'],
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'],
    details: ['Premium craft', 'Designed for modern minimalists'],
    tags: ['essential'],
    isNew: true,
  });

  const isAuthorized =
    state.isAdminAuthenticated ||
    state.user?.email.toLowerCase() === 'sanjaysanjay02081@gmail.com' ||
    state.user?.isAdmin;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'DRIP2026' || passcode === 'sanjay' || passcode === '9361042621') {
      dispatch({ type: 'SET_ADMIN_AUTHENTICATED', payload: true });
      setAuthError('');
    } else {
      setAuthError('Incorrect passcode. Use owner PIN: DRIP2026 or click One-Click Owner Login.');
    }
  };

  const handleOneClickOwner = () => {
    const ownerUser = {
      id: 'owner-sanjay',
      name: 'Sanjay (Owner)',
      email: 'sanjaysanjay02081@gmail.com',
      phone: '9361042621',
      orders: [],
      isAdmin: true,
    };
    dispatch({ type: 'SET_USER', payload: ownerUser });
    dispatch({ type: 'SET_ADMIN_AUTHENTICATED', payload: true });
  };

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  // Filter products
  const filteredProducts = state.products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Inline price & stock edit
  const getEditValues = (product: Product) => {
    return (
      inlineEdits[product.id] || {
        price: product.price,
        originalPrice: product.originalPrice,
        stock: product.stock,
      }
    );
  };

  const setEditValue = (id: string, field: 'price' | 'originalPrice' | 'stock', val: number) => {
    const current = getEditValues(state.products.find((p) => p.id === id)!);
    setInlineEdits({
      ...inlineEdits,
      [id]: {
        ...current,
        [field]: val,
      },
    });
  };

  const handleSaveInline = (product: Product) => {
    const edits = getEditValues(product);
    dispatch({
      type: 'UPDATE_PRODUCT_PRICE',
      payload: {
        productId: product.id,
        price: Number(edits.price),
        originalPrice: edits.originalPrice ? Number(edits.originalPrice) : undefined,
      },
    });
    dispatch({
      type: 'UPDATE_PRODUCT_STOCK',
      payload: {
        productId: product.id,
        stock: Number(edits.stock),
      },
    });
    setSavedSuccessId(product.id);
    setTimeout(() => setSavedSuccessId(null), 2000);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      dispatch({ type: 'UPDATE_PRODUCT', payload: editingProduct });
      setEditingProduct(null);
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `c${Date.now().toString().slice(-4)}`;
    const createdImg = newProd.images?.[0]
      ? cleanImageUrl(newProd.images[0])
      : getFallbackImage(newProd.category, newProd.subcategory);

    const created: Product = {
      id,
      name: newProd.name || 'New DRIPVERSE Item',
      price: Number(newProd.price) || 1999,
      originalPrice: newProd.originalPrice ? Number(newProd.originalPrice) : undefined,
      category: newProd.category || 'clothing',
      subcategory: newProd.subcategory || 't-shirts',
      images: [createdImg],
      sizes: newProd.sizes || ['S', 'M', 'L', 'XL'],
      colors: newProd.colors || ['Black'],
      description: newProd.description || 'Modern essentials. Timeless attitude.',
      details: newProd.details || ['Premium craft', 'Machine wash cold'],
      material: newProd.material || '100% Organic Cotton',
      fit: newProd.fit || 'Regular',
      stock: Number(newProd.stock) || 30,
      isNew: true,
      rating: 5.0,
      reviewCount: 1,
      tags: ['new', 'exclusive'],
    };
    dispatch({ type: 'ADD_PRODUCT', payload: created });
    setIsNewProductOpen(false);
  };

  // Quick single image update
  const handleSaveQuickImage = () => {
    if (quickImageTarget && quickImageValue) {
      const clean = cleanImageUrl(quickImageValue);
      dispatch({
        type: 'UPDATE_PRODUCT_IMAGE',
        payload: { productId: quickImageTarget.id, image: clean },
      });
      setQuickImageTarget(null);
      setQuickImageValue('');
    }
  };

  // Heal / auto-fix all images
  const handleHealCatalog = () => {
    dispatch({ type: 'REPAIR_CATALOG_IMAGES' });
    setHealNotice('✓ Successfully healed catalog! All garment images verified and restored.');
    setTimeout(() => setHealNotice(null), 4000);
  };

  const totalInventoryValue = state.products.reduce((acc, p) => acc + p.price * p.stock, 0);
  const totalRevenue = state.orders.reduce((acc, o) => acc + o.total, 0);

  // If not authorized, show gatekeeper
  if (!isAuthorized) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-[#F7F7F5]">
        <div className="w-full max-w-md bg-white border border-neutral-200 p-8 md:p-10 shadow-lg text-center">
          <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield size={26} strokeWidth={1.5} />
          </div>
          <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-1">DRIPVERSE INTERNAL</p>
          <h1 className="text-2xl font-black tracking-tight mb-2">OWNER & ADMIN PORTAL</h1>
          <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
            Authorized management suite to modify garment prices, upload images from your computer, fulfill orders, and inspect inquiries.
          </p>

          {authError && (
            <div className="mb-4 bg-black text-white text-xs px-3 py-2 text-left font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="ENTER ADMIN PASSCODE (DRIP2026)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full border border-neutral-300 px-4 py-3.5 text-xs tracking-wider outline-none focus:border-black text-center uppercase"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-3.5 text-xs tracking-[0.25em] uppercase font-bold hover:bg-neutral-800 transition-colors"
            >
              UNLOCK CONSOLE
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-100">
            <p className="text-[11px] text-neutral-400 mb-3">Owner verification: Sanjay (sanjaysanjay02081@gmail.com)</p>
            <button
              onClick={handleOneClickOwner}
              className="w-full border border-black py-3 text-xs tracking-[0.2em] uppercase font-bold hover:bg-black hover:text-white transition-colors"
            >
              ONE-CLICK OWNER SIGN IN (SANJAY)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] pb-24">
      {/* Top Banner */}
      <div className="bg-black text-white py-8 px-4 md:px-8 lg:px-12 border-b border-neutral-800">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <p className="text-[10px] tracking-[0.3em] uppercase text-neutral-400 font-semibold">
                OWNER CONTROL PANEL & COMMERCE ENGINE
              </p>
            </div>
            <h1 className="text-3xl font-black tracking-tight mt-1">DRIPVERSE MANAGEMENT CONSOLE</h1>
            <p className="text-xs text-neutral-400 mt-1">
              Logged in as <span className="text-white font-bold">Sanjay</span> (sanjaysanjay02081@gmail.com | +91 93610 42621)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/shop"
              className="bg-white text-black px-5 py-2.5 text-xs tracking-widest uppercase font-bold hover:bg-neutral-200 transition-colors flex items-center gap-1.5"
            >
              VIEW LIVE STORE <ArrowUpRight size={14} />
            </Link>
            <button
              onClick={() => dispatch({ type: 'SET_ADMIN_AUTHENTICATED', payload: false })}
              className="border border-neutral-700 text-neutral-300 px-4 py-2.5 text-xs tracking-widest uppercase font-bold hover:text-white hover:border-white transition-colors"
            >
              LOCK
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 mt-8">
        {/* Heal Notification Toast */}
        {healNotice && (
          <div className="mb-6 bg-black text-white px-5 py-3 text-xs flex items-center justify-between border-l-4 border-white animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{healNotice}</span>
            </div>
            <button onClick={() => setHealNotice(null)} className="text-neutral-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 border border-neutral-200">
            <p className="text-[10px] tracking-widest uppercase text-neutral-400 font-bold mb-1">Total Products</p>
            <p className="text-2xl md:text-3xl font-black">{state.products.length}</p>
            <p className="text-[11px] text-neutral-500 mt-1">Active garments & accessories</p>
          </div>
          <div className="bg-white p-5 border border-neutral-200">
            <p className="text-[10px] tracking-widest uppercase text-neutral-400 font-bold mb-1">Catalog Value</p>
            <p className="text-2xl md:text-3xl font-black">{formatPrice(totalInventoryValue)}</p>
            <p className="text-[11px] text-neutral-500 mt-1">Total stock retail valuation</p>
          </div>
          <div className="bg-white p-5 border border-neutral-200">
            <p className="text-[10px] tracking-widest uppercase text-neutral-400 font-bold mb-1">Total Orders</p>
            <p className="text-2xl md:text-3xl font-black">{state.orders.length}</p>
            <p className="text-[11px] text-neutral-500 mt-1">Revenue: {formatPrice(totalRevenue)}</p>
          </div>
          <div className="bg-white p-5 border border-neutral-200">
            <p className="text-[10px] tracking-widest uppercase text-neutral-400 font-bold mb-1">Customer Inquiries</p>
            <p className="text-2xl md:text-3xl font-black">{state.inquiries.length}</p>
            <p className="text-[11px] text-neutral-500 mt-1">Direct to your Gmail & WhatsApp</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-300 mb-8 bg-white px-4">
          {[
            { id: 'products', label: 'GARMENTS & PRICING', icon: Tag, count: state.products.length },
            { id: 'orders', label: 'CUSTOMER ORDERS', icon: ShoppingBag, count: state.orders.length },
            { id: 'inquiries', label: 'INBOX INQUIRIES', icon: Mail, count: state.inquiries.length },
          ].map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`py-4 px-6 text-xs tracking-[0.2em] uppercase font-bold flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-black text-black'
                  : 'border-transparent text-neutral-400 hover:text-black'
              }`}
            >
              <Icon size={15} />
              <span>{label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeTab === id ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* ── TAB 1: GARMENTS & PRICING ── */}
        {activeTab === 'products' && (
          <div>
            {/* Filter toolbar */}
            <div className="bg-white p-4 md:p-6 border border-neutral-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search by product name, category, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-neutral-200 pl-10 pr-4 py-2.5 text-xs outline-none focus:border-black"
                  />
                </div>
                <div className="flex gap-1 overflow-x-auto">
                  {['all', 'clothing', 'footwear', 'accessories'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`text-[11px] tracking-wider uppercase px-3 py-2 border transition-colors ${
                        categoryFilter === cat
                          ? 'bg-black text-white border-black font-bold'
                          : 'border-neutral-200 text-neutral-600 hover:border-black'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
                <button
                  onClick={handleHealCatalog}
                  className="border border-black text-black px-3.5 py-2.5 text-xs tracking-wider uppercase font-bold hover:bg-black hover:text-white transition-colors flex items-center gap-1.5"
                  title="Scan and auto-repair broken, empty or Google redirect image links across the entire store"
                >
                  <Wand2 size={13} /> HEAL IMAGES
                </button>
                <button
                  onClick={() => setIsNewProductOpen(true)}
                  className="bg-black text-white px-4 py-2.5 text-xs tracking-widest uppercase font-bold hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
                >
                  <Plus size={14} /> ADD NEW PIECE
                </button>
                <button
                  onClick={() => {
                    if (confirm('Reset all catalog prices and products back to DRIPVERSE defaults?')) {
                      dispatch({ type: 'RESET_PRODUCTS' });
                      setInlineEdits({});
                    }
                  }}
                  className="border border-neutral-300 p-2.5 text-neutral-500 hover:text-black hover:border-black transition-colors"
                  title="Reset catalog to defaults"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-neutral-200 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 text-[10px] tracking-[0.2em] uppercase text-neutral-500 font-bold">
                    <th className="py-3 px-4">Item & Photo</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 w-40">Store Price (₹)</th>
                    <th className="py-3 px-4 w-36">MRP / Original (₹)</th>
                    <th className="py-3 px-4 w-28">Stock Units</th>
                    <th className="py-3 px-4">Badges</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs">
                  {filteredProducts.map((product) => {
                    const editVals = getEditValues(product);
                    const isSaved = savedSuccessId === product.id;
                    const fallback = getFallbackImage(product.category, product.subcategory);

                    return (
                      <tr key={product.id} className="hover:bg-neutral-50/70 transition-colors">
                        {/* Image & Title */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {/* Interactive Thumbnail */}
                            <div className="relative group/thumb w-12 h-14 bg-white border border-neutral-200 flex-shrink-0 overflow-hidden p-0.5 flex items-center justify-center">
                              <img
                                src={product.images[0] || fallback}
                                alt={product.name}
                                onError={(e) => {
                                  if (e.currentTarget.src !== fallback) {
                                    e.currentTarget.src = fallback;
                                  }
                                }}
                                className="w-full h-full object-contain"
                              />
                              <button
                                onClick={() => {
                                  setQuickImageTarget(product);
                                  setQuickImageValue(product.images[0] || fallback);
                                }}
                                className="absolute inset-0 bg-black/70 text-white flex flex-col items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                                title="Change photo / Upload from computer / Auto-fit"
                              >
                                <Camera size={13} />
                                <span className="text-[8px] font-bold mt-0.5">FIT / EDIT</span>
                              </button>
                            </div>

                            <div>
                              <Link
                                to={`/product/${product.id}`}
                                className="font-bold text-neutral-900 hover:underline block truncate max-w-xs"
                              >
                                {product.name}
                              </Link>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-neutral-400 font-mono">ID: {product.id}</span>
                                <button
                                  onClick={() => {
                                    setQuickImageTarget(product);
                                    setQuickImageValue(product.images[0] || fallback);
                                  }}
                                  className="text-[10px] text-neutral-500 hover:text-black underline font-medium"
                                >
                                  Upload / Fix Photo
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="capitalize font-medium text-neutral-700">{product.subcategory}</span>
                          <span className="block text-[10px] text-neutral-400 uppercase">{product.category}</span>
                        </td>

                        {/* Price Inline Edit */}
                        <td className="py-3 px-4">
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">₹</span>
                            <input
                              type="number"
                              min={0}
                              step={50}
                              value={editVals.price}
                              onChange={(e) => setEditValue(product.id, 'price', Number(e.target.value))}
                              className="w-32 border border-neutral-300 pl-6 pr-2 py-1.5 font-bold text-black text-xs outline-none focus:border-black bg-white"
                            />
                          </div>
                        </td>

                        {/* Original Price */}
                        <td className="py-3 px-4">
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400">₹</span>
                            <input
                              type="number"
                              min={0}
                              step={50}
                              value={editVals.originalPrice || ''}
                              placeholder="None"
                              onChange={(e) => setEditValue(product.id, 'originalPrice', Number(e.target.value))}
                              className="w-28 border border-neutral-300 pl-6 pr-2 py-1.5 text-neutral-600 text-xs outline-none focus:border-black bg-white"
                            />
                          </div>
                        </td>

                        {/* Stock Level */}
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min={0}
                            value={editVals.stock}
                            onChange={(e) => setEditValue(product.id, 'stock', Number(e.target.value))}
                            className="w-20 border border-neutral-300 px-2 py-1.5 text-xs outline-none focus:border-black text-center bg-white"
                          />
                        </td>

                        {/* Badges toggles */}
                        <td className="py-3 px-4">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => dispatch({ type: 'TOGGLE_PRODUCT_BADGE', payload: { productId: product.id, badge: 'isNew' } })}
                              className={`text-[9px] uppercase px-2 py-0.5 font-bold border transition-colors ${
                                product.isNew ? 'bg-black text-white border-black' : 'border-neutral-200 text-neutral-400 hover:border-black'
                              }`}
                            >
                              NEW
                            </button>
                            <button
                              onClick={() => dispatch({ type: 'TOGGLE_PRODUCT_BADGE', payload: { productId: product.id, badge: 'isTrending' } })}
                              className={`text-[9px] uppercase px-2 py-0.5 font-bold border transition-colors ${
                                product.isTrending ? 'bg-black text-white border-black' : 'border-neutral-200 text-neutral-400 hover:border-black'
                              }`}
                            >
                              TREND
                            </button>
                            <button
                              onClick={() => dispatch({ type: 'TOGGLE_PRODUCT_BADGE', payload: { productId: product.id, badge: 'isFeatured' } })}
                              className={`text-[9px] uppercase px-2 py-0.5 font-bold border transition-colors ${
                                product.isFeatured ? 'bg-black text-white border-black' : 'border-neutral-200 text-neutral-400 hover:border-black'
                              }`}
                            >
                              FEAT
                            </button>
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleSaveInline(product)}
                              className={`px-3 py-1.5 text-[10px] tracking-wider uppercase font-bold transition-all ${
                                isSaved
                                  ? 'bg-black text-white'
                                  : 'border border-black text-black hover:bg-black hover:text-white'
                              }`}
                            >
                              {isSaved ? 'SAVED ✓' : 'UPDATE'}
                            </button>
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="p-1.5 border border-neutral-200 text-neutral-600 hover:text-black hover:border-black transition-colors"
                              title="Full Edit (Title, Image, Fit, Details)"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${product.name}" from DRIPVERSE catalog?`)) {
                                  dispatch({ type: 'DELETE_PRODUCT', payload: product.id });
                                }
                              }}
                              className="p-1.5 border border-neutral-200 text-neutral-400 hover:text-black hover:border-black transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 2: CUSTOMER ORDERS ── */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Owner Email Alert Banner */}
            <div className="bg-black text-white p-5 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Mail size={20} className="text-white flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider">Live Order Email & WhatsApp Notifications</h4>
                  <p className="text-neutral-400 text-xs mt-0.5">
                    Orders placed by customers automatically trigger alerts to{' '}
                    <strong className="text-white">sanjaysanjay02081@gmail.com</strong> and instant WhatsApp dispatch to{' '}
                    <strong className="text-white">+91 93610 42621</strong>.
                  </p>
                </div>
              </div>
              <a
                href="https://mail.google.com/mail/u/0/#search/DRIPVERSE"
                target="_blank"
                rel="noreferrer"
                className="bg-white text-black px-4 py-2 text-[11px] tracking-wider uppercase font-bold hover:bg-neutral-200 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                OPEN GMAIL INBOX <ExternalLink size={12} />
              </a>
            </div>

            {state.orders.length === 0 ? (
              <div className="bg-white p-12 text-center border border-neutral-200">
                <Package size={36} className="mx-auto text-neutral-300 mb-3" />
                <h3 className="font-bold text-base">NO ORDERS RECORDED YET</h3>
                <p className="text-xs text-neutral-500 mt-1">Orders placed by customers will appear here in real time.</p>
              </div>
            ) : (
              state.orders.map((order) => (
                <div key={order.id} className="bg-white border border-neutral-200 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-100">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm tracking-tight">{order.id}</span>
                        <span
                          className={`text-[9px] uppercase px-2.5 py-0.5 font-bold tracking-wider ${
                            order.status === 'delivered'
                              ? 'bg-black text-white'
                              : order.status === 'shipped'
                              ? 'bg-neutral-800 text-white'
                              : 'bg-neutral-100 text-black border border-neutral-300'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Customer: <span className="text-black font-semibold">{order.customerName || order.address.fullName}</span> · {order.date}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base font-black">{formatPrice(order.total)}</span>
                      <a
                        href="https://api.whatsapp.com/send?phone=919361042621&text=you%20got%20one%20order"
                        target="_blank"
                        rel="noreferrer"
                        className="bg-black text-white px-2.5 py-1.5 text-[9px] tracking-wider uppercase font-bold hover:bg-neutral-800 transition-colors inline-flex items-center gap-1"
                        title="Alert Sanjay on WhatsApp with 'you got one order'"
                      >
                        <MessageSquare size={11} /> WhatsApp ("you got one order")
                      </a>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_ORDER_STATUS',
                            payload: { orderId: order.id, status: e.target.value as any },
                          })
                        }
                        className="border border-neutral-300 text-xs px-2.5 py-1.5 outline-none focus:border-black uppercase font-bold bg-white"
                      >
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mt-4 pt-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-2">Items Purchased</p>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-xs">
                            <img
                              src={item.product.images[0] || getFallbackImage(item.product.category, item.product.subcategory)}
                              alt=""
                              onError={(e) => {
                                e.currentTarget.src = getFallbackImage(item.product.category, item.product.subcategory);
                              }}
                              className="w-10 h-12 object-contain bg-white border border-neutral-200 p-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold truncate">{item.product.name}</p>
                              <p className="text-neutral-400 text-[11px]">
                                Size: {item.size} · Color: {item.color} · Qty: {item.quantity}
                              </p>
                            </div>
                            <span className="font-semibold">{formatPrice(item.product.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-2">Delivery Address</p>
                      <div className="text-xs text-neutral-600 space-y-0.5 bg-neutral-50 p-3 border border-neutral-100">
                        <p className="font-bold text-black">{order.address.fullName}</p>
                        <p>{order.address.line1}</p>
                        {order.address.line2 && <p>{order.address.line2}</p>}
                        <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                        <p className="text-black font-semibold mt-1">📞 {order.address.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TAB 3: INBOX INQUIRIES ── */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            {/* Activation Guide for Gmail */}
            <div className="bg-white border border-neutral-300 p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-black flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-xs uppercase tracking-wider">
                    How Gmail Inquiries & Order Notifications Work (One-Time Setup)
                  </h4>
                  <p className="text-neutral-600 text-xs mt-1 leading-relaxed">
                    Customer inquiries and checkout orders are sent through our secure email gateway directly to{' '}
                    <strong className="text-black">sanjaysanjay02081@gmail.com</strong>.
                  </p>
                  <p className="text-neutral-600 text-xs mt-1 leading-relaxed">
                    <strong>⚠️ Important First-Time Step:</strong> If you did not receive the test inquiry, please check your Gmail{' '}
                    <strong>Spam / Junk / Updates folder</strong> for an email from <em>FormSubmit</em> titled{' '}
                    <em>"Action Required: Confirm your form submission"</em> and click <strong>"Activate Form"</strong> once.
                    After that single click, all submissions will appear in your primary Gmail inbox automatically!
                  </p>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <a
                      href="https://mail.google.com/mail/u/0/#search/in%3Aanywhere+formsubmit"
                      target="_blank"
                      rel="noreferrer"
                      className="bg-black text-white px-3.5 py-1.5 text-[10px] tracking-wider uppercase font-bold hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5"
                    >
                      Search All Gmail for FormSubmit <ExternalLink size={12} />
                    </a>
                    <a
                      href="https://mail.google.com/mail/u/0/#spam"
                      target="_blank"
                      rel="noreferrer"
                      className="border border-black text-black px-3.5 py-1.5 text-[10px] tracking-wider uppercase font-bold hover:bg-black hover:text-white transition-colors inline-flex items-center gap-1.5"
                    >
                      Open Gmail Spam Folder <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {state.inquiries.length === 0 ? (
              <div className="bg-white p-12 text-center border border-neutral-200">
                <Mail size={36} className="mx-auto text-neutral-300 mb-3" />
                <h3 className="font-bold text-base">NO INQUIRIES YET</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Messages submitted on the Contact page will be logged here and dispatched to sanjaysanjay02081@gmail.com.
                </p>
              </div>
            ) : (
              state.inquiries.map((inq) => (
                <div key={inq.id} className="bg-white border border-neutral-200 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                    <div>
                      <span className="text-xs font-mono font-bold text-neutral-400">{inq.id}</span>
                      <h3 className="text-sm font-bold text-black">{inq.subject}</h3>
                      <p className="text-xs text-neutral-500">
                        From: <span className="font-semibold text-black">{inq.name}</span> ({inq.email})
                        {inq.phone && <span> · 📞 {inq.phone}</span>}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <span className="text-[11px] text-neutral-400">{inq.date}</span>
                      <a
                        href={`mailto:${inq.email}?subject=Re:%20${encodeURIComponent(inq.subject)}%20-%20DRIPVERSE`}
                        className="bg-black text-white px-3 py-1.5 text-[10px] tracking-widest uppercase font-bold hover:bg-neutral-800 transition-colors"
                      >
                        REPLY VIA EMAIL
                      </a>
                      {inq.phone && (
                        <a
                          href={`https://wa.me/${inq.phone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(inq.name)},%20this%20is%20Sanjay%20from%20DRIPVERSE%20regarding%20your%20inquiry.`}
                          target="_blank"
                          rel="noreferrer"
                          className="border border-black px-3 py-1.5 text-[10px] tracking-widest uppercase font-bold hover:bg-black hover:text-white transition-colors"
                        >
                          WHATSAPP
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-700 mt-4 leading-relaxed bg-neutral-50 p-4 border border-neutral-100">
                    "{inq.message}"
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── MODAL 1: QUICK IMAGE CHANGER ── */}
      {quickImageTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-neutral-200 p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b border-neutral-100 pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Image Manager</p>
                <h2 className="text-base font-black uppercase tracking-tight">
                  UPDATE PHOTO: {quickImageTarget.name}
                </h2>
              </div>
              <button onClick={() => setQuickImageTarget(null)} className="text-neutral-400 hover:text-black">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 text-xs">
              {/* Preview */}
              <div className="flex gap-4 items-center p-3 bg-neutral-50 border border-neutral-200">
                <div className="w-20 h-24 bg-white border border-neutral-200 flex-shrink-0 overflow-hidden p-1 flex items-center justify-center">
                  <img
                    src={quickImageValue || getFallbackImage(quickImageTarget.category, quickImageTarget.subcategory)}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.src = getFallbackImage(quickImageTarget.category, quickImageTarget.subcategory);
                    }}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-black text-sm truncate">{quickImageTarget.name}</p>
                  <p className="text-neutral-400 uppercase text-[10px]">{quickImageTarget.category} / {quickImageTarget.subcategory}</p>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    {quickImageValue.startsWith('data:image') ? '✓ Local image uploaded from PC' : 'Direct URL active'}
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      if (quickImageValue) {
                        try {
                          setUploadLoading(true);
                          const framed = await frameImageSource(quickImageValue, 'studio-fit');
                          setQuickImageValue(framed);
                        } catch (err: any) {
                          alert('Could not re-frame: ' + err.message);
                        } finally {
                          setUploadLoading(false);
                        }
                      }
                    }}
                    className="mt-2 bg-black text-white px-2.5 py-1 text-[9px] tracking-wider uppercase font-bold hover:bg-neutral-800 transition-colors inline-flex items-center gap-1"
                    title="Automatically centers the image into a clean 3:4 studio packshot without any cropping"
                  >
                    <Wand2 size={11} /> {uploadLoading ? 'Framing...' : 'Auto-Fit Frame (No Crop)'}
                  </button>
                </div>
              </div>

              {/* Option A: Upload from Computer */}
              <div>
                <label className="font-bold uppercase tracking-wider text-neutral-700 block mb-1.5">
                  1. Upload from Computer (Recommended)
                </label>
                <label className="border-2 border-dashed border-neutral-300 hover:border-black p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        setUploadLoading(true);
                        const base64 = await compressImageFile(file);
                        setQuickImageValue(base64);
                      } catch (err: any) {
                        alert(err.message || 'Error processing image');
                      } finally {
                        setUploadLoading(false);
                      }
                    }}
                  />
                  <Upload size={20} className="text-neutral-500 mb-1" />
                  <span className="font-bold uppercase tracking-wider text-xs">
                    {uploadLoading ? 'Optimizing Image...' : 'Select Image File from PC'}
                  </span>
                  <span className="text-[10px] text-neutral-400 mt-0.5">JPEG, PNG, WebP · Auto-resized for fast loading</span>
                </label>
              </div>

              {/* Option B: Paste link */}
              <div>
                <label className="font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                  2. Or Paste Image URL (Auto-cleans Chrome links)
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={quickImageValue.startsWith('data:image') ? '' : quickImageValue}
                  onChange={(e) => setQuickImageValue(cleanImageUrl(e.target.value))}
                  className="w-full border border-neutral-300 p-2.5 outline-none focus:border-black"
                />
              </div>

              {/* Option C: Curated Presets */}
              <div>
                <label className="font-bold uppercase tracking-wider text-neutral-700 block mb-1.5">
                  3. Or Pick from Curated Fashion Presets (1-Click)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 border border-neutral-200">
                  {FASHION_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setQuickImageValue(p.url)}
                      className={`text-[10px] px-2.5 py-1.5 border uppercase font-medium transition-colors ${
                        quickImageValue === p.url
                          ? 'bg-black text-white border-black font-bold'
                          : 'border-neutral-200 text-neutral-700 hover:border-black'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setQuickImageTarget(null)}
                  className="border border-neutral-300 px-5 py-2.5 tracking-widest uppercase font-bold"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleSaveQuickImage}
                  className="bg-black text-white px-6 py-2.5 tracking-widest uppercase font-bold hover:bg-neutral-800"
                >
                  APPLY NEW PHOTO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: FULL PRODUCT EDIT ── */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-neutral-200 p-6 md:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-neutral-100 pb-3">
              <h2 className="text-base font-black uppercase tracking-tight">EDIT GARMENT: {editingProduct.name}</h2>
              <button onClick={() => setEditingProduct(null)} className="text-neutral-400 hover:text-black">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div>
                <label className="font-bold uppercase tracking-wider text-neutral-600 block mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full border border-neutral-300 p-2.5 outline-none focus:border-black"
                />
              </div>

              {/* Image Editor inside Edit Modal */}
              <div className="p-4 bg-neutral-50 border border-neutral-200 space-y-3">
                <label className="font-bold uppercase tracking-wider text-neutral-700 block">Garment Photo</label>
                
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-20 bg-white border border-neutral-200 flex-shrink-0 overflow-hidden p-1 flex items-center justify-center">
                    <img
                      src={editingProduct.images?.[0] || getFallbackImage(editingProduct.category, editingProduct.subcategory)}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.src = getFallbackImage(editingProduct.category, editingProduct.subcategory);
                      }}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <label className="border border-black bg-white hover:bg-black hover:text-white px-3 py-1.5 text-[10px] tracking-wider uppercase font-bold cursor-pointer inline-flex items-center gap-1.5 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setUploadLoading(true);
                            const b64 = await compressImageFile(file);
                            setEditingProduct({ ...editingProduct, images: [b64, ...(editingProduct.images?.slice(1) || [])] });
                          } catch (err: any) {
                            alert(err.message || 'Error processing image');
                          } finally {
                            setUploadLoading(false);
                          }
                        }}
                      />
                      <Upload size={12} /> {uploadLoading ? 'Uploading...' : 'Upload Photo from Computer'}
                    </label>

                    <div>
                      <input
                        type="text"
                        placeholder="Or paste image URL (auto-cleans Chrome links)..."
                        value={editingProduct.images?.[0]?.startsWith('data:image') ? '' : (editingProduct.images?.[0] || '')}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            images: [cleanImageUrl(e.target.value), ...(editingProduct.images?.slice(1) || [])],
                          })
                        }
                        className="w-full border border-neutral-300 p-2 text-[11px] outline-none focus:border-black bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Presets quick select */}
                <div>
                  <p className="text-[10px] uppercase font-bold text-neutral-400 mb-1">Or choose preset photo:</p>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {FASHION_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setEditingProduct({
                            ...editingProduct,
                            images: [p.url, ...(editingProduct.images?.slice(1) || [])],
                          })
                        }
                        className="text-[9px] px-2 py-0.5 border border-neutral-200 bg-white hover:border-black uppercase"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold uppercase tracking-wider text-neutral-600 block mb-1">Store Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full border border-neutral-300 p-2.5 outline-none focus:border-black font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase tracking-wider text-neutral-600 block mb-1">MRP / Original (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.originalPrice || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        originalPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full border border-neutral-300 p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold uppercase tracking-wider text-neutral-600 block mb-1">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full border border-neutral-300 p-2.5 outline-none focus:border-black bg-white capitalize"
                  >
                    <option value="clothing">Clothing</option>
                    <option value="footwear">Footwear</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold uppercase tracking-wider text-neutral-600 block mb-1">Subcategory</label>
                  <input
                    type="text"
                    value={editingProduct.subcategory}
                    onChange={(e) => setEditingProduct({ ...editingProduct, subcategory: e.target.value })}
                    className="w-full border border-neutral-300 p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-neutral-600 block mb-1">Editorial Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full border border-neutral-300 p-2.5 outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold uppercase tracking-wider text-neutral-600 block mb-1">Material Composition</label>
                  <input
                    type="text"
                    value={editingProduct.material}
                    onChange={(e) => setEditingProduct({ ...editingProduct, material: e.target.value })}
                    className="w-full border border-neutral-300 p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase tracking-wider text-neutral-600 block mb-1">Fit Silhouette</label>
                  <input
                    type="text"
                    value={editingProduct.fit}
                    onChange={(e) => setEditingProduct({ ...editingProduct, fit: e.target.value })}
                    className="w-full border border-neutral-300 p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="border border-neutral-300 px-5 py-2.5 tracking-widest uppercase font-bold"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="bg-black text-white px-6 py-2.5 tracking-widest uppercase font-bold hover:bg-neutral-800"
                >
                  SAVE MODIFICATIONS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: CREATE NEW PRODUCT ── */}
      {isNewProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-neutral-200 p-6 md:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-neutral-100 pb-3">
              <h2 className="text-base font-black uppercase tracking-tight">ADD NEW LUXURY PIECE</h2>
              <button onClick={() => setIsNewProductOpen(false)} className="text-neutral-400 hover:text-black">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-bold uppercase tracking-wider text-neutral-600 block mb-1">Garment / Piece Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Regular fit, Tailored Suit Pant, Oxford Shirt"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full border border-neutral-300 p-2.5 outline-none focus:border-black"
                />
              </div>

              {/* Image Uploader & Presets for New Piece */}
              <div className="p-4 bg-neutral-50 border border-neutral-200 space-y-3">
                <label className="font-bold uppercase tracking-wider text-neutral-700 block">
                  Product Image * (Upload from Computer or Paste Link)
                </label>

                <div className="flex gap-4 items-center">
                  <div className="w-20 h-24 bg-white border border-neutral-200 flex-shrink-0 overflow-hidden p-1 flex items-center justify-center">
                    <img
                      src={newProd.images?.[0] || getFallbackImage(newProd.category, newProd.subcategory)}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.src = getFallbackImage(newProd.category, newProd.subcategory);
                      }}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    {/* Upload from Computer */}
                    <label className="border border-black bg-white hover:bg-black hover:text-white px-3.5 py-2 text-[10px] tracking-wider uppercase font-bold cursor-pointer inline-flex items-center gap-1.5 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setUploadLoading(true);
                            const b64 = await compressImageFile(file);
                            setNewProd((prev) => ({ ...prev, images: [b64] }));
                          } catch (err: any) {
                            alert(err.message || 'Error processing image');
                          } finally {
                            setUploadLoading(false);
                          }
                        }}
                      />
                      <Upload size={13} /> {uploadLoading ? 'Optimizing Image...' : 'Upload from Computer'}
                    </label>

                    {/* Or Paste URL */}
                    <div>
                      <input
                        type="text"
                        placeholder="Or paste image link (auto-cleans Chrome URLs)..."
                        value={newProd.images?.[0]?.startsWith('data:image') ? '' : (newProd.images?.[0] || '')}
                        onChange={(e) =>
                          setNewProd((prev) => ({
                            ...prev,
                            images: [cleanImageUrl(e.target.value)],
                          }))
                        }
                        className="w-full border border-neutral-300 p-2 text-[11px] outline-none focus:border-black bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Presets */}
                <div>
                  <p className="text-[10px] uppercase font-bold text-neutral-400 mb-1">Or pick a curated menswear photo:</p>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {FASHION_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setNewProd((prev) => ({
                            ...prev,
                            images: [p.url],
                            category: prev.category || p.category,
                            subcategory: prev.subcategory || p.subcategory,
                          }))
                        }
                        className="text-[9px] px-2 py-0.5 border border-neutral-200 bg-white hover:border-black uppercase"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold uppercase tracking-wider text-neutral-600 block mb-1">Store Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: Number(e.target.value) })}
                    className="w-full border border-neutral-300 p-2.5 outline-none focus:border-black font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase tracking-wider text-neutral-600 block mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={newProd.originalPrice || ''}
                    placeholder="MRP"
                    onChange={(e) => setNewProd({ ...newProd, originalPrice: Number(e.target.value) })}
                    className="w-full border border-neutral-300 p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold uppercase tracking-wider text-neutral-600 block mb-1">Department</label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    className="w-full border border-neutral-300 p-2.5 outline-none focus:border-black bg-white"
                  >
                    <option value="clothing">Clothing</option>
                    <option value="footwear">Footwear</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold uppercase tracking-wider text-neutral-600 block mb-1">Subcategory</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. pant, denim, shirts, jackets, boots"
                    value={newProd.subcategory}
                    onChange={(e) => setNewProd({ ...newProd, subcategory: e.target.value })}
                    className="w-full border border-neutral-300 p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-neutral-600 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Editorial silhouette description..."
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  className="w-full border border-neutral-300 p-2.5 outline-none focus:border-black"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsNewProductOpen(false)}
                  className="border border-neutral-300 px-5 py-2.5 tracking-widest uppercase font-bold"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="bg-black text-white px-6 py-2.5 tracking-widest uppercase font-bold hover:bg-neutral-800"
                >
                  PUBLISH TO STORE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, Minus, Plus, ChevronDown, ChevronUp, Truck, RotateCcw, Shield, Star } from 'lucide-react';
import { products } from '../data/products';
import { useStore } from '../store/StoreContext';
import ProductCard from '../components/ProductCard';
import { SizeGuideModal } from '../components/Sections';
import { getFallbackImage } from '../utils/imageHelper';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch, isInWishlist } = useStore();

  const product = state.products.find((p) => p.id === id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product && product.sizes.length === 1 ? product.sizes[0] : '');
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>('details');

  React.useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setSelectedSize(product.sizes.length === 1 ? product.sizes[0] : '');
      setSelectedColor(product.colors[0] || '');
      setQuantity(1);
    }
  }, [id, product]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-black">PRODUCT NOT FOUND.</h2>
        <button onClick={() => navigate('/shop')} className="text-xs tracking-widest uppercase underline">
          Back to Shop
        </button>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const related = state.products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        product,
        size: selectedSize,
        color: selectedColor || product.colors[0],
        quantity,
      },
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        product,
        size: selectedSize,
        color: selectedColor || product.colors[0],
        quantity,
      },
    });
    navigate('/checkout');
  };

  const colorMap: Record<string, string> = {
    'Black': '#1a1a1a', 'Triple Black': '#1a1a1a', 'White': '#f5f5f5',
    'Off-White': '#f0ede4', 'Ecru': '#f0ede4', 'Grey': '#888', 'Grey Marl': '#888',
    'Charcoal': '#3d3d3d', 'Dark Brown': '#5c3d2e', 'Brown': '#8B5E3C',
    'Cognac': '#9B4E21', 'Tan': '#D4A574', 'Navy': '#1e3a5f',
    'Indigo Blue': '#3d5a99', 'Raw Indigo': '#2e4a80', 'Washed Blue': '#5b7fa6',
    'Light Wash': '#8aadca', 'Stone Wash': '#9eadb7', 'Stone': '#c9bfae',
    'Olive': '#7a7a52', 'Army Green': '#4a5540', 'Khaki': '#c3b091',
    'Silver': '#c0c0c0', 'Gold': '#CFB53B', 'Light Blue': '#a8c8e1',
    'Blue Dial': '#1e3a5f', 'Black Dial': '#1a1a1a', 'White Dial': '#f5f5f5',
    'Tortoise': '#8B4513', 'Mixed': '#888', 'Gold-Black': '#CFB53B',
  };

  const accordionSections = [
    {
      key: 'details',
      title: 'PRODUCT DETAILS',
      content: (
        <ul className="space-y-2">
          {product.details.map((d, i) => (
            <li key={i} className="text-sm text-gray-600 flex gap-2">
              <span className="text-black mt-0.5">—</span>
              {d}
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: 'shipping',
      title: 'SHIPPING & DELIVERY',
      content: (
        <div className="space-y-3 text-sm text-gray-600">
          <p>• Standard delivery: 3–5 business days (₹99)</p>
          <p>• Express delivery: 1–2 business days (₹199)</p>
          <p>• Free standard shipping on orders above ₹2,999</p>
          <p>• All orders shipped from Mumbai, India</p>
        </div>
      ),
    },
    {
      key: 'returns',
      title: 'RETURNS & EXCHANGES',
      content: (
        <div className="space-y-3 text-sm text-gray-600">
          <p>• 30-day hassle-free returns</p>
          <p>• Items must be unworn with original tags</p>
          <p>• Free returns on orders above ₹2,999</p>
          <p>• Exchanges subject to availability</p>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-gray-400 mb-8">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link to={`/${product.category}`} className="hover:text-black transition-colors capitalize">{product.category}</Link>
          <span>/</span>
          <span className="text-black">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20">
          {/* Gallery */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-16 h-20 md:w-20 md:h-24 overflow-hidden border-2 transition-all duration-200 ${
                    selectedImage === i ? 'border-black' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img || getFallbackImage(product.category, product.subcategory)}
                    alt=""
                    onError={(e) => {
                      const fallback = getFallbackImage(product.category, product.subcategory);
                      if (e.currentTarget.src !== fallback) {
                        e.currentTarget.src = fallback;
                      }
                    }}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="flex-1 relative overflow-hidden bg-gray-100 aspect-[3/4]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={product.images[selectedImage] || getFallbackImage(product.category, product.subcategory)}
                  alt={product.name}
                  onError={(e) => {
                    const fallback = getFallbackImage(product.category, product.subcategory);
                    if (e.currentTarget.src !== fallback) {
                      e.currentTarget.src = fallback;
                    }
                  }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <span className="bg-black text-white text-[9px] tracking-[0.2em] uppercase px-2 py-1 font-bold">NEW</span>
                )}
                {product.originalPrice && (
                  <span className="bg-white text-black text-[9px] tracking-[0.2em] uppercase px-2 py-1 font-bold border border-black">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Product info */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={i < Math.floor(product.rating) ? 'fill-black text-black' : 'text-gray-200 fill-gray-200'}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400">{product.rating} ({product.reviewCount} reviews)</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight mb-2">{product.name}</h1>
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-6 capitalize">{product.subcategory}</p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-base text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-8">{product.description}</p>

            {/* Color */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs tracking-widest uppercase font-medium">
                  Color: <span className="font-normal text-gray-500">{selectedColor || product.colors[0]}</span>
                </label>
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                      (selectedColor || product.colors[0]) === color ? 'border-black scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: colorMap[color] || '#d4d4d4' }}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs tracking-widest uppercase font-medium">
                  Size: <span className={`font-normal ${sizeError ? 'text-red-500' : 'text-gray-500'}`}>
                    {selectedSize || (sizeError ? 'Please select a size' : 'Select size')}
                  </span>
                </label>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-xs text-gray-400 hover:text-black transition-colors underline underline-offset-2"
                >
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setSizeError(false); }}
                    className={`min-w-[44px] h-11 px-3 border text-xs font-medium transition-all duration-200 ${
                      selectedSize === size
                        ? 'bg-black text-white border-black'
                        : 'border-gray-200 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <label className="text-xs tracking-widest uppercase font-medium block mb-3">Quantity</label>
              <div className="flex items-center border border-gray-200 w-fit">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {product.stock > 10 ? 'In stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of stock'}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 text-xs tracking-[0.3em] uppercase font-bold transition-all duration-300 ${
                  addedToCart
                    ? 'bg-neutral-800 text-white'
                    : sizeError
                    ? 'bg-neutral-100 border border-black text-black'
                    : 'bg-black text-white hover:bg-neutral-800'
                }`}
              >
                {addedToCart ? '✓ ADDED TO BAG' : sizeError ? 'SELECT A SIZE FIRST' : 'ADD TO BAG'}
              </button>
              <button
                onClick={handleBuyNow}
                className="w-full border border-black py-4 text-xs tracking-[0.3em] uppercase font-bold hover:bg-black hover:text-white transition-colors"
              >
                BUY NOW
              </button>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_WISHLIST', payload: product.id })}
                className="w-full border border-gray-200 py-4 text-xs tracking-[0.3em] uppercase font-bold hover:border-black transition-colors flex items-center justify-center gap-2"
              >
                <Heart size={14} className={inWishlist ? 'fill-black text-black' : ''} />
                {inWishlist ? 'SAVED TO WISHLIST' : 'ADD TO WISHLIST'}
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mb-8 py-6 border-t border-b border-gray-100">
              {[
                { icon: Truck, text: 'Free Shipping\nOver ₹2999' },
                { icon: RotateCcw, text: '30-Day\nReturns' },
                { icon: Shield, text: 'Secure\nPayment' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="text-center">
                  <Icon size={18} className="mx-auto mb-2 text-gray-400" strokeWidth={1.5} />
                  <p className="text-[10px] text-gray-500 leading-tight whitespace-pre-line">{text}</p>
                </div>
              ))}
            </div>

            {/* Accordions */}
            <div className="space-y-0 border-t border-gray-100">
              {accordionSections.map((section) => (
                <div key={section.key} className="border-b border-gray-100">
                  <button
                    onClick={() => setOpenSection(openSection === section.key ? null : section.key)}
                    className="w-full flex items-center justify-between py-4 text-xs tracking-widest uppercase font-bold"
                  >
                    {section.title}
                    {openSection === section.key ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <AnimatePresence>
                    {openSection === section.key && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-4">{section.content}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-24">
            <div className="mb-8">
              <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-2">You Might Also Like</p>
              <h2 className="text-2xl font-black tracking-tight">COMPLETE THE LOOK.</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>

      {sizeGuideOpen && <SizeGuideModal onClose={() => setSizeGuideOpen(false)} />}
    </>
  );
}

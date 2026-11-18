import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { getFallbackImage } from '../utils/imageHelper';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const { state, dispatch, cartTotal } = useStore();
  const [promoInput, setPromoInput] = React.useState('');
  const [discountPercent, setDiscountPercent] = React.useState(0);
  const [promoMessage, setPromoMessage] = React.useState('');

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const discountAmount = Math.round((cartTotal * discountPercent) / 100);
  const discountedSubtotal = cartTotal - discountAmount;
  const shipping = discountedSubtotal >= 2999 ? 0 : 99;
  const orderTotal = discountedSubtotal + shipping;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoInput.trim().toUpperCase();
    if (clean === 'DRIP10' || clean === 'DRIPVERSE10' || clean === 'SANJAY10') {
      setDiscountPercent(10);
      setPromoMessage('✓ 10% DISCOUNT APPLIED SUCCESSFULLY');
    } else {
      setPromoMessage('Invalid coupon code. Try code "DRIP10".');
    }
  };

  if (state.cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <ShoppingBag size={56} strokeWidth={1} className="text-gray-200" />
        <div className="text-center">
          <h2 className="text-2xl font-black tracking-tight mb-2">YOUR BAG IS EMPTY.</h2>
          <p className="text-gray-500 text-sm">Add something worth wearing.</p>
        </div>
        <Link to="/shop" className="bg-black text-white px-10 py-4 text-xs tracking-[0.3em] uppercase font-bold hover:bg-gray-900 transition-colors">
          SHOP NOW
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-12">
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-2">Your Selection</p>
        <h1 className="text-4xl font-black tracking-tight">YOUR BAG.</h1>
        <p className="text-sm text-gray-500 mt-1">{state.cart.reduce((s, i) => s + i.quantity, 0)} items</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-12">
        {/* Items */}
        <div>
          <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 pb-3 border-b border-gray-100 text-xs tracking-widest uppercase text-gray-400 font-medium">
            <span className="w-20" />
            <span>Product</span>
            <span className="text-center w-28">Size / Colour</span>
            <span className="text-center w-28">Quantity</span>
            <span className="text-right w-24">Total</span>
          </div>

          <AnimatePresence>
            {state.cart.map((item) => (
              <motion.div
                key={`${item.product.id}-${item.size}-${item.color}`}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                className="py-6 border-b border-gray-100 grid md:grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center"
              >
                {/* Image */}
                <Link to={`/product/${item.product.id}`} className="w-20 h-24 overflow-hidden bg-[#F7F7F5] border border-neutral-200 flex-shrink-0 block p-1">
                  <img
                    src={item.product.images[0] || getFallbackImage(item.product.category, item.product.subcategory)}
                    alt={item.product.name}
                    onError={(e) => {
                      const fallback = getFallbackImage(item.product.category, item.product.subcategory);
                      if (e.currentTarget.src !== fallback) {
                        e.currentTarget.src = fallback;
                      }
                    }}
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                {/* Info */}
                <div>
                  <Link to={`/product/${item.product.id}`} className="font-medium text-sm hover:opacity-60 transition-opacity">
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">{item.product.subcategory}</p>
                  <p className="text-sm font-bold mt-2">{formatPrice(item.product.price)}</p>
                  {/* Mobile size/color */}
                  <div className="flex gap-2 mt-1 md:hidden">
                    <span className="text-xs text-gray-500">Size: {item.size}</span>
                    <span className="text-xs text-gray-500">· {item.color}</span>
                  </div>
                </div>

                {/* Size/Color — desktop */}
                <div className="hidden md:block text-center w-28">
                  <p className="text-xs">{item.size}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.color}</p>
                </div>

                {/* Quantity */}
                <div className="flex items-center border border-gray-200 w-28 md:mx-auto">
                  <button
                    onClick={() => {
                      if (item.quantity <= 1) {
                        dispatch({ type: 'REMOVE_FROM_CART', payload: { productId: item.product.id, size: item.size, color: item.color } });
                      } else {
                        dispatch({ type: 'UPDATE_QUANTITY', payload: { productId: item.product.id, size: item.size, color: item.color, quantity: item.quantity - 1 } });
                      }
                    }}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="flex-1 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() =>
                      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId: item.product.id, size: item.size, color: item.color, quantity: item.quantity + 1 } })
                    }
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Total + Remove */}
                <div className="flex items-center gap-3 md:flex-col md:items-end md:gap-2 w-24">
                  <span className="text-sm font-bold">{formatPrice(item.product.price * item.quantity)}</span>
                  <button
                    onClick={() =>
                      dispatch({ type: 'REMOVE_FROM_CART', payload: { productId: item.product.id, size: item.size, color: item.color } })
                    }
                    className="text-gray-300 hover:text-black transition-colors"
                    aria-label="Remove"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div>
          <div className="bg-[#F7F7F5] p-6 md:p-8 sticky top-24">
            <h2 className="text-xs tracking-[0.3em] uppercase font-bold mb-6">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-neutral-800 font-medium">
                  <span>Promo Discount ({discountPercent}%)</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-400">
                  Add {formatPrice(2999 - discountedSubtotal)} more for free shipping
                </p>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between text-sm font-bold">
                <span>Total</span>
                <span className="text-lg">{formatPrice(orderTotal)}</span>
              </div>
            </div>

            {/* Promo */}
            <form onSubmit={handleApplyPromo} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="USE CODE: DRIP10"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="flex-1 border border-gray-200 px-3 py-2.5 text-xs outline-none focus:border-black transition-colors bg-white uppercase font-mono"
                />
                <button
                  type="submit"
                  className="border border-black px-4 py-2.5 text-xs tracking-widest uppercase font-bold hover:bg-black hover:text-white transition-colors"
                >
                  APPLY
                </button>
              </div>
              {promoMessage && (
                <p className={`text-[11px] mt-2 font-medium ${discountAmount > 0 ? 'text-black' : 'text-neutral-500'}`}>
                  {promoMessage}
                </p>
              )}
            </form>

            <Link
              to="/checkout"
              className="w-full bg-black text-white py-4 text-xs tracking-[0.3em] uppercase font-bold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 block text-center"
            >
              PROCEED TO CHECKOUT <ArrowRight size={14} />
            </Link>
            <Link to="/shop" className="block text-center text-xs text-gray-400 hover:text-black transition-colors mt-4 tracking-widest uppercase">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

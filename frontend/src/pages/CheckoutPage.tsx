import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, Lock } from 'lucide-react';
import { useStore, Address } from '../store/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'address' | 'payment' | 'review' | 'success';

const stepLabels: Record<Step, string> = {
  address: 'Shipping',
  payment: 'Payment',
  review: 'Review',
  success: 'Confirmed',
};

export default function CheckoutPage() {
  const { state, dispatch, cartTotal } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('address');
  const [address, setAddress] = useState<Address>({
    fullName: state.user?.name || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    phone: state.user?.phone || '',
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState('');

  const shipping = cartTotal >= 2999 ? 0 : 99;
  const total = cartTotal + shipping;

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const handlePlaceOrder = async () => {
    if (!state.user) {
      dispatch({ type: 'SET_AUTH_OPEN', payload: { open: true, mode: 'login' } });
      return;
    }
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 1500));
    const id = `ORD-${Date.now()}`;
    setOrderId(id);
    dispatch({ type: 'PLACE_ORDER', payload: { items: state.cart, total, address } });
    setPlacing(false);
    setStep('success');
  };

  if (state.cart.length === 0 && step !== 'success') {
    navigate('/cart');
    return null;
  }

  const StepIndicator = () => {
    const steps: Step[] = ['address', 'payment', 'review'];
    const idx = steps.indexOf(step);
    return (
      <div className="flex items-center gap-0 mb-10">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 cursor-pointer ${i <= idx ? 'text-black' : 'text-gray-300'}`}
              onClick={() => { if (i < idx) setStep(s); }}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                i < idx ? 'bg-black border-black text-white' :
                i === idx ? 'border-black text-black' :
                'border-gray-200 text-gray-300'
              }`}>
                {i < idx ? <Check size={12} /> : i + 1}
              </div>
              <span className="text-xs tracking-widest uppercase font-medium hidden sm:block">{stepLabels[s]}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px flex-1 mx-3 ${i < idx ? 'bg-black' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <Check size={36} className="text-white" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-2">Order Confirmed</p>
          <h1 className="text-3xl font-black tracking-tight mb-3">THANK YOU.</h1>
          <p className="text-gray-500 mb-2">Your order has been placed successfully.</p>
          <p className="text-sm font-bold text-black mb-8">Order ID: {orderId}</p>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            You will receive a confirmation email shortly. Your order will be shipped within 1–2 business days.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/account')} className="bg-black text-white px-8 py-4 text-xs tracking-widest uppercase font-bold hover:bg-gray-900 transition-colors">
              VIEW ORDER
            </button>
            <button onClick={() => navigate('/shop')} className="border border-black px-8 py-4 text-xs tracking-widest uppercase font-bold hover:bg-black hover:text-white transition-colors">
              CONTINUE SHOPPING
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12">
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-2">Secure Checkout</p>
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
          CHECKOUT <Lock size={18} className="text-gray-400" strokeWidth={1.5} />
        </h1>
      </div>

      <StepIndicator />

      <div className="grid lg:grid-cols-[1fr_380px] gap-12">
        {/* Form steps */}
        <div>
          <AnimatePresence mode="wait">
            {step === 'address' && (
              <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <h2 className="text-xs tracking-[0.3em] uppercase font-bold mb-6">Shipping Address</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', key: 'fullName', span: true, type: 'text', placeholder: 'Your full name' },
                    { label: 'Address Line 1', key: 'line1', span: true, type: 'text', placeholder: 'Street address, flat no.' },
                    { label: 'Address Line 2 (Optional)', key: 'line2', span: true, type: 'text', placeholder: 'Landmark, area' },
                    { label: 'City', key: 'city', span: false, type: 'text', placeholder: 'Mumbai' },
                    { label: 'State', key: 'state', span: false, type: 'text', placeholder: 'Maharashtra' },
                    { label: 'Pin Code', key: 'pincode', span: false, type: 'text', placeholder: '400001' },
                    { label: 'Phone Number', key: 'phone', span: false, type: 'tel', placeholder: '+91 9876543210' },
                  ].map(({ label, key, span, type, placeholder }) => (
                    <div key={key} className={span ? 'sm:col-span-2' : ''}>
                      <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5">{label}</label>
                      <input
                        type={type}
                        required={key !== 'line2'}
                        value={(address as any)[key]}
                        onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))}
                        className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    if (!address.fullName || !address.line1 || !address.city || !address.state || !address.pincode || !address.phone) {
                      alert('Please fill in all required fields.');
                      return;
                    }
                    setStep('payment');
                  }}
                  className="mt-8 bg-black text-white px-10 py-4 text-xs tracking-[0.3em] uppercase font-bold hover:bg-gray-900 transition-colors flex items-center gap-2"
                >
                  CONTINUE TO PAYMENT <ChevronRight size={14} />
                </button>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <h2 className="text-xs tracking-[0.3em] uppercase font-bold mb-6">Payment Method</h2>

                {/* Method selector */}
                <div className="space-y-3 mb-8">
                  {[
                    { id: 'card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay' },
                    { id: 'upi', label: 'UPI', sub: 'PhonePe, GPay, Paytm' },
                    { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when your order arrives' },
                    { id: 'netbanking', label: 'Net Banking', sub: 'All major banks' },
                  ].map((m) => (
                    <label
                      key={m.id}
                      className={`flex items-center gap-4 p-4 border cursor-pointer transition-all ${
                        paymentMethod === m.id ? 'border-black' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={m.id}
                        checked={paymentMethod === m.id}
                        onChange={() => setPaymentMethod(m.id)}
                        className="accent-black"
                      />
                      <div>
                        <p className="text-sm font-medium">{m.label}</p>
                        <p className="text-xs text-gray-400">{m.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Card form */}
                {paymentMethod === 'card' && (
                  <div className="bg-gray-50 p-6 space-y-4">
                    <div>
                      <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5">Card Number</label>
                      <input
                        type="text"
                        value={cardNum}
                        maxLength={19}
                        onChange={(e) => setCardNum(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                        placeholder="4242 4242 4242 4242"
                        className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Name on card"
                        className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5">Expiry</label>
                        <input
                          type="text"
                          value={cardExp}
                          maxLength={5}
                          onChange={(e) => {
                            let v = e.target.value.replace(/\D/g, '');
                            if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
                            setCardExp(v);
                          }}
                          placeholder="MM/YY"
                          className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          maxLength={4}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          placeholder="•••"
                          className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Lock size={12} /> Your card data is encrypted and secure. No actual charges are processed.
                    </div>
                  </div>
                )}
                {paymentMethod === 'upi' && (
                  <div className="bg-gray-50 p-6">
                    <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5">UPI ID</label>
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors bg-white"
                    />
                  </div>
                )}

                <div className="flex gap-3 mt-8">
                  <button onClick={() => setStep('address')} className="border border-gray-200 px-6 py-4 text-xs tracking-widest uppercase font-bold hover:border-black transition-colors">
                    BACK
                  </button>
                  <button
                    onClick={() => setStep('review')}
                    className="bg-black text-white px-10 py-4 text-xs tracking-[0.3em] uppercase font-bold hover:bg-gray-900 transition-colors flex items-center gap-2"
                  >
                    REVIEW ORDER <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'review' && (
              <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <h2 className="text-xs tracking-[0.3em] uppercase font-bold mb-6">Review Your Order</h2>

                {/* Address summary */}
                <div className="mb-6 p-4 bg-gray-50 border-l-2 border-black">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs tracking-widest uppercase font-bold">Shipping to</p>
                    <button onClick={() => setStep('address')} className="text-xs underline text-gray-400 hover:text-black">Edit</button>
                  </div>
                  <p className="text-sm">{address.fullName}</p>
                  <p className="text-sm text-gray-600">{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>
                  <p className="text-sm text-gray-600">{address.city}, {address.state} — {address.pincode}</p>
                  <p className="text-sm text-gray-600">{address.phone}</p>
                </div>

                {/* Payment summary */}
                <div className="mb-8 p-4 bg-gray-50 border-l-2 border-black">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs tracking-widest uppercase font-bold">Payment</p>
                    <button onClick={() => setStep('payment')} className="text-xs underline text-gray-400 hover:text-black">Edit</button>
                  </div>
                  <p className="text-sm capitalize">{paymentMethod === 'card' ? 'Credit / Debit Card' : paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod.toUpperCase()}</p>
                </div>

                {/* Items */}
                <div className="space-y-4 mb-8">
                  {state.cart.map((item) => (
                    <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-4">
                      <div className="w-16 h-20 overflow-hidden bg-gray-100 flex-shrink-0">
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.product.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Size: {item.size} · {item.color}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                {!state.user && (
                  <div className="mb-6 bg-neutral-100 border border-black p-4 text-xs text-black">
                    You need to be signed in to place an order.{' '}
                    <button onClick={() => dispatch({ type: 'SET_AUTH_OPEN', payload: { open: true, mode: 'login' } })} className="underline font-bold uppercase tracking-wider ml-1">
                      Sign in here
                    </button>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep('payment')} className="border border-gray-200 px-6 py-4 text-xs tracking-widest uppercase font-bold hover:border-black transition-colors">
                    BACK
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="flex-1 bg-black text-white py-4 text-xs tracking-[0.3em] uppercase font-bold hover:bg-gray-900 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {placing ? 'PLACING ORDER...' : `PLACE ORDER · ${formatPrice(total)}`}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order summary sidebar */}
        <div className="hidden lg:block">
          <div className="bg-[#F7F7F5] p-6 sticky top-24">
            <h3 className="text-xs tracking-[0.3em] uppercase font-bold mb-6">Your Order</h3>
            <div className="space-y-4 mb-6">
              {state.cart.map((item) => (
                <div key={`${item.product.id}-${item.size}`} className="flex gap-3">
                  <div className="w-14 h-18 overflow-hidden bg-gray-100 flex-shrink-0 relative" style={{ height: '72px' }}>
                    <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                    <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-400">{item.size}</p>
                  </div>
                  <p className="text-xs font-bold">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatPrice(p: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);
}

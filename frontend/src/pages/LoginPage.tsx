import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { state, dispatch } = useStore();
  const navigate = useNavigate();

  // If already logged in, redirect to account
  React.useEffect(() => {
    if (state.user) {
      navigate('/account');
    }
  }, [state.user, navigate]);

  if (state.user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);

    if (mode === 'register') {
      if (!form.name || !form.email || !form.password) {
        setError('Please fill in all required fields.');
        return;
      }
      const user = {
        id: `usr-${Date.now()}`,
        name: form.name,
        email: form.email,
        phone: form.phone,
        orders: [],
      };
      dispatch({ type: 'SET_USER', payload: user });
      navigate('/account');
    } else {
      if (!form.email || !form.password) {
        setError('Please enter your email and password.');
        return;
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      const user = {
        id: `usr-${Date.now()}`,
        name: form.name || form.email.split('@')[0],
        email: form.email,
        orders: [],
      };
      dispatch({ type: 'SET_USER', payload: user });
      navigate('/account');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 bg-[#F7F7F5]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white p-8 md:p-12 shadow-sm border border-gray-100"
      >
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-2">DRIPVERSE MEMBERSHIP</p>
          <h1 className="text-3xl font-black tracking-tight">
            {mode === 'login' ? 'SIGN IN.' : 'CREATE ACCOUNT.'}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {mode === 'login'
              ? 'Access your orders, wishlist, and bespoke recommendations.'
              : 'Join the DRIPVERSE collective for exclusive privileges.'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 border-b border-gray-200 mb-8">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`py-3 text-xs tracking-widest uppercase font-bold transition-colors ${
              mode === 'login' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`py-3 text-xs tracking-widest uppercase font-bold transition-colors ${
              mode === 'register' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'
            }`}
          >
            REGISTER
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-black text-white text-xs px-4 py-3 tracking-wide">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <div>
              <label className="text-[11px] tracking-widest uppercase font-semibold text-gray-700 block mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-200 px-4 py-3.5 text-sm outline-none focus:border-black transition-colors"
                placeholder="Aryan Mehta"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] tracking-widest uppercase font-semibold text-gray-700 block mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-200 px-4 py-3.5 text-sm outline-none focus:border-black transition-colors"
              placeholder="name@domain.com"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-[11px] tracking-widest uppercase font-semibold text-gray-700 block mb-1.5">
                Mobile Number (Optional)
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full border border-gray-200 px-4 py-3.5 text-sm outline-none focus:border-black transition-colors"
                placeholder="+91 98765 43210"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] tracking-widest uppercase font-semibold text-gray-700 block mb-1.5">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full border border-gray-200 px-4 py-3.5 pr-11 text-sm outline-none focus:border-black transition-colors"
                placeholder="Minimum 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 text-xs tracking-[0.25em] uppercase font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {loading ? 'PROCESSING...' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            {mode === 'login' ? "Don't have an account yet?" : 'Already a member?'}{' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-black font-bold uppercase tracking-wider underline hover:no-underline ml-1"
            >
              {mode === 'login' ? 'Register Now' : 'Sign In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

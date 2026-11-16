import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthModal() {
  const { state, dispatch } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>(state.authMode);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const close = () => dispatch({ type: 'SET_AUTH_OPEN', payload: { open: false } });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
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
      close();
    } else {
      if (!form.email || !form.password) {
        setError('Please enter your email and password.');
        return;
      }
      // Check local storage for a saved user
      try {
        const saved = JSON.parse(localStorage.getItem('dripverse-store') || '{}');
        if (saved.user && saved.user.email === form.email) {
          dispatch({ type: 'SET_USER', payload: saved.user });
          close();
          return;
        }
      } catch {}
      // Demo login
      if (form.email && form.password.length >= 6) {
        const user = {
          id: `usr-demo`,
          name: form.email.split('@')[0],
          email: form.email,
          orders: [],
        };
        dispatch({ type: 'SET_USER', payload: user });
        close();
      } else {
        setError('Invalid credentials. Password must be at least 6 characters.');
      }
    }
  };

  if (!state.isAuthOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={close}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white w-full max-w-md p-8 md:p-10"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={close}
            className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
          >
            <X size={20} strokeWidth={1.5} />
          </button>

          <div className="mb-8">
            <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-1">DRIPVERSE</p>
            <h2 className="text-2xl font-black tracking-tight">
              {mode === 'login' ? 'WELCOME BACK.' : 'JOIN DRIPVERSE.'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {mode === 'login'
                ? 'Sign in to your account.'
                : 'Create your account today.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-black text-white text-xs px-4 py-2.5 tracking-wide font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
                  placeholder="Your full name"
                />
              </div>
            )}
            <div>
              <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
                placeholder="your@email.com"
              />
            </div>
            {mode === 'register' && (
              <div>
                <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
                  placeholder="+91 9876543210"
                />
              </div>
            )}
            <div>
              <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full border border-gray-200 px-4 py-3 pr-10 text-sm outline-none focus:border-black transition-colors"
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 text-xs tracking-widest uppercase font-bold hover:bg-gray-900 transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? 'PLEASE WAIT...' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                className="ml-1.5 text-black font-medium underline underline-offset-2 hover:no-underline transition-all"
              >
                {mode === 'login' ? 'Register' : 'Sign In'}
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

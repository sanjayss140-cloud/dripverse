import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, LogOut, ChevronRight, MapPin, Heart } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { motion } from 'framer-motion';

export default function AccountPage() {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();

  if (!state.user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <User size={56} strokeWidth={1} className="text-gray-200" />
        <div className="text-center">
          <h2 className="text-2xl font-black tracking-tight mb-2">SIGN IN TO YOUR ACCOUNT.</h2>
          <p className="text-gray-500 text-sm">Access orders, wishlist and more.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => dispatch({ type: 'SET_AUTH_OPEN', payload: { open: true, mode: 'login' } })}
            className="bg-black text-white px-10 py-4 text-xs tracking-[0.3em] uppercase font-bold hover:bg-gray-900 transition-colors"
          >
            SIGN IN
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_AUTH_OPEN', payload: { open: true, mode: 'register' } })}
            className="border border-black px-10 py-4 text-xs tracking-[0.3em] uppercase font-bold hover:bg-black hover:text-white transition-colors"
          >
            REGISTER
          </button>
        </div>
      </div>
    );
  }

  const { user } = state;
  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const statusColors: Record<string, string> = {
    processing: 'border border-neutral-300 text-neutral-600 bg-white',
    shipped: 'border border-neutral-500 text-black bg-neutral-100',
    delivered: 'bg-black text-white border border-black',
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-12">
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-2">My Account</p>
        <h1 className="text-4xl font-black tracking-tight">WELCOME, {user.name.toUpperCase()}.</h1>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-10">
        {/* Sidebar */}
        <div>
          <div className="bg-black text-white p-6 mb-4">
            <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mb-4">
              <User size={24} className="text-white" strokeWidth={1.5} />
            </div>
            <p className="font-bold">{user.name}</p>
            <p className="text-white/60 text-xs mt-0.5">{user.email}</p>
            {user.phone && <p className="text-white/60 text-xs">{user.phone}</p>}
          </div>

          <div className="space-y-1">
            {[
              { icon: Package, label: 'My Orders', count: user.orders.length },
              { icon: Heart, label: 'Wishlist', count: state.wishlist.length, to: '/wishlist' },
            ].map(({ icon: Icon, label, count, to }) => (
              <Link
                key={label}
                to={to || '#'}
                className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} strokeWidth={1.5} className="text-gray-400" />
                  <span className="text-sm">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {count !== undefined && (
                    <span className="text-xs text-gray-400">{count}</span>
                  )}
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-black transition-colors" />
                </div>
              </Link>
            ))}

            <button
              onClick={() => {
                dispatch({ type: 'SET_USER', payload: null });
                navigate('/');
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-neutral-50 transition-colors text-left text-neutral-500 hover:text-black"
            >
              <LogOut size={16} strokeWidth={1.5} />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Main content */}
        <div>
          <div className="mb-8">
            <h2 className="text-xs tracking-[0.3em] uppercase font-bold mb-6">Order History</h2>
            {user.orders.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-200">
                <Package size={36} className="mx-auto text-gray-200 mb-4" strokeWidth={1} />
                <p className="text-sm font-medium mb-1">No orders yet</p>
                <p className="text-xs text-gray-400 mb-6">Start shopping to see your orders here</p>
                <Link to="/shop" className="bg-black text-white px-8 py-3 text-xs tracking-widest uppercase font-bold hover:bg-gray-900 transition-colors">
                  SHOP NOW
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {user.orders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-100 p-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <p className="text-xs tracking-widest uppercase font-bold text-gray-400 mb-0.5">Order</p>
                        <p className="font-bold text-sm">{order.id}</p>
                        <p className="text-xs text-gray-400">{order.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs tracking-widest uppercase px-3 py-1.5 font-bold rounded-full ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                        <span className="font-bold text-sm">{formatPrice(order.total)}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 overflow-x-auto">
                      {order.items.map((item) => (
                        <div key={`${item.product.id}-${item.size}`} className="flex-shrink-0">
                          <div className="w-16 h-20 overflow-hidden bg-gray-100">
                            <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1 w-16 truncate">{item.product.name}</p>
                          <p className="text-[10px] text-gray-400">×{item.quantity}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

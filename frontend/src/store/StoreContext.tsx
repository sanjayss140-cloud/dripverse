import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Product, products as initialProducts } from '../data/products';

// ── Types ──────────────────────────────────────────────────────
export interface CartItem {
  product: Product;
  size: string;
  color: string;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  orders: Order[];
  isAdmin?: boolean;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'processing' | 'shipped' | 'delivered';
  address: Address;
  customerName?: string;
  customerEmail?: string;
}

export interface Address {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface CustomerInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  date: string;
  status: 'unread' | 'responded';
}

interface StoreState {
  products: Product[];
  cart: CartItem[];
  wishlist: string[];
  user: User | null;
  orders: Order[];
  inquiries: CustomerInquiry[];
  isAdminAuthenticated: boolean;
  isAuthOpen: boolean;
  authMode: 'login' | 'register';
  searchQuery: string;
  isSearchOpen: boolean;
}

type Action =
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: string; size: string; color: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; size: string; color: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_WISHLIST'; payload: string }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTH_OPEN'; payload: { open: boolean; mode?: 'login' | 'register' } }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_SEARCH_OPEN'; payload: boolean }
  | { type: 'PLACE_ORDER'; payload: { items: CartItem[]; total: number; address: Address } }
  // ── Admin Actions ──
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT_PRICE'; payload: { productId: string; price: number; originalPrice?: number } }
  | { type: 'UPDATE_PRODUCT_STOCK'; payload: { productId: string; stock: number } }
  | { type: 'TOGGLE_PRODUCT_BADGE'; payload: { productId: string; badge: 'isNew' | 'isTrending' | 'isFeatured' } }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'RESET_PRODUCTS' }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: 'processing' | 'shipped' | 'delivered' } }
  | { type: 'ADD_INQUIRY'; payload: CustomerInquiry }
  | { type: 'SET_ADMIN_AUTHENTICATED'; payload: boolean };

const initialOrders: Order[] = [
  {
    id: 'ORD-89421',
    date: '15/11/2026',
    items: [
      { product: initialProducts[11], size: 'L', color: 'Black', quantity: 1 },
      { product: initialProducts[0], size: 'XL', color: 'Black', quantity: 2 },
    ],
    total: 11997,
    status: 'processing',
    customerName: 'Aditya Roy',
    customerEmail: 'aditya.roy@example.com',
    address: {
      fullName: 'Aditya Roy',
      line1: 'B-402, Signature Heights',
      line2: 'Worli Sea Face',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400018',
      phone: '+91 98200 11223',
    },
  },
  {
    id: 'ORD-89104',
    date: '14/11/2026',
    items: [
      { product: initialProducts[17], size: '9', color: 'Black', quantity: 1 },
    ],
    total: 8999,
    status: 'shipped',
    customerName: 'Vikram Malhotra',
    customerEmail: 'vikram.m@example.com',
    address: {
      fullName: 'Vikram Malhotra',
      line1: '14/2 Cunningham Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560052',
      phone: '+91 99887 76655',
    },
  },
];

const initialInquiries: CustomerInquiry[] = [
  {
    id: 'INQ-101',
    name: 'Rohan Mehra',
    email: 'rohan.mehra@example.com',
    phone: '+91 98711 22334',
    subject: 'Sizing & Style Advice',
    message: 'Looking for sizing recommendations on the Italian Single-Breasted Blazer. I am 6ft 1in, athletic build.',
    date: '16/11/2026, 10:15 AM',
    status: 'unread',
  },
];

const defaultState: StoreState = {
  products: initialProducts,
  cart: [],
  wishlist: [],
  user: null,
  orders: initialOrders,
  inquiries: initialInquiries,
  isAdminAuthenticated: false,
  isAuthOpen: false,
  authMode: 'login',
  searchQuery: '',
  isSearchOpen: false,
};

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, size, color, quantity } = action.payload;
      const existing = state.cart.findIndex(
        (i) => i.product.id === product.id && i.size === size && i.color === color
      );
      let cart: CartItem[];
      if (existing >= 0) {
        cart = state.cart.map((item, idx) =>
          idx === existing ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        cart = [...state.cart, { product, size, color, quantity }];
      }
      return { ...state, cart };
    }
    case 'REMOVE_FROM_CART': {
      const { productId, size, color } = action.payload;
      return {
        ...state,
        cart: state.cart.filter(
          (i) => !(i.product.id === productId && i.size === size && i.color === color)
        ),
      };
    }
    case 'UPDATE_QUANTITY': {
      const { productId, size, color, quantity } = action.payload;
      return {
        ...state,
        cart: state.cart.map((i) =>
          i.product.id === productId && i.size === size && i.color === color
            ? { ...i, quantity }
            : i
        ),
      };
    }
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'TOGGLE_WISHLIST': {
      const id = action.payload;
      const isIn = state.wishlist.includes(id);
      return {
        ...state,
        wishlist: isIn ? state.wishlist.filter((x) => x !== id) : [...state.wishlist, id],
      };
    }
    case 'SET_USER': {
      const user = action.payload;
      const isOwner = user?.email.toLowerCase() === 'sanjaysanjay02081@gmail.com';
      return {
        ...state,
        user: user ? { ...user, isAdmin: isOwner || user.isAdmin } : null,
        isAdminAuthenticated: isOwner ? true : state.isAdminAuthenticated,
      };
    }
    case 'SET_AUTH_OPEN':
      return {
        ...state,
        isAuthOpen: action.payload.open,
        authMode: action.payload.mode ?? state.authMode,
      };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'SET_SEARCH_OPEN':
      return { ...state, isSearchOpen: action.payload };
    case 'PLACE_ORDER': {
      const newOrder: Order = {
        id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        date: new Date().toLocaleDateString('en-IN'),
        items: action.payload.items,
        total: action.payload.total,
        status: 'processing',
        address: action.payload.address,
        customerName: state.user?.name || action.payload.address.fullName,
        customerEmail: state.user?.email || 'guest@dripverse.com',
      };
      const updatedUser = state.user
        ? { ...state.user, orders: [newOrder, ...state.user.orders] }
        : null;
      return {
        ...state,
        cart: [],
        orders: [newOrder, ...state.orders],
        user: updatedUser,
      };
    }
    // ── Admin Handlers ──
    case 'UPDATE_PRODUCT': {
      return {
        ...state,
        products: state.products.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };
    }
    case 'UPDATE_PRODUCT_PRICE': {
      const { productId, price, originalPrice } = action.payload;
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === productId ? { ...p, price, originalPrice } : p
        ),
      };
    }
    case 'UPDATE_PRODUCT_STOCK': {
      const { productId, stock } = action.payload;
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === productId ? { ...p, stock } : p
        ),
      };
    }
    case 'TOGGLE_PRODUCT_BADGE': {
      const { productId, badge } = action.payload;
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === productId ? { ...p, [badge]: !p[badge] } : p
        ),
      };
    }
    case 'ADD_PRODUCT': {
      return {
        ...state,
        products: [action.payload, ...state.products],
      };
    }
    case 'DELETE_PRODUCT': {
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.payload),
      };
    }
    case 'RESET_PRODUCTS': {
      return {
        ...state,
        products: initialProducts,
      };
    }
    case 'UPDATE_ORDER_STATUS': {
      const { orderId, status } = action.payload;
      return {
        ...state,
        orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
        user: state.user
          ? {
              ...state.user,
              orders: state.user.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
            }
          : state.user,
      };
    }
    case 'ADD_INQUIRY': {
      return {
        ...state,
        inquiries: [action.payload, ...state.inquiries],
      };
    }
    case 'SET_ADMIN_AUTHENTICATED': {
      return {
        ...state,
        isAdminAuthenticated: action.payload,
      };
    }
    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────
interface StoreContextValue {
  state: StoreState;
  dispatch: React.Dispatch<Action>;
  cartCount: number;
  cartTotal: number;
  isInWishlist: (id: string) => boolean;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultState, (def) => {
    try {
      const s = localStorage.getItem('dripverse-store-v2');
      if (s) {
        const parsed = JSON.parse(s);
        return {
          ...def,
          ...parsed,
          products: parsed.products && parsed.products.length > 0 ? parsed.products : def.products,
        };
      }
    } catch {
      // fallback
    }
    return def;
  });

  useEffect(() => {
    localStorage.setItem('dripverse-store-v2', JSON.stringify(state));
  }, [state]);

  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = state.cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const isInWishlist = (id: string) => state.wishlist.includes(id);

  return (
    <StoreContext.Provider value={{ state, dispatch, cartCount, cartTotal, isInWishlist }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SHOPS, type Product, type Shop } from "@/data/seed";
import { api } from "@/lib/api";

export type CartItem = {
  product: Product;
  shopId: string;
  shopName: string;
  qty: number;
};

export type OrderStatus =
  | "Pending"
  | "Placed"
  | "Accepted"
  | "Preparing"
  | "Out for Delivery"
  | "Delivered";

export type Order = {
  id: string;
  user_id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  shop_id: string;
  shop_name: string;
  delivery_address: string;
  created_at: string;
  etaMin?: number;
};

export type VendorAccount = {
  email: string;
  password: string;
  shopId: string;
};

export type UserProfile = {
  id: string;
  phone: string;
  name: string;
  address: string;
};

type Store = {
  location: string;
  setLocation: (l: string) => void;
  // Customer Auth
  user: UserProfile | null;
  loginUser: (profile: UserProfile, token?: string) => void;
  logoutUser: () => void;
  checkSession: () => Promise<void>;
  
  // Orders
  orders: Order[];
  fetchOrders: () => Promise<void>;
  placeOrder: (orderData: any) => Promise<Order>;
  advanceOrder: (id: string) => void;

  cart: CartItem[];
  addToCart: (product: Product, shop: Shop) => void;
  removeFromCart: (productId: string) => void;
  decrement: (productId: string) => void;
  clearCart: () => void;
  cartCount: () => number;
  cartTotal: () => number;

  // Shops management
  shops: Shop[];
  addShop: (shop: Shop) => void;
  deleteShop: (shopId: string) => void;
  updateShop: (shop: Shop) => void;
  // Auth
  vendorAccounts: VendorAccount[];
  currentVendor: VendorAccount | null;
  loginVendor: (email: string, pass: string) => boolean;
  logoutVendor: () => void;
  addVendorAccount: (acc: VendorAccount) => void;
  // shop owner demo state
  shopProducts: Record<string, Product[]>;
  upsertProduct: (shopId: string, product: Product) => void;
  deleteProduct: (shopId: string, productId: string) => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      location: "Koramangala, Bengaluru",
      setLocation: (location) => set({ location }),
      user: null,
      loginUser: (user, token) => {
        if (token) localStorage.setItem('ziply_auth_token', token);
        set({ user, location: user.address });
        get().fetchOrders();
      },
      logoutUser: () => {
        localStorage.removeItem('ziply_auth_token');
        set({ user: null, orders: [] });
      },
      checkSession: async () => {
        const token = localStorage.getItem('ziply_auth_token');
        if (!token) return;
        try {
          const { user } = await api.get('/auth/me');
          set({ user, location: user.address });
          get().fetchOrders();
        } catch (e) {
          localStorage.removeItem('ziply_auth_token');
          set({ user: null, orders: [] });
        }
      },
      orders: [],
      fetchOrders: async () => {
        if (!get().user) return;
        try {
          const orders = await api.get('/orders');
          set({ orders });
        } catch (e) {
          console.error("Failed to fetch orders", e);
        }
      },
      placeOrder: async (orderData) => {
        try {
          const newOrder = await api.post('/orders', orderData);
          set((state) => ({ 
            orders: [newOrder, ...state.orders],
            cart: [] 
          }));
          return newOrder;
        } catch (e) {
          throw e;
        }
      },
      advanceOrder: (id) => {
        const flow: OrderStatus[] = [
          "Pending",
          "Placed",
          "Accepted",
          "Preparing",
          "Out for Delivery",
          "Delivered",
        ];
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== id) return o;
            const next = flow[Math.min(flow.indexOf(o.status) + 1, flow.length - 1)];
            return { ...o, status: next };
          }),
        }));
      },
      cart: [],
      addToCart: (product, shop) =>
        set((state) => {
          const differentShop = state.cart.find((c) => c.shopId !== shop.id);
          const base = differentShop ? [] : state.cart;
          const existing = base.find((c) => c.product.id === product.id);
          if (existing) {
            return {
              cart: base.map((c) =>
                c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c,
              ),
            };
          }
          return {
            cart: [
              ...base,
              { product, shopId: shop.id, shopName: shop.name, qty: 1 },
            ],
          };
        }),
      removeFromCart: (productId) =>
        set((state) => ({ cart: state.cart.filter((c) => c.product.id !== productId) })),
      decrement: (productId) =>
        set((state) => ({
          cart: state.cart
            .map((c) => (c.product.id === productId ? { ...c, qty: c.qty - 1 } : c))
            .filter((c) => c.qty > 0),
        })),
      clearCart: () => set({ cart: [] }),
      cartCount: () => get().cart.reduce((s, c) => s + c.qty, 0),
      cartTotal: () => get().cart.reduce((s, c) => s + c.qty * c.product.price, 0),
      
      shops: SHOPS,
      addShop: (shop) => set((state) => ({ shops: [...state.shops, shop] })),
      deleteShop: (shopId) =>
        set((state) => ({ 
          shops: state.shops.filter((s) => s.id !== shopId),
          vendorAccounts: state.vendorAccounts.filter((a) => a.shopId !== shopId)
        })),
      updateShop: (shop) =>
        set((state) => ({
          shops: state.shops.map((s) => (s.id === shop.id ? shop : s)),
        })),
      vendorAccounts: [
        { email: "vendor@example.com", password: "password", shopId: "sharma-kirana" }
      ],
      currentVendor: null,
      loginVendor: (email, pass) => {
        const acc = get().vendorAccounts.find(v => v.email === email && v.password === pass);
        if (acc) {
          set({ currentVendor: acc });
          return true;
        }
        return false;
      },
      logoutVendor: () => set({ currentVendor: null }),
      addVendorAccount: (acc) => set(state => ({ vendorAccounts: [...state.vendorAccounts, acc] })),
      shopProducts: {},
      upsertProduct: (shopId, product) =>
        set((state) => {
          const shopIndex = state.shops.findIndex((s) => s.id === shopId);
          if (shopIndex === -1) return state;

          const updatedShops = [...state.shops];
          const shop = { ...updatedShops[shopIndex] };
          const products = [...shop.products];
          const productIndex = products.findIndex((p) => p.id === product.id);

          if (productIndex !== -1) {
            products[productIndex] = product;
          } else {
            products.push(product);
          }

          shop.products = products;
          updatedShops[shopIndex] = shop;

          return {
            shops: updatedShops,
            shopProducts: {
              ...state.shopProducts,
              [shopId]: products,
            },
          };
        }),
      deleteProduct: (shopId, productId) =>
        set((state) => {
          const shopIndex = state.shops.findIndex((s) => s.id === shopId);
          if (shopIndex === -1) return state;

          const updatedShops = [...state.shops];
          const shop = { ...updatedShops[shopIndex] };
          const products = shop.products.filter((p) => p.id !== productId);

          shop.products = products;
          updatedShops[shopIndex] = shop;

          return {
            shops: updatedShops,
            shopProducts: {
              ...state.shopProducts,
              [shopId]: products,
            },
          };
        }),
    }),
    { name: "ziply-store" },
  ),
);

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
  delivery_boy_name?: string;
  delivery_boy_phone?: string;
  created_at: string;
  etaMin?: number;
};

export type VendorAccount = {
  email: string;
  password: string;
  shopId: string;
};

export type DeliveryAccount = {
  phone: string;
  password: string;
  name: string;
};

export type UserProfile = {
  id: string;
  phone: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
};

type Store = {
  location: string;
  coords: { lat: number, lng: number } | null;
  setLocation: (l: string, coords?: { lat: number, lng: number } | null) => void;
  // Customer Auth
  user: UserProfile | null;
  loginUser: (profile: UserProfile, token?: string) => void;
  logoutUser: () => void;
  checkSession: () => Promise<void>;
  
  // Orders
  orders: Order[];
  isCheckingSession: boolean;
  isFetchingOrders: boolean;
  isFetchingVendorOrders: boolean;
  fetchOrders: () => Promise<void>;
  fetchVendorOrders: (shopId: string) => Promise<void>;
  fetchDeliveryOrders: () => Promise<void>;
  placeOrder: (orderData: any) => Promise<Order>;
  advanceOrder: (id: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, deliveryData?: { name: string; phone: string }) => Promise<void>;

  cart: CartItem[];
  addToCart: (product: Product, shop: Shop) => void;
  removeFromCart: (productId: string) => void;
  decrement: (productId: string) => void;
  clearCart: () => void;
  cartCount: () => number;
  cartTotal: () => number;

  // Shops management
  shops: Shop[];
  fetchShops: () => Promise<void>;
  addShop: (shop: Shop) => void;
  deleteShop: (shopId: string) => void;
  updateShop: (shop: Shop) => void;
  // Auth
  vendorAccounts: VendorAccount[];
  currentVendor: VendorAccount | null;
  loginVendor: (email: string, pass: string) => boolean;
  logoutVendor: () => void;
  addVendorAccount: (acc: VendorAccount) => void;
  // Delivery Auth
  deliveryAccounts: DeliveryAccount[];
  currentDelivery: DeliveryAccount | null;
  loginDelivery: (phone: string, pass: string) => boolean;
  logoutDelivery: () => void;
  addDeliveryAccount: (acc: DeliveryAccount) => void;
  removeDeliveryAccount: (phone: string) => void;
  // shop owner demo state
  shopProducts: Record<string, Product[]>;
  upsertProduct: (shopId: string, product: Product) => void;
  deleteProduct: (shopId: string, productId: string) => void;
  bulkUpsertProducts: (shopId: string, products: Partial<Product>[]) => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      location: "Koramangala, Bengaluru",
      coords: { lat: 12.9348, lng: 77.6222 },
      setLocation: (location, coords = null) => set({ location, coords }),
      user: null,
      loginUser: (user, token) => {
        if (token) localStorage.setItem('ziply_auth_token', token);
        set({ 
          user, 
          location: user.address,
          coords: user.lat && user.lng ? { lat: user.lat, lng: user.lng } : null
        });
        get().fetchOrders();
      },
      logoutUser: () => {
        localStorage.removeItem('ziply_auth_token');
        set({ user: null, orders: [] });
      },
      isCheckingSession: false,
      checkSession: async () => {
        if (get().isCheckingSession) return;
        const token = localStorage.getItem('ziply_auth_token');
        if (!token) return;
        
        set({ isCheckingSession: true });
        try {
          const { user } = await api.get('/auth/me');
          set({ 
            user, 
            location: user.address, 
            coords: user.lat && user.lng ? { lat: user.lat, lng: user.lng } : null,
            isCheckingSession: false 
          });
          get().fetchOrders();
        } catch (e) {
          localStorage.removeItem('ziply_auth_token');
          set({ user: null, orders: [], isCheckingSession: false });
        }
      },
      orders: [],
      isFetchingOrders: false,
      fetchOrders: async () => {
        if (get().isFetchingOrders) return;
        const { user } = get();
        if (!user) return;
        
        set({ isFetchingOrders: true });
        try {
          const orders = await api.get('/orders');
          set({ orders, isFetchingOrders: false });
        } catch (error) {
          console.error('Failed to fetch orders:', error);
          set({ isFetchingOrders: false });
        }
      },
      isFetchingVendorOrders: false,
      fetchVendorOrders: async (shopId: string) => {
        if (get().isFetchingVendorOrders) return;
        set({ isFetchingVendorOrders: true });
        try {
          const orders = await api.get(`/vendor/orders?shop_id=${shopId}`);
          set({ orders, isFetchingVendorOrders: false });
        } catch (error) {
          console.error('Failed to fetch vendor orders:', error);
          set({ isFetchingVendorOrders: false });
        }
      },
      fetchDeliveryOrders: async () => {
        try {
          const orders = await api.get(`/delivery/orders`);
          set({ orders });
        } catch (error) {
          console.error('Failed to fetch delivery orders:', error);
        }
      },
      updateOrderStatus: async (orderId: string, status: OrderStatus, deliveryData?: { name: string; phone: string }) => {
        try {
          const body: any = { status };
          if (deliveryData) {
            body.delivery_boy_name = deliveryData.name;
            body.delivery_boy_phone = deliveryData.phone;
          }
          await api.patch(`/orders/${orderId}/status`, body);
          set((state) => ({
            orders: state.orders.map((o) => 
              o.id === orderId 
                ? { 
                    ...o, 
                    status, 
                    delivery_boy_name: deliveryData?.name || o.delivery_boy_name,
                    delivery_boy_phone: deliveryData?.phone || o.delivery_boy_phone 
                  } 
                : o
            ),
          }));
        } catch (error) {
          console.error('Failed to update status:', error);
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
      addToCart: (product, shop) => {
        const { cart } = get();
        const otherShop = cart[0] && cart[0].shopId !== shop.id;
        
        if (otherShop) {
          set({ 
            cart: [{ product, qty: 1, shopId: shop.id, shopName: shop.name }] 
          });
          return;
        }

        const existing = cart.find((i) => i.product.id === product.id);
        if (existing) {
          set({
            cart: cart.map(i => 
              i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i
            )
          });
        } else {
          set({
            cart: [...cart, { product, qty: 1, shopId: shop.id, shopName: shop.name }]
          });
        }
      },
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
      fetchShops: async () => {
        try {
          const shops = await api.get('/shops');
          if (shops && Array.isArray(shops)) {
            set({ shops });
          }
        } catch (error) {
          console.error('Failed to fetch shops:', error);
        }
      },
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
      // Auth
      vendorAccounts: [
        { email: "sharma@ziply.com", password: "123", shopId: "sharma-kirana" },
        { email: "apollo@ziply.com", password: "123", shopId: "apollo-pharmacy" },
      ],
      currentVendor: null,
      loginVendor: (email, pass) => {
        const acc = get().vendorAccounts.find(
          (a) => a.email === email && a.password === pass
        );
        if (acc) {
          set({ currentVendor: acc });
          return true;
        }
        return false;
      },
      logoutVendor: () => set({ currentVendor: null }),
      addVendorAccount: (acc) =>
        set((state) => ({ vendorAccounts: [...state.vendorAccounts, acc] })),
      // Delivery Auth
      deliveryAccounts: [
        { phone: "9999999999", password: "123", name: "Ramesh Delivery" },
        { phone: "8888888888", password: "123", name: "Suresh Delivery" }
      ],
      currentDelivery: null,
      loginDelivery: (phone, pass) => {
        const acc = get().deliveryAccounts.find(
          (a) => a.phone === phone && a.password === pass
        );
        if (acc) {
          set({ currentDelivery: acc });
          return true;
        }
        return false;
      },
      logoutDelivery: () => set({ currentDelivery: null }),
      addDeliveryAccount: (acc) => set((state) => ({ deliveryAccounts: [...state.deliveryAccounts, acc] })),
      removeDeliveryAccount: (phone) => set((state) => ({ deliveryAccounts: state.deliveryAccounts.filter((a) => a.phone !== phone) })),
      // shop owner demo state
      shopProducts: {},
      upsertProduct: async (shopId, product) => {
        const shop = get().shops.find(s => s.id === shopId);
        if (!shop) return;

        const updatedProducts = [...shop.products];
        const idx = updatedProducts.findIndex(p => p.id === product.id);
        if (idx > -1) updatedProducts[idx] = product;
        else updatedProducts.push(product);

        try {
          await api.post(`/shops/${shopId}/products`, { products: updatedProducts });
          set((state) => ({
            shops: state.shops.map(s => s.id === shopId ? { ...s, products: updatedProducts } : s)
          }));
        } catch (error) {
          console.error('Failed to upsert product:', error);
        }
      },
      deleteProduct: async (shopId, productId) => {
        const shop = get().shops.find(s => s.id === shopId);
        if (!shop) return;

        const updatedProducts = shop.products.filter(p => p.id !== productId);

        try {
          await api.post(`/shops/${shopId}/products`, { products: updatedProducts });
          set((state) => ({
            shops: state.shops.map(s => s.id === shopId ? { ...s, products: updatedProducts } : s)
          }));
        } catch (error) {
          console.error('Failed to delete product:', error);
        }
      },
      bulkUpsertProducts: async (shopId, products) => {
        const shop = get().shops.find(s => s.id === shopId);
        if (!shop) return;

        const newProducts = products.map(p => ({
          id: p.id || Math.random().toString(36).substr(2, 9),
          name: p.name || 'New Product',
          price: Number(p.price) || 0,
          unit: p.unit || '1 unit',
          emoji: p.emoji || '📦',
          category: p.category || 'General',
          image: p.image,
          popular: p.popular || false
        })) as Product[];

        const updatedProducts = [...shop.products];
        newProducts.forEach(np => {
          const idx = updatedProducts.findIndex(p => p.id === np.id);
          if (idx > -1) updatedProducts[idx] = np;
          else updatedProducts.push(np);
        });

        try {
          await api.post(`/shops/${shopId}/products`, { products: updatedProducts });
          set((state) => ({
            shops: state.shops.map(s => s.id === shopId ? { ...s, products: updatedProducts } : s)
          }));
        } catch (error) {
          console.error('Failed to bulk upsert products:', error);
        }
      },
    }),
    { name: "ziply-store" },
  ),
);

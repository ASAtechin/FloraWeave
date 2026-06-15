import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchProfile,
  saveProfile,
  fetchSavedDesigns,
  saveDesignApi,
  deleteSavedDesignApi,
  fetchOrders,
  createOrderApi,
  updateOrderStatusApi,
  allocateArtisanApi
} from '../lib/api';

export interface CustomizationData {
  zodiacSign?: string;
  birthFlower?: string;
  size: string;
  metalFinish: string; // cord material
  threadColorName: string;
  charm: string;
  engravingText?: string;
  packaging: string;
  madeFor: 'self' | 'gift';
  giftNote?: string;
  stylingExplanation?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  imageUrl: string;
  quantity: number;
  customization: CustomizationData;
}

export interface UserProfile {
  name: string;
  zodiacSign?: string;
  birthFlower?: string;
  birthDate?: string;
}

export interface SavedDesign {
  id: string;
  title: string;
  productId: string;
  productTitle: string;
  imageUrl: string;
  customization: CustomizationData;
  createdAt: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: string;
  artisanName?: string;
  shippingAddress?: any;
  contactPhone?: string;
  contactEmail?: string;
}

interface AppState {
  userId: string;
  user: UserProfile;
  cart: CartItem[];
  savedDesigns: SavedDesign[];
  orders: Order[];
  initialized: boolean;
  
  // Actions
  initializeSession: () => Promise<void>;
  updateUser: (user: Partial<UserProfile>) => Promise<void>;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  saveDesign: (design: Omit<SavedDesign, 'id' | 'createdAt'>) => Promise<void>;
  deleteSavedDesign: (designId: string) => Promise<void>;
  placeOrder: (shippingDetails?: { name: string; phone: string; street: string; postalCode?: string }) => Promise<any>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  allocateArtisan: (orderId: string, artisanName: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  userId: 'seeker-guest',
  user: {
    name: 'Seeker',
    zodiacSign: undefined,
    birthFlower: undefined,
    birthDate: undefined,
  },
  cart: [],
  savedDesigns: [],
  orders: [],
  initialized: false,

  initializeSession: async () => {
    try {
      // 1. Resolve or generate a persistent device/userId
      let storedUid = await AsyncStorage.getItem('chochete_userId');
      if (!storedUid) {
        storedUid = 'seeker-' + Math.random().toString(36).substring(2, 9);
        await AsyncStorage.setItem('chochete_userId', storedUid);
      }
      set({ userId: storedUid, initialized: true });

      // 2. Fetch profile from database
      const profile = await fetchProfile(storedUid);
      if (profile) {
        // Resolve birthDate to DD/MM/YYYY string if object
        let resolvedDateStr = undefined;
        if (profile.birthDate) {
          const d = new Date(profile.birthDate);
          if (!isNaN(d.getTime())) {
            resolvedDateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
          }
        }
        set({
          user: {
            name: `${profile.firstName || 'Seeker'} ${profile.lastName || ''}`.trim(),
            zodiacSign: profile.zodiacSign || undefined,
            birthFlower: profile.birthFlower || undefined,
            birthDate: resolvedDateStr,
          }
        });
      }

      // 3. Fetch saved designs from database
      const designs = await fetchSavedDesigns(storedUid);
      set({ savedDesigns: designs });

      // 4. Fetch user's orders from database
      const userOrders = await fetchOrders(storedUid);
      set({ orders: userOrders });
    } catch (err) {
      console.log('⚠️ Session initialization failed, utilizing default states:', err);
    }
  },

  updateUser: async (userData) => {
    const state = get();
    const updatedUser = { ...state.user, ...userData };
    set({ user: updatedUser });

    // Persist to server
    await saveProfile(
      state.userId,
      updatedUser.name,
      updatedUser.zodiacSign,
      updatedUser.birthDate,
      updatedUser.birthFlower
    );
  },

  addToCart: (item) =>
    set((state) => {
      const customKey = JSON.stringify(item.customization);
      const existingItemIndex = state.cart.findIndex(
        (c) => c.productId === item.productId && JSON.stringify(c.customization) === customKey
      );

      if (existingItemIndex > -1) {
        const updatedCart = [...state.cart];
        updatedCart[existingItemIndex].quantity += item.quantity;
        return { cart: updatedCart };
      }

      const newItem: CartItem = {
        ...item,
        id: Math.random().toString(36).substring(2, 9),
      };
      return { cart: [...state.cart, newItem] };
    }),

  removeFromCart: (itemId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== itemId),
    })),

  updateCartQuantity: (itemId, quantity) =>
    set((state) => ({
      cart: state.cart.map((item) =>
          item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
      ),
    })),

  clearCart: () => set({ cart: [] }),

  saveDesign: async (design) => {
    const state = get();
    // 1. Create locally with temp ID first for premium responsiveness
    const tempId = 'temp-' + Math.random().toString(36).substring(2, 9);
    const newDesign: SavedDesign = {
      ...design,
      id: tempId,
      createdAt: new Date().toLocaleDateString(),
    };
    set({ savedDesigns: [newDesign, ...state.savedDesigns] });

    // 2. Perform write to server
    const serverDesign = await saveDesignApi(
      state.userId,
      design.productId,
      design.title,
      design.customization
    );

    if (serverDesign) {
      // Swap temp ID for server-generated ID
      set((currentState) => ({
        savedDesigns: currentState.savedDesigns.map((d) =>
          d.id === tempId
            ? {
                ...d,
                id: serverDesign.id,
                createdAt: new Date(serverDesign.createdAt).toLocaleDateString(),
              }
            : d
        )
      }));
    }
  },

  deleteSavedDesign: async (designId) => {
    const state = get();
    // 1. Optimistically delete from state
    set({
      savedDesigns: state.savedDesigns.filter((d) => d.id !== designId)
    });

    // 2. Call server delete API
    if (!designId.startsWith('temp-')) {
      await deleteSavedDesignApi(designId);
    }
  },

  placeOrder: async (shippingDetails) => {
    const state = get();
    if (state.cart.length === 0) return null;

    const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = subtotal > 999 ? 0 : 99;
    const total = subtotal + shippingFee;

    // Build payload mapping cart items to order items
    const orderPayload = {
      userId: state.userId,
      contactName: shippingDetails?.name || state.user.name,
      contactPhone: shippingDetails?.phone || '+91 99999 99999',
      contactEmail: 'seeker@cosmic.com',
      shippingAddress: shippingDetails?.street || 'Karnataka, India',
      items: state.cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        customization: item.customization,
      })),
      total,
      subtotal,
      shippingFee,
    };

    // Post to server
    const serverOrder = await createOrderApi(orderPayload);

    if (serverOrder) {
      // Re-fetch all orders to keep backlog fully in sync
      const userOrders = await fetchOrders(state.userId);
      set({
        orders: userOrders,
        cart: [], // Clear cart
      });
      return serverOrder;
    } else {
      // Fallback: Create mock order locally if API fails
      const mockOrder: Order = {
        id: 'CHOC-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        items: [...state.cart],
        total,
        status: 'PENDING',
      };
      set({
        orders: [mockOrder, ...state.orders],
        cart: [],
      });
      return mockOrder;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    const state = get();
    // 1. Update locally
    set({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ),
    });

    // 2. Persist status update on server
    await updateOrderStatusApi(orderId, status);
  },

  allocateArtisan: async (orderId, artisanName) => {
    const state = get();
    // 1. Update locally
    set({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, artisanName } : order
      ),
    });

    // 2. Persist artisan allocation on server
    await allocateArtisanApi(orderId, artisanName);
  },
}));

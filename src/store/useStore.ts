import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CustomizationSelections {
  zodiacSign?: string;
  birthFlower?: string;
  size: string; // S, M, L
  metalFinish: string; // Brass, Silver, Gold
  threadColor?: string; // Hex/Name
  charm: string;
  engravingText?: string;
  packaging: string; // Standard, Premium
  giftNote?: string;
  madeFor: 'self' | 'gift';
}

export interface CartItem {
  id: string; // Unique generated ID for this customization instance
  productId: string;
  title: string;
  imageUrl: string;
  price: number; // Base price
  customPrice: number; // Price after modifiers
  quantity: number;
  customization: CustomizationSelections;
}

export interface DesignDraft {
  id: string;
  productId: string;
  title: string;
  customization: CustomizationSelections;
  createdAt: string;
}

interface StoreState {
  // Locale & Currency
  language: 'en' | 'hi';
  currency: 'INR' | 'USD' | 'EUR';
  setLanguage: (lang: 'en' | 'hi') => void;
  setCurrency: (curr: 'INR' | 'USD' | 'EUR') => void;

  // Cart
  cart: CartItem[];
  rushOrder: boolean;
  appliedPoints: number;
  setRushOrder: (rush: boolean) => void;
  applyPoints: (points: number) => void;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;

  // Saved Designs
  savedDesigns: DesignDraft[];
  saveDesign: (productId: string, title: string, customization: CustomizationSelections) => void;
  deleteDesign: (id: string) => void;

  // Loyalty wallet mirror
  loyaltyPoints: number;
  setLoyaltyPoints: (points: number) => void;
}

const EXCHANGE_RATES = {
  INR: 1,
  USD: 0.012, // 1 INR = 0.012 USD
  EUR: 0.011, // 1 INR = 0.011 EUR
};

export const formatPrice = (amountInINR: number, currency: 'INR' | 'USD' | 'EUR', language: 'en' | 'hi') => {
  const converted = amountInINR * EXCHANGE_RATES[currency];
  
  const locale = language === 'hi' ? 'hi-IN' : currency === 'INR' ? 'en-IN' : 'en-US';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: currency === 'INR' ? 0 : 2,
  }).format(converted);
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      language: 'en',
      currency: 'INR',
      cart: [],
      rushOrder: false,
      appliedPoints: 0,
      savedDesigns: [],
      loyaltyPoints: 150, // Mirror of seeded client account points

      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),

      setRushOrder: (rushOrder) => set({ rushOrder }),
      applyPoints: (appliedPoints) => set({ appliedPoints }),

      addToCart: (newItem) =>
        set((state) => {
          // Generate a custom ID based on customization hashes to bundle identical items
          const hashString = JSON.stringify({
            productId: newItem.productId,
            customization: newItem.customization,
          });
          const generatedId = `cart_${btoa(hashString).slice(0, 16)}`;

          const existingIndex = state.cart.findIndex((item) => item.id === generatedId);
          if (existingIndex > -1) {
            const updatedCart = [...state.cart];
            updatedCart[existingIndex].quantity += newItem.quantity;
            return { cart: updatedCart };
          }

          return {
            cart: [...state.cart, { ...newItem, id: generatedId }],
          };
        }),

      removeFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) => (item.id === id ? { ...item, quantity } : item)),
        })),

      clearCart: () => set({ cart: [], appliedPoints: 0, rushOrder: false }),

      saveDesign: (productId, title, customization) =>
        set((state) => ({
          savedDesigns: [
            ...state.savedDesigns,
            {
              id: `design_${Date.now()}`,
              productId,
              title,
              customization,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      deleteDesign: (id) =>
        set((state) => ({
          savedDesigns: state.savedDesigns.filter((d) => d.id !== id),
        })),

      setLoyaltyPoints: (loyaltyPoints) => set({ loyaltyPoints }),
    }),
    {
      name: 'chochete-storage',
      partialize: (state) => ({
        language: state.language,
        currency: state.currency,
        cart: state.cart,
        rushOrder: state.rushOrder,
        appliedPoints: state.appliedPoints,
        savedDesigns: state.savedDesigns,
      }),
    }
  )
);

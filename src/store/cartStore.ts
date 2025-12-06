// src/store/cartStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist, devtools } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: any;
  meta?: any;
};

export interface AppliedPromo {
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  offerId: string;
  title: string;
}

interface CartState {
  // State
  items: CartItem[];
  total: number;
  appliedPromo: AppliedPromo | null;

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  calculateTotal: () => void;
  applyPromo: (promo: AppliedPromo) => void;
  removePromo: () => void;

  // Computed values
  itemCount: number;
  subtotal: number;
  discount: number;
}

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        items: [],
        total: 0,
        itemCount: 0,
        appliedPromo: null,
        subtotal: 0,
        discount: 0,

        // Actions
        addItem: (item: CartItem) => {
          const { items } = get();
          const existing = items.find((i) => i.id === item.id);

          let updatedItems: CartItem[];
          if (existing) {
            updatedItems = items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            );
          } else {
            updatedItems = [...items, item];
          }

          const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
          const subtotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

          // Recalculate total with promo discount
          const { appliedPromo } = get();
          let discount = 0;
          let total = subtotal;

          if (appliedPromo) {
            if (appliedPromo.discountType === 'percentage') {
              discount = (subtotal * appliedPromo.discount) / 100;
            } else {
              discount = appliedPromo.discount;
            }
            total = Math.max(0, subtotal - discount);
          }

          set({ items: updatedItems, subtotal, total, discount, itemCount });
        },

        removeItem: (id: string) => {
          const { items } = get();
          const updatedItems = items.filter((i) => i.id !== id);
          const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
          const subtotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

          // Recalculate total with promo discount
          const { appliedPromo } = get();
          let discount = 0;
          let total = subtotal;

          if (appliedPromo) {
            if (appliedPromo.discountType === 'percentage') {
              discount = (subtotal * appliedPromo.discount) / 100;
            } else {
              discount = appliedPromo.discount;
            }
            total = Math.max(0, subtotal - discount);
          }

          set({ items: updatedItems, subtotal, total, discount, itemCount });
        },

        updateQuantity: (id: string, quantity: number) => {
          const { items } = get();

          if (quantity <= 0) {
            get().removeItem(id);
            return;
          }

          const updatedItems = items.map((i) => (i.id === id ? { ...i, quantity } : i));

          const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
          const subtotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

          // Recalculate total with promo discount
          const { appliedPromo } = get();
          let discount = 0;
          let total = subtotal;

          if (appliedPromo) {
            if (appliedPromo.discountType === 'percentage') {
              discount = (subtotal * appliedPromo.discount) / 100;
            } else {
              discount = appliedPromo.discount;
            }
            total = Math.max(0, subtotal - discount);
          }

          set({ items: updatedItems, subtotal, total, discount, itemCount });
        },

        clear: () => {
          set({ items: [], total: 0, itemCount: 0, appliedPromo: null, subtotal: 0, discount: 0 });
        },

        calculateTotal: () => {
          const { items, appliedPromo } = get();
          const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
          const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

          let discount = 0;
          let total = subtotal;

          if (appliedPromo) {
            if (appliedPromo.discountType === 'percentage') {
              discount = (subtotal * appliedPromo.discount) / 100;
            } else {
              discount = appliedPromo.discount;
            }
            total = Math.max(0, subtotal - discount);
          }

          set({ subtotal, total, discount, itemCount });
        },

        applyPromo: (promo: AppliedPromo) => {
          const { subtotal } = get();
          let discount = 0;
          let total = subtotal;

          if (promo.discountType === 'percentage') {
            discount = (subtotal * promo.discount) / 100;
          } else {
            discount = promo.discount;
          }
          total = Math.max(0, subtotal - discount);

          set({ appliedPromo: promo, discount, total });
        },

        removePromo: () => {
          const { subtotal } = get();
          set({ appliedPromo: null, discount: 0, total: subtotal });
        },
      }),
      {
        name: 'cart-storage',
        storage: createJSONStorage(() => AsyncStorage),
        onRehydrateStorage: () => (state, error) => {
          if (error) {
            console.error('Error rehydrating cart store:', error);
          } else if (state) {
            // Recalculate totals when store is rehydrated from persistence
            const { items, appliedPromo } = state;
            const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

            let discount = 0;
            let total = subtotal;

            if (appliedPromo) {
              if (appliedPromo.discountType === 'percentage') {
                discount = (subtotal * appliedPromo.discount) / 100;
              } else {
                discount = appliedPromo.discount;
              }
              total = Math.max(0, subtotal - discount);
            }

            state.subtotal = subtotal;
            state.total = total;
            state.discount = discount;
            state.itemCount = itemCount;
          }
        },
      }
    ),
    { name: 'Cart' }
  )
);

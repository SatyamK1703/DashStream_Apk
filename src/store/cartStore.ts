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

interface CartState {
  // State
  items: CartItem[];
  total: number;
  
  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  calculateTotal: () => void;
  
  // Computed values
  itemCount: number;
}

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        items: [],
        total: 0,
        itemCount: 0,

        // Actions
        addItem: (item: CartItem) => {
          const { items } = get();
          const existing = items.find(i => i.id === item.id);
          
          let updatedItems: CartItem[];
          if (existing) {
            updatedItems = items.map(i => 
              i.id === item.id 
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            );
          } else {
            updatedItems = [...items, item];
          }
          
          const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
          const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          
          set({ items: updatedItems, total, itemCount });
        },

        removeItem: (id: string) => {
          const { items } = get();
          const updatedItems = items.filter(i => i.id !== id);
          const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
          const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          
          set({ items: updatedItems, total, itemCount });
        },

        updateQuantity: (id: string, quantity: number) => {
          const { items } = get();
          
          if (quantity <= 0) {
            get().removeItem(id);
            return;
          }
          
          const updatedItems = items.map(i => 
            i.id === id ? { ...i, quantity } : i
          );
          
          const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
          const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          
          set({ items: updatedItems, total, itemCount });
        },

        clear: () => {
          set({ items: [], total: 0, itemCount: 0 });
        },

        calculateTotal: () => {
          const { items } = get();
          const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
          set({ total, itemCount });
        },
      }),
      {
        name: 'cart-storage',
        storage: createJSONStorage(() => AsyncStorage),
      }
    ),
    { name: 'Cart' }
  )
);
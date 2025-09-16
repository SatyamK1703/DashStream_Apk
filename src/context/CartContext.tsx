import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_KEY = '@cart_items';

export type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: any;
  meta?: any;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(CART_KEY);
        if (stored) setItems(JSON.parse(stored));
      } catch (e) {
        console.warn('Failed to load cart', e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(CART_KEY, JSON.stringify(items));
      } catch (e) {
        console.warn('Failed to persist cart', e);
      }
    })();
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  };

  const clear = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clear }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export default CartContext;

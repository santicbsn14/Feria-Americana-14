import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { CartItem, CartContextType, Product } from '../types';

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product) => {
    setItems((prev) => {
      if (prev.find((i) => i.product.id === product.id)) return prev;
      return [...prev, { product }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => setItems([]);

  const isInCart = (productId: string) =>
    items.some((i) => i.product.id === productId);

  const totalItems = items.length;
  const totalPrice = items.reduce((sum, i) => sum + i.product.price, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clearCart, totalItems, totalPrice, isInCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
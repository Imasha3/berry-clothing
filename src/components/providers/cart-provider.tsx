"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import { useCommerceStore } from "@/components/providers/commerce-store-provider";
import { getProductMainImage } from "@/lib/product";

export interface CartItem {
  productId: string;
  productName: string;
  image: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  sku: string;
}

interface CartContextValue {
  items: CartItem[];
  subtotal: number;
  addItem: (item: Omit<CartItem, "image" | "productName" | "price" | "sku">) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const storageKey = "berry-cart";

export function CartProvider({ children }: PropsWithChildren) {
  const { products } = useCommerceStore();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = globalThis.localStorage?.getItem(storageKey);
    if (stored) {
      setItems(JSON.parse(stored) as CartItem[]);
    }
  }, []);

  useEffect(() => {
    globalThis.localStorage?.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const addItem: CartContextValue["addItem"] = ({ productId, size, color, quantity }) => {
    const product = products.find((entry) => entry.id === productId);
    if (!product) return;

    setItems((current) => {
      const existing = current.find(
        (item) => item.productId === productId && item.size === size && item.color === color
      );

      if (existing) {
        return current.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + quantity } : item
        );
      }

      return [
        ...current,
        {
          productId,
          productName: product.productName,
          image: getProductMainImage(product),
          size,
          color,
          quantity,
          price: product.discountPrice ?? product.price,
          sku: product.sku
        }
      ];
    });
  };

  const updateQuantity: CartContextValue["updateQuantity"] = (productId, size, color, quantity) => {
    setItems((current) =>
      current.map((item) =>
        item.productId === productId && item.size === size && item.color === color
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const removeItem: CartContextValue["removeItem"] = (productId, size, color) => {
    setItems((current) =>
      current.filter(
        (item) => !(item.productId === productId && item.size === size && item.color === color)
      )
    );
  };

  const clearCart = () => setItems([]);

  const value = useMemo(
    () => ({
      items,
      subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      addItem,
      updateQuantity,
      removeItem,
      clearCart
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, ProductVariant } from '../data/products';

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem('cloudclean_cart');
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart);
        // Validate cart items structure
        if (Array.isArray(parsed)) {
          const validItems = parsed.filter(
            (item) => item?.product?.id && item?.variant?.id && item?.quantity
          );
          setItems(validItems);
        }
      } catch (error) {
        console.error('Failed to parse cart from localStorage', error);
        localStorage.removeItem('cloudclean_cart');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cloudclean_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, variant: ProductVariant, quantity: number) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item?.product?.id === product.id && item?.variant?.id === variant.id
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.product.id === product.id && item.variant.id === variant.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...currentItems, { product, variant, quantity }];
    });
  };

  const removeFromCart = (productId: string, variantId: string) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) => !(item.product.id === productId && item.variant.id === variantId)
      )
    );
  };

  const updateQuantity = (productId: string, variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId && item.variant.id === variantId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => total + item.variant.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

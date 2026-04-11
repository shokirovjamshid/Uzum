import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import type { CartItem, Product, ProductVariant } from '@/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (product, quantity = 1, variant) => {
        if (!product.id) return;
        
        const variantLabel = variant && variant.feature 
          ? Object.entries(variant.feature).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(', ')
          : '';
        
        set((state) => {
          // Find existing item with same product AND variant
          const existingItem = state.items.find((item) => {
            if (item.product.id !== product.id) return false;
            if (!variant && !item.selectedVariant) return true;
            if (variant && item.selectedVariant?.id === variant.id) return true;
            return false;
          });

          if (existingItem) {
            // Show toast for existing item
            toast.success(`Savatga qo'shildi: ${product.name} ${variantLabel ? `(${variantLabel})` : ''}`, {
              position: 'bottom-right',
              duration: 2000,
            });

            return {
              items: state.items.map((item) => {
                if (item.product.id !== product.id) return item;
                if (!variant && !item.selectedVariant) {
                  return { ...item, quantity: item.quantity + quantity };
                }
                if (variant && item.selectedVariant?.id === variant.id) {
                  return { ...item, quantity: item.quantity + quantity };
                }
                return item;
              }),
            };
          }

          // Show toast for new item
          toast.success(`Savatga qo'shildi: ${product.name} ${variantLabel ? `(${variantLabel})` : ''}`, {
            position: 'bottom-right',
            duration: 2000,
          });

          return {
            items: [...state.items, { id: Date.now(), product, quantity, selectedVariant: variant }],
          };
        });
      },
      
      removeItem: (productId) => {
        if (!productId) return;
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },
      
      updateQuantity: (productId, quantity) => {
        if (!productId) return;
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      
      openCart: () => set({ isOpen: true }),
      
      closeCart: () => set({ isOpen: false }),
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          // Use variant price if selected, otherwise fallback to product price or first variant
          const price = item.selectedVariant?.price
            || item.product.price
            || item.product.variants?.[0]?.price
            || 0;
          return total + price * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

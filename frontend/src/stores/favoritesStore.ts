import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import type { Product, Favorite } from '@/types';
import { api, favoritesApi } from '@/services/api';

interface FavoritesState {
  items: Product[];
  isLoading: boolean;
  error: string | null;
  fetchFavorites: () => Promise<void>;
  addToFavorites: (product: Product) => Promise<void>;
  removeFromFavorites: (productId: number) => Promise<void>;
  toggleFavorite: (product: Product) => Promise<void>;
  isFavorite: (productId: number | undefined) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      fetchFavorites: async () => {
        const token = localStorage.getItem('access_token');
        // For guests: localStorage is already loaded by persist middleware
        if (!token) {
          set({ isLoading: false });
          return;
        }

        // For authenticated users: fetch from API and merge with local items
        // Get current local items before fetching
        const localItems = get().items;
        console.log('Local items before fetch:', localItems);

        set({ isLoading: true, error: null });
        try {
          const response = await favoritesApi.getAll();
          console.log('Fetch favorites response:', response.data);
          const favorites: Favorite[] = response.data;
          // Extract product data from server
          const serverProducts = favorites.map((fav) => {
            if (fav.product_detail) return fav.product_detail;
            if (typeof fav.product === 'object' && fav.product !== null) return fav.product as Product;
            return null;
          }).filter((p): p is Product => p !== null);
          console.log('Server products:', serverProducts);

          // Merge: server products + local items that don't exist on server
          // This preserves items added locally but not yet synced
          const mergedItems = [...serverProducts];
          localItems.forEach((localItem) => {
            if (!mergedItems.find((serverItem) => String(serverItem.id) === String(localItem.id))) {
              mergedItems.push(localItem);
            }
          });

          console.log('Merged products:', mergedItems);
          set({ items: mergedItems, isLoading: false });
        } catch (error) {
          console.error('Fetch favorites error:', error);
          set({ error: 'Failed to fetch favorites', isLoading: false });
        }
      },

      addToFavorites: async (product) => {
        const token = localStorage.getItem('access_token');
        const isAuthenticated = !!token;

        // Always update local state (for both guests and authenticated)
        set((state) => {
          if (state.items.find((item) => String(item.id) === String(product.id))) {
            return { items: [...state.items] };
          }
          return { items: [...state.items, product] };
        });

        // For authenticated users, also sync with backend
        if (isAuthenticated) {
          try {
            await favoritesApi.toggle(product.id);
          } catch (error) {
            set({ error: 'Failed to sync favorite' });
          }
        }
      },

      removeFromFavorites: async (productId) => {
        if (!productId) return;
        const token = localStorage.getItem('access_token');
        const isAuthenticated = !!token;

        if (isAuthenticated) {
          // For authenticated: sync with backend first, then update local
          try {
            await favoritesApi.toggle(productId);
            // Only remove from local state after successful server sync
            set((state) => ({
              items: state.items.filter((item) => String(item.id) !== String(productId)),
            }));
          } catch (error) {
            console.error('Failed to sync favorite removal:', error);
            set({ error: 'Failed to sync favorite removal' });
            // Don't remove from local state if server sync failed
          }
        } else {
          // For guests: just update local state
          set((state) => ({
            items: state.items.filter((item) => String(item.id) !== String(productId)),
          }));
        }
      },

      toggleFavorite: async (product) => {
        if (!product.id) {
          console.error('No product.id!');
          return null;
        }
        const token = localStorage.getItem('access_token');
        const isAuthenticated = !!token;

        // Check current status
        const currentlyFavorite = get().isFavorite(product.id);

        try {
          if (isAuthenticated) {
            // Authenticated: POST to /user/favorites/ with product ID
            const response = await api.post('/user/favorites/', { product: product.id });

            const data = response.data;

            // Check is_favorite field in response to determine status
            const isNowFavorite = data.is_favorite === true;

            if (isNowFavorite) {
              set((state) => {
                const exists = state.items.find((item) => String(item.id) === String(product.id));
                if (exists) {
                  // Return new object to trigger re-render even if item exists
                  return { items: [...state.items] };
                }
                const productToAdd = data.product_detail || product;
                return { items: [...state.items, productToAdd] };
              });
            } else {
              set((state) => ({
                items: state.items.filter((item) => String(item.id) !== String(product.id)),
              }));
            }

            // Return data so ProductCard can sync state
            return data;
          } else {
            // Guest: just update local state (localStorage via persist)
            if (currentlyFavorite) {
              set((state) => ({
                items: state.items.filter((item) => String(item.id) !== String(product.id)),
              }));
            } else {
              set((state) => {
                const exists = state.items.find((item) => String(item.id) === String(product.id));
                if (exists) {
                  // Return new object to trigger re-render
                  return { items: [...state.items] };
                }
                return { items: [...state.items, product] };
              });
            }
            // Return mock data for guests
            return { is_favorite: !currentlyFavorite };
          }
        } catch (error) {
          console.error('Toggle favorite error:', error);
          set({ error: 'Failed to toggle favorite' });
          toast.error('Xatolik yuz berdi');
          return null;
        }
      },

      isFavorite: (productId) => {
        if (!productId) return false;
        return get().items.some((item) => String(item.id) === String(productId));
      },

      clearFavorites: () => set({ items: [], error: null }),
    }),
    {
      name: 'favorites-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// Auto-fetch favorites when store initializes (after rehydration from localStorage)
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('access_token');
  if (token) {
    // Wait a bit for rehydration to complete
    setTimeout(() => {
      useFavoritesStore.getState().fetchFavorites();
    }, 100);
  }
}

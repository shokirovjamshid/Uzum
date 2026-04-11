import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { productsApi, favoritesApi, categoriesApi } from '@/services/api';
import { useFavoritesStore } from '@/stores';
import type { Product, Category, ProductFilters, Favorite } from '@/types';

// Get all products with filters
export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters?.category) params.category = filters.category;
      if (filters?.search) params.search = filters.search;
      if (filters?.ordering) params.ordering = filters.ordering;
      
      const response = await productsApi.getAll(params);
      return response.data as Product[];
    },
  });
};

// Get single product by slug
export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const response = await productsApi.getBySlug(slug);
      return response.data as Product;
    },
    enabled: !!slug,
  });
};

// Get product comments
export const useProductComments = (slug: string) => {
  return useQuery({
    queryKey: ['comments', slug],
    queryFn: async () => {
      const response = await productsApi.getComments(slug);
      return response.data;
    },
    enabled: !!slug,
  });
};

// Create comment mutation
export const useCreateComment = (slug: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: FormData) => productsApi.createComment(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', slug] });
      toast.success("Izohingiz qo'shildi!");
    },
    onError: () => {
      toast.error("Izoh qo'shishda xatolik yuz berdi");
    },
  });
};

// Get categories
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoriesApi.getAll();
      return response.data as Category[];
    },
  });
};

// Get categories with details
export const useCategoriesDetail = () => {
  return useQuery({
    queryKey: ['categories-detail'],
    queryFn: async () => {
      const response = await categoriesApi.getDetail();
      return response.data as Category[];
    },
  });
};

// Favorites
export const useFavorites = () => {
  const queryClient = useQueryClient();
  const { removeFromFavorites } = useFavoritesStore();

  const { data: serverFavorites, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await favoritesApi.getAll();
      // Extract product_detail from each favorite, or fall back to product
      const favorites: Favorite[] = response.data;
      return favorites.map((fav) => fav.product_detail || fav.product).filter(Boolean) as Product[];
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: (productId: number) => favoritesApi.toggle(productId),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      
      // Also update local store
      const isFavorite = useFavoritesStore.getState().isFavorite(productId);
      if (isFavorite) {
        removeFromFavorites(productId);
      }
    },
    onError: () => {
      toast.error('Amalni bajarishda xatolik');
    },
  });

  return {
    favorites: serverFavorites || [],
    isLoading,
    toggleFavorite: toggleFavoriteMutation.mutate,
  };
};

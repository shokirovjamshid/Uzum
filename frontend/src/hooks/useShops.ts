import { useQuery } from '@tanstack/react-query';
import { shopsApi } from '@/services/api';
import type { Shop } from '@/types';

// Get all shops (for users to browse)
export const useShops = () => {
  return useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const response = await shopsApi.getAll();
      return response.data as Shop[];
    },
  });
};

// Get single shop by slug (for viewing shop details)
export const useShop = (slug: string) => {
  return useQuery({
    queryKey: ['shop', slug],
    queryFn: async () => {
      const response = await shopsApi.getBySlug(slug);
      return response.data as Shop;
    },
    enabled: !!slug,
  });
};

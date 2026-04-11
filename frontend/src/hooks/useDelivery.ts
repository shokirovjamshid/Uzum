import { useQuery } from '@tanstack/react-query';
import { deliveryApi } from '@/services/api';

// Get all cities
export const useCities = () => {
  return useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      try {
        const response = await deliveryApi.getCities();
        console.log('Cities API response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Cities API error:', error);
        throw error;
      }
    },
  });
};

// Get delivery points for a city
export const useDeliveryPoints = (cityId?: number) => {
  return useQuery({
    queryKey: ['deliveryPoints', cityId],
    queryFn: async () => {
      const response = await deliveryApi.getPoints(cityId);
      return response.data;
    },
    enabled: !!cityId,
  });
};

// Get default city (first city or city with is_default=true)
export const useDefaultCity = () => {
  const { data: cities, isLoading, error } = useCities();
  
  const defaultCity = cities?.find((city: any) => city.is_default) || cities?.[0];
  
  return {
    city: defaultCity,
    cities,
    isLoading,
    error,
  };
};

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/stores';
import type { User, Tokens } from '@/types';

export const useAuth = () => {
  const { login: storeLogin, logout: storeLogout, updateUser, user, isAuthenticated } = useAuthStore();
  const [countdown, setCountdown] = useState(0);
  const [hasFetchedUser, setHasFetchedUser] = useState(false);

  // Request SMS code
  const requestCodeMutation = useMutation({
    mutationFn: authApi.requestSmsCode,
    onSuccess: (response) => {
      const ttl = response.data.ttl || 300;
      setCountdown(ttl);
      
      // Start countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      toast.success(`Tasdiqlash kodi ${formatPhone(response.data.phone || '')} raqamiga yuborildi`);
    },
    onError: (error: { response?: { data?: any }; status?: number }) => {
      // 429 means code was already sent - not an error, just info
      if (error?.status === 429 || error?.response?.status === 429) {
        const ttl = error?.response?.data?.ttl || 0;
        if (ttl > 0) {
          setCountdown(ttl);
          toast.success(`Tasdiqlash kodi allaqachon yuborilgan. Qolgan vaqt: ${Math.floor(ttl / 60)}:${(ttl % 60).toString().padStart(2, '0')}`);
        }
        return;
      }
      
      const errorData = error.response?.data;
      let message = 'SMS yuborishda xatolik';
      
      if (typeof errorData === 'string') {
        message = errorData;
      } else if (errorData?.message) {
        message = errorData.message;
      } else if (Array.isArray(errorData)) {
        message = errorData[0];
      }
      
      toast.error(message);
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (vars: { phone: string; code: string }) => authApi.login(vars.phone, vars.code),
    onSuccess: (response) => {
      const { data } = response.data;
      
      // Create user object from response
      const userData: User = {
        id: response.data.id || 0,
        phone: response.data.phone || '',
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        type: response.data.type || 'user',
        is_online: true,
      };
      
      const tokens: Tokens = {
        access: data['access token'],
        refresh: data['refresh token'],
      };
      
      storeLogin(userData, tokens);
      toast.success('Tizimga muvaffaqiyatli kirdingiz!');
    },
    onError: (error: { response?: { data?: any } }) => {
      // DRF ValidationError returns error details in different formats
      let message = "Kod noto'g'ri yoki muddati tugagan";
      const errorData = error.response?.data;
      
      if (typeof errorData === 'string') {
        message = errorData;
      } else if (Array.isArray(errorData)) {
        message = errorData[0];
      } else if (errorData?.non_field_errors && Array.isArray(errorData.non_field_errors)) {
        message = errorData.non_field_errors[0];
      } else if (errorData?.detail) {
        message = errorData.detail;
      }
      
      toast.error(message);
    },
  });

  // QR Login mutations
  const requestQRMutation = useMutation({
    mutationFn: authApi.requestQR,
  });

  const checkQRStatusMutation = useMutation({
    mutationFn: authApi.checkQRStatus,
    onSuccess: (response) => {
      if (response.data.status === 'approved') {
        const tokens: Tokens = {
          access: response.data.access,
          refresh: response.data.refresh,
        };

        // Get user info using the token
        storeLogin({} as User, tokens);
        toast.success('QR orqali muvaffaqiyatli kirdingiz!');
      }
    },
  });

  // Fetch current user from database
  const fetchUserMutation = useMutation({
    mutationFn: () => authApi.getCurrentUser(),
    onSuccess: (response) => {
      const userData = response.data;
      if (userData && userData.id) {
        updateUser({
          id: userData.id,
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: userData.email || '',
          phone: userData.phone || '',
        });
      }
    },
  });

  // Fetch user data when authenticated (on mount or when auth state changes)
  useEffect(() => {
    if (isAuthenticated && !hasFetchedUser && !fetchUserMutation.isPending) {
      fetchUserMutation.mutate();
      setHasFetchedUser(true);
    }
  }, [isAuthenticated, hasFetchedUser]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: { userId: number; first_name?: string; last_name?: string; email?: string }) => {
      const { userId, ...profileData } = data;
      return authApi.updateProfile(userId, profileData);
    },
    onSuccess: (response) => {
      updateUser(response.data);
      toast.success('Profil muvaffaqiyatli yangilandi!');
    },
    onError: () => {
      toast.error('Profilni yangilashda xatolik yuz berdi');
    },
  });

  const login = (phone: string, code: string) => {
    return loginMutation.mutateAsync({ phone, code });
  };

  const requestCode = (phone: string) => {
    return requestCodeMutation.mutateAsync(phone);
  };

  const logout = () => {
    storeLogout();
    setHasFetchedUser(false);
    toast.success('Tizimdan chiqdingiz');
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
    requestCode,
    countdown,
    isLoading: loginMutation.isPending || requestCodeMutation.isPending,
    requestQR: requestQRMutation.mutateAsync,
    checkQRStatus: checkQRStatusMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    fetchUser: fetchUserMutation.mutateAsync,
  };
};

// Format phone helper
const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 12) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} *** ** ${cleaned.slice(-2)}`;
  }
  return phone;
};

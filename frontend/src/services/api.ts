import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        
        const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (phone: string, code: string) =>
    api.post('/register', { phone, code }),

  requestSmsCode: (phone: string) =>
    api.get(`/register-sms-code/${phone}`),

  refreshToken: (refresh: string) =>
    api.post('/token/refresh/', { refresh }),

  // Get current user details from database
  getCurrentUser: () =>
    api.get('/user/me/'),

  // Update user profile
  updateProfile: (userId: number, data: { first_name?: string; last_name?: string; email?: string }) =>
    api.put(`/user/update/${userId}/`, data),

  // QR Login
  requestQR: () =>
    api.post('/auth/qr/request/'),

  authorizeQR: (token: string) =>
    api.post('/auth/qr/authorize/', { token }),

  checkQRStatus: (token: string) =>
    api.get(`/auth/qr/status/?token=${token}`),
};

// Products API
export const productsApi = {
  getAll: (params?: Record<string, string | number>) =>
    api.get('/products/', { params }),
  
  getBySlug: (slug: string) =>
    api.get(`/products/${slug}/`),
  
  getComments: (slug: string) =>
    api.get(`/products/${slug}/comments/`),
  
  createComment: (slug: string, data: FormData) =>
    api.post(`/products/${slug}/comments/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Categories API
export const categoriesApi = {
  getAll: () =>
    api.get('/categories'),
  
  getDetail: () =>
    api.get('/categoriesdetail'),
};

// Shops API (read-only for users)
export const shopsApi = {
  getAll: () =>
    api.get('/shops'),
  
  getBySlug: (slug: string) =>
    api.get(`/shops/${slug}`),
};

// Favorites API
export const favoritesApi = {
  getAll: () =>
    api.get('/user/favorites/'),

  toggle: (productId: number) =>
    api.post('/user/favorites/', { product: productId }),

  toggleBySlug: (slug: string) =>
    api.post(`/products/${slug}/favorite/`),

  getBySlug: (slug: string) =>
    api.get(`/user/favorite/${slug}`),
};

// Orders API (if available on backend)
export const ordersApi = {
  getAll: () =>
    api.get('/orders/'),
  
  create: (data: unknown) =>
    api.post('/orders/', data),
  
  getById: (id: number) =>
    api.get(`/orders/${id}/`),
};

// Delivery Points API
export const deliveryApi = {
  getCities: () =>
    api.get('/cities'),
  
  getPoints: (cityId?: number) =>
    api.get('/delivery-points', { params: cityId ? { city: cityId } : undefined }),
  
  getPointById: (id: number) =>
    api.get(`/delivery-points/${id}`),
};

// Chat API (for users)
export const chatApi = {
  getRooms: () =>
    api.get('/rooms/'),
  
  getHistory: (roomId: number) =>
    api.get(`/rooms/${roomId}/historys/`),
  
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/rooms/upload-image/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;

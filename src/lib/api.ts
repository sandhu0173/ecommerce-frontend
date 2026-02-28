import axios, { AxiosInstance, AxiosError } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

let api: AxiosInstance

/**
 * Initialize the API client with interceptors
 */
export const initializeApi = (): AxiosInstance => {
  api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  })

  // Request interceptor: Add token to all requests
  api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  })

  // Response interceptor: Handle errors
  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
        }
      }
      return Promise.reject(error)
    }
  )

  return api
}

/**
 * Get the API client instance
 */
export const getApi = (): AxiosInstance => {
  if (!api) {
    initializeApi()
  }
  return api
}

/**
 * Authentication API endpoints
 */
export const authApi = {
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
    getApi().post('/auth/register', data),
  login: (email: string, password: string) =>
    getApi().post('/auth/login', { email, password }),
  profile: () =>
    getApi().get('/auth/profile'),
  logout: () =>
    getApi().post('/auth/logout'),
}

/**
 * Product API endpoints
 */
export const productApi = {
  list: (params?: { page?: number; limit?: number; search?: string; sort?: string; order?: string; featured?: boolean; min_price?: number; max_price?: number }) =>
    getApi().get('/products', { params }),
  featured: (limit?: number) =>
    getApi().get('/products/featured', { params: { limit } }),
  search: (query: string) =>
    getApi().get('/products/search', { params: { q: query } }),
  show: (slug: string) =>
    getApi().get(`/products/${slug}`),
  create: (data: any) =>
    getApi().post('/products', data),
  update: (id: string | number, data: any) =>
    getApi().put(`/products/${id}`, data),
  delete: (id: string | number) =>
    getApi().delete(`/products/${id}`),
}

/**
 * Cart API endpoints
 */
export const cartApi = {
  getCart: () =>
    getApi().get('/cart'),
  addProduct: (productId: number, quantity: number) =>
    getApi().post('/cart', { product_id: productId, quantity }),
  updateItem: (itemId: number, quantity: number) =>
    getApi().put(`/cart/${itemId}`, { quantity }),
  removeItem: (itemId: number) =>
    getApi().delete(`/cart/${itemId}`),
  clearCart: () =>
    getApi().post('/cart/clear'),
  updateSettings: (data: { shipping?: number; discount?: number; notes?: string }) =>
    getApi().put('/cart/settings', data),
  getSummary: () =>
    getApi().get('/cart/summary'),
  validate: () =>
    getApi().post('/cart/validate'),
}

/**
 * Order API endpoints
 */
export const orderApi = {
  list: (params?: { page?: number; per_page?: number; status?: string; payment_status?: string; sort?: string }) =>
    getApi().get('/orders', { params }),
  create: (data: {
    shipping_address: { street: string; city: string; state: string; zip: string; country: string };
    billing_address?: { street: string; city: string; state: string; zip: string; country: string };
    shipping_method?: string;
    notes?: string;
  }) =>
    getApi().post('/orders', data),
  show: (orderId: number | string) =>
    getApi().get(`/orders/${orderId}`),
  update: (orderId: number | string, data: any) =>
    getApi().put(`/orders/${orderId}`, data),
  markAsPaid: (orderId: number | string, transactionId: string, paymentMethod?: string) =>
    getApi().post(`/orders/${orderId}/pay`, { transaction_id: transactionId, payment_method: paymentMethod }),
  markAsShipped: (orderId: number | string, trackingNumber?: string) =>
    getApi().post(`/orders/${orderId}/ship`, { tracking_number: trackingNumber }),
  markAsDelivered: (orderId: number | string) =>
    getApi().post(`/orders/${orderId}/deliver`),
  cancel: (orderId: number | string, reason?: string) =>
    getApi().post(`/orders/${orderId}/cancel`, { reason }),
  getItems: (orderId: number | string) =>
    getApi().get(`/orders/${orderId}/items`),
}

// Initialize on import
if (typeof window !== 'undefined') {
  initializeApi()
}

export default getApi()

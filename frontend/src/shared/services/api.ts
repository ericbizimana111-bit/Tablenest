import axios from 'axios';
import { AUTH_TOKEN_KEY } from '../utils/auth.utils';

// ── Axios instance ─────────────────────────────────────────────────────────
const api = axios.create({
    baseURL: '/api',
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

// ── Token management ───────────────────────────────────────────────────────
let inMemoryToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setAuthToken(token: string | null): void {
    inMemoryToken = token;
    if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        delete api.defaults.headers.common.Authorization;
    }
}

export function setUnauthorizedHandler(handler: (() => void) | null): void {
    unauthorizedHandler = handler;
}

export function getStoredToken(): string | null {
    return inMemoryToken ?? localStorage.getItem(AUTH_TOKEN_KEY);
}

const initialToken = localStorage.getItem(AUTH_TOKEN_KEY);
if (initialToken) setAuthToken(initialToken);

// ── Interceptors ───────────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

let isHandling401 = false;

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url ?? '';
        const isAuthRoute = /\/auth\/(login|register|register-owner|forgot-password|reset-password)/.test(url);
        const hadAuthHeader = Boolean(error.config?.headers?.Authorization);

        if (status === 401 && !isAuthRoute && hadAuthHeader && unauthorizedHandler) {
            if (!isHandling401) {
                isHandling401 = true;
                unauthorizedHandler();
                setTimeout(() => { isHandling401 = false; }, 2000);
            }
            return Promise.reject(error);
        }
        return Promise.reject(error);
    },
);

export default api;

type Payload = Record<string, unknown>;
type Params = Record<string, unknown> | undefined;

/* AUTH ============================================================= */
export const authAPI = {
    register: (data: Payload) => api.post('/auth/register', data),
    registerOwner: (data: Payload) => api.post('/auth/register-owner', data),
    login: (data: Payload) => api.post('/auth/login', data),
    forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
    resetPassword: (data: Payload) => api.post('/auth/reset-password', data),
    changePassword: (data: Payload) => api.patch('/auth/change-password', data),
    getMe: () => api.get('/auth/me'),
};

/* USERS ============================================================= */
export const usersAPI = {
    updateProfile: (data: Payload) => api.put('/users/profile', data),
    updateNotificationPrefs: (prefs: Payload) => api.patch('/users/notification-prefs', prefs),
    getFavorites: () => api.get('/users/favorites'),
    addFavorite: (restaurantId: string) => api.post(`/users/favorites/${restaurantId}`),
    removeFavorite: (restaurantId: string) => api.delete(`/users/favorites/${restaurantId}`),
    getAddresses: () => api.get('/users/addresses'),
    addAddress: (data: Payload) => api.post('/users/addresses', data),
    updateAddress: (index: number, data: Payload) => api.put(`/users/addresses/${index}`, data),
    deleteAddress: (index: number) => api.delete(`/users/addresses/${index}`),
    setDefaultAddress: (index: number) => api.patch(`/users/addresses/${index}/default`),
    getPaymentMethods: () => api.get('/users/payment-methods'),
    addPaymentMethod: (data: Payload) => api.post('/users/payment-methods', data),
    deletePaymentMethod: (index: number) => api.delete(`/users/payment-methods/${index}`),
    setDefaultPaymentMethod: (index: number) => api.patch(`/users/payment-methods/${index}/default`),
    deleteAccount: () => api.delete('/users/account'),
};

/* RESTAURANTS ============================================================= */
export const restaurantsAPI = {
    getPublic: (params?: Params) => api.get('/restaurants/public', { params }),
    getPublicById: (id: string) => api.get(`/restaurants/public/${id}`),
    getFeatured: (limit?: number) => api.get('/restaurants/public/featured', { params: { limit } }),
    getCuisines: () => api.get('/restaurants/public/cuisines'),
    getPlatformStats: () => api.get('/restaurants/public/stats'),
    getMyRestaurant: () => api.get('/restaurants/my-restaurant'),
    getById: (id: string) => api.get(`/restaurants/${id}`),
    create: (data: Payload) => api.post('/restaurants', data),
    update: (id: string, data: Payload) => api.put(`/restaurants/${id}`, data),
};

/* MENU ============================================================= */
export const menuAPI = {
    getFullMenu: (restaurantId: string) => api.get(`/menu/restaurant/${restaurantId}`),
    getCategories: (restaurantId: string) => api.get(`/menu/categories/${restaurantId}`),
    getItems: (restaurantId: string, categoryId?: string) => api.get(`/menu/items/${restaurantId}`, { params: { categoryId } }),
    getItemById: (id: string) => api.get(`/menu/item/${id}`),
    getPopular: (limit?: number) => api.get('/menu/popular', { params: { limit } }),
    search: (q: string) => api.get('/menu/search', { params: { q } }),
    createCategory: (data: Payload) => api.post('/menu/categories', data),
    updateCategory: (id: string, data: Payload) => api.put(`/menu/categories/${id}`, data),
    deleteCategory: (id: string) => api.delete(`/menu/categories/${id}`),
    createItem: (data: Payload) => api.post('/menu/items', data),
    updateItem: (id: string, data: Payload) => api.put(`/menu/items/${id}`, data),
    toggleAvailability: (id: string) => api.patch(`/menu/items/${id}/toggle`),
    deleteItem: (id: string) => api.delete(`/menu/items/${id}`),
};

/* TABLES ============================================================= */
export const tablesAPI = {
    getByRestaurant: (restaurantId: string) => api.get(`/tables/restaurant/${restaurantId}`),
    getFloorPlan: (restaurantId: string) => api.get(`/tables/floor-plan/${restaurantId}`),
    create: (data: Payload) => api.post('/tables', data),
    update: (id: string, data: Payload) => api.put(`/tables/${id}`, data),
    updateStatus: (id: string, data: Payload) => api.patch(`/tables/${id}/status`, data),
    delete: (id: string) => api.delete(`/tables/${id}`),
};

/* ORDERS ============================================================= */
export const ordersAPI = {
    getAll: (params?: Params) => api.get('/orders', { params }),
    getMyOrders: (params?: Params) => api.get('/orders/my-orders', { params }),
    getByRestaurant: (restaurantId: string, params?: Params) => api.get(`/orders/restaurant/${restaurantId}`, { params }),
    getById: (id: string) => api.get(`/orders/${id}`),
    quote: (data: Payload) => api.post('/orders/quote', data),
    create: (data: Payload) => api.post('/orders', data),
    updateStatus: (id: string, data: Payload) => api.patch(`/orders/${id}/status`, data),
    cancel: (id: string) => api.patch(`/orders/${id}/cancel`),
    getStats: () => api.get('/orders/stats'),
    getRevenue: (days?: number) => api.get('/orders/revenue', { params: { days } }),
};

/* RESERVATIONS ============================================================= */
export const reservationsAPI = {
    getAvailability: (restaurantId: string, date: string, guests: number) =>
        api.get('/reservations/availability', { params: { restaurantId, date, guests } }),
    getMyReservations: () => api.get('/reservations/my-reservations'),
    getByRestaurant: (restaurantId: string, params?: Params) => api.get(`/reservations/restaurant/${restaurantId}`, { params }),
    getById: (id: string) => api.get(`/reservations/${id}`),
    create: (data: Payload) => api.post('/reservations', data),
    confirm: (id: string) => api.patch(`/reservations/${id}/confirm`),
    cancel: (id: string, reason?: string) => api.patch(`/reservations/${id}/cancel`, { reason }),
    update: (id: string, data: Payload) => api.patch(`/reservations/${id}`, data),
    markArrived: (id: string) => api.patch(`/reservations/${id}/arrived`),
    setStatus: (id: string, status: string, reason?: string) => api.patch(`/reservations/${id}/status`, { status, reason }),
    getCalendarData: (month: number, year: number) => api.get('/reservations/calendar', { params: { month, year } }),
    getStats: () => api.get('/reservations/stats'),
};

/* REVIEWS ============================================================= */
export const reviewsAPI = {
    getFeatured: (limit?: number) => api.get('/reviews/featured', { params: { limit } }),
    getByRestaurant: (restaurantId: string, params?: Params) => api.get(`/reviews/restaurant/${restaurantId}`, { params }),
    create: (data: Payload) => api.post('/reviews', data),
    reply: (id: string, reply: string) => api.patch(`/reviews/${id}/reply`, { reply }),
    delete: (id: string) => api.delete(`/reviews/${id}`),
};

/* NOTIFICATIONS ============================================================= */
export const notificationsAPI = {
    getAll: (params?: Params) => api.get('/notifications', { params }),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markRead: (id: string) => api.patch(`/notifications/${id}/read`),
    markAllRead: () => api.patch('/notifications/mark-all-read'),
    clearAll: () => api.delete('/notifications/clear-all'),
};

/* PROMOTIONS ============================================================= */
export const promotionsAPI = {
    getFeatured: (limit?: number) => api.get('/promotions/featured', { params: { limit } }),
    getActiveForRestaurant: (restaurantId: string) => api.get(`/promotions/active/${restaurantId}`),
    getByRestaurant: (restaurantId: string) => api.get(`/promotions/restaurant/${restaurantId}`),
    create: (data: Payload) => api.post('/promotions', data),
    update: (id: string, data: Payload) => api.put(`/promotions/${id}`, data),
    toggle: (id: string) => api.patch(`/promotions/${id}/toggle`),
    delete: (id: string) => api.delete(`/promotions/${id}`),
};

/* ANALYTICS ============================================================= */
export const analyticsAPI = {
    getRestaurantDashboard: (restaurantId: string) => api.get(`/analytics/restaurant/${restaurantId}/dashboard`),
    getOverview: (restaurantId: string, days?: number) => api.get(`/analytics/restaurant/${restaurantId}/overview`, { params: { days } }),
    getHeatmap: (restaurantId: string) => api.get(`/analytics/restaurant/${restaurantId}/heatmap`),
};

/* SUPPORT TICKETS ============================================================= */
export const supportAPI = {
    getMyTickets: () => api.get('/support/my-tickets'),
    getById: (id: string) => api.get(`/support/${id}`),
    create: (data: Payload) => api.post('/support', data),
};

/* LOYALTY ============================================================= */
export const loyaltyAPI = {
    get: () => api.get('/loyalty'),
    redeem: (rewardId: string) => api.post('/loyalty/redeem', { rewardId }),
};

/* REFERRALS ============================================================= */
export const referralsAPI = {
    get: () => api.get('/referrals'),
    invite: (email: string) => api.post('/referrals/invite', { email }),
};

/* INVENTORY ============================================================= */
export const inventoryAPI = {
    getByRestaurant: (restaurantId: string) => api.get(`/inventory/restaurant/${restaurantId}`),
    getLowStock: (restaurantId: string) => api.get(`/inventory/restaurant/${restaurantId}/low-stock`),
    create: (data: Payload) => api.post('/inventory', data),
    update: (id: string, data: Payload) => api.put(`/inventory/${id}`, data),
    delete: (id: string) => api.delete(`/inventory/${id}`),
};

/* STAFF ============================================================= */
export const staffAPI = {
    getByRestaurant: (restaurantId: string) => api.get(`/staff/restaurant/${restaurantId}`),
    create: (data: Payload) => api.post('/staff', data),
    update: (id: string, data: Payload) => api.put(`/staff/${id}`, data),
    delete: (id: string) => api.delete(`/staff/${id}`),
};

/* MESSAGES ============================================================= */
export const messagesAPI = {
    getConversations: () => api.get('/messages/conversations'),
    getMessages: (conversationId: string) => api.get(`/messages/conversations/${conversationId}`),
    createConversation: (data: Payload) => api.post('/messages/conversations', data),
    sendMessage: (data: Payload) => api.post('/messages/send', data),
};

/* UPLOADS ============================================================= */
export const uploadsAPI = {
    uploadImage: (file: File) => {
        const form = new FormData();
        form.append('file', file);
        return api.post('/uploads/image', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    uploadImages: (files: File[]) => {
        const form = new FormData();
        files.forEach((f) => form.append('files', f));
        return api.post('/uploads/images', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
};

/* PAYMENTS ============================================================= */
export const paymentsAPI = {
    getMyPayments: () => api.get('/payments'),
};

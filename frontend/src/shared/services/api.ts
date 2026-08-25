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

// Restore token from localStorage on load
const initialToken = localStorage.getItem(AUTH_TOKEN_KEY);
if (initialToken) {
    setAuthToken(initialToken);
}

// ── Interceptors ───────────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let isHandling401 = false;

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url ?? '';
        const isAuthRoute = /\/auth\/(login|register|forgot-password|reset-password)/.test(url);
        const hadAuthHeader = Boolean(error.config?.headers?.Authorization);

        if (status === 401 && !isAuthRoute && hadAuthHeader && unauthorizedHandler) {
            if (!isHandling401) {
                isHandling401 = true;
                unauthorizedHandler();
                setTimeout(() => { isHandling401 = false; }, 2000);
            }
            // Suppress 401 toasts - the handler redirects to login
            return Promise.reject(error);
        }

        return Promise.reject(error);
    },
);

export default api;

// ── Shared types ───────────────────────────────────────────────────────────
type Payload = Record<string, unknown>;
type Params = Record<string, unknown> | undefined;

/* =================================================================
   AUTH
================================================================= */
export const authAPI = {
    register: (data: Payload) => api.post('/auth/register', data),
    registerOwner: (data: Payload) => api.post('/auth/register-owner', data),
    login: (data: Payload) => api.post('/auth/login', data),
    forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
    resetPassword: (data: Payload) => api.post('/auth/reset-password', data),
    changePassword: (data: Payload) => api.patch('/auth/change-password', data),
    getMe: () => api.get('/auth/me'),
};

/* =================================================================
   USERS
================================================================= */
export const usersAPI = {
    getAll: (params?: Params) => api.get('/users', { params }),
    getById: (id: string) => api.get(`/users/${id}`),
    updateProfile: (data: Payload) => api.put('/users/profile', data),
    updateNotifPrefs: (prefs: Payload) => api.patch('/users/notification-prefs', prefs),
    updateNotificationPrefs: (prefs: Payload) => api.patch('/users/notification-prefs', prefs),
    getFavorites: () => api.get('/users/favorites'),
    addFavorite: (restaurantId: string) => api.post(`/users/favorites/${restaurantId}`),
    removeFavorite: (restaurantId: string) => api.delete(`/users/favorites/${restaurantId}`),
    getAddresses: () => api.get('/users/addresses'),
    addAddress: (data: Payload) => api.post('/users/addresses', data),
    updateAddress: (index: number, data: Payload) => api.put(`/users/addresses/${index}`, data),
    deleteAddress: (index: number) => api.delete(`/users/addresses/${index}`),
    getPaymentMethods: () => api.get('/users/payment-methods'),
    addPaymentMethod: (data: Payload) => api.post('/users/payment-methods', data),
    deletePaymentMethod: (index: number) => api.delete(`/users/payment-methods/${index}`),
    suspend: (id: string) => api.patch(`/users/${id}/suspend`),
    activate: (id: string) => api.patch(`/users/${id}/activate`),
    deleteAccount: () => api.delete('/users/account'),
    getStats: () => api.get('/users/stats'),
};

/* =================================================================
   RESTAURANTS
================================================================= */
export const restaurantsAPI = {
    getPublic: (params?: Params) => api.get('/restaurants/public', { params }),
    getPublicById: (id: string) => api.get(`/restaurants/public/${id}`),
    getAll: (params?: Params) => api.get('/restaurants', { params }),
    getPending: () => api.get('/restaurants/pending'),
    getMyRestaurant: () => api.get('/restaurants/my-restaurant'),
    getById: (id: string) => api.get(`/restaurants/${id}`),
    create: (data: Payload) => api.post('/restaurants', data),
    update: (id: string, data: Payload) => api.put(`/restaurants/${id}`, data),
    approve: (id: string) => api.patch(`/restaurants/${id}/approve`),
    reject: (id: string, reason: string) => api.patch(`/restaurants/${id}/reject`, { reason }),
    suspend: (id: string) => api.patch(`/restaurants/${id}/suspend`),
    getStats: () => api.get('/restaurants/stats'),
};

/* =================================================================
   MENU
================================================================= */
export const menuAPI = {
    getFullMenu: (restaurantId: string) => api.get(`/menu/restaurant/${restaurantId}`),
    getCategories: (restaurantId: string) => api.get(`/menu/categories/${restaurantId}`),
    getItems: (restaurantId: string, categoryId?: string) =>
        api.get(`/menu/items/${restaurantId}`, { params: { categoryId } }),
    createCategory: (data: Payload) => api.post('/menu/categories', data),
    updateCategory: (id: string, data: Payload) => api.put(`/menu/categories/${id}`, data),
    deleteCategory: (id: string) => api.delete(`/menu/categories/${id}`),
    createItem: (data: Payload) => api.post('/menu/items', data),
    updateItem: (id: string, data: Payload) => api.put(`/menu/items/${id}`, data),
    toggleAvailability: (id: string) => api.patch(`/menu/items/${id}/toggle`),
    deleteItem: (id: string) => api.delete(`/menu/items/${id}`),
};

/* =================================================================
   TABLES
================================================================= */
export const tablesAPI = {
    getByRestaurant: (restaurantId: string) => api.get(`/tables/restaurant/${restaurantId}`),
    getFloorPlan: (restaurantId: string) => api.get(`/tables/floor-plan/${restaurantId}`),
    create: (data: Payload) => api.post('/tables', data),
    update: (id: string, data: Payload) => api.put(`/tables/${id}`, data),
    updateStatus: (id: string, data: Payload) => api.patch(`/tables/${id}/status`, data),
    delete: (id: string) => api.delete(`/tables/${id}`),
};

/* =================================================================
   ORDERS
================================================================= */
export const ordersAPI = {
    getAll: (params?: Params) => api.get('/orders', { params }),
    getMyOrders: (params?: Params) => api.get('/orders/my-orders', { params }),
    getByRestaurant: (restaurantId: string, params?: Params) => api.get(`/orders/restaurant/${restaurantId}`, { params }),
    getById: (id: string) => api.get(`/orders/${id}`),
    create: (data: Payload) => api.post('/orders', data),
    updateStatus: (id: string, data: Payload) => api.patch(`/orders/${id}/status`, data),
    cancel: (id: string) => api.patch(`/orders/${id}/cancel`),
    getStats: (restaurantId?: string) => api.get('/orders/stats', { params: { restaurantId } }),
    getRevenue: (restaurantId: string, days?: number) => api.get('/orders/revenue', { params: { restaurantId, days } }),
};

/* =================================================================
   RESERVATIONS
================================================================= */
export const reservationsAPI = {
    getAll: (params?: Params) => api.get('/reservations', { params }),
    getMyReservations: () => api.get('/reservations/my-reservations'),
    getByRestaurant: (restaurantId: string, params?: Params) => api.get(`/reservations/restaurant/${restaurantId}`, { params }),
    getById: (id: string) => api.get(`/reservations/${id}`),
    create: (data: Payload) => api.post('/reservations', data),
    confirm: (id: string) => api.patch(`/reservations/${id}/confirm`),
    cancel: (id: string) => api.patch(`/reservations/${id}/cancel`),
    markArrived: (id: string) => api.patch(`/reservations/${id}/arrived`),
    getCalendarData: (restaurantId: string, month: number, year: number) =>
        api.get('/reservations/calendar', { params: { restaurantId, month, year } }),
    getStats: (restaurantId?: string) => api.get('/reservations/stats', { params: { restaurantId } }),
};

/* =================================================================
   REVIEWS
================================================================= */
export const reviewsAPI = {
    getByRestaurant: (restaurantId: string, params?: Params) => api.get(`/reviews/restaurant/${restaurantId}`, { params }),
    create: (data: Payload) => api.post('/reviews', data),
    reply: (id: string, reply: string) => api.patch(`/reviews/${id}/reply`, { reply }),
    delete: (id: string) => api.delete(`/reviews/${id}`),
};

/* =================================================================
   NOTIFICATIONS
================================================================= */
export const notificationsAPI = {
    getAll: (params?: Params) => api.get('/notifications', { params }),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markRead: (id: string) => api.patch(`/notifications/${id}/read`),
    markAllRead: () => api.patch('/notifications/mark-all-read'),
    clearAll: () => api.delete('/notifications/clear-all'),
};

/* =================================================================
   PROMOTIONS
================================================================= */
export const promotionsAPI = {
    getByRestaurant: (restaurantId: string) => api.get(`/promotions/restaurant/${restaurantId}`),
    create: (data: Payload) => api.post('/promotions', data),
    update: (id: string, data: Payload) => api.put(`/promotions/${id}`, data),
    toggle: (id: string) => api.patch(`/promotions/${id}/toggle`),
    delete: (id: string) => api.delete(`/promotions/${id}`),
};

/* =================================================================
   ANALYTICS
================================================================= */
export const analyticsAPI = {
    getPlatformOverview: () => api.get('/analytics/platform-overview'),
    getSignups: (days?: number) => api.get('/analytics/signups', { params: { days } }),
    getBookingsByDay: (days?: number) => api.get('/analytics/bookings-by-day', { params: { days } }),
    getCuisineDistribution: () => api.get('/analytics/cuisine-distribution'),
    getRestaurantDashboard: (restaurantId: string) => api.get(`/analytics/restaurant/${restaurantId}/dashboard`),
    getHeatmap: (restaurantId: string) => api.get(`/analytics/restaurant/${restaurantId}/heatmap`),
    getRevenueByDay: (days?: number) => api.get('/analytics/revenue-by-day', { params: { days } }),
    getOrdersByDay: (days?: number) => api.get('/analytics/orders-by-day', { params: { days } }),
};

/* =================================================================
   SUPPORT TICKETS
================================================================= */
export const supportAPI = {
    getAll: (params?: Params) => api.get('/support', { params }),
    getStats: () => api.get('/support/stats'),
    getMyTickets: () => api.get('/support/my-tickets'),
    getById: (id: string) => api.get(`/support/${id}`),
    create: (data: Payload) => api.post('/support', data),
    updateStatus: (id: string, status: string) => api.patch(`/support/${id}/status`, { status }),
    addResponse: (id: string, message: string) => api.post(`/support/${id}/respond`, { message }),
};

/* =================================================================
   LOYALTY
================================================================= */
export const loyaltyAPI = {
    get: () => api.get('/loyalty'),
    addPoints: (points: number, description: string) => api.post('/loyalty/add', { points, description }),
    redeemPoints: (points: number, description: string) => api.post('/loyalty/redeem', { points, description }),
};

/* =================================================================
   REFERRALS
================================================================= */
export const referralsAPI = {
    get: () => api.get('/referrals'),
    track: (code: string, body: Payload) => api.post(`/referrals/track/${code}`, body),
};

/* =================================================================
   INVENTORY
================================================================= */
export const inventoryAPI = {
    getByRestaurant: (restaurantId: string) => api.get(`/inventory/restaurant/${restaurantId}`),
    getLowStock: (restaurantId: string) => api.get(`/inventory/restaurant/${restaurantId}/low-stock`),
    create: (data: Payload) => api.post('/inventory', data),
    update: (id: string, data: Payload) => api.put(`/inventory/${id}`, data),
    delete: (id: string) => api.delete(`/inventory/${id}`),
};

/* =================================================================
   STAFF
================================================================= */
export const staffAPI = {
    getByRestaurant: (restaurantId: string) => api.get(`/staff/restaurant/${restaurantId}`),
    create: (data: Payload) => api.post('/staff', data),
    update: (id: string, data: Payload) => api.put(`/staff/${id}`, data),
    delete: (id: string) => api.delete(`/staff/${id}`),
};

/* =================================================================
   MESSAGES
================================================================= */
export const messagesAPI = {
    getConversations: () => api.get('/messages/conversations'),
    getMessages: (conversationId: string) => api.get(`/messages/conversations/${conversationId}`),
    createConversation: (data: Payload) => api.post('/messages/conversations', data),
    sendMessage: (data: Payload) => api.post('/messages/send', data),
};

/* =================================================================
   UPLOADS
================================================================= */
export const uploadsAPI = {
    uploadImage: (file: File) => {
        const form = new FormData();
        form.append('file', file);
        return api.post('/uploads/image', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

/* =================================================================
   PAYMENTS
================================================================= */
export const paymentsAPI = {
    getMyPayments: () => api.get('/payments'),
    create: (data: Payload) => api.post('/payments', data),
};

/* =================================================================
   CALENDAR (getCalendarData alias used in some components)
================================================================= */
export const calendarAPI = {
    getData: (restaurantId: string, month: number, year: number) =>
        reservationsAPI.getCalendarData(restaurantId, month, year),
};

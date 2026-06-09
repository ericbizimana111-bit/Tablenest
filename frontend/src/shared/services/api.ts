import api from './axios';

type ApiPayload = Record<string, unknown>;
type ApiParams = Record<string, unknown> | undefined;

export default api;

/* =========================
   AUTH
========================= */
export const authAPI = {
    register: (data: ApiPayload) => api.post('/auth/register', data),
    login: (data: ApiPayload) => api.post('/auth/login', data),
    forgotPassword: (email: string) =>
        api.post('/auth/forgot-password', { email }),
    resetPassword: (data: ApiPayload) =>
        api.post('/auth/reset-password', data),
    changePassword: (data: ApiPayload) =>
        api.patch('/auth/change-password', data),
    getMe: () => api.get('/auth/me'),
};

/* =========================
   USERS
========================= */
export const usersAPI = {
    getAll: (params?: ApiParams) =>
        api.get('/users', { params }),
    getById: (id: string) => {
        if (!id) throw new Error('User ID required');
        return api.get(`/users/${id}`);
    },
    updateProfile: (data: ApiPayload) =>
        api.put('/users/profile', data),
    updateNotifPrefs: (prefs: ApiPayload) =>
        api.patch('/users/notification-prefs', prefs),
    suspend: (id: string) =>
        api.patch(`/users/${id}/suspend`),
    activate: (id: string) =>
        api.patch(`/users/${id}/activate`),
    deleteAccount: () =>
        api.delete('/users/account'),
    getStats: () =>
        api.get('/users/stats'),
};

/* =========================
   RESTAURANTS (FIXED)
========================= */
export const restaurantsAPI = {
    getPublic: (params?: ApiParams) =>
        api.get('/restaurants/public', { params }),

    getPublicById: (id: string) => {
        if (!id || id === '2') {
            throw new Error(`Invalid restaurant ID: ${id}`);
        }
        return api.get(`/restaurants/public/${id}`);
    },

    getAll: (params?: ApiParams) =>
        api.get('/restaurants', { params }),

    getPending: () =>
        api.get('/restaurants/pending'),

    getMyRestaurant: () =>
        api.get('/restaurants/my-restaurant'),

    getById: (id: string) => {
        if (!id) throw new Error('Restaurant ID required');
        return api.get(`/restaurants/${id}`);
    },

    create: (data: ApiPayload) =>
        api.post('/restaurants', data),

    update: (id: string, data: ApiPayload) =>
        api.put(`/restaurants/${id}`, data),

    approve: (id: string) =>
        api.patch(`/restaurants/${id}/approve`),

    reject: (id: string, reason: string) =>
        api.patch(`/restaurants/${id}/reject`, { reason }),

    suspend: (id: string) =>
        api.patch(`/restaurants/${id}/suspend`),

    getStats: () =>
        api.get('/restaurants/stats'),
};

/* =========================
   MENU
========================= */
export const menuAPI = {
    getFullMenu: (restaurantId: string) =>
        api.get(`/menu/restaurant/${restaurantId}`),

    getCategories: (restaurantId: string) =>
        api.get(`/menu/categories/${restaurantId}`),

    getItems: (restaurantId: string, categoryId?: string) =>
        api.get(`/menu/items/${restaurantId}`, {
            params: { categoryId },
        }),

    createCategory: (data: ApiPayload) =>
        api.post('/menu/categories', data),

    updateCategory: (id: string, data: ApiPayload) =>
        api.put(`/menu/categories/${id}`, data),

    deleteCategory: (id: string) =>
        api.delete(`/menu/categories/${id}`),

    createItem: (data: ApiPayload) =>
        api.post('/menu/items', data),

    updateItem: (id: string, data: ApiPayload) =>
        api.put(`/menu/items/${id}`, data),

    toggleAvailability: (id: string) =>
        api.patch(`/menu/items/${id}/toggle`),

    deleteItem: (id: string) =>
        api.delete(`/menu/items/${id}`),
};

/* =========================
   TABLES
========================= */
export const tablesAPI = {
    getByRestaurant: (restaurantId: string) =>
        api.get(`/tables/restaurant/${restaurantId}`),

    getFloorPlan: (restaurantId: string) =>
        api.get(`/tables/floor-plan/${restaurantId}`),

    create: (data: ApiPayload) =>
        api.post('/tables', data),

    update: (id: string, data: ApiPayload) =>
        api.put(`/tables/${id}`, data),

    updateStatus: (id: string, data: ApiPayload) =>
        api.patch(`/tables/${id}/status`, data),

    delete: (id: string) =>
        api.delete(`/tables/${id}`),
};

/* =========================
   ORDERS
========================= */
export const ordersAPI = {
    getAll: (params?: ApiParams) =>
        api.get('/orders', { params }),

    getMyOrders: (params?: ApiParams) =>
        api.get('/orders/my-orders', { params }),

    getByRestaurant: (restaurantId: string, params?: ApiParams) =>
        api.get(`/orders/restaurant/${restaurantId}`, { params }),

    getById: (id: string) =>
        api.get(`/orders/${id}`),

    create: (data: ApiPayload) =>
        api.post('/orders', data),

    updateStatus: (id: string, data: ApiPayload) =>
        api.patch(`/orders/${id}/status`, data),

    cancel: (id: string) =>
        api.patch(`/orders/${id}/cancel`),

    getStats: (restaurantId?: string) =>
        api.get('/orders/stats', {
            params: { restaurantId },
        }),

    getRevenue: (restaurantId: string, days?: number) =>
        api.get('/orders/revenue', {
            params: { restaurantId, days },
        }),
};

/* =========================
   RESERVATIONS
========================= */
export const reservationsAPI = {
    getAll: (params?: ApiParams) =>
        api.get('/reservations', { params }),

    getMyReservations: () =>
        api.get('/reservations/my-reservations'),

    getByRestaurant: (restaurantId: string, params?: ApiParams) =>
        api.get(`/reservations/restaurant/${restaurantId}`, {
            params,
        }),

    getById: (id: string) =>
        api.get(`/reservations/${id}`),

    create: (data: ApiPayload) =>
        api.post('/reservations', data),

    confirm: (id: string) =>
        api.patch(`/reservations/${id}/confirm`),

    cancel: (id: string) =>
        api.patch(`/reservations/${id}/cancel`),

    markArrived: (id: string) =>
        api.patch(`/reservations/${id}/arrived`),

    getCalendar: (restaurantId: string, month: number, year: number) =>
        api.get('/reservations/calendar', {
            params: { restaurantId, month, year },
        }),

    getStats: (restaurantId?: string) =>
        api.get('/reservations/stats', {
            params: { restaurantId },
        }),
};

/* =========================
   REVIEWS
========================= */
export const reviewsAPI = {
    getByRestaurant: (restaurantId: string, params?: ApiParams) =>
        api.get(`/reviews/restaurant/${restaurantId}`, { params }),

    create: (data: ApiPayload) =>
        api.post('/reviews', data),

    reply: (id: string, reply: string) =>
        api.patch(`/reviews/${id}/reply`, { reply }),

    delete: (id: string) =>
        api.delete(`/reviews/${id}`),
};

/* =========================
   NOTIFICATIONS
========================= */
export const notificationsAPI = {
    getAll: (params?: ApiParams) =>
        api.get('/notifications', { params }),

    getUnreadCount: () =>
        api.get('/notifications/unread-count'),

    markRead: (id: string) =>
        api.patch(`/notifications/${id}/read`),

    markAllRead: () =>
        api.patch('/notifications/mark-all-read'),

    clearAll: () =>
        api.delete('/notifications/clear-all'),
};
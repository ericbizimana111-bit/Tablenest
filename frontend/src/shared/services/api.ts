import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// Auth
export const authAPI = {
    register: (data: any) => api.post('/auth/register', data),
    login: (data: any) => api.post('/auth/login', data),
    forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
    resetPassword: (data: any) => api.post('/auth/reset-password', data),
    changePassword: (data: any) => api.patch('/auth/change-password', data),
    getMe: () => api.get('/auth/me'),
};

// Users
export const usersAPI = {
    getAll: (params?: any) => api.get('/users', { params }),
    getById: (id: string) => api.get(`/users/${id}`),
    updateProfile: (data: any) => api.put('/users/profile', data),
    updateNotifPrefs: (prefs: any) => api.patch('/users/notification-prefs', prefs),
    suspend: (id: string) => api.patch(`/users/${id}/suspend`),
    activate: (id: string) => api.patch(`/users/${id}/activate`),
    deleteAccount: () => api.delete('/users/account'),
    getStats: () => api.get('/users/stats'),
};

// Restaurants
export const restaurantsAPI = {
    getPublic: (params?: any) => api.get('/restaurants/public', { params }),
    getPublicById: (id: string) => api.get(`/restaurants/public/${id}`),
    getAll: (params?: any) => api.get('/restaurants', { params }),
    getPending: () => api.get('/restaurants/pending'),
    getMyRestaurant: () => api.get('/restaurants/my-restaurant'),
    getById: (id: string) => api.get(`/restaurants/${id}`),
    create: (data: any) => api.post('/restaurants', data),
    update: (id: string, data: any) => api.put(`/restaurants/${id}`, data),
    approve: (id: string) => api.patch(`/restaurants/${id}/approve`),
    reject: (id: string, reason: string) => api.patch(`/restaurants/${id}/reject`, { reason }),
    suspend: (id: string) => api.patch(`/restaurants/${id}/suspend`),
    getStats: () => api.get('/restaurants/stats'),
};

// Menu
export const menuAPI = {
    getFullMenu: (restaurantId: string) => api.get(`/menu/restaurant/${restaurantId}`),
    getCategories: (restaurantId: string) => api.get(`/menu/categories/${restaurantId}`),
    getItems: (restaurantId: string, categoryId?: string) => api.get(`/menu/items/${restaurantId}`, { params: { categoryId } }),
    createCategory: (data: any) => api.post('/menu/categories', data),
    updateCategory: (id: string, data: any) => api.put(`/menu/categories/${id}`, data),
    deleteCategory: (id: string) => api.delete(`/menu/categories/${id}`),
    createItem: (data: any) => api.post('/menu/items', data),
    updateItem: (id: string, data: any) => api.put(`/menu/items/${id}`, data),
    toggleAvailability: (id: string) => api.patch(`/menu/items/${id}/toggle`),
    deleteItem: (id: string) => api.delete(`/menu/items/${id}`),
};

// Tables
export const tablesAPI = {
    getByRestaurant: (restaurantId: string) => api.get(`/tables/restaurant/${restaurantId}`),
    getFloorPlan: (restaurantId: string) => api.get(`/tables/floor-plan/${restaurantId}`),
    create: (data: any) => api.post('/tables', data),
    update: (id: string, data: any) => api.put(`/tables/${id}`, data),
    updateStatus: (id: string, data: any) => api.patch(`/tables/${id}/status`, data),
    delete: (id: string) => api.delete(`/tables/${id}`),
};

// Orders
export const ordersAPI = {
    getAll: (params?: any) => api.get('/orders', { params }),
    getMyOrders: (params?: any) => api.get('/orders/my-orders', { params }),
    getByRestaurant: (restaurantId: string, params?: any) => api.get(`/orders/restaurant/${restaurantId}`, { params }),
    getById: (id: string) => api.get(`/orders/${id}`),
    create: (data: any) => api.post('/orders', data),
    updateStatus: (id: string, data: any) => api.patch(`/orders/${id}/status`, data),
    cancel: (id: string) => api.patch(`/orders/${id}/cancel`),
    getStats: (restaurantId?: string) => api.get('/orders/stats', { params: { restaurantId } }),
    getRevenue: (restaurantId: string, days?: number) => api.get('/orders/revenue', { params: { restaurantId, days } }),
};

// Reservations
export const reservationsAPI = {
    getAll: (params?: any) => api.get('/reservations', { params }),
    getMyReservations: () => api.get('/reservations/my-reservations'),
    getByRestaurant: (restaurantId: string, params?: any) => api.get(`/reservations/restaurant/${restaurantId}`, { params }),
    getById: (id: string) => api.get(`/reservations/${id}`),
    create: (data: any) => api.post('/reservations', data),
    confirm: (id: string) => api.patch(`/reservations/${id}/confirm`),
    cancel: (id: string) => api.patch(`/reservations/${id}/cancel`),
    markArrived: (id: string) => api.patch(`/reservations/${id}/arrived`),
    getCalendar: (restaurantId: string, month: number, year: number) =>
        api.get('/reservations/calendar', { params: { restaurantId, month, year } }),
    getStats: (restaurantId?: string) => api.get('/reservations/stats', { params: { restaurantId } }),
};

// Reviews
export const reviewsAPI = {
    getByRestaurant: (restaurantId: string, params?: any) => api.get(`/reviews/restaurant/${restaurantId}`, { params }),
    create: (data: any) => api.post('/reviews', data),
    reply: (id: string, reply: string) => api.patch(`/reviews/${id}/reply`, { reply }),
    delete: (id: string) => api.delete(`/reviews/${id}`),
};

// Notifications
export const notificationsAPI = {
    getAll: (params?: any) => api.get('/notifications', { params }),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markRead: (id: string) => api.patch(`/notifications/${id}/read`),
    markAllRead: () => api.patch('/notifications/mark-all-read'),
    clearAll: () => api.delete('/notifications/clear-all'),
};

// Promotions
export const promotionsAPI = {
    getByRestaurant: (restaurantId: string) => api.get(`/promotions/restaurant/${restaurantId}`),
    create: (data: any) => api.post('/promotions', data),
    update: (id: string, data: any) => api.put(`/promotions/${id}`, data),
    toggle: (id: string) => api.patch(`/promotions/${id}/toggle`),
    delete: (id: string) => api.delete(`/promotions/${id}`),
};

// Analytics
export const analyticsAPI = {
    getPlatformOverview: () => api.get('/analytics/platform-overview'),
    getSignups: (days?: number) => api.get('/analytics/signups', { params: { days } }),
    getBookingsByDay: (days?: number) => api.get('/analytics/bookings-by-day', { params: { days } }),
    getCuisineDistribution: () => api.get('/analytics/cuisine-distribution'),
    getRestaurantDashboard: (restaurantId: string) => api.get(`/analytics/restaurant/${restaurantId}/dashboard`),
    getHeatmap: (restaurantId: string) => api.get(`/analytics/restaurant/${restaurantId}/heatmap`),
};

// Support
export const supportAPI = {
    getAll: (params?: any) => api.get('/support', { params }),
    getStats: () => api.get('/support/stats'),
    getMyTickets: () => api.get('/support/my-tickets'),
    getById: (id: string) => api.get(`/support/${id}`),
    create: (data: any) => api.post('/support', data),
    updateStatus: (id: string, status: string) => api.patch(`/support/${id}/status`, { status }),
    addResponse: (id: string, message: string) => api.post(`/support/${id}/respond`, { message }),
};

// Loyalty
export const loyaltyAPI = {
    get: () => api.get('/loyalty'),
    addPoints: (points: number, description: string) => api.post('/loyalty/add', { points, description }),
    redeemPoints: (points: number, description: string) => api.post('/loyalty/redeem', { points, description }),
};

// Referrals
export const referralsAPI = {
    get: () => api.get('/referrals'),
};

// Inventory
export const inventoryAPI = {
    getByRestaurant: (restaurantId: string) => api.get(`/inventory/restaurant/${restaurantId}`),
    getLowStock: (restaurantId: string) => api.get(`/inventory/restaurant/${restaurantId}/low-stock`),
    create: (data: any) => api.post('/inventory', data),
    update: (id: string, data: any) => api.put(`/inventory/${id}`, data),
    delete: (id: string) => api.delete(`/inventory/${id}`),
};

// Staff
export const staffAPI = {
    getByRestaurant: (restaurantId: string) => api.get(`/staff/restaurant/${restaurantId}`),
    create: (data: any) => api.post('/staff', data),
    update: (id: string, data: any) => api.put(`/staff/${id}`, data),
    delete: (id: string) => api.delete(`/staff/${id}`),
};

// Messages
export const messagesAPI = {
    getConversations: () => api.get('/messages/conversations'),
    getMessages: (conversationId: string) => api.get(`/messages/conversations/${conversationId}`),
    createConversation: (data: any) => api.post('/messages/conversations', data),
    sendMessage: (data: any) => api.post('/messages/send', data),
};

// Uploads
export const uploadsAPI = {
    uploadImage: (file: File) => {
        const form = new FormData();
        form.append('file', file);
        return api.post('/uploads/image', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
};
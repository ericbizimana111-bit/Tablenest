import api from './api';
import type { Order, OrderStatus, Reservation, ReservationStatus, Cart } from '../types/order.types';

export const OrderService = {
    // Orders
    getMyOrders: async (params?: { status?: string; page?: number; limit?: number }) => {
        const res = await api.get('/orders/my-orders', { params });
        return res.data as { orders: Order[]; total: number; page: number; pages: number };
    },

    getOrderById: async (id: string) => {
        const res = await api.get(`/orders/${id}`);
        return res.data as Order;
    },

    createOrder: async (data: {
        restaurantId: string;
        items: Array<{ menuItemId: string; name: string; price: number; quantity: number }>;
        total: number;
        deliveryAddress?: string;
        tableId?: string;
        notes?: string;
    }) => {
        const res = await api.post('/orders', data);
        return res.data as Order;
    },

    updateOrderStatus: async (id: string, status: OrderStatus, note?: string) => {
        const res = await api.patch(`/orders/${id}/status`, { status, note });
        return res.data as Order;
    },

    cancelOrder: async (id: string) => {
        const res = await api.patch(`/orders/${id}/cancel`);
        return res.data as Order;
    },

    getOrdersByRestaurant: async (restaurantId: string, params?: { status?: string; page?: number }) => {
        const res = await api.get(`/orders/restaurant/${restaurantId}`, { params });
        return res.data as { orders: Order[]; total: number };
    },

    getOrderStats: async (restaurantId?: string) => {
        const res = await api.get('/orders/stats', { params: { restaurantId } });
        return res.data;
    },

    // Reservations
    getMyReservations: async () => {
        const res = await api.get('/reservations/my-reservations');
        return res.data as Reservation[];
    },

    getReservationById: async (id: string) => {
        const res = await api.get(`/reservations/${id}`);
        return res.data as Reservation;
    },

    createReservation: async (data: {
        restaurantId: string;
        tableId: string;
        date: string;
        time: string;
        guests: number;
        specialRequests?: string;
    }) => {
        const res = await api.post('/reservations', data);
        return res.data as Reservation;
    },

    confirmReservation: async (id: string) => {
        const res = await api.patch(`/reservations/${id}/confirm`);
        return res.data as Reservation;
    },

    cancelReservation: async (id: string) => {
        const res = await api.patch(`/reservations/${id}/cancel`);
        return res.data as Reservation;
    },

    getCalendar: async (restaurantId: string, month: number, year: number) => {
        const res = await api.get('/reservations/calendar', { params: { restaurantId, month, year } });
        return res.data as Record<string, any>;
    },

    getReservationsByRestaurant: async (restaurantId: string, params?: any) => {
        const res = await api.get(`/reservations/restaurant/${restaurantId}`, { params });
        return res.data;
    },

    getReservationStats: async (restaurantId?: string) => {
        const res = await api.get('/reservations/stats', { params: { restaurantId } });
        return res.data;
    },
};

export default OrderService;
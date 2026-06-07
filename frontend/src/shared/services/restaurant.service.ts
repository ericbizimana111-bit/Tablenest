import api from './api';
import type { Restaurant, MenuItem, MenuCategory, Table, Review, Promotion, InventoryItem, Staff } from '../types/restaurant.types';

export const RestaurantService = {
    // Public
    getPublicRestaurants: async (params?: {
        search?: string;
        cuisine?: string;
        city?: string;
        priceRange?: string;
        page?: number;
        limit?: number;
    }) => {
        const res = await api.get('/restaurants/public', { params });
        return res.data as { restaurants: Restaurant[]; total: number; pages: number };
    },

    getPublicById: async (id: string) => {
        const res = await api.get(`/restaurants/public/${id}`);
        return res.data as Restaurant;
    },

    // Authenticated
    getAll: async (params?: Record<string, unknown>) => {
        const res = await api.get('/restaurants', { params });
        return res.data;
    },

    getMyRestaurant: async () => {
        const res = await api.get('/restaurants/my-restaurant');
        return res.data as Restaurant;
    },

    getById: async (id: string) => {
        const res = await api.get(`/restaurants/${id}`);
        return res.data as Restaurant;
    },

    create: async (data: Partial<Restaurant>) => {
        const res = await api.post('/restaurants', data);
        return res.data as Restaurant;
    },

    update: async (id: string, data: Partial<Restaurant>) => {
        const res = await api.put(`/restaurants/${id}`, data);
        return res.data as Restaurant;
    },

    approve: async (id: string) => {
        const res = await api.patch(`/restaurants/${id}/approve`);
        return res.data;
    },

    reject: async (id: string, reason: string) => {
        const res = await api.patch(`/restaurants/${id}/reject`, { reason });
        return res.data;
    },

    suspend: async (id: string) => {
        const res = await api.patch(`/restaurants/${id}/suspend`);
        return res.data;
    },

    getPending: async () => {
        const res = await api.get('/restaurants/pending');
        return res.data as Restaurant[];
    },

    // Menu
    getFullMenu: async (restaurantId: string) => {
        const res = await api.get(`/menu/restaurant/${restaurantId}`);
        return res.data as MenuCategory[];
    },

    getCategories: async (restaurantId: string) => {
        const res = await api.get(`/menu/categories/${restaurantId}`);
        return res.data as MenuCategory[];
    },

    getMenuItems: async (restaurantId: string, categoryId?: string) => {
        const res = await api.get(`/menu/items/${restaurantId}`, { params: { categoryId } });
        return res.data as MenuItem[];
    },

    createMenuItem: async (data: Partial<MenuItem>) => {
        const res = await api.post('/menu/items', data);
        return res.data as MenuItem;
    },

    updateMenuItem: async (id: string, data: Partial<MenuItem>) => {
        const res = await api.put(`/menu/items/${id}`, data);
        return res.data as MenuItem;
    },

    toggleMenuItemAvailability: async (id: string) => {
        const res = await api.patch(`/menu/items/${id}/toggle`);
        return res.data as MenuItem;
    },

    deleteMenuItem: async (id: string) => {
        const res = await api.delete(`/menu/items/${id}`);
        return res.data;
    },

    createCategory: async (data: Partial<MenuCategory>) => {
        const res = await api.post('/menu/categories', data);
        return res.data as MenuCategory;
    },

    deleteCategory: async (id: string) => {
        const res = await api.delete(`/menu/categories/${id}`);
        return res.data;
    },

    // Tables
    getFloorPlan: async (restaurantId: string) => {
        const res = await api.get(`/tables/floor-plan/${restaurantId}`);
        return res.data;
    },

    getTables: async (restaurantId: string) => {
        const res = await api.get(`/tables/restaurant/${restaurantId}`);
        return res.data as Table[];
    },

    createTable: async (data: Partial<Table>) => {
        const res = await api.post('/tables', data);
        return res.data as Table;
    },

    updateTableStatus: async (id: string, status: string) => {
        const res = await api.patch(`/tables/${id}/status`, { status });
        return res.data as Table;
    },

    // Reviews
    getReviews: async (restaurantId: string, params?: Record<string, unknown>) => {
        const res = await api.get(`/reviews/restaurant/${restaurantId}`, { params });
        return res.data;
    },

    createReview: async (data: Partial<Review>) => {
        const res = await api.post('/reviews', data);
        return res.data as Review;
    },

    replyToReview: async (id: string, reply: string) => {
        const res = await api.patch(`/reviews/${id}/reply`, { reply });
        return res.data as Review;
    },

    // Inventory
    getInventory: async (restaurantId: string) => {
        const res = await api.get(`/inventory/restaurant/${restaurantId}`);
        return res.data as InventoryItem[];
    },

    createInventoryItem: async (data: Partial<InventoryItem>) => {
        const res = await api.post('/inventory', data);
        return res.data as InventoryItem;
    },

    updateInventoryItem: async (id: string, data: Partial<InventoryItem>) => {
        const res = await api.put(`/inventory/${id}`, data);
        return res.data as InventoryItem;
    },

    deleteInventoryItem: async (id: string) => {
        const res = await api.delete(`/inventory/${id}`);
        return res.data;
    },

    // Staff
    getStaff: async (restaurantId: string) => {
        const res = await api.get(`/staff/restaurant/${restaurantId}`);
        return res.data as Staff[];
    },

    createStaff: async (data: Partial<Staff>) => {
        const res = await api.post('/staff', data);
        return res.data as Staff;
    },

    updateStaff: async (id: string, data: Partial<Staff>) => {
        const res = await api.put(`/staff/${id}`, data);
        return res.data as Staff;
    },

    deleteStaff: async (id: string) => {
        const res = await api.delete(`/staff/${id}`);
        return res.data;
    },
};

export default RestaurantService;
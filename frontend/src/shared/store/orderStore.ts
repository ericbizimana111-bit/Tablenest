import { create } from 'zustand';
import type { Cart, CartItem, Order } from '../types/order.types';

interface OrderState {
    cart: Cart | null;
    activeOrder: Order | null;
    recentOrders: Order[];
    addToCart: (restaurantId: string, restaurantName: string, item: CartItem) => void;
    removeFromCart: (menuItemId: string) => void;
    updateQuantity: (menuItemId: string, quantity: number) => void;
    clearCart: () => void;
    setActiveOrder: (order: Order | null) => void;
    setRecentOrders: (orders: Order[]) => void;
    cartTotal: () => number;
    cartItemCount: () => number;
}

export const useOrderStore = create<OrderState>((set, get) => ({
    cart: null,
    activeOrder: null,
    recentOrders: [],

    addToCart: (restaurantId, restaurantName, item) => {
        const { cart } = get();
        // If cart has items from a different restaurant, clear it first
        if (cart && cart.restaurantId !== restaurantId) {
            set({
                cart: {
                    restaurantId,
                    restaurantName,
                    items: [item],
                    total: item.price * item.quantity,
                },
            });
            return;
        }
        if (!cart) {
            set({
                cart: {
                    restaurantId,
                    restaurantName,
                    items: [item],
                    total: item.price * item.quantity,
                },
            });
            return;
        }
        const existing = cart.items.find(i => i.menuItemId === item.menuItemId);
        let newItems: CartItem[];
        if (existing) {
            newItems = cart.items.map(i =>
                i.menuItemId === item.menuItemId
                    ? { ...i, quantity: i.quantity + item.quantity }
                    : i
            );
        } else {
            newItems = [...cart.items, item];
        }
        const total = newItems.reduce((s, i) => s + i.price * i.quantity, 0);
        set({ cart: { ...cart, items: newItems, total } });
    },

    removeFromCart: (menuItemId) => {
        const { cart } = get();
        if (!cart) return;
        const newItems = cart.items.filter(i => i.menuItemId !== menuItemId);
        if (newItems.length === 0) {
            set({ cart: null });
            return;
        }
        const total = newItems.reduce((s, i) => s + i.price * i.quantity, 0);
        set({ cart: { ...cart, items: newItems, total } });
    },

    updateQuantity: (menuItemId, quantity) => {
        const { cart } = get();
        if (!cart) return;
        if (quantity <= 0) {
            get().removeFromCart(menuItemId);
            return;
        }
        const newItems = cart.items.map(i =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i
        );
        const total = newItems.reduce((s, i) => s + i.price * i.quantity, 0);
        set({ cart: { ...cart, items: newItems, total } });
    },

    clearCart: () => set({ cart: null }),

    setActiveOrder: (order) => set({ activeOrder: order }),

    setRecentOrders: (orders) => set({ recentOrders: orders }),

    cartTotal: () => {
        const { cart } = get();
        return cart?.total ?? 0;
    },

    cartItemCount: () => {
        const { cart } = get();
        return cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;
    },
}));
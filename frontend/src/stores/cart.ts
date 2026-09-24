import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface CartLine {
  menuItemId: string;
  name: string;
  /** Last known price, for display only — the server always re-prices at checkout. */
  price: number;
  quantity: number;
  image: string | null;
}

interface CartState {
  restaurantId: string | null;
  restaurantName: string | null;
  lines: CartLine[];
  /** Returns false when the item belongs to another restaurant (caller asks before switching). */
  add: (restaurant: { _id: string; name: string }, item: Omit<CartLine, 'quantity'>, quantity?: number) => boolean;
  replaceWith: (restaurant: { _id: string; name: string }, item: Omit<CartLine, 'quantity'>) => void;
  setQuantity: (menuItemId: string, quantity: number) => void;
  clear: () => void;
}

export const MAX_QTY = 50;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      restaurantId: null,
      restaurantName: null,
      lines: [],
      add: (restaurant, item, quantity = 1) => {
        const s = get();
        if (s.restaurantId && s.restaurantId !== restaurant._id && s.lines.length) return false;
        const existing = s.lines.find((l) => l.menuItemId === item.menuItemId);
        const lines = existing
          ? s.lines.map((l) => (l.menuItemId === item.menuItemId ? { ...l, ...item, quantity: Math.min(MAX_QTY, l.quantity + quantity) } : l))
          : [...s.lines, { ...item, quantity: Math.min(MAX_QTY, quantity) }];
        set({ restaurantId: restaurant._id, restaurantName: restaurant.name, lines });
        return true;
      },
      replaceWith: (restaurant, item) => set({ restaurantId: restaurant._id, restaurantName: restaurant.name, lines: [{ ...item, quantity: 1 }] }),
      setQuantity: (menuItemId, quantity) => {
        const lines = get()
          .lines.map((l) => (l.menuItemId === menuItemId ? { ...l, quantity: Math.min(MAX_QTY, quantity) } : l))
          .filter((l) => l.quantity > 0);
        set(lines.length ? { lines } : { lines, restaurantId: null, restaurantName: null });
      },
      clear: () => set({ lines: [], restaurantId: null, restaurantName: null }),
    }),
    { name: 'tn.cart', version: 1, storage: createJSONStorage(() => localStorage) },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
export const cartSubtotal = (lines: CartLine[]) => Math.round(lines.reduce((s, l) => s + l.price * l.quantity, 0) * 100) / 100;

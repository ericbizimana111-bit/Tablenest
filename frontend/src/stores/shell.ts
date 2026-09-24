import { create } from 'zustand';

interface ShellState {
  searchOpen: boolean;
  cartOpen: boolean;
  menuOpen: boolean;
  setSearch: (v: boolean) => void;
  setCart: (v: boolean) => void;
  setMenu: (v: boolean) => void;
}

/** Global overlays that any page can open (search palette, bag, mobile menu). */
export const useShell = create<ShellState>((set) => ({
  searchOpen: false,
  cartOpen: false,
  menuOpen: false,
  setSearch: (searchOpen) => set({ searchOpen }),
  setCart: (cartOpen) => set({ cartOpen }),
  setMenu: (menuOpen) => set({ menuOpen }),
}));

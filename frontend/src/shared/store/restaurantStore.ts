import { create } from 'zustand';
import type { Restaurant, MenuItem, MenuCategory } from '../types/restaurant.types';

interface RestaurantState {
    myRestaurant: Restaurant | null;
    publicRestaurants: Restaurant[];
    selectedRestaurant: Restaurant | null;
    menuCategories: MenuCategory[];
    activeCategory: string | null;
    searchQuery: string;
    filters: {
        cuisine: string;
        priceRange: string;
        city: string;
        openNow: boolean;
    };
    isLoading: boolean;

    setMyRestaurant: (restaurant: Restaurant | null) => void;
    setPublicRestaurants: (restaurants: Restaurant[]) => void;
    setSelectedRestaurant: (restaurant: Restaurant | null) => void;
    setMenuCategories: (categories: MenuCategory[]) => void;
    setActiveCategory: (categoryId: string | null) => void;
    setSearchQuery: (query: string) => void;
    setFilter: (key: keyof RestaurantState['filters'], value: any) => void;
    clearFilters: () => void;
    setLoading: (loading: boolean) => void;

    // Computed
    filteredRestaurants: () => Restaurant[];
    currentCategoryItems: () => MenuItem[];
}

const DEFAULT_FILTERS = {
    cuisine: '',
    priceRange: '',
    city: '',
    openNow: false,
};

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
    myRestaurant: null,
    publicRestaurants: [],
    selectedRestaurant: null,
    menuCategories: [],
    activeCategory: null,
    searchQuery: '',
    filters: DEFAULT_FILTERS,
    isLoading: false,

    setMyRestaurant: (restaurant) => set({ myRestaurant: restaurant }),

    setPublicRestaurants: (restaurants) => set({ publicRestaurants: restaurants }),

    setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),

    setMenuCategories: (categories) => set({ menuCategories: categories }),

    setActiveCategory: (categoryId) => set({ activeCategory: categoryId }),

    setSearchQuery: (query) => set({ searchQuery: query }),

    setFilter: (key, value) =>
        set(state => ({ filters: { ...state.filters, [key]: value } })),

    clearFilters: () => set({ filters: DEFAULT_FILTERS, searchQuery: '' }),

    setLoading: (loading) => set({ isLoading: loading }),

    filteredRestaurants: () => {
        const { publicRestaurants, searchQuery, filters } = get();
        return publicRestaurants.filter(r => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const match = r.name.toLowerCase().includes(q) ||
                    r.cuisineType.toLowerCase().includes(q) ||
                    (r.description || '').toLowerCase().includes(q);
                if (!match) return false;
            }
            if (filters.cuisine && r.cuisineType !== filters.cuisine) return false;
            if (filters.priceRange && r.priceRange !== filters.priceRange) return false;
            if (filters.city && r.city !== filters.city) return false;
            if (filters.openNow && r.status !== 'active') return false;
            return true;
        });
    },

    currentCategoryItems: () => {
        const { menuCategories, activeCategory } = get();
        if (!activeCategory) {
            return menuCategories.flatMap(c => c.items || []);
        }
        const cat = menuCategories.find(c => c._id === activeCategory);
        return cat?.items || [];
    },
}));
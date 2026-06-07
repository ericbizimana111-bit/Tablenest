export type RestaurantStatus = 'pending' | 'active' | 'suspended' | 'rejected';
export type PriceRange = '$' | '$$' | '$$$' | '$$$$';

export interface Restaurant {
    _id: string;
    name: string;
    ownerId: string;
    description?: string;
    cuisineType: string;
    logo?: string;
    images?: string[];
    address: string;
    city?: string;
    country?: string;
    phone?: string;
    email?: string;
    seatingCapacity?: number;
    priceRange?: PriceRange;
    status: RestaurantStatus;
    rating?: number;
    totalReviews?: number;
    openingHours?: Record<string, { open: string; close: string; closed: boolean }>;
    dineIn?: boolean;
    delivery?: boolean;
    commissionRate?: number;
    location?: { lat: number; lng: number };
    approvedAt?: string;
    rejectionReason?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface MenuCategory {
    _id: string;
    restaurantId: string;
    name: string;
    sortOrder?: number;
    items?: MenuItem[];
}

export interface MenuItem {
    _id: string;
    restaurantId: string;
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    isAvailable: boolean;
    isSoldOut?: boolean;
    tags?: string[];
    preparationTime?: number;
}

export interface Table {
    _id: string;
    restaurantId: string;
    tableNumber: string;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved' | 'blocked';
    currentGuestId?: string;
    seatedAt?: string;
    serverNotes?: string;
    qrCode?: string;
    isActive?: boolean;
}

export interface FloorPlan {
    tables: Table[];
    stats: {
        total: number;
        available: number;
        occupied: number;
        reserved: number;
    };
}

export interface Review {
    _id: string;
    customerId: string;
    restaurantId: string;
    orderId?: string;
    rating: number;
    comment?: string;
    images?: string[];
    ownerReply?: string;
    ownerRepliedAt?: string;
    customerName?: string;
    createdAt?: string;
}

export interface Promotion {
    _id: string;
    restaurantId: string;
    name: string;
    discountType: 'percentage' | 'flat';
    discountValue: number;
    startDate: string;
    endDate: string;
    applicableCategories?: string[];
    isActive: boolean;
    code?: string;
}

export interface InventoryItem {
    _id: string;
    restaurantId: string;
    name: string;
    unit: string;
    quantity: number;
    minQuantity: number;
    supplier?: string;
    cost?: number;
    lastRestocked?: string;
}

export interface Staff {
    _id: string;
    restaurantId: string;
    userId?: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    isActive?: boolean;
    avatar?: string;
}
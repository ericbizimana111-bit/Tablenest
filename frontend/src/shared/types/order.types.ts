export type OrderStatus =
    | 'placed'
    | 'confirmed'
    | 'preparing'
    | 'ready'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled';

export type ReservationStatus =
    | 'pending'
    | 'confirmed'
    | 'arrived'
    | 'completed'
    | 'cancelled'
    | 'no_show';

export interface OrderItem {
    menuItemId?: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

export type OrderType = 'delivery' | 'pickup' | 'dine_in';

export interface Order {
    _id: string;
    orderNumber?: string;
    customerId: string;
    customerName?: string;
    customerPhone?: string;
    restaurantId: string;
    restaurantName?: string;
    restaurantImage?: string;
    items: OrderItem[];
    subtotal: number;
    discount: number;
    promoCode?: string;
    deliveryFee: number;
    tax: number;
    tip: number;
    total: number;
    orderType: OrderType;
    paymentMethod: 'cash' | 'card';
    paymentStatus: 'pending' | 'paid' | 'refunded';
    cardLast4?: string;
    status: OrderStatus;
    deliveryAddress?: string;
    driverId?: string;
    estimatedDelivery?: string;
    notes?: string;
    tableId?: string;
    tableNumber?: string;
    reviewed?: boolean;
    statusHistory?: Array<{ status: string; time: string; note: string }>;
    createdAt?: string;
    updatedAt?: string;
}

export interface OrderQuote {
    subtotal: number;
    discount: number;
    promoCode: string | null;
    deliveryFee: number;
    tax: number;
    tip: number;
    total: number;
    taxRate: number;
    minOrder: number;
}

export interface Reservation {
    _id: string;
    customerId: string;
    customerName?: string;
    customerPhone?: string;
    restaurantId: string;
    restaurantName?: string;
    restaurantImage?: string;
    tableId: string;
    tableNumber?: string;
    date: string;
    time: string;
    guests: number;
    status: ReservationStatus;
    specialRequests?: string;
    cancelReason?: string;
    bookingRef?: string;
    qrCode?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface AvailabilitySlot {
    time: string;
    available: boolean;
}

export interface AvailabilityResponse {
    date: string;
    closed: boolean;
    guests: number;
    slots: AvailabilitySlot[];
}

export interface Payment {
    _id: string;
    userId: string;
    orderId?: string;
    reservationId?: string;
    amount: number;
    status: 'pending' | 'success' | 'failed' | 'refunded';
    method?: string;
    transactionId?: string;
    last4?: string;
    createdAt?: string;
}

export interface CartItem {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

export interface Cart {
    restaurantId: string;
    restaurantName: string;
    items: CartItem[];
    total: number;
}
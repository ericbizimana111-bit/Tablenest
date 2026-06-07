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

export interface Order {
    _id: string;
    customerId: string;
    restaurantId: string;
    restaurantName?: string;
    restaurantImage?: string;
    items: OrderItem[];
    total: number;
    status: OrderStatus;
    deliveryAddress?: string;
    driverId?: string;
    estimatedDelivery?: string;
    notes?: string;
    tableId?: string;
    statusHistory?: Array<{ status: string; time: string; note: string }>;
    createdAt?: string;
    updatedAt?: string;
}

export interface Reservation {
    _id: string;
    customerId: string;
    restaurantId: string;
    restaurantName?: string;
    tableId: string;
    tableNumber?: string;
    date: string;
    time: string;
    guests: number;
    status: ReservationStatus;
    specialRequests?: string;
    bookingRef?: string;
    qrCode?: string;
    createdAt?: string;
    updatedAt?: string;
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
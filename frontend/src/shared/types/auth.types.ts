export type UserRole = 'owner' | 'customer';

export interface User {
    _id: string;
    fullName: string;
    email: string;
    role: UserRole;
    avatar?: string;
    phone?: string;
    address?: string;
    restaurantId?: string;
    activePlan?: string;
    isActive: boolean;
    emailVerified?: boolean;
    notificationPrefs?: NotificationPrefs;
    createdAt?: string;
    updatedAt?: string;
}

export interface NotificationPrefs {
    bookingConfirmation: boolean;
    marketing: boolean;
    orderTracking: boolean;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    fullName: string;
    email: string;
    password: string;
    role?: UserRole;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
}

export interface ResetPasswordPayload {
    token: string;
    password: string;
}

export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}
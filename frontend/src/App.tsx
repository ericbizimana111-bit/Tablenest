import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './shared/contexts/AuthContext';
import ProtectedRoute from './shared/components/auth/ProtectedRoute';
import ScrollToTop from './shared/components/layout/ScrollToTop';

// Public pages
const LandingPage = lazy(() => import('./modules/public/LandingPage'));
const LoginPage = lazy(() => import('./modules/public/LoginPage'));
const RegisterPage = lazy(() => import('./modules/public/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./modules/public/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./modules/public/ResetPasswordPage'));
const NotFoundPage = lazy(() => import('./modules/public/NotFoundPage'));
const AboutUsPage = lazy(() => import('./modules/public/AboutUsPage'));
const FAQPage = lazy(() => import('./modules/public/FAQPage'));



// Customer
const CustomerLayout = lazy(() => import('./modules/customer/layout/CustomerLayout'));
const CustomerHome = lazy(() => import('./modules/customer/home/CustomerHome'));
const BrowsePage = lazy(() => import('./modules/customer/browse/BrowsePage'));
const RestaurantDetailPage = lazy(() => import('./modules/customer/restaurant/RestaurantDetailPage'));
const OrderHistoryPage = lazy(() => import('./modules/customer/orders/OrderHistoryPage'));
const OrderTrackingPage = lazy(() => import('./modules/customer/orders/OrderTrackingPage'));
const MyBookingsPage = lazy(() => import('./modules/customer/bookings/MyBookingsPage'));
const NotificationsPage = lazy(() => import('./modules/customer/notifications/NotificationsPage'));
const FavoritesPage = lazy(() => import('./modules/customer/favorites/FavoritesPage'));
const ReferralPage = lazy(() => import('./modules/customer/referrals/ReferralPage'));
const RewardsPage = lazy(() => import('./modules/customer/rewards/RewardsPage'));
const AccountSettingsPage = lazy(() => import('./modules/customer/settings/AccountSettingsPage'));
const AddressesPaymentsPage = lazy(() => import('./modules/customer/settings/AddressesPaymentsPage'));

// Owner
const OwnerLayout = lazy(() => import('./modules/owner/layout/OwnerLayout'));
const OwnerDashboard = lazy(() => import('./modules/owner/dashboard/OwnerDashboard'));
const MenuManagement = lazy(() => import('./modules/owner/menu/MenuManagement'));
const ReservationCalendar = lazy(() => import('./modules/owner/reservations/ReservationCalendar'));
const SeatManagement = lazy(() => import('./modules/owner/seats/SeatManagement'));
const KitchenDisplay = lazy(() => import('./modules/owner/kitchen/KitchenDisplay'));
const StaffManagement = lazy(() => import('./modules/owner/staff/StaffManagement'));
const InventoryManagement = lazy(() => import('./modules/owner/inventory/InventoryManagement'));
const PromotionsPage = lazy(() => import('./modules/owner/promotions/PromotionsPage'));
const QRCodeManager = lazy(() => import('./modules/owner/qrcodes/QRCodeManager'));
const OwnerAnalytics = lazy(() => import('./modules/owner/analytics/OwnerAnalytics'));
const OwnerReviews = lazy(() => import('./modules/owner/reviews/OwnerReviews'));
const OwnerSettings = lazy(() => import('./modules/owner/settings/OwnerSettings'));
const PartnerRegistration = lazy(() => import('./modules/owner/auth/PartnerRegistration'));

// Admin
const AdminLayout = lazy(() => import('./modules/admin/layout/AdminLayout'));
const AdminDashboard = lazy(() => import('./modules/admin/dashboard/AdminDashboard'));
const AdminRestaurants = lazy(() => import('./modules/admin/restaurants/AdminRestaurants'));
const AdminPendingApprovals = lazy(() => import('./modules/admin/restaurants/AdminPendingApprovals'));
const AdminUsers = lazy(() => import('./modules/admin/users/AdminUsers'));
const AdminOrders = lazy(() => import('./modules/admin/orders/AdminOrders'));
const AdminBookings = lazy(() => import('./modules/admin/bookings/AdminBookings'));
const AdminReports = lazy(() => import('./modules/admin/reports/AdminReports'));
const AdminComplaints = lazy(() => import('./modules/admin/complaints/AdminComplaints'));
const AdminSettings = lazy(() => import('./modules/admin/settings/AdminSettings'));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30000 } } });

const Loader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#FAF7F5' }}>
    <div style={{ width: 40, height: 40, border: '3px solid #FEE2E2', borderTop: '3px solid #B91C1C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Poppins, sans-serif', fontSize: '14px' } }} />
          <ScrollToTop />
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/partner/register" element={<PartnerRegistration />} />
              <Route path="/restaurants" element={<BrowsePage />} />
              <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
              <Route path="/about-us" element={<AboutUsPage/>} />
              <Route path="/faq" element={<FAQPage />} />

              <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
                <Route element={<CustomerLayout />}>
                  <Route path="/home" element={<CustomerHome />} />
                  <Route path="/browse" element={<BrowsePage />} />
                  <Route path="/my-orders" element={<OrderHistoryPage />} />
                  <Route path="/my-orders/:id/track" element={<OrderTrackingPage />} />
                  <Route path="/my-bookings" element={<MyBookingsPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/referrals" element={<ReferralPage />} />
                  <Route path="/rewards" element={<RewardsPage />} />
                  <Route path="/settings" element={<AccountSettingsPage />} />
                  <Route path="/settings/addresses" element={<AddressesPaymentsPage />} />
                </Route>
              </Route>

              <Route path="/owner" element={<ProtectedRoute allowedRoles={['owner']}><OwnerLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<OwnerDashboard />} />
                <Route path="menu" element={<MenuManagement />} />
                <Route path="reservations" element={<ReservationCalendar />} />
                <Route path="seats" element={<SeatManagement />} />
                <Route path="kitchen" element={<KitchenDisplay />} />
                <Route path="staff" element={<StaffManagement />} />
                <Route path="inventory" element={<InventoryManagement />} />
                <Route path="promotions" element={<PromotionsPage />} />
                <Route path="qrcodes" element={<QRCodeManager />} />
                <Route path="analytics" element={<OwnerAnalytics />} />
                <Route path="reviews" element={<OwnerReviews />} />
                <Route path="settings" element={<OwnerSettings />} />
              </Route>

              <Route path="/admin" element={<ProtectedRoute allowedRoles={['super_admin']}><AdminLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="restaurants" element={<AdminRestaurants />} />
                <Route path="restaurants/pending" element={<AdminPendingApprovals />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="complaints" element={<AdminComplaints />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  );
}

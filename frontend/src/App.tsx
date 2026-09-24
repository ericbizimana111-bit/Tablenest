import { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { RequireRole } from '@/auth/RequireRole';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AccountLayout } from '@/layouts/AccountLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Welcome } from '@/components/Welcome';
import { PageLoader } from '@/ui/Loader';
import { useExperience } from '@/stores/experience';

const Landing = lazy(() => import('@/pages/public/Landing'));
const Discover = lazy(() => import('@/pages/public/Discover'));
const RestaurantPage = lazy(() => import('@/pages/public/RestaurantPage'));
const Checkout = lazy(() => import('@/pages/public/Checkout'));
const Partner = lazy(() => import('@/pages/public/Partner'));
const PartnerJoin = lazy(() => import('@/pages/public/PartnerJoin'));
const About = lazy(() => import('@/pages/public/About'));
const Help = lazy(() => import('@/pages/public/Help'));
const Legal = lazy(() => import('@/pages/public/Legal'));
const NotFound = lazy(() => import('@/pages/public/NotFound'));

const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));

const Home = lazy(() => import('@/pages/account/Home'));
const Orders = lazy(() => import('@/pages/account/Orders'));
const OrderTracking = lazy(() => import('@/pages/account/OrderTracking'));
const Bookings = lazy(() => import('@/pages/account/Bookings'));
const Favorites = lazy(() => import('@/pages/account/Favorites'));
const Rewards = lazy(() => import('@/pages/account/Rewards'));
const Referrals = lazy(() => import('@/pages/account/Referrals'));
const Notifications = lazy(() => import('@/pages/account/Notifications'));
const Settings = lazy(() => import('@/pages/account/Settings'));
const Addresses = lazy(() => import('@/pages/account/Addresses'));

const OwnerOverview = lazy(() => import('@/pages/owner/Overview'));
const OwnerOrders = lazy(() => import('@/pages/owner/Orders'));
const OwnerBookings = lazy(() => import('@/pages/owner/Bookings'));
const OwnerMenu = lazy(() => import('@/pages/owner/Menu'));
const OwnerTables = lazy(() => import('@/pages/owner/Tables'));
const OwnerPromotions = lazy(() => import('@/pages/owner/Promotions'));
const OwnerReviews = lazy(() => import('@/pages/owner/Reviews'));
const OwnerAnalytics = lazy(() => import('@/pages/owner/Analytics'));
const OwnerTeam = lazy(() => import('@/pages/owner/Team'));
const OwnerInventory = lazy(() => import('@/pages/owner/Inventory'));
const OwnerQr = lazy(() => import('@/pages/owner/QrCodes'));
const OwnerBilling = lazy(() => import('@/pages/owner/Billing'));
const OwnerSettings = lazy(() => import('@/pages/owner/Settings'));
const OwnerNotifications = lazy(() => import('@/pages/owner/Notifications'));

const AdminOverview = lazy(() => import('@/pages/admin/Overview'));
const AdminRestaurants = lazy(() => import('@/pages/admin/Restaurants'));
const AdminUsers = lazy(() => import('@/pages/admin/Users'));
const AdminOrders = lazy(() => import('@/pages/admin/Orders'));
const AdminRevenue = lazy(() => import('@/pages/admin/Revenue'));
const AdminSettings = lazy(() => import('@/pages/admin/Settings'));
const AdminSupport = lazy(() => import('@/pages/admin/Support'));
const AdminAudit = lazy(() => import('@/pages/admin/Audit'));

export default function App() {
  const { pathname } = useLocation();
  const [welcomeDone, setWelcomeDone] = useState(pathname !== '/');
  const { persona, openGuide } = useExperience();

  // First visit ever: once the welcome has played, ask what brought them here.
  useEffect(() => {
    if (!welcomeDone || persona || pathname !== '/') return;
    const t = setTimeout(openGuide, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [welcomeDone]);

  return (
    <>
      {pathname === '/' && !welcomeDone && <Welcome onDone={() => setWelcomeDone(true)} />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Landing />} />
            <Route path="restaurants" element={<Discover />} />
            <Route path="browse" element={<Navigate to="/restaurants" replace />} />
            <Route path="restaurants/:id" element={<RestaurantPage />} />
            <Route
              path="checkout"
              element={
                <RequireRole roles={['customer']}>
                  <Checkout />
                </RequireRole>
              }
            />
            <Route path="partner" element={<Partner />} />
            <Route path="about" element={<About />} />
            <Route path="about-us" element={<Navigate to="/about" replace />} />
            <Route path="help" element={<Help />} />
            <Route path="faq" element={<Navigate to="/help" replace />} />
            <Route path="terms" element={<Legal kind="terms" />} />
            <Route path="privacy" element={<Legal kind="privacy" />} />

            <Route
              element={
                <RequireRole roles={['customer']}>
                  <AccountLayout />
                </RequireRole>
              }
            >
              <Route path="home" element={<Home />} />
              <Route path="my-orders" element={<Orders />} />
              <Route path="my-orders/:id/track" element={<OrderTracking />} />
              <Route path="my-bookings" element={<Bookings />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="rewards" element={<Rewards />} />
              <Route path="referrals" element={<Referrals />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
              <Route path="settings/addresses" element={<Addresses />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="partner/join" element={<PartnerJoin />} />
            <Route path="partner/register" element={<Navigate to="/partner/join" replace />} />
          </Route>

          <Route
            path="owner"
            element={
              <RequireRole roles={['owner']}>
                <DashboardLayout area="owner" />
              </RequireRole>
            }
          >
            <Route index element={<OwnerOverview />} />
            <Route path="dashboard" element={<Navigate to="/owner" replace />} />
            <Route path="orders" element={<OwnerOrders />} />
            <Route path="kitchen" element={<Navigate to="/owner/orders" replace />} />
            <Route path="reservations" element={<OwnerBookings />} />
            <Route path="menu" element={<OwnerMenu />} />
            <Route path="tables" element={<OwnerTables />} />
            <Route path="seats" element={<Navigate to="/owner/tables" replace />} />
            <Route path="promotions" element={<OwnerPromotions />} />
            <Route path="reviews" element={<OwnerReviews />} />
            <Route path="analytics" element={<OwnerAnalytics />} />
            <Route path="staff" element={<OwnerTeam />} />
            <Route path="inventory" element={<OwnerInventory />} />
            <Route path="qrcodes" element={<OwnerQr />} />
            <Route path="billing" element={<OwnerBilling />} />
            <Route path="settings" element={<OwnerSettings />} />
            <Route path="notifications" element={<OwnerNotifications />} />
          </Route>

          <Route
            path="admin"
            element={
              <RequireRole roles={['admin']}>
                <DashboardLayout area="admin" />
              </RequireRole>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="restaurants" element={<AdminRestaurants />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="revenue" element={<AdminRevenue />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="audit" element={<AdminAudit />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

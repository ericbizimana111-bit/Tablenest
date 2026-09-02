import React from 'react';
import { Outlet } from 'react-router-dom';
import { Home, Search, Calendar, ShoppingBag, Heart, Bell, Settings, Users, Award } from 'lucide-react';
import Sidebar from '../../../shared/components/layout/Sidebar';
import Topbar from '../../../shared/components/layout/Topbar';

const NAV = [
    { label: 'Home', path: '/home', icon: <Home size={18} /> },
    { label: 'My Bookings', path: '/my-bookings', icon: <Calendar size={18} /> },
    { label: 'My Orders', path: '/my-orders', icon: <ShoppingBag size={18} /> },
    { label: 'Favorites', path: '/favorites', icon: <Heart size={18} /> },
    { label: 'Notifications', path: '/notifications', icon: <Bell size={18} /> },
    { label: 'Referrals', path: '/referrals', icon: <Users size={18} /> },
    { label: 'Rewards', path: '/rewards', icon: <Award size={18} /> },
    { label: 'Settings', path: '/settings', icon: <Settings size={18} /> },
];

export default function CustomerLayout() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Poppins, sans-serif' }}>
            <Sidebar title="TableNest" subtitle="Dashboard" navItems={NAV} />
            <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Topbar placeholder="Search restaurants or dishes" notifPath="/notifications" settingsPath="/settings" />
                <main style={{ marginTop: 60, padding: '28px 32px', flex: 1 }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
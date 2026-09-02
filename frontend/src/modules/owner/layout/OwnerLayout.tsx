import React from 'react';
import { Outlet } from 'react-router-dom';
import { Home, Utensils, Calendar, Grid, Monitor, Users, Package, Tag, QrCode, BarChart2, Star, Settings } from 'lucide-react';
import Sidebar from '../../../shared/components/layout/Sidebar';
import Topbar from '../../../shared/components/layout/Topbar';

const NAV = [
    { label: 'Dashboard', path: '/owner/dashboard', icon: <Home size={18} /> },
    { label: 'Menu Management', path: '/owner/menu', icon: <Utensils size={18} /> },
    { label: 'Reservations', path: '/owner/reservations', icon: <Calendar size={18} /> },
    { label: 'Seat Management', path: '/owner/seats', icon: <Grid size={18} /> },
    { label: 'Kitchen Display', path: '/owner/kitchen', icon: <Monitor size={18} /> },
    { label: 'Staff', path: '/owner/staff', icon: <Users size={18} /> },
    { label: 'Inventory', path: '/owner/inventory', icon: <Package size={18} /> },
    { label: 'Promotions', path: '/owner/promotions', icon: <Tag size={18} /> },
    { label: 'QR Codes', path: '/owner/qrcodes', icon: <QrCode size={18} /> },
    { label: 'Analytics', path: '/owner/analytics', icon: <BarChart2 size={18} /> },
    { label: 'Reviews', path: '/owner/reviews', icon: <Star size={18} /> },
    { label: 'Settings', path: '/owner/settings', icon: <Settings size={18} /> },
];

export default function OwnerLayout() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Poppins, sans-serif' }}>
            <Sidebar title="TableNest" subtitle="Dashboard" navItems={NAV} />
            <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Topbar placeholder="Search orders, tables..." notifPath="/owner/settings" settingsPath="/owner/settings" />
                <main style={{ marginTop: 60, padding: '28px 32px', flex: 1 }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Home, Utensils, Users, ShieldCheck, ShoppingBag, Calendar, BarChart2, AlertCircle, Settings } from 'lucide-react';
import Sidebar from '../../../shared/components/layout/Sidebar';
import Topbar from '../../../shared/components/layout/Topbar';
import { useQuery } from '@tanstack/react-query';
import { restaurantsAPI } from '../../../shared/services/api';

export default function AdminLayout() {
    const { data: pending } = useQuery({
        queryKey: ['pending-count'],
        queryFn: () => restaurantsAPI.getPending().then(r => r.data?.length || 0),
        refetchInterval: 30000,
    });

    const NAV = [
        { label: 'Home', path: '/admin', icon: <Home size={18} /> },
        { label: 'Restaurant Management', path: '/admin/restaurants', icon: <Utensils size={18} /> },
        { label: 'User Management', path: '/admin/users', icon: <Users size={18} /> },
        { label: 'Pending Approvals', path: '/admin/restaurants/pending', icon: <ShieldCheck size={18} />, badge: pending },
        { label: 'Orders', path: '/admin/orders', icon: <ShoppingBag size={18} /> },
        { label: 'Bookings', path: '/admin/bookings', icon: <Calendar size={18} /> },
        { label: 'Reports', path: '/admin/reports', icon: <BarChart2 size={18} /> },
        { label: 'Complaints', path: '/admin/complaints', icon: <AlertCircle size={18} /> },
        { label: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#FAF7F5', fontFamily: 'Poppins, sans-serif' }}>
            <Sidebar title="TableNest" subtitle="Dashboard" navItems={NAV} />
            <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Topbar placeholder="Search orders, customers..." notifPath="/admin/complaints" settingsPath="/admin/settings" />
                <main style={{ marginTop: 60, padding: '28px 32px', flex: 1 }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
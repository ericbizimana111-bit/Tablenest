import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reservationsAPI } from '../../../shared/services/api';
import { Spinner, StatusBadge, Pagination, StatCard } from '../../../shared/components/ui/index';
import { Calendar, Users, CheckCircle, Clock } from 'lucide-react';

interface Reservation {
    _id: string;
    bookingRef?: string;
    restaurantName?: string;
    restaurantId?: string;
    customerName?: string;
    customerId?: string;
    date?: string;
    time?: string;
    guests?: number;
    status?: string;
}

export default function AdminBookings() {
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-bookings', page],
        queryFn: () => reservationsAPI.getAll({ page, limit: 15 }).then(r => r.data),
    });
    const { data: stats } = useQuery({
        queryKey: ['res-stats'],
        queryFn: () => reservationsAPI.getStats().then(r => r.data),
    });

    const reservations: Reservation[] = (data as { reservations?: Reservation[] } | undefined)?.reservations || DEMO_RESERVATIONS;

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>Bookings Overview</h1>
                <p style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>Monitor all platform reservations and booking activity.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
                <StatCard label="Total Bookings" value={(stats?.total || 8421).toLocaleString()} icon={<Calendar size={20} />} trend="-2.1%" />
                <StatCard label="Today" value={stats?.todayTotal || 42} icon={<Clock size={20} />} />
                <StatCard label="Confirmed" value={stats?.confirmed || 118} icon={<CheckCircle size={20} />} color="#16A34A" />
                <StatCard label="Pending" value={stats?.pending || 12} icon={<Users size={20} />} color="#D97706" />
            </div>

            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', fontWeight: 600, fontSize: 15 }}>All Reservations</div>
                {isLoading ? <Spinner /> : (
                    <table className="data-table">
                        <thead><tr>{['Booking Ref', 'Restaurant', 'Customer', 'Date', 'Time', 'Guests', 'Status'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                        <tbody>
                            {reservations.map((r) => (
                                <tr key={r._id}>
                                    <td style={{ color: '#B91C1C', fontWeight: 600, fontSize: 13 }}>{r.bookingRef || '#TN-7729'}</td>
                                    <td style={{ fontSize: 13 }}>{r.restaurantName || r.restaurantId}</td>
                                    <td style={{ fontSize: 13, color: '#6B7280' }}>{r.customerName || r.customerId}</td>
                                    <td style={{ fontSize: 13, color: '#6B7280' }}>{new Date(r.date).toLocaleDateString()}</td>
                                    <td style={{ fontSize: 13 }}>{r.time}</td>
                                    <td style={{ fontSize: 13 }}>{r.guests} pax</td>
                                    <td><StatusBadge status={r.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <div style={{ padding: '12px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#6B7280' }}>Total: {data?.total || reservations.length}</span>
                    <Pagination page={page} pages={data?.pages || 1} onPage={setPage} />
                </div>
            </div>
        </div>
    );
}

const DEMO_RESERVATIONS = [
    { _id: '1', bookingRef: 'TN-7729-1X', restaurantName: "L'Art Culinaire", customerName: 'Jane Doe', date: '2024-11-02', time: '19:30', guests: 4, status: 'confirmed' },
    { _id: '2', bookingRef: 'TN-7730-2X', restaurantName: "Lumière Brasserie", customerName: 'Mark Williams', date: '2024-11-02', time: '20:00', guests: 2, status: 'pending' },
    { _id: '3', bookingRef: 'TN-7731-3X', restaurantName: 'Bistro No. 9', customerName: 'Sarah Rogers', date: '2024-11-02', time: '18:45', guests: 3, status: 'confirmed' },
];
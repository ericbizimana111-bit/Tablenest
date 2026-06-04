import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, ShoppingBag, DollarSign, Star, Grid3X3, Clock } from 'lucide-react';
import { analyticsAPI, ordersAPI, reservationsAPI } from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';
import { StatCard, Spinner, StatusBadge } from '../../../shared/components/ui/index';

const RED = '#B91C1C';

const HEATMAP_HOURS = Array.from({ length: 12 }, (_, i) => `${10 + i}:00`);
const HEATMAP_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function OwnerDashboard() {
    const { user } = useAuthStore();
    const restaurantId = user?.restaurantId?.toString() || '';

    const { data: dashData, isLoading } = useQuery({
        queryKey: ['owner-dashboard', restaurantId],
        queryFn: () => restaurantId ? analyticsAPI.getRestaurantDashboard(restaurantId).then(r => r.data) : Promise.resolve(DEMO_DASH),
        enabled: !!restaurantId,
        initialData: DEMO_DASH,
    });

    const { data: revenueData = [] } = useQuery({
        queryKey: ['owner-revenue', restaurantId],
        queryFn: () => restaurantId ? ordersAPI.getRevenue(restaurantId, 7).then(r => r.data) : Promise.resolve([]),
    });

    const { data: todayReservations } = useQuery({
        queryKey: ['today-reservations', restaurantId],
        queryFn: () => restaurantId ? reservationsAPI.getByRestaurant(restaurantId, { limit: 5 }).then(r => r.data) : Promise.resolve({ reservations: DEMO_RES }),
        initialData: { reservations: DEMO_RES },
    });

    const chartData = DAYS_LABELS.map((d, i) => ({
        day: d,
        revenue: revenueData[i]?.revenue || DEMO_REVENUE[i],
    }));

    const heatmapData = Array.from({ length: 7 }, (_, d) =>
        Array.from({ length: 12 }, (_, h) => Math.floor(Math.random() * 10))
    );

    if (isLoading) return <Spinner />;

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700 }}>Overview</h1>
                <p style={{ fontSize: 13, color: '#6B7280' }}>Welcome back. Here's what's happening today.</p>
            </div>

            {/* KPI Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 22 }}>
                <StatCard label="Today's Reservations" value={dashData?.todayReservations ?? 42} icon={<Calendar size={18} />} trend="+12% vs yesterday" trendUp />
                <StatCard label="Pending Orders" value={dashData?.pendingOrders ?? 8} icon={<ShoppingBag size={18} />} sub="Awaiting kitchen" color="#D97706" />
                <StatCard label="Revenue (MTD)" value={`$${((dashData?.monthRevenue || 12450)).toLocaleString()}`} icon={<DollarSign size={18} />} trend="+on track" trendUp />
                <StatCard label="Rating" value={`${dashData?.rating || 4.8}`} icon={<Star size={18} />} sub={`${dashData?.totalReviews || 1200} reviews`} color="#D97706" />
                <StatCard label="Active Tables" value={`${dashData?.activeTables || 18} / 24`} icon={<Grid3X3 size={18} />} />
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, marginBottom: 18 }}>
                {/* Revenue Bar Chart */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>Revenue Trend</div>
                        <select style={{ padding: '5px 10px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 12, fontFamily: 'Poppins', outline: 'none' }}>
                            <option>Last 7 Days</option><option>Last 30 Days</option>
                        </select>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={chartData} barSize={22}>
                            <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip formatter={(v: any) => [`$${v.toLocaleString()}`, 'Revenue']} contentStyle={{ fontFamily: 'Poppins', fontSize: 12, borderRadius: 8 }} />
                            <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                                {chartData.map((_, i) => (
                                    <Cell key={i} fill={i === 5 ? RED : `${RED}55`} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Reservations Heatmap */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>Reservations Heatmap</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {['Daily', 'Weekly'].map((t, i) => (
                                <span key={t} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: i === 0 ? RED : 'transparent', color: i === 0 ? 'white' : '#6B7280', fontWeight: i === 0 ? 600 : 400 }}>{t}</span>
                            ))}
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(12, 1fr)`, gap: 3 }}>
                            {heatmapData.flat().map((v, i) => (
                                <div key={i} style={{ width: '100%', paddingBottom: '100%', borderRadius: 3, background: v === 0 ? '#F3F4F6' : `rgba(185,28,28,${v / 10})` }} />
                            ))}
                        </div>
                    </div>
                    <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 10 }}>Peak hours detected between 19:00 - 21:00</p>
                </div>
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
                {/* Today's Reservations */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>Today's Reservations</div>
                        <span style={{ color: RED, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>View All</span>
                    </div>
                    <table className="data-table">
                        <thead><tr>{['Customer', 'Time', 'Guests', 'Status', 'Action'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                        <tbody>
                            {(todayReservations?.reservations || DEMO_RES).slice(0, 4).map((r: any, i: number) => (
                                <tr key={r._id || i}>
                                    <td style={{ fontWeight: 500, fontSize: 13 }}>{r.customerName || r.name}</td>
                                    <td style={{ fontSize: 13 }}>{r.time}</td>
                                    <td style={{ fontSize: 13 }}>{r.guests} Pax</td>
                                    <td><StatusBadge status={r.status} /></td>
                                    <td>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 18 }}>⋯</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Kitchen Queue */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', fontWeight: 600, fontSize: 15 }}>Kitchen Queue</div>
                    {KITCHEN_QUEUE.map(q => (
                        <div key={q.id} style={{ padding: '12px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 500, fontSize: 13 }}>Order #{q.id}</div>
                                <div style={{ fontSize: 12, color: '#9CA3AF' }}>Table {q.table} • {q.items} Items</div>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: RED }}>{q.time}</span>
                        </div>
                    ))}
                    <div style={{ padding: '12px 20px' }}>
                        <button style={{ width: '100%', padding: '9px', background: '#D97706', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>
                            View Full Kitchen Display
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const DAYS_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DEMO_REVENUE = [8200, 12400, 10800, 15600, 13200, 21800, 17400];
const DEMO_DASH = { todayReservations: 42, pendingOrders: 8, monthRevenue: 12450, rating: 4.8, totalReviews: 1200, activeTables: 18 };
const DEMO_RES = [
    { _id: '1', name: 'David Chen', customerName: 'David Chen', time: '18:30', guests: 4, status: 'confirmed' },
    { _id: '2', name: 'Sarah Jenkins', customerName: 'Sarah Jenkins', time: '19:00', guests: 2, status: 'arrived' },
    { _id: '3', name: 'Robert Miller', customerName: 'Robert Miller', time: '20:15', guests: 6, status: 'pending' },
];
const KITCHEN_QUEUE = [
    { id: '4229', table: 14, items: 3, time: '12m ago' },
    { id: '4230', table: '02', items: 5, time: '8m ago' },
    { id: '4231', table: 21, items: 2, time: 'Just now' },
];
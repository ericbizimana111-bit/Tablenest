import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, ShoppingBag, DollarSign, Star, Grid3X3, MoreHorizontal } from 'lucide-react';
import { analyticsAPI, ordersAPI, reservationsAPI } from '../../../shared/services/api';
import { useAuthStore } from '../../../shared/store/authStore';
import { StatCard, Spinner, StatusBadge } from '../../../shared/components/ui/index';

const ORANGE = '#F97316';
interface DashboardReservation {
    _id?: string;
    customerName?: string;
    name?: string;
    time?: string;
    guests?: number;
    status?: string;
}

export default function OwnerDashboard() {
    const { user } = useAuthStore();
    const restaurantId = user?.restaurantId?.toString() || '';

    const { data: dashData, isLoading } = useQuery({
        queryKey: ['owner-dashboard', restaurantId],
        queryFn: () => restaurantId ? analyticsAPI.getRestaurantDashboard(restaurantId).then(r => r.data) : Promise.resolve(null),
        enabled: !!restaurantId,
    });

    const { data: revenueData = [] } = useQuery({
        queryKey: ['owner-revenue', restaurantId],
        queryFn: () => restaurantId ? ordersAPI.getRevenue(restaurantId, 7).then(r => r.data) : Promise.resolve([]),
    });

    const { data: todayReservations } = useQuery({
        queryKey: ['today-reservations', restaurantId],
        queryFn: () => restaurantId ? reservationsAPI.getByRestaurant(restaurantId, { limit: 5 }).then(r => r.data) : Promise.resolve({ reservations: [] }),
    });

    const chartData = DAYS_LABELS.map((d, i) => ({
        day: d,
        revenue: revenueData[i]?.revenue || 0,
    }));

    const { data: heatmapData = [] } = useQuery({
        queryKey: ['owner-heatmap', restaurantId],
        queryFn: () => restaurantId ? analyticsAPI.getHeatmap(restaurantId).then(r => r.data) : Promise.resolve([]),
        enabled: !!restaurantId,
    });

    const { data: kitchenOrders = [] } = useQuery({
        queryKey: ['kitchen-queue', restaurantId],
        queryFn: () => restaurantId ? ordersAPI.getByRestaurant(restaurantId, { status: 'preparing', limit: 4 }).then(r => r.data?.orders || r.data) : Promise.resolve([]),
        enabled: !!restaurantId,
    });

    if (isLoading) return <Spinner />;

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700 }}>Overview</h1>
                <p style={{ fontSize: 13, color: '#475569' }}>Welcome back. Here's what's happening today.</p>
            </div>

            {/* KPI Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 22 }}>
                <StatCard label="Today's Reservations" value={dashData?.todayReservations || 0} icon={<Calendar size={18} />} trend="+12% vs yesterday" trendUp />
                <StatCard label="Pending Orders" value={dashData?.pendingOrders || 0} icon={<ShoppingBag size={18} />} sub="Awaiting kitchen" color="#F59E0B" />
                <StatCard label="Revenue (MTD)" value={`$${((dashData?.monthRevenue || 0)).toLocaleString()}`} icon={<DollarSign size={18} />} trend="+on track" trendUp />
                <StatCard label="Rating" value={`${dashData?.rating || 0}`} icon={<Star size={18} />} sub={`${dashData?.totalReviews || 0} reviews`} color="#F59E0B" />
                <StatCard label="Active Tables" value={`${dashData?.activeTables || 0} / 24`} icon={<Grid3X3 size={18} />} />
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, marginBottom: 18 }}>
                {/* Revenue Bar Chart */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>Revenue Trend</div>
                        <select style={{ padding: '5px 10px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 12, fontFamily: 'Poppins', outline: 'none' }}>
                            <option>Last 7 Days</option><option>Last 30 Days</option>
                        </select>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={chartData} barSize={22}>
                            <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip formatter={(v: number) => [`$${Number(v).toLocaleString()}`, 'Revenue']} contentStyle={{ fontFamily: 'Poppins', fontSize: 12, borderRadius: 8 }} />
                            <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                                {chartData.map((_, i) => (
                                    <Cell key={i} fill={i === 5 ? ORANGE : `${ORANGE}55`} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Reservations Heatmap */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>Reservations Heatmap</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {['Daily', 'Weekly'].map((t, i) => (
                                <span key={t} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: i === 0 ? ORANGE : 'transparent', color: i === 0 ? 'white' : '#475569', fontWeight: i === 0 ? 600 : 400 }}>{t}</span>
                            ))}
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(12, 1fr)`, gap: 3 }}>
                            {heatmapData.map((v, i) => (
                                <div key={i} style={{ width: '100%', paddingBottom: '100%', borderRadius: 3, background: v === 0 ? '#F1F5F9' : `rgba(249,115,22,${v / 10})` }} />
                            ))}
                        </div>
                    </div>
                    <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 10 }}>Peak hours detected between 19:00 - 21:00</p>
                </div>
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
                {/* Today's Reservations */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>Today's Reservations</div>
                        <span style={{ color: ORANGE, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>View All</span>
                    </div>
                    <table className="data-table">
                        <thead><tr>{['Customer', 'Time', 'Guests', 'Status', 'Action'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                        <tbody>
                            {(todayReservations?.reservations || []).slice(0, 4).map((r: DashboardReservation, i: number) => (
                                <tr key={r._id || i}>
                                    <td style={{ fontWeight: 500, fontSize: 13 }}>{r.customerName || r.name}</td>
                                    <td style={{ fontSize: 13 }}>{r.time}</td>
                                    <td style={{ fontSize: 13 }}>{r.guests} Pax</td>
                                    <td><StatusBadge status={r.status} /></td>
                                    <td>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4 }} title="More options"><MoreHorizontal size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Kitchen Queue */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', fontWeight: 600, fontSize: 15 }}>Kitchen Queue</div>
                    {(Array.isArray(kitchenOrders) ? kitchenOrders : []).slice(0, 4).map((q: any) => (
                        <div key={q._id || q.id} style={{ padding: '12px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 500, fontSize: 13 }}>Order #{(q._id || '').slice(-5)}</div>
                                <div style={{ fontSize: 12, color: '#94A3B8' }}>{q.items?.length || 0} Items</div>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: ORANGE }}>{q.status}</span>
                        </div>
                    ))}
                    {(!kitchenOrders || (Array.isArray(kitchenOrders) && kitchenOrders.length === 0)) && (
                        <div style={{ padding: '16px 20px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>No pending kitchen orders</div>
                    )}
                    <div style={{ padding: '12px 20px' }}>
                        <button style={{ width: '100%', padding: '9px', background: '#F59E0B', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>
                            View Full Kitchen Display
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const DAYS_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

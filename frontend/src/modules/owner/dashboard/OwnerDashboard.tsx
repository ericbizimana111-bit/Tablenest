import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, ShoppingBag, DollarSign, Star, Grid3X3, Store, Flame } from 'lucide-react';
import { analyticsAPI, restaurantsAPI } from '../../../shared/services/api';
import { useAuthStore } from '../../../shared/store/authStore';
import { StatCard, Spinner, StatusBadge } from '../../../shared/components/ui/index';

const ORANGE = '#f9691a';

export default function OwnerDashboard() {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const { data: myRestaurant, isLoading: loadingRestaurant, error: restaurantError } = useQuery({
        queryKey: ['my-restaurant'],
        queryFn: () => restaurantsAPI.getMyRestaurant().then((r) => r.data),
        retry: false,
    });

    const restaurantId = user?.restaurantId?.toString() || myRestaurant?._id?.toString() || '';
    const hasRestaurant = Boolean(restaurantId);

    const { data: dash, isLoading: loadingDash } = useQuery({
        queryKey: ['owner-dashboard', restaurantId],
        queryFn: () => analyticsAPI.getRestaurantDashboard(restaurantId).then((r) => r.data),
        enabled: hasRestaurant,
    });

    if (loadingRestaurant) return <Spinner />;

    if (!hasRestaurant) {
        const message = restaurantError ? "We couldn't load your restaurant. Please try refreshing." : "You haven't registered a restaurant yet.";
        return (
            <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div className="card" style={{ padding: 40, textAlign: 'center', maxWidth: 480 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--color-brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Store size={28} color="var(--color-brand-600)" />
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No restaurant yet</h2>
                    <p style={{ fontSize: 14, color: 'var(--color-ink-mute)', marginBottom: 20, lineHeight: 1.5 }}>{message}</p>
                    {!restaurantError && <button onClick={() => navigate('/partner/register')} className="btn btn-primary">Register your restaurant</button>}
                </div>
            </div>
        );
    }
    if (loadingDash || !dash) return <Spinner />;

    return (
        <div className="animate-fade-up">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700 }}>Overview</h1>
                <p style={{ fontSize: 13, color: 'var(--color-ink-mute)' }}>Welcome back. Here's what's happening at {dash.restaurantName} today.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 22 }} className="dash-kpi-grid">
                <StatCard label="Today's bookings" value={dash.todayReservations} icon={<Calendar size={18} />} sub={dash.pendingReservations ? `${dash.pendingReservations} awaiting confirmation` : 'All confirmed'} />
                <StatCard label="Pending orders" value={dash.pendingOrders} icon={<ShoppingBag size={18} />} sub="Awaiting kitchen" color="#F59E0B" />
                <StatCard label="Revenue (MTD)" value={`$${dash.monthRevenue.toLocaleString()}`} icon={<DollarSign size={18} />} sub={`$${dash.todayRevenue.toLocaleString()} today`} />
                <StatCard label="Rating" value={dash.rating || '—'} icon={<Star size={18} />} sub={`${dash.totalReviews} reviews`} color="#F59E0B" />
                <StatCard label="Active tables" value={`${dash.activeTables} / ${dash.totalTables}`} icon={<Grid3X3 size={18} />} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, marginBottom: 18 }} className="dash-2col">
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Revenue trend (7 days)</div>
                    <ResponsiveContainer width="100%" height={190}>
                        <BarChart data={dash.revenueChart} barSize={26}>
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip formatter={(v: number) => [`$${Number(v).toLocaleString()}`, 'Revenue']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                            <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                                {dash.revenueChart.map((_: unknown, i: number) => <Cell key={i} fill={i === dash.revenueChart.length - 1 ? ORANGE : `${ORANGE}55`} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card" style={{ padding: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}><Flame size={15} color={ORANGE} /> Top sellers</div>
                    {dash.topItems.length ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {dash.topItems.map((it: { name: string; sold: number; revenue: number; image?: string }) => (
                                <div key={it.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    {it.image ? <img src={it.image} alt="" style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover' }} /> : <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--color-sand)' }} />}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.name}</div>
                                        <div style={{ fontSize: 11.5, color: 'var(--color-ink-mute)' }}>{it.sold} sold</div>
                                    </div>
                                    <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-brand-600)' }}>${it.revenue.toFixed(0)}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--color-ink-mute)', fontSize: 13 }}>No orders yet.</div>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }} className="dash-2col">
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--color-line)' }}>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>Upcoming reservations</div>
                        <button onClick={() => navigate('/owner/reservations')} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-brand-600)' }}>View all</button>
                    </div>
                    {dash.upcomingReservations.length === 0 ? (
                        <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-ink-mute)', fontSize: 13 }}>No upcoming reservations.</div>
                    ) : (
                        <div className="data-table-wrapper">
                            <table className="table-clean">
                                <thead><tr><th>Customer</th><th>Time</th><th>Guests</th><th>Status</th></tr></thead>
                                <tbody>
                                    {dash.upcomingReservations.map((r: any) => (
                                        <tr key={r._id}>
                                            <td style={{ fontWeight: 600 }}>{r.customerName || 'Guest'}</td>
                                            <td>{r.time}</td>
                                            <td>{r.guests}</td>
                                            <td><StatusBadge status={r.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-line)', fontWeight: 700, fontSize: 15 }}>Recent orders</div>
                    {dash.recentOrders.length === 0 ? (
                        <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-ink-mute)', fontSize: 13 }}>No orders yet.</div>
                    ) : (
                        dash.recentOrders.map((o: any) => (
                            <div key={o._id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--color-sand)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{o.orderNumber}</div>
                                    <div style={{ fontSize: 12, color: 'var(--color-ink-mute)' }}>{o.items?.length || 0} items · ${o.total?.toFixed(2)}</div>
                                </div>
                                <StatusBadge status={o.status} />
                            </div>
                        ))
                    )}
                    <div style={{ padding: 14 }}>
                        <button onClick={() => navigate('/owner/kitchen')} className="btn btn-dark" style={{ width: '100%' }}>Open kitchen display</button>
                    </div>
                </div>
            </div>
            <style>{`@media (max-width: 1100px) { .dash-kpi-grid { grid-template-columns: repeat(2,1fr) !important; } } @media (max-width: 900px) { .dash-2col { grid-template-columns: 1fr !important; } }`}</style>
        </div>
    );
}

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StatCard, Spinner, EmptyState } from '../../../shared/components/ui/index';
import { DollarSign, ShoppingBag, Star, Users, BarChart2, Repeat } from 'lucide-react';
import { analyticsAPI, restaurantsAPI } from '../../../shared/services/api';
import { useAuthStore } from '../../../shared/store/authStore';

const ORANGE = '#f9691a';
const PIE_COLORS = ['#f9691a', '#1d5fd1', '#6a3fd1'];

interface Overview {
    revenue: number; orders: number; averageOrder: number; customers: number; repeatRate: number;
    daily: Array<{ label: string; revenue: number; orders: number }>;
    bookingsDaily: Array<{ label: string; bookings: number; guests: number }>;
    orderTypes: Array<{ type: string; orders: number; revenue: number }>;
    topItems: Array<{ name: string; sold: number; revenue: number }>;
}

export default function OwnerAnalytics() {
    const { user } = useAuthStore();
    const [period, setPeriod] = useState('30');
    const [apiRestaurantId, setApiRestaurantId] = useState('');
    const restaurantId = user?.restaurantId?.toString() || apiRestaurantId;

    useEffect(() => {
        if (!user?.restaurantId) {
            restaurantsAPI.getMyRestaurant().then((r) => r.data?._id && setApiRestaurantId(r.data._id)).catch(() => undefined);
        }
    }, [user]);

    const { data: dashData, isLoading } = useQuery({
        queryKey: ['owner-dashboard', restaurantId],
        queryFn: () => analyticsAPI.getRestaurantDashboard(restaurantId).then((r) => r.data),
        enabled: !!restaurantId,
    });

    const { data: overview } = useQuery<Overview>({
        queryKey: ['owner-overview', restaurantId, period],
        queryFn: () => analyticsAPI.getOverview(restaurantId, Number(period)).then((r) => r.data),
        enabled: !!restaurantId,
    });

    if (!restaurantId && !isLoading) {
        return <EmptyState icon={<BarChart2 size={40} />} title="No restaurant linked" message="Register your restaurant to see analytics." />;
    }
    if (isLoading || !overview) return <Spinner />;

    const orderTypeData = overview.orderTypes.map((t) => ({ name: t.type.replace('_', ' '), value: t.orders }));

    return (
        <div className="animate-fade-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700 }}>Analytics</h1>
                    <p style={{ fontSize: 13, color: 'var(--color-ink-mute)' }}>Real performance data for your restaurant.</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {[['7', 'Week'], ['30', 'Month'], ['90', 'Quarter']].map(([v, l]) => (
                        <button key={v} onClick={() => setPeriod(v)} className="chip" data-active={period === v}>{l}</button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
                <StatCard label="Revenue" value={`$${overview.revenue.toLocaleString()}`} icon={<DollarSign size={18} />} sub={`Avg order $${overview.averageOrder.toFixed(2)}`} />
                <StatCard label="Orders" value={overview.orders.toLocaleString()} icon={<ShoppingBag size={18} />} />
                <StatCard label="Rating" value={dashData?.rating?.toFixed(1) || '—'} icon={<Star size={18} />} color="#F59E0B" sub={`${dashData?.totalReviews || 0} reviews`} />
                <StatCard label="Customers" value={overview.customers.toLocaleString()} icon={<Users size={18} />} color="#6a3fd1" sub={`${overview.repeatRate}% repeat`} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }} className="analytics-2col">
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Revenue over time</div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={overview.daily}>
                            <defs>
                                <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={ORANGE} stopOpacity={0.3} />
                                    <stop offset="100%" stopColor={ORANGE} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} interval={Math.ceil(overview.daily.length / 10)} />
                            <YAxis hide />
                            <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Revenue']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                            <Area type="monotone" dataKey="revenue" stroke={ORANGE} strokeWidth={2.5} fill="url(#revG)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="card" style={{ padding: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Bookings over time</div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={overview.bookingsDaily} barSize={Math.max(4, 200 / overview.bookingsDaily.length)}>
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} interval={Math.ceil(overview.bookingsDaily.length / 10)} />
                            <YAxis hide />
                            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                            <Bar dataKey="bookings" fill={ORANGE} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18 }} className="analytics-2col">
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Top selling dishes</div>
                    {overview.topItems.length > 0 ? (
                        <table className="table-clean">
                            <thead><tr><th>Item</th><th>Sold</th><th>Revenue</th></tr></thead>
                            <tbody>
                                {overview.topItems.map((item) => (
                                    <tr key={item.name}>
                                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                                        <td>{item.sold}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--color-brand-600)' }}>${item.revenue.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--color-ink-mute)', fontSize: 13 }}>No orders in this period yet.</div>
                    )}
                </div>

                <div className="card" style={{ padding: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}><Repeat size={15} /> Orders by type</div>
                    {orderTypeData.length ? (
                        <>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={orderTypeData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                                        {orderTypeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                                {orderTypeData.map((t, i) => (
                                    <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, textTransform: 'capitalize' }}>
                                        <div style={{ width: 9, height: 9, borderRadius: 3, background: PIE_COLORS[i % PIE_COLORS.length] }} /> {t.name} ({t.value})
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--color-ink-mute)', fontSize: 13 }}>No data yet.</div>
                    )}
                </div>
            </div>
            <style>{`@media (max-width: 900px) { .analytics-2col { grid-template-columns: 1fr !important; } }`}</style>
        </div>
    );
}

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Utensils, Users, Calendar, ShoppingBag, Clock, DollarSign, Pencil, Trash2 } from 'lucide-react';
import { analyticsAPI, restaurantsAPI } from '../../../shared/services/api';
import { StatCard, Spinner, StatusBadge } from '../../../shared/components/ui/index';
import type { Restaurant } from '../../../shared/types/restaurant.types';
import { useNavigate } from 'react-router-dom';

interface SignupData {
    count: number;
}

interface BookingData {
    _id: string;
    count: number;
}

interface CuisineData {
    _id: string;
    count: number;
}

interface ChartEntry {
    day: string;
    count: number;
}

interface CuisineChartEntry extends ChartEntry {
    name: string;
    value: number;
    color: string;
}

const RED = '#B91C1C';
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const COLORS = [RED, '#92400E', '#D97706', '#F9A8D4', '#FBBF24'];

export default function AdminDashboard() {
    const navigate = useNavigate();

    const { data: overview, isLoading } = useQuery({
        queryKey: ['admin-overview'],
        queryFn: () => analyticsAPI.getPlatformOverview().then(r => r.data),
    });

    const { data: signups = [] } = useQuery({
        queryKey: ['signups-chart'],
        queryFn: () => analyticsAPI.getSignups(7).then(r => r.data),
    });

    const { data: bookingsByDay = [] } = useQuery({
        queryKey: ['bookings-chart'],
        queryFn: () => analyticsAPI.getBookingsByDay(7).then(r => r.data),
    });

    const { data: cuisines = [] } = useQuery({
        queryKey: ['cuisine-dist'],
        queryFn: () => analyticsAPI.getCuisineDistribution().then(r => r.data),
    });

    const { data: restaurantsData } = useQuery({
        queryKey: ['admin-restaurants'],
        queryFn: () => restaurantsAPI.getAll({ limit: 5 }).then(r => r.data),
    });

    const days = WEEK_DAYS;

    const signupChart = useMemo<ChartEntry[]>(() => {
        
        return days.map((d, i) => ({ day: d, count: (signups[i] as SignupData | undefined)?.count || 0 }));
    }, [signups, days]);

    const bookingChart = useMemo<ChartEntry[]>(() =>
        (bookingsByDay as BookingData[]).map((b) => ({ day: b._id?.slice(5) || '', count: b.count })),
        [bookingsByDay]
    );

    const cuisineChart = useMemo<CuisineChartEntry[]>(() =>
        (cuisines as CuisineData[]).map((c, i) => ({ name: c._id, day: c._id, value: c.count, count: c.count, color: COLORS[i % COLORS.length] })),
        [cuisines]
    );

    const total = useMemo(() => cuisineChart.reduce((s: number, c: CuisineChartEntry) => s + c.value, 0), [cuisineChart]);
    const topCuisine = cuisineChart[0];

    if (isLoading) return <Spinner />;

    return (
        <div className="fade-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>Overview</h1>
                    <p style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>Welcome back, Super Admin. Here's what's happening today.</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input placeholder="Global search..." style={{ padding: '8px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'Poppins', width: 220 }} />
                </div>
            </div>

            {/* KPI Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 14, marginBottom: 24 }}>
                <StatCard label="Restaurants" value={(overview?.restaurants || 0).toLocaleString()} icon={<Utensils size={20} />} trend="+4.5%" trendUp />
                <StatCard label="Users" value={(overview?.users || 0).toLocaleString()} icon={<Users size={20} />} trend="+12%" trendUp />
                <StatCard label="Bookings" value={(overview?.bookings || 0).toLocaleString()} icon={<Calendar size={20} />} trend="-2.1%" trendUp={false} />
                <StatCard label="Orders" value={(overview?.orders || 0).toLocaleString()} icon={<ShoppingBag size={20} />} trend="+8.3%" trendUp />
                <StatCard label="Pending" value={overview?.pending || 0} icon={<Clock size={20} />} sub="Action Needed" color="#D97706" />
                <StatCard label="Revenue" value={`$${((overview?.revenue || 0) / 1000000).toFixed(1)}M`} icon={<DollarSign size={20} />} trend="+18.5%" trendUp />
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
                {/* Signups Bar Chart */}
                <div style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #E5E7EB' }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>New User Signups</div>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={signupChart} barSize={20}>
                            <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip contentStyle={{ fontFamily: 'Poppins', fontSize: 12, borderRadius: 8 }} />
                            <Bar dataKey="count" fill={RED} radius={[4, 4, 0, 0]}>
                                {signupChart.map((_, i) => (
                                    <Cell key={i} fill={i === signupChart.length - 2 ? RED : `${RED}70`} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Bookings Area Chart */}
                <div style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #E5E7EB' }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Bookings by Day</div>
                    {bookingChart.length > 0 && (
                        <div style={{ fontSize: 13, color: RED, fontWeight: 600, marginBottom: 10 }}>
                            Peak Day {bookingChart.reduce((a, b) => a.count > b.count ? a : b)?.day || 'Sat'}, 8 PM
                        </div>
                    )}
                    <ResponsiveContainer width="100%" height={160}>
                        <AreaChart data={bookingChart.length ? bookingChart : days.map((d, i) => ({ day: d, count: [30, 45, 38, 55, 42, 80, 65][i] }))}>
                            <defs>
                                <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={RED} stopOpacity={0.25} />
                                    <stop offset="100%" stopColor={RED} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip contentStyle={{ fontFamily: 'Poppins', fontSize: 12, borderRadius: 8 }} />
                            <Area type="monotone" dataKey="count" stroke={RED} strokeWidth={2.5} fill="url(#bookingGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Cuisine Donut */}
                <div style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #E5E7EB' }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Cuisine Distribution</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ position: 'relative' }}>
                            <ResponsiveContainer width={120} height={120}>
                                <PieChart>
                                    <Pie data={cuisineChart.length ? cuisineChart : [{ name: 'Italian', value: 62 }, { name: 'French', value: 18 }, { name: 'Japanese', value: 12 }, { name: 'Fusion', value: 8 }]}
                                        cx="50%" cy="50%" innerRadius={38} outerRadius={55} dataKey="value" stroke="none">
                                        {(cuisineChart.length ? cuisineChart : []).map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{topCuisine ? Math.round((topCuisine.value / total) * 100) : 62}%</div>
                                <div style={{ fontSize: 10, color: '#9CA3AF' }}>{topCuisine?.name || 'Italian'}</div>
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            {(cuisineChart.length ? cuisineChart : []).slice(0, 4).map((c) => (
                                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: 2, background: c.color || COLORS[0] }} />
                                    <span style={{ fontSize: 12, color: '#374151' }}>{c.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Restaurant Management Table */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>Restaurant Management</div>
                    <button onClick={() => navigate('/admin/restaurants')}
                        style={{ background: RED, color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins', display: 'flex', alignItems: 'center', gap: 6 }}>
                        + Add Restaurant
                    </button>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            {['ID', 'Name', 'Owner', 'City', 'Cuisine', 'Status', 'Date Added', 'Actions'].map((h: string) => (
                                <th key={h}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {(restaurantsData?.restaurants || []).map((r: Restaurant, i: number) => (
                            <tr key={r._id}>
                                <td style={{ color: RED, fontWeight: 600, fontSize: 13 }}>#TR-{1024 + i}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: RED }}>
                                            {r.name?.[0]}
                                        </div>
                                        <span style={{ fontWeight: 500 }}>{r.name}</span>
                                    </div>
                                </td>
                                <td style={{ color: '#6B7280' }}>{r.ownerId}</td>
                                <td style={{ color: '#6B7280' }}>{r.city}</td>
                                <td style={{ color: '#6B7280' }}>{r.cuisineType}</td>
                                <td><StatusBadge status={r.status} /></td>
                                <td style={{ color: '#6B7280', fontSize: 13 }}>{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}><Pencil size={15} /></button>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 4 }}><Trash2 size={15} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Plus, Printer, Clock, Users, Armchair, MoreHorizontal } from 'lucide-react';
import { reservationsAPI } from '../../../shared/services/api';
import { useAuthStore } from '../../../shared/store/authStore';
import { StatusBadge } from '../../../shared/components/ui/index';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday } from 'date-fns';
import toast from 'react-hot-toast';

type ReservationEntry = {
    _id: string;
    customerName?: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    time: string;
    guests: number;
    tableNumber?: string;
};

export default function ReservationCalendar() {
    const { user } = useAuthStore();
    const qc = useQueryClient();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [view, setView] = useState<'month' | 'week' | 'day'>('month');

    const restaurantId = user?.restaurantId?.toString() || 'demo';

    const { data: calData = {} } = useQuery({
        queryKey: ['calendar', restaurantId, format(currentDate, 'M'), format(currentDate, 'yyyy')],
        queryFn: () => reservationsAPI.getCalendarData(restaurantId, currentDate.getMonth() + 1, currentDate.getFullYear()).then(r => r.data),
        enabled: !!restaurantId,
    });

    const { data: dayRes } = useQuery({
        queryKey: ['day-reservations', restaurantId, format(selectedDate, 'yyyy-MM-dd')],
        queryFn: () => reservationsAPI.getByRestaurant(restaurantId, { date: format(selectedDate, 'yyyy-MM-dd') }).then(r => r.data),
        initialData: { reservations: DEMO_RES },
    });

    const confirmMut = useMutation({
        mutationFn: (id: string) => reservationsAPI.confirm(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['day-reservations'] }); toast.success('Reservation confirmed'); },
    });

    const cancelMut = useMutation({
        mutationFn: (id: string) => reservationsAPI.cancel(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['day-reservations'] }); toast.success('Reservation cancelled'); },
    });

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startPad = getDay(monthStart);

    const todayStats = { confirmed: 118, pending: 12, cancelled: 4, noShow: 8 };

    return (
        <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
            <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ display: 'flex', gap: 0, border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
                            {(['month', 'week', 'day'] as const).map(v => (
                                <button key={v} onClick={() => setView(v)}
                                    style={{ padding: '7px 16px', border: 'none', background: view === v ? '#B91C1C' : 'white', color: view === v ? 'white' : '#374151', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins', textTransform: 'capitalize' }}>
                                    {v}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button onClick={() => setCurrentDate(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; })} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
                            <span style={{ fontWeight: 600, fontSize: 15 }}>{format(currentDate, 'MMMM yyyy')}</span>
                            <button onClick={() => setCurrentDate(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; })} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}><ChevronRight size={16} /></button>
                        </div>
                    </div>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
                        <Plus size={14} /> Add Manual Booking
                    </button>
                </div>

                {/* Calendar grid */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '1px solid #E5E7EB' }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#6B7280' }}>{d}</div>
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
                        {Array(startPad).fill(null).map((_, i) => <div key={`pad-${i}`} style={{ minHeight: 80, borderRight: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6' }} />)}
                        {days.map(day => {
                            const key = format(day, 'yyyy-MM-dd');
                            const data = calData[key] || DEMO_CAL[format(day, 'd')];
                            const isSel = isSameDay(day, selectedDate);
                            const today = isToday(day);
                            return (
                                <div key={key} onClick={() => setSelectedDate(day)}
                                    style={{ minHeight: 80, borderRight: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6', padding: 8, cursor: 'pointer', background: isSel ? '#FFF7F7' : 'white' }}>
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: today ? '#B91C1C' : 'transparent', color: today ? 'white' : '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: today ? 700 : 400, marginBottom: 4 }}>
                                        {format(day, 'd')}
                                    </div>
                                    {data?.confirmed > 0 && <div style={{ fontSize: 10, background: '#DCFCE7', color: '#16A34A', padding: '1px 5px', borderRadius: 4, marginBottom: 2 }}>{data.confirmed} Confirmed</div>}
                                    {data?.pending > 0 && <div style={{ fontSize: 10, background: '#FEF9C3', color: '#D97706', padding: '1px 5px', borderRadius: 4 }}>{data.pending} Pending</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Summary bar */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: '14px 20px', marginTop: 14, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', letterSpacing: '0.05em' }}>TODAY'S SUMMARY:</span>
                    {[
                        { label: `${todayStats.confirmed} Confirmed`, color: '#16A34A', bg: '#DCFCE7' },
                        { label: `${todayStats.pending} Pending`, color: '#D97706', bg: '#FEF9C3' },
                        { label: `${todayStats.cancelled} Cancelled`, color: '#DC2626', bg: '#FEE2E2' },
                        { label: `${todayStats.noShow} No-Shows`, color: '#6B7280', bg: '#F3F4F6' },
                    ].map(s => (
                        <span key={s.label} style={{ padding: '5px 12px', borderRadius: 9999, background: s.bg, color: s.color, fontSize: 13, fontWeight: 500 }}>{s.label}</span>
                    ))}
                </div>
            </div>

            {/* Right panel */}
            <div>
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 12 }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #E5E7EB' }}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{format(selectedDate, 'MMMM d, yyyy')}</div>
                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>{(dayRes?.reservations || DEMO_RES).length} Total Reservations</div>
                    </div>
                    {(dayRes?.reservations || DEMO_RES).map((r: ReservationEntry) => (
                        <div key={r._id} style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6', borderLeft: `3px solid ${r.status === 'confirmed' ? '#16A34A' : r.status === 'pending' ? '#D97706' : '#E5E7EB'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#374151' }}>{(r.customerName || 'U')[0]}</div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{r.customerName || 'Guest'}</div>
                                        <StatusBadge status={r.status} />
                                    </div>
                                </div>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4 }} title="More options"><MoreHorizontal size={16} /></button>
                            </div>
                            <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', gap: 12, alignItems: 'center' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {r.time}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={12} /> {r.guests} Guests</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Armchair size={12} /> {r.tableNumber || 'Table #12'}</span>
                            </div>
                            {r.status === 'pending' && (
                                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                    <button onClick={() => confirmMut.mutate(r._id)} style={{ flex: 1, padding: '7px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>Confirm</button>
                                    <button onClick={() => cancelMut.mutate(r._id)} style={{ flex: 1, padding: '7px', background: 'white', color: '#DC2626', border: '1px solid #DC2626', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'Poppins' }}>Decline</button>
                                </div>
                            )}
                            {r.status === 'confirmed' && (
                                <button style={{ width: '100%', marginTop: 8, padding: '6px', background: 'white', color: '#374151', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins' }}>Details</button>
                            )}
                        </div>
                    ))}
                </div>
                <button style={{ width: '100%', padding: '11px', background: '#1F1F1F', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Printer size={14} /> Print Daily Run-Sheet
                </button>
            </div>
        </div>
    );
}

const DEMO_RES = [
    { _id: '1', customerName: 'Jane Doe', status: 'confirmed', time: '19:30', guests: 4, tableNumber: 'Table #12' },
    { _id: '2', customerName: 'Mark Williams', status: 'pending', time: '20:00', guests: 2, tableNumber: 'Table #7' },
    { _id: '3', customerName: 'Sarah Rogers', status: 'confirmed', time: '18:45', guests: 3, tableNumber: 'Booth 4' },
];
const DEMO_CAL: Record<string, { confirmed?: number; pending?: number }> = { '1': { confirmed: 12, pending: 3 }, '2': { confirmed: 18, pending: 5 }, '3': { confirmed: 24 }, '5': { confirmed: 8 }, '6': { pending: 2 }, '8': { confirmed: 14 } };

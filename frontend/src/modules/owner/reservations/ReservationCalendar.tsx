import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Printer, Clock, Users, Armchair, Phone } from 'lucide-react';
import { reservationsAPI, restaurantsAPI } from '../../../shared/services/api';
import { useAuthStore } from '../../../shared/store/authStore';
import { StatusBadge } from '../../../shared/components/ui/index';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday } from 'date-fns';
import toast from 'react-hot-toast';

type ReservationEntry = {
    _id: string;
    customerName?: string;
    customerPhone?: string;
    status: 'pending' | 'confirmed' | 'arrived' | 'completed' | 'cancelled' | 'no_show';
    time: string;
    guests: number;
    tableNumber?: string;
    specialRequests?: string;
};

export default function ReservationCalendar() {
    const { user } = useAuthStore();
    const qc = useQueryClient();
    const [apiRestaurantId, setApiRestaurantId] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        if (!user?.restaurantId) {
            restaurantsAPI.getMyRestaurant().then((r) => r.data?._id && setApiRestaurantId(r.data._id)).catch(() => undefined);
        }
    }, [user]);
    const restaurantId = user?.restaurantId?.toString() || apiRestaurantId;

    const { data: calData = {} } = useQuery({
        queryKey: ['calendar', restaurantId, currentDate.getMonth() + 1, currentDate.getFullYear()],
        queryFn: () => reservationsAPI.getCalendarData(currentDate.getMonth() + 1, currentDate.getFullYear()).then((r) => r.data),
        enabled: !!restaurantId,
    });

    const { data: dayRes } = useQuery({
        queryKey: ['day-reservations', restaurantId, format(selectedDate, 'yyyy-MM-dd')],
        queryFn: () => reservationsAPI.getByRestaurant(restaurantId, { date: format(selectedDate, 'yyyy-MM-dd') }).then((r) => r.data),
        enabled: Boolean(restaurantId),
    });

    const invalidate = () => { qc.invalidateQueries({ queryKey: ['day-reservations'] }); qc.invalidateQueries({ queryKey: ['calendar'] }); };
    const confirmMut = useMutation({ mutationFn: (id: string) => reservationsAPI.confirm(id), onSuccess: () => { invalidate(); toast.success('Reservation confirmed'); } });
    const cancelMut = useMutation({ mutationFn: (id: string) => reservationsAPI.cancel(id), onSuccess: () => { invalidate(); toast.success('Reservation declined'); } });
    const statusMut = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => reservationsAPI.setStatus(id, status),
        onSuccess: () => { invalidate(); toast.success('Status updated'); },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Could not update status'),
    });

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startPad = getDay(monthStart);

    const todayKey = format(new Date(), 'yyyy-MM-dd');
    const todayCal = calData[todayKey] || {};
    const todayStats = { confirmed: todayCal.confirmed || 0, pending: todayCal.pending || 0, cancelled: todayCal.cancelled || 0, noShow: todayCal.noShow || 0 };

    return (
        <div className="animate-fade-up cal-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={() => setCurrentDate((d) => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; })} className="btn-icon" style={{ border: '1.5px solid var(--color-line)', background: '#fff' }}><ChevronLeft size={16} /></button>
                        <span style={{ fontWeight: 700, fontSize: 16, minWidth: 150, textAlign: 'center' }}>{format(currentDate, 'MMMM yyyy')}</span>
                        <button onClick={() => setCurrentDate((d) => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; })} className="btn-icon" style={{ border: '1.5px solid var(--color-line)', background: '#fff' }}><ChevronRight size={16} /></button>
                    </div>
                    <button onClick={() => setCurrentDate(new Date())} className="btn btn-outline btn-sm">Today</button>
                </div>

                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '1px solid var(--color-line)' }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                            <div key={d} style={{ padding: '10px 8px', textAlign: 'center', fontSize: 12.5, fontWeight: 700, color: 'var(--color-ink-soft)' }}>{d}</div>
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
                        {Array(startPad).fill(null).map((_, i) => <div key={`pad-${i}`} style={{ minHeight: 76, borderRight: '1px solid var(--color-sand)', borderBottom: '1px solid var(--color-sand)' }} />)}
                        {days.map((day) => {
                            const key = format(day, 'yyyy-MM-dd');
                            const data = calData[key] || {};
                            const isSel = isSameDay(day, selectedDate);
                            const today = isToday(day);
                            return (
                                <div key={key} onClick={() => setSelectedDate(day)} style={{ minHeight: 76, borderRight: '1px solid var(--color-sand)', borderBottom: '1px solid var(--color-sand)', padding: 7, cursor: 'pointer', background: isSel ? 'var(--color-brand-50)' : '#fff' }}>
                                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: today ? 'var(--color-brand-500)' : 'transparent', color: today ? 'white' : 'var(--color-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: today ? 700 : 500, marginBottom: 4 }}>
                                        {format(day, 'd')}
                                    </div>
                                    {data?.confirmed > 0 && <div style={{ fontSize: 10, background: '#e6f7ec', color: '#17803d', padding: '1px 5px', borderRadius: 4, marginBottom: 2, fontWeight: 600 }}>{data.confirmed} confirmed</div>}
                                    {data?.pending > 0 && <div style={{ fontSize: 10, background: '#fff3d6', color: '#a15c07', padding: '1px 5px', borderRadius: 4, fontWeight: 600 }}>{data.pending} pending</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="card" style={{ padding: '14px 20px', marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--color-ink-mute)', letterSpacing: '0.05em' }}>TODAY:</span>
                    <span className="badge badge-green">{todayStats.confirmed} confirmed</span>
                    <span className="badge badge-amber">{todayStats.pending} pending</span>
                    <span className="badge badge-red">{todayStats.cancelled} cancelled</span>
                    <span className="badge badge-gray">{todayStats.noShow} no-shows</span>
                </div>
            </div>

            <div>
                <div className="card" style={{ overflow: 'hidden', marginBottom: 12 }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-line)' }}>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{format(selectedDate, 'MMMM d, yyyy')}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-ink-mute)' }}>{(dayRes?.reservations || []).length} reservations</div>
                    </div>
                    <div style={{ maxHeight: 560, overflowY: 'auto' }}>
                        {(dayRes?.reservations || []).length === 0 && (
                            <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-ink-mute)', fontSize: 13 }}>No bookings on this day.</div>
                        )}
                        {(dayRes?.reservations || []).map((r: ReservationEntry) => (
                            <div key={r._id} style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-sand)', borderLeft: `3px solid ${r.status === 'confirmed' || r.status === 'arrived' ? '#17803d' : r.status === 'pending' ? '#a15c07' : 'var(--color-line)'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>{(r.customerName || 'U')[0]}</div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 13 }}>{r.customerName || 'Guest'}</div>
                                            <StatusBadge status={r.status} />
                                        </div>
                                    </div>
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--color-ink-soft)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: r.specialRequests ? 6 : 0 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {r.time}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={12} /> {r.guests} guests</span>
                                    {r.tableNumber && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Armchair size={12} /> Table {r.tableNumber}</span>}
                                    {r.customerPhone && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} /> {r.customerPhone}</span>}
                                </div>
                                {r.specialRequests && <div style={{ fontSize: 12, color: 'var(--color-ink-mute)', fontStyle: 'italic' }}>"{r.specialRequests}"</div>}

                                {r.status === 'pending' && (
                                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                        <button onClick={() => confirmMut.mutate(r._id)} className="btn btn-primary btn-sm" style={{ flex: 1 }}>Confirm</button>
                                        <button onClick={() => cancelMut.mutate(r._id)} className="btn btn-danger btn-sm" style={{ flex: 1 }}>Decline</button>
                                    </div>
                                )}
                                {r.status === 'confirmed' && (
                                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                        <button onClick={() => statusMut.mutate({ id: r._id, status: 'arrived' })} className="btn btn-primary btn-sm" style={{ flex: 1 }}>Mark arrived</button>
                                        <button onClick={() => statusMut.mutate({ id: r._id, status: 'no_show' })} className="btn btn-outline btn-sm" style={{ flex: 1 }}>No-show</button>
                                    </div>
                                )}
                                {r.status === 'arrived' && (
                                    <button onClick={() => statusMut.mutate({ id: r._id, status: 'completed' })} className="btn btn-dark btn-sm" style={{ width: '100%', marginTop: 10 }}>Mark completed</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <button onClick={() => window.print()} className="btn btn-dark" style={{ width: '100%' }}>
                    <Printer size={14} /> Print daily run-sheet
                </button>
            </div>
            <style>{`@media (max-width: 900px) { .cal-layout { grid-template-columns: 1fr !important; } }`}</style>
        </div>
    );
}

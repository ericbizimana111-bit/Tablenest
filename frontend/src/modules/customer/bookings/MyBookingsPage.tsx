import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, Users, XCircle, Pencil } from 'lucide-react';
import { reservationsAPI } from '../../../shared/services/api';
import { StatusBadge, Spinner, Modal } from '../../../shared/components/ui/index';
import type { Reservation } from '../../../shared/types/order.types';
import toast from 'react-hot-toast';

const TABS = ['Upcoming', 'Past', 'Cancelled'];

function ModifyContent({ booking, onSave, onCancel, saving }: { booking: ModifyModalState; onSave: (date: string, time: string, guests: number) => void; onCancel: () => void; saving: boolean }) {
    const [date, setDate] = useState(booking.date?.slice(0, 10) || '');
    const [time, setTime] = useState(booking.time || '19:00');
    const [guests, setGuests] = useState(booking.guests || 2);
    return (
        <div>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Update your booking details for <strong>{booking.restaurantName || 'Restaurant'}</strong>.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                </div>
                <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Time</label>
                    <input type="time" value={time} onChange={e => setTime(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                </div>
                <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Guests</label>
                    <input type="number" value={guests} min={1} max={12} onChange={e => setGuests(Number(e.target.value))}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={onCancel} style={{ flex: 1, padding: '10px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins' }}>Cancel</button>
                <button onClick={() => onSave(date, time, guests)} disabled={saving}
                    style={{ flex: 1, padding: '10px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}

interface ModifyModalState extends Reservation {
    newDate?: string;
    newTime?: string;
    newGuests?: number;
}

export default function MyBookingsPage() {
    const qc = useQueryClient();
    const [tab, setTab] = useState('Upcoming');
    const [modifyModal, setModifyModal] = useState<ModifyModalState | null>(null);

    const { data = [], isLoading } = useQuery<Reservation[]>({
        queryKey: ['my-reservations'],
        queryFn: () => reservationsAPI.getMyReservations().then(r => r.data),
    });

    const cancelMut = useMutation({
        mutationFn: (id: string) => reservationsAPI.cancel(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-reservations'] }); toast.success('Reservation cancelled'); },
    });

    const updateMut = useMutation({
        mutationFn: (data: { id: string; date: string; time: string; guests: number }) =>
            import('../../../shared/services/api').then(mod => mod.default.patch(`/reservations/${data.id}`, { date: data.date, time: data.time, guests: data.guests })),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-reservations'] }); toast.success('Booking updated!'); setModifyModal(null); },
        onError: () => toast.error('Failed to update booking'),
    });

    const reservations: Reservation[] = Array.isArray(data) ? data : (data as { reservations?: Reservation[] }).reservations || [];
    const upcoming = reservations.filter((r) => ['pending', 'confirmed', 'arrived'].includes(r.status));
    const past = reservations.filter((r) => r.status === 'completed');
    const cancelled = reservations.filter((r) => r.status === 'cancelled');

    const tabData: Record<string, Reservation[]> = {
        Upcoming: upcoming,
        Past: past,
        Cancelled: cancelled,
    };
    const list = tabData[tab] || [];

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>My Bookings</h1>
                <p style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>Manage your table reservations and dining experiences.</p>
            </div>

            <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #E5E7EB', marginBottom: 24 }}>
                {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        style={{ padding: '10px 24px', border: 'none', background: 'transparent', fontFamily: 'Poppins', fontSize: 14, fontWeight: tab === t ? 600 : 400, color: tab === t ? '#B91C1C' : '#6B7280', borderBottom: tab === t ? '2px solid #B91C1C' : '2px solid transparent', marginBottom: -2, cursor: 'pointer' }}>
                        {t}
                    </button>
                ))}
            </div>

            {isLoading ? <Spinner /> : list.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Calendar size={48} style={{ margin: '0 auto 16px', color: '#D1D5DB' }} />
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>No {tab.toLowerCase()} bookings</div>
                    <div style={{ fontSize: 14, color: '#9CA3AF' }}>Browse restaurants to make a reservation.</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {list.map((r: Reservation) => (
                        <div key={r._id} style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                            <div style={{ display: 'flex' }}>
                                <img
                                    src={`https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=120&q=80`}
                                    alt=""
                                    style={{ width: 110, height: 110, objectFit: 'cover', flexShrink: 0 }}
                                />
                                <div style={{ flex: 1, padding: '16px 18px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{r.restaurantName || "L'Art Culinaire"}</div>
                                            <div style={{ fontSize: 12, color: '#9CA3AF' }}>{r.bookingRef}</div>
                                        </div>
                                        <StatusBadge status={r.status} />
                                    </div>
                                    <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#6B7280', marginBottom: 12 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Calendar size={13} color="#B91C1C" />
                                            {new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Clock size={13} color="#B91C1C" />{r.time}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Users size={13} color="#B91C1C" />{r.guests} Guests
                                        </span>
                                    </div>
                                    {(r.status === 'confirmed' || r.status === 'pending') && (
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button onClick={() => setModifyModal(r)}
                                                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500 }}>
                                                <Pencil size={12} /> Modify Booking
                                            </button>
                                            <button onClick={() => cancelMut.mutate(r._id)}
                                                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', border: '1.5px solid #DC2626', borderRadius: 8, background: 'white', color: '#DC2626', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500 }}>
                                                <XCircle size={12} /> Cancel
                                            </button>
                                        </div>
                                    )}
                            {r.status === 'completed' && (
                                <button onClick={() => toast.success('Review feature coming soon')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500 }}>
                                    Write Review
                                </button>
                            )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={!!modifyModal} onClose={() => setModifyModal(null)} title="Modify Booking" width={460}>
                {modifyModal && (
                    <ModifyContent
                        booking={modifyModal}
                        onSave={(date, time, guests) => updateMut.mutate({ id: modifyModal._id, date, time, guests })}
                        onCancel={() => setModifyModal(null)}
                        saving={updateMut.isPending}
                    />
                )}
            </Modal>
        </div>
    );
}


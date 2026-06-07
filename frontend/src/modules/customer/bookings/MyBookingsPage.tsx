import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, Users, XCircle, Pencil } from 'lucide-react';
import { reservationsAPI } from '../../../shared/services/api';
import { StatusBadge, Spinner, Modal } from '../../../shared/components/ui/index';
import toast from 'react-hot-toast';

const TABS = ['Upcoming', 'Past', 'Cancelled'];

export default function MyBookingsPage() {
    const qc = useQueryClient();
    const [tab, setTab] = useState('Upcoming');
    const [modifyModal, setModifyModal] = useState<any>(null);

    const { data = [], isLoading } = useQuery({
        queryKey: ['my-reservations'],
        queryFn: () => reservationsAPI.getMyReservations().then(r => r.data),
        initialData: DEMO_RESERVATIONS,
    });

    const cancelMut = useMutation({
        mutationFn: (id: string) => reservationsAPI.cancel(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-reservations'] }); toast.success('Reservation cancelled'); },
    });

    const reservations = Array.isArray(data) ? data : data;
    const upcoming = reservations.filter((r: any) => ['pending', 'confirmed', 'arrived'].includes(r.status));
    const past = reservations.filter((r: any) => r.status === 'completed');
    const cancelled = reservations.filter((r: any) => r.status === 'cancelled');

    const tabData: Record<string, any[]> = { Upcoming: upcoming.length ? upcoming : DEMO_RESERVATIONS.filter(r => r.status === 'confirmed' || r.status === 'pending'), Past: past.length ? past : DEMO_RESERVATIONS.filter(r => r.status === 'completed'), Cancelled: cancelled };
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
                    {list.map((r: any) => (
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
                                        <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500 }}>
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
                    <div>
                        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Update your booking details for <strong>{modifyModal.restaurantName || "L'Art Culinaire"}</strong>.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Date</label>
                                <input type="date" defaultValue={modifyModal.date?.slice(0, 10)}
                                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Time</label>
                                <input type="time" defaultValue={modifyModal.time}
                                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Guests</label>
                                <input type="number" defaultValue={modifyModal.guests} min={1} max={12}
                                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'Poppins', outline: 'none' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                            <button onClick={() => setModifyModal(null)} style={{ flex: 1, padding: '10px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins' }}>Cancel</button>
                            <button onClick={() => { setModifyModal(null); toast.success('Booking updated!'); }}
                                style={{ flex: 1, padding: '10px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

const DEMO_RESERVATIONS = [
    { _id: '1', restaurantName: "L'Art Culinaire", bookingRef: 'TN-7729-1X', date: '2024-11-15', time: '19:30', guests: 4, status: 'confirmed' },
    { _id: '2', restaurantName: "Lumière Brasserie", bookingRef: 'TN-7730-2X', date: '2024-11-20', time: '20:00', guests: 2, status: 'pending' },
    { _id: '3', restaurantName: 'Bistro No. 9', bookingRef: 'TN-7728-3X', date: '2024-10-28', time: '19:00', guests: 3, status: 'completed' },
];
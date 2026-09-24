import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, Users, XCircle, Pencil, Star, UtensilsCrossed } from 'lucide-react';
import { reservationsAPI } from '../../../shared/services/api';
import { StatusBadge, Spinner, Modal } from '../../../shared/components/ui/index';
import ReviewModal from '../../../shared/components/order/ReviewModal';
import type { Reservation } from '../../../shared/types/order.types';
import toast from 'react-hot-toast';

const TABS = ['Upcoming', 'Past', 'Cancelled'];

export default function MyBookingsPage() {
    const qc = useQueryClient();
    const [tab, setTab] = useState('Upcoming');
    const [modifyBooking, setModifyBooking] = useState<Reservation | null>(null);
    const [reviewBooking, setReviewBooking] = useState<Reservation | null>(null);

    const { data = [], isLoading } = useQuery<Reservation[]>({
        queryKey: ['my-reservations'],
        queryFn: () => reservationsAPI.getMyReservations().then((r) => r.data),
    });

    const cancelMut = useMutation({
        mutationFn: (id: string) => reservationsAPI.cancel(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-reservations'] }); toast.success('Reservation cancelled'); },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Could not cancel'),
    });

    const updateMut = useMutation({
        mutationFn: (d: { id: string; date: string; time: string; guests: number }) => reservationsAPI.update(d.id, { date: d.date, time: d.time, guests: d.guests }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-reservations'] }); toast.success('Booking updated — awaiting reconfirmation'); setModifyBooking(null); },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update booking'),
    });

    const reservations: Reservation[] = Array.isArray(data) ? data : [];
    const isFuture = (r: Reservation) => new Date(`${r.date?.slice(0, 10)}T${r.time || '00:00'}`) > new Date();
    const upcoming = reservations.filter((r) => ['pending', 'confirmed', 'arrived'].includes(r.status) && isFuture(r));
    const past = reservations.filter((r) => r.status !== 'cancelled' && !upcoming.includes(r));
    const cancelled = reservations.filter((r) => r.status === 'cancelled' || r.status === 'no_show');
    const list = { Upcoming: upcoming, Past: past, Cancelled: cancelled }[tab] || [];

    return (
        <div className="animate-fade-up">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>My bookings</h1>
                <p style={{ fontSize: 14, color: 'var(--color-ink-mute)', marginTop: 2 }}>Manage your table reservations and dining plans.</p>
            </div>

            <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--color-line)', marginBottom: 24 }}>
                {TABS.map((t) => (
                    <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 22px', border: 'none', background: 'transparent', fontSize: 14, fontWeight: tab === t ? 700 : 500, color: tab === t ? 'var(--color-brand-600)' : 'var(--color-ink-soft)', borderBottom: tab === t ? '2.5px solid var(--color-brand-500)' : '2.5px solid transparent', marginBottom: -2, cursor: 'pointer' }}>
                        {t} {t === 'Upcoming' && upcoming.length > 0 && <span style={{ opacity: 0.6 }}>({upcoming.length})</span>}
                    </button>
                ))}
            </div>

            {isLoading ? <Spinner /> : list.length === 0 ? (
                <div className="card animate-fade-up" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Calendar size={44} style={{ margin: '0 auto 16px', color: '#c9bdaf' }} />
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No {tab.toLowerCase()} bookings</div>
                    <div style={{ fontSize: 14, color: 'var(--color-ink-mute)' }}>Browse restaurants to make a reservation.</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {list.map((r) => (
                        <div key={r._id} className="card card-hover" style={{ overflow: 'hidden' }}>
                            <div style={{ display: 'flex' }}>
                                {r.restaurantImage ? (
                                    <img src={r.restaurantImage} alt="" style={{ width: 110, height: 110, objectFit: 'cover', flexShrink: 0 }} />
                                ) : (
                                    <div style={{ width: 110, height: 110, flexShrink: 0, background: 'var(--color-sand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UtensilsCrossed size={28} color="#c9bdaf" /></div>
                                )}
                                <div style={{ flex: 1, padding: '16px 18px', minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{r.restaurantName}</div>
                                            <div style={{ fontSize: 12, color: 'var(--color-ink-mute)' }}>{r.bookingRef}</div>
                                        </div>
                                        <StatusBadge status={r.status} />
                                    </div>
                                    <div style={{ display: 'flex', gap: 18, fontSize: 13, color: 'var(--color-ink-soft)', marginBottom: 12, flexWrap: 'wrap' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={13} color="var(--color-brand-500)" /> {new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={13} color="var(--color-brand-500)" /> {r.time}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={13} color="var(--color-brand-500)" /> {r.guests} guests</span>
                                    </div>
                                    {(r.status === 'confirmed' || r.status === 'pending') && (
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button onClick={() => setModifyBooking(r)} className="btn btn-outline btn-sm"><Pencil size={12} /> Modify</button>
                                            <button onClick={() => cancelMut.mutate(r._id)} className="btn btn-danger btn-sm"><XCircle size={12} /> Cancel</button>
                                        </div>
                                    )}
                                    {r.status === 'completed' && (
                                        <button onClick={() => setReviewBooking(r)} className="btn btn-outline btn-sm"><Star size={12} /> Write a review</button>
                                    )}
                                    {r.status === 'cancelled' && r.cancelReason && (
                                        <div style={{ fontSize: 12, color: 'var(--color-ink-mute)', fontStyle: 'italic' }}>{r.cancelReason}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={!!modifyBooking} onClose={() => setModifyBooking(null)} title="Modify booking" width={440}>
                {modifyBooking && (
                    <ModifyContent booking={modifyBooking} saving={updateMut.isPending} onCancel={() => setModifyBooking(null)}
                        onSave={(date, time, guests) => updateMut.mutate({ id: modifyBooking._id, date, time, guests })} />
                )}
            </Modal>

            {reviewBooking && (
                <ReviewModal
                    isOpen={!!reviewBooking}
                    restaurantName={reviewBooking.restaurantName || ''}
                    reservationId={reviewBooking._id}
                    onClose={() => setReviewBooking(null)}
                    onSubmitted={() => { qc.invalidateQueries({ queryKey: ['my-reservations'] }); setReviewBooking(null); }}
                />
            )}
        </div>
    );
}

function ModifyContent({ booking, onSave, onCancel, saving }: { booking: Reservation; onSave: (date: string, time: string, guests: number) => void; onCancel: () => void; saving: boolean }) {
    const [date, setDate] = useState(booking.date?.slice(0, 10) || '');
    const [time, setTime] = useState(booking.time || '19:00');
    const [guests, setGuests] = useState(booking.guests || 2);
    return (
        <div>
            <p style={{ fontSize: 13, color: 'var(--color-ink-mute)', marginBottom: 16 }}>Update your booking at <strong>{booking.restaurantName}</strong>. It will need to be reconfirmed by the restaurant.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div><label className="label">Date</label><input type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} className="input" /></div>
                <div><label className="label">Time</label><input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="input" /></div>
                <div><label className="label">Guests</label><input type="number" value={guests} min={1} max={20} onChange={(e) => setGuests(Number(e.target.value))} className="input" /></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={onCancel} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                <button onClick={() => onSave(date, time, guests)} disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>{saving ? 'Saving…' : 'Save changes'}</button>
            </div>
        </div>
    );
}


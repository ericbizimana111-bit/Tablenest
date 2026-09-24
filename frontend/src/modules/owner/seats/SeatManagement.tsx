import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tablesAPI, restaurantsAPI } from '../../../shared/services/api';
import { useAuthStore } from '../../../shared/store/authStore';
import { Modal, Spinner } from '../../../shared/components/ui/index';
import { X, Armchair, CheckCircle, Users, Bookmark, Plus, Trash2, Ban, DoorOpen } from 'lucide-react';
import type { Table, FloorPlan } from '../../../shared/types/restaurant.types';
import toast from 'react-hot-toast';

type Status = 'available' | 'occupied' | 'reserved' | 'blocked';
const STATUS_COLORS: Record<Status, string> = { available: '#17803d', occupied: '#c0271b', reserved: '#a15c07', blocked: '#857a70' };
const STATUS_BG: Record<Status, string> = { available: '#e6f7ec', occupied: '#ffe9e7', reserved: '#fff3d6', blocked: '#f6eee4' };

export default function SeatManagement() {
    const { user } = useAuthStore();
    const qc = useQueryClient();
    const [apiRestaurantId, setApiRestaurantId] = useState('');
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ tableNumber: '', capacity: 2 });
    const [guestName, setGuestName] = useState('');

    useEffect(() => {
        if (!user?.restaurantId) restaurantsAPI.getMyRestaurant().then((r) => r.data?._id && setApiRestaurantId(r.data._id)).catch(() => undefined);
    }, [user]);
    const restaurantId = user?.restaurantId?.toString() || apiRestaurantId;

    const { data, isLoading } = useQuery<FloorPlan>({
        queryKey: ['floor-plan', restaurantId],
        queryFn: () => tablesAPI.getFloorPlan(restaurantId).then((r) => r.data),
        enabled: !!restaurantId,
        refetchInterval: 20000,
    });
    const tables = data?.tables || [];
    const stats = data?.stats || { total: 0, available: 0, occupied: 0, reserved: 0 };

    const invalidate = () => qc.invalidateQueries({ queryKey: ['floor-plan'] });
    const createMut = useMutation({
        mutationFn: () => tablesAPI.create(form),
        onSuccess: () => { invalidate(); setShowAdd(false); setForm({ tableNumber: '', capacity: 2 }); toast.success('Table added'); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Could not add table'),
    });
    const deleteMut = useMutation({ mutationFn: (id: string) => tablesAPI.delete(id), onSuccess: () => { invalidate(); setSelectedTable(null); toast.success('Table removed'); } });
    const statusMut = useMutation({
        mutationFn: (d: { id: string; status: Status; guestId?: string }) => tablesAPI.updateStatus(d.id, { status: d.status, serverNotes: guestName || undefined }),
        onSuccess: (res) => { invalidate(); setSelectedTable(res.data); setGuestName(''); toast.success('Table updated'); },
    });

    if (isLoading) return <Spinner />;

    return (
        <div className="animate-fade-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700 }}>Seat management</h1>
                    <p style={{ fontSize: 13, color: 'var(--color-ink-mute)' }}>Real-time floor plan and table status.</p>
                </div>
                <button onClick={() => setShowAdd(true)} className="btn btn-primary btn-sm"><Plus size={14} /> Add table</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
                {[
                    { label: 'Total tables', value: stats.total, icon: <Armchair size={20} />, color: '#4a4038' },
                    { label: 'Available', value: stats.available, icon: <CheckCircle size={20} />, color: '#17803d' },
                    { label: 'Occupied', value: stats.occupied, icon: <Users size={20} />, color: '#c0271b' },
                    { label: 'Reserved', value: stats.reserved, icon: <Bookmark size={20} />, color: '#a15c07' },
                ].map((s) => (
                    <div key={s.label} className="card" style={{ padding: 16 }}>
                        <div style={{ color: s.color, marginBottom: 6 }}>{s.icon}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-ink-mute)', marginBottom: 2 }}>{s.label}</div>
                        <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 18 }} className="seats-layout">
                <div className="card" style={{ padding: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Floor plan</div>
                    <div style={{ fontSize: 12, color: 'var(--color-ink-mute)', marginBottom: 16 }}>Tap a table to manage it</div>
                    <div style={{ display: 'flex', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
                        {(Object.entries(STATUS_COLORS) as [Status, string][]).map(([s, c]) => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--color-ink-soft)' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: c }} /> {s[0].toUpperCase() + s.slice(1)}
                            </div>
                        ))}
                    </div>
                    {tables.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-ink-mute)' }}>No tables yet — add your first one.</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: 14 }}>
                            {tables.map((t) => (
                                <div key={t._id} onClick={() => setSelectedTable(t)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', padding: 6, borderRadius: 10, border: selectedTable?._id === t._id ? '2px solid var(--color-brand-500)' : '2px solid transparent', background: selectedTable?._id === t._id ? 'var(--color-brand-50)' : 'transparent' }}>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ width: 50, height: 50, borderRadius: '50%', background: STATUS_COLORS[t.status], display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-soft)' }}>
                                            <Armchair size={18} color="white" />
                                        </div>
                                        <div style={{ position: 'absolute', top: -6, right: -4, background: 'var(--color-ink)', color: 'white', borderRadius: 9999, fontSize: 9, fontWeight: 700, padding: '1px 5px' }}>{t.capacity}p</div>
                                    </div>
                                    <span style={{ fontSize: 11.5, fontWeight: 600, marginTop: 6, color: 'var(--color-ink-soft)' }}>T-{t.tableNumber}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {selectedTable ? (
                    <div className="card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div style={{ fontWeight: 700, fontSize: 15 }}>Table details</div>
                            <button onClick={() => setSelectedTable(null)} className="btn-icon" style={{ color: 'var(--color-ink-mute)' }}><X size={18} /></button>
                        </div>
                        <div style={{ background: STATUS_BG[selectedTable.status], borderRadius: 12, padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: STATUS_COLORS[selectedTable.status], color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{selectedTable.tableNumber}</div>
                            <div>
                                <div style={{ fontWeight: 700 }}>Table T-{selectedTable.tableNumber}</div>
                                <div style={{ fontSize: 12, color: STATUS_COLORS[selectedTable.status], textTransform: 'capitalize', fontWeight: 600 }}>{selectedTable.status} · seats {selectedTable.capacity}</div>
                            </div>
                        </div>
                        {selectedTable.status === 'occupied' && selectedTable.serverNotes && (
                            <div style={{ marginBottom: 14 }}>
                                <div style={{ fontSize: 11, color: 'var(--color-ink-mute)', marginBottom: 4 }}>Guest / notes</div>
                                <div style={{ background: 'var(--color-sand)', padding: 10, borderRadius: 8, fontSize: 12.5, fontStyle: 'italic' }}>"{selectedTable.serverNotes}"</div>
                            </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {selectedTable.status === 'available' && (
                                <>
                                    <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Guest name (optional)" className="input" style={{ marginBottom: 4 }} />
                                    <button onClick={() => statusMut.mutate({ id: selectedTable._id, status: 'occupied' })} className="btn btn-primary"><Users size={14} /> Seat guests</button>
                                    <button onClick={() => statusMut.mutate({ id: selectedTable._id, status: 'reserved' })} className="btn btn-outline"><Bookmark size={14} /> Mark reserved</button>
                                    <button onClick={() => statusMut.mutate({ id: selectedTable._id, status: 'blocked' })} className="btn btn-outline"><Ban size={14} /> Block table</button>
                                </>
                            )}
                            {(selectedTable.status === 'occupied' || selectedTable.status === 'reserved') && (
                                <button onClick={() => statusMut.mutate({ id: selectedTable._id, status: 'available' })} className="btn btn-primary"><DoorOpen size={14} /> Release table</button>
                            )}
                            {selectedTable.status === 'blocked' && (
                                <button onClick={() => statusMut.mutate({ id: selectedTable._id, status: 'available' })} className="btn btn-primary"><DoorOpen size={14} /> Unblock</button>
                            )}
                            <button onClick={() => { if (confirm('Delete this table?')) deleteMut.mutate(selectedTable._id); }} className="btn btn-danger"><Trash2 size={14} /> Delete table</button>
                        </div>
                    </div>
                ) : (
                    <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-ink-mute)', fontSize: 14, minHeight: 160 }}>
                        Select a table to manage it
                    </div>
                )}
            </div>

            <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add table" width={380}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div><label className="label">Table number</label><input value={form.tableNumber} onChange={(e) => setForm((f) => ({ ...f, tableNumber: e.target.value }))} placeholder="e.g. 12" className="input" /></div>
                    <div><label className="label">Capacity</label><input type="number" min={1} max={30} value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))} className="input" /></div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => setShowAdd(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                        <button onClick={() => createMut.mutate()} disabled={!form.tableNumber || createMut.isPending} className="btn btn-primary" style={{ flex: 1 }}>Add table</button>
                    </div>
                </div>
            </Modal>
            <style>{`@media (max-width: 900px) { .seats-layout { grid-template-columns: 1fr !important; } }`}</style>
        </div>
    );
}

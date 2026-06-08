import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Eye, ShieldCheck, XCircle } from 'lucide-react';
import { restaurantsAPI } from '../../../shared/services/api';
import { Spinner, StatusBadge, Modal } from '../../../shared/components/ui/index';
import type { Restaurant } from '../../../shared/types/restaurant.types';
import toast from 'react-hot-toast';

export default function AdminPendingApprovals() {
    const qc = useQueryClient();
    const [rejectModal, setRejectModal] = useState<Restaurant | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const { data = [], isLoading } = useQuery<Restaurant[]>({
        queryKey: ['pending-restaurants'],
        queryFn: () => restaurantsAPI.getPending().then((r) => r.data),
    });

    const approveMut = useMutation({
        mutationFn: (id: string) => restaurantsAPI.approve(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['pending-restaurants'] });
            qc.invalidateQueries({ queryKey: ['pending-count'] });
            toast.success('Restaurant approved');
        },
    });

    const rejectMut = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) => restaurantsAPI.reject(id, reason),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['pending-restaurants'] });
            qc.invalidateQueries({ queryKey: ['pending-count'] });
            toast.success('Restaurant rejected');
            setRejectModal(null);
            setRejectReason('');
        },
    });

    const pending = data.length ? data : DEMO_PENDING;

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>Pending Approvals</h1>
                <p style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>Review and approve new restaurant partner applications.</p>
            </div>

            {isLoading ? <Spinner /> : pending.length === 0 ? (
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 48, textAlign: 'center', color: '#6B7280' }}>
                    <ShieldCheck size={40} color="#16A34A" style={{ marginBottom: 12 }} />
                    <div style={{ fontWeight: 600, fontSize: 16 }}>All caught up!</div>
                    <div style={{ fontSize: 14, marginTop: 4 }}>No pending restaurant applications.</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {pending.map((r) => (
                        <div key={r._id} style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{r.name}</div>
                                    <div style={{ fontSize: 13, color: '#6B7280' }}>{r.cuisineType} · {r.city || r.address}</div>
                                </div>
                                <StatusBadge status={r.status || 'pending'} />
                            </div>
                            {r.description && <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16, lineHeight: 1.6 }}>{r.description}</p>}
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button
                                    onClick={() => approveMut.mutate(r._id)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#16A34A', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}
                                >
                                    <CheckCircle size={14} /> Approve
                                </button>
                                <button
                                    onClick={() => setRejectModal(r)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'white', color: '#DC2626', border: '1.5px solid #FECACA', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}
                                >
                                    <XCircle size={14} /> Reject
                                </button>
                                <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'white', color: '#374151', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>
                                    <Eye size={14} /> View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Application" width={460}>
                <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>Provide a reason for rejecting {rejectModal?.name}.</p>
                <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection..."
                    style={{ width: '100%', padding: 12, border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontFamily: 'Poppins', minHeight: 80, resize: 'vertical', outline: 'none' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                    <button onClick={() => setRejectModal(null)} style={{ padding: '8px 16px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>Cancel</button>
                    <button
                        onClick={() => rejectModal && rejectMut.mutate({ id: rejectModal._id, reason: rejectReason || 'Does not meet requirements' })}
                        style={{ padding: '8px 16px', background: '#DC2626', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}
                    >
                        Confirm Reject
                    </button>
                </div>
            </Modal>
        </div>
    );
}

const DEMO_PENDING: Restaurant[] = [
    { _id: 'p1', name: 'Harbor & Vine', ownerId: 'owner4', cuisineType: 'Seafood', city: 'Miami', status: 'pending', address: '88 Ocean Drive', description: 'Fresh coastal cuisine with a modern twist.' },
    { _id: 'p2', name: 'Ember & Oak', ownerId: 'owner5', cuisineType: 'Steakhouse', city: 'Chicago', status: 'pending', address: '220 Lake St', description: 'Premium steaks and craft cocktails.' },
];

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, MessageSquare } from 'lucide-react';
import { reviewsAPI, restaurantsAPI } from '../../../shared/services/api';
import { useAuthStore } from '../../../shared/store/authStore';
import { Modal } from '../../../shared/components/ui/index';
import toast from 'react-hot-toast';

type ReviewItem = {
    _id: string;
    rating: number;
    customerName?: string;
    createdAt?: string;
    date?: string;
    comment?: string;
    ownerReply?: string;
    status?: string;
};

type ReplyPayload = { id: string; reply: string };

export default function OwnerReviews() {
    const { user } = useAuthStore();
    const qc = useQueryClient();
    const [apiRestaurantId, setApiRestaurantId] = useState('');
    const [replyModal, setReplyModal] = useState<ReviewItem | null>(null);
    const [replyText, setReplyText] = useState('');
    const restaurantId = user?.restaurantId?.toString() || apiRestaurantId;

    React.useEffect(() => {
        if (!user?.restaurantId) {
            let active = true;
            restaurantsAPI.getMyRestaurant()
                .then(r => { if (active && r.data?._id) setApiRestaurantId(r.data._id); })
                .catch(() => { });
            return () => { active = false; };
        }
        return undefined;
    }, [user]);

    const { data } = useQuery({
        queryKey: ['owner-reviews', restaurantId],
        queryFn: () => reviewsAPI.getByRestaurant(restaurantId).then(r => r.data),
        enabled: !!restaurantId,
        initialData: { reviews: DEMO_REVIEWS, avgRating: 4.6 },
    });

    const replyMut = useMutation({
        mutationFn: ({ id, reply }: ReplyPayload) => reviewsAPI.reply(id, reply),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['owner-reviews'] }); setReplyModal(null); setReplyText(''); toast.success('Reply sent!'); },
    });

    const reviews = data?.reviews || DEMO_REVIEWS;

    const ratingDist = [5, 4, 3, 2, 1].map(r => ({
        star: r,
        count: reviews.filter((rev: ReviewItem) => Math.round(rev.rating) === r).length || (r === 5 ? 18 : r === 4 ? 8 : r === 3 ? 2 : 1),
    }));
    const total = ratingDist.reduce((s, r) => s + r.count, 0);

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700 }}>Customer Reviews</h1>
                <p style={{ fontSize: 13, color: '#6B7280' }}>Manage and respond to guest feedback.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20 }}>
                {/* Rating summary */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <div style={{ fontSize: 48, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{data?.avgRating?.toFixed(1) || '4.8'}</div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 3, margin: '8px 0' }}>
                            {Array(5).fill(0).map((_, i) => <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />)}
                        </div>
                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>{total} reviews</div>
                    </div>
                    {ratingDist.map(r => (
                        <div key={r.star} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                            <span style={{ fontSize: 12, color: '#6B7280', width: 14 }}>{r.star}</span>
                            <Star size={11} fill="#F59E0B" color="#F59E0B" />
                            <div style={{ flex: 1, height: 6, background: '#F3F4F6', borderRadius: 3 }}>
                                <div style={{ width: `${(r.count / total) * 100}%`, height: '100%', background: '#B91C1C', borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 11, color: '#9CA3AF', width: 20 }}>{r.count}</span>
                        </div>
                    ))}
                </div>

                {/* Reviews list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {reviews.map((r: ReviewItem) => (
                        <div key={r._id} style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 18 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: '#B91C1C' }}>{(r.customerName || 'G')[0]}</div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 14 }}>{r.customerName || 'Guest'}</div>
                                        <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                                            {Array(5).fill(0).map((_, i) => <Star key={i} size={12} fill={i < r.rating ? '#F59E0B' : '#E5E7EB'} color={i < r.rating ? '#F59E0B' : '#E5E7EB'} />)}
                                        </div>
                                    </div>
                                </div>
                                <span style={{ fontSize: 12, color: '#9CA3AF' }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : r.date}</span>
                            </div>
                            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, marginBottom: 10 }}>{r.comment}</p>
                            {r.ownerReply ? (
                                <div style={{ background: '#F9FAFB', borderRadius: 8, padding: 12, borderLeft: '3px solid #B91C1C' }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#B91C1C', marginBottom: 4 }}>Your Reply</div>
                                    <p style={{ fontSize: 12, color: '#6B7280' }}>{r.ownerReply}</p>
                                </div>
                            ) : (
                                <button onClick={() => { setReplyModal(r); setReplyText(''); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins', color: '#374151' }}>
                                    <MessageSquare size={13} /> Reply to Review
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <Modal isOpen={!!replyModal} onClose={() => setReplyModal(null)} title="Reply to Review" width={460}>
                {replyModal && (
                    <div>
                        <div style={{ background: '#F9FAFB', borderRadius: 8, padding: 12, marginBottom: 14, fontSize: 13, color: '#6B7280', fontStyle: 'italic' }}>"{replyModal.comment}"</div>
                        <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a thoughtful reply..."
                            style={{ width: '100%', padding: 12, border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontFamily: 'Poppins', resize: 'vertical', minHeight: 100, outline: 'none' }} />
                        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                            <button onClick={() => setReplyModal(null)} style={{ flex: 1, padding: '9px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins' }}>Cancel</button>
                            <button onClick={() => replyMut.mutate({ id: replyModal._id, reply: replyText })}
                                style={{ flex: 1, padding: '9px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins' }}>
                                Send Reply
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

const DEMO_REVIEWS = [
    { _id: '1', customerName: 'Emily Lawson', rating: 5, comment: 'The seasonal tasting menu was absolutely phenomenal. Exceptional service from Maria!', date: '2h ago', ownerReply: null },
    { _id: '2', customerName: 'Marcus Brown', rating: 4, comment: 'Great atmosphere and wine selection. Duck confit was a bit salty, but overall a lovely night.', date: '5h ago', ownerReply: null },
    { _id: '3', customerName: 'Sarah Kim', rating: 2, comment: 'Waited 45 minutes past our reservation time. Disappointing as we\'ve enjoyed TableNest before.', date: '1d ago', ownerReply: 'We sincerely apologize for the wait time. Please contact us directly for a complimentary reservation.' },
];





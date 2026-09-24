import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { reviewsAPI } from '../../services/api';
import { Modal } from '../ui/index';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitted: () => void;
    restaurantName: string;
    orderId?: string;
    reservationId?: string;
}

export default function ReviewModal({ isOpen, onClose, onSubmitted, restaurantName, orderId, reservationId }: ReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const mut = useMutation({
        mutationFn: () => reviewsAPI.create({ orderId, reservationId, rating, comment }),
        onSuccess: () => { toast.success('Thanks for the review!'); onSubmitted(); setComment(''); },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Could not submit review'),
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Rate your experience" width={420}>
            <p style={{ fontSize: 13, color: 'var(--color-ink-mute)', marginBottom: 16 }}>How was your order from <strong>{restaurantName}</strong>?</p>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setRating(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                        <Star size={30} fill={n <= rating ? '#f9691a' : 'none'} color={n <= rating ? '#f9691a' : '#e5d9cb'} />
                    </button>
                ))}
            </div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} placeholder="Tell others about the food and service…" className="input" style={{ resize: 'vertical', marginBottom: 16 }} />
            <button onClick={() => mut.mutate()} disabled={mut.isPending} className="btn btn-primary" style={{ width: '100%' }}>
                {mut.isPending ? 'Submitting…' : 'Submit review'}
            </button>
        </Modal>
    );
}

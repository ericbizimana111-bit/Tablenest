import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { reviewApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { Modal } from '@/ui/Overlay';
import { Button } from '@/ui/Button';
import { Stars } from '@/ui/bits';
import { Textarea } from '@/ui/Field';

const WORDS = ['', 'Disappointing', 'Could be better', 'Good', 'Really good', 'Outstanding'];

export function ReviewDialog({
  open,
  onClose,
  target,
}: {
  open: boolean;
  onClose: () => void;
  target: { orderId?: string; reservationId?: string; restaurantName: string | null } | null;
}) {
  const qc = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const send = useMutation({
    mutationFn: () => reviewApi.create({ orderId: target?.orderId, reservationId: target?.reservationId, rating, comment: comment.trim() || undefined }),
    onSuccess: () => {
      toast.success('Thank you — your review is live');
      qc.invalidateQueries({ queryKey: ['my-orders'] });
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
      setRating(0);
      setComment('');
      onClose();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`How was ${target?.restaurantName || 'it'}?`}
      description="Your review helps other guests choose — and helps the kitchen get better."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Later
          </Button>
          <Button variant="primary" disabled={!rating} loading={send.isPending} onClick={() => send.mutate()}>
            Post review
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center py-2">
        <Stars value={rating} onChange={setRating} size={34} />
        <p className="mt-2 h-5 text-sm font-semibold text-saffron-700">{WORDS[rating]}</p>
      </div>
      <Textarea label="Tell us more" optional value={comment} onChange={(e) => setComment(e.target.value.slice(0, 1500))} placeholder="The dish you loved, the service, the atmosphere…" className="mt-4" />
    </Modal>
  );
}

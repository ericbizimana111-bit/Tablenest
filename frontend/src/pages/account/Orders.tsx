import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ArrowRight, Receipt, RotateCcw, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderApi } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { useMoney } from '@/lib/settings';
import type { Order } from '@/lib/types';
import { useCart } from '@/stores/cart';
import { PageHead } from '@/layouts/AccountLayout';
import { ReviewDialog } from '@/components/ReviewDialog';
import { Button, LinkButton } from '@/ui/Button';
import { EmptyState, OrderStatusBadge, Photo, Segmented } from '@/ui/bits';
import { Skeleton } from '@/ui/Loader';

export default function Orders() {
  const money = useMoney();
  const navigate = useNavigate();
  const cart = useCart();
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const [reviewing, setReviewing] = useState<Order | null>(null);
  const q = useInfiniteQuery({
    queryKey: ['my-orders', tab],
    queryFn: ({ pageParam }) => orderApi.mine({ status: tab, page: pageParam, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (l) => (l.page < l.pages ? l.page + 1 : undefined),
    refetchInterval: tab === 'active' ? 20_000 : false,
  });
  const orders = q.data?.pages.flatMap((p) => p.orders) ?? [];

  const reorder = (o: Order) => {
    cart.clear();
    o.items.forEach((i) => cart.add({ _id: o.restaurantId, name: o.restaurantName || 'Restaurant' }, { menuItemId: i.menuItemId, name: i.name, price: i.price, image: i.image }, i.quantity));
    toast.success('Added to your bag — prices are refreshed at checkout');
    navigate(`/restaurants/${o.restaurantId}?tab=menu`);
  };

  return (
    <div>
      <PageHead eyebrow="Your orders" title="Orders" action={<Segmented id="orders" value={tab} onChange={setTab} options={[{ value: 'active', label: 'In progress' }, { value: 'past', label: 'Past' }]} />} />
      {q.isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : !orders.length ? (
        <EmptyState
          icon={<Receipt className="size-6" />}
          title={tab === 'active' ? 'Nothing cooking right now' : 'No past orders yet'}
          body="When you order from a restaurant it shows up here, with live updates from the kitchen."
          action={<LinkButton to="/restaurants?service=delivery">Order something</LinkButton>}
        />
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o._id} className="overflow-hidden rounded-[24px] border border-line bg-card">
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <Photo src={o.restaurantImage} alt="" label={o.restaurantName || ''} className="size-16 shrink-0 rounded-2xl" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-xl text-ink">{o.restaurantName}</p>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <p className="mt-1 truncate text-[13.5px] text-ink-3">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}</p>
                  <p className="mt-1 text-[12px] text-ink-4">
                    {o.orderNumber} · {formatDateTime(o.createdAt)} · {o.orderType.replace('_', ' ')}
                  </p>
                </div>
                <p className="font-display text-2xl text-ink tabular-nums">{money(o.total, o.currency)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-dashed border-line-2 bg-paper/40 px-5 py-3">
                <Link to={`/my-orders/${o._id}/track`} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold text-herb-700 hover:bg-herb-50">
                  {tab === 'active' ? 'Track order' : 'View receipt'} <ArrowRight className="size-3.5" />
                </Link>
                {o.status === 'delivered' && !o.reviewed && (
                  <button onClick={() => setReviewing(o)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold text-saffron-700 hover:bg-saffron-50">
                    <Star className="size-3.5" /> Leave a review
                  </button>
                )}
                {tab === 'past' && (
                  <button onClick={() => reorder(o)} className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold text-ink-2 hover:bg-paper-2">
                    <RotateCcw className="size-3.5" /> Order again
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {q.hasNextPage && (
        <div className="mt-8 flex justify-center">
          <Button variant="outline" loading={q.isFetchingNextPage} onClick={() => q.fetchNextPage()}>
            Load more
          </Button>
        </div>
      )}
      <ReviewDialog open={!!reviewing} onClose={() => setReviewing(null)} target={reviewing && { orderId: reviewing._id, restaurantName: reviewing.restaurantName }} />
    </div>
  );
}

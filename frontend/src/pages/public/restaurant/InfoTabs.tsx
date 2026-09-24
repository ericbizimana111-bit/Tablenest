import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, Globe, Mail, MapPin, MessageSquare, Phone } from 'lucide-react';
import { reviewApi } from '@/lib/api';
import { cn, DAYS, timeAgo } from '@/lib/format';
import { useMoney } from '@/lib/settings';
import type { Restaurant } from '@/lib/types';
import { Button } from '@/ui/Button';
import { EmptyState, Stars } from '@/ui/bits';
import { Skeleton } from '@/ui/Loader';

export function ReviewsTab({ restaurant }: { restaurant: Restaurant }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({ queryKey: ['reviews', restaurant._id, page], queryFn: () => reviewApi.forRestaurant(restaurant._id, page), placeholderData: (p) => p });
  if (isLoading) return <Skeleton className="h-60" />;
  if (!data?.total)
    return <EmptyState icon={<MessageSquare className="size-6" />} title="No reviews yet" body="Guests can review after a completed order or visit. Be the first." />;
  const max = Math.max(1, ...Object.values(data.distribution));
  return (
    <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside>
        <div className="sticky top-[150px] rounded-[24px] border border-line bg-card p-6">
          <p className="font-display text-6xl text-ink">{data.avgRating.toFixed(1)}</p>
          <Stars value={Math.round(data.avgRating)} size={18} />
          <p className="mt-2 text-sm text-ink-3">{data.total} reviews from real guests</p>
          <div className="mt-5 space-y-2">
            {[5, 4, 3, 2, 1].map((n) => (
              <div key={n} className="flex items-center gap-2 text-[13px]">
                <span className="w-3 text-ink-3">{n}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-2">
                  <div className="h-full rounded-full bg-saffron-400" style={{ width: `${(data.distribution[n] / max) * 100}%` }} />
                </div>
                <span className="w-6 text-right text-ink-4 tabular-nums">{data.distribution[n]}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
      <div>
        <ul className="space-y-4">
          {data.reviews.map((r) => (
            <li key={r._id} className="rounded-[22px] border border-line bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{r.customerName || 'A guest'}</p>
                  <p className="text-[12px] text-ink-4">
                    {timeAgo(r.createdAt)} · {r.orderId ? 'Ordered' : 'Dined in'}
                  </p>
                </div>
                <Stars value={r.rating} />
              </div>
              {r.comment && <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{r.comment}</p>}
              {r.ownerReply && (
                <div className="mt-4 rounded-2xl border-l-2 border-saffron-400 bg-paper p-4">
                  <p className="text-[12px] font-semibold text-ink-3">Reply from {restaurant.name}</p>
                  <p className="mt-1 text-[14px] text-ink-2">{r.ownerReply}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
        {data.pages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Newer
            </Button>
            <span className="text-sm text-ink-3">
              {page} / {data.pages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>
              Older
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function AboutTab({ restaurant: r }: { restaurant: Restaurant }) {
  const money = useMoney();
  const today = DAYS[new Date().getDay()];
  const contact = [
    { icon: MapPin, text: [r.address, r.city, r.country].filter(Boolean).join(', '), href: `https://www.openstreetmap.org/search?query=${encodeURIComponent([r.address, r.city, r.country].filter(Boolean).join(', '))}` },
    r.phone && { icon: Phone, text: r.phone, href: `tel:${r.phone.replace(/\s/g, '')}` },
    r.email && { icon: Mail, text: r.email, href: `mailto:${r.email}` },
    r.website && { icon: Globe, text: r.website.replace(/^https?:\/\//, ''), href: r.website },
  ].filter(Boolean) as Array<{ icon: typeof MapPin; text: string; href: string }>;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-8">
        {r.description && (
          <section>
            <h3 className="mb-3 text-2xl text-ink">About</h3>
            <p className="text-[16px] leading-relaxed whitespace-pre-line text-ink-2">{r.description}</p>
          </section>
        )}
        <section className="rounded-[22px] border border-line bg-card p-5">
          <h3 className="mb-4 text-xl text-ink">Find them</h3>
          <ul className="space-y-3">
            {contact.map((c) => (
              <li key={c.text}>
                <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="flex items-center gap-3 text-[15px] text-ink-2 hover:text-herb-700">
                  <c.icon className="size-4 shrink-0 text-ink-4" /> {c.text}
                </a>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-[22px] border border-line bg-card p-5">
          <h3 className="mb-4 text-xl text-ink">Ordering</h3>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-ink-3">Services</dt>
              <dd className="mt-1 font-semibold text-ink">{[r.dineIn && 'Dine-in', r.delivery && 'Delivery', r.pickup && 'Pickup'].filter(Boolean).join(', ') || '—'}</dd>
            </div>
            <div>
              <dt className="text-ink-3">Usually ready in</dt>
              <dd className="mt-1 font-semibold text-ink">{r.prepTime} min</dd>
            </div>
            {r.delivery && (
              <>
                <div>
                  <dt className="text-ink-3">Delivery fee</dt>
                  <dd className="mt-1 font-semibold text-ink">{r.deliveryFee ? money(r.deliveryFee) : 'Free'}</dd>
                </div>
                <div>
                  <dt className="text-ink-3">Minimum for delivery</dt>
                  <dd className="mt-1 font-semibold text-ink">{r.minOrder ? money(r.minOrder) : 'None'}</dd>
                </div>
              </>
            )}
          </dl>
        </section>
      </div>
      <section className="h-fit rounded-[22px] border border-line bg-card p-5">
        <h3 className="mb-4 flex items-center gap-2 text-xl text-ink">
          <Clock className="size-5 text-ink-4" /> Opening hours
        </h3>
        <ul className="divide-y divide-line">
          {DAYS.map((d) => {
            const h = r.openingHours?.[d];
            return (
              <li key={d} className={cn('flex justify-between py-2.5 text-[15px] capitalize', d === today ? 'font-semibold text-ink' : 'text-ink-2')}>
                <span>
                  {d}
                  {d === today && <span className="ml-2 rounded-full bg-saffron-100 px-2 py-0.5 text-[11px] font-semibold text-saffron-700 normal-case">Today</span>}
                </span>
                <span className="tabular-nums">{!h ? '—' : h.closed ? 'Closed' : `${h.open} – ${h.close}`}</span>
              </li>
            );
          })}
        </ul>
        {r.timezone && <p className="mt-3 text-[12px] text-ink-4">Times are local to the restaurant ({r.timezone}).</p>}
      </section>
    </div>
  );
}

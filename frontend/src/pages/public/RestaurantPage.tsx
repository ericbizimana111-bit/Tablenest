import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { Armchair, Bike, Heart, Info, MapPin, MessageSquare, QrCode, Share2, ShoppingBag, Store, UtensilsCrossed } from 'lucide-react';
import { restaurantApi } from '@/lib/api';
import { statusOf } from '@/lib/http';
import { cn, openState, priceLevel } from '@/lib/format';
import { useFavorites } from '@/features/favorites';
import { EmptyState, Photo, RatingSeal } from '@/ui/bits';
import { IconButton, LinkButton } from '@/ui/Button';
import { PageLoader } from '@/ui/Loader';
import { tableIntent } from '@/stores/intent';
import { MenuTab } from './restaurant/MenuTab';
import { BookTab } from './restaurant/BookTab';
import { AboutTab, ReviewsTab } from './restaurant/InfoTabs';

type Tab = 'menu' | 'book' | 'reviews' | 'about';

export default function RestaurantPage() {
  const { id = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const { isSaved, toggle } = useFavorites();
  const { data: r, isLoading, error } = useQuery({ queryKey: ['restaurant', id], queryFn: () => restaurantApi.one(id), enabled: /^[0-9a-f]{24}$/i.test(id) });
  const scannedTable = params.get('table');
  const scannedNumber = params.get('t');

  // Guest scanned a table QR code: remember the table so checkout can send the order to it.
  useEffect(() => {
    if (r && r.dineIn && scannedTable && /^[0-9a-f]{24}$/i.test(scannedTable)) {
      tableIntent.set({ restaurantId: r._id, tableId: scannedTable, tableNumber: scannedNumber || '' });
    }
  }, [r, scannedTable, scannedNumber]);
  const atTable = r ? tableIntent.get(r._id) : null;

  if (isLoading) return <PageLoader label="Opening the menu…" />;
  if (!r) {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon={<Store className="size-6" />}
          title={statusOf(error) === 404 || !/^[0-9a-f]{24}$/i.test(id) ? "We couldn't find this restaurant" : 'Something went wrong'}
          body="It may have closed its doors on TableNest, or the link is mistyped."
          action={<LinkButton to="/restaurants">Discover other places</LinkButton>}
        />
      </div>
    );
  }

  const state = openState(r);
  const tabs: Array<{ id: Tab; label: string; icon: typeof Info; show: boolean }> = [
    { id: 'menu', label: 'Menu & order', icon: UtensilsCrossed, show: true },
    { id: 'book', label: 'Book a table', icon: Armchair, show: r.dineIn },
    { id: 'reviews', label: `Reviews${r.totalReviews ? ` (${r.totalReviews})` : ''}`, icon: MessageSquare, show: true },
    { id: 'about', label: 'Info', icon: Info, show: true },
  ];
  const requested = params.get('tab') as Tab | null;
  const tab: Tab = requested && tabs.find((t) => t.id === requested && t.show) ? requested : 'menu';
  const setTab = (t: Tab) => {
    const next = new URLSearchParams(params);
    next.set('tab', t);
    next.delete('dish');
    setParams(next, { replace: true });
  };
  const images = r.images?.length ? r.images : r.logo ? [r.logo] : [];

  const share = async () => {
    const url = location.href.split('?')[0];
    try {
      if (navigator.share) await navigator.share({ title: r.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied');
      }
    } catch {
      /* dismissed */
    }
  };

  return (
    <div className="pb-10">
      <div className="container-page pt-2 sm:pt-4">
        {atTable && (
          <div className="mb-3 flex items-center gap-3 rounded-2xl bg-herb-900 px-4 py-3 text-paper">
            <QrCode className="size-5 shrink-0 text-saffron-300" />
            <p className="text-sm">
              You're at {atTable.tableNumber ? <b>table {atTable.tableNumber}</b> : 'a table'}. Order from the menu and choose <b>Dine in</b> — it comes straight to you.
            </p>
          </div>
        )}
        {/* Gallery */}
        {/* One photo fills the frame, two sit side by side, three or more get the feature layout — never empty slots. */}
        <div
          className={cn(
            'grid h-[260px] gap-2 overflow-hidden rounded-[28px] sm:h-[380px]',
            images.length >= 3 ? 'md:grid-cols-[2fr_1fr] md:grid-rows-2' : images.length === 2 ? 'md:grid-cols-[3fr_2fr]' : '',
          )}
        >
          <motion.div initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9 }} className={cn('relative', images.length >= 3 && 'md:row-span-2')}>
            <Photo src={images[0]} alt={r.name} label={r.name} className="size-full" />
          </motion.div>
          {images.slice(1, 3).map((img, i) => (
            <motion.div key={img} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 + i * 0.1 }} className="hidden md:block">
              <Photo src={img} alt="" className="size-full" />
            </motion.div>
          ))}
        </div>

        {/* Title block */}
        <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[13px] font-semibold">
              <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1', state.open ? 'bg-herb-50 text-herb-700' : 'bg-paper-2 text-ink-3')}>
                <span className={cn('size-1.5 rounded-full', state.open ? 'animate-pulse-dot bg-herb-500 text-herb-500/60' : 'bg-ink-4')} />
                {state.label} {state.detail && <span className="font-medium opacity-70">{state.detail}</span>}
              </span>
              {r.delivery && (
                <span className="inline-flex items-center gap-1 text-ink-3">
                  <Bike className="size-3.5" /> Delivery
                </span>
              )}
              {r.pickup && (
                <span className="inline-flex items-center gap-1 text-ink-3">
                  <ShoppingBag className="size-3.5" /> Pickup
                </span>
              )}
              {r.dineIn && (
                <span className="inline-flex items-center gap-1 text-ink-3">
                  <Armchair className="size-3.5" /> Tables
                </span>
              )}
            </div>
            <h1 className="mt-3 text-[40px] leading-[1.02] text-ink sm:text-[56px]">{r.name}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-ink-3">
              <span className="font-semibold text-ink-2">{r.cuisineType}</span>
              <span>·</span>
              <span title={priceLevel(r.priceRange)}>{r.priceRange}</span>
              {r.city && (
                <>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-4" /> {r.address}, {r.city}
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <RatingSeal rating={r.rating} count={r.totalReviews} />
            <IconButton label={isSaved(r._id) ? 'Remove from favourites' : 'Save to favourites'} tone="solid" onClick={() => toggle(r._id)} aria-pressed={isSaved(r._id)}>
              <Heart className={cn('size-5', isSaved(r._id) && 'fill-tomato-500 text-tomato-500')} />
            </IconButton>
            <IconButton label="Share" tone="solid" onClick={share}>
              <Share2 className="size-5" />
            </IconButton>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[72px] z-30 mt-8 border-y border-line bg-paper/90 backdrop-blur-xl">
        <div className="container-page scrollbar-none flex gap-1 overflow-x-auto" role="tablist">
          {tabs
            .filter((t) => t.show)
            .map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cn('relative inline-flex h-14 shrink-0 items-center gap-2 px-4 text-[14px] font-semibold transition-colors', tab === t.id ? 'text-ink' : 'text-ink-3 hover:text-ink')}
              >
                <t.icon className="size-4" /> {t.label}
                {tab === t.id && <motion.span layoutId="rtab" className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-tomato-500" />}
              </button>
            ))}
        </div>
      </div>

      <div className="container-page pt-8" role="tabpanel">
        {tab === 'menu' && <MenuTab restaurant={r} />}
        {tab === 'book' && <BookTab restaurant={r} />}
        {tab === 'reviews' && <ReviewsTab restaurant={r} />}
        {tab === 'about' && <AboutTab restaurant={r} />}
      </div>
    </div>
  );
}

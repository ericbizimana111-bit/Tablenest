import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Armchair, Bike, Compass, Search, ShoppingBag, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { restaurantApi, type RestaurantQuery } from '@/lib/api';
import { cn } from '@/lib/format';
import { bookingIntent } from '@/stores/intent';
import { useExperience } from '@/stores/experience';
import { RestaurantCard, RestaurantCardSkeleton } from '@/components/RestaurantCard';
import { Chip, EmptyState, Segmented } from '@/ui/bits';
import { Button } from '@/ui/Button';
import { Drawer } from '@/ui/Overlay';

const SERVICES = [
  { value: 'all', label: 'All', icon: <Compass className="size-4" /> },
  { value: 'dine_in', label: 'Tables', icon: <Armchair className="size-4" /> },
  { value: 'delivery', label: 'Delivery', icon: <Bike className="size-4" /> },
  { value: 'pickup', label: 'Pickup', icon: <ShoppingBag className="size-4" /> },
] as const;
const SORTS = [
  { value: 'rating', label: 'Top rated' },
  { value: 'popular', label: 'Most reviewed' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name_asc', label: 'A to Z' },
];
const PAGE = 12;

export default function Discover() {
  const [params, setParams] = useSearchParams();
  const ask = useExperience((s) => s.ask);
  const [draft, setDraft] = useState(params.get('search') || '');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const q: RestaurantQuery = useMemo(
    () => ({
      search: params.get('search') || undefined,
      cuisine: params.get('cuisine') || undefined,
      city: params.get('city') || undefined,
      service: (params.get('service') as RestaurantQuery['service']) || undefined,
      priceRange: params.get('priceRange') || undefined,
      sort: params.get('sort') || undefined,
      minRating: params.get('minRating') ? Number(params.get('minRating')) : undefined,
    }),
    [params],
  );

  // Carry a date / party size from the hero search into booking.
  useEffect(() => {
    const date = params.get('date');
    const guests = params.get('guests');
    if (date || guests) bookingIntent.set({ date: date || undefined, guests: guests ? Number(guests) : undefined });
  }, [params]);

  // Keep the search box in step with the URL (back/forward, links from elsewhere).
  const urlSearch = params.get('search') || '';
  const [syncedSearch, setSyncedSearch] = useState(urlSearch);
  if (urlSearch !== syncedSearch) {
    setSyncedSearch(urlSearch);
    setDraft(urlSearch);
  }

  const set = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const cuisines = useQuery({ queryKey: ['cuisines'], queryFn: restaurantApi.cuisines });
  const list = useInfiniteQuery({
    queryKey: ['discover', q],
    queryFn: ({ pageParam }) => restaurantApi.list({ ...q, page: pageParam, limit: PAGE }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.pages ? last.page + 1 : undefined),
  });
  const restaurants = list.data?.pages.flatMap((p) => p.restaurants) ?? [];
  const total = list.data?.pages[0]?.total ?? 0;
  const activeFilters = ['priceRange', 'minRating', 'sort', 'city'].filter((k) => params.get(k)).length;

  const heading =
    q.service === 'dine_in' ? (
      <>
        Book a <span className="italic text-herb-700">table</span>
      </>
    ) : q.service === 'delivery' ? (
      <>
        Delivered to <span className="italic text-herb-700">your door</span>
      </>
    ) : q.service === 'pickup' ? (
      <>
        Ready when <span className="italic text-herb-700">you are</span>
      </>
    ) : (
      <>
        Discover <span className="italic text-herb-700">somewhere good</span>
      </>
    );

  return (
    <div className="pb-10">
      <div className="container-page pt-4 pb-6 sm:pt-8">
        <p className="eyebrow">{q.cuisine ? q.cuisine : 'Restaurants'}</p>
        <h1 className="mt-3 text-[40px] leading-[1.02] text-ink sm:text-[58px]">{heading}</h1>
        <p className="mt-3 text-[15px] text-ink-3" aria-live="polite">
          {list.isLoading ? 'Finding restaurants…' : `${total} ${total === 1 ? 'place' : 'places'}${q.search ? ` matching “${q.search}”` : ''}`}
        </p>
      </div>

      <div className="sticky top-[72px] z-30 border-y border-line bg-paper/90 backdrop-blur-xl">
        <div className="container-page flex flex-col gap-3 py-3 lg:flex-row lg:items-center">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              set('search', draft.trim() || undefined);
            }}
            className="flex h-11 flex-1 items-center gap-2 rounded-full border border-line bg-card pr-1.5 pl-4 focus-within:border-herb-500 lg:max-w-sm"
          >
            <Search className="size-4 text-ink-3" />
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Search name, cuisine, city…" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-4" aria-label="Search restaurants" />
            {params.get('search') && (
              <button type="button" onClick={() => set('search', undefined)} className="grid size-8 place-items-center rounded-full text-ink-3 hover:bg-paper-2" aria-label="Clear search">
                <X className="size-4" />
              </button>
            )}
          </form>
          <div className="flex items-center gap-2 overflow-hidden">
            <Segmented
              id="svc"
              size="sm"
              value={(q.service ?? 'all') as (typeof SERVICES)[number]['value']}
              onChange={(v) => set('service', v === 'all' ? undefined : v)}
              options={SERVICES.map((s) => ({ ...s }))}
              className="shrink-0"
            />
            <button
              onClick={() => setFiltersOpen(true)}
              className={cn(
                'relative inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-[13px] font-semibold transition',
                activeFilters ? 'border-herb-900 bg-herb-50 text-herb-800' : 'border-line bg-card text-ink-2 hover:border-line-2',
              )}
            >
              <SlidersHorizontal className="size-4" /> Filters{activeFilters ? ` · ${activeFilters}` : ''}
            </button>
          </div>
        </div>
        {!!cuisines.data?.length && (
          <div className="container-page scrollbar-none flex gap-2 overflow-x-auto pb-3">
            <Chip active={!q.cuisine} onClick={() => set('cuisine', undefined)}>
              All cuisines
            </Chip>
            {cuisines.data.map((c) => (
              <Chip key={c.name} active={q.cuisine === c.name} onClick={() => set('cuisine', q.cuisine === c.name ? undefined : c.name)}>
                {c.name} <span className="opacity-50">{c.count}</span>
              </Chip>
            ))}
          </div>
        )}
      </div>

      <div className="container-page pt-8">
        {list.isError ? (
          <EmptyState icon={<X className="size-6" />} title="We couldn't load restaurants" body="Please check your connection and try again." action={<Button onClick={() => list.refetch()}>Try again</Button>} />
        ) : list.isLoading ? (
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <RestaurantCardSkeleton key={i} />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <EmptyState
            icon={<Search className="size-6" />}
            title="Nothing matches that — yet"
            body="Try fewer filters, or tell the concierge what you're after and it will look in menus too."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="outline" onClick={() => setParams({}, { replace: true })}>
                  Clear filters
                </Button>
                <Button variant="dark" icon={<Sparkles className="size-4" />} onClick={() => ask(q.search ? `I'm looking for ${q.search}` : '')}>
                  Ask the concierge
                </Button>
              </div>
            }
          />
        ) : (
          <>
            <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((r, i) => (
                <RestaurantCard key={r._id} restaurant={r} index={i % PAGE} />
              ))}
            </div>
            {list.hasNextPage && (
              <div className="mt-12 flex justify-center">
                <Button variant="outline" size="lg" loading={list.isFetchingNextPage} onClick={() => list.fetchNextPage()}>
                  Show more restaurants
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        footer={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                const next = new URLSearchParams(params);
                ['priceRange', 'minRating', 'sort', 'city'].forEach((k) => next.delete(k));
                setParams(next, { replace: true });
              }}
            >
              Reset
            </Button>
            <Button variant="dark" block onClick={() => setFiltersOpen(false)}>
              Show {total} {total === 1 ? 'place' : 'places'}
            </Button>
          </div>
        }
      >
        <div className="space-y-8 p-6">
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-ink">Price</legend>
            <div className="flex flex-wrap gap-2">
              {['$', '$$', '$$$', '$$$$'].map((p) => {
                const selected = (params.get('priceRange') || '').split(',').filter(Boolean);
                const on = selected.includes(p);
                return (
                  <Chip key={p} active={on} onClick={() => set('priceRange', (on ? selected.filter((x) => x !== p) : [...selected, p]).join(',') || undefined)}>
                    {p}
                  </Chip>
                );
              })}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-ink">Rating</legend>
            <div className="flex flex-wrap gap-2">
              {[0, 3.5, 4, 4.5].map((r) => (
                <Chip key={r} active={(q.minRating ?? 0) === r} onClick={() => set('minRating', r ? String(r) : undefined)}>
                  {r ? `${r}+` : 'Any'}
                </Chip>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-ink">Sort by</legend>
            <div className="grid gap-1">
              {SORTS.map((s) => (
                <label key={s.value} className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 hover:bg-paper">
                  <span className="text-[15px] text-ink-2">{s.label}</span>
                  <input type="radio" name="sort" checked={(q.sort ?? 'rating') === s.value} onChange={() => set('sort', s.value === 'rating' ? undefined : s.value)} className="size-4 accent-herb-700" />
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-ink">City</legend>
            <input
              defaultValue={q.city}
              onBlur={(e) => set('city', e.target.value.trim() || undefined)}
              onKeyDown={(e) => e.key === 'Enter' && set('city', (e.target as HTMLInputElement).value.trim() || undefined)}
              placeholder="Any city"
              className="input-base"
            />
          </fieldset>
        </div>
      </Drawer>
    </div>
  );
}

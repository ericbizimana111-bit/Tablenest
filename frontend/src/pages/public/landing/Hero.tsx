import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { Armchair, ArrowRight, Bike, CalendarDays, MapPin, Search, ShoppingBag, Users } from 'lucide-react';
import { menuApi, restaurantApi } from '@/lib/api';
import { cn, isoDay, openState } from '@/lib/format';
import { useMoney } from '@/lib/settings';
import { Photo, RatingSeal, Segmented } from '@/ui/bits';
import { Button } from '@/ui/Button';
import heroPhoto from '@/assets/photos/mille-feuille.webp';
import sidePhoto from '@/assets/photos/croquettes.webp';

const EASE = [0.22, 1, 0.36, 1] as const;

function IntentSearch() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'book' | 'order'>('book');
  const [q, setQ] = useState('');
  const [guests, setGuests] = useState(2);
  const [day, setDay] = useState(isoDay(0));
  const [how, setHow] = useState<'delivery' | 'pickup'>('delivery');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (q.trim()) p.set('search', q.trim());
    if (mode === 'book') {
      p.set('service', 'dine_in');
      p.set('date', day);
      p.set('guests', String(guests));
    } else p.set('service', how);
    navigate(`/restaurants?${p.toString()}`);
  };

  const days = [
    { v: isoDay(0), l: 'Today' },
    { v: isoDay(1), l: 'Tomorrow' },
    ...[2, 3, 4, 5].map((n) => ({ v: isoDay(n), l: new Date(Date.now() + n * 864e5).toLocaleDateString(undefined, { weekday: 'long' }) })),
  ];

  return (
    <form onSubmit={submit} className="rounded-[28px] border border-line bg-card p-2.5 shadow-[var(--shadow-lift)]">
      <div className="flex items-center justify-between gap-2 p-1.5 pb-3">
        <Segmented
          id="hero"
          size="sm"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'book', label: 'Book a table', icon: <Armchair className="size-4" /> },
            { value: 'order', label: 'Order food', icon: <ShoppingBag className="size-4" /> },
          ]}
        />
      </div>
      <div className="grid gap-2 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto]">
        <label className="flex h-14 items-center gap-3 rounded-2xl bg-paper px-4 focus-within:ring-2 focus-within:ring-herb-500/30">
          <Search className="size-5 shrink-0 text-ink-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={mode === 'book' ? 'Cuisine, restaurant or area' : 'What are you craving?'}
            className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-4"
            aria-label="What are you looking for"
          />
        </label>
        {mode === 'book' ? (
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <label className="flex h-14 items-center gap-2 rounded-2xl bg-paper px-3.5">
              <CalendarDays className="size-4 shrink-0 text-ink-3" />
              <select value={day} onChange={(e) => setDay(e.target.value)} className="w-full appearance-none bg-transparent text-[14.5px] font-semibold text-ink outline-none" aria-label="Date">
                {days.map((d) => (
                  <option key={d.v} value={d.v}>
                    {d.l}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex h-14 items-center gap-2 rounded-2xl bg-paper px-3.5">
              <Users className="size-4 shrink-0 text-ink-3" />
              <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="appearance-none bg-transparent text-[14.5px] font-semibold text-ink outline-none" aria-label="Guests">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'guest' : 'guests'}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {(['delivery', 'pickup'] as const).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHow(h)}
                aria-pressed={how === h}
                className={cn(
                  'flex h-14 items-center justify-center gap-2 rounded-2xl text-[14px] font-semibold transition',
                  how === h ? 'bg-herb-900 text-paper' : 'bg-paper text-ink-2 hover:text-ink',
                )}
              >
                {h === 'delivery' ? <Bike className="size-4" /> : <ShoppingBag className="size-4" />}
                {h === 'delivery' ? 'Delivery' : 'Pickup'}
              </button>
            ))}
          </div>
        )}
        <Button type="submit" variant="primary" size="lg" className="h-14 md:px-8" trail={<ArrowRight className="size-4" />}>
          {mode === 'book' ? 'Find a table' : 'Find food'}
        </Button>
      </div>
    </form>
  );
}

export function Hero() {
  const money = useMoney();
  const featured = useQuery({ queryKey: ['featured', 4], queryFn: () => restaurantApi.featured(4) });
  const popular = useQuery({ queryKey: ['popular', 4], queryFn: () => menuApi.popular(4) });
  const cuisines = useQuery({ queryKey: ['cuisines'], queryFn: restaurantApi.cuisines });
  const star = featured.data?.restaurants[0];
  const dish = popular.data?.dishes[0];

  return (
    <section className="relative overflow-hidden">
      <div className="container-page grid items-center gap-12 pt-6 pb-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 lg:pt-10 lg:pb-24">
        <div>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="eyebrow">
            Restaurants · Tables · Takeaway
          </motion.p>
          <h1 className="mt-5 text-[clamp(46px,7.4vw,96px)] leading-[0.95] text-ink">
            {['Good food', 'starts with'].map((line, i) => (
              <motion.span key={line} className="block" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.08 * i, ease: EASE }}>
                {line}
              </motion.span>
            ))}
            <motion.span className="block italic text-herb-700" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.16, ease: EASE }}>
              a{' '}
              <span className="relative inline-block">
                good table.
                <motion.svg viewBox="0 0 300 20" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-[0.22em] w-full text-saffron-400" aria-hidden>
                  <motion.path
                    d="M4 14 C 80 4, 180 4, 296 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="7"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.9, delay: 0.7, ease: EASE }}
                  />
                </motion.svg>
              </span>
            </motion.span>
          </h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3, ease: EASE }} className="mt-7 max-w-lg text-[17px] leading-relaxed text-ink-3">
            Find somewhere you'll love, reserve a table in seconds, or have dinner brought to your door — straight from the kitchens around you.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4, ease: EASE }} className="mt-8">
            <IntentSearch />
          </motion.div>
          {!!cuisines.data?.length && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-5 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[13px] text-ink-4">Popular:</span>
              {cuisines.data.slice(0, 6).map((c) => (
                <Link
                  key={c.name}
                  to={`/restaurants?cuisine=${encodeURIComponent(c.name)}`}
                  className="rounded-full border border-line bg-card/70 px-3 py-1.5 text-[13px] font-semibold text-ink-2 transition hover:-translate-y-0.5 hover:border-herb-500 hover:text-ink"
                >
                  {c.name}
                </Link>
              ))}
            </motion.div>
          )}
        </div>

        {/* The window: an arched pane onto the dining room, with live cards pinned to it. */}
        <div className="relative mx-auto w-full max-w-[520px] lg:mr-0">
          <motion.div
            aria-hidden
            className="absolute -top-6 -right-6 size-40 rounded-full bg-saffron-300/60 blur-2xl"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.4 }}
          />
          <motion.div
            className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[36px] border-[10px] border-card shadow-[var(--shadow-lift)]"
            initial={{ opacity: 0, y: 40, clipPath: 'inset(100% 0 0 0 round 999px 999px 36px 36px)' }}
            animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0 round 999px 999px 36px 36px)' }}
            transition={{ duration: 1.2, delay: 0.1, ease: EASE }}
          >
            <img src={heroPhoto} alt="Mille-feuille and coffee on a café table" className="size-full scale-105 object-cover" />
          </motion.div>
          <motion.img
            src={sidePhoto}
            alt=""
            className="absolute -bottom-6 -left-6 size-32 rounded-full border-[6px] border-card object-cover shadow-[var(--shadow-lift)] sm:size-40"
            initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: EASE }}
          />

          {star && (
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.85, ease: EASE }} className="absolute top-[16%] -left-4 sm:-left-14">
              <Link to={`/restaurants/${star._id}`} className="group flex w-64 items-center gap-3 rounded-[20px] border border-line bg-card/95 p-2.5 pr-4 shadow-[var(--shadow-lift)] backdrop-blur transition hover:-translate-y-1">
                <Photo src={star.images?.[0]} alt={star.name} label={star.name} className="size-14 shrink-0 rounded-2xl" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10.5px] font-semibold tracking-[0.16em] text-ink-4 uppercase">Tonight's pick</p>
                  <p className="truncate font-display text-[16px] text-ink">{star.name}</p>
                  <p className={cn('text-[12px] font-semibold', openState(star).open ? 'text-herb-600' : 'text-ink-4')}>
                    {openState(star).label}
                    {star.city && <span className="font-normal text-ink-4"> · {star.city}</span>}
                  </p>
                </div>
                <RatingSeal rating={star.rating} size="sm" />
              </Link>
            </motion.div>
          )}

          {dish && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.05, ease: EASE }} className="absolute right-2 -bottom-4 sm:-right-8">
              <Link
                to={`/restaurants/${dish.restaurant._id}?tab=menu&dish=${dish._id}`}
                className="block w-56 rotate-2 rounded-[18px] bg-herb-900 p-4 text-paper shadow-[var(--shadow-pop)] transition hover:rotate-0"
              >
                <p className="text-[10.5px] font-semibold tracking-[0.16em] text-saffron-300 uppercase">Loved this week</p>
                <p className="mt-1 font-display text-[18px] leading-tight">{dish.name}</p>
                <div className="mt-3 flex items-center justify-between border-t border-dashed border-paper/20 pt-2.5 text-[12.5px]">
                  <span className="inline-flex items-center gap-1 text-paper/70">
                    <MapPin className="size-3.5" /> {dish.restaurant.name}
                  </span>
                  <span className="font-semibold text-saffron-300">{money(dish.price)}</span>
                </div>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

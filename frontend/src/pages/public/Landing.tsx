import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight, BadgePercent, Bell, CalendarCheck, ChefHat, Compass, Gift, LayoutDashboard, Quote, Sparkles, Store } from 'lucide-react';
import { menuApi, promotionApi, restaurantApi, reviewApi } from '@/lib/api';
import { useMoney, usePublicSettings } from '@/lib/settings';
import { useExperience } from '@/stores/experience';
import { formatBookingDate } from '@/lib/format';
import { RestaurantCard, RestaurantCardSkeleton } from '@/components/RestaurantCard';
import { DishCard } from '@/components/DishCard';
import { Hero } from './landing/Hero';
import { Button, LinkButton, IconButton } from '@/ui/Button';
import { SectionTitle, Stars } from '@/ui/bits';
import skillet from '@/assets/photos/skillet-chicken.webp';
import burger from '@/assets/photos/burger.webp';
import fondant from '@/assets/photos/fondant.webp';

const EASE = [0.22, 1, 0.36, 1] as const;

function Stats() {
  const { data } = useQuery({ queryKey: ['platform-stats'], queryFn: restaurantApi.stats });
  if (!data?.restaurants) return null;
  const items = [
    { n: data.restaurants, l: data.restaurants === 1 ? 'restaurant' : 'restaurants' },
    data.cities > 0 && { n: data.cities, l: data.cities === 1 ? 'city' : 'cities' },
    data.reviews > 0 && { n: data.reviews, l: 'guest reviews' },
    data.avgRating > 0 && { n: data.avgRating.toFixed(1), l: 'average rating' },
  ].filter(Boolean) as Array<{ n: number | string; l: string }>;
  return (
    <div className="border-y border-line bg-card/50">
      <div className="container-page flex flex-wrap items-center justify-center gap-x-12 gap-y-4 py-6">
        {items.map((s, i) => (
          <motion.div key={s.l} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex items-baseline gap-2">
            <span className="font-display text-3xl text-herb-800 tabular-nums">{s.n}</span>
            <span className="text-sm text-ink-3">{s.l}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/** How it works, told as a three-course menu. */
function Courses() {
  const courses = [
    { n: 'i.', course: 'To start', title: 'Find your place', body: 'See who is open right now, what they cook and what guests say — or describe the evening you want to the concierge.', icon: Compass },
    { n: 'ii.', course: 'The main', title: 'Book or order', body: 'Choose a free time and your table is requested instantly. Hungry at home? Add dishes and check out in a minute.', icon: CalendarCheck },
    { n: 'iii.', course: 'Dessert', title: 'Enjoy, and earn', body: 'Follow your order from kitchen to door, get told when your table is confirmed, and collect points every visit.', icon: Gift },
  ];
  return (
    <section className="container-page py-24">
      <SectionTitle eyebrow="How it works" title={<>Dinner, in <span className="italic text-herb-700">three courses</span></>} />
      <div className="relative grid gap-5 md:grid-cols-3">
        <div aria-hidden className="absolute top-[54px] right-[16%] left-[16%] hidden border-t-[1.5px] border-dashed border-line-2 md:block" />
        {courses.map((c, i) => (
          <motion.div
            key={c.n}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: i * 0.12, ease: EASE }}
            className="group relative rounded-[26px] border border-line bg-card p-7 transition-shadow duration-500 hover:shadow-[var(--shadow-lift)]"
          >
            <div className="flex items-center justify-between">
              <span className="relative z-10 grid size-14 place-items-center rounded-full bg-paper font-display text-2xl text-herb-800 italic ring-8 ring-card transition-colors duration-500 group-hover:bg-herb-900 group-hover:text-saffron-300">
                {c.n}
              </span>
              <c.icon className="size-6 text-saffron-500 transition-transform duration-500 group-hover:-rotate-12" />
            </div>
            <p className="mt-6 text-[11px] font-semibold tracking-[0.2em] text-ink-4 uppercase">{c.course}</p>
            <h3 className="mt-1 text-[26px] leading-tight text-ink">{c.title}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-3">{c.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Featured() {
  const { data, isLoading } = useQuery({ queryKey: ['featured', 6], queryFn: () => restaurantApi.featured(6) });
  if (!isLoading && !data?.restaurants.length) return null;
  return (
    <section className="container-page pb-24">
      <SectionTitle
        eyebrow="Tonight around you"
        title="Tables worth booking"
        action={
          <LinkButton to="/restaurants" variant="outline" trail={<ArrowRight className="size-4" />}>
            Every restaurant
          </LinkButton>
        }
      />
      <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? [0, 1, 2].map((i) => <RestaurantCardSkeleton key={i} />) : data!.restaurants.map((r, i) => <RestaurantCard key={r._id} restaurant={r} index={i} />)}
      </div>
    </section>
  );
}

/** Two doors: reserve, or order in. The one you hover opens wider. */
function TwoDoors() {
  const doors = [
    { to: '/restaurants?service=dine_in', img: skillet, kicker: 'Dine in', title: 'Reserve a table', body: 'Pick a time that is actually free. The restaurant confirms, you just show up.', cta: 'Find a table' },
    { to: '/restaurants?service=delivery', img: burger, kicker: 'Delivery & pickup', title: 'Order to your door', body: 'Real menus and real prices, cooked when you order. Pay when it arrives.', cta: 'Order food' },
  ];
  return (
    <section className="container-page pb-24">
      <div className="flex flex-col gap-4 md:h-[480px] md:flex-row">
        {doors.map((d) => (
          <Link
            key={d.to}
            to={d.to}
            className="group relative flex min-h-[340px] flex-1 overflow-hidden rounded-[30px] transition-[flex-grow] duration-700 ease-[var(--ease-out-quint)] md:hover:flex-[1.45]"
          >
            <img src={d.img} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-quint)] group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-herb-950/90 via-herb-950/35 to-transparent" />
            <div className="relative mt-auto p-7 text-paper sm:p-9">
              <p className="text-[11px] font-semibold tracking-[0.22em] text-saffron-300 uppercase">{d.kicker}</p>
              <h3 className="mt-2 text-[36px] leading-none sm:text-[44px]">{d.title}</h3>
              <p className="mt-3 max-w-sm text-[15px] text-paper/75">{d.body}</p>
              <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-paper px-5 py-3 text-sm font-semibold text-herb-900 transition group-hover:bg-saffron-300">
                {d.cta} <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Dishes() {
  const { data } = useQuery({ queryKey: ['popular', 10], queryFn: () => menuApi.popular(10) });
  const rail = useRef<HTMLDivElement>(null);
  if (!data?.dishes.length) return null;
  const scroll = (dir: number) => rail.current?.scrollBy({ left: dir * rail.current.clientWidth * 0.8, behavior: 'smooth' });
  return (
    <section className="pb-24">
      <div className="container-page">
        <SectionTitle
          eyebrow="On everyone's plate"
          title="Dishes people keep ordering"
          action={
            <div className="hidden gap-2 sm:flex">
              <IconButton label="Previous dishes" tone="solid" onClick={() => scroll(-1)}>
                <ArrowLeft className="size-5" />
              </IconButton>
              <IconButton label="More dishes" tone="solid" onClick={() => scroll(1)}>
                <ArrowRight className="size-5" />
              </IconButton>
            </div>
          }
        />
      </div>
      <div ref={rail} className="scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-[max(16px,calc((100vw-1240px)/2+32px))] pb-2">
        {data.dishes.map((d, i) => (
          <div key={d._id} className="w-[240px] shrink-0 snap-start sm:w-[270px]">
            <DishCard dish={d} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Offers() {
  const money = useMoney();
  const { data } = useQuery({ queryKey: ['promotions', 'featured'], queryFn: () => promotionApi.featured(6) });
  if (!data?.promotions.length) return null;
  return (
    <section className="container-page pb-24">
      <SectionTitle eyebrow="On the house" title="Offers running right now" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.promotions.map((p, i) => (
          <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
            <Link
              to={`/restaurants/${p.restaurantId}?tab=menu`}
              className="group relative flex overflow-hidden rounded-[22px] border border-line bg-card transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
            >
              <div className="flex w-28 shrink-0 flex-col items-center justify-center border-r-[1.5px] border-dashed border-line-2 bg-saffron-50 px-3 text-center">
                <BadgePercent className="mb-1 size-5 text-saffron-600" />
                <span className="font-display text-3xl leading-none text-herb-900">{p.discountType === 'percentage' ? `${p.discountValue}%` : money(p.discountValue)}</span>
                <span className="mt-1 text-[11px] font-semibold tracking-wide text-ink-3 uppercase">off</span>
              </div>
              <div className="min-w-0 flex-1 p-5">
                <p className="truncate text-[12px] font-semibold text-ink-3">{p.restaurant?.name}</p>
                <p className="mt-0.5 font-display text-xl leading-tight text-ink">{p.name}</p>
                <p className="mt-2 text-[12.5px] text-ink-3">
                  {p.code ? (
                    <>
                      Code <span className="rounded-md bg-paper-2 px-1.5 py-0.5 font-mono font-semibold text-ink">{p.code}</span>
                    </>
                  ) : (
                    'Applied automatically at checkout'
                  )}
                  {p.minOrder > 0 && ` · min ${money(p.minOrder)}`}
                </p>
                <p className="mt-1 text-[11.5px] text-ink-4">Until {formatBookingDate(p.endDate, { day: 'numeric', month: 'short' })}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function GuestBook() {
  const { data } = useQuery({ queryKey: ['reviews', 'featured'], queryFn: () => reviewApi.featured(6) });
  if (!data?.length) return null;
  return (
    <section className="relative overflow-hidden bg-paper-2/70 py-24">
      <div className="container-page">
        <SectionTitle eyebrow="From the guest book" title="What people said on the way out" />
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {data.map((r, i) => (
            <motion.figure
              key={r._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="mb-5 break-inside-avoid rounded-[22px] border border-line bg-card p-6"
            >
              <Quote className="size-6 text-saffron-400" />
              <blockquote className="mt-3 font-display text-[19px] leading-snug text-ink">“{r.comment}”</blockquote>
              <figcaption className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
                <div>
                  <p className="text-sm font-semibold text-ink">{r.customerName || 'A guest'}</p>
                  <Link to={`/restaurants/${r.restaurant._id}`} className="text-[13px] text-herb-700 hover:underline">
                    at {r.restaurant.name}
                  </Link>
                </div>
                <Stars value={r.rating} />
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function AskBand() {
  const ask = useExperience((s) => s.ask);
  const prompts = ['A quiet dinner for two tonight', 'Where can I get good pizza delivered?', 'Somewhere for 8 people on Saturday', 'Vegetarian dishes under 12'];
  return (
    <section className="container-page py-24">
      <div className="relative overflow-hidden rounded-[34px] bg-herb-900 px-6 py-14 text-paper sm:px-14">
        <img src={fondant} alt="" className="absolute top-0 right-0 hidden h-full w-[38%] object-cover opacity-90 lg:block" style={{ maskImage: 'linear-gradient(to right, transparent, black 40%)' }} />
        <div className="relative max-w-xl">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] text-saffron-300 uppercase">
            <Sparkles className="size-4" /> The concierge
          </p>
          <h2 className="mt-4 text-[38px] leading-[1.05] sm:text-[52px]">
            Not sure what you want? <span className="italic text-saffron-300">Just ask.</span>
          </h2>
          <p className="mt-4 text-[16px] text-paper/70">Describe the evening in your own words. The concierge searches every restaurant, reads the menus and checks which tables are really free.</p>
          <div className="mt-7 flex flex-wrap gap-2">
            {prompts.map((p) => (
              <button key={p} onClick={() => ask(p)} className="rounded-full border border-paper/20 bg-paper/5 px-4 py-2.5 text-left text-[14px] text-paper transition hover:border-saffron-300 hover:bg-paper/10">
                “{p}”
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PartnerBand() {
  const { data } = usePublicSettings();
  const starter = data?.plans?.starter;
  const features = [
    { icon: CalendarCheck, t: 'Bookings that fill the room', b: 'Guests only see times you can seat — no double bookings, ever.' },
    { icon: ChefHat, t: 'A live kitchen screen', b: 'New orders arrive instantly. Accept, prepare, hand over.' },
    { icon: LayoutDashboard, t: 'Numbers that are real', b: 'Revenue, top dishes and busy hours from your own service.' },
    { icon: Bell, t: 'Guests kept in the loop', b: 'Every confirmation and status change reaches them automatically.' },
  ];
  return (
    <section className="container-page pb-8">
      <div className="grid gap-10 rounded-[34px] border border-line bg-card p-6 sm:p-12 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="eyebrow">For restaurants</p>
          <h2 className="mt-4 text-[38px] leading-[1.05] text-ink sm:text-[48px]">
            Your kitchen, <span className="italic text-herb-700">fully booked.</span>
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-ink-3">
            List your restaurant in minutes and take reservations and orders from one calm dashboard.
            {starter && ` No monthly fee to start — we only earn ${Math.round(starter.commissionRate * 100)}% when you do.`}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton to="/partner/join" variant="primary" size="lg" icon={<Store className="size-4" />}>
              List your restaurant
            </LinkButton>
            <LinkButton to="/partner" variant="outline" size="lg">
              How it works
            </LinkButton>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f, i) => (
            <motion.div key={f.t} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="rounded-[20px] bg-paper p-5">
              <f.icon className="size-5 text-herb-600" />
              <p className="mt-3 font-semibold text-ink">{f.t}</p>
              <p className="mt-1 text-[14px] text-ink-3">{f.b}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  const openGuide = useExperience((s) => s.openGuide);
  return (
    <>
      <Hero />
      <Stats />
      <Courses />
      <Featured />
      <TwoDoors />
      <Dishes />
      <Offers />
      <GuestBook />
      <AskBand />
      <PartnerBand />
      <div className="container-page pt-10 text-center">
        <Button variant="ghost" onClick={openGuide} icon={<Sparkles className="size-4 text-saffron-500" />}>
          New here? Take the two-minute tour
        </Button>
      </div>
    </>
  );
}

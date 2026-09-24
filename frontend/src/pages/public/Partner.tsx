import { motion } from 'motion/react';
import { ArrowRight, BarChart3, Bell, CalendarCheck, Check, ChefHat, QrCode, Sparkles, Store, UtensilsCrossed } from 'lucide-react';
import { useMoney, usePublicSettings } from '@/lib/settings';
import { useAuth } from '@/auth/useAuth';
import { LinkButton } from '@/ui/Button';
import { SectionTitle } from '@/ui/bits';
import chicken from '@/assets/photos/roast-chicken.webp';
import wings from '@/assets/photos/wings.webp';

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Partner() {
  const { data } = usePublicSettings();
  const money = useMoney();
  const { user } = useAuth();
  const ctaTo = user?.role === 'owner' ? '/owner' : '/partner/join';
  const ctaLabel = user?.role === 'owner' ? 'Open my dashboard' : 'List your restaurant';
  const plans = data?.plans;

  const features = [
    { icon: CalendarCheck, title: 'Reservations without the phone', body: 'Guests pick from times you can actually seat. Tables and capacity are respected automatically — double bookings are impossible.' },
    { icon: ChefHat, title: 'A kitchen screen that keeps up', body: 'Orders land the moment they are placed. Move them from new to ready with one tap; guests follow every step.' },
    { icon: UtensilsCrossed, title: 'Your menu, always current', body: 'Change a price, mark a dish sold out, add a photo — guests see it immediately. Orders always use today’s price.' },
    { icon: BarChart3, title: 'Numbers you can trust', body: 'Revenue, busiest hours, best sellers and repeat guests, calculated from your real service.' },
    { icon: Bell, title: 'Guests kept informed', body: 'Confirmations, cancellations and “your food is ready” go out automatically.' },
    { icon: QrCode, title: 'QR codes for every table', body: 'Print a code per table so walk-in guests can see your menu and reviews instantly.' },
  ];

  return (
    <div>
      <section className="container-page grid items-center gap-12 pt-8 pb-20 lg:grid-cols-2">
        <div>
          <p className="eyebrow">For restaurants</p>
          <h1 className="mt-5 text-[clamp(44px,6.5vw,84px)] leading-[0.95] text-ink">
            Your kitchen, <span className="italic text-herb-700">fully booked.</span>
          </h1>
          <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-ink-3">
            TableNest brings you guests who are ready to book and order — and gives you one calm screen to run the whole service.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton to={ctaTo} variant="primary" size="lg" icon={<Store className="size-4" />} trail={<ArrowRight className="size-4" />}>
              {ctaLabel}
            </LinkButton>
            <LinkButton to="#plans" variant="outline" size="lg">
              See plans
            </LinkButton>
          </div>
          <p className="mt-4 text-[13px] text-ink-4">Set up takes about five minutes. No card needed.</p>
        </div>
        <div className="relative mx-auto h-[440px] w-full max-w-[520px]">
          <motion.img
            src={chicken}
            alt=""
            className="absolute top-0 right-0 h-[82%] w-[76%] rounded-[32px] object-cover shadow-[var(--shadow-lift)]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
          />
          <motion.img
            src={wings}
            alt=""
            className="absolute bottom-0 left-0 h-[52%] w-[52%] rounded-[28px] border-8 border-paper object-cover shadow-[var(--shadow-lift)]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
          />
        </div>
      </section>

      <section className="container-page pb-24">
        <SectionTitle eyebrow="What you get" title="Everything a busy service needs" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="rounded-[24px] border border-line bg-card p-6">
              <span className="grid size-11 place-items-center rounded-2xl bg-herb-900 text-saffron-300">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-5 text-[22px] leading-tight text-ink">{f.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-3">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="plans" className="scroll-mt-24 bg-herb-950 py-24 text-paper">
        <div className="container-page">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-saffron-300 uppercase">Plans</p>
          <h2 className="mt-3 text-[40px] leading-tight sm:text-[52px]">
            Simple, and only when <span className="italic text-saffron-300">you earn.</span>
          </h2>
          <p className="mt-3 max-w-xl text-paper/70">Commission is a share of food sales on completed orders. Booking a table is always free for guests.</p>
          {plans ? (
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {(['starter', 'pro'] as const).map((key) => {
                const p = plans[key];
                const pro = key === 'pro';
                return (
                  <div key={key} className={pro ? 'relative rounded-[28px] bg-paper p-8 text-ink' : 'rounded-[28px] p-8 ring-1 ring-paper/15'}>
                    {pro && (
                      <span className="absolute -top-3 left-8 inline-flex items-center gap-1 rounded-full bg-saffron-400 px-3 py-1 text-[12px] font-bold text-herb-950">
                        <Sparkles className="size-3.5" /> For busy kitchens
                      </span>
                    )}
                    <p className={pro ? 'font-display text-2xl text-ink' : 'font-display text-2xl'}>{pro ? 'Pro' : 'Starter'}</p>
                    <p className="mt-6 flex items-baseline gap-2">
                      <span className="font-display text-6xl">{Math.round(p.commissionRate * 100)}%</span>
                      <span className={pro ? 'text-ink-3' : 'text-paper/60'}>of food sales</span>
                    </p>
                    <p className={pro ? 'mt-1 text-ink-3' : 'mt-1 text-paper/60'}>{p.monthlyFee > 0 ? `+ ${money(p.monthlyFee)} per month` : 'No monthly fee'}</p>
                    <ul className="mt-7 space-y-2.5 text-[15px]">
                      {['Unlimited bookings and orders', 'Menu, tables and photos', 'Live kitchen screen', 'Analytics and monthly statement', ...(pro ? ['Lower commission on every order', 'Eligible for featured placement'] : [])].map((f) => (
                        <li key={f} className="flex items-center gap-2.5">
                          <Check className={pro ? 'size-4 text-herb-600' : 'size-4 text-saffron-300'} /> {f}
                        </li>
                      ))}
                    </ul>
                    <LinkButton to={ctaTo} variant={pro ? 'primary' : 'light'} size="lg" block className="mt-8">
                      {user?.role === 'owner' ? 'Open dashboard' : pro ? 'Start, upgrade anytime' : 'Start free'}
                    </LinkButton>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-12 h-64 animate-pulse rounded-[28px] bg-paper/5" />
          )}
          {!!data?.serviceFeeRate && (
            <p className="mt-6 text-[13px] text-paper/50">Guests also pay a {Math.round(data.serviceFeeRate * 100)}% service fee at checkout, which supports the platform.</p>
          )}
        </div>
      </section>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Bell, CalendarCheck, Compass, Heart, LayoutDashboard, MessageCircle, Search, ShoppingBag, Store, Telescope, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { useExperience, type Persona } from '@/stores/experience';
import { cn } from '@/lib/format';
import { Modal } from '@/ui/Overlay';
import { Button } from '@/ui/Button';

const PERSONAS: Array<{ id: Persona; title: string; body: string; icon: typeof Compass }> = [
  { id: 'customer', title: "I'm hungry", body: 'Find a place, book a table or order food.', icon: UtensilsCrossed },
  { id: 'owner', title: 'I run a restaurant', body: 'Take bookings and orders on TableNest.', icon: Store },
  { id: 'browsing', title: 'Just looking around', body: 'Show me what this is about.', icon: Telescope },
];

type Step = { icon: typeof Compass; title: string; body: string };
const PATHS: Record<Persona, { heading: string; steps: Step[] }> = {
  customer: {
    heading: 'Dinner in three moves',
    steps: [
      { icon: Search, title: 'Find your place', body: 'Browse by cuisine, see who is open right now, or just tell the concierge what you feel like.' },
      { icon: CalendarCheck, title: 'Book or order', body: 'Pick a free time slot for a table, or add dishes and check out. You pay at the restaurant or on delivery.' },
      { icon: Bell, title: 'Follow along, earn points', body: 'Watch your order move from kitchen to door, get told when your booking is confirmed, and collect rewards.' },
    ],
  },
  owner: {
    heading: 'Open your doors online',
    steps: [
      { icon: Store, title: 'List your restaurant', body: 'A five-minute setup: your details, hours, photos and how you serve — dine-in, delivery or pickup.' },
      { icon: UtensilsCrossed, title: 'Add your menu and tables', body: 'Prices, photos and availability you can change any time. Guests always see the latest.' },
      { icon: LayoutDashboard, title: 'Run service from one screen', body: 'Bookings and orders arrive live on your dashboard. Accept, prepare, done.' },
    ],
  },
  browsing: {
    heading: 'A quick look around',
    steps: [
      { icon: Compass, title: 'Wander the city', body: 'Every restaurant card tells you if it is open, how you can eat there and what people think.' },
      { icon: MessageCircle, title: 'Ask anything', body: 'The concierge understands plain questions — “quiet place for four on Friday?” — and finds real answers.' },
      { icon: Heart, title: 'Keep what you like', body: 'Save restaurants with the heart and come back when you are ready.' },
    ],
  },
};

export function Guide() {
  const { guideOpen, closeGuide, persona, setPersona, ask } = useExperience();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chosen, setChosen] = useState<Persona | null>(null);
  const active = chosen ?? null;

  const close = () => {
    closeGuide();
    setTimeout(() => setChosen(null), 300);
  };
  const go = (to: string) => {
    close();
    navigate(to);
  };
  const pick = (p: Persona) => {
    setPersona(p);
    setChosen(p);
  };

  return (
    <Modal open={guideOpen} onClose={close} size="lg">
      <AnimatePresence mode="wait" initial={false}>
        {!active ? (
          <motion.div key="choose" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="pt-2 pb-4">
            <p className="eyebrow">Welcome</p>
            <h2 className="mt-3 text-[34px] leading-tight text-ink">What brings you to TableNest?</h2>
            <p className="mt-2 text-ink-3">We'll show you the fastest way in. You can change this any time.</p>
            <div className="mt-7 grid gap-3">
              {PERSONAS.map((p, i) => (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i + 0.1 }}
                  onClick={() => pick(p.id)}
                  data-autofocus={i === 0 ? true : undefined}
                  className={cn(
                    'group flex items-center gap-4 rounded-[20px] border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:border-herb-500 hover:shadow-[var(--shadow-card)]',
                    persona === p.id ? 'border-herb-500' : 'border-line',
                  )}
                >
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-paper-2 text-herb-700 transition group-hover:bg-herb-900 group-hover:text-saffron-300">
                    <p.icon className="size-6" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-display text-xl text-ink">{p.title}</span>
                    <span className="text-sm text-ink-3">{p.body}</span>
                  </span>
                  <ArrowRight className="size-5 text-ink-4 transition group-hover:translate-x-1 group-hover:text-herb-600" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key={active} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="pt-2 pb-2">
            <button onClick={() => setChosen(null)} className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-3 hover:text-ink">
              <ArrowLeft className="size-4" /> Change
            </button>
            <h2 className="text-[32px] leading-tight text-ink">{PATHS[active].heading}</h2>
            <ol className="relative mt-7 space-y-6">
              <motion.span
                aria-hidden
                className="absolute top-6 bottom-6 left-[23px] w-px origin-top bg-line-2"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
              {PATHS[active].steps.map((s, i) => (
                <motion.li key={s.title} className="relative flex gap-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.15 }}>
                  <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-full border border-line bg-card font-display text-lg text-herb-800">
                    {i + 1}
                  </span>
                  <div className="pt-1">
                    <p className="flex items-center gap-2 text-[17px] font-semibold text-ink">
                      <s.icon className="size-4 text-saffron-600" /> {s.title}
                    </p>
                    <p className="mt-1 text-[14.5px] leading-relaxed text-ink-3">{s.body}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
            <div className="mt-8 flex flex-col gap-2 sm:flex-row">
              {active === 'customer' && (
                <>
                  <Button variant="primary" size="lg" trail={<ArrowRight className="size-4" />} onClick={() => go('/restaurants')}>
                    Find a restaurant
                  </Button>
                  {!user && (
                    <Button variant="outline" size="lg" onClick={() => go('/register')}>
                      Create a free account
                    </Button>
                  )}
                </>
              )}
              {active === 'owner' && (
                <>
                  <Button variant="primary" size="lg" trail={<ArrowRight className="size-4" />} onClick={() => go(user?.role === 'owner' ? '/owner' : '/partner/join')}>
                    {user?.role === 'owner' ? 'Open my dashboard' : 'List my restaurant'}
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => go('/partner#plans')}>
                    See plans
                  </Button>
                </>
              )}
              {active === 'browsing' && (
                <>
                  <Button variant="dark" size="lg" icon={<ShoppingBag className="size-4" />} onClick={() => go('/restaurants')}>
                    Start exploring
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    icon={<MessageCircle className="size-4" />}
                    onClick={() => {
                      close();
                      ask('');
                    }}
                  >
                    Ask the concierge
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}

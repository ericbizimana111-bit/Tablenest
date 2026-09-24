import { Link } from 'react-router-dom';
import { ArrowUpRight, Armchair, Store } from 'lucide-react';
import { useExperience } from '@/stores/experience';
import { usePublicSettings } from '@/lib/settings';
import { LogoMark } from '@/ui/Logo';

const COLS: Array<{ title: string; links: Array<{ to: string; label: string } | { guide: true; label: string }> }> = [
  {
    title: 'Eat',
    links: [
      { to: '/restaurants', label: 'Discover restaurants' },
      { to: '/restaurants?service=dine_in', label: 'Book a table' },
      { to: '/restaurants?service=delivery', label: 'Order for delivery' },
      { to: '/restaurants?service=pickup', label: 'Pick up on your way' },
    ],
  },
  {
    title: 'Restaurants',
    links: [
      { to: '/partner', label: 'List your restaurant' },
      { to: '/partner#plans', label: 'Plans & pricing' },
      { to: '/owner', label: 'Partner dashboard' },
    ],
  },
  {
    title: 'Help',
    links: [
      { guide: true, label: 'How TableNest works' },
      { to: '/help', label: 'Help centre' },
      { to: '/about', label: 'Our story' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { to: '/terms', label: 'Terms of use' },
      { to: '/privacy', label: 'Privacy' },
    ],
  },
];

export function Footer() {
  const openGuide = useExperience((s) => s.openGuide);
  const { data: settings } = usePublicSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 overflow-hidden bg-herb-950 text-paper [--notch-bg:var(--color-herb-950)]">
      <div className="container-page">
        {/* Two doors out: eat, or join as a restaurant */}
        <div className="grid gap-4 border-b border-paper/10 py-12 md:grid-cols-2">
          <Link to="/restaurants" className="group flex items-center justify-between gap-6 rounded-[24px] bg-paper/[0.04] p-7 ring-1 ring-paper/10 transition hover:bg-paper/[0.08]">
            <span className="flex items-center gap-4">
              <span className="grid size-12 place-items-center rounded-2xl bg-saffron-400 text-herb-950">
                <Armchair className="size-5" />
              </span>
              <span>
                <span className="block font-display text-2xl">Hungry already?</span>
                <span className="text-sm text-paper/60">Tables and takeaway near you, live.</span>
              </span>
            </span>
            <ArrowUpRight className="size-6 text-paper/50 transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-saffron-300" />
          </Link>
          <Link to="/partner" className="group flex items-center justify-between gap-6 rounded-[24px] bg-paper/[0.04] p-7 ring-1 ring-paper/10 transition hover:bg-paper/[0.08]">
            <span className="flex items-center gap-4">
              <span className="grid size-12 place-items-center rounded-2xl bg-paper text-herb-900">
                <Store className="size-5" />
              </span>
              <span>
                <span className="block font-display text-2xl">Run a restaurant?</span>
                <span className="text-sm text-paper/60">Bookings, orders and payouts in one place.</span>
              </span>
            </span>
            <ArrowUpRight className="size-6 text-paper/50 transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-saffron-300" />
          </Link>
        </div>

        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <LogoMark tone="light" className="size-9" />
              <span className="font-display text-2xl">
                Table<span className="italic">Nest</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-paper/60">
              A warmer way to find somewhere good to eat — book the table, order the dish, and let the kitchen know you're coming.
            </p>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <p className="mb-4 text-[11px] font-semibold tracking-[0.2em] text-saffron-300 uppercase">{c.title}</p>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    {'guide' in l ? (
                      <button onClick={openGuide} className="text-[14px] text-paper/75 transition hover:text-paper">
                        {l.label}
                      </button>
                    ) : (
                      <Link to={l.to} className="text-[14px] text-paper/75 transition hover:text-paper">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-paper/10 py-6 text-[12.5px] text-paper/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} TableNest. Made for people who love a good table.</p>
          {settings?.currency && <p>Prices shown in {settings.currency}. Payment in person at the restaurant or on delivery.</p>}
        </div>
      </div>

      {/* Typeset sign-off */}
      <div aria-hidden className="pointer-events-none select-none px-4 pb-24 text-center font-display text-[20vw] leading-[0.78] font-semibold tracking-[-0.05em] text-paper/[0.05] md:pb-0 lg:text-[17vw]">
        TableNest
      </div>
    </footer>
  );
}

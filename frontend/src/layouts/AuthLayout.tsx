import { Link, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/ui/Logo';
import { ScrollToTop } from './PublicLayout';
import croquettes from '@/assets/photos/croquettes.webp';
import pastry from '@/assets/photos/mille-feuille.webp';
import chicken from '@/assets/photos/roast-chicken.webp';

const SCENES: Record<string, { img: string; line: string; by: string }> = {
  '/login': { img: pastry, line: 'The best seat in the house is the one that is waiting for you.', by: 'Welcome back' },
  '/register': { img: croquettes, line: 'Save your favourites, book in seconds, and earn something every time you eat out.', by: 'A free diner account' },
  '/partner/join': { img: chicken, line: 'Bookings, orders and your menu — run the whole service from one calm screen.', by: 'For restaurants' },
};

/** Split screen: the form on the left, a plate of food and one quiet line on the right. */
export function AuthLayout() {
  const { pathname } = useLocation();
  const scene = SCENES[pathname] ?? SCENES['/login'];
  const wide = pathname === '/partner/join';

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      <ScrollToTop />
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <Link to="/" className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold text-ink-3 transition hover:bg-paper-2 hover:text-ink">
            <ArrowLeft className="size-4" /> Back to TableNest
          </Link>
        </div>
        <main id="main" className="flex flex-1 items-center justify-center py-10">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={wide ? 'w-full max-w-xl' : 'w-full max-w-[420px]'}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <aside className="relative hidden overflow-hidden bg-herb-950 lg:block">
        <AnimatePresence mode="wait">
          <motion.img
            key={scene.img}
            src={scene.img}
            alt=""
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 size-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-herb-950/90 via-herb-950/20 to-transparent" />
        <div className="absolute inset-x-10 bottom-10 text-paper">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-saffron-300 uppercase">{scene.by}</p>
          <p className="mt-3 max-w-md font-display text-[32px] leading-[1.15]">{scene.line}</p>
        </div>
      </aside>
    </div>
  );
}

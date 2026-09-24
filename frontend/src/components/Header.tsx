import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Armchair, Bike, Compass, LogIn, Menu, Search, ShoppingBag, Sparkles, Store } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { homeFor } from '@/auth/AuthProvider';
import { cartCount, useCart } from '@/stores/cart';
import { useShell } from '@/stores/shell';
import { useExperience } from '@/stores/experience';
import { cn } from '@/lib/format';
import { Logo } from '@/ui/Logo';
import { IconButton, LinkButton } from '@/ui/Button';
import { Drawer } from '@/ui/Overlay';
import { AccountMenu } from './AccountMenu';
import { NotificationBell } from './NotificationBell';

export const NAV = [
  { to: '/restaurants', label: 'Discover', icon: Compass, match: (p: string, s: string) => p === '/restaurants' && !s.includes('service=') },
  { to: '/restaurants?service=dine_in', label: 'Book a table', icon: Armchair, match: (_p: string, s: string) => s.includes('service=dine_in') },
  { to: '/restaurants?service=delivery', label: 'Order in', icon: Bike, match: (_p: string, s: string) => s.includes('service=delivery') },
  { to: '/partner', label: 'For restaurants', icon: Store, match: (p: string) => p.startsWith('/partner') },
];

export function Header() {
  const { user } = useAuth();
  const lines = useCart((s) => s.lines);
  const { setSearch, setCart, menuOpen, setMenu } = useShell();
  const openGuide = useExperience((s) => s.openGuide);
  const [scrolled, setScrolled] = useState(false);
  const { pathname, search } = useLocation();
  const count = cartCount(lines);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setSearch]);

  useEffect(() => setMenu(false), [pathname, search, setMenu]);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-500',
          scrolled ? 'bg-paper/82 shadow-[0_1px_0_var(--color-line)] backdrop-blur-xl backdrop-saturate-150' : 'bg-transparent',
        )}
      >
        <div className="container-page flex h-[72px] items-center gap-4">
          <Logo className="shrink-0" />

          <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV.map((n) => {
              const active = n.match(pathname, search);
              return (
                <NavLink key={n.to} to={n.to} className={cn('relative rounded-full px-3.5 py-2 text-[14px] font-semibold transition-colors', active ? 'text-ink' : 'text-ink-3 hover:text-ink')}>
                  {active && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-paper-2" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                  {n.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => setSearch(true)}
              className="hidden h-10 items-center gap-2 rounded-full border border-line bg-card pr-2 pl-3.5 text-[13.5px] text-ink-3 transition hover:border-line-2 hover:text-ink md:flex"
            >
              <Search className="size-4" />
              <span className="w-32 text-left lg:w-40">Search food…</span>
              <kbd className="rounded-md bg-paper-2 px-1.5 py-0.5 text-[11px] font-semibold text-ink-3">⌘K</kbd>
            </button>
            <IconButton label="Search" onClick={() => setSearch(true)} className="md:hidden">
              <Search className="size-5" />
            </IconButton>

            {(!user || user.role === 'customer') && (
              <IconButton label={count ? `Your bag, ${count} items` : 'Your bag'} onClick={() => setCart(true)}>
                <ShoppingBag className="size-5" />
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      key={count}
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute top-1 right-0.5 grid min-w-[18px] place-items-center rounded-full bg-tomato-500 px-1 text-[10.5px] leading-[18px] font-bold text-white ring-2 ring-paper"
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </IconButton>
            )}

            {user ? (
              <>
                <div className="hidden sm:block">
                  <NotificationBell allHref={user.role === 'owner' ? '/owner/notifications' : '/notifications'} />
                </div>
                <div className="hidden md:block">
                  <AccountMenu />
                </div>
              </>
            ) : (
              <div className="ml-1 hidden items-center gap-1 md:flex">
                <LinkButton to="/login" variant="ghost" size="sm">
                  Sign in
                </LinkButton>
                <LinkButton to="/register" variant="dark" size="sm">
                  Join free
                </LinkButton>
              </div>
            )}

            <IconButton label="Open menu" onClick={() => setMenu(true)} className="md:hidden">
              <Menu className="size-5" />
            </IconButton>
          </div>
        </div>
      </header>

      <Drawer open={menuOpen} onClose={() => setMenu(false)} title={<Logo />}>
        <nav className="flex flex-col p-4" aria-label="Mobile">
          {NAV.map((n, i) => (
            <motion.div key={n.to} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
              <Link to={n.to} className="flex items-center gap-4 rounded-2xl px-3 py-3.5 text-lg font-semibold text-ink hover:bg-paper">
                <span className="grid size-10 place-items-center rounded-xl bg-paper-2 text-herb-700">
                  <n.icon className="size-5" />
                </span>
                {n.label}
              </Link>
            </motion.div>
          ))}
          <button onClick={() => (setMenu(false), openGuide())} className="flex items-center gap-4 rounded-2xl px-3 py-3.5 text-left text-lg font-semibold text-ink hover:bg-paper">
            <span className="grid size-10 place-items-center rounded-xl bg-saffron-100 text-saffron-700">
              <Sparkles className="size-5" />
            </span>
            How TableNest works
          </button>
          <div className="mt-6 border-t border-line pt-6">
            {user ? (
              <LinkButton to={homeFor(user.role)} variant="dark" size="lg" block>
                {user.role === 'customer' ? 'My table' : 'Open dashboard'}
              </LinkButton>
            ) : (
              <div className="grid gap-2">
                <LinkButton to="/register" variant="primary" size="lg" block>
                  Create a free account
                </LinkButton>
                <LinkButton to="/login" variant="outline" size="lg" block icon={<LogIn className="size-4" />}>
                  Sign in
                </LinkButton>
              </div>
            )}
          </div>
        </nav>
      </Drawer>
    </>
  );
}

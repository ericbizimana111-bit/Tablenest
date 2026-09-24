import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileTabBar } from '@/components/MobileTabBar';
import { SearchPalette } from '@/components/SearchPalette';
import { CartDrawer } from '@/components/CartDrawer';
import { Guide } from '@/components/Guide';
import { Concierge } from '@/components/Concierge';
import { useShell } from '@/stores/shell';

export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) return void setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 80);
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

export function PublicLayout() {
  const { pathname } = useLocation();
  const { searchOpen, setSearch, cartOpen, setCart } = useShell();
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only rounded-full bg-herb-900 px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100]">
        Skip to content
      </a>
      <ScrollToTop />
      <Header />
      <motion.main
        id="main"
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1"
      >
        <Outlet />
      </motion.main>
      <Footer />
      <MobileTabBar />
      <SearchPalette open={searchOpen} onClose={() => setSearch(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCart(false)} />
      <Guide />
      <Concierge />
    </div>
  );
}

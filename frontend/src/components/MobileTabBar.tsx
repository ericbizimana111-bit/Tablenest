import { NavLink } from 'react-router-dom';
import { Compass, House, Receipt, Search, UserRound } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { useShell } from '@/stores/shell';
import { cn } from '@/lib/format';

/** Thumb-reach navigation for phones. Hidden from md up, where the header carries everything. */
export function MobileTabBar() {
  const { user } = useAuth();
  const setSearch = useShell((s) => s.setSearch);
  if (user && user.role !== 'customer') return null;
  const item = 'flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-semibold transition-colors';
  const cls = ({ isActive }: { isActive: boolean }) => cn(item, isActive ? 'text-herb-800' : 'text-ink-4');

  return (
    <nav
      aria-label="Quick"
      className="fixed inset-x-3 bottom-[max(10px,env(safe-area-inset-bottom))] z-40 flex rounded-[22px] border border-line bg-card/92 px-2 shadow-[var(--shadow-pop)] backdrop-blur-xl md:hidden"
    >
      <NavLink to={user ? '/home' : '/'} end className={cls}>
        <House className="size-5" /> Home
      </NavLink>
      <NavLink to="/restaurants" className={cls}>
        <Compass className="size-5" /> Discover
      </NavLink>
      <button onClick={() => setSearch(true)} className={cn(item, 'text-ink-4')}>
        <span className="-mt-5 grid size-12 place-items-center rounded-full bg-tomato-500 text-white shadow-[0_10px_20px_-8px_rgb(217_71_43/0.9)] ring-4 ring-paper">
          <Search className="size-5" />
        </span>
        Search
      </button>
      <NavLink to={user ? '/my-orders' : '/login'} className={cls}>
        <Receipt className="size-5" /> Orders
      </NavLink>
      <NavLink to={user ? '/settings' : '/register'} className={cls}>
        <UserRound className="size-5" /> {user ? 'Profile' : 'Join'}
      </NavLink>
    </nav>
  );
}

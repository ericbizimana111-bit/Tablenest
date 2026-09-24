import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarDays, ChevronDown, Gift, Heart, House, LayoutDashboard, LogOut, Receipt, Settings, ShieldCheck, UserPlus } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { Avatar } from '@/ui/bits';

export function AccountMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  if (!user) return null;
  const links =
    user.role === 'owner'
      ? [{ to: '/owner', label: 'Restaurant dashboard', icon: LayoutDashboard }]
      : user.role === 'admin'
        ? [{ to: '/admin', label: 'Platform admin', icon: ShieldCheck }]
        : [
            { to: '/home', label: 'My table', icon: House },
            { to: '/my-orders', label: 'Orders', icon: Receipt },
            { to: '/my-bookings', label: 'Bookings', icon: CalendarDays },
            { to: '/favorites', label: 'Favourites', icon: Heart },
            { to: '/rewards', label: 'Rewards', icon: Gift },
            { to: '/referrals', label: 'Invite friends', icon: UserPlus },
          ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-line bg-card py-1 pr-3 pl-1 transition hover:border-line-2"
      >
        <Avatar name={user.fullName} src={user.avatar} size={32} className="ring-0" />
        <span className="hidden max-w-28 truncate text-sm font-semibold text-ink lg:block">{user.fullName.split(' ')[0]}</span>
        <ChevronDown className={`size-4 text-ink-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl border border-line bg-card p-1.5 shadow-[var(--shadow-pop)]"
          >
            <div className="px-3 pt-2.5 pb-3">
              <p className="truncate text-sm font-semibold text-ink">{user.fullName}</p>
              <p className="truncate text-xs text-ink-3">{user.email}</p>
            </div>
            <div className="h-px bg-line" />
            <div className="py-1">
              {links.map((l) => (
                <Link key={l.to} to={l.to} role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-2 transition hover:bg-paper hover:text-ink">
                  <l.icon className="size-4 text-ink-3" /> {l.label}
                </Link>
              ))}
              {user.role === 'customer' && (
                <Link to="/settings" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-2 transition hover:bg-paper hover:text-ink">
                  <Settings className="size-4 text-ink-3" /> Account settings
                </Link>
              )}
            </div>
            <div className="h-px bg-line" />
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                signOut();
                navigate('/');
              }}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-tomato-600 transition hover:bg-tomato-50"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

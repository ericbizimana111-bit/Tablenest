import { NavLink, Outlet } from 'react-router-dom';
import { Bell, CalendarDays, Gift, Heart, House, MapPin, Receipt, Settings, UserPlus } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { cn } from '@/lib/format';
import { Avatar } from '@/ui/bits';

const LINKS = [
  { to: '/home', label: 'My table', icon: House },
  { to: '/my-orders', label: 'Orders', icon: Receipt },
  { to: '/my-bookings', label: 'Bookings', icon: CalendarDays },
  { to: '/favorites', label: 'Favourites', icon: Heart },
  { to: '/rewards', label: 'Rewards', icon: Gift },
  { to: '/referrals', label: 'Invite friends', icon: UserPlus },
  { to: '/notifications', label: 'Updates', icon: Bell },
  { to: '/settings', label: 'Profile & security', icon: Settings, end: true },
  { to: '/settings/addresses', label: 'Addresses & cards', icon: MapPin },
];

export function AccountLayout() {
  const { user } = useAuth();
  return (
    <div className="container-page grid gap-8 pt-4 pb-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:pt-8">
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          {user && (
            <div className="mb-5 flex items-center gap-3 px-2">
              <Avatar name={user.fullName} src={user.avatar} size={44} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{user.fullName}</p>
                <p className="truncate text-xs text-ink-3">{user.email}</p>
              </div>
            </div>
          )}
          <nav className="flex flex-col gap-0.5" aria-label="Account">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[14px] font-semibold transition',
                    isActive ? 'bg-herb-900 text-paper' : 'text-ink-2 hover:bg-paper-2 hover:text-ink',
                  )
                }
              >
                <l.icon className="size-[18px]" /> {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      <div className="min-w-0">
        <nav className="scrollbar-none -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 lg:hidden" aria-label="Account sections">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  'inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-[13px] font-semibold transition',
                  isActive ? 'border-herb-900 bg-herb-900 text-paper' : 'border-line bg-card text-ink-2',
                )
              }
            >
              <l.icon className="size-4" /> {l.label}
            </NavLink>
          ))}
        </nav>
        <Outlet />
      </div>
    </div>
  );
}

/** Page heading used across the signed-in areas. */
export function PageHead({ eyebrow, title, lead, action }: { eyebrow?: string; title: React.ReactNode; lead?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-[34px] leading-tight text-ink sm:text-[40px]">{title}</h1>
        {lead && <p className="mt-2 max-w-xl text-[15px] text-ink-3">{lead}</p>}
      </div>
      {action}
    </div>
  );
}

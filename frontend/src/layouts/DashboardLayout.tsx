import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import {
  Armchair,
  BarChart3,
  CalendarDays,
  ChefHat,
  ExternalLink,
  FileText,
  Gauge,
  LifeBuoy,
  LogOut,
  Menu as MenuIcon,
  Megaphone,
  MessageSquare,
  Package,
  QrCode,
  ScrollText,
  Settings,
  Store,
  Users,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { useMyRestaurant } from '@/features/owner';
import { orderApi, reservationApi } from '@/lib/api';
import { cn } from '@/lib/format';
import { Logo } from '@/ui/Logo';
import { Avatar, Badge } from '@/ui/bits';
import { IconButton } from '@/ui/Button';
import { Drawer } from '@/ui/Overlay';
import { NotificationBell } from '@/components/NotificationBell';
import { ScrollToTop } from './PublicLayout';

type Item = { to: string; label: string; icon: typeof Gauge; end?: boolean; badge?: number };

function Sidebar({ groups, onNavigate }: { groups: Array<{ title: string; items: Item[] }>; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-6" aria-label="Dashboard">
      {groups.map((g) => (
        <div key={g.title}>
          <p className="mb-2 px-3 text-[10.5px] font-semibold tracking-[0.2em] text-paper/40 uppercase">{g.title}</p>
          <div className="flex flex-col gap-0.5">
            {g.items.map((i) => (
              <NavLink
                key={i.to}
                to={i.to}
                end={i.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition',
                    isActive ? 'bg-paper text-herb-900' : 'text-paper/70 hover:bg-paper/[0.07] hover:text-paper',
                  )
                }
              >
                <i.icon className="size-[18px]" />
                <span className="flex-1">{i.label}</span>
                {!!i.badge && <span className="grid min-w-5 place-items-center rounded-full bg-tomato-500 px-1.5 text-[11px] leading-5 font-bold text-white">{i.badge}</span>}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function DashboardLayout({ area }: { area: 'owner' | 'admin' }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menu, setMenu] = useState(false);
  const { data: restaurant } = useMyRestaurant();
  const hasRestaurant = area === 'owner' && !!restaurant;
  const active = useQuery({ queryKey: ['owner', 'orders', 'active-count'], queryFn: () => orderApi.kitchen({ status: 'placed', limit: 1 }), enabled: hasRestaurant, refetchInterval: 20_000 });
  const pending = useQuery({ queryKey: ['owner', 'res-stats'], queryFn: reservationApi.stats, enabled: hasRestaurant, refetchInterval: 30_000 });
  useEffect(() => setMenu(false), [pathname]);

  const groups: Array<{ title: string; items: Item[] }> =
    area === 'owner'
      ? [
          {
            title: 'Service',
            items: [
              { to: '/owner', label: 'Overview', icon: Gauge, end: true },
              { to: '/owner/orders', label: 'Orders', icon: ChefHat, badge: active.data?.total },
              { to: '/owner/reservations', label: 'Reservations', icon: CalendarDays, badge: pending.data?.pending },
              { to: '/owner/tables', label: 'Floor & tables', icon: Armchair },
            ],
          },
          {
            title: 'Menu & guests',
            items: [
              { to: '/owner/menu', label: 'Menu', icon: UtensilsCrossed },
              { to: '/owner/promotions', label: 'Promotions', icon: Megaphone },
              { to: '/owner/reviews', label: 'Reviews', icon: MessageSquare },
              { to: '/owner/qrcodes', label: 'Table QR codes', icon: QrCode },
            ],
          },
          {
            title: 'Business',
            items: [
              { to: '/owner/analytics', label: 'Analytics', icon: BarChart3 },
              { to: '/owner/billing', label: 'Billing', icon: Wallet },
              { to: '/owner/staff', label: 'Team', icon: Users },
              { to: '/owner/inventory', label: 'Inventory', icon: Package },
              { to: '/owner/settings', label: 'Restaurant settings', icon: Settings },
            ],
          },
        ]
      : [
          {
            title: 'Platform',
            items: [
              { to: '/admin', label: 'Overview', icon: Gauge, end: true },
              { to: '/admin/restaurants', label: 'Restaurants', icon: Store },
              { to: '/admin/users', label: 'People', icon: Users },
              { to: '/admin/orders', label: 'Orders', icon: FileText },
            ],
          },
          {
            title: 'Money & care',
            items: [
              { to: '/admin/revenue', label: 'Revenue', icon: Wallet },
              { to: '/admin/support', label: 'Support', icon: LifeBuoy },
              { to: '/admin/settings', label: 'Platform settings', icon: Settings },
              { to: '/admin/audit', label: 'Audit log', icon: ScrollText },
            ],
          },
        ];

  const brand = (
    <div className="flex items-center justify-between px-3">
      <Logo tone="light" to={area === 'owner' ? '/owner' : '/admin'} />
    </div>
  );
  const foot = (
    <div className="mt-auto space-y-1 border-t border-paper/10 pt-4">
      {user && (
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar name={user.fullName} src={user.avatar} size={34} className="ring-paper/20" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-paper">{user.fullName}</p>
            <p className="truncate text-[11.5px] text-paper/50">{area === 'owner' ? 'Owner' : 'Administrator'}</p>
          </div>
        </div>
      )}
      <button
        onClick={() => {
          signOut();
          navigate('/');
        }}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-paper/60 transition hover:bg-paper/[0.07] hover:text-paper"
      >
        <LogOut className="size-[18px]" /> Sign out
      </button>
    </div>
  );

  const statusTone = restaurant?.status === 'active' ? 'herb' : restaurant?.status === 'pending' ? 'saffron' : 'tomato';

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
      <ScrollToTop />
      <aside className="sticky top-0 hidden h-dvh flex-col gap-8 overflow-y-auto bg-herb-950 px-3 py-6 lg:flex">
        {brand}
        <Sidebar groups={groups} />
        {foot}
      </aside>

      <Drawer open={menu} onClose={() => setMenu(false)} side="left" title={<span className="text-lg">Menu</span>} className="bg-herb-950 [&>div:first-child]:border-paper/10 [&>div:first-child]:text-paper">
        <div className="flex h-full flex-col gap-6 p-3">
          <Sidebar groups={groups} onNavigate={() => setMenu(false)} />
          {foot}
        </div>
      </Drawer>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-paper/85 px-4 backdrop-blur-xl sm:px-6">
          <IconButton label="Open menu" className="lg:hidden" onClick={() => setMenu(true)}>
            <MenuIcon className="size-5" />
          </IconButton>
          <div className="min-w-0 flex-1">
            {area === 'owner' ? (
              restaurant ? (
                <div className="flex items-center gap-2.5">
                  <p className="truncate font-display text-lg text-ink">{restaurant.name}</p>
                  <Badge tone={statusTone} dot>
                    {restaurant.status === 'active' ? 'Live' : restaurant.status === 'pending' ? 'Awaiting approval' : restaurant.status}
                  </Badge>
                </div>
              ) : (
                <p className="font-display text-lg text-ink">Partner dashboard</p>
              )
            ) : (
              <p className="font-display text-lg text-ink">TableNest admin</p>
            )}
          </div>
          {restaurant && restaurant.status === 'active' && (
            <Link to={`/restaurants/${restaurant._id}`} target="_blank" className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold text-ink-3 transition hover:bg-paper-2 hover:text-ink sm:inline-flex">
              Public page <ExternalLink className="size-3.5" />
            </Link>
          )}
          <NotificationBell allHref={area === 'owner' ? '/owner/notifications' : '/admin'} />
        </header>
        <motion.main
          id="main"
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="px-4 py-6 sm:px-6 lg:px-10 lg:py-9"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}

/** Heading row used on every dashboard page. */
export function DashHead({ title, lead, action }: { title: ReactNode; lead?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[30px] leading-tight text-ink sm:text-[36px]">{title}</h1>
        {lead && <p className="mt-1.5 max-w-2xl text-[15px] text-ink-3">{lead}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}

/** A KPI tile. */
export function Stat({ label, value, hint, icon, tone = 'plain' }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode; tone?: 'plain' | 'dark' | 'saffron' }) {
  return (
    <div
      className={cn(
        'rounded-[20px] border p-5',
        tone === 'dark' ? 'border-herb-900 bg-herb-900 text-paper' : tone === 'saffron' ? 'border-saffron-200 bg-saffron-50' : 'border-line bg-card',
      )}
    >
      <div className="flex items-center justify-between">
        <p className={cn('text-[13px] font-semibold', tone === 'dark' ? 'text-paper/70' : 'text-ink-3')}>{label}</p>
        {icon && <span className={cn('grid size-8 place-items-center rounded-full', tone === 'dark' ? 'bg-paper/10 text-saffron-300' : 'bg-paper-2 text-herb-700')}>{icon}</span>}
      </div>
      <p className={cn('mt-3 font-display text-[32px] leading-none tabular-nums', tone === 'dark' ? 'text-paper' : 'text-ink')}>{value}</p>
      {hint && <p className={cn('mt-2 text-[12.5px]', tone === 'dark' ? 'text-paper/60' : 'text-ink-3')}>{hint}</p>}
    </div>
  );
}

/** Card wrapper for dashboard panels. */
export function Panel({ title, action, children, className, pad = true }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={cn('rounded-[22px] border border-line bg-card', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          {title && <h2 className="font-display text-lg text-ink">{title}</h2>}
          {action}
        </div>
      )}
      <div className={pad ? 'p-5' : ''}>{children}</div>
    </section>
  );
}

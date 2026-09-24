import { motion } from 'motion/react';
import { Bike, Check, ChefHat, CircleCheck, Flame, PackageCheck, Receipt, UtensilsCrossed, X } from 'lucide-react';
import type { Order, OrderStatus } from '@/lib/types';
import { cn } from '@/lib/format';

type Step = { status: OrderStatus; label: string; icon: typeof Check; line: string };

export function stepsFor(order: Pick<Order, 'orderType'>): Step[] {
  const base: Step[] = [
    { status: 'placed', label: 'Placed', icon: Receipt, line: 'The restaurant has your order.' },
    { status: 'confirmed', label: 'Accepted', icon: ChefHat, line: 'The kitchen accepted it.' },
    { status: 'preparing', label: 'Cooking', icon: Flame, line: 'Your food is being prepared.' },
    { status: 'ready', label: order.orderType === 'pickup' ? 'Ready to collect' : order.orderType === 'dine_in' ? 'Ready to serve' : 'Packed', icon: PackageCheck, line: 'It is ready.' },
  ];
  if (order.orderType === 'delivery') base.push({ status: 'out_for_delivery', label: 'On the way', icon: Bike, line: 'It is on the way to you.' });
  base.push({ status: 'delivered', label: 'Enjoy', icon: UtensilsCrossed, line: 'Completed. Enjoy!' });
  return base;
}

/** Horizontal "pass" of stages; the current one glows, completed ones are stamped. */
export function OrderProgress({ order, compact }: { order: Order; compact?: boolean }) {
  if (order.status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-tomato-50 p-4 text-tomato-700">
        <X className="size-5" />
        <p className="text-sm font-semibold">This order was cancelled.</p>
      </div>
    );
  }
  const steps = stepsFor(order);
  const current = Math.max(0, steps.findIndex((s) => s.status === order.status));
  const pct = (current / (steps.length - 1)) * 100;

  return (
    <div className="relative">
      <div className={cn('absolute right-[5%] left-[5%] h-1 rounded-full bg-line', compact ? 'top-4' : 'top-6')} />
      <motion.div
        className={cn('absolute left-[5%] h-1 rounded-full bg-herb-600', compact ? 'top-4' : 'top-6')}
        initial={{ width: 0 }}
        animate={{ width: `${pct * 0.9}%` }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
      <ol className="relative grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0,1fr))` }}>
        {steps.map((s, i) => {
          const done = i < current || order.status === 'delivered';
          const active = i === current && order.status !== 'delivered';
          return (
            <li key={s.status} className="flex flex-col items-center text-center">
              <motion.span
                initial={false}
                animate={active ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={active ? { duration: 1.8, repeat: Infinity } : undefined}
                className={cn(
                  'relative grid place-items-center rounded-full border-2 transition-colors duration-500',
                  compact ? 'size-9' : 'size-12',
                  done ? 'border-herb-600 bg-herb-600 text-paper' : active ? 'border-tomato-500 bg-card text-tomato-500 shadow-[0_0_0_6px_rgb(217_71_43/0.12)]' : 'border-line bg-card text-ink-4',
                )}
              >
                {done ? <CircleCheck className={compact ? 'size-4' : 'size-5'} /> : <s.icon className={compact ? 'size-4' : 'size-5'} />}
              </motion.span>
              {!compact && <span className={cn('mt-2 text-[12px] font-semibold sm:text-[13px]', active ? 'text-ink' : done ? 'text-herb-700' : 'text-ink-4')}>{s.label}</span>}
            </li>
          );
        })}
      </ol>
      {compact && <p className="mt-2 text-[12.5px] font-semibold text-ink-2">{steps[current]?.label}</p>}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Flame } from 'lucide-react';
import type { Dish } from '@/lib/types';
import { useMoney } from '@/lib/settings';
import { Photo } from '@/ui/bits';

/** A plated dish with its price on a hanging tag. Opens the dish on its restaurant's menu. */
export function DishCard({ dish, index = 0 }: { dish: Dish; index?: number }) {
  const money = useMoney();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.55, delay: Math.min(index, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/restaurants/${dish.restaurant._id}?tab=menu&dish=${dish._id}`} className="group block">
        <div className="relative aspect-square overflow-hidden rounded-[22px] bg-paper-2">
          <Photo src={dish.image} alt={dish.name} label={dish.name} className="size-full transition-transform duration-[1.1s] ease-[var(--ease-out-quint)] group-hover:scale-110" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {/* Price tag hanging from a string */}
          <div className="absolute top-0 right-5 flex flex-col items-center">
            <span className="h-4 w-px bg-white/70" />
            <span className="origin-top rounded-md bg-card px-2.5 py-1 font-display text-[15px] font-semibold text-ink shadow-md transition-transform duration-500 ease-[var(--ease-spring)] group-hover:rotate-[-6deg]">
              {money(dish.price)}
            </span>
          </div>
          {!!dish.sold && dish.sold > 0 && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-tomato-600 backdrop-blur">
              <Flame className="size-3" /> {dish.sold} ordered
            </span>
          )}
          <span className="absolute right-4 bottom-4 inline-flex translate-y-3 items-center gap-1.5 rounded-full bg-card px-3.5 py-2 text-[12.5px] font-semibold text-ink opacity-0 transition duration-500 ease-[var(--ease-out-quint)] group-hover:translate-y-0 group-hover:opacity-100">
            View on menu <ArrowRight className="size-3.5" />
          </span>
        </div>
        <div className="px-1 pt-3.5">
          <h3 className="font-display text-[19px] leading-snug text-ink">{dish.name}</h3>
          <p className="mt-0.5 text-[13px] text-ink-3">
            {dish.restaurant.name}
            {dish.restaurant.city && <span className="text-ink-4"> · {dish.restaurant.city}</span>}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

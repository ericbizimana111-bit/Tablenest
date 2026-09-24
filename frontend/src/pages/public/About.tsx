import { motion } from 'motion/react';
import { Heart, Leaf, ShieldCheck } from 'lucide-react';
import { LinkButton } from '@/ui/Button';
import fondant from '@/assets/photos/fondant.webp';
import croquettes from '@/assets/photos/croquettes.webp';

export default function About() {
  const values = [
    { icon: Heart, title: 'Hospitality first', body: 'Every screen is designed to feel like being greeted at the door — warm, clear, never pushy.' },
    { icon: ShieldCheck, title: 'Honest by default', body: 'Real availability, real prices, real reviews from guests who actually ate there. Nothing is staged.' },
    { icon: Leaf, title: 'Good for kitchens', body: 'Fair, simple terms and tools that save restaurants time, so they can spend it on the food.' },
  ];
  return (
    <div>
      <section className="container-page grid items-center gap-12 pt-8 pb-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="eyebrow">Our story</p>
          <h1 className="mt-5 text-[clamp(42px,6vw,76px)] leading-[0.98] text-ink">
            We think the best nights out <span className="italic text-herb-700">start before you arrive.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-3">
            TableNest began with a simple frustration: finding somewhere good, checking if they had a table, and ordering from them were three different chores.
            We brought them to one place — and built it the way a good restaurant runs: calm at the front, organised in the kitchen.
          </p>
        </div>
        <div className="relative h-[420px]">
          <motion.img src={fondant} alt="" initial={{ opacity: 0, rotate: 4, y: 20 }} animate={{ opacity: 1, rotate: 3, y: 0 }} className="absolute top-0 right-4 h-[78%] w-[64%] rounded-[28px] object-cover shadow-[var(--shadow-lift)]" />
          <motion.img src={croquettes} alt="" initial={{ opacity: 0, rotate: -6, y: 20 }} animate={{ opacity: 1, rotate: -4, y: 0 }} transition={{ delay: 0.15 }} className="absolute bottom-0 left-0 h-[58%] w-[52%] rounded-[28px] border-8 border-paper object-cover shadow-[var(--shadow-lift)]" />
        </div>
      </section>
      <section className="container-page grid gap-5 pb-20 md:grid-cols-3">
        {values.map((v) => (
          <div key={v.title} className="rounded-[24px] border border-line bg-card p-7">
            <v.icon className="size-6 text-tomato-500" />
            <h2 className="mt-5 text-[24px] text-ink">{v.title}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-3">{v.body}</p>
          </div>
        ))}
      </section>
      <section className="container-page text-center">
        <h2 className="text-[36px] text-ink">Hungry yet?</h2>
        <div className="mt-6 flex justify-center gap-3">
          <LinkButton to="/restaurants" variant="primary" size="lg">
            Find a restaurant
          </LinkButton>
          <LinkButton to="/partner" variant="outline" size="lg">
            Join as a restaurant
          </LinkButton>
        </div>
      </section>
    </div>
  );
}

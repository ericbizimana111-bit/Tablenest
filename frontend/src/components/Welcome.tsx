import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { LogoMark } from '@/ui/Logo';
import { welcomeSeen } from '@/stores/experience';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * First-visit welcome: a cloche is lifted off a plate — the moment a dish arrives at your table —
 * revealing the brand, then the curtain rises on the site. ~2.6s, skippable, once per session.
 */
export function Welcome({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<'plate' | 'lift' | 'exit' | 'gone'>(() => (welcomeSeen.get() || reduce ? 'gone' : 'plate'));

  useEffect(() => {
    if (phase === 'gone') {
      onDone();
      return;
    }
    welcomeSeen.set();
    const t1 = setTimeout(() => setPhase('lift'), 750);
    const t2 = setTimeout(() => setPhase('exit'), 2350);
    const skip = () => setPhase('exit');
    window.addEventListener('keydown', skip, { once: true });
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('keydown', skip);
    };
    // Only schedule once on mount; later phase changes are driven by the timers above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lifted = phase === 'lift' || phase === 'exit';

  return (
    <AnimatePresence onExitComplete={onDone}>
      {phase !== 'exit' && phase !== 'gone' && (
        <motion.div
          key="welcome"
          className="fixed inset-0 z-[200] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-herb-950 text-paper"
          exit={{ y: '-100%', borderBottomLeftRadius: '50% 12%', borderBottomRightRadius: '50% 12%' }}
          transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1] }}
          onClick={() => setPhase('exit')}
          role="presentation"
        >
          {/* Warm pool of light on the table */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 size-[680px] -translate-x-1/2 -translate-y-[38%] rounded-full bg-saffron-400/10 blur-3xl" />

          <svg viewBox="0 0 400 320" className="relative w-[min(78vw,440px)]" aria-hidden>
            <defs>
              <linearGradient id="dome" x1="0" x2="1">
                <stop offset="0" stopColor="#8f9a95" />
                <stop offset=".42" stopColor="#f2efe8" />
                <stop offset=".58" stopColor="#d9d6cf" />
                <stop offset="1" stopColor="#6d7773" />
              </linearGradient>
            </defs>

            {/* Revealed under the cloche */}
            <motion.g initial={{ opacity: 0, y: 14 }} animate={lifted ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.25, ease: EASE }}>
              {[160, 200, 240].map((x, i) => (
                <path
                  key={x}
                  d={`M${x} 150 q -10 -14 0 -28 q 10 -14 0 -28`}
                  fill="none"
                  stroke="#f7f2e9"
                  strokeOpacity=".55"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className={lifted ? 'animate-steam' : 'opacity-0'}
                  style={{ animationDelay: `${0.35 + i * 0.35}s`, transformBox: 'fill-box', transformOrigin: 'bottom' }}
                />
              ))}
            </motion.g>

            {/* Plate */}
            <motion.g initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: EASE }} style={{ transformOrigin: '200px 240px' }}>
              <ellipse cx="200" cy="244" rx="168" ry="30" fill="#0a1d16" opacity=".6" />
              <ellipse cx="200" cy="236" rx="160" ry="28" fill="#efe6d6" />
              <ellipse cx="200" cy="232" rx="116" ry="17" fill="#f7f2e9" />
            </motion.g>

            {/* Cloche */}
            <motion.g
              initial={{ opacity: 0, y: 10 }}
              animate={lifted ? { opacity: [1, 1, 0], y: [0, 4, -190], rotate: [0, -2, -14], x: [0, 0, -30] } : { opacity: 1, y: 0 }}
              transition={lifted ? { duration: 1.2, times: [0, 0.15, 1], ease: EASE } : { duration: 0.6, delay: 0.1, ease: EASE }}
              style={{ transformOrigin: '200px 232px' }}
            >
              <path d="M52 230 C 52 110, 348 110, 348 230 Z" fill="url(#dome)" />
              <path d="M84 206 C 96 150, 150 128, 196 124" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="5" strokeLinecap="round" />
              <rect x="44" y="226" width="312" height="10" rx="5" fill="#bfc4c0" />
              <rect x="190" y="104" width="20" height="16" rx="4" fill="#bfc4c0" />
              <circle cx="200" cy="100" r="12" fill="#e7e4dc" />
            </motion.g>
          </svg>

          <motion.div
            className="relative -mt-2 flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={lifted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
          >
            <LogoMark tone="light" className="mb-4 size-10" />
            <p className="font-display text-[clamp(30px,6vw,52px)] leading-none">
              Your table <span className="italic text-saffron-300">is ready.</span>
            </p>
            <p className="mt-3 text-sm tracking-[0.2em] text-paper/60 uppercase">Welcome to TableNest</p>
          </motion.div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPhase('exit');
            }}
            className="absolute right-5 bottom-[max(20px,env(safe-area-inset-bottom))] rounded-full border border-paper/20 px-4 py-2 text-xs font-semibold tracking-wide text-paper/70 transition hover:bg-paper/10 hover:text-paper"
          >
            Skip
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

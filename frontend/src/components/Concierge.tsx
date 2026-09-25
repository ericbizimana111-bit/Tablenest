import { Fragment, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUp, RotateCcw, Sparkles, Star, X } from 'lucide-react';
import { conciergeApi, type ConciergeMessage } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { cn } from '@/lib/format';
import type { ConciergeSuggestion } from '@/lib/types';
import { useExperience } from '@/stores/experience';
import { Photo } from '@/ui/bits';
import { RichText } from './RichText';
import { LogoMark } from '@/ui/Logo';

type Turn = ConciergeMessage & { suggestions?: ConciergeSuggestion[]; error?: boolean };
const STORE = 'tn.concierge';
const STARTERS = ['Somewhere open now for dinner', 'Book a table for 4 this Saturday', 'Good dishes under 15', 'How do I track my order?'];

const load = (): Turn[] => {
  try {
    return JSON.parse(sessionStorage.getItem(STORE) || '[]');
  } catch {
    return [];
  }
};

function Suggestion({ s }: { s: ConciergeSuggestion }) {
  return (
    <Link to={`/restaurants/${s._id}`} className="group w-48 shrink-0 overflow-hidden rounded-2xl border border-line bg-card transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]">
      <Photo src={s.image} alt={s.name} label={s.name} className="h-24 w-full" />
      <div className="p-3">
        <p className="truncate font-display text-[15px] text-ink">{s.name}</p>
        <p className="truncate text-[12px] text-ink-3">
          {[s.cuisineType, s.priceRange, s.city].filter(Boolean).join(' · ')}
        </p>
        <p className={cn('mt-1 inline-flex items-center gap-1 text-[11px] font-semibold', s.openNow ? 'text-herb-600' : 'text-ink-4')}>
          {s.openNow ? 'Open now' : 'Closed now'}
          {!!s.rating && (
            <>
              <span aria-hidden>·</span>
              <Star className="size-3 fill-saffron-400 text-saffron-400" aria-hidden /> {s.rating.toFixed(1)}
            </>
          )}
        </p>
      </div>
    </Link>
  );
}

export function Concierge() {
  const { conciergeOpen: open, setConcierge, consumeQuestion, pendingQuestion } = useExperience();
  const [turns, setTurns] = useState<Turn[]>(load);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const { pathname } = useLocation();
  const status = useQuery({ queryKey: ['concierge', 'status'], queryFn: conciergeApi.status, staleTime: 5 * 60_000, enabled: open });

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE, JSON.stringify(turns.slice(-30)));
    } catch {
      /* ignore */
    }
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' });
  }, [turns, busy]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    const next: Turn[] = [...turns, { role: 'user', content: q }];
    setTurns(next);
    setDraft('');
    setBusy(true);
    try {
      const history = next.filter((t) => !t.error).slice(-12).map(({ role, content }) => ({ role, content }));
      const res = await conciergeApi.chat(history, pathname);
      setTurns((t) => [...t, { role: 'assistant', content: res.reply, suggestions: res.suggestions }]);
    } catch (err) {
      setTurns((t) => [...t, { role: 'assistant', content: errorMessage(err, 'I could not answer just now. Please try again in a moment.'), error: true }]);
    } finally {
      setBusy(false);
      setTimeout(() => input.current?.focus(), 50);
    }
  };

  // A question handed over from elsewhere (search palette, guide).
  useEffect(() => {
    if (!open) return;
    const q = consumeQuestion();
    if (q) send(q);
    else setTimeout(() => input.current?.focus(), 120);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pendingQuestion]);

  const disabled = status.data && !status.data.enabled;

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26, delay: 0.4 }}
            onClick={() => setConcierge(true)}
            className="group fixed right-4 bottom-[calc(max(10px,env(safe-area-inset-bottom))+84px)] z-40 flex items-center gap-2.5 rounded-full bg-herb-900 p-2 text-paper md:py-2.5 md:pr-5 md:pl-2.5 shadow-[var(--shadow-pop)] transition hover:bg-herb-800 md:right-6 md:bottom-6"
            aria-label="Ask the TableNest concierge"
          >
            <span className="relative grid size-9 place-items-center rounded-full bg-saffron-400 text-herb-950">
              <Sparkles className="size-[18px] transition-transform duration-500 group-hover:rotate-[20deg]" />
              <span className="absolute inset-0 animate-ping rounded-full bg-saffron-400/40 [animation-duration:2.6s]" />
            </span>
            <span className="hidden text-sm font-semibold md:inline">Ask TableNest</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog"
            aria-label="TableNest concierge"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
            style={{ transformOrigin: 'bottom right' }}
            className="fixed inset-0 z-[85] flex flex-col bg-paper md:inset-auto md:right-6 md:bottom-6 md:h-[min(640px,calc(100dvh-48px))] md:w-[400px] md:overflow-hidden md:rounded-[28px] md:border md:border-line md:shadow-[var(--shadow-pop)]"
          >
            <header className="flex items-center gap-3 border-b border-line bg-herb-900 px-4 py-3.5 text-paper">
              <span className="grid size-10 place-items-center rounded-full bg-paper/10">
                <LogoMark tone="light" className="size-6" />
              </span>
              <div className="flex-1">
                <p className="font-display text-lg leading-tight">Concierge</p>
                <p className="text-[12px] text-paper/60">Restaurants, tables, orders — just ask</p>
              </div>
              {turns.length > 0 && (
                <button onClick={() => setTurns([])} className="grid size-9 place-items-center rounded-full text-paper/70 hover:bg-paper/10 hover:text-paper" aria-label="Start over" title="Start over">
                  <RotateCcw className="size-4" />
                </button>
              )}
              <button onClick={() => setConcierge(false)} className="grid size-9 place-items-center rounded-full text-paper/70 hover:bg-paper/10 hover:text-paper" aria-label="Close concierge">
                <X className="size-5" />
              </button>
            </header>

            <div ref={list} className="flex-1 space-y-4 overflow-y-auto px-4 py-5" aria-live="polite">
              {turns.length === 0 && (
                <div className="pt-4">
                  <p className="font-display text-[26px] leading-tight text-ink">
                    Hello. What are you <span className="italic">in the mood for?</span>
                  </p>
                  <p className="mt-2 text-sm text-ink-3">I can search every restaurant on TableNest, check live table availability, read menus and help with your bookings and orders.</p>
                  {disabled ? (
                    <p className="mt-5 rounded-2xl bg-saffron-50 p-4 text-sm text-saffron-700">
                      The concierge is resting right now. You can still <Link to="/restaurants" className="font-semibold underline">browse every restaurant</Link>.
                    </p>
                  ) : (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {STARTERS.map((s) => (
                        <button key={s} onClick={() => send(s)} className="rounded-full border border-line bg-card px-3.5 py-2 text-[13px] font-medium text-ink-2 transition hover:border-herb-500 hover:text-ink">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {turns.map((t, i) => (
                <Fragment key={i}>
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn('flex', t.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[88%] space-y-1 rounded-[20px] px-4 py-2.5 text-[14.5px] leading-relaxed',
                        t.role === 'user' ? 'rounded-br-md bg-herb-900 text-paper' : t.error ? 'rounded-bl-md bg-tomato-50 text-tomato-700' : 'rounded-bl-md border border-line bg-card text-ink-2',
                      )}
                    >
                      {t.role === 'user' ? t.content : <RichText text={t.content} />}
                    </div>
                  </motion.div>
                  {!!t.suggestions?.length && (
                    <div className="scrollbar-none -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
                      {t.suggestions.map((s) => (
                        <Suggestion key={s._id} s={s} />
                      ))}
                    </div>
                  )}
                </Fragment>
              ))}
              {busy && (
                <div className="flex items-center gap-1.5 rounded-[20px] rounded-bl-md border border-line bg-card px-4 py-3.5" style={{ width: 'fit-content' }} aria-label="Thinking">
                  {[0, 1, 2].map((d) => (
                    <motion.span key={d} className="size-1.5 rounded-full bg-herb-500" animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.15 }} />
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(draft);
              }}
              className="border-t border-line bg-card p-3 pb-[max(12px,env(safe-area-inset-bottom))]"
            >
              <div className="flex items-end gap-2 rounded-[22px] border border-line bg-paper px-3 py-2 focus-within:border-herb-500">
                <textarea
                  ref={input}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value.slice(0, 1000))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send(draft);
                    }
                  }}
                  rows={1}
                  disabled={disabled}
                  placeholder={disabled ? 'Unavailable right now' : 'Ask about food, a table, an order…'}
                  className="max-h-28 min-h-9 flex-1 resize-none bg-transparent py-1.5 text-[15px] text-ink outline-none placeholder:text-ink-4"
                  aria-label="Message the concierge"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || busy || disabled}
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-tomato-500 text-white transition hover:bg-tomato-600 disabled:bg-line-2"
                  aria-label="Send"
                >
                  <ArrowUp className="size-4" />
                </button>
              </div>
              <p className="mt-2 px-2 text-[11px] text-ink-4">AI answers can be wrong — always check the restaurant page before you go.</p>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}

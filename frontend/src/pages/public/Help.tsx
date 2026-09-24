import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, LifeBuoy, MessageCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { supportApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { cn, timeAgo } from '@/lib/format';
import { useAuth } from '@/auth/useAuth';
import { useExperience } from '@/stores/experience';
import { Button, LinkButton } from '@/ui/Button';
import { Input, Select, Textarea } from '@/ui/Field';
import { Badge } from '@/ui/bits';

const FAQ: Array<{ topic: string; q: string; a: string }> = [
  { topic: 'Booking', q: 'How do I book a table?', a: 'Open a restaurant, choose “Book a table”, pick a date, your party size and one of the free times. Your booking is sent to the restaurant straight away and shows as “awaiting confirmation” until they confirm — we notify you the moment they do.' },
  { topic: 'Booking', q: 'Can I change or cancel a booking?', a: 'Yes. Go to My bookings. You can move a pending or confirmed booking to another free time (it then goes back to the restaurant to re-confirm) or cancel it. Please cancel early if your plans change — someone else may want the table.' },
  { topic: 'Booking', q: 'Is booking free?', a: 'Always. There is no charge to reserve a table on TableNest.' },
  { topic: 'Ordering', q: 'How do I pay for an order?', a: 'Right now you pay in person: to the rider on delivery, or at the restaurant for pickup and dine-in. Online card payment is coming soon.' },
  { topic: 'Ordering', q: 'Can I cancel an order?', a: 'You can cancel while the order is placed or accepted. Once the kitchen starts preparing it, please contact the restaurant.' },
  { topic: 'Ordering', q: 'How do I know where my order is?', a: 'Open My orders and tap the order. You will see every step — accepted, preparing, ready, on the way — and we send you an update at each one.' },
  { topic: 'Rewards', q: 'How do rewards work?', a: 'You earn points on completed orders and visits, plus a welcome bonus. Redeem them in Rewards for vouchers like free delivery or money off, then enter the code at checkout.' },
  { topic: 'Account', q: 'I forgot my password', a: 'Use “Forgot password” on the sign-in page. We email you a link that works for one hour. Resetting signs you out everywhere else for your safety.' },
  { topic: 'Restaurants', q: 'How do I list my restaurant?', a: 'Go to For restaurants and choose “List your restaurant”. It takes about five minutes: your details, hours, how you serve and a few photos.' },
];

function SupportForm() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [f, setF] = useState({ subject: '', description: '', type: 'other' });
  const tickets = useQuery({ queryKey: ['my-tickets'], queryFn: supportApi.mine, enabled: !!user });
  const send = useMutation({
    mutationFn: () => supportApi.create(f),
    onSuccess: () => {
      toast.success('Thanks — we will get back to you soon');
      setF({ subject: '', description: '', type: 'other' });
      qc.invalidateQueries({ queryKey: ['my-tickets'] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (!user) {
    return (
      <div className="rounded-[24px] border border-line bg-card p-7 text-center">
        <p className="text-ink-2">Sign in so we can follow up on your request and link it to your order or booking.</p>
        <LinkButton to="/login?next=/help%23contact" className="mt-5">
          Sign in to contact us
        </LinkButton>
      </div>
    );
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send.mutate();
        }}
        className="space-y-4 rounded-[24px] border border-line bg-card p-6"
      >
        <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
          <Input label="Subject" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} required minLength={3} maxLength={150} />
          <Select label="About" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
            <option value="order">An order</option>
            <option value="booking">A booking</option>
            <option value="payment">Payment</option>
            <option value="technical">The app</option>
            <option value="other">Something else</option>
          </Select>
        </div>
        <Textarea label="What happened?" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} required minLength={5} maxLength={3000} placeholder="Include the order number or booking reference if you have one." />
        <Button type="submit" variant="dark" loading={send.isPending} disabled={f.subject.trim().length < 3 || f.description.trim().length < 5}>
          Send to support
        </Button>
      </form>
      <div>
        <p className="mb-3 text-sm font-semibold text-ink">Your requests</p>
        {tickets.data?.length ? (
          <ul className="space-y-2">
            {tickets.data.map((t) => (
              <li key={t._id} className="rounded-2xl border border-line bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-ink">{t.subject}</p>
                  <Badge tone={t.status === 'resolved' || t.status === 'closed' ? 'herb' : t.status === 'in_progress' ? 'sky' : 'saffron'}>{t.status.replace('_', ' ')}</Badge>
                </div>
                <p className="mt-1 text-[12px] text-ink-4">
                  {timeAgo(t.createdAt)}
                  {t.responses.length > 0 && ` · ${t.responses.length} ${t.responses.length === 1 ? 'reply' : 'replies'}`}
                </p>
                {t.responses.at(-1) && <p className="mt-2 rounded-xl bg-paper p-2.5 text-[13px] text-ink-2">{t.responses.at(-1)!.message}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl bg-paper-2 p-4 text-sm text-ink-3">No requests yet.</p>
        )}
      </div>
    </div>
  );
}

export default function Help() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(FAQ[0].q);
  const ask = useExperience((s) => s.ask);
  const list = FAQ.filter((f) => !q.trim() || `${f.q} ${f.a} ${f.topic}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="container-page pt-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow justify-center">Help centre</p>
        <h1 className="mt-4 text-[44px] leading-tight text-ink sm:text-[60px]">How can we help?</h1>
        <label className="mx-auto mt-8 flex h-14 max-w-xl items-center gap-3 rounded-full border border-line bg-card px-5 shadow-[var(--shadow-card)] focus-within:border-herb-500">
          <Search className="size-5 text-ink-3" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search questions" className="flex-1 bg-transparent outline-none placeholder:text-ink-4" aria-label="Search help" />
        </label>
      </div>

      <div className="mx-auto mt-12 max-w-3xl">
        {list.length === 0 ? (
          <div className="rounded-[24px] border border-line bg-card p-8 text-center">
            <p className="text-ink-2">No answer for that here.</p>
            <Button className="mt-4" variant="dark" icon={<MessageCircle className="size-4" />} onClick={() => ask(q)}>
              Ask the concierge instead
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-line rounded-[24px] border border-line bg-card">
            {list.map((f) => {
              const isOpen = open === f.q;
              return (
                <li key={f.q}>
                  <button onClick={() => setOpen(isOpen ? null : f.q)} aria-expanded={isOpen} className="flex w-full items-center gap-4 px-6 py-5 text-left">
                    <span className="hidden w-24 shrink-0 text-[11px] font-semibold tracking-[0.16em] text-ink-4 uppercase sm:block">{f.topic}</span>
                    <span className="flex-1 font-display text-[19px] text-ink">{f.q}</span>
                    <ChevronDown className={cn('size-5 text-ink-3 transition-transform', isOpen && 'rotate-180')} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <p className="px-6 pb-6 text-[15px] leading-relaxed text-ink-3 sm:pl-[136px]">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <section id="contact" className="mx-auto mt-20 max-w-5xl scroll-mt-24">
        <h2 className="mb-6 flex items-center gap-3 text-[32px] text-ink">
          <LifeBuoy className="size-7 text-tomato-500" /> Still stuck? Talk to us
        </h2>
        <SupportForm />
        <p className="mt-4 text-[13px] text-ink-3">
          Want something answered right now? The <button onClick={() => ask('')} className="font-semibold text-herb-700 underline">concierge</button> knows how everything works. Or read our{' '}
          <Link to="/terms" className="underline">terms</Link>.
        </p>
      </section>
    </div>
  );
}

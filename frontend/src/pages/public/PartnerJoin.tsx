import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Armchair, Bike, Check, PartyPopper, ShoppingBag } from 'lucide-react';
import { restaurantApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { cn } from '@/lib/format';
import { useMoney, usePublicSettings } from '@/lib/settings';
import type { WeeklyHours } from '@/lib/types';
import { useAuth } from '@/auth/useAuth';
import { useMyRestaurant } from '@/features/owner';
import { Button, LinkButton } from '@/ui/Button';
import { Input, PasswordInput, Select, Textarea, Toggle } from '@/ui/Field';
import { Segmented } from '@/ui/bits';
import { PageLoader } from '@/ui/Loader';
import { GalleryUploader } from '@/components/ImageUploader';
import { DEFAULT_HOURS, HoursEditor, browserZone, timezones } from '@/components/HoursEditor';
import { PasswordHints, passwordRule } from '@/pages/auth/Register';

const CUISINES = ['African', 'American', 'Asian', 'Bakery', 'Barbecue', 'Brunch', 'Burgers', 'Café', 'Chinese', 'Ethiopian', 'French', 'Fusion', 'Grill', 'Indian', 'Italian', 'Japanese', 'Korean', 'Lebanese', 'Mediterranean', 'Mexican', 'Pizza', 'Seafood', 'Steakhouse', 'Thai', 'Vegan', 'Vegetarian'];
const DRAFT = 'tn.partner-draft';

type Draft = {
  name: string;
  cuisineType: string;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  seatingCapacity: number;
  description: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  timezone: string;
  openingHours: WeeklyHours;
  dineIn: boolean;
  delivery: boolean;
  pickup: boolean;
  deliveryFee: number;
  minOrder: number;
  taxPct: number;
  prepTime: number;
  images: string[];
};

const initial = (): Draft => {
  const base: Draft = {
    name: '',
    cuisineType: '',
    priceRange: '$$',
    seatingCapacity: 40,
    description: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    timezone: browserZone(),
    openingHours: DEFAULT_HOURS,
    dineIn: true,
    delivery: true,
    pickup: true,
    deliveryFee: 0,
    minOrder: 0,
    taxPct: 0,
    prepTime: 30,
    images: [],
  };
  try {
    return { ...base, ...JSON.parse(localStorage.getItem(DRAFT) || '{}') };
  } catch {
    return base;
  }
};

const STEPS = ['Your account', 'The restaurant', 'Where to find you', 'Opening hours', 'How you serve', 'Photos', 'Review'];

function AccountStep({ onDone }: { onDone: () => void }) {
  const { signUp } = useAuth();
  const [f, setF] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [err, setErr] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (f.fullName.trim().length < 2) errs.fullName = 'Your name, please';
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) errs.email = 'Enter a valid email address';
    const pw = passwordRule.safeParse(f.password);
    if (!pw.success) errs.password = pw.error.issues[0].message;
    setErr(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    setError(null);
    try {
      await signUp({ fullName: f.fullName.trim(), email: f.email.trim(), password: f.password, phone: f.phone.trim() || undefined }, 'owner');
      onDone();
    } catch (e2) {
      setError(errorMessage(e2));
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Input label="Your name" value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} error={err.fullName} autoComplete="name" />
      <Input label="Work email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} error={err.email} autoComplete="email" />
      <Input label="Phone" optional type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} autoComplete="tel" />
      <div>
        <PasswordInput label="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} error={err.password} autoComplete="new-password" />
        <PasswordHints value={f.password} />
      </div>
      {error && <p className="rounded-2xl bg-tomato-50 p-3.5 text-sm text-tomato-700">{error}</p>}
      <Button type="submit" variant="dark" size="lg" block loading={busy} trail={<ArrowRight className="size-4" />}>
        Create partner account
      </Button>
      <p className="text-center text-[13px] text-ink-3">
        Already a partner?{' '}
        <Link to="/login?next=/owner" className="font-semibold text-herb-700 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export default function PartnerJoin() {
  const { user, signOut } = useAuth();
  const money = useMoney();
  const { data: settings } = usePublicSettings();
  const mine = useMyRestaurant();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [d, setD] = useState<Draft>(initial);
  const [step, setStep] = useState(user?.role === 'owner' ? 1 : 0);
  const [dir, setDir] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ id: string; status: string } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT, JSON.stringify(d));
    } catch {
      /* ignore */
    }
  }, [d]);
  useEffect(() => {
    if (user?.role === 'owner' && step === 0) setStep(1);
  }, [user, step]);

  if (user && user.role !== 'owner') {
    return (
      <div className="text-center">
        <h1 className="text-[34px] leading-tight text-ink">You're signed in as a {user.role === 'admin' ? 'platform admin' : 'diner'}</h1>
        <p className="mt-3 text-ink-3">Restaurants are managed from a separate partner account. Sign out to create one.</p>
        <Button className="mt-6" onClick={() => signOut()}>
          Sign out and continue
        </Button>
      </div>
    );
  }
  if (user?.role === 'owner' && mine.isLoading) return <PageLoader />;
  if (user?.role === 'owner' && mine.data && !created) return <Navigate to="/owner" replace />;

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (d.name.trim().length < 2) e.name = 'Give your restaurant a name';
      if (d.cuisineType.trim().length < 2) e.cuisineType = 'What do you cook?';
      if (!(d.seatingCapacity >= 1 && d.seatingCapacity <= 2000)) e.seatingCapacity = 'Between 1 and 2000 seats';
    }
    if (s === 2) {
      if (d.address.trim().length < 3) e.address = 'Street address, please';
      if (d.phone && !/^\+?[\d\s()-]{6,20}$/.test(d.phone)) e.phone = 'Enter a valid phone number';
      if (d.email && !/^\S+@\S+\.\S+$/.test(d.email)) e.email = 'Enter a valid email address';
      if (d.website && !/^https?:\/\//.test(d.website)) e.website = 'Start with http:// or https://';
    }
    if (s === 3 && Object.values(d.openingHours).every((h) => h?.closed)) e.hours = 'Open at least one day';
    if (s === 4 && !d.dineIn && !d.delivery && !d.pickup) e.services = 'Choose at least one way to serve guests';
    setErrors(e);
    return !Object.keys(e).length;
  };
  const go = (n: number) => {
    if (n > step && !validate(step)) return;
    setDir(n > step ? 1 : -1);
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const publish = async () => {
    setBusy(true);
    setSubmitError(null);
    try {
      const r = await restaurantApi.create({
        name: d.name.trim(),
        cuisineType: d.cuisineType.trim(),
        priceRange: d.priceRange,
        seatingCapacity: Number(d.seatingCapacity),
        description: d.description.trim() || null,
        address: d.address.trim(),
        city: d.city.trim() || null,
        country: d.country.trim() || null,
        phone: d.phone.trim() || null,
        email: d.email.trim() || null,
        website: d.website.trim() || null,
        timezone: d.timezone,
        openingHours: d.openingHours,
        dineIn: d.dineIn,
        delivery: d.delivery,
        pickup: d.pickup,
        deliveryFee: Number(d.deliveryFee) || 0,
        minOrder: Number(d.minOrder) || 0,
        taxRate: Math.min(0.4, (Number(d.taxPct) || 0) / 100),
        prepTime: Number(d.prepTime) || 30,
        images: d.images,
        logo: d.images[0] || null,
      });
      localStorage.removeItem(DRAFT);
      await qc.invalidateQueries({ queryKey: ['my-restaurant'] });
      setCreated({ id: r._id, status: r.status });
    } catch (e) {
      setSubmitError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (created) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <motion.span initial={{ rotate: -30, scale: 0.4 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }} className="mx-auto grid size-20 place-items-center rounded-full bg-saffron-400 text-herb-950">
          <PartyPopper className="size-9" />
        </motion.span>
        <h1 className="mt-6 text-[40px] leading-tight text-ink">{created.status === 'active' ? 'Your doors are open' : 'Submitted for review'}</h1>
        <p className="mt-3 text-ink-3">
          {created.status === 'active'
            ? `${d.name || 'Your restaurant'} is live on TableNest. Add your menu and tables next so guests can order and book.`
            : 'Our team checks every new restaurant. You can set up your menu and tables while you wait.'}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Button variant="primary" size="lg" onClick={() => navigate('/owner/menu')}>
            Add my menu
          </Button>
          <LinkButton to="/owner" variant="outline" size="lg">
            Open dashboard
          </LinkButton>
        </div>
      </motion.div>
    );
  }

  const tax = (Number(d.taxPct) || 0) / 100;

  return (
    <div>
      <p className="eyebrow">List your restaurant</p>
      <div className="mt-4 flex items-center gap-1.5" aria-hidden>
        {STEPS.map((_, i) => (
          <span key={i} className={cn('h-1.5 flex-1 rounded-full transition-colors duration-500', i < step ? 'bg-herb-700' : i === step ? 'bg-saffron-400' : 'bg-line')} />
        ))}
      </div>
      <p className="mt-3 text-[13px] font-semibold text-ink-3">
        Step {step + 1} of {STEPS.length} · {STEPS[step]}
      </p>

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={step}
          custom={dir}
          initial={{ opacity: 0, x: 30 * dir }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 * dir }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6"
        >
          {step === 0 && (
            <>
              <h1 className="mb-2 text-[36px] leading-tight text-ink">Start with you</h1>
              <p className="mb-7 text-ink-3">
                Free to join{settings?.plans?.starter ? ` — we take ${Math.round(settings.plans.starter.commissionRate * 100)}% of food sales, nothing up front` : ''}.
              </p>
              <AccountStep onDone={() => go(1)} />
            </>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h1 className="text-[36px] leading-tight text-ink">Tell guests who you are</h1>
              <Input label="Restaurant name" value={d.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
              <Input label="Cuisine" list="cuisines" value={d.cuisineType} onChange={(e) => set('cuisineType', e.target.value)} error={errors.cuisineType} placeholder="e.g. Italian" />
              <datalist id="cuisines">
                {CUISINES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-[13px] font-semibold text-ink-2">Price level</p>
                  <Segmented id="price" value={d.priceRange} onChange={(v) => set('priceRange', v)} options={(['$', '$$', '$$$', '$$$$'] as const).map((p) => ({ value: p, label: p }))} />
                </div>
                <Input label="Seats" type="number" min={1} value={d.seatingCapacity} onChange={(e) => set('seatingCapacity', Number(e.target.value))} error={errors.seatingCapacity} />
              </div>
              <Textarea label="Describe the place" optional value={d.description} onChange={(e) => set('description', e.target.value.slice(0, 2000))} placeholder="What makes an evening here special?" />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h1 className="text-[36px] leading-tight text-ink">Where can guests find you?</h1>
              <Input label="Street address" value={d.address} onChange={(e) => set('address', e.target.value)} error={errors.address} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="City" value={d.city} onChange={(e) => set('city', e.target.value)} />
                <Input label="Country" value={d.country} onChange={(e) => set('country', e.target.value)} />
                <Input label="Phone" optional type="tel" value={d.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} />
                <Input label="Email" optional type="email" value={d.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
              </div>
              <Input label="Website" optional value={d.website} onChange={(e) => set('website', e.target.value)} error={errors.website} placeholder="https://" />
              <Select label="Time zone" hint="Used for your hours and booking times." value={d.timezone} onChange={(e) => set('timezone', e.target.value)}>
                {timezones.map((z) => (
                  <option key={z} value={z}>
                    {z.replace(/_/g, ' ')}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h1 className="text-[36px] leading-tight text-ink">When are you open?</h1>
              <p className="text-ink-3">Guests can only book and order within these hours. Closing after midnight? Set the closing time earlier than opening.</p>
              <HoursEditor value={d.openingHours} onChange={(v) => set('openingHours', v)} />
              {errors.hours && <p className="text-sm font-medium text-tomato-600">{errors.hours}</p>}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h1 className="text-[36px] leading-tight text-ink">How do you serve guests?</h1>
              <div className="space-y-4 rounded-[20px] border border-line bg-card p-5">
                <Toggle checked={d.dineIn} onChange={(v) => set('dineIn', v)} label={<span className="inline-flex items-center gap-2"><Armchair className="size-4" /> Table reservations</span>} description="Guests book a time; you confirm." />
                <Toggle checked={d.delivery} onChange={(v) => set('delivery', v)} label={<span className="inline-flex items-center gap-2"><Bike className="size-4" /> Delivery</span>} description="You deliver; guests pay on arrival." />
                <Toggle checked={d.pickup} onChange={(v) => set('pickup', v)} label={<span className="inline-flex items-center gap-2"><ShoppingBag className="size-4" /> Pickup</span>} description="Guests collect from you." />
              </div>
              {errors.services && <p className="text-sm font-medium text-tomato-600">{errors.services}</p>}
              <div className="grid gap-4 sm:grid-cols-2">
                {d.delivery && (
                  <>
                    <Input label="Delivery fee" type="number" min={0} step="0.01" value={d.deliveryFee} onChange={(e) => set('deliveryFee', Number(e.target.value))} />
                    <Input label="Minimum delivery order" type="number" min={0} step="0.01" value={d.minOrder} onChange={(e) => set('minOrder', Number(e.target.value))} />
                  </>
                )}
                <Input label="Tax on food (%)" type="number" min={0} max={40} value={d.taxPct} onChange={(e) => set('taxPct', Number(e.target.value))} hint="Added to each order. Use 0 if prices include tax." />
                <Input label="Typical prep time (min)" type="number" min={5} max={240} value={d.prepTime} onChange={(e) => set('prepTime', Number(e.target.value))} />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h1 className="text-[36px] leading-tight text-ink">Show them the room</h1>
              <p className="text-ink-3">Restaurants with real photos get chosen far more often. The dining room, the plate, the people.</p>
              <GalleryUploader value={d.images} onChange={(v) => set('images', v)} />
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <h1 className="text-[36px] leading-tight text-ink">Ready to open?</h1>
              <dl className="divide-y divide-line rounded-[20px] border border-line bg-card text-sm">
                {[
                  ['Name', d.name],
                  ['Cuisine', `${d.cuisineType} · ${d.priceRange} · ${d.seatingCapacity} seats`],
                  ['Address', [d.address, d.city, d.country].filter(Boolean).join(', ')],
                  ['Serving', [d.dineIn && 'Tables', d.delivery && 'Delivery', d.pickup && 'Pickup'].filter(Boolean).join(', ')],
                  d.delivery ? ['Delivery', `${money(d.deliveryFee)} fee · ${d.minOrder ? `${money(d.minOrder)} minimum` : 'no minimum'}`] : null,
                  ['Tax', `${Math.round(tax * 100)}%`],
                  ['Photos', `${d.images.length} uploaded`],
                ]
                  .filter(Boolean)
                  .map((row) => (
                    <div key={row![0]} className="flex justify-between gap-4 px-4 py-3">
                      <dt className="text-ink-3">{row![0]}</dt>
                      <dd className="text-right font-semibold text-ink">{row![1] || '—'}</dd>
                    </div>
                  ))}
              </dl>
              {submitError && <p className="rounded-2xl bg-tomato-50 p-3.5 text-sm text-tomato-700">{submitError}</p>}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {step > 0 && (
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
          {step > 1 ? (
            <Button variant="ghost" icon={<ArrowLeft className="size-4" />} onClick={() => go(step - 1)}>
              Back
            </Button>
          ) : (
            <span />
          )}
          {step < STEPS.length - 1 ? (
            <Button variant="dark" size="lg" trail={<ArrowRight className="size-4" />} onClick={() => go(step + 1)}>
              {step === 5 && !d.images.length ? 'Skip for now' : 'Continue'}
            </Button>
          ) : (
            <Button variant="primary" size="lg" loading={busy} icon={<Check className="size-4" />} onClick={publish}>
              Open my restaurant
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

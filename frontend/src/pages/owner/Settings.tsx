import { useState, type ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { restaurantApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { cn } from '@/lib/format';
import type { Restaurant } from '@/lib/types';
import { DashHead, Panel } from '@/layouts/DashboardLayout';
import { OwnerGate, StatusBanner } from '@/components/OwnerGate';
import { GalleryUploader, SingleImageUploader } from '@/components/ImageUploader';
import { DEFAULT_HOURS, HoursEditor, timezones } from '@/components/HoursEditor';
import { Button } from '@/ui/Button';
import { Input, Select, Textarea, Toggle } from '@/ui/Field';

const CUISINES = ['African', 'Rwandan', 'Ethiopian', 'Italian', 'French', 'Indian', 'Chinese', 'Japanese', 'Mexican', 'American', 'Mediterranean', 'Middle Eastern', 'Thai', 'Vegetarian', 'Seafood', 'Grill', 'Café', 'Bakery', 'Fusion'];

type Form = Omit<Partial<Restaurant>, 'taxRate'> & { taxPct: string };

function Section({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <Panel>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div>
          <h2 className="font-display text-xl text-ink">{title}</h2>
          {desc && <p className="mt-1 text-[13.5px] text-ink-3">{desc}</p>}
        </div>
        <div>{children}</div>
      </div>
    </Panel>
  );
}

function Editor({ r }: { r: Restaurant }) {
  const qc = useQueryClient();
  const [f, setF] = useState<Form>({ ...r, openingHours: Object.keys(r.openingHours ?? {}).length ? r.openingHours : DEFAULT_HOURS, taxPct: String(Math.round((r.taxRate ?? 0) * 10000) / 100) });
  const [dirty, setDirty] = useState(false);
  const set = (patch: Partial<Form>) => {
    setF((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };
  const save = useMutation({
    mutationFn: () =>
      restaurantApi.update(r._id, {
        name: f.name?.trim(),
        cuisineType: f.cuisineType,
        description: f.description?.trim() || null,
        images: f.images,
        logo: f.logo ?? null,
        address: f.address?.trim(),
        city: f.city?.trim() || null,
        country: f.country?.trim() || null,
        phone: f.phone?.trim() || null,
        email: f.email?.trim() || null,
        website: f.website?.trim() || null,
        seatingCapacity: Number(f.seatingCapacity) || 1,
        priceRange: f.priceRange,
        timezone: f.timezone || undefined,
        openingHours: f.openingHours,
        dineIn: f.dineIn,
        delivery: f.delivery,
        pickup: f.pickup,
        acceptingOrders: f.acceptingOrders,
        deliveryFee: Number(f.deliveryFee) || 0,
        minOrder: Number(f.minOrder) || 0,
        taxRate: Math.min(0.4, (Number(f.taxPct) || 0) / 100),
        prepTime: Number(f.prepTime) || 20,
      }),
    onSuccess: (updated) => {
      qc.setQueryData(['my-restaurant'], updated);
      qc.invalidateQueries({ queryKey: ['restaurant', r._id] });
      setDirty(false);
      toast.success('Restaurant updated');
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const noService = !f.dineIn && !f.delivery && !f.pickup;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="pb-24"
    >
      <StatusBanner r={r} />
      <DashHead title="Restaurant settings" lead="Everything guests see on your page. Changes go live as soon as you save." />
      <div className="space-y-6">
        <Section title="Service right now" desc="Pause online orders on a busy night without closing your page.">
          <Toggle checked={!!f.acceptingOrders} onChange={(v) => set({ acceptingOrders: v })} label={f.acceptingOrders ? 'Taking online orders' : 'Online orders paused'} description="Bookings keep working either way." />
        </Section>

        <Section title="The basics">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Restaurant name" value={f.name ?? ''} maxLength={100} onChange={(e) => set({ name: e.target.value })} />
            <Select label="Cuisine" value={f.cuisineType ?? ''} onChange={(e) => set({ cuisineType: e.target.value })}>
              {Array.from(new Set([f.cuisineType, ...CUISINES].filter(Boolean) as string[])).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
            <Textarea label="Your story" optional className="sm:col-span-2" rows={4} maxLength={1000} value={f.description ?? ''} onChange={(e) => set({ description: e.target.value })} placeholder="What you cook, who cooks it, and why people come back." />
            <Select label="Price level" value={f.priceRange} onChange={(e) => set({ priceRange: e.target.value as Restaurant['priceRange'] })}>
              <option value="$">$ · Budget-friendly</option>
              <option value="$$">$$ · Moderate</option>
              <option value="$$$">$$$ · Upscale</option>
              <option value="$$$$">$$$$ · Fine dining</option>
            </Select>
            <Input label="Seats" type="number" min={1} value={f.seatingCapacity ?? ''} onChange={(e) => set({ seatingCapacity: Number(e.target.value) })} />
          </div>
        </Section>

        <Section title="Photos" desc="The first photo is your cover. Bright, close-up food photos get the most bookings.">
          <div className="grid gap-6 sm:grid-cols-[140px_1fr]">
            <div>
              <p className="mb-1.5 text-sm font-semibold text-ink-2">Logo</p>
              <SingleImageUploader label="Logo" value={f.logo ?? null} onChange={(url) => set({ logo: url })} className="aspect-square w-full" />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-semibold text-ink-2">Gallery</p>
              <GalleryUploader value={f.images ?? []} onChange={(images) => set({ images })} />
            </div>
          </div>
        </Section>

        <Section title="Where & how to reach you">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Street address" className="sm:col-span-2" value={f.address ?? ''} onChange={(e) => set({ address: e.target.value })} />
            <Input label="City" value={f.city ?? ''} onChange={(e) => set({ city: e.target.value })} />
            <Input label="Country" value={f.country ?? ''} onChange={(e) => set({ country: e.target.value })} />
            <Input label="Phone" optional type="tel" value={f.phone ?? ''} onChange={(e) => set({ phone: e.target.value })} />
            <Input label="Email" optional type="email" value={f.email ?? ''} onChange={(e) => set({ email: e.target.value })} />
            <Input label="Website" optional className="sm:col-span-2" type="url" value={f.website ?? ''} onChange={(e) => set({ website: e.target.value })} placeholder="https://" />
          </div>
        </Section>

        <Section title="Opening hours" desc="Bookings and orders are only accepted inside these hours, in your restaurant's time zone.">
          <Select label="Time zone" className="mb-4 max-w-sm" value={f.timezone ?? ''} onChange={(e) => set({ timezone: e.target.value })}>
            {!f.timezone && <option value="">Choose…</option>}
            {timezones.map((z) => (
              <option key={z}>{z}</option>
            ))}
          </Select>
          <HoursEditor value={f.openingHours ?? DEFAULT_HOURS} onChange={(openingHours) => set({ openingHours })} />
        </Section>

        <Section title="Ordering" desc="Totals are always calculated by TableNest from these settings — guests can never change them.">
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            {(
              [
                ['dineIn', 'Dine in & bookings'],
                ['pickup', 'Pickup'],
                ['delivery', 'Delivery'],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className={cn('flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm font-semibold transition', f[k] ? 'border-herb-900 bg-herb-50 text-herb-900' : 'border-line bg-card text-ink-3')}>
                <input type="checkbox" checked={!!f[k]} onChange={(e) => set({ [k]: e.target.checked })} className="size-4 accent-herb-700" /> {label}
              </label>
            ))}
          </div>
          {noService && <p className="mb-4 rounded-xl bg-tomato-50 p-3 text-sm text-tomato-700">Turn on at least one way to serve guests.</p>}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Input label="Delivery fee" type="number" min={0} step="0.01" disabled={!f.delivery} value={f.deliveryFee ?? 0} onChange={(e) => set({ deliveryFee: Number(e.target.value) })} />
            <Input label="Minimum order" type="number" min={0} step="0.01" value={f.minOrder ?? 0} onChange={(e) => set({ minOrder: Number(e.target.value) })} />
            <Input label="Tax" type="number" min={0} max={40} step="0.01" value={f.taxPct} onChange={(e) => set({ taxPct: e.target.value })} trailing="%" />
            <Input label="Usual prep time" type="number" min={5} max={240} value={f.prepTime ?? 20} onChange={(e) => set({ prepTime: Number(e.target.value) })} trailing="min" />
          </div>
        </Section>
      </div>

      <div className={cn('fixed right-4 bottom-4 left-4 z-30 transition-all duration-300 lg:left-[288px]', dirty ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0')}>
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-full bg-herb-950 py-2 pr-2 pl-5 text-paper shadow-2xl">
          <p className="text-sm">You have unsaved changes</p>
          <Button type="submit" variant="light" size="sm" loading={save.isPending} disabled={noService || !f.name?.trim() || !f.address?.trim()} icon={<Save className="size-4" />}>
            Save changes
          </Button>
        </div>
      </div>
    </form>
  );
}

export default function OwnerSettings() {
  return <OwnerGate>{(r) => <Editor key={r._id} r={r} />}</OwnerGate>;
}

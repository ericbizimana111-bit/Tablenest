import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import type { PlatformSettings } from '@/lib/types';
import { DashHead, Panel } from '@/layouts/DashboardLayout';
import { Button } from '@/ui/Button';
import { Input, Toggle } from '@/ui/Field';
import { Skeleton } from '@/ui/Loader';

/** Rates are stored as fractions; the form edits them as percentages. */
const pct = (n: number) => String(Math.round(n * 10000) / 100);
const frac = (s: string) => Math.max(0, Number(s) || 0) / 100;

export default function AdminSettings() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin', 'settings'], queryFn: adminApi.settings });
  const [f, setF] = useState<Record<string, string | boolean> | null>(null);
  useEffect(() => {
    if (data && !f)
      setF({
        currency: data.currency,
        serviceFeeRate: pct(data.serviceFeeRate),
        serviceFeeCap: String(data.serviceFeeCap),
        starterFee: String(data.plans.starter.monthlyFee),
        starterRate: pct(data.plans.starter.commissionRate),
        proFee: String(data.plans.pro.monthlyFee),
        proRate: pct(data.plans.pro.commissionRate),
        bookingFeePerCover: String(data.bookingFeePerCover),
        sponsoredWeeklyFee: String(data.sponsoredWeeklyFee),
        loyaltyPointsPerUnit: String(data.loyaltyPointsPerUnit),
        requireRestaurantApproval: data.requireRestaurantApproval,
      });
  }, [data, f]);
  const save = useMutation({
    mutationFn: () => {
      const s = f!;
      const body: Partial<PlatformSettings> = {
        currency: String(s.currency).trim().toUpperCase(),
        serviceFeeRate: frac(String(s.serviceFeeRate)),
        serviceFeeCap: Number(s.serviceFeeCap) || 0,
        plans: {
          starter: { monthlyFee: Number(s.starterFee) || 0, commissionRate: frac(String(s.starterRate)) },
          pro: { monthlyFee: Number(s.proFee) || 0, commissionRate: frac(String(s.proRate)) },
        },
        bookingFeePerCover: Number(s.bookingFeePerCover) || 0,
        sponsoredWeeklyFee: Number(s.sponsoredWeeklyFee) || 0,
        loyaltyPointsPerUnit: Number(s.loyaltyPointsPerUnit) || 0,
        requireRestaurantApproval: !!s.requireRestaurantApproval,
      };
      return adminApi.saveSettings(body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
      qc.invalidateQueries({ queryKey: ['settings', 'public'] });
      toast.success('Settings saved — they apply to new orders and bookings');
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (!f) return <Skeleton className="h-96" />;
  const field = (k: string) => ({ value: String(f[k]), onChange: (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value }) });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <DashHead
        title="Platform settings"
        lead="How TableNest makes money. Changes apply to new orders and bookings only — past totals never change."
        action={
          <Button type="submit" variant="dark" size="sm" loading={save.isPending} icon={<Save className="size-4" />}>
            Save settings
          </Button>
        }
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Money">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Currency" hint="ISO code, e.g. USD, RWF, EUR" maxLength={3} {...field('currency')} />
            <div />
            <Input label="Guest service fee" type="number" min={0} max={20} step="0.1" trailing="%" hint="Added to each order and shown to the guest." {...field('serviceFeeRate')} />
            <Input label="Service fee cap" type="number" min={0} step="0.01" hint="Maximum per order. 0 = no cap." {...field('serviceFeeCap')} />
            <Input label="Booking fee per guest" type="number" min={0} step="0.01" hint="Charged to the restaurant for each seated guest." {...field('bookingFeePerCover')} />
            <Input label="Featured placement, per week" type="number" min={0} step="0.01" {...field('sponsoredWeeklyFee')} />
          </div>
        </Panel>
        <Panel title="Restaurant plans">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Starter · monthly" type="number" min={0} step="0.01" {...field('starterFee')} />
            <Input label="Starter · commission" type="number" min={0} max={50} step="0.1" trailing="%" {...field('starterRate')} />
            <Input label="Pro · monthly" type="number" min={0} step="0.01" {...field('proFee')} />
            <Input label="Pro · commission" type="number" min={0} max={50} step="0.1" trailing="%" {...field('proRate')} />
          </div>
        </Panel>
        <Panel title="Guests & partners">
          <div className="space-y-5">
            <Input label="Loyalty points per 1 unit spent" type="number" min={0} step="0.1" className="max-w-xs" {...field('loyaltyPointsPerUnit')} />
            <Toggle checked={!!f.requireRestaurantApproval} onChange={(v) => setF({ ...f, requireRestaurantApproval: v })} label="Review new restaurants before they go live" description="Recommended. New partners wait in Restaurants → Pending." />
          </div>
        </Panel>
      </div>
    </form>
  );
}

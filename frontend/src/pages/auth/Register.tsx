import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Check, Gift, Mail, Phone, UserRound } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { errorMessage } from '@/lib/http';
import { cn } from '@/lib/format';
import { Button } from '@/ui/Button';
import { Input, PasswordInput } from '@/ui/Field';
import { safeNext } from './Login';

export const passwordRule = z
  .string()
  .min(8, 'At least 8 characters')
  .max(100)
  .regex(/[A-Za-z]/, 'Include a letter')
  .regex(/\d/, 'Include a number');

const schema = z.object({
  fullName: z.string().trim().min(2, 'Tell us your name').max(80),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^\+?[\d\s()-]{6,20}$/.test(v), 'Enter a valid phone number'),
  password: passwordRule,
  referralCode: z.string().trim().max(40).optional(),
});
type Form = z.infer<typeof schema>;

/** Live checklist under the password field. */
export function PasswordHints({ value }: { value: string }) {
  const rules = [
    { ok: value.length >= 8, label: '8+ characters' },
    { ok: /[A-Za-z]/.test(value), label: 'a letter' },
    { ok: /\d/.test(value), label: 'a number' },
  ];
  return (
    <ul className="mt-2 flex flex-wrap gap-3 text-[12px]">
      {rules.map((r) => (
        <li key={r.label} className={cn('inline-flex items-center gap-1 transition-colors', r.ok ? 'text-herb-600' : 'text-ink-4')}>
          <Check className={cn('size-3.5 transition-transform', r.ok ? 'scale-100' : 'scale-75 opacity-50')} /> {r.label}
        </li>
      ))}
    </ul>
  );
}

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(Boolean(params.get('ref')));
  const { register, handleSubmit, formState, watch } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { referralCode: params.get('ref') || '' } });

  const submit = handleSubmit(async (v) => {
    setError(null);
    try {
      await signUp({ fullName: v.fullName, email: v.email, password: v.password, phone: v.phone || undefined, referralCode: v.referralCode || undefined });
      navigate(safeNext(params.get('next')) || '/home?welcome=1', { replace: true });
    } catch (e) {
      setError(errorMessage(e));
    }
  });

  return (
    <div>
      <p className="eyebrow">Join TableNest</p>
      <h1 className="mt-3 text-[40px] leading-tight text-ink">Create your account</h1>
      <p className="mt-2 text-ink-3">
        Already a member?{' '}
        <Link to={`/login${params.get('next') ? `?next=${encodeURIComponent(params.get('next')!)}` : ''}`} className="font-semibold text-herb-700 hover:underline">
          Sign in
        </Link>
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        <Input label="Full name" autoComplete="name" leading={<UserRound className="size-4" />} placeholder="Your name" error={formState.errors.fullName?.message} {...register('fullName')} />
        <Input label="Email" type="email" autoComplete="email" leading={<Mail className="size-4" />} placeholder="you@example.com" error={formState.errors.email?.message} {...register('email')} />
        <Input label="Phone" optional type="tel" autoComplete="tel" leading={<Phone className="size-4" />} placeholder="For booking updates" error={formState.errors.phone?.message} {...register('phone')} />
        <div>
          <PasswordInput label="Password" autoComplete="new-password" placeholder="Create a password" error={formState.errors.password?.message} {...register('password')} />
          <PasswordHints value={watch('password') || ''} />
        </div>
        {showCode ? (
          <Input label="Invite code" optional leading={<Gift className="size-4" />} placeholder="NEST-XXXX-XXXXXX" {...register('referralCode')} />
        ) : (
          <button type="button" onClick={() => setShowCode(true)} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-herb-700 hover:underline">
            <Gift className="size-4" /> Have an invite code?
          </button>
        )}
        {error && (
          <p role="alert" className="rounded-2xl bg-tomato-50 p-3.5 text-sm text-tomato-700">
            {error}
          </p>
        )}
        <Button type="submit" variant="primary" size="lg" block loading={formState.isSubmitting} trail={<ArrowRight className="size-4" />}>
          Create account
        </Button>
        <p className="text-center text-[12px] text-ink-4">
          By joining you agree to our <Link to="/terms" className="underline">terms</Link> and <Link to="/privacy" className="underline">privacy notice</Link>. You'll start with 100 reward points.
        </p>
      </form>
    </div>
  );
}

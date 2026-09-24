import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Mail } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { homeFor } from '@/auth/AuthProvider';
import { errorMessage } from '@/lib/http';
import { Button } from '@/ui/Button';
import { Input, PasswordInput } from '@/ui/Field';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});
type Form = z.infer<typeof schema>;

/** Only internal paths are allowed as a post-login destination. */
export const safeNext = (next: string | null) => (next && next.startsWith('/') && !next.startsWith('//') ? next : null);

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<Form>({ resolver: zodResolver(schema) });

  const submit = handleSubmit(async ({ email, password }) => {
    setError(null);
    try {
      const user = await signIn(email, password);
      const next = safeNext(params.get('next'));
      navigate(next && (user.role === 'customer' || next.startsWith(homeFor(user.role))) ? next : homeFor(user.role), { replace: true });
    } catch (e) {
      setError(errorMessage(e));
    }
  });

  return (
    <div>
      <p className="eyebrow">Welcome back</p>
      <h1 className="mt-3 text-[40px] leading-tight text-ink">Sign in</h1>
      <p className="mt-2 text-ink-3">
        New here?{' '}
        <Link to={`/register${params.get('next') ? `?next=${encodeURIComponent(params.get('next')!)}` : ''}`} className="font-semibold text-herb-700 hover:underline">
          Create a free account
        </Link>
      </p>
      {params.get('expired') && <p className="mt-6 rounded-2xl bg-saffron-50 p-3.5 text-sm text-saffron-700">Your session ended — please sign in again.</p>}
      {params.get('reset') && <p className="mt-6 rounded-2xl bg-herb-50 p-3.5 text-sm text-herb-700">Password updated. Sign in with your new password.</p>}

      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        <Input label="Email" type="email" autoComplete="email" leading={<Mail className="size-4" />} placeholder="you@example.com" error={formState.errors.email?.message} {...register('email')} />
        <div>
          <PasswordInput label="Password" autoComplete="current-password" placeholder="Your password" error={formState.errors.password?.message} {...register('password')} />
          <div className="mt-2 text-right">
            <Link to="/forgot-password" className="text-[13px] font-semibold text-ink-3 hover:text-herb-700">
              Forgot password?
            </Link>
          </div>
        </div>
        {error && (
          <p role="alert" className="rounded-2xl bg-tomato-50 p-3.5 text-sm text-tomato-700">
            {error}
          </p>
        )}
        <Button type="submit" variant="dark" size="lg" block loading={formState.isSubmitting} trail={<ArrowRight className="size-4" />}>
          Sign in
        </Button>
      </form>

      <div className="mt-10 rounded-[20px] border border-line bg-card p-5">
        <p className="text-sm font-semibold text-ink">Own a restaurant?</p>
        <p className="mt-1 text-[13.5px] text-ink-3">Partners sign in here too and land on their dashboard.</p>
        <Link to="/partner/join" className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-herb-700 hover:underline">
          List your restaurant <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

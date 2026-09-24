import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, MailCheck } from 'lucide-react';
import { authApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { Button, LinkButton } from '@/ui/Button';
import { Input } from '@/ui/Field';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<{ devResetUrl?: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address');
    setBusy(true);
    setError(null);
    try {
      setSent(await authApi.forgot(email.trim()));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <span className="grid size-14 place-items-center rounded-2xl bg-herb-50 text-herb-700">
          <MailCheck className="size-7" />
        </span>
        <h1 className="mt-6 text-[36px] leading-tight text-ink">Check your inbox</h1>
        <p className="mt-3 text-ink-3">If an account exists for {email}, a link to choose a new password is on its way. It works for one hour.</p>
        {sent.devResetUrl && (
          <p className="mt-5 rounded-2xl border border-dashed border-line-2 p-4 text-[13px] text-ink-3">
            Development mode (no email server configured):{' '}
            <Link to={sent.devResetUrl} className="font-semibold text-herb-700 underline">
              open the reset link
            </Link>
          </p>
        )}
        <LinkButton to="/login" variant="outline" className="mt-8" icon={<ArrowLeft className="size-4" />}>
          Back to sign in
        </LinkButton>
      </motion.div>
    );
  }

  return (
    <div>
      <p className="eyebrow">Account help</p>
      <h1 className="mt-3 text-[40px] leading-tight text-ink">Forgot your password?</h1>
      <p className="mt-2 text-ink-3">Tell us your email and we'll send you a link to set a new one.</p>
      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        <Input label="Email" type="email" autoComplete="email" leading={<Mail className="size-4" />} value={email} onChange={(e) => setEmail(e.target.value)} error={error ?? undefined} placeholder="you@example.com" />
        <Button type="submit" variant="dark" size="lg" block loading={busy}>
          Send reset link
        </Button>
      </form>
      <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-3 hover:text-ink">
        <ArrowLeft className="size-4" /> Back to sign in
      </Link>
    </div>
  );
}

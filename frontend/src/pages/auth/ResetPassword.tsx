import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { Button, LinkButton } from '@/ui/Button';
import { PasswordInput } from '@/ui/Field';
import { EmptyState } from '@/ui/bits';
import { KeyRound } from 'lucide-react';
import { PasswordHints, passwordRule } from './Register';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!/^[a-f0-9]{64}$/.test(token)) {
    return <EmptyState icon={<KeyRound className="size-6" />} title="This link doesn't look right" body="Reset links expire after an hour and can be used once. Ask for a new one." action={<LinkButton to="/forgot-password">Get a new link</LinkButton>} />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const check = passwordRule.safeParse(password);
    if (!check.success) return setError(check.error.issues[0].message);
    if (password !== confirm) return setError('The two passwords do not match');
    setBusy(true);
    setError(null);
    try {
      await authApi.reset(token, password);
      navigate('/login?reset=1', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="eyebrow">Account help</p>
      <h1 className="mt-3 text-[40px] leading-tight text-ink">Choose a new password</h1>
      <p className="mt-2 text-ink-3">For your security, this signs you out on every other device.</p>
      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        <div>
          <PasswordInput label="New password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <PasswordHints value={password} />
        </div>
        <PasswordInput label="Repeat it" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        {error && (
          <p role="alert" className="rounded-2xl bg-tomato-50 p-3.5 text-sm text-tomato-700">
            {error}
          </p>
        )}
        <Button type="submit" variant="dark" size="lg" block loading={busy}>
          Save password
        </Button>
      </form>
    </div>
  );
}

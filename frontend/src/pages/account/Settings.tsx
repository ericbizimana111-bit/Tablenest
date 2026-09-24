import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { LogOut, ShieldCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi, userApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { useAuth } from '@/auth/useAuth';
import { PageHead } from '@/layouts/AccountLayout';
import { SingleImageUploader } from '@/components/ImageUploader';
import { Button } from '@/ui/Button';
import { Input, PasswordInput, Toggle } from '@/ui/Field';
import { Confirm } from '@/ui/Overlay';
import { PasswordHints, passwordRule } from '@/pages/auth/Register';

function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] border border-line bg-card p-6">
      <h2 className="text-xl text-ink">{title}</h2>
      {desc && <p className="mt-1 text-sm text-ink-3">{desc}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function Settings() {
  const { user, setUser, signOut, replaceToken } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ fullName: user?.fullName || '', phone: user?.phone || '' });
  const [pw, setPw] = useState({ current: '', next: '' });
  const [pwError, setPwError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const prefs = user?.notificationPrefs ?? { bookingConfirmation: true, marketing: false, orderTracking: true };

  const saveProfile = useMutation({
    mutationFn: (b: Parameters<typeof userApi.updateProfile>[0]) => userApi.updateProfile(b),
    onSuccess: (u) => (setUser(u), toast.success('Saved')),
    onError: (e) => toast.error(errorMessage(e)),
  });
  const savePrefs = useMutation({ mutationFn: userApi.prefs, onSuccess: (u) => setUser(u), onError: (e) => toast.error(errorMessage(e)) });
  const changePw = useMutation({
    mutationFn: () => authApi.changePassword(pw.current, pw.next),
    onSuccess: (r) => {
      replaceToken(r.accessToken);
      setPw({ current: '', next: '' });
      toast.success('Password changed — other devices were signed out');
    },
    onError: (e) => setPwError(errorMessage(e)),
  });
  const logoutAll = useMutation({ mutationFn: authApi.logoutAll, onSuccess: () => (signOut(), navigate('/login')) });
  const deactivate = useMutation({ mutationFn: userApi.deactivate, onSuccess: () => (signOut(), navigate('/')) });

  if (!user) return null;
  return (
    <div className="space-y-6">
      <PageHead eyebrow="Account" title="Profile & security" />

      <Card title="Profile">
        <div className="flex flex-col gap-6 sm:flex-row">
          <SingleImageUploader label="Photo" value={user.avatar} onChange={(url) => saveProfile.mutate({ avatar: url })} className="size-28 shrink-0 [&>button]:rounded-full" />
          <form
            className="grid flex-1 gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              saveProfile.mutate({ fullName: profile.fullName.trim(), phone: profile.phone.trim() || null });
            }}
          >
            <Input label="Full name" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
            <Input label="Phone" type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            <Input label="Email" value={user.email} disabled hint="Contact support to change your email." className="sm:col-span-2" />
            <div className="sm:col-span-2">
              <Button type="submit" variant="dark" loading={saveProfile.isPending} disabled={profile.fullName.trim().length < 2}>
                Save profile
              </Button>
            </div>
          </form>
        </div>
      </Card>

      <Card title="Notifications" desc="Choose what we tell you about. We never share your details for marketing.">
        <div className="space-y-5">
          <Toggle checked={prefs.bookingConfirmation} onChange={(v) => savePrefs.mutate({ ...prefs, bookingConfirmation: v })} label="Booking updates" description="Confirmations, changes and reminders." />
          <Toggle checked={prefs.orderTracking} onChange={(v) => savePrefs.mutate({ ...prefs, orderTracking: v })} label="Order tracking" description="Every step from kitchen to door." />
          <Toggle checked={prefs.marketing} onChange={(v) => savePrefs.mutate({ ...prefs, marketing: v })} label="Offers & news" description="Occasional deals from restaurants you like." />
        </div>
      </Card>

      <Card title="Password" desc="Changing your password signs you out on every other device.">
        <form
          className="grid gap-4 sm:max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            setPwError(null);
            const ok = passwordRule.safeParse(pw.next);
            if (!ok.success) return setPwError(ok.error.issues[0].message);
            changePw.mutate();
          }}
        >
          <PasswordInput label="Current password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
          <div>
            <PasswordInput label="New password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
            <PasswordHints value={pw.next} />
          </div>
          {pwError && <p className="rounded-xl bg-tomato-50 p-3 text-sm text-tomato-700">{pwError}</p>}
          <div>
            <Button type="submit" variant="dark" loading={changePw.isPending} disabled={!pw.current || !pw.next} icon={<ShieldCheck className="size-4" />}>
              Update password
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Sessions & account">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" icon={<LogOut className="size-4" />} loading={logoutAll.isPending} onClick={() => logoutAll.mutate()}>
            Sign out everywhere
          </Button>
          <Button variant="danger" icon={<UserX className="size-4" />} onClick={() => setLeaving(true)}>
            Deactivate account
          </Button>
        </div>
      </Card>

      <Confirm
        open={leaving}
        onClose={() => setLeaving(false)}
        onConfirm={() => deactivate.mutate()}
        loading={deactivate.isPending}
        title="Deactivate your account?"
        body="You'll be signed out and won't be able to sign in again. Your past orders stay with the restaurants for their records."
        confirmLabel="Deactivate"
      />
    </div>
  );
}

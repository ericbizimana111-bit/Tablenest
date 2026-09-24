import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { cn, timeAgo } from '@/lib/format';
import type { User } from '@/lib/types';
import { useAuth } from '@/auth/useAuth';
import { DashHead } from '@/layouts/DashboardLayout';
import { Avatar, Badge, Chip, EmptyState, Pager } from '@/ui/bits';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Field';
import { Confirm } from '@/ui/Overlay';
import { Skeleton } from '@/ui/Loader';

export default function AdminUsers() {
  const qc = useQueryClient();
  const { user: me } = useAuth();
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState<{ u: User; body: { isActive?: boolean; role?: 'customer' | 'owner' }; text: string } | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'users', role, q, page], queryFn: () => adminApi.users({ role, search: q, page }), placeholderData: (p) => p });
  const update = useMutation({
    mutationFn: (v: { id: string; body: { isActive?: boolean; role?: 'customer' | 'owner' } }) => adminApi.updateUser(v.id, v.body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      setPending(null);
      toast.success('Account updated');
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <>
      <DashHead title="People" lead="Guests, restaurant owners and admins. Admin access can only be granted from the server command line." />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2">
          {[
            ['', 'Everyone'],
            ['customer', 'Guests'],
            ['owner', 'Owners'],
            ['admin', 'Admins'],
          ].map(([v, l]) => (
            <Chip key={v} active={role === v} onClick={() => (setRole(v), setPage(1))}>
              {l}
            </Chip>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setQ(search.trim());
          }}
          className="w-full lg:w-80"
        >
          <Input aria-label="Search people" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or email" leading={<Search className="size-4" />} />
        </form>
      </div>
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : !data?.items.length ? (
        <EmptyState icon={<Users className="size-6" />} title="Nobody matches" />
      ) : (
        <div className="overflow-hidden rounded-[22px] border border-line bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-paper text-[12px] tracking-wide text-ink-3 uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Person</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Joined</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.items.map((u) => {
                  const self = u._id === me?._id;
                  return (
                    <tr key={u._id} className={cn(!u.isActive && 'bg-paper/60')}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.fullName} src={u.avatar} size={36} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-ink">{u.fullName}</p>
                            <p className="truncate text-[12.5px] text-ink-3">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={u.role === 'admin' ? 'ink' : u.role === 'owner' ? 'saffron' : 'herb'}>{u.role === 'customer' ? 'guest' : u.role}</Badge>
                      </td>
                      <td className="px-5 py-3 text-ink-3">{u.createdAt ? timeAgo(u.createdAt) : '—'}</td>
                      <td className="px-5 py-3">
                        <Badge tone={u.isActive ? 'herb' : 'tomato'} dot>
                          {u.isActive ? 'Active' : 'Disabled'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        {!self && u.role !== 'admin' && (
                          <div className="flex justify-end gap-1">
                            {u.role === 'customer' && !u.restaurantId && (
                              <Button size="sm" variant="ghost" onClick={() => setPending({ u, body: { role: 'owner' }, text: `${u.fullName} will be able to register a restaurant.` })}>
                                Make owner
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant={u.isActive ? 'ghost' : 'soft'}
                              className={u.isActive ? 'text-tomato-600' : ''}
                              onClick={() =>
                                setPending({
                                  u,
                                  body: { isActive: !u.isActive },
                                  text: u.isActive ? `${u.fullName} is signed out everywhere and can't sign in until re-enabled.` : `${u.fullName} will be able to sign in again.`,
                                })
                              }
                            >
                              {u.isActive ? 'Disable' : 'Enable'}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {data && <Pager page={data.page} pages={data.pages} onChange={setPage} />}
      <Confirm
        open={!!pending}
        onClose={() => setPending(null)}
        onConfirm={() => pending && update.mutate({ id: pending.u._id, body: pending.body })}
        loading={update.isPending}
        tone={pending?.body.isActive === false ? 'danger' : 'dark'}
        title={pending?.body.role ? 'Change role?' : pending?.body.isActive ? 'Enable account?' : 'Disable account?'}
        body={pending?.text}
      />
    </>
  );
}

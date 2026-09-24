import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { userApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { useAuth } from '@/auth/useAuth';

/** Saved restaurants for signed-in customers, with optimistic hearts. */
export function useFavorites() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const enabled = user?.role === 'customer';
  const query = useQuery({ queryKey: ['favorites'], queryFn: userApi.favorites, enabled, staleTime: 60_000 });
  const ids = new Set(query.data?.ids ?? []);

  const mutation = useMutation({
    mutationFn: ({ id, on }: { id: string; on: boolean }) => (on ? userApi.addFavorite(id) : userApi.removeFavorite(id)),
    onMutate: async ({ id, on }) => {
      await qc.cancelQueries({ queryKey: ['favorites'] });
      const prev = qc.getQueryData<{ restaurants: unknown[]; ids: string[] }>(['favorites']);
      qc.setQueryData(['favorites'], (d: { restaurants: unknown[]; ids: string[] } | undefined) => ({
        restaurants: d?.restaurants ?? [],
        ids: on ? [...(d?.ids ?? []), id] : (d?.ids ?? []).filter((x) => x !== id),
      }));
      return { prev };
    },
    onError: (err, _v, ctx) => {
      qc.setQueryData(['favorites'], ctx?.prev);
      toast.error(errorMessage(err));
    },
    onSuccess: (_d, { on }) => toast.success(on ? 'Saved to your favourites' : 'Removed from favourites'),
    onSettled: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const toggle = (id: string) => {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (user.role !== 'customer') {
      toast('Favourites are for diner accounts.');
      return;
    }
    mutation.mutate({ id, on: !ids.has(id) });
  };

  return { ids, toggle, isSaved: (id: string) => ids.has(id), list: query.data?.restaurants ?? [], loading: query.isLoading };
}

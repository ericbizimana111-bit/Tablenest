import { useQuery } from '@tanstack/react-query';
import { restaurantApi } from '@/lib/api';
import { useAuth } from '@/auth/useAuth';

/** The signed-in owner's restaurant (null until they finish setup). */
export function useMyRestaurant() {
  const { user } = useAuth();
  return useQuery({ queryKey: ['my-restaurant'], queryFn: restaurantApi.mine, enabled: user?.role === 'owner', staleTime: 60_000 });
}

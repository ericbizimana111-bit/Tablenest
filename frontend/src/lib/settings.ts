import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { settingsApi } from './api';
import { formatMoney } from './format';

/** Public platform settings (currency, service fee, plans). Cached for the session. */
export function usePublicSettings() {
  return useQuery({ queryKey: ['settings', 'public'], queryFn: settingsApi.public, staleTime: 10 * 60_000 });
}

/** `money(12.5)` → "$12.50" (or "RWF 5,000" …) in the platform currency. */
export function useMoney() {
  const { data } = usePublicSettings();
  const currency = data?.currency || 'USD';
  return useCallback((amount: number, override?: string | null) => formatMoney(amount, override || currency), [currency]);
}

import { useEffect, useState } from 'react';

/** Current time in ms, refreshed every `everyMs` — for "12m ago" style labels that must stay live. */
export function useNow(everyMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), everyMs);
    return () => clearInterval(t);
  }, [everyMs]);
  return now;
}

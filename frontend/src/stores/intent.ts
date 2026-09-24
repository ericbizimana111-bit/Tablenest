/** A booking intent carried from search (date, party size) into the restaurant's booking panel. */
export type Intent = { date?: string; guests?: number };
const KEY = 'tn.intent';

export const bookingIntent = {
  get(): Intent {
    try {
      return JSON.parse(sessionStorage.getItem(KEY) || '{}');
    } catch {
      return {};
    }
  },
  set(i: Intent) {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(i));
    } catch {
      /* ignore */
    }
  },
};

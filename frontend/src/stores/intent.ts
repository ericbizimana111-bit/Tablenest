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

/** The table a guest scanned (from an owner's table QR code); used for dine-in orders. */
export type TableIntent = { restaurantId: string; tableId: string; tableNumber: string };
const TABLE_KEY = 'tn.table';

export const tableIntent = {
  get(restaurantId?: string | null): TableIntent | null {
    try {
      const t = JSON.parse(sessionStorage.getItem(TABLE_KEY) || 'null') as TableIntent | null;
      return t && (!restaurantId || t.restaurantId === restaurantId) ? t : null;
    } catch {
      return null;
    }
  },
  set(t: TableIntent) {
    try {
      sessionStorage.setItem(TABLE_KEY, JSON.stringify(t));
    } catch {
      /* ignore */
    }
  },
};

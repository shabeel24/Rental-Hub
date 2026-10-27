// Mirrors BookingService on the backend so the quote on screen matches the real booking.
export interface Quote { days: number; discountPct: number; rent: number; deposit: number; total: number; }

export function daysBetween(start: string, end: string): number {
  if (!start || !end) return 0;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.round(ms / 86400000) + 1;
}

export function quote(perDay: number, deposit: number, qty: number, start: string, end: string): Quote | null {
  const days = daysBetween(start, end);
  if (days < 1 || qty < 1) return null;
  const discountPct = days >= 7 ? 15 : days >= 3 ? 10 : 0;
  const gross = perDay * qty * days;
  const rent = Math.round(gross * (100 - discountPct)) / 100;
  const dep = deposit * qty;
  return { days, discountPct, rent, deposit: dep, total: rent + dep };
}

export const todayIso = (offset = 0) => {
  const d = new Date(); d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

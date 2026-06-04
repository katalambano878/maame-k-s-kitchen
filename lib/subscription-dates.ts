const DAY_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const CALGARY_TZ = 'America/Edmonton';

export function nowInCalgary(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: CALGARY_TZ }));
}

export function getNextWeekday(from: Date, dayName: string): Date {
  const target = DAY_INDEX[dayName.toLowerCase()] ?? 6;
  const d = new Date(from);
  d.setHours(12, 0, 0, 0);
  const current = d.getDay();
  let delta = target - current;
  if (delta <= 0) delta += 7;
  d.setDate(d.getDate() + delta);
  return d;
}

export function getWeekStartMonday(from: Date): Date {
  const d = new Date(from);
  d.setHours(12, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getCancelDeadline(deliveryDate: Date, noticeDays: number): Date {
  const deadline = addDays(deliveryDate, -noticeDays);
  deadline.setHours(23, 59, 59, 999);
  return deadline;
}

export type CancelEligibility = {
  beforeDeadline: boolean;
  nextDelivery: Date;
  cancelDeadline: Date;
  message: string;
};

export function getCancelEligibility(
  noticeDays: number,
  deliveryDay = 'saturday',
  from = nowInCalgary()
): CancelEligibility {
  const nextDelivery = getNextWeekday(from, deliveryDay);
  const cancelDeadline = getCancelDeadline(nextDelivery, noticeDays);
  const beforeDeadline = from <= cancelDeadline;

  const deliveryLabel = nextDelivery.toLocaleDateString('en-CA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: CALGARY_TZ,
  });

  const deadlineLabel = cancelDeadline.toLocaleDateString('en-CA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: CALGARY_TZ,
  });

  const message = beforeDeadline
    ? `Your subscription will end after this billing cycle. No charge for delivery on ${deliveryLabel}.`
    : `You missed the ${noticeDays}-day notice window for ${deliveryLabel}. One more weekly charge will apply; your subscription ends after that delivery.`;

  return { beforeDeadline, nextDelivery, cancelDeadline, message };
}

export function defaultSelectionDeadline(deliveryDate: Date, noticeDays: number): Date {
  return getCancelDeadline(deliveryDate, noticeDays);
}

export function formatCalgaryDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-CA', {
    timeZone: CALGARY_TZ,
    ...options,
  });
}

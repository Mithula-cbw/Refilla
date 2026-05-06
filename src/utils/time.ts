import { formatDistanceToNow, differenceInSeconds, format } from 'date-fns';

/**
 * Format remaining cooldown time for display.
 * Returns "Resetting soon…" if < 5 min, "Xh Ym" or "Xm" otherwise.
 */
export function formatCooldown(cooldownUntil: string | null): string {
  if (!cooldownUntil) return '';
  const targetMs = new Date(cooldownUntil).getTime();
  const nowMs = Date.now();
  const secondsLeft = Math.floor((targetMs - nowMs) / 1000);

  if (secondsLeft <= 0) return 'Now';
  if (secondsLeft < 300) return 'Resetting soon...';

  const minutesLeft = Math.floor(secondsLeft / 60);
  const hoursLeft = Math.floor(minutesLeft / 60);
  const daysLeft = Math.floor(hoursLeft / 24);

  if (daysLeft >= 1) {
    const remainingHours = hoursLeft % 24;
    return remainingHours > 0 ? `${daysLeft}d ${remainingHours}h` : `${daysLeft}d`;
  }

  if (hoursLeft > 0) {
    const remainingMins = minutesLeft % 60;
    return remainingMins > 0 ? `${hoursLeft}h ${remainingMins}m` : `${hoursLeft}h`;
  }

  return `${minutesLeft}m`;
}

/**
 * Returns true if the cooldown has expired.
 */
export function isCooldownExpired(cooldownUntil: string | null): boolean {
  if (!cooldownUntil) return false;
  return new Date(cooldownUntil).getTime() <= Date.now();
}

/**
 * Format a datetime string for local display.
 */
export function formatDateTime(iso: string): string {
  return format(new Date(iso), 'MMM d, yyyy h:mm a');
}

/**
 * Relative time display (e.g. "3 hours ago").
 */
export function timeAgo(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

/**
 * Add hours to a date, return ISO string.
 */
export function addHours(date: Date, hours: number): string {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

/**
 * Default cooldown end time: now + intervalHours (or 24h fallback).
 */
export function defaultCooldownEnd(intervalHours: number | null): string {
  return addHours(new Date(), intervalHours ?? 24);
}

/**
 * Convert ISO datetime to local datetime-local input value.
 */
export function toDateTimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Convert datetime-local input value back to ISO.
 */
export function fromDateTimeLocal(val: string): string {
  return new Date(val).toISOString();
}

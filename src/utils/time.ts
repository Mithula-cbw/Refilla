import { formatDistanceToNow } from 'date-fns';

// ─── Countdown Formatting ──────────────────────────────────────────────────────

/**
 * Structured breakdown returned for internal use.
 */
export interface CooldownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

/**
 * Compute remaining time parts from a cooldown ISO string.
 */
export function getCooldownParts(cooldownUntil: string | null): CooldownParts {
  if (!cooldownUntil) return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  const totalSeconds = Math.max(0, Math.floor((new Date(cooldownUntil).getTime() - Date.now()) / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, totalSeconds };
}

/**
 * Format remaining cooldown time for display.
 *
 * Rules:
 *  - totalSeconds <= 0      → 'Now'
 *  - totalSeconds < 60      → 'Resets in Xs'          (live, tabular)
 *  - totalSeconds < 300     → 'Resetting soon...'      (< 5 min threshold)
 *  - hours < 1              → 'Xm'
 *  - days >= 1              → 'Xd Yh' or 'Xd'
 *  - otherwise              → 'Xh Ym' or 'Xh'
 */
export function formatCooldown(cooldownUntil: string | null): string {
  if (!cooldownUntil) return '';
  const { days, hours, minutes, seconds, totalSeconds } = getCooldownParts(cooldownUntil);

  if (totalSeconds <= 0) return 'Now';
  if (totalSeconds < 60) return `${totalSeconds}s`;
  if (totalSeconds < 300) return 'Resetting soon...';

  if (days >= 1) {
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

/**
 * How often the countdown should tick (ms), based on remaining time.
 * Sub-5-min → every second; otherwise every 30s.
 */
export function getTickInterval(cooldownUntil: string | null): number {
  if (!cooldownUntil) return 30_000;
  const { totalSeconds } = getCooldownParts(cooldownUntil);
  return totalSeconds < 300 ? 1_000 : 30_000;
}

/**
 * Format a reset-interval (in hours) as a human-readable string.
 * e.g. 24 → '1d', 48 → '2d', 25 → '1d 1h', 90 → '1d 18h', 6 → '6h'
 */
export function formatResetInterval(hours: number | null): string {
  if (!hours) return '';
  const d = Math.floor(hours / 24);
  const h = hours % 24;
  if (d >= 1 && h > 0) return `${d}d ${h}h reset interval`;
  if (d >= 1) return `${d}d reset interval`;
  return `${h}h reset interval`;
}

// ─── Status Helpers ────────────────────────────────────────────────────────────

/**
 * Returns true if the cooldown has expired.
 */
export function isCooldownExpired(cooldownUntil: string | null): boolean {
  if (!cooldownUntil) return false;
  return new Date(cooldownUntil).getTime() <= Date.now();
}

// ─── DateTime Helpers ──────────────────────────────────────────────────────────

/**
 * Format a datetime string for local display.
 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
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
  d.setTime(d.getTime() + hours * 3_600_000);
  return d.toISOString();
}

/**
 * Add days to a date, return ISO string.
 */
export function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setTime(d.getTime() + days * 86_400_000);
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

// ─── Cooldown End-Time Display ─────────────────────────────────────────────────

/**
 * Short label for the cooldown end time, shown beside the countdown.
 * Rules:
 *  - same calendar day  → "today, 9:30 PM"
 *  - next calendar day  → "tomorrow, 9:30 PM"
 *  - any other day      → "14 May, 9:30 PM"
 * Returns empty string if cooldownUntil is null/expired.
 */
export function cooldownEndLabel(cooldownUntil: string | null): string {
  if (!cooldownUntil) return '';
  const end = new Date(cooldownUntil);
  if (end.getTime() <= Date.now()) return '';

  const timeStr = end.toLocaleTimeString(undefined, {
    hour: 'numeric', minute: '2-digit',
  });

  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowMidnight = new Date(todayMidnight.getTime() + 86_400_000);
  const endMidnight = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  if (endMidnight.getTime() === todayMidnight.getTime()) {
    return `today, ${timeStr}`;
  }
  if (endMidnight.getTime() === tomorrowMidnight.getTime()) {
    return `tomorrow, ${timeStr}`;
  }

  const dateStr = end.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  return `${dateStr}, ${timeStr}`;
}

/**
 * Full tooltip text for the cooldown end time.
 * Format: "Thursday, 14 May 2026, 9:30 PM"
 * Returns empty string if cooldownUntil is null/expired.
 */
export function cooldownEndTooltip(cooldownUntil: string | null): string {
  if (!cooldownUntil) return '';
  const end = new Date(cooldownUntil);
  if (end.getTime() <= Date.now()) return '';
  return end.toLocaleString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

import { useState, useEffect, useRef } from 'react';
import { formatCooldown, isCooldownExpired, getCooldownParts, getTickInterval } from '@/utils/time';

export interface CountdownState {
  /** Formatted display string, e.g. "2h 15m", "Resetting soon...", "42s" */
  label: string;
  /**
   * TRUE only when the deadline crosses from future → past **during this
   * component's lifetime** (one-shot edge trigger, never true on initial mount).
   * This is intentional: startup expiry is handled by useStore; AccountCard
   * should only react to real-time transitions.
   */
  expired: boolean;
  /** True when < 300 seconds remain (useful for urgent styling) */
  isUrgent: boolean;
  /** Raw seconds remaining (≥ 0) */
  secondsLeft: number;
}

/** Initial state: expired is ALWAYS false, even if cooldownUntil is already past. */
function makeInitialState(cooldownUntil: string | null): CountdownState {
  if (!cooldownUntil) return { label: '', expired: false, isUrgent: false, secondsLeft: 0 };
  const { totalSeconds } = getCooldownParts(cooldownUntil);
  const alreadyExpired = isCooldownExpired(cooldownUntil);
  return {
    label: alreadyExpired ? 'Now' : formatCooldown(cooldownUntil),
    expired: false, // ← never true on mount; only set via live tick
    isUrgent: !alreadyExpired && totalSeconds > 0 && totalSeconds < 300,
    secondsLeft: Math.max(0, totalSeconds),
  };
}

/**
 * Live countdown hook with adaptive tick rate.
 *
 * Key guarantees:
 * - `expired` is NEVER true on initial mount (avoids firing side-effects on
 *   tab switches / remounts for already-expired accounts).
 * - `expired` becomes true exactly once, when the live tick crosses the
 *   deadline, then the interval stops.
 * - Tick rate: 1 s when < 5 min remaining; 30 s otherwise.
 * - Pauses automatically when the document is hidden (visibilitychange),
 *   resumes when it becomes visible again — zero CPU while hidden.
 */
export function useCountdown(cooldownUntil: string | null): CountdownState {
  const [state, setState] = useState<CountdownState>(() => makeInitialState(cooldownUntil));

  const cooldownRef    = useRef(cooldownUntil);
  const prevExpiredRef = useRef(false);       // edge-trigger: was it expired last tick?
  const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const isUrgentRef    = useRef(state.isUrgent);

  // Keep cooldown ref always current (no stale closure)
  useEffect(() => { cooldownRef.current = cooldownUntil; });

  useEffect(() => {
    prevExpiredRef.current = false; // reset edge tracker when target changes

    if (!cooldownUntil) {
      setState({ label: '', expired: false, isUrgent: false, secondsLeft: 0 });
      return;
    }

    const clear = () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const schedule = (ms: number) => {
      clear();
      intervalRef.current = setInterval(tick, ms);
    };

    const tick = () => {
      const cd = cooldownRef.current;
      const { totalSeconds } = getCooldownParts(cd);
      const isExpiredNow = isCooldownExpired(cd);
      const isUrgent = !isExpiredNow && totalSeconds > 0 && totalSeconds < 300;

      // One-shot edge: active → expired
      if (isExpiredNow && !prevExpiredRef.current) {
        prevExpiredRef.current = true;
        setState({ label: 'Now', expired: true, isUrgent: false, secondsLeft: 0 });
        clear(); // stop ticking
        return;
      }

      setState({
        label: isExpiredNow ? 'Now' : formatCooldown(cd),
        expired: false,
        isUrgent,
        secondsLeft: Math.max(0, totalSeconds),
      });

      // Dynamically upgrade/downgrade the tick interval
      if (isUrgent !== isUrgentRef.current) {
        isUrgentRef.current = isUrgent;
        schedule(isUrgent ? 1_000 : 30_000);
      }
    };

    // Seed urgent ref for initial interval
    const { totalSeconds: ts } = getCooldownParts(cooldownUntil);
    const initialUrgent = !isCooldownExpired(cooldownUntil) && ts > 0 && ts < 300;
    isUrgentRef.current = initialUrgent;

    tick();
    schedule(initialUrgent ? 1_000 : 30_000);

    // ── Visibility: pause when hidden, resume when visible ─────────────────
    const handleVisibility = () => {
      if (document.hidden) {
        // Window hidden → pause ticking (saves CPU/battery)
        clear();
      } else {
        // Window visible → immediately recalculate and restart
        const cd = cooldownRef.current;
        if (!cd) return;
        const { totalSeconds: secs } = getCooldownParts(cd);
        const urgent = !isCooldownExpired(cd) && secs > 0 && secs < 300;
        isUrgentRef.current = urgent;
        tick();
        schedule(urgent ? 1_000 : 30_000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clear();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cooldownUntil]);

  return state;
}

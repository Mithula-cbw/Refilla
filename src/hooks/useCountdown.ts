import { useState, useEffect, useRef } from 'react';
import { formatCooldown, isCooldownExpired } from '@/utils/time';

/**
 * Live countdown hook. Re-evaluates every 30s.
 * Returns formatted label and whether it just expired.
 */
export function useCountdown(cooldownUntil: string | null) {
  const [label, setLabel] = useState(() => formatCooldown(cooldownUntil));
  const [expired, setExpired] = useState(() => isCooldownExpired(cooldownUntil));
  const prevExpiredRef = useRef(false);

  useEffect(() => {
    if (!cooldownUntil) {
      setLabel('');
      setExpired(false);
      return;
    }

    const tick = () => {
      const nowExpired = isCooldownExpired(cooldownUntil);
      setLabel(formatCooldown(cooldownUntil));

      if (nowExpired && !prevExpiredRef.current) {
        setExpired(true);
        prevExpiredRef.current = true;
      }
    };

    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  return { label, expired };
}

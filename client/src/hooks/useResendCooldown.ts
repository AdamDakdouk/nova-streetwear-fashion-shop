import { useEffect, useRef, useState } from "react";

/** Tracks a countdown (e.g. "resend code in 47s") against a wall-clock end time,
 * so it stays accurate regardless of tab throttling. */
export function useResendCooldown() {
  const [remainingMs, setRemainingMs] = useState(0);
  const endAtRef = useRef<number | null>(null);
  const isActive = remainingMs > 0;

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      const end = endAtRef.current;
      setRemainingMs(end ? Math.max(0, end - Date.now()) : 0);
    }, 250);
    return () => clearInterval(interval);
  }, [isActive]);

  function start(ms: number) {
    endAtRef.current = Date.now() + ms;
    setRemainingMs(ms);
  }

  return { remainingMs, remainingSeconds: Math.ceil(remainingMs / 1000), isActive, start };
}

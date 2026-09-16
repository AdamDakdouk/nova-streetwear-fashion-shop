import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const STORAGE_PREFIX = "nova:scroll:";

function readSavedScroll(key: string): number | null {
  try {
    const value = sessionStorage.getItem(STORAGE_PREFIX + key);
    if (value === null) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    // Private mode / blocked storage — fall back to starting at the top.
    return null;
  }
}

function saveScroll(key: string, value: number): void {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, String(Math.round(value)));
  } catch {
    /* scroll position is a convenience, not state we must guarantee */
  }
}

/**
 * Re-apply scroll position across a few frames. 
 * Prevents the browser from clamping scroll depth while images and fetched data
 * are still expanding the page height.
 */
function restoreScroll(target: number): () => void {
  let frame = 0;
  let cancelled = false;

  const apply = (attempt: number) => {
    if (cancelled) return;
    window.scrollTo({ top: target });
    if (attempt < 10 && Math.abs(window.scrollY - target) > 1) {
      frame = requestAnimationFrame(() => apply(attempt + 1));
    }
  };

  apply(0);
  return () => {
    cancelled = true;
    cancelAnimationFrame(frame);
  };
}

/**
 * Handles scroll restoration across route changes. 
 * 
 * Resets scroll to top on new navigations, but restores previous position on back/forward.
 */
export function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();

  const lastPathname = useRef(location.pathname);
  const currentKey = useRef(location.key);

  useEffect(() => {
    const snapshot = () => saveScroll(currentKey.current, window.scrollY);

    // Capture phase, so it runs before any handler that triggers navigation.
    document.addEventListener("click", snapshot, true);
    // Browser back/forward: fires while the outgoing page is still on screen.
    window.addEventListener("popstate", snapshot);
    window.addEventListener("pagehide", snapshot);

    return () => {
      document.removeEventListener("click", snapshot, true);
      window.removeEventListener("popstate", snapshot);
      window.removeEventListener("pagehide", snapshot);
    };
  }, []);

  useLayoutEffect(() => {
// Skip scroll resets when only query params change (like filtering or searching).
// Pages like `ProductListPage` handle their own scrolling for those changes, so resetting here would override them.
    if (lastPathname.current === location.pathname) {
      currentKey.current = location.key;
      return;
    }

    lastPathname.current = location.pathname;
    currentKey.current = location.key;

    if (navigationType === "POP") {
      const saved = readSavedScroll(location.key);
      if (saved !== null) return restoreScroll(saved);
    }

    window.scrollTo({ top: 0 });
  }, [location.pathname, location.key, navigationType]);

  return null;
}

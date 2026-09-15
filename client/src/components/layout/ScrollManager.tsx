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
 * The page usually isn't at its final height the instant it renders — images
 * and fetched data can still be settling, and the browser clamps any scroll
 * past the current bottom. Re-applying over a few frames lets a deep position
 * stick once the content that justifies it exists.
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
 * React Router leaves scroll position alone across navigations, so a new page
 * inherits the previous one's offset — opening a product from halfway down the
 * grid landed the shopper at the product's reviews.
 *
 * New navigations start at the top; back and forward return to where that entry
 * was left.
 *
 * The position is snapshotted on the interactions that *precede* a navigation
 * (a click, a popstate) rather than when this component notices the new
 * location. By that later point the browser has already clamped `window.scrollY`
 * to the incoming page's height, so reading it there records the clamped number
 * instead of where the shopper actually was.
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
    // Same page, different query — a category filter or a search. Those pages
    // position themselves (ProductListPage scrolls to its section title), and
    // this effect runs after theirs, so acting here would undo their work.
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

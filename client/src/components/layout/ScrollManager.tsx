import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * React Router does not touch scroll position on navigation, so moving to a new
 * page keeps whatever offset the previous one had — click a product from
 * halfway down the grid and you land halfway down the product page, at the
 * reviews, or wherever that offset happens to clamp to.
 *
 * Every navigation to a different page therefore starts at the top. Back and
 * forward do too: restoring the previous offset means capturing it before the
 * browser clamps it to the incoming page's height, which happens before this
 * component ever sees the new location, and the workarounds for that (hooking
 * link clicks to snapshot the position first) buy a nicety at the cost of a
 * fragile listener. Predictable beats clever here.
 */
export function ScrollManager() {
  const location = useLocation();
  const lastPathname = useRef(location.pathname);

  useLayoutEffect(() => {
    // Same page, different query — a category filter or a search. Those pages
    // position themselves (ProductListPage scrolls to its section title), and
    // this effect runs after theirs, so acting here would undo their work.
    if (lastPathname.current === location.pathname) return;

    lastPathname.current = location.pathname;
    window.scrollTo({ top: 0 });
  }, [location.pathname, location.key]);

  return null;
}

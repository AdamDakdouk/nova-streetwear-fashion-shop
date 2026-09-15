import type { IncomingMessage, ServerResponse } from "http";
import { app } from "../server/src/app";
import { connectDB } from "../server/src/config/db";

/**
 * Express augments the bare Node request/response objects itself at runtime;
 * this alias is only here to describe what it accepts as a plain handler,
 * without pulling in a platform-specific request type.
 */
type NodeHandler = (req: IncomingMessage, res: ServerResponse) => void;

/**
 * Query parameter the `vercel.json` rewrite uses to carry the original path.
 * See `restoreRequestPath` for why.
 */
const PATH_PARAM = "__apiPath";

/**
 * Puts the originally requested path back on the request.
 *
 * Every `/api/*` URL is rewritten to this single function, and the rewrite
 * passes the matched path along as a query parameter. Reconstructing the URL
 * from it means Express always routes against the path the caller actually
 * asked for, no matter what the platform does to `req.url` on the way in.
 *
 * A catch-all filename (`api/[...path].ts`) is the tidier way to express this,
 * but it was silently registered as a *single* dynamic segment: `/api/products`
 * reached Express while `/api/products/:id` and `/api/site-content/hero` were
 * rejected at the edge with NOT_FOUND before the function ever ran. Carrying
 * the path explicitly doesn't depend on how a filename gets interpreted.
 */
function restoreRequestPath(req: IncomingMessage): void {
  // Base is irrelevant — only the path and query are used.
  const url = new URL(req.url ?? "/", "http://localhost");
  const originalPath = url.searchParams.get(PATH_PARAM);
  if (originalPath === null) return;

  url.searchParams.delete(PATH_PARAM);
  const query = url.searchParams.toString();
  req.url = `/api/${originalPath}${query ? `?${query}` : ""}`;
}

/**
 * Vercel entry point for the API.
 *
 * The Express app is unchanged and still mounts everything under `/api`, so
 * this only has to ensure a database connection exists before handing the
 * request over. `connectDB` memoises its connection, so a warm instance reuses
 * the existing pool and only a cold start pays for the handshake.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  restoreRequestPath(req);
  await connectDB();
  (app as unknown as NodeHandler)(req, res);
}

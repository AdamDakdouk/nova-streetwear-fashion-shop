import type { IncomingMessage, ServerResponse } from "http";
import { app } from "../server/src/app";
import { connectDB } from "../server/src/config/db";

/**
 * Simple signature for an Express handler. Express patch-grafts its own methods 
 * onto Node's req/res at runtime, so standard HTTP types are fine here.
 */
type NodeHandler = (req: IncomingMessage, res: ServerResponse) => void;

/**
 * Query parameter the `vercel.json` rewrite uses to carry the original path.
 */
const PATH_PARAM = "__apiPath";

/**
 * Puts the original URL back onto `req.url` before Express sees it.
 * 
 * Vercel passes the intended path as a query param. We do this manually because
 * Vercel's catch-all route (`[...path].ts`) fails on multi-segment paths like `/api/a/b`.
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
 * Entry point for Vercel serverless functions.
 * 
 * We just need to make sure the database is connected before Express handles 
 * the request. `connectDB` caches the connection so warm instances skip the overhead.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  restoreRequestPath(req);
  await connectDB();
  (app as unknown as NodeHandler)(req, res);
}

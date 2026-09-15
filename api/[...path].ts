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
 * Vercel entry point for the API.
 *
 * The Express app is unchanged and still mounts everything under `/api`, so
 * this only has to ensure a database connection exists before handing the
 * request over. `connectDB` memoises its connection, so a warm instance reuses
 * the existing pool and only a cold start pays for the handshake.
 *
 * The filename is a catch-all (`[...path]`) so one function serves every route
 * — `/api/products`, `/api/auth/login`, and so on — rather than needing a file
 * per endpoint. Express does the routing, exactly as it does when the server
 * runs locally through `server/src/index.ts`.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await connectDB();
  (app as unknown as NodeHandler)(req, res);
}

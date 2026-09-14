import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyToken } from "../utils/jwt";
import { User } from "../models/User";
import { asyncHandler } from "./asyncHandler";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    next(new ApiError(401, "Authentication required"));
    return;
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
}

/** Must run after `requireAuth`. Looks the role up fresh on every request rather
 * than trusting a claim baked into the JWT, so a demoted admin loses access
 * immediately rather than whenever their token happens to expire. */
export const requireAdmin = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const user = await User.findById(req.userId).select("role");
  if (!user || user.role !== "admin") {
    throw new ApiError(403, "Admin access required");
  }
  next();
});

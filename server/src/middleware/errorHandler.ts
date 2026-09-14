import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ message: err.message, details: err.details });
    return;
  }

  // Malformed ids (e.g. "/api/products/not-an-id") reach here as CastErrors —
  // treat them as a 400 rather than leaking a 500 for a client-supplied bad id.
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ message: `Invalid ${err.path}` });
    return;
  }

  if (err instanceof mongoose.mongo.MongoServerError && err.code === 11000) {
    res.status(409).json({ message: "A record with these details already exists" });
    return;
  }

  console.error(err);
  res.status(500).json({ message: "Internal server error" });
}

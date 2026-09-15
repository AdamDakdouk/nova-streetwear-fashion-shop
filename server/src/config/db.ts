import mongoose from "mongoose";
import { env } from "./env";

/** Strips credentials before the URI ever touches a log line — this same string
 * would otherwise land in a real deployment's log aggregator, not just a local
 * terminal. */
export function redactConnectionString(uri: string): string {
  // Greedy match walks to the *last* "@" in the string before backtracking, so
  // even a password containing a raw (invalid, unescaped) "@" gets fully
  // swallowed rather than leaking its tail past the first "@" match would hit.
  return uri.replace(/\/\/.+@/, "//<redacted>@");
}

export async function connectDB(): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongodbUri);
  // eslint-disable-next-line no-console
  console.log(`[db] connected -> ${redactConnectionString(env.mongodbUri)}`);
}

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

/**
 * Cached across invocations.
 *
 * A long-running server connects once at boot, but on a serverless host every
 * request can land on a warm instance that already has a connection, or on a
 * cold one that needs a new handshake. Connecting per request would open a
 * fresh pool each time and exhaust the cluster's connection limit under any
 * real traffic, so the promise is memoised and reused. It hangs off
 * `globalThis` rather than a module variable so a module reload (dev watch
 * mode, or a bundler re-evaluating the module) doesn't quietly start a second
 * connection alongside the first.
 */
const globalWithMongoose = globalThis as typeof globalThis & {
  __novaMongooseConnection?: Promise<typeof mongoose>;
};

export async function connectDB(): Promise<void> {
  if (!globalWithMongoose.__novaMongooseConnection) {
    mongoose.set("strictQuery", true);

    globalWithMongoose.__novaMongooseConnection = mongoose
      .connect(env.mongodbUri, {
        // Fail fast rather than hanging for the default 30s: on a serverless
        // host a stuck connect burns the whole function timeout and returns
        // nothing useful.
        serverSelectionTimeoutMS: 10_000,
      })
      .then((connection) => {
        // eslint-disable-next-line no-console
        console.log(`[db] connected -> ${redactConnectionString(env.mongodbUri)}`);
        return connection;
      })
      .catch((err) => {
        // Clear the cache so the next invocation retries instead of reusing a
        // permanently rejected promise.
        globalWithMongoose.__novaMongooseConnection = undefined;
        throw err;
      });
  }

  await globalWithMongoose.__novaMongooseConnection;
}

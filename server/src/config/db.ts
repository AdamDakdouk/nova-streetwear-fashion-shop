import mongoose from "mongoose";
import { env } from "./env";

// Redacts credentials from DB connection strings before logging 
// to prevent leaking secrets in log aggregators.
export function redactConnectionString(uri: string): string {
// Greedy match splits at the last `@` so passwords containing raw `@` characters are fully redacted
// rather than partially leaked.
  return uri.replace(/\/\/.+@/, "//<redacted>@");
}

/**
 * Cached DB connection pool promise attached to `globalThis`.
 * 
 * Reuses active connections on warm serverless instances to avoid pool exhaustion,
 * and survives module reloads in dev watch mode.
 */
const globalWithMongoose = globalThis as typeof globalThis & {
  __novaMongooseConnection?: Promise<typeof mongoose>;
};

export async function connectDB(): Promise<void> {
  if (!globalWithMongoose.__novaMongooseConnection) {
    mongoose.set("strictQuery", true);

    globalWithMongoose.__novaMongooseConnection = mongoose
      .connect(env.mongodbUri, {
// Lower connection timeout to fail fast on serverless cold starts rather than consuming function runtime.
        serverSelectionTimeoutMS: 10_000,
      })
      .then((connection) => {
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

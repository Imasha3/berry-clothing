import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables.");
}

const MONGODB_URI_REQUIRED: string = MONGODB_URI;

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  var __mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

let cached = globalThis.__mongooseCache as { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;

if (!cached) {
  cached = { conn: null, promise: null };
  globalThis.__mongooseCache = cached;
}

export async function connectToMongo() {
  const currentCache = cached ?? { conn: null, promise: null };
  if (!cached) {
    cached = currentCache;
    globalThis.__mongooseCache = currentCache;
  }

  if (currentCache.conn) {
    return currentCache.conn;
  }

  if (!currentCache.promise) {
    currentCache.promise = mongoose.connect(MONGODB_URI_REQUIRED).then((mongooseInstance) => mongooseInstance);
  }

  currentCache.conn = await currentCache.promise;
  return currentCache.conn;
}

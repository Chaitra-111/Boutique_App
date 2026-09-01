import mongoose from "mongoose";

function formatMongoUri(rawUri: string): string {
  if (!rawUri.includes("@")) return rawUri;
  try {
    const protocolEnd = rawUri.indexOf("://");
    if (protocolEnd === -1) return rawUri;
    const scheme = rawUri.slice(0, protocolEnd + 3);
    const rest = rawUri.slice(protocolEnd + 3);
    const atIndex = rest.lastIndexOf("@");
    if (atIndex === -1) return rawUri;

    const userPass = rest.slice(0, atIndex);
    const hostAndDb = rest.slice(atIndex + 1);

    const colonIndex = userPass.indexOf(":");
    if (colonIndex === -1) return rawUri;

    const username = decodeURIComponent(userPass.slice(0, colonIndex));
    const password = decodeURIComponent(userPass.slice(colonIndex + 1));

    return `${scheme}${encodeURIComponent(username)}:${encodeURIComponent(password)}@${hostAndDb}`;
  } catch (e) {
    return rawUri;
  }
}

const RAW_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/aruna_creations";
const MONGODB_URI = formatMongoUri(RAW_URI);

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached!.conn && mongoose.connection.readyState === 1) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      maxPoolSize: 10,
    };

    cached!.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance: typeof mongoose) => {
        return mongooseInstance;
      })
      .catch((err: Error) => {
        console.warn("MongoDB Atlas connection warning:", err.message);
        cached!.promise = null;
        throw err;
      });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

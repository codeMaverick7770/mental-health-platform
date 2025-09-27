import { MongoClient } from 'mongodb';

// Prefer explicit MONGODB_URL, otherwise fall back to backend's MONGO_URI, otherwise local Mongo
// Prefer cluster URI (MONGO_URI) over any local override (MONGODB_URL)
const url = process.env.MONGO_URI || process.env.MONGODB_URL || 'mongodb://localhost:27017';
// Ensure we reuse same database name as backend cluster
const dbName = process.env.MONGO_DB_NAME || 'mental_health';

let db;

export async function connectToDb() {
  // Helpful debug log once
  if (!db) {
    console.log('[VoiceAssistant] Connecting to MongoDB =>', url.split('@').pop());
  }
  if (db) return db;
  // Driver 4.x no longer needs useNewUrlParser/useUnifiedTopology
const client = new MongoClient(url);
  await client.connect();
  db = client.db(dbName);
  return db;
}

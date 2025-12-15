import Database from 'better-sqlite3';
import path from 'path';
import { existsSync } from 'fs';

let dbInstance: InstanceType<typeof Database> | null = null;

function getDb(): InstanceType<typeof Database> {
  if (!dbInstance) {
    const dbPath = path.join(process.cwd(), 'tailwindsql.db');
    // Only try to connect if database exists (skip during build if not present)
    if (existsSync(dbPath) || process.env.NEXT_RUNTIME) {
      dbInstance = new Database(dbPath);
      // Enable WAL mode for better performance
      dbInstance.pragma('journal_mode = WAL');
    } else {
      // During build, create a temporary in-memory database
      dbInstance = new Database(':memory:');
    }
  }
  return dbInstance;
}

export default getDb();


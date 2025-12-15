import Database from 'better-sqlite3';
import path from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';

let dbInstance: InstanceType<typeof Database> | null = null;

function getDb(): InstanceType<typeof Database> {
  if (!dbInstance) {
    // On Vercel, the filesystem is read-only except /tmp
    // We need to check if we're on Vercel and copy the DB to /tmp if needed
    const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
    const originalDbPath = path.join(process.cwd(), 'tailwindsql.db');
    
    let dbPath: string;
    
    if (isVercel) {
      // On Vercel, use /tmp for writable database
      dbPath = '/tmp/tailwindsql.db';
      
      // Copy from project root to /tmp if it exists and /tmp version doesn't
      if (existsSync(originalDbPath) && !existsSync(dbPath)) {
        try {
          console.log('Copying database from', originalDbPath, 'to', dbPath);
          // Read the entire file and write to /tmp
          const dbBuffer = readFileSync(originalDbPath);
          writeFileSync(dbPath, dbBuffer);
          // Also copy WAL and SHM files if they exist
          const walPath = originalDbPath + '-wal';
          const shmPath = originalDbPath + '-shm';
          if (existsSync(walPath)) {
            writeFileSync('/tmp/tailwindsql.db-wal', readFileSync(walPath));
          }
          if (existsSync(shmPath)) {
            writeFileSync('/tmp/tailwindsql.db-shm', readFileSync(shmPath));
          }
          console.log('Database copied to /tmp successfully');
        } catch (error) {
          console.error('Failed to copy database to /tmp:', error);
          // Fall through to try creating a new one
        }
      }
      
      // If database doesn't exist in /tmp, try to create it from original
      // or create an empty one (should not happen if build works correctly)
      if (!existsSync(dbPath)) {
        if (existsSync(originalDbPath)) {
          // Try one more time to copy
          try {
            const dbBuffer = readFileSync(originalDbPath);
            writeFileSync(dbPath, dbBuffer);
            console.log('Database copied to /tmp on second attempt');
          } catch (error) {
            console.error('Failed to copy database on second attempt:', error);
            // Create empty database as fallback
            console.warn('Creating empty database in /tmp');
            dbInstance = new Database(dbPath);
            dbInstance.pragma('journal_mode = WAL');
            return dbInstance;
          }
        } else {
          console.warn('Database not found in project root, creating empty database in /tmp');
          dbInstance = new Database(dbPath);
          dbInstance.pragma('journal_mode = WAL');
          return dbInstance;
        }
      }
    } else {
      // Local development - use project root
      dbPath = originalDbPath;
    }
    
    // Connect to existing database
    if (existsSync(dbPath)) {
      try {
        dbInstance = new Database(dbPath);
        // Enable WAL mode for better performance (only if writable)
        try {
          dbInstance.pragma('journal_mode = WAL');
        } catch (error) {
          // If WAL mode fails (read-only), that's okay - use default mode
          console.warn('Could not enable WAL mode (read-only filesystem?):', error);
        }
      } catch (error) {
        console.error('Failed to open database:', error);
        // Fallback to in-memory database
        console.warn('Falling back to in-memory database');
        dbInstance = new Database(':memory:');
      }
    } else {
      // During build or if database doesn't exist, create a temporary in-memory database
      console.warn('Database file not found at', dbPath, ', using in-memory database');
      dbInstance = new Database(':memory:');
    }
  }
  return dbInstance;
}

export default getDb();


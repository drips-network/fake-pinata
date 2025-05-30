import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(__dirname, '..', 'data'); // Puts 'data' directory in project root
const dbPath = path.join(dataDir, 'pinata.db');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath, { verbose: console.log });

// Create pins table if it doesn't exist
const createTableStmt = db.prepare(`
  CREATE TABLE IF NOT EXISTS pins (
    cid TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    pin_size INTEGER NOT NULL
  );
`);
createTableStmt.run();

export default db;

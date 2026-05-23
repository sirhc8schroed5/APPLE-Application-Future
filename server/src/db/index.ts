import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'hermschrod_clinical.db');

export function getDatabase(): Database.Database {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const db = new Database(DB_PATH, { verbose: process.env.NODE_ENV === 'development' ? console.log : undefined });
  
  // Enable Write-Ahead Logging for concurrency and performance
  db.pragma('journal_mode = WAL');
  // Enforce foreign key constraints
  db.pragma('foreign_keys = ON');
  
  return db;
}

export const db = getDatabase();

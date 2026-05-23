// server/ingest.js – Heavy-Duty Data Ingestion for Predictive Analytics
// This script parses massive datasets like "DATABASE 7.19.xlsx" and "MEDTRONIC DATABASE.xlsx"
// and loads them into a local, highly-optimized SQLite database (better-sqlite3).
// This is the backbone for the "ferocious beast" predictive analytics engine.

import fs from 'fs';
import path from 'path';
import * as xlsx from 'xlsx';
import Database from 'better-sqlite3';

const DB_PATH = path.join(process.cwd(), 'neuropsych_analytics.db');
const DATA_DIR = path.join(process.cwd(), '..'); // Points to the workspace root

// Initialize SQLite Database
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL'); // High-performance write-ahead logging

function initializeDatabase() {
  console.log('🧠 Initializing Predictive Analytics Database...');
  
  // Create tables for massive datasets
  db.exec(`
    CREATE TABLE IF NOT EXISTS clinical_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dataset_source TEXT,
      patient_id TEXT,
      assessment_date TEXT,
      domain TEXT,
      score REAL,
      raw_data JSON
    );
    
    CREATE INDEX IF NOT EXISTS idx_domain ON clinical_records(domain);
    CREATE INDEX IF NOT EXISTS idx_source ON clinical_records(dataset_source);
  `);
}

function ingestExcel(filename, sourceName) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ File not found, skipping ingestion: ${filename}`);
    return;
  }

  console.log(`\n📥 Loading massive dataset: ${filename}`);
  console.time(`Ingested ${filename}`);
  
  // Read Excel file
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON array
  const data = xlsx.utils.sheet_to_json(worksheet);
  console.log(`📊 Parsed ${data.length} records. Preparing for bulk insert...`);

  // Prepare high-performance bulk insert statement
  const insertStmt = db.prepare(`
    INSERT INTO clinical_records (dataset_source, raw_data) 
    VALUES (@source, @raw_data)
  `);

  // Execute in a single transaction for maximum speed
  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      insertStmt.run({ 
        source: sourceName, 
        raw_data: JSON.stringify(row) 
      });
    }
  });

  insertMany(data);
  console.timeEnd(`Ingested ${filename}`);
}

// Run the ingestion pipeline
try {
  initializeDatabase();
  
  // Ingest the large databases you provided
  ingestExcel('DATABASE 7.19.xlsx', 'MAIN_DATABASE_7_19');
  ingestExcel('MEDTRONIC  DATABASE.xlsx', 'MEDTRONIC_IMPLANT_DATA');
  
  console.log('\n✅ Data ingestion complete. The App Store beast is now fueled with data.');
} catch (error) {
  console.error('❌ Ingestion failed:', error);
} finally {
  db.close();
}

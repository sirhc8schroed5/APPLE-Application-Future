import { db } from './index.js';

export function runMigrations() {
  console.log('🔄 Checking database migrations...');

  // Create migrations table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const appliedMigrations = db.prepare('SELECT name FROM _migrations').all() as { name: string }[];
  const appliedSet = new Set(appliedMigrations.map((m) => m.name));

  const migrations = [
    {
      name: '001_initial_schema',
      up: () => {
        db.exec(`
          -- Patients
          CREATE TABLE IF NOT EXISTS patients (
            id TEXT PRIMARY KEY, -- UUID
            initials TEXT NOT NULL,
            birth_date TEXT, -- YYYY-MM-DD
            sex TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );

          -- Cases
          CREATE TABLE IF NOT EXISTS cases (
            id TEXT PRIMARY KEY, -- UUID
            patient_id TEXT NOT NULL,
            referral_domain TEXT,
            status TEXT DEFAULT 'open',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
          );

          -- Imported Datasets (Tracking Excel/CSV imports)
          CREATE TABLE IF NOT EXISTS imported_datasets (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            import_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            row_count INTEGER NOT NULL,
            status TEXT NOT NULL
          );

          -- Test Scores
          CREATE TABLE IF NOT EXISTS test_scores (
            id TEXT PRIMARY KEY,
            case_id TEXT NOT NULL,
            dataset_id TEXT, -- Null if entered manually
            test_acronym TEXT NOT NULL,
            domain TEXT NOT NULL,
            raw_score REAL,
            standard_score REAL,
            percentile REAL,
            metadata JSON,
            FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
            FOREIGN KEY (dataset_id) REFERENCES imported_datasets(id) ON DELETE SET NULL
          );

          -- Clinical Notes
          CREATE TABLE IF NOT EXISTS clinical_notes (
            id TEXT PRIMARY KEY,
            case_id TEXT NOT NULL,
            note_type TEXT NOT NULL, -- e.g., 'intake', 'observation', 'summary'
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
          );

          -- Documents & RAG
          CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            filename TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS document_chunks (
            id TEXT PRIMARY KEY,
            document_id TEXT NOT NULL,
            content TEXT NOT NULL,
            page_ref TEXT,
            chunk_index INTEGER NOT NULL,
            FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
          );

          CREATE TABLE IF NOT EXISTS embedding_metadata (
            chunk_id TEXT PRIMARY KEY,
            model_version TEXT NOT NULL,
            chunk_hash TEXT NOT NULL,
            -- Actual vector data handled via FAISS or sqlite-vss/vector extension separately
            FOREIGN KEY (chunk_id) REFERENCES document_chunks(id) ON DELETE CASCADE
          );

          -- Inferences (Probabilistic output from the engine)
          CREATE TABLE IF NOT EXISTS inferences (
            id TEXT PRIMARY KEY,
            case_id TEXT NOT NULL,
            engine_version TEXT NOT NULL,
            hypothesis TEXT NOT NULL,
            hypothesis_type TEXT NOT NULL,
            confidence REAL NOT NULL,
            uncertainty TEXT NOT NULL, -- 'low', 'moderate', 'high'
            evidence JSON NOT NULL, -- Array of evidence items
            contraindications JSON NOT NULL, -- Array of strings
            missing_data JSON NOT NULL, -- Array of strings
            clinical_use_warning TEXT NOT NULL,
            diagnostic_claim BOOLEAN DEFAULT FALSE,
            clinician_status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'edited'
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
          );

          -- Report Sections
          CREATE TABLE IF NOT EXISTS report_sections (
            id TEXT PRIMARY KEY,
            case_id TEXT NOT NULL,
            title TEXT NOT NULL,
            draft_text TEXT NOT NULL,
            evidence_ids JSON, -- Array of strings mapping to inferences or chunks
            risk_flags JSON, -- Array of risk objects
            clinician_status TEXT DEFAULT 'draft',
            FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
          );

          -- Audit Events (The Cryptographic Ledger)
          CREATE TABLE IF NOT EXISTS audit_events (
            id TEXT PRIMARY KEY, -- UUID
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            actor_type TEXT NOT NULL, -- 'user', 'system', 'model'
            actor_id TEXT NOT NULL,
            case_id TEXT, -- Optional, for case-specific events
            event_type TEXT NOT NULL,
            payload_hash TEXT NOT NULL,
            previous_hash TEXT NOT NULL,
            event_hash TEXT NOT NULL,
            metadata JSON,
            FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL
          );
        `);
      }
    }
  ];

  db.transaction(() => {
    for (const migration of migrations) {
      if (!appliedSet.has(migration.name)) {
        console.log(`Applying migration: ${migration.name}`);
        migration.up();
        db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(migration.name);
      }
    }
  })();

  console.log('✅ Database migrations complete.');
}

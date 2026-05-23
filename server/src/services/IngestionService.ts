import * as xlsx from 'xlsx';
import { z } from 'zod';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { AuditLedger } from './AuditLedger.js';

// Define the expected schema for a clinical record row
export const ClinicalRecordRowSchema = z.object({
  TestAcronym: z.string().min(1),
  Domain: z.string().min(1),
  RawScore: z.number().optional(),
  StandardScore: z.number().optional(),
  Percentile: z.number().optional(),
  // Capture any other metadata from the row dynamically
}).catchall(z.any());

export class IngestionService {
  /**
   * Ingests an Excel or CSV file, validates rows, and securely stores them.
   */
  static ingestFile(filePath: string, filename: string): { success: boolean, rowsImported: number, errors: any[] } {
    console.log(`📥 Starting ingestion for file: ${filename}`);
    
    // Create an entry in imported_datasets
    const datasetId = crypto.randomUUID();
    const errors: any[] = [];
    let rowsImported = 0;

    try {
      const workbook = xlsx.readFile(filePath);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawData = xlsx.utils.sheet_to_json(worksheet);

      db.transaction(() => {
        // Initial dataset tracking record
        db.prepare(`
          INSERT INTO imported_datasets (id, filename, row_count, status)
          VALUES (?, ?, ?, ?)
        `).run(datasetId, filename, rawData.length, 'processing');

        // Prepare the insert statement for test scores
        const insertStmt = db.prepare(`
          INSERT INTO test_scores (
            id, case_id, dataset_id, test_acronym, domain, raw_score, standard_score, percentile, metadata
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const [index, row] of rawData.entries()) {
          const parsed = ClinicalRecordRowSchema.safeParse(row);
          if (!parsed.success) {
            errors.push({ row: index + 2, errors: parsed.error.issues });
            continue;
          }

          const validRow = parsed.data;
          // For bulk ingestion, we might link to an 'anonymous' or 'aggregate' case ID,
          // or create a generic case. For now, we'll create a system case if this is norm data.
          // In a real scenario, the file would specify the case.
          const tempCaseId = crypto.randomUUID(); // Placeholder for testing
          
          // Assuming case exists or creating a dummy case for the sake of the schema FK
          db.prepare('INSERT OR IGNORE INTO patients (id, initials) VALUES (?, ?)').run('system-patient', 'SYS');
          db.prepare('INSERT OR IGNORE INTO cases (id, patient_id) VALUES (?, ?)').run(tempCaseId, 'system-patient');

          const metadata = { ...validRow };
          delete metadata.TestAcronym;
          delete metadata.Domain;
          delete metadata.RawScore;
          delete metadata.StandardScore;
          delete metadata.Percentile;

          insertStmt.run(
            crypto.randomUUID(),
            tempCaseId,
            datasetId,
            validRow.TestAcronym,
            validRow.Domain,
            validRow.RawScore || null,
            validRow.StandardScore || null,
            validRow.Percentile || null,
            JSON.stringify(metadata)
          );

          rowsImported++;
        }

        // Update dataset status
        db.prepare('UPDATE imported_datasets SET status = ?, row_count = ? WHERE id = ?')
          .run(errors.length > 0 ? 'completed_with_errors' : 'completed', rowsImported, datasetId);

        // Audit the import event
        AuditLedger.logEvent({
          actorType: 'system',
          actorId: 'ingestion-service',
          eventType: 'data_imported',
          payload: {
            filename,
            totalRows: rawData.length,
            importedRows: rowsImported,
            errorCount: errors.length
          },
          metadata: {
            appVersion: '1.0.0', // Read from package.json in prod
            localOnly: true
          }
        });
      })();

      console.log(`✅ Ingestion complete: ${rowsImported} imported, ${errors.length} errors.`);
      return { success: true, rowsImported, errors };

    } catch (e: any) {
      console.error(`🚨 Ingestion failed: ${e.message}`);
      // Mark dataset as failed if it was created
      try {
         db.prepare('UPDATE imported_datasets SET status = ? WHERE id = ?').run('failed', datasetId);
      } catch (inner) {}
      
      return { success: false, rowsImported: 0, errors: [{ message: e.message }] };
    }
  }
}

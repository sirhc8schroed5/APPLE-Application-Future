import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { z } from 'zod';
import crypto from 'crypto';
import { runMigrations } from './db/migrations.js';
import { db } from './db/index.js';
import { AuditLedger } from './services/AuditLedger.js';
import { IngestionService } from './services/IngestionService.js';

// --- INITIALIZATION ---
console.log('🚀 Booting HermSchrod Box API...');
runMigrations();

// Verify ledger integrity on boot
const isLedgerIntact = AuditLedger.verifyChain();
if (!isLedgerIntact) {
  console.error('🛑 FATAL: Audit Ledger integrity check failed. System halting to prevent corrupted clinical operations.');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// --- SCHEMAS ---
const ImportDatasetSchema = z.object({
  filePath: z.string(),
  filename: z.string()
});

const CreateCaseSchema = z.object({
  patientInitials: z.string().min(1),
  referralDomain: z.string().min(1)
});

const CreateNoteSchema = z.object({
  noteType: z.enum(['intake', 'observation', 'summary']),
  content: z.string().min(1)
});

// --- API ENDPOINTS ---

/**
 * POST /api/import/dataset
 * Ingests a clinical dataset from an Excel/CSV file.
 */
app.post('/api/import/dataset', (req: Request, res: Response) => {
  const parsed = ImportDatasetSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.issues });
  }

  const result = IngestionService.ingestFile(parsed.data.filePath, parsed.data.filename);
  if (!result.success) {
    return res.status(500).json({ error: 'Ingestion failed', details: result.errors });
  }

  res.json({ message: 'Dataset imported securely', ...result });
});

/**
 * POST /api/cases
 * Creates a new clinical case and patient record, logging it to the audit ledger.
 */
app.post('/api/cases', (req: Request, res: Response) => {
  const parsed = CreateCaseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.issues });
  }

  const { patientInitials, referralDomain } = parsed.data;
  const patientId = crypto.randomUUID();
  const caseId = crypto.randomUUID();

  try {
    db.transaction(() => {
      db.prepare('INSERT INTO patients (id, initials) VALUES (?, ?)').run(patientId, patientInitials);
      db.prepare('INSERT INTO cases (id, patient_id, referral_domain) VALUES (?, ?, ?)').run(caseId, patientId, referralDomain);

      AuditLedger.logEvent({
        actorType: 'user',
        actorId: 'clinician_1', // In prod, extract from auth token
        caseId,
        eventType: 'case_created',
        payload: { patientId, referralDomain },
        metadata: { appVersion: '0.4.0-future-forward', localOnly: true }
      });
    })();

    res.json({ message: 'Case created', caseId, patientId });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create case', details: error.message });
  }
});

/**
 * GET /api/cases
 * Retrieves a list of all open cases.
 */
app.get('/api/cases', (req: Request, res: Response) => {
  const cases = db.prepare('SELECT * FROM cases WHERE status = ? ORDER BY created_at DESC').all('open');
  res.json({ cases });
});

/**
 * POST /api/cases/:id/notes
 * Adds a clinical note to a case and audits the action.
 */
app.post('/api/cases/:id/notes', (req: Request, res: Response) => {
  const caseId = req.params.id;
  const parsed = CreateNoteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.issues });
  }

  const noteId = crypto.randomUUID();

  try {
    db.transaction(() => {
      db.prepare('INSERT INTO clinical_notes (id, case_id, note_type, content) VALUES (?, ?, ?, ?)')
        .run(noteId, caseId, parsed.data.noteType, parsed.data.content);

      AuditLedger.logEvent({
        actorType: 'user',
        actorId: 'clinician_1',
        caseId,
        eventType: 'clinical_input_created',
        payload: { noteId, noteType: parsed.data.noteType },
        metadata: { appVersion: '0.4.0-future-forward', localOnly: true }
      });
    })();

    res.json({ message: 'Note added securely', noteId });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to add note', details: error.message });
  }
});

/**
 * POST /api/cases/:id/inferences/run
 * Stub for running the deterministic probabilistic inference engine.
 */
app.post('/api/cases/:id/inferences/run', (req: Request, res: Response) => {
  const caseId = req.params.id;
  const inferenceId = crypto.randomUUID();
  
  // TO DO: Actually run the inference engine logic here (Stage 3C)
  const dummyInference = {
    hypothesis: 'Possible executive functioning weakness',
    hypothesis_type: 'cognitive_domain',
    confidence: 0.72,
    uncertainty: 'moderate',
    evidence: [{ sourceType: 'test_score', sourceId: 'test_score_123', quoteOrSummary: 'Processing speed deviation', weight: 0.8 }],
    contraindications: ['Medication effects not ruled out'],
    missing_data: ['Sleep history unavailable'],
    clinical_use_warning: 'Do not use as final diagnosis.',
    diagnostic_claim: false,
    clinician_status: 'pending'
  };

  try {
    db.transaction(() => {
      db.prepare(`
        INSERT INTO inferences (
          id, case_id, engine_version, hypothesis, hypothesis_type, confidence, uncertainty, 
          evidence, contraindications, missing_data, clinical_use_warning, diagnostic_claim, clinician_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        inferenceId, caseId, '0.4.0', dummyInference.hypothesis, dummyInference.hypothesis_type, 
        dummyInference.confidence, dummyInference.uncertainty, JSON.stringify(dummyInference.evidence), 
        JSON.stringify(dummyInference.contraindications), JSON.stringify(dummyInference.missing_data),
        dummyInference.clinical_use_warning, dummyInference.diagnostic_claim ? 1 : 0, dummyInference.clinician_status
      );

      AuditLedger.logEvent({
        actorType: 'model',
        actorId: 'probabilistic-engine-0.4.0',
        caseId,
        eventType: 'inference_generated',
        payload: { inferenceId, confidence: dummyInference.confidence },
        metadata: { appVersion: '0.4.0-future-forward', localOnly: true }
      });
    })();

    res.json({ message: 'Inference generated successfully', inferenceId, result: dummyInference });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to run inference', details: error.message });
  }
});

/**
 * GET /api/cases/:id/audit
 * Retrieves the cryptographic audit trail for a specific case.
 */
app.get('/api/cases/:id/audit', (req: Request, res: Response) => {
  const caseId = req.params.id;
  const events = db.prepare('SELECT * FROM audit_events WHERE case_id = ? ORDER BY timestamp ASC').all(caseId);
  res.json({ audit_trail: events });
});

// --- SERVER LAUNCH ---
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n🛡️ ============================================`);
  console.log(`🛡️  HermSchrod Box - Secure Local API (Stage 3A)`);
  console.log(`🛡️  Running on http://localhost:${PORT}`);
  console.log(`🛡️ ============================================\n`);
});

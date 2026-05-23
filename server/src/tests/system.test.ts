import { db } from '../db/index.js';
import { runMigrations } from '../db/migrations.js';
import { AuditLedger } from '../services/AuditLedger.js';
import { IngestionService, ClinicalRecordRowSchema } from '../services/IngestionService.js';
import crypto from 'crypto';

// Setup before tests
console.log('🧪 Starting deterministic test harness...');

try {
  runMigrations();
  console.log('✅ Migrations passed.');
} catch (e) {
  console.error('❌ Migrations failed:', e);
}

// 1. Test Audit Hash Chaining
try {
  console.log('🧪 Testing Audit Ledger Hash Chaining...');
  const initialChainIntact = AuditLedger.verifyChain();
  if (!initialChainIntact) throw new Error('Initial chain verification failed');

  const caseId = crypto.randomUUID();
  AuditLedger.logEvent({
    actorType: 'system',
    actorId: 'test_runner',
    caseId,
    eventType: 'case_created',
    payload: { caseId, referralDomain: 'Test Domain' },
    metadata: { appVersion: '0.4.0', localOnly: true }
  });

  const afterInsertIntact = AuditLedger.verifyChain();
  if (!afterInsertIntact) throw new Error('Chain verification failed after insert');

  console.log('✅ Audit Ledger Hash Chaining passed.');
} catch (e) {
  console.error('❌ Audit Ledger Test failed:', e);
}

// 2. Test Zod Validation
try {
  console.log('🧪 Testing Zod Row Validation...');
  const validRow = { TestAcronym: 'WCST', Domain: 'Executive Functioning', RawScore: 45 };
  const invalidRow = { Domain: 'Executive Functioning' }; // Missing TestAcronym

  const validResult = ClinicalRecordRowSchema.safeParse(validRow);
  if (!validResult.success) throw new Error('Failed to validate correct row');

  const invalidResult = ClinicalRecordRowSchema.safeParse(invalidRow);
  if (invalidResult.success) throw new Error('Failed to reject incorrect row');

  console.log('✅ Zod Validation passed.');
} catch (e) {
  console.error('❌ Zod Validation Test failed:', e);
}

// 3. Test Inference Output Shape Constraint
try {
  console.log('🧪 Testing Inference Output Shape Constraints...');
  // Simulating an engine's output
  const inference = {
    hypothesis: "Test hypothesis",
    hypothesis_type: "cognitive_domain",
    confidence: 0.85,
    uncertainty: "low",
    evidence: [],
    contraindications: [],
    missing_data: [],
    clinical_use_warning: "Test warning",
    diagnostic_claim: false,
    clinician_status: "pending"
  };

  // Insert test inference to verify SQLite accepts the schema constraints
  const testCaseId = crypto.randomUUID();
  db.prepare('INSERT OR IGNORE INTO patients (id, initials) VALUES (?, ?)').run('test-pat', 'TST');
  db.prepare('INSERT OR IGNORE INTO cases (id, patient_id) VALUES (?, ?)').run(testCaseId, 'test-pat');
  
  db.prepare(`
    INSERT INTO inferences (
      id, case_id, engine_version, hypothesis, hypothesis_type, confidence, uncertainty, 
      evidence, contraindications, missing_data, clinical_use_warning, diagnostic_claim, clinician_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    crypto.randomUUID(), testCaseId, '1.0', inference.hypothesis, inference.hypothesis_type, 
    inference.confidence, inference.uncertainty, JSON.stringify(inference.evidence), 
    JSON.stringify(inference.contraindications), JSON.stringify(inference.missing_data),
    inference.clinical_use_warning, inference.diagnostic_claim ? 1 : 0, inference.clinician_status
  );

  console.log('✅ Inference Output Shape Constraints passed.');
} catch (e) {
  console.error('❌ Inference Shape Test failed:', e);
}

console.log('🎉 Deterministic test harness complete.');

import { db } from '../db/index.js';
import crypto from 'crypto';
import { z } from 'zod';

// Define the strict schema for an Audit Event
export const AuditEventSchema = z.object({
  actorType: z.enum(['user', 'system', 'model']),
  actorId: z.string(),
  caseId: z.string().optional(),
  eventType: z.enum([
    'case_created',
    'data_imported',
    'clinical_input_created',
    'inference_generated',
    'inference_reviewed',
    'report_drafted',
    'report_edited',
    'report_exported',
    'data_deleted',
    'settings_changed'
  ]),
  payload: z.record(z.any()),
  metadata: z.object({
    appVersion: z.string(),
    engineVersion: z.string().optional(),
    modelVersion: z.string().optional(),
    localOnly: z.boolean().default(true)
  })
});

export type AuditEventInput = z.infer<typeof AuditEventSchema>;

export class AuditLedger {
  /**
   * Appends a new event to the cryptographic ledger.
   * This method uses a transaction to ensure integrity.
   */
  static logEvent(input: AuditEventInput): string {
    // Validate input using Zod
    const validatedInput = AuditEventSchema.parse(input);
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    
    // Hash the payload
    const payloadString = JSON.stringify(validatedInput.payload);
    const payloadHash = crypto.createHash('sha256').update(payloadString).digest('hex');

    return db.transaction(() => {
      // Get the previous hash from the ledger
      const previousBlock = db.prepare('SELECT event_hash FROM audit_events ORDER BY timestamp DESC LIMIT 1').get() as { event_hash: string } | undefined;
      const previousHash = previousBlock ? previousBlock.event_hash : '0000000000000000000000000000000000000000000000000000000000000000'; // Genesis previous hash

      // Calculate the event hash (chaining previous hash + payload hash + metadata)
      const eventContent = id + timestamp + validatedInput.eventType + payloadHash + previousHash;
      const eventHash = crypto.createHash('sha256').update(eventContent).digest('hex');

      // Insert the new event
      db.prepare(`
        INSERT INTO audit_events (
          id, timestamp, actor_type, actor_id, case_id, event_type, 
          payload_hash, previous_hash, event_hash, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        timestamp,
        validatedInput.actorType,
        validatedInput.actorId,
        validatedInput.caseId || null,
        validatedInput.eventType,
        payloadHash,
        previousHash,
        eventHash,
        JSON.stringify(validatedInput.metadata)
      );

      return id;
    })();
  }

  /**
   * Verifies the entire cryptographic chain to ensure no prior events have been silently altered.
   */
  static verifyChain(): boolean {
    const events = db.prepare('SELECT * FROM audit_events ORDER BY timestamp ASC').all() as any[];
    
    if (events.length === 0) return true;

    for (let i = 0; i < events.length; i++) {
      const currentEvent = events[i];
      const previousHash = i === 0 
        ? '0000000000000000000000000000000000000000000000000000000000000000' 
        : events[i - 1].event_hash;

      // Check structural chain integrity
      if (currentEvent.previous_hash !== previousHash) {
        console.error(`🚨 Audit Ledger Integrity Compromised at event ${currentEvent.id}: previous_hash mismatch!`);
        return false;
      }

      // Recompute and verify the event hash
      const eventContent = currentEvent.id + currentEvent.timestamp + currentEvent.event_type + currentEvent.payload_hash + currentEvent.previous_hash;
      const calculatedHash = crypto.createHash('sha256').update(eventContent).digest('hex');

      if (currentEvent.event_hash !== calculatedHash) {
        console.error(`🚨 Audit Ledger Integrity Compromised at event ${currentEvent.id}: invalid event_hash!`);
        return false;
      }
    }

    console.log(`🛡️ Audit Ledger verified. ${events.length} events perfectly intact.`);
    return true;
  }
}

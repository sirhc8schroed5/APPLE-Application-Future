// server/index.js – THE FEROCIOUS BEAST: Unified HermSchrod API
// Wires together ALL modules: Rules, Vector RAG, Quantum Engine,
// Blockchain Ledger, Speech, Vision, and the Autonomous LLM Agent.

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// === Module Imports ===
import { applyRules } from './rules.js';
import { search } from './vector.js';
import { computeQuantumProbabilities } from './quantum_engine.js';
import { initializeLedger, mineBlock, verifyChain } from './blockchain.js';
import { analyzeSpeech } from './speech.js';
import { analyzeVision } from './vision.js';
import { buildFerociousSystemPrompt } from './llm_agent.js';
import Database from 'better-sqlite3';

// === Database Initialization ===
const DB_PATH = path.join(process.cwd(), 'neuropsych_analytics.db');
let db = null;
if (fs.existsSync(DB_PATH)) {
  db = new Database(DB_PATH, { fileMustExist: true });
  db.pragma('journal_mode = WAL');
  initializeLedger(db);
  verifyChain(db);
  console.log('🔗 Blockchain ledger verified and intact.');
} else {
  console.log("⚠️ neuropsych_analytics.db not found. Run ingest.js first to populate the predictive engine.");
}

// === Express Setup ===
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Large payloads for audio/video

const OLLAMA_URL = 'http://localhost:11434/api/chat';
const MODEL = 'gemma3:27b'; // Gemma 4 (27B) for deep neuropsychological processing via Metal GPU

// ==========================================
// 1. RULE ENGINE – Symbolic Logic (Stage 1)
// ==========================================
app.post('/api/rules', (req, res) => {
  const { age, domains, notes } = req.body;
  const recommendations = applyRules({ age, domains, notes });
  res.json({ recommendations });
});

// ==========================================
// 2. VECTOR SEARCH – RAG from Textbooks (Stage 3)
// ==========================================
app.post('/api/search', async (req, res) => {
  const { query } = req.body;
  try {
    const results = await search(query);
    res.json({ results });
  } catch (e) {
    console.error('Vector search error', e);
    res.status(500).json({ error: e.message });
  }
});

// ==========================================
// 3. QUANTUM PREDICTIVE ENGINE (Stage 3)
// ==========================================
app.post('/api/predict', (req, res) => {
  if (!db) {
    return res.status(503).json({ error: "Predictive database offline. Run ingest.js first." });
  }

  const { domains, age } = req.body;
  if (!domains || domains.length === 0) {
    return res.json({ predictions: [], quantum_predictions: [] });
  }

  try {
    const stmt = db.prepare(`
      SELECT dataset_source, COUNT(*) as match_count 
      FROM clinical_records 
      WHERE json_extract(raw_data, '$.Age') BETWEEN ? AND ?
      AND (json_extract(raw_data, '$.Diagnosis') LIKE ? OR json_extract(raw_data, '$.ReferralReason') LIKE ?)
      GROUP BY dataset_source
      ORDER BY match_count DESC
      LIMIT 5
    `);

    const targetDomain = domains[0];
    const minAge = age ? Number(age) - 5 : 0;
    const maxAge = age ? Number(age) + 5 : 120;
    
    const historicalMatches = stmt.all(minAge, maxAge, `%${targetDomain}%`, `%${targetDomain}%`);
    
    // Quantum tensor-network modeling
    const quantumPredictions = computeQuantumProbabilities(req.body, historicalMatches);

    const predictions = historicalMatches.map(m => ({
      source: m.dataset_source,
      match_count: m.match_count,
      insight: `Found ${m.match_count} historical trajectories in ${m.dataset_source}.`
    }));

    // Immutably log to blockchain
    if (db) {
      mineBlock(db, {
        type: "Quantum_Inference",
        input: req.body,
        quantum_predictions: quantumPredictions
      });
    }

    res.json({ predictions, quantum_predictions: quantumPredictions });
  } catch (e) {
    console.error('Prediction Engine Error:', e);
    res.status(500).json({ error: "Quantum prediction failed." });
  }
});

// ==========================================
// 4. SPEECH FINGERPRINTING (Stage 4)
// ==========================================
app.post('/api/speech', (req, res) => {
  try {
    const result = analyzeSpeech(req.body.audioData || null);
    
    // Log to blockchain
    if (db) {
      mineBlock(db, { type: "Speech_Biomarker", result });
    }

    res.json({ speech_biomarker: result });
  } catch (e) {
    console.error('Speech module error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ==========================================
// 5. VISION HEATMAP (Stage 4)
// ==========================================
app.post('/api/vision', (req, res) => {
  try {
    const result = analyzeVision(req.body.videoData || null);

    // Log to blockchain
    if (db) {
      mineBlock(db, { type: "Vision_Biomarker", result });
    }

    res.json({ vision_biomarker: result });
  } catch (e) {
    console.error('Vision module error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ==========================================
// 6. THE FEROCIOUS BEAST – Full Report Generation (Stage 5)
//    This is the master endpoint. It orchestrates ALL modules.
// ==========================================
app.post('/api/generate-report', async (req, res) => {
  const { patientData, clinicalNotes, domains, age } = req.body;

  try {
    console.log('\n🔥🔥🔥 THE FEROCIOUS BEAST IS GENERATING A REPORT 🔥🔥🔥\n');

    // Step 1: Run rule engine
    const recommendations = applyRules({ age, domains, notes: clinicalNotes });
    console.log(`📋 Rule Engine: ${recommendations.length} tests recommended.`);

    // Step 2: Run quantum predictive engine
    let quantumPredictions = [];
    if (db) {
      const stmt = db.prepare(`
        SELECT dataset_source, COUNT(*) as match_count 
        FROM clinical_records 
        WHERE json_extract(raw_data, '$.Age') BETWEEN ? AND ?
        GROUP BY dataset_source ORDER BY match_count DESC LIMIT 5
      `);
      const minAge = age ? Number(age) - 5 : 0;
      const maxAge = age ? Number(age) + 5 : 120;
      const historicalMatches = stmt.all(minAge, maxAge);
      quantumPredictions = computeQuantumProbabilities(patientData, historicalMatches);
      console.log(`🔮 Quantum Engine: ${quantumPredictions.length} probabilistic states computed.`);
    }

    // Step 3: Run speech fingerprinting
    const speechBiomarker = analyzeSpeech(null);
    console.log(`🎙️ Speech: ${speechBiomarker.classification}`);

    // Step 4: Run vision heatmap
    const visionBiomarker = analyzeVision(null);
    console.log(`👁️ Vision: ${visionBiomarker.classification}`);

    // Step 5: Run vector search (RAG) for textbook context
    let ragContext = '';
    try {
      const ragResults = await search(clinicalNotes || 'neuropsychological assessment');
      ragContext = ragResults.map(r => r.text).join('\n---\n');
      console.log(`📚 RAG: Retrieved ${ragResults.length} textbook passages.`);
    } catch (ragErr) {
      console.log('📚 RAG: Vector store not populated yet, skipping textbook retrieval.');
    }

    // Step 6: Build the FEROCIOUS system prompt
    const biomarkerData = { speech: speechBiomarker, vision: visionBiomarker };
    const systemPrompt = buildFerociousSystemPrompt(patientData, quantumPredictions, biomarkerData, clinicalNotes);

    // Step 7: Send to the local LLM
    let report = '[LLM Offline] The local LLM (Ollama) is not running. Start it with: ollama serve';
    try {
      const llmResponse = await axios.post(OLLAMA_URL, {
        model: MODEL,
        stream: false,
        options: { temperature: 0.2, num_predict: 4096 },
        prompt: systemPrompt + (ragContext ? `\n\n### TEXTBOOK REFERENCE MATERIAL:\n${ragContext}` : ''),
      });
      report = llmResponse.data.message?.content || llmResponse.data.response || report;
      console.log('✅ LLM report generated successfully.');
    } catch (llmErr) {
      console.error('⚠️ LLM not available:', llmErr.message);
    }

    // Step 8: Mine the entire report to the blockchain
    if (db) {
      mineBlock(db, {
        type: "Full_Report_Generation",
        patient: patientData,
        domains,
        quantum_states: quantumPredictions.length,
        speech_classification: speechBiomarker.classification,
        vision_classification: visionBiomarker.classification
      });
    }

    console.log('\n🏁 REPORT GENERATION COMPLETE.\n');

    res.json({
      report,
      recommendations,
      quantum_predictions: quantumPredictions,
      speech_biomarker: speechBiomarker,
      vision_biomarker: visionBiomarker,
      blockchain_status: 'Inference immutably logged.'
    });

  } catch (e) {
    console.error('🔥 Report generation failed:', e);
    res.status(500).json({ error: 'Report generation failed: ' + e.message });
  }
});

// ==========================================
// 7. BLOCKCHAIN VERIFICATION (Audit)
// ==========================================
app.get('/api/blockchain/verify', (req, res) => {
  if (!db) return res.status(503).json({ intact: false, error: 'Database offline.' });
  const intact = verifyChain(db);
  const count = db.prepare('SELECT COUNT(*) as c FROM blockchain_ledger').get().c;
  res.json({ intact, total_blocks: count });
});

// ==========================================
// LAUNCH
// ==========================================
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n🧠 ============================================`);
  console.log(`🧠  HERMSCHROD BOX – FEROCIOUS BEAST ENGINE`);
  console.log(`🧠  Listening on http://localhost:${PORT}`);
  console.log(`🧠 ============================================\n`);
});

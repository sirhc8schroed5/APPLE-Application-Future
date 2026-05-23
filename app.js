// app.js – HermSchrod Box: Frontend Logic
// Orchestrates intake, keyword detection, biomarker capture, and report generation.

const API_BASE = 'http://localhost:3001';

// ============ KEYWORD DICTIONARIES ============
const KEYWORD_MAP = {
  Anxiety:     ['anxious', 'worry', 'fear', 'nervous', 'uneasy', 'panic', 'apprehension'],
  Depression:  ['depressed', 'sad', 'hopeless', 'down', 'low mood', 'anhedonia', 'suicidal'],
  Memory:      ['forget', 'memory', 'recall', 'amnesia', 'lost', 'confabulation', 'retrograde'],
  Trauma:      ['trauma', 'abuse', 'ptsd', 'flashback', 'violence', 'neglect', 'dissociation'],
  Motor:       ['motor', 'tremor', 'coordination', 'praxis', 'bradykinesia', 'gait', 'ataxia', 'dexterity'],
  Language:    ['naming', 'fluency', 'aphasia', 'word-finding', 'paraphasia', 'dysarthria', 'speech'],
  Executive:   ['executive', 'planning', 'inhibition', 'set-shifting', 'perseveration', 'impulsivity'],
  Visuospatial:['visuospatial', 'construction', 'spatial', 'neglect', 'agnosia', 'perception'],
  Reading:     ['reading', 'dyslexia', 'decoding', 'comprehension'],
  Writing:     ['writing', 'dysgraphia', 'spelling'],
  Arithmetic:  ['arithmetic', 'dyscalculia', 'calculation', 'math'],
  Attention:   ['attention', 'concentration', 'distractible', 'inattentive', 'vigilance']
};

function detectKeywords(text) {
  const lower = text.toLowerCase();
  const detected = new Set();
  for (const [domain, keywords] of Object.entries(KEYWORD_MAP)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) { detected.add(domain); break; }
    }
  }
  return Array.from(detected);
}

// ============ STATE ============
let speechCaptured = false;
let visionCaptured = false;

// ============ DOM READY ============
document.addEventListener('DOMContentLoaded', () => {
  const generateBtn  = document.getElementById('generateBtn');
  const speechBtn    = document.getElementById('speechBtn');
  const visionBtn    = document.getElementById('visionBtn');
  const bioStatus    = document.getElementById('biomarkerStatus');
  const spinner      = document.getElementById('spinner');
  const resultsEl    = document.getElementById('results');

  // Speech button
  speechBtn.addEventListener('click', () => {
    speechCaptured = true;
    speechBtn.classList.add('active');
    speechBtn.textContent = '✅ Speech Captured';
    updateBioStatus();
  });

  // Vision button
  visionBtn.addEventListener('click', () => {
    visionCaptured = true;
    visionBtn.classList.add('active');
    visionBtn.textContent = '✅ Vision Captured';
    updateBioStatus();
  });

  function updateBioStatus() {
    const parts = [];
    if (speechCaptured) parts.push('🎙️ Speech');
    if (visionCaptured) parts.push('👁️ Vision');
    bioStatus.textContent = parts.length
      ? `Biomarkers active: ${parts.join(', ')}`
      : 'No biomarkers captured yet.';
  }

  // ============ GENERATE REPORT ============
  generateBtn.addEventListener('click', async () => {
    const notes    = document.getElementById('notes').value.trim();
    const age      = document.getElementById('age').value;
    const initials = document.getElementById('initials').value.trim();
    const sex      = document.getElementById('sex').value;
    const referral = document.getElementById('refDomain').value;

    if (!notes) { alert('Please paste clinical notes before generating.'); return; }
    if (!age)   { alert('Please enter the patient age.'); return; }

    // Detect domains from notes + referral
    const detected = detectKeywords(notes);
    if (referral) detected.push(referral);
    const uniqueDomains = [...new Set(detected)];

    // Show spinner
    generateBtn.disabled = true;
    spinner.hidden = false;
    resultsEl.hidden = true;

    const patientData = { initials, age, sex, referral };

    try {
      // Call the ferocious beast endpoint
      const response = await fetch(`${API_BASE}/api/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientData,
          clinicalNotes: notes,
          domains: uniqueDomains,
          age
        })
      });

      const data = await response.json();

      // Render detected domains
      document.getElementById('detectedDomains').innerHTML =
        uniqueDomains.map(d => `<span class="domain-tag">${d}</span>`).join(' ');

      // Render recommended tests
      const testsEl = document.getElementById('recommendedTests');
      if (data.recommendations && data.recommendations.length) {
        testsEl.innerHTML = data.recommendations.map(t =>
          `<li><a href="${t.link}" target="_blank">${t.name} (${t.acronym})</a> – ${t.description}</li>`
        ).join('');
      } else {
        testsEl.innerHTML = '<li>No matching tests for this profile.</li>';
      }

      // Render quantum predictions
      const qEl = document.getElementById('quantumPredictions');
      if (data.quantum_predictions && data.quantum_predictions.length) {
        qEl.innerHTML = data.quantum_predictions.map(q =>
          `<div class="q-state">
            <span>${q.quantum_state} (${q.dataset || 'N/A'})</span>
            <span class="q-prob">${q.probability}</span>
          </div>`
        ).join('');
      } else {
        qEl.innerHTML = '<div class="q-state">Quantum engine awaiting database. Run ingest.js.</div>';
      }

      // Render speech biomarker
      const spEl = document.getElementById('speechResult');
      if (data.speech_biomarker) {
        spEl.innerHTML = `<strong>${data.speech_biomarker.classification}</strong> (Confidence: ${data.speech_biomarker.confidence})`;
      }

      // Render vision biomarker
      const viEl = document.getElementById('visionResult');
      if (data.vision_biomarker) {
        viEl.innerHTML = `<strong>${data.vision_biomarker.classification}</strong> (Confidence: ${data.vision_biomarker.confidence})`;
      }

      // Render blockchain status
      document.getElementById('blockchainStatus').innerHTML =
        `<div class="chain-status">🔗 ${data.blockchain_status || 'Ledger updated.'}</div>`;

      // Render full report
      document.getElementById('fullReport').textContent = data.report || 'No report generated.';

      // Show results
      resultsEl.hidden = false;
      resultsEl.scrollIntoView({ behavior: 'smooth' });

    } catch (err) {
      console.error('Beast error:', err);
      // Fallback: run local-only analysis without backend
      document.getElementById('detectedDomains').innerHTML =
        uniqueDomains.map(d => `<span class="domain-tag">${d}</span>`).join(' ');

      const localRecs = recommendTests(uniqueDomains, age);
      const testsEl = document.getElementById('recommendedTests');
      testsEl.innerHTML = localRecs.map(t =>
        `<li><a href="${t.link}" target="_blank">${t.name} (${t.acronym})</a> – ${t.description}</li>`
      ).join('');

      document.getElementById('quantumPredictions').innerHTML =
        '<div class="q-state">Server offline. Start backend: node server/index.js</div>';
      document.getElementById('speechResult').innerHTML = 'Server offline.';
      document.getElementById('visionResult').innerHTML = 'Server offline.';
      document.getElementById('blockchainStatus').innerHTML =
        '<div class="chain-status">⚠️ Backend not running.</div>';
      document.getElementById('fullReport').textContent =
        'The backend server is not running. Start it with:\n  cd Dashboard/server && node index.js\n\nThen click "Unleash the Beast" again.';

      resultsEl.hidden = false;
    } finally {
      generateBtn.disabled = false;
      spinner.hidden = true;
    }
  });
});

// ============ LOCAL FALLBACK: Test Recommendation ============
function recommendTests(detected, age) {
  if (typeof TESTS === 'undefined') return [];
  const DOMAIN_MAP = {
    Anxiety: 'Anxiety', Depression: 'Depression', Memory: 'Cognitive / Neurological',
    Trauma: 'Social-Emotional', ADHD: 'Attention', Dementia: 'Cognitive / Neurological',
    TBI: 'Cognitive / Neurological', 'Learning Disability': 'Academic',
    Autism: 'Social-Emotional', 'Mood Disorder': 'Depression',
    'Stroke/Vascular': 'Cognitive / Neurological', Motor: 'Motor',
    Language: 'Language', Executive: 'Executive Functioning',
    Visuospatial: 'Visuospatial', Reading: 'Reading', Writing: 'Written Expression',
    Arithmetic: 'Calculation', Attention: 'Attention',
    'Motor Dysfunction': 'Motor', 'Executive Dysfunction': 'Executive Functioning',
    'Memory Impairment': 'Cognitive / Neurological'
  };

  const candidates = [];
  const ageNum = Number(age);
  detected.forEach(d => {
    const target = DOMAIN_MAP[d] || d;
    TESTS.forEach(test => {
      const matchesDomain = test.domains.some(td => td.toLowerCase().includes(target.toLowerCase()));
      let ageOk = true;
      if (test.ageRange) {
        const range = test.ageRange.replace(/\s+/g, '');
        if (range.endsWith('+')) {
          ageOk = ageNum >= parseInt(range.slice(0, -1), 10);
        } else if (range.includes('\u2011')) {
          const [min, max] = range.split('\u2011').map(v => parseInt(v, 10));
          ageOk = ageNum >= min && ageNum <= max;
        }
      }
      if (matchesDomain && ageOk) candidates.push(test);
    });
  });

  const uniq = {};
  candidates.forEach(t => { uniq[t.acronym] = t; });
  return Object.values(uniq);
}

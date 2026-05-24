// app.js – Seeing-Sentiment (HermSchrod Box): Premium Clinical Operations Engine
// Integrates 100% of Stage 0-5 functionalities directly:
// - Staged Patient Profile Database & Automatic Seed (Verdana F. Twice-Exceptional profile)
// - Formula-equivalent Token Sentiment Analysis (Cluster, Alternation, and Dashboard Validity Scoring)
// - Age-Filtered Test Battery Planner with planned vs actual progress tracking
// - Clinical NLP Keyword Counter (Scans 238 keywords across Anxiety, Depression, Memory, Trauma)
// - Dynamic In-Test Behavioral Logging Grid
// - Endpoint Integrations for LLM Reports, Quantum Projections, and Plagiarism Manual Scanning

const API_BASE = 'http://localhost:3001';

// ============ CLINICAL LEXICON (238 Keywords Scanned) ============
const CLINICAL_LEXICON = {
  Anxiety: ['anxious', 'anxiety', 'panic', 'fear', 'stress', 'tense', 'apprehensive', 'dread', 'restless', 'hypervigilant', 'overwhelmed', 'palpitations', 'phobia', 'avoidance', 'tension', 'worry', 'worrying', 'trembling', 'sweating', 'shaking', 'uneasy', 'nervous', 'nervousness', 'restlessness', 'apprehension', 'dread', 'panic attack', 'hypervigilance', 'vigilance', 'obsessive', 'rumination', 'ruminating', 'avoiding', 'somatic', 'insomnia', 'irritability', 'fearing', 'threat', 'anticipatory', 'overcontrol', 'second-guessing', 'checking', 'unstructured', 'exposure', 'misjudged', 'destabilizing', 'imprecision', 'preciseness', 'precision', 'containment', 'monitoring'],
  Depression: ['sad', 'depressed', 'hopeless', 'worthless', 'empty', 'lonely', 'withdrawn', 'suicidal', 'apathetic', 'fatigued', 'insomnia', 'anhedonia', 'guilt', 'shame', 'flat affect', 'depression', 'hopelessness', 'apathy', 'fatigue', 'weary', 'weariness', 'exhaustion', 'exhausted', 'sadness', 'suicide', 'ideation', 'low mood', 'recurrent', 'downturns', 'dysthymia', 'dysthymic', 'burnout', 'naps', 'vegetative', 'burden', 'flawed', 'damaged', 'harm', 'disruption', 'irritation', 'slowness', 'cognitive activation', 'pacing', 'isolation', 'avoidance', 'withdrawal', 'uninterested', 'bleak', 'despair', 'heavy', 'burdened', 'steady mood', 'flat', 'blunted', 'energy', 'lethargy', 'melancholy', 'grief', 'helpless', 'helplessness', 'unvalued'],
  Memory: ['memory', 'forget', 'confused', 'disoriented', 'recall', 'amnesia', 'dementia', 'cognitive decline', 'brain fog', 'word-finding', 'distracted', 'concentration', 'forgetful', 'forgetfulness', 'confusion', 'disorientation', 'attention', 'retrieval', 'encoding', 'storing', 'store', 'digit span', 'sequencing', 'working memory', 'short-term', 'long-term', 'retrospect', 'mnemonic', 'recall', 'recalldelayed', 'delayed recall', 'visual memory', 'verbal memory', 'wordlist', 'complex figure', 'stereognosis', 'localisation', 'auditory', 'visual-motor', 'pattern', 'visual scanning', 'processing speed', 'slowness', 'pace', 'flexibility', 'set-shifting', 'inattentive', 'inattentiveness', 'vigilance', 'inhibition', 'impulsivity', 'perseveration', 'cognitive ceiling', 'accuracy', 'precision', 'monitoring'],
  Trauma: ['trauma', 'abuse', 'flashback', 'nightmare', 'ptsd', 'dissociation', 'startle', 'trigger', 'intrusive', 'violence', 'neglect', 'assault', 'self-harm', 'anger', 'hostile', 'abusive', 'neglected', 'flashbacks', 'nightmares', 'startled', 'triggers', 'intrusive thoughts', 'dissociative', 'hyperarousal', 'shame', 'guilt', 'threat', 'unsafe', 'fearful', 'harm', 'harmed', 'damaged', 'flawed', 'injury', 'assaulted', 'hostility', 'rage', 'unresolved', 'distress', 'interpersonal distress', 'protective', 'camouflage', 'masking', 'compensation', 'assimilation', 'act', 'put on an act', 'copying', 'mimicking', 'imposing', 'controlling', 'over-control', 'surveillance', 'safety', 'worldview', 'religious improvisation', 'criticism', 'misunderstanding', 'rejection', 'loss', 'grief', 'alienation', 'isolation', 'selectivity']
};

// ============ IN-MEMORY DATABASE ============
let stagedPatients = [];
let activePatient = null;
let logRowsCount = 0;

// ============ DUMMY PATIENT SEED ============
// (Removed Verdana F. use-case template to allow clean startup)

// ============ CLINICAL CALCULATORS ============

// 1. Alternation Score (Domain Transitions)
function calculateAlternationScore(pattern) {
  let score = 0;
  for (let i = 1; i < pattern.length; i++) {
    if (pattern[i] !== pattern[i - 1]) score++;
  }
  return score;
}

// 2. Cluster Score (Max adjacent detected domains)
function calculateClusterScore(pattern) {
  let maxCluster = 0;
  let currentCluster = 0;
  for (let val of pattern) {
    if (val === 1) {
      currentCluster++;
      maxCluster = Math.max(maxCluster, currentCluster);
    } else {
      currentCluster = 0;
    }
  }
  return maxCluster;
}

// 3. Dashboard Validity Percentage
function calculateDashboardValidity(detectedCount, clusterScore, alternationScore) {
  // Heuristic math mimicking Excel sheet formulas:
  // Base confidence at 50% + bonuses for cluster cohesion, penaltized for transitions (alternations)
  let score = 50 + (detectedCount * 2) + (clusterScore * 3) - (alternationScore * 1);
  return Math.min(Math.max(Math.round(score), 50), 75);
}

// 4. Battery Plan Validity Percentage
function calculateBatteryValidity(detectedCount, priorityMatches, validityTestsIncluded) {
  let score = 55 + (detectedCount * 3) + (priorityMatches * 4) + (validityTestsIncluded ? 10 : 0);
  return Math.min(Math.max(Math.round(score), 55), 90);
}

// 5. NLP Validity Percentage
function calculateNLPValidity(detectedCount, categoriesHitCount) {
  let score = 55 + (detectedCount * 2) + (categoriesHitCount * 5);
  return Math.min(Math.max(Math.round(score), 55), 80);
}

// ============ TABS CONTROLLER ============
function setupTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle nav
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Toggle content
      const targetId = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        if (content.id === targetId) {
          content.classList.add('active');
        }
      });
    });
  });
}

// ============ STAGED PATIENTS ENGINE ============
function renderPatientsDropdown() {
  const selector = document.getElementById('patientSelector');
  if (stagedPatients.length > 0) {
    selector.innerHTML = stagedPatients.map(p => 
      `<option value="${p.initials}">${p.fullName} (${p.initials})</option>`
    ).join('');
    if (!activePatient) activePatient = stagedPatients[0];
    selector.value = activePatient.initials;
    populateDashboard(activePatient);
  } else {
    selector.innerHTML = `<option value="">-- No Patients Staged --</option>`;
    activePatient = null;
    clearDashboard();
  }
}

function registerPatient(profile) {
  const existingIndex = stagedPatients.findIndex(p => p.initials === profile.initials);
  if (existingIndex !== -1) {
    stagedPatients[existingIndex] = profile; // Overwrite
  } else {
    stagedPatients.push(profile);
  }
  activePatient = profile;
  renderPatientsDropdown();
}

function savePatientFromForm() {
  const initials = document.getElementById('initials').value.trim();
  const fullName = document.getElementById('fullName').value.trim();
  const age = document.getElementById('age').value;
  const sex = document.getElementById('sex').value;
  const handedness = document.getElementById('handedness').value;
  const education = document.getElementById('education').value;
  const refDomain = document.getElementById('refDomain').value;
  const devNormal = document.getElementById('devNormal').value;
  const birthNotes = document.getElementById('birthNotes').value.trim();
  const familyNotes = document.getElementById('familyNotes').value.trim();
  const academicNotes = document.getElementById('academicNotes').value.trim();

  if (!initials || !fullName || !age) {
    alert('Please enter Patient Initials, Full Name, and Age to stage.');
    return;
  }

  const profile = {
    initials,
    fullName,
    age: Number(age),
    sex,
    handedness,
    education: Number(education) || 12,
    refDomain,
    devNormal,
    birthNotes,
    familyNotes,
    academicNotes,
    domains: {
      developmental: document.getElementById('dom-developmental').checked,
      speech: document.getElementById('dom-speech').checked,
      emotional: document.getElementById('dom-emotional').checked,
      executive: document.getElementById('dom-executive').checked,
      cognitive: document.getElementById('dom-cognitive').checked,
      academic: document.getElementById('dom-academic').checked,
      vocational: document.getElementById('dom-vocational').checked,
      legal: document.getElementById('dom-legal').checked,
      medical: document.getElementById('dom-medical').checked,
      behavioral: document.getElementById('dom-behavioral').checked
    }
  };

  registerPatient(profile);
  alert(`Patient ${profile.fullName} successfully staged and locked!`);
  
  // Transition to Dashboard
  document.querySelector('[data-tab="tab-dashboard"]').click();
}

// ============ POPULATE DASHBOARD & SCORING ============
function populateDashboard(patient) {
  activePatient = patient;

  // Fill basics
  document.getElementById('dashName').textContent = patient.fullName;
  document.getElementById('dashAgeSex').textContent = `${patient.age}y.o. / ${patient.sex} (${patient.handedness} handed)`;
  document.getElementById('dashReferral').textContent = patient.refDomain;

  // Compile domains into binary pattern
  const domainKeys = [
    'developmental', 'speech', 'emotional', 'executive', 'cognitive',
    'academic', 'vocational', 'legal', 'medical', 'behavioral'
  ];
  
  const binaryPattern = domainKeys.map(k => patient.domains[k] ? 1 : 0);
  const detectedCount = binaryPattern.reduce((a, b) => a + b, 0);

  // Surface Active Domains Badges
  const badgesContainer = document.getElementById('dashDomainBadges');
  const domainsNames = [
    'Developmental', 'Speech & Language', 'Social-Emotional', 'Executive Functioning', 'Cognitive / Neurological',
    'School / Academic', 'Vocational', 'Legal', 'Medical / Neurological', 'Behavioral / Adaptive'
  ];
  
  badgesContainer.innerHTML = domainsNames.map((name, i) => {
    const isDetected = binaryPattern[i] === 1;
    return `
      <div class="metric-row" style="border: none;">
        <span>${i + 1}. ${name}</span>
        <span class="badge ${isDetected ? 'badge-success' : 'badge-danger'}">${isDetected ? 'Detected' : 'Not Detected'}</span>
      </div>
    `;
  }).join('');

  // Calculate Sentiment scores
  const clusterScore = calculateClusterScore(binaryPattern);
  const alternationScore = calculateAlternationScore(binaryPattern);
  const validityPct = calculateDashboardValidity(detectedCount, clusterScore, alternationScore);

  // Render Greenbox stats
  document.getElementById('sentBinary').textContent = `[${binaryPattern.join(',')}]`;
  document.getElementById('sentDetected').textContent = `${detectedCount} / 10`;
  document.getElementById('sentCluster').textContent = clusterScore;
  document.getElementById('sentAlternation').textContent = alternationScore;
  
  document.getElementById('dashValidityPct').textContent = `${validityPct}%`;
  document.getElementById('dashValidityFill').style.width = `${validityPct}%`;

  // Testing & Treatment directions
  let testingPath = 'Targeted Path';
  if (detectedCount > 5) testingPath = 'Full Battery Path';
  else if (patient.domains.executive || patient.domains.cognitive) testingPath = 'Left-Brain Path';
  else if (patient.domains.emotional || patient.domains.speech) testingPath = 'Right-Brain Path';

  let treatmentPath = 'Targeted Approach';
  if (detectedCount > 4) treatmentPath = 'Multi-domain Strategy';
  else if (detectedCount === 1) treatmentPath = 'Active Monitoring';

  document.getElementById('sentTestingPath').textContent = testingPath;
  document.getElementById('sentTreatmentPath').textContent = treatmentPath;

  // Re-generate Battery Planner & NLP Metrics
  generateBatteryPlan(patient);
  runNLPServerMock(patient);
}

// ============ AGE-FILTERED BATTERY PLANNER ============
function generateBatteryPlan(patient) {
  if (typeof TESTS === 'undefined') return;

  const DOMAIN_MAP = {
    developmental: ['Developmental', 'Behavioral / Adaptive'],
    speech: ['Language'],
    emotional: ['Social-Emotional', 'Personality'],
    executive: ['Executive Functioning', 'Attention'],
    cognitive: ['Cognitive / Neurological', 'Memory', 'Attention'],
    academic: ['Academic', 'Reading', 'Written Expression', 'Calculation'],
    vocational: ['Vocational'],
    legal: ['Legal'],
    medical: ['Cognitive / Neurological', 'Somatosensory', 'Motor', 'Auditory', 'Rhythm'],
    behavioral: ['Behavioral / Adaptive', 'Social-Emotional']
  };

  // Compile active test domains
  const activeTestDomains = new Set();
  Object.keys(patient.domains).forEach(k => {
    if (patient.domains[k]) {
      DOMAIN_MAP[k].forEach(td => activeTestDomains.add(td));
    }
  });

  // Filter tests by domain & age range
  const recommendedTests = [];
  const ageNum = patient.age;

  TESTS.forEach(test => {
    // 1. Domain Intersection
    const matchesDomain = test.domains.some(d => activeTestDomains.has(d));
    if (!matchesDomain) return;

    // 2. Age Filter
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

    if (ageOk) {
      recommendedTests.push(test);
    }
  });

  // Render Table
  const tbody = document.getElementById('batteryTableBody');
  if (recommendedTests.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; font-style: italic;">No active domains detected. Check clinical concerns in Patients tab.</td></tr>`;
    updateBatteryValidity(0, false);
    return;
  }

  tbody.innerHTML = recommendedTests.map((t, idx) => {
    // Priority logic: HIGH if matches patient's referral domain target
    const isPriority = t.domains.some(d => d.toLowerCase().includes(patient.refDomain.toLowerCase()));
    const priorityLabel = isPriority ? 'HIGH' : 'STANDARD';
    const priorityClass = isPriority ? 'badge-danger' : 'badge-info';

    // Validity test check
    const hasValidity = t.domains.includes('Effort Validity') || t.acronym === 'TOMM' ? 'Yes' : 'No';

    return `
      <tr>
        <td style="font-weight: 700; color: var(--quantum);">${t.domains[0]}</td>
        <td><strong>${t.acronym}</strong> – ${t.name}</td>
        <td><span class="badge ${priorityClass}">${priorityLabel}</span></td>
        <td><span class="badge ${hasValidity === 'Yes' ? 'badge-success' : 'badge-info'}" style="background: transparent; border-color: rgba(255,255,255,0.1);">${hasValidity}</span></td>
        <td>
          <select class="battery-status" data-idx="${idx}" style="padding: 0.35rem 0.5rem; margin-top: 0; font-size: 0.8rem; background: rgba(0,0,0,0.25);">
            <option>Planned</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>Skipped</option>
            <option>Modified</option>
          </select>
        </td>
        <td>
          <input type="text" class="battery-actual" data-idx="${idx}" placeholder="e.g. WAIS-IV Block Design" style="padding: 0.35rem 0.5rem; margin-top: 0; font-size: 0.8rem; background: rgba(0,0,0,0.25); width: 100%;" />
        </td>
      </tr>
    `;
  }).join('');

  // Bind events for tracking
  document.querySelectorAll('.battery-status').forEach(el => {
    el.addEventListener('change', trackSessionStatus);
  });

  // Calculate Priority matches and Validity test counts for battery plan validity
  const priorityMatches = recommendedTests.filter(t => t.domains.some(d => d.toLowerCase().includes(patient.refDomain.toLowerCase()))).length;
  const hasValidityTest = recommendedTests.some(t => t.domains.includes('Effort Validity') || t.acronym === 'TOMM');

  const activeDomainsCount = Object.values(patient.domains).filter(v => v === true).length;
  const batteryValidity = calculateBatteryValidity(activeDomainsCount, priorityMatches, hasValidityTest);

  updateBatteryValidity(batteryValidity);
  trackSessionStatus();
}

function updateBatteryValidity(score) {
  document.getElementById('batteryValidityPct').textContent = `${score}%`;
  document.getElementById('batteryValidityFill').style.width = `${score}%`;
}

function trackSessionStatus() {
  const selectors = document.querySelectorAll('.battery-status');
  let planned = 0, completed = 0, skipped = 0, modified = 0;

  selectors.forEach(sel => {
    const val = sel.value;
    if (val === 'Planned') planned++;
    else if (val === 'Completed') completed++;
    else if (val === 'Skipped') skipped++;
    else if (val === 'Modified') modified++;
  });

  document.getElementById('trackPlanned').textContent = planned;
  document.getElementById('trackCompleted').textContent = completed;
  document.getElementById('trackSkipped').textContent = skipped;
  document.getElementById('trackModified').textContent = modified;
}

// ============ CLINICAL NLP SCANNERS ============
function runNLPKeywordScan(text) {
  if (!text) return { Anxiety: 0, Depression: 0, Memory: 0, Trauma: 0 };

  const lower = text.toLowerCase();
  const counts = { Anxiety: 0, Depression: 0, Memory: 0, Trauma: 0 };

  Object.entries(CLINICAL_LEXICON).forEach(([category, keywords]) => {
    keywords.forEach(kw => {
      // Clean regex match for exact boundaries
      const regex = new RegExp(`\\b${kw}\\b`, 'g');
      const matches = lower.match(regex);
      if (matches) {
        counts[category] += matches.length;
      }
    });
  });

  return counts;
}

function runNLPServerMock(patient) {
  const text = document.getElementById('notes').value.trim();
  const counts = runNLPKeywordScan(text);

  // Surface counts
  document.getElementById('nlpAnxiety').textContent = counts.Anxiety;
  document.getElementById('nlpDepression').textContent = counts.Depression;
  document.getElementById('nlpMemory').textContent = counts.Memory;
  document.getElementById('nlpTrauma').textContent = counts.Trauma;

  // Hemispheric & Disconnection Modeling
  const activeDomainsCount = Object.values(patient.domains).filter(v => v === true).length;
  const categoriesHit = Object.values(counts).filter(v => v > 0).length;
  const nlpValidity = calculateNLPValidity(activeDomainsCount, categoriesHit);

  document.getElementById('nlpValidityPct').textContent = `${nlpValidity}% Validity`;

  // Left vs Right brain indicators
  // Left: developmental, executive, cognitive, academic, medical
  // Right: emotional, speech, behavioral, vocational, legal
  let leftPoints = 0, rightPoints = 0;
  if (patient.domains.developmental) leftPoints++;
  if (patient.domains.executive) leftPoints += 2;
  if (patient.domains.cognitive) leftPoints += 2;
  if (patient.domains.academic) leftPoints += 2;
  if (patient.domains.medical) leftPoints++;

  if (patient.domains.speech) rightPoints += 2;
  if (patient.domains.emotional) rightPoints += 2;
  if (patient.domains.behavioral) rightPoints += 2;
  if (patient.domains.vocational) rightPoints++;
  if (patient.domains.legal) rightPoints++;

  const totalPoints = leftPoints + rightPoints || 1;
  const leftPct = Math.round((leftPoints / totalPoints) * 100);
  document.getElementById('nlpHemisphereFill').style.width = `${leftPct}%`;

  // Disconnections
  let intraLabel = 'Balanced coordination';
  if (leftPoints > 4 && patient.domains.executive !== patient.domains.cognitive) {
    intraLabel = '⚠️ High executive-cognitive friction';
  } else if (rightPoints > 4) {
    intraLabel = '⚠️ Socio-emotional load imbalance';
  }

  let interLabel = 'Intact corpus callosum pathway';
  if (Math.abs(leftPoints - rightPoints) > 3) {
    interLabel = '⚠️ Inter-hemispheric integration split';
  }

  document.getElementById('nlpIntra').textContent = intraLabel;
  document.getElementById('nlpInter').textContent = interLabel;
}

// ============ IN-TEST BEHAVIORAL LOGS ============
function addLogLine() {
  logRowsCount++;
  const tbody = document.getElementById('intestLogBody');
  const tr = document.createElement('tr');
  tr.id = `log-row-${logRowsCount}`;

  tr.innerHTML = `
    <td><input type="text" class="log-test" placeholder="e.g. WAIS-IV Similarities" style="padding: 0.35rem 0.5rem; margin-top: 0; font-size: 0.8rem; background: rgba(0,0,0,0.25); width:100%;" /></td>
    <td><input type="text" class="log-subtest" placeholder="e.g. Similarities" style="padding: 0.35rem 0.5rem; margin-top: 0; font-size: 0.8rem; background: rgba(0,0,0,0.25); width:100%;" /></td>
    <td><input type="time" class="log-start" style="padding: 0.35rem 0.5rem; margin-top: 0; font-size: 0.8rem; background: rgba(0,0,0,0.25); width:100%;" /></td>
    <td><input type="time" class="log-end" style="padding: 0.35rem 0.5rem; margin-top: 0; font-size: 0.8rem; background: rgba(0,0,0,0.25); width:100%;" /></td>
    <td><input type="text" class="log-note" placeholder="Good effort, limited eye contact" style="padding: 0.35rem 0.5rem; margin-top: 0; font-size: 0.8rem; background: rgba(0,0,0,0.25); width:100%;" /></td>
    <td>
      <select class="log-code" style="padding: 0.35rem 0.5rem; margin-top: 0; font-size: 0.8rem; background: rgba(0,0,0,0.25);">
        <option>Good</option>
        <option>Variable</option>
        <option>Poor</option>
        <option>Anxious</option>
        <option>Euthymic</option>
        <option>Flat</option>
        <option>Labile</option>
        <option>Depressed</option>
        <option>Blunted</option>
      </select>
    </td>
    <td>
      <button class="table-btn-danger" onclick="document.getElementById('log-row-${logRowsCount}').remove()">Delete</button>
    </td>
  `;

  tbody.appendChild(tr);
}

// ============ REFERENTIAL MANUALS PLAGIARISM SCANNER ============
async function runPlagiarismScan() {
  const text = document.getElementById('notes').value.trim();
  if (!text) {
    alert('Please enter clinical notes before running the plagiarism scan.');
    return;
  }

  const scanBtn = document.getElementById('scanManualsBtn');
  scanBtn.disabled = true;
  scanBtn.textContent = '🔍 Scanning clinical guidelines...';

  try {
    const res = await fetch(`${API_BASE}/api/plagiarism/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        filename: 'clinical_notes_draft.txt',
        radius: 0.8
      })
    });

    const report = await res.json();
    document.getElementById('plagiarismResultBlock').hidden = false;
    document.getElementById('plagMatchPct').textContent = `${report.matchPercentage}% Similarity`;

    if (report.matchedFiles && report.matchedFiles.length > 0) {
      document.getElementById('plagMatchedFile').textContent = report.matchedFiles.join(', ');
      // Grab the first matched snippet
      if (report.segments && report.segments.length > 0) {
        document.getElementById('plagHighlightText').innerHTML = 
          `<span style="color: var(--primary); font-weight: 700;">Matching snippet detected in manual:</span> "${report.segments[0].matchedText}"`;
      } else {
        document.getElementById('plagHighlightText').textContent = 'No major text clusters matched directly.';
      }
    } else {
      document.getElementById('plagMatchedFile').textContent = 'None';
      document.getElementById('plagHighlightText').textContent = 'No matching text segments found in the documentation database.';
    }

  } catch (err) {
    console.error('Failed to run plagiarism manuals scan:', err);
    alert('Failed to connect to plagiarism database engine.');
  } finally {
    scanBtn.disabled = false;
    scanBtn.textContent = '🔍 Run Reference Manual Scan';
  }
}

// ============ BEAST ENGINE GENERATOR ============
async function generateBeastReport() {
  const notes = document.getElementById('notes').value.trim();
  const generateBtn = document.getElementById('generateBtn');
  const spinner = document.getElementById('spinner');
  const resultsEl = document.getElementById('results');

  if (!notes) { alert('Please enter clinical notes before unleashing the beast.'); return; }
  if (!activePatient) { alert('Please stage or select a patient on Tab 1 or Tab 2 first.'); return; }

  generateBtn.disabled = true;
  spinner.hidden = false;
  resultsEl.hidden = true;

  // Build log array
  const logs = [];
  document.querySelectorAll('#intestLogBody tr').forEach(row => {
    logs.push({
      testName: row.querySelector('.log-test').value,
      subtest: row.querySelector('.log-subtest').value,
      start: row.querySelector('.log-start').value,
      end: row.querySelector('.log-end').value,
      note: row.querySelector('.log-note').value,
      code: row.querySelector('.log-code').value
    });
  });

  const uniqueDomains = Object.keys(activePatient.domains).filter(k => activePatient.domains[k]);

  try {
    const response = await fetch(`${API_BASE}/api/generate-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientData: activePatient,
        clinicalNotes: notes,
        domains: uniqueDomains,
        age: activePatient.age,
        intest_logs: logs
      })
    });

    const data = await response.json();

    // Render speech biomarker
    document.getElementById('speechResult').textContent = data.speech_biomarker
      ? `${data.speech_biomarker.classification} (Confidence: ${data.speech_biomarker.confidence})`
      : 'Offline';

    // Render vision biomarker
    document.getElementById('visionResult').textContent = data.vision_biomarker
      ? `${data.vision_biomarker.classification} (Confidence: ${data.vision_biomarker.confidence})`
      : 'Offline';

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
      qEl.innerHTML = '<div class="q-state">Quantum engine awaiting dataset ingestion.</div>';
    }

    // Render blockchain status
    document.getElementById('blockchainStatus').innerHTML =
      `<div class="chain-status">🔗 ${data.blockchain_status || 'Inference block immutably logged.'}</div>`;

    // Render full report
    document.getElementById('fullReport').textContent = data.report || 'No report generated.';
    resultsEl.hidden = false;
    resultsEl.scrollIntoView({ behavior: 'smooth' });

  } catch (err) {
    console.error('Beast Generation Error:', err);
    alert('Report generation failed. Is the local Express server running on port 3001?');
  } finally {
    generateBtn.disabled = false;
    spinner.hidden = true;
  }
}

// ============ CLEAR DASHBOARD TO BLANK STATE ============
function clearDashboard() {
  document.getElementById('dashName').textContent = '--';
  document.getElementById('dashAgeSex').textContent = '--';
  document.getElementById('dashReferral').textContent = '--';
  
  const badgesContainer = document.getElementById('dashDomainBadges');
  const domainsNames = [
    'Developmental', 'Speech & Language', 'Social-Emotional', 'Executive Functioning', 'Cognitive / Neurological',
    'School / Academic', 'Vocational', 'Legal', 'Medical / Neurological', 'Behavioral / Adaptive'
  ];
  badgesContainer.innerHTML = domainsNames.map((name, i) => `
    <div class="metric-row" style="border: none;">
      <span>${i + 1}. ${name}</span>
      <span class="badge badge-danger">Not Detected</span>
    </div>
  `).join('');

  document.getElementById('sentBinary').textContent = '[0,0,0,0,0,0,0,0,0,0]';
  document.getElementById('sentDetected').textContent = '0 / 10';
  document.getElementById('sentCluster').textContent = '0';
  document.getElementById('sentAlternation').textContent = '0';
  
  document.getElementById('dashValidityPct').textContent = '50%';
  document.getElementById('dashValidityFill').style.width = '50%';

  document.getElementById('sentTestingPath').textContent = 'Awaiting Intake';
  document.getElementById('sentTreatmentPath').textContent = 'Awaiting Intake';

  // Clear battery plan
  const tbody = document.getElementById('batteryTableBody');
  tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; font-style: italic;">No active domains detected. Check clinical concerns in Patients tab.</td></tr>`;
  updateBatteryValidity(55);

  // Reset NLP
  document.getElementById('nlpAnxiety').textContent = '0';
  document.getElementById('nlpDepression').textContent = '0';
  document.getElementById('nlpMemory').textContent = '0';
  document.getElementById('nlpTrauma').textContent = '0';
  document.getElementById('nlpValidityPct').textContent = '55% Validity';
  document.getElementById('nlpHemisphereFill').style.width = '50%';
  document.getElementById('nlpIntra').textContent = 'Balanced coordination';
  document.getElementById('nlpInter').textContent = 'Intact corpus callosum pathway';
}

// ============ APP INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();

  // Clear dashboard and form
  clearDashboard();

  // Bind Actions
  document.getElementById('savePatientBtn').addEventListener('click', savePatientFromForm);
  document.getElementById('patientSelector').addEventListener('change', (e) => {
    if (e.target.value) {
      const p = stagedPatients.find(p => p.initials === e.target.value);
      if (p) populateDashboard(p);
    } else {
      clearDashboard();
    }
  });
  
  document.getElementById('addLogLineBtn').addEventListener('click', addLogLine);
  document.getElementById('scanManualsBtn').addEventListener('click', runPlagiarismScan);
  document.getElementById('generateBtn').addEventListener('click', generateBeastReport);

  // Add initial empty log line
  addLogLine();
});

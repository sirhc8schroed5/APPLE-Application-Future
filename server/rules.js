// server/rules.js – Symbolic rule engine

import { TESTS } from '../data.js'; // reuse the same test data

export function applyRules({ age, domains, notes }) {
  const ageNum = Number(age);
  const recs = [];

  const domainMap = {
    Motor: ['Motor'],
    AcousticoMotor: ['Auditory', 'Rhythm'],
    CutaneousKinesthetic: ['Somatosensory'],
    Visual: ['Visuospatial'],
    Speech: ['Language'],
    Writing: ['Written Expression'],
    Reading: ['Reading'],
    Arithmetic: ['Calculation'],
    Mnestic: ['Memory'],
    Intellectual: ['Executive', 'Reasoning']
  };

  domains.forEach(d => {
    const target = domainMap[d] || [];
    TESTS.forEach(t => {
      if (t.ageRange && !ageInRange(t.ageRange, ageNum)) return;
      const match = t.domains.some(td => target.includes(td));
      if (match) recs.push(t);
    });
  });

  // dedupe by acronym
  const uniq = {};
  recs.forEach(t => (uniq[t.acronym] = t));
  return Object.values(uniq);
}

function ageInRange(range, age) {
  const clean = range.replace(/\s+/g, '');
  if (clean.endsWith('+')) return age >= parseInt(clean.slice(0, -1), 10);
  if (clean.includes('‑')) {
    const [lo, hi] = clean.split('‑').map(v => parseInt(v, 10));
    return age >= lo && age <= hi;
  }
  return true;
}

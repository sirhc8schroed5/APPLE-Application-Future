// data.js – THE COMPLETE TEST CATALOG for the HermSchrod Box
// Extracted from Stage1_Complete_Professional.xlsx, WAIS WISC Neuropathways.xlsx,
// and the 10 Luria-based neuropsychological domains.

const TESTS = [
  // === MOTOR FUNCTIONS ===
  { name: "Grooved Pegboard Test", acronym: "GPT", domains: ["Motor"], ageRange: "5+", link: "https://www.parinc.com/Products/Pkey/106", description: "Measures fine motor dexterity and speed; sensitive to lateralized motor dysfunction." },
  { name: "Finger Tapping Test", acronym: "FTT", domains: ["Motor"], ageRange: "5+", link: "https://www.parinc.com", description: "Measures motor speed and lateralized motor function (Halstead-Reitan)." },

  // === ACOUSTICO-MOTOR (Auditory & Rhythm) ===
  { name: "Seashore Rhythm Test", acronym: "SRT", domains: ["Auditory", "Rhythm"], ageRange: "18+", link: "https://www.parinc.com", description: "Assesses pitch and rhythm discrimination (Halstead-Reitan Battery)." },
  { name: "Digit Span (WAIS-IV)", acronym: "DS", domains: ["Attention", "Auditory"], ageRange: "16+", link: "https://www.pearsonassessments.com/store/usassessments/en/Store/Professional-Assessments/Cognition-%26-Neuro/WAIS-IV/p/100000392.html", description: "Forward span assesses auditory sequencing; backward/sequencing assesses working memory." },

  // === CUTANEOUS-KINESTHETIC (Tactile & Somatosensory) ===
  { name: "Tactile Form Recognition", acronym: "TFR", domains: ["Somatosensory"], ageRange: "5+", link: "https://www.parinc.com", description: "Evaluates stereognosis—identifying objects by touch alone (Parietal Lobe)." },
  { name: "Finger Localization Test", acronym: "FLT", domains: ["Somatosensory"], ageRange: "5+", link: "https://www.parinc.com", description: "Assesses ability to identify which finger is touched without visual cues." },

  // === VISUAL & VISUOSPATIAL ===
  { name: "Rey-Osterrieth Complex Figure Test", acronym: "ROCFT", domains: ["Visuospatial", "Memory"], ageRange: "6+", link: "https://www.parinc.com/Products/Pkey/315", description: "Assesses visuospatial construction ability and visual memory." },
  { name: "Hooper Visual Organization Test", acronym: "HVOT", domains: ["Visuospatial"], ageRange: "13+", link: "https://www.wpspublish.com/hvot", description: "Measures ability to integrate fragmented visual stimuli into a whole concept." },
  { name: "Judgment of Line Orientation", acronym: "JLO", domains: ["Visuospatial"], ageRange: "7+", link: "https://www.parinc.com/Products/Pkey/168", description: "Assesses spatial perception and orientation (Parietal-Occipital)." },
  { name: "Beery-Buktenica VMI", acronym: "Beery VMI", domains: ["Visuospatial", "Motor"], ageRange: "2+", link: "https://www.pearsonassessments.com", description: "Visual-motor integration test assessing coordination of visual perception and motor behavior." },

  // === SPEECH (Receptive & Expressive Language) ===
  { name: "Boston Naming Test", acronym: "BNT", domains: ["Language"], ageRange: "5+", link: "https://www.parinc.com/Products/Pkey/24", description: "Assesses confrontational naming ability (60-item visual naming)." },
  { name: "Controlled Oral Word Association Test", acronym: "COWAT/FAS", domains: ["Language", "Executive Functioning"], ageRange: "7+", link: "https://www.parinc.com", description: "Measures phonemic verbal fluency and expressive language retrieval." },
  { name: "Token Test", acronym: "TT", domains: ["Language"], ageRange: "6+", link: "https://www.parinc.com", description: "Assesses auditory comprehension of commands of increasing complexity." },

  // === WRITING ===
  { name: "WRAT-5 Spelling", acronym: "WRAT-5 Spell", domains: ["Written Expression"], ageRange: "5+", link: "https://www.pearsonassessments.com/store/usassessments/en/Store/Professional-Assessments/Academic-Learning/Wide-Range-Achievement-Test-%7C-Fifth-Edition/p/100001954.html", description: "Measures encoding of sounds into written symbols." },
  { name: "WIAT-4 Written Expression", acronym: "WIAT-4 WE", domains: ["Written Expression"], ageRange: "4+", link: "https://www.pearsonassessments.com", description: "Assesses generation of written sentences and essays." },

  // === READING ===
  { name: "WRAT-5 Word Reading", acronym: "WRAT-5 WR", domains: ["Reading"], ageRange: "5+", link: "https://www.pearsonassessments.com", description: "Measures letter and word decoding." },
  { name: "Nelson-Denny Reading Test", acronym: "NDRT", domains: ["Reading"], ageRange: "15+", link: "https://www.hmhco.com", description: "Measures reading comprehension and speed." },

  // === ARITHMETIC ===
  { name: "WAIS-IV Arithmetic", acronym: "WAIS-IV Arith", domains: ["Calculation", "Attention"], ageRange: "16+", link: "https://www.pearsonassessments.com", description: "Assesses mental math and working memory under timed conditions." },
  { name: "WRAT-5 Math Computation", acronym: "WRAT-5 Math", domains: ["Calculation"], ageRange: "5+", link: "https://www.pearsonassessments.com", description: "Measures written calculation skills." },

  // === MNESTIC PROCESSES (Memory) ===
  { name: "California Verbal Learning Test", acronym: "CVLT-3", domains: ["Memory", "Cognitive / Neurological"], ageRange: "16+", link: "https://www.pearsonassessments.com", description: "Assesses verbal learning, recall strategies, and recognition over trials." },
  { name: "WMS-IV Logical Memory", acronym: "WMS-IV LM", domains: ["Memory", "Cognitive / Neurological"], ageRange: "16+", link: "https://www.pearsonassessments.com", description: "Measures narrative/story memory (immediate and delayed recall)." },
  { name: "Brief Visuospatial Memory Test-Revised", acronym: "BVMT-R", domains: ["Memory", "Visuospatial"], ageRange: "18+", link: "https://www.parinc.com/Products/Pkey/29", description: "Assesses visual learning and memory for geometric figures." },

  // === INTELLECTUAL PROCESSES (Executive / Complex Cognition) ===
  { name: "Wisconsin Card Sorting Test", acronym: "WCST", domains: ["Executive Functioning"], ageRange: "6+", link: "https://www.parinc.com/Products/Pkey/402", description: "Measures abstract reasoning, set-shifting, cognitive flexibility, and perseveration." },
  { name: "WAIS-IV Matrix Reasoning", acronym: "WAIS-IV MR", domains: ["Executive Functioning", "Cognitive / Neurological"], ageRange: "16+", link: "https://www.pearsonassessments.com", description: "Assesses non-verbal fluid intelligence and pattern completion." },
  { name: "Trail Making Test", acronym: "TMT A/B", domains: ["Attention", "Executive Functioning"], ageRange: "9+", link: "https://www.parinc.com", description: "Part A: psychomotor speed. Part B: set-shifting and executive control." },
  { name: "Stroop Color-Word Test", acronym: "Stroop", domains: ["Executive Functioning", "Attention"], ageRange: "5+", link: "https://www.stoeltingco.com", description: "Measures selective attention, cognitive flexibility, and inhibition." },
  { name: "D-KEFS Tower Test", acronym: "D-KEFS Tower", domains: ["Executive Functioning"], ageRange: "8+", link: "https://www.pearsonassessments.com", description: "Assesses spatial planning, rule learning, and inhibition of impulsive responding." },
  { name: "D-KEFS Color-Word Interference", acronym: "D-KEFS CWI", domains: ["Executive Functioning", "Attention"], ageRange: "8+", link: "https://www.pearsonassessments.com", description: "Measures inhibition, cognitive flexibility, and processing speed." },
  { name: "D-KEFS Trail Making", acronym: "D-KEFS TMT", domains: ["Attention", "Executive Functioning", "Motor"], ageRange: "8+", link: "https://www.pearsonassessments.com", description: "Comprehensive trail making with motor speed, visual scanning, sequencing, and shifting conditions." },
  { name: "D-KEFS Verbal Fluency", acronym: "D-KEFS VF", domains: ["Language", "Executive Functioning"], ageRange: "8+", link: "https://www.pearsonassessments.com", description: "Measures letter fluency, category fluency, and category switching." },

  // === ATTENTION ===
  { name: "A Quick Test of Cognitive Speed", acronym: "AQT", domains: ["Attention", "Language", "Executive Functioning"], ageRange: "18+", link: "https://aqt.dk/", description: "Rapid color/form naming measuring processing speed." },
  { name: "CPT-3 Continuous Performance Test", acronym: "CPT-3", domains: ["Attention"], ageRange: "8+", link: "https://www.pearsonassessments.com", description: "Computer-based sustained attention and vigilance measure." },

  // === BEHAVIORAL / ADAPTIVE ===
  { name: "ABAS-3 Adaptive Behavior Assessment System", acronym: "ABAS-3", domains: ["Behavioral / Adaptive"], ageRange: "0+", link: "https://www.wpspublish.com/abas-3", description: "Multi-informant rating of functional adaptive skills across the lifespan." },
  { name: "Achenbach System (ASEBA)", acronym: "ASEBA", domains: ["Social-Emotional", "Behavioral / Adaptive"], ageRange: "2+", link: "https://www.nzcer.org.nz/pts/aseba-cbcl", description: "Multi-informant rating scales (CBCL, YSR, etc.)." },

  // === ADHD-SPECIFIC ===
  { name: "ADHD Rating Scale-5", acronym: "ADHD-RS-5", domains: ["Attention", "Executive Functioning"], ageRange: "5+", link: "https://www.guilford.com", description: "Standardized symptom rating for ADHD." },

  // === PERSONALITY / SOCIAL-EMOTIONAL ===
  { name: "PAI Personality Assessment Inventory", acronym: "PAI", domains: ["Personality", "Social-Emotional"], ageRange: "18+", link: "https://www.parinc.com/Products/Pkey/259", description: "Comprehensive personality and psychopathology assessment." },
  { name: "MMPI-3", acronym: "MMPI-3", domains: ["Personality", "Social-Emotional"], ageRange: "18+", link: "https://www.pearsonassessments.com", description: "Comprehensive self-report measure of psychopathology and personality." },

  // === EFFORT / VALIDITY ===
  { name: "Test of Memory Malingering", acronym: "TOMM", domains: ["Effort Validity"], ageRange: "16+", link: "https://www.pearsonassessments.com", description: "Forced-choice recognition test to detect suboptimal effort in memory testing." },

  // === COMPREHENSIVE BATTERIES ===
  { name: "WAIS-IV Full Scale", acronym: "WAIS-IV", domains: ["Cognitive / Neurological", "Executive Functioning", "Attention"], ageRange: "16+", link: "https://www.pearsonassessments.com", description: "Comprehensive measure of adult intelligence (VCI, PRI, WMI, PSI)." },
  { name: "WISC-V Full Scale", acronym: "WISC-V", domains: ["Cognitive / Neurological", "Executive Functioning", "Attention"], ageRange: "6+", link: "https://www.pearsonassessments.com", description: "Comprehensive measure of child intelligence." },
  { name: "RBANS Repeatable Battery", acronym: "RBANS", domains: ["Cognitive / Neurological", "Memory", "Attention", "Language", "Visuospatial"], ageRange: "12+", link: "https://www.pearsonassessments.com", description: "Brief cognitive screening covering immediate memory, visuospatial, language, attention, and delayed memory." },
  { name: "Woodcock-Johnson IV Tests of Achievement", acronym: "WJ-IV Ach", domains: ["Reading", "Written Expression", "Calculation"], ageRange: "2+", link: "https://www.hmhco.com", description: "Comprehensive academic achievement battery." },
  { name: "Woodcock-Johnson IV Tests of Cognitive Abilities", acronym: "WJ-IV Cog", domains: ["Cognitive / Neurological", "Executive Functioning"], ageRange: "2+", link: "https://www.hmhco.com", description: "Comprehensive cognitive abilities battery." }
];

window.TESTS = TESTS;

# Neuropsych Dashboard & Hybrid Machine Implementation Plan

**Goal**: Build a premium local web application that combines symbolic neuropsychological rules (extracted from your Excel sheets) with Metal‑accelerated LLM inference to generate progress notes and full reports.

## Architecture
- **Frontend**: HTML/CSS/Vanilla JS (glass‑morphism UI). Lives in `Dashboard/`.
- **Backend**: Lightweight Node/Express server (`Dashboard/server/`) exposing:
  - `/api/infer` → local LLM (Ollama/LM Studio) for semantic analysis & report generation.
  - `/api/rules` → symbolic rule engine (`server/rules.js`).
  - `/api/search` → vector‑search over test‑manual excerpts (FAISS).
- **Data**: `data.js` contains test catalog and domain mappings.
- **Resources**: Plain‑text excerpts of test manuals in `Dashboard/resources/` for vector embeddings.

## Steps to Run
1. **Install Ollama** and pull a Metal‑enabled model (e.g., `llama3.2:8b`).
2. `cd Dashboard/server && npm install && node index.js` (starts server on port 3001).
3. Open `Dashboard/index.html` in a browser.
4. Fill intake form, paste notes, click **Analyze & Recommend**.
   - Detected domains are shown.
   - Recommended tests appear.
   - A concise **progress note** and a **full report** are generated via the LLM.
5. Optionally edit the generated text and export as DOCX/PDF.

## Extending to All Domains
| Domain | Example Tests | Keyword Triggers |
|--------|---------------|------------------|
| Motor Functions | Grooved Pegboard, Finger Tapping | "motor speed", "praxis", "fine dexterity" |
| Acoustico‑Motor | Seashore Rhythm, Digit Span (forward) | "rhythm discrimination", "auditory sequencing" |
| Cutaneous‑Kinesthetic | Tactile Form Recognition, Finger Localization | "stereognosis", "tactile perception" |
| Visual & Visuospatial | ROCFT, HVOT | "visual construction", "spatial orientation" |
| Speech | BNT, COWAT | "naming", "verbal fluency" |
| Writing | WRAT‑5 Spelling, WIAT‑4 Written Expression | "written expression", "dictation" |
| Reading | WRAT‑5 Word Reading, Nelson‑Denny | "reading speed", "comprehension" |
| Arithmetic | WAIS‑IV Arithmetic, WRAT‑5 Math | "mental calculation", "working memory" |
| Mnestic Processes | CVLT‑II, WMS‑IV Logical Memory | "verbal learning", "episodic memory" |
| Intellectual Processes | WCST, WAIS‑IV Matrix Reasoning | "executive control", "abstract reasoning" |

The **`applyRules`** function in `server/rules.js` maps these domains to test‑domains and filters by age.

## Future Enhancements
- Add an **export button** (DOCX via `docx` library, PDF via `jsPDF`).
- Integrate a **human‑in‑the‑loop editor** before finalizing reports.
- Store completed reports in a local encrypted SQLite DB for audit.
- Provide a **settings panel** to select different LLM models or temperature.

---
*All code lives under the `Dashboard/` folder, keeping the project self‑contained and privacy‑first.*

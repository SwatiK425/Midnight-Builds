# DLP Guardrail UX Page Implementation Plan (Final)

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Deploy "Guard the Vault" — an attacker-perspective game page at `midnightbuilds.fyi/guardrail.html` where users craft prompts to breach a vault door guarded by the 4-layer DLP guardrail. Binary verdict: BREACHED (vault opens, gold jewels) vs REJECTED (shield flash, vault holds).

**Architecture:** Static HTML/CSS/JS (ES modules) mirroring Midnight Builds design system. Calls deployed Gradio API (`https://midnightbuilds.fyi/gradio` or HF Space) via fetch for real guardrail analysis. Session-scoped BYOK key attachment.

**Tech Stack:** Vanilla HTML/CSS/JS, Midnight Builds tokens (`assets/styles.css`), Gradio Client JS or direct `/api/predict` fetch, deployed as `guardrail.html` alongside `index.html`.

---

## Task 1: Update Plan with Final Design

**Objective:** Lock in the attacker-perspective design from mockup.

**Files:**
- Modify: `C:/Users/swati/Downloads/SwatiK425/Midnight Builds/.hermes/plans/2026-09-30_143000-dlp-guardrail-ux-page.md` (this file)

**Key Design Decisions (from approved mockup):**
- **Perspective:** User = Attacker ("You are the attacker. The vault holds your data. Try to breach it.")
- **Centerpiece:** Heavy steel vault door (320×500 SVG) with combination lock, bolts, handle
- **Binary Verdicts:** BREACHED 💎 (gold, vault swings 110°, gold particles, interior revealed) vs REJECTED 🛡️ (red, shield flash, scan lines, violent shake)
- **Layer Indicators:** 5 animated dots (L0–L3 + LLM Judge) — Blue pulse → Green (pass) / Red (caught) / Gold (breached)
- **Arsenal:** 6 tagged attack templates (Jailbreak/Injection/Exfil/Benign) — not "examples"
- **Scoreboard:** Nav counters — Blocked vs Breached (session persistence)
- **LLM Key:** "Attach LLM Key" → "LLM Judge Active ✦" (gold), upgrades detection
- **Share:** "Share Breach" / "Try Another Attack" with formatted copy
- **Progressive Disclosure:** "How the vault works" expandable at bottom

---

## Task 2: Create Production HTML (guardrail.html)

**Objective:** Production-ready page with semantic HTML, Midnight Builds design tokens, no inline styles.

**Files:**
- Create: `C:/Users/swati/Downloads/SwatiK425/Midnight Builds/guardrail.html`
- Reference: `C:/Users/swati/Downloads/SwatiK425/Midnight Builds/index.html` (nav, footer structure)
- Reference: `C:/Users/swati/Downloads/SwatiK425/Midnight Builds/assets/styles.css` (design tokens)

**Structure:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Guard the Vault — Midnight Builds</title>
  <meta name="description" content="You are the attacker. Craft prompts to breach a vault guarded by a 4-layer intent-based DLP guardrail. Bring your own LLM key." />
  <link rel="stylesheet" href="assets/styles.css" />
  <link rel="stylesheet" href="assets/guardrail.css" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='%23000' stroke='%232997ff' stroke-width='2'/><circle cx='16' cy='16' r='5' fill='%232997ff'/></svg>" />
</head>
<body>
  <div class="vault-bg" aria-hidden="true"></div>
  
  <nav class="nav">
    <div class="nav__inner">
      <a class="brand" href="index.html">
        <svg class="brand__mark" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="none" stroke="#f5f5f7" stroke-width="2"/><circle cx="16" cy="16" r="5" fill="#2997ff"/></svg>
        Midnight Builds
      </a>
      <div class="nav__score" id="nav-score" hidden>
        <div class="stat stat--blocked" title="Attacks stopped">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="12" y1="9" x2="12" y2="15"/><line x1="9" y1="12" x2="15" y2="12"/></svg>
          <span class="stat__value" id="stat-blocked">0</span>
        </div>
        <div class="stat stat--breached" title="Breaches">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="9" x2="12" y2="15"/><line x1="9" y1="12" x2="15" y2="12"/></svg>
          <span class="stat__value" id="stat-breached">0</span>
        </div>
      </div>
    </div>
  </nav>

  <main class="game-stage">
    <header class="game-header">
      <h1 class="game-title">Guard the Vault</h1>
      <p class="game-subtitle">You are the <span class="role">attacker</span>. The vault holds your data. <span class="target">Try to breach it.</span></p>
    </header>

    <div class="vault-arena" id="vault-arena">
      <div id="vault-container" class="vault-state-locked">
        <!-- Vault SVG injected by JS module -->
      </div>
      <div id="result-banner" class="result-banner result-banner--locked" role="status" aria-live="polite">
        <span class="result-icon" id="result-icon">🔒</span>
        <span class="result-text" id="result-text">Vault Locked</span>
      </div>
      <div id="risk-meter" class="risk-meter" hidden>
        <div class="risk-bar"><div id="risk-fill" class="risk-fill"></div></div>
        <span class="risk-label" id="risk-label">—</span>
      </div>
      <div class="layer-indicators" id="layer-indicators" role="group" aria-label="Security layers" hidden>
        <!-- 5 dots injected by JS -->
      </div>
    </div>

    <div class="attack-zone" id="attack-zone">
      <div class="attack-label">
        <span class="attack-label__text">Your Attack Prompt</span>
        <span class="attack-label__hint" id="key-hint">No LLM key attached — heuristic layers only</span>
      </div>
      <div class="prompt-input-wrapper">
        <textarea id="prompt-input" placeholder="Craft your attack… jailbreak, injection, data theft, tool hijack" aria-label="Attack prompt" spellcheck="false"></textarea>
      </div>
      <div class="attack-actions">
        <button class="btn btn-launch" id="launch-btn" disabled><span class="btn-spinner" aria-hidden="true"></span><span class="btn-text">Launch Attack</span></button>
        <button class="btn btn-key" id="key-btn">Attach LLM Key</button>
      </div>
      <div class="arsenal" id="arsenal" role="list" aria-label="Attack templates"></div>
    </div>

    <details class="disclosure" id="disclosure">
      <summary>How the vault works</summary>
      <div class="disclosure-content">
        <h4>4 Layers + Your LLM Judge</h4>
        <ul>
          <li><strong>Layer 0</strong> — Decodes obfuscation (encoding, invisible chars, leetspeak, LaTeX)</li>
          <li><strong>Layer 1</strong> — Detects malicious intent combos (disclosure+retrieval, jailbreak+role, etc.)</li>
          <li><strong>Layer 2</strong> — Semantic similarity to known attack embeddings</li>
          <li><strong>Layer 3</strong> — deBERTa transformer classifier for prompt injection</li>
          <li><strong>LLM Judge</strong> — Your key (BYOK) verifies every non-confident case</li>
        </ul>
        <p style="margin-top:12px"><strong>Green dot</strong> = layer passed. <strong>Red dot</strong> = layer caught it. <strong>Gold dot</strong> = layer missed it (breach). <strong>Blue pulse</strong> = layer analyzing.</p>
      </div>
    </details>

    <div class="share-moment" id="share-moment" hidden>
      <button class="share-btn share-btn--primary" id="share-copy" data-text="">Share Breach</button>
      <button class="share-btn" id="share-again">Try Another Attack</button>
    </div>
  </main>

  <footer class="footer">
    <div class="wrap footer__inner">
      <p class="footer__copy">&copy; <span id="yr"></span> Midnight Builds. Built after dark.</p>
      <nav class="footer__nav">
        <a href="index.html">Home</a>
        <a href="projects.html">Projects</a>
        <a href="articles.html">Writing</a>
      </nav>
    </div>
  </footer>

  <div class="key-toast" id="key-toast" role="alert" aria-live="polite" hidden>
    <div class="key-toast__row">
      <span class="key-toast__text" id="key-toast-text"></span>
      <button class="key-toast__close" id="key-toast-close" aria-label="Dismiss">&times;</button>
    </div>
  </div>

  <script type="module" src="assets/guardrail.js"></script>
</body>
</html>
```

---

## Task 3: Create Guardrail CSS (assets/guardrail.css)

**Objective:** Extract all game-specific styles from mockup into dedicated CSS file using Midnight Builds tokens.

**Files:**
- Create: `C:/Users/swati/Downloads/SwatiK425/Midnight Builds/assets/guardrail.css`

**Content:** All `.vault-*`, `.game-*`, `.attack-*`, `.arsenal-*`, `.layer-*`, `.result-*`, `.risk-*`, `.key-toast`, `.share-moment`, `.disclosure` styles from mockup, using CSS variables from `styles.css` (`--bg`, `--surface`, `--text`, `--hair`, `--accent`, `--gold`, `--allow`, `--block`, `--font`, etc.)

---

## Task 4: Create Vault SVG Module (assets/vault-door.js)

**Objective:** ES module that generates the vault door SVG and controls state animations.

**Files:**
- Create: `C:/Users/swati/Downloads/SwatiK425/Midnight Builds/assets/vault-door.js`

**Exports:**
```javascript
export function createVaultSVG() { return `<svg>...</svg>`; }
export function setVaultState(container, state, riskScore) { ... }
export function animateLayerDots(dots, verdict, hasKey) { ... }
export function resetLayerDots(dots) { ... }
```

**States:** `locked`, `testing`, `breached`, `rejected`
**Animations:** CSS keyframes for vault-breathe, vault-swing, vault-reject, gold-pulse, gold-burst, shield-flash, scan-sweep, dot-pulse

---

## Task 5: Create Gradio API Client (assets/guardrail-api.js)

**Objective:** Typed fetch wrappers for Gradio `/api/predict` endpoints.

**Files:**
- Create: `C:/Users/swati/Downloads/SwatiK425/Midnight Builds/assets/guardrail-api.js`

**Configuration:**
```javascript
const GRADIO_URL = 'https://midnightbuilds.fyi/gradio'; // Confirm with user
// Or HF Space: 'https://huggingface.co/spaces/SwatiK425/DLP-Guardrail'
```

**Functions:**
```javascript
export async function attachKey(provider, apiKey, model) { ... }
export async function clearKey() { ... }
export async function analyzePrompt(prompt, sessionId) { ... }
// Returns: { verdict: 'BLOCKED'|'HIGH_RISK'|'MEDIUM_RISK'|'SAFE', risk_score, confidence, layers[], llm_status{} }
```

**Session Handling:** Generate `session_id` on first load, store in `localStorage`, send via `X-Session-Hash` header or cookie.

**Verdict Mapping:** Gradio returns `BLOCKED`/`HIGH_RISK`/`MEDIUM_RISK`/`SAFE` → Game maps to `rejected` (BLOCKED/HIGH_RISK) or `breached` (MEDIUM_RISK/SAFE with low confidence) — tunable.

---

## Task 6: Create Main Game Logic (assets/guardrail.js)

**Objective:** Wire UI, state machine, API calls, persistence, share.

**Files:**
- Create: `C:/Users/swati/Downloads/SwatiK425/Midnight Builds/assets/guardrail.js`

**State Machine:**
```
LOCKED → (input + launch) → TESTING (layers animate)
TESTING → (API response) → BREACHED | REJECTED
BREACHED/REJECTED → (share again) → LOCKED
```

**Event Handlers:**
- Arsenal click → fill prompt
- Launch click → validate → set TESTING → animate layers → call API → set verdict → update scoreboard
- Key click → toggle BYOK modal (provider dropdown, key input, model optional) → call attachKey/clearKey
- Share copy → clipboard + feedback
- Share again → reset to LOCKED
- Escape key → reset
- Enter in textarea → launch

**Persistence (localStorage):**
- `vault_stats` — { blocked, breached }
- `vault_session` — { sessionId, hasKey, provider, model }
- `vault_key` — masked key preview only (never full key)

---

## Task 7: Create BYOK Modal (assets/byok-modal.js)

**Objective:** Clean modal for attaching LLM key (provider, key, model).

**Files:**
- Create: `C:/Users/swati/Downloads/SwatiK425/Midnight Builds/assets/byok-modal.js`

**Features:**
- Provider dropdown (Google, Anthropic, OpenAI, OpenRouter, OpenCode Zen)
- Password input (masked)
- Model input (optional, placeholder shows default)
- Attach/Clear buttons
- Status display (masked key, rate limit)
- ESC to close, click backdrop to close
- Focus trap

---

## Task 8: Update Site Navigation

**Objective:** Add "Guardrail" link to all site pages.

**Files:**
- Modify: `C:/Users/swati/Downloads/SwatiK425/Midnight Builds/index.html` (nav__links)
- Modify: `C:/Users/swati/Downloads/SwatiK425/Midnight Builds/projects.html` (nav__links)
- Modify: `C:/Users/swati/Downloads/SwatiK425/Midnight Builds/articles.html` (nav__links)

**Add to each nav__links:**
```html
<a href="guardrail.html">Guardrail</a>
```

---

## Task 9: Deploy & Verify

**Objective:** Push to GitHub Pages, verify live.

**Commands:**
```bash
cd "C:/Users/swati/Downloads/SwatiK425/Midnight Builds"
git add .
git commit -m "feat: add Guard the Vault game page with live DLP guardrail demo"
git push origin main
```

**Verify:**
- `https://midnightbuilds.fyi/guardrail.html` loads
- Nav link works on all pages
- BYOK attaches key, shows masked status
- Launch attack calls Gradio API, returns real verdict
- Layer dots animate with real layer data
- Vault door animates correctly (BREACHED/REJECTED)
- Scoreboard persists across refreshes
- Share copies formatted text
- Mobile responsive (≤480px)
- prefers-reduced-motion respected

---

## Gradio Endpoint Configuration Needed

**Confirm with user:**
- Gradio deployed at `https://midnightbuilds.fyi/gradio`? Or separate HF Space URL?
- If HF Space: need CORS headers (`Access-Control-Allow-Origin: https://midnightbuilds.fyi`)
- API fn_index mapping: `attach_key`=0, `clear_key`=1, `analyze_individual`=2 (verify from deployed app)

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Gradio CORS blocks fetch | Ensure Gradio launched with `share=True` or proper CORS; fallback to proxy |
| Cold start latency | Show TESTING state immediately; add 10s timeout with fallback message |
| API key in browser | Never logged, never stored fully; only masked preview in localStorage |
| Verdict mapping accuracy | Tunable threshold; start conservative (BLOCKED/HIGH_RISK=reject, else breach) |
| Mobile animation performance | `will-change: transform` on door; particles use CSS only; test on low-end |

---

## Verification Checklist

- [ ] `guardrail.html` loads with correct Midnight Builds styling
- [ ] Nav link "Guardrail" appears on index, projects, articles
- [ ] Vault door SVG renders (locked state)
- [ ] Arsenal loads 6 tagged attack templates
- [ ] Prompt input validates, Launch enables
- [ ] BYOK modal opens, accepts key, calls API, shows masked status
- [ ] Launch attack → TESTING state → layers animate → API call → verdict
- [ ] BREACHED: vault swings open, gold particles, interior revealed, gold banner
- [ ] REJECTED: shield flash, scan lines, violent shake, red banner
- [ ] Layer dots show Green/Red/Gold per actual layer results
- [ ] Risk meter fills with actual risk_score
- [ ] Scoreboard updates & persists (localStorage)
- [ ] Share copies "I [breached/failed to breach] the vault with: 'prompt…' — VERDICT (Risk: X/100)"
- [ ] Escape/Share Again resets to LOCKED
- [ ] Mobile: door fits, arsenal scrolls, buttons stack
- [ ] prefers-reduced-motion disables all animations
- [ ] Deployed at `https://midnightbuilds.fyi/guardrail.html`

---

## Execution Handoff

**Plan complete.** Ready to execute using subagent-driven-development — dispatch subagent per task with two-stage review. Shall I proceed?
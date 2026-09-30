/**
 * Vault Door SVG Module
 * Generates the vault door SVG and controls state animations
 */

export function createVaultSVG() {
  return `<svg id="vault-svg" viewBox="0 0 320 500" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Vault door guarding data">
  <defs>
    <!-- Vault Frame - heavy steel -->
    <linearGradient id="frameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2a2a2d"/>
      <stop offset="30%" stop-color="#18181a"/>
      <stop offset="70%" stop-color="#18181a"/>
      <stop offset="100%" stop-color="#2a2a2d"/>
    </linearGradient>
    <!-- Vault Door - thick steel -->
    <linearGradient id="doorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#232326"/>
      <stop offset="50%" stop-color="#161618"/>
      <stop offset="100%" stop-color="#232326"/>
    </linearGradient>
    <!-- Metal bolts -->
    <linearGradient id="boltGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4a4a4e"/>
      <stop offset="50%" stop-color="#1a1a1c"/>
      <stop offset="100%" stop-color="#4a4a4e"/>
    </linearGradient>
    <!-- Handle -->
    <linearGradient id="handleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#5a5a5e"/>
      <stop offset="50%" stop-color="#2a2a2c"/>
      <stop offset="100%" stop-color="#5a5a5e"/>
    </linearGradient>
    <!-- Gold interior -->
    <radialGradient id="vaultGold" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffd700" stop-opacity="0.95"/>
      <stop offset="30%" stop-color="#ffb800" stop-opacity="0.6"/>
      <stop offset="60%" stop-color="#cc8800" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#996600" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vaultGoldAura" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffd700" stop-opacity="0.35"/>
      <stop offset="50%" stop-color="#ff8800" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#ff4400" stop-opacity="0"/>
    </radialGradient>
    <!-- Shield flash -->
    <radialGradient id="shieldFlash" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2997ff" stop-opacity="0.9"/>
      <stop offset="60%" stop-color="#2997ff" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#2997ff" stop-opacity="0"/>
    </radialGradient>
    <!-- Red reject -->
    <radialGradient id="rejectFlash" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff4444" stop-opacity="0.8"/>
      <stop offset="70%" stop-color="#ff4444" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#ff4444" stop-opacity="0"/>
    </radialGradient>
    <!-- Scan lines pattern -->
    <pattern id="scanLines" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="10" y2="0" stroke="#ff4444" stroke-width="1" opacity="0.6"/>
    </pattern>
  </defs>

  <!-- VAULT FRAME -->
  <rect x="20" y="20" width="280" height="460" rx="14" fill="url(#frameGrad)" stroke="#3a3a3d" stroke-width="3"/>

  <!-- Heavy bolts around frame -->
  <g fill="url(#boltGrad)" stroke="#3a3a3d" stroke-width="1">
    <circle cx="40" cy="40" r="12"/>
    <circle cx="280" cy="40" r="12"/>
    <circle cx="40" cy="440" r="12"/>
    <circle cx="280" cy="440" r="12"/>
    <circle cx="40" cy="240" r="10"/>
    <circle cx="280" cy="240" r="10"/>
  </g>

  <!-- VAULT DOOR (the moving part) -->
  <g class="vault-door" transform-origin="50 250">
    <!-- Door body -->
    <rect x="50" y="50" width="220" height="400" rx="8" fill="url(#doorGrad)" stroke="#3a3a3d" stroke-width="2"/>

    <!-- Door bolts -->
    <g fill="url(#boltGrad)" stroke="#3a3a3d" stroke-width="1">
      <circle cx="80" cy="80" r="10"/>
      <circle cx="260" cy="80" r="10"/>
      <circle cx="80" cy="410" r="10"/>
      <circle cx="260" cy="410" r="10"/>
    </g>

    <!-- Combination lock / dial -->
    <g class="combo-lock" transform="translate(160, 180)">
      <circle cx="0" cy="0" r="38" fill="#0d0d0d" stroke="#3a3a3d" stroke-width="2"/>
      <circle cx="0" cy="0" r="30" fill="none" stroke="#2a2a2c" stroke-width="1"/>
      <circle cx="0" cy="0" r="22" fill="none" stroke="#2a2a2c" stroke-width="1"/>
      <!-- Tick marks -->
      <g stroke="#3a3a3d" stroke-width="1.5" stroke-linecap="round">
        <line x1="0" y1="-28" x2="0" y2="-36"/>
        <line x1="0" y1="28" x2="0" y2="36" transform="rotate(180)"/>
        <line x1="0" y1="-28" x2="0" y2="-36" transform="rotate(90)"/>
        <line x1="0" y1="-28" x2="0" y2="-36" transform="rotate(-90)"/>
      </g>
      <!-- Dial indicator -->
      <path d="M0 -18 L0 -30" stroke="#ffd700" stroke-width="2.5" stroke-linecap="round" opacity="0.9"/>
    </g>

    <!-- Handle -->
    <g class="vault-handle" transform="translate(240, 250)">
      <rect x="-35" y="-6" width="42" height="12" rx="6" fill="url(#handleGrad)" stroke="#3a3a3d" stroke-width="1.5"/>
      <circle cx="-8" cy="0" r="3" fill="#1a1a1c"/>
    </g>

    <!-- Keyhole / card reader -->
    <g class="keyhole" transform="translate(160, 340)">
      <rect x="-18" y="-22" width="36" height="44" rx="4" fill="#080808" stroke="#2a2a2c" stroke-width="1.5"/>
      <rect x="-6" y="-10" width="12" height="20" rx="2" fill="#121212"/>
      <!-- LED indicator -->
      <circle class="led" cx="0" cy="-30" r="5" fill="#333" stroke="#1a1a1a" stroke-width="1"/>
    </g>

    <!-- Shield overlay (rejected state) -->
    <g class="vault-shield" transform="translate(160, 250)">
      <circle cx="0" cy="0" r="100" fill="url(#shieldFlash)" />
      <path d="M0 -50 Q-30 -20 0 10 Q30 -20 0 -50" fill="none" stroke="#2997ff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
      <path d="M-20 -10 Q0 10 20 -10" stroke="#2997ff" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
    </g>

    <!-- Red scan lines (rejected state) -->
    <g class="vault-scan-lines" transform="translate(160, 250)">
      <g stroke="#ff4444" stroke-width="1.5" stroke-dasharray="8 6" stroke-dashoffset="200" opacity="0.7">
        <line x1="-120" y1="-120" x2="120" y2="-120"/>
        <line x1="-120" y1="-80" x2="120" y2="-80"/>
        <line x1="-120" y1="-40" x2="120" y2="-40"/>
        <line x1="-120" y1="0" x2="120" y2="0"/>
        <line x1="-120" y1="40" x2="120" y2="40"/>
        <line x1="-120" y1="80" x2="120" y2="80"/>
        <line x1="-120" y1="120" x2="120" y2="120"/>
      </g>
    </g>
  </g>

  <!-- VAULT INTERIOR (revealed on breach) -->
  <g class="vault-interior" transform="translate(160, 250)">
    <!-- Gold glow -->
    <circle class="vault-gold-glow" cx="0" cy="0" r="160" fill="url(#vaultGoldAura)"/>
    <circle class="vault-gold-glow" cx="0" cy="0" r="80" fill="url(#vaultGold)"/>
    <!-- Data glyphs floating -->
    <g fill="var(--gold)" opacity="0.9">
      <text x="0" y="-40" text-anchor="middle" font-size="28" font-weight="700" font-family="var(--font)">💎</text>
      <text x="-50" y="20" text-anchor="middle" font-size="18" font-family="var(--font)">📊</text>
      <text x="50" y="20" text-anchor="middle" font-size="18" font-family="var(--font)">🔑</text>
      <text x="0" y="70" text-anchor="middle" font-size="16" font-family="var(--font)">PII • Keys • Prompts</text>
    </g>
    <!-- Gold particles -->
    <g class="vault-gold-particles">
      <circle class="vault-gold-particle" cx="0" cy="0" r="4" style="--tx: -140px; --ty: -80px; animation-delay: 0.05s;"/>
      <circle class="vault-gold-particle" cx="0" cy="0" r="3" style="--tx: 140px; --ty: -70px; animation-delay: 0.1s;"/>
      <circle class="vault-gold-particle" cx="0" cy="0" r="4" style="--tx: -100px; --ty: 110px; animation-delay: 0.15s;"/>
      <circle class="vault-gold-particle" cx="0" cy="0" r="3" style="--tx: 110px; --ty: 100px; animation-delay: 0.2s;"/>
      <circle class="vault-gold-particle" cx="0" cy="0" r="3" style="--tx: -150px; --ty: 10px; animation-delay: 0.25s;"/>
      <circle class="vault-gold-particle" cx="0" cy="0" r="3" style="--tx: 150px; --ty: -10px; animation-delay: 0.3s;"/>
      <circle class="vault-gold-particle" cx="0" cy="0" r="4" style="--tx: 15px; --ty: -160px; animation-delay: 0.35s;"/>
      <circle class="vault-gold-particle" cx="0" cy="0" r="3" style="--tx: -20px; --ty: 160px; animation-delay: 0.4s;"/>
      <circle class="vault-gold-particle" cx="0" cy="0" r="3" style="--tx: -80px; --ty: -130px; animation-delay: 0.45s;"/>
      <circle class="vault-gold-particle" cx="0" cy="0" r="3" style="--tx: 90px; --ty: -120px; animation-delay: 0.5s;"/>
      <circle class="vault-gold-particle" cx="0" cy="0" r="3" style="--tx: -60px; --ty: 140px; animation-delay: 0.55s;"/>
      <circle class="vault-gold-particle" cx="0" cy="0" r="3" style="--tx: 70px; --ty: 130px; animation-delay: 0.6s;"/>
    </g>
  </g>

  <!-- Floor shadow -->
  <ellipse cx="160" cy="495" rx="130" ry="12" fill="#000" opacity="0.3"/>
</svg>`;
}

export function setVaultState(container, state, riskScore = null) {
  container.className = `vault-state-${state}`;
  
  // Update result banner (handled by main game logic)
  // This function only controls the vault container state
}

export function animateLayerDots(dots, verdict, hasKey) {
  // dots is a NodeList of .layer-dot elements
  // verdict: 'breached' | 'rejected'
  // hasKey: boolean
  
  const layers = [0, 1, 2, 3, 4]; // 0=obfuscation, 1=behavioral, 2=semantic, 3=transformer, 4=LLM
  const delays = [100, 300, 500, 700, 900];
  
  layers.forEach((layer, i) => {
    const dot = dots[layer];
    if (!dot) return;
    
    setTimeout(() => {
      dot.classList.add('active');
    }, delays[i]);
    
    setTimeout(() => {
      dot.classList.remove('active');
      
      if (verdict === 'breached') {
        // For breach: some layers pass (green), some fail (gold = missed)
        // Layer 4 (LLM Judge) only passes if hasKey
        const passChance = hasKey ? 0.7 : 0.4;
        if (Math.random() < passChance || layer === 4) {
          dot.classList.add('passed');
        } else {
          dot.classList.add('breached');
        }
      } else {
        // For reject: most layers catch it (red), maybe one passes
        if (layer < 3 || (layer === 4 && hasKey)) {
          dot.classList.add('failed');
        } else {
          dot.classList.add('passed');
        }
      }
    }, delays[i] + 400);
  });
}

export function resetLayerDots(dots) {
  setTimeout(() => {
    dots.forEach(dot => {
      dot.className = 'layer-dot';
    });
  }, 800);
}

// Real layer animation based on actual API results
export function animateLayerDotsReal(dots, layerResults, hasKey) {
  // layerResults: array of { name, risk, verdict } from API
  // Maps to layers 0-3, plus layer 4 for LLM Judge
  
  const delays = [100, 300, 500, 700, 900];
  
  layerResults.forEach((layer, i) => {
    const dot = dots[i];
    if (!dot) return;
    
    setTimeout(() => {
      dot.classList.add('active');
    }, delays[i]);
    
    setTimeout(() => {
      dot.classList.remove('active');
      
      // Map API verdict to visual state
      // layer.verdict: 'PASS' | 'FAIL' | 'BREACHED' | 'SKIPPED'
      switch (layer.verdict) {
        case 'PASS':
        case 'SAFE':
          dot.classList.add('passed');
          break;
        case 'FAIL':
        case 'BLOCKED':
        case 'HIGH_RISK':
          dot.classList.add('failed');
          break;
        case 'BREACHED':
        case 'MEDIUM_RISK':
        case 'LOW_RISK':
          dot.classList.add('breached');
          break;
        case 'SKIPPED':
          dot.classList.add('passed'); // skipped = passed
          break;
        default:
          // Default based on risk score
          if (layer.risk >= 80) {
            dot.classList.add('failed');
          } else if (layer.risk >= 40) {
            dot.classList.add('breached');
          } else {
            dot.classList.add('passed');
          }
      }
    }, delays[i] + 400);
  });
  
  // LLM Judge dot (index 4)
  const llmDot = dots[4];
  if (llmDot) {
    setTimeout(() => {
      llmDot.classList.add('active');
    }, delays[4]);
    
    setTimeout(() => {
      llmDot.classList.remove('active');
      if (hasKey) {
        llmDot.classList.add('passed'); // LLM Judge active = extra protection
      } else {
        llmDot.classList.add('passed'); // Not active but not a failure
      }
    }, delays[4] + 400);
  }
}
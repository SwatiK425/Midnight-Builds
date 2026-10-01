/**
 * Gradio API Client for DLP Guardrail
 * Uses Gradio's native API format with robust parsing
 * Automatically adapts to guardrail output changes
 */

// ===== CONFIGURATION =====
// UPDATE THIS TO YOUR DEPLOYED GRADIO URL
// Must be publicly accessible (HF Space with public visibility, or other host)
const GRADIO_URL = 'https://praxis.midnightbuilds.fyi/gradio'; // Oracle VM via Caddy

// Fn index mapping - from Gradio config
const FN_INDEX = {
  ATTACH_KEY: 0,
  CLEAR_KEY: 1,
  ANALYZE_INDIVIDUAL: 3,
  ANALYZE_CSV: 4
};

// ===== SESSION MANAGEMENT =====
let sessionId = null;

function getSessionId() {
  if (!sessionId) {
    sessionId = localStorage.getItem('vault_session_id') || crypto.randomUUID();
    localStorage.setItem('vault_session_id', sessionId);
  }
  return sessionId;
}

function getStoredGuardrail() {
  const stored = localStorage.getItem('vault_session_guardrail');
  if (stored) {
    try { return JSON.parse(stored); } catch { return null; }
  }
  return null;
}

function setStoredGuardrail(data) {
  localStorage.setItem('vault_session_guardrail', JSON.stringify(data));
}

function clearStoredGuardrail() {
  localStorage.removeItem('vault_session_guardrail');
}

// ===== CORE FETCH =====
async function callGradio(fnIndex, data) {
  const payload = {
    fn_index: fnIndex,
    data: data,
    session_hash: getSessionId()
  };
  
  const response = await fetch(`${GRADIO_URL}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const err = await response.text().catch(() => '');
    throw new Error(`Gradio API ${response.status}: ${err || response.statusText}`);
  }
  
  return response.json();
}

// ===== PUBLIC API =====

/**
 * Attach LLM key to session
 */
export async function attachKey(provider, apiKey, model) {
  try {
    const result = await callGradio(FN_INDEX.ATTACH_KEY, [provider, apiKey || '', model || '']);
    
    // Gradio returns: { data: [htmlStatus, guardrailSessionData] }
    const html = result.data?.[0] || '';
    const sessionData = result.data?.[1];
    
    if (sessionData) setStoredGuardrail(sessionData);
    
    const success = html.includes('✅') || html.includes('LLM judge attached') || html.includes('Attached');
    
    return { 
      success, 
      html, 
      provider: extractProvider(html) || provider,
      model: extractModel(html) || model
    };
  } catch (error) {
    return { success: false, html: `Connection failed: ${error.message}`, error: error.message };
  }
}

/**
 * Clear LLM key from session
 */
export async function clearKey() {
  try {
    const result = await callGradio(FN_INDEX.CLEAR_KEY, []);
    clearStoredGuardrail();
    return { success: true, html: result.data?.[0] || '' };
  } catch (error) {
    return { success: false, html: `Failed to clear: ${error.message}`, error: error.message };
  }
}

/**
 * Analyze a prompt - returns structured data
 */
export async function analyzePrompt(prompt) {
  try {
    const result = await callGradio(FN_INDEX.ANALYZE_INDIVIDUAL, [prompt]);
    
    // Gradio returns tuple: [verdictHtml, detailsHtml, layersHtml, llmHtml]
    const [verdictHtml, detailsHtml, layersHtml, llmHtml] = result.data || [];
    
    // Parse all components robustly
    const parsed = parseGradioResponse(verdictHtml, detailsHtml, layersHtml, llmHtml);
    
    return parsed;
  } catch (error) {
    throw new Error(`Analysis failed: ${error.message}`);
  }
}

/**
 * Parse Gradio response into structured data
 * This is the single point that handles guardrail output format
 */
function parseGradioResponse(verdictHtml, detailsHtml, layersHtml, llmHtml) {
  // Parse verdict & risk from verdict HTML
  const verdictInfo = parseVerdictHtml(verdictHtml);
  
  // Parse layers from layers HTML
  const layers = parseLayersHtml(layersHtml);
  
  // Parse LLM status from LLM HTML
  const llmStatus = parseLlmHtml(llmHtml);
  
  // Parse LLM reasoning
  const llmReasoning = extractLlmReasoning(llmHtml);
  
  // Parse full details JSON if available
  const details = parseDetailsJson(detailsHtml);
  
  return {
    verdict: verdictInfo.verdict,
    risk_score: verdictInfo.riskScore,
    confidence: verdictInfo.confidence,
    latency: verdictInfo.latency,
    layers,
    llm_status: llmStatus,
    llm_reasoning: llmReasoning,
    details,
    raw: { verdictHtml, detailsHtml, layersHtml, llmHtml }
  };
}

/**
 * Parse verdict HTML - handles multiple formats
 */
function parseVerdictHtml(html) {
  const result = { verdict: 'UNKNOWN', riskScore: 0, confidence: 'UNKNOWN', latency: 0 };
  
  if (!html) return result;
  
  // Try multiple patterns for verdict
  const verdictPatterns = [
    /<h2[^>]*>([^<]+)<\/h2>/i,
    /<h3[^>]*>([^<]+)<\/h3>/i,
    /verdict["\s:]+([A-Z_]+)/i,
    /class="verdict[^"]*"[^>]*>([^<]+)</i
  ];
  
  for (const pattern of verdictPatterns) {
    const match = html.match(pattern);
    if (match) {
      result.verdict = normalizeVerdict(match[1]);
      break;
    }
  }
  
  // Risk score patterns
  const riskPatterns = [
    /Risk Score:\s*<b>(\d+)<\/b>/i,
    /risk[_\s]?score["\s:]+(\d+)/i,
    /Risk:\s*(\d+)/i
  ];
  for (const pattern of riskPatterns) {
    const match = html.match(pattern);
    if (match) { result.riskScore = parseInt(match[1], 10); break; }
  }
  
  // Confidence
  const confMatch = html.match(/Confidence:\s*([^|<]+)/i);
  if (confMatch) result.confidence = confMatch[1].trim();
  
  // Latency
  const latMatch = html.match(/Latency:\s*([\d.]+)\s*ms/i);
  if (latMatch) result.latency = parseFloat(latMatch[1]);
  
  return result;
}

/**
 * Parse layers HTML into structured array
 */
function parseLayersHtml(html) {
  const layers = [];
  if (!html) return layers;
  
  // Pattern 1: <b>Layer Name</b>: 85/100
  const pattern1 = /<b>([^<]+)<\/b>:\s*(\d+)\/100/gi;
  let match;
  while ((match = pattern1.exec(html)) !== null) {
    const name = match[1].trim();
    const risk = parseInt(match[2], 10);
    layers.push({ name, risk, verdict: riskToVerdict(risk) });
  }
  
  // Pattern 2: data-layer="0" risk="85"
  if (layers.length === 0) {
    const pattern2 = /data-layer=["']?(\d+)["']?[^>]*risk=["']?(\d+)["']?/gi;
    while ((match = pattern2.exec(html)) !== null) {
      layers.push({ 
        name: `Layer ${match[1]}`, 
        risk: parseInt(match[2], 10), 
        verdict: riskToVerdict(parseInt(match[2], 10)) 
      });
    }
  }
  
  // Pattern 3: JSON embedded in HTML
  if (layers.length === 0) {
    const jsonMatch = html.match(/<pre[^>]*>({[\s\S]*?})<\/pre>/i);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        if (data.layers && Array.isArray(data.layers)) {
          return data.layers.map(l => ({
            name: l.name || 'Layer',
            risk: l.risk || 0,
            verdict: riskToVerdict(l.risk || 0)
          }));
        }
      } catch {}
    }
  }
  
  return layers;
}

/**
 * Parse LLM status HTML
 */
function parseLlmHtml(html) {
  if (!html) return { available: false, used: false, reason: '', rate_limit: null };
  
  const available = /Available:<\/b>\s*✅\s*Yes/i.test(html) || /available["\s:]+true/i.test(html);
  const used = /Used:<\/b>\s*✅\s*Yes/i.test(html) || /used["\s:]+true/i.test(html);
  
  const reasonMatch = html.match(/Reason:<\/b>\s*([^<]+)/i) || html.match(/reason["\s:]+([^",}]+)/i);
  const reason = reasonMatch ? reasonMatch[1].trim() : '';
  
  let rateLimit = null;
  const rateMatch = html.match(/Rate Limit:<\/b>\s*(\d+)\/(\d+)\s*used\s*\((\d+)\s*remaining\)/i);
  if (rateMatch) {
    rateLimit = { used: +rateMatch[1], limit: +rateMatch[2], remaining: +rateMatch[3] };
  }
  
  return { available, used, reason, rate_limit: rateLimit };
}

/**
 * Extract LLM reasoning from HTML
 */
function extractLlmReasoning(html) {
  if (!html) return undefined;
  
  const patterns = [
    /LLM Reasoning:<\/b><br>\s*<small>([^<]+)<\/small>/i,
    /reasoning["\s:]+([^",}]+)/i,
    /<div[^>]*reasoning[^>]*>([^<]+)</i
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1].trim();
  }
  return undefined;
}

/**
 * Parse details JSON from HTML
 */
function parseDetailsJson(html) {
  if (!html) return null;
  
  const jsonMatch = html.match(/<pre[^>]*>({[\s\S]*?})<\/pre>/i);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[1]); } catch {}
  }
  return null;
}

/**
 * Normalize verdict string to standard enum
 */
function normalizeVerdict(v) {
  const verdict = v.toUpperCase().replace(/[🚫⚠️⚡✅\s🔴🟡🟢]/g, '');
  if (verdict.includes('BLOCKED') || verdict.includes('BLOCK') || verdict.includes('MALICIOUS') || verdict.includes('ATTACK')) return 'BLOCKED';
  if (verdict.includes('HIGH_RISK') || verdict.includes('HIGHRISK') || verdict === 'HIGH') return 'HIGH_RISK';
  if (verdict.includes('MEDIUM_RISK') || verdict.includes('MEDIUMRISK') || verdict === 'MEDIUM' || verdict.includes('UNCERTAIN')) return 'MEDIUM_RISK';
  if (verdict.includes('SAFE') || verdict.includes('BENIGN') || verdict === 'OK') return 'SAFE';
  return 'UNKNOWN';
}

function riskToVerdict(risk) {
  if (risk >= 80) return 'BLOCKED';
  if (risk >= 60) return 'HIGH_RISK';
  if (risk >= 40) return 'MEDIUM_RISK';
  return 'SAFE';
}

function extractProvider(html) {
  const match = html.match(/provider=<b>([^<]+)<\/b>/i) || html.match(/provider["\s:]+([^",<}]+)/i);
  return match ? match[1].trim() : null;
}

function extractModel(html) {
  const match = html.match(/model=<b>([^<]+)<\/b>/i) || html.match(/model["\s:]+([^",<}]+)/i);
  return match ? match[1].trim() : null;
}

/**
 * Map guardrail verdict to game verdict
 * Configurable threshold - adjust without code changes
 */
export function mapVerdictToGame(verdict, riskScore, llmStatus) {
  // Thresholds can be tuned via config
  const THRESHOLDS = {
    BLOCKED: 'rejected',
    HIGH_RISK: 'rejected',
    MEDIUM_RISK: 'breached',
    SAFE: 'breached'
  };
  
  // Override: if LLM was used and explicitly said SAFE, trust it
  if (llmStatus?.used && verdict === 'SAFE') return 'breached';
  // Override: if LLM was used and said BLOCKED, trust it
  if (llmStatus?.used && (verdict === 'BLOCKED' || verdict === 'HIGH_RISK')) return 'rejected';
  
  return THRESHOLDS[verdict] || (riskScore >= 60 ? 'rejected' : 'breached');
}

/**
 * Check if session has valid key
 */
export function hasValidKey() {
  const guardrail = getStoredGuardrail();
  return guardrail && guardrail.llm_judge && guardrail.api_key;
}

/**
 * Get stored key info for UI
 */
export function getKeyInfo() {
  const guardrail = getStoredGuardrail();
  if (!guardrail || !guardrail.llm_judge) return null;
  
  const judge = guardrail.llm_judge;
  return {
    provider: judge.provider,
    model: judge.model,
    maskedKey: maskKey(judge.api_key),
    rateLimit: judge.rate_limit_status || judge.rateLimit || {}
  };
}

function maskKey(key) {
  if (!key) return '';
  if (key.length <= 8) return '****';
  return key.slice(0, 4) + '…' + key.slice(-4);
}

/**
 * Test connection
 */
export async function testConnection() {
  try {
    await analyzePrompt('health check');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Auto-discover fn_index mapping from Gradio config
 * Call this on init to handle deployed app changes
 */
export async function discoverApiSchema() {
  try {
    const response = await fetch(`${GRADIO_URL}/config`);
    if (!response.ok) return null;
    const config = await response.json();
    
    // Map function names to indices
    const dependencies = config.dependencies || [];
    const fnMap = {};
    dependencies.forEach((dep, idx) => {
      const name = dep.name || dep.fn_name || '';
      if (name.includes('attach') || name.includes('key')) fnMap.ATTACH_KEY = idx;
      else if (name.includes('clear')) fnMap.CLEAR_KEY = idx;
      else if (name.includes('analyze') && name.includes('individual')) fnMap.ANALYZE_INDIVIDUAL = idx;
      else if (name.includes('analyze') && name.includes('csv')) fnMap.ANALYZE_CSV = idx;
    });
    
    if (Object.keys(fnMap).length > 0) {
      Object.assign(FN_INDEX, fnMap);
      console.log('Auto-discovered API schema:', FN_INDEX);
    }
    return FN_INDEX;
  } catch (error) {
    console.warn('Could not auto-discover API schema:', error.message);
    return FN_INDEX;
  }
}
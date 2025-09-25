// Groq provider wrapper for chat completions (OpenAI-compatible)
const GROQ_API_URL = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1';
const GROQ_MODEL = process.env.LLM_MODEL || process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
const GROQ_TIMEOUT_MS = parseInt(process.env.GROQ_TIMEOUT_MS || '25000');

// Lightweight concurrency gate to avoid burst 429s
let inflight = 0;
const MAX_CONCURRENCY = parseInt(process.env.GROQ_MAX_CONCURRENCY || '2');
function wait(ms){ return new Promise(r=>setTimeout(r, ms)); }
async function gate(){
  while (inflight >= MAX_CONCURRENCY) { await wait(100); }
  inflight++;
  return () => { inflight = Math.max(0, inflight-1); };
}

export async function groqChat({ system, messages = [], temperature = 0.6, max_tokens = 180 }) {
  const apiKey = process.env.GROQ_API_KEY || '';
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  const body = {
    model: GROQ_MODEL,
    temperature,
    max_tokens,
    messages: [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...messages
    ]
  };

  const release = await gate();
  try {
    let attempt = 0;
    const maxAttempts = 4;
    let lastErr;
    while (attempt < maxAttempts) {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), GROQ_TIMEOUT_MS);
        const resp = await fetch(`${GROQ_API_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body),
          signal: ctrl.signal
        });
        clearTimeout(t);
        if (resp.status === 429) {
          const text = await resp.text().catch(()=> '');
          // Try to parse suggested wait seconds from the error message
          const m = /try again in\s*([0-9.]+)s/i.exec(text || '');
          const waitMs = Math.min(20000, Math.max(2000, m ? Math.ceil(parseFloat(m[1]) * 1000) : 5000));
          await wait(waitMs);
          attempt++;
          continue;
        }
        if (!resp.ok) {
          const text = await resp.text().catch(() => '');
          throw new Error(`Groq HTTP ${resp.status} ${text}`);
        }
        const data = await resp.json();
        const content = data?.choices?.[0]?.message?.content || '';
        return content.trim();
      } catch (e) {
        lastErr = e;
        // Retry on network/dns/timeouts with exponential backoff + jitter
        const msg = (e?.message || '').toLowerCase();
        const isTimeout = msg.includes('timeout') || msg.includes('aborted') || msg.includes('und_err_connect_timeout');
        const isNetwork = msg.includes('fetch failed') || msg.includes('enotfound') || msg.includes('econnreset') || msg.includes('network');
        const shouldRetry = isTimeout || isNetwork;
        if (!shouldRetry) throw e;
        const base = 900 * (attempt + 1);
        const jitter = Math.floor(Math.random() * 300);
        await wait(base + jitter);
        attempt++;
      }
    }
    throw lastErr || new Error('Groq request failed');
  } finally {
    release();
  }
}

export async function pingGroq() {
  const apiKey = process.env.GROQ_API_KEY || '';
  const out = { provider: 'groq', ok: false, model: GROQ_MODEL, error: null };
  if (!apiKey) { out.error = 'GROQ_API_KEY not set'; return out; }
  try {
    const r = await fetch(`${GROQ_API_URL}/models`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    out.ok = r.ok;
    if (!r.ok) out.error = `HTTP ${r.status}`;
    else out.models = (await r.json())?.data || [];
  } catch (e) {
    out.error = e?.message || String(e);
  }
  return out;
}



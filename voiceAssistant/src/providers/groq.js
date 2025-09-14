// Groq provider wrapper for chat completions (OpenAI-compatible)
const GROQ_API_URL = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1';
const GROQ_MODEL = process.env.LLM_MODEL || process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

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

  const resp = await fetch(`${GROQ_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Groq HTTP ${resp.status} ${text}`);
  }
  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content || '';
  return content.trim();
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



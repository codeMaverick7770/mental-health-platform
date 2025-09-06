const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:latest';

function buildSystemPrompt(locale) {
  return (
    `You are "Asha", a supportive female college counsellor speaking to a student in ${locale}.\n` +
    `Your style is warm, calm, and non‑judgmental. First reflect what you heard (1 sentence), then offer one gentle, practical step (1 sentence). ` +
    `Normalize feelings and avoid clinical labels. Keep replies short (2–4 sentences), varied in phrasing, and end with a soft check‑in question.\n` +
    `Useful skills: slow breathing (4‑7‑8), grounding (5‑4‑3‑2‑1), brief body scan, CBT reframing, sleep hygiene, seeking social support.\n` +
    `Safety: if self‑harm risk appears, prioritize safety, share helplines, and ask consent to connect with a counsellor. Do not give medical advice.\n` +
    `Language: simple, culturally sensitive to Indian higher‑education context.\n`
  );
}

export async function generateCounsellorReply({ userText, turns = [], locale = 'en-IN', risk = {} }) {
  const system = buildSystemPrompt(locale);
  const recent = turns.slice(-6).map(t => `${t.role === 'assistant' ? 'Assistant' : 'Student'}: ${t.text}`).join('\n');
  const prompt = `${system}\nConversation so far:\n${recent}\nStudent: ${userText}\nAssistant:`;

  try {
    const resp = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        options: {
          temperature: 0.72,
          top_p: 0.9,
          repeat_penalty: 1.1,
          num_ctx: 2048
        },
        stream: false
      })
    });
    if (!resp.ok) throw new Error(`Ollama HTTP ${resp.status}`);
    const data = await resp.json();
    return (data.response || '').trim();
  } catch (err) {
    console.warn('[LLM] generate failed:', err?.message || err);
    return null; // fall back to rules
  }
}

export async function pingOllama() {
  const out = { url: OLLAMA_URL, model: OLLAMA_MODEL, ok: false, error: null };
  try {
    const r = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json();
    out.ok = true;
    out.tags = j?.models || j;
  } catch (e) {
    out.error = e?.message || String(e);
  }
  return out;
}



import Sentiment from 'sentiment';
const sentiment = new Sentiment();

function summarizeSentiment(turns) {
  const userTurns = turns.filter(t => t.role === 'user');
  const scores = userTurns.map(t => sentiment.analyze(t.text || '').score);
  if (!scores.length) return { early: 0, mid: 0, end: 0 };
  const third = Math.max(1, Math.floor(scores.length / 3));
  const early = average(scores.slice(0, third));
  const mid = average(scores.slice(third, 2 * third));
  const end = average(scores.slice(2 * third));
  return { early, mid, end };
}

function average(arr) { return arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0; }

export function generateReport(session) {
  const { turns = [], startedAt, endedAt, riskFlags = [] } = session || {};
  const sentimentSummary = summarizeSentiment(turns);
  const mainTopics = extractTopKeywords(turns.map(t => t.text).join(' '));
  const coping = [
    '4-7-8 breathing',
    'brief body scan',
    'CBT-style reframing prompt',
    'sleep hygiene tips'
  ];
  const json = {
    startedAt,
    endedAt,
    durationMinutes: startedAt && endedAt ? Math.max(0, Math.round((new Date(endedAt)-new Date(startedAt))/60000)) : 0,
    sentiment: sentimentSummary,
    topics: mainTopics,
    copingDiscussed: coping,
    riskFlags
  };
  const html = renderHtml(json);
  return { json, html };
}

function extractTopKeywords(text) {
  const words = (text || '').toLowerCase().replace(/[^a-z\s]/g,' ').split(/\s+/).filter(w=>w.length>3);
  const freq = new Map();
  for (const w of words) freq.set(w, (freq.get(w)||0)+1);
  return Array.from(freq.entries()).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([w])=>w);
}

function renderHtml(data) {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Session Feedback Report</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 24px; }
      h1 { font-size: 20px; }
      h2 { font-size: 16px; margin-top: 20px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .card { border: 1px solid #ddd; border-radius: 8px; padding: 12px; }
      .tag { display: inline-block; background: #eef; color: #224; padding: 2px 8px; border-radius: 999px; margin-right: 6px; }
    </style>
  </head>
  <body>
    <h1>Private Session Feedback</h1>
    <div class="grid">
      <div class="card">
        <h2>Timing</h2>
        <div>Start: ${data.startedAt || '-'}<br/>End: ${data.endedAt || '-'}<br/>Duration: ${data.durationMinutes} min</div>
      </div>
      <div class="card">
        <h2>Mood Trajectory</h2>
        <div>Early: ${fmt(data.sentiment.early)} | Mid: ${fmt(data.sentiment.mid)} | End: ${fmt(data.sentiment.end)}</div>
      </div>
      <div class="card">
        <h2>Topics</h2>
        <div>${data.topics.map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join(' ') || '-'}</div>
      </div>
      <div class="card">
        <h2>Coping Strategies</h2>
        <ul>${data.copingDiscussed.map(c=>`<li>${escapeHtml(c)}</li>`).join('')}</ul>
      </div>
      <div class="card">
        <h2>Safety</h2>
        <div>${data.riskFlags.length ? 'Flags present' : 'No risk flags detected'}</div>
      </div>
    </div>
    <p style="margin-top:16px;color:#666;font-size:12px;">This report is private to you. It is supportive information, not a diagnosis.</p>
  </body>
  </html>`;
}

function fmt(n){ return typeof n==='number' ? n.toFixed(1) : '-'; }
function escapeHtml(s){ return (s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }



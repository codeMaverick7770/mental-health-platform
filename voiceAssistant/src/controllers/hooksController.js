// Simple forwarders to external systems for booking and peer support

async function postJson(url, payload) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return { ok: resp.ok, status: resp.status, body: await resp.text().catch(() => '') };
}

export async function booking(req, res) {
  try {
    const url = process.env.BOOKING_WEBHOOK_URL || '';
    if (!url) return res.status(501).json({ error: 'BOOKING_WEBHOOK_URL not configured' });
    const payload = req.body || {};
    const out = await postJson(url, { source: 'voiceAssistant', ...payload });
    res.status(out.ok ? 200 : 502).json({ forwarded: out.ok, status: out.status });
  } catch (e) {
    res.status(500).json({ error: e?.message || String(e) });
  }
}

export async function peerSupport(req, res) {
  try {
    const url = process.env.PEER_WEBHOOK_URL || '';
    if (!url) return res.status(501).json({ error: 'PEER_WEBHOOK_URL not configured' });
    const payload = req.body || {};
    const out = await postJson(url, { source: 'voiceAssistant', ...payload });
    res.status(out.ok ? 200 : 502).json({ forwarded: out.ok, status: out.status });
  } catch (e) {
    res.status(500).json({ error: e?.message || String(e) });
  }
}



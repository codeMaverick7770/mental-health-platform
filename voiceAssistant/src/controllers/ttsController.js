// TTS proxy that maps emotion -> expressive speaking style and forwards to tts_server.py
const TTS_URL = process.env.TTS_URL || 'http://127.0.0.1:5002';

function mapEmotionToStyle(emotion = '') {
  const e = String(emotion || '').toLowerCase();
  if (e.includes('crisis') || e.includes('distress') || e.includes('fear') || e.includes('panic')) return 'empathetic';
  if (e.includes('anxious') || e.includes('stress')) return 'empathetic';
  if (e.includes('depressed') || e.includes('sad') || e.includes('down')) return 'sad';
  if (e.includes('hopeful') || e.includes('relief')) return 'calm';
  if (e.includes('positive') || e.includes('improving') || e.includes('better')) return 'cheerful';
  return 'empathetic';
}

function styleToDegree(style = 'empathetic') {
  switch (style) {
    case 'empathetic': return 1.35;
    case 'sad': return 1.15;
    case 'calm': return 1.25;
    case 'cheerful': return 1.45;
    default: return 1.2;
  }
}

export async function speak(req, res) {
  try {
    const { text, emotion, style, voice = 'en-IN-NeerjaNeural', hindiVoice = 'hi-IN-SwaraNeural', urduVoice = 'ur-PK-UzmaNeural', punjabiVoice = 'pa-IN-GaganNeural', pace, semitones } = req.body || {};
    if (!text || !String(text).trim()) return res.status(400).json({ error: 'text is required' });
    const chosenStyle = style || mapEmotionToStyle(emotion);
    const styleDegree = styleToDegree(chosenStyle);

    const payload = {
      text,
      voice,
      hindiVoice,
      urduVoice,
      punjabiVoice,
      pace: pace ?? 0.95,
      semitones: semitones ?? 0.5,
      style: chosenStyle,
      role: 'YoungAdultFemale',
      styleDegree
    };

    const r = await fetch(`${TTS_URL}/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const errText = await r.text().catch(() => '');
      return res.status(502).json({ error: 'TTS upstream error', status: r.status, body: errText });
    }

    // Proxy audio stream
    res.setHeader('Content-Type', r.headers.get('Content-Type') || 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    const buf = Buffer.from(await r.arrayBuffer());
    res.send(buf);
  } catch (e) {
    res.status(500).json({ error: 'TTS failed', details: e?.message || String(e) });
  }
}



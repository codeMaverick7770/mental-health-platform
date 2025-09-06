const CRISIS_KEYWORDS = [
  'suicide','kill myself','end my life','self harm','cut myself','hang myself',
  'poison','overdose','jump','no reason to live','want to die','die','ending it'
];

const MEDIUM_RISK_PHRASES = [
  'hurting myself','can\'t cope','breakdown','panic attack','severe anxiety',
  'depressed','hopeless','worthless','can\'t sleep for days'
];

export function detectRisk(text) {
  const t = (text || '').toLowerCase();
  if (!t) return { flag: false };
  const crisis = CRISIS_KEYWORDS.find(k => t.includes(k));
  if (crisis) {
    return { flag: true, level: 'high', reason: crisis };
  }
  const medium = MEDIUM_RISK_PHRASES.find(k => t.includes(k));
  if (medium) {
    return { flag: true, level: 'medium', reason: medium };
  }
  return { flag: false };
}



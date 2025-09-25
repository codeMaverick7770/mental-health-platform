// Simple resource endpoint (static list for MVP)

const RESOURCES = {
  'en-IN': [
    { type: 'audio', title: '5-minute breathing', url: '/resources/en/breathing-5min.mp3' },
    { type: 'article', title: 'Sleep hygiene tips', url: 'https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/sleep/' },
    { type: 'video', title: 'Grounding 5-4-3-2-1', url: 'https://www.youtube.com/watch?v=30VMIEmA114' }
  ],
  'hi-IN': [
    { type: 'audio', title: 'शांत सांस अभ्यास (5 मिनट)', url: '/resources/hi/breathing-5min.mp3' },
    { type: 'article', title: 'तनाव प्रबंधन के उपाय', url: 'https://hi.wikipedia.org/wiki/%E0%A4%A4%E0%A4%A8%E0%A4%BE%E0%A4%B5_%E0%A4%AA%E0%A5%8D%E0%A4%B0%E0%A4%AC%E0%A4%82%E0%A4%A7%E0%A4%A8' }
  ],
  'ur-IN': [
    { type: 'audio', title: 'پانچ منٹ کی گہری سانس', url: '/resources/ur/breathing-5min.mp3' },
    { type: 'article', title: 'تناؤ کم کرنے کے طریقے', url: 'https://ur.wikipedia.org/wiki/%D8%AA%D9%86%D8%A7%D8%A4' }
  ],
  'pa-IN': [
    { type: 'audio', title: '5 ਮਿੰਟ ਦੀ ਸਾਹ ਲੈਣ ਦੀ ਕਸਰਤ', url: '/resources/pa/breathing-5min.mp3' },
    { type: 'article', title: 'ਤਣਾਅ ਪ੍ਰਬੰਧਨ', url: 'https://pa.wikipedia.org/wiki/%E0%A8%A4%E0%A8%A3%E0%A8%BE%E0%A8%85' }
  ]
};

export function listResources(req, res) {
  const locale = (req.query.locale || 'en-IN');
  const list = RESOURCES[locale] || RESOURCES['en-IN'];
  res.json({ locale, resources: list });
}



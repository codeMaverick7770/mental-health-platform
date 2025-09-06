import nlp from 'compromise';
import Sentiment from 'sentiment';
import { generateCounsellorReply } from './llm.js';
const sentiment = new Sentiment();

const supportiveOpeners = [
  "I'm here with you. Tell me what's on your mind.",
  "Thank you for sharing. What feels most heavy right now?",
  "You’re not alone. Would you like to talk about what happened today?"
];

const copingSuggestions = [
  "Try the 4-7-8 breathing: inhale 4, hold 7, exhale 8.",
  "A brief body scan can help—notice feet to head, release tension.",
  "Would making a small plan for the next hour feel helpful?",
  "Drinking water and stepping outside for a minute can reset your mood.",
  "Write one worry, then one small action you can take this week."
];

function extractTopics(text) {
  const doc = nlp(text || '');
  const nouns = doc.nouns().out('array');
  const topics = Array.from(new Set(nouns)).slice(0, 5);
  return topics;
}

export async function createResponse(userText, { locale = 'en-IN', risk = {}, priorTurns = [] } = {}) {
  const clean = (userText || '').trim();
  if (!clean) {
    return supportiveOpeners[Math.floor(Math.random() * supportiveOpeners.length)];
  }
  if (risk.flag) {
    if (risk.level === 'high') {
      return "I’m concerned about your safety. If you’re in immediate danger, please call your local emergency number now. I can also share helplines and connect you to your campus counsellor. Would you like that?";
    }
    if (risk.level === 'medium') {
      return "Thank you for telling me. Your feelings matter. I can share coping steps and counsellor options. Would you like breathing guidance or to book a time with the counsellor?";
    }
  }
  // Try LLM counsellor persona if enabled
  if (process.env.USE_LLM === '1') {
    const llm = await generateCounsellorReply({ userText: clean, turns: priorTurns, locale, risk });
    if (llm) return llm;
  }
  const s = sentiment.analyze(clean);
  const topics = extractTopics(clean);
  let response = '';
  if (s.score <= -2) {
    response = "That sounds really tough. I’m glad you shared it with me. ";
  } else if (s.score < 1) {
    response = "I hear you. Thank you for opening up. ";
  } else {
    response = "I can sense some strengths in how you’re thinking about this. ";
  }
  if (topics.length) {
    response += `When you think about ${topics[0]}, what feels most challenging? `;
  }
  response += copingSuggestions[Math.floor(Math.random() * copingSuggestions.length)];
  return response;
}



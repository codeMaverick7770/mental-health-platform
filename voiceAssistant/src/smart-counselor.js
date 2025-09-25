// Smart LLM-Powered Counselor with Persona and Intelligent Prompts (Groq-backed)
import { groqChat } from './providers/groq.js';

const LLM_MODEL = process.env.LLM_MODEL || process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

export class SmartCounselor {
  constructor() {
    this.persona = {
      name: "Asha",
      role: "AI Mental Health Counselor",
      background: "Experienced counselor specializing in cognitive-behavioral therapy, mindfulness, and crisis intervention",
      personality: "Empathetic, non-judgmental, warm, professional, and encouraging",
      approach: "Person-centered, evidence-based, trauma-informed, culturally sensitive"
    };
    
    this.sessionContext = new Map();
    this.conversationHistory = new Map();
  }

  // Main method to generate counselor response
  async generateResponse(userText, sessionId, context = {}) {
    try {
      // Get or create session context
      const sessionContext = this.getSessionContext(sessionId);
      const locale = this.normalizeLocale(context.locale || 'en-IN');
      
      // Update conversation history
      this.updateConversationHistory(sessionId, userText, 'user');
      
      // FAST_MODE: single LLM call path for lower latency
      if (process.env.FAST_MODE === '1') {
        const fast = await this.generateFastResponse(userText, sessionContext, locale);
        // Update session context with lightweight analysis
        this.updateSessionContext(sessionId, fast.analysis, fast.reply);
        // Update conversation history
        this.updateConversationHistory(sessionId, fast.reply, 'assistant');
        return fast;
      }

      // Standard path: analyze then respond
      const analysis = await this.analyzeUserMessage(userText, sessionContext, locale);
      const response = await this.generateContextualResponse(userText, sessionContext, analysis, locale);
      
      // Update session context with new information
      this.updateSessionContext(sessionId, analysis, response);
      
      // Update conversation history
      this.updateConversationHistory(sessionId, response, 'assistant');
      
      return {
        reply: response,
        analysis: analysis,
        sessionContext: sessionContext
      };
    } catch (error) {
      console.error('Error generating counselor response:', error);
      return this.generateFallbackResponse(userText, sessionId);
    }
  }

  // Low-latency single-call response with lightweight analysis
  async generateFastResponse(userText, sessionContext, locale) {
    const history = this.getConversationHistory(sessionContext.sessionId).slice(-4).map(t => `${t.role}: ${t.text}`).join('\n');
    const languageName = this.languageNameFor(locale);
    const prompt = `You are ${this.persona.name}, an empathetic Indian college counselor. Keep replies concise (2-3 sentences), warm, non-judgmental, end with a soft check-in question. Reply strictly in ${languageName}. If the user mixes languages, prefer ${languageName} unless they clearly request another.

Conversation (recent):\n${history}

Student: ${userText}
Assistant:`;

    try {
      const raw = await this.callLLM(prompt, locale);
      const reply = this.cleanResponse(raw);
      // Use keyword-based fallback analysis (fast)
      const analysis = this.generateFallbackAnalysis(userText);
      return { reply, analysis, sessionContext };
    } catch (e) {
      const reply = this.generateFallbackResponse(userText, sessionContext.sessionId);
      const analysis = this.generateFallbackAnalysis(userText);
      return { reply, analysis, sessionContext };
    }
  }

  // Analyze user message for context and needs
  async analyzeUserMessage(userText, sessionContext, locale = 'en-IN') {
    const analysisPrompt = this.buildAnalysisPrompt(userText, sessionContext, locale);
    
    try {
      const analysis = await this.callLLM(analysisPrompt, locale);
      return this.parseAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing user message:', error);
      return this.generateFallbackAnalysis(userText);
    }
  }

  // Generate contextual response based on analysis
  async generateContextualResponse(userText, sessionContext, analysis, locale = 'en-IN') {
    const responsePrompt = this.buildResponsePrompt(userText, sessionContext, analysis, locale);
    
    try {
      const response = await this.callLLM(responsePrompt, locale);
      return this.cleanResponse(response);
    } catch (error) {
      console.error('Error generating response:', error);
      return this.generateFallbackResponse(userText, sessionContext.sessionId);
    }
  }

  // Build analysis prompt
  buildAnalysisPrompt(userText, sessionContext, locale = 'en-IN') {
    const conversationHistory = this.getConversationHistory(sessionContext.sessionId);
    const historyText = conversationHistory.slice(-6).map(turn => 
      `${turn.role}: ${turn.text}`
    ).join('\n');

    return `You are an expert mental health counselor analyzing a user's message. Analyze the following message and conversation context.
Output strictly valid JSON. Keep field names in English. If any free-text you produce, prefer the user's language indicated by locale. Locale: ${locale}

USER MESSAGE: "${userText}"

CONVERSATION HISTORY:
${historyText}

SESSION CONTEXT:
- Session Stage: ${sessionContext.stage || 'initial'}
- User's Emotional State: ${sessionContext.emotionalState || 'unknown'}
- Main Concerns: ${sessionContext.mainConcerns?.join(', ') || 'none identified'}
- Risk Level: ${sessionContext.riskLevel || 'low'}
- Previous Interventions: ${sessionContext.interventions?.join(', ') || 'none'}

Analyze and provide:
1. EMOTIONAL STATE: What emotions is the user expressing?
2. URGENCY LEVEL: How urgent is this situation? (low/medium/high/crisis)
3. MAIN CONCERNS: What are the primary issues being discussed?
4. RISK INDICATORS: Any signs of self-harm, suicide, or crisis?
5. COPING MECHANISMS: What coping strategies are mentioned or needed?
6. SUPPORT NEEDS: What kind of support does the user need?
7. RESPONSE APPROACH: What therapeutic approach would be most helpful?

Respond in JSON format:
{
  "emotionalState": "anxious|depressed|angry|hopeful|confused|etc",
  "urgencyLevel": "low|medium|high|crisis",
  "mainConcerns": ["concern1", "concern2"],
  "riskIndicators": ["indicator1", "indicator2"],
  "copingMechanisms": ["mechanism1", "mechanism2"],
  "supportNeeds": ["need1", "need2"],
  "responseApproach": "active_listening|crisis_intervention|cbt_technique|mindfulness|validation|etc",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`;
  }

  // Build response prompt
  buildResponsePrompt(userText, sessionContext, analysis, locale = 'en-IN') {
    const conversationHistory = this.getConversationHistory(sessionContext.sessionId);
    const historyText = conversationHistory.slice(-4).map(turn => 
      `${turn.role}: ${turn.text}`
    ).join('\n');

    return `You are ${this.persona.name}, an AI mental health counselor. Respond to the user's message with empathy, professionalism, and therapeutic insight.
Reply in the user's language based on locale: ${locale}. If mixed languages are present, mirror the user's latest message language.

PERSONA:
- Name: ${this.persona.name}
- Role: ${this.persona.role}
- Background: ${this.persona.background}
- Personality: ${this.persona.personality}
- Approach: ${this.persona.approach}

USER MESSAGE: "${userText}"

CONVERSATION HISTORY:
${historyText}

ANALYSIS:
- Emotional State: ${analysis.emotionalState}
- Urgency Level: ${analysis.urgencyLevel}
- Main Concerns: ${analysis.mainConcerns?.join(', ')}
- Risk Indicators: ${analysis.riskIndicators?.join(', ')}
- Response Approach: ${analysis.responseApproach}

GUIDELINES:
1. Keep replies very brief: 1-2 sentences total.
2. Be empathetic and non-judgmental.
3. Avoid clinical labels or diagnoses.
4. Tailor content to the urgency level:
   - If urgency is low: reflect briefly, suggest one CBT/mindfulness/sleep-hygiene step, optionally link a resource.
   - If urgency is medium: reflect briefly, ask one question to gauge anxiety/depression severity (PHQ-9/GAD-7 style) and gently ask consent to connect with an anonymous peer supporter.
   - If urgency is high or crisis: prioritize safety, advise SOS/helpline, and ask consent for immediate counselor booking.
5. End with a soft check‑in question.

Generate a response that:
- Acknowledges their feelings
- Addresses their main concerns
- Uses the appropriate therapeutic approach
- Provides helpful guidance
- Maintains the counselor persona
- Is 2-4 sentences long

RESPONSE:`;
  }

  // Call LLM with prompt via Groq chat
  async callLLM(prompt, locale = 'en-IN') {
    try {
      const languageName = this.languageNameFor(locale);
      const system = `You are Asha, an empathetic Indian college counselor.
Keep replies 2–3 sentences. First reflect briefly, then either: (a) suggest one CBT/mindfulness/sleep-hygiene step for low urgency; (b) ask one severity gauge and consent for anonymous peer support for medium urgency; (c) prioritize safety and advise SOS/helpline for high urgency and ask consent for immediate counselor booking. End with a soft check-in. Avoid clinical labels and medical advice.
Always reply in ${languageName}. If locale is a regional language not natively supported, use the closest widely-understood script and vocabulary (${languageName}).`;
      const out = await groqChat({
        system,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 180
      });
      return out || '';
    } catch (error) {
      console.error('LLM call failed:', error);
      throw error;
    }
  }

  // Locale helpers
  normalizeLocale(locale) {
    const l = String(locale || '').toLowerCase();
    if (l.startsWith('doi')) return 'hi-IN'; // Dogri -> Hindi
    if (l.startsWith('ks')) return 'ur-PK';  // Kashmiri -> Urdu
    if (l === 'ur-in') return 'ur-PK';
    return locale;
  }

  languageNameFor(locale) {
    const m = String(locale || '').toLowerCase();
    if (m.startsWith('hi')) return 'Hindi';
    if (m.startsWith('ur')) return 'Urdu';
    if (m.startsWith('pa')) return 'Punjabi';
    if (m.startsWith('en')) return 'English (India)';
    return 'the user\'s language';
  }

  // Parse analysis response
  parseAnalysis(response) {
    try {
      // Sanitize common LLM outputs: remove code fences, labels, stray text
      let text = String(response || '').trim();
      // Remove markdown code fences like ```json ... ``` or ``` ... ```
      text = text.replace(/^```[a-zA-Z]*\n([\s\S]*?)\n```\s*$/m, '$1').trim();
      // If there is any leading junk before first { and trailing after last }, slice it
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        text = text.slice(firstBrace, lastBrace + 1);
      }
      const parsed = JSON.parse(text);
      return {
        emotionalState: parsed.emotionalState || 'neutral',
        urgencyLevel: parsed.urgencyLevel || 'low',
        mainConcerns: parsed.mainConcerns || [],
        riskIndicators: parsed.riskIndicators || [],
        copingMechanisms: parsed.copingMechanisms || [],
        supportNeeds: parsed.supportNeeds || [],
        responseApproach: parsed.responseApproach || 'active_listening',
        confidence: parsed.confidence || 0.5,
        reasoning: parsed.reasoning || 'Analysis completed'
      };
    } catch (error) {
      console.error('Error parsing analysis:', error);
      return this.generateFallbackAnalysis('');
    }
  }

  // Clean and format response
  cleanResponse(response) {
    // Remove any unwanted prefixes or formatting
    let cleaned = response.trim();
    
    // Remove common LLM artifacts
    cleaned = cleaned.replace(/^RESPONSE:\s*/i, '');
    cleaned = cleaned.replace(/^Asha:\s*/i, '');
    cleaned = cleaned.replace(/^Counselor:\s*/i, '');
    
    // Ensure proper sentence structure
    if (!cleaned.endsWith('.') && !cleaned.endsWith('!') && !cleaned.endsWith('?')) {
      cleaned += '.';
    }
    
    return cleaned;
  }

  // Get session context
  getSessionContext(sessionId) {
    if (!this.sessionContext.has(sessionId)) {
      this.sessionContext.set(sessionId, {
        sessionId,
        stage: 'initial',
        emotionalState: 'unknown',
        mainConcerns: [],
        riskLevel: 'low',
        interventions: [],
        startTime: new Date().toISOString()
      });
    }
    return this.sessionContext.get(sessionId);
  }

  // Update session context
  updateSessionContext(sessionId, analysis, response) {
    const context = this.getSessionContext(sessionId);
    
    // Update emotional state
    if (analysis.emotionalState && analysis.emotionalState !== 'unknown') {
      context.emotionalState = analysis.emotionalState;
    }
    
    // Update main concerns
    if (analysis.mainConcerns && analysis.mainConcerns.length > 0) {
      analysis.mainConcerns.forEach(concern => {
        if (!context.mainConcerns.includes(concern)) {
          context.mainConcerns.push(concern);
        }
      });
    }
    
    // Update risk level
    if (analysis.urgencyLevel === 'crisis') {
      context.riskLevel = 'crisis';
    } else if (analysis.urgencyLevel === 'high' && context.riskLevel !== 'crisis') {
      context.riskLevel = 'high';
    } else if (analysis.urgencyLevel === 'medium' && context.riskLevel === 'low') {
      context.riskLevel = 'medium';
    }
    
    // Update interventions
    if (analysis.responseApproach) {
      context.interventions.push(analysis.responseApproach);
    }
    
    // Update session stage
    if (context.mainConcerns.length > 0 && context.stage === 'initial') {
      context.stage = 'exploration';
    }
    if (context.interventions.length > 3 && context.stage === 'exploration') {
      context.stage = 'intervention';
    }
    
    this.sessionContext.set(sessionId, context);
  }

  // Update conversation history
  updateConversationHistory(sessionId, text, role) {
    if (!this.conversationHistory.has(sessionId)) {
      this.conversationHistory.set(sessionId, []);
    }
    
    const history = this.conversationHistory.get(sessionId);
    history.push({
      role,
      text,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 20 messages to manage memory
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
  }

  // Get conversation history
  getConversationHistory(sessionId) {
    return this.conversationHistory.get(sessionId) || [];
  }

  // Fallback methods
  generateFallbackAnalysis(userText) {
    const crisisKeywords = ['suicide', 'kill myself', 'end my life', 'self harm'];
    const riskKeywords = ['depressed', 'hopeless', 'anxious', 'worried'];
    const text = String(userText || '').toLowerCase();
    const hasCrisis = crisisKeywords.some(keyword => text.includes(keyword));
    const hasRisk = riskKeywords.some(keyword => text.includes(keyword));
    
    return {
      emotionalState: hasCrisis ? 'crisis' : hasRisk ? 'distressed' : 'neutral',
      urgencyLevel: hasCrisis ? 'crisis' : hasRisk ? 'medium' : 'low',
      mainConcerns: hasCrisis ? ['crisis'] : hasRisk ? ['mental health'] : ['general'],
      riskIndicators: hasCrisis ? ['crisis indicators'] : [],
      copingMechanisms: [],
      supportNeeds: hasCrisis ? ['immediate support'] : ['emotional support'],
      responseApproach: hasCrisis ? 'crisis_intervention' : 'active_listening',
      confidence: 0.6,
      reasoning: 'Fallback analysis based on keyword detection'
    };
  }

  generateFallbackResponse(userText, sessionId) {
    const context = this.getSessionContext(sessionId);
    
    if (context.riskLevel === 'crisis') {
      return "I'm concerned about what you're sharing. Your safety is my top priority. Can you tell me more about what's going on? If you're having thoughts of hurting yourself, please reach out to a crisis helpline immediately.";
    }
    
    if (context.stage === 'initial') {
      return "Hello, I'm Asha, your AI mental health counselor. I'm here to listen and support you. What's on your mind today?";
    }
    
    return "I hear you, and I want to understand better. Can you tell me more about what you're experiencing?";
  }

  // Get session data for admin reporting
  getSessionData(sessionId) {
    const context = this.getSessionContext(sessionId);
    const history = this.getConversationHistory(sessionId);
    
    return {
      sessionId,
      context,
      conversation: history,
      duration: this.calculateDuration(context.startTime),
      turnCount: history.length
    };
  }

  // Calculate session duration
  calculateDuration(startTime) {
    if (!startTime) return 0;
    return Math.round((new Date() - new Date(startTime)) / 1000 / 60);
  }

  // Clear session data
  clearSession(sessionId) {
    this.sessionContext.delete(sessionId);
    this.conversationHistory.delete(sessionId);
  }
}

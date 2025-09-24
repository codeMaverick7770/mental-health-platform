// LLM-Powered Admin Insights and Flag Generation (Groq-backed)
import { groqChat } from './providers/groq.js';

export class LLMInsights {
  constructor() {
    this.insights = new Map();
    this.flags = new Map();
  }

  // Generate intelligent flags from conversation
  async generateFlags(sessionId, conversation) {
    try {
      const analysisPrompt = this.buildFlagAnalysisPrompt(conversation);
      const flags = await this.callLLM(analysisPrompt);
      return this.parseFlags(flags);
    } catch (error) {
      console.error('Error generating flags:', error);
      return this.generateFallbackFlags(conversation);
    }
  }

  // Generate admin insights from session data
  async generateInsights(sessionId, sessionData) {
    try {
      const insightsPrompt = this.buildInsightsPrompt(sessionData);
      const insights = await this.callLLM(insightsPrompt);
      return this.parseInsights(insights);
    } catch (error) {
      console.error('Error generating insights:', error);
      return this.generateFallbackInsights(sessionData);
    }
  }

  // Generate risk assessment using LLM
  async assessRisk(conversation) {
    try {
      const riskPrompt = this.buildRiskAssessmentPrompt(conversation);
      const assessment = await this.callLLM(riskPrompt);
      return this.parseRiskAssessment(assessment);
    } catch (error) {
      console.error('Error assessing risk:', error);
      return this.generateFallbackRiskAssessment(conversation);
    }
  }

  // Generate follow-up recommendations
  async generateRecommendations(sessionData, insights) {
    try {
      const recPrompt = this.buildRecommendationsPrompt(sessionData, insights);
      const recommendations = await this.callLLM(recPrompt);
      return this.parseRecommendations(recommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.generateFallbackRecommendations(sessionData);
    }
  }

  // Build prompt for flag analysis
  buildFlagAnalysisPrompt(conversation) {
    return `You are an expert mental health counselor analyzing a conversation for potential flags and concerns.

CONVERSATION:
${conversation.map(turn => `${turn.role}: ${turn.text}`).join('\n')}

Analyze this conversation and identify:
1. CRISIS FLAGS: Immediate safety concerns (suicide, self-harm, violence)
2. RISK FLAGS: Medium-term concerns (depression, anxiety, substance use)
3. CONCERN FLAGS: General mental health issues (stress, relationship problems)
4. POSITIVE FLAGS: Strengths, coping strategies, support systems

Respond in strict JSON (English only). If uncertain, use empty arrays and set strings to "unknown". Do not include any text outside JSON.
{
  "crisis_flags": ["flag1", "flag2"],
  "risk_flags": ["flag1", "flag2"],
  "concern_flags": ["flag1", "flag2"],
  "positive_flags": ["flag1", "flag2"],
  "overall_risk_level": "low|medium|high|crisis",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`;
  }

  // Build prompt for insights generation
  buildInsightsPrompt(sessionData) {
    const conversation = sessionData.turns || [];
    const duration = this.calculateDuration(sessionData.startedAt, sessionData.endedAt);
    
    const locale = 'en';
    return `You are a mental health analytics expert analyzing a counseling session.
Output strictly valid JSON (English only). Keep JSON keys and values in English. If you cannot infer a field, return an empty array [] or the string "unknown". Do not include any extra commentary or markdown.

SESSION DATA:
- Duration: ${duration} minutes
- Turns: ${conversation.length}
- User messages: ${conversation.filter(t => t.role === 'user').length}
- Risk flags: ${sessionData.riskFlags?.length || 0}

CONVERSATION:
${conversation.map(turn => `${turn.role}: ${turn.text}`).join('\n')}

Generate comprehensive insights:
1. EMOTIONAL PATTERNS: What emotions were expressed?
2. TOPICS DISCUSSED: Main themes and concerns
3. COPING STRATEGIES: What coping mechanisms were mentioned?
4. SUPPORT SYSTEMS: Family, friends, professional support mentioned
5. PROGRESS INDICATORS: Signs of improvement or decline
6. ENGAGEMENT LEVEL: How engaged was the user?
7. THERAPEUTIC ALLIANCE: Quality of counselor-client relationship

Respond in strict JSON (English only). If uncertain, use [] or "unknown". No text outside JSON.
{
  "emotional_patterns": ["emotion1", "emotion2"],
  "main_topics": ["topic1", "topic2"],
  "coping_strategies": ["strategy1", "strategy2"],
  "support_systems": ["support1", "support2"],
  "progress_indicators": ["indicator1", "indicator2"],
  "engagement_level": "low|medium|high",
  "therapeutic_alliance": "poor|fair|good|excellent",
  "key_insights": ["insight1", "insight2"],
  "recommendations": ["rec1", "rec2"]
}`;
  }

  // Build prompt for risk assessment
  buildRiskAssessmentPrompt(conversation) {
    return `You are a crisis intervention specialist assessing risk level from a conversation.

CONVERSATION:
${conversation.map(turn => `${turn.role}: ${turn.text}`).join('\n')}

Assess the risk level considering:
1. SUICIDAL IDEATION: Direct or indirect expressions
2. SELF-HARM: Mentions of self-injury
3. HOPELESSNESS: Expressions of despair or futility
4. ISOLATION: Social withdrawal or loneliness
5. SUBSTANCE USE: Alcohol or drug mentions
6. TRAUMA: Recent or past traumatic experiences
7. PROTECTIVE FACTORS: Support systems, reasons for living

Respond in strict JSON (English only). If uncertain, set arrays to [] and booleans to false, and use the string "unknown" where needed. No extra text.
{
  "risk_level": "minimal|low|medium|high|crisis",
  "suicidal_ideation": "none|passive|active|immediate",
  "self_harm_risk": "none|low|medium|high",
  "hopelessness_level": "none|mild|moderate|severe",
  "isolation_level": "none|mild|moderate|severe",
  "protective_factors": ["factor1", "factor2"],
  "immediate_concerns": ["concern1", "concern2"],
  "safety_plan_needed": true/false,
  "professional_referral_needed": true/false,
  "confidence": 0.0-1.0,
  "reasoning": "detailed explanation"
}`;
  }

  // Build prompt for recommendations
  buildRecommendationsPrompt(sessionData, insights) {
    const locale = 'en';
    return `You are a clinical supervisor providing recommendations based on session analysis.
Output strictly valid JSON (English only). Keep all keys and values in English. If you cannot infer a field, return [] or "unknown". No extra commentary.

SESSION DATA:
- Duration: ${this.calculateDuration(sessionData.startedAt, sessionData.endedAt)} minutes
- Risk level: ${insights.risk_level || 'unknown'}
- Main topics: ${insights.main_topics?.join(', ') || 'none'}
- Engagement: ${insights.engagement_level || 'unknown'}

INSIGHTS:
${JSON.stringify(insights, null, 2)}

Provide specific recommendations:
1. IMMEDIATE ACTIONS: What needs to happen right now?
2. SHORT-TERM GOALS: Next 1-2 weeks
3. LONG-TERM PLANS: Next 1-3 months
4. RESOURCES NEEDED: Specific tools or support
5. FOLLOW-UP SCHEDULE: How often to check in
6. PROFESSIONAL REFERRALS: When to involve specialists

Respond in strict JSON (English only). If uncertain, use [] or "unknown".
{
  "immediate_actions": ["action1", "action2"],
  "short_term_goals": ["goal1", "goal2"],
  "long_term_plans": ["plan1", "plan2"],
  "resources_needed": ["resource1", "resource2"],
  "follow_up_schedule": "daily|weekly|bi-weekly|monthly",
  "professional_referrals": ["referral1", "referral2"],
  "priority_level": "low|medium|high|urgent",
  "estimated_timeline": "1-2 weeks|1 month|3 months|ongoing"
}`;
  }

  // Call LLM with prompt via Groq
  async callLLM(prompt) {
    try {
      const system = 'You are a clinical analytics assistant. Output must be strictly valid JSON only, in English. Do not include markdown, explanations, or prose outside JSON. If uncertain, use empty arrays [] or the string "unknown".';
      const out = await groqChat({
        system,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 220
      });
      return out || '';
    } catch (error) {
      console.error('LLM call failed:', error);
      throw error;
    }
  }

  // Parse LLM response for flags
  parseFlags(response) {
    try {
      const parsed = JSON.parse(response);
      return {
        crisis_flags: parsed.crisis_flags || [],
        risk_flags: parsed.risk_flags || [],
        concern_flags: parsed.concern_flags || [],
        positive_flags: parsed.positive_flags || [],
        overall_risk_level: parsed.overall_risk_level || 'low',
        confidence: parsed.confidence || 0.5,
        reasoning: parsed.reasoning || 'Analysis completed'
      };
    } catch (error) {
      console.error('Error parsing flags:', error);
      return this.generateFallbackFlags();
    }
  }

  // Parse LLM response for insights
  parseInsights(response) {
    try {
      const parsed = JSON.parse(response);
      return {
        emotional_patterns: parsed.emotional_patterns || [],
        main_topics: parsed.main_topics || [],
        coping_strategies: parsed.coping_strategies || [],
        support_systems: parsed.support_systems || [],
        progress_indicators: parsed.progress_indicators || [],
        engagement_level: parsed.engagement_level || 'medium',
        therapeutic_alliance: parsed.therapeutic_alliance || 'fair',
        key_insights: parsed.key_insights || [],
        recommendations: parsed.recommendations || []
      };
    } catch (error) {
      console.error('Error parsing insights:', error);
      return this.generateFallbackInsights();
    }
  }

  // Parse LLM response for risk assessment
  parseRiskAssessment(response) {
    try {
      const parsed = JSON.parse(response);
      return {
        risk_level: parsed.risk_level || 'low',
        suicidal_ideation: parsed.suicidal_ideation || 'none',
        self_harm_risk: parsed.self_harm_risk || 'none',
        hopelessness_level: parsed.hopelessness_level || 'none',
        isolation_level: parsed.isolation_level || 'none',
        protective_factors: parsed.protective_factors || [],
        immediate_concerns: parsed.immediate_concerns || [],
        safety_plan_needed: parsed.safety_plan_needed || false,
        professional_referral_needed: parsed.professional_referral_needed || false,
        confidence: parsed.confidence || 0.5,
        reasoning: parsed.reasoning || 'Risk assessment completed'
      };
    } catch (error) {
      console.error('Error parsing risk assessment:', error);
      return this.generateFallbackRiskAssessment();
    }
  }

  // Parse LLM response for recommendations
  parseRecommendations(response) {
    try {
      const parsed = JSON.parse(response);
      return {
        immediate_actions: parsed.immediate_actions || [],
        short_term_goals: parsed.short_term_goals || [],
        long_term_plans: parsed.long_term_plans || [],
        resources_needed: parsed.resources_needed || [],
        follow_up_schedule: parsed.follow_up_schedule || 'weekly',
        professional_referrals: parsed.professional_referrals || [],
        priority_level: parsed.priority_level || 'medium',
        estimated_timeline: parsed.estimated_timeline || '1 month'
      };
    } catch (error) {
      console.error('Error parsing recommendations:', error);
      return this.generateFallbackRecommendations();
    }
  }

  // Fallback methods when LLM fails
  generateFallbackFlags(conversation = []) {
    const crisisKeywords = ['suicide', 'kill myself', 'end my life', 'self harm'];
    const riskKeywords = ['depressed', 'hopeless', 'anxious', 'worried'];
    
    const text = conversation.map(t => t.text).join(' ').toLowerCase();
    const crisisFlags = crisisKeywords.filter(keyword => text.includes(keyword));
    const riskFlags = riskKeywords.filter(keyword => text.includes(keyword));
    
    return {
      crisis_flags: crisisFlags,
      risk_flags: riskFlags,
      concern_flags: [],
      positive_flags: [],
      overall_risk_level: crisisFlags.length > 0 ? 'crisis' : riskFlags.length > 0 ? 'medium' : 'low',
      confidence: 0.7,
      reasoning: 'Fallback analysis based on keyword detection'
    };
  }

  generateFallbackInsights(sessionData = {}) {
    return {
      emotional_patterns: ['neutral'],
      main_topics: ['general discussion'],
      coping_strategies: [],
      support_systems: [],
      progress_indicators: [],
      engagement_level: 'medium',
      therapeutic_alliance: 'fair',
      key_insights: ['Session completed successfully'],
      recommendations: ['Continue regular check-ins']
    };
  }

  generateFallbackRiskAssessment(conversation = []) {
    return {
      risk_level: 'low',
      suicidal_ideation: 'none',
      self_harm_risk: 'none',
      hopelessness_level: 'none',
      isolation_level: 'none',
      protective_factors: [],
      immediate_concerns: [],
      safety_plan_needed: false,
      professional_referral_needed: false,
      confidence: 0.5,
      reasoning: 'Fallback risk assessment'
    };
  }

  generateFallbackRecommendations(sessionData = {}) {
    return {
      immediate_actions: ['Monitor session progress'],
      short_term_goals: ['Continue regular check-ins'],
      long_term_plans: ['Maintain therapeutic relationship'],
      resources_needed: ['Standard counseling resources'],
      follow_up_schedule: 'weekly',
      professional_referrals: [],
      priority_level: 'medium',
      estimated_timeline: 'ongoing'
    };
  }

  // Helper method to calculate duration
  calculateDuration(startTime, endTime) {
    if (!startTime || !endTime) return 0;
    return Math.round((new Date(endTime) - new Date(startTime)) / 1000 / 60);
  }
}

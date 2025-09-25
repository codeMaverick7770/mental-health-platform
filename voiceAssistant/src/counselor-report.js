// Counselor Report Generator - Clear reports for college counselors
import { SmartCounselor } from './smart-counselor.js';
import { LLMInsights } from './llm-insights.js';

export class CounselorReportGenerator {
  constructor() {
    this.smartCounselor = new SmartCounselor();
    this.llmInsights = new LLMInsights();
  }

  // Generate comprehensive counselor report
  async generateCounselorReport(sessionId, sessionData) {
    try {
      // Get LLM analysis
      const conversation = sessionData.turns || [];
      const flags = await this.llmInsights.generateFlags(sessionId, conversation);
      const insights = await this.llmInsights.generateInsights(sessionId, sessionData);
      const riskAssessment = await this.llmInsights.assessRisk(conversation);
      const recommendations = await this.llmInsights.generateRecommendations(sessionData, insights);

      // Generate counselor-specific report
      const report = {
        sessionId,
        timestamp: new Date().toISOString(),
        studentInfo: this.extractStudentInfo(sessionData),
        sessionSummary: this.generateSessionSummary(sessionData, insights),
        riskAssessment: this.formatRiskAssessment(riskAssessment, flags),
        keyConcerns: this.extractKeyConcerns(insights, conversation),
        emotionalState: this.analyzeEmotionalState(insights, conversation),
        immediateActions: this.getImmediateActions(riskAssessment, flags),
        followUpPlan: this.createFollowUpPlan(recommendations, riskAssessment),
        resources: this.getRelevantResources(insights, riskAssessment),
        counselorNotes: this.generateCounselorNotes(insights, riskAssessment),
        priority: this.determinePriority(riskAssessment, flags)
      };

      return report;
    } catch (error) {
      console.error('Error generating counselor report:', error);
      return this.generateFallbackReport(sessionId, sessionData);
    }
  }

  // Extract student information
  extractStudentInfo(sessionData) {
    const conversation = sessionData.turns || [];
    const userMessages = conversation.filter(t => t.role === 'user');
    
    return {
      sessionDuration: this.calculateDuration(sessionData.startedAt, sessionData.endedAt),
      messageCount: userMessages.length,
      engagementLevel: this.assessEngagementLevel(userMessages),
      communicationStyle: this.analyzeCommunicationStyle(userMessages),
      previousSessions: 0 // Would be tracked in real system
    };
  }

  // Generate session summary
  generateSessionSummary(sessionData, insights) {
    const conversation = sessionData.turns || [];
    const duration = this.calculateDuration(sessionData.startedAt, sessionData.endedAt);
    
    return {
      duration: `${duration} minutes`,
      mainTopics: insights.main_topics || ['General discussion'],
      emotionalPatterns: insights.emotional_patterns || ['Neutral'],
      keyInsights: insights.key_insights || ['Session completed'],
      therapeuticAlliance: insights.therapeutic_alliance || 'Fair',
      engagementLevel: insights.engagement_level || 'Medium'
    };
  }

  // Format risk assessment for counselors
  formatRiskAssessment(riskAssessment, flags) {
    return {
      overallRisk: riskAssessment.risk_level || 'low',
      suicidalIdeation: riskAssessment.suicidal_ideation || 'none',
      selfHarmRisk: riskAssessment.self_harm_risk || 'none',
      hopelessness: riskAssessment.hopelessness_level || 'none',
      isolation: riskAssessment.isolation_level || 'none',
      protectiveFactors: riskAssessment.protective_factors || [],
      immediateConcerns: riskAssessment.immediate_concerns || [],
      safetyPlanNeeded: riskAssessment.safety_plan_needed || false,
      professionalReferralNeeded: riskAssessment.professional_referral_needed || false,
      confidence: riskAssessment.confidence || 0.5,
      reasoning: riskAssessment.reasoning || 'Assessment completed',
      flags: {
        crisis: flags.crisis_flags || [],
        risk: flags.risk_flags || [],
        concern: flags.concern_flags || [],
        positive: flags.positive_flags || []
      }
    };
  }

  // Extract key concerns
  extractKeyConcerns(insights, conversation) {
    const concerns = [];
    
    // From LLM insights
    if (insights.main_topics) {
      concerns.push(...insights.main_topics);
    }
    
    // From conversation analysis
    const userMessages = conversation.filter(t => t.role === 'user');
    const concernKeywords = {
      'academic': ['exam', 'study', 'grades', 'assignment', 'project', 'deadline'],
      'social': ['friend', 'relationship', 'lonely', 'isolated', 'peer'],
      'family': ['family', 'parent', 'home', 'sibling', 'household'],
      'financial': ['money', 'cost', 'expensive', 'afford', 'budget'],
      'health': ['sick', 'tired', 'sleep', 'eating', 'exercise', 'health'],
      'future': ['career', 'job', 'future', 'plan', 'goal', 'dream']
    };

    userMessages.forEach(message => {
      const text = message.text.toLowerCase();
      Object.entries(concernKeywords).forEach(([category, keywords]) => {
        if (keywords.some(keyword => text.includes(keyword))) {
          if (!concerns.includes(category)) {
            concerns.push(category);
          }
        }
      });
    });

    return concerns;
  }

  // Analyze emotional state
  analyzeEmotionalState(insights, conversation) {
    return {
      dominantEmotions: insights.emotional_patterns || ['neutral'],
      emotionalVolatility: this.calculateEmotionalVolatility(conversation),
      moodTrend: this.analyzeMoodTrend(conversation),
      stressIndicators: this.identifyStressIndicators(conversation),
      copingMechanisms: insights.coping_strategies || []
    };
  }

  // Get immediate actions needed
  getImmediateActions(riskAssessment, flags) {
    const actions = [];
    
    if (riskAssessment.risk_level === 'crisis' || flags.crisis_flags?.length > 0) {
      actions.push({
        priority: 'URGENT',
        action: 'Immediate crisis intervention required',
        details: 'Student shows signs of immediate danger. Contact emergency services and crisis team immediately.',
        timeline: 'Immediately'
      });
    }
    
    if (riskAssessment.safety_plan_needed) {
      actions.push({
        priority: 'HIGH',
        action: 'Develop safety plan',
        details: 'Create comprehensive safety plan with student and ensure they have crisis resources.',
        timeline: 'Within 24 hours'
      });
    }
    
    if (riskAssessment.professional_referral_needed) {
      actions.push({
        priority: 'HIGH',
        action: 'Professional referral needed',
        details: 'Student requires specialized mental health support beyond counseling scope.',
        timeline: 'Within 48 hours'
      });
    }
    
    if (flags.risk_flags?.length > 0) {
      actions.push({
        priority: 'MEDIUM',
        action: 'Schedule follow-up session',
        details: 'Student shows concerning patterns that require close monitoring.',
        timeline: 'Within 1 week'
      });
    }
    
    return actions;
  }

  // Create follow-up plan
  createFollowUpPlan(recommendations, riskAssessment) {
    return {
      immediateActions: recommendations.immediate_actions || [],
      shortTermGoals: recommendations.short_term_goals || [],
      longTermPlans: recommendations.long_term_plans || [],
      followUpSchedule: recommendations.follow_up_schedule || 'weekly',
      resourcesNeeded: recommendations.resources_needed || [],
      professionalReferrals: recommendations.professional_referrals || [],
      priorityLevel: recommendations.priority_level || 'medium',
      estimatedTimeline: recommendations.estimated_timeline || '1 month'
    };
  }

  // Get relevant resources
  getRelevantResources(insights, riskAssessment) {
    const resources = [];
    
    // Crisis resources
    if (riskAssessment.risk_level === 'crisis') {
      resources.push({
        type: 'crisis',
        name: 'Crisis Helpline',
        contact: '988 (Suicide & Crisis Lifeline)',
        description: '24/7 crisis support'
      });
    }
    
    // Mental health resources
    if (insights.main_topics?.includes('anxiety') || insights.main_topics?.includes('depression')) {
      resources.push({
        type: 'mental_health',
        name: 'Campus Counseling Center',
        contact: 'Contact campus counseling services',
        description: 'Professional mental health support'
      });
    }
    
    // Academic support
    if (insights.main_topics?.includes('academic')) {
      resources.push({
        type: 'academic',
        name: 'Academic Support Center',
        contact: 'Contact academic support services',
        description: 'Study skills, tutoring, and academic planning'
      });
    }
    
    return resources;
  }

  // Generate counselor notes
  generateCounselorNotes(insights, riskAssessment) {
    const notes = [];
    
    // Risk level notes
    if (riskAssessment.risk_level === 'crisis') {
      notes.push('CRITICAL: Student requires immediate intervention. Do not leave alone.');
    } else if (riskAssessment.risk_level === 'high') {
      notes.push('HIGH RISK: Monitor closely and schedule frequent check-ins.');
    }
    
    // Emotional state notes
    if (insights.emotional_patterns?.includes('anxious')) {
      notes.push('Student shows signs of anxiety. Consider grounding techniques and stress management strategies.');
    }
    
    if (insights.emotional_patterns?.includes('depressed')) {
      notes.push('Student shows signs of depression. Monitor for suicidal ideation and consider professional referral.');
    }
    
    // Engagement notes
    if (insights.engagement_level === 'low') {
      notes.push('Low engagement observed. May need different approach or additional support.');
    } else if (insights.engagement_level === 'high') {
      notes.push('High engagement. Student is actively participating in counseling process.');
    }
    
    // Therapeutic alliance notes
    if (insights.therapeutic_alliance === 'excellent') {
      notes.push('Strong therapeutic relationship established. Student trusts counselor.');
    } else if (insights.therapeutic_alliance === 'poor') {
      notes.push('Therapeutic relationship needs attention. Consider rapport-building activities.');
    }
    
    return notes;
  }

  // Determine priority level
  determinePriority(riskAssessment, flags) {
    if (riskAssessment.risk_level === 'crisis' || flags.crisis_flags?.length > 0) {
      return 'CRITICAL';
    } else if (riskAssessment.risk_level === 'high' || flags.risk_flags?.length > 2) {
      return 'HIGH';
    } else if (riskAssessment.risk_level === 'medium' || flags.risk_flags?.length > 0) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }

  // Helper methods
  calculateDuration(startTime, endTime) {
    if (!startTime || !endTime) return 0;
    return Math.round((new Date(endTime) - new Date(startTime)) / 1000 / 60);
  }

  assessEngagementLevel(userMessages) {
    if (userMessages.length === 0) return 'none';
    const avgLength = userMessages.reduce((sum, msg) => sum + msg.text.length, 0) / userMessages.length;
    if (avgLength > 100) return 'high';
    if (avgLength > 50) return 'medium';
    return 'low';
  }

  analyzeCommunicationStyle(userMessages) {
    const questionCount = userMessages.filter(msg => msg.text.includes('?')).length;
    const avgLength = userMessages.reduce((sum, msg) => sum + msg.text.length, 0) / userMessages.length;
    
    return {
      verbosity: avgLength > 100 ? 'detailed' : avgLength > 50 ? 'moderate' : 'concise',
      questionAsking: questionCount > userMessages.length * 0.3 ? 'high' : 'low',
      emotionalExpression: this.detectEmotionalExpression(userMessages)
    };
  }

  detectEmotionalExpression(messages) {
    const emotionalWords = ['feel', 'emotion', 'sad', 'happy', 'angry', 'anxious', 'worried', 'excited'];
    const emotionalCount = messages.reduce((count, msg) => {
      return count + emotionalWords.filter(word => msg.text.toLowerCase().includes(word)).length;
    }, 0);
    
    if (emotionalCount > messages.length * 0.5) return 'high';
    if (emotionalCount > messages.length * 0.2) return 'medium';
    return 'low';
  }

  calculateEmotionalVolatility(conversation) {
    // Simple volatility calculation based on sentiment changes
    const userMessages = conversation.filter(t => t.role === 'user');
    if (userMessages.length < 2) return 'stable';
    
    let changes = 0;
    for (let i = 1; i < userMessages.length; i++) {
      const prev = this.getSentimentScore(userMessages[i-1].text);
      const curr = this.getSentimentScore(userMessages[i].text);
      if (Math.abs(prev - curr) > 2) changes++;
    }
    
    const volatility = changes / (userMessages.length - 1);
    if (volatility > 0.5) return 'high';
    if (volatility > 0.2) return 'medium';
    return 'low';
  }

  analyzeMoodTrend(conversation) {
    const userMessages = conversation.filter(t => t.role === 'user');
    if (userMessages.length < 3) return 'stable';
    
    const early = this.getSentimentScore(userMessages.slice(0, Math.ceil(userMessages.length / 3)).map(m => m.text).join(' '));
    const late = this.getSentimentScore(userMessages.slice(-Math.ceil(userMessages.length / 3)).map(m => m.text).join(' '));
    
    if (late > early + 1) return 'improving';
    if (late < early - 1) return 'declining';
    return 'stable';
  }

  identifyStressIndicators(conversation) {
    const stressKeywords = ['stress', 'overwhelmed', 'pressure', 'tension', 'worried', 'anxious', 'panic'];
    const userMessages = conversation.filter(t => t.role === 'user');
    
    return userMessages.reduce((indicators, msg) => {
      const text = msg.text.toLowerCase();
      stressKeywords.forEach(keyword => {
        if (text.includes(keyword) && !indicators.includes(keyword)) {
          indicators.push(keyword);
        }
      });
      return indicators;
    }, []);
  }

  getSentimentScore(text) {
    // Simple sentiment scoring
    const positiveWords = ['good', 'great', 'happy', 'excited', 'confident', 'better', 'improved'];
    const negativeWords = ['bad', 'terrible', 'sad', 'angry', 'frustrated', 'worse', 'hopeless'];
    
    const positiveCount = positiveWords.filter(word => text.toLowerCase().includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.toLowerCase().includes(word)).length;
    
    return positiveCount - negativeCount;
  }

  // Fallback report generation
  generateFallbackReport(sessionId, sessionData) {
    return {
      sessionId,
      timestamp: new Date().toISOString(),
      studentInfo: {
        sessionDuration: this.calculateDuration(sessionData.startedAt, sessionData.endedAt),
        messageCount: (sessionData.turns || []).filter(t => t.role === 'user').length,
        engagementLevel: 'unknown',
        communicationStyle: { verbosity: 'unknown', questionAsking: 'unknown', emotionalExpression: 'unknown' },
        previousSessions: 0
      },
      sessionSummary: {
        duration: `${this.calculateDuration(sessionData.startedAt, sessionData.endedAt)} minutes`,
        mainTopics: ['General discussion'],
        emotionalPatterns: ['Unknown'],
        keyInsights: ['Session completed'],
        therapeuticAlliance: 'Unknown',
        engagementLevel: 'Unknown'
      },
      riskAssessment: {
        overallRisk: 'low',
        suicidalIdeation: 'none',
        selfHarmRisk: 'none',
        hopelessness: 'none',
        isolation: 'none',
        protectiveFactors: [],
        immediateConcerns: [],
        safetyPlanNeeded: false,
        professionalReferralNeeded: false,
        confidence: 0.5,
        reasoning: 'Fallback assessment',
        flags: { crisis: [], risk: [], concern: [], positive: [] }
      },
      keyConcerns: ['General'],
      emotionalState: {
        dominantEmotions: ['Unknown'],
        emotionalVolatility: 'unknown',
        moodTrend: 'stable',
        stressIndicators: [],
        copingMechanisms: []
      },
      immediateActions: [],
      followUpPlan: {
        immediateActions: [],
        shortTermGoals: ['Continue monitoring'],
        longTermPlans: ['Maintain support'],
        followUpSchedule: 'weekly',
        resourcesNeeded: [],
        professionalReferrals: [],
        priorityLevel: 'medium',
        estimatedTimeline: 'ongoing'
      },
      resources: [],
      counselorNotes: ['Standard follow-up recommended'],
      priority: 'LOW'
    };
  }
}

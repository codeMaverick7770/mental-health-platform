// Admin Dashboard Reporting System
import { LLMInsights } from './llm-insights.js';
import { CounselorReportGenerator } from './counselor-report.js';
import { calculateDepressionScore, calculateAnxietyLevel, generateRecommendations } from './counselling-protocols.js';

// Helper functions now imported from counselling-protocols.js

export class AdminReporting {
  constructor() {
    this.sessions = new Map();
    this.llmInsights = new LLMInsights();
    this.counselorReportGenerator = new CounselorReportGenerator();
    this.analytics = {
      totalSessions: 0,
      crisisInterventions: 0,
      averageSessionDuration: 0,
      commonIssues: new Map(),
      riskLevels: { low: 0, medium: 0, high: 0, crisis: 0 },
      userEngagement: new Map(),
      emotionalPatterns: new Map(),
      mainTopics: new Map(),
      copingStrategies: new Map()
    };
  }

  // Generate comprehensive session report with LLM insights
  async generateSessionReport(sessionId, sessionData) {
    try {
      // Generate LLM-powered insights
      const conversation = sessionData.turns || [];
      const flags = await this.llmInsights.generateFlags(sessionId, conversation);
      const insights = await this.llmInsights.generateInsights(sessionId, sessionData);
      const riskAssessment = await this.llmInsights.assessRisk(conversation);
      const recommendations = await this.llmInsights.generateRecommendations(sessionData, insights);

      const report = {
        sessionId,
        timestamp: new Date().toISOString(),
        duration: this.calculateDuration(sessionData.startedAt, sessionData.endedAt),
        userProfile: this.analyzeUserProfile(sessionData),
        assessments: this.processAssessments(sessionData),
        riskAnalysis: {
          ...this.analyzeRiskLevels(sessionData),
          llmAssessment: riskAssessment
        },
        recommendations: {
          ...this.generateSessionRecommendations(sessionData),
          llmRecommendations: recommendations
        },
        followUpActions: this.determineFollowUpActions(sessionData),
        adminAlerts: this.checkForAdminAlerts(sessionData),
        llmFlags: flags,
        llmInsights: insights
      };

      this.updateAnalytics(report);
      this.sessions.set(sessionId, report);
      
      return report;
    } catch (error) {
      console.error('Error generating LLM insights:', error);
      // Fallback to basic report
      return this.generateBasicSessionReport(sessionId, sessionData);
    }
  }

  // Fallback basic session report
  generateBasicSessionReport(sessionId, sessionData, opts = {}) {
    const { updateAnalytics = true } = opts;
    const report = {
      sessionId,
      timestamp: new Date().toISOString(),
      duration: this.calculateDuration(sessionData.startedAt, sessionData.endedAt),
      userProfile: this.analyzeUserProfile(sessionData),
      assessments: this.processAssessments(sessionData),
      riskAnalysis: this.analyzeRiskLevels(sessionData),
      recommendations: this.generateSessionRecommendations(sessionData),
      followUpActions: this.determineFollowUpActions(sessionData),
      adminAlerts: this.checkForAdminAlerts(sessionData),
      llmFlags: { overall_risk_level: 'low', confidence: 0.5 },
      llmInsights: { engagement_level: 'medium', main_topics: [] }
    };

    // Always cache the latest report for the session id (overwrites prior),
    // but only update aggregate analytics when explicitly requested.
    this.sessions.set(sessionId, report);
    if (updateAnalytics) this.updateAnalytics(report);
    
    return report;
  }

  // Analyze user profile and patterns
  analyzeUserProfile(sessionData) {
    const turns = sessionData.turns || [];
    const userTurns = turns.filter(t => t.role === 'user');
    
    return {
      communicationStyle: this.analyzeCommunicationStyle(userTurns),
      emotionalPatterns: this.analyzeEmotionalPatterns(userTurns),
      concerns: this.extractMainConcerns(userTurns),
      engagementLevel: this.calculateEngagementLevel(userTurns),
      previousSessions: this.getPreviousSessionCount(sessionData.userId)
    };
  }

  // Process all assessments conducted during session
  processAssessments(sessionData) {
    const assessments = {
      depression: null,
      anxiety: null,
      crisis: null,
      general: null
    };

    // Extract assessment responses from conversation
    const assessmentResponses = this.extractAssessmentResponses(sessionData.turns);
    
    if (assessmentResponses.depression) {
      assessments.depression = calculateDepressionScore(assessmentResponses.depression);
    }
    
    if (assessmentResponses.anxiety) {
      assessments.anxiety = calculateAnxietyLevel(assessmentResponses.anxiety);
    }
    
    if (assessmentResponses.crisis) {
      assessments.crisis = this.analyzeCrisisIndicators(assessmentResponses.crisis);
    }

    return assessments;
  }

  extractAssessmentResponses(turns) {
    // Simple extraction - in a real system, this would be more sophisticated
    return {
      depression: [],
      anxiety: [],
      crisis: []
    };
  }

  analyzeCrisisIndicators(responses) {
    return {
      level: 'low',
      indicators: [],
      immediateAction: false
    };
  }

  // Analyze risk levels and safety concerns
  analyzeRiskLevels(sessionData) {
    const riskFlags = sessionData.riskFlags || [];
    const riskLevel = this.determineOverallRiskLevel(riskFlags);
    
    return {
      overallRisk: riskLevel,
      specificConcerns: riskFlags.map(flag => ({
        type: flag.type,
        level: flag.level,
        timestamp: flag.timestamp,
        context: flag.context
      })),
      safetyPlan: this.generateSafetyPlan(riskLevel, riskFlags),
      immediateActions: this.getImmediateActions(riskLevel)
    };
  }

  // Generate specific recommendations for this session
  generateSessionRecommendations(sessionData) {
    const assessments = this.processAssessments(sessionData);
    const recommendations = generateRecommendations(assessments, sessionData);
    
    return {
      immediate: recommendations.filter(r => r.priority === 'urgent'),
      shortTerm: recommendations.filter(r => r.priority === 'high'),
      longTerm: recommendations.filter(r => r.priority === 'medium' || r.priority === 'low'),
      resources: this.compileResourceList(recommendations)
    };
  }

  compileResourceList(recommendations) {
    const resources = new Set();
    recommendations.forEach(rec => {
      if (rec.resources) {
        rec.resources.forEach(resource => resources.add(resource));
      }
    });
    return Array.from(resources);
  }

  // Determine follow-up actions needed
  determineFollowUpActions(sessionData) {
    const actions = [];
    const riskLevel = this.analyzeRiskLevels(sessionData).overallRisk;
    
    if (riskLevel === 'high') {
      actions.push({
        type: 'immediate_follow_up',
        priority: 'urgent',
        action: 'Schedule crisis intervention within 24 hours',
        assignedTo: 'crisis_team'
      });
    }
    
    if (riskLevel === 'medium') {
      actions.push({
        type: 'scheduled_follow_up',
        priority: 'high',
        action: 'Schedule follow-up session within 48 hours',
        assignedTo: 'counselor'
      });
    }
    
    // General follow-up
    actions.push({
      type: 'routine_follow_up',
      priority: 'medium',
      action: 'Schedule next session within 1 week',
      assignedTo: 'counselor'
    });

    return actions;
  }

  // Check for admin alerts and notifications
  checkForAdminAlerts(sessionData) {
    const alerts = [];
    const riskLevel = this.analyzeRiskLevels(sessionData).overallRisk;
    
    if (riskLevel === 'high') {
      alerts.push({
        type: 'crisis_alert',
        severity: 'critical',
        message: 'User requires immediate crisis intervention',
        timestamp: new Date().toISOString(),
        sessionId: sessionData.id
      });
    }
    
    if (sessionData.riskFlags?.length > 3) {
      alerts.push({
        type: 'multiple_risk_flags',
        severity: 'high',
        message: 'Multiple risk indicators detected in single session',
        timestamp: new Date().toISOString(),
        sessionId: sessionData.id
      });
    }

    return alerts;
  }

  // Generate admin dashboard data with LLM insights
  generateDashboardData() {
    // Compute additional analytics for policy insights
    const heatmap = this.computeMonthlyHeatmap();
    const stressTrend = this.computeStressTrend();
    // Active users: sessions seen in the last 15 minutes
    const now = Date.now();
    const fifteenMin = 15 * 60 * 1000;
    const recentCount = Array.from(this.sessions.values()).reduce((acc, r) => {
      const t = new Date(r.timestamp || r.startedAt || 0).getTime();
      return acc + ((t && (now - t) <= fifteenMin) ? 1 : 0);
    }, 0);

    // Risk distribution (primary from aggregates)
    const riskDistribution = { ...this.analytics.riskLevels };
    const riskSum = Object.values(riskDistribution).reduce((a,b)=>a+(b||0),0);
    if (riskSum === 0 && this.sessions.size > 0) {
      // Fallback: compute a lightweight distribution from cached session reports
      const fallback = { low: 0, medium: 0, high: 0, crisis: 0 };
      for (const r of this.sessions.values()) {
        let risk = (r.llmFlags?.overall_risk_level || r.riskAnalysis?.overallRisk || 'low').toString().toLowerCase();
        if (!['low','medium','high','crisis'].includes(risk)) risk = 'low';
        fallback[risk] += 1;
      }
      Object.assign(riskDistribution, fallback);
    }
    // Determine insights source: LLM if any session has non-empty llmInsights patterns/topics
    const hasLLM = Array.from(this.sessions.values()).some(r =>
      (Array.isArray(r.llmInsights?.main_topics) && r.llmInsights.main_topics.length) ||
      (Array.isArray(r.llmInsights?.emotional_patterns) && r.llmInsights.emotional_patterns.length) ||
      (Array.isArray(r.llmInsights?.coping_strategies) && r.llmInsights.coping_strategies.length)
    );

    return {
      overview: {
        // Use unique session reports count so it reflects sessions observed so far
        // without inflating per-turn. This updates as soon as a session has any activity.
        totalSessions: this.sessions.size,
        activeUsers: recentCount,
        crisisInterventions: this.analytics.crisisInterventions,
        averageSessionDuration: Math.round(this.analytics.averageSessionDuration || 0),
        insightsSource: hasLLM ? 'LLM' : 'Heuristic'
      },
      riskDistribution,
      commonIssues: Array.from(this.analytics.commonIssues.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      emotionalPatterns: Array.from(this.analytics.emotionalPatterns.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      mainTopics: Array.from(this.analytics.mainTopics.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      copingStrategies: Array.from(this.analytics.copingStrategies.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      heatmap,
      stressTrend,
      recentSessions: this.getRecentSessions(10),
      alerts: this.getActiveAlerts(),
      trends: this.calculateTrends()
    };
  }

  // Last 28-day heatmap: counts and risk mix per calendar day
  computeMonthlyHeatmap() {
    const days = 28;
    const today = new Date();
    const buckets = new Map();
    // Seed last 28 days
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0,10);
      buckets.set(key, { date: key, total: 0, low: 0, medium: 0, high: 0, crisis: 0 });
    }
    for (const report of this.sessions.values()) {
      const key = (new Date(report.timestamp)).toISOString().slice(0,10);
      if (!buckets.has(key)) continue;
      const b = buckets.get(key);
      b.total += 1;
      const risk = (report.riskAnalysis?.overallRisk || 'low').toLowerCase();
      if (b[risk] !== undefined) b[risk] += 1; else b.low += 1;
    }
    return Array.from(buckets.values()).reverse();
  }

  // Stress trend proxy: daily weighted risk score (low=1, medium=2, high=3, crisis=4)
  computeStressTrend() {
    const weight = { minimal: 0, low: 1, medium: 2, high: 3, crisis: 4 };
    const days = 28;
    const today = new Date();
    const series = [];
    for (let i = days-1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0,10);
      let total = 0, score = 0;
      for (const report of this.sessions.values()) {
        const rk = (new Date(report.timestamp)).toISOString().slice(0,10);
        if (rk !== key) continue;
        const risk = (report.riskAnalysis?.overallRisk || 'low').toLowerCase();
        score += (weight[risk] ?? 1);
        total += 1;
      }
      const avg = total ? +(score / total).toFixed(2) : 0;
      series.push({ date: key, avg });
    }
    return series;
  }

  // Generate detailed analytics report
  generateAnalyticsReport(timeframe = '30d') {
    const sessions = this.getSessionsInTimeframe(timeframe);
    
    return {
      timeframe,
      sessionMetrics: this.calculateSessionMetrics(sessions),
      userMetrics: this.calculateUserMetrics(sessions),
      riskMetrics: this.calculateRiskMetrics(sessions),
      effectivenessMetrics: this.calculateEffectivenessMetrics(sessions),
      recommendations: this.generateSystemRecommendations(sessions)
    };
  }

  // Helper methods
  calculateDuration(startTime, endTime) {
    if (!startTime || !endTime) return 0;
    return Math.round((new Date(endTime) - new Date(startTime)) / 1000 / 60); // minutes
  }

  analyzeCommunicationStyle(turns) {
    const avgLength = turns.reduce((sum, turn) => sum + turn.text.length, 0) / turns.length;
    const questionCount = turns.filter(turn => turn.text.includes('?')).length;
    
    return {
      verbosity: avgLength > 100 ? 'detailed' : avgLength > 50 ? 'moderate' : 'concise',
      questionAsking: questionCount > turns.length * 0.3 ? 'high' : 'low',
      emotionalExpression: this.detectEmotionalExpression(turns)
    };
  }

  detectEmotionalExpression(turns) {
    const emotionalWords = [
      'feel','emotion','sad','happy','angry','anxious','worried','excited','stressed','overwhelmed','panic','afraid','fear','lonely','guilty','ashamed','frustrated','hopeful','relieved'
    ];
    const emotionalCount = turns.reduce((count, turn) => {
      return count + emotionalWords.filter(word => turn.text.toLowerCase().includes(word)).length;
    }, 0);
    
    if (emotionalCount > turns.length * 0.5) return 'high';
    if (emotionalCount > turns.length * 0.2) return 'medium';
    return 'low';
  }

  analyzeEmotionalPatterns(turns) {
    const emotions = turns.map(turn => this.detectEmotion(turn.text));
    return {
      dominantEmotion: this.getMostFrequent(emotions),
      emotionalVolatility: this.calculateVolatility(emotions),
      trend: this.calculateEmotionalTrend(emotions)
    };
  }

  extractMainConcerns(turns) {
    const concerns = [];
    const keywords = {
      anxiety: ['worried','anxious','nervous','panic','fear','panic attack','restless','overthinking','racing thoughts','overwhelmed','stress','stressed'],
      depression: ['sad','hopeless','empty','worthless','depressed','down','low','no energy','fatigued','guilty','tearful'],
      relationships: ['relationship','partner','boyfriend','girlfriend','family','parent','mother','father','friend','conflict','breakup','lonely','alone'],
      work: ['work','job','career','boss','manager','colleague','office','deadline','burnout','pressure'],
      health: ['health','sick','ill','pain','medical','doctor','sleep','insomnia','appetite','headache'],
      academics: ['study','studies','exam','exams','test','grades','college','assignment','semester','procrastinate','focus','concentration'],
      self_esteem: ['confidence','self-esteem','worthless','failure','ashamed','inadequate','compare','comparison'],
      substance: ['alcohol','drink','drinking','smoke','smoking','weed','drugs','substance'],
      trauma: ['trauma','abuse','violence','harassment','bullying'],
    };

    turns.forEach(turn => {
      Object.entries(keywords).forEach(([category, words]) => {
        if (words.some(word => turn.text.toLowerCase().includes(word))) {
          concerns.push(category);
        }
      });
    });

    return [...new Set(concerns)];
  }

  calculateEngagementLevel(turns) {
    const responseCount = turns.length;
    const avgResponseLength = turns.reduce((sum, turn) => sum + turn.text.length, 0) / turns.length;
    
    if (responseCount > 10 && avgResponseLength > 50) return 'high';
    if (responseCount > 5 && avgResponseLength > 25) return 'medium';
    return 'low';
  }

  getPreviousSessionCount(userId) {
    // In a real system, this would query a database
    return 0;
  }

  determineOverallRiskLevel(riskFlags) {
    if (riskFlags.some(flag => flag.level === 'high')) return 'high';
    if (riskFlags.some(flag => flag.level === 'medium')) return 'medium';
    if (riskFlags.length > 0) return 'low';
    return 'minimal';
  }

  generateSafetyPlan(riskLevel, riskFlags) {
    const plans = {
      high: [
        'Immediate crisis intervention required',
        'Connect with emergency services if needed',
        'Ensure user has crisis helpline numbers',
        'Schedule immediate follow-up'
      ],
      medium: [
        'Regular check-ins scheduled',
        'Crisis resources provided',
        'Support system activation',
        'Professional referral if needed'
      ],
      low: [
        'Self-care strategies provided',
        'Regular monitoring scheduled',
        'Resource information shared'
      ],
      minimal: [
        'Routine follow-up scheduled',
        'Preventive resources provided'
      ]
    };

    return plans[riskLevel] || plans.minimal;
  }

  getImmediateActions(riskLevel) {
    const actions = {
      high: [
        'Alert crisis intervention team',
        'Contact emergency services if needed',
        'Ensure user safety',
        'Document all interactions'
      ],
      medium: [
        'Schedule urgent follow-up',
        'Provide crisis resources',
        'Monitor closely',
        'Document concerns'
      ],
      low: [
        'Schedule follow-up',
        'Provide resources',
        'Continue monitoring'
      ],
      minimal: [
        'Routine follow-up',
        'Standard care'
      ]
    };

    return actions[riskLevel] || actions.minimal;
  }

  updateAnalytics(report) {
    // Ensure the latest report is cached
    if (report?.sessionId) {
      const existing = this.sessions.get(report.sessionId) || {};
      this.sessions.set(report.sessionId, { ...existing, ...report });
    }

    // Recompute aggregates from all known session reports (non-inflating)
    const aggregates = {
      totalSessions: this.sessions.size,
      crisisInterventions: 0,
      averageSessionDuration: 0,
      commonIssues: new Map(),
      riskLevels: { low: 0, medium: 0, high: 0, crisis: 0 },
      userEngagement: new Map(),
      emotionalPatterns: new Map(),
      mainTopics: new Map(),
      copingStrategies: new Map()
    };

    let totalDuration = 0;
    for (const r of this.sessions.values()) {
      // Risk bucket
      let risk = (r.llmFlags?.overall_risk_level || r.riskAnalysis?.overallRisk || 'low').toString().toLowerCase();
      if (!['low','medium','high','crisis'].includes(risk)) risk = 'low';
      aggregates.riskLevels[risk] = (aggregates.riskLevels[risk] || 0) + 1;
      if (risk === 'high' || risk === 'crisis') aggregates.crisisInterventions++;

      // Duration
      totalDuration += (r.duration || 0);

      // Common issues
      (r.userProfile?.concerns || []).forEach(concern => {
        aggregates.commonIssues.set(concern, (aggregates.commonIssues.get(concern) || 0) + 1);
      });

      // Insights
      const emotionalFromLLM = r.llmInsights?.emotional_patterns || [];
      const topicFromLLM = r.llmInsights?.main_topics || [];
      const copingFromLLM = r.llmInsights?.coping_strategies || [];

      if (emotionalFromLLM.length) {
        emotionalFromLLM.forEach(p => aggregates.emotionalPatterns.set(p, (aggregates.emotionalPatterns.get(p) || 0) + 1));
      } else if (r.userProfile?.emotionalPatterns?.dominantEmotion) {
        const p = r.userProfile.emotionalPatterns.dominantEmotion;
        aggregates.emotionalPatterns.set(p, (aggregates.emotionalPatterns.get(p) || 0) + 1);
      }

      if (topicFromLLM.length) {
        topicFromLLM.forEach(t => aggregates.mainTopics.set(t, (aggregates.mainTopics.get(t) || 0) + 1));
      } else if (r.userProfile?.concerns?.length) {
        r.userProfile.concerns.forEach(t => aggregates.mainTopics.set(t, (aggregates.mainTopics.get(t) || 0) + 1));
      }

      if (copingFromLLM.length) {
        copingFromLLM.forEach(c => aggregates.copingStrategies.set(c, (aggregates.copingStrategies.get(c) || 0) + 1));
      } else if (r.recommendations) {
        const res = r.recommendations.resources || [];
        res.forEach(v => aggregates.copingStrategies.set(v, (aggregates.copingStrategies.get(v) || 0) + 1));
        const addActions = (arr=[]) => arr.forEach(a => {
          const label = a?.action || a?.type || a;
          if (!label) return;
          aggregates.copingStrategies.set(label, (aggregates.copingStrategies.get(label) || 0) + 1);
        });
        addActions(r.recommendations.immediate || r.recommendations.immediate_actions);
        addActions(r.recommendations.shortTerm || r.recommendations.short_term_goals);
        addActions(r.recommendations.longTerm || r.recommendations.long_term_plans);
      }
    }

    aggregates.averageSessionDuration = aggregates.totalSessions ? (totalDuration / aggregates.totalSessions) : 0;
    this.analytics = aggregates;
  }

  // Additional helper methods would be implemented here...
  detectEmotion(text) {
    // Simple emotion detection - would be enhanced with NLP
    const t = text.toLowerCase();
    const positiveWords = ['good','great','happy','excited','confident','relieved','hopeful','better','calm'];
    const negativeWords = ['bad','terrible','sad','angry','frustrated','stressed','anxious','panic','overwhelmed','afraid','lonely','hopeless','guilty','ashamed'];
    const positiveCount = positiveWords.filter(word => t.includes(word)).length;
    const negativeCount = negativeWords.filter(word => t.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  getMostFrequent(array) {
    const counts = {};
    array.forEach(item => counts[item] = (counts[item] || 0) + 1);
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }

  calculateVolatility(emotions) {
    let changes = 0;
    for (let i = 1; i < emotions.length; i++) {
      if (emotions[i] !== emotions[i-1]) changes++;
    }
    return changes / emotions.length;
  }

  calculateEmotionalTrend(emotions) {
    const positive = emotions.filter(e => e === 'positive').length;
    const negative = emotions.filter(e => e === 'negative').length;
    const neutral = emotions.filter(e => e === 'neutral').length;
    
    if (positive > negative && positive > neutral) return 'improving';
    if (negative > positive && negative > neutral) return 'declining';
    return 'stable';
  }

  // Missing methods that the dashboard needs
  getRecentSessions(limit = 10) {
    return Array.from(this.sessions.values())
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  getActiveAlerts() {
    // Return any active alerts
    return [];
  }

  calculateTrends() {
    // Calculate trends over time
    return {
      sessionsPerDay: 0,
      averageRiskLevel: 'low',
      commonConcerns: []
    };
  }

  getSessionsInTimeframe(timeframe) {
    // Return sessions within timeframe
    return Array.from(this.sessions.values());
  }

  calculateSessionMetrics(sessions) {
    return {
      totalSessions: sessions.length,
      averageDuration: 0,
      completionRate: 0
    };
  }

  calculateUserMetrics(sessions) {
    return {
      uniqueUsers: 0,
      averageSessionsPerUser: 0,
      retentionRate: 0
    };
  }

  calculateRiskMetrics(sessions) {
    return {
      highRiskSessions: 0,
      crisisInterventions: 0,
      safetyPlansGenerated: 0
    };
  }

  calculateEffectivenessMetrics(sessions) {
    return {
      userSatisfaction: 0,
      goalAchievement: 0,
      followUpCompletion: 0
    };
  }

  generateSystemRecommendations(sessions) {
    return [
      'Monitor high-risk sessions closely',
      'Increase follow-up frequency for medium-risk users',
      'Consider additional training for crisis intervention'
    ];
  }

  // Generate counselor report for college counselors
  async generateCounselorReport(sessionId, sessionData) {
    try {
      return await this.counselorReportGenerator.generateCounselorReport(sessionId, sessionData);
    } catch (error) {
      console.error('Error generating counselor report:', error);
      return this.counselorReportGenerator.generateFallbackReport(sessionId, sessionData);
    }
  }
}

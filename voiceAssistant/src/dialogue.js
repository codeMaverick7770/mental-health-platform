import { SmartCounselor } from './smart-counselor.js';
import { AdminReporting } from './admin-reporting.js';


// Enhanced counseling session management
const activeSessions = new Map();
const adminReporting = new AdminReporting();
const smartCounselor = new SmartCounselor();

export async function createResponse(userText, { locale = 'en-IN', risk = {}, priorTurns = [], sessionId = null } = {}) {
  const clean = (userText || '').trim();
  
  // Initialize or get session data
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
  
  let session = activeSessions.get(sessionId);
  if (!session) {
    session = {
      sessionId,
      startedAt: new Date().toISOString(),
      turns: priorTurns || [],
      riskFlags: [],
      userProfile: {
        concerns: [],
        copingStrategies: [],
        supportSystems: []
      }
    };
    activeSessions.set(sessionId, session);
  }

  // Add user turn to session
  session.turns.push({
    role: 'user',
    text: clean,
    timestamp: new Date().toISOString(),
    risk: risk
  });

  // Handle empty input
  if (!clean) {
    const response = "I'm here to listen. Please share what's on your mind.";
    session.turns.push({ role: 'assistant', text: response, timestamp: new Date().toISOString() });
    return { reply: response, risk: { level: 'low' }, sessionId, session };
  }

  try {
    // Use smart counselor to generate response
    const counselorResponse = await smartCounselor.generateResponse(clean, sessionId, {
      locale,
      risk,
      priorTurns,
      session
    });

    // Add assistant turn to session
    session.turns.push({
      role: 'assistant',
      text: counselorResponse.reply,
      timestamp: new Date().toISOString(),
      analysis: counselorResponse.analysis
    });

    // Update risk level based on counselor analysis
    const riskLevel = counselorResponse.analysis?.urgencyLevel === 'crisis' ? 'crisis' :
                     counselorResponse.analysis?.urgencyLevel === 'high' ? 'high' :
                     counselorResponse.analysis?.urgencyLevel === 'medium' ? 'medium' : 'low';

    // Build action plan for client app to act on
    const actionPlan = buildActionPlan(riskLevel, locale);

    // Update session risk flags
    if (counselorResponse.analysis?.riskIndicators) {
      counselorResponse.analysis.riskIndicators.forEach(indicator => {
        if (!session.riskFlags.includes(indicator)) {
          session.riskFlags.push(indicator);
        }
      });
    }

    // Update user profile
    if (counselorResponse.analysis?.mainConcerns) {
      counselorResponse.analysis.mainConcerns.forEach(concern => {
        if (!session.userProfile.concerns.includes(concern)) {
          session.userProfile.concerns.push(concern);
        }
      });
    }

    if (Array.isArray(counselorResponse.analysis?.copingMechanisms)) {
      counselorResponse.analysis.copingMechanisms.forEach(strategy => {
        if (!session.userProfile.copingStrategies.includes(strategy)) {
          session.userProfile.copingStrategies.push(strategy);
        }
      });
    }

    return { 
      reply: counselorResponse.reply, 
      risk: { level: riskLevel }, 
      sessionId,
      analysis: counselorResponse.analysis,
      actionPlan,
      session
    };
  } catch (error) {
    console.error('Error in smart counselor:', error);
    
    // Fallback to basic response
    const fallbackResponse = "I'm here to listen and support you. Can you tell me more about what you're experiencing?";
    session.turns.push({ role: 'assistant', text: fallbackResponse, timestamp: new Date().toISOString() });
    
    return { 
      reply: fallbackResponse, 
      risk: { level: 'low' }, 
      sessionId,
      session
    };
  }
}

// Risk-based action planner for client integration
function buildActionPlan(riskLevel, locale) {
  const lowResources = [
    { type: 'exercise', title: '4-7-8 breathing (1 minute)', code: 'breath_478' },
    { type: 'exercise', title: '5-4-3-2-1 grounding', code: 'ground_54321' },
    { type: 'guide', title: 'CBT reframing prompt', code: 'cbt_reframe' },
    { type: 'link', title: 'Sleep hygiene tips', url: 'https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/sleep/' }
  ];

  if (riskLevel === 'high' || riskLevel === 'crisis') {
    return {
      level: riskLevel,
      sos: true,
      suggestHelplines: true,
      requestBookingConsent: true,
      peerOffer: false,
      resources: lowResources.slice(0, 2)
    };
  }
  if (riskLevel === 'medium') {
    return {
      level: 'medium',
      screeningPrompt: 'Would you like to do a 1-minute check with a few questions (like PHQ-9/GAD-7 style) to understand how intense this feels?',
      requestPeerConsent: true,
      resources: lowResources
    };
  }
  return {
    level: 'low',
    cbtSuggestion: 'Try a tiny CBT step: write the thought → find evidence for/against → reframe into a kinder alternative.',
    resources: lowResources
  };
}

// Export session data for admin reporting
export function getSessionData(sessionId) {
  const session = activeSessions.get(sessionId);
  if (!session) return null;
  
  // Get additional data from smart counselor
  const counselorData = smartCounselor.getSessionData(sessionId);
  
  return {
    ...session,
    counselorContext: counselorData?.context,
    conversation: counselorData?.conversation || session.turns,
    duration: counselorData?.duration || 0,
    turnCount: counselorData?.turnCount || session.turns.length
  };
}

// Generate admin report for session
export async function generateAdminReport(sessionId) {
  const session = activeSessions.get(sessionId);
  if (!session) return null;
  
  try {
    return await adminReporting.generateSessionReport(sessionId, session);
  } catch (error) {
    console.error('Error generating admin report:', error);
    return adminReporting.generateBasicSessionReport(sessionId, session);
  }
}



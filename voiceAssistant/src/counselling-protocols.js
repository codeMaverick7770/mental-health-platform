// Standard Counseling Protocols and Assessment Tools
export const COUNSELING_PROTOCOLS = {
  // Initial Assessment Protocol
  INITIAL_ASSESSMENT: {
    name: "Initial Assessment",
    steps: [
      {
        id: "mood_check",
        question: "On a scale of 1-10, how would you rate your current mood?",
        type: "scale",
        followUp: "What's contributing to this mood today?"
      },
      {
        id: "sleep_patterns",
        question: "How has your sleep been over the past week?",
        type: "open",
        followUp: "Are you having trouble falling asleep, staying asleep, or waking up too early?"
      },
      {
        id: "stress_levels",
        question: "What's been the biggest source of stress in your life recently?",
        type: "open",
        followUp: "How are you currently coping with this stress?"
      },
      {
        id: "support_system",
        question: "Who do you have in your life that you can talk to about difficult things?",
        type: "open",
        followUp: "Do you feel comfortable reaching out to them when you need support?"
      }
    ]
  },

  // Crisis Assessment Protocol
  CRISIS_ASSESSMENT: {
    name: "Crisis Assessment",
    steps: [
      {
        id: "safety_check",
        question: "Are you having any thoughts of hurting yourself or others?",
        type: "yes_no",
        critical: true,
        immediateAction: "crisis_intervention"
      },
      {
        id: "support_available",
        question: "Do you have someone you can be with right now?",
        type: "yes_no",
        critical: true
      },
      {
        id: "crisis_plan",
        question: "Do you have a safety plan for when you feel this way?",
        type: "yes_no",
        critical: true
      }
    ]
  },

  // Anxiety Assessment Protocol
  ANXIETY_ASSESSMENT: {
    name: "Anxiety Assessment",
    steps: [
      {
        id: "anxiety_triggers",
        question: "What situations or thoughts make you feel most anxious?",
        type: "open",
        followUp: "How often do these feelings occur?"
      },
      {
        id: "physical_symptoms",
        question: "Do you experience physical symptoms when anxious? (racing heart, sweating, etc.)",
        type: "yes_no",
        followUp: "Which physical symptoms bother you most?"
      },
      {
        id: "avoidance_behaviors",
        question: "Are there things you avoid doing because of anxiety?",
        type: "yes_no",
        followUp: "How is this affecting your daily life?"
      }
    ]
  },

  // Depression Screening Protocol
  DEPRESSION_SCREENING: {
    name: "Depression Screening (PHQ-9 Based)",
    steps: [
      {
        id: "interest_pleasure",
        question: "Over the past 2 weeks, have you had little interest or pleasure in doing things?",
        type: "frequency",
        scale: ["Not at all", "Several days", "More than half the days", "Nearly every day"]
      },
      {
        id: "feeling_down",
        question: "Over the past 2 weeks, have you been feeling down, depressed, or hopeless?",
        type: "frequency",
        scale: ["Not at all", "Several days", "More than half the days", "Nearly every day"]
      },
      {
        id: "sleep_problems",
        question: "Over the past 2 weeks, have you had trouble falling or staying asleep, or sleeping too much?",
        type: "frequency",
        scale: ["Not at all", "Several days", "More than half the days", "Nearly every day"]
      },
      {
        id: "energy_levels",
        question: "Over the past 2 weeks, have you been feeling tired or having little energy?",
        type: "frequency",
        scale: ["Not at all", "Several days", "More than half the days", "Nearly every day"]
      }
    ]
  }
};

// Counseling Techniques and Interventions
export const COUNSELING_TECHNIQUES = {
  ACTIVE_LISTENING: {
    name: "Active Listening",
    responses: [
      "I hear that you're feeling...",
      "It sounds like this is really difficult for you...",
      "I can sense the pain in what you're sharing...",
      "Thank you for trusting me with this..."
    ]
  },

  REFLECTIVE_QUESTIONING: {
    name: "Reflective Questioning",
    questions: [
      "What do you think might be contributing to this feeling?",
      "How would you like things to be different?",
      "What would you say to a friend in this situation?",
      "What's one small step you could take today?"
    ]
  },

  COGNITIVE_RESTRUCTURING: {
    name: "Cognitive Restructuring",
    techniques: [
      "Let's examine the evidence for this thought...",
      "What's another way to look at this situation?",
      "What would you tell a friend who had this thought?",
      "Is this thought helping or hurting you right now?"
    ]
  },

  GROUNDING_TECHNIQUES: {
    name: "Grounding Techniques",
    exercises: [
      "Let's try the 5-4-3-2-1 technique: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.",
      "Take three deep breaths with me: In for 4, hold for 4, out for 6.",
      "Let's focus on your feet on the ground. Feel the support beneath you.",
      "Name three things you're grateful for right now, no matter how small."
    ]
  }
};

// Session Structure Templates
export const SESSION_TEMPLATES = {
  WELCOME: {
    greeting: "Hello, I'm Asha, your digital counselor. I'm here to listen and support you today. How are you feeling right now?",
    consent: "Before we begin, I want to remind you that our conversation is confidential. However, if you express thoughts of harming yourself or others, I may need to connect you with immediate help. Is that okay with you?",
    structure: "We'll start with a brief check-in, then explore what's on your mind, and end with some practical next steps. Does that sound good?"
  },

  CLOSING: {
    summary: "Let me summarize what we've discussed today...",
    next_steps: "Here are some things you might consider doing before our next conversation...",
    resources: "I want to share some resources that might be helpful...",
    goodbye: "Thank you for sharing with me today. Remember, you're not alone, and it's okay to reach out for help. Take care of yourself."
  }
};

// Assessment Scoring Functions
export function calculateDepressionScore(responses) {
  const scores = responses.map(r => r.score || 0);
  const total = scores.reduce((sum, score) => sum + score, 0);
  
  if (total >= 20) return { level: 'severe', score: total, recommendation: 'immediate_professional_help' };
  if (total >= 15) return { level: 'moderately_severe', score: total, recommendation: 'professional_help' };
  if (total >= 10) return { level: 'moderate', score: total, recommendation: 'monitoring_and_support' };
  if (total >= 5) return { level: 'mild', score: total, recommendation: 'self_care_and_monitoring' };
  return { level: 'minimal', score: total, recommendation: 'maintenance' };
}

export function calculateAnxietyLevel(responses) {
  const anxietyIndicators = responses.filter(r => r.anxiety_related).length;
  const severity = responses.reduce((sum, r) => sum + (r.severity || 0), 0);
  
  if (anxietyIndicators >= 5 && severity >= 15) return 'high';
  if (anxietyIndicators >= 3 && severity >= 10) return 'moderate';
  if (anxietyIndicators >= 1) return 'mild';
  return 'minimal';
}

// Generate Session Recommendations
export function generateRecommendations(assessments, sessionData) {
  const recommendations = [];
  
  // Depression recommendations
  if (assessments.depression?.level === 'severe') {
    recommendations.push({
      priority: 'urgent',
      type: 'crisis_intervention',
      action: 'Connect with crisis helpline immediately',
      resources: ['National Suicide Prevention Lifeline', 'Crisis Text Line']
    });
  }
  
  // Anxiety recommendations
  if (assessments.anxiety === 'high') {
    recommendations.push({
      priority: 'high',
      type: 'therapeutic_intervention',
      action: 'Practice grounding techniques daily',
      resources: ['Breathing exercises', 'Progressive muscle relaxation']
    });
  }
  
  // Sleep recommendations
  if (assessments.sleep?.issues) {
    recommendations.push({
      priority: 'medium',
      type: 'lifestyle_intervention',
      action: 'Implement sleep hygiene practices',
      resources: ['Sleep schedule', 'Bedroom environment optimization']
    });
  }
  
  // General wellness
  recommendations.push({
    priority: 'low',
    type: 'maintenance',
    action: 'Continue regular check-ins',
    resources: ['Daily mood tracking', 'Self-care activities']
  });
  
  return recommendations;
}

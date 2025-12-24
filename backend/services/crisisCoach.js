/**
 * Crisis Coach Service - High-Pressure Business Scenarios
 * Pushes users to their limit in realistic crisis situations
 * Tracks jargon accuracy, tone analysis, and provides diplomatic solutions
 */

const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const linguisticAuditor = require('./linguisticAuditor');
const levelingService = require('./levelingService');

// Crisis Scenarios - Each with specific context and pressure points
const CRISIS_SCENARIOS = {
  production_outage: {
    id: 'production_outage',
    title: 'The Production Outage',
    description: 'The main database is down, the CEO is on the Slack channel asking for updates. What do you say?',
    difficulty: 'high',
    duration_minutes: 10,
    context: {
      situation: 'Critical production database failure during peak hours',
      stakeholders: ['CEO', 'CTO', 'Engineering Team', 'Customer Support'],
      time_pressure: 'Customers are reporting errors, revenue at risk',
      expected_actions: ['Acknowledge issue', 'Provide timeline', 'Outline steps', 'Stay calm']
    },
    target_jargon: [
      'bottleneck', 'rollback', 'root cause', 'postmortem', 'post-mortem',
      'triage', 'incident', 'mitigation', 'downtime', 'degradation',
      'failover', 'backup', 'restore', 'RCA', 'SLA', 'escalate',
      'hotfix', 'patch', 'monitoring', 'alert', 'troubleshoot'
    ],
    negative_phrases: [
      "it's not my fault", "someone else", "i don't know", "i'm not sure",
      "maybe", "probably", "i think", "blame", "not my responsibility",
      "can't do anything", "impossible", "too late", "give up"
    ],
    positive_phrases: [
      'investigating', 'working on', 'identified', 'resolving', 'implementing',
      'timeline', 'update', 'progress', 'solution', 'backup plan',
      'team is', 'we are', 'currently', 'expect', 'ETA', 'estimate'
    ],
    diplomatic_template: "We are currently triaging the issue and expect a full post-mortem by EOD. The team has identified potential root causes and is implementing mitigation strategies to restore service.",
    coach_personality: {
      initial_patience: 2, // 1-10 scale (2 = very impatient)
      pressure_increase_rate: 0.5, // How quickly impatience grows
      interruption_frequency: 'high', // How often coach interrupts
      tone: 'demanding'
    }
  },
  
  investor_meeting: {
    id: 'investor_meeting',
    title: 'The Investor Pitch Crisis',
    description: 'Your product demo just crashed during a Series A pitch. The lead investor is waiting. How do you recover?',
    difficulty: 'extreme',
    duration_minutes: 10,
    context: {
      situation: 'Live demo failure in front of potential $5M investment',
      stakeholders: ['Lead Investor', 'Investment Committee', 'Your CEO'],
      time_pressure: 'Investors are losing confidence in real-time',
      expected_actions: ['Pivot smoothly', 'Show backup plan', 'Maintain confidence', 'Explain value']
    },
    target_jargon: [
      'MVP', 'scalability', 'architecture', 'redundancy', 'failsafe',
      'revenue', 'growth', 'metrics', 'KPI', 'conversion', 'retention',
      'roadmap', 'milestone', 'deliverable', 'sprint', 'iteration'
    ],
    negative_phrases: [
      'never happened before', 'bad luck', 'usually works', 'weird',
      'not supposed to', 'should have', 'if only', 'excuse'
    ],
    positive_phrases: [
      'alternative approach', 'walk you through', 'core functionality',
      'proven results', 'customer feedback', 'metrics show', 'data indicates'
    ],
    diplomatic_template: "While the live demo encountered a technical issue, let me walk you through our proven results with live customer data. Our metrics show 40% month-over-month growth, and I can provide a detailed technical architecture review.",
    coach_personality: {
      initial_patience: 1,
      pressure_increase_rate: 0.7,
      interruption_frequency: 'very high',
      tone: 'skeptical'
    }
  },
  
  client_escalation: {
    id: 'client_escalation',
    title: 'The Angry Client Escalation',
    description: 'A major client threatens to cancel their $100K contract due to repeated bugs. They want answers NOW.',
    difficulty: 'high',
    duration_minutes: 10,
    context: {
      situation: 'Premium client experiencing critical issues for 3 days',
      stakeholders: ['Client VP', 'Their Engineering Team', 'Your Sales Team'],
      time_pressure: 'Contract cancellation deadline in 24 hours',
      expected_actions: ['Acknowledge pain', 'Show empathy', 'Provide concrete plan', 'Offer compensation']
    },
    target_jargon: [
      'SLA', 'uptime', 'compensation', 'service credit', 'priority support',
      'dedicated team', 'account manager', 'escalation path', 'resolution',
      'preventive measures', 'quality assurance', 'testing protocol'
    ],
    negative_phrases: [
      'not that bad', 'overreacting', 'other clients', 'normal',
      'just wait', 'be patient', 'terms and conditions', 'can\'t help'
    ],
    positive_phrases: [
      'understand your frustration', 'completely unacceptable', 'taking this seriously',
      'dedicated resources', 'personal attention', 'compensation package',
      'make this right', 'priority one', 'direct line to me'
    ],
    diplomatic_template: "I completely understand your frustration, and this is unacceptable. I'm assigning a dedicated team to resolve this today, and we'll provide service credits plus 3 months of priority support. You have my direct line for any issues.",
    coach_personality: {
      initial_patience: 1,
      pressure_increase_rate: 0.6,
      interruption_frequency: 'high',
      tone: 'frustrated'
    }
  }
};

// Impatient Coach Responses - Escalating pressure
const IMPATIENT_RESPONSES = {
  too_slow: [
    "Come on, faster! The CEO is waiting!",
    "We don't have time for long explanations. Get to the point!",
    "That took too long. In a real crisis, you'd have lost them.",
    "Speed it up! Every second counts in production outages!",
    "The stakeholders are getting impatient. What's your answer?!"
  ],
  vague_answer: [
    "That's too vague! Give me specifics!",
    "'Working on it' isn't good enough. What EXACTLY are you doing?",
    "The CEO wants DETAILS, not generic responses!",
    "Be more specific! What's the timeline? What's the root cause?",
    "That's corporate speak. Give me real answers!"
  ],
  defensive_tone: [
    "Don't get defensive! Take ownership of the situation!",
    "Stop making excuses and start solving the problem!",
    "I hear blame-shifting. The CEO wants solutions, not excuses!",
    "Defensive responses make it worse. Show leadership!",
    "Own the problem! Blaming others loses stakeholder trust!"
  ],
  missing_jargon: [
    "Use technical terms! Show you understand the problem!",
    "Where's the technical depth? Talk like an engineer!",
    "You need to use proper terminology. Say 'rollback' or 'root cause'!",
    "Too casual! Use professional IT jargon!",
    "The CTO is on this call. Use proper technical language!"
  ],
  good_progress: [
    "Better! But can you say it in 10 seconds?",
    "Good technical detail, but what's the ETA?",
    "I like the jargon, but add more reassurance!",
    "Strong answer, but speed it up!",
    "You're getting there. Now make it more diplomatic!"
  ],
  excellent: [
    "Perfect! That's exactly what stakeholders need to hear!",
    "Excellent! Clear, technical, and reassuring!",
    "That's the level we need! Calm, professional, solution-focused!",
    "Outstanding crisis communication! Keep this energy!",
    "Yes! Technical accuracy + diplomatic tone = success!"
  ]
};

// Active Crisis Sessions Storage
const activeSessions = new Map();

/**
 * Start a new crisis coaching session
 */
function startCrisisSession(userId, scenarioId = 'production_outage') {
  const scenario = CRISIS_SCENARIOS[scenarioId];
  
  if (!scenario) {
    throw new Error(`Invalid scenario: ${scenarioId}. Available: ${Object.keys(CRISIS_SCENARIOS).join(', ')}`);
  }
  
  const sessionId = `crisis_${userId}_${Date.now()}`;
  const session = {
    sessionId,
    userId,
    scenario,
    startTime: Date.now(),
    endTime: null,
    phase: 'setup',
    messages: [],
    metrics: {
      jargon_used: [], // Array of technical terms used
      jargon_score: 0, // 0-10
      tone_signals: {
        defensive: 0,
        resolutive: 0,
        vague: 0,
        specific: 0
      },
      tone_classification: 'neutral', // defensive, resolutive, vague, neutral
      response_times: [], // Array of response times in seconds
      avg_response_time: 0,
      pressure_resistance: 0, // 0-10 - How well user handles pressure
      interruption_count: 0,
      coach_patience_level: scenario.coach_personality.initial_patience
    },
    crisis_report: null
  };
  
  activeSessions.set(sessionId, session);
  
  // Initial setup message
  const setupMessage = {
    role: 'coach',
    content: `🚨 **CRISIS SCENARIO: ${scenario.title}**\n\n${scenario.description}\n\n**Context:**\n- Situation: ${scenario.context.situation}\n- Stakeholders: ${scenario.context.stakeholders.join(', ')}\n- Pressure: ${scenario.context.time_pressure}\n\n**You have ${scenario.duration_minutes} minutes. The clock is ticking. What do you say? GO!**`,
    timestamp: Date.now(),
    pressure_level: 'high'
  };
  
  session.messages.push(setupMessage);
  session.phase = 'active_crisis';
  session.lastMessageTime = Date.now();
  
  return {
    sessionId,
    scenario: {
      id: scenario.id,
      title: scenario.title,
      description: scenario.description,
      difficulty: scenario.difficulty,
      duration_minutes: scenario.duration_minutes
    },
    message: setupMessage.content,
    timeRemaining: scenario.duration_minutes * 60
  };
}

/**
 * Process user's crisis response and provide impatient coaching
 */
function processCrisisResponse(sessionId, userMessage) {
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    throw new Error('Invalid session ID or session expired');
  }
  
  if (session.phase === 'completed') {
    return {
      error: 'Session already completed',
      crisis_report: session.crisis_report
    };
  }
  
  const now = Date.now();
  const elapsed = (now - session.startTime) / 1000; // seconds
  const timeLimit = session.scenario.duration_minutes * 60;
  
  // Check if time is up
  if (elapsed >= timeLimit) {
    return endCrisisSession(sessionId);
  }
  
  // Calculate response time
  const responseTime = (now - session.lastMessageTime) / 1000;
  session.metrics.response_times.push(responseTime);
  session.lastMessageTime = now;
  
  // Store user message
  session.messages.push({
    role: 'user',
    content: userMessage,
    timestamp: now,
    response_time: responseTime
  });
  
  // ===== LINGUISTIC AUDIT INTEGRATION =====
  // Perform comprehensive linguistic analysis
  const linguisticAudit = linguisticAuditor.auditResponse(
    userMessage, 
    session.scenario.context.situation
  );
  
  // Record audit in leveling system
  const levelingResult = levelingService.recordAudit(session.userId, linguisticAudit);
  
  // Store audit in session for final report
  session.linguistic_audits = session.linguistic_audits || [];
  session.linguistic_audits.push({
    timestamp: now,
    audit: linguisticAudit,
    leveling_result: levelingResult
  });
  // ===== END LINGUISTIC AUDIT =====
  
  // Analyze the response
  const analysis = analyzeCrisisResponse(userMessage, session);
  
  // Update metrics
  updateSessionMetrics(session, analysis);
  
  // Decrease coach patience based on response quality
  adjustCoachPatience(session, analysis);
  
  // Generate impatient coach response
  const coachResponse = generateImpatientResponse(session, analysis, responseTime);
  
  // Store coach message
  session.messages.push({
    role: 'coach',
    content: coachResponse.message,
    timestamp: Date.now(),
    pressure_level: coachResponse.pressure_level,
    feedback: coachResponse.feedback
  });
  
  // Check if should interrupt (high pressure scenarios)
  if (shouldInterrupt(session)) {
    session.metrics.interruption_count++;
  }
  
  const timeRemaining = Math.max(0, timeLimit - elapsed);
  
  // Prepare response with linguistic audit results
  const response = {
    sessionId,
    coachMessage: coachResponse.message,
    feedback: coachResponse.feedback,
    pressure_level: coachResponse.pressure_level,
    timeRemaining: Math.floor(timeRemaining),
    metrics: {
      jargon_score: session.metrics.jargon_score,
      tone: session.metrics.tone_classification,
      coach_patience: session.metrics.coach_patience_level
    },
    linguistic_audit: {
      detected_level: linguisticAudit.current_level,
      confidence: linguisticAudit.confidence_percentage,
      soft_skill_score: linguisticAudit.soft_skill_score,
      top_mistake: linguisticAudit.top_3_mistakes[0] || null,
      power_vocab_tip: linguisticAudit.power_vocabulary_suggestion
    }
  };
  
  // Add level-up notification if triggered
  if (levelingResult.level_up_triggered) {
    response.level_up_notification = levelingResult.notification;
    response.achievement_unlocked = true;
  }
  
  return response;
}

/**
 * Analyze user's crisis response for jargon, tone, and effectiveness
 */
function analyzeCrisisResponse(message, session) {
  const lowerMessage = message.toLowerCase();
  const tokens = tokenizer.tokenize(lowerMessage);
  
  const analysis = {
    jargon_found: [],
    jargon_count: 0,
    negative_phrases_found: [],
    positive_phrases_found: [],
    is_defensive: false,
    is_resolutive: false,
    is_vague: false,
    is_specific: false,
    word_count: tokens.length,
    has_timeline: false,
    has_ownership: false,
    quality_score: 0
  };
  
  // Check for target jargon
  session.scenario.target_jargon.forEach(term => {
    if (lowerMessage.includes(term.toLowerCase())) {
      analysis.jargon_found.push(term);
    }
  });
  analysis.jargon_count = analysis.jargon_found.length;
  
  // Check for negative phrases (defensive tone)
  session.scenario.negative_phrases.forEach(phrase => {
    if (lowerMessage.includes(phrase.toLowerCase())) {
      analysis.negative_phrases_found.push(phrase);
      analysis.is_defensive = true;
    }
  });
  
  // Check for positive phrases (resolutive tone)
  session.scenario.positive_phrases.forEach(phrase => {
    if (lowerMessage.includes(phrase.toLowerCase())) {
      analysis.positive_phrases_found.push(phrase);
      analysis.is_resolutive = true;
    }
  });
  
  // Check for timeline indicators
  const timelineKeywords = ['eta', 'by eod', 'within', 'minutes', 'hours', 'expect', 'timeline'];
  analysis.has_timeline = timelineKeywords.some(kw => lowerMessage.includes(kw));
  
  // Check for ownership
  const ownershipKeywords = ['we are', 'i am', 'our team', 'taking responsibility', 'working on'];
  analysis.has_ownership = ownershipKeywords.some(kw => lowerMessage.includes(kw));
  
  // Determine if vague or specific
  if (analysis.word_count < 15 && analysis.jargon_count === 0) {
    analysis.is_vague = true;
  } else if (analysis.jargon_count >= 2 && analysis.has_timeline && analysis.has_ownership) {
    analysis.is_specific = true;
  }
  
  // Calculate quality score (0-10)
  let score = 5; // Base score
  score += analysis.jargon_count * 0.5; // +0.5 per jargon term
  score += analysis.positive_phrases_found.length * 0.5; // +0.5 per positive phrase
  score -= analysis.negative_phrases_found.length * 1; // -1 per negative phrase
  score += analysis.has_timeline ? 1 : 0;
  score += analysis.has_ownership ? 1 : 0;
  score += analysis.is_specific ? 1 : -1;
  score -= analysis.is_defensive ? 2 : 0;
  
  analysis.quality_score = Math.max(0, Math.min(10, score));
  
  return analysis;
}

/**
 * Update session metrics based on response analysis
 */
function updateSessionMetrics(session, analysis) {
  // Add new jargon terms
  analysis.jargon_found.forEach(term => {
    if (!session.metrics.jargon_used.includes(term)) {
      session.metrics.jargon_used.push(term);
    }
  });
  
  // Update jargon score (0-10)
  const uniqueJargon = session.metrics.jargon_used.length;
  const targetJargonCount = session.scenario.target_jargon.length;
  session.metrics.jargon_score = Math.min(10, (uniqueJargon / targetJargonCount) * 10);
  
  // Update tone signals
  if (analysis.is_defensive) session.metrics.tone_signals.defensive++;
  if (analysis.is_resolutive) session.metrics.tone_signals.resolutive++;
  if (analysis.is_vague) session.metrics.tone_signals.vague++;
  if (analysis.is_specific) session.metrics.tone_signals.specific++;
  
  // Classify overall tone
  const signals = session.metrics.tone_signals;
  if (signals.defensive > signals.resolutive) {
    session.metrics.tone_classification = 'defensive';
  } else if (signals.resolutive > signals.defensive && signals.specific > signals.vague) {
    session.metrics.tone_classification = 'resolutive';
  } else if (signals.vague > signals.specific) {
    session.metrics.tone_classification = 'vague';
  } else {
    session.metrics.tone_classification = 'neutral';
  }
  
  // Calculate average response time
  if (session.metrics.response_times.length > 0) {
    const sum = session.metrics.response_times.reduce((a, b) => a + b, 0);
    session.metrics.avg_response_time = sum / session.metrics.response_times.length;
  }
  
  // Calculate pressure resistance (0-10)
  // Based on: quality of responses, response times, jargon usage, tone
  let resistance = 5;
  resistance += session.metrics.jargon_score * 0.2;
  resistance += (session.metrics.tone_signals.resolutive / Math.max(1, session.messages.length)) * 3;
  resistance -= (session.metrics.tone_signals.defensive / Math.max(1, session.messages.length)) * 2;
  resistance -= Math.min(3, session.metrics.avg_response_time / 10); // Penalty for slow responses
  
  session.metrics.pressure_resistance = Math.max(0, Math.min(10, resistance));
}

/**
 * Adjust coach's patience level based on response quality
 */
function adjustCoachPatience(session, analysis) {
  const currentPatience = session.metrics.coach_patience_level;
  const pressureRate = session.scenario.coach_personality.pressure_increase_rate;
  
  // Decrease patience over time (crisis fatigue)
  session.metrics.coach_patience_level -= pressureRate;
  
  // Good responses restore some patience
  if (analysis.quality_score >= 7) {
    session.metrics.coach_patience_level += 0.5;
  }
  
  // Bad responses decrease patience faster
  if (analysis.quality_score <= 3) {
    session.metrics.coach_patience_level -= 1;
  }
  
  // Clamp between 0-10
  session.metrics.coach_patience_level = Math.max(0, Math.min(10, session.metrics.coach_patience_level));
}

/**
 * Generate impatient coach response based on analysis
 */
function generateImpatientResponse(session, analysis, responseTime) {
  let message = '';
  let feedback = [];
  let pressureLevel = 'medium';
  
  const patience = session.metrics.coach_patience_level;
  
  // Determine pressure level
  if (patience <= 2) {
    pressureLevel = 'extreme';
  } else if (patience <= 5) {
    pressureLevel = 'high';
  } else if (patience <= 7) {
    pressureLevel = 'medium';
  } else {
    pressureLevel = 'low';
  }
  
  // Response took too long
  if (responseTime > 20) {
    message = getRandomItem(IMPATIENT_RESPONSES.too_slow);
    feedback.push('Response time too slow for crisis situation');
  }
  // Vague answer
  else if (analysis.is_vague) {
    message = getRandomItem(IMPATIENT_RESPONSES.vague_answer);
    feedback.push('Answer lacks specificity and technical detail');
  }
  // Defensive tone
  else if (analysis.is_defensive) {
    message = getRandomItem(IMPATIENT_RESPONSES.defensive_tone);
    feedback.push('Tone sounds defensive - take ownership instead');
  }
  // Missing jargon
  else if (analysis.jargon_count === 0) {
    message = getRandomItem(IMPATIENT_RESPONSES.missing_jargon);
    feedback.push('Use technical terminology to show expertise');
  }
  // Good progress
  else if (analysis.quality_score >= 6 && analysis.quality_score < 8) {
    message = getRandomItem(IMPATIENT_RESPONSES.good_progress);
    feedback.push('Good response, but can be more concise/diplomatic');
  }
  // Excellent
  else if (analysis.quality_score >= 8) {
    message = getRandomItem(IMPATIENT_RESPONSES.excellent);
    feedback.push('Strong crisis communication!');
  }
  // Default pressure
  else {
    message = "Keep going! The CEO is still waiting! What else?";
    feedback.push('Provide more technical detail and show ownership');
  }
  
  // Add follow-up question to maintain pressure
  const followUps = [
    "\n\nWhat's your ETA on a fix?",
    "\n\nWhat caused this? Give me the root cause!",
    "\n\nWhat's your backup plan if this doesn't work?",
    "\n\nHow are you communicating this to customers?",
    "\n\nWho's on the incident response team?",
    "\n\nWhat metrics are you monitoring?",
    "\n\nWhen's the next update?"
  ];
  
  if (pressureLevel === 'extreme' || pressureLevel === 'high') {
    message += getRandomItem(followUps);
  }
  
  return {
    message,
    feedback,
    pressure_level: pressureLevel
  };
}

/**
 * Determine if coach should interrupt (high pressure)
 */
function shouldInterrupt(session) {
  const frequency = session.scenario.coach_personality.interruption_frequency;
  const messageCount = session.messages.filter(m => m.role === 'user').length;
  
  if (frequency === 'very high' && messageCount % 2 === 0) return true;
  if (frequency === 'high' && messageCount % 3 === 0) return true;
  if (frequency === 'medium' && messageCount % 4 === 0) return true;
  
  return false;
}

/**
 * End crisis session and generate comprehensive audit report
 */
function endCrisisSession(sessionId) {
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    throw new Error('Invalid session ID');
  }
  
  session.endTime = Date.now();
  session.phase = 'completed';
  
  const duration = (session.endTime - session.startTime) / 1000; // seconds
  const userMessages = session.messages.filter(m => m.role === 'user');
  
  // Generate Crisis Report
  const crisisReport = {
    session_id: sessionId,
    scenario: session.scenario.title,
    duration_seconds: Math.floor(duration),
    total_exchanges: userMessages.length,
    
    // Jargon Accuracy Audit
    jargon_audit: {
      score: Math.round(session.metrics.jargon_score * 10) / 10,
      rating: getJargonRating(session.metrics.jargon_score),
      terms_used: session.metrics.jargon_used,
      terms_count: session.metrics.jargon_used.length,
      target_terms: session.scenario.target_jargon,
      target_count: session.scenario.target_jargon.length,
      coverage_percentage: Math.round((session.metrics.jargon_used.length / session.scenario.target_jargon.length) * 100),
      missing_terms: session.scenario.target_jargon.filter(t => !session.metrics.jargon_used.includes(t)).slice(0, 5),
      feedback: getJargonFeedback(session.metrics.jargon_score, session.metrics.jargon_used)
    },
    
    // Tone Analysis Audit
    tone_audit: {
      classification: session.metrics.tone_classification,
      rating: getToneRating(session.metrics.tone_classification),
      signals: session.metrics.tone_signals,
      defensive_count: session.metrics.tone_signals.defensive,
      resolutive_count: session.metrics.tone_signals.resolutive,
      vague_count: session.metrics.tone_signals.vague,
      specific_count: session.metrics.tone_signals.specific,
      feedback: getToneFeedback(session.metrics.tone_classification, session.metrics.tone_signals)
    },
    
    // Performance Metrics
    performance: {
      avg_response_time: Math.round(session.metrics.avg_response_time * 10) / 10,
      pressure_resistance: Math.round(session.metrics.pressure_resistance * 10) / 10,
      interruption_count: session.metrics.interruption_count,
      final_coach_patience: Math.round(session.metrics.coach_patience_level * 10) / 10,
      rating: getPerformanceRating(session.metrics.pressure_resistance)
    },
    
    // ===== LINGUISTIC AUDIT SUMMARY =====
    linguistic_audit_summary: generateLinguisticSummary(session),
    
    // ===== LEVEL-UP STATUS =====
    leveling_status: levelingService.getUserStatus(session.userId),
    
    // Diplomatic Fix - The Perfect Response
    diplomatic_fix: {
      template: session.scenario.diplomatic_template,
      explanation: "This response combines technical accuracy, ownership, timeline clarity, and diplomatic tone - exactly what stakeholders need in a crisis.",
      key_elements: [
        "✅ Technical jargon (triaging, post-mortem, root cause)",
        "✅ Ownership ('we are', 'team has identified')",
        "✅ Clear timeline (by EOD)",
        "✅ Reassuring tone (expect, implementing)",
        "✅ Action-oriented (not defensive)"
      ]
    },
    
    // Overall Assessment
    overall: {
      score: calculateOverallScore(session),
      grade: getLetterGrade(calculateOverallScore(session)),
      readiness: getCrisisReadiness(calculateOverallScore(session)),
      recommendations: getRecommendations(session)
    },
    
    timestamp: new Date().toISOString()
  };
  
  session.crisis_report = crisisReport;
  
  return {
    session_completed: true,
    sessionId,
    duration_seconds: Math.floor(duration),
    crisis_report: crisisReport,
    message: generateFinalMessage(crisisReport)
  };
}

/**
 * Calculate overall crisis handling score (0-100)
 */
function calculateOverallScore(session) {
  const jargonWeight = 0.3;
  const toneWeight = 0.4;
  const pressureWeight = 0.3;
  
  const jargonScore = session.metrics.jargon_score * 10; // 0-100
  
  // Tone score based on classification
  let toneScore = 50;
  if (session.metrics.tone_classification === 'resolutive') toneScore = 90;
  else if (session.metrics.tone_classification === 'neutral') toneScore = 60;
  else if (session.metrics.tone_classification === 'vague') toneScore = 40;
  else if (session.metrics.tone_classification === 'defensive') toneScore = 20;
  
  const pressureScore = session.metrics.pressure_resistance * 10; // 0-100
  
  const overall = (jargonScore * jargonWeight) + (toneScore * toneWeight) + (pressureScore * pressureWeight);
  
  return Math.round(overall);
}

/**
 * Get letter grade from score
 */
function getLetterGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Get crisis readiness level
 */
function getCrisisReadiness(score) {
  if (score >= 85) return 'Ready for C-Level Crisis Communication';
  if (score >= 70) return 'Ready for Team Lead Crisis Communication';
  if (score >= 55) return 'Needs More Practice with Stakeholders';
  return 'Requires Significant Training';
}

/**
 * Get jargon rating
 */
function getJargonRating(score) {
  if (score >= 8) return 'Excellent - Technical Expert';
  if (score >= 6) return 'Good - Competent Professional';
  if (score >= 4) return 'Fair - Needs Improvement';
  return 'Weak - Too Casual';
}

/**
 * Get jargon feedback
 */
function getJargonFeedback(score, termsUsed) {
  if (score >= 8) {
    return `Outstanding technical vocabulary! You used ${termsUsed.length} key terms effectively, demonstrating deep technical expertise.`;
  } else if (score >= 6) {
    return `Good technical language, but could be stronger. Consider using more specific terms like 'root cause analysis', 'rollback strategy', or 'incident post-mortem'.`;
  } else if (score >= 4) {
    return `Your technical vocabulary needs work. Study IT crisis terminology and practice using terms like 'bottleneck', 'mitigation', and 'SLA breach'.`;
  } else {
    return `Critical weakness: Lack of technical jargon makes you sound unprofessional. Learn key terms: rollback, root cause, post-mortem, triage, failover, hotfix.`;
  }
}

/**
 * Get tone rating
 */
function getToneRating(classification) {
  if (classification === 'resolutive') return 'Excellent - Solution-Focused Leader';
  if (classification === 'neutral') return 'Good - Balanced Communicator';
  if (classification === 'vague') return 'Weak - Too Ambiguous';
  if (classification === 'defensive') return 'Poor - Blame-Shifting';
  return 'Needs Improvement';
}

/**
 * Get tone feedback
 */
function getToneFeedback(classification, signals) {
  if (classification === 'resolutive') {
    return `Perfect crisis tone! You took ownership, provided solutions, and maintained a calm, professional demeanor. Stakeholders trust leaders who focus on resolution, not excuses.`;
  } else if (classification === 'defensive') {
    return `Major problem: You sounded defensive (${signals.defensive} instances). In crises, stakeholders want ownership and solutions, not blame-shifting. Practice phrases like "We are handling this" instead of "It's not my fault".`;
  } else if (classification === 'vague') {
    return `Too ambiguous! You gave ${signals.vague} vague responses. Stakeholders need specifics: timelines, root causes, action steps. Replace "working on it" with "implementing rollback, ETA 15 minutes".`;
  } else {
    return `Your tone was neutral but could be more decisive. Add more action-oriented language: "We are implementing...", "Timeline is...", "Root cause identified as..."`;
  }
}

/**
 * Get performance rating
 */
function getPerformanceRating(pressureResistance) {
  if (pressureResistance >= 8) return 'Elite - Thrives Under Pressure';
  if (pressureResistance >= 6) return 'Strong - Handles Pressure Well';
  if (pressureResistance >= 4) return 'Moderate - Struggles Under Pressure';
  return 'Weak - Cracks Under Pressure';
}

/**
 * Get personalized recommendations
 */
function getRecommendations(session) {
  const recommendations = [];
  
  // Jargon recommendations
  if (session.metrics.jargon_score < 6) {
    recommendations.push({
      category: 'Technical Vocabulary',
      priority: 'high',
      action: 'Study IT crisis terminology: rollback, root cause, post-mortem, triage, failover, SLA, mitigation, hotfix',
      reason: 'Low jargon score indicates unprofessional communication'
    });
  }
  
  // Tone recommendations
  if (session.metrics.tone_classification === 'defensive') {
    recommendations.push({
      category: 'Communication Tone',
      priority: 'critical',
      action: 'Practice ownership phrases: "We are handling this", "I take full responsibility", "Our team is implementing"',
      reason: 'Defensive tone destroys stakeholder trust in crises'
    });
  }
  
  if (session.metrics.tone_classification === 'vague') {
    recommendations.push({
      category: 'Specificity',
      priority: 'high',
      action: 'Always provide: (1) Root cause, (2) Timeline/ETA, (3) Action steps, (4) Backup plan',
      reason: 'Vague responses increase stakeholder anxiety'
    });
  }
  
  // Speed recommendations
  if (session.metrics.avg_response_time > 15) {
    recommendations.push({
      category: 'Response Speed',
      priority: 'medium',
      action: 'Practice rapid crisis responses. Aim for <10 seconds per message. Have templates ready.',
      reason: 'Slow responses signal panic or lack of preparation'
    });
  }
  
  // Pressure recommendations
  if (session.metrics.pressure_resistance < 5) {
    recommendations.push({
      category: 'Stress Management',
      priority: 'high',
      action: 'Practice high-pressure scenarios daily. Build crisis response muscle memory.',
      reason: 'You struggle to maintain composure under pressure'
    });
  }
  
  // Always add a positive recommendation if score is decent
  if (calculateOverallScore(session) >= 70) {
    recommendations.push({
      category: 'Next Level',
      priority: 'low',
      action: 'Try harder scenarios: Investor Pitch Crisis or Angry Client Escalation',
      reason: 'You handled this well - ready for more challenging situations'
    });
  }
  
  return recommendations;
}

/**
 * Generate final congratulations/feedback message
 */
function generateFinalMessage(report) {
  const grade = report.overall.grade;
  const score = report.overall.score;
  
  let message = `\n\n🚨 **CRISIS SIMULATION COMPLETE** 🚨\n\n`;
  
  if (grade === 'A') {
    message += `🏆 **OUTSTANDING!** Grade: ${grade} (${score}/100)\n\n`;
    message += `You handled this crisis like a seasoned executive. Your technical vocabulary was spot-on, your tone was resolutive, and you maintained composure under extreme pressure.\n\n`;
  } else if (grade === 'B') {
    message += `✅ **STRONG PERFORMANCE!** Grade: ${grade} (${score}/100)\n\n`;
    message += `You handled the crisis well, but there's room for improvement. Focus on the feedback below to reach elite level.\n\n`;
  } else if (grade === 'C') {
    message += `⚠️ **PASSING, BUT NEEDS WORK** Grade: ${grade} (${score}/100)\n\n`;
    message += `You survived the crisis, but your communication needs refinement. Study the diplomatic fix and practice daily.\n\n`;
  } else {
    message += `❌ **CRISIS FAILED** Grade: ${grade} (${score}/100)\n\n`;
    message += `This would not have gone well in a real scenario. You need significant practice before handling C-level crises.\n\n`;
  }
  
  message += `**📊 YOUR CRISIS AUDIT:**\n\n`;
  message += `**1. Jargon Accuracy:** ${report.jargon_audit.rating}\n`;
  message += `   Score: ${report.jargon_audit.score}/10 (${report.jargon_audit.coverage_percentage}% coverage)\n`;
  message += `   Terms Used: ${report.jargon_audit.terms_used.join(', ') || 'None'}\n`;
  message += `   ${report.jargon_audit.feedback}\n\n`;
  
  message += `**2. Tone Analysis:** ${report.tone_audit.rating}\n`;
  message += `   Classification: ${report.tone_audit.classification.toUpperCase()}\n`;
  message += `   Resolutive: ${report.tone_audit.resolutive_count} | Defensive: ${report.tone_audit.defensive_count} | Vague: ${report.tone_audit.vague_count}\n`;
  message += `   ${report.tone_audit.feedback}\n\n`;
  
  message += `**3. Performance Under Pressure:** ${report.performance.rating}\n`;
  message += `   Pressure Resistance: ${report.performance.pressure_resistance}/10\n`;
  message += `   Avg Response Time: ${report.performance.avg_response_time}s\n`;
  message += `   Coach Patience Remaining: ${report.performance.final_coach_patience}/10\n\n`;
  
  message += `**✨ THE DIPLOMATIC FIX - Your Perfect Response:**\n\n`;
  message += `"${report.diplomatic_fix.template}"\n\n`;
  message += `**Why This Works:**\n`;
  report.diplomatic_fix.key_elements.forEach(element => {
    message += `${element}\n`;
  });
  
  message += `\n**🎯 YOUR ACTION PLAN:**\n`;
  report.overall.recommendations.forEach((rec, i) => {
    message += `\n${i + 1}. **${rec.category}** [${rec.priority.toUpperCase()}]\n`;
    message += `   Action: ${rec.action}\n`;
    message += `   Why: ${rec.reason}\n`;
  });
  
  message += `\n\n**Crisis Readiness:** ${report.overall.readiness}\n`;
  
  return message;
}

/**
 * Get available crisis scenarios
 */
function getCrisisScenarios() {
  return Object.values(CRISIS_SCENARIOS).map(scenario => ({
    id: scenario.id,
    title: scenario.title,
    description: scenario.description,
    difficulty: scenario.difficulty,
    duration_minutes: scenario.duration_minutes,
    target_jargon_count: scenario.target_jargon.length
  }));
}

/**
 * Get session details
 */
function getSessionDetails(sessionId) {
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    throw new Error('Invalid session ID or session expired');
  }
  
  return {
    sessionId: session.sessionId,
    scenario: session.scenario.title,
    phase: session.phase,
    startTime: session.startTime,
    endTime: session.endTime,
    messageCount: session.messages.length,
    metrics: session.metrics,
    crisis_report: session.crisis_report
  };
}

/**
 * Helper: Get random item from array
 */
function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get scenario based on user level and week number
 * Week 2 = Crisis scenarios with level-adapted dialogue
 * @param {string} user_level - B1, B2, C1, or C2
 * @param {number} week_number - Current training week (1-4+)
 * @returns {object} Scenario adapted to user level
 */
function get_scenario(user_level, week_number) {
  // Week 2 = Crisis scenarios
  if (week_number === 2) {
    // Get all crisis scenario IDs
    const crisisScenarioIds = Object.keys(CRISIS_SCENARIOS);
    
    // Randomly select one crisis scenario
    const selectedId = getRandomItem(crisisScenarioIds);
    const baseScenario = CRISIS_SCENARIOS[selectedId];
    
    // Deep clone the scenario to avoid modifying the original
    const adaptedScenario = JSON.parse(JSON.stringify(baseScenario));
    
    // Adapt dialogues and complexity based on user level
    adaptedScenario.adapted_for_level = user_level;
    adaptedScenario.description = adaptScenarioDescription(baseScenario, user_level);
    adaptedScenario.coach_personality = adaptCoachPersonality(baseScenario.coach_personality, user_level);
    adaptedScenario.initial_prompt = generateInitialPrompt(baseScenario, user_level);
    adaptedScenario.follow_up_prompts = generateFollowUpPrompts(baseScenario, user_level);
    
    return adaptedScenario;
  }
  
  // For other weeks, return null (can be extended later)
  return null;
}

/**
 * Adapt scenario description to user level
 * B1: Simple, direct language
 * B2: Standard business English
 * C1: Professional with some idioms
 * C2: Advanced with corporate idioms and nuance
 */
function adaptScenarioDescription(scenario, level) {
  const descriptions = {
    production_outage: {
      B1: "The main database is down. The CEO is asking for updates on Slack. What do you say?",
      B2: "The main database is down, and customers are reporting errors. The CEO is on the Slack channel asking for updates. What do you say?",
      C1: "We're facing a critical database outage during peak hours. The CEO is on Slack demanding immediate updates as revenue is at risk. How do you respond?",
      C2: "We've got a full-blown production crisis - the database is down during peak traffic, customers are up in arms, and the CEO is breathing down our necks on Slack. How do you navigate this minefield?"
    },
    investor_meeting: {
      B1: "Your product demo crashed during an important investor meeting. The investor is waiting. What do you do?",
      B2: "Your product demo just crashed during a Series A pitch. The lead investor is waiting. How do you recover?",
      C1: "Your live demo just went south in the middle of a high-stakes Series A pitch. The lead investor looks skeptical, and your CEO is sweating bullets. How do you pivot?",
      C2: "The demo imploded spectacularly mid-pitch, the investors are losing faith by the second, and you can feel your $5M Series A slipping through your fingers. Time to pull a rabbit out of the hat - what's your play?"
    },
    client_escalation: {
      B1: "A big client is angry about bugs and wants to cancel their contract. They want answers now. What do you say?",
      B2: "A major client threatens to cancel their $100K contract due to repeated bugs. They want answers NOW.",
      C1: "One of your premium clients is at their breaking point after three days of critical issues - they're threatening to pull their six-figure contract unless you deliver immediate solutions. What's your approach?",
      C2: "Your whale client is about to jump ship - three days of showstopper bugs have pushed them over the edge, and they're ready to tear up their $100K contract. You've got 24 hours to turn this around or watch your ARR take a nosedive. How do you play damage control?"
    }
  };
  
  return descriptions[scenario.id]?.[level] || scenario.description;
}

/**
 * Adapt coach personality based on user level
 * Higher levels = more impatient, more demanding
 */
function adaptCoachPersonality(basePersonality, level) {
  const levelModifiers = {
    B1: { patience: 1, pressureRate: -0.2, interruption: 'medium' },
    B2: { patience: 0, pressureRate: 0, interruption: 'high' },
    C1: { patience: -0.5, pressureRate: 0.1, interruption: 'high' },
    C2: { patience: -1, pressureRate: 0.2, interruption: 'very high' }
  };
  
  const modifier = levelModifiers[level] || levelModifiers.B2;
  
  return {
    initial_patience: Math.max(1, basePersonality.initial_patience + modifier.patience),
    pressure_increase_rate: basePersonality.pressure_increase_rate + modifier.pressureRate,
    interruption_frequency: modifier.interruption,
    tone: basePersonality.tone
  };
}

/**
 * Generate level-adapted initial prompt
 */
function generateInitialPrompt(scenario, level) {
  const prompts = {
    B1: {
      production_outage: "The CEO just wrote: 'What is happening? Fix it fast!' Your response?",
      investor_meeting: "The investor says: 'Your demo is broken. Can you show us something else?' Your response?",
      client_escalation: "The client wrote: 'We have too many problems. We will cancel the contract.' Your response?"
    },
    B2: {
      production_outage: "The CEO messages: 'Database is down? Give me a status update ASAP. Customers are complaining.' Your response?",
      investor_meeting: "The lead investor asks: 'The demo crashed. Do you have a backup plan? We need to see results.' Your response?",
      client_escalation: "The client VP writes: 'Three days of bugs. This is unacceptable. We're considering cancellation.' Your response?"
    },
    C1: {
      production_outage: "CEO on Slack: 'Production is down, customers are furious, and I'm getting heat from the board. What's the ETA on resolution and what caused this?' Your move?",
      investor_meeting: "Lead investor: 'That's unfortunate timing. Look, we're on a tight schedule - can you pivot to showing us your traction metrics and product-market fit instead?' How do you respond?",
      client_escalation: "Client VP: 'We've been patient, but this is the third incident this week. Our team is losing confidence. Give me one good reason not to pull the plug on this contract.' Your response?"
    },
    C2: {
      production_outage: "CEO Slack bomb: 'We're hemorrhaging customers, the board is on my case, and I need to know yesterday what went wrong and when we'll be back online. Don't sugarcoat it - give me the full picture.' Time to face the music - what do you say?",
      investor_meeting: "Lead investor, arms crossed: 'Well, that's a rough start. Listen, we've seen a hundred pitches this quarter, and technical hiccups are red flags. You've got 60 seconds to convince me you're not just smoke and mirrors.' Clock's ticking - how do you salvage this?",
      client_escalation: "Client VP, clearly fed up: 'I've got my CFO breathing down my neck, your bugs are costing us real money, and frankly, you're making me look bad for betting on your platform. I need a concrete action plan by EOD or we're walking. Ball's in your court.' How do you bring them back from the brink?"
    }
  };
  
  return prompts[level]?.[scenario.id] || `The situation is critical. What do you say?`;
}

/**
 * Generate follow-up prompts that escalate pressure (level-adapted)
 */
function generateFollowUpPrompts(scenario, level) {
  const followUps = {
    B1: [
      "That's good, but give me more details. What exactly is the problem?",
      "Okay, but when will it be fixed? Give me a time.",
      "What is your team doing right now?",
      "Is there a backup plan?"
    ],
    B2: [
      "I need more specifics. What's the root cause?",
      "That's fine, but what's the ETA? Be precise.",
      "What concrete steps are you taking?",
      "How are you preventing this from happening again?"
    ],
    C1: [
      "You're being too vague. I need technical details - what's the actual root cause here?",
      "A timeline would be helpful. What's your realistic ETA for full restoration?",
      "Walk me through your mitigation strategy. What's the action plan?",
      "This sounds reactive. What preventive measures are you putting in place?"
    ],
    C2: [
      "Cut the corporate speak - what's the real root cause, and don't tell me you're still investigating.",
      "I need a hard ETA with your confidence level. Are we talking minutes, hours, or should I start making calls?",
      "That's strategy consultant talk. Give me the ground-level playbook - who's doing what, right now?",
      "I'm not hearing proactive thinking. What's the post-mortem game plan to ensure we never have this conversation again?"
    ]
  };
  
  return followUps[level] || followUps.B2;
}

/**
 * Generate linguistic audit summary from session audits
 */
function generateLinguisticSummary(session) {
  const audits = session.linguistic_audits || [];
  
  if (audits.length === 0) {
    return {
      total_audits: 0,
      message: 'No linguistic audits performed'
    };
  }
  
  // Get most recent audit
  const latestAudit = audits[audits.length - 1].audit;
  
  // Calculate average detected level
  const levelCounts = {};
  audits.forEach(a => {
    const level = a.audit.current_level;
    levelCounts[level] = (levelCounts[level] || 0) + 1;
  });
  
  const mostCommonLevel = Object.keys(levelCounts).reduce((a, b) => 
    levelCounts[a] > levelCounts[b] ? a : b
  );
  
  // Aggregate all mistakes
  const allMistakes = audits.flatMap(a => a.audit.top_3_mistakes);
  const mistakeTypes = {};
  allMistakes.forEach(m => {
    mistakeTypes[m.type] = (mistakeTypes[m.type] || 0) + 1;
  });
  
  // Get all false friends detected
  const falseFriends = audits.flatMap(a => a.audit.false_friends_detected);
  
  // Calculate average soft skill score
  const avgSoftSkill = audits.reduce((sum, a) => sum + a.audit.soft_skill_score, 0) / audits.length;
  
  // Calculate average hesitation ratio
  const avgHesitation = audits.reduce((sum, a) => sum + a.audit.hesitation_ratio.ratio, 0) / audits.length;
  
  return {
    total_audits: audits.length,
    most_detected_level: mostCommonLevel,
    latest_detected_level: latestAudit.current_level,
    latest_confidence: latestAudit.confidence_percentage,
    average_soft_skill_score: Math.round(avgSoftSkill * 10) / 10,
    average_hesitation_ratio: Math.round(avgHesitation * 100) / 100,
    false_friends_detected: falseFriends.length > 0 ? falseFriends : null,
    common_mistake_types: mistakeTypes,
    power_vocabulary_suggestions: audits
      .filter(a => a.audit.power_vocabulary_suggestion)
      .map(a => a.audit.power_vocabulary_suggestion),
    level_progression: audits.map(a => ({
      timestamp: a.timestamp,
      detected_level: a.audit.current_level,
      confidence: a.audit.confidence_percentage
    })),
    summary: `Detected as ${mostCommonLevel} speaker (latest: ${latestAudit.current_level} with ${latestAudit.confidence_percentage}% confidence). ${falseFriends.length > 0 ? `Warning: ${falseFriends.length} false friend(s) detected.` : 'No false friends detected.'} Soft skills: ${Math.round(avgSoftSkill * 10) / 10}/10.`
  };
}

module.exports = {
  startCrisisSession,
  processCrisisResponse,
  endCrisisSession,
  getCrisisScenarios,
  getSessionDetails,
  get_scenario,
  CRISIS_SCENARIOS
};

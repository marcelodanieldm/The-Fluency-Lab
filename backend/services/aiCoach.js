// ============================================
// THE FLUENCY LAB - AI COACH SERVICE
// Interactive 10-minute coaching sessions
// ============================================

const natural = require('natural');

// ============================================
// SESSION PHASES
// ============================================

const PHASES = {
  WELCOME: 'welcome',           // 30 seconds
  INTERACTION: 'interaction',   // 7 minutes
  CLOSING: 'closing'            // 2.5 minutes
};

// ============================================
// COMMON IT PRONUNCIATION ERRORS
// ============================================

const IT_PRONUNCIATION_ERRORS = {
  // Libraries and frameworks
  'library': ['libary', 'liberry', 'librery'],
  'libraries': ['libaries', 'liberries'],
  'jquery': ['jaqueri', 'jequery'],
  'angular': ['angulár', 'anguler'],
  'linux': ['laynux', 'linuks'],
  'nginx': ['nginks', 'enginex'],
  'django': ['diango', 'jango'],
  'apache': ['apach', 'apachee'],
  
  // Technical terms
  'header': ['heeder', 'heder'],
  'integer': ['integar', 'integuer'],
  'algorithm': ['algorythm', 'algorhythm'],
  'cache': ['catch', 'cash-ay'],
  'sql': ['sequel', 'es-que-el'],
  'gui': ['gooey', 'gee-you-eye'],
  'enum': ['ee-num', 'en-um'],
  'boolean': ['boolian', 'booleon'],
  'tuple': ['tupel', 'toopl'],
  'height': ['heigth', 'heighth'],
  'width': ['widt', 'whidth'],
  'length': ['lenght', 'lenth'],
  
  // Actions
  'deploy': ['depló', 'deploi'],
  'compile': ['compil', 'compilé'],
  'debug': ['debag', 'de-bug'],
  'iterate': ['iterat', 'itereit'],
  'schedule': ['skedule', 'schedyul'],
  'execute': ['execut', 'eksecute'],
  
  // Business terms
  'hierarchy': ['hierarky', 'heirarki'],
  'strategic': ['estrategic', 'strategik'],
  'architecture': ['arquitechture', 'architekture'],
  'revenue': ['revenu', 'revenew'],
  'analyze': ['analice', 'analyzy']
};

// ============================================
// GRAMMAR PATTERNS TO DETECT
// ============================================

const GRAMMAR_ISSUES = {
  // Article errors
  article_missing: {
    pattern: /\b(working on|building|creating|developing)\s+(system|application|feature|bug|issue)\b/gi,
    correction: 'Missing article: "working on A system" or "working on THE system"',
    example: 'I\'m working on the authentication system'
  },
  
  // Preposition errors
  prep_responsible: {
    pattern: /\bresponsible\s+of\b/gi,
    correction: 'Incorrect preposition: use "responsible FOR" not "responsible OF"',
    example: 'I\'m responsible for the deployment process'
  },
  
  prep_depends: {
    pattern: /\bdepends\s+of\b/gi,
    correction: 'Incorrect preposition: use "depends ON" not "depends OF"',
    example: 'It depends on the client requirements'
  },
  
  // Common IT verb errors
  verb_make_meeting: {
    pattern: /\bmake\s+(a\s+)?meeting\b/gi,
    correction: 'Wrong verb: use "HOLD a meeting" or "HAVE a meeting" not "make a meeting"',
    example: 'We\'ll hold a meeting tomorrow'
  },
  
  verb_assist_meeting: {
    pattern: /\bassist\s+(to\s+)?(a\s+)?meeting\b/gi,
    correction: 'Wrong verb: use "ATTEND a meeting" not "assist to a meeting"',
    example: 'I\'ll attend the standup meeting'
  },
  
  // Tense errors
  present_perfect: {
    pattern: /\b(yesterday|last week|last month|ago)\s+[^.]*\s+(have|has)\s+\w+ed\b/gi,
    correction: 'Tense error: Use simple past with time expressions (yesterday, last week)',
    example: 'Yesterday I fixed the bug (not "have fixed")'
  },
  
  // Plural/countable errors
  informations: {
    pattern: /\binformations\b/gi,
    correction: '"Information" is uncountable: use "information" or "pieces of information"',
    example: 'We need more information about the API'
  },
  
  softwares: {
    pattern: /\bsoftwares\b/gi,
    correction: '"Software" is uncountable: use "software" or "software applications"',
    example: 'We use various software tools'
  }
};

// ============================================
// LEVEL-BASED PROMPTS
// ============================================

const LEVEL_STRATEGIES = {
  B1: {
    focus: 'Basic connectors and clear structure',
    connectors: ['First', 'Then', 'After that', 'Finally', 'Because', 'So'],
    prompts: [
      'Great! Now, can you explain the steps? Start with "First..." then use "Then..." and "Finally..."',
      'Perfect! What happened before that? Use connectors like "First" or "After that"',
      'Good! Can you add why you\'re doing this? Try using "because" or "so"'
    ],
    encouragement: [
      'Excellent structure! Your explanation is very clear.',
      'Well done! You\'re using connectors effectively.',
      'Great job organizing your thoughts!'
    ]
  },
  
  B2: {
    focus: 'Technical accuracy and professional vocabulary',
    prompts: [
      'Interesting! Can you elaborate on the technical implementation?',
      'Good point! What challenges did you face during development?',
      'Can you explain the architecture decisions behind this?'
    ],
    encouragement: [
      'Excellent technical detail!',
      'Your technical vocabulary is strong!',
      'Good explanation of the implementation!'
    ]
  },
  
  C1: {
    focus: 'Business impact and strategic thinking',
    prompts: [
      'Excellent! Now, what\'s the business impact of this technical decision?',
      'Interesting approach. How does this align with the company\'s strategic goals?',
      'Good! Can you quantify the value this brings to stakeholders?',
      'How would you explain this to a non-technical executive?'
    ],
    encouragement: [
      'Outstanding strategic thinking!',
      'You\'re connecting technical work to business value excellently!',
      'Impressive business acumen!'
    ]
  },
  
  C2: {
    focus: 'Executive communication and leadership',
    prompts: [
      'Excellent! Now frame this as a board-level discussion: what\'s the ROI?',
      'How would you position this to secure executive buy-in?',
      'What are the organizational implications of this technical choice?',
      'Can you articulate the competitive advantage this provides?'
    ],
    encouragement: [
      'Masterful executive communication!',
      'You\'re thinking like a CTO!',
      'Exceptional leadership perspective!'
    ]
  }
};

// ============================================
// SENIOR LEVEL PHRASES
// ============================================

const POWER_PHRASES = {
  // Basic -> Power
  'I am working on': 'I\'m currently driving',
  'I need to do': 'I\'m prioritizing',
  'I think': 'In my assessment',
  'I will do': 'I\'m committed to delivering',
  'It is important': 'This is mission-critical',
  'We have a problem': 'We\'re facing a challenge',
  'I don\'t know': 'I\'ll need to investigate',
  'I am doing': 'I\'m spearheading',
  'I want to': 'I\'m looking to',
  'I have to': 'I\'m accountable for',
  'We need': 'We require',
  'It works': 'It performs as expected',
  'I fixed': 'I resolved',
  'I made': 'I architected',
  'I can do': 'I\'m positioned to',
  'The team': 'My team',
  'The project': 'Our initiative',
  'Good': 'Solid',
  'Bad': 'Suboptimal',
  'Fast': 'Performant',
  'Slow': 'Experiencing latency',
  'Easy': 'Straightforward',
  'Hard': 'Complex',
  'Big': 'Substantial',
  'Small': 'Minimal'
};

// ============================================
// AI COACH CLASS
// ============================================

class AICoach {
  constructor() {
    this.sessions = new Map(); // sessionId -> sessionData
  }

  /**
   * Start a new coaching session
   */
  startSession(userId, userLevel, sessionTopic) {
    const sessionId = `session-${userId}-${Date.now()}`;
    
    const session = {
      sessionId,
      userId,
      userLevel: this.normalizeLevel(userLevel),
      sessionTopic: sessionTopic || 'The Effective Daily Stand-up',
      phase: PHASES.WELCOME,
      startTime: Date.now(),
      messages: [],
      detectedErrors: {
        pronunciation: [],
        grammar: [],
        vocabulary: []
      },
      userResponses: [],
      confidenceScore: 7 // Default
    };
    
    this.sessions.set(sessionId, session);
    
    // Generate welcome message
    const welcomeMessage = this.generateWelcome(session);
    session.messages.push({
      role: 'coach',
      content: welcomeMessage,
      timestamp: Date.now()
    });
    
    return {
      sessionId,
      message: welcomeMessage,
      phase: PHASES.WELCOME,
      timeRemaining: 600 // 10 minutes in seconds
    };
  }

  /**
   * Process user response and generate coach reply
   */
  processResponse(sessionId, userMessage) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    // Store user message
    session.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    });
    
    session.userResponses.push(userMessage);
    
    // Analyze user message for errors
    this.analyzeMessage(session, userMessage);
    
    // Calculate elapsed time
    const elapsedSeconds = Math.floor((Date.now() - session.startTime) / 1000);
    const timeRemaining = Math.max(0, 600 - elapsedSeconds);
    
    // Determine phase transition
    if (elapsedSeconds < 30) {
      session.phase = PHASES.WELCOME;
    } else if (elapsedSeconds < 450) { // 7.5 minutes
      session.phase = PHASES.INTERACTION;
    } else {
      session.phase = PHASES.CLOSING;
    }
    
    // Generate response based on phase
    let coachMessage;
    let isComplete = false;
    
    if (session.phase === PHASES.CLOSING || timeRemaining <= 0) {
      coachMessage = this.generateFlashReport(session);
      isComplete = true;
    } else {
      coachMessage = this.generateInteractionResponse(session, userMessage);
    }
    
    session.messages.push({
      role: 'coach',
      content: coachMessage,
      timestamp: Date.now()
    });
    
    return {
      sessionId,
      message: coachMessage,
      phase: session.phase,
      timeRemaining,
      detectedErrorsCount: this.getErrorCount(session),
      isComplete
    };
  }

  /**
   * Generate welcome message
   */
  generateWelcome(session) {
    const greetings = [
      `Good to see you here! I'm your AI Coach for today's ${session.sessionTopic} session.`,
      `Welcome! Let's make this ${session.sessionTopic} session count.`,
      `Ready to level up? I'm here to guide you through ${session.sessionTopic}.`
    ];
    
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    return `${greeting}

We've got 10 minutes together, so let's make them productive.

**Here's what I need from you:**
Tell me briefly what you're working on today. Use technical terms—don't hold back. I want to hear about your current task, project, or challenge.

What are you tackling today?`;
  }

  /**
   * Generate interaction response
   */
  generateInteractionResponse(session, userMessage) {
    const strategy = LEVEL_STRATEGIES[session.userLevel] || LEVEL_STRATEGIES.B2;
    const responseCount = session.userResponses.length;
    
    // Acknowledge the user's response
    let response = '';
    
    // Add acknowledgment
    const acknowledgments = [
      'Got it!',
      'I hear you!',
      'Understood!',
      'Clear!',
      'Makes sense!'
    ];
    
    response += acknowledgments[Math.floor(Math.random() * acknowledgments.length)] + ' ';
    
    // Add level-appropriate prompt
    if (responseCount <= 2) {
      // Early in conversation - ask for more detail
      response += strategy.prompts[Math.floor(Math.random() * strategy.prompts.length)];
    } else if (responseCount <= 4) {
      // Mid conversation - challenge them
      if (session.userLevel === 'B1') {
        response += `${strategy.encouragement[0]}\n\nNow, can you tell me what happens AFTER this step? Remember: First... Then... Finally...`;
      } else if (session.userLevel === 'C1' || session.userLevel === 'C2') {
        response += `${strategy.encouragement[1]}\n\n${strategy.prompts[2]}`;
      } else {
        response += `${strategy.encouragement[1]}\n\nWhat's the next step in your process?`;
      }
    } else {
      // Late conversation - wrap up
      response += `${strategy.encouragement[2]}\n\nLast question before we wrap: What's the one thing you're most concerned about in this task?`;
    }
    
    // Add error markers if detected in this message
    const currentErrors = this.findPronunciationErrors(userMessage);
    if (currentErrors.length > 0) {
      const errorWords = currentErrors.map(e => `*${e.word}*`).join(', ');
      response += `\n\n📝 *Quick note:* I spotted ${errorWords} - let's review pronunciation at the end.`;
    }
    
    return response;
  }

  /**
   * Generate Flash Report
   */
  generateFlashReport(session) {
    const allText = session.userResponses.join(' ');
    
    // Find most important grammar fix
    const grammarFix = this.findMostImportantGrammarFix(session);
    
    // Find best power phrase replacement
    const powerMove = this.findBestPowerMove(allText);
    
    // Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(session);
    
    // Pronunciation errors summary
    const pronErrors = session.detectedErrors.pronunciation;
    const uniquePronErrors = [...new Set(pronErrors)];
    
    let report = `## 🎯 FLASH REPORT - ${session.sessionTopic}\n\n`;
    report += `Time spent: ${Math.floor((Date.now() - session.startTime) / 1000 / 60)} minutes\n\n`;
    
    report += `---\n\n`;
    
    // Grammar Fix
    report += `### 📚 GRAMMAR FIX\n`;
    if (grammarFix) {
      report += `**Issue:** ${grammarFix.issue}\n`;
      report += `**Fix:** ${grammarFix.correction}\n`;
      report += `**Example:** "${grammarFix.example}"\n\n`;
    } else {
      report += `**Great job!** No major grammar issues detected. Keep it up!\n\n`;
    }
    
    // Pronunciation corrections
    if (uniquePronErrors.length > 0) {
      report += `### 🗣️ PRONUNCIATION CHECK\n`;
      report += `Watch out for these IT terms:\n`;
      uniquePronErrors.forEach(word => {
        report += `- **${word}** (/correct pronunciation/)\n`;
      });
      report += `\n`;
    }
    
    // Power Move
    report += `### 💪 POWER MOVE (Senior-Level Upgrade)\n`;
    if (powerMove) {
      report += `**Instead of:** "${powerMove.basic}"\n`;
      report += `**Level up to:** "${powerMove.power}"\n\n`;
      report += `*This makes you sound more executive-level and confident.*\n\n`;
    } else {
      report += `**Excellent!** Your vocabulary is already at a senior level. Keep using that professional language!\n\n`;
    }
    
    // Confidence Score
    report += `### 🎪 CONFIDENCE SCORE\n`;
    report += `**${confidenceScore}/10** - `;
    
    if (confidenceScore >= 8) {
      report += `Outstanding! You're communicating like a senior engineer. Keep this momentum!`;
    } else if (confidenceScore >= 6) {
      report += `Solid performance! A few tweaks and you'll be at senior level consistently.`;
    } else if (confidenceScore >= 4) {
      report += `Good foundation! Focus on the fixes above and practice daily.`;
    } else {
      report += `You're building skills! Keep practicing these sessions—you'll see rapid improvement.`;
    }
    
    report += `\n\n---\n\n`;
    report += `**Next steps:** Practice the Power Move in your next standup. Book another session tomorrow!\n\n`;
    report += `Remember: **You're not just a coder. You're a technical leader.** 🚀`;
    
    return report;
  }

  /**
   * Analyze message for errors
   */
  analyzeMessage(session, message) {
    // Check for pronunciation errors
    const pronErrors = this.findPronunciationErrors(message);
    session.detectedErrors.pronunciation.push(...pronErrors.map(e => e.word));
    
    // Check for grammar errors
    const grammarErrors = this.findGrammarErrors(message);
    session.detectedErrors.grammar.push(...grammarErrors);
    
    return {
      pronunciation: pronErrors,
      grammar: grammarErrors
    };
  }

  /**
   * Find pronunciation errors
   */
  findPronunciationErrors(text) {
    const errors = [];
    const lowerText = text.toLowerCase();
    
    for (const [correctWord, commonMistakes] of Object.entries(IT_PRONUNCIATION_ERRORS)) {
      // Check if the word appears in text
      const wordRegex = new RegExp(`\\b${correctWord}\\b`, 'gi');
      if (wordRegex.test(lowerText)) {
        errors.push({
          word: correctWord,
          type: 'pronunciation',
          severity: 'medium'
        });
      }
    }
    
    return errors;
  }

  /**
   * Find grammar errors
   */
  findGrammarErrors(text) {
    const errors = [];
    
    for (const [errorType, config] of Object.entries(GRAMMAR_ISSUES)) {
      if (config.pattern.test(text)) {
        errors.push({
          type: errorType,
          issue: config.correction,
          example: config.example,
          severity: 'high'
        });
      }
    }
    
    return errors;
  }

  /**
   * Find most important grammar fix
   */
  findMostImportantGrammarFix(session) {
    const grammarErrors = session.detectedErrors.grammar;
    
    if (grammarErrors.length === 0) {
      return null;
    }
    
    // Return the first (most important) error
    return grammarErrors[0];
  }

  /**
   * Find best power phrase replacement
   */
  findBestPowerMove(text) {
    const lowerText = text.toLowerCase();
    
    for (const [basic, power] of Object.entries(POWER_PHRASES)) {
      if (lowerText.includes(basic.toLowerCase())) {
        return {
          basic,
          power,
          context: 'This phrasing elevates your communication to executive level'
        };
      }
    }
    
    return null;
  }

  /**
   * Calculate confidence score
   */
  calculateConfidenceScore(session) {
    let score = 7; // Base score
    
    const errorCount = this.getErrorCount(session);
    const responseCount = session.userResponses.length;
    const avgResponseLength = session.userResponses.reduce((sum, r) => sum + r.length, 0) / responseCount;
    
    // Deduct for errors
    score -= Math.min(3, errorCount.grammar * 0.5);
    score -= Math.min(2, errorCount.pronunciation * 0.3);
    
    // Bonus for engagement
    if (responseCount >= 5) score += 1;
    if (avgResponseLength > 100) score += 1;
    
    // Level adjustments
    if (session.userLevel === 'C1' || session.userLevel === 'C2') {
      score += 1;
    }
    
    return Math.max(1, Math.min(10, Math.round(score)));
  }

  /**
   * Get error count
   */
  getErrorCount(session) {
    return {
      pronunciation: session.detectedErrors.pronunciation.length,
      grammar: session.detectedErrors.grammar.length,
      vocabulary: session.detectedErrors.vocabulary.length,
      total: session.detectedErrors.pronunciation.length + 
             session.detectedErrors.grammar.length + 
             session.detectedErrors.vocabulary.length
    };
  }

  /**
   * Normalize user level
   */
  normalizeLevel(level) {
    const upperLevel = level.toUpperCase();
    
    if (upperLevel === 'B1' || upperLevel === 'B2') return upperLevel;
    if (upperLevel === 'C1') return 'C1';
    if (upperLevel === 'C2') return 'C2';
    
    return 'B2'; // Default
  }

  /**
   * Get session data
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  /**
   * End session
   */
  endSession(sessionId) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    const flashReport = this.generateFlashReport(session);
    
    // Clean up session after some time
    setTimeout(() => {
      this.sessions.delete(sessionId);
    }, 30 * 60 * 1000); // 30 minutes
    
    return {
      sessionId,
      flashReport,
      sessionData: {
        duration: Math.floor((Date.now() - session.startTime) / 1000),
        messageCount: session.messages.length,
        errorCount: this.getErrorCount(session),
        confidenceScore: this.calculateConfidenceScore(session)
      }
    };
  }
}

// ============================================
// EXPORT
// ============================================

module.exports = new AICoach();

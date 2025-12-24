/**
 * Linguistic Auditor Service
 * Analyzes user responses to determine exact CEFR level (B1-C2)
 * Detects technical verb usage, false friends, and hesitation patterns
 */

const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

// IT Technical Action Verbs by Level
const TECHNICAL_VERBS = {
  B1: ['fix', 'check', 'update', 'install', 'restart', 'test', 'make', 'work'],
  B2: ['resolve', 'implement', 'configure', 'monitor', 'deploy', 'analyze', 'restore', 'handle'],
  C1: ['mitigate', 'diagnose', 'optimize', 'troubleshoot', 'escalate', 'provision', 'orchestrate', 'refactor'],
  C2: ['triage', 'remediate', 'leverage', 'streamline', 'architect', 'deprecate', 'containerize', 'instrument']
};

// False Friends (Common Spanish-English errors for IT professionals)
const FALSE_FRIENDS = {
  'actual': {
    incorrect: 'actual',
    correct: 'current',
    example: "The actual (❌) → current (✅) database version is 5.7",
    spanish_meaning: 'actual = current, not "real"'
  },
  'library': {
    incorrect: 'library',
    correct: 'dependency/package',
    example: "We need to update the library (❌) → dependency (✅) to version 2.0",
    spanish_meaning: 'library = bookstore (biblioteca física), use "dependency" or "package" for code'
  },
  'realize': {
    incorrect: 'realize',
    correct: 'implement/carry out',
    example: "We will realize (❌) → implement (✅) the changes tomorrow",
    spanish_meaning: 'realizar = to carry out, not "to become aware"'
  },
  'assist': {
    incorrect: 'assist',
    correct: 'attend',
    example: "I will assist (❌) → attend (✅) the meeting",
    spanish_meaning: 'asistir = to attend, not "to help"'
  },
  'compromise': {
    incorrect: 'compromise',
    correct: 'commit',
    example: "I compromise (❌) → commit (✅) to deliver by Friday",
    spanish_meaning: 'comprometerse = to commit, not "to make a compromise"'
  },
  'exit': {
    incorrect: 'exit',
    correct: 'success',
    example: "The exit (❌) → success (✅) of the project depends on...",
    spanish_meaning: 'éxito = success, not "exit"'
  },
  'eventually': {
    incorrect: 'eventually',
    correct: 'possibly/perhaps',
    example: "Eventually (❌) → Perhaps (✅) we should try a different approach",
    spanish_meaning: 'eventualmente = possibly, not "in the end"'
  },
  'pretend': {
    incorrect: 'pretend',
    correct: 'intend/plan',
    example: "We pretend (❌) → intend (✅) to launch next month",
    spanish_meaning: 'pretender = to intend, not "to fake"'
  }
};

// Hesitation Markers
const HESITATION_MARKERS = [
  'ummm', 'umm', 'um', 'uhhh', 'uhh', 'uh',
  'ehhh', 'ehh', 'eh', 'hmmm', 'hmm',
  'like', 'you know', 'i mean', 'kind of', 'sort of',
  'basically', 'actually' // when overused
];

// Power Vocabulary Mappings (B1 → C2 upgrades)
const POWER_VOCABULARY = {
  'problem': 'bottleneck',
  'issue': 'impediment',
  'fix': 'remediate',
  'make better': 'optimize',
  'check': 'audit',
  'find': 'identify',
  'big problem': 'critical incident',
  'very important': 'mission-critical',
  'work together': 'collaborate',
  'look at': 'assess',
  'stop': 'terminate',
  'start': 'initiate',
  'change': 'pivot',
  'help': 'facilitate',
  'show': 'demonstrate',
  'tell': 'communicate',
  'think': 'assess',
  'want': 'require',
  'need': 'necessitate',
  'use': 'leverage',
  'make': 'architect',
  'try': 'attempt',
  'get': 'acquire',
  'give': 'provision',
  'do': 'execute',
  'say': 'articulate'
};

// Soft Skills Indicators
const SOFT_SKILL_INDICATORS = {
  positive: {
    ownership: ['we are', 'i am', 'our team', 'i will', 'we will', 'taking responsibility'],
    clarity: ['specifically', 'precisely', 'exactly', 'eta', 'timeline', 'by eod'],
    confidence: ['confident', 'certain', 'definitely', 'assured', 'established'],
    collaboration: ['team', 'together', 'collaborate', 'coordinate', 'align'],
    proactive: ['preventing', 'proactive', 'anticipate', 'preemptive', 'forward-thinking']
  },
  negative: {
    defensive: ["not my fault", "someone else", "wasn't me", "they did", "blame"],
    vague: ['maybe', 'probably', 'perhaps', 'might', 'could be', 'i think', 'i guess'],
    passive: ['was done', 'is being', 'will be done', 'happened to', 'got'],
    uncertain: ["don't know", "not sure", "unclear", "confused", "uncertain"]
  }
};

/**
 * Main linguistic audit function
 * @param {string} userResponse - The user's text response
 * @param {string} scenarioContext - Context of the crisis scenario
 * @returns {object} Audit results with level, mistakes, suggestions
 */
function auditResponse(userResponse, scenarioContext = '') {
  const lowerResponse = userResponse.toLowerCase();
  const tokens = tokenizer.tokenize(lowerResponse);
  const wordCount = tokens.length;
  
  // Initialize audit result
  const audit = {
    current_level: 'B1',
    confidence_percentage: 0,
    top_3_mistakes: [],
    power_vocabulary_suggestion: null,
    soft_skill_score: 5,
    technical_verb_analysis: {},
    false_friends_detected: [],
    hesitation_ratio: 0,
    advanced_metrics: {}
  };
  
  // 1. TECHNICAL VERB FILTER
  const verbAnalysis = analyzeTechnicalVerbs(lowerResponse);
  audit.technical_verb_analysis = verbAnalysis;
  
  // 2. FALSE FRIENDS DETECTION
  const falseFriends = detectFalseFriends(lowerResponse);
  audit.false_friends_detected = falseFriends;
  
  // 3. HESITATION RATIO CALCULATION
  const hesitationRatio = calculateHesitationRatio(lowerResponse, wordCount);
  audit.hesitation_ratio = hesitationRatio;
  
  // 4. SOFT SKILLS ANALYSIS
  const softSkillScore = analyzeSoftSkills(lowerResponse);
  audit.soft_skill_score = softSkillScore;
  
  // 5. DETERMINE CEFR LEVEL
  const level = determineCEFRLevel({
    verbAnalysis,
    falseFriends,
    hesitationRatio,
    softSkillScore,
    wordCount,
    response: lowerResponse
  });
  audit.current_level = level.level;
  audit.confidence_percentage = level.confidence;
  
  // 6. IDENTIFY TOP 3 MISTAKES
  audit.top_3_mistakes = identifyTop3Mistakes({
    verbAnalysis,
    falseFriends,
    hesitationRatio,
    response: lowerResponse
  });
  
  // 7. POWER VOCABULARY SUGGESTION
  audit.power_vocabulary_suggestion = suggestPowerVocabulary(lowerResponse);
  
  // 8. ADVANCED METRICS
  audit.advanced_metrics = {
    sentence_complexity: calculateSentenceComplexity(userResponse),
    technical_density: calculateTechnicalDensity(lowerResponse, wordCount),
    passive_voice_count: countPassiveVoice(lowerResponse),
    clarity_score: calculateClarityScore(lowerResponse)
  };
  
  return audit;
}

/**
 * Analyze technical verb usage
 */
function analyzeTechnicalVerbs(response) {
  const analysis = {
    B1_verbs: [],
    B2_verbs: [],
    C1_verbs: [],
    C2_verbs: [],
    dominant_level: 'B1',
    score: 0
  };
  
  // Check for verbs at each level
  Object.keys(TECHNICAL_VERBS).forEach(level => {
    TECHNICAL_VERBS[level].forEach(verb => {
      const regex = new RegExp(`\\b${verb}(ing|ed|s)?\\b`, 'gi');
      if (regex.test(response)) {
        analysis[`${level}_verbs`].push(verb);
      }
    });
  });
  
  // Determine dominant level
  if (analysis.C2_verbs.length > 0) {
    analysis.dominant_level = 'C2';
    analysis.score = 10;
  } else if (analysis.C1_verbs.length >= 2) {
    analysis.dominant_level = 'C1';
    analysis.score = 8;
  } else if (analysis.B2_verbs.length >= 2) {
    analysis.dominant_level = 'B2';
    analysis.score = 6;
  } else {
    analysis.dominant_level = 'B1';
    analysis.score = 4;
  }
  
  return analysis;
}

/**
 * Detect false friends in response
 */
function detectFalseFriends(response) {
  const detected = [];
  
  Object.keys(FALSE_FRIENDS).forEach(falseFriend => {
    const pattern = FALSE_FRIENDS[falseFriend];
    const regex = new RegExp(`\\b${pattern.incorrect}\\b`, 'gi');
    
    if (regex.test(response)) {
      // Verify it's being used incorrectly (context-dependent)
      const contextMatch = verifyFalseFriendContext(response, falseFriend);
      if (contextMatch) {
        detected.push({
          incorrect: pattern.incorrect,
          correct: pattern.correct,
          example: pattern.example,
          spanish_meaning: pattern.spanish_meaning
        });
      }
    }
  });
  
  return detected;
}

/**
 * Verify false friend in context (simplified heuristic)
 */
function verifyFalseFriendContext(response, falseFriend) {
  // Simplified context verification
  // In production, would use more sophisticated NLP
  
  if (falseFriend === 'actual' && /actual (version|status|state|situation)/i.test(response)) {
    return true; // Likely means "current" not "real"
  }
  
  if (falseFriend === 'library' && /update.*library|install.*library/i.test(response)) {
    return true; // Likely means dependency/package
  }
  
  if (falseFriend === 'realize' && /realize (the|a|an) (project|change|implementation)/i.test(response)) {
    return true; // Likely means "implement" not "become aware"
  }
  
  if (falseFriend === 'assist' && /assist (the|a) (meeting|conference|session)/i.test(response)) {
    return true; // Likely means "attend" not "help"
  }
  
  // Default: if found, likely incorrect (can be refined)
  return true;
}

/**
 * Calculate hesitation ratio
 */
function calculateHesitationRatio(response, wordCount) {
  let hesitationCount = 0;
  
  HESITATION_MARKERS.forEach(marker => {
    const regex = new RegExp(`\\b${marker}\\b`, 'gi');
    const matches = response.match(regex);
    if (matches) {
      hesitationCount += matches.length;
    }
  });
  
  // Count multiple dots (...) as hesitation
  const ellipsisCount = (response.match(/\.{2,}/g) || []).length;
  hesitationCount += ellipsisCount;
  
  // Ratio: hesitation markers per 100 words
  const ratio = wordCount > 0 ? (hesitationCount / wordCount) * 100 : 0;
  
  return {
    count: hesitationCount,
    ratio: Math.round(ratio * 100) / 100,
    markers_found: hesitationCount > 0 ? HESITATION_MARKERS.filter(m => new RegExp(`\\b${m}\\b`, 'gi').test(response)) : []
  };
}

/**
 * Analyze soft skills from response
 */
function analyzeSoftSkills(response) {
  let score = 5; // Baseline
  
  // Positive indicators (+0.5 each, max +3)
  Object.keys(SOFT_SKILL_INDICATORS.positive).forEach(category => {
    SOFT_SKILL_INDICATORS.positive[category].forEach(indicator => {
      if (new RegExp(`\\b${indicator}\\b`, 'i').test(response)) {
        score += 0.5;
      }
    });
  });
  
  // Negative indicators (-0.5 each, max -3)
  Object.keys(SOFT_SKILL_INDICATORS.negative).forEach(category => {
    SOFT_SKILL_INDICATORS.negative[category].forEach(indicator => {
      if (new RegExp(`\\b${indicator}\\b`, 'i').test(response)) {
        score -= 0.5;
      }
    });
  });
  
  // Clamp between 1-10
  score = Math.max(1, Math.min(10, score));
  
  return Math.round(score * 10) / 10;
}

/**
 * Determine CEFR level based on all factors
 */
function determineCEFRLevel(factors) {
  let levelScore = 0;
  let confidence = 0;
  
  // Factor 1: Technical verb level (weight: 35%)
  const verbWeight = 0.35;
  if (factors.verbAnalysis.dominant_level === 'C2') levelScore += 10 * verbWeight;
  else if (factors.verbAnalysis.dominant_level === 'C1') levelScore += 8 * verbWeight;
  else if (factors.verbAnalysis.dominant_level === 'B2') levelScore += 6 * verbWeight;
  else levelScore += 4 * verbWeight;
  
  // Factor 2: False friends (weight: 25%)
  const falseFriendsWeight = 0.25;
  if (factors.falseFriends.length === 0) {
    levelScore += 10 * falseFriendsWeight;
  } else if (factors.falseFriends.length === 1) {
    levelScore += 6 * falseFriendsWeight;
  } else {
    levelScore += 3 * falseFriendsWeight;
  }
  
  // Factor 3: Hesitation ratio (weight: 20%)
  const hesitationWeight = 0.20;
  if (factors.hesitationRatio.ratio === 0) {
    levelScore += 10 * hesitationWeight;
  } else if (factors.hesitationRatio.ratio < 3) {
    levelScore += 7 * hesitationWeight;
  } else if (factors.hesitationRatio.ratio < 8) {
    levelScore += 4 * hesitationWeight;
  } else {
    levelScore += 2 * hesitationWeight;
  }
  
  // Factor 4: Soft skills (weight: 10%)
  const softSkillWeight = 0.10;
  levelScore += factors.softSkillScore * softSkillWeight;
  
  // Factor 5: Response length and complexity (weight: 10%)
  const lengthWeight = 0.10;
  if (factors.wordCount > 40) levelScore += 10 * lengthWeight;
  else if (factors.wordCount > 25) levelScore += 7 * lengthWeight;
  else if (factors.wordCount > 15) levelScore += 5 * lengthWeight;
  else levelScore += 3 * lengthWeight;
  
  // Determine level from score
  let level = 'B1';
  if (levelScore >= 8.5) {
    level = 'C2';
    confidence = 90;
  } else if (levelScore >= 7.0) {
    level = 'C1';
    confidence = 85;
  } else if (levelScore >= 5.5) {
    level = 'B2';
    confidence = 80;
  } else {
    level = 'B1';
    confidence = 75;
  }
  
  return { level, confidence, score: Math.round(levelScore * 10) / 10 };
}

/**
 * Identify top 3 mistakes
 */
function identifyTop3Mistakes(factors) {
  const mistakes = [];
  
  // Priority 1: False friends (most critical)
  if (factors.falseFriends.length > 0) {
    factors.falseFriends.slice(0, 2).forEach(ff => {
      mistakes.push({
        type: 'False Friend',
        severity: 'high',
        incorrect: ff.incorrect,
        correct: ff.correct,
        explanation: ff.spanish_meaning,
        example: ff.example
      });
    });
  }
  
  // Priority 2: Weak technical verbs
  if (factors.verbAnalysis.dominant_level === 'B1' && mistakes.length < 3) {
    mistakes.push({
      type: 'Weak Technical Vocabulary',
      severity: 'medium',
      issue: `Using only B1-level verbs: ${factors.verbAnalysis.B1_verbs.join(', ')}`,
      suggestion: `Upgrade to C1/C2 verbs like: mitigate, remediate, orchestrate`,
      example: '"fix the issue" → "remediate the incident"'
    });
  }
  
  // Priority 3: High hesitation
  if (factors.hesitationRatio.ratio > 5 && mistakes.length < 3) {
    mistakes.push({
      type: 'Excessive Hesitation',
      severity: 'medium',
      issue: `Hesitation ratio: ${factors.hesitationRatio.ratio}% (${factors.hesitationRatio.count} markers)`,
      markers: factors.hesitationRatio.markers_found.join(', '),
      suggestion: 'Practice speaking with confidence. Eliminate filler words like "um", "like", "you know"',
      example: '"Um, we are, like, working on it" → "We are working on it"'
    });
  }
  
  // Priority 4: Vague language
  if (factors.response.includes('maybe') || factors.response.includes('probably')) {
    if (mistakes.length < 3) {
      mistakes.push({
        type: 'Vague Language',
        severity: 'low',
        issue: 'Using uncertain language (maybe, probably, perhaps)',
        suggestion: 'Be specific and confident. Provide concrete timelines and actions',
        example: '"Maybe we can fix it" → "We will restore service within 15 minutes"'
      });
    }
  }
  
  return mistakes.slice(0, 3);
}

/**
 * Suggest power vocabulary upgrade
 */
function suggestPowerVocabulary(response) {
  // Find the first B1-level word that can be upgraded
  for (const [basicWord, powerWord] of Object.entries(POWER_VOCABULARY)) {
    const regex = new RegExp(`\\b${basicWord}\\b`, 'gi');
    if (regex.test(response)) {
      return {
        basic_word: basicWord,
        power_word: powerWord,
        upgrade_example: `"${basicWord}" (B1) → "${powerWord}" (C2)`,
        usage: `Instead of "${basicWord}", say "${powerWord}" to sound more professional`,
        full_example: generatePowerVocabExample(basicWord, powerWord)
      };
    }
  }
  
  return null;
}

/**
 * Generate example sentence with power vocabulary
 */
function generatePowerVocabExample(basic, power) {
  const examples = {
    'problem': `"We have a problem with the database" → "We have a bottleneck in the database layer"`,
    'fix': `"We need to fix this" → "We need to remediate this incident"`,
    'check': `"Let me check the logs" → "Let me audit the logs"`,
    'make better': `"We'll make the system better" → "We'll optimize the system architecture"`,
    'use': `"We can use this tool" → "We can leverage this tool"`,
    'stop': `"We should stop this process" → "We should terminate this process"`,
    'start': `"Let's start the deployment" → "Let's initiate the deployment"`,
    'change': `"We need to change our approach" → "We need to pivot our strategy"`
  };
  
  return examples[basic] || `"${basic}" → "${power}"`;
}

/**
 * Calculate sentence complexity
 */
function calculateSentenceComplexity(response) {
  const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWords = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
  
  // Simple heuristic: 5-10 words = simple, 10-20 = medium, 20+ = complex
  if (avgWords > 20) return 'complex';
  if (avgWords > 10) return 'medium';
  return 'simple';
}

/**
 * Calculate technical density
 */
function calculateTechnicalDensity(response, wordCount) {
  let technicalTerms = 0;
  
  // Count all technical verbs
  Object.values(TECHNICAL_VERBS).forEach(verbList => {
    verbList.forEach(verb => {
      if (new RegExp(`\\b${verb}`, 'gi').test(response)) {
        technicalTerms++;
      }
    });
  });
  
  // Technical density: percentage of technical terms
  const density = wordCount > 0 ? (technicalTerms / wordCount) * 100 : 0;
  return Math.round(density * 10) / 10;
}

/**
 * Count passive voice constructions
 */
function countPassiveVoice(response) {
  const passivePatterns = [
    /\bwas (being )?(done|made|created|fixed|resolved|implemented)/gi,
    /\bwere (being )?(done|made|created|fixed|resolved|implemented)/gi,
    /\bis (being )?(done|made|created|fixed|resolved|implemented)/gi,
    /\bare (being )?(done|made|created|fixed|resolved|implemented)/gi
  ];
  
  let count = 0;
  passivePatterns.forEach(pattern => {
    const matches = response.match(pattern);
    if (matches) count += matches.length;
  });
  
  return count;
}

/**
 * Calculate clarity score (1-10)
 */
function calculateClarityScore(response) {
  let score = 10;
  
  // Deduct for vague words
  const vagueWords = ['thing', 'stuff', 'something', 'somehow', 'whatever'];
  vagueWords.forEach(word => {
    if (new RegExp(`\\b${word}\\b`, 'gi').test(response)) {
      score -= 1;
    }
  });
  
  // Deduct for excessive passive voice
  const passiveCount = countPassiveVoice(response);
  score -= passiveCount * 0.5;
  
  // Bonus for specific timelines
  if (/\b(eta|timeline|by eod|within \d+ (minutes|hours)|expect.*by)/i.test(response)) {
    score += 1;
  }
  
  return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
}

module.exports = {
  auditResponse,
  TECHNICAL_VERBS,
  FALSE_FRIENDS,
  POWER_VOCABULARY
};

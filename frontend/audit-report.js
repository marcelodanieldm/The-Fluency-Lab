/**
 * Audit Report Card JavaScript
 * Fetches linguistic audit data and animates the report card
 */

const API_URL = 'http://localhost:3000/api';

// Color mapping for CEFR levels
const LEVEL_COLORS = {
  'B1': 'level-b1',
  'B2': 'level-b2',
  'C1': 'level-c1',
  'C2': 'level-c2'
};

// Mock data for demonstration (replace with real API call)
const MOCK_AUDIT = {
  current_level: 'C1',
  confidence_percentage: 85,
  soft_skill_score: 7.5,
  technical_verb_analysis: {
    B1_verbs: [],
    B2_verbs: ['resolve', 'implement'],
    C1_verbs: ['mitigate', 'diagnose', 'orchestrate'],
    C2_verbs: ['remediate'],
    dominant_level: 'C1',
    score: 8
  },
  false_friends_detected: [],
  hesitation_ratio: {
    count: 2,
    ratio: 3.5,
    markers_found: ['um', 'like']
  },
  top_3_mistakes: [
    {
      type: 'Weak Technical Vocabulary',
      severity: 'medium',
      issue: 'Using only B2-level verbs: resolve, implement',
      suggestion: 'Upgrade to C1/C2 verbs like: mitigate, remediate, orchestrate',
      example: '"fix the issue" → "remediate the incident"'
    },
    {
      type: 'Excessive Hesitation',
      severity: 'medium',
      issue: 'Hesitation ratio: 3.5% (2 markers)',
      markers: 'um, like',
      suggestion: 'Practice speaking with confidence. Eliminate filler words',
      example: '"Um, we are, like, working on it" → "We are working on it"'
    }
  ],
  power_vocabulary_suggestion: {
    basic_word: 'problem',
    power_word: 'bottleneck',
    upgrade_example: '"problem" (B1) → "bottleneck" (C2)',
    usage: 'Instead of "problem", say "bottleneck" to sound more professional',
    full_example: '"We have a problem with the database" → "We have a bottleneck in the database layer"'
  }
};

// Google Senior Dev benchmark (industry standard)
const BENCHMARK = {
  vocab_score: 95,
  soft_skill_score: 9,
  hesitation_ratio: 0.5,
  grammar_accuracy: 98
};

/**
 * Initialize the report card
 */
async function initReport() {
  // In production, fetch from API:
  // const audit = await fetchAuditData();
  
  // For demo, use mock data
  const audit = MOCK_AUDIT;
  
  // Set level badge
  setLevelBadge(audit.current_level, audit.confidence_percentage);
  
  // Animate comparisons
  animateComparisons(audit);
  
  // Show mistakes
  displayMistakes(audit.top_3_mistakes);
  
  // Show power vocabulary
  if (audit.power_vocabulary_suggestion) {
    displayPowerVocab(audit.power_vocabulary_suggestion);
  }
  
  // Show level-up progress
  displayLevelUpProgress(audit.current_level);
  
  // Show critical alerts if any
  displayAlerts(audit);
}

/**
 * Set the level badge with color
 */
function setLevelBadge(level, confidence) {
  const levelBadge = document.getElementById('levelBadge');
  const levelText = document.getElementById('levelText');
  const confidenceFill = document.getElementById('confidenceFill');
  const confidencePercent = document.getElementById('confidencePercent');
  
  // Remove all level classes
  levelBadge.className = 'level-badge';
  
  // Add current level class
  levelBadge.classList.add(LEVEL_COLORS[level]);
  
  // Set text
  levelText.textContent = level;
  
  // Animate confidence bar
  setTimeout(() => {
    confidenceFill.style.width = confidence + '%';
    confidencePercent.textContent = confidence + '%';
  }, 500);
  
  // Highlight current level in progression
  document.querySelectorAll('.progression-circle').forEach(circle => {
    const circleLevel = circle.parentElement.dataset.level;
    if (circleLevel === level) {
      circle.classList.add('active');
    }
  });
}

/**
 * Animate comparison bars with insights
 */
function animateComparisons(audit) {
  // Calculate scores
  const vocabScore = (audit.technical_verb_analysis.score / 10) * 100;
  const softScore = (audit.soft_skill_score / 10) * 100;
  const hesitationScore = Math.min(audit.hesitation_ratio.ratio * 10, 100); // Lower is better
  const grammarScore = audit.false_friends_detected.length === 0 ? 100 : 
                       audit.false_friends_detected.length === 1 ? 80 : 60;
  
  // Vocabulary comparison
  setTimeout(() => {
    animateBar('yourVocabBar', vocabScore);
    document.getElementById('yourVocabScore').textContent = Math.round(vocabScore) + '%';
    
    const vocabGap = BENCHMARK.vocab_score - vocabScore;
    document.getElementById('vocabInsight').textContent = 
      vocabGap > 20 ? `🔴 ${Math.round(vocabGap)}% gap. Use more C2-level terms like "remediate", "orchestrate", "leverage".` :
      vocabGap > 10 ? `🟡 ${Math.round(vocabGap)}% gap. Good vocabulary, but add more technical depth.` :
      `🟢 Excellent! Only ${Math.round(vocabGap)}% gap. You're matching senior dev standards.`;
  }, 300);
  
  // Benchmark vocab bar
  setTimeout(() => {
    animateBar(document.querySelector('.comparison-card:nth-child(1) .benchmark-bar'), BENCHMARK.vocab_score);
  }, 600);
  
  // Soft skills comparison
  setTimeout(() => {
    animateBar('yourSoftBar', softScore);
    document.getElementById('yourSoftScore').textContent = audit.soft_skill_score + '/10';
    
    const softGap = BENCHMARK.soft_skill_score - audit.soft_skill_score;
    document.getElementById('softInsight').textContent = 
      softGap > 2 ? `🔴 Work on ownership phrases: "We are handling", "I take responsibility", "Our team is implementing".` :
      softGap > 1 ? `🟡 Good communication, but be more specific with timelines and action steps.` :
      `🟢 Outstanding! Your soft skills match senior dev expectations.`;
  }, 900);
  
  // Benchmark soft skills bar
  setTimeout(() => {
    animateBar(document.querySelector('.comparison-card:nth-child(2) .benchmark-bar'), 90);
  }, 1200);
  
  // Hesitation comparison (inverse - lower is better)
  setTimeout(() => {
    animateBar('yourHesitationBar', hesitationScore);
    document.getElementById('yourHesitationScore').textContent = audit.hesitation_ratio.ratio + '%';
    
    document.getElementById('hesitationInsight').textContent = 
      hesitationScore > 10 ? `🔴 Too many filler words (${audit.hesitation_ratio.count}). Practice eliminating "um", "like", "you know".` :
      hesitationScore > 5 ? `🟡 Some hesitation detected. Work on confident, direct responses.` :
      `🟢 Excellent confidence! Minimal hesitation.`;
  }, 1500);
  
  // Benchmark hesitation bar
  setTimeout(() => {
    animateBar(document.querySelector('.comparison-card:nth-child(3) .benchmark-bar'), 5);
  }, 1800);
  
  // Grammar comparison
  setTimeout(() => {
    animateBar('yourGrammarBar', grammarScore);
    document.getElementById('yourGrammarScore').textContent = Math.round(grammarScore) + '%';
    
    document.getElementById('grammarInsight').textContent = 
      audit.false_friends_detected.length > 1 ? `🔴 ${audit.false_friends_detected.length} false friends detected. Review Spanish-English differences.` :
      audit.false_friends_detected.length === 1 ? `🟡 1 false friend detected: "${audit.false_friends_detected[0].incorrect}". Use "${audit.false_friends_detected[0].correct}" instead.` :
      `🟢 Perfect! No false friends detected. Your grammar is flawless.`;
  }, 2100);
  
  // Benchmark grammar bar
  setTimeout(() => {
    animateBar(document.querySelector('.comparison-card:nth-child(4) .benchmark-bar'), BENCHMARK.grammar_accuracy);
  }, 2400);
}

/**
 * Animate a single bar
 */
function animateBar(elementOrId, targetValue) {
  const element = typeof elementOrId === 'string' ? 
                  document.getElementById(elementOrId) : 
                  elementOrId;
  
  if (element) {
    element.style.width = targetValue + '%';
    element.dataset.value = targetValue;
  }
}

/**
 * Display top mistakes
 */
function displayMistakes(mistakes) {
  const container = document.getElementById('mistakesContainer');
  container.innerHTML = '';
  
  if (!mistakes || mistakes.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No significant mistakes detected! Keep up the great work! 🎉</p>';
    return;
  }
  
  mistakes.forEach((mistake, index) => {
    const card = document.createElement('div');
    card.className = `mistake-card severity-${mistake.severity}`;
    card.style.animationDelay = `${index * 0.2}s`;
    
    card.innerHTML = `
      <div class="mistake-header">
        <div class="mistake-type">${index + 1}. ${mistake.type}</div>
        <span class="mistake-severity severity-${mistake.severity}">${mistake.severity}</span>
      </div>
      <div class="mistake-details">
        <strong>Issue:</strong> ${mistake.issue || mistake.incorrect}
      </div>
      <div class="mistake-details">
        <strong>Suggestion:</strong> ${mistake.suggestion || mistake.correct}
      </div>
      ${mistake.example ? `<div class="mistake-example">${mistake.example}</div>` : ''}
    `;
    
    container.appendChild(card);
  });
}

/**
 * Display power vocabulary upgrade
 */
function displayPowerVocab(powerVocab) {
  const section = document.getElementById('powerVocabSection');
  section.style.display = 'block';
  
  document.getElementById('basicWord').textContent = powerVocab.basic_word;
  document.getElementById('powerWord').textContent = powerVocab.power_word;
  document.getElementById('vocabExample').textContent = powerVocab.full_example;
}

/**
 * Display level-up progress
 */
async function displayLevelUpProgress(currentLevel) {
  // In production, fetch from API:
  // const status = await fetchLevelingStatus();
  
  // Mock data for demo
  const status = {
    current_level: currentLevel,
    unlocked_weeks: [1, 2, 3],
    level_up_progress: {
      percentage: 66,
      qualifying_audits: 2,
      required_audits: 3,
      target_level: 'C2',
      message: '2/3 sessions at C2 level. Keep going!'
    }
  };
  
  const nextLevel = getNextLevel(currentLevel);
  
  document.getElementById('currentLevelText').textContent = currentLevel;
  document.getElementById('targetLevelText').textContent = nextLevel || 'MAX';
  
  if (!nextLevel) {
    document.getElementById('levelupMessage').textContent = '🏆 Congratulations! You are at the highest level (C2)!';
    document.getElementById('progressFill').style.width = '100%';
    document.getElementById('progressPercent').textContent = '100%';
    document.getElementById('progressText').textContent = 'Maximum level achieved!';
    return;
  }
  
  const progress = status.level_up_progress;
  
  setTimeout(() => {
    document.getElementById('progressFill').style.width = progress.percentage + '%';
    document.getElementById('progressPercent').textContent = progress.percentage + '%';
    document.getElementById('progressText').textContent = progress.message;
    document.getElementById('levelupMessage').textContent = 
      progress.percentage === 100 ? 
      `🎉 Level-up available! You can now upgrade to ${nextLevel}!` :
      `Complete ${progress.required_audits - progress.qualifying_audits} more session(s) at ${nextLevel} level to unlock Week ${getWeekForLevel(nextLevel)} content!`;
  }, 2700);
}

/**
 * Display critical alerts
 */
function displayAlerts(audit) {
  const section = document.getElementById('alertsSection');
  const container = document.getElementById('alertsContainer');
  
  const alerts = [];
  
  // Check for critical false friends
  if (audit.false_friends_detected.length > 0) {
    audit.false_friends_detected.forEach(ff => {
      alerts.push({
        icon: '⚠️',
        title: `False Friend Detected: "${ff.incorrect}"`,
        message: `You used "${ff.incorrect}" but should use "${ff.correct}". ${ff.spanish_meaning}`
      });
    });
  }
  
  // Check for high hesitation
  if (audit.hesitation_ratio.ratio > 10) {
    alerts.push({
      icon: '🔴',
      title: 'Excessive Hesitation Detected',
      message: `You used ${audit.hesitation_ratio.count} filler words (${audit.hesitation_ratio.markers_found.join(', ')}). This signals lack of confidence. Practice eliminating these markers.`
    });
  }
  
  // Check for low soft skills
  if (audit.soft_skill_score < 5) {
    alerts.push({
      icon: '🚨',
      title: 'Low Soft Skills Score',
      message: 'Your communication lacks ownership and specificity. Use phrases like "We are handling", "I take responsibility", and always provide concrete timelines.'
    });
  }
  
  if (alerts.length > 0) {
    section.style.display = 'block';
    container.innerHTML = '';
    
    alerts.forEach((alert, index) => {
      const alertDiv = document.createElement('div');
      alertDiv.className = 'alert-item';
      alertDiv.style.animationDelay = `${index * 0.1}s`;
      
      alertDiv.innerHTML = `
        <div class="alert-icon">${alert.icon}</div>
        <div class="alert-content">
          <h5>${alert.title}</h5>
          <p>${alert.message}</p>
        </div>
      `;
      
      container.appendChild(alertDiv);
    });
  }
}

/**
 * Get next level in hierarchy
 */
function getNextLevel(currentLevel) {
  const hierarchy = ['B1', 'B2', 'C1', 'C2'];
  const currentIndex = hierarchy.indexOf(currentLevel);
  return currentIndex < hierarchy.length - 1 ? hierarchy[currentIndex + 1] : null;
}

/**
 * Get week number unlocked for level
 */
function getWeekForLevel(level) {
  const weekMap = {
    'B2': 3,
    'C1': 4,
    'C2': 'All'
  };
  return weekMap[level] || '?';
}

/**
 * Fetch audit data from API (placeholder)
 */
async function fetchAuditData() {
  try {
    // In production, replace with real API call:
    // const response = await fetch(`${API_URL}/leveling/audit-history/demo_user?limit=1`);
    // const data = await response.json();
    // return data.audits[0];
    
    return MOCK_AUDIT;
  } catch (error) {
    console.error('Error fetching audit data:', error);
    return MOCK_AUDIT;
  }
}

/**
 * Fetch leveling status from API (placeholder)
 */
async function fetchLevelingStatus() {
  try {
    // In production:
    // const response = await fetch(`${API_URL}/leveling/status/demo_user`);
    // const data = await response.json();
    // return data.status;
    
    return null;
  } catch (error) {
    console.error('Error fetching leveling status:', error);
    return null;
  }
}

/**
 * Event listeners
 */
document.getElementById('newSessionBtn').addEventListener('click', () => {
  window.location.href = 'crisis-coach.html';
});

document.getElementById('viewHistoryBtn').addEventListener('click', () => {
  alert('Audit history feature coming soon! This will show your past 10 linguistic audits with trends over time.');
});

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  initReport();
});

/**
 * Dynamic Leveling Service
 * Tracks user audit history and triggers level-ups based on consistent performance
 * Unlocks new content when users demonstrate proficiency above their registered level
 */

const linguisticAuditor = require('./linguisticAuditor');

// In-memory storage for audit history (would use database in production)
const auditHistory = new Map(); // userId -> array of audits
const userLevels = new Map(); // userId -> current registered level
const levelUpNotifications = new Map(); // userId -> array of notifications

// CEFR Level hierarchy
const LEVEL_HIERARCHY = {
  'B1': 1,
  'B2': 2,
  'C1': 3,
  'C2': 4
};

const LEVEL_NAMES = ['B1', 'B2', 'C1', 'C2'];

// Week unlock mapping
const WEEK_UNLOCKS = {
  'B1': [1, 2], // Week 1: Casual, Week 2: Crisis
  'B2': [1, 2, 3], // Week 3: Negotiation
  'C1': [1, 2, 3, 4], // Week 4: Executive Presentations
  'C2': [1, 2, 3, 4] // All weeks
};

/**
 * Initialize user in the leveling system
 */
function initializeUser(userId, initialLevel = 'B1') {
  if (!userLevels.has(userId)) {
    userLevels.set(userId, initialLevel);
    auditHistory.set(userId, []);
    levelUpNotifications.set(userId, []);
  }
  return {
    userId,
    current_level: userLevels.get(userId),
    unlocked_weeks: WEEK_UNLOCKS[userLevels.get(userId)] || [1, 2]
  };
}

/**
 * Record an audit result for a user
 */
function recordAudit(userId, auditResult) {
  if (!auditHistory.has(userId)) {
    initializeUser(userId);
  }
  
  const userAudits = auditHistory.get(userId);
  
  // Create audit record
  const auditRecord = {
    timestamp: new Date().toISOString(),
    detected_level: auditResult.current_level,
    confidence: auditResult.confidence_percentage,
    soft_skill_score: auditResult.soft_skill_score,
    mistakes_count: auditResult.top_3_mistakes.length,
    hesitation_ratio: auditResult.hesitation_ratio.ratio,
    technical_verb_level: auditResult.technical_verb_analysis.dominant_level
  };
  
  // Add to history
  userAudits.push(auditRecord);
  
  // Keep only last 10 audits
  if (userAudits.length > 10) {
    userAudits.shift();
  }
  
  auditHistory.set(userId, userAudits);
  
  // Check for level-up
  const levelUpResult = checkForLevelUp(userId);
  
  return {
    audit_recorded: true,
    audit_count: userAudits.length,
    level_up_triggered: levelUpResult.triggered,
    notification: levelUpResult.notification
  };
}

/**
 * Check if user qualifies for level-up based on last 3 audits
 */
function checkForLevelUp(userId) {
  const currentLevel = userLevels.get(userId);
  const audits = auditHistory.get(userId) || [];
  
  // Need at least 3 audits to check
  if (audits.length < 3) {
    return {
      triggered: false,
      reason: 'insufficient_audits',
      audits_needed: 3 - audits.length
    };
  }
  
  // Get last 3 audits
  const lastThreeAudits = audits.slice(-3);
  
  // Check if all 3 audits show higher level
  const detectedLevels = lastThreeAudits.map(a => a.detected_level);
  const allAboveCurrent = detectedLevels.every(level => {
    return LEVEL_HIERARCHY[level] > LEVEL_HIERARCHY[currentLevel];
  });
  
  if (!allAboveCurrent) {
    return {
      triggered: false,
      reason: 'inconsistent_performance',
      last_3_levels: detectedLevels
    };
  }
  
  // Determine target level (most common in last 3)
  const targetLevel = getMostCommonLevel(detectedLevels);
  
  // Check if already at target level (prevent duplicate notifications)
  if (LEVEL_HIERARCHY[targetLevel] <= LEVEL_HIERARCHY[currentLevel]) {
    return {
      triggered: false,
      reason: 'already_at_level'
    };
  }
  
  // LEVEL UP TRIGGERED!
  const notification = createLevelUpNotification(userId, currentLevel, targetLevel);
  
  return {
    triggered: true,
    from_level: currentLevel,
    to_level: targetLevel,
    notification
  };
}

/**
 * Get most common level from array
 */
function getMostCommonLevel(levels) {
  const counts = {};
  levels.forEach(level => {
    counts[level] = (counts[level] || 0) + 1;
  });
  
  // Return highest level if tie
  const maxCount = Math.max(...Object.values(counts));
  const topLevels = Object.keys(counts).filter(l => counts[l] === maxCount);
  
  return topLevels.reduce((highest, current) => {
    return LEVEL_HIERARCHY[current] > LEVEL_HIERARCHY[highest] ? current : highest;
  });
}

/**
 * Create level-up notification
 */
function createLevelUpNotification(userId, fromLevel, toLevel) {
  const notification = {
    id: `levelup_${userId}_${Date.now()}`,
    type: 'LEVEL_UP',
    userId,
    timestamp: new Date().toISOString(),
    from_level: fromLevel,
    to_level: toLevel,
    title: '🎉 LEVEL UP! Congratulations!',
    message: `Amazing progress! You've consistently demonstrated ${toLevel}-level English in your last 3 crisis sessions. You're ready for advanced content!`,
    actions: {
      accept: true,
      decline: false // Auto-accept recommended
    },
    unlocked_content: {
      previous_weeks: WEEK_UNLOCKS[fromLevel],
      new_weeks: WEEK_UNLOCKS[toLevel],
      newly_unlocked: WEEK_UNLOCKS[toLevel].filter(w => !WEEK_UNLOCKS[fromLevel].includes(w))
    },
    read: false
  };
  
  // Store notification
  const userNotifications = levelUpNotifications.get(userId) || [];
  userNotifications.push(notification);
  levelUpNotifications.set(userId, userNotifications);
  
  return notification;
}

/**
 * Accept level-up and upgrade user
 */
function acceptLevelUp(userId, notificationId) {
  const notifications = levelUpNotifications.get(userId) || [];
  const notification = notifications.find(n => n.id === notificationId);
  
  if (!notification) {
    return {
      success: false,
      error: 'Notification not found'
    };
  }
  
  if (notification.read) {
    return {
      success: false,
      error: 'Level-up already accepted'
    };
  }
  
  // Update user level
  const oldLevel = userLevels.get(userId);
  const newLevel = notification.to_level;
  userLevels.set(userId, newLevel);
  
  // Mark notification as read
  notification.read = true;
  notification.accepted_at = new Date().toISOString();
  
  return {
    success: true,
    old_level: oldLevel,
    new_level: newLevel,
    unlocked_weeks: WEEK_UNLOCKS[newLevel],
    newly_unlocked_weeks: notification.unlocked_content.newly_unlocked,
    message: `Level upgraded from ${oldLevel} to ${newLevel}! You now have access to Week ${notification.unlocked_content.newly_unlocked.join(', ')} content.`
  };
}

/**
 * Get user's current status
 */
function getUserStatus(userId) {
  if (!userLevels.has(userId)) {
    initializeUser(userId);
  }
  
  const currentLevel = userLevels.get(userId);
  const audits = auditHistory.get(userId) || [];
  const lastThreeAudits = audits.slice(-3);
  const notifications = levelUpNotifications.get(userId) || [];
  const unreadNotifications = notifications.filter(n => !n.read);
  
  // Calculate progress to next level
  const nextLevel = getNextLevel(currentLevel);
  const progress = calculateLevelUpProgress(lastThreeAudits, currentLevel, nextLevel);
  
  return {
    userId,
    current_level: currentLevel,
    unlocked_weeks: WEEK_UNLOCKS[currentLevel],
    total_audits: audits.length,
    recent_audits: lastThreeAudits.map(a => ({
      detected_level: a.detected_level,
      confidence: a.confidence,
      timestamp: a.timestamp
    })),
    level_up_progress: progress,
    pending_notifications: unreadNotifications,
    has_level_up_available: unreadNotifications.some(n => n.type === 'LEVEL_UP')
  };
}

/**
 * Get next level in hierarchy
 */
function getNextLevel(currentLevel) {
  const currentIndex = LEVEL_HIERARCHY[currentLevel];
  if (currentIndex === 4) return null; // Already at C2
  return LEVEL_NAMES[currentIndex];
}

/**
 * Calculate progress towards next level (0-100%)
 */
function calculateLevelUpProgress(lastThreeAudits, currentLevel, nextLevel) {
  if (!nextLevel) {
    return {
      percentage: 100,
      status: 'max_level_reached',
      message: 'You are at the highest level (C2)!'
    };
  }
  
  if (lastThreeAudits.length === 0) {
    return {
      percentage: 0,
      status: 'no_audits',
      audits_needed: 3,
      message: 'Complete 3 crisis sessions to unlock level-up tracking'
    };
  }
  
  // Count how many of last 3 audits are at next level or higher
  const qualifyingAudits = lastThreeAudits.filter(a => {
    return LEVEL_HIERARCHY[a.detected_level] >= LEVEL_HIERARCHY[nextLevel];
  }).length;
  
  const percentage = Math.round((qualifyingAudits / 3) * 100);
  
  let status = 'in_progress';
  let message = `${qualifyingAudits}/3 sessions at ${nextLevel} level. Keep going!`;
  
  if (percentage === 100) {
    status = 'ready_for_level_up';
    message = `🎉 Level-up available! Accept your ${nextLevel} upgrade!`;
  }
  
  return {
    percentage,
    status,
    qualifying_audits: qualifyingAudits,
    required_audits: 3,
    target_level: nextLevel,
    message
  };
}

/**
 * Get all notifications for a user
 */
function getUserNotifications(userId) {
  const notifications = levelUpNotifications.get(userId) || [];
  return notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Check if user has access to specific week
 */
function hasAccessToWeek(userId, weekNumber) {
  const currentLevel = userLevels.get(userId) || 'B1';
  const unlockedWeeks = WEEK_UNLOCKS[currentLevel] || [1, 2];
  return unlockedWeeks.includes(weekNumber);
}

/**
 * Get audit history for a user
 */
function getAuditHistory(userId, limit = 10) {
  const audits = auditHistory.get(userId) || [];
  return audits.slice(-limit).reverse(); // Most recent first
}

/**
 * Clear all data for a user (for testing)
 */
function clearUserData(userId) {
  auditHistory.delete(userId);
  userLevels.delete(userId);
  levelUpNotifications.delete(userId);
  return { success: true, message: 'User data cleared' };
}

/**
 * Get system statistics
 */
function getSystemStats() {
  const totalUsers = userLevels.size;
  const levelDistribution = {};
  
  userLevels.forEach(level => {
    levelDistribution[level] = (levelDistribution[level] || 0) + 1;
  });
  
  const totalAudits = Array.from(auditHistory.values()).reduce((sum, audits) => sum + audits.length, 0);
  const totalLevelUps = Array.from(levelUpNotifications.values()).reduce((sum, notifs) => sum + notifs.filter(n => n.read).length, 0);
  
  return {
    total_users: totalUsers,
    level_distribution: levelDistribution,
    total_audits: totalAudits,
    total_level_ups: totalLevelUps,
    pending_level_ups: Array.from(levelUpNotifications.values()).reduce((sum, notifs) => sum + notifs.filter(n => !n.read).length, 0)
  };
}

module.exports = {
  initializeUser,
  recordAudit,
  checkForLevelUp,
  acceptLevelUp,
  getUserStatus,
  getUserNotifications,
  hasAccessToWeek,
  getAuditHistory,
  clearUserData,
  getSystemStats,
  LEVEL_HIERARCHY,
  WEEK_UNLOCKS
};

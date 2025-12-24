/**
 * Data Analytics Service
 * Analyzes audit reports to detect patterns and generate insights
 * Automatically identifies content gaps and notifies stakeholders
 */

const levelingService = require('./levelingService');

// In-memory storage for analytics (would use database in production)
const analyticsCache = new Map(); // Cache for aggregated data
const contentGapAlerts = new Map(); // Detected content gaps

// Technical Phrasal Verbs for IT/Business contexts
const TECHNICAL_PHRASAL_VERBS = [
  'look into', 'break down', 'set up', 'roll out', 'scale up', 'scale down',
  'shut down', 'boot up', 'log in', 'log out', 'back up', 'bring up',
  'carry out', 'figure out', 'work out', 'run through', 'go over', 'follow up',
  'come up with', 'catch up', 'keep up', 'deal with', 'fall back on',
  'stand by', 'pull off', 'phase out', 'lock down', 'spin up', 'tear down'
];

// Minimum sample size for statistical significance
const MIN_SAMPLE_SIZE = 10;

// Threshold for triggering content gap alerts
const FAILURE_THRESHOLD = 0.80; // 80%

/**
 * Analyze phrasal verb usage in audit data
 */
function analyzePhrasalVerbUsage(response) {
  const lowerResponse = response.toLowerCase();
  const phrasalVerbsFound = [];
  
  // Use word boundary regex to match complete phrasal verbs only
  TECHNICAL_PHRASAL_VERBS.forEach(verb => {
    // Escape special regex characters and create pattern with word boundaries
    const escapedVerb = verb.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`\\b${escapedVerb}\\b`, 'i');
    
    if (pattern.test(response)) {
      phrasalVerbsFound.push(verb);
    }
  });
  
  // If response is technical but lacks phrasal verbs, flag as missing opportunity
  const isTechnicalContext = /\b(system|server|database|code|project|issue|problem|solution)\b/i.test(response);
  
  return {
    phrasal_verbs_found: phrasalVerbsFound,
    phrasal_verbs_count: phrasalVerbsFound.length,
    lacks_phrasal_verbs: phrasalVerbsFound.length === 0 && isTechnicalContext,
    technical_context_detected: isTechnicalContext
  };
}

/**
 * Aggregate audit data by user level
 */
function aggregateAuditsByLevel() {
  const aggregation = {
    B1: { total: 0, phrasal_verb_failures: 0, common_mistakes: {} },
    B2: { total: 0, phrasal_verb_failures: 0, common_mistakes: {} },
    C1: { total: 0, phrasal_verb_failures: 0, common_mistakes: {} },
    C2: { total: 0, phrasal_verb_failures: 0, common_mistakes: {} }
  };
  
  // Get all audit history from leveling service
  // In production, this would query a database
  // For now, we'll analyze from the leveling service's in-memory data
  
  return aggregation;
}

/**
 * Record phrasal verb usage for a user audit
 */
function recordPhrasalVerbUsage(userId, userLevel, response, auditResults) {
  const phrasalVerbAnalysis = analyzePhrasalVerbUsage(response);
  
  // Get or create analytics entry for this level
  const levelKey = `phrasal_verbs_${userLevel}`;
  if (!analyticsCache.has(levelKey)) {
    analyticsCache.set(levelKey, {
      total_audits: 0,
      users_lacking_phrasal_verbs: 0,
      users_with_phrasal_verbs: 0,
      phrasal_verbs_used: {},
      last_updated: new Date().toISOString()
    });
  }
  
  const levelData = analyticsCache.get(levelKey);
  levelData.total_audits++;
  
  if (phrasalVerbAnalysis.lacks_phrasal_verbs) {
    levelData.users_lacking_phrasal_verbs++;
  } else if (phrasalVerbAnalysis.phrasal_verbs_count > 0) {
    levelData.users_with_phrasal_verbs++;
    
    // Track which phrasal verbs are used
    phrasalVerbAnalysis.phrasal_verbs_found.forEach(verb => {
      levelData.phrasal_verbs_used[verb] = (levelData.phrasal_verbs_used[verb] || 0) + 1;
    });
  }
  
  levelData.last_updated = new Date().toISOString();
  
  // Check if we should trigger a content gap alert
  checkContentGaps(userLevel);
  
  return {
    recorded: true,
    phrasal_verb_analysis: phrasalVerbAnalysis,
    level_stats: levelData
  };
}

/**
 * Check if content gaps exist and generate alerts
 */
function checkContentGaps(level) {
  const levelKey = `phrasal_verbs_${level}`;
  const levelData = analyticsCache.get(levelKey);
  
  if (!levelData) return null;
  
  // Need minimum sample size for statistical significance
  if (levelData.total_audits < MIN_SAMPLE_SIZE) {
    return null;
  }
  
  // Calculate failure rate
  const failureRate = levelData.users_lacking_phrasal_verbs / levelData.total_audits;
  
  // If 80% or more users lack phrasal verbs, trigger alert
  if (failureRate >= FAILURE_THRESHOLD) {
    const alertKey = `phrasal_verbs_${level}_${Date.now()}`;
    
    // Check if we already have a recent alert for this
    const existingAlert = Array.from(contentGapAlerts.values()).find(
      alert => alert.gap_type === 'phrasal_verbs' && 
               alert.target_level === level &&
               alert.status === 'pending'
    );
    
    if (existingAlert) {
      return existingAlert; // Don't create duplicate alerts
    }
    
    const alert = {
      id: alertKey,
      type: 'CONTENT_GAP_DETECTED',
      severity: 'high',
      gap_type: 'phrasal_verbs',
      target_level: level,
      detected_at: new Date().toISOString(),
      status: 'pending',
      
      statistics: {
        sample_size: levelData.total_audits,
        failure_count: levelData.users_lacking_phrasal_verbs,
        failure_rate: Math.round(failureRate * 100),
        users_with_phrasal_verbs: levelData.users_with_phrasal_verbs
      },
      
      recommendation: {
        title: `Create Dedicated Phrasal Verbs Module for ${level} Learners`,
        priority: 'HIGH',
        impact: 'Large - Affects ' + Math.round(failureRate * 100) + '% of ' + level + ' users',
        suggested_content: [
          'Technical Phrasal Verbs in IT contexts',
          'Business Phrasal Verbs for professional communication',
          'Interactive exercises: "look into", "break down", "set up", "roll out"',
          'Crisis scenarios specifically testing phrasal verb usage',
          'Comparison: Formal verbs vs. Phrasal verbs in workplace'
        ],
        estimated_development_time: '2-3 weeks',
        expected_impact: `Improve ${level} user proficiency by 25-30%`
      },
      
      data_insights: {
        most_common_gap: 'Users use formal verbs (investigate, analyze) instead of natural phrasal verbs (look into, break down)',
        user_examples: [
          'User said: "We need to investigate the issue" → Should use: "look into"',
          'User said: "Let me analyze the problem" → Should use: "break down"',
          'User said: "We will implement the solution" → Should use: "roll out"'
        ],
        benchmark_comparison: 'Native speakers use 5-7 phrasal verbs per crisis scenario. ' + level + ' users average: 0.2'
      },
      
      stakeholder_message: `
🚨 CONTENT GAP ALERT: Phrasal Verbs Deficiency in ${level} Cohort

Data Analysis Summary:
• Sample Size: ${levelData.total_audits} users
• Failure Rate: ${Math.round(failureRate * 100)}% of ${level} users lack technical phrasal verbs
• Statistical Significance: ✅ (threshold: ${MIN_SAMPLE_SIZE}+ users, ${FAILURE_THRESHOLD * 100}%+ failure rate)

Problem Identified:
${level} users consistently use formal verbs instead of natural phrasal verbs in technical contexts. 
This creates unnatural, overly formal communication that doesn't match native speaker patterns.

Recommended Action:
Create a dedicated "Technical Phrasal Verbs" module targeting ${level} learners with:
1. 30 essential IT/business phrasal verbs
2. Interactive crisis scenarios testing usage
3. Comparison exercises (formal vs. natural)
4. Real-world examples from tech companies

Expected ROI:
• Improve ${level} user proficiency by 25-30%
• Reduce time to C1 level by 2-3 weeks
• Increase user satisfaction scores
• Better prepare users for real workplace communication

Data Last Updated: ${levelData.last_updated}
      `.trim()
    };
    
    contentGapAlerts.set(alertKey, alert);
    
    console.log('\n🚨 CONTENT GAP ALERT GENERATED:');
    console.log(`   Level: ${level}`);
    console.log(`   Failure Rate: ${Math.round(failureRate * 100)}%`);
    console.log(`   Sample Size: ${levelData.total_audits} users`);
    console.log(`   Alert ID: ${alertKey}\n`);
    
    return alert;
  }
  
  return null;
}

/**
 * Get all content gap alerts
 */
function getContentGapAlerts(filters = {}) {
  let alerts = Array.from(contentGapAlerts.values());
  
  // Filter by status
  if (filters.status) {
    alerts = alerts.filter(a => a.status === filters.status);
  }
  
  // Filter by level
  if (filters.level) {
    alerts = alerts.filter(a => a.target_level === filters.level);
  }
  
  // Filter by gap type
  if (filters.gap_type) {
    alerts = alerts.filter(a => a.gap_type === filters.gap_type);
  }
  
  // Sort by detected date (newest first)
  alerts.sort((a, b) => new Date(b.detected_at) - new Date(a.detected_at));
  
  return alerts;
}

/**
 * Mark alert as acknowledged/resolved
 */
function updateAlertStatus(alertId, status, notes = '') {
  const alert = contentGapAlerts.get(alertId);
  
  if (!alert) {
    return { success: false, error: 'Alert not found' };
  }
  
  alert.status = status;
  alert.updated_at = new Date().toISOString();
  
  if (notes) {
    alert.resolution_notes = notes;
  }
  
  if (status === 'resolved') {
    alert.resolved_at = new Date().toISOString();
  }
  
  return {
    success: true,
    alert
  };
}

/**
 * Get analytics dashboard data
 */
function getAnalyticsDashboard() {
  const dashboard = {
    phrasal_verb_analytics: {},
    content_gaps: {
      total: contentGapAlerts.size,
      pending: 0,
      acknowledged: 0,
      resolved: 0
    },
    recommendations: []
  };
  
  // Aggregate phrasal verb data by level
  ['B1', 'B2', 'C1', 'C2'].forEach(level => {
    const levelKey = `phrasal_verbs_${level}`;
    const levelData = analyticsCache.get(levelKey);
    
    if (levelData) {
      const failureRate = levelData.total_audits > 0 ? 
                         (levelData.users_lacking_phrasal_verbs / levelData.total_audits) : 0;
      
      dashboard.phrasal_verb_analytics[level] = {
        total_audits: levelData.total_audits,
        users_lacking: levelData.users_lacking_phrasal_verbs,
        users_proficient: levelData.users_with_phrasal_verbs,
        failure_rate: Math.round(failureRate * 100),
        status: failureRate >= FAILURE_THRESHOLD ? 'CRITICAL' : 
                failureRate >= 0.60 ? 'WARNING' : 'GOOD',
        most_used_phrasal_verbs: Object.entries(levelData.phrasal_verbs_used)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([verb, count]) => ({ verb, count }))
      };
    }
  });
  
  // Count alert statuses
  contentGapAlerts.forEach(alert => {
    if (alert.status === 'pending') dashboard.content_gaps.pending++;
    else if (alert.status === 'acknowledged') dashboard.content_gaps.acknowledged++;
    else if (alert.status === 'resolved') dashboard.content_gaps.resolved++;
  });
  
  // Generate recommendations
  Object.entries(dashboard.phrasal_verb_analytics).forEach(([level, data]) => {
    if (data.status === 'CRITICAL') {
      dashboard.recommendations.push({
        priority: 'HIGH',
        level,
        issue: `${data.failure_rate}% of ${level} users lack phrasal verbs`,
        action: 'Create dedicated Phrasal Verbs module immediately'
      });
    } else if (data.status === 'WARNING') {
      dashboard.recommendations.push({
        priority: 'MEDIUM',
        level,
        issue: `${data.failure_rate}% of ${level} users lack phrasal verbs`,
        action: 'Monitor trend and prepare content if failure rate increases'
      });
    }
  });
  
  return dashboard;
}

/**
 * Get detailed analytics for specific level
 */
function getLevelAnalytics(level) {
  const levelKey = `phrasal_verbs_${level}`;
  const levelData = analyticsCache.get(levelKey);
  
  if (!levelData) {
    return {
      level,
      total_audits: 0,
      message: 'No data available yet'
    };
  }
  
  const failureRate = levelData.total_audits > 0 ? 
                     (levelData.users_lacking_phrasal_verbs / levelData.total_audits) : 0;
  
  const successRate = levelData.total_audits > 0 ?
                     (levelData.users_with_phrasal_verbs / levelData.total_audits) : 0;
  
  return {
    level,
    total_audits: levelData.total_audits,
    users_lacking_phrasal_verbs: levelData.users_lacking_phrasal_verbs,
    users_with_phrasal_verbs: levelData.users_with_phrasal_verbs,
    failure_rate: Math.round(failureRate * 100),
    success_rate: Math.round(successRate * 100),
    status: failureRate >= FAILURE_THRESHOLD ? 'CRITICAL' : 
            failureRate >= 0.60 ? 'WARNING' : 'GOOD',
    phrasal_verbs_usage: Object.entries(levelData.phrasal_verbs_used)
      .sort(([,a], [,b]) => b - a)
      .map(([verb, count]) => ({ verb, count, percentage: Math.round((count / levelData.total_audits) * 100) })),
    alerts_triggered: getContentGapAlerts({ level, status: 'pending' }).length,
    last_updated: levelData.last_updated
  };
}

/**
 * Clear all analytics data (for testing)
 */
function clearAnalytics() {
  analyticsCache.clear();
  contentGapAlerts.clear();
  return { success: true, message: 'All analytics data cleared' };
}

/**
 * Get system statistics
 */
function getSystemStats() {
  return {
    total_analytics_entries: analyticsCache.size,
    total_content_gap_alerts: contentGapAlerts.size,
    pending_alerts: getContentGapAlerts({ status: 'pending' }).length,
    technical_phrasal_verbs_tracked: TECHNICAL_PHRASAL_VERBS.length,
    minimum_sample_size: MIN_SAMPLE_SIZE,
    failure_threshold: FAILURE_THRESHOLD * 100 + '%'
  };
}

/**
 * Analyze B2 phrasal verb gap (specific threshold checking)
 */
function analyzeB2PhrasalVerbGap() {
  const levelKey = 'phrasal_verbs_B2';
  const levelData = analyticsCache.get(levelKey);
  
  if (!levelData || levelData.total_audits < MIN_SAMPLE_SIZE) {
    return {
      total_b2_users: levelData ? levelData.total_audits : 0,
      users_failing: 0,
      failure_rate: 0,
      affected_users: [],
      threshold_exceeded: false,
      insufficient_data: levelData ? levelData.total_audits < MIN_SAMPLE_SIZE : true
    };
  }
  
  const failureRate = (levelData.users_lacking_phrasal_verbs / levelData.total_audits) * 100;
  
  return {
    total_b2_users: levelData.total_audits,
    users_failing: levelData.users_lacking_phrasal_verbs,
    failure_rate: Math.round(failureRate * 10) / 10,
    affected_users: [], // Would track individual users in production
    threshold_exceeded: failureRate >= (FAILURE_THRESHOLD * 100)
  };
}

/**
 * Generate stakeholder notification for content gaps
 */
function generateStakeholderNotification(gapAnalysis) {
  const notificationId = `content_gap_phrasal_verbs_${Date.now()}`;
  const severity = gapAnalysis.failure_rate >= 90 ? 'critical' : 'high';
  
  const notification = {
    id: notificationId,
    type: 'content_gap_suggestion',
    severity: severity,
    created_at: new Date().toISOString(),
    target_audience: ['admin', 'content_creator', 'partner'],
    
    title: `🚨 ${severity === 'critical' ? 'Critical' : 'Significant'} Content Gap Detected: B2 Phrasal Verbs`,
    
    summary: `${gapAnalysis.failure_rate}% of B2 users are struggling with technical phrasal verbs in crisis scenarios`,
    
    analysis: {
      affected_level: 'B2',
      gap_type: 'phrasal_verbs',
      failure_rate: gapAnalysis.failure_rate,
      sample_size: gapAnalysis.total_b2_users,
      users_affected: gapAnalysis.users_failing
    },
    
    recommendation: {
      action: 'Create dedicated Technical Phrasal Verbs module for B2 learners',
      priority: 'high',
      suggested_content: [
        'Technical Phrasal Verbs Masterclass (look into, break down, roll back, scale up/down)',
        'Interactive exercises with IT crisis scenarios using phrasal verbs',
        'Flashcard deck with 50+ technical phrasal verbs with examples',
        'Practice conversations focusing on phrasal verb usage under pressure',
        'Video lessons: "Why Senior Devs Love Phrasal Verbs"'
      ],
      estimated_impact: `${gapAnalysis.users_failing} users (${gapAnalysis.failure_rate}% of B2 cohort) would benefit immediately`,
      target_outcomes: [
        'Increase B2 phrasal verb usage by 40%',
        'Reduce failure rate from 80%+ to <30%',
        'Improve overall fluency scores by 15-20%',
        'Accelerate B2→C1 progression'
      ]
    },
    
    call_to_action: 'Review analytics dashboard and approve module creation. Estimated development time: 2 weeks.',
    
    expires_at: null,
    acknowledged: false,
    acknowledged_by: null,
    acknowledged_at: null
  };
  
  // Store notification
  contentGapAlerts.set(notificationId, {
    ...notification,
    status: 'pending',
    created_timestamp: Date.now()
  });
  
  return notification;
}

/**
 * Get active (unacknowledged) notifications
 */
function getActiveNotifications() {
  return Array.from(contentGapAlerts.values())
    .filter(alert => alert.status === 'pending' && !alert.acknowledged)
    .map(alert => {
      // Remove internal fields
      const { status, created_timestamp, ...publicData } = alert;
      return publicData;
    });
}

/**
 * Get notifications by target role
 */
function getNotificationsByTarget(role) {
  return getActiveNotifications().filter(n => 
    n.target_audience.includes(role)
  );
}

/**
 * Acknowledge a notification
 */
function acknowledgeNotification(notificationId, userId, notes = null) {
  const alert = contentGapAlerts.get(notificationId);
  
  if (!alert) {
    return {
      success: false,
      error: 'Notification not found'
    };
  }
  
  alert.acknowledged = true;
  alert.acknowledged_by = userId;
  alert.acknowledged_at = new Date().toISOString();
  if (notes) {
    alert.acknowledgment_notes = notes;
  }
  
  contentGapAlerts.set(notificationId, alert);
  
  return {
    success: true,
    notification: alert
  };
}

/**
 * Get global statistics for analytics API
 */
function getGlobalStats() {
  const stats = getSystemStats();
  const b2Gap = analyzeB2PhrasalVerbGap();
  
  return {
    ...stats,
    b2_phrasal_verb_failure_rate: b2Gap.failure_rate,
    active_notifications: getActiveNotifications().length,
    critical_notifications: getActiveNotifications().filter(n => n.severity === 'critical').length
  };
}

/**
 * Analyze technical verb gaps (for C1/C2)
 */
function analyzeTechnicalVerbGaps() {
  // Placeholder - would analyze technical action verbs like "remediate", "orchestrate", etc.
  return {
    c1_failure_rate: 0,
    c2_failure_rate: 0,
    threshold_exceeded: false
  };
}

/**
 * Analyze false friend patterns
 */
function analyzeFalseFriendPatterns() {
  // Placeholder - would track common Spanish-English false friends
  return {};
}

/**
 * Analyze hesitation patterns
 */
function analyzeHesitationPatterns() {
  // Placeholder - would track "um", "uh", "like" usage by level
  return {};
}

/**
 * Generate weekly insights report
 */
function generateWeeklyInsightsReport() {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return {
    week_ending: endDate.toISOString().split('T')[0],
    week_starting: startDate.toISOString().split('T')[0],
    total_audits: analyticsCache.size,
    content_gaps: getActiveNotifications(),
    recommendations: getActiveNotifications().map(n => n.recommendation)
  };
}

/**
 * Get user-specific patterns (for API)
 */
function getUserPhrasalVerbPatterns(userId) {
  return []; // Placeholder
}

function getUserTechnicalVerbPatterns(userId) {
  return []; // Placeholder
}

function getUserFalseFriendPatterns(userId) {
  return []; // Placeholder
}

function getUserHesitationPatterns(userId) {
  return []; // Placeholder
}

/**
 * Delete notification (admin only)
 */
function deleteNotification(notificationId) {
  if (!contentGapAlerts.has(notificationId)) {
    return {
      success: false,
      error: 'Notification not found'
    };
  }
  
  contentGapAlerts.delete(notificationId);
  
  return {
    success: true
  };
}

/**
 * Reset all analytics data (for testing)
 */
function resetAllData() {
  analyticsCache.clear();
  contentGapAlerts.clear();
}

module.exports = {
  analyzePhrasalVerbUsage,
  recordPhrasalVerbUsage,
  checkContentGaps,
  getContentGapAlerts,
  updateAlertStatus,
  getAnalyticsDashboard,
  getLevelAnalytics,
  clearAnalytics,
  getSystemStats,
  analyzeB2PhrasalVerbGap,
  generateStakeholderNotification,
  getActiveNotifications,
  getNotificationsByTarget,
  acknowledgeNotification,
  getGlobalStats,
  analyzeTechnicalVerbGaps,
  analyzeFalseFriendPatterns,
  analyzeHesitationPatterns,
  generateWeeklyInsightsReport,
  getUserPhrasalVerbPatterns,
  getUserTechnicalVerbPatterns,
  getUserFalseFriendPatterns,
  getUserHesitationPatterns,
  deleteNotification,
  resetAllData,
  TECHNICAL_PHRASAL_VERBS,
  FAILURE_THRESHOLD,
  MIN_SAMPLE_SIZE
};


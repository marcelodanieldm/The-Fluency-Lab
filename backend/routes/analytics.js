// ===== ANALYTICS API ROUTES =====
// Endpoints for stakeholders to access data-driven insights and content gap notifications

const express = require('express');
const router = express.Router();
const dataAnalytics = require('../services/dataAnalytics');

// ===== STAKEHOLDER NOTIFICATIONS =====

/**
 * GET /api/analytics/notifications
 * Get all active stakeholder notifications
 * 
 * Query params:
 *   - role: Filter by target audience (admin, content_creator, partner)
 *   - severity: Filter by severity (high, critical)
 * 
 * Response:
 * {
 *   success: true,
 *   count: 3,
 *   notifications: [...]
 * }
 */
router.get('/notifications', (req, res) => {
  try {
    const { role, severity } = req.query;
    
    let notifications = dataAnalytics.getActiveNotifications();
    
    // Filter by role if specified
    if (role) {
      notifications = notifications.filter(n => 
        n.target_audience.includes(role)
      );
    }
    
    // Filter by severity if specified
    if (severity) {
      notifications = notifications.filter(n => n.severity === severity);
    }
    
    res.json({
      success: true,
      count: notifications.length,
      notifications: notifications,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve notifications',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/notifications/:role
 * Get notifications filtered by stakeholder role
 * 
 * Path params:
 *   - role: admin | content_creator | partner
 * 
 * Response:
 * {
 *   success: true,
 *   role: "content_creator",
 *   count: 2,
 *   notifications: [...]
 * }
 */
router.get('/notifications/:role', (req, res) => {
  try {
    const { role } = req.params;
    
    // Validate role
    const validRoles = ['admin', 'content_creator', 'partner'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role',
        valid_roles: validRoles
      });
    }
    
    const notifications = dataAnalytics.getNotificationsByTarget(role);
    
    res.json({
      success: true,
      role: role,
      count: notifications.length,
      notifications: notifications,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching role-specific notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve notifications',
      message: error.message
    });
  }
});

/**
 * POST /api/analytics/notifications/:id/acknowledge
 * Mark a notification as acknowledged by a stakeholder
 * 
 * Path params:
 *   - id: Notification ID
 * 
 * Body:
 * {
 *   userId: "stakeholder_user_id",
 *   notes: "Optional notes about action taken"
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   notification: {...},
 *   message: "Notification acknowledged successfully"
 * }
 */
router.post('/notifications/:id/acknowledge', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, notes } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }
    
    const result = dataAnalytics.acknowledgeNotification(id, userId, notes);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json({
      success: true,
      notification: result.notification,
      message: 'Notification acknowledged successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error acknowledging notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to acknowledge notification',
      message: error.message
    });
  }
});

// ===== ANALYTICS INSIGHTS =====

/**
 * GET /api/analytics/stats
 * Get global analytics statistics
 * 
 * Response:
 * {
 *   success: true,
 *   stats: {
 *     total_audits: 150,
 *     b2_phrasal_verb_failure_rate: 84.5,
 *     active_notifications: 3,
 *     critical_notifications: 1,
 *     patterns_detected: {...}
 *   }
 * }
 */
router.get('/stats', (req, res) => {
  try {
    const stats = dataAnalytics.getGlobalStats();
    
    res.json({
      success: true,
      stats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching analytics stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/phrasal-verb-gap
 * Get current B2 phrasal verb failure analysis
 * 
 * Response:
 * {
 *   success: true,
 *   analysis: {
 *     total_b2_users: 45,
 *     users_failing: 38,
 *     failure_rate: 84.4,
 *     threshold_exceeded: true,
 *     affected_users: [...]
 *   }
 * }
 */
router.get('/phrasal-verb-gap', (req, res) => {
  try {
    const analysis = dataAnalytics.analyzeB2PhrasalVerbGap();
    
    res.json({
      success: true,
      analysis: analysis,
      threshold: 80,
      alert_status: analysis.threshold_exceeded ? 'CRITICAL' : 'NORMAL',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error analyzing phrasal verb gap:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze phrasal verb gap',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/technical-verb-gap
 * Get technical verb usage analysis for C1/C2 users
 * 
 * Response:
 * {
 *   success: true,
 *   analysis: {
 *     c1_failure_rate: 35.2,
 *     c2_failure_rate: 12.8,
 *     threshold_exceeded: false
 *   }
 * }
 */
router.get('/technical-verb-gap', (req, res) => {
  try {
    const analysis = dataAnalytics.analyzeTechnicalVerbGaps();
    
    res.json({
      success: true,
      analysis: analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error analyzing technical verb gap:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze technical verb gap',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/false-friend-patterns
 * Get false friend usage patterns across all levels
 * 
 * Response:
 * {
 *   success: true,
 *   patterns: {
 *     "actually": { count: 45, affected_users: [...] },
 *     "library": { count: 32, affected_users: [...] }
 *   }
 * }
 */
router.get('/false-friend-patterns', (req, res) => {
  try {
    const patterns = dataAnalytics.analyzeFalseFriendPatterns();
    
    res.json({
      success: true,
      patterns: patterns,
      total_instances: Object.values(patterns).reduce((sum, p) => sum + p.count, 0),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error analyzing false friend patterns:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze false friend patterns',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/hesitation-patterns
 * Get hesitation patterns by level
 * 
 * Response:
 * {
 *   success: true,
 *   patterns: {
 *     "B1": { avg_hesitation_ratio: 8.5, user_count: 30 },
 *     "B2": { avg_hesitation_ratio: 5.2, user_count: 45 }
 *   }
 * }
 */
router.get('/hesitation-patterns', (req, res) => {
  try {
    const patterns = dataAnalytics.analyzeHesitationPatterns();
    
    res.json({
      success: true,
      patterns: patterns,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error analyzing hesitation patterns:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze hesitation patterns',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/weekly-insights
 * Get comprehensive weekly insights report
 * 
 * Response:
 * {
 *   success: true,
 *   report: {
 *     week_ending: "2024-01-15",
 *     total_audits: 150,
 *     content_gaps: [...],
 *     recommendations: [...]
 *   }
 * }
 */
router.get('/weekly-insights', (req, res) => {
  try {
    const report = dataAnalytics.generateWeeklyInsightsReport();
    
    res.json({
      success: true,
      report: report,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error generating weekly insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate weekly insights',
      message: error.message
    });
  }
});

// ===== USER-SPECIFIC ANALYTICS =====

/**
 * GET /api/analytics/user/:userId/patterns
 * Get detailed analytics for a specific user
 * 
 * Path params:
 *   - userId: User ID to analyze
 * 
 * Response:
 * {
 *   success: true,
 *   userId: "user123",
 *   patterns: {
 *     phrasal_verbs: [...],
 *     technical_verbs: [...],
 *     false_friends: [...],
 *     hesitation: [...]
 *   }
 * }
 */
router.get('/user/:userId/patterns', (req, res) => {
  try {
    const { userId } = req.params;
    
    const patterns = {
      phrasal_verbs: dataAnalytics.getUserPhrasalVerbPatterns(userId),
      technical_verbs: dataAnalytics.getUserTechnicalVerbPatterns(userId),
      false_friends: dataAnalytics.getUserFalseFriendPatterns(userId),
      hesitation: dataAnalytics.getUserHesitationPatterns(userId)
    };
    
    res.json({
      success: true,
      userId: userId,
      patterns: patterns,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching user patterns:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user patterns',
      message: error.message
    });
  }
});

// ===== ADMIN TOOLS =====

/**
 * DELETE /api/analytics/notifications/:id
 * Delete a notification (admin only)
 * 
 * Path params:
 *   - id: Notification ID
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Notification deleted successfully"
 * }
 */
router.delete('/notifications/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const result = dataAnalytics.deleteNotification(id);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json({
      success: true,
      message: 'Notification deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification',
      message: error.message
    });
  }
});

/**
 * POST /api/analytics/reset
 * Reset all analytics data (admin only, for testing)
 * 
 * Body:
 * {
 *   confirm: true
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   message: "All analytics data reset"
 * }
 */
router.post('/reset', (req, res) => {
  try {
    const { confirm } = req.body;
    
    if (!confirm) {
      return res.status(400).json({
        success: false,
        error: 'Must confirm reset by sending { confirm: true }'
      });
    }
    
    dataAnalytics.resetAllData();
    
    res.json({
      success: true,
      message: 'All analytics data has been reset',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error resetting analytics data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset analytics data',
      message: error.message
    });
  }
});

module.exports = router;

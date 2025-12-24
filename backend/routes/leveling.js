/**
 * Leveling & Notifications Routes
 * Dynamic leveling system with level-up notifications and scenario unlocking
 */

const express = require('express');
const router = express.Router();
const levelingService = require('../services/levelingService');

/**
 * GET /api/leveling/status/:userId
 * Get user's current leveling status and progress
 */
router.get('/status/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const status = levelingService.getUserStatus(userId);
    
    res.json({
      success: true,
      status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/leveling/notifications/:userId
 * Get all notifications for user (including level-up notifications)
 */
router.get('/notifications/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = levelingService.getUserNotifications(userId);
    
    res.json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/leveling/accept-level-up
 * Accept a level-up notification and upgrade user
 * Body: { userId, notificationId }
 */
router.post('/accept-level-up', (req, res) => {
  try {
    const { userId, notificationId } = req.body;
    
    if (!userId || !notificationId) {
      return res.status(400).json({
        success: false,
        error: 'userId and notificationId are required'
      });
    }
    
    const result = levelingService.acceptLevelUp(userId, notificationId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json({
      success: true,
      result,
      message: `🎉 Congratulations! You've been upgraded to ${result.new_level}!`,
      unlocked_content: {
        new_weeks: result.newly_unlocked_weeks,
        all_weeks: result.unlocked_weeks
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/leveling/audit-history/:userId
 * Get audit history for user
 */
router.get('/audit-history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    const audits = levelingService.getAuditHistory(userId, limit);
    
    res.json({
      success: true,
      count: audits.length,
      audits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/leveling/initialize
 * Initialize user in leveling system
 * Body: { userId, initialLevel }
 */
router.post('/initialize', (req, res) => {
  try {
    const { userId, initialLevel } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }
    
    const userInfo = levelingService.initializeUser(userId, initialLevel || 'B1');
    
    res.json({
      success: true,
      user: userInfo,
      message: `User ${userId} initialized at level ${userInfo.current_level}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/leveling/access/:userId/week/:weekNumber
 * Check if user has access to specific week
 */
router.get('/access/:userId/week/:weekNumber', (req, res) => {
  try {
    const { userId, weekNumber } = req.params;
    const week = parseInt(weekNumber);
    
    const hasAccess = levelingService.hasAccessToWeek(userId, week);
    const status = levelingService.getUserStatus(userId);
    
    res.json({
      success: true,
      has_access: hasAccess,
      week_number: week,
      current_level: status.current_level,
      unlocked_weeks: status.unlocked_weeks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/leveling/stats
 * Get system-wide leveling statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = levelingService.getSystemStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/leveling/user/:userId
 * Clear all data for user (for testing)
 */
router.delete('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const result = levelingService.clearUserData(userId);
    
    res.json({
      success: true,
      result,
      message: `All data cleared for user ${userId}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/leveling/demo
 * Documentation endpoint
 */
router.get('/demo', (req, res) => {
  res.json({
    service: 'Dynamic Leveling System',
    version: '1.0.0',
    description: 'Automatically tracks user performance and triggers level-ups when users consistently perform above their registered level',
    
    how_it_works: {
      step_1: 'User completes crisis scenarios and receives linguistic audits',
      step_2: 'Each audit detects CEFR level (B1-C2) based on vocabulary, grammar, and soft skills',
      step_3: 'System tracks last 3 audits',
      step_4: 'If all 3 audits show level above registered level → LEVEL UP notification triggered',
      step_5: 'User accepts level-up → New scenarios unlocked (e.g., Week 3: Negotiation for B2→C1)',
      step_6: 'Progress continues with new challenges'
    },
    
    level_hierarchy: {
      B1: 'Weeks 1-2 (Casual + Crisis)',
      B2: 'Weeks 1-3 (+ Negotiation)',
      C1: 'Weeks 1-4 (+ Executive Presentations)',
      C2: 'All weeks unlocked'
    },
    
    example_flow: {
      scenario: 'User registered as B2',
      session_1: 'Crisis scenario → Audit detects C1 (85% confidence)',
      session_2: 'Crisis scenario → Audit detects C1 (88% confidence)',
      session_3: 'Crisis scenario → Audit detects C1 (90% confidence)',
      result: '🎉 LEVEL UP notification! B2 → C1 upgrade available',
      action: 'User accepts → Week 3 (Negotiation) unlocked automatically',
      benefit: 'More challenging content, faster progress'
    },
    
    endpoints: {
      'GET /api/leveling/status/:userId': 'Get current status, progress, and pending notifications',
      'GET /api/leveling/notifications/:userId': 'Get all notifications (level-ups, achievements)',
      'POST /api/leveling/accept-level-up': 'Accept level-up and unlock new content',
      'GET /api/leveling/audit-history/:userId': 'View past linguistic audits',
      'POST /api/leveling/initialize': 'Initialize new user in system',
      'GET /api/leveling/access/:userId/week/:weekNumber': 'Check access to specific week',
      'GET /api/leveling/stats': 'System-wide statistics',
      'DELETE /api/leveling/user/:userId': 'Clear user data (testing only)'
    },
    
    integration: {
      crisis_coach: 'Automatically calls linguistic auditor during crisis sessions',
      audit_tracking: 'Records all audits in leveling service',
      notifications: 'Real-time level-up detection',
      content_unlock: 'Dynamic scenario access based on performance'
    },
    
    test_endpoint: 'Use test-leveling.js script to simulate B2→C1 upgrade'
  });
});

module.exports = router;

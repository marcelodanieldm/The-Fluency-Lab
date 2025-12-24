// ============================================
// THE FLUENCY LAB - AI COACH ROUTES
// Interactive coaching session endpoints
// ============================================

const express = require('express');
const router = express.Router();
const aiCoach = require('../services/aiCoach');
const { authenticate } = require('../middleware/auth');

// ============================================
// ROUTES
// ============================================

/**
 * POST /api/coach/start-session
 * Start a new 10-minute coaching session
 */
router.post('/start-session', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { userLevel, sessionTopic } = req.body;
    
    // Validate level
    const level = userLevel || req.user.englishLevel || 'B2';
    const validLevels = ['B1', 'B2', 'C1', 'C2'];
    
    if (!validLevels.includes(level.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid level. Must be B1, B2, C1, or C2'
      });
    }
    
    // Start session
    const sessionData = aiCoach.startSession(
      userId, 
      level,
      sessionTopic || 'The Effective Daily Stand-up'
    );
    
    console.log(`🎯 AI Coach session started: ${sessionData.sessionId} for user ${userId} (${level})`);
    
    res.json({
      success: true,
      data: sessionData
    });
    
  } catch (error) {
    console.error('❌ Failed to start session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start coaching session'
    });
  }
});

/**
 * POST /api/coach/respond
 * Send user response and get coach feedback
 */
router.post('/respond', authenticate, async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        error: 'sessionId and message are required'
      });
    }
    
    // Process response
    const responseData = aiCoach.processResponse(sessionId, message);
    
    console.log(`💬 Coach response generated for session ${sessionId}`);
    
    res.json({
      success: true,
      data: responseData
    });
    
  } catch (error) {
    console.error('❌ Failed to process response:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process response'
    });
  }
});

/**
 * GET /api/coach/session/:sessionId
 * Get session details
 */
router.get('/session/:sessionId', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = aiCoach.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    // Calculate time remaining
    const elapsedSeconds = Math.floor((Date.now() - session.startTime) / 1000);
    const timeRemaining = Math.max(0, 600 - elapsedSeconds);
    
    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        userId: session.userId,
        userLevel: session.userLevel,
        sessionTopic: session.sessionTopic,
        phase: session.phase,
        messageCount: session.messages.length,
        timeRemaining,
        errorCount: aiCoach.getErrorCount(session)
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to get session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve session'
    });
  }
});

/**
 * POST /api/coach/end-session
 * End session and get Flash Report
 */
router.post('/end-session', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'sessionId is required'
      });
    }
    
    const result = aiCoach.endSession(sessionId);
    
    console.log(`✅ AI Coach session ended: ${sessionId}`);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('❌ Failed to end session:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to end session'
    });
  }
});

/**
 * GET /api/coach/topics
 * Get available coaching topics
 */
router.get('/topics', authenticate, async (req, res) => {
  try {
    const topics = [
      {
        id: 'daily-standup',
        title: 'The Effective Daily Stand-up',
        description: 'Master the art of concise, impactful daily updates',
        duration: 10,
        levels: ['B1', 'B2', 'C1', 'C2'],
        skills: ['Speaking', 'Technical vocabulary', 'Conciseness']
      },
      {
        id: 'code-review',
        title: 'Professional Code Review Discussion',
        description: 'Learn to give and receive constructive feedback',
        duration: 10,
        levels: ['B2', 'C1', 'C2'],
        skills: ['Critical thinking', 'Diplomatic language', 'Technical accuracy']
      },
      {
        id: 'technical-presentation',
        title: 'Technical Presentation Skills',
        description: 'Present complex ideas clearly to diverse audiences',
        duration: 10,
        levels: ['B2', 'C1', 'C2'],
        skills: ['Public speaking', 'Simplification', 'Engagement']
      },
      {
        id: 'incident-report',
        title: 'Incident Reporting and Communication',
        description: 'Communicate critical issues clearly under pressure',
        duration: 10,
        levels: ['B1', 'B2', 'C1', 'C2'],
        skills: ['Crisis communication', 'Clarity', 'Action-oriented language']
      },
      {
        id: 'client-meeting',
        title: 'Client-Facing Technical Discussion',
        description: 'Explain technical concepts to non-technical stakeholders',
        duration: 10,
        levels: ['C1', 'C2'],
        skills: ['Simplification', 'Business language', 'Confidence']
      },
      {
        id: 'team-leadership',
        title: 'Team Leadership Communication',
        description: 'Lead your team with clear, motivating language',
        duration: 10,
        levels: ['C1', 'C2'],
        skills: ['Leadership', 'Motivation', 'Strategic thinking']
      }
    ];
    
    res.json({
      success: true,
      data: {
        topics,
        totalTopics: topics.length
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to get topics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve topics'
    });
  }
});

/**
 * GET /api/coach/demo
 * Get demo conversation for testing
 */
router.get('/demo', async (req, res) => {
  try {
    const demoConversation = {
      session: {
        topic: 'The Effective Daily Stand-up',
        level: 'B1',
        duration: '10 minutes'
      },
      conversation: [
        {
          role: 'coach',
          message: 'Good to see you here! I\'m your AI Coach for today\'s The Effective Daily Stand-up session.\n\nWe\'ve got 10 minutes together, so let\'s make them productive.\n\nTell me briefly what you\'re working on today. Use technical terms—don\'t hold back.',
          timestamp: '0:00'
        },
        {
          role: 'user',
          message: 'I am working on the authentication system. I need to fix a bug in the login page.',
          timestamp: '0:15'
        },
        {
          role: 'coach',
          message: 'Got it! Now, can you explain the steps? Start with "First..." then use "Then..." and "Finally..."\n\nWhat are the steps to fix this bug?',
          timestamp: '0:20'
        },
        {
          role: 'user',
          message: 'First, I check the database connection. Then, I verify the user credentials. Finally, I test the login functionality.',
          timestamp: '0:45'
        },
        {
          role: 'coach',
          message: 'Excellent structure! Your explanation is very clear.\n\nNow, can you tell me what happens AFTER this step? Why is fixing this bug important?',
          timestamp: '0:50'
        },
        {
          role: 'user',
          message: 'After fixing the bug, users can login without problems. It\'s important because many users have complained.',
          timestamp: '1:10'
        },
        {
          role: 'coach',
          message: 'Well done! You\'re using connectors effectively.\n\nLast question: What\'s the one thing you\'re most concerned about in this task?',
          timestamp: '1:15'
        },
        {
          role: 'user',
          message: 'I am concerned about the database performance. I think it might be slow.',
          timestamp: '1:35'
        },
        {
          role: 'coach',
          message: '## 🎯 FLASH REPORT\n\n### 📚 GRAMMAR FIX\n**Issue:** Missing article\n**Fix:** "I\'m working on THE authentication system" (not just "authentication system")\n**Example:** "I\'m working on the login functionality"\n\n### 💪 POWER MOVE\n**Instead of:** "I am working on"\n**Level up to:** "I\'m currently driving"\n\n*This makes you sound more proactive and leadership-oriented.*\n\n### 🎪 CONFIDENCE SCORE\n**7/10** - Solid performance! Your structure is clear and you\'re using connectors well. Focus on adding articles and upgrading to power phrases.\n\n**Remember: You\'re not just a coder. You\'re a technical leader.** 🚀',
          timestamp: '10:00'
        }
      ],
      flashReport: {
        grammarFix: 'Use articles: "THE authentication system" not just "authentication system"',
        powerMove: 'Instead of "I am working on" → "I\'m currently driving"',
        confidenceScore: 7
      }
    };
    
    res.json({
      success: true,
      data: demoConversation
    });
    
  } catch (error) {
    console.error('❌ Failed to get demo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve demo'
    });
  }
});

module.exports = router;

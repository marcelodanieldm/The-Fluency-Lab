/**
 * Crisis Coach API Routes
 * High-pressure crisis simulation endpoints
 */

const express = require('express');
const router = express.Router();
const crisisCoach = require('../services/crisisCoach');

/**
 * @route   GET /api/crisis/scenarios
 * @desc    Get available crisis scenarios
 * @access  Public (demo purposes) - Add auth in production
 */
router.get('/scenarios', (req, res) => {
  try {
    const scenarios = crisisCoach.getCrisisScenarios();
    
    res.json({
      success: true,
      scenarios,
      message: 'Available crisis scenarios retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching crisis scenarios:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crisis scenarios',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/crisis/start
 * @desc    Start a new crisis coaching session
 * @access  Public (demo purposes) - Add auth in production
 * @body    { userId, scenarioId }
 */
router.post('/start', (req, res) => {
  try {
    const { userId, scenarioId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }
    
    // Default to production_outage if no scenario specified
    const selectedScenario = scenarioId || 'production_outage';
    
    const session = crisisCoach.startCrisisSession(userId, selectedScenario);
    
    res.json({
      success: true,
      session,
      message: 'Crisis session started - The clock is ticking!'
    });
  } catch (error) {
    console.error('Error starting crisis session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start crisis session',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/crisis/respond
 * @desc    Submit a response during crisis session
 * @access  Public (demo purposes) - Add auth in production
 * @body    { sessionId, message }
 */
router.post('/respond', (req, res) => {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: 'sessionId and message are required'
      });
    }
    
    const response = crisisCoach.processCrisisResponse(sessionId, message);
    
    // Check if session auto-completed (time limit reached)
    if (response.session_completed) {
      return res.json({
        success: true,
        session_completed: true,
        crisis_report: response.crisis_report,
        message: response.message
      });
    }
    
    res.json({
      success: true,
      response,
      message: 'Response processed - Keep going!'
    });
  } catch (error) {
    console.error('Error processing crisis response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process response',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/crisis/end
 * @desc    End crisis session and get full audit report
 * @access  Public (demo purposes) - Add auth in production
 * @body    { sessionId }
 */
router.post('/end', (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId is required'
      });
    }
    
    const result = crisisCoach.endCrisisSession(sessionId);
    
    res.json({
      success: true,
      result,
      message: 'Crisis session completed - Review your audit report!'
    });
  } catch (error) {
    console.error('Error ending crisis session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end crisis session',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/crisis/session/:sessionId
 * @desc    Get session details and current status
 * @access  Public (demo purposes) - Add auth in production
 */
router.get('/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const details = crisisCoach.getSessionDetails(sessionId);
    
    res.json({
      success: true,
      session: details,
      message: 'Session details retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching session details:', error);
    res.status(404).json({
      success: false,
      message: 'Session not found or expired',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/crisis/demo
 * @desc    Get demo information about crisis coaching
 * @access  Public
 */
router.get('/demo', (req, res) => {
  try {
    const demoInfo = {
      title: 'Crisis Coach - High-Pressure Business Scenarios',
      description: 'Interactive crisis simulations that push you to your limit. Learn to communicate effectively under extreme pressure.',
      
      features: [
        '🚨 Realistic crisis scenarios (Production Outage, Investor Pitch Failure, Angry Client)',
        '⏱️ 10-minute high-pressure sessions',
        '🔥 Impatient AI coach that demands fast, professional responses',
        '📊 Comprehensive audit: Jargon Accuracy, Tone Analysis, Pressure Resistance',
        '✨ Diplomatic fixes - Learn the perfect response for each scenario'
      ],
      
      scenarios: crisisCoach.getCrisisScenarios(),
      
      what_is_evaluated: {
        jargon_accuracy: {
          description: 'Did you use professional IT terminology?',
          examples: ['bottleneck', 'rollback', 'root cause', 'post-mortem', 'triage', 'mitigation'],
          score_range: '0-10'
        },
        tone_analysis: {
          description: 'Did you sound defensive or resolutive?',
          classifications: ['Resolutive (best)', 'Neutral', 'Vague', 'Defensive (worst)'],
          good_phrases: ['We are handling this', 'Timeline is', 'Root cause identified'],
          bad_phrases: ["It's not my fault", 'Someone else', "I don't know"]
        },
        pressure_resistance: {
          description: 'How well did you handle the stress?',
          factors: ['Response speed', 'Quality under pressure', 'Composure', 'Decisiveness'],
          score_range: '0-10'
        }
      },
      
      sample_scenario: {
        title: 'The Production Outage',
        setup: 'The main database is down, the CEO is on the Slack channel asking for updates. What do you say?',
        bad_response: "I don't know, maybe the server crashed? It's not my fault, someone else deployed code.",
        good_response: 'We are currently triaging the issue and expect a full post-mortem by EOD. The team has identified potential root causes and is implementing mitigation strategies to restore service.',
        why_good_works: [
          'Uses technical jargon: triaging, post-mortem, root causes, mitigation',
          'Shows ownership: "We are", "team has"',
          'Provides timeline: by EOD',
          'Action-oriented: implementing strategies',
          'No defensive language'
        ]
      },
      
      usage: {
        step_1: 'POST /api/crisis/start with { userId: "user123", scenarioId: "production_outage" }',
        step_2: 'Receive crisis scenario and sessionId',
        step_3: 'POST /api/crisis/respond with { sessionId, message: "your response" }',
        step_4: 'Receive impatient feedback and continue for 10 minutes',
        step_5: 'POST /api/crisis/end with { sessionId } to get full audit report',
        step_6: 'Review your Jargon Score, Tone Classification, and Diplomatic Fix'
      },
      
      tips: [
        '⚡ Respond quickly - Crisis situations demand fast decisions',
        '🎯 Use technical jargon to show expertise',
        '🤝 Take ownership - Never blame others',
        '📅 Always provide timelines and ETAs',
        '💡 Be specific - Vague answers increase anxiety',
        '😌 Stay calm - Defensive tone destroys trust'
      ]
    };
    
    res.json({
      success: true,
      demo: demoInfo
    });
  } catch (error) {
    console.error('Error generating demo info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate demo information',
      error: error.message
    });
  }
});

module.exports = router;

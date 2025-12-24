const express = require('express');
const router = express.Router();
const SentimentAnalyzer = require('../services/sentimentAnalyzer');
const LearningPathEngine = require('../services/learningPathEngine');
const { checkUsageLimit } = require('../middleware/permissions');

// POST /api/sentiment/analyze
// Optional authentication: if logged in, applies rate limit based on role
router.post('/analyze', checkUsageLimit('analysis'), async (req, res) => {
  try {
    const { transcription, language = 'es', userProfile = {} } = req.body;

    if (!transcription) {
      return res.status(400).json({
        error: 'Transcription is required'
      });
    }

    const analyzer = new SentimentAnalyzer();
    const analysis = await analyzer.analyze(transcription, language);

    // Generar ruta de aprendizaje dinámica basada en soft skills
    const learningPathEngine = new LearningPathEngine();
    const learningPath = learningPathEngine.generateLearningPath(
      analysis.softSkills,
      userProfile
    );

    res.json({
      success: true,
      data: {
        ...analysis,
        learningPath
      },
      // Include usage info if user is authenticated
      ...(req.usageInfo && {
        usageInfo: {
          current: req.usageInfo.current,
          limit: req.usageInfo.limit,
          remaining: req.usageInfo.remaining
        }
      })
    });

  } catch (error) {
    console.error('Error in sentiment analysis:', error);
    res.status(500).json({
      error: 'Failed to analyze sentiment',
      message: error.message
    });
  }
});

module.exports = router;

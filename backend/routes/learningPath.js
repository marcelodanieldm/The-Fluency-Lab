const express = require('express');
const router = express.Router();
const LearningPathEngine = require('../services/learningPathEngine');
const { requirePermission } = require('../middleware/permissions');
const { RESOURCES, ACTIONS } = require('../config/permissions.config');

// POST /api/learning-path/generate
// Requires STUDENT role or higher
router.post('/generate', requirePermission(RESOURCES.LEARNING_PATH, ACTIONS.WRITE), async (req, res) => {
  try {
    const { softSkills, userProfile = {} } = req.body;

    if (!softSkills) {
      return res.status(400).json({
        error: 'Soft skills data is required'
      });
    }

    const engine = new LearningPathEngine();
    const learningPath = engine.generateLearningPath(softSkills, userProfile);

    res.json({
      success: true,
      data: learningPath
    });

  } catch (error) {
    console.error('Error generating learning path:', error);
    res.status(500).json({
      error: 'Failed to generate learning path',
      message: error.message
    });
  }
});

// GET /api/learning-path/lessons/:skill
// Requires STUDENT role or higher
router.get('/lessons/:skill', requirePermission(RESOURCES.LEARNING_PATH, ACTIONS.READ), async (req, res) => {
  try {
    const { skill } = req.params;
    const engine = new LearningPathEngine();
    
    const lessons = engine.lessonsCatalog[skill];
    
    if (!lessons) {
      return res.status(404).json({
        error: 'Skill not found',
        availableSkills: Object.keys(engine.lessonsCatalog)
      });
    }

    res.json({
      success: true,
      data: {
        skill,
        lessons
      }
    });

  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({
      error: 'Failed to fetch lessons',
      message: error.message
    });
  }
});

module.exports = router;

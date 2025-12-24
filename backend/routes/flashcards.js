const express = require('express');
const router = express.Router();
const ErrorPatternAnalyzer = require('../services/errorPatternAnalyzer');
const FlashcardGenerator = require('../services/flashcardGenerator');
const { requirePermission, requireOwnership } = require('../middleware/permissions');
const { RESOURCES, ACTIONS } = require('../config/permissions.config');

/**
 * POST /api/flashcards/generate
 * Genera un deck personalizado de flashcards basado en errores de la semana
 * Requires STUDENT role or higher
 */
router.post('/generate', requirePermission(RESOURCES.FLASHCARDS, ACTIONS.WRITE), async (req, res) => {
    try {
        const { userId, deckSize } = req.body;
        
        // Usar ID por defecto si no se proporciona
        const targetUserId = userId || 'current_user';
        const targetDeckSize = deckSize || 10;

        // 1. Analizar patrones de errores de la última semana
        const weeklyAnalysis = ErrorPatternAnalyzer.analyzeWeeklyPatterns(targetUserId);

        // 2. Generar deck de flashcards
        const flashcardDeck = FlashcardGenerator.generateDeck(
            weeklyAnalysis.topErrors,
            targetDeckSize
        );

        // 3. Agregar información del análisis semanal
        const response = {
            weeklyAnalysis: {
                summary: weeklyAnalysis.summary,
                totalErrors: weeklyAnalysis.totalErrors,
                topErrors: weeklyAnalysis.topErrors.map(e => ({
                    error: e.error,
                    category: e.category,
                    count: e.count,
                    severity: e.severity
                })),
                categoriesAffected: weeklyAnalysis.categoriesAffected
            },
            flashcardDeck: flashcardDeck,
            generatedAt: new Date().toISOString(),
            weekNumber: weeklyAnalysis.weekNumber
        };

        res.json(response);

    } catch (error) {
        console.error('Error generating flashcard deck:', error);
        res.status(500).json({ 
            error: 'Failed to generate flashcard deck',
            message: error.message 
        });
    }
});

/**
 * POST /api/flashcards/simulate
 * Simula errores semanales para testing (demo mode)
 * Requires STUDENT role or higher
 */
router.post('/simulate', requirePermission(RESOURCES.FLASHCARDS, ACTIONS.WRITE), async (req, res) => {
    try {
        const { userId, errorCount } = req.body;
        
        const targetUserId = userId || 'demo_user';
        const targetErrorCount = errorCount || 15;

        // Simular errores
        const result = ErrorPatternAnalyzer.simulateWeeklyErrors(
            targetUserId,
            targetErrorCount
        );

        // Analizar patrones
        const weeklyAnalysis = ErrorPatternAnalyzer.analyzeWeeklyPatterns(targetUserId);

        // Generar flashcards
        const flashcardDeck = FlashcardGenerator.generateDeck(
            weeklyAnalysis.topErrors,
            10
        );

        res.json({
            simulation: result,
            weeklyAnalysis: weeklyAnalysis,
            flashcardDeck: flashcardDeck
        });

    } catch (error) {
        console.error('Error simulating flashcard generation:', error);
        res.status(500).json({ 
            error: 'Failed to simulate flashcard generation',
            message: error.message 
        });
    }
});

/**
 * GET /api/flashcards/patterns
 * Obtiene todos los patrones de errores disponibles
 * Requires STUDENT role or higher
 */
router.get('/patterns', requirePermission(RESOURCES.FLASHCARDS, ACTIONS.READ), (req, res) => {
    try {
        const patterns = ErrorPatternAnalyzer.errorPatterns;
        
        // Contar patrones por categoría
        const summary = {
            falseFriends: patterns.falseFriends.length,
            grammar: patterns.grammar.length,
            prepositions: patterns.prepositions.length,
            wordOrder: patterns.wordOrder.length,
            vocabulary: patterns.vocabulary.length,
            total: Object.values(patterns).flat().length
        };

        res.json({
            summary: summary,
            patterns: patterns
        });

    } catch (error) {
        console.error('Error fetching error patterns:', error);
        res.status(500).json({ 
            error: 'Failed to fetch error patterns',
            message: error.message 
        });
    }
});

/**
 * GET /api/flashcards/history/:userId
 * Obtiene el historial de errores de un usuario
 */
router.get('/history/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        
        // En producción, filtrar por userId desde BD
        const weeklyAnalysis = ErrorPatternAnalyzer.analyzeWeeklyPatterns(userId);

        res.json({
            userId: userId,
            weeklyAnalysis: weeklyAnalysis
        });

    } catch (error) {
        console.error('Error fetching error history:', error);
        res.status(500).json({ 
            error: 'Failed to fetch error history',
            message: error.message 
        });
    }
});

/**
 * DELETE /api/flashcards/history
 * Limpia el historial de errores (útil para testing)
 */
router.delete('/history', (req, res) => {
    try {
        const result = ErrorPatternAnalyzer.clearHistory();
        
        res.json({
            message: result,
            clearedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error clearing history:', error);
        res.status(500).json({ 
            error: 'Failed to clear history',
            message: error.message 
        });
    }
});

module.exports = router;

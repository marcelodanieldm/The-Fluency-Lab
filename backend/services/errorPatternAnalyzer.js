// ============================================
// ERROR PATTERN ANALYZER - Data Science Module
// Detección de errores comunes y patrones
// ============================================

class ErrorPatternAnalyzer {
    constructor() {
        // Catálogo de errores comunes con patrones de detección
        this.errorPatterns = {
            // False Friends (Español → Inglés)
            falseFriends: [
                {
                    id: 'actual_vs_actually',
                    pattern: /\b(actual|actualmente)\b/gi,
                    error: 'actual (false friend)',
                    correct: 'actually / current',
                    category: 'False Friends',
                    severity: 'high',
                    explanation: '"Actual" en español NO es "actual" en inglés. Use "actually" (realmente) o "current" (actual).',
                    examples: [
                        { wrong: 'The actual situation is...', right: 'The current situation is...' },
                        { wrong: 'I actual work here', right: 'I actually work here' }
                    ]
                },
                {
                    id: 'eventually_vs_eventualmente',
                    pattern: /\b(eventualmente)\b/gi,
                    error: 'eventualmente (false friend)',
                    correct: 'eventually / possibly',
                    category: 'False Friends',
                    severity: 'high',
                    explanation: '"Eventually" significa "finalmente/al final", NO "posiblemente".',
                    examples: [
                        { wrong: 'I will eventualmente go', right: 'I will eventually go (finalmente)' },
                        { wrong: 'Eventually I can help', right: 'Possibly I can help (posiblemente)' }
                    ]
                },
                {
                    id: 'embarrassed_vs_embarazada',
                    pattern: /\b(embarazada|pregnant)\b/gi,
                    error: 'embarrassed (false friend)',
                    correct: 'pregnant',
                    category: 'False Friends',
                    severity: 'critical',
                    explanation: '"Embarrassed" significa "avergonzado", NO "embarazada". Use "pregnant".',
                    examples: [
                        { wrong: 'She is embarrassed', right: 'She is pregnant' }
                    ]
                },
                {
                    id: 'assist_vs_asistir',
                    pattern: /\b(asist)\b/gi,
                    error: 'assist (false friend)',
                    correct: 'attend / assist',
                    category: 'False Friends',
                    severity: 'medium',
                    explanation: '"Assist" significa "ayudar", NO "asistir/ir". Use "attend" para eventos.',
                    examples: [
                        { wrong: 'I will assist to the meeting', right: 'I will attend the meeting' },
                        { wrong: 'I attend you', right: 'I assist you (te ayudo)' }
                    ]
                }
            ],

            // Grammar Patterns
            grammar: [
                {
                    id: 'its_vs_its',
                    pattern: /\b(its|it's|its been|it's been)\b/gi,
                    error: "it's vs its confusion",
                    correct: "it's (it is/has) vs its (possessive)",
                    category: 'Grammar',
                    severity: 'high',
                    explanation: "it's = it is/it has | its = posesivo (sin apóstrofe)",
                    examples: [
                        { wrong: "The dog wagged it's tail", right: "The dog wagged its tail" },
                        { wrong: "Its been a long day", right: "It's been a long day" }
                    ]
                },
                {
                    id: 'your_vs_youre',
                    pattern: /\b(your|you're|your'e)\b/gi,
                    error: "you're vs your confusion",
                    correct: "you're (you are) vs your (possessive)",
                    category: 'Grammar',
                    severity: 'high',
                    explanation: "you're = you are | your = posesivo",
                    examples: [
                        { wrong: "Your late", right: "You're late" },
                        { wrong: "You're book is here", right: "Your book is here" }
                    ]
                },
                {
                    id: 'there_their_theyre',
                    pattern: /\b(there|their|they're|their's|there's)\b/gi,
                    error: "there/their/they're confusion",
                    correct: "they're (they are) vs their (possessive) vs there (place)",
                    category: 'Grammar',
                    severity: 'medium',
                    explanation: "they're = they are | their = posesivo | there = lugar",
                    examples: [
                        { wrong: "There going home", right: "They're going home" },
                        { wrong: "Its they're problem", right: "It's their problem" }
                    ]
                },
                {
                    id: 'subject_verb_agreement',
                    pattern: /\b(he don't|she don't|it don't|they doesn't|was were)\b/gi,
                    error: 'subject-verb agreement',
                    correct: 'he/she/it doesn\'t | they don\'t',
                    category: 'Grammar',
                    severity: 'high',
                    explanation: 'Concordancia sujeto-verbo incorrecta',
                    examples: [
                        { wrong: 'He don\'t like it', right: 'He doesn\'t like it' },
                        { wrong: 'They doesn\'t work', right: 'They don\'t work' }
                    ]
                }
            ],

            // Prepositions
            prepositions: [
                {
                    id: 'in_on_at_time',
                    pattern: /\b(in the morning|on the morning|at the morning|in monday|in the night)\b/gi,
                    error: 'preposition confusion (time)',
                    correct: 'in (morning/year) | on (days) | at (specific time)',
                    category: 'Prepositions',
                    severity: 'medium',
                    explanation: 'IN morning/year, ON Monday/weekend, AT 5pm/night',
                    examples: [
                        { wrong: 'on the morning', right: 'in the morning' },
                        { wrong: 'in Monday', right: 'on Monday' },
                        { wrong: 'in night', right: 'at night' }
                    ]
                },
                {
                    id: 'depend_of',
                    pattern: /\b(depend of|depends of)\b/gi,
                    error: 'depend of (incorrect preposition)',
                    correct: 'depend on',
                    category: 'Prepositions',
                    severity: 'high',
                    explanation: 'Siempre use "depend ON", nunca "depend of"',
                    examples: [
                        { wrong: 'It depends of you', right: 'It depends on you' }
                    ]
                },
                {
                    id: 'different_of',
                    pattern: /\b(different of|different to)\b/gi,
                    error: 'different of/to (incorrect preposition)',
                    correct: 'different from',
                    category: 'Prepositions',
                    severity: 'medium',
                    explanation: 'Use "different FROM" (principalmente en inglés americano)',
                    examples: [
                        { wrong: 'This is different of that', right: 'This is different from that' }
                    ]
                }
            ],

            // Word Order
            wordOrder: [
                {
                    id: 'adjective_order',
                    pattern: /\b(big red car|house big|pretty very)\b/gi,
                    error: 'incorrect adjective order',
                    correct: 'opinion-size-age-shape-color-origin-material-purpose + noun',
                    category: 'Word Order',
                    severity: 'low',
                    explanation: 'Orden de adjetivos: opinión → tamaño → edad → color',
                    examples: [
                        { wrong: 'a red big car', right: 'a big red car' },
                        { wrong: 'a house old wooden', right: 'an old wooden house' }
                    ]
                },
                {
                    id: 'question_word_order',
                    pattern: /\b(how you are|what you do|where you go)\b/gi,
                    error: 'incorrect question word order',
                    correct: 'question word + auxiliary + subject + verb',
                    category: 'Word Order',
                    severity: 'high',
                    explanation: 'Preguntas: What DO you DO? (auxiliar + sujeto + verbo)',
                    examples: [
                        { wrong: 'What you do?', right: 'What do you do?' },
                        { wrong: 'Where you live?', right: 'Where do you live?' }
                    ]
                }
            ],

            // Vocabulary
            vocabulary: [
                {
                    id: 'make_vs_do',
                    pattern: /\b(make homework|make exercise|do a mistake|do a cake)\b/gi,
                    error: 'make vs do confusion',
                    correct: 'make (crear) vs do (realizar)',
                    category: 'Vocabulary',
                    severity: 'medium',
                    explanation: 'MAKE: mistake, cake, money | DO: homework, exercise, work',
                    examples: [
                        { wrong: 'make homework', right: 'do homework' },
                        { wrong: 'do a mistake', right: 'make a mistake' }
                    ]
                },
                {
                    id: 'say_vs_tell',
                    pattern: /\b(say me|tell that|tell to me)\b/gi,
                    error: 'say vs tell confusion',
                    correct: 'say (no object) vs tell (+ person)',
                    category: 'Vocabulary',
                    severity: 'medium',
                    explanation: 'SAY something | TELL someone something',
                    examples: [
                        { wrong: 'He said me', right: 'He told me' },
                        { wrong: 'Tell that', right: 'Say that' }
                    ]
                }
            ]
        };

        // Tracking de errores detectados (en memoria - en producción usar DB)
        this.errorHistory = [];
    }

    /**
     * Analiza un texto y detecta todos los errores basados en patrones
     */
    analyzeText(text, language = 'en') {
        if (language !== 'en') {
            return { errors: [], suggestions: [] };
        }

        const detectedErrors = [];
        const allPatterns = [
            ...this.errorPatterns.falseFriends,
            ...this.errorPatterns.grammar,
            ...this.errorPatterns.prepositions,
            ...this.errorPatterns.wordOrder,
            ...this.errorPatterns.vocabulary
        ];

        allPatterns.forEach(pattern => {
            const matches = text.match(pattern.pattern);
            if (matches && matches.length > 0) {
                detectedErrors.push({
                    id: pattern.id,
                    error: pattern.error,
                    correct: pattern.correct,
                    category: pattern.category,
                    severity: pattern.severity,
                    explanation: pattern.explanation,
                    examples: pattern.examples,
                    occurrences: matches.length,
                    matchedText: matches
                });
            }
        });

        return {
            errors: detectedErrors,
            suggestions: this.generateSuggestions(detectedErrors)
        };
    }

    /**
     * Genera sugerencias de mejora basadas en errores detectados
     */
    generateSuggestions(errors) {
        if (errors.length === 0) {
            return ['✅ Great job! No common errors detected.'];
        }

        const suggestions = errors.map(error => {
            const icon = this.getSeverityIcon(error.severity);
            return `${icon} ${error.explanation}`;
        });

        return suggestions;
    }

    /**
     * Registra errores en el historial para análisis de patrones
     */
    trackErrors(userId, errors, sessionId) {
        const timestamp = new Date();
        
        errors.forEach(error => {
            this.errorHistory.push({
                userId: userId || 'anonymous',
                sessionId: sessionId || Date.now(),
                errorId: error.id,
                category: error.category,
                severity: error.severity,
                occurrences: error.occurrences,
                timestamp: timestamp,
                weekNumber: this.getWeekNumber(timestamp)
            });
        });
    }

    /**
     * Analiza patrones de errores de la última semana
     */
    analyzeWeeklyPatterns(userId = 'anonymous') {
        const currentWeek = this.getWeekNumber(new Date());
        
        // Filtrar errores de la última semana del usuario
        const weeklyErrors = this.errorHistory.filter(error => 
            error.userId === userId && error.weekNumber === currentWeek
        );

        if (weeklyErrors.length === 0) {
            return {
                topErrors: [],
                summary: 'No errors tracked this week.',
                totalErrors: 0
            };
        }

        // Agrupar por errorId y contar ocurrencias
        const errorCounts = {};
        weeklyErrors.forEach(error => {
            if (!errorCounts[error.errorId]) {
                errorCounts[error.errorId] = {
                    errorId: error.errorId,
                    category: error.category,
                    severity: error.severity,
                    count: 0
                };
            }
            errorCounts[error.errorId].count += error.occurrences;
        });

        // Convertir a array y ordenar por frecuencia
        const sortedErrors = Object.values(errorCounts)
            .sort((a, b) => b.count - a.count);

        // Top 3 errores más comunes
        const topErrors = sortedErrors.slice(0, 3);

        // Agregar información completa del patrón
        const enrichedErrors = topErrors.map(error => {
            const patternInfo = this.findPatternById(error.errorId);
            return {
                ...error,
                ...patternInfo
            };
        });

        return {
            topErrors: enrichedErrors,
            summary: this.generateWeeklySummary(enrichedErrors, weeklyErrors.length),
            totalErrors: weeklyErrors.length,
            categoriesAffected: [...new Set(weeklyErrors.map(e => e.category))],
            weekNumber: currentWeek
        };
    }

    /**
     * Busca información completa de un patrón por ID
     */
    findPatternById(errorId) {
        const allPatterns = [
            ...this.errorPatterns.falseFriends,
            ...this.errorPatterns.grammar,
            ...this.errorPatterns.prepositions,
            ...this.errorPatterns.wordOrder,
            ...this.errorPatterns.vocabulary
        ];

        return allPatterns.find(p => p.id === errorId) || {};
    }

    /**
     * Genera resumen de errores semanales
     */
    generateWeeklySummary(topErrors, totalCount) {
        if (topErrors.length === 0) {
            return '🎉 Excellent week! No significant error patterns detected.';
        }

        const errorList = topErrors.map((e, i) => 
            `${i + 1}. ${e.error} (${e.count}x)`
        ).join(', ');

        return `📊 This week you made ${totalCount} errors. Most common: ${errorList}`;
    }

    /**
     * Simula errores para testing (genera datos de muestra)
     */
    simulateWeeklyErrors(userId = 'demo_user', count = 15) {
        const allPatterns = [
            ...this.errorPatterns.falseFriends,
            ...this.errorPatterns.grammar,
            ...this.errorPatterns.prepositions
        ];

        const currentWeek = this.getWeekNumber(new Date());

        // Generar errores aleatorios con preferencia por algunos patrones
        const weightedPatterns = [
            ...Array(5).fill(allPatterns[0]), // actual vs actually (5x más probable)
            ...Array(4).fill(allPatterns[4]), // it's vs its (4x)
            ...Array(3).fill(allPatterns[8]), // depend of (3x)
            ...allPatterns
        ];

        for (let i = 0; i < count; i++) {
            const randomPattern = weightedPatterns[Math.floor(Math.random() * weightedPatterns.length)];
            
            this.errorHistory.push({
                userId: userId,
                sessionId: `session_${Date.now()}_${i}`,
                errorId: randomPattern.id,
                category: randomPattern.category,
                severity: randomPattern.severity,
                occurrences: Math.floor(Math.random() * 3) + 1,
                timestamp: new Date(),
                weekNumber: currentWeek
            });
        }

        return `✅ Simulated ${count} errors for user ${userId}`;
    }

    /**
     * Obtiene el número de semana del año
     */
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    /**
     * Obtiene icono basado en severidad
     */
    getSeverityIcon(severity) {
        const icons = {
            critical: '🔴',
            high: '🟠',
            medium: '🟡',
            low: '🟢'
        };
        return icons[severity] || '⚪';
    }

    /**
     * Limpia historial de errores (útil para testing)
     */
    clearHistory() {
        this.errorHistory = [];
        return 'History cleared';
    }
}

module.exports = new ErrorPatternAnalyzer();

// ============================================
// FLASHCARD GENERATOR - Personalized Learning
// Genera flashcards basadas en errores detectados
// ============================================

class FlashcardGenerator {
    constructor() {
        // Tipos de ejercicios disponibles
        this.exerciseTypes = [
            'fill_in_blank',
            'multiple_choice',
            'translation',
            'correction',
            'context_usage'
        ];
    }

    /**
     * Genera un deck completo de flashcards basado en errores comunes
     */
    generateDeck(topErrors, deckSize = 10) {
        if (!topErrors || topErrors.length === 0) {
            return this.generateDefaultDeck();
        }

        const flashcards = [];
        let cardId = 1;

        // Generar múltiples tarjetas por cada error común (distribuir equitativamente)
        const cardsPerError = Math.floor(deckSize / topErrors.length);
        const remainingCards = deckSize % topErrors.length;

        topErrors.forEach((error, index) => {
            // Número de tarjetas para este error
            const numCards = cardsPerError + (index < remainingCards ? 1 : 0);

            // Generar diferentes tipos de ejercicios para el mismo error
            const exerciseTypesForError = this.selectExerciseTypes(numCards);

            exerciseTypesForError.forEach(exerciseType => {
                const card = this.generateFlashcard(error, exerciseType, cardId);
                if (card) {
                    flashcards.push(card);
                    cardId++;
                }
            });
        });

        return {
            deckTitle: 'Weekend Practice - Your Top Errors',
            deckDescription: 'Personalized flashcards based on your most common mistakes this week',
            totalCards: flashcards.length,
            difficulty: this.calculateDeckDifficulty(topErrors),
            estimatedTime: `${flashcards.length * 2} minutes`,
            categories: [...new Set(topErrors.map(e => e.category))],
            flashcards: flashcards,
            tips: this.generateStudyTips(topErrors)
        };
    }

    /**
     * Genera una flashcard individual
     */
    generateFlashcard(error, exerciseType, cardId) {
        const generators = {
            fill_in_blank: () => this.generateFillInBlank(error, cardId),
            multiple_choice: () => this.generateMultipleChoice(error, cardId),
            translation: () => this.generateTranslation(error, cardId),
            correction: () => this.generateCorrection(error, cardId),
            context_usage: () => this.generateContextUsage(error, cardId)
        };

        const generator = generators[exerciseType];
        return generator ? generator() : null;
    }

    /**
     * Ejercicio: Fill in the Blank
     */
    generateFillInBlank(error, cardId) {
        if (!error.examples || error.examples.length === 0) {
            return null;
        }

        const example = this.selectRandomExample(error.examples);
        const correctSentence = example.right;

        // Extraer la palabra clave para el blank
        const keyWord = this.extractKeyWord(error.correct);
        const sentenceWithBlank = correctSentence.replace(
            new RegExp(`\\b${keyWord}\\b`, 'i'),
            '______'
        );

        return {
            id: cardId,
            type: 'fill_in_blank',
            category: error.category,
            difficulty: error.severity,
            question: sentenceWithBlank,
            correctAnswer: keyWord,
            hint: error.explanation,
            points: this.calculatePoints(error.severity),
            errorPattern: error.error
        };
    }

    /**
     * Ejercicio: Multiple Choice
     */
    generateMultipleChoice(error, cardId) {
        if (!error.examples || error.examples.length === 0) {
            return null;
        }

        const example = this.selectRandomExample(error.examples);
        
        // Generar opciones basadas en el error común
        const options = this.generateOptions(error);

        return {
            id: cardId,
            type: 'multiple_choice',
            category: error.category,
            difficulty: error.severity,
            question: `Which sentence is correct?`,
            options: options,
            correctAnswer: options.find(o => o.isCorrect).text,
            explanation: error.explanation,
            points: this.calculatePoints(error.severity),
            errorPattern: error.error
        };
    }

    /**
     * Ejercicio: Translation
     */
    generateTranslation(error, cardId) {
        // Para false friends, crear ejercicio de traducción
        if (error.category !== 'False Friends') {
            return this.generateFillInBlank(error, cardId);
        }

        const translations = this.getTranslationExercise(error);
        
        return {
            id: cardId,
            type: 'translation',
            category: error.category,
            difficulty: error.severity,
            question: `Translate correctly: "${translations.spanish}"`,
            correctAnswer: translations.english,
            commonMistake: translations.wrongEnglish,
            explanation: error.explanation,
            points: this.calculatePoints(error.severity) + 2,
            errorPattern: error.error
        };
    }

    /**
     * Ejercicio: Correction
     */
    generateCorrection(error, cardId) {
        if (!error.examples || error.examples.length === 0) {
            return null;
        }

        const example = this.selectRandomExample(error.examples);

        return {
            id: cardId,
            type: 'correction',
            category: error.category,
            difficulty: error.severity,
            question: `Find and correct the error:`,
            incorrectSentence: example.wrong,
            correctSentence: example.right,
            explanation: error.explanation,
            points: this.calculatePoints(error.severity) + 1,
            errorPattern: error.error
        };
    }

    /**
     * Ejercicio: Context Usage
     */
    generateContextUsage(error, cardId) {
        const contexts = this.generateContextExamples(error);

        return {
            id: cardId,
            type: 'context_usage',
            category: error.category,
            difficulty: error.severity,
            question: `Complete the sentences with the correct word/phrase:`,
            contexts: contexts,
            explanation: error.explanation,
            points: this.calculatePoints(error.severity) + 2,
            errorPattern: error.error
        };
    }

    /**
     * Genera opciones para multiple choice
     */
    generateOptions(error) {
        const options = [];
        
        if (error.examples && error.examples.length > 0) {
            const example = this.selectRandomExample(error.examples);
            
            options.push({
                id: 'a',
                text: example.right,
                isCorrect: true
            });

            options.push({
                id: 'b',
                text: example.wrong,
                isCorrect: false
            });

            // Agregar opciones distractoras
            const distractors = this.generateDistractors(error, example);
            distractors.forEach((distractor, index) => {
                options.push({
                    id: String.fromCharCode(99 + index), // c, d, e...
                    text: distractor,
                    isCorrect: false
                });
            });
        }

        // Mezclar opciones
        return this.shuffleArray(options);
    }

    /**
     * Genera distractores para multiple choice
     */
    generateDistractors(error, example) {
        const distractors = [];

        // Basados en el tipo de error
        if (error.id === 'actual_vs_actually') {
            distractors.push('The actual work is done');
            distractors.push('I work actually here');
        } else if (error.id === 'its_vs_its') {
            distractors.push("It's tail is long");
            distractors.push("Its a nice day");
        } else if (error.id === 'depend_of') {
            distractors.push('It depends of the weather');
        } else {
            // Generar distractores genéricos variando el ejemplo incorrecto
            const variations = this.generateVariations(example.wrong);
            distractors.push(...variations.slice(0, 2));
        }

        return distractors;
    }

    /**
     * Genera variaciones de una oración
     */
    generateVariations(sentence) {
        const variations = [];
        
        // Variación 1: Cambiar artículos
        variations.push(sentence.replace(/\ba\b/gi, 'the').replace(/\bthe\b/gi, 'a'));
        
        // Variación 2: Cambiar tiempo verbal simple
        variations.push(sentence.replace(/\bis\b/gi, 'was').replace(/\bare\b/gi, 'were'));
        
        return variations.filter(v => v !== sentence);
    }

    /**
     * Genera ejercicio de traducción
     */
    getTranslationExercise(error) {
        const exercises = {
            actual_vs_actually: {
                spanish: 'La situación actual es complicada',
                english: 'The current situation is complicated',
                wrongEnglish: 'The actual situation is complicated'
            },
            eventually_vs_eventualmente: {
                spanish: 'Eventualmente puedo ayudarte',
                english: 'I can possibly help you',
                wrongEnglish: 'I can eventually help you'
            },
            assist_vs_asistir: {
                spanish: 'Voy a asistir a la reunión',
                english: 'I will attend the meeting',
                wrongEnglish: 'I will assist to the meeting'
            }
        };

        return exercises[error.id] || {
            spanish: 'Traducir correctamente',
            english: error.correct,
            wrongEnglish: error.error
        };
    }

    /**
     * Genera ejemplos de uso en contexto
     */
    generateContextExamples(error) {
        const contexts = [];

        if (error.examples && error.examples.length > 0) {
            error.examples.forEach((example, index) => {
                const keyWord = this.extractKeyWord(example.right);
                const blank = example.right.replace(
                    new RegExp(`\\b${keyWord}\\b`, 'i'),
                    '______'
                );

                contexts.push({
                    sentence: blank,
                    correctAnswer: keyWord,
                    contextNumber: index + 1
                });
            });
        }

        return contexts;
    }

    /**
     * Extrae palabra clave de la corrección
     */
    extractKeyWord(correctPhrase) {
        // Extraer la palabra principal de la corrección
        const words = correctPhrase.split(' ');
        
        // Buscar palabras clave (no artículos, no preposiciones)
        const stopWords = ['a', 'an', 'the', 'is', 'are', 'was', 'were', 'to', 'of', 'in', 'on', 'at'];
        const keyWords = words.filter(word => 
            !stopWords.includes(word.toLowerCase()) && word.length > 2
        );

        return keyWords[0] || words[0];
    }

    /**
     * Selecciona ejemplo aleatorio
     */
    selectRandomExample(examples) {
        return examples[Math.floor(Math.random() * examples.length)];
    }

    /**
     * Selecciona tipos de ejercicios variados
     */
    selectExerciseTypes(count) {
        const types = [...this.exerciseTypes];
        const selected = [];

        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * types.length);
            selected.push(types[randomIndex]);
        }

        return selected;
    }

    /**
     * Calcula puntos según severidad
     */
    calculatePoints(severity) {
        const points = {
            critical: 10,
            high: 7,
            medium: 5,
            low: 3
        };
        return points[severity] || 5;
    }

    /**
     * Calcula dificultad del deck
     */
    calculateDeckDifficulty(errors) {
        if (!errors || errors.length === 0) return 'Beginner';

        const severityScores = {
            critical: 4,
            high: 3,
            medium: 2,
            low: 1
        };

        const avgScore = errors.reduce((sum, error) => 
            sum + (severityScores[error.severity] || 0), 0
        ) / errors.length;

        if (avgScore >= 3.5) return 'Advanced';
        if (avgScore >= 2.5) return 'Intermediate';
        return 'Beginner';
    }

    /**
     * Genera tips de estudio
     */
    generateStudyTips(errors) {
        const tips = [
            '📝 Practice each flashcard at least 3 times',
            '⏰ Study for 15-20 minutes daily this weekend',
            '🔊 Read sentences out loud to improve pronunciation',
            '✍️ Write your own examples for each pattern'
        ];

        // Agregar tips específicos según categorías
        const categories = [...new Set(errors.map(e => e.category))];
        
        if (categories.includes('False Friends')) {
            tips.push('🌍 Create a false friends list to review regularly');
        }
        if (categories.includes('Grammar')) {
            tips.push('📚 Review grammar rules before practicing');
        }
        if (categories.includes('Prepositions')) {
            tips.push('🎯 Focus on preposition collocations (verb+preposition)');
        }

        return tips;
    }

    /**
     * Genera deck por defecto si no hay errores
     */
    generateDefaultDeck() {
        return {
            deckTitle: 'General English Practice',
            deckDescription: 'A curated set of common English challenges',
            totalCards: 5,
            difficulty: 'Beginner',
            estimatedTime: '10 minutes',
            categories: ['Grammar', 'Vocabulary'],
            flashcards: [
                {
                    id: 1,
                    type: 'multiple_choice',
                    category: 'Grammar',
                    question: 'Which sentence is correct?',
                    options: [
                        { id: 'a', text: "It's a beautiful day", isCorrect: true },
                        { id: 'b', text: "Its a beautiful day", isCorrect: false }
                    ],
                    correctAnswer: "It's a beautiful day",
                    explanation: "it's = it is (with apostrophe)",
                    points: 5
                },
                {
                    id: 2,
                    type: 'fill_in_blank',
                    category: 'Vocabulary',
                    question: 'I ______ homework every day.',
                    correctAnswer: 'do',
                    hint: 'Use DO with homework, not make',
                    points: 5
                }
            ],
            tips: [
                '📝 Review these basics regularly',
                '✍️ Practice makes perfect!'
            ]
        };
    }

    /**
     * Mezcla array (Fisher-Yates shuffle)
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

module.exports = new FlashcardGenerator();

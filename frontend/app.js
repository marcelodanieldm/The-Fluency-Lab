// ============================================
// THE FLUENCY LAB - APP LOGIC
// Communication Skills Hacking Dashboard
// ============================================

const API_URL = 'http://localhost:3000/api/sentiment';

let radarChart = null;

// ============================================
// MATRIX RAIN BACKGROUND EFFECT
// ============================================

function initMatrixRain() {
    const canvas = document.getElementById('matrix-bg');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    function draw() {
        ctx.fillStyle = 'rgba(10, 14, 39, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00f5ff';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = characters.charAt(Math.floor(Math.random() * characters.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(draw, 50);

    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ============================================
// RADAR CHART INITIALIZATION
// ============================================

function initRadarChart() {
    const ctx = document.getElementById('softSkillsRadar');
    
    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: [
                'Persuasión',
                'Claridad Técnica',
                'Empatía',
                'Resolución de Conflictos',
                'Brevedad'
            ],
            datasets: [{
                label: 'Soft Skills Score',
                data: [0, 0, 0, 0, 0],
                backgroundColor: 'rgba(255, 0, 110, 0.2)',
                borderColor: '#ff006e',
                borderWidth: 3,
                pointBackgroundColor: '#ff006e',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#ff006e',
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 14, 39, 0.9)',
                    titleColor: '#00f5ff',
                    bodyColor: '#e0e0e0',
                    borderColor: '#00f5ff',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return context.parsed.r + '/100';
                        }
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    min: 0,
                    ticks: {
                        stepSize: 20,
                        color: '#a0a0a0',
                        backdropColor: 'transparent',
                        font: {
                            family: 'Courier New',
                            size: 12
                        }
                    },
                    grid: {
                        color: 'rgba(42, 63, 95, 0.5)',
                        circular: true
                    },
                    pointLabels: {
                        color: '#e0e0e0',
                        font: {
                            family: 'Courier New',
                            size: 13,
                            weight: 'bold'
                        },
                        padding: 15
                    },
                    angleLines: {
                        color: 'rgba(42, 63, 95, 0.5)'
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// ============================================
// UPDATE RADAR CHART
// ============================================

function updateRadarChart(softSkills) {
    if (!radarChart) return;

    const data = [
        softSkills.persuasion,
        softSkills.technicalClarity,
        softSkills.empathy,
        softSkills.conflictResolution,
        softSkills.brevity
    ];

    radarChart.data.datasets[0].data = data;
    radarChart.update();

    // Update legend values
    document.getElementById('persuasionValue').textContent = softSkills.persuasion + '/100';
    document.getElementById('clarityValue').textContent = softSkills.technicalClarity + '/100';
    document.getElementById('empathyValue').textContent = softSkills.empathy + '/100';
    document.getElementById('conflictValue').textContent = softSkills.conflictResolution + '/100';
    document.getElementById('brevityValue').textContent = softSkills.brevity + '/100';
}

// ============================================
// ANALYZE BUTTON HANDLER
// ============================================

document.getElementById('analyzeBtn').addEventListener('click', async () => {
    const transcription = document.getElementById('transcription').value.trim();
    const language = document.getElementById('language').value;

    if (!transcription) {
        alert('⚠️ Por favor, introduce una transcripción para analizar.');
        return;
    }

    // Show loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';

    try {
        const response = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                transcription,
                language
            })
        });

        if (!response.ok) {
            throw new Error('Error en el análisis');
        }

        const result = await response.json();
        displayResults(result.data);

    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al analizar. Asegúrate de que el backend esté ejecutándose.');
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
});

// ============================================
// DISPLAY RESULTS
// ============================================

function displayResults(data) {
    // Show results section
    document.getElementById('results').style.display = 'block';

    // Confidence Score
    document.getElementById('confidenceScore').textContent = data.confidenceScore;
    document.getElementById('confidenceLevel').textContent = data.confidenceLevel;
    document.getElementById('confidenceBar').style.width = data.confidenceScore + '%';

    // Tone
    const toneEmojis = {
        doubt: '😟',
        aggressive: '😤',
        professional: '🤝',
        passive: '😶',
        neutral: '⚖️'
    };
    
    const toneNames = {
        doubt: 'Dudoso',
        aggressive: 'Agresivo',
        professional: 'Profesional',
        passive: 'Pasivo',
        neutral: 'Neutral'
    };

    document.getElementById('toneEmoji').textContent = toneEmojis[data.tone] || '🤖';
    document.getElementById('toneName').textContent = toneNames[data.tone] || data.tone;
    document.getElementById('toneDescription').textContent = data.toneDescription;

    // Metrics
    document.getElementById('wordCount').textContent = data.metrics.wordCount;
    document.getElementById('sentenceCount').textContent = data.metrics.sentenceCount;
    document.getElementById('fillerCount').textContent = data.fillerWords.count;

    // Sentiment
    const sentimentScore = data.sentiment.score;
    const sentimentPosition = ((sentimentScore + 10) / 20) * 100; // Normalize to 0-100%
    document.getElementById('sentimentIndicator').style.left = Math.max(0, Math.min(100, sentimentPosition)) + '%';
    document.getElementById('sentimentScore').textContent = `Score: ${sentimentScore}`;

    // Soft Skills Radar Chart
    if (data.softSkills) {
        updateRadarChart(data.softSkills);
    }

    // Advice
    document.getElementById('adviceSummary').textContent = data.advice.summary;
    
    const adviceList = document.getElementById('adviceList');
    adviceList.innerHTML = '';
    data.advice.primary.forEach(advice => {
        const adviceItem = document.createElement('div');
        adviceItem.className = 'advice-item';
        adviceItem.textContent = advice;
        adviceList.appendChild(adviceItem);
    });

    // Filler Words
    if (data.fillerWords.count > 0) {
        document.getElementById('fillerSection').style.display = 'block';
        const fillerList = document.getElementById('fillerList');
        fillerList.innerHTML = '';
        
        data.fillerWords.found.forEach(filler => {
            const tag = document.createElement('div');
            tag.className = 'filler-tag';
            tag.innerHTML = `
                <span class="filler-word">"${filler.word}"</span>
                <span class="filler-count">${filler.count}</span>
            `;
            fillerList.appendChild(tag);
        });
    } else {
        document.getElementById('fillerSection').style.display = 'none';
    }

    // Learning Path
    if (data.learningPath) {
        displayLearningPath(data.learningPath);
    }

    // English Level (solo para inglés)
    if (data.englishLevel && data.englishLevel.cefrLevel !== 'N/A') {
        displayEnglishLevel(data.englishLevel);
    }

    // Error Analysis (solo para inglés)
    if (data.errorAnalysis) {
        displayErrorAnalysis(data.errorAnalysis);
    }

    // Show Flashcards Section (solo para inglés con errores)
    if (data.errorAnalysis && data.errorAnalysis.errors.length > 0) {
        document.getElementById('flashcardsSection').style.display = 'block';
    }

    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================
// DISPLAY LEARNING PATH
// ============================================

function displayLearningPath(learningPath) {
    document.getElementById('learningPathSection').style.display = 'block';

    // Profile Summary
    const profile = learningPath.profile;
    document.getElementById('overallLevel').textContent = 
        `${profile.currentLevel.level.toUpperCase()} (${profile.currentLevel.score})`;
    document.getElementById('strengthsCount').textContent = profile.strengths.length;
    document.getElementById('weakAreasCount').textContent = profile.weakAreas.length;
    
    const progress = learningPath.estimatedProgress;
    document.getElementById('progressEstimate').textContent = 
        `+${progress.improvement} pts`;

    // Weekly Plan
    const weeklyLessons = document.getElementById('weeklyLessons');
    weeklyLessons.innerHTML = '';

    learningPath.weeklyPlan.forEach(lesson => {
        const lessonCard = document.createElement('div');
        lessonCard.className = 'lesson-card';
        
        const difficultyIcons = {
            beginner: '⭐',
            intermediate: '⭐⭐',
            advanced: '⭐⭐⭐'
        };

        const skillNames = {
            persuasion: 'Persuasión',
            technicalClarity: 'Claridad Técnica',
            empathy: 'Empatía',
            conflictResolution: 'Resolución de Conflictos',
            brevity: 'Brevedad'
        };

        lessonCard.innerHTML = `
            <div class="lesson-order">${lesson.weekOrder}</div>
            <div class="lesson-content">
                <div class="lesson-header">
                    <span class="lesson-title">${lesson.title}</span>
                    <span class="lesson-badge ${lesson.priority}">${lesson.priority.toUpperCase()}</span>
                </div>
                <p class="lesson-description">${lesson.description}</p>
                <div class="lesson-meta">
                    <span class="meta-item">
                        <span class="meta-icon">🎯</span>
                        ${skillNames[lesson.targetSkill] || lesson.targetSkill}
                    </span>
                    <span class="meta-item">
                        <span class="meta-icon">⏱️</span>
                        ${lesson.duration}
                    </span>
                    <span class="meta-item">
                        <span class="meta-icon">📊</span>
                        ${difficultyIcons[lesson.difficulty]} ${lesson.difficulty}
                    </span>
                </div>
                <div class="lesson-topics">
                    ${lesson.topics.map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
                </div>
            </div>
            <div class="lesson-impact">
                <span class="impact-label">Impacto</span>
                <span class="impact-value">${lesson.estimatedImpact.estimatedGain}</span>
                <span class="impact-target">→ ${lesson.estimatedImpact.projectedScore}</span>
            </div>
        `;
        
        weeklyLessons.appendChild(lessonCard);
    });

    // Monthly Goals
    const monthlyGoalsList = document.getElementById('monthlyGoalsList');
    monthlyGoalsList.innerHTML = '';

    learningPath.monthlyGoals.forEach(goal => {
        const goalCard = document.createElement('div');
        goalCard.className = 'goal-card';
        
        const progressPercent = ((goal.currentScore / goal.targetScore) * 100).toFixed(0);

        const skillNames = {
            persuasion: 'Persuasión',
            technicalClarity: 'Claridad Técnica',
            empathy: 'Empatía',
            conflictResolution: 'Resolución de Conflictos',
            brevity: 'Brevedad'
        };

        goalCard.innerHTML = `
            <div class="goal-header">
                <span class="goal-skill">${skillNames[goal.skill] || goal.skill}</span>
                <div class="goal-scores">
                    <div class="score-item">
                        <span class="score-label">Actual</span>
                        <span class="score-value score-current">${goal.currentScore}</span>
                    </div>
                    <span class="score-arrow">→</span>
                    <div class="score-item">
                        <span class="score-label">Meta</span>
                        <span class="score-value score-target">${goal.targetScore}</span>
                    </div>
                </div>
            </div>
            <div class="goal-progress-bar">
                <div class="goal-progress-fill" style="width: ${progressPercent}%"></div>
            </div>
            <div class="milestones">
                ${goal.milestones.map(milestone => `
                    <div class="milestone">
                        <div class="milestone-week">Semana ${milestone.week}</div>
                        <div class="milestone-score">${milestone.targetScore}</div>
                    </div>
                `).join('')}
            </div>
        `;
        
        monthlyGoalsList.appendChild(goalCard);
    });

    // AI Recommendations
    const aiRecommendations = document.getElementById('aiRecommendations');
    aiRecommendations.innerHTML = '';

    learningPath.recommendations.forEach(rec => {
        const recCard = document.createElement('div');
        recCard.className = `recommendation-card ${rec.type}`;
        
        const icons = {
            priority: '🎯',
            leverage: '✨',
            balance: '⚖️'
        };

        recCard.innerHTML = `
            <span class="recommendation-icon">${icons[rec.type] || '💡'}</span>
            <div class="recommendation-content">
                <p class="recommendation-message">${rec.message}</p>
                <p class="recommendation-action">${rec.action}</p>
            </div>
        `;
        
        aiRecommendations.appendChild(recCard);
    });
    
    // Show Skill Tree after displaying learning path
    showSkillTree();
}

// ============================================
// DISPLAY ENGLISH LEVEL EVALUATION
// ============================================

function displayEnglishLevel(englishLevel) {
    document.getElementById('englishLevelSection').style.display = 'block';

    // CEFR Level & Score
    document.getElementById('cefrLevel').textContent = englishLevel.cefrLevel;
    document.getElementById('levelScore').textContent = englishLevel.score + '/100';
    document.getElementById('cefrDescription').textContent = englishLevel.cefrDescription;

    // Color badge based on level
    const badge = document.getElementById('cefrLevel');
    const levelColors = {
        'B1': '#ff9500',
        'B2': '#00f5ff',
        'C1': '#39ff14',
        'C2': '#bf00ff'
    };
    badge.style.color = levelColors[englishLevel.cefrLevel] || '#00f5ff';
    badge.style.textShadow = `0 0 20px ${levelColors[englishLevel.cefrLevel]}, 0 0 30px ${levelColors[englishLevel.cefrLevel]}`;
    badge.style.borderColor = levelColors[englishLevel.cefrLevel];

    // Lexical Analysis
    const lexical = englishLevel.lexicalAnalysis;
    document.getElementById('lexicalDensity').textContent = lexical.lexicalDensity + '%';
    document.getElementById('lexicalDiversity').textContent = lexical.lexicalDiversity + '%';
    document.getElementById('academicVocab').textContent = lexical.academicWords + ' words (' + lexical.academicPercentage + '%)';
    document.getElementById('avgWordLength').textContent = lexical.avgWordLength + ' chars';

    // Grammatical Complexity
    const grammar = englishLevel.grammaticalComplexity;
    document.getElementById('complexityScore').textContent = grammar.complexityScore + '/100';
    document.getElementById('relativeClauses').textContent = grammar.relativeClauses;
    document.getElementById('passiveVoice').textContent = grammar.passiveVoice;
    document.getElementById('advancedConnectors').textContent = grammar.connectors.total;

    // Sentence Structure
    const structure = englishLevel.sentenceStructure;
    document.getElementById('simpleStructures').textContent = structure.simpleStructures;
    document.getElementById('complexStructures').textContent = structure.complexStructures;
    document.getElementById('avgWordsPerSent').textContent = structure.avgWordsPerSentence;
    document.getElementById('simplePercentage').textContent = structure.simplePercentage + '%';

    // Strengths
    const strengthsList = document.getElementById('strengthsList');
    strengthsList.innerHTML = '';
    englishLevel.strengths.forEach(strength => {
        const li = document.createElement('li');
        li.textContent = strength;
        strengthsList.appendChild(li);
    });

    // Weaknesses
    const weaknessesList = document.getElementById('weaknessesList');
    weaknessesList.innerHTML = '';
    englishLevel.weaknesses.forEach(weakness => {
        const li = document.createElement('li');
        li.textContent = weakness;
        weaknessesList.appendChild(li);
    });

    // Recommended Exercises
    const exercisesList = document.getElementById('exercisesList');
    exercisesList.innerHTML = '';
    
    englishLevel.exercises.forEach(exercise => {
        const exerciseCard = document.createElement('div');
        exerciseCard.className = 'exercise-card';
        if (exercise.priority === 'high') {
            exerciseCard.classList.add('high-priority');
        }

        const practicesList = exercise.exercises 
            ? `<div class="exercise-practices">
                <h5>Practice Exercises:</h5>
                <ul>
                    ${exercise.exercises.map(ex => `<li>${ex}</li>`).join('')}
                </ul>
            </div>`
            : '';

        exerciseCard.innerHTML = `
            <div class="exercise-header">
                <div class="exercise-title-section">
                    <h4 class="exercise-title">${exercise.title}</h4>
                    <div>
                        <span class="exercise-focus">${exercise.focus}</span>
                        <span class="exercise-difficulty">${exercise.difficulty}</span>
                    </div>
                </div>
                <span class="exercise-priority-badge priority-${exercise.priority}">
                    ${exercise.priority.toUpperCase()}
                </span>
            </div>
            <p class="exercise-description">${exercise.description}</p>
            ${practicesList}
            <div class="exercise-footer">
                <span class="exercise-time">⏱️ ${exercise.estimatedTime}</span>
                <span class="exercise-goal">🎯 ${exercise.goal}</span>
            </div>
        `;

        exercisesList.appendChild(exerciseCard);
    });

    // Feedback
    const feedbackList = document.getElementById('englishFeedbackList');
    feedbackList.innerHTML = '';

    englishLevel.feedback.forEach(feedback => {
        const feedbackCard = document.createElement('div');
        feedbackCard.className = `feedback-card ${feedback.type}`;

        feedbackCard.innerHTML = `
            <div class="feedback-type">${feedback.type}</div>
            <p class="feedback-message">${feedback.message}</p>
            <p class="feedback-suggestion">💡 ${feedback.suggestion}</p>
        `;

        feedbackList.appendChild(feedbackCard);
    });
}

// ============================================
// DISPLAY ERROR ANALYSIS
// ============================================

function displayErrorAnalysis(errorAnalysis) {
    if (!errorAnalysis || errorAnalysis.errors.length === 0) {
        document.getElementById('errorAnalysisSection').style.display = 'none';
        return;
    }

    document.getElementById('errorAnalysisSection').style.display = 'block';

    // Error Summary
    document.getElementById('errorCount').textContent = errorAnalysis.errors.length;
    
    const categories = [...new Set(errorAnalysis.errors.map(e => e.category))];
    document.getElementById('categoryCount').textContent = categories.length;

    // Calculate average severity
    const severityScores = { critical: 4, high: 3, medium: 2, low: 1 };
    const avgScore = errorAnalysis.errors.reduce((sum, e) => 
        sum + (severityScores[e.severity] || 0), 0) / errorAnalysis.errors.length;
    
    const severityText = avgScore >= 3 ? 'High' : avgScore >= 2 ? 'Medium' : 'Low';
    document.getElementById('avgSeverity').textContent = severityText;

    // Display errors
    const errorsList = document.getElementById('errorsList');
    errorsList.innerHTML = '';

    errorAnalysis.errors.forEach(error => {
        const errorCard = document.createElement('div');
        errorCard.className = `error-item severity-${error.severity}`;

        const examplesHTML = error.examples && error.examples.length > 0 ? `
            <div class="error-examples">
                <h4>Examples:</h4>
                ${error.examples.map(ex => `
                    <div class="example-pair">
                        <div class="example-wrong">❌ ${ex.wrong}</div>
                        <div class="example-right">✅ ${ex.right}</div>
                    </div>
                `).join('')}
            </div>
        ` : '';

        errorCard.innerHTML = `
            <div class="error-item-header">
                <span class="error-type">${error.error}</span>
                <span class="error-category">${error.category}</span>
            </div>
            <div class="error-explanation">${error.explanation}</div>
            <div style="color: var(--neon-cyan); margin-top: 10px;">
                ✓ Correct: <strong>${error.correct}</strong>
            </div>
            <div style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 5px;">
                Found: ${error.occurrences} time(s) | Severity: ${error.severity}
            </div>
            ${examplesHTML}
        `;

        errorsList.appendChild(errorCard);
    });

    // Display suggestions
    const suggestionsList = document.getElementById('suggestionsList');
    suggestionsList.innerHTML = '';

    errorAnalysis.suggestions.forEach(suggestion => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = suggestion;
        suggestionsList.appendChild(suggestionItem);
    });
}

// ============================================
// GENERATE AND DISPLAY FLASHCARDS
// ============================================

async function generateFlashcards() {
    try {
        // Show loading
        const generateBtn = document.getElementById('generateDeckBtn');
        const originalText = generateBtn.innerHTML;
        generateBtn.innerHTML = '<span>⏳</span> Generating...';
        generateBtn.disabled = true;

        // Call API to generate flashcards
        const response = await fetch('http://localhost:3000/api/flashcards/simulate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: 'current_user',
                errorCount: 15
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate flashcards');
        }

        const data = await response.json();
        
        // Display flashcard deck
        displayFlashcardDeck(data.flashcardDeck, data.weeklyAnalysis);

        // Reset button
        generateBtn.innerHTML = originalText;
        generateBtn.disabled = false;

    } catch (error) {
        console.error('Error generating flashcards:', error);
        alert('Failed to generate flashcards. Make sure the backend is running.');
        
        const generateBtn = document.getElementById('generateDeckBtn');
        generateBtn.innerHTML = '<span>🎮</span> Generate My Flashcard Deck';
        generateBtn.disabled = false;
    }
}

function displayFlashcardDeck(deck, weeklyAnalysis) {
    if (!deck) return;

    document.getElementById('flashcardsSection').style.display = 'block';

    // Deck Info
    document.getElementById('deckTotalCards').textContent = deck.totalCards;
    document.getElementById('deckEstTime').textContent = deck.estimatedTime;
    document.getElementById('deckDifficulty').textContent = deck.difficulty;

    // Weekly Analysis Summary (if available)
    if (weeklyAnalysis && weeklyAnalysis.summary) {
        console.log('Weekly Analysis:', weeklyAnalysis.summary);
    }

    // Display Flashcards
    const flashcardsContainer = document.getElementById('flashcardsContainer');
    flashcardsContainer.style.display = 'grid';
    flashcardsContainer.innerHTML = '';

    deck.flashcards.forEach(card => {
        const flashcardElement = document.createElement('div');
        flashcardElement.className = 'flashcard';

        let contentHTML = '';

        // Different content based on card type
        switch (card.type) {
            case 'fill_in_blank':
                contentHTML = `
                    <div class="flashcard-question">${card.question}</div>
                    <div style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 10px;">
                        💡 Hint: ${card.hint}
                    </div>
                    <div style="color: var(--neon-green); font-size: 0.9rem; margin-top: 10px; display: none;" class="flashcard-answer">
                        ✓ Answer: ${card.correctAnswer}
                    </div>
                `;
                break;

            case 'multiple_choice':
                const optionsHTML = card.options.map(option => `
                    <div class="flashcard-option" data-correct="${option.isCorrect}">
                        ${option.id.toUpperCase()}) ${option.text}
                    </div>
                `).join('');
                
                contentHTML = `
                    <div class="flashcard-question">${card.question}</div>
                    <div class="flashcard-options">${optionsHTML}</div>
                    <div style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 10px;">
                        💡 ${card.explanation}
                    </div>
                `;
                break;

            case 'correction':
                contentHTML = `
                    <div class="flashcard-question">${card.question}</div>
                    <div style="color: var(--neon-pink); margin: 15px 0;">
                        ❌ ${card.incorrectSentence}
                    </div>
                    <div style="color: var(--neon-green); display: none;" class="flashcard-answer">
                        ✅ ${card.correctSentence}
                    </div>
                `;
                break;

            case 'translation':
                contentHTML = `
                    <div class="flashcard-question">${card.question}</div>
                    <div style="color: var(--neon-orange); margin: 10px 0; font-size: 0.9rem;">
                        ⚠️ Common mistake: ${card.commonMistake}
                    </div>
                    <div style="color: var(--neon-green); display: none;" class="flashcard-answer">
                        ✓ ${card.correctAnswer}
                    </div>
                `;
                break;

            case 'context_usage':
                const contextsHTML = card.contexts.map(ctx => `
                    <div style="margin: 10px 0;">
                        <div>${ctx.contextNumber}. ${ctx.sentence}</div>
                        <div style="color: var(--neon-green); display: none;" class="flashcard-answer">
                            → ${ctx.correctAnswer}
                        </div>
                    </div>
                `).join('');
                
                contentHTML = `
                    <div class="flashcard-question">${card.question}</div>
                    ${contextsHTML}
                `;
                break;
        }

        flashcardElement.innerHTML = `
            <div class="flashcard-header-info">
                <span class="flashcard-id">Card #${card.id}</span>
                <span class="flashcard-category">${card.category}</span>
            </div>
            <div class="flashcard-type">${card.type.replace(/_/g, ' ')}</div>
            ${contentHTML}
            <div class="flashcard-points">🎯 ${card.points} points</div>
        `;

        // Click to reveal answer
        flashcardElement.addEventListener('click', () => {
            const answers = flashcardElement.querySelectorAll('.flashcard-answer');
            answers.forEach(answer => {
                answer.style.display = answer.style.display === 'none' ? 'block' : 'none';
            });
        });

        flashcardsContainer.appendChild(flashcardElement);
    });

    // Study Tips
    const studyTipsContainer = document.getElementById('studyTipsContainer');
    const studyTipsList = document.getElementById('studyTipsList');
    
    if (deck.tips && deck.tips.length > 0) {
        studyTipsContainer.style.display = 'block';
        studyTipsList.innerHTML = '';

        deck.tips.forEach(tip => {
            const tipItem = document.createElement('div');
            tipItem.className = 'tip-item';
            tipItem.textContent = tip;
            studyTipsList.appendChild(tipItem);
        });
    }
}

// ============================================
// TONE EMOJI MAPPING
// ============================================

function getToneEmoji(tone) {
    const emojis = {
        doubt: '😟',
        aggressive: '😤',
        professional: '🤝',
        passive: '😶',
        neutral: '⚖️'
    };
    return emojis[tone] || '🤖';
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.getElementById('transcription').addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to analyze
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        document.getElementById('analyzeBtn').click();
    }
});

// ============================================
// SKILL TREE LOGIC
// ============================================

// Skill Tree State Management
const skillTreeState = {
    weeks: [
        { week: 1, skill: 'Conflict Resolution', score: null, completed: false, unlocked: true },
        { week: 2, skill: 'Technical Clarity', score: null, completed: false, unlocked: false },
        { week: 3, skill: 'Persuasion', score: null, completed: false, unlocked: false },
        { week: 4, skill: 'Empathy', score: null, completed: false, unlocked: false }
    ],
    finalAchievement: { completed: false, unlocked: false },
    sessionHistory: [],
    totalXP: 0
};

// Initialize Skill Tree
function initSkillTree() {
    updateSkillTreeUI();
    drawTreeConnections();
    
    // Event listeners for controls
    document.getElementById('simulateSession').addEventListener('click', simulateSession);
    document.getElementById('resetProgress').addEventListener('click', resetSkillTree);
    
    // Click events on nodes
    document.querySelectorAll('.tree-node').forEach(node => {
        node.addEventListener('click', () => handleNodeClick(node));
    });
}

// Update Skill Tree UI based on state
function updateSkillTreeUI() {
    const nodes = document.querySelectorAll('.tree-node:not(.achievement)');
    
    nodes.forEach((node, index) => {
        const weekData = skillTreeState.weeks[index];
        const scoreElement = node.querySelector('.node-score');
        const statusElement = node.querySelector('.node-status');
        
        // Remove all state classes
        node.classList.remove('locked', 'unlocked', 'completed');
        
        // Apply current state
        if (weekData.completed) {
            node.classList.add('completed');
            scoreElement.textContent = `${weekData.score}/100`;
            statusElement.textContent = 'COMPLETED';
        } else if (weekData.unlocked) {
            node.classList.add('unlocked');
            scoreElement.textContent = '--/100';
            statusElement.textContent = 'AVAILABLE';
        } else {
            node.classList.add('locked');
            scoreElement.textContent = '--/100';
            statusElement.textContent = 'LOCKED';
        }
    });
    
    // Update final achievement
    const achievementNode = document.querySelector('.tree-node.achievement');
    const allCompleted = skillTreeState.weeks.every(w => w.completed);
    
    if (allCompleted) {
        achievementNode.classList.remove('locked');
        achievementNode.classList.add('completed');
        achievementNode.querySelector('.node-status').textContent = 'UNLOCKED';
        skillTreeState.finalAchievement.completed = true;
        skillTreeState.finalAchievement.unlocked = true;
    } else {
        achievementNode.classList.add('locked');
        achievementNode.querySelector('.node-status').textContent = 'LOCKED';
    }
    
    // Update stats
    updateSkillTreeStats();
    
    // Update connections
    drawTreeConnections();
}

// Draw connections between nodes
function drawTreeConnections() {
    const svg = document.getElementById('treeConnections');
    svg.innerHTML = '';
    
    const nodes = document.querySelectorAll('.tree-node');
    
    // Connect sequential weeks
    for (let i = 0; i < nodes.length - 2; i++) {
        const node1 = nodes[i];
        const node2 = nodes[i + 1];
        
        const rect1 = node1.getBoundingClientRect();
        const rect2 = node2.getBoundingClientRect();
        const containerRect = svg.getBoundingClientRect();
        
        const x1 = rect1.left - containerRect.left + rect1.width / 2;
        const y1 = rect1.top - containerRect.top + rect1.height / 2;
        const x2 = rect2.left - containerRect.left + rect2.width / 2;
        const y2 = rect2.top - containerRect.top + rect2.height / 2;
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.classList.add('tree-connection-line');
        
        // Activate line if previous node is completed
        if (i < 4 && skillTreeState.weeks[i].completed) {
            line.classList.add('active');
        }
        
        svg.appendChild(line);
    }
    
    // Connect week 4 to final achievement
    const lastWeekNode = nodes[3];
    const achievementNode = nodes[4];
    
    const rect1 = lastWeekNode.getBoundingClientRect();
    const rect2 = achievementNode.getBoundingClientRect();
    const containerRect = svg.getBoundingClientRect();
    
    const x1 = rect1.left - containerRect.left + rect1.width / 2;
    const y1 = rect1.top - containerRect.top + rect1.height / 2;
    const x2 = rect2.left - containerRect.left + rect2.width / 2;
    const y2 = rect2.top - containerRect.top + rect2.height / 2;
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.classList.add('tree-connection-line');
    
    if (skillTreeState.weeks[3].completed) {
        line.classList.add('active');
    }
    
    svg.appendChild(line);
}

// Update Skill Tree Stats
function updateSkillTreeStats() {
    const completedCount = skillTreeState.weeks.filter(w => w.completed).length;
    const totalWeeks = skillTreeState.weeks.length;
    
    const averageScore = skillTreeState.weeks
        .filter(w => w.score !== null)
        .reduce((sum, w) => sum + w.score, 0) / (completedCount || 1);
    
    const successRate = Math.round((completedCount / totalWeeks) * 100);
    
    document.getElementById('completedNodes').textContent = `${completedCount}/${totalWeeks}`;
    document.getElementById('sprintXP').textContent = skillTreeState.totalXP;
    document.getElementById('successRate').textContent = `${successRate}%`;
}

// Handle Node Click
function handleNodeClick(node) {
    const week = parseInt(node.dataset.week);
    
    if (isNaN(week)) return; // Ignore achievement node clicks
    
    const weekData = skillTreeState.weeks[week - 1];
    
    if (weekData.unlocked && !weekData.completed) {
        // Prompt to start session
        if (confirm(`Start a practice session for ${weekData.skill}?`)) {
            startSession(week);
        }
    } else if (!weekData.unlocked) {
        alert('🔒 This week is locked. Complete previous weeks first!');
    } else {
        alert(`✅ Week ${week} is already completed with a score of ${weekData.score}/100`);
    }
}

// Start a training session
function startSession(week) {
    const weekData = skillTreeState.weeks[week - 1];
    
    // Simulate session with score input
    const userScore = prompt(`Complete the ${weekData.skill} session.\nEnter your score (0-100):`);
    
    if (userScore === null) return; // User cancelled
    
    const score = parseInt(userScore);
    
    if (isNaN(score) || score < 0 || score > 100) {
        alert('❌ Invalid score. Please enter a number between 0 and 100.');
        return;
    }
    
    processSessionResult(week, score);
}

// Process session result
function processSessionResult(week, score) {
    const weekData = skillTreeState.weeks[week - 1];
    const success = score > 80;
    
    weekData.score = score;
    
    if (success) {
        // Complete the node
        weekData.completed = true;
        
        // Unlock next week
        if (week < 4) {
            skillTreeState.weeks[week].unlocked = true;
        }
        
        // Add XP
        const xpGained = Math.round(score * 1.5);
        skillTreeState.totalXP += xpGained;
        
        // Add to history
        addSessionToHistory(week, weekData.skill, score, 'success');
        
        // Show success message
        setTimeout(() => {
            alert(`🎉 MISSION COMPLETE!\n\nWeek ${week}: ${weekData.skill}\nScore: ${score}/100\nXP Gained: +${xpGained}\n\n${week < 4 ? '✨ Next week unlocked!' : '👑 Final achievement unlocked!'}`);
        }, 100);
    } else {
        // Failed - can retry
        addSessionToHistory(week, weekData.skill, score, 'failed');
        
        setTimeout(() => {
            alert(`⚠️ MISSION FAILED\n\nWeek ${week}: ${weekData.skill}\nScore: ${score}/100\n\nYou need 81+ to unlock the next level.\nTry again!`);
        }, 100);
    }
    
    updateSkillTreeUI();
    updateSessionHistory();
}

// Add session to history
function addSessionToHistory(week, skill, score, result) {
    const timestamp = new Date().toLocaleString();
    
    skillTreeState.sessionHistory.unshift({
        week,
        skill,
        score,
        result,
        timestamp
    });
    
    // Keep only last 10 sessions
    if (skillTreeState.sessionHistory.length > 10) {
        skillTreeState.sessionHistory.pop();
    }
}

// Update session history display
function updateSessionHistory() {
    const historyList = document.getElementById('sessionHistoryList');
    
    if (skillTreeState.sessionHistory.length === 0) {
        historyList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No sessions yet. Start your first mission!</p>';
        return;
    }
    
    historyList.innerHTML = skillTreeState.sessionHistory.map(session => {
        const resultClass = session.result;
        return `
            <div class="history-item ${resultClass}">
                <div class="history-info">
                    <div class="history-week">Week ${session.week}</div>
                    <div class="history-skill">${session.skill}</div>
                    <div class="history-timestamp">${session.timestamp}</div>
                </div>
                <div class="history-score ${resultClass}">${session.score}</div>
                <div class="history-result ${resultClass}">${session.result === 'success' ? '✓ PASS' : '✗ FAIL'}</div>
            </div>
        `;
    }).join('');
}

// Simulate a random session (for demo purposes)
function simulateSession() {
    // Find first unlocked incomplete week
    const unlockedWeek = skillTreeState.weeks.find(w => w.unlocked && !w.completed);
    
    if (!unlockedWeek) {
        alert('🎯 All weeks completed! Use Reset to start over.');
        return;
    }
    
    const week = unlockedWeek.week;
    
    // Simulate random score (60-100)
    const score = Math.floor(Math.random() * 41) + 60;
    
    processSessionResult(week, score);
}

// Reset Skill Tree progress
function resetSkillTree() {
    if (!confirm('🔄 Reset all progress? This cannot be undone.')) {
        return;
    }
    
    // Reset state
    skillTreeState.weeks.forEach((week, index) => {
        week.score = null;
        week.completed = false;
        week.unlocked = index === 0; // Only first week unlocked
    });
    
    skillTreeState.finalAchievement.completed = false;
    skillTreeState.finalAchievement.unlocked = false;
    skillTreeState.sessionHistory = [];
    skillTreeState.totalXP = 0;
    
    updateSkillTreeUI();
    updateSessionHistory();
    
    alert('✅ Progress reset. Start your journey again!');
}

// Show Skill Tree when learning path is displayed
function showSkillTree() {
    const skillTreeSection = document.getElementById('skillTreeSection');
    skillTreeSection.style.display = 'block';
    
    // Initialize if first time
    if (!skillTreeSection.dataset.initialized) {
        initSkillTree();
        skillTreeSection.dataset.initialized = 'true';
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initMatrixRain();
    initRadarChart();
    
    // Attach event listener for flashcard generation
    const generateDeckBtn = document.getElementById('generateDeckBtn');
    if (generateDeckBtn) {
        generateDeckBtn.addEventListener('click', generateFlashcards);
    }
    
    console.log('%c🚀 THE FLUENCY LAB INITIALIZED', 'color: #00f5ff; font-size: 16px; font-weight: bold;');
    console.log('%c// Hack Your Communication Skills', 'color: #ff006e; font-size: 12px; font-style: italic;');
});

// ============================================
// EXAMPLE DATA FOR TESTING (Optional)
// ============================================

// Uncomment to test with example data
/*
const exampleData = {
    tone: 'professional',
    toneDescription: 'Profesional - Asertivo y seguro sin ser agresivo',
    confidenceScore: 85,
    confidenceLevel: 'Muy Alto',
    sentiment: {
        score: 5,
        comparative: 0.5,
        positive: ['propongo', 'efectivo'],
        negative: []
    },
    fillerWords: {
        found: [
            { word: 'este', count: 1 }
        ],
        count: 1
    },
    structureAnalysis: {
        sentenceCount: 3,
        avgSentenceLength: 12.5,
        complexity: 'Media',
        usesQuestions: false,
        questionCount: 0
    },
    softSkills: {
        persuasion: 85,
        technicalClarity: 78,
        empathy: 72,
        conflictResolution: 80,
        brevity: 75
    },
    advice: {
        primary: [
            '✨ Excelente comunicación. Mantén este nivel de asertividad.',
            '🌟 Tu tono es claro y respetuoso. Sigue así.',
            '📈 Para perfeccionar, varía tu vocabulario técnico cuando sea posible.'
        ],
        summary: 'Tu comunicación muestra un 85% de confianza. Continúa expresándote con claridad y asertividad.'
    },
    metrics: {
        wordCount: 45,
        sentenceCount: 3,
        avgWordsPerSentence: 15.0
    }
};

// Simulate analysis after 2 seconds
setTimeout(() => {
    displayResults(exampleData);
}, 2000);
*/

/**
 * Crisis Coach Frontend - High-Pressure Training Interface
 * Handles crisis scenarios with visual alerts and vocabulary hints
 */

const API_URL = 'http://localhost:3000/api';
let currentSession = null;
let timerInterval = null;
let hintUsedCount = 0;

// DOM Elements
const setupSection = document.getElementById('setupSection');
const crisisSection = document.getElementById('crisisSection');
const reportSection = document.getElementById('reportSection');

const userLevelSelect = document.getElementById('userLevel');
const weekNumberSelect = document.getElementById('weekNumber');
const startCrisisBtn = document.getElementById('startCrisisBtn');

const crisisAlert = document.getElementById('crisisAlert');
const timeRemainingSpan = document.getElementById('timeRemaining');
const timerProgress = document.getElementById('timerProgress');
const scenarioTitle = document.getElementById('scenarioTitle');
const scenarioDescription = document.getElementById('scenarioDescription');
const difficultyBadge = document.getElementById('difficultyBadge');
const levelBadge = document.getElementById('levelBadge');

const chatMessages = document.getElementById('chatMessages');
const userResponseInput = document.getElementById('userResponse');
const sendBtn = document.getElementById('sendBtn');
const stuckBtn = document.getElementById('stuckBtn');

const hintPanel = document.getElementById('hintPanel');
const hintTerm = document.getElementById('hintTerm');
const hintDefinition = document.getElementById('hintDefinition');
const hintExample = document.getElementById('hintExample');
const closeHintBtn = document.getElementById('closeHintBtn');

const jargonScoreSpan = document.getElementById('jargonScore');
const toneClassSpan = document.getElementById('toneClass');
const coachPatienceSpan = document.getElementById('coachPatience');

const endCrisisBtn = document.getElementById('endCrisisBtn');
const reportContent = document.getElementById('reportContent');
const finalGrade = document.getElementById('finalGrade');
const newCrisisBtn = document.getElementById('newCrisisBtn');

// Matrix Rain Effect (Background)
const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
const fontSize = 14;
const columns = canvas.width / fontSize;
const drops = Array(Math.floor(columns)).fill(1);

function drawMatrix() {
    ctx.fillStyle = 'rgba(15, 15, 30, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ff3b3b';
    ctx.font = fontSize + 'px monospace';
    
    for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(drawMatrix, 50);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Event Listeners
startCrisisBtn.addEventListener('click', startCrisisScenario);
sendBtn.addEventListener('click', sendResponse);
stuckBtn.addEventListener('click', showHint);
closeHintBtn.addEventListener('click', hideHint);
endCrisisBtn.addEventListener('click', endCrisis);
newCrisisBtn.addEventListener('click', resetToSetup);

// Allow Enter to send (Shift+Enter for new line)
userResponseInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendResponse();
    }
});

/**
 * Start Crisis Scenario
 */
async function startCrisisScenario() {
    const userLevel = userLevelSelect.value;
    const weekNumber = parseInt(weekNumberSelect.value);
    
    startCrisisBtn.disabled = true;
    startCrisisBtn.textContent = '⏳ LOADING CRISIS...';
    
    try {
        // Step 1: Get level-adapted scenario
        const scenarioResponse = await fetch(`${API_URL}/crisis/get-scenario`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_level: userLevel, week_number: weekNumber })
        });
        
        const scenarioData = await scenarioResponse.json();
        
        if (!scenarioData.success) {
            alert(scenarioData.message);
            startCrisisBtn.disabled = false;
            startCrisisBtn.innerHTML = '<span class="btn-icon">🚀</span> START CRISIS SIMULATION';
            return;
        }
        
        const scenario = scenarioData.scenario;
        
        // Step 2: Start crisis session
        const sessionResponse = await fetch(`${API_URL}/crisis/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 'demo_user',
                scenarioId: scenario.id
            })
        });
        
        const sessionData = await sessionResponse.json();
        
        if (!sessionData.success) {
            alert('Failed to start crisis session: ' + sessionData.message);
            startCrisisBtn.disabled = false;
            startCrisisBtn.innerHTML = '<span class="btn-icon">🚀</span> START CRISIS SIMULATION';
            return;
        }
        
        currentSession = {
            sessionId: sessionData.session.sessionId,
            scenario: scenario,
            startTime: Date.now(),
            duration: scenario.duration_minutes * 60 // seconds
        };
        
        // Hide setup, show crisis
        setupSection.style.display = 'none';
        crisisSection.style.display = 'block';
        
        // Populate scenario info
        scenarioTitle.textContent = scenario.title;
        scenarioDescription.textContent = scenario.description;
        difficultyBadge.textContent = scenario.difficulty.toUpperCase();
        levelBadge.textContent = scenario.adapted_for_level;
        
        // Add initial coach message
        addMessage('coach', scenario.initial_prompt);
        
        // Start timer
        startTimer();
        
        // Reset metrics
        hintUsedCount = 0;
        updateMetrics({ jargon_score: 0, tone: 'neutral', coach_patience: scenario.coach_personality.initial_patience });
        
    } catch (error) {
        console.error('Error starting crisis:', error);
        alert('Failed to connect to server. Please ensure backend is running on port 3000.');
        startCrisisBtn.disabled = false;
        startCrisisBtn.innerHTML = '<span class="btn-icon">🚀</span> START CRISIS SIMULATION';
    }
}

/**
 * Start countdown timer
 */
function startTimer() {
    const endTime = Date.now() + (currentSession.duration * 1000);
    
    timerInterval = setInterval(() => {
        const remaining = endTime - Date.now();
        
        if (remaining <= 0) {
            clearInterval(timerInterval);
            endCrisis();
            return;
        }
        
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        timeRemainingSpan.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        const percentage = (remaining / (currentSession.duration * 1000)) * 100;
        timerProgress.style.width = percentage + '%';
        
        // Change color as time runs out
        if (percentage < 30) {
            timerProgress.style.background = 'linear-gradient(90deg, #ff3b3b 0%, #ff6b6b 100%)';
        } else if (percentage < 60) {
            timerProgress.style.background = 'linear-gradient(90deg, #ffd93d 0%, #ffb347 100%)';
        }
    }, 1000);
}

/**
 * Send user response to crisis coach
 */
async function sendResponse() {
    const message = userResponseInput.value.trim();
    
    if (!message) {
        return;
    }
    
    // Disable input while processing
    userResponseInput.disabled = true;
    sendBtn.disabled = true;
    
    // Add user message to chat
    addMessage('user', message);
    
    // Clear input
    userResponseInput.value = '';
    
    try {
        const response = await fetch(`${API_URL}/crisis/respond`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: currentSession.sessionId,
                message: message
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Check if session auto-completed (time limit)
            if (data.session_completed) {
                clearInterval(timerInterval);
                showReport(data.crisis_report);
                return;
            }
            
            // Add coach response
            addMessage('coach', data.response.coachMessage);
            
            // Update metrics
            updateMetrics({
                jargon_score: data.response.metrics.jargon_score,
                tone: data.response.metrics.tone,
                coach_patience: data.response.metrics.coach_patience
            });
            
            // Show pressure level feedback
            if (data.response.pressure_level === 'extreme') {
                addMessage('system', '🔥 EXTREME PRESSURE! Coach is very impatient!');
            } else if (data.response.pressure_level === 'high') {
                addMessage('system', '⚡ HIGH PRESSURE! Speed up and be more specific!');
            }
        } else {
            addMessage('system', '❌ Error: ' + data.message);
        }
        
    } catch (error) {
        console.error('Error sending response:', error);
        addMessage('system', '❌ Failed to send response. Check server connection.');
    } finally {
        userResponseInput.disabled = false;
        sendBtn.disabled = false;
        userResponseInput.focus();
    }
}

/**
 * Show vocabulary hint
 */
function showHint() {
    if (!currentSession) return;
    
    hintUsedCount++;
    
    // Get random jargon term from current scenario
    const targetJargon = currentSession.scenario.target_jargon;
    const randomTerm = targetJargon[Math.floor(Math.random() * targetJargon.length)];
    
    // Get hint data for the term
    const hintData = getHintForTerm(randomTerm);
    
    hintTerm.textContent = hintData.term;
    hintDefinition.textContent = hintData.definition;
    hintExample.textContent = hintData.example;
    
    hintPanel.style.display = 'block';
    
    // Add system message
    addMessage('system', `💡 Hint used (${hintUsedCount}): Try using "${randomTerm}" in your response!`);
}

/**
 * Hide hint panel
 */
function hideHint() {
    hintPanel.style.display = 'none';
}

/**
 * Get hint information for a technical term
 */
function getHintForTerm(term) {
    const hints = {
        'bottleneck': {
            term: 'bottleneck',
            definition: 'A point of congestion in a system that limits overall performance or capacity.',
            example: '"We\'ve identified a bottleneck in the database connection pool causing slow response times."'
        },
        'rollback': {
            term: 'rollback',
            definition: 'Reverting to a previous stable version of software or database state.',
            example: '"We\'re implementing a rollback to version 2.3.1 to restore service immediately."'
        },
        'root cause': {
            term: 'root cause',
            definition: 'The fundamental reason or underlying issue that led to a problem.',
            example: '"The root cause was a memory leak in the worker process that accumulated over 48 hours."'
        },
        'postmortem': {
            term: 'postmortem / post-mortem',
            definition: 'A detailed analysis conducted after an incident to understand what happened and prevent recurrence.',
            example: '"We\'ll have a full post-mortem by EOD with timeline, root cause, and preventive measures."'
        },
        'triage': {
            term: 'triage',
            definition: 'The process of prioritizing and assessing issues to determine which require immediate attention.',
            example: '"We\'re currently triaging the issue to identify critical vs. non-critical components."'
        },
        'mitigation': {
            term: 'mitigation',
            definition: 'Actions taken to reduce the severity or impact of a problem.',
            example: '"Mitigation strategies include enabling cache and scaling up server capacity."'
        },
        'SLA': {
            term: 'SLA (Service Level Agreement)',
            definition: 'A commitment between service provider and client defining expected service levels and response times.',
            example: '"This outage violates our 99.9% uptime SLA, so we\'ll provide service credits."'
        },
        'ETA': {
            term: 'ETA (Estimated Time of Arrival)',
            definition: 'Expected time when something will be completed or arrive.',
            example: '"ETA for full service restoration is 15 minutes based on current progress."'
        },
        'MVP': {
            term: 'MVP (Minimum Viable Product)',
            definition: 'A product with just enough features to be usable by early customers for validation.',
            example: '"Our MVP already has 5,000 active users and proven product-market fit."'
        },
        'scalability': {
            term: 'scalability',
            definition: 'The ability of a system to handle increased load by adding resources.',
            example: '"Our architecture supports 10x scalability with horizontal scaling capabilities."'
        },
        'KPI': {
            term: 'KPI (Key Performance Indicator)',
            definition: 'Measurable values that demonstrate how effectively objectives are being achieved.',
            example: '"Our primary KPI is 40% month-over-month user growth with 85% retention."'
        }
    };
    
    return hints[term] || {
        term: term,
        definition: 'A technical term commonly used in IT and business contexts.',
        example: `"We need to address the ${term} to move forward with the solution."`
    };
}

/**
 * Update crisis metrics display
 */
function updateMetrics(metrics) {
    jargonScoreSpan.textContent = `${metrics.jargon_score.toFixed(1)}/10`;
    
    toneClassSpan.textContent = metrics.tone.charAt(0).toUpperCase() + metrics.tone.slice(1);
    toneClassSpan.className = 'metric-value tone-' + metrics.tone;
    
    coachPatienceSpan.textContent = `${metrics.coach_patience.toFixed(1)}/10`;
}

/**
 * Add message to chat
 */
function addMessage(type, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    let headerText = '';
    if (type === 'coach') headerText = '🚨 Crisis Coach';
    else if (type === 'user') headerText = '👤 You';
    else if (type === 'system') headerText = '⚙️ System';
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <span>${headerText}</span>
            <span class="message-time">${timeStr}</span>
        </div>
        <div class="message-content">${content}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * End crisis and get audit report
 */
async function endCrisis() {
    if (!currentSession) return;
    
    clearInterval(timerInterval);
    
    endCrisisBtn.disabled = true;
    endCrisisBtn.textContent = '⏳ GENERATING REPORT...';
    
    try {
        const response = await fetch(`${API_URL}/crisis/end`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: currentSession.sessionId
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showReport(data.result.crisis_report);
        } else {
            alert('Failed to generate report: ' + data.message);
        }
        
    } catch (error) {
        console.error('Error ending crisis:', error);
        alert('Failed to generate report. Check server connection.');
    }
}

/**
 * Display crisis audit report
 */
function showReport(report) {
    crisisSection.style.display = 'none';
    reportSection.style.display = 'block';
    
    finalGrade.textContent = report.overall.grade;
    
    // Color-code grade
    if (report.overall.grade === 'A') {
        finalGrade.style.color = '#6bcf7f';
        finalGrade.style.borderColor = '#6bcf7f';
    } else if (report.overall.grade === 'B') {
        finalGrade.style.color = '#ffd93d';
        finalGrade.style.borderColor = '#ffd93d';
    } else if (report.overall.grade === 'C' || report.overall.grade === 'D') {
        finalGrade.style.color = '#ffb347';
        finalGrade.style.borderColor = '#ffb347';
    } else {
        finalGrade.style.color = '#ff3b3b';
        finalGrade.style.borderColor = '#ff3b3b';
    }
    
    // Generate report HTML
    let reportHTML = `
        <div style="margin-bottom: 30px;">
            <h3 style="color: #ff6b6b; margin-bottom: 15px;">📊 Overall Performance</h3>
            <p><strong>Score:</strong> ${report.overall.score}/100</p>
            <p><strong>Grade:</strong> ${report.overall.grade}</p>
            <p><strong>Readiness:</strong> ${report.overall.readiness}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
            <h3 style="color: #ff6b6b; margin-bottom: 15px;">🔑 Jargon Accuracy</h3>
            <p><strong>Score:</strong> ${report.jargon_audit.score}/10</p>
            <p><strong>Rating:</strong> ${report.jargon_audit.rating}</p>
            <p><strong>Terms Used:</strong> ${report.jargon_audit.terms_used.join(', ') || 'None'}</p>
            <p><strong>Coverage:</strong> ${report.jargon_audit.coverage_percentage}%</p>
            <p><em>${report.jargon_audit.feedback}</em></p>
        </div>
        
        <div style="margin-bottom: 30px;">
            <h3 style="color: #ff6b6b; margin-bottom: 15px;">💬 Tone Analysis</h3>
            <p><strong>Classification:</strong> ${report.tone_audit.classification.toUpperCase()}</p>
            <p><strong>Rating:</strong> ${report.tone_audit.rating}</p>
            <p><strong>Signals:</strong> Resolutive: ${report.tone_audit.resolutive_count}, Defensive: ${report.tone_audit.defensive_count}, Vague: ${report.tone_audit.vague_count}</p>
            <p><em>${report.tone_audit.feedback}</em></p>
        </div>
        
        <div style="margin-bottom: 30px;">
            <h3 style="color: #ff6b6b; margin-bottom: 15px;">⚡ Performance Under Pressure</h3>
            <p><strong>Pressure Resistance:</strong> ${report.performance.pressure_resistance}/10</p>
            <p><strong>Avg Response Time:</strong> ${report.performance.avg_response_time}s</p>
            <p><strong>Rating:</strong> ${report.performance.rating}</p>
            <p><strong>Hints Used:</strong> ${hintUsedCount}</p>
        </div>
        
        <div style="background: rgba(255, 217, 61, 0.1); padding: 20px; border-radius: 8px; border: 2px solid #ffd93d; margin-bottom: 30px;">
            <h3 style="color: #ffd93d; margin-bottom: 15px;">✨ The Diplomatic Fix</h3>
            <p style="font-size: 1.1rem; font-weight: bold; margin-bottom: 10px;">"${report.diplomatic_fix.template}"</p>
            <p><em>${report.diplomatic_fix.explanation}</em></p>
            <div style="margin-top: 15px;">
                ${report.diplomatic_fix.key_elements.map(el => `<p>${el}</p>`).join('')}
            </div>
        </div>
        
        <div>
            <h3 style="color: #ff6b6b; margin-bottom: 15px;">🎯 Recommendations</h3>
            ${report.overall.recommendations.map(rec => `
                <div style="background: rgba(255, 59, 59, 0.1); padding: 15px; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid #ff3b3b;">
                    <p><strong>${rec.category}</strong> [${rec.priority.toUpperCase()}]</p>
                    <p><strong>Action:</strong> ${rec.action}</p>
                    <p><strong>Why:</strong> ${rec.reason}</p>
                </div>
            `).join('')}
        </div>
    `;
    
    reportContent.innerHTML = reportHTML;
}

/**
 * Reset to setup screen for new crisis
 */
function resetToSetup() {
    reportSection.style.display = 'none';
    setupSection.style.display = 'block';
    
    // Reset UI
    chatMessages.innerHTML = '';
    userResponseInput.value = '';
    hintPanel.style.display = 'none';
    
    startCrisisBtn.disabled = false;
    startCrisisBtn.innerHTML = '<span class="btn-icon">🚀</span> START CRISIS SIMULATION';
    
    currentSession = null;
    hintUsedCount = 0;
}

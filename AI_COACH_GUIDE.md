# 🎯 AI COACH - Interactive 10-Minute Sessions Guide

**The Fluency Lab - Your Personal English Coach for IT Professionals**

---

## 📋 OVERVIEW

The **AI Coach** is an interactive conversational system that guides IT professionals through focused 10-minute practice sessions. It adapts to your English level (B1-C2) and provides real-time feedback, error detection, and a comprehensive Flash Report at the end.

### Key Features

✅ **Level-Adaptive Coaching** (B1, B2, C1, C2)
- B1: Focus on connectors and structure
- B2: Technical vocabulary and accuracy
- C1: Business impact and strategic thinking
- C2: Executive communication and leadership

✅ **Real-Time Error Detection**
- Grammar mistakes (articles, prepositions, tenses)
- Pronunciation errors (IT-specific terms)
- Vocabulary improvements

✅ **Structured 10-Minute Format**
- Welcome (30 seconds): Introduction and context setting
- Interaction (7 minutes): Guided conversation with prompts
- Closing (2.5 minutes): Flash Report with actionable feedback

✅ **Flash Report Includes:**
- **Grammar Fix**: Most important correction
- **Pronunciation Check**: IT terms to practice
- **Power Move**: Senior-level phrase upgrade
- **Confidence Score**: 1-10 rating

---

## 🎓 SESSION TOPICS

### 1. The Effective Daily Stand-up
**Level:** B1-C2  
**Focus:** Concise updates using technical vocabulary  
**Skills:** Speaking, clarity, time management

### 2. Professional Code Review Discussion
**Level:** B2-C2  
**Focus:** Constructive feedback and diplomatic language  
**Skills:** Critical thinking, collaboration

### 3. Technical Presentation Skills
**Level:** B2-C2  
**Focus:** Presenting complex ideas clearly  
**Skills:** Public speaking, simplification, engagement

### 4. Incident Reporting
**Level:** B1-C2  
**Focus:** Clear communication under pressure  
**Skills:** Crisis communication, action-oriented language

### 5. Client-Facing Technical Discussion
**Level:** C1-C2  
**Focus:** Explaining tech to non-technical stakeholders  
**Skills:** Simplification, business language, confidence

### 6. Team Leadership Communication
**Level:** C1-C2  
**Focus:** Leading with clear, motivating language  
**Skills:** Leadership, strategic thinking

---

## 🔌 API REFERENCE

### Base URL
```
http://localhost:3000/api/coach
```

### Authentication
All endpoints require JWT authentication:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📡 ENDPOINTS

### 1. Start Session

**POST** `/api/coach/start-session`

Start a new 10-minute coaching session.

**Request Body:**
```json
{
  "userLevel": "B1",
  "sessionTopic": "The Effective Daily Stand-up"
}
```

**Parameters:**
- `userLevel` (optional): "B1", "B2", "C1", or "C2". Defaults to user's profile level.
- `sessionTopic` (optional): Topic name. Defaults to "The Effective Daily Stand-up"

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session-user123-1703001234567",
    "message": "Good to see you here! I'm your AI Coach for today's The Effective Daily Stand-up session.\n\nWe've got 10 minutes together, so let's make them productive.\n\n**Here's what I need from you:**\nTell me briefly what you're working on today. Use technical terms—don't hold back. I want to hear about your current task, project, or challenge.\n\nWhat are you tackling today?",
    "phase": "welcome",
    "timeRemaining": 600
  }
}
```

---

### 2. Send Response

**POST** `/api/coach/respond`

Send your message and get coach's response.

**Request Body:**
```json
{
  "sessionId": "session-user123-1703001234567",
  "message": "I'm working on the authentication system. I need to fix a bug in the login page."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session-user123-1703001234567",
    "message": "Got it! Now, can you explain the steps? Start with \"First...\" then use \"Then...\" and \"Finally...\"\n\nWhat are the steps to fix this bug?",
    "phase": "interaction",
    "timeRemaining": 585,
    "detectedErrorsCount": {
      "pronunciation": 0,
      "grammar": 1,
      "vocabulary": 0,
      "total": 1
    },
    "isComplete": false
  }
}
```

**Phase Values:**
- `welcome`: First 30 seconds
- `interaction`: Main conversation (7 minutes)
- `closing`: Final 2.5 minutes with Flash Report

---

### 3. Get Session Info

**GET** `/api/coach/session/:sessionId`

Retrieve current session status.

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session-user123-1703001234567",
    "userId": "user123",
    "userLevel": "B1",
    "sessionTopic": "The Effective Daily Stand-up",
    "phase": "interaction",
    "messageCount": 6,
    "timeRemaining": 400,
    "errorCount": {
      "pronunciation": 2,
      "grammar": 1,
      "vocabulary": 0,
      "total": 3
    }
  }
}
```

---

### 4. End Session

**POST** `/api/coach/end-session`

Manually end session and get Flash Report.

**Request Body:**
```json
{
  "sessionId": "session-user123-1703001234567"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session-user123-1703001234567",
    "flashReport": "## 🎯 FLASH REPORT - The Effective Daily Stand-up\n\nTime spent: 8 minutes\n\n---\n\n### 📚 GRAMMAR FIX\n**Issue:** Missing article: use \"working on A system\" or \"working on THE system\"\n**Fix:** Missing article: \"working on A system\" or \"working on THE system\"\n**Example:** \"I'm working on the authentication system\"\n\n### 🗣️ PRONUNCIATION CHECK\nWatch out for these IT terms:\n- **library** (/correct pronunciation/)\n- **header** (/correct pronunciation/)\n\n### 💪 POWER MOVE (Senior-Level Upgrade)\n**Instead of:** \"I am working on\"\n**Level up to:** \"I'm currently driving\"\n\n*This makes you sound more executive-level and confident.*\n\n### 🎪 CONFIDENCE SCORE\n**7/10** - Solid performance! A few tweaks and you'll be at senior level consistently.\n\n---\n\n**Next steps:** Practice the Power Move in your next standup. Book another session tomorrow!\n\nRemember: **You're not just a coder. You're a technical leader.** 🚀",
    "sessionData": {
      "duration": 480,
      "messageCount": 8,
      "errorCount": {
        "pronunciation": 2,
        "grammar": 1,
        "vocabulary": 0,
        "total": 3
      },
      "confidenceScore": 7
    }
  }
}
```

---

### 5. Get Available Topics

**GET** `/api/coach/topics`

Retrieve all available coaching topics.

**Response:**
```json
{
  "success": true,
  "data": {
    "topics": [
      {
        "id": "daily-standup",
        "title": "The Effective Daily Stand-up",
        "description": "Master the art of concise, impactful daily updates",
        "duration": 10,
        "levels": ["B1", "B2", "C1", "C2"],
        "skills": ["Speaking", "Technical vocabulary", "Conciseness"]
      }
    ],
    "totalTopics": 6
  }
}
```

---

### 6. Get Demo Conversation

**GET** `/api/coach/demo`

View a complete demo conversation (no auth required).

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "topic": "The Effective Daily Stand-up",
      "level": "B1",
      "duration": "10 minutes"
    },
    "conversation": [
      {
        "role": "coach",
        "message": "Good to see you here!...",
        "timestamp": "0:00"
      }
    ],
    "flashReport": {
      "grammarFix": "Use articles: \"THE authentication system\"",
      "powerMove": "Instead of \"I am working on\" → \"I'm currently driving\"",
      "confidenceScore": 7
    }
  }
}
```

---

## 🧪 TESTING GUIDE

### Step 1: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@fluencylab.com",
    "password": "FluencyLab2024!"
  }'
```

Save the JWT token.

---

### Step 2: Start Session

```bash
curl -X POST http://localhost:3000/api/coach/start-session \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userLevel": "B1",
    "sessionTopic": "The Effective Daily Stand-up"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session-abc123...",
    "message": "Good to see you here! I'm your AI Coach...",
    "phase": "welcome",
    "timeRemaining": 600
  }
}
```

Save the `sessionId`.

---

### Step 3: Send First Response

```bash
curl -X POST http://localhost:3000/api/coach/respond \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-abc123...",
    "message": "I am working on authentication system. I need to fix bug in login page."
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Got it! Now, can you explain the steps?...",
    "phase": "interaction",
    "detectedErrorsCount": {
      "grammar": 1,
      "total": 1
    }
  }
}
```

---

### Step 4: Continue Conversation

```bash
curl -X POST http://localhost:3000/api/coach/respond \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-abc123...",
    "message": "First, I check database connection. Then, I verify user credentials. Finally, I test login functionality."
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Excellent structure! Your explanation is very clear...",
    "phase": "interaction",
    "timeRemaining": 550
  }
}
```

---

### Step 5: End Session & Get Flash Report

After ~10 minutes or when ready:

```bash
curl -X POST http://localhost:3000/api/coach/end-session \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-abc123..."
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "flashReport": "## 🎯 FLASH REPORT...",
    "sessionData": {
      "duration": 600,
      "confidenceScore": 7
    }
  }
}
```

---

## 🎨 FRONTEND INTEGRATION

### Chat Interface Component

```javascript
// AI Coach Chat Component

let sessionId = null;
let timeRemaining = 600;

// Start session
async function startCoachSession(level = 'B1', topic = null) {
  const token = localStorage.getItem('jwt_token');
  
  const response = await fetch('http://localhost:3000/api/coach/start-session', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userLevel: level,
      sessionTopic: topic
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    sessionId = result.data.sessionId;
    timeRemaining = result.data.timeRemaining;
    
    // Display coach message
    displayMessage('coach', result.data.message);
    
    // Start timer
    startTimer();
  }
}

// Send message to coach
async function sendMessage(message) {
  const token = localStorage.getItem('jwt_token');
  
  // Display user message
  displayMessage('user', message);
  
  const response = await fetch('http://localhost:3000/api/coach/respond', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sessionId: sessionId,
      message: message
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    timeRemaining = result.data.timeRemaining;
    
    // Display coach response
    displayMessage('coach', result.data.message);
    
    // Show error count
    if (result.data.detectedErrorsCount.total > 0) {
      showErrorBadge(result.data.detectedErrorsCount.total);
    }
    
    // Check if session complete
    if (result.data.isComplete) {
      showFlashReport(result.data.message);
    }
  }
}

// Display message in chat
function displayMessage(role, content) {
  const chatContainer = document.getElementById('chatMessages');
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;
  
  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = role === 'coach' ? '🎯' : '👤';
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'content';
  contentDiv.innerHTML = markdownToHTML(content);
  
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(contentDiv);
  
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Timer display
function startTimer() {
  const timerInterval = setInterval(() => {
    timeRemaining--;
    
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    
    document.getElementById('timer').textContent = 
      `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      endSession();
    }
  }, 1000);
}

// End session
async function endSession() {
  const token = localStorage.getItem('jwt_token');
  
  const response = await fetch('http://localhost:3000/api/coach/end-session', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sessionId: sessionId
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    showFlashReport(result.data.flashReport);
  }
}

// Show Flash Report modal
function showFlashReport(reportMarkdown) {
  const modal = document.getElementById('flashReportModal');
  const content = document.getElementById('flashReportContent');
  
  content.innerHTML = markdownToHTML(reportMarkdown);
  modal.style.display = 'block';
}

// Event listeners
document.getElementById('startSessionBtn').addEventListener('click', () => {
  const level = document.getElementById('levelSelect').value;
  startCoachSession(level);
});

document.getElementById('sendBtn').addEventListener('click', () => {
  const input = document.getElementById('messageInput');
  const message = input.value.trim();
  
  if (message) {
    sendMessage(message);
    input.value = '';
  }
});
```

---

### HTML Structure

```html
<div class="coach-container">
  <!-- Header -->
  <div class="coach-header">
    <h2>🎯 AI Coach Session</h2>
    <div class="timer" id="timer">10:00</div>
    <div class="level-badge" id="levelBadge">B1</div>
  </div>
  
  <!-- Chat Messages -->
  <div class="chat-messages" id="chatMessages">
    <!-- Messages appear here -->
  </div>
  
  <!-- Input Area -->
  <div class="input-area">
    <textarea 
      id="messageInput" 
      placeholder="Type your response in English..."
      rows="3"
    ></textarea>
    <button id="sendBtn" class="btn-primary">
      Send Message
    </button>
  </div>
  
  <!-- Error Badge -->
  <div class="error-badge" id="errorBadge" style="display: none;">
    <span id="errorCount">0</span> errors detected
  </div>
</div>

<!-- Flash Report Modal -->
<div id="flashReportModal" class="modal">
  <div class="modal-content">
    <span class="close">&times;</span>
    <div id="flashReportContent"></div>
    <button class="btn-primary" onclick="closeReport()">
      Start New Session
    </button>
  </div>
</div>
```

---

### CSS Styling

```css
.coach-container {
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
}

.coach-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timer {
  font-size: 24px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.level-badge {
  background: rgba(255,255,255,0.2);
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: bold;
}

.chat-messages {
  height: 500px;
  overflow-y: auto;
  padding: 20px;
  background: #f5f5f5;
}

.message {
  display: flex;
  margin-bottom: 20px;
  animation: fadeIn 0.3s;
}

.message.coach {
  justify-content: flex-start;
}

.message.user {
  justify-content: flex-end;
}

.message .avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin: 0 10px;
}

.message.coach .avatar {
  background: #667eea;
}

.message.user .avatar {
  background: #48bb78;
}

.message .content {
  max-width: 70%;
  padding: 15px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.message.coach .content {
  border-bottom-left-radius: 4px;
}

.message.user .content {
  border-bottom-right-radius: 4px;
  background: #667eea;
  color: white;
}

.input-area {
  padding: 20px;
  background: white;
  border-top: 1px solid #e0e0e0;
}

.input-area textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  resize: none;
}

.input-area button {
  margin-top: 10px;
  width: 100%;
}

.error-badge {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #f56565;
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  animation: pulse 2s infinite;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

---

## 📊 ERROR DETECTION SYSTEM

### Grammar Errors Detected

| Error Type | Pattern | Example |
|------------|---------|---------|
| Missing Articles | "working on system" | ✅ "working on THE system" |
| Wrong Prepositions | "responsible of" | ✅ "responsible FOR" |
| Wrong Verbs | "make a meeting" | ✅ "HOLD a meeting" |
| Tense Errors | "yesterday I have fixed" | ✅ "yesterday I fixed" |
| Countable Errors | "informations" | ✅ "information" |

### Pronunciation Errors (IT Terms)

- library, header, integer, algorithm, cache
- SQL, GUI, enum, boolean, tuple
- deploy, compile, debug, iterate
- hierarchy, strategic, architecture

---

## 💪 POWER PHRASES

Transform basic language into senior-level communication:

| Basic | Power Move |
|-------|-----------|
| I am working on | I'm currently driving |
| I need to do | I'm prioritizing |
| I think | In my assessment |
| We have a problem | We're facing a challenge |
| I don't know | I'll need to investigate |
| I fixed | I resolved |
| Good | Solid |
| Fast | Performant |

---

## 🎯 BEST PRACTICES

### Do's ✅

1. **Be specific with technical terms**
   - Use actual framework names, tools, technologies
   - Don't simplify unnecessarily

2. **Respond naturally**
   - Don't try to be perfect
   - The coach detects errors to help you improve

3. **Use the full 10 minutes**
   - Engage deeply with prompts
   - Ask for clarification if needed

4. **Practice the Flash Report items**
   - Implement grammar fixes immediately
   - Use Power Phrases in real meetings

5. **Do daily sessions**
   - Consistency builds fluency
   - Try different topics each day

### Don'ts ❌

1. **Don't rush**
   - Take time to construct thoughtful responses

2. **Don't use a dictionary during session**
   - Practice spontaneous communication

3. **Don't ignore the level prompts**
   - B1: Use connectors
   - C1: Think business impact

4. **Don't copy-paste pre-written text**
   - Real-time thinking builds fluency

---

## 📈 PROGRESS TRACKING

Track your improvement over time:

```javascript
// Store session results
const sessionHistory = [];

function saveSessionResult(sessionData) {
  sessionHistory.push({
    date: new Date().toISOString(),
    topic: sessionData.topic,
    level: sessionData.level,
    confidenceScore: sessionData.confidenceScore,
    errorCount: sessionData.errorCount,
    duration: sessionData.duration
  });
  
  localStorage.setItem('coachSessions', JSON.stringify(sessionHistory));
}

// Calculate average confidence score
function getAverageConfidence() {
  const scores = sessionHistory.map(s => s.confidenceScore);
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

// Track improvement
function getImprovement() {
  if (sessionHistory.length < 2) return 0;
  
  const recent = sessionHistory.slice(-5);
  const old = sessionHistory.slice(0, 5);
  
  const recentAvg = recent.reduce((sum, s) => sum + s.confidenceScore, 0) / recent.length;
  const oldAvg = old.reduce((sum, s) => sum + s.confidenceScore, 0) / old.length;
  
  return recentAvg - oldAvg;
}
```

---

## 🚀 QUICK START

### 1. Login
```bash
POST /api/auth/login
```

### 2. Start Session
```bash
POST /api/coach/start-session
```

### 3. Engage (7-8 minutes)
```bash
POST /api/coach/respond (multiple times)
```

### 4. Get Flash Report
```bash
POST /api/coach/end-session
```

### 5. Practice & Repeat Daily

---

**Remember: You're not just a coder. You're a technical leader.** 🚀

# 🚨 Crisis Coach - High-Pressure Business Scenarios

## Overview

The **Crisis Coach** is designed to push you to your limit. Unlike the regular AI Coach, this system simulates **high-pressure business crises** where every second counts and every word matters. The AI coach is **impatient, demanding, and unforgiving** - just like real stakeholders in crisis situations.

### What Makes Crisis Coach Different?

| Feature | Regular AI Coach | Crisis Coach |
|---------|-----------------|--------------|
| **Personality** | Supportive, encouraging | Impatient, demanding |
| **Pressure Level** | Medium | EXTREME |
| **Time Limit** | 10 minutes (relaxed) | 10 minutes (intense countdown) |
| **Interruptions** | Rare | Frequent |
| **Feedback Tone** | Constructive | Brutally honest |
| **Real-World Simulation** | Practice conversations | Crisis management |

---

## 🎯 Crisis Scenarios

### 1. The Production Outage 🔥
**Difficulty:** High  
**Duration:** 10 minutes

**Setup:**
```
The main database is down. It's peak hours - customers are reporting errors.
The CEO is on the Slack channel asking for updates. What do you say?
```

**Context:**
- **Stakeholders:** CEO, CTO, Engineering Team, Customer Support
- **Time Pressure:** Customers are reporting errors, revenue at risk
- **Expected Actions:** Acknowledge issue, provide timeline, outline steps, stay calm

**Target Jargon (21 terms):**
- `bottleneck`, `rollback`, `root cause`, `postmortem`, `post-mortem`
- `triage`, `incident`, `mitigation`, `downtime`, `degradation`
- `failover`, `backup`, `restore`, `RCA`, `SLA`, `escalate`
- `hotfix`, `patch`, `monitoring`, `alert`, `troubleshoot`

**Diplomatic Fix:**
> "We are currently triaging the issue and expect a full post-mortem by EOD. The team has identified potential root causes and is implementing mitigation strategies to restore service."

---

### 2. The Investor Pitch Crisis 💼
**Difficulty:** Extreme  
**Duration:** 10 minutes

**Setup:**
```
Your product demo just crashed during a Series A pitch. The lead investor
is waiting. How do you recover?
```

**Context:**
- **Stakeholders:** Lead Investor, Investment Committee, Your CEO
- **Time Pressure:** Investors are losing confidence in real-time
- **Expected Actions:** Pivot smoothly, show backup plan, maintain confidence

**Target Jargon (15 terms):**
- `MVP`, `scalability`, `architecture`, `redundancy`, `failsafe`
- `revenue`, `growth`, `metrics`, `KPI`, `conversion`, `retention`
- `roadmap`, `milestone`, `deliverable`, `sprint`, `iteration`

**Diplomatic Fix:**
> "While the live demo encountered a technical issue, let me walk you through our proven results with live customer data. Our metrics show 40% month-over-month growth, and I can provide a detailed technical architecture review."

---

### 3. The Angry Client Escalation 😡
**Difficulty:** High  
**Duration:** 10 minutes

**Setup:**
```
A major client threatens to cancel their $100K contract due to repeated bugs.
They want answers NOW.
```

**Context:**
- **Stakeholders:** Client VP, Their Engineering Team, Your Sales Team
- **Time Pressure:** Contract cancellation deadline in 24 hours
- **Expected Actions:** Acknowledge pain, show empathy, provide concrete plan

**Target Jargon (12 terms):**
- `SLA`, `uptime`, `compensation`, `service credit`, `priority support`
- `dedicated team`, `account manager`, `escalation path`, `resolution`
- `preventive measures`, `quality assurance`, `testing protocol`

**Diplomatic Fix:**
> "I completely understand your frustration, and this is unacceptable. I'm assigning a dedicated team to resolve this today, and we'll provide service credits plus 3 months of priority support. You have my direct line for any issues."

---

## 📊 How You're Evaluated

### 1. Jargon Accuracy (0-10 score)

**What we measure:**
- How many technical terms from the target list did you use?
- Did you use them correctly and naturally?
- Coverage percentage (terms used / target terms)

**Rating Scale:**
- **8-10:** "Excellent - Technical Expert"
- **6-7:** "Good - Competent Professional"
- **4-5:** "Fair - Needs Improvement"
- **0-3:** "Weak - Too Casual"

**Examples:**

❌ **Bad:** "The thing broke and we're fixing it."

✅ **Good:** "We've identified a bottleneck in the database layer. The team is implementing a rollback to the previous stable version while we conduct root cause analysis."

---

### 2. Tone Analysis

**Classifications:**
1. **Resolutive** 🌟 (BEST)
   - Solution-focused
   - Takes ownership
   - Action-oriented
   - Provides timelines

2. **Neutral** 😐 (OK)
   - Balanced
   - Professional
   - Lacks urgency

3. **Vague** 😕 (WEAK)
   - Too ambiguous
   - No specifics
   - Generic responses

4. **Defensive** ❌ (WORST)
   - Blame-shifting
   - Makes excuses
   - Avoids responsibility

**Positive Phrases (Use These!):**
- "We are investigating"
- "Timeline is"
- "Root cause identified"
- "Implementing solution"
- "ETA: X minutes"
- "Team is working on"
- "Backup plan ready"

**Negative Phrases (NEVER Use!):**
- "It's not my fault"
- "Someone else deployed"
- "I don't know"
- "Maybe it's..."
- "Probably..."
- "Can't do anything"
- "Too late"
- "Give up"

---

### 3. Pressure Resistance (0-10 score)

**What we measure:**
- Response speed (faster = better)
- Quality maintained under pressure
- Composure (no panic language)
- Decisiveness (clear action steps)

**Factors:**
- **Response Time:** < 10 seconds = excellent, > 20 seconds = poor
- **Quality Score:** Based on jargon + tone + specificity
- **Coach Patience Level:** How much you frustrated the coach
- **Interruption Handling:** Did you stay calm when interrupted?

**Rating Scale:**
- **8-10:** "Elite - Thrives Under Pressure"
- **6-7:** "Strong - Handles Pressure Well"
- **4-5:** "Moderate - Struggles Under Pressure"
- **0-3:** "Weak - Cracks Under Pressure"

---

## 🎮 How to Use Crisis Coach

### Step 1: Start a Crisis Session

**Endpoint:** `POST /api/crisis/start`

**Request:**
```json
{
  "userId": "user123",
  "scenarioId": "production_outage"
}
```

**Response:**
```json
{
  "success": true,
  "session": {
    "sessionId": "crisis_user123_1735059600000",
    "scenario": {
      "id": "production_outage",
      "title": "The Production Outage",
      "description": "The main database is down...",
      "difficulty": "high",
      "duration_minutes": 10
    },
    "message": "🚨 CRISIS SCENARIO: The Production Outage\n\nThe main database is down...",
    "timeRemaining": 600
  }
}
```

---

### Step 2: Respond to the Crisis

**Endpoint:** `POST /api/crisis/respond`

**Request:**
```json
{
  "sessionId": "crisis_user123_1735059600000",
  "message": "We are currently triaging the issue. The team has identified a bottleneck in the database connection pool. We're implementing a rollback to the previous version, ETA 15 minutes."
}
```

**Response:**
```json
{
  "success": true,
  "response": {
    "sessionId": "crisis_user123_1735059600000",
    "coachMessage": "Perfect! That's exactly what stakeholders need to hear!",
    "feedback": ["Strong crisis communication!"],
    "pressure_level": "low",
    "timeRemaining": 580,
    "metrics": {
      "jargon_score": 7.5,
      "tone": "resolutive",
      "coach_patience": 8.2
    }
  }
}
```

**Impatient Coach Responses (Examples):**

🔥 **If you're too slow:**
> "Come on, faster! The CEO is waiting!"

🔥 **If you're vague:**
> "That's too vague! Give me specifics! What EXACTLY are you doing?!"

🔥 **If you're defensive:**
> "Don't get defensive! Take ownership of the situation!"

🔥 **If you lack jargon:**
> "Use technical terms! Show you understand the problem! Say 'rollback' or 'root cause'!"

---

### Step 3: End Session & Get Audit Report

**Endpoint:** `POST /api/crisis/end`

**Request:**
```json
{
  "sessionId": "crisis_user123_1735059600000"
}
```

**Response (Crisis Audit Report):**
```json
{
  "success": true,
  "result": {
    "session_completed": true,
    "sessionId": "crisis_user123_1735059600000",
    "duration_seconds": 600,
    "crisis_report": {
      "scenario": "The Production Outage",
      "duration_seconds": 600,
      "total_exchanges": 12,
      
      "jargon_audit": {
        "score": 8.5,
        "rating": "Excellent - Technical Expert",
        "terms_used": ["bottleneck", "rollback", "root cause", "triage", "ETA"],
        "terms_count": 5,
        "coverage_percentage": 24,
        "missing_terms": ["postmortem", "failover", "SLA", "hotfix"],
        "feedback": "Outstanding technical vocabulary! You used 5 key terms effectively..."
      },
      
      "tone_audit": {
        "classification": "resolutive",
        "rating": "Excellent - Solution-Focused Leader",
        "signals": {
          "defensive": 0,
          "resolutive": 8,
          "vague": 1,
          "specific": 7
        },
        "feedback": "Perfect crisis tone! You took ownership, provided solutions..."
      },
      
      "performance": {
        "avg_response_time": 8.5,
        "pressure_resistance": 8.7,
        "interruption_count": 3,
        "final_coach_patience": 7.5,
        "rating": "Elite - Thrives Under Pressure"
      },
      
      "diplomatic_fix": {
        "template": "We are currently triaging the issue and expect a full post-mortem by EOD...",
        "explanation": "This response combines technical accuracy, ownership, timeline clarity...",
        "key_elements": [
          "✅ Technical jargon (triaging, post-mortem, root cause)",
          "✅ Ownership ('we are', 'team has identified')",
          "✅ Clear timeline (by EOD)",
          "✅ Reassuring tone (expect, implementing)",
          "✅ Action-oriented (not defensive)"
        ]
      },
      
      "overall": {
        "score": 85,
        "grade": "A",
        "readiness": "Ready for C-Level Crisis Communication",
        "recommendations": [
          {
            "category": "Next Level",
            "priority": "low",
            "action": "Try harder scenarios: Investor Pitch Crisis",
            "reason": "You handled this well - ready for more challenging situations"
          }
        ]
      }
    }
  }
}
```

---

## 📚 Jargon Glossary - Learn These Terms!

### Production Outage Jargon

| Term | Definition | Example Usage |
|------|------------|---------------|
| **Bottleneck** | System component limiting performance | "We identified a bottleneck in the API gateway" |
| **Rollback** | Revert to previous working version | "We're implementing a rollback to v2.3.1" |
| **Root Cause** | Fundamental reason for failure | "Root cause was a memory leak in the worker" |
| **Post-mortem** | After-incident analysis report | "Full post-mortem will be ready by EOD" |
| **Triage** | Priority assessment of issues | "We're currently triaging the issue" |
| **Mitigation** | Actions to reduce impact | "Mitigation strategies include enabling cache" |
| **Failover** | Switch to backup system | "Automatic failover to secondary database activated" |
| **Hotfix** | Emergency code patch | "We're deploying a hotfix in 10 minutes" |
| **SLA** | Service Level Agreement | "This breach violates our 99.9% uptime SLA" |
| **RCA** | Root Cause Analysis | "RCA document will identify all contributing factors" |
| **Degradation** | Reduced service quality | "We're experiencing service degradation, not full outage" |
| **ETA** | Estimated Time of Arrival | "ETA for full restore is 15 minutes" |

### Investor Pitch Jargon

| Term | Definition | Example Usage |
|------|------------|---------------|
| **MVP** | Minimum Viable Product | "Our MVP already has 5,000 active users" |
| **Scalability** | Ability to handle growth | "Our architecture supports 10x scalability" |
| **KPI** | Key Performance Indicator | "Our primary KPI is 40% month-over-month growth" |
| **Conversion** | User becoming paying customer | "Conversion rate is 12%, industry average is 3%" |
| **Retention** | Users staying long-term | "90-day retention is 85%" |
| **Roadmap** | Future development plan | "Our 12-month roadmap includes 3 major features" |

### Client Escalation Jargon

| Term | Definition | Example Usage |
|------|------------|---------------|
| **Service Credit** | Refund for downtime | "We'll provide 30 days of service credits" |
| **Priority Support** | Faster response times | "Upgrading you to priority support with 1-hour SLA" |
| **Escalation Path** | Route to senior leadership | "Direct escalation path to my cell phone" |
| **Preventive Measures** | Steps to avoid recurrence | "Implementing preventive measures: automated testing" |
| **QA** | Quality Assurance | "Enhanced QA protocol before all deployments" |

---

## 💡 Best Practices for Crisis Communication

### The 4 C's of Crisis Communication

1. **Calm** 😌
   - Never panic
   - Use steady, professional language
   - Avoid exclamation marks (except in positive updates)

2. **Clear** 📋
   - Specific timelines (not "soon")
   - Concrete action steps (not "working on it")
   - Technical details (show expertise)

3. **Concise** ⚡
   - Get to the point in < 10 seconds
   - No long explanations during active crisis
   - Save details for post-mortem

4. **Confident** 💪
   - Take ownership
   - Show you have a plan
   - Reassure stakeholders

---

### Crisis Communication Template

Use this formula for any crisis:

```
[OWNERSHIP] + [STATUS] + [ACTION] + [TIMELINE] + [REASSURANCE]
```

**Example:**
```
"We [ownership: our team] have identified [status: root cause - database connection pool exhaustion].

Currently implementing [action: rollback to v2.3.1 + scaling connection pool to 200].

ETA [timeline: 15 minutes for full restoration].

[Reassurance: Monitoring shows no data loss, and we'll provide a full post-mortem by EOD]."
```

**Breakdown:**
- ✅ Ownership: "We/our team" (not "someone")
- ✅ Status: "identified root cause" (not "not sure")
- ✅ Action: "implementing rollback" (specific steps)
- ✅ Timeline: "15 minutes" (not "soon")
- ✅ Reassurance: "no data loss, post-mortem by EOD"

---

## 🏆 Scoring & Grading

### Overall Score Calculation

```
Overall Score = (Jargon Score × 30%) + (Tone Score × 40%) + (Pressure Score × 30%)
```

**Components:**
- **Jargon Score:** 0-10 based on technical term usage and coverage
- **Tone Score:** 
  - Resolutive = 90/100
  - Neutral = 60/100
  - Vague = 40/100
  - Defensive = 20/100
- **Pressure Score:** 0-10 based on response time, composure, decisiveness

### Letter Grades

| Grade | Score Range | Meaning |
|-------|-------------|---------|
| **A** | 90-100 | Outstanding - Ready for C-Level crises |
| **B** | 80-89 | Strong - Ready for Team Lead crises |
| **C** | 70-79 | Passing - Needs more practice |
| **D** | 60-69 | Weak - Requires training |
| **F** | 0-59 | Failed - Not ready for crisis situations |

---

## 🎯 Training Progression

### Beginner (First Time)
Start with: **The Production Outage**
- Focus: Learn basic technical jargon
- Goal: Achieve Jargon Score > 5
- Goal: Avoid defensive language
- Goal: Provide at least one timeline

### Intermediate (2-5 Sessions)
Progress to: **The Angry Client Escalation**
- Focus: Empathy + Technical competence
- Goal: Achieve "Resolutive" tone classification
- Goal: Jargon Score > 6
- Goal: Response time < 15 seconds

### Advanced (5+ Sessions)
Master: **The Investor Pitch Crisis**
- Focus: Pivoting under extreme pressure
- Goal: Overall Score > 80
- Goal: Grade A or B
- Goal: "Elite" pressure resistance rating

---

## 📖 Real-World Examples

### Example 1: Production Outage

**Scenario:** Database down during peak hours

❌ **Bad Response (Grade: F)**
```
"I don't know what happened. Maybe someone deployed bad code? 
It's not my fault. We're looking into it."
```

**Problems:**
- No technical jargon
- Defensive tone ("not my fault")
- Vague ("looking into it")
- Blame-shifting ("someone deployed")
- No timeline

---

✅ **Good Response (Grade: A)**
```
"We've identified a bottleneck in the database connection pool causing cascading failures.
Currently implementing a rollback to v2.3.1 while scaling the connection pool to 200.
ETA: 15 minutes for full restoration. No data loss detected.
Full post-mortem with root cause analysis will be ready by EOD."
```

**Why it works:**
- ✅ Technical jargon: bottleneck, rollback, connection pool, root cause, post-mortem
- ✅ Ownership: "We've identified"
- ✅ Specific actions: "rollback to v2.3.1", "scaling to 200"
- ✅ Clear timeline: "15 minutes", "by EOD"
- ✅ Reassurance: "no data loss"
- ✅ Tone: Solution-focused, not defensive

---

### Example 2: Angry Client

**Scenario:** Client threatening to cancel $100K contract

❌ **Bad Response (Grade: F)**
```
"It's not that bad. Other clients have had the same issue.
Just be patient, these things happen."
```

**Problems:**
- Dismissive ("not that bad")
- No empathy
- No action plan
- No compensation offer
- Minimizes client's pain

---

✅ **Good Response (Grade: A)**
```
"I completely understand your frustration, and this is unacceptable.
I'm assigning a dedicated engineering team to resolve this today - you'll have my direct line.
We're providing 30 days of service credits plus 3 months of priority support (1-hour SLA).
Our QA protocol is being enhanced with automated testing to prevent recurrence.
Post-incident review will be shared with your team by tomorrow EOD."
```

**Why it works:**
- ✅ Empathy: "understand your frustration"
- ✅ Ownership: "unacceptable" (admits fault)
- ✅ Concrete actions: dedicated team, direct line, service credits
- ✅ Compensation: 30 days credit + 3 months priority support
- ✅ Preventive measures: enhanced QA protocol
- ✅ Timeline: today, tomorrow EOD
- ✅ Jargon: SLA, QA protocol, post-incident review

---

## 🔥 Common Mistakes to Avoid

### 1. The Blame Game
❌ "It was Bob's fault for deploying on Friday."
✅ "We identified a deployment issue. Implementing additional approval gates."

### 2. The Vague Promise
❌ "We're working on it and will fix it soon."
✅ "Implementing rollback to v2.3.1, ETA 15 minutes."

### 3. The Over-Explanation
❌ "Well, you see, what happened was the database connection pool, which is managed by our ORM layer, which connects to PostgreSQL 14.2 running on AWS RDS in us-east-1, suddenly started throwing connection timeout errors because..."
✅ "Database connection pool exhaustion. Implementing fix now. ETA 15 minutes."

### 4. The Panic Response
❌ "OH NO!!! Everything is down!!! I don't know what to do!!!"
✅ "We have an active incident. Team is triaging. Updates every 5 minutes."

### 5. The Technical Dump (Too much detail at wrong time)
❌ "The race condition in the mutex lock on the connection pool semaphore caused a deadlock when concurrent threads..."
✅ "Database deadlock identified. Implementing fix. Post-mortem will have full technical details."

---

## 📞 Quick Reference: Crisis Phrases to Memorize

### Ownership Phrases
- "We are handling this"
- "I take full responsibility"
- "Our team has identified"
- "We're implementing"

### Action Phrases
- "Currently triaging"
- "Implementing rollback"
- "Deploying hotfix"
- "Scaling infrastructure"
- "Restoring from backup"

### Timeline Phrases
- "ETA: 15 minutes"
- "By EOD today"
- "Next update in 5 minutes"
- "Full restoration within the hour"

### Reassurance Phrases
- "No data loss detected"
- "Customers are protected"
- "Service is stabilizing"
- "Root cause identified"
- "Preventive measures in place"

### Technical Terms (Always Good)
- bottleneck, rollback, root cause, post-mortem
- triage, mitigation, failover, hotfix
- SLA, uptime, incident, escalation
- monitoring, alert, degradation, restore

---

## 🎬 Sample Crisis Session

**[Coach]** 🚨 CRISIS SCENARIO: The Production Outage

The main database is down, the CEO is on the Slack channel asking for updates. What do you say?

**You have 10 minutes. GO!**

---

**[You]** "We've identified a database connection pool bottleneck. Implementing rollback to v2.3.1 now. ETA 15 minutes."

---

**[Coach - Pressure Level: Medium]** Good technical detail, but what's the root cause? The CEO wants specifics!

---

**[You]** "Root cause: Connection pool configured for 50 connections, but peak traffic hit 200 simultaneous requests causing cascading timeouts. Immediate rollback in progress, then scaling pool to 200 connections."

---

**[Coach - Pressure Level: Low]** Perfect! That's exactly what stakeholders need to hear! What's your backup plan if rollback doesn't work?

---

**[You]** "Backup plan: Failover to read replica promoted to primary. Already on standby. Post-mortem will be ready by EOD with full RCA and preventive measures."

---

**[Coach - Pressure Level: Low]** Excellent! Technical accuracy + diplomatic tone = success! Keep this energy!

---

**[Session ends - Grade: A (88/100)]**

**Crisis Report:**
- Jargon Score: 9/10 (Used: bottleneck, rollback, root cause, failover, RCA, post-mortem)
- Tone: Resolutive (8 solution-focused responses)
- Pressure Resistance: 8.5/10 (Fast responses, maintained composure)
- Readiness: Ready for C-Level Crisis Communication

---

## 🚀 Ready to Start?

1. **POST** to `/api/crisis/start` with your userId and scenario choice
2. Brace yourself for 10 minutes of high-pressure training
3. Respond fast, use technical jargon, take ownership
4. Get your Crisis Audit and see where you stand
5. Practice daily until you reach Grade A consistently

**Remember:** In a real crisis, stakeholders don't want excuses - they want **calm, clear, concise, and confident communication**. This training will prepare you for the worst-case scenarios.

---

## 📊 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/crisis/scenarios` | List all available scenarios |
| GET | `/api/crisis/demo` | Get demo info and examples |
| POST | `/api/crisis/start` | Start a crisis session |
| POST | `/api/crisis/respond` | Submit a response during session |
| POST | `/api/crisis/end` | End session and get audit report |
| GET | `/api/crisis/session/:id` | Get session status and details |

**Authentication:** All endpoints require valid JWT token (except /demo)

**Rate Limiting:** Max 1 active crisis session per user at a time

---

## 📞 Support

If you have questions or need help with the Crisis Coach:
- Email: crisis-training@fluencylab.com
- Documentation: /CRISIS_COACH_GUIDE.md
- API Demo: GET /api/crisis/demo

**Good luck! You're going to need it.** 🔥

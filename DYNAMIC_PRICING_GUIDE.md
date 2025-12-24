# 💰 DYNAMIC PRICING & LEAD SCORING GUIDE
**The Fluency Lab - Intelligent Revenue Optimization System**

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [API Reference](#api-reference)
4. [Lead Scoring Algorithm](#lead-scoring-algorithm)
5. [Pricing Strategy](#pricing-strategy)
6. [Testing Guide](#testing-guide)
7. [Frontend Integration](#frontend-integration)
8. [Production Deployment](#production-deployment)

---

## 🎯 OVERVIEW

### What is Dynamic Pricing?

The **Dynamic Pricing & Lead Scoring System** automatically detects high-value users based on their learning patterns and offers personalized upgrade recommendations with time-limited discounts.

### Key Features

✅ **Multi-Factor Lead Scoring**
- Readiness Score (35% weight) - Based on level, engagement, payment history
- Urgency Score (40% weight) - Based on error patterns and recent activity  
- Value Score (25% weight) - Based on lifetime value potential

✅ **Intelligent Pattern Detection**
- Analyzes error patterns by domain (management, technical, business)
- Detects consistent failure patterns (40%+ error rate)
- Cross-references with user proficiency level (C1/C2)

✅ **Potential Lead Identification**
- **Special Case**: C1 users failing in "management" domain
- Automatically tagged as "Potential Lead"
- Offered Executive IT English Module with premium discount

✅ **Dynamic Discount Tiers**
- LIMITED_TIME: 40% OFF (24 hours) - For high-value potential leads
- EXCLUSIVE: 30% OFF (48 hours) - For qualified leads
- PREMIUM: 20% OFF (72 hours) - For hot leads
- STANDARD: 10% OFF (72 hours) - For warm leads

✅ **Personalized Offers**
- Module recommendations based on weak areas
- Benefits tailored to user level
- Social proof messaging
- Urgency-driven time limits

---

## 🏗️ SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERACTION                        │
│  (Completes exercises, makes errors in management domain)   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              ERROR TRACKING (Node.js Backend)                │
│  POST /api/pricing/track-error                              │
│  - Stores error with domain classification                  │
│  - Categories: management, technical, business, general     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            LEAD ANALYSIS (JavaScript Engine)                 │
│  POST /api/pricing/analyze-lead                             │
│  - Analyzes error patterns by domain                        │
│  - Calculates failure rates                                 │
│  - Computes multi-factor lead score                         │
│  - Classifies lead status                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              POTENTIAL LEAD DETECTION                        │
│  IF: C1 level + 40%+ management failure rate                │
│  THEN: Tag as "Potential Lead"                              │
│  OFFER: Executive IT English Module at 40% OFF              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              DYNAMIC OFFER GENERATION                        │
│  - Selects appropriate module based on domain               │
│  - Determines discount tier (10%-40%)                       │
│  - Generates personalized benefits list                     │
│  - Adds social proof messaging                              │
│  - Sets time-limited expiration                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  OFFER PRESENTATION                          │
│  GET /api/pricing/my-offers                                 │
│  - Frontend displays offer popup/banner                     │
│  - Countdown timer for urgency                              │
│  - Benefits with checkmarks                                 │
│  - CTA button to accept                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    OFFER ACCEPTANCE                          │
│  POST /api/pricing/accept-offer/:offerId                    │
│  - Redirect to payment gateway (Stripe/PayPal)              │
│  - Apply discount code                                      │
│  - Upgrade user role on success                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 API REFERENCE

### Base URL
```
http://localhost:3000/api/pricing
```

### Authentication
All endpoints require JWT authentication. Include token in header:
```
Authorization: Bearer <your_jwt_token>
```

---

### 1. Track Error

**Endpoint:** `POST /api/pricing/track-error`

**Description:** Track a user error for lead scoring analysis

**Request Body:**
```json
{
  "error": "Confused 'actual' with 'current'",
  "category": "vocabulary",
  "domain": "management",
  "sessionId": "session-12345"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Error tracked successfully",
  "data": {
    "total_errors": 7
  }
}
```

**Parameters:**
- `error` (required) - Description of the error made
- `domain` (required) - Error domain: `management`, `technical`, `business`, `general`
- `category` (optional) - Error category: `vocabulary`, `grammar`, `pronunciation`
- `sessionId` (optional) - Session identifier (auto-generated if not provided)

**Use Case:**
Call this endpoint every time a user makes an error during exercises. The system accumulates errors to detect patterns.

---

### 2. Analyze Lead

**Endpoint:** `POST /api/pricing/analyze-lead`

**Description:** Analyze user for lead scoring and generate personalized offers

**Request Body:**
```json
{}
```
*(User profile retrieved from JWT token)*

**Response:**
```json
{
  "success": true,
  "data": {
    "lead_score": {
      "user_id": "user123",
      "lead_status": "potential_lead",
      "score": 72.5,
      "readiness_score": 80,
      "urgency_score": 70,
      "value_score": 70,
      "triggers": [
        "Advanced level: C1",
        "High engagement: 25 sessions",
        "Paid user: student",
        "Consistent failures in management: 100.0% error rate"
      ],
      "recommended_offers": [
        {
          "offer_type": "executive_it_english_module",
          "domain": "management",
          "failure_rate": 1.0,
          "error_count": 7,
          "discount_tier": "LIMITED_TIME",
          "discount_percentage": 40,
          "priority": 88.9
        }
      ]
    },
    "offer": {
      "offer_id": "OFFER-user123-1703001234567",
      "user_id": "user123",
      "offer_type": "executive_it_english_module",
      "module_name": "Executive IT English Module",
      "original_price": 299.00,
      "discount_tier": "LIMITED_TIME",
      "discount_amount": 119.60,
      "discount_percentage": 40,
      "final_price": 179.40,
      "urgency_message": "⚡ FLASH SALE: 40% OFF - Only 24 hours left!",
      "benefits": [
        "Master management terminology and leadership vocabulary",
        "Learn to conduct effective team meetings in English",
        "Practice strategic planning and decision-making discussions",
        "Handle conflict resolution and performance reviews",
        "Real-world IT management scenarios and role-plays",
        "Personalized for C1 level learners"
      ],
      "social_proof": "Join 2,340+ IT managers who improved their English leadership skills by 67% in 30 days",
      "expires_at": "2024-12-20T14:30:00.000Z",
      "created_at": "2024-12-19T14:30:00.000Z"
    }
  }
}
```

**Lead Statuses:**
- `potential_lead` - C1 user with management failures (special case)
- `qualified_lead` - Score ≥ 80
- `hot` - Score ≥ 60
- `warm` - Score ≥ 40
- `cold` - Score < 40

**Minimum Requirements:**
- At least 5 tracked errors required for analysis
- Returns insufficient data message if not met

---

### 3. Get My Offers

**Endpoint:** `GET /api/pricing/my-offers`

**Description:** Retrieve active personalized offers for current user

**Response (Active Offer):**
```json
{
  "success": true,
  "data": {
    "has_offers": true,
    "offer": {
      "offer_id": "OFFER-user123-1703001234567",
      "user_id": "user123",
      "module_name": "Executive IT English Module",
      "original_price": 299.00,
      "discount_tier": "LIMITED_TIME",
      "discount_amount": 119.60,
      "discount_percentage": 40,
      "final_price": 179.40,
      "urgency_message": "⚡ FLASH SALE: 40% OFF - Only 24 hours left!",
      "benefits": ["..."],
      "social_proof": "Join 2,340+ IT managers...",
      "expires_at": "2024-12-20T14:30:00.000Z"
    },
    "lead_score": {
      "score": 72.5,
      "lead_status": "potential_lead"
    }
  }
}
```

**Response (No Offers):**
```json
{
  "success": true,
  "message": "No active offers available",
  "data": {
    "has_offers": false,
    "lead_score": null
  }
}
```

**Use Case:**
Poll this endpoint periodically or check when user logs in to display offers in UI.

---

### 4. Accept Offer

**Endpoint:** `POST /api/pricing/accept-offer/:offerId`

**Description:** Accept a personalized offer (redirects to checkout)

**Parameters:**
- `offerId` (URL param) - The offer ID to accept

**Response:**
```json
{
  "success": true,
  "message": "Offer accepted! Redirecting to checkout...",
  "data": {
    "order_id": "ORDER-1703001234567",
    "module": "Executive IT English Module",
    "amount": 179.40,
    "checkout_url": "https://fluencylab.com/checkout/OFFER-user123-1703001234567"
  }
}
```

**Use Case:**
Call when user clicks "Accept Offer" button. Redirect to checkout_url for payment.

---

### 5. Simulate Potential Lead (Testing Only)

**Endpoint:** `POST /api/pricing/simulate-potential-lead`

**Description:** Generate test data for C1 user with management errors

**Permissions:** Requires DIAGNOSTIC write permission (Coach/SuperUser)

**Response:**
```json
{
  "success": true,
  "message": "✅ Potential Lead simulation complete!",
  "data": {
    "user_profile": {
      "user_id": "user123",
      "current_level": "C1",
      "current_role": "student",
      "total_sessions": 25,
      "modules_completed": ["diagnostic", "daily_coach", "progress_tracker"],
      "weak_areas": ["management", "leadership"]
    },
    "simulated_errors": 7,
    "lead_score": {
      "lead_status": "potential_lead",
      "score": 72.5
    },
    "offer": {
      "module_name": "Executive IT English Module",
      "final_price": 179.40,
      "discount_percentage": 40
    },
    "is_potential_lead": true
  }
}
```

**Use Case:**
Testing and demonstration purposes. Creates realistic scenario of C1 manager with management errors.

---

## 🧮 LEAD SCORING ALGORITHM

### Formula

```
Overall Score = (Readiness × 0.35) + (Urgency × 0.40) + (Value × 0.25)
```

### Readiness Score (0-100)

**Purpose:** Measures how prepared the user is for an upgrade

**Components:**
- **C1/C2 Level**: +40 points
  - Advanced learners are more likely to appreciate premium content
  
- **High Engagement (≥20 sessions)**: +20 points
  - Active users demonstrate commitment
  
- **Paid User (student/coach role)**: +20 points
  - Already paying customers are proven buyers
  
- **Modules Completed (≥3)**: +20 points
  - Users who complete modules see value in the platform

**Maximum:** 100 points

---

### Urgency Score (0-100)

**Purpose:** Measures how urgently the user needs an upgrade

**Components:**
- **High Failure Rate in Domain (≥40%)**: +30 points per domain
  - Consistent errors indicate pain point needing solution
  
- **Recently Active (≤3 days)**: +30 points
  - Recent activity means user is engaged and ready to act
  
- **Multiple Weak Areas (≥3 domains)**: +20 points
  - More weaknesses = higher need for comprehensive solution

**Maximum:** 100 points

**Note:** Urgency has highest weight (40%) as immediate pain points drive purchases

---

### Value Score (0-100)

**Purpose:** Estimates long-term revenue potential

**Components:**
- **C-Level User (C1/C2)**: +40 points
  - Advanced learners likely to purchase multiple modules
  
- **Paid User**: +30 points
  - Proven willingness to pay
  
- **Long-Term User (≥90 days)**: +30 points
  - Retention indicates satisfaction and future LTV

**Maximum:** 100 points

---

### Lead Classification

```
IF: C1 level AND management failure rate ≥40% AND ≥5 sessions
  THEN: lead_status = "potential_lead" (SPECIAL CASE)

ELSE IF: overall_score ≥ 80
  THEN: lead_status = "qualified_lead"

ELSE IF: overall_score ≥ 60
  THEN: lead_status = "hot"

ELSE IF: overall_score ≥ 40
  THEN: lead_status = "warm"

ELSE:
  THEN: lead_status = "cold"
```

---

### Error Pattern Analysis

**Failure Rate Calculation:**
```
failure_rate = error_count / total_sessions_in_domain
```

**Threshold for Pattern:**
- Failure Rate: ≥40%
- Minimum Sessions: ≥5 sessions in that domain

**Domain Classification:**
- `management` → Executive IT English Module
- `business` → Advanced Business Communication
- `technical` → Technical Writing Mastery
- `negotiation` → Negotiation Skills Pro

---

## 💵 PRICING STRATEGY

### Module Base Prices

| Module | Price |
|--------|-------|
| Executive IT English Module | $299.00 |
| Negotiation Skills Pro | $279.00 |
| Advanced Business Communication | $249.00 |
| Technical Writing Mastery | $199.00 |

---

### Discount Tiers

| Tier | Discount | Expiry | Eligibility |
|------|----------|--------|-------------|
| **LIMITED_TIME** | 40% | 24 hours | POTENTIAL_LEAD + ≥60% failure rate |
| **EXCLUSIVE** | 30% | 48 hours | POTENTIAL_LEAD or QUALIFIED_LEAD |
| **PREMIUM** | 20% | 72 hours | HOT leads |
| **STANDARD** | 10% | 72 hours | WARM leads |

---

### Pricing Example: Potential Lead

**User Profile:**
- Level: C1
- Role: Student (paid)
- Sessions: 25
- Errors: 7 management errors across 7 sessions (100% failure rate)

**Lead Score:**
- Readiness: 80/100 (C1 + paid + engaged)
- Urgency: 70/100 (high failure rate)
- Value: 70/100 (C1 + paid user)
- **Overall: 72.5/100**

**Classification:**
- Status: **POTENTIAL_LEAD** (special case: C1 + management)

**Offer:**
- Module: Executive IT English Module
- Original Price: $299.00
- Discount Tier: LIMITED_TIME (40%)
- Discount Amount: $119.60
- **Final Price: $179.40**
- Expires: 24 hours

**Urgency Message:**
"⚡ FLASH SALE: 40% OFF - Only 24 hours left!"

---

## 🧪 TESTING GUIDE

### Prerequisites

1. **Start Backend Server:**
```bash
cd backend
npm install
node server.js
```

2. **Login as Student User:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@fluencylab.com",
    "password": "FluencyLab2024!"
  }'
```

**Save the JWT token from response**

---

### Test Scenario: Potential Lead Detection

**Step 1: Simulate Potential Lead**

This automatically creates a C1 user profile with 7 management errors:

```bash
curl -X POST http://localhost:3000/api/pricing/simulate-potential-lead \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "✅ Potential Lead simulation complete!",
  "data": {
    "is_potential_lead": true,
    "lead_score": {
      "lead_status": "potential_lead",
      "score": 72.5
    },
    "offer": {
      "module_name": "Executive IT English Module",
      "final_price": 179.40,
      "discount_percentage": 40
    }
  }
}
```

---

**Step 2: Check Active Offers**

```bash
curl -X GET http://localhost:3000/api/pricing/my-offers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "has_offers": true,
    "offer": {
      "module_name": "Executive IT English Module",
      "urgency_message": "⚡ FLASH SALE: 40% OFF - Only 24 hours left!",
      "final_price": 179.40,
      "benefits": [
        "Master management terminology and leadership vocabulary",
        ...
      ]
    }
  }
}
```

---

**Step 3: Accept Offer**

```bash
curl -X POST http://localhost:3000/api/pricing/accept-offer/OFFER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

Replace `OFFER_ID` with the `offer_id` from Step 2 response.

**Expected Response:**
```json
{
  "success": true,
  "message": "Offer accepted! Redirecting to checkout...",
  "data": {
    "order_id": "ORDER-1703001234567",
    "checkout_url": "https://fluencylab.com/checkout/..."
  }
}
```

---

### Test Scenario: Manual Error Tracking

**Step 1: Track Multiple Errors**

```bash
# Error 1
curl -X POST http://localhost:3000/api/pricing/track-error \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "error": "Confused actual with current",
    "domain": "management",
    "category": "vocabulary",
    "sessionId": "session-001"
  }'

# Error 2
curl -X POST http://localhost:3000/api/pricing/track-error \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "error": "Wrong: responsible of (correct: responsible for)",
    "domain": "management",
    "category": "grammar",
    "sessionId": "session-002"
  }'

# Repeat 5+ times with different errors...
```

---

**Step 2: Analyze Lead Score**

After tracking at least 5 errors:

```bash
curl -X POST http://localhost:3000/api/pricing/analyze-lead \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "lead_score": {
      "score": 65.5,
      "lead_status": "hot",
      "triggers": [...]
    },
    "offer": {
      "module_name": "Executive IT English Module",
      "final_price": 239.20,
      "discount_percentage": 20
    }
  }
}
```

---

### Expected Test Results

| Scenario | Level | Errors | Sessions | Expected Status | Discount |
|----------|-------|--------|----------|----------------|----------|
| Potential Lead | C1 | 7 management | 7 | potential_lead | 40% |
| Hot Lead | B2 | 5 mixed | 10 | hot | 20% |
| Warm Lead | B1 | 3 general | 8 | warm | 10% |
| Cold Lead | A2 | 2 general | 3 | cold | None |

---

## 🎨 FRONTEND INTEGRATION

### Offer Display Modal

Create an attractive modal to display personalized offers:

```html
<!-- Offer Modal -->
<div id="offerModal" class="modal" style="display: none;">
  <div class="modal-content">
    <!-- Countdown Timer -->
    <div class="countdown">
      <span id="offerCountdown">⏰ Offer expires in: 23:45:12</span>
    </div>
    
    <!-- Urgency Message -->
    <h2 id="urgencyMessage">⚡ FLASH SALE: 40% OFF - Only 24 hours left!</h2>
    
    <!-- Module Info -->
    <h3 id="moduleName">Executive IT English Module</h3>
    
    <!-- Pricing -->
    <div class="pricing">
      <span class="original-price">$<span id="originalPrice">299.00</span></span>
      <span class="final-price">$<span id="finalPrice">179.40</span></span>
      <span class="discount-badge"><span id="discountPercent">40</span>% OFF</span>
    </div>
    
    <!-- Benefits List -->
    <div class="benefits">
      <h4>What You'll Get:</h4>
      <ul id="benefitsList">
        <!-- Populated dynamically -->
      </ul>
    </div>
    
    <!-- Social Proof -->
    <p class="social-proof" id="socialProof">
      Join 2,340+ IT managers who improved their English leadership skills by 67% in 30 days
    </p>
    
    <!-- CTA Buttons -->
    <div class="actions">
      <button id="acceptOfferBtn" class="btn-primary">
        Accept Offer & Upgrade Now
      </button>
      <button id="closeOfferBtn" class="btn-secondary">
        Maybe Later
      </button>
    </div>
  </div>
</div>
```

---

### JavaScript: Check and Display Offers

```javascript
// Check for active offers on page load
async function checkForOffers() {
  try {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;
    
    const response = await fetch('http://localhost:3000/api/pricing/my-offers', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    
    if (result.success && result.data.has_offers) {
      displayOfferModal(result.data.offer);
    }
  } catch (error) {
    console.error('Failed to check offers:', error);
  }
}

// Display offer modal with data
function displayOfferModal(offer) {
  // Populate modal fields
  document.getElementById('urgencyMessage').textContent = offer.urgency_message;
  document.getElementById('moduleName').textContent = offer.module_name;
  document.getElementById('originalPrice').textContent = offer.original_price.toFixed(2);
  document.getElementById('finalPrice').textContent = offer.final_price.toFixed(2);
  document.getElementById('discountPercent').textContent = offer.discount_percentage;
  document.getElementById('socialProof').textContent = offer.social_proof;
  
  // Populate benefits list
  const benefitsList = document.getElementById('benefitsList');
  benefitsList.innerHTML = '';
  offer.benefits.forEach(benefit => {
    const li = document.createElement('li');
    li.innerHTML = `✅ ${benefit}`;
    benefitsList.appendChild(li);
  });
  
  // Start countdown timer
  startCountdown(offer.expires_at);
  
  // Store offer ID for acceptance
  document.getElementById('acceptOfferBtn').dataset.offerId = offer.offer_id;
  
  // Show modal
  document.getElementById('offerModal').style.display = 'block';
}

// Countdown timer
function startCountdown(expiresAt) {
  const countdownElement = document.getElementById('offerCountdown');
  
  const interval = setInterval(() => {
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const distance = expiry - now;
    
    if (distance < 0) {
      clearInterval(interval);
      countdownElement.textContent = '⏰ Offer expired';
      document.getElementById('acceptOfferBtn').disabled = true;
      return;
    }
    
    const hours = Math.floor(distance / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    countdownElement.textContent = `⏰ Offer expires in: ${hours}h ${minutes}m ${seconds}s`;
  }, 1000);
}

// Accept offer
document.getElementById('acceptOfferBtn').addEventListener('click', async () => {
  const offerId = document.getElementById('acceptOfferBtn').dataset.offerId;
  const token = localStorage.getItem('jwt_token');
  
  try {
    const response = await fetch(`http://localhost:3000/api/pricing/accept-offer/${offerId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Redirect to checkout
      window.location.href = result.data.checkout_url;
    }
  } catch (error) {
    console.error('Failed to accept offer:', error);
    alert('Failed to process offer. Please try again.');
  }
});

// Close modal
document.getElementById('closeOfferBtn').addEventListener('click', () => {
  document.getElementById('offerModal').style.display = 'none';
});

// Check for offers when page loads
document.addEventListener('DOMContentLoaded', () => {
  checkForOffers();
});
```

---

### Error Tracking Integration

Integrate error tracking in your exercise components:

```javascript
// When user makes an error in an exercise
async function trackUserError(error, domain, category) {
  const token = localStorage.getItem('jwt_token');
  if (!token) return;
  
  const sessionId = localStorage.getItem('current_session_id') || `session-${Date.now()}`;
  
  try {
    await fetch('http://localhost:3000/api/pricing/track-error', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: error,
        domain: domain,
        category: category,
        sessionId: sessionId
      })
    });
  } catch (error) {
    console.error('Failed to track error:', error);
  }
}

// Example usage in exercise component
function checkAnswer(userAnswer, correctAnswer, domain) {
  if (userAnswer !== correctAnswer) {
    // Track the error
    trackUserError(
      `Wrong: "${userAnswer}" (correct: "${correctAnswer}")`,
      domain, // 'management', 'technical', 'business'
      'vocabulary'
    );
    
    // Show error feedback to user
    showErrorFeedback(correctAnswer);
  }
}
```

---

### Periodic Lead Analysis

Analyze lead score after certain milestones:

```javascript
// Analyze lead after completing exercises
async function analyzeLeadScore() {
  const token = localStorage.getItem('jwt_token');
  if (!token) return;
  
  try {
    const response = await fetch('http://localhost:3000/api/pricing/analyze-lead', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    
    if (result.success && result.data.offer) {
      // Display offer immediately
      displayOfferModal(result.data.offer);
    }
  } catch (error) {
    console.error('Failed to analyze lead:', error);
  }
}

// Trigger analysis after milestones
document.getElementById('completeExerciseBtn').addEventListener('click', async () => {
  // Complete exercise logic...
  
  const exerciseCount = parseInt(localStorage.getItem('exercise_count') || '0') + 1;
  localStorage.setItem('exercise_count', exerciseCount);
  
  // Analyze lead every 5 exercises
  if (exerciseCount % 5 === 0) {
    await analyzeLeadScore();
  }
});
```

---

## 🚀 PRODUCTION DEPLOYMENT

### Database Integration

Replace in-memory storage with PostgreSQL:

```javascript
// Replace Map storage with database queries

// Track error
const query = `
  INSERT INTO user_errors (user_id, error, domain, category, session_id, timestamp)
  VALUES ($1, $2, $3, $4, $5, NOW())
`;
await pool.query(query, [userId, error, domain, category, sessionId]);

// Get error history
const query = `
  SELECT * FROM user_errors
  WHERE user_id = $1
  ORDER BY timestamp DESC
  LIMIT 100
`;
const result = await pool.query(query, [userId]);
const errorHistory = result.rows;

// Store lead score
const query = `
  INSERT INTO lead_scores (user_id, score, lead_status, expires_at, data)
  VALUES ($1, $2, $3, $4, $5)
  ON CONFLICT (user_id) DO UPDATE
  SET score = $2, lead_status = $3, expires_at = $4, data = $5, updated_at = NOW()
`;
await pool.query(query, [userId, score, leadStatus, expiresAt, JSON.stringify(leadScore)]);

// Store offer
const query = `
  INSERT INTO active_offers (offer_id, user_id, offer_type, pricing_data, expires_at)
  VALUES ($1, $2, $3, $4, $5)
`;
await pool.query(query, [offerId, userId, offerType, JSON.stringify(offer), expiresAt]);
```

---

### Cron Job for Periodic Analysis

Create a scheduled job to analyze all users periodically:

```javascript
const cron = require('node-cron');

// Run lead analysis every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('🔍 Running daily lead analysis...');
  
  try {
    // Get all active users with enough data
    const query = `
      SELECT DISTINCT user_id
      FROM user_errors
      GROUP BY user_id
      HAVING COUNT(*) >= 5
    `;
    const result = await pool.query(query);
    
    for (const row of result.rows) {
      const userId = row.user_id;
      
      // Analyze each user
      // (Call lead scoring logic here)
      
      console.log(`✅ Analyzed user ${userId}`);
    }
    
    console.log('✅ Daily lead analysis complete');
  } catch (error) {
    console.error('❌ Daily lead analysis failed:', error);
  }
});
```

---

### Payment Integration

Integrate with Stripe for offer acceptance:

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/accept-offer/:offerId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { offerId } = req.params;
    
    // Get offer from database
    const offer = await getOfferById(offerId, userId);
    
    if (!offer || new Date(offer.expires_at) < new Date()) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found or expired'
      });
    }
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: offer.module_name,
              description: `${offer.discount_percentage}% OFF - Limited time offer`,
            },
            unit_amount: Math.round(offer.final_price * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/offers`,
      client_reference_id: userId,
      metadata: {
        offer_id: offerId,
        module_type: offer.offer_type
      }
    });
    
    res.json({
      success: true,
      data: {
        checkout_url: session.url
      }
    });
    
  } catch (error) {
    console.error('❌ Checkout creation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create checkout session'
    });
  }
});

// Webhook to handle successful payment
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      const userId = session.client_reference_id;
      const offerId = session.metadata.offer_id;
      const moduleType = session.metadata.module_type;
      
      // Upgrade user access
      await grantModuleAccess(userId, moduleType);
      
      // Mark offer as accepted
      await markOfferAccepted(offerId);
      
      // Send confirmation email
      await sendPurchaseConfirmation(userId, moduleType);
      
      console.log(`✅ User ${userId} purchased ${moduleType}`);
    }
    
    res.json({ received: true });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});
```

---

### Environment Variables

Add to `.env` file:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Base URL
BASE_URL=https://fluencylab.com

# Email
SENDGRID_API_KEY=SG....
FROM_EMAIL=offers@fluencylab.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/fluency_lab
```

---

### A/B Testing Framework

Test different discount tiers and messaging:

```javascript
// A/B test variants
const DISCOUNT_VARIANTS = {
  'control': { percentage: 20, message: 'Limited time: 20% OFF' },
  'variant_a': { percentage: 30, message: '⚡ Flash sale: 30% OFF' },
  'variant_b': { percentage: 40, message: '🎯 Exclusive: 40% OFF - 24h only' }
};

// Assign variant to user
function assignVariant(userId) {
  const hash = hashUserId(userId);
  const variantIndex = hash % 3;
  return ['control', 'variant_a', 'variant_b'][variantIndex];
}

// Track conversion
async function trackConversion(userId, variant, offerId, accepted) {
  const query = `
    INSERT INTO ab_test_results (user_id, variant, offer_id, accepted, timestamp)
    VALUES ($1, $2, $3, $4, NOW())
  `;
  await pool.query(query, [userId, variant, offerId, accepted]);
}

// Analyze results
async function getABTestResults() {
  const query = `
    SELECT 
      variant,
      COUNT(*) as total_offers,
      SUM(CASE WHEN accepted THEN 1 ELSE 0 END) as conversions,
      (SUM(CASE WHEN accepted THEN 1 ELSE 0 END)::float / COUNT(*)) * 100 as conversion_rate
    FROM ab_test_results
    GROUP BY variant
  `;
  const result = await pool.query(query);
  return result.rows;
}
```

---

## 📊 MONITORING & ANALYTICS

### Key Metrics to Track

1. **Lead Generation Rate**
   - Total potential leads identified per week
   - Percentage of C1 users becoming potential leads

2. **Offer Conversion Rate**
   - Offers shown vs. offers accepted
   - Conversion rate by discount tier

3. **Revenue Impact**
   - Total revenue from dynamic offers
   - Average order value by lead status
   - ROI of discount tiers

4. **Engagement Metrics**
   - Time from offer shown to acceptance
   - Offer expiration rate (users letting offers expire)

5. **Error Pattern Analysis**
   - Most common error domains
   - Average failure rate before offer generation
   - Correlation between error rate and conversion

---

### Dashboard Queries

```sql
-- Potential leads identified this week
SELECT COUNT(DISTINCT user_id) as potential_leads
FROM lead_scores
WHERE lead_status = 'potential_lead'
  AND created_at >= NOW() - INTERVAL '7 days';

-- Conversion rate by discount tier
SELECT 
  discount_tier,
  COUNT(*) as offers_shown,
  SUM(CASE WHEN accepted_at IS NOT NULL THEN 1 ELSE 0 END) as accepted,
  (SUM(CASE WHEN accepted_at IS NOT NULL THEN 1 ELSE 0 END)::float / COUNT(*)) * 100 as conversion_rate,
  AVG(final_price) as avg_order_value
FROM active_offers
GROUP BY discount_tier;

-- Revenue by module type
SELECT 
  offer_type,
  COUNT(*) as sales,
  SUM(final_price) as total_revenue,
  AVG(final_price) as avg_price
FROM active_offers
WHERE accepted_at IS NOT NULL
GROUP BY offer_type;

-- Top error domains triggering offers
SELECT 
  e.domain,
  COUNT(DISTINCT e.user_id) as users_affected,
  AVG(e.failure_rate) as avg_failure_rate,
  COUNT(DISTINCT o.offer_id) as offers_generated
FROM (
  SELECT 
    user_id,
    domain,
    (COUNT(*)::float / COUNT(DISTINCT session_id)) as failure_rate
  FROM user_errors
  GROUP BY user_id, domain
) e
LEFT JOIN active_offers o ON e.user_id = o.user_id
GROUP BY e.domain
ORDER BY offers_generated DESC;
```

---

## 🎓 BEST PRACTICES

### Do's ✅

1. **Track errors consistently**
   - Track every error with proper domain classification
   - Use meaningful session IDs to group related errors

2. **Respect offer expiration**
   - Automatically remove expired offers
   - Don't spam users with multiple simultaneous offers

3. **Personalize messaging**
   - Use user's actual weak areas in benefits
   - Reference their current level in social proof

4. **Test discount tiers**
   - A/B test different discount percentages
   - Monitor conversion rates by tier

5. **Monitor analytics**
   - Track conversion rates
   - Analyze which patterns convert best
   - Adjust thresholds based on data

---

### Don'ts ❌

1. **Don't show offers too early**
   - Minimum 5 errors required for pattern detection
   - Need sufficient data for accurate scoring

2. **Don't overwhelm users**
   - Limit to one active offer per user
   - Respect "maybe later" responses

3. **Don't ignore expired offers**
   - Clean up expired offers from database
   - Don't re-show expired offers

4. **Don't use arbitrary scoring**
   - Base lead scores on actual behavior
   - Adjust weights based on conversion data

5. **Don't forget GDPR compliance**
   - Allow users to opt out of personalized offers
   - Provide data export/deletion

---

## 🔒 SECURITY CONSIDERATIONS

1. **Authentication Required**
   - All pricing endpoints require valid JWT
   - Verify user owns the offer before acceptance

2. **Rate Limiting**
   - Limit error tracking to prevent abuse
   - Rate limit lead analysis requests

3. **Offer Validation**
   - Verify offer hasn't expired before acceptance
   - Prevent offer ID tampering

4. **Payment Security**
   - Use Stripe's secure checkout
   - Validate webhook signatures
   - Never expose Stripe secret keys

5. **Data Privacy**
   - Hash sensitive error data
   - Anonymize analytics data
   - Comply with GDPR/CCPA

---

## 📞 SUPPORT

For questions or issues:
- Email: dev@fluencylab.com
- Docs: https://docs.fluencylab.com/dynamic-pricing
- API Status: https://status.fluencylab.com

---

## 📝 CHANGELOG

### Version 1.0.0 (2024-12-19)
- ✅ Initial release
- ✅ Multi-factor lead scoring algorithm
- ✅ Potential lead detection (C1 + management failures)
- ✅ Dynamic pricing with 4 discount tiers
- ✅ Personalized offer generation
- ✅ Time-limited urgency messaging
- ✅ JavaScript implementation (no Python dependency)
- ✅ In-memory storage for MVP
- ✅ Complete API documentation

---

**🎉 The Dynamic Pricing System is ready to drive revenue growth for The Fluency Lab!**

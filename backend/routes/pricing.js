// ============================================
// THE FLUENCY LAB - PRICING & OFFERS ROUTES
// Dynamic Pricing & Lead-Based Recommendations
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');
const { RESOURCES, ACTIONS } = require('../config/permissions.config');
const { spawn } = require('child_process');
const path = require('path');

// ============================================
// IN-MEMORY STORAGE (Use DB in production)
// ============================================

const userErrorHistory = new Map(); // userId -> [errors]
const activeOffers = new Map(); // userId -> offer
const leadScores = new Map(); // userId -> leadScore

// ============================================
// HELPER: Run Python Lead Scoring Service
// ============================================

/**
 * Execute Python lead scoring script
 * @param {Object} userData - User profile and error history
 * @returns {Promise<Object>} Lead score and offer data
 */
function runLeadScoringPython(userData) {
    return new Promise((resolve, reject) => {
        const pythonScript = path.join(__dirname, '../services/leadScoringService.py');
        
        // Spawn Python process
        const pythonProcess = spawn('python', [pythonScript]);
        
        let dataString = '';
        let errorString = '';
        
        // Send data to Python via stdin
        pythonProcess.stdin.write(JSON.stringify(userData));
        pythonProcess.stdin.end();
        
        // Collect stdout
        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });
        
        // Collect stderr
        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });
        
        // Handle completion
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Python process exited with code ${code}: ${errorString}`));
                return;
            }
            
            try {
                // Parse JSON output from Python
                const result = JSON.parse(dataString);
                resolve(result);
            } catch (error) {
                reject(new Error(`Failed to parse Python output: ${error.message}`));
            }
        });
    });
}

// ============================================
// MOCK LEAD SCORING (No Python required for demo)
// ============================================

/**
 * Mock lead scoring calculation (JavaScript implementation)
 * Used when Python is not available
 */
function calculateLeadScoreMock(userProfile, errorHistory) {
    // Analyze error patterns
    const errorsByDomain = {};
    const sessionsByDomain = {};
    
    errorHistory.forEach(error => {
        const domain = error.domain || 'general';
        const sessionId = error.session_id;
        
        if (!errorsByDomain[domain]) {
            errorsByDomain[domain] = [];
            sessionsByDomain[domain] = new Set();
        }
        
        errorsByDomain[domain].push(error);
        sessionsByDomain[domain].add(sessionId);
    });
    
    // Calculate patterns
    const errorPatterns = [];
    for (const [domain, errors] of Object.entries(errorsByDomain)) {
        const errorCount = errors.length;
        const totalSessions = sessionsByDomain[domain].size;
        const failureRate = errorCount / totalSessions;
        
        errorPatterns.push({
            domain,
            errorCount,
            totalSessions,
            failureRate,
            recentErrors: errors.slice(-5).map(e => e.error)
        });
    }
    
    // Calculate scores
    let readinessScore = 0;
    let urgencyScore = 0;
    let valueScore = 0;
    const triggers = [];
    
    // Readiness (based on level and role)
    if (['C1', 'C2'].includes(userProfile.current_level)) {
        readinessScore += 40;
        triggers.push(`Advanced level: ${userProfile.current_level}`);
    }
    
    if (userProfile.total_sessions >= 20) {
        readinessScore += 20;
        triggers.push(`High engagement: ${userProfile.total_sessions} sessions`);
    }
    
    if (['student', 'coach'].includes(userProfile.current_role)) {
        readinessScore += 20;
        triggers.push(`Paid user: ${userProfile.current_role}`);
    }
    
    readinessScore = Math.min(readinessScore, 100);
    
    // Urgency (based on error patterns)
    errorPatterns.forEach(pattern => {
        if (pattern.failureRate >= 0.4 && pattern.totalSessions >= 5) {
            urgencyScore += 30;
            triggers.push(`Consistent failures in ${pattern.domain}: ${(pattern.failureRate * 100).toFixed(1)}% error rate`);
        }
    });
    
    urgencyScore = Math.min(urgencyScore, 100);
    
    // Value (based on user tenure and role)
    if (['C1', 'C2'].includes(userProfile.current_level)) {
        valueScore += 40;
    }
    
    if (['student', 'coach'].includes(userProfile.current_role)) {
        valueScore += 30;
    }
    
    valueScore = Math.min(valueScore, 100);
    
    // Overall score
    const overallScore = (readinessScore * 0.35) + (urgencyScore * 0.40) + (valueScore * 0.25);
    
    // Classify lead
    let leadStatus = 'cold';
    const hasManagementIssues = errorPatterns.some(p => p.domain === 'management' && p.failureRate >= 0.4);
    const isCLevel = userProfile.current_level === 'C1' || userProfile.current_level === 'C2';
    
    if (hasManagementIssues && isCLevel) {
        leadStatus = 'potential_lead';
    } else if (overallScore >= 80) {
        leadStatus = 'qualified_lead';
    } else if (overallScore >= 60) {
        leadStatus = 'hot';
    } else if (overallScore >= 40) {
        leadStatus = 'warm';
    }
    
    // Generate offers
    const recommendedOffers = [];
    
    errorPatterns.forEach(pattern => {
        if (pattern.failureRate >= 0.4 && pattern.totalSessions >= 5) {
            let offerType = 'executive_it_english_module';
            let discountTier = 'STANDARD';
            let discountPercentage = 10;
            
            if (pattern.domain === 'management') {
                offerType = 'executive_it_english_module';
            } else if (pattern.domain === 'business') {
                offerType = 'advanced_business_communication';
            } else if (pattern.domain === 'technical') {
                offerType = 'technical_writing_mastery';
            }
            
            // Determine discount
            if (leadStatus === 'potential_lead' || leadStatus === 'qualified_lead') {
                if (pattern.failureRate >= 0.6) {
                    discountTier = 'LIMITED_TIME';
                    discountPercentage = 40;
                } else {
                    discountTier = 'EXCLUSIVE';
                    discountPercentage = 30;
                }
            } else if (leadStatus === 'hot') {
                discountTier = 'PREMIUM';
                discountPercentage = 20;
            }
            
            recommendedOffers.push({
                offer_type: offerType,
                domain: pattern.domain,
                failure_rate: pattern.failureRate,
                error_count: pattern.errorCount,
                discount_tier: discountTier,
                discount_percentage: discountPercentage,
                priority: (pattern.failureRate * 60) + (overallScore * 0.4)
            });
        }
    });
    
    // Sort by priority
    recommendedOffers.sort((a, b) => b.priority - a.priority);
    
    return {
        lead_score: {
            user_id: userProfile.user_id,
            lead_status: leadStatus,
            score: overallScore,
            readiness_score: readinessScore,
            urgency_score: urgencyScore,
            value_score: valueScore,
            triggers: triggers,
            recommended_offers: recommendedOffers.slice(0, 3),
            expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
        }
    };
}

/**
 * Create dynamic offer from recommendation
 */
function createDynamicOffer(userProfile, leadScore, offerRecommendation) {
    const MODULE_PRICES = {
        'executive_it_english_module': 299.00,
        'advanced_business_communication': 249.00,
        'technical_writing_mastery': 199.00,
        'negotiation_skills_pro': 279.00
    };
    
    const MODULE_NAMES = {
        'executive_it_english_module': 'Executive IT English Module',
        'advanced_business_communication': 'Advanced Business Communication',
        'technical_writing_mastery': 'Technical Writing Mastery',
        'negotiation_skills_pro': 'Negotiation Skills Pro'
    };
    
    const URGENCY_MESSAGES = {
        'LIMITED_TIME': '⚡ FLASH SALE: 40% OFF - Only 24 hours left!',
        'EXCLUSIVE': '🎯 Exclusive Offer: 30% OFF for C-level learners',
        'PREMIUM': '🌟 Premium Discount: 20% OFF - Limited time',
        'STANDARD': '✨ Special Offer: 10% OFF'
    };
    
    const offerType = offerRecommendation.offer_type;
    const discountPercentage = offerRecommendation.discount_percentage / 100;
    
    const originalPrice = MODULE_PRICES[offerType] || 299.00;
    const discountAmount = originalPrice * discountPercentage;
    const finalPrice = originalPrice - discountAmount;
    
    // Hours valid based on discount tier
    const hoursValid = offerRecommendation.discount_tier === 'LIMITED_TIME' ? 24 : 48;
    const expiresAt = new Date(Date.now() + hoursValid * 60 * 60 * 1000).toISOString();
    
    const offer = {
        offer_id: `OFFER-${userProfile.user_id}-${Date.now()}`,
        user_id: userProfile.user_id,
        offer_type: offerType,
        module_name: MODULE_NAMES[offerType] || 'Premium Module',
        original_price: originalPrice,
        discount_tier: offerRecommendation.discount_tier,
        discount_amount: discountAmount,
        discount_percentage: offerRecommendation.discount_percentage,
        final_price: finalPrice,
        urgency_message: URGENCY_MESSAGES[offerRecommendation.discount_tier],
        benefits: getBenefitsForModule(offerType, userProfile),
        social_proof: getSocialProofForModule(offerType),
        expires_at: expiresAt,
        created_at: new Date().toISOString()
    };
    
    return offer;
}

function getBenefitsForModule(offerType, userProfile) {
    const benefitsMap = {
        'executive_it_english_module': [
            'Master management terminology and leadership vocabulary',
            'Learn to conduct effective team meetings in English',
            'Practice strategic planning and decision-making discussions',
            'Handle conflict resolution and performance reviews',
            'Real-world IT management scenarios and role-plays',
            `Personalized for ${userProfile.current_level} level learners`
        ],
        'advanced_business_communication': [
            'Professional email and report writing',
            'Business presentation skills',
            'Negotiation and persuasion techniques',
            'Cross-cultural communication',
            'Executive communication strategies'
        ],
        'technical_writing_mastery': [
            'Documentation best practices',
            'API documentation writing',
            'Technical proposal creation',
            'Code review communication',
            'Release notes and changelogs'
        ],
        'negotiation_skills_pro': [
            'Contract negotiation vocabulary',
            'Salary discussion techniques',
            'Vendor management communication',
            'Conflict de-escalation',
            'Win-win negotiation strategies'
        ]
    };
    
    return benefitsMap[offerType] || [];
}

function getSocialProofForModule(offerType) {
    const proofMap = {
        'executive_it_english_module': 'Join 2,340+ IT managers who improved their English leadership skills by 67% in 30 days',
        'advanced_business_communication': 'Trusted by 5,000+ business professionals worldwide',
        'technical_writing_mastery': 'Used by engineers at Google, Microsoft, and Amazon',
        'negotiation_skills_pro': '4.9/5 rating from 1,200+ professionals'
    };
    
    return proofMap[offerType] || 'Highly rated by professionals';
}

// ============================================
// ROUTES
// ============================================

/**
 * POST /api/pricing/track-error
 * Track user error for lead scoring
 */
router.post('/track-error', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { error, category, domain, sessionId } = req.body;
        
        if (!error || !domain) {
            return res.status(400).json({
                success: false,
                error: 'Error and domain are required'
            });
        }
        
        // Get or create error history
        if (!userErrorHistory.has(userId)) {
            userErrorHistory.set(userId, []);
        }
        
        const errorEntry = {
            error,
            category: category || 'general',
            domain,
            session_id: sessionId || `session-${Date.now()}`,
            timestamp: new Date().toISOString()
        };
        
        userErrorHistory.get(userId).push(errorEntry);
        
        console.log(`📝 Tracked error for user ${userId}: ${domain} - ${error}`);
        
        res.json({
            success: true,
            message: 'Error tracked successfully',
            data: {
                total_errors: userErrorHistory.get(userId).length
            }
        });
        
    } catch (error) {
        console.error('❌ Track error failed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track error'
        });
    }
});

/**
 * POST /api/pricing/analyze-lead
 * Analyze user for lead scoring and generate offers
 */
router.post('/analyze-lead', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get user error history
        const errorHistory = userErrorHistory.get(userId) || [];
        
        if (errorHistory.length < 5) {
            return res.json({
                success: true,
                message: 'Insufficient data for lead analysis',
                data: {
                    min_errors_required: 5,
                    current_errors: errorHistory.length
                }
            });
        }
        
        // Build user profile
        const userProfile = {
            user_id: userId,
            current_level: req.user.englishLevel || 'B2',
            current_role: req.user.role,
            total_sessions: req.user.sessionCount || 10,
            join_date: req.user.createdAt || new Date().toISOString(),
            last_active: new Date().toISOString(),
            modules_completed: req.user.modulesCompleted || [],
            weak_areas: [],
            strong_areas: []
        };
        
        // Calculate lead score (mock implementation)
        const result = calculateLeadScoreMock(userProfile, errorHistory);
        
        // Store lead score
        leadScores.set(userId, result.lead_score);
        
        // Generate offer if potential lead
        let offer = null;
        if (result.lead_score.lead_status === 'potential_lead' && result.lead_score.recommended_offers.length > 0) {
            offer = createDynamicOffer(userProfile, result.lead_score, result.lead_score.recommended_offers[0]);
            activeOffers.set(userId, offer);
        }
        
        console.log(`🎯 Lead analysis complete for ${userId}: ${result.lead_score.lead_status} (${result.lead_score.score.toFixed(1)}/100)`);
        
        res.json({
            success: true,
            data: {
                lead_score: result.lead_score,
                offer: offer
            }
        });
        
    } catch (error) {
        console.error('❌ Lead analysis failed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze lead'
        });
    }
});

/**
 * GET /api/pricing/my-offers
 * Get active personalized offers for current user
 */
router.get('/my-offers', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const offer = activeOffers.get(userId);
        const leadScore = leadScores.get(userId);
        
        if (!offer) {
            return res.json({
                success: true,
                message: 'No active offers available',
                data: {
                    has_offers: false,
                    lead_score: leadScore || null
                }
            });
        }
        
        // Check if offer expired
        if (new Date(offer.expires_at) < new Date()) {
            activeOffers.delete(userId);
            return res.json({
                success: true,
                message: 'Offer expired',
                data: {
                    has_offers: false,
                    lead_score: leadScore || null
                }
            });
        }
        
        res.json({
            success: true,
            data: {
                has_offers: true,
                offer: offer,
                lead_score: leadScore || null
            }
        });
        
    } catch (error) {
        console.error('❌ Get offers failed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve offers'
        });
    }
});

/**
 * POST /api/pricing/accept-offer
 * Accept an offer (mock checkout)
 */
router.post('/accept-offer/:offerId', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { offerId } = req.params;
        
        const offer = activeOffers.get(userId);
        
        if (!offer || offer.offer_id !== offerId) {
            return res.status(404).json({
                success: false,
                error: 'Offer not found or expired'
            });
        }
        
        // Mock purchase (in production, integrate with Stripe/PayPal)
        console.log(`💳 User ${userId} accepted offer ${offerId} for $${offer.final_price}`);
        
        // Clear offer
        activeOffers.delete(userId);
        
        res.json({
            success: true,
            message: 'Offer accepted! Redirecting to checkout...',
            data: {
                order_id: `ORDER-${Date.now()}`,
                module: offer.module_name,
                amount: offer.final_price,
                checkout_url: `https://fluencylab.com/checkout/${offerId}`
            }
        });
        
    } catch (error) {
        console.error('❌ Accept offer failed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to accept offer'
        });
    }
});

/**
 * POST /api/pricing/simulate-potential-lead
 * Simulate a C1 user with management errors (for testing)
 */
router.post('/simulate-potential-lead', authenticate, requirePermission(RESOURCES.DIAGNOSTIC, ACTIONS.WRITE), async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Simulate C1 user profile
        const userProfile = {
            user_id: userId,
            current_level: 'C1',
            current_role: 'student',
            total_sessions: 25,
            join_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            last_active: new Date().toISOString(),
            modules_completed: ['diagnostic', 'daily_coach', 'progress_tracker'],
            weak_areas: ['management', 'leadership'],
            strong_areas: ['technical']
        };
        
        // Simulate management errors
        const managementErrors = [
            { error: 'Confused "actual" with "current"', category: 'vocabulary', domain: 'management', session_id: 'sim-001', timestamp: new Date().toISOString() },
            { error: 'Wrong: "responsible of" (correct: "responsible for")', category: 'grammar', domain: 'management', session_id: 'sim-002', timestamp: new Date().toISOString() },
            { error: 'Used "make a meeting" instead of "hold a meeting"', category: 'vocabulary', domain: 'management', session_id: 'sim-003', timestamp: new Date().toISOString() },
            { error: 'Wrong preposition: "delegate to" context', category: 'grammar', domain: 'management', session_id: 'sim-004', timestamp: new Date().toISOString() },
            { error: 'Misused "assist" vs "attend" in meetings', category: 'vocabulary', domain: 'management', session_id: 'sim-005', timestamp: new Date().toISOString() },
            { error: 'Wrong: "look out" instead of "oversee"', category: 'vocabulary', domain: 'management', session_id: 'sim-006', timestamp: new Date().toISOString() },
            { error: 'Confused "staff" (uncountable) with "staffs"', category: 'grammar', domain: 'management', session_id: 'sim-007', timestamp: new Date().toISOString() }
        ];
        
        // Store simulated errors
        userErrorHistory.set(userId, managementErrors);
        
        // Calculate lead score
        const result = calculateLeadScoreMock(userProfile, managementErrors);
        
        // Generate offer
        let offer = null;
        if (result.lead_score.recommended_offers.length > 0) {
            offer = createDynamicOffer(userProfile, result.lead_score, result.lead_score.recommended_offers[0]);
            activeOffers.set(userId, offer);
        }
        
        leadScores.set(userId, result.lead_score);
        
        console.log(`🎯 POTENTIAL LEAD SIMULATED: ${userId}`);
        console.log(`   Lead Status: ${result.lead_score.lead_status}`);
        console.log(`   Score: ${result.lead_score.score.toFixed(1)}/100`);
        
        res.json({
            success: true,
            message: '✅ Potential Lead simulation complete!',
            data: {
                user_profile: userProfile,
                simulated_errors: managementErrors.length,
                lead_score: result.lead_score,
                offer: offer,
                is_potential_lead: result.lead_score.lead_status === 'potential_lead'
            }
        });
        
    } catch (error) {
        console.error('❌ Simulation failed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to simulate potential lead'
        });
    }
});

module.exports = router;

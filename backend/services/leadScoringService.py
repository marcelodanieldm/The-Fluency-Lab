# ============================================
# THE FLUENCY LAB - LEAD SCORING SERVICE
# Dynamic Pricing & Intelligent Upgrade Recommendations
# ============================================

import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum

# ============================================
# ENUMS & DATA CLASSES
# ============================================

class LeadStatus(Enum):
    """Lead status classification"""
    COLD = "cold"
    WARM = "warm"
    HOT = "hot"
    POTENTIAL_LEAD = "potential_lead"
    QUALIFIED_LEAD = "qualified_lead"

class OfferType(Enum):
    """Type of upgrade offer"""
    EXECUTIVE_IT_MODULE = "executive_it_english_module"
    ADVANCED_BUSINESS = "advanced_business_communication"
    TECHNICAL_WRITING = "technical_writing_mastery"
    NEGOTIATION_SKILLS = "negotiation_skills_pro"

class DiscountTier(Enum):
    """Discount levels based on lead quality"""
    STANDARD = 0.10  # 10% off
    PREMIUM = 0.20   # 20% off
    EXCLUSIVE = 0.30 # 30% off
    LIMITED_TIME = 0.40  # 40% off (time-sensitive)

@dataclass
class ErrorPattern:
    """Pattern of user errors in specific domain"""
    domain: str  # e.g., "management", "technical", "business"
    error_count: int
    total_sessions: int
    failure_rate: float
    recent_errors: List[str]
    first_detected: str
    last_detected: str

@dataclass
class UserProfile:
    """User learning profile"""
    user_id: str
    current_level: str  # A1, A2, B1, B2, C1, C2
    current_role: str  # free, student, coach, superuser
    total_sessions: int
    join_date: str
    last_active: str
    modules_completed: List[str]
    weak_areas: List[str]
    strong_areas: List[str]

@dataclass
class LeadScore:
    """Lead scoring result"""
    user_id: str
    lead_status: LeadStatus
    score: float  # 0-100
    readiness_score: float  # 0-100 (likelihood to convert)
    urgency_score: float  # 0-100 (time sensitivity)
    value_score: float  # 0-100 (potential lifetime value)
    triggers: List[str]  # What triggered this lead score
    recommended_offers: List[Dict]
    expires_at: str

@dataclass
class DynamicOffer:
    """Personalized upgrade offer"""
    offer_id: str
    user_id: str
    offer_type: OfferType
    module_name: str
    original_price: float
    discount_tier: DiscountTier
    discount_amount: float
    final_price: float
    urgency_message: str
    benefits: List[str]
    social_proof: str
    expires_at: str
    created_at: str

# ============================================
# LEAD SCORING ENGINE
# ============================================

class LeadScoringEngine:
    """
    Intelligent lead scoring system that analyzes user behavior
    and recommends personalized upgrade offers
    """
    
    # Pricing configuration (in USD)
    MODULE_PRICES = {
        OfferType.EXECUTIVE_IT_MODULE: 299.00,
        OfferType.ADVANCED_BUSINESS: 249.00,
        OfferType.TECHNICAL_WRITING: 199.00,
        OfferType.NEGOTIATION_SKILLS: 279.00
    }
    
    # Domain-to-module mapping
    DOMAIN_TO_MODULE = {
        "management": OfferType.EXECUTIVE_IT_MODULE,
        "business": OfferType.ADVANCED_BUSINESS,
        "technical": OfferType.TECHNICAL_WRITING,
        "negotiation": OfferType.NEGOTIATION_SKILLS
    }
    
    # Thresholds for lead classification
    FAILURE_RATE_THRESHOLD = 0.4  # 40% failure rate
    MIN_SESSIONS_FOR_PATTERN = 5
    C_LEVEL_REQUIREMENTS = ["C1", "C2"]
    
    def __init__(self):
        """Initialize lead scoring engine"""
        self.error_patterns_db = {}  # In-memory storage (use DB in production)
        self.lead_scores_db = {}
        self.active_offers_db = {}
    
    def analyze_error_patterns(self, user_id: str, error_history: List[Dict]) -> List[ErrorPattern]:
        """
        Analyze user's error history to detect patterns
        
        Args:
            user_id: User ID
            error_history: List of error events with structure:
                {
                    'error': str,
                    'category': str,
                    'domain': str,
                    'timestamp': str,
                    'session_id': str
                }
        
        Returns:
            List of detected error patterns
        """
        if not error_history:
            return []
        
        # Group errors by domain
        domain_errors = {}
        for error in error_history:
            domain = error.get('domain', 'general')
            if domain not in domain_errors:
                domain_errors[domain] = []
            domain_errors[domain].append(error)
        
        patterns = []
        
        for domain, errors in domain_errors.items():
            # Count unique sessions
            sessions = set(e['session_id'] for e in errors)
            error_count = len(errors)
            total_sessions = len(sessions)
            
            # Calculate failure rate
            failure_rate = error_count / total_sessions if total_sessions > 0 else 0
            
            # Get recent errors (last 5)
            recent_errors = [e['error'] for e in sorted(
                errors,
                key=lambda x: x['timestamp'],
                reverse=True
            )[:5]]
            
            # Timestamps
            timestamps = [e['timestamp'] for e in errors]
            first_detected = min(timestamps)
            last_detected = max(timestamps)
            
            pattern = ErrorPattern(
                domain=domain,
                error_count=error_count,
                total_sessions=total_sessions,
                failure_rate=failure_rate,
                recent_errors=recent_errors,
                first_detected=first_detected,
                last_detected=last_detected
            )
            
            patterns.append(pattern)
        
        return patterns
    
    def calculate_lead_score(
        self,
        user_profile: UserProfile,
        error_patterns: List[ErrorPattern]
    ) -> LeadScore:
        """
        Calculate comprehensive lead score based on multiple factors
        
        Args:
            user_profile: User's learning profile
            error_patterns: Detected error patterns
        
        Returns:
            LeadScore with detailed scoring breakdown
        """
        triggers = []
        
        # 1. READINESS SCORE (0-100)
        # Based on user level and engagement
        readiness_score = 0.0
        
        # C-level users get higher readiness
        if user_profile.current_level in self.C_LEVEL_REQUIREMENTS:
            readiness_score += 40
            triggers.append(f"Advanced level: {user_profile.current_level}")
        elif user_profile.current_level in ["B2"]:
            readiness_score += 25
        else:
            readiness_score += 10
        
        # High session count indicates engagement
        if user_profile.total_sessions >= 20:
            readiness_score += 20
            triggers.append(f"High engagement: {user_profile.total_sessions} sessions")
        elif user_profile.total_sessions >= 10:
            readiness_score += 10
        
        # Existing student role indicates payment willingness
        if user_profile.current_role in ["student", "coach"]:
            readiness_score += 20
            triggers.append(f"Paid user: {user_profile.current_role}")
        
        # Modules completed shows commitment
        if len(user_profile.modules_completed) >= 3:
            readiness_score += 20
        
        # Cap at 100
        readiness_score = min(readiness_score, 100)
        
        # 2. URGENCY SCORE (0-100)
        # Based on error patterns and consistency
        urgency_score = 0.0
        
        high_failure_domains = []
        for pattern in error_patterns:
            if pattern.failure_rate >= self.FAILURE_RATE_THRESHOLD:
                if pattern.total_sessions >= self.MIN_SESSIONS_FOR_PATTERN:
                    urgency_score += 30
                    high_failure_domains.append(pattern.domain)
                    triggers.append(
                        f"Consistent failures in {pattern.domain}: "
                        f"{pattern.failure_rate*100:.1f}% error rate"
                    )
        
        # Recent activity increases urgency
        if user_profile.last_active:
            days_since_active = (
                datetime.now() - datetime.fromisoformat(user_profile.last_active)
            ).days
            
            if days_since_active <= 3:
                urgency_score += 30
                triggers.append("Recently active (last 3 days)")
            elif days_since_active <= 7:
                urgency_score += 15
        
        # Multiple weak areas increase urgency
        if len(user_profile.weak_areas) >= 3:
            urgency_score += 20
            triggers.append(f"Multiple weak areas: {len(user_profile.weak_areas)}")
        
        urgency_score = min(urgency_score, 100)
        
        # 3. VALUE SCORE (0-100)
        # Estimated lifetime value potential
        value_score = 0.0
        
        # C-level users have higher LTV
        if user_profile.current_level in self.C_LEVEL_REQUIREMENTS:
            value_score += 40
        
        # Existing paid users have proven willingness to pay
        if user_profile.current_role in ["student", "coach"]:
            value_score += 30
        
        # Long-term users are more valuable
        if user_profile.join_date:
            days_as_user = (
                datetime.now() - datetime.fromisoformat(user_profile.join_date)
            ).days
            
            if days_as_user >= 90:
                value_score += 30
                triggers.append(f"Long-term user: {days_as_user} days")
        
        value_score = min(value_score, 100)
        
        # 4. OVERALL LEAD SCORE (weighted average)
        overall_score = (
            readiness_score * 0.35 +
            urgency_score * 0.40 +
            value_score * 0.25
        )
        
        # 5. CLASSIFY LEAD STATUS
        lead_status = self._classify_lead(overall_score, triggers)
        
        # 6. GENERATE RECOMMENDED OFFERS
        recommended_offers = self._generate_recommended_offers(
            user_profile,
            error_patterns,
            lead_status,
            overall_score
        )
        
        # Create lead score
        lead_score = LeadScore(
            user_id=user_profile.user_id,
            lead_status=lead_status,
            score=overall_score,
            readiness_score=readiness_score,
            urgency_score=urgency_score,
            value_score=value_score,
            triggers=triggers,
            recommended_offers=recommended_offers,
            expires_at=(datetime.now() + timedelta(hours=48)).isoformat()
        )
        
        # Store in database
        self.lead_scores_db[user_profile.user_id] = lead_score
        
        return lead_score
    
    def _classify_lead(self, score: float, triggers: List[str]) -> LeadStatus:
        """Classify lead based on score and triggers"""
        
        # Special case: Management errors + C1 level = POTENTIAL_LEAD
        has_management_issues = any("management" in t.lower() for t in triggers)
        has_c_level = any("C1" in t or "C2" in t for t in triggers)
        
        if has_management_issues and has_c_level:
            return LeadStatus.POTENTIAL_LEAD
        
        # Score-based classification
        if score >= 80:
            return LeadStatus.QUALIFIED_LEAD
        elif score >= 60:
            return LeadStatus.HOT
        elif score >= 40:
            return LeadStatus.WARM
        else:
            return LeadStatus.COLD
    
    def _generate_recommended_offers(
        self,
        user_profile: UserProfile,
        error_patterns: List[ErrorPattern],
        lead_status: LeadStatus,
        lead_score: float
    ) -> List[Dict]:
        """Generate personalized offer recommendations"""
        
        offers = []
        
        # Find domains with high failure rates
        for pattern in error_patterns:
            if pattern.failure_rate >= self.FAILURE_RATE_THRESHOLD:
                if pattern.total_sessions >= self.MIN_SESSIONS_FOR_PATTERN:
                    
                    # Map domain to module offer
                    offer_type = self.DOMAIN_TO_MODULE.get(pattern.domain)
                    if not offer_type:
                        continue
                    
                    # Determine discount tier based on lead score
                    discount_tier = self._determine_discount_tier(
                        lead_status,
                        lead_score,
                        pattern.failure_rate
                    )
                    
                    offer = {
                        'offer_type': offer_type.value,
                        'domain': pattern.domain,
                        'failure_rate': pattern.failure_rate,
                        'error_count': pattern.error_count,
                        'discount_tier': discount_tier.name,
                        'discount_percentage': int(discount_tier.value * 100),
                        'priority': self._calculate_offer_priority(
                            pattern.failure_rate,
                            lead_score
                        )
                    }
                    
                    offers.append(offer)
        
        # Sort by priority (highest first)
        offers.sort(key=lambda x: x['priority'], reverse=True)
        
        return offers[:3]  # Return top 3 offers
    
    def _determine_discount_tier(
        self,
        lead_status: LeadStatus,
        lead_score: float,
        failure_rate: float
    ) -> DiscountTier:
        """Determine discount tier based on lead quality and urgency"""
        
        # POTENTIAL_LEAD or QUALIFIED_LEAD get best discounts
        if lead_status in [LeadStatus.POTENTIAL_LEAD, LeadStatus.QUALIFIED_LEAD]:
            if failure_rate >= 0.6:  # Very high failure rate
                return DiscountTier.LIMITED_TIME  # 40% off
            else:
                return DiscountTier.EXCLUSIVE  # 30% off
        
        # HOT leads get premium discounts
        elif lead_status == LeadStatus.HOT:
            return DiscountTier.PREMIUM  # 20% off
        
        # WARM leads get standard discounts
        elif lead_status == LeadStatus.WARM:
            return DiscountTier.STANDARD  # 10% off
        
        else:
            return DiscountTier.STANDARD
    
    def _calculate_offer_priority(self, failure_rate: float, lead_score: float) -> float:
        """Calculate offer priority (0-100)"""
        return (failure_rate * 60) + (lead_score * 0.4)
    
    def create_dynamic_offer(
        self,
        user_profile: UserProfile,
        lead_score: LeadScore,
        offer_recommendation: Dict
    ) -> DynamicOffer:
        """
        Create a personalized dynamic offer with time-limited discount
        
        Args:
            user_profile: User profile
            lead_score: Lead score analysis
            offer_recommendation: Recommended offer from lead scoring
        
        Returns:
            DynamicOffer with all details
        """
        
        offer_type = OfferType(offer_recommendation['offer_type'])
        discount_tier = DiscountTier[offer_recommendation['discount_tier']]
        
        # Calculate pricing
        original_price = self.MODULE_PRICES[offer_type]
        discount_amount = original_price * discount_tier.value
        final_price = original_price - discount_amount
        
        # Generate urgency message based on discount tier
        urgency_messages = {
            DiscountTier.LIMITED_TIME: "⚡ FLASH SALE: 40% OFF - Only 24 hours left!",
            DiscountTier.EXCLUSIVE: "🎯 Exclusive Offer: 30% OFF for C-level learners",
            DiscountTier.PREMIUM: "🌟 Premium Discount: 20% OFF - Limited time",
            DiscountTier.STANDARD: "✨ Special Offer: 10% OFF"
        }
        
        urgency_message = urgency_messages[discount_tier]
        
        # Generate benefits based on offer type
        benefits = self._generate_offer_benefits(offer_type, user_profile)
        
        # Generate social proof
        social_proof = self._generate_social_proof(offer_type)
        
        # Calculate expiration (24-72 hours based on urgency)
        if discount_tier == DiscountTier.LIMITED_TIME:
            hours_valid = 24
        elif discount_tier == DiscountTier.EXCLUSIVE:
            hours_valid = 48
        else:
            hours_valid = 72
        
        expires_at = (datetime.now() + timedelta(hours=hours_valid)).isoformat()
        
        # Create offer
        offer = DynamicOffer(
            offer_id=f"OFFER-{user_profile.user_id}-{int(datetime.now().timestamp())}",
            user_id=user_profile.user_id,
            offer_type=offer_type,
            module_name=self._get_module_name(offer_type),
            original_price=original_price,
            discount_tier=discount_tier,
            discount_amount=discount_amount,
            final_price=final_price,
            urgency_message=urgency_message,
            benefits=benefits,
            social_proof=social_proof,
            expires_at=expires_at,
            created_at=datetime.now().isoformat()
        )
        
        # Store in database
        self.active_offers_db[offer.offer_id] = offer
        
        return offer
    
    def _get_module_name(self, offer_type: OfferType) -> str:
        """Get human-readable module name"""
        names = {
            OfferType.EXECUTIVE_IT_MODULE: "Executive IT English Module",
            OfferType.ADVANCED_BUSINESS: "Advanced Business Communication",
            OfferType.TECHNICAL_WRITING: "Technical Writing Mastery",
            OfferType.NEGOTIATION_SKILLS: "Negotiation Skills Pro"
        }
        return names.get(offer_type, "Premium Module")
    
    def _generate_offer_benefits(self, offer_type: OfferType, user_profile: UserProfile) -> List[str]:
        """Generate personalized benefits list"""
        
        benefits_map = {
            OfferType.EXECUTIVE_IT_MODULE: [
                "Master management terminology and leadership vocabulary",
                "Learn to conduct effective team meetings in English",
                "Practice strategic planning and decision-making discussions",
                "Handle conflict resolution and performance reviews",
                "Real-world IT management scenarios and role-plays",
                f"Personalized for {user_profile.current_level} level learners"
            ],
            OfferType.ADVANCED_BUSINESS: [
                "Professional email and report writing",
                "Business presentation skills",
                "Negotiation and persuasion techniques",
                "Cross-cultural communication",
                "Executive communication strategies"
            ],
            OfferType.TECHNICAL_WRITING: [
                "Documentation best practices",
                "API documentation writing",
                "Technical proposal creation",
                "Code review communication",
                "Release notes and changelogs"
            ],
            OfferType.NEGOTIATION_SKILLS: [
                "Contract negotiation vocabulary",
                "Salary discussion techniques",
                "Vendor management communication",
                "Conflict de-escalation",
                "Win-win negotiation strategies"
            ]
        }
        
        return benefits_map.get(offer_type, [])
    
    def _generate_social_proof(self, offer_type: OfferType) -> str:
        """Generate social proof message"""
        
        proof_map = {
            OfferType.EXECUTIVE_IT_MODULE: "Join 2,340+ IT managers who improved their English leadership skills by 67% in 30 days",
            OfferType.ADVANCED_BUSINESS: "Trusted by 5,000+ business professionals worldwide",
            OfferType.TECHNICAL_WRITING: "Used by engineers at Google, Microsoft, and Amazon",
            OfferType.NEGOTIATION_SKILLS: "4.9/5 rating from 1,200+ professionals"
        }
        
        return proof_map.get(offer_type, "Highly rated by professionals")
    
    def check_potential_lead_criteria(
        self,
        user_profile: UserProfile,
        error_patterns: List[ErrorPattern]
    ) -> Tuple[bool, Optional[DynamicOffer]]:
        """
        Check if user meets "Potential Lead" criteria:
        - Fails constantly in "management" domain
        - Current level is C1
        
        Returns:
            (is_potential_lead, offer_if_applicable)
        """
        
        # Check if C1 level
        if user_profile.current_level != "C1":
            return False, None
        
        # Check for management failures
        management_pattern = None
        for pattern in error_patterns:
            if pattern.domain.lower() == "management":
                if pattern.failure_rate >= self.FAILURE_RATE_THRESHOLD:
                    if pattern.total_sessions >= self.MIN_SESSIONS_FOR_PATTERN:
                        management_pattern = pattern
                        break
        
        if not management_pattern:
            return False, None
        
        # POTENTIAL LEAD DETECTED!
        print(f"🎯 POTENTIAL LEAD DETECTED: User {user_profile.user_id}")
        print(f"   - Level: C1")
        print(f"   - Management failure rate: {management_pattern.failure_rate*100:.1f}%")
        print(f"   - Total errors: {management_pattern.error_count}")
        
        # Calculate lead score
        lead_score = self.calculate_lead_score(user_profile, error_patterns)
        
        # Create exclusive offer for Executive IT Module
        offer_recommendation = {
            'offer_type': OfferType.EXECUTIVE_IT_MODULE.value,
            'domain': 'management',
            'failure_rate': management_pattern.failure_rate,
            'error_count': management_pattern.error_count,
            'discount_tier': 'LIMITED_TIME',
            'discount_percentage': 40,
            'priority': 100
        }
        
        offer = self.create_dynamic_offer(
            user_profile,
            lead_score,
            offer_recommendation
        )
        
        return True, offer

# ============================================
# HELPER FUNCTIONS
# ============================================

def simulate_user_data():
    """Generate sample user data for testing"""
    
    # User profile
    user_profile = UserProfile(
        user_id="user-c1-manager-001",
        current_level="C1",
        current_role="student",
        total_sessions=25,
        join_date=(datetime.now() - timedelta(days=60)).isoformat(),
        last_active=datetime.now().isoformat(),
        modules_completed=["diagnostic", "daily_coach", "progress_tracker"],
        weak_areas=["management", "leadership", "team_communication"],
        strong_areas=["technical", "email_writing"]
    )
    
    # Simulated error history with consistent management failures
    error_history = [
        # Management errors (consistent pattern)
        {'error': 'Confused "actual" with "current" in management context', 'category': 'vocabulary', 'domain': 'management', 'timestamp': (datetime.now() - timedelta(days=2)).isoformat(), 'session_id': 'session-001'},
        {'error': 'Incorrect use of "responsible of" instead of "responsible for"', 'category': 'grammar', 'domain': 'management', 'timestamp': (datetime.now() - timedelta(days=3)).isoformat(), 'session_id': 'session-002'},
        {'error': 'Used "make a meeting" instead of "hold/conduct a meeting"', 'category': 'vocabulary', 'domain': 'management', 'timestamp': (datetime.now() - timedelta(days=5)).isoformat(), 'session_id': 'session-003'},
        {'error': 'Wrong preposition in "delegate to" context', 'category': 'grammar', 'domain': 'management', 'timestamp': (datetime.now() - timedelta(days=7)).isoformat(), 'session_id': 'session-004'},
        {'error': 'Misused "assist" vs "attend" in team meeting context', 'category': 'vocabulary', 'domain': 'management', 'timestamp': (datetime.now() - timedelta(days=8)).isoformat(), 'session_id': 'session-005'},
        {'error': 'Incorrect phrasal verb "look out" vs "oversee"', 'category': 'vocabulary', 'domain': 'management', 'timestamp': (datetime.now() - timedelta(days=10)).isoformat(), 'session_id': 'session-006'},
        {'error': 'Confused "staff" (uncountable) with "staffs"', 'category': 'grammar', 'domain': 'management', 'timestamp': (datetime.now() - timedelta(days=1)).isoformat(), 'session_id': 'session-007'},
        
        # Some technical errors (less frequent)
        {'error': 'Wrong article with "API"', 'category': 'grammar', 'domain': 'technical', 'timestamp': (datetime.now() - timedelta(days=4)).isoformat(), 'session_id': 'session-008'},
        {'error': 'Misspelled "authentication"', 'category': 'spelling', 'domain': 'technical', 'timestamp': (datetime.now() - timedelta(days=6)).isoformat(), 'session_id': 'session-009'},
    ]
    
    return user_profile, error_history

def print_lead_analysis(lead_score: LeadScore, offer: Optional[DynamicOffer] = None):
    """Pretty print lead analysis results"""
    
    print("\n" + "="*70)
    print("📊 LEAD SCORING ANALYSIS REPORT")
    print("="*70)
    
    print(f"\n🆔 User ID: {lead_score.user_id}")
    print(f"🏷️  Lead Status: {lead_score.lead_status.value.upper()}")
    print(f"📈 Overall Score: {lead_score.score:.1f}/100")
    
    print(f"\n📊 Score Breakdown:")
    print(f"   Readiness Score:  {lead_score.readiness_score:.1f}/100")
    print(f"   Urgency Score:    {lead_score.urgency_score:.1f}/100")
    print(f"   Value Score:      {lead_score.value_score:.1f}/100")
    
    print(f"\n🎯 Triggers ({len(lead_score.triggers)}):")
    for i, trigger in enumerate(lead_score.triggers, 1):
        print(f"   {i}. {trigger}")
    
    print(f"\n💼 Recommended Offers ({len(lead_score.recommended_offers)}):")
    for i, rec_offer in enumerate(lead_score.recommended_offers, 1):
        print(f"\n   Offer #{i}:")
        print(f"   - Module: {rec_offer['offer_type']}")
        print(f"   - Domain: {rec_offer['domain']}")
        print(f"   - Discount: {rec_offer['discount_percentage']}% off ({rec_offer['discount_tier']})")
        print(f"   - Priority: {rec_offer['priority']:.1f}/100")
        print(f"   - Failure Rate: {rec_offer['failure_rate']*100:.1f}%")
    
    if offer:
        print("\n" + "="*70)
        print("🎁 DYNAMIC OFFER GENERATED")
        print("="*70)
        
        print(f"\n📦 Module: {offer.module_name}")
        print(f"💰 Pricing:")
        print(f"   Original Price: ${offer.original_price:.2f}")
        print(f"   Discount ({offer.discount_tier.name}): -${offer.discount_amount:.2f}")
        print(f"   Final Price: ${offer.final_price:.2f}")
        print(f"   You Save: {int(offer.discount_tier.value * 100)}%")
        
        print(f"\n⚡ {offer.urgency_message}")
        print(f"⏰ Expires: {offer.expires_at}")
        
        print(f"\n✨ Benefits:")
        for i, benefit in enumerate(offer.benefits, 1):
            print(f"   {i}. {benefit}")
        
        print(f"\n👥 {offer.social_proof}")
    
    print("\n" + "="*70 + "\n")

# ============================================
# MAIN EXECUTION
# ============================================

if __name__ == "__main__":
    print("🚀 Fluency Lab - Lead Scoring & Dynamic Pricing System")
    print("="*70)
    
    # Initialize engine
    engine = LeadScoringEngine()
    
    # Generate sample data
    print("\n📥 Loading user data...")
    user_profile, error_history = simulate_user_data()
    
    print(f"✅ User Profile: {user_profile.user_id}")
    print(f"   Level: {user_profile.current_level}")
    print(f"   Role: {user_profile.current_role}")
    print(f"   Total Sessions: {user_profile.total_sessions}")
    print(f"   Total Errors: {len(error_history)}")
    
    # Analyze error patterns
    print("\n🔍 Analyzing error patterns...")
    error_patterns = engine.analyze_error_patterns(user_profile.user_id, error_history)
    
    print(f"✅ Found {len(error_patterns)} error patterns:")
    for pattern in error_patterns:
        print(f"   - {pattern.domain}: {pattern.error_count} errors across {pattern.total_sessions} sessions")
        print(f"     Failure Rate: {pattern.failure_rate*100:.1f}%")
    
    # Check for Potential Lead criteria
    print("\n🎯 Checking Potential Lead criteria...")
    is_potential_lead, offer = engine.check_potential_lead_criteria(
        user_profile,
        error_patterns
    )
    
    if is_potential_lead:
        print("✅ User meets POTENTIAL LEAD criteria!")
        print("   ✓ Level is C1")
        print("   ✓ Consistent failures in management domain")
        
        # Get full lead score
        lead_score = engine.lead_scores_db.get(user_profile.user_id)
        
        # Print analysis
        print_lead_analysis(lead_score, offer)
        
        # Export to JSON
        print("💾 Exporting offer data...")
        offer_data = {
            'lead_score': asdict(lead_score),
            'offer': asdict(offer) if offer else None
        }
        
        print("\n📄 Offer JSON:")
        print(json.dumps(offer_data, indent=2, default=str))
        
    else:
        print("❌ User does not meet Potential Lead criteria")
    
    print("\n✅ Analysis complete!")

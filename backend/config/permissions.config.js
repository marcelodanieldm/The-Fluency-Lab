// ============================================
// THE FLUENCY LAB - PERMISSIONS CONFIGURATION
// Role-Based Access Control (RBAC) Matrix
// ============================================

/**
 * Permission levels define what each role can access
 * Hierarchy: FREE (10) < STUDENT (30) < COACH (50) < SUPERUSER (100)
 */

const ROLE_LEVELS = {
    FREE: 10,
    STUDENT: 30,
    COACH: 50,
    SUPERUSER: 100
};

const ROLES = {
    FREE: 'free',
    STUDENT: 'student',
    COACH: 'coach',
    SUPERUSER: 'superuser'
};

/**
 * Resource definitions for each module
 */
const RESOURCES = {
    // Free tier
    DIAGNOSTIC: 'diagnostic',
    
    // Student tier
    DAILY_COACH: 'daily_coach',
    PROGRESS_TRACKER: 'progress_tracker',
    LEARNING_PATH: 'learning_path',
    FLASHCARDS: 'flashcards',
    ERROR_ANALYSIS: 'error_analysis',
    SENTIMENT_ANALYSIS: 'sentiment_analysis',
    ENGLISH_LEVEL: 'english_level',
    SOFT_SKILLS: 'soft_skills',
    
    // Coach tier
    SCENARIOS: 'scenarios',
    
    // SuperUser tier
    REVENUE_DASHBOARD: 'revenue_dashboard',
    RETENTION_DASHBOARD: 'retention_dashboard',
    USER_MANAGEMENT: 'user_management',
    SYSTEM_CONFIG: 'system_config',
    AUDIT_LOGS: 'audit_logs'
};

/**
 * Action types for permissions
 */
const ACTIONS = {
    READ: 'read',
    WRITE: 'write',
    DELETE: 'delete',
    ADMIN: 'admin'
};

/**
 * Permission matrix: defines which roles have access to which resources
 * Format: { resource: { action: [roles] } }
 */
const PERMISSIONS_MATRIX = {
    // ============================================
    // FREE TIER - Only Diagnostic Module
    // ============================================
    [RESOURCES.DIAGNOSTIC]: {
        [ACTIONS.READ]: [ROLES.FREE, ROLES.STUDENT, ROLES.COACH, ROLES.SUPERUSER],
        [ACTIONS.WRITE]: [ROLES.FREE, ROLES.STUDENT, ROLES.COACH, ROLES.SUPERUSER]
    },

    // ============================================
    // STUDENT TIER - All coaching features
    // ============================================
    [RESOURCES.DAILY_COACH]: {
        [ACTIONS.READ]: [ROLES.STUDENT, ROLES.COACH, ROLES.SUPERUSER],
        [ACTIONS.WRITE]: [ROLES.STUDENT, ROLES.COACH, ROLES.SUPERUSER]
    },

    [RESOURCES.PROGRESS_TRACKER]: {
        [ACTIONS.READ]: [ROLES.STUDENT, ROLES.COACH, ROLES.SUPERUSER],
        [ACTIONS.WRITE]: [ROLES.STUDENT, ROLES.COACH, ROLES.SUPERUSER]
    },

    [RESOURCES.LEARNING_PATH]: {
        [ACTIONS.READ]: [ROLES.STUDENT, ROLES.COACH, ROLES.SUPERUSER],
        [ACTIONS.WRITE]: [ROLES.STUDENT, ROLES.COACH, ROLES.SUPERUSER]
    },

    [RESOURCES.FLASHCARDS]: {
        [ACTIONS.READ]: [ROLES.STUDENT, ROLES.COACH, ROLES.SUPERUSER],
        [ACTIONS.WRITE]: [ROLES.STUDENT, ROLES.COACH, ROLES.SUPERUSER]
    },

    [RESOURCES.ERROR_ANALYSIS]: {
        [ACTIONS.READ]: [ROLES.STUDENT, ROLES.COACH, ROLES.SUPERUSER],
        [ACTIONS.WRITE]: [ROLES.STUDENT, ROLES.COACH, ROLES.SUPERUSER]
    },

    [RESOURCES.SENTIMENT_ANALYSIS]: {
        [ACTIONS.READ]: [ROLES.STUDENT, ROLES.COACH, ROLES.SUPERUSER],
        [ACTIONS.WRITE]: [ROLES.STUDENT, ROLES.COACH, ROLES.SUPERUSER]
    },

    [RESOURCES.ENGLISH_LEVEL]: {
        [ACTIONS.READ]: [ROLES.STUDENT, ROLES.COACH, ROLES.SUPERUSER],
        [ACTIONS.WRITE]: [ROLES.STUDENT, ROLES.COACH, ROLES.SUPERUSER]
    },

    [RESOURCES.SOFT_SKILLS]: {
        [ACTIONS.READ]: [ROLES.STUDENT, ROLES.COACH, ROLES.SUPERUSER],
        [ACTIONS.WRITE]: [ROLES.STUDENT, ROLES.COACH, ROLES.SUPERUSER]
    },

    // ============================================
    // COACH TIER - Scenario Management
    // ============================================
    [RESOURCES.SCENARIOS]: {
        [ACTIONS.READ]: [ROLES.COACH, ROLES.SUPERUSER],
        [ACTIONS.WRITE]: [ROLES.COACH, ROLES.SUPERUSER],
        [ACTIONS.DELETE]: [ROLES.COACH, ROLES.SUPERUSER],
        [ACTIONS.ADMIN]: [ROLES.SUPERUSER] // Only SuperUser can manage coaches
    },

    // ============================================
    // SUPERUSER TIER - Analytics & Administration
    // ============================================
    [RESOURCES.REVENUE_DASHBOARD]: {
        [ACTIONS.READ]: [ROLES.SUPERUSER],
        [ACTIONS.WRITE]: [ROLES.SUPERUSER],
        [ACTIONS.ADMIN]: [ROLES.SUPERUSER]
    },

    [RESOURCES.RETENTION_DASHBOARD]: {
        [ACTIONS.READ]: [ROLES.SUPERUSER],
        [ACTIONS.WRITE]: [ROLES.SUPERUSER],
        [ACTIONS.ADMIN]: [ROLES.SUPERUSER]
    },

    [RESOURCES.USER_MANAGEMENT]: {
        [ACTIONS.READ]: [ROLES.SUPERUSER],
        [ACTIONS.WRITE]: [ROLES.SUPERUSER],
        [ACTIONS.DELETE]: [ROLES.SUPERUSER],
        [ACTIONS.ADMIN]: [ROLES.SUPERUSER]
    },

    [RESOURCES.SYSTEM_CONFIG]: {
        [ACTIONS.READ]: [ROLES.SUPERUSER],
        [ACTIONS.WRITE]: [ROLES.SUPERUSER],
        [ACTIONS.ADMIN]: [ROLES.SUPERUSER]
    },

    [RESOURCES.AUDIT_LOGS]: {
        [ACTIONS.READ]: [ROLES.SUPERUSER],
        [ACTIONS.ADMIN]: [ROLES.SUPERUSER]
    }
};

/**
 * Feature flags for each role (what modules they can see)
 */
const ROLE_FEATURES = {
    [ROLES.FREE]: {
        modules: ['diagnostic'],
        description: 'Free tier - Access to Diagnostic module only',
        maxAnalysisPerDay: 5,
        canExportData: false
    },

    [ROLES.STUDENT]: {
        modules: [
            'diagnostic',
            'daily_coach',
            'progress_tracker',
            'learning_path',
            'flashcards',
            'error_analysis',
            'sentiment_analysis',
            'english_level',
            'soft_skills'
        ],
        description: 'Student tier - Full learning experience',
        maxAnalysisPerDay: 50,
        canExportData: true,
        hasProgressTracking: true,
        hasPersonalizedLearning: true
    },

    [ROLES.COACH]: {
        modules: [
            'diagnostic',
            'daily_coach',
            'progress_tracker',
            'learning_path',
            'flashcards',
            'error_analysis',
            'sentiment_analysis',
            'english_level',
            'soft_skills',
            'scenarios',
            'scenario_management'
        ],
        description: 'AI Admin - Can create and manage scenarios',
        maxAnalysisPerDay: 999,
        canExportData: true,
        hasProgressTracking: true,
        hasPersonalizedLearning: true,
        canManageScenarios: true,
        canViewUserProgress: true // See student progress
    },

    [ROLES.SUPERUSER]: {
        modules: [
            'diagnostic',
            'daily_coach',
            'progress_tracker',
            'learning_path',
            'flashcards',
            'error_analysis',
            'sentiment_analysis',
            'english_level',
            'soft_skills',
            'scenarios',
            'scenario_management',
            'revenue_dashboard',
            'retention_dashboard',
            'user_management',
            'system_config',
            'audit_logs'
        ],
        description: 'Super Admin - Full system access',
        maxAnalysisPerDay: 999,
        canExportData: true,
        hasProgressTracking: true,
        hasPersonalizedLearning: true,
        canManageScenarios: true,
        canViewUserProgress: true,
        canManageUsers: true,
        canViewRevenue: true,
        canConfigureSystem: true
    }
};

/**
 * Route-to-resource mapping
 * Maps API routes to their required permissions
 */
const ROUTE_PERMISSIONS = {
    // Diagnostic (Free tier)
    'POST /api/sentiment': { resource: RESOURCES.DIAGNOSTIC, action: ACTIONS.WRITE },
    'GET /api/sentiment/history': { resource: RESOURCES.DIAGNOSTIC, action: ACTIONS.READ },

    // Learning Path (Student tier)
    'GET /api/learning-path': { resource: RESOURCES.LEARNING_PATH, action: ACTIONS.READ },
    'POST /api/learning-path/complete': { resource: RESOURCES.LEARNING_PATH, action: ACTIONS.WRITE },

    // Flashcards (Student tier)
    'POST /api/flashcards/generate': { resource: RESOURCES.FLASHCARDS, action: ACTIONS.WRITE },
    'POST /api/flashcards/simulate': { resource: RESOURCES.FLASHCARDS, action: ACTIONS.WRITE },
    'GET /api/flashcards/patterns': { resource: RESOURCES.FLASHCARDS, action: ACTIONS.READ },
    'GET /api/flashcards/history/:userId': { resource: RESOURCES.FLASHCARDS, action: ACTIONS.READ },

    // Progress Tracker (Student tier)
    'GET /api/progress/summary': { resource: RESOURCES.PROGRESS_TRACKER, action: ACTIONS.READ },
    'POST /api/progress/update': { resource: RESOURCES.PROGRESS_TRACKER, action: ACTIONS.WRITE },

    // Scenarios (Coach tier)
    'GET /api/scenarios': { resource: RESOURCES.SCENARIOS, action: ACTIONS.READ },
    'POST /api/scenarios': { resource: RESOURCES.SCENARIOS, action: ACTIONS.WRITE },
    'PUT /api/scenarios/:id': { resource: RESOURCES.SCENARIOS, action: ACTIONS.WRITE },
    'DELETE /api/scenarios/:id': { resource: RESOURCES.SCENARIOS, action: ACTIONS.DELETE },

    // Revenue Dashboard (SuperUser only)
    'GET /api/admin/revenue': { resource: RESOURCES.REVENUE_DASHBOARD, action: ACTIONS.READ },
    'GET /api/admin/retention': { resource: RESOURCES.RETENTION_DASHBOARD, action: ACTIONS.READ },

    // User Management (SuperUser only)
    'GET /api/admin/users': { resource: RESOURCES.USER_MANAGEMENT, action: ACTIONS.READ },
    'PUT /api/admin/users/:id/role': { resource: RESOURCES.USER_MANAGEMENT, action: ACTIONS.WRITE },
    'DELETE /api/admin/users/:id': { resource: RESOURCES.USER_MANAGEMENT, action: ACTIONS.DELETE },

    // Audit Logs (SuperUser only)
    'GET /api/admin/audit-logs': { resource: RESOURCES.AUDIT_LOGS, action: ACTIONS.READ }
};

/**
 * Helper functions
 */

/**
 * Check if a role has permission for a resource and action
 * @param {string} roleName - Role name (e.g., 'student')
 * @param {string} resource - Resource name (e.g., 'diagnostic')
 * @param {string} action - Action type (e.g., 'read')
 * @returns {boolean}
 */
function hasPermission(roleName, resource, action) {
    const permissions = PERMISSIONS_MATRIX[resource];
    if (!permissions) return false;

    const allowedRoles = permissions[action];
    if (!allowedRoles) return false;

    return allowedRoles.includes(roleName);
}

/**
 * Get all permissions for a role
 * @param {string} roleName - Role name
 * @returns {Array} Array of permission objects
 */
function getRolePermissions(roleName) {
    const permissions = [];

    Object.entries(PERMISSIONS_MATRIX).forEach(([resource, actions]) => {
        Object.entries(actions).forEach(([action, roles]) => {
            if (roles.includes(roleName)) {
                permissions.push({ resource, action });
            }
        });
    });

    return permissions;
}

/**
 * Get role features configuration
 * @param {string} roleName - Role name
 * @returns {Object} Feature configuration
 */
function getRoleFeatures(roleName) {
    return ROLE_FEATURES[roleName] || ROLE_FEATURES[ROLES.FREE];
}

/**
 * Check if role level is sufficient
 * @param {string} userRole - User's current role
 * @param {string} requiredRole - Required role
 * @returns {boolean}
 */
function hasRoleLevel(userRole, requiredRole) {
    const userLevel = ROLE_LEVELS[userRole.toUpperCase()] || 0;
    const requiredLevel = ROLE_LEVELS[requiredRole.toUpperCase()] || 0;
    return userLevel >= requiredLevel;
}

/**
 * Get permission requirements for a route
 * @param {string} method - HTTP method
 * @param {string} path - Route path
 * @returns {Object|null} Permission requirements
 */
function getRoutePermissions(method, path) {
    const routeKey = `${method} ${path}`;
    return ROUTE_PERMISSIONS[routeKey] || null;
}

module.exports = {
    ROLE_LEVELS,
    ROLES,
    RESOURCES,
    ACTIONS,
    PERMISSIONS_MATRIX,
    ROLE_FEATURES,
    ROUTE_PERMISSIONS,
    hasPermission,
    getRolePermissions,
    getRoleFeatures,
    hasRoleLevel,
    getRoutePermissions
};

// ============================================
// THE FLUENCY LAB - AUTHORIZATION MIDDLEWARE
// Role-Based Access Control (RBAC)
// ============================================

const {
    ROLES,
    RESOURCES,
    ACTIONS,
    hasPermission,
    getRoleFeatures,
    hasRoleLevel,
    getRoutePermissions
} = require('../config/permissions.config');

/**
 * Audit log storage (in-memory, replace with DB in production)
 */
const auditLogs = [];

/**
 * Log authorization event for audit trail
 * @param {Object} details - Event details
 */
function logAuthorizationEvent(details) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        ...details
    };

    auditLogs.push(logEntry);

    // Console log for development
    if (details.granted) {
        console.log(`✅ AUTHORIZED: ${details.user} (${details.role}) - ${details.action} on ${details.resource}`);
    } else {
        console.warn(`⛔ DENIED: ${details.user} (${details.role}) - ${details.action} on ${details.resource}`);
    }

    // In production, save to database
    // await saveAuditLog(logEntry);
}

/**
 * Get audit logs (for SuperUser dashboard)
 * @param {Object} filters - Filter options
 * @returns {Array} Filtered audit logs
 */
function getAuditLogs(filters = {}) {
    let logs = [...auditLogs];

    if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId);
    }

    if (filters.action) {
        logs = logs.filter(log => log.action === filters.action);
    }

    if (filters.granted !== undefined) {
        logs = logs.filter(log => log.granted === filters.granted);
    }

    if (filters.startDate) {
        logs = logs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
    }

    return logs.slice(-100); // Return last 100 entries
}

/**
 * Require specific permission middleware
 * Checks if user has permission to perform action on resource
 * 
 * Usage:
 *   router.post('/api/scenarios', 
 *     authenticate, 
 *     requirePermission(RESOURCES.SCENARIOS, ACTIONS.WRITE),
 *     (req, res) => { ... }
 *   );
 */
function requirePermission(resource, action) {
    return (req, res, next) => {
        // User must be authenticated first
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'You must be logged in to access this resource.'
            });
        }

        const userRole = req.user.role;
        const hasAccess = hasPermission(userRole, resource, action);

        // Log authorization attempt
        logAuthorizationEvent({
            userId: req.user.id,
            user: req.user.email,
            role: userRole,
            resource,
            action,
            granted: hasAccess,
            ip: req.ip,
            path: req.path,
            method: req.method
        });

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                error: 'Permission denied',
                message: `Your ${userRole} role does not have ${action} permission for ${resource}.`,
                requiredPermission: {
                    resource,
                    action
                },
                upgradeMessage: getSuggestedUpgrade(userRole, resource)
            });
        }

        next();
    };
}

/**
 * Require minimum role level middleware
 * Checks if user has at least the required role level
 * 
 * Usage:
 *   router.get('/api/admin/revenue', 
 *     authenticate, 
 *     requireRole(ROLES.SUPERUSER),
 *     (req, res) => { ... }
 *   );
 */
function requireRole(requiredRole) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'You must be logged in to access this resource.'
            });
        }

        const userRole = req.user.role;
        const hasAccess = hasRoleLevel(userRole, requiredRole);

        logAuthorizationEvent({
            userId: req.user.id,
            user: req.user.email,
            role: userRole,
            requiredRole,
            action: 'role_check',
            resource: req.path,
            granted: hasAccess,
            ip: req.ip,
            method: req.method
        });

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions',
                message: `This resource requires ${requiredRole} role or higher.`,
                currentRole: userRole,
                requiredRole,
                upgradeMessage: getSuggestedUpgrade(userRole, requiredRole)
            });
        }

        next();
    };
}

/**
 * Check if user owns the resource
 * Ensures users can only access their own data
 * 
 * Usage:
 *   router.get('/api/progress/:userId', 
 *     authenticate, 
 *     requireOwnership('userId'),
 *     (req, res) => { ... }
 *   );
 */
function requireOwnership(paramName = 'userId') {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const resourceUserId = req.params[paramName] || req.body[paramName];
        const currentUserId = req.user.id;

        // SuperUsers can access any resource
        if (req.user.role === ROLES.SUPERUSER) {
            return next();
        }

        // Check ownership
        if (resourceUserId !== currentUserId) {
            logAuthorizationEvent({
                userId: currentUserId,
                user: req.user.email,
                role: req.user.role,
                action: 'ownership_check',
                resource: req.path,
                granted: false,
                attemptedAccess: resourceUserId,
                ip: req.ip
            });

            return res.status(403).json({
                success: false,
                error: 'Access denied',
                message: 'You can only access your own data.'
            });
        }

        next();
    };
}

/**
 * Dynamic route permission checker
 * Automatically checks permissions based on route configuration
 * 
 * Usage:
 *   router.post('/api/flashcards/generate', authenticate, checkRoutePermission, handler);
 */
function checkRoutePermission(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }

    const routeKey = `${req.method} ${req.route?.path || req.path}`;
    const permissions = getRoutePermissions(req.method, req.route?.path || req.path);

    if (!permissions) {
        // No specific permission required, allow access
        return next();
    }

    const { resource, action } = permissions;
    const hasAccess = hasPermission(req.user.role, resource, action);

    logAuthorizationEvent({
        userId: req.user.id,
        user: req.user.email,
        role: req.user.role,
        resource,
        action,
        granted: hasAccess,
        ip: req.ip,
        path: req.path,
        method: req.method
    });

    if (!hasAccess) {
        return res.status(403).json({
            success: false,
            error: 'Permission denied',
            message: `Your ${req.user.role} role does not have access to this resource.`,
            requiredPermission: { resource, action },
            upgradeMessage: getSuggestedUpgrade(req.user.role, resource)
        });
    }

    next();
}

/**
 * Check usage limits based on role
 * Prevents abuse by enforcing rate limits per role
 * 
 * Usage:
 *   router.post('/api/sentiment', authenticate, checkUsageLimit('analysis'), handler);
 */
function checkUsageLimit(limitType = 'analysis') {
    const usageTracking = new Map(); // In production, use Redis

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const roleFeatures = getRoleFeatures(req.user.role);
        const userId = req.user.id;
        const today = new Date().toDateString();
        const trackingKey = `${userId}:${today}:${limitType}`;

        // Get current usage
        const currentUsage = usageTracking.get(trackingKey) || 0;

        // Check limit based on role
        let maxLimit;
        switch (limitType) {
            case 'analysis':
                maxLimit = roleFeatures.maxAnalysisPerDay;
                break;
            default:
                maxLimit = roleFeatures.maxAnalysisPerDay;
        }

        if (currentUsage >= maxLimit) {
            return res.status(429).json({
                success: false,
                error: 'Usage limit exceeded',
                message: `You have reached your daily limit of ${maxLimit} ${limitType} requests.`,
                currentRole: req.user.role,
                currentUsage,
                maxLimit,
                upgradeMessage: getSuggestedUpgrade(req.user.role, 'usage_limit')
            });
        }

        // Increment usage
        usageTracking.set(trackingKey, currentUsage + 1);

        // Attach usage info to request
        req.usageInfo = {
            current: currentUsage + 1,
            limit: maxLimit,
            remaining: maxLimit - (currentUsage + 1)
        };

        next();
    };
}

/**
 * Get suggested upgrade message based on current role and required resource
 * @param {string} currentRole - User's current role
 * @param {string} resource - Required resource or role
 * @returns {string} Upgrade suggestion message
 */
function getSuggestedUpgrade(currentRole, resource) {
    if (currentRole === ROLES.FREE) {
        return '🚀 Upgrade to Student plan to access advanced learning features, progress tracking, and unlimited analysis.';
    }

    if (currentRole === ROLES.STUDENT && resource === RESOURCES.SCENARIOS) {
        return '🎓 Upgrade to Coach plan to create and manage custom training scenarios.';
    }

    if (currentRole === ROLES.COACH && (resource === RESOURCES.REVENUE_DASHBOARD || resource === RESOURCES.USER_MANAGEMENT)) {
        return '👑 SuperUser access required for administrative and analytics features.';
    }

    if (resource === 'usage_limit') {
        return '📈 Upgrade your plan for higher usage limits and more features.';
    }

    return 'Contact support to upgrade your account for additional features.';
}

/**
 * Middleware to attach user role features to request
 * Makes role features available in route handlers
 */
function attachRoleFeatures(req, res, next) {
    if (req.user) {
        req.roleFeatures = getRoleFeatures(req.user.role);
    }
    next();
}

/**
 * Check if user's email is verified
 * Some features may require email verification
 */
function requireEmailVerification(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }

    // In production, check database
    // For now, assume all users are verified from token
    if (req.user.isEmailVerified === false) {
        return res.status(403).json({
            success: false,
            error: 'Email verification required',
            message: 'Please verify your email address to access this feature.'
        });
    }

    next();
}

/**
 * Check if user's subscription is active
 * For paid features
 */
function requireActiveSubscription(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }

    // Free users don't need subscription
    if (req.user.role === ROLES.FREE) {
        return next();
    }

    // In production, check subscription status from database
    const subscriptionActive = req.user.subscriptionStatus === 'active';

    if (!subscriptionActive) {
        return res.status(403).json({
            success: false,
            error: 'Subscription required',
            message: 'Your subscription has expired. Please renew to continue using premium features.'
        });
    }

    next();
}

module.exports = {
    // Main authorization middleware
    requirePermission,
    requireRole,
    requireOwnership,
    checkRoutePermission,
    checkUsageLimit,

    // Additional checks
    requireEmailVerification,
    requireActiveSubscription,

    // Utilities
    attachRoleFeatures,
    logAuthorizationEvent,
    getAuditLogs,
    getSuggestedUpgrade
};

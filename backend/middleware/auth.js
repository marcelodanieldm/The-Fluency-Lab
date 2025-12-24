// ============================================
// THE FLUENCY LAB - AUTHENTICATION MIDDLEWARE
// JWT Token Verification & Session Management
// ============================================

const jwt = require('jsonwebtoken');

// JWT Configuration (should be in .env file)
const JWT_SECRET = process.env.JWT_SECRET || 'fluencylab_secret_key_change_in_production_2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'; // Access token expires in 1 hour
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'; // Refresh token expires in 7 days

/**
 * In-memory session store (replace with Redis in production)
 * Structure: { userId: { refreshToken, sessions: [{ token, deviceInfo, expiresAt }] } }
 */
const sessionStore = new Map();

/**
 * Generate JWT access token
 * @param {Object} payload - User data to encode
 * @returns {string} JWT token
 */
function generateAccessToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Generate JWT refresh token
 * @param {Object} payload - User data to encode
 * @returns {string} JWT refresh token
 */
function generateRefreshToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded payload or null if invalid
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

/**
 * Store session in memory (or Redis in production)
 * @param {string} userId - User ID
 * @param {string} refreshToken - Refresh token
 * @param {Object} deviceInfo - Device information (browser, IP, etc.)
 */
function storeSession(userId, refreshToken, deviceInfo = {}) {
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

    if (!sessionStore.has(userId)) {
        sessionStore.set(userId, {
            sessions: []
        });
    }

    const userSessions = sessionStore.get(userId);
    userSessions.sessions.push({
        refreshToken,
        deviceInfo,
        expiresAt,
        createdAt: Date.now()
    });

    // Clean expired sessions
    userSessions.sessions = userSessions.sessions.filter(s => s.expiresAt > Date.now());

    sessionStore.set(userId, userSessions);
}

/**
 * Validate session exists and is active
 * @param {string} userId - User ID
 * @param {string} refreshToken - Refresh token
 * @returns {boolean}
 */
function isSessionValid(userId, refreshToken) {
    const userSessions = sessionStore.get(userId);
    if (!userSessions) return false;

    const session = userSessions.sessions.find(s => s.refreshToken === refreshToken);
    if (!session) return false;

    return session.expiresAt > Date.now();
}

/**
 * Remove specific session
 * @param {string} userId - User ID
 * @param {string} refreshToken - Refresh token
 */
function removeSession(userId, refreshToken) {
    const userSessions = sessionStore.get(userId);
    if (!userSessions) return;

    userSessions.sessions = userSessions.sessions.filter(s => s.refreshToken !== refreshToken);

    if (userSessions.sessions.length === 0) {
        sessionStore.delete(userId);
    } else {
        sessionStore.set(userId, userSessions);
    }
}

/**
 * Remove all sessions for a user (logout all devices)
 * @param {string} userId - User ID
 */
function removeAllSessions(userId) {
    sessionStore.delete(userId);
}

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 * 
 * Usage:
 *   router.get('/protected-route', authenticate, (req, res) => {
 *       // Access req.user here
 *   });
 */
const authenticate = (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'No token provided. Please login.'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token',
                message: 'Your session has expired. Please login again.'
            });
        }

        // Check if user is active (in production, query database)
        // For now, we trust the token
        if (decoded.isActive === false) {
            return res.status(403).json({
                success: false,
                error: 'Account disabled',
                message: 'Your account has been disabled. Contact support.'
            });
        }

        // Attach user to request
        req.user = {
            id: decoded.userId || decoded.id,
            email: decoded.email,
            username: decoded.username,
            role: decoded.role,
            roleLevel: decoded.roleLevel,
            permissions: decoded.permissions || []
        };

        // Log authentication for audit
        console.log(`🔐 Authenticated: ${req.user.email} (${req.user.role}) - ${req.method} ${req.path}`);

        next();
    } catch (error) {
        console.error('❌ Authentication error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication failed',
            message: 'An error occurred during authentication.'
        });
    }
};

/**
 * Optional Authentication Middleware
 * Attaches user if token is valid, but doesn't block if no token
 * 
 * Usage:
 *   router.get('/public-route', optionalAuthenticate, (req, res) => {
 *       // req.user exists if authenticated, otherwise undefined
 *   });
 */
const optionalAuthenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided, continue without user
            req.user = null;
            return next();
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        if (decoded && decoded.isActive !== false) {
            req.user = {
                id: decoded.userId || decoded.id,
                email: decoded.email,
                username: decoded.username,
                role: decoded.role,
                roleLevel: decoded.roleLevel,
                permissions: decoded.permissions || []
            };
        } else {
            req.user = null;
        }

        next();
    } catch (error) {
        console.error('⚠️ Optional authentication error:', error);
        req.user = null;
        next();
    }
};

/**
 * Extract device information from request
 * @param {Object} req - Express request object
 * @returns {Object} Device information
 */
function extractDeviceInfo(req) {
    return {
        userAgent: req.headers['user-agent'] || 'Unknown',
        ip: req.ip || req.connection.remoteAddress || 'Unknown',
        timestamp: new Date().toISOString()
    };
}

/**
 * Token refresh middleware
 * Generates new access token from valid refresh token
 * 
 * Usage:
 *   router.post('/auth/refresh', refreshToken);
 */
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token required',
                message: 'No refresh token provided.'
            });
        }

        // Verify refresh token
        const decoded = verifyToken(refreshToken);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: 'Invalid refresh token',
                message: 'Your refresh token is invalid or expired. Please login again.'
            });
        }

        const userId = decoded.userId || decoded.id;

        // Validate session exists
        if (!isSessionValid(userId, refreshToken)) {
            return res.status(401).json({
                success: false,
                error: 'Session expired',
                message: 'Your session has expired. Please login again.'
            });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken({
            userId: userId,
            email: decoded.email,
            username: decoded.username,
            role: decoded.role,
            roleLevel: decoded.roleLevel,
            permissions: decoded.permissions,
            isActive: decoded.isActive
        });

        return res.json({
            success: true,
            data: {
                accessToken: newAccessToken,
                expiresIn: JWT_EXPIRES_IN
            }
        });
    } catch (error) {
        console.error('❌ Token refresh error:', error);
        return res.status(500).json({
            success: false,
            error: 'Token refresh failed',
            message: 'An error occurred while refreshing your token.'
        });
    }
};

/**
 * Rate limiting middleware (simple implementation)
 * @param {number} maxRequests - Maximum requests per window
 * @param {number} windowMs - Time window in milliseconds
 */
function rateLimit(maxRequests = 100, windowMs = 15 * 60 * 1000) {
    const requests = new Map();

    return (req, res, next) => {
        const identifier = req.user?.id || req.ip;
        const now = Date.now();
        
        if (!requests.has(identifier)) {
            requests.set(identifier, []);
        }

        const userRequests = requests.get(identifier);
        
        // Remove old requests outside window
        const recentRequests = userRequests.filter(timestamp => now - timestamp < windowMs);
        
        if (recentRequests.length >= maxRequests) {
            return res.status(429).json({
                success: false,
                error: 'Too many requests',
                message: 'Rate limit exceeded. Please try again later.',
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }

        recentRequests.push(now);
        requests.set(identifier, recentRequests);

        next();
    };
}

/**
 * Check if user is authenticated (helper for routes)
 * @param {Object} req - Express request object
 * @returns {boolean}
 */
function isAuthenticated(req) {
    return req.user && req.user.id;
}

/**
 * Get current user from request
 * @param {Object} req - Express request object
 * @returns {Object|null}
 */
function getCurrentUser(req) {
    return req.user || null;
}

module.exports = {
    // Token functions
    generateAccessToken,
    generateRefreshToken,
    verifyToken,

    // Session management
    storeSession,
    isSessionValid,
    removeSession,
    removeAllSessions,

    // Middleware
    authenticate,
    optionalAuthenticate,
    refreshToken,
    rateLimit,

    // Helpers
    extractDeviceInfo,
    isAuthenticated,
    getCurrentUser,

    // Constants
    JWT_SECRET,
    JWT_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN
};

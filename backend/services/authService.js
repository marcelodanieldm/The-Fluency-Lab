// ============================================
// THE FLUENCY LAB - AUTHENTICATION SERVICE
// User Registration, Login, Password Management
// ============================================

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const {
    generateAccessToken,
    generateRefreshToken,
    storeSession,
    removeSession,
    removeAllSessions,
    extractDeviceInfo
} = require('../middleware/auth');
const { getRolePermissions, ROLES } = require('../config/permissions.config');

/**
 * In-memory user database (replace with PostgreSQL in production)
 * Structure matches database schema from database.sql
 */
const users = new Map();

// Initialize with sample users (for testing)
const sampleUsers = [
    {
        id: 'uuid-free-user-001',
        email: 'free@fluencylab.com',
        username: 'free_user',
        passwordHash: '$2b$10$YourHashHere', // Will be regenerated
        firstName: 'Free',
        lastName: 'User',
        role: ROLES.FREE,
        roleLevel: 10,
        isActive: true,
        isEmailVerified: true,
        subscriptionStatus: 'free',
        loginCount: 0,
        createdAt: new Date().toISOString()
    },
    {
        id: 'uuid-student-user-001',
        email: 'student@fluencylab.com',
        username: 'student_user',
        passwordHash: '$2b$10$YourHashHere',
        firstName: 'Student',
        lastName: 'User',
        role: ROLES.STUDENT,
        roleLevel: 30,
        isActive: true,
        isEmailVerified: true,
        subscriptionStatus: 'active',
        loginCount: 0,
        createdAt: new Date().toISOString()
    },
    {
        id: 'uuid-coach-user-001',
        email: 'coach@fluencylab.com',
        username: 'coach_admin',
        passwordHash: '$2b$10$YourHashHere',
        firstName: 'Coach',
        lastName: 'Admin',
        role: ROLES.COACH,
        roleLevel: 50,
        isActive: true,
        isEmailVerified: true,
        subscriptionStatus: 'active',
        loginCount: 0,
        createdAt: new Date().toISOString()
    },
    {
        id: 'uuid-superuser-001',
        email: 'superuser@fluencylab.com',
        username: 'super_admin',
        passwordHash: '$2b$10$YourHashHere',
        firstName: 'Super',
        lastName: 'Admin',
        role: ROLES.SUPERUSER,
        roleLevel: 100,
        isActive: true,
        isEmailVerified: true,
        subscriptionStatus: 'active',
        loginCount: 0,
        createdAt: new Date().toISOString()
    }
];

// Initialize sample users with proper password hashing
async function initializeSampleUsers() {
    const defaultPassword = 'FluencyLab2024!';
    
    for (const user of sampleUsers) {
        user.passwordHash = await hashPassword(defaultPassword);
        users.set(user.email, user);
    }
    
    console.log('✅ Sample users initialized:');
    console.log('   - free@fluencylab.com / FluencyLab2024!');
    console.log('   - student@fluencylab.com / FluencyLab2024!');
    console.log('   - coach@fluencylab.com / FluencyLab2024!');
    console.log('   - superuser@fluencylab.com / FluencyLab2024!');
}

// Initialize on module load
initializeSampleUsers();

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>}
 */
async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

/**
 * Generate unique user ID (UUID in production)
 * @returns {string}
 */
function generateUserId() {
    return `uuid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate email verification token
 * @returns {string}
 */
function generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user (without password)
 */
async function register(userData) {
    const { email, username, password, firstName, lastName, role = ROLES.FREE } = userData;

    // Validation
    if (!email || !username || !password) {
        throw new Error('Email, username, and password are required');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
    }

    // Password strength validation
    if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
    }

    // Check if email already exists
    if (users.has(email)) {
        throw new Error('Email already registered');
    }

    // Check if username already exists
    const usernameExists = Array.from(users.values()).some(u => u.username === username);
    if (usernameExists) {
        throw new Error('Username already taken');
    }

    // Only allow FREE role for self-registration
    const userRole = role === ROLES.FREE ? ROLES.FREE : ROLES.FREE;

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = {
        id: generateUserId(),
        email: email.toLowerCase(),
        username,
        passwordHash,
        firstName: firstName || '',
        lastName: lastName || '',
        role: userRole,
        roleLevel: 10, // Free tier
        isActive: true,
        isEmailVerified: false, // Requires email verification
        emailVerificationToken: generateVerificationToken(),
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        subscriptionStatus: 'free',
        loginCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Save user
    users.set(email, newUser);

    console.log(`✅ User registered: ${email} (${userRole})`);

    // Send verification email (mock)
    // await sendVerificationEmail(newUser);

    // Return user without password
    const { passwordHash: _, emailVerificationToken, ...userResponse } = newUser;
    return userResponse;
}

/**
 * Login user and generate tokens
 * @param {string} emailOrUsername - Email or username
 * @param {string} password - Password
 * @param {Object} req - Express request (for device info)
 * @returns {Promise<Object>} Tokens and user data
 */
async function login(emailOrUsername, password, req) {
    if (!emailOrUsername || !password) {
        throw new Error('Email/username and password are required');
    }

    // Find user by email or username
    let user = users.get(emailOrUsername.toLowerCase());
    
    if (!user) {
        // Try finding by username
        user = Array.from(users.values()).find(u => u.username === emailOrUsername);
    }

    if (!user) {
        throw new Error('Invalid credentials');
    }

    // Check if account is active
    if (!user.isActive) {
        throw new Error('Account has been disabled. Contact support.');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }

    // Update login stats
    user.loginCount = (user.loginCount || 0) + 1;
    user.lastLoginAt = new Date().toISOString();

    // Get user permissions
    const permissions = getRolePermissions(user.role);

    // Generate tokens
    const tokenPayload = {
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        roleLevel: user.roleLevel,
        permissions: permissions.map(p => `${p.resource}:${p.action}`),
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        subscriptionStatus: user.subscriptionStatus
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store session
    const deviceInfo = extractDeviceInfo(req);
    storeSession(user.id, refreshToken, deviceInfo);

    console.log(`✅ User logged in: ${user.email} (${user.role})`);

    // Return user and tokens (without password)
    const { passwordHash: _, emailVerificationToken, resetPasswordToken, ...userResponse } = user;

    return {
        user: userResponse,
        tokens: {
            accessToken,
            refreshToken,
            expiresIn: '1h'
        },
        permissions: permissions.map(p => ({
            resource: p.resource,
            action: p.action
        }))
    };
}

/**
 * Logout user (invalidate session)
 * @param {string} userId - User ID
 * @param {string} refreshToken - Refresh token to invalidate
 */
async function logout(userId, refreshToken) {
    removeSession(userId, refreshToken);
    console.log(`✅ User logged out: ${userId}`);
    return { success: true, message: 'Logged out successfully' };
}

/**
 * Logout from all devices
 * @param {string} userId - User ID
 */
async function logoutAll(userId) {
    removeAllSessions(userId);
    console.log(`✅ User logged out from all devices: ${userId}`);
    return { success: true, message: 'Logged out from all devices' };
}

/**
 * Verify email address
 * @param {string} token - Email verification token
 */
async function verifyEmail(token) {
    const user = Array.from(users.values()).find(u => u.emailVerificationToken === token);

    if (!user) {
        throw new Error('Invalid verification token');
    }

    if (new Date(user.emailVerificationExpires) < new Date()) {
        throw new Error('Verification token has expired');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    user.updatedAt = new Date().toISOString();

    console.log(`✅ Email verified: ${user.email}`);

    return { success: true, message: 'Email verified successfully' };
}

/**
 * Request password reset
 * @param {string} email - User email
 */
async function requestPasswordReset(email) {
    const user = users.get(email.toLowerCase());

    if (!user) {
        // Don't reveal if email exists
        return { success: true, message: 'If the email exists, a reset link has been sent' };
    }

    user.resetPasswordToken = generateVerificationToken();
    user.resetPasswordExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    user.updatedAt = new Date().toISOString();

    console.log(`✅ Password reset requested: ${email}`);
    console.log(`   Reset token: ${user.resetPasswordToken}`);

    // Send reset email (mock)
    // await sendPasswordResetEmail(user);

    return { success: true, message: 'Password reset link sent to your email' };
}

/**
 * Reset password with token
 * @param {string} token - Reset password token
 * @param {string} newPassword - New password
 */
async function resetPassword(token, newPassword) {
    const user = Array.from(users.values()).find(u => u.resetPasswordToken === token);

    if (!user) {
        throw new Error('Invalid reset token');
    }

    if (new Date(user.resetPasswordExpires) < new Date()) {
        throw new Error('Reset token has expired');
    }

    if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
    }

    // Hash new password
    user.passwordHash = await hashPassword(newPassword);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.updatedAt = new Date().toISOString();

    // Invalidate all sessions (force re-login)
    removeAllSessions(user.id);

    console.log(`✅ Password reset: ${user.email}`);

    return { success: true, message: 'Password reset successfully. Please login with your new password.' };
}

/**
 * Change password (for logged-in users)
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 */
async function changePassword(userId, currentPassword, newPassword) {
    const user = Array.from(users.values()).find(u => u.id === userId);

    if (!user) {
        throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
    }

    if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
    }

    // Hash new password
    user.passwordHash = await hashPassword(newPassword);
    user.updatedAt = new Date().toISOString();

    console.log(`✅ Password changed: ${user.email}`);

    return { success: true, message: 'Password changed successfully' };
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Object|null} User data (without password)
 */
async function getUserById(userId) {
    const user = Array.from(users.values()).find(u => u.id === userId);
    
    if (!user) {
        return null;
    }

    const { passwordHash, emailVerificationToken, resetPasswordToken, ...userResponse } = user;
    return userResponse;
}

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Object|null} User data (without password)
 */
async function getUserByEmail(email) {
    const user = users.get(email.toLowerCase());
    
    if (!user) {
        return null;
    }

    const { passwordHash, emailVerificationToken, resetPasswordToken, ...userResponse } = user;
    return userResponse;
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Profile updates
 */
async function updateProfile(userId, updates) {
    const user = Array.from(users.values()).find(u => u.id === userId);

    if (!user) {
        throw new Error('User not found');
    }

    // Only allow updating certain fields
    const allowedFields = ['firstName', 'lastName', 'username'];
    
    for (const field of allowedFields) {
        if (updates[field] !== undefined) {
            // Check username uniqueness if updating
            if (field === 'username') {
                const usernameExists = Array.from(users.values()).some(
                    u => u.username === updates.username && u.id !== userId
                );
                if (usernameExists) {
                    throw new Error('Username already taken');
                }
            }
            
            user[field] = updates[field];
        }
    }

    user.updatedAt = new Date().toISOString();

    console.log(`✅ Profile updated: ${user.email}`);

    const { passwordHash, emailVerificationToken, resetPasswordToken, ...userResponse } = user;
    return userResponse;
}

/**
 * Get all users (SuperUser only)
 * @returns {Array} All users (without passwords)
 */
async function getAllUsers() {
    return Array.from(users.values()).map(user => {
        const { passwordHash, emailVerificationToken, resetPasswordToken, ...userResponse } = user;
        return userResponse;
    });
}

module.exports = {
    register,
    login,
    logout,
    logoutAll,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    changePassword,
    getUserById,
    getUserByEmail,
    updateProfile,
    getAllUsers,
    hashPassword,
    comparePassword
};

// ============================================
// THE FLUENCY LAB - AUTHENTICATION ROUTES
// User Registration, Login, Profile Management
// ============================================

const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { authenticate, refreshToken } = require('../middleware/auth');
const { getRoleFeatures } = require('../config/permissions.config');

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================

/**
 * @route   POST /api/auth/register
 * @desc    Register new user account
 * @access  Public
 */
router.post('/register', async (req, res) => {
    try {
        const { email, username, password, firstName, lastName } = req.body;

        const user = await authService.register({
            email,
            username,
            password,
            firstName,
            lastName
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please verify your email to activate your account.',
            data: {
                user,
                verificationRequired: true
            }
        });
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user and generate tokens
 * @access  Public
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await authService.login(email, password, req);

        // Attach role features for frontend
        const roleFeatures = getRoleFeatures(result.user.role);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                ...result,
                roleFeatures
            }
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(401).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public (requires refresh token in body)
 */
router.post('/refresh', refreshToken);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify user email address
 * @access  Public
 */
router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const result = await authService.verifyEmail(token);

        res.json({
            success: true,
            message: 'Email verified successfully! You can now access all features.'
        });
    } catch (error) {
        console.error('❌ Email verification error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 */
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const result = await authService.requestPasswordReset(email);

        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('❌ Password reset request error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const result = await authService.resetPassword(token, newPassword);

        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('❌ Password reset error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// PROTECTED ROUTES (Authentication Required)
// ============================================

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await authService.getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Attach role features
        const roleFeatures = getRoleFeatures(user.role);

        res.json({
            success: true,
            data: {
                user,
                roleFeatures
            }
        });
    } catch (error) {
        console.error('❌ Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve user profile'
        });
    }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { firstName, lastName, username } = req.body;

        const updatedUser = await authService.updateProfile(req.user.id, {
            firstName,
            lastName,
            username
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: updatedUser
            }
        });
    } catch (error) {
        console.error('❌ Profile update error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password (for logged-in users)
 * @access  Private
 */
router.post('/change-password', authenticate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const result = await authService.changePassword(
            req.user.id,
            currentPassword,
            newPassword
        );

        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('❌ Change password error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate current session)
 * @access  Private
 */
router.post('/logout', authenticate, async (req, res) => {
    try {
        const { refreshToken } = req.body;

        await authService.logout(req.user.id, refreshToken);

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('❌ Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to logout'
        });
    }
});

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
router.post('/logout-all', authenticate, async (req, res) => {
    try {
        await authService.logoutAll(req.user.id);

        res.json({
            success: true,
            message: 'Logged out from all devices successfully'
        });
    } catch (error) {
        console.error('❌ Logout all error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to logout from all devices'
        });
    }
});

/**
 * @route   GET /api/auth/sessions
 * @desc    Get all active sessions for user
 * @access  Private
 */
router.get('/sessions', authenticate, async (req, res) => {
    try {
        // In production, fetch from database
        res.json({
            success: true,
            message: 'Sessions retrieved',
            data: {
                sessions: [], // Would contain active sessions
                note: 'Session management requires database implementation'
            }
        });
    } catch (error) {
        console.error('❌ Get sessions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve sessions'
        });
    }
});

/**
 * @route   GET /api/auth/permissions
 * @desc    Get current user's permissions
 * @access  Private
 */
router.get('/permissions', authenticate, async (req, res) => {
    try {
        const { getRolePermissions } = require('../config/permissions.config');
        const permissions = getRolePermissions(req.user.role);

        res.json({
            success: true,
            data: {
                role: req.user.role,
                roleLevel: req.user.roleLevel,
                permissions: permissions.map(p => ({
                    resource: p.resource,
                    action: p.action
                }))
            }
        });
    } catch (error) {
        console.error('❌ Get permissions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve permissions'
        });
    }
});

// ============================================
// ADMIN ROUTES (For testing/development)
// ============================================

/**
 * @route   GET /api/auth/test-users
 * @desc    Get list of test users (development only)
 * @access  Public (should be restricted in production)
 */
router.get('/test-users', (req, res) => {
    // Only in development
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ error: 'Not found' });
    }

    res.json({
        success: true,
        message: 'Test users for development',
        data: {
            users: [
                {
                    email: 'free@fluencylab.com',
                    password: 'FluencyLab2024!',
                    role: 'free',
                    features: 'Diagnostic module only'
                },
                {
                    email: 'student@fluencylab.com',
                    password: 'FluencyLab2024!',
                    role: 'student',
                    features: 'All learning features + progress tracking'
                },
                {
                    email: 'coach@fluencylab.com',
                    password: 'FluencyLab2024!',
                    role: 'coach',
                    features: 'All features + scenario management'
                },
                {
                    email: 'superuser@fluencylab.com',
                    password: 'FluencyLab2024!',
                    role: 'superuser',
                    features: 'Full admin access + revenue dashboard'
                }
            ]
        }
    });
});

module.exports = router;

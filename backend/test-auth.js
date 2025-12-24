// ============================================
// THE FLUENCY LAB - AUTHENTICATION TEST SUITE
// Test all authentication and authorization features
// ============================================

/**
 * PREREQUISITE: Backend server must be running
 * Run: npm run dev (in backend folder)
 */

const API_URL = 'http://localhost:3000/api';

// Test results storage
const testResults = [];

// Helper function to log test results
function logTest(testName, success, message) {
    const result = {
        test: testName,
        success,
        message,
        timestamp: new Date().toISOString()
    };
    testResults.push(result);
    
    const icon = success ? '✅' : '❌';
    console.log(`${icon} ${testName}: ${message}`);
}

// Store tokens globally for tests
let tokens = {};

/**
 * Test 1: View Test Users
 */
async function testViewTestUsers() {
    try {
        const response = await fetch(`${API_URL}/auth/test-users`);
        const data = await response.json();
        
        if (data.success && data.data.users.length === 4) {
            logTest('View Test Users', true, `Found ${data.data.users.length} test accounts`);
            return true;
        } else {
            logTest('View Test Users', false, 'Incorrect number of test users');
            return false;
        }
    } catch (error) {
        logTest('View Test Users', false, error.message);
        return false;
    }
}

/**
 * Test 2: Register New User
 */
async function testRegisterUser() {
    try {
        const newUser = {
            email: `testuser_${Date.now()}@test.com`,
            username: `testuser_${Date.now()}`,
            password: 'TestPassword123!',
            firstName: 'Test',
            lastName: 'User'
        };

        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });

        const data = await response.json();

        if (response.status === 201 && data.success && data.data.user.role === 'free') {
            logTest('Register User', true, `User registered with FREE role`);
            return true;
        } else {
            logTest('Register User', false, data.error || 'Registration failed');
            return false;
        }
    } catch (error) {
        logTest('Register User', false, error.message);
        return false;
    }
}

/**
 * Test 3: Login as Free User
 */
async function testLoginFree() {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'free@fluencylab.com',
                password: 'FluencyLab2024!'
            })
        });

        const data = await response.json();

        if (data.success && data.data.tokens.accessToken) {
            tokens.free = data.data.tokens.accessToken;
            logTest('Login Free User', true, `Token received, role: ${data.data.user.role}`);
            return true;
        } else {
            logTest('Login Free User', false, data.error || 'Login failed');
            return false;
        }
    } catch (error) {
        logTest('Login Free User', false, error.message);
        return false;
    }
}

/**
 * Test 4: Login as Student User
 */
async function testLoginStudent() {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'student@fluencylab.com',
                password: 'FluencyLab2024!'
            })
        });

        const data = await response.json();

        if (data.success && data.data.tokens.accessToken) {
            tokens.student = data.data.tokens.accessToken;
            const features = data.data.roleFeatures.modules.length;
            logTest('Login Student User', true, `Token received, ${features} modules accessible`);
            return true;
        } else {
            logTest('Login Student User', false, data.error || 'Login failed');
            return false;
        }
    } catch (error) {
        logTest('Login Student User', false, error.message);
        return false;
    }
}

/**
 * Test 5: Login as Coach User
 */
async function testLoginCoach() {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'coach@fluencylab.com',
                password: 'FluencyLab2024!'
            })
        });

        const data = await response.json();

        if (data.success && data.data.tokens.accessToken) {
            tokens.coach = data.data.tokens.accessToken;
            logTest('Login Coach User', true, `Token received, can manage scenarios: ${data.data.roleFeatures.canManageScenarios}`);
            return true;
        } else {
            logTest('Login Coach User', false, data.error || 'Login failed');
            return false;
        }
    } catch (error) {
        logTest('Login Coach User', false, error.message);
        return false;
    }
}

/**
 * Test 6: Login as SuperUser
 */
async function testLoginSuperUser() {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'superuser@fluencylab.com',
                password: 'FluencyLab2024!'
            })
        });

        const data = await response.json();

        if (data.success && data.data.tokens.accessToken) {
            tokens.superuser = data.data.tokens.accessToken;
            logTest('Login SuperUser', true, `Token received, can view revenue: ${data.data.roleFeatures.canViewRevenue}`);
            return true;
        } else {
            logTest('Login SuperUser', false, data.error || 'Login failed');
            return false;
        }
    } catch (error) {
        logTest('Login SuperUser', false, error.message);
        return false;
    }
}

/**
 * Test 7: Get Current User Profile
 */
async function testGetProfile() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${tokens.student}` }
        });

        const data = await response.json();

        if (data.success && data.data.user.email === 'student@fluencylab.com') {
            logTest('Get Profile', true, `Retrieved profile for ${data.data.user.username}`);
            return true;
        } else {
            logTest('Get Profile', false, data.error || 'Failed to get profile');
            return false;
        }
    } catch (error) {
        logTest('Get Profile', false, error.message);
        return false;
    }
}

/**
 * Test 8: Free User Cannot Access Flashcards
 */
async function testFreeUserDenied() {
    try {
        const response = await fetch(`${API_URL}/flashcards/patterns`, {
            headers: { 'Authorization': `Bearer ${tokens.free}` }
        });

        const data = await response.json();

        if (response.status === 403) {
            logTest('Free User Denied Flashcards', true, `Permission denied as expected: ${data.message}`);
            return true;
        } else {
            logTest('Free User Denied Flashcards', false, 'Free user should not access flashcards');
            return false;
        }
    } catch (error) {
        logTest('Free User Denied Flashcards', false, error.message);
        return false;
    }
}

/**
 * Test 9: Student User Can Access Flashcards
 */
async function testStudentUserAllowed() {
    try {
        const response = await fetch(`${API_URL}/flashcards/patterns`, {
            headers: { 'Authorization': `Bearer ${tokens.student}` }
        });

        const data = await response.json();

        if (response.status === 200 && data.summary) {
            logTest('Student User Access Flashcards', true, `Access granted, ${data.summary.total} patterns available`);
            return true;
        } else {
            logTest('Student User Access Flashcards', false, data.error || 'Access denied unexpectedly');
            return false;
        }
    } catch (error) {
        logTest('Student User Access Flashcards', false, error.message);
        return false;
    }
}

/**
 * Test 10: Sentiment Analysis Without Authentication
 */
async function testPublicAnalysis() {
    try {
        const response = await fetch(`${API_URL}/sentiment/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                transcription: 'This is a test message for sentiment analysis.',
                language: 'en'
            })
        });

        const data = await response.json();

        if (data.success && data.data.tone) {
            logTest('Public Sentiment Analysis', true, `Analysis completed without authentication`);
            return true;
        } else {
            logTest('Public Sentiment Analysis', false, data.error || 'Analysis failed');
            return false;
        }
    } catch (error) {
        logTest('Public Sentiment Analysis', false, error.message);
        return false;
    }
}

/**
 * Test 11: Usage Limit Tracking
 */
async function testUsageLimitTracking() {
    try {
        const response = await fetch(`${API_URL}/sentiment/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokens.free}`
            },
            body: JSON.stringify({
                transcription: 'Testing usage limits for free tier.',
                language: 'en'
            })
        });

        const data = await response.json();

        if (data.success && data.usageInfo) {
            logTest('Usage Limit Tracking', true, `Used ${data.usageInfo.current}/${data.usageInfo.limit}, ${data.usageInfo.remaining} remaining`);
            return true;
        } else {
            logTest('Usage Limit Tracking', false, 'Usage info not returned');
            return false;
        }
    } catch (error) {
        logTest('Usage Limit Tracking', false, error.message);
        return false;
    }
}

/**
 * Test 12: Get User Permissions
 */
async function testGetPermissions() {
    try {
        const response = await fetch(`${API_URL}/auth/permissions`, {
            headers: { 'Authorization': `Bearer ${tokens.student}` }
        });

        const data = await response.json();

        if (data.success && data.data.permissions.length > 0) {
            logTest('Get User Permissions', true, `Retrieved ${data.data.permissions.length} permissions`);
            return true;
        } else {
            logTest('Get User Permissions', false, data.error || 'No permissions found');
            return false;
        }
    } catch (error) {
        logTest('Get User Permissions', false, error.message);
        return false;
    }
}

/**
 * Test 13: Invalid Token
 */
async function testInvalidToken() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': 'Bearer invalid_token_12345' }
        });

        const data = await response.json();

        if (response.status === 401) {
            logTest('Invalid Token Rejected', true, 'Invalid token correctly rejected');
            return true;
        } else {
            logTest('Invalid Token Rejected', false, 'Invalid token should be rejected');
            return false;
        }
    } catch (error) {
        logTest('Invalid Token Rejected', false, error.message);
        return false;
    }
}

/**
 * Test 14: Student Cannot Access Learning Path Without Auth
 */
async function testLearningPathRequiresAuth() {
    try {
        const response = await fetch(`${API_URL}/learning-path/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                softSkills: {
                    persuasion: 70,
                    technicalClarity: 80,
                    empathy: 65,
                    conflictResolution: 75,
                    brevity: 85
                }
            })
        });

        const data = await response.json();

        if (response.status === 401) {
            logTest('Learning Path Requires Auth', true, 'Authentication required as expected');
            return true;
        } else {
            logTest('Learning Path Requires Auth', false, 'Should require authentication');
            return false;
        }
    } catch (error) {
        logTest('Learning Path Requires Auth', false, error.message);
        return false;
    }
}

/**
 * Run All Tests
 */
async function runAllTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 THE FLUENCY LAB - AUTHENTICATION TESTS');
    console.log('='.repeat(60) + '\n');

    console.log('📋 Running tests...\n');

    await testViewTestUsers();
    await testRegisterUser();
    await testLoginFree();
    await testLoginStudent();
    await testLoginCoach();
    await testLoginSuperUser();
    await testGetProfile();
    await testFreeUserDenied();
    await testStudentUserAllowed();
    await testPublicAnalysis();
    await testUsageLimitTracking();
    await testGetPermissions();
    await testInvalidToken();
    await testLearningPathRequiresAuth();

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));

    const passed = testResults.filter(r => r.success).length;
    const failed = testResults.filter(r => !r.success).length;
    const total = testResults.length;

    console.log(`\n✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);
    console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

    if (failed > 0) {
        console.log('❌ Failed Tests:');
        testResults.filter(r => !r.success).forEach(r => {
            console.log(`   - ${r.test}: ${r.message}`);
        });
    }

    console.log('\n' + '='.repeat(60) + '\n');
}

// Run tests if executed directly
if (typeof window === 'undefined') {
    runAllTests().catch(console.error);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllTests,
        testResults
    };
}

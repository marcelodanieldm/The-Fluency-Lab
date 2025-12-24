# 🔐 The Fluency Lab - Authentication & Authorization System

## Overview

Enterprise-grade authentication and role-based access control (RBAC) system for The Fluency Lab platform. Supports 4 user tiers with granular permissions and JWT-based authentication.

---

## 🎯 Role Hierarchy

| Role | Level | Access | Features |
|------|-------|--------|----------|
| **Free** | 10 | Diagnostic Only | 5 analysis/day, basic sentiment analysis |
| **Student** | 30 | Full Learning | Unlimited analysis, progress tracking, flashcards, learning paths |
| **Coach** | 50 | AI Admin | Everything + scenario management, content creation |
| **SuperUser** | 100 | Full Admin | Everything + revenue dashboard, user management, system config |

---

## 📁 System Architecture

```
backend/
├── config/
│   ├── database.sql              # PostgreSQL schema (13 tables)
│   └── permissions.config.js     # RBAC permissions matrix
├── middleware/
│   ├── auth.js                   # JWT authentication
│   └── permissions.js            # Authorization & RBAC
├── services/
│   └── authService.js            # User management logic
└── routes/
    └── auth.js                   # Authentication endpoints
```

---

## 🔑 Authentication Flow

### 1. Registration
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful!",
  "data": {
    "user": {
      "id": "uuid-...",
      "email": "user@example.com",
      "username": "johndoe",
      "role": "free",
      "isEmailVerified": false
    },
    "verificationRequired": true
  }
}
```

### 2. Login
```bash
POST /api/auth/login
{
  "email": "student@fluencylab.com",
  "password": "FluencyLab2024!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-student-001",
      "email": "student@fluencylab.com",
      "username": "student_user",
      "role": "student",
      "roleLevel": 30
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": "1h"
    },
    "permissions": [
      { "resource": "diagnostic", "action": "read" },
      { "resource": "daily_coach", "action": "write" }
    ],
    "roleFeatures": {
      "modules": ["diagnostic", "daily_coach", "progress_tracker", ...],
      "maxAnalysisPerDay": 50,
      "canExportData": true
    }
  }
}
```

### 3. Access Protected Resource
```bash
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### 4. Refresh Token
```bash
POST /api/auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 🛡️ Permission System

### Resource Permissions Matrix

| Resource | Free | Student | Coach | SuperUser |
|----------|------|---------|-------|-----------|
| **diagnostic** | ✅ R/W | ✅ R/W | ✅ R/W | ✅ R/W |
| **daily_coach** | ❌ | ✅ R/W | ✅ R/W | ✅ R/W |
| **progress_tracker** | ❌ | ✅ R/W | ✅ R/W | ✅ R/W |
| **learning_path** | ❌ | ✅ R/W | ✅ R/W | ✅ R/W |
| **flashcards** | ❌ | ✅ R/W | ✅ R/W | ✅ R/W |
| **scenarios** | ❌ | ❌ | ✅ R/W/D/A | ✅ R/W/D/A |
| **revenue_dashboard** | ❌ | ❌ | ❌ | ✅ R/W/A |
| **user_management** | ❌ | ❌ | ❌ | ✅ R/W/D/A |

**Actions:** R=Read, W=Write, D=Delete, A=Admin

---

## 🔒 Middleware Usage

### 1. Authentication Middleware

```javascript
const { authenticate, optionalAuthenticate } = require('./middleware/auth');

// Require authentication
router.get('/protected', authenticate, (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;
  // ... handle request
});

// Optional authentication (for public routes with enhanced features if logged in)
router.post('/analyze', optionalAuthenticate, (req, res) => {
  if (req.user) {
    // Enhanced features for logged in users
  } else {
    // Basic features
  }
});
```

### 2. Permission Middleware

```javascript
const { requirePermission, requireRole } = require('./middleware/permissions');
const { RESOURCES, ACTIONS } = require('../config/permissions.config');

// Require specific permission
router.post('/flashcards/generate', 
  authenticate,
  requirePermission(RESOURCES.FLASHCARDS, ACTIONS.WRITE),
  (req, res) => {
    // Only STUDENT+ can access
  }
);

// Require minimum role level
router.get('/admin/revenue',
  authenticate,
  requireRole(ROLES.SUPERUSER),
  (req, res) => {
    // Only SUPERUSER can access
  }
);
```

### 3. Usage Limit Middleware

```javascript
const { checkUsageLimit } = require('./middleware/permissions');

// Apply rate limits based on role
router.post('/sentiment/analyze',
  optionalAuthenticate,
  checkUsageLimit('analysis'), // FREE: 5/day, STUDENT: 50/day, COACH+: 999/day
  (req, res) => {
    // Response includes usage info
    console.log(req.usageInfo); // { current: 3, limit: 50, remaining: 47 }
  }
);
```

### 4. Ownership Middleware

```javascript
const { requireOwnership } = require('./middleware/permissions');

// Ensure users can only access their own data
router.get('/progress/:userId',
  authenticate,
  requireOwnership('userId'), // SuperUsers can access any user
  (req, res) => {
    // User can only see their own progress
  }
);
```

---

## 🎫 Test Accounts

**All test passwords:** `FluencyLab2024!`

| Email | Role | Features |
|-------|------|----------|
| free@fluencylab.com | FREE | Diagnostic only (5/day) |
| student@fluencylab.com | STUDENT | All learning features |
| coach@fluencylab.com | COACH | + Scenario management |
| superuser@fluencylab.com | SUPERUSER | Full admin access |

### Quick Test
```bash
# Login as student
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@fluencylab.com","password":"FluencyLab2024!"}'

# Use token
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 Database Schema Highlights

### Core Tables

1. **users** - User accounts with authentication
   - UUID primary key
   - bcrypt password hashing
   - Email verification tokens
   - Password reset tokens
   - Subscription management
   - Soft delete support

2. **roles** - System roles with hierarchy
   - name: free, student, coach, superuser
   - level: 10, 30, 50, 100

3. **permissions** - Granular permissions
   - resource: Module/feature name
   - action: read, write, delete, admin

4. **role_permissions** - RBAC mapping
   - Many-to-many relationship
   - Indexed for performance

5. **user_sessions** - JWT refresh tokens
   - Device tracking
   - Session expiration
   - Auto-cleanup trigger

6. **audit_logs** - Security audit trail
   - All authorization events
   - IP tracking
   - User agent logging

### Helper Functions

```sql
-- Check if user has permission
SELECT user_has_permission('uuid-123', 'flashcards', 'write');

-- Get all user permissions
SELECT * FROM get_user_permissions('uuid-123');

-- Check role level
SELECT user_has_role_level('uuid-123', 30); -- STUDENT or higher
```

---

## 🚀 API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login user |
| POST | `/api/auth/refresh` | Public | Refresh access token |
| POST | `/api/auth/logout` | Private | Logout (invalidate token) |
| POST | `/api/auth/logout-all` | Private | Logout all devices |
| GET | `/api/auth/me` | Private | Get current user |
| PUT | `/api/auth/profile` | Private | Update profile |
| POST | `/api/auth/change-password` | Private | Change password |
| POST | `/api/auth/forgot-password` | Public | Request reset email |
| POST | `/api/auth/reset-password` | Public | Reset with token |
| GET | `/api/auth/verify-email/:token` | Public | Verify email |
| GET | `/api/auth/permissions` | Private | Get user permissions |
| GET | `/api/auth/test-users` | Dev Only | View test accounts |

### Protected Resources

| Endpoint | Required Role | Description |
|----------|---------------|-------------|
| `POST /api/sentiment/analyze` | Optional | Analysis (rate limited by role) |
| `POST /api/learning-path/generate` | STUDENT+ | Generate learning path |
| `POST /api/flashcards/generate` | STUDENT+ | Generate flashcard deck |
| `POST /api/flashcards/simulate` | STUDENT+ | Demo flashcards |
| `GET /api/flashcards/patterns` | STUDENT+ | View error patterns |
| `POST /api/scenarios` | COACH+ | Create scenario |
| `GET /api/admin/revenue` | SUPERUSER | Revenue dashboard |
| `GET /api/admin/users` | SUPERUSER | User management |

---

## 💡 Usage Examples

### Frontend Integration

```javascript
// Login function
async function login(email, password) {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store tokens
    localStorage.setItem('accessToken', data.data.tokens.accessToken);
    localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    localStorage.setItem('roleFeatures', JSON.stringify(data.data.roleFeatures));
    
    return data.data;
  }
  
  throw new Error(data.error);
}

// Make authenticated request
async function analyzeText(text) {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:3000/api/sentiment/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ transcription: text, language: 'en' })
  });
  
  const data = await response.json();
  
  // Handle token expiration
  if (response.status === 401) {
    // Refresh token and retry
    await refreshAccessToken();
    return analyzeText(text); // Retry
  }
  
  return data;
}

// Refresh token
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('http://localhost:3000/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('accessToken', data.data.accessToken);
  } else {
    // Refresh failed, redirect to login
    logout();
    window.location.href = '/login';
  }
}

// Check feature access
function hasAccess(module) {
  const roleFeatures = JSON.parse(localStorage.getItem('roleFeatures') || '{}');
  return roleFeatures.modules?.includes(module) || false;
}

// Usage
if (hasAccess('flashcards')) {
  // Show flashcard generation button
}
```

---

## 🔧 Environment Variables

Create `.env` file:

```bash
# JWT Configuration
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Database (when implementing PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/fluencylab

# Email Service (for verification emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Environment
NODE_ENV=development
PORT=3000
```

---

## 📈 Upgrade Paths

### Free → Student
- Unlimited daily analysis
- Access to progress tracking
- Personalized learning paths
- Error pattern analysis
- Flashcard generation

### Student → Coach
- Create custom scenarios
- Manage training content
- View student progress (if assigned)

### Coach → SuperUser
- Revenue & retention dashboards
- User management
- System configuration
- Audit log access

---

## 🛠️ Next Steps for Production

1. **Database Migration**
   ```bash
   psql -U fluencylab_user -d fluencylab < backend/config/database.sql
   ```

2. **Environment Setup**
   - Move JWT secret to environment variables
   - Configure Redis for session storage
   - Set up email service (SendGrid/AWS SES)

3. **Security Enhancements**
   - Enable HTTPS
   - Add rate limiting per IP
   - Implement CSRF protection
   - Add 2FA for admin roles

4. **Monitoring**
   - Set up audit log alerts
   - Track failed login attempts
   - Monitor token refresh rates
   - Track permission denials

---

## 📝 Migration Checklist

- [x] Database schema designed
- [x] Permission matrix configured
- [x] JWT authentication middleware
- [x] RBAC authorization middleware
- [x] Auth service with bcrypt
- [x] Authentication routes
- [x] Protected existing routes
- [ ] PostgreSQL integration
- [ ] Redis session store
- [ ] Email verification service
- [ ] Payment integration (for upgrades)
- [ ] Admin dashboard UI
- [ ] Role upgrade workflow

---

## 🤝 Support

For questions or issues:
- Review code comments in `backend/middleware/` and `backend/services/`
- Check audit logs in `backend/middleware/permissions.js`
- Test with sample users at `/api/auth/test-users`

**Built with 💜 for The Fluency Lab**

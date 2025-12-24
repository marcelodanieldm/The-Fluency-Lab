# 🎯 Authentication System - Test Guide

## ✅ System Status: READY

The authentication and authorization system is fully implemented!

---

## 🚀 Quick Start

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Test Endpoints

**View Test Users:**
```bash
curl http://localhost:3000/api/auth/test-users
```

**Login as Student:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"student@fluencylab.com\",\"password\":\"FluencyLab2024!\"}"
```

**Get Profile (use token from login):**
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔐 Test Accounts

| Email | Password | Role | Level |
|-------|----------|------|-------|
| free@fluencylab.com | FluencyLab2024! | FREE | 10 |
| student@fluencylab.com | FluencyLab2024! | STUDENT | 30 |
| coach@fluencylab.com | FluencyLab2024! | COACH | 50 |
| superuser@fluencylab.com | FluencyLab2024! | SUPERUSER | 100 |

---

## 📊 Permission Matrix

| Feature | FREE | STUDENT | COACH | SUPER |
|---------|------|---------|-------|-------|
| Sentiment Analysis | ✅ 5/day | ✅ 50/day | ✅ 999/day | ✅ |
| Flashcards | ❌ | ✅ | ✅ | ✅ |
| Learning Path | ❌ | ✅ | ✅ | ✅ |
| Scenarios | ❌ | ❌ | ✅ | ✅ |
| Admin Dashboard | ❌ | ❌ | ❌ | ✅ |

---

## 📚 Full Documentation

See `backend/AUTH_SYSTEM_GUIDE.md` for complete documentation.

---

## ✨ Features Implemented

✅ JWT Authentication (access + refresh tokens)
✅ Role-Based Access Control (4 tiers)
✅ bcrypt password hashing
✅ Rate limiting by role
✅ Session management
✅ Audit logging
✅ Permission middleware
✅ Usage tracking

**Ready to use! 🎉**

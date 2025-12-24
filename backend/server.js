const express = require('express');
const cors = require('cors');
const sentimentAnalysisRouter = require('./routes/sentimentAnalysis');
const learningPathRouter = require('./routes/learningPath');
const flashcardsRouter = require('./routes/flashcards');
const authRouter = require('./routes/auth');
const pricingRouter = require('./routes/pricing');
const aiCoachRouter = require('./routes/aiCoach');
const { optionalAuthenticate, authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);

// Sentiment analysis is public with optional auth (for usage tracking)
app.use('/api/sentiment', optionalAuthenticate, sentimentAnalysisRouter);

// Learning path and flashcards require authentication (enforced in route handlers)
app.use('/api/learning-path', authenticate, learningPathRouter);
app.use('/api/flashcards', authenticate, flashcardsRouter);

// Dynamic pricing and lead scoring (requires authentication)
app.use('/api/pricing', authenticate, pricingRouter);

// AI Coach for interactive 10-minute sessions (requires authentication)
app.use('/api/coach', authenticate, aiCoachRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'The Fluency Lab Backend is running' });
});

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 THE FLUENCY LAB - Backend Server');
  console.log('='.repeat(60));
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
  console.log('\n🔐 Authentication Endpoints:');
  console.log('   POST /api/auth/register - Register new user');
  console.log('   POST /api/auth/login - Login');
  console.log('   GET  /api/auth/me - Get current user');
  console.log('   GET  /api/auth/test-users - View test accounts');
  console.log('\n💰 Dynamic Pricing & Lead Scoring:');
  console.log('   POST /api/pricing/track-error - Track user error');
  console.log('   POST /api/pricing/analyze-lead - Analyze lead score');
  console.log('   GET  /api/pricing/my-offers - Get personalized offers');
  console.log('   POST /api/pricing/simulate-potential-lead - Simulate C1 user with management errors');
  console.log('\n🎯 AI Coach (10-minute Sessions):');
  console.log('   POST /api/coach/start-session - Start coaching session');
  console.log('   POST /api/coach/respond - Send message to coach');
  console.log('   POST /api/coach/end-session - End session & get Flash Report');
  console.log('   GET  /api/coach/topics - View available topics');
  console.log('   GET  /api/coach/demo - See demo conversation');
  console.log('\n✅ Test Users Available:');
  console.log('   free@fluencylab.com / FluencyLab2024!');
  console.log('   student@fluencylab.com / FluencyLab2024!');
  console.log('   coach@fluencylab.com / FluencyLab2024!');
  console.log('   superuser@fluencylab.com / FluencyLab2024!');
  console.log('\n' + '='.repeat(60) + '\n');
});

'use strict';
require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const morgan   = require('morgan');

const { globalLimiter }  = require('./middleware/rateLimiter');
const jwtMiddleware      = require('./middleware/jwt');
const errorHandler       = require('./middleware/errorHandler');

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes         = require('./routes/auth');
const subjectsRoutes     = require('./routes/subjects');
const quizRoutes         = require('./routes/quiz');
const notesRoutes        = require('./routes/notes');
const leaderboardRoutes  = require('./routes/leaderboard');
const profileRoutes      = require('./routes/profile');
const shopRoutes         = require('./routes/shop');
const mistakeBankRoutes  = require('./routes/mistakeBank');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware stack (order matters — per SystemDesign §4.1) ──────────────────
app.use(globalLimiter);
app.use(cors({
  origin: '*',          // Restrict in production to Expo bundle origin
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(jwtMiddleware);

// ── Health check (no auth) ────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── Route registration ────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/subjects',     subjectsRoutes);
app.use('/api/quiz',         quizRoutes);
app.use('/api/notes',        notesRoutes);
app.use('/api/leaderboard',  leaderboardRoutes);
app.use('/api/profile',      profileRoutes);
app.use('/api/shop',         shopRoutes);
app.use('/api/mistakes',     mistakeBankRoutes);

// ── 404 fallback ──────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({
  error: 'Route not found',
  code:  'NOT_FOUND',
  status: 404,
}));

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] [INFO] [server] BrainBlaze API running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});

module.exports = app;

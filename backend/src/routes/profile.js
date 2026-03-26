'use strict';
const express  = require('express');
const supabase = require('../services/supabase');

const router = express.Router();

// Static achievements list (unlock conditions checked against DB)
const ACHIEVEMENTS_DEF = [
  { id: 'streak_7',       icon: '🔥', name: '7-Day Streak',   description: '7 days in a row',      condition: s => s.streak >= 7    },
  { id: 'streak_14',      icon: '🔥', name: '14-Day Streak',  description: '14 days in a row',     condition: s => s.streak >= 14   },
  { id: 'streak_30',      icon: '🔥', name: '30-Day Streak',  description: '30 days in a row',     condition: s => s.streak >= 30   },
  { id: 'top_10',         icon: '🏆', name: 'Top 10',         description: 'Leaderboard legend',   condition: (_, rank) => rank <= 10 },
  { id: 'perfect_score',  icon: '⭐', name: 'Perfect Score',  description: '100% on a quiz',       condition: (_, __, sessions) => sessions.some(s => s.score === s.total_q && s.total_q > 0) },
  { id: 'fast_learner',   icon: '⚡', name: 'Fast Learner',   description: 'Speed bonus ×5',       condition: (s) => (s.xp_earned || 0) > 0 },
  { id: 'quiz_master',    icon: '🧠', name: 'Quiz Master',    description: '50 quizzes done',      condition: (_, __, sessions) => sessions.length >= 50 },
  { id: 'mistake_slayer', icon: '💪', name: 'Mistake Slayer', description: 'Cleared mistake bank', condition: () => false }, // needs explicit clear flag
];

/**
 * GET /api/profile/stats
 * Core stats: XP, streak, rank, quizzes.
 * Auth: Required
 */
router.get('/stats', async (req, res, next) => {
  const ts = new Date().toISOString();
  const { studentId } = req.student;

  try {
    console.log(`[${ts}] [INFO]  [profile] Fetching stats for studentId=${studentId}`);

    const { data: student, error } = await supabase
      .from('students')
      .select('name, class, xp_earned, xp_balance, streak, last_active, created_at')
      .eq('id', studentId)
      .single();

    if (error) {
      return next({ status: 500, code: 'DB_ERROR', message: 'Failed to fetch profile stats' });
    }

    // Get global rank from view
    const { data: rankRow } = await supabase
      .from('leaderboard_global')
      .select('rank, quizzes_completed')
      .eq('student_id', studentId)
      .maybeSingle();

    // Get power-ups from students table (stored as JSONB column named power_ups)
    res.json({
      id:               studentId,
      name:             student.name,
      class:            student.class,
      xpEarned:         student.xp_earned,
      xpBalance:        student.xp_balance,
      streak:           student.streak,
      globalRank:       rankRow?.rank ?? null,
      quizzesCompleted: rankRow?.quizzes_completed ?? 0,
      lastActive:       student.last_active,
      createdAt:        student.created_at,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/profile/heatmap
 * Activity heatmap: last 35 days of quiz_sessions.
 * Auth: Required
 */
router.get('/heatmap', async (req, res, next) => {
  const ts = new Date().toISOString();
  const { studentId } = req.student;

  try {
    console.log(`[${ts}] [INFO]  [profile] Fetching heatmap for studentId=${studentId}`);

    // Last 35 days
    const since = new Date();
    since.setDate(since.getDate() - 35);

    const { data: sessions, error } = await supabase
      .from('quiz_sessions')
      .select('created_at, score, total_q')
      .eq('student_id', studentId)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      return next({ status: 500, code: 'DB_ERROR', message: 'Failed to fetch activity data' });
    }

    // Group sessions by date and compute activity level 0-4
    const dayMap = {};
    (sessions || []).forEach(s => {
      const date = s.created_at.slice(0, 10);
      dayMap[date] = (dayMap[date] || 0) + 1;
    });

    // Build 35-day grid
    const days = [];
    for (let i = 34; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const count   = dayMap[dateStr] || 0;
      // Activity level: 0 = none, 1 = 1 session, 2 = 2, 3 = 3, 4 = 4+
      const activityLevel = Math.min(count, 4);
      days.push({ date: dateStr, activityLevel });
    }

    res.json({ days, totalDays: 35 });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/profile/achievements
 * Achievement unlock status for the authenticated student.
 * Auth: Required
 */
router.get('/achievements', async (req, res, next) => {
  const ts = new Date().toISOString();
  const { studentId } = req.student;

  try {
    console.log(`[${ts}] [INFO]  [profile] Fetching achievements for studentId=${studentId}`);

    const { data: student } = await supabase
      .from('students')
      .select('xp_earned, streak')
      .eq('id', studentId)
      .single();

    const { data: sessions } = await supabase
      .from('quiz_sessions')
      .select('score, total_q')
      .eq('student_id', studentId);

    const { data: rankRow } = await supabase
      .from('leaderboard_global')
      .select('rank')
      .eq('student_id', studentId)
      .maybeSingle();

    const globalRank = rankRow?.rank ?? 999;
    const allSessions = sessions || [];

    const achievements = ACHIEVEMENTS_DEF.map(a => {
      const unlocked = a.condition(student || {}, globalRank, allSessions);
      return {
        id:          a.id,
        icon:        a.icon,
        name:        a.name,
        description: a.description,
        unlocked,
        unlockedAt:  unlocked ? new Date().toISOString() : null,
      };
    });

    res.json({ achievements });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

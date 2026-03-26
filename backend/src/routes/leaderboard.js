'use strict';
const express  = require('express');
const { z }   = require('zod');
const supabase = require('../services/supabase');
const zodValidate = require('../middleware/zodValidate');

const router = express.Router();

const subjectSchema = z.object({
  params: z.object({ subject: z.string().min(1) }),
});

const chapterSchema = z.object({
  params: z.object({ chapter: z.string().min(1) }),
  query:  z.object({
    subject: z.string().min(1),
    class:   z.string().optional(),
  }),
});

/**
 * GET /api/leaderboard/global
 * Top 50 students by lifetime xp_earned.
 * Auth: Required
 */
router.get('/global', async (req, res, next) => {
  const ts = new Date().toISOString();
  const { studentId } = req.student;

  try {
    console.log(`[${ts}] [INFO]  [leaderboard] Fetching global leaderboard for studentId=${studentId}`);

    const { data: rows, error } = await supabase
      .from('leaderboard_global')
      .select('student_id, name, class, total_xp, streak, quizzes_completed, rank')
      .order('rank', { ascending: true })
      .limit(50);

    if (error) {
      console.error(`[${ts}] [ERROR] [leaderboard] Global query failed: ${error.message}`);
      return next({ status: 500, code: 'DB_ERROR', message: 'Failed to fetch leaderboard' });
    }

    const leaderboard = (rows || []).map(r => ({
      rank:              Number(r.rank),
      studentId:         r.student_id,
      name:              r.name,
      class:             r.class,
      avatar:            '🐺',
      xpEarned:          r.total_xp,
      streak:            r.streak,
      quizzesCompleted:  r.quizzes_completed,
    }));

    // Find current student's row
    const currentStudent = leaderboard.find(r => r.studentId === studentId) || null;

    res.json({
      tab:         'global',
      updatedAt:   new Date().toISOString(),
      leaderboard,
      currentStudent,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/leaderboard/subject/:subject
 * Top 50 students by XP earned in a specific subject.
 * Auth: Required
 */
router.get('/subject/:subject', zodValidate(subjectSchema), async (req, res, next) => {
  const ts = new Date().toISOString();
  const { subject }   = req.validated.params;
  const { studentId } = req.student;

  try {
    console.log(`[${ts}] [INFO]  [leaderboard] Fetching subject leaderboard — subject=${subject}`);

    const { data: rows, error } = await supabase
      .from('leaderboard_subject')
      .select('student_id, name, class, subject_xp, quizzes_completed, rank')
      .eq('subject', subject)
      .order('rank', { ascending: true })
      .limit(50);

    if (error) {
      console.error(`[${ts}] [ERROR] [leaderboard] Subject query failed: ${error.message}`);
      return next({ status: 500, code: 'DB_ERROR', message: 'Failed to fetch subject leaderboard' });
    }

    const leaderboard = (rows || []).map(r => ({
      rank:             Number(r.rank),
      studentId:        r.student_id,
      name:             r.name,
      class:            r.class,
      avatar:           '🐺',
      xpEarned:         r.subject_xp,
      quizzesCompleted: r.quizzes_completed,
    }));

    const currentStudent = leaderboard.find(r => r.studentId === studentId) || null;

    res.json({
      tab:            'subject',
      subject,
      leaderboard,
      currentStudent,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/leaderboard/chapter/:chapter?subject=X
 * Students ranked by best score then fastest time in a chapter.
 * Auth: Required
 */
router.get('/chapter/:chapter', zodValidate(chapterSchema), async (req, res, next) => {
  const ts = new Date().toISOString();
  const { chapter } = req.validated.params;
  const { subject, class: cls } = req.validated.query;
  const { studentId } = req.student;

  try {
    console.log(`[${ts}] [INFO]  [leaderboard] Fetching chapter leaderboard — chapter=${chapter} subject=${subject}`);

    let query = supabase
      .from('leaderboard_chapter')
      .select('student_id, name, class, chapter, subject, best_score, best_time, rank')
      .eq('chapter', chapter)
      .eq('subject', subject)
      .order('rank', { ascending: true })
      .limit(50);

    if (cls) query = query.eq('class', cls);

    const { data: rows, error } = await query;

    if (error) {
      console.error(`[${ts}] [ERROR] [leaderboard] Chapter query failed: ${error.message}`);
      return next({ status: 500, code: 'DB_ERROR', message: 'Failed to fetch chapter leaderboard' });
    }

    const leaderboard = (rows || []).map(r => ({
      rank:      Number(r.rank),
      studentId: r.student_id,
      name:      r.name,
      class:     r.class,
      avatar:    '🐺',
      bestScore: r.best_score,
      bestTime:  r.best_time,
    }));

    const currentStudent = leaderboard.find(r => r.studentId === studentId) || null;

    res.json({
      tab:     'chapter',
      chapter,
      subject,
      leaderboard,
      currentStudent,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

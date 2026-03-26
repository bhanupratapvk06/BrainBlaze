'use strict';
const express  = require('express');
const { z }   = require('zod');
const supabase = require('../services/supabase');
const zodValidate = require('../middleware/zodValidate');

const router = express.Router();

// Static subject definitions (content is stable for v1.1)
const SUBJECTS_DATA = [
  { name: 'Mathematics', slug: 'mathematics', icon: '📐', color: '#A8DAB5', description: 'Number Systems to Probability' },
  { name: 'Science',     slug: 'science',     icon: '🔬', color: '#D4C5E2', description: 'Matter to Gravitation' },
  { name: 'History',     slug: 'history',     icon: '🌍', color: '#FFC2A6', description: 'French Revolution to Clothing' },
  { name: 'English',     slug: 'english',     icon: '📖', color: '#E8D5C4', description: 'Reading Comprehension & Grammar' },
  { name: 'Computer',    slug: 'computer',    icon: '💻', color: '#B8E0D2', description: 'IT Fundamentals to Networking' },
  { name: 'Art',         slug: 'art',         icon: '🎨', color: '#E2C3F0', description: 'Drawing Basics to Digital Art' },
];

// Chapter counts per subject (can be moved to DB later)
const CHAPTER_COUNTS = { mathematics: 9, science: 9, history: 8, english: 8, computer: 8, art: 8 };

const classSchema = z.object({
  params: z.object({ classLevel: z.enum(['6','7','8','9','10','11','12']) }),
});

const subjectChaptersSchema = z.object({
  params: z.object({ subjectId: z.string().min(1) }),
});

/**
 * GET /api/subjects/:classLevel
 * Returns all subjects with metadata.
 * Auth: Required
 */
router.get('/:classLevel', zodValidate(classSchema), async (req, res, next) => {
  const ts = new Date().toISOString();
  const { classLevel } = req.validated.params;

  try {
    console.log(`[${ts}] [INFO]  [subjects] Fetching subjects for class=${classLevel} studentId=${req.student.studentId}`);

    const subjects = SUBJECTS_DATA.map(s => ({
      ...s,
      chapterCount: CHAPTER_COUNTS[s.slug] ?? 0,
    }));

    res.json({ class: classLevel, subjects });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/subjects/:subjectId/chapters
 * Returns chapters for a subject + student progress.
 * Auth: Required
 *
 * Note: Frontend uses this route (different from APIDocs /chapters/:class/:subject)
 */
router.get('/:subjectId/chapters', zodValidate(subjectChaptersSchema), async (req, res, next) => {
  const ts = new Date().toISOString();
  const { subjectId } = req.validated.params;
  const { studentId } = req.student;

  try {
    console.log(`[${ts}] [INFO]  [subjects] Fetching chapters for subject=${subjectId} studentId=${studentId}`);

    // Fetch chapters from DB
    const { data: chapters, error: chapErr } = await supabase
      .from('chapters')
      .select('*')
      .eq('subject_slug', subjectId)
      .order('number', { ascending: true });

    if (chapErr) {
      console.error(`[${ts}] [ERROR] [subjects] DB error fetching chapters: ${chapErr.message}`);
      return next({ status: 500, code: 'DB_ERROR', message: 'Failed to fetch chapters' });
    }

    if (!chapters || chapters.length === 0) {
      return next({ status: 404, code: 'NOT_FOUND', message: `No chapters found for subject: ${subjectId}` });
    }

    // Fetch student's quiz sessions for this subject (for progress calculation)
    const { data: sessions } = await supabase
      .from('quiz_sessions')
      .select('chapter, difficulty, score, total_q, xp_earned')
      .eq('student_id', studentId)
      .eq('subject', subjectId);

    // Build per-chapter progress map
    const progressMap = {};
    (sessions || []).forEach(s => {
      if (!progressMap[s.chapter]) {
        progressMap[s.chapter] = { spark: false, blaze: false, inferno: false, xpEarned: 0, quizCount: 0 };
      }
      progressMap[s.chapter][s.difficulty] = s.score >= s.total_q; // completed = perfect
      progressMap[s.chapter].xpEarned += s.xp_earned;
      progressMap[s.chapter].quizCount += 1;
    });

    const subjectData = SUBJECTS_DATA.find(s => s.slug === subjectId);
    const result = chapters.map(ch => {
      const prog = progressMap[ch.slug] || {};
      const dp   = { spark: prog.spark || false, blaze: prog.blaze || false, inferno: prog.inferno || false };
      const completedTiers = Object.values(dp).filter(Boolean).length;
      const progress = Math.round((completedTiers / 3) * 100);

      return {
        id:                 ch.id,
        name:               ch.name,
        slug:               ch.slug,
        number:             ch.number,
        progress,
        difficultyProgress: dp,
        xpEarned:           prog.xpEarned || 0,
        quizCount:          prog.quizCount || 0,
        hasNotes:           ch.has_notes ?? false,
        lessonCount:        ch.lesson_count ?? 0,
        estimatedMinutes:   ch.estimated_minutes ?? 0,
        questionCount:      ch.question_count ?? 0,
      };
    });

    res.json({
      subject: subjectData?.name ?? subjectId,
      class:   req.student.class,
      chapters: result,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

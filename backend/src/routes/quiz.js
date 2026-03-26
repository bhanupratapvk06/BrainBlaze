'use strict';
const express  = require('express');
const { z }   = require('zod');
const { v4: uuidv4 } = require('uuid');
const supabase      = require('../services/supabase');
const { fetchR2JSON }    = require('../services/r2');
const { generateQuiz }   = require('../services/openrouter');
const { calculateXP }    = require('../utils/xpCalc');
const { checkStreak }    = require('../utils/streakCalc');
const zodValidate        = require('../middleware/zodValidate');
const { aiLimiter }      = require('../middleware/rateLimiter');

const router = express.Router();

// ─── Schemas ──────────────────────────────────────────────────────────────────

const fetchQuizSchema = z.object({
  params: z.object({ chapterId: z.string().min(1) }),
  query:  z.object({
    mode:       z.enum(['precomputed', 'ai']).default('precomputed'),
    difficulty: z.enum(['spark', 'blaze', 'inferno']).default('spark'),
    class:      z.string().optional(),
    subject:    z.string().optional(),
  }),
});

const generateSchema = z.object({
  body: z.object({
    topic:      z.string().min(3).max(150),
    class:      z.enum(['6','7','8','9','10','11','12']).optional().default('9'),
    count:      z.number().int().min(5).max(30).optional().default(5),
    subject:    z.string().optional(),
    chapter:    z.string().optional(),
    difficulty: z.enum(['spark','blaze','inferno']).optional().default('spark'),
  }),
});

const submitSchema = z.object({
  body: z.object({
    sessionId:    z.string().optional(),          // frontend sends this
    answers:      z.array(z.any()).optional(),     // array of user answers
    timeTaken:    z.number().int().min(0),
    powerUpsUsed: z.any().optional(),
    // Also accept original spec fields for flexibility
    subject:      z.string().optional(),
    chapter:      z.string().optional(),
    class:        z.string().optional(),
    difficulty:   z.enum(['spark','blaze','inferno']).optional().default('spark'),
    mode:         z.enum(['precomputed','ai']).optional().default('precomputed'),
    activePowerUp: z.string().nullable().optional(),
    score:        z.number().int().min(0).optional(),
    totalQ:       z.number().int().min(1).optional(),
    wrongAnswers: z.array(z.any()).optional(),
  }),
});

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /api/quiz/:chapterId?mode=&difficulty=
 * Fetch precomputed quiz JSON from R2.
 * Auth: Required
 */
router.get('/:chapterId', zodValidate(fetchQuizSchema), async (req, res, next) => {
  const ts = new Date().toISOString();
  const { chapterId }              = req.validated.params;
  const { difficulty, class: cls, subject } = req.validated.query;
  const studentClass = cls || req.student.class || '9';

  try {
    console.log(`[${ts}] [INFO]  [quiz] Fetching quiz — chapter=${chapterId} difficulty=${difficulty} class=${studentClass}`);

    // Build R2 key: quizzes/{class}/{subject}/{chapter}/{difficulty}.json
    const subjectSlug  = subject   || 'general';
    const r2Key        = `quizzes/${studentClass}/${subjectSlug}/${chapterId}/${difficulty}.json`;

    const quizData = await fetchR2JSON(r2Key);

    // Assign UUIDs to questions if missing
    const questions = (quizData.questions || []).map(q => ({
      id: q.id || uuidv4(),
      ...q,
    }));

    res.json({
      mode:       'precomputed',
      subject:    quizData.subject || subjectSlug,
      chapter:    quizData.chapter || chapterId,
      class:      studentClass,
      difficulty,
      totalQuestions: questions.length,
      questions,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/quiz/generate
 * Generate AI quiz via OpenRouter (10 req/min limit).
 * Auth: Required
 */
router.post('/generate', aiLimiter, zodValidate(generateSchema), async (req, res, next) => {
  const ts = new Date().toISOString();
  const body = req.validated.body;
  const config = {
    topic:      body.topic,
    class:      body.class,
    count:      body.count,
    subject:    body.subject || 'General',
    chapter:    body.chapter || 'General',
    difficulty: body.difficulty,
  };

  try {
    console.log(`[${ts}] [INFO]  [quiz/generate] AI request — topic="${config.topic}" class=${config.class} count=${config.count}`);

    // Cache check: look up ai_quizzes table
    const { data: cached } = await supabase
      .from('ai_quizzes')
      .select('questions_json, created_at')
      .eq('topic',      config.topic)
      .eq('class',      config.class)
      .eq('difficulty', config.difficulty)
      .maybeSingle();

    if (cached) {
      console.log(`[${ts}] [INFO]  [quiz/generate] Cache HIT for topic="${config.topic}"`);
      return res.json({
        mode:        'ai',
        cached:      true,
        topic:       config.topic,
        difficulty:  config.difficulty,
        class:       config.class,
        generatedAt: cached.created_at,
        questions:   cached.questions_json.map(q => ({ id: uuidv4(), ...q })),
      });
    }

    // Cache MISS → call OpenRouter
    console.log(`[${ts}] [INFO]  [quiz/generate] Cache MISS — calling OpenRouter`);
    const questions = await generateQuiz(config);

    // Save to cache
    const { error: cacheErr } = await supabase.from('ai_quizzes').insert({
      id:             uuidv4(),
      subject:        config.subject,
      chapter:        config.chapter,
      topic:          config.topic,
      difficulty:     config.difficulty,
      class:          config.class,
      questions_json: questions,
    });
    if (cacheErr) {
      console.warn(`[${ts}] [WARN]  [quiz/generate] Failed to cache result: ${cacheErr.message}`);
    }

    res.json({
      mode:        'ai',
      cached:      false,
      topic:       config.topic,
      difficulty:  config.difficulty,
      class:       config.class,
      generatedAt: new Date().toISOString(),
      questions:   questions.map(q => ({ id: uuidv4(), ...q })),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/quiz/submit
 * Save session, calculate XP server-side, update streak.
 * Auth: Required
 *
 * Accepts frontend's format: { sessionId, answers, timeTaken, powerUpsUsed }
 * AND the spec format: { score, totalQ, wrongAnswers, activePowerUp, subject, chapter, difficulty, mode }
 */
router.post('/submit', zodValidate(submitSchema), async (req, res, next) => {
  const ts = new Date().toISOString();
  const { studentId } = req.student;
  const body = req.validated.body;

  try {
    console.log(`[${ts}] [INFO]  [quiz/submit] Submission from studentId=${studentId}`);

    // Normalise frontend vs spec field names
    const answers      = body.answers      || [];
    const wrongAnswers = body.wrongAnswers || [];
    const timeTaken    = body.timeTaken    || 0;
    const difficulty   = body.difficulty   || 'spark';
    const mode         = body.mode         || 'precomputed';
    const subject      = body.subject      || 'Unknown';
    const chapter      = body.chapter      || 'Unknown';
    const cls          = body.class        || req.student.class || '9';

    // Calculate score from answers array if not provided directly
    let score  = body.score ?? null;
    let totalQ = body.totalQ ?? answers.length;

    if (score === null && answers.length > 0) {
      // Count correct answers from answers array: each answer has { correct: bool } or { isCorrect: bool }
      score = answers.filter(a => a.correct === true || a.isCorrect === true).length;
    }
    score  = score  ?? 0;
    totalQ = totalQ || Math.max(score, 1);

    // Determine active power-up
    const activePowerUp = body.activePowerUp
      || (typeof body.powerUpsUsed === 'string' ? body.powerUpsUsed : null)
      || (body.powerUpsUsed?.active ?? null);

    // Calculate XP
    const { totalXP, speedBonusApplied, aiBonusApplied, doubleXpApplied } = calculateXP({
      score, totalQ, timeTaken, difficulty, activePowerUp, mode,
    });

    console.log(`[${ts}] [INFO]  [quiz/submit] XP calculated: ${totalXP} (score=${score}/${totalQ} diff=${difficulty} mode=${mode})`);

    // Fetch current student state
    const { data: student, error: fetchErr } = await supabase
      .from('students')
      .select('xp_earned, xp_balance, streak, last_active')
      .eq('id', studentId)
      .single();

    if (fetchErr) {
      return next({ status: 500, code: 'DB_ERROR', message: 'Failed to fetch student data' });
    }

    // Streak calculation
    const { newStreak, streakMilestone } = checkStreak(student.last_active, student.streak);
    const today = new Date().toISOString().slice(0, 10);

    // Update student XP + streak
    const { error: updateErr } = await supabase
      .from('students')
      .update({
        xp_earned:   student.xp_earned  + totalXP,
        xp_balance:  student.xp_balance + totalXP,
        streak:      newStreak,
        last_active: today,
      })
      .eq('id', studentId);

    if (updateErr) {
      console.error(`[${ts}] [ERROR] [quiz/submit] Student update failed: ${updateErr.message}`);
      return next({ status: 500, code: 'DB_ERROR', message: 'Failed to update XP and streak' });
    }

    // Insert quiz session record
    const sessionId = uuidv4();
    const { error: sessionErr } = await supabase.from('quiz_sessions').insert({
      id:          sessionId,
      student_id:  studentId,
      subject,
      chapter,
      class:       cls,
      difficulty,
      mode,
      power_up:    activePowerUp,
      score,
      total_q:     totalQ,
      time_taken:  timeTaken,
      xp_earned:   totalXP,
    });
    if (sessionErr) {
      console.warn(`[${ts}] [WARN]  [quiz/submit] Failed to insert session: ${sessionErr.message}`);
    }

    // Sync wrong answers to mistake_bank
    const mistakeItems = wrongAnswers.map(wa => ({
      id:           uuidv4(),
      student_id:   studentId,
      subject,
      question:     wa.question || wa.q || '',
      correct_ans:  wa.correctAnswer || wa.ans || wa.correct || '',
      wrong_ans:    wa.userAnswer    || wa.wrong || wa.yours  || '',
      explanation:  wa.explanation   || wa.exp  || '',
      source_mode:  mode,
      cleared:      false,
    })).filter(m => m.question);

    if (mistakeItems.length > 0) {
      const { error: mistakeErr } = await supabase.from('mistake_bank').insert(mistakeItems);
      if (mistakeErr) {
        console.warn(`[${ts}] [WARN]  [quiz/submit] Mistake bank insert failed: ${mistakeErr.message}`);
      }
    }

    res.json({
      sessionId,
      xpEarned:          totalXP,
      xpEarnedTotal:     student.xp_earned  + totalXP,
      xpBalance:         student.xp_balance + totalXP,
      newStreak,
      speedBonusApplied,
      aiBonusApplied,
      doubleXpApplied,
      mistakesSaved:     mistakeItems.length,
      streakMilestone,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

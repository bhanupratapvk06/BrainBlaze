'use strict';
const express  = require('express');
const { z }   = require('zod');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../services/supabase');
const zodValidate = require('../middleware/zodValidate');

const router = express.Router();

const subjectSchema = z.object({
  params: z.object({ subjectId: z.string().min(1) }),
});

const deleteSchema = z.object({
  params: z.object({ itemId: z.string().min(1) }),
});

/**
 * GET /api/mistakes/subject/:subjectId
 * Returns active (uncleared) mistake bank items for a subject.
 * Auth: Required
 *
 * Note: Frontend uses GET /mistakes/subject/:id (different from APIDocs POST /mistake-bank/sync)
 */
router.get('/subject/:subjectId', zodValidate(subjectSchema), async (req, res, next) => {
  const ts = new Date().toISOString();
  const { subjectId } = req.validated.params;
  const { studentId } = req.student;

  try {
    console.log(`[${ts}] [INFO]  [mistakeBank] Fetching mistakes — subject=${subjectId} studentId=${studentId}`);

    const query = supabase
      .from('mistake_bank')
      .select('id, subject, question, correct_ans, wrong_ans, explanation, source_mode, created_at')
      .eq('student_id', studentId)
      .eq('cleared', false)
      .order('created_at', { ascending: false });

    // Filter by subject if not 'all'
    const filtered = subjectId === 'all' ? query : query.eq('subject', subjectId);

    const { data: items, error } = await filtered;

    if (error) {
      console.error(`[${ts}] [ERROR] [mistakeBank] DB fetch failed: ${error.message}`);
      return next({ status: 500, code: 'DB_ERROR', message: 'Failed to fetch mistake bank' });
    }

    const formatted = (items || []).map(m => ({
      id:           m.id,
      subject:      m.subject,
      question:     m.question,
      correctAnswer: m.correct_ans,
      userAnswer:   m.wrong_ans,
      explanation:  m.explanation,
      sourceMode:   m.source_mode,
      createdAt:    m.created_at,
    }));

    res.json({ items: formatted, total: formatted.length });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/mistakes/:itemId
 * Mark a mistake bank item as cleared.
 * Awards +10 XP. If last item, awards +50 XP Comeback Bonus.
 * Auth: Required
 */
router.delete('/:itemId', zodValidate(deleteSchema), async (req, res, next) => {
  const ts = new Date().toISOString();
  const { itemId }    = req.validated.params;
  const { studentId } = req.student;

  try {
    console.log(`[${ts}] [INFO]  [mistakeBank] Clearing itemId=${itemId} studentId=${studentId}`);

    // Verify ownership
    const { data: item, error: findErr } = await supabase
      .from('mistake_bank')
      .select('id, cleared')
      .eq('id', itemId)
      .eq('student_id', studentId)
      .maybeSingle();

    if (findErr) return next({ status: 500, code: 'DB_ERROR', message: 'DB error' });
    if (!item)   return next({ status: 404, code: 'NOT_FOUND',  message: 'Mistake item not found' });
    if (item.cleared) return next({ status: 404, code: 'NOT_FOUND', message: 'Item already cleared' });

    // Mark as cleared
    await supabase.from('mistake_bank').update({ cleared: true }).eq('id', itemId);

    // Check remaining uncleared items
    const { count: remaining } = await supabase
      .from('mistake_bank')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', studentId)
      .eq('cleared', false);

    const comebackBonus    = remaining === 0;
    const xpAwarded        = 10 + (comebackBonus ? 50 : 0);
    const comebackBonusXp  = comebackBonus ? 50 : undefined;

    // Award XP to student
    const { data: student } = await supabase
      .from('students').select('xp_earned, xp_balance').eq('id', studentId).single();

    await supabase.from('students').update({
      xp_earned:  student.xp_earned  + xpAwarded,
      xp_balance: student.xp_balance + xpAwarded,
    }).eq('id', studentId);

    console.log(`[${ts}] [INFO]  [mistakeBank] Cleared ${itemId} — xpAwarded=${xpAwarded} comebackBonus=${comebackBonus} remaining=${remaining}`);

    res.json({
      cleared:        true,
      itemId,
      xpAwarded,
      xpEarned:       student.xp_earned  + xpAwarded,
      xpBalance:      student.xp_balance + xpAwarded,
      remainingItems: remaining ?? 0,
      comebackBonus,
      ...(comebackBonus ? { comebackBonusXp } : {}),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

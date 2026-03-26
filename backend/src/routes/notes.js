'use strict';
const express  = require('express');
const { z }   = require('zod');
const supabase = require('../services/supabase');
const { getSignedNoteUrl } = require('../services/r2');
const zodValidate = require('../middleware/zodValidate');

const router = express.Router();

const notesSchema = z.object({
  params: z.object({ chapterId: z.string().min(1) }),
  query:  z.object({
    subject: z.string().optional(),
    class:   z.string().optional(),
  }),
});

/**
 * GET /api/notes/chapter/:chapterId
 * Returns a signed Cloudflare R2 URL for the chapter PDF notes.
 * URL expires in 15 minutes.
 * Auth: Required
 */
router.get('/chapter/:chapterId', zodValidate(notesSchema), async (req, res, next) => {
  const ts = new Date().toISOString();
  const { chapterId }               = req.validated.params;
  const { subject, class: clsQ }   = req.validated.query;
  const studentClass                = clsQ || req.student.class || '9';

  try {
    console.log(`[${ts}] [INFO]  [notes] Request for chapter=${chapterId} class=${studentClass}`);

    // Look up chapter_notes table for the R2 key
    const { data: noteRecord, error: dbErr } = await supabase
      .from('chapter_notes')
      .select('pdf_r2_key, page_count')
      .eq('chapter', chapterId)
      .maybeSingle();

    if (dbErr) {
      console.error(`[${ts}] [ERROR] [notes] DB lookup failed: ${dbErr.message}`);
      return next({ status: 500, code: 'DB_ERROR', message: 'Failed to look up notes record' });
    }

    // Fallback: build R2 key from convention if no DB record
    const r2Key      = noteRecord?.pdf_r2_key ?? `notes/${studentClass}/${subject || 'general'}/${chapterId}.pdf`;
    const pageCount  = noteRecord?.page_count  ?? null;

    const signedUrl = await getSignedNoteUrl(r2Key, 900);

    res.json({
      chapter:   chapterId,
      class:     studentClass,
      pageCount,
      expiresIn: 900,
      url:       signedUrl,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

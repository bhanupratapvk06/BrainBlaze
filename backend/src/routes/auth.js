'use strict';
const express  = require('express');
const jwt      = require('jsonwebtoken');
const { z }   = require('zod');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../services/supabase');
const zodValidate = require('../middleware/zodValidate');

const router = express.Router();

const loginSchema = z.object({
  body: z.object({
    name:  z.string().min(1).max(60).default('Student'),
    class: z.enum(['6','7','8','9','10','11','12']),
  }),
});

/**
 * POST /api/auth/login
 * Upsert student by name+class, issue JWT.
 * Auth: None
 */
router.post('/login', zodValidate(loginSchema), async (req, res, next) => {
  const ts = new Date().toISOString();
  const { name, class: cls } = req.validated.body;

  try {
    console.log(`[${ts}] [INFO]  [auth] Login attempt — name="${name}" class=${cls}`);

    // Upsert: find existing or create new student
    const { data: existing, error: findErr } = await supabase
      .from('students')
      .select('*')
      .eq('name', name)
      .eq('class', cls)
      .maybeSingle();

    if (findErr) {
      console.error(`[${ts}] [ERROR] [auth] DB lookup failed: ${findErr.message}`);
      return next({ status: 500, code: 'DB_ERROR', message: 'Database lookup failed' });
    }

    let student = existing;

    if (!student) {
      // Create new student
      const { data: created, error: createErr } = await supabase
        .from('students')
        .insert({
          id:          uuidv4(),
          name,
          class:       cls,
          xp_earned:   0,
          xp_balance:  0,
          streak:      0,
          last_active: null,
        })
        .select()
        .single();

      if (createErr) {
        console.error(`[${ts}] [ERROR] [auth] DB insert failed: ${createErr.message}`);
        return next({ status: 500, code: 'DB_ERROR', message: 'Failed to create student record' });
      }
      student = created;
      console.log(`[${ts}] [INFO]  [auth] New student created — id=${student.id}`);
    } else {
      console.log(`[${ts}] [INFO]  [auth] Existing student found — id=${student.id}`);
    }

    // Sign JWT (7-day expiry)
    const token = jwt.sign(
      { studentId: student.id, name: student.name, class: student.class },
      process.env.JWT_SECRET,
      { expiresIn: '7d', algorithm: 'HS256' }
    );

    // Get owned + equipped cosmetics
    const { data: cosmetics } = await supabase
      .from('student_cosmetics')
      .select('item_id, category, is_equipped')
      .eq('student_id', student.id);

    const ownedCosmetics    = cosmetics?.map(c => c.item_id) ?? ['student', 'white', 'plain', 'none'];
    const equippedCosmetics = { shape: 'student', color: 'white', background: 'plain', frame: 'none' };
    cosmetics?.filter(c => c.is_equipped).forEach(c => {
      equippedCosmetics[c.category] = c.item_id;
    });

    res.json({
      token,
      student: {
        id:               student.id,
        name:             student.name,
        class:            student.class,
        xpEarned:         student.xp_earned,
        xpBalance:        student.xp_balance,
        streak:           student.streak,
        lastActive:       student.last_active,
        powerUps:         student.power_ups ?? { shield: 0, timeFreeze: 0, doubleXp: 0, hint: 0 },
        equippedCosmetics,
        ownedCosmetics,
        createdAt:        student.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

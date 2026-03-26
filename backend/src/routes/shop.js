'use strict';
const express  = require('express');
const { z }   = require('zod');
const supabase = require('../services/supabase');
const zodValidate = require('../middleware/zodValidate');

const router = express.Router();

// Static shop catalogue (prices and IDs are stable)
const SHOP_CATALOGUE = {
  shape: [
    { id: 'student',  name: 'Student',  icon: '🧑‍🎓', cost: 0    },
    { id: 'scholar',  name: 'Scholar',  icon: '👨‍💼', cost: 300  },
    { id: 'genius',   name: 'Genius',   icon: '🧠',   cost: 600  },
    { id: 'champion', name: 'Champion', icon: '🏆',   cost: 800  },
  ],
  color: [
    { id: 'white', name: 'White', hex: '#FFFFFF', cost: 0   },
    { id: 'blue',  name: 'Blue',  hex: '#B8E0D2', cost: 100 },
    { id: 'peach', name: 'Peach', hex: '#E8D5C4', cost: 300 },
    { id: 'mint',  name: 'Mint',  hex: '#A8DAB5', cost: 500 },
  ],
  background: [
    { id: 'plain',    name: 'Plain',    cost: 0   },
    { id: 'grid',     name: 'Grid',     cost: 400 },
    { id: 'gradient', name: 'Gradient', cost: 800 },
  ],
  frame: [
    { id: 'none',  name: 'None',      cost: 0    },
    { id: 'thin',  name: 'Thin Ring', cost: 500  },
    { id: 'crown', name: 'Crown',     cost: 2500 },
  ],
};

// Free items auto-granted to every student
const FREE_DEFAULTS = ['student', 'white', 'plain', 'none'];

const purchaseSchema = z.object({
  body: z.object({
    itemId:   z.string().min(1),
    category: z.enum(['shape', 'color', 'background', 'frame']).optional(),
  }),
});

const equipSchema = z.object({
  body: z.object({
    itemId:   z.string().min(1),
    category: z.enum(['shape', 'color', 'background', 'frame']).optional(),
  }),
});

/** Helper: find an item across all categories */
function findItem(itemId, category) {
  if (category) {
    return { item: SHOP_CATALOGUE[category]?.find(i => i.id === itemId), category };
  }
  for (const [cat, items] of Object.entries(SHOP_CATALOGUE)) {
    const item = items.find(i => i.id === itemId);
    if (item) return { item, category: cat };
  }
  return { item: null, category: null };
}

/**
 * GET /api/shop/items
 * All cosmetic items with ownership + equipped status for the authenticated student.
 * Auth: Required
 */
router.get('/items', async (req, res, next) => {
  const ts = new Date().toISOString();
  const { studentId } = req.student;

  try {
    console.log(`[${ts}] [INFO]  [shop] Fetching items for studentId=${studentId}`);

    const { data: student } = await supabase
      .from('students').select('xp_balance').eq('id', studentId).single();

    const { data: cosmetics } = await supabase
      .from('student_cosmetics')
      .select('item_id, category, is_equipped')
      .eq('student_id', studentId);

    const ownedSet    = new Set([...FREE_DEFAULTS, ...(cosmetics?.map(c => c.item_id) ?? [])]);
    const equippedMap = {};
    cosmetics?.filter(c => c.is_equipped).forEach(c => { equippedMap[c.category] = c.item_id; });

    // Default equipped = free items if none set
    const equipped = {
      shape:      equippedMap.shape      || 'student',
      color:      equippedMap.color      || 'white',
      background: equippedMap.background || 'plain',
      frame:      equippedMap.frame      || 'none',
    };

    const categories = {};
    for (const [cat, items] of Object.entries(SHOP_CATALOGUE)) {
      categories[cat] = items.map(i => ({
        ...i,
        owned:    ownedSet.has(i.id),
        equipped: equipped[cat] === i.id,
      }));
    }

    res.json({ xpBalance: student?.xp_balance ?? 0, categories });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/shop/purchase
 * Purchase a cosmetic item (deducts from xp_balance, NEVER xp_earned).
 * Auth: Required
 */
router.post('/purchase', zodValidate(purchaseSchema), async (req, res, next) => {
  const ts = new Date().toISOString();
  const { studentId } = req.student;
  const { itemId, category } = req.validated.body;

  try {
    const { item, category: cat } = findItem(itemId, category);
    if (!item) {
      return next({ status: 400, code: 'VALIDATION_ERROR', message: `Item not found: ${itemId}` });
    }

    const { data: student } = await supabase
      .from('students').select('xp_earned, xp_balance').eq('id', studentId).single();

    // Check if already owned
    const { data: existing } = await supabase
      .from('student_cosmetics')
      .select('item_id').eq('student_id', studentId).eq('item_id', itemId).maybeSingle();

    if (existing || item.cost === 0) {
      // Already owned or free — just equip
      return handleEquip(req, res, next, studentId, itemId, cat, student, 0);
    }

    if ((student?.xp_balance || 0) < item.cost) {
      return next({ status: 400, code: 'INSUFFICIENT_BALANCE', message: `Need ${item.cost - student.xp_balance} more XP` });
    }

    // Deduct from xp_balance only
    const newBalance = student.xp_balance - item.cost;
    await supabase.from('students').update({ xp_balance: newBalance }).eq('id', studentId);

    // Un-equip others in same category
    await supabase.from('student_cosmetics')
      .update({ is_equipped: false })
      .eq('student_id', studentId).eq('category', cat);

    // Insert owned + equipped
    await supabase.from('student_cosmetics').insert({
      student_id:  studentId,
      item_id:     itemId,
      category:    cat,
      is_equipped: true,
    });

    console.log(`[${ts}] [INFO]  [shop] Purchased ${itemId} (${cat}) for studentId=${studentId} — cost ${item.cost} XP`);

    const equippedCosmetics = await getEquipped(studentId);
    res.json({
      action:            'purchased',
      itemId,
      category:          cat,
      costDeducted:      item.cost,
      xpBalance:         newBalance,
      xpEarned:          student.xp_earned,
      equippedCosmetics,
      message:           `${item.name} unlocked!`,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/shop/equip
 * Equip an already-owned cosmetic item (no XP deduction).
 * Auth: Required — discovered from frontend shopApi.js
 */
router.post('/equip', zodValidate(equipSchema), async (req, res, next) => {
  const ts = new Date().toISOString();
  const { studentId } = req.student;
  const { itemId, category } = req.validated.body;

  try {
    const { item, category: cat } = findItem(itemId, category);
    if (!item) {
      return next({ status: 400, code: 'VALIDATION_ERROR', message: `Item not found: ${itemId}` });
    }

    const { data: student } = await supabase
      .from('students').select('xp_earned, xp_balance').eq('id', studentId).single();

    await handleEquip(req, res, next, studentId, itemId, cat, student, 0);
  } catch (err) {
    next(err);
  }
});

async function handleEquip(req, res, next, studentId, itemId, cat, student, costDeducted) {
  const ts = new Date().toISOString();
  try {
    // Un-equip others in same category first
    await supabase.from('student_cosmetics')
      .update({ is_equipped: false })
      .eq('student_id', studentId).eq('category', cat);

    // Upsert equipped state
    await supabase.from('student_cosmetics').upsert({
      student_id:  studentId,
      item_id:     itemId,
      category:    cat,
      is_equipped: true,
    }, { onConflict: 'student_id,item_id' });

    console.log(`[${ts}] [INFO]  [shop] Equipped ${itemId} (${cat}) for studentId=${studentId}`);

    const equippedCosmetics = await getEquipped(studentId);
    const item = findItem(itemId, cat).item;

    res.json({
      action:            costDeducted > 0 ? 'purchased' : 'equipped',
      itemId,
      category:          cat,
      costDeducted,
      xpBalance:         student?.xp_balance ?? 0,
      xpEarned:          student?.xp_earned  ?? 0,
      equippedCosmetics,
      message:           `${item?.name ?? itemId} equipped!`,
    });
  } catch (err) {
    next(err);
  }
}

async function getEquipped(studentId) {
  const { data } = await supabase
    .from('student_cosmetics')
    .select('item_id, category')
    .eq('student_id', studentId)
    .eq('is_equipped', true);

  const equipped = { shape: 'student', color: 'white', background: 'plain', frame: 'none' };
  (data || []).forEach(c => { equipped[c.category] = c.item_id; });
  return equipped;
}

module.exports = router;

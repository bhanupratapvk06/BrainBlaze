/**
 * BrainBlaze API E2E Test
 * Run: node scripts/test-api.js
 */
require('dotenv').config();
const http = require('http');

const HOST = 'localhost';
const PORT = 3001;
let PASS = 0, FAIL = 0;

async function request(method, path, body = null, token = null) {
  return new Promise((resolve) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const opts = { hostname: HOST, port: PORT, path, method, headers };
    const req = http.request(opts, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(raw); } catch { parsed = raw; }
        resolve({ status: res.statusCode, body: parsed, raw });
      });
    });
    req.on('error', e => resolve({ error: e.message }));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function check(label, res, expectStatus = 200, checkFn = null) {
  const ok   = !res.error && res.status === expectStatus;
  const extra = checkFn ? checkFn(res.body) : true;
  const pass  = ok && extra;
  const sym   = pass ? '✅' : '❌';
  console.log(`${sym} [${res.status ?? 'ERR'}] ${label}`);
  if (res.error) console.log('   Error:', res.error);
  if (!pass && res.body) {
    const snippet = typeof res.body === 'object'
      ? JSON.stringify(res.body).slice(0, 200)
      : String(res.body).slice(0, 200);
    console.log('   Body:', snippet);
  }
  if (pass) PASS++; else FAIL++;
  return pass;
}

(async () => {
  console.log('\n🧪 BrainBlaze API E2E Test Suite\n' + '='.repeat(45));

  // 1. Health
  const health = await request('GET', '/health');
  check('GET /health', health, 200, b => b.status === 'ok');

  // 2. Login — creates a student in Supabase
  console.log('\n── Auth ───────────────────────────────────────');
  const login = await request('POST', '/api/auth/login', { name: 'BrainBlaze_Tester', class: '9' });
  const loginOk = check('POST /api/auth/login', login, 200, b => b.token && b.student);
  const TOKEN    = login.body?.token;
  const STUDENT  = login.body?.student;
  if (loginOk) {
    console.log('   Student ID:', STUDENT?.id?.slice(0, 20) + '...');
    console.log('   Token:', TOKEN?.slice(0, 30) + '...');
  }

  if (!TOKEN) {
    console.log('\n❌ Cannot continue without a valid token');
    console.log('RESULTS:', PASS, 'passed,', FAIL, 'failed');
    process.exit(1);
  }

  // 3. Auth required — no token
  console.log('\n── Auth Guard ─────────────────────────────────');
  const noToken = await request('GET', '/api/profile/stats', null, null);
  check('GET /api/profile/stats (no token) → 401', noToken, 401);

  // 4. Subjects
  console.log('\n── Subjects ───────────────────────────────────');
  const subs = await request('GET', '/api/subjects/9', null, TOKEN);
  check('GET /api/subjects/9', subs, 200, b => b.subjects?.length > 0);
  if (subs.body?.subjects) console.log('   Subjects returned:', subs.body.subjects.length);

  // 5. Profile — all 3 endpoints
  console.log('\n── Profile ────────────────────────────────────');
  const stats = await request('GET', '/api/profile/stats', null, TOKEN);
  check('GET /api/profile/stats', stats, 200, b => b.id && b.xpEarned !== undefined);
  if (stats.body?.id) console.log('   xpEarned:', stats.body.xpEarned, '| streak:', stats.body.streak);

  const heatmap = await request('GET', '/api/profile/heatmap', null, TOKEN);
  check('GET /api/profile/heatmap', heatmap, 200, b => Array.isArray(b.days));
  if (heatmap.body?.days) console.log('   Days returned:', heatmap.body.days.length);

  const ach = await request('GET', '/api/profile/achievements', null, TOKEN);
  check('GET /api/profile/achievements', ach, 200, b => Array.isArray(b.achievements));
  if (ach.body?.achievements) console.log('   Achievements returned:', ach.body.achievements.length);

  // 6. Leaderboard — all 3
  console.log('\n── Leaderboard ────────────────────────────────');
  const lbg = await request('GET', '/api/leaderboard/global', null, TOKEN);
  check('GET /api/leaderboard/global', lbg, 200, b => b.leaderboard !== undefined);
  if (lbg.body?.leaderboard) console.log('   Entries:', lbg.body.leaderboard.length);

  const lbs = await request('GET', '/api/leaderboard/subject/mathematics', null, TOKEN);
  check('GET /api/leaderboard/subject/mathematics', lbs, 200, b => b.leaderboard !== undefined);

  const lbc = await request('GET', '/api/leaderboard/chapter/algebra?subject=mathematics', null, TOKEN);
  check('GET /api/leaderboard/chapter/algebra', lbc, 200, b => b.leaderboard !== undefined);

  // 7. Shop
  console.log('\n── Shop ───────────────────────────────────────');
  const shop = await request('GET', '/api/shop/items', null, TOKEN);
  check('GET /api/shop/items', shop, 200, b => b.categories);
  if (shop.body?.categories) console.log('   xpBalance:', shop.body.xpBalance);

  const equip = await request('POST', '/api/shop/equip', { itemId: 'student' }, TOKEN);
  check('POST /api/shop/equip (free item)', equip, 200, b => b.action === 'equipped');

  const buyBroke = await request('POST', '/api/shop/purchase', { itemId: 'champion' }, TOKEN);
  check('POST /api/shop/purchase (no funds) → 400', buyBroke, 400, b => b.code === 'INSUFFICIENT_BALANCE');

  // 8. Mistakes
  console.log('\n── Mistake Bank ───────────────────────────────');
  const mistakes = await request('GET', '/api/mistakes/subject/all', null, TOKEN);
  check('GET /api/mistakes/subject/all', mistakes, 200, b => Array.isArray(b.items));
  if (mistakes.body?.items !== undefined) console.log('   Items:', mistakes.body.items.length);

  // 9. Quiz submit (no actual quiz file needed — tests XP logic)
  console.log('\n── Quiz ───────────────────────────────────────');
  const submit = await request('POST', '/api/quiz/submit', {
    subject: 'mathematics', chapter: 'algebra', class: '9',
    difficulty: 'spark', mode: 'precomputed', score: 4, totalQ: 5, timeTaken: 60,
    wrongAnswers: [], activePowerUp: null,
  }, TOKEN);
  check('POST /api/quiz/submit', submit, 200, b => b.xpEarned !== undefined);
  if (submit.body?.xpEarned !== undefined) {
    console.log('   XP awarded:', submit.body.xpEarned, '| streak:', submit.body.newStreak);
  }

  // Summary
  console.log('\n' + '='.repeat(45));
  const total = PASS + FAIL;
  console.log(`Results: ${PASS}/${total} passed   ${FAIL} failed`);
  console.log(FAIL === 0 ? '🎉 All tests passed!' : '⚠️  Some tests failed — see above');
  process.exit(FAIL > 0 ? 1 : 0);
})();

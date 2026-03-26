/**
 * BrainBlaze API E2E — spawns server as child process, tests it, kills it
 * Run: node scripts/run-tests.js
 */
'use strict';
require('dotenv').config();

const http  = require('http');
const { spawn } = require('child_process');
const path  = require('path');

const PORT = 3099;
let PASS = 0, FAIL = 0;

// ── HTTP helper ───────────────────────────────────────────────────────────────
function req(method, path_, body, token) {
  return new Promise(resolve => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { hostname: 'localhost', port: PORT, path: path_, method, headers };
    const r = http.request(options, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        let b;
        try { b = JSON.parse(d); } catch { b = d; }
        resolve({ s: res.statusCode, b });
      });
    });
    r.on('error', e => resolve({ err: e.message }));
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

function chk(label, r, expectStatus, checkFn) {
  const good = !r.err && r.s === expectStatus && (!checkFn || checkFn(r.b));
  console.log((good ? '✅' : '❌') + ` [${r.s ?? 'ERR'}] ${label}`);
  if (!good) {
    if (r.err) console.log('   Error:', r.err);
    else       console.log('   Body :', JSON.stringify(r.b).slice(0, 250));
  }
  if (good) PASS++; else FAIL++;
  return good;
}

// ── Wait until port responds ──────────────────────────────────────────────────
function waitForServer(maxMs = 10000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const try_ = () => {
      req('GET', '/health').then(r => {
        if (r.s === 200) resolve();
        else if (Date.now() - start > maxMs) reject(new Error('Server didn\'t start in time'));
        else setTimeout(try_, 300);
      }).catch(() => {
        if (Date.now() - start > maxMs) reject(new Error('Server didn\'t start in time'));
        else setTimeout(try_, 300);
      });
    };
    setTimeout(try_, 500);
  });
}

async function main() {
  // ── Start server ────────────────────────────────────────────────────────────
  const env = { ...process.env, PORT: String(PORT) };
  const server = spawn('node', ['src/index.js'], {
    cwd: path.resolve(__dirname, '..'),
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let serverLog = '';
  server.stdout.on('data', d => serverLog += d);
  server.stderr.on('data', d => serverLog += d);
  server.on('exit', code => {
    if (code !== 0) console.log('\nServer process exited with code', code, '\n', serverLog);
  });

  console.log(`⏳ Starting server on port ${PORT}...`);
  try {
    await waitForServer(15000);
    console.log(`✅ Server ready on port ${PORT}\n`);
  } catch (e) {
    console.log('❌ Server failed to start:', e.message);
    console.log('Server stdout/stderr:\n', serverLog);
    server.kill();
    process.exit(1);
  }

  // ── Tests ───────────────────────────────────────────────────────────────────
  console.log('🧪 BrainBlaze API E2E Test Suite\n' + '─'.repeat(50));

  // 1. Health
  const h = await req('GET', '/health');
  chk('GET /health', h, 200, b => b.status === 'ok');

  // 2. Login
  console.log('\n── Auth ──');
  const l = await req('POST', '/api/auth/login', { name: 'E2E_Tester', class: '9' });
  const loginGood = chk('POST /api/auth/login', l, 200, b => b.token && b.student?.id);
  const tok = l.b?.token;
  if (loginGood) {
    console.log('   student.id      :', l.b.student.id);
    console.log('   student.xpEarned:', l.b.student.xpEarned, '| streak:', l.b.student.streak);
  }
  if (!tok) { console.log('\n❌ No token — aborting'); server.kill(); process.exit(1); }

  // 3. Auth guard
  const ng = await req('GET', '/api/profile/stats');
  chk('GET /profile/stats (no token → 401)', ng, 401);

  // 4. Subjects
  console.log('\n── Subjects ──');
  const su = await req('GET', '/api/subjects/9', null, tok);
  chk('GET /api/subjects/9', su, 200, b => b.subjects?.length > 0);
  if (su.b?.subjects) console.log('   subjects:', su.b.subjects.map(s => s.name).join(', '));

  // 5. Profile (3 endpoints)
  console.log('\n── Profile ──');
  const ps = await req('GET', '/api/profile/stats', null, tok);
  chk('GET /api/profile/stats', ps, 200, b => b.id);
  if (ps.b) console.log('   rank:', ps.b.globalRank ?? '—', '| quizzes:', ps.b.quizzesCompleted);

  const hm = await req('GET', '/api/profile/heatmap', null, tok);
  chk('GET /api/profile/heatmap', hm, 200, b => Array.isArray(b.days) && b.days.length === 35);

  const ac = await req('GET', '/api/profile/achievements', null, tok);
  chk('GET /api/profile/achievements', ac, 200, b => Array.isArray(b.achievements));

  // 6. Leaderboard
  console.log('\n── Leaderboard ──');
  const lg = await req('GET', '/api/leaderboard/global', null, tok);
  chk('GET /api/leaderboard/global', lg, 200, b => Array.isArray(b.leaderboard));
  if (lg.b?.leaderboard) console.log('   entries:', lg.b.leaderboard.length, '(may be 0 before any quizzes)');

  const ls = await req('GET', '/api/leaderboard/subject/mathematics', null, tok);
  chk('GET /api/leaderboard/subject/mathematics', ls, 200, b => Array.isArray(b.leaderboard));

  const lc = await req('GET', '/api/leaderboard/chapter/algebra?subject=mathematics', null, tok);
  chk('GET /api/leaderboard/chapter/algebra', lc, 200, b => Array.isArray(b.leaderboard));

  // 7. Shop
  console.log('\n── Shop ──');
  const sh = await req('GET', '/api/shop/items', null, tok);
  chk('GET /api/shop/items', sh, 200, b => b.categories && b.xpBalance !== undefined);
  if (sh.b) console.log('   xpBalance:', sh.b.xpBalance, '| cats:', Object.keys(sh.b.categories || {}).join(', '));

  const eq = await req('POST', '/api/shop/equip', { itemId: 'student' }, tok);
  chk('POST /api/shop/equip (free item)', eq, 200, b => b.action);

  const noFunds = await req('POST', '/api/shop/purchase', { itemId: 'champion' }, tok);
  chk('POST /api/shop/purchase (no XP → 400)', noFunds, 400, b => b.code === 'INSUFFICIENT_BALANCE');

  // 8. Mistakes
  console.log('\n── Mistake Bank ──');
  const mb = await req('GET', '/api/mistakes/subject/all', null, tok);
  chk('GET /api/mistakes/subject/all', mb, 200, b => Array.isArray(b.items));

  // 9. Quiz submit
  console.log('\n── Quiz ──');
  const qs = await req('POST', '/api/quiz/submit', {
    subject: 'mathematics', chapter: 'algebra', class: '9',
    difficulty: 'spark', mode: 'precomputed',
    score: 4, totalQ: 5, timeTaken: 60,
    wrongAnswers: [], activePowerUp: null,
  }, tok);
  chk('POST /api/quiz/submit', qs, 200, b => typeof b.xpEarned === 'number');
  if (qs.b) console.log('   xpEarned:', qs.b.xpEarned, '| streak:', qs.b.newStreak, '| speedBonus:', qs.b.speedBonusApplied);

  // 10. XP persisted after submit
  const ps2 = await req('GET', '/api/profile/stats', null, tok);
  chk('GET /api/profile/stats (XP persisted after submit)', ps2, 200, b => b.xpEarned >= (ps.b?.xpEarned || 0));
  if (ps2.b) console.log('   xpEarned now:', ps2.b.xpEarned, '(was:', ps.b?.xpEarned ?? 0, ')');

  // 11. Login idempotent — same student returned
  const l2 = await req('POST', '/api/auth/login', { name: 'E2E_Tester', class: '9' });
  chk('POST /api/auth/login (idempotent — same ID returned)', l2, 200, b => b.student?.id === l.b?.student?.id);

  // ── Results ─────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(50));
  const total = PASS + FAIL;
  console.log(`Results: ${PASS}/${total} passed   ${FAIL > 0 ? FAIL + ' FAILED ⚠️' : '0 failed'}`);
  console.log(FAIL === 0 ? '🎉 All tests passed!' : '🔴 Fix the failures above');

  server.kill();
  process.exit(FAIL > 0 ? 1 : 0);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });

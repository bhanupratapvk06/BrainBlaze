# BrainBlaze — System Design Document

**Version:** v1.0 | **Date:** March 2026 | **Covers:** High-Level Design (HLD) + Low-Level Design (LLD)
**Platform:** iOS · Android (React Native) | **Classification:** CONFIDENTIAL

---

# PART A — HIGH LEVEL DESIGN

## 1. Architecture Overview

BrainBlaze follows a three-tier mobile-first architecture. The presentation tier is a React Native application distributed via the App Store and Google Play. The logic tier is a Node.js + Express REST API deployed on Railway. The data tier consists of a PostgreSQL database on Supabase and object storage on Cloudflare R2. The OpenRouter API provides AI quiz generation at the logic tier boundary.

In **v1.0**, the app operates entirely client-side with a static precomputed question bank bundled into the app — no backend calls are required for core quiz functionality. The backend is introduced in **v1.1** to support AI Quiz generation, cloud sync, leaderboard persistence, and streak validation.

### 1.1 Architecture Diagram

```
[ Student Device — iOS / Android ]
        |  HTTPS (v1.1+)
[ React Native App ]            ← Expo, NativeWind, Reanimated 3
        |  REST API calls (JWT in Authorization header)
[ Express API on Railway ]      ← Node.js, Zod validation, rate limiting
     |          |          |          |
[Supabase]  [R2 CDN]  [OpenRouter]  [JWT Auth]
PostgreSQL  JSON/PDF   OpenRouter API   HS256 Sign
```

### 1.2 v1.0 vs v1.1 Architecture Boundary

| Capability | v1.0 (Bundled / Local) | v1.1 (Backend Required) |
|---|---|---|
| Quiz questions (precomputed) | Bundled in app assets | Fetched from R2 via API |
| XP & streak calculation | Client-side, AsyncStorage | Server-side, PostgreSQL |
| Mistake Bank | AsyncStorage | Supabase `mistake_bank` table |
| Leaderboard | Mock static data | Live from `leaderboard_global` view |
| AI Quiz Mode | Not available | Via OpenRouter API |
| Avatar cosmetics | AsyncStorage | Synced to `student_cosmetics` table |
| Notifications | Local (Expo Notifications) | Push via Expo Push + server triggers |

### 1.3 Technology Stack

| Layer | Technology | Version | Hosting |
|---|---|---|---|
| Mobile App | React Native + Expo | SDK 51 / RN 0.74 | App Store / Play Store |
| Styling | NativeWind (TailwindCSS for RN) | 4.x | Bundled |
| Animation | React Native Reanimated | 3.x | Bundled |
| Navigation | React Navigation | 6.x | Bundled |
| Backend | Node.js + Express | 20 LTS / 4.x | Railway |
| Validation | Zod | 3.x | Bundled |
| Database | PostgreSQL via Supabase | 15.x | Supabase |
| File Storage | Cloudflare R2 | S3-compatible | Cloudflare |
| AI Engine |  OpenRouter API | Latest |
| Auth | JWT (HS256) | jsonwebtoken 9.x | Stateless |
| Local Storage | Expo SecureStore + AsyncStorage | — | On-device |
| Fuzzy Match | fast-levenshtein | 2.x | Bundled |
| Push Notifications | Expo Push Notifications | — | Expo servers |

---

## 2. Data Flows

### 2.1 Precomputed Quiz Flow (v1.0 — Local)

```
1. Student selects Subject → Chapter → Difficulty on React Native frontend
2. App reads bundled JSON from assets/quizzes/{subject}/{chapter}/{difficulty}.json
3. React Native renders questions, starts 30-second countdown timer
4. Student answers; XP is calculated client-side using XP formula
5. Incorrect answers saved to AsyncStorage mistakeBank array
6. XP Earned and XP Balance updated in AsyncStorage
7. Streak counter checked: if last_active !== today → increment streak
8. Results screen renders animated score ring + XP earned card
```

### 2.2 Precomputed Quiz Flow (v1.1 — Backend)

```
1. Student selects Chapter + Difficulty on React Native frontend
2. Frontend sends GET /api/quiz/chapter?subject=X&chapter=Y&difficulty=Z  (with JWT)
3. Express validates JWT and query params via Zod
4. Express constructs R2 object key: quizzes/{class}/{subject}/{chapter}/{difficulty}.json
5. Express fetches JSON via AWS SDK (R2) and returns it to client
6. React Native renders questions, starts 30-second timer
7. On complete → POST /api/quiz/submit with { answers, score, timeTaken }
8. Express calculates XP using server-side formula, updates students table,
   inserts quiz_sessions row, syncs mistake_bank table
9. React Native displays animated results screen with XP gained
```

### 2.3 AI Topic Quiz Flow (v1.1+)

```
1. Student types topic in Chapter Detail screen → selects AI Quiz mode → taps Generate
2. Frontend sends POST /api/quiz/generate with { subject, chapter, topic, difficulty, count }
3. Express checks Supabase ai_quizzes table for matching cached quiz
4. Cache HIT  → return cached questions immediately (with AI badge flag)
   Cache MISS → Express constructs structured prompt and calls OpenRouter API
5. OpenRouter returns JSON array of questions
6. Express validates JSON schema (type, question, options, answer, explanation)
7. If invalid → retry once with stricter prompt; if second fail → return 500
8. If valid → save to ai_quizzes, return to client with { questions, mode: 'ai' }
9. React Native renders quiz — identical UX to precomputed mode + AI badge shown
10. On complete → POST /api/quiz/submit with mode:'ai' → 1.2x AI bonus applied server-side
```

### 2.4 Mistake Bank Re-attempt Flow

```
1. Student opens Mistake Bank (bottom nav: Mistakes)
2. App loads mistakeBank[] from AsyncStorage (v1.0) or Supabase (v1.1)
3. Student taps Re-attempt on a card → inline text input replaces review view
4. Student submits answer
5. App runs case-insensitive, whitespace-normalized comparison
6. Correct → remove item from bank, award +10 XP, check if bank now empty
7. Bank empty → show celebration screen, award +50 XP Comeback Bonus
8. Incorrect → show error toast, item remains in bank
```

### 2.5 XP and Streak Update Flow

```
On every quiz completion:
  1. Calculate totalXP (see Section 6)
  2. xpEarned  += totalXP   (never decremented — leaderboard ledger)
  3. xpBalance += totalXP   (spendable — decremented on shop purchase)
  4. Save both to AsyncStorage (v1.0) / students table (v1.1)

On every app open:
  1. Read last_active date from storage
  2. If last_active === yesterday → streak += 1
  3. If last_active < yesterday  → streak  = 0 (reset)
  4. If last_active === today    → no change
  5. Write new last_active = today
```

---

# PART B — LOW LEVEL DESIGN

## 3. Frontend Component Architecture

### 3.1 Screen Inventory and Navigation Tree

```
App.jsx (Root)
  ├── NavigationContainer
  │   ├── Stack.Navigator (Onboarding — shown once on first launch)
  │   │   ├── OnboardingScreen1          ← Name entry
  │   │   └── OnboardingScreen2          ← Class selection (6–12)
  │   │
  │   └── Tab.Navigator (Main App — BottomNav)
  │       ├── Tab: Home      → DashboardScreen
  │       │     └── SubjectCard (×6) → SubjectBrowserScreen
  │       │           └── ChapterItem → ChapterDetailScreen
  │       │                 └── [Start Quiz] → QuizScreen
  │       │                       └── [Submit Last Q] → ResultsScreen
  │       │
  │       ├── Tab: Quiz      → SubjectBrowserScreen (direct entry)
  │       ├── Tab: Mistakes  → MistakeBankScreen
  │       ├── Tab: Ranks     → LeaderboardScreen
  │       └── Tab: Profile   → ProfileScreen
  │             ├── [Avatar tap] → AvatarShopScreen
  │             └── [Bell icon] → NotificationPanel (overlay)
  │
  ├── GlobalOverlays
  │   ├── ToastNotification          ← Fixed top center; auto-dismiss 3s
  │   ├── AchievementOverlay         ← Modal; scaleIn animation; score >= 90%
  │   └── NotificationPanel          ← Slide-down drawer; 70vh height
  │
  └── ThemeToggle                    ← Fixed bottom-right; dark/light switch
```

### 3.2 State Management

Global state is managed via React Context (no Redux needed at this scale). Three contexts:

| Context | Contents | Persistence |
|---|---|---|
| **AuthContext** | `{ name, cls, studentId, xpEarned, xpBalance, streak, lastActive, jwt }` | AsyncStorage / SecureStore |
| **QuizContext** | `{ subject, chapter, mode, difficulty, activePowerUp, questions, currentQ, score, timer, timerFrozen, wrongAnswers, hintsUsed }` | Session only (in-memory) |
| **ThemeContext** | `{ isDark }` | AsyncStorage |

**Dual XP Ledger:** `xpEarned` (leaderboard, never decremented) and `xpBalance` (shop spending, can decrease) are stored as separate fields in AuthContext and both storage layers.

### 3.3 API Client Layer (v1.1+)

All API calls go through `/src/api/client.js` which wraps `fetch` with JWT injection, error handling, and retry logic.

```
/src/api/
  client.js            ← base fetch wrapper with JWT header + retry
  authApi.js           ← login(name, cls) → { studentId, jwt }
  quizApi.js           ← fetchChapterQuiz(), generateTopicQuiz(), submitQuiz()
  leaderboardApi.js    ← getGlobal(), getSubject(subject), getChapter(chapter)
  profileApi.js        ← getProfile(studentId)
  notesApi.js          ← getNotesUrl(class, subject, chapter)
  mistakeBankApi.js    ← syncMistakes(items), clearItem(id)
  shopApi.js           ← getItems(), purchaseItem(itemId)
```

### 3.4 Local Storage Schema (v1.0 — AsyncStorage)

```json
{
  "user": {
    "name": "Rahul",
    "cls": "Class 9",
    "xpEarned": 2450,
    "xpBalance": 1200,
    "streak": 5,
    "lastActive": "2026-03-22"
  },
  "powerUps": {
    "shield": 2,
    "timeFreeze": 1,
    "doubleXp": 1,
    "hint": 3
  },
  "mistakeBank": [
    {
      "id": 1,
      "sub": "Science",
      "q": "Newton's 2nd law?",
      "ans": "F=ma",
      "wrong": "F=mv",
      "exp": "Force = mass x acceleration"
    }
  ],
  "equippedCosmetics": {
    "shape": "student",
    "color": "white",
    "background": "plain",
    "frame": "none"
  },
  "ownedCosmetics": ["student", "white", "plain", "none"],
  "isDark": true
}
```

### 3.5 Custom Hooks

```
/src/hooks/
  useTimer.js          ← countdown from 30s; pause/resume; color thresholds
  useQuiz.js           ← question progression, submit logic, XP calc
  useXP.js             ← addXp(amount), spendXp(amount), dual ledger sync
  useStreak.js         ← checkAndUpdateStreak() on app foreground
  useMistakeBank.js    ← add, remove, clear, re-attempt logic
  usePowerUp.js        ← activate, consume, inventory check
```

### 3.6 Animation Patterns (React Native Reanimated 3)

| Animation | Method | Duration |
|---|---|---|
| Button press (scale 0.96) | `useSharedValue` + `withSpring` | 200ms |
| Quiz option selection | `withTiming` — border + background | 200ms |
| Score ring fill (Results) | `withTiming` on strokeDashoffset | 1200ms, easing.out |
| Timer ring update | `withTiming` — linear per second | 900ms |
| Toast slide-in | `withSpring` from -20 translateY | 300ms |
| Achievement overlay | `withSpring` scale from 0.85 | 280ms |
| Theme crossfade | `withTiming` on background color | 300ms |
| Progress bar fill | `withTiming` on width | 400ms |

---

## 4. Backend Route Architecture (v1.1+)

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | No | Accept `{ name, cls }`, return JWT + studentId |
| GET | `/api/subjects/:class` | Yes | Return subject list with icons and colors |
| GET | `/api/chapters/:class/:subject` | Yes | Return chapters with progress for student |
| GET | `/api/quiz/chapter` | Yes | Fetch precomputed quiz JSON from R2 |
| POST | `/api/quiz/generate` | Yes | Generate AI quiz via OpenRouter API |
| POST | `/api/quiz/submit` | Yes | Save session, calculate XP, update streak, sync mistake bank |
| GET | `/api/notes/:class/:subject/:chapter` | Yes | Return signed R2 PDF URL (15-min expiry) |
| GET | `/api/leaderboard/global` | Yes | Top 50 students by xp_earned |
| GET | `/api/leaderboard/subject/:subject` | Yes | Top 50 by xp_earned in subject |
| GET | `/api/leaderboard/chapter/:chapter` | Yes | Top 50 by correct answers + time in chapter |
| GET | `/api/profile/:studentId` | Yes | Profile, streak, subject progress, achievements |
| GET | `/api/shop/items` | Yes | All cosmetic items with prices |
| POST | `/api/shop/purchase` | Yes | Deduct from xp_balance, add to owned cosmetics |
| POST | `/api/mistake-bank/sync` | Yes | Upsert client mistake bank to server |
| DELETE | `/api/mistake-bank/:itemId` | Yes | Remove cleared item from server bank |

### 4.1 Middleware Stack (per request)

```
Request
  → express-rate-limit     (60 req/min/IP; 10/min for /api/quiz/generate)
  → cors                   (Expo dev + production bundle whitelist)
  → express.json()
  → jwtMiddleware          (verify HS256 token; skip /api/auth/login)
  → zodValidate            (route-specific Zod schema)
  → routeHandler
  → errorHandler           (global catch; structured JSON error response)
Response
```

---

## 5. Database Schema (Full SQL)

### 5.1 students

```sql
CREATE TABLE students (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(60) NOT NULL,
  class        VARCHAR(10) NOT NULL CHECK (class IN ('6','7','8','9','10','11','12')),
  xp_earned    INTEGER DEFAULT 0,   -- lifetime; never decremented; leaderboard rank source
  xp_balance   INTEGER DEFAULT 0,   -- spendable; decremented on shop purchase
  streak       INTEGER DEFAULT 0,
  last_active  DATE,
  push_token   VARCHAR(200),        -- Expo push token for notifications (v1.1+)
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_students_xp ON students(xp_earned DESC);
```

### 5.2 quiz_sessions

```sql
CREATE TABLE quiz_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID REFERENCES students(id) ON DELETE CASCADE,
  subject      VARCHAR(50)  NOT NULL,
  chapter      VARCHAR(100) NOT NULL,
  class        VARCHAR(10)  NOT NULL,
  difficulty   VARCHAR(10)  CHECK (difficulty IN ('spark','blaze','inferno')),
  mode         VARCHAR(15)  CHECK (mode IN ('precomputed','ai')),
  power_up     VARCHAR(20)  CHECK (power_up IN ('shield','timeFreeze','doubleXp','hint') OR power_up IS NULL),
  score        INTEGER NOT NULL,
  total_q      INTEGER NOT NULL,
  time_taken   INTEGER NOT NULL,    -- seconds
  xp_earned    INTEGER NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_student  ON quiz_sessions(student_id);
CREATE INDEX idx_sessions_chapter  ON quiz_sessions(chapter, subject);
CREATE INDEX idx_sessions_created  ON quiz_sessions(created_at DESC);
```

### 5.3 ai_quizzes

```sql
CREATE TABLE ai_quizzes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject        VARCHAR(50)  NOT NULL,
  chapter        VARCHAR(100) NOT NULL,
  topic          VARCHAR(150) NOT NULL,
  difficulty     VARCHAR(10)  NOT NULL,
  class          VARCHAR(10)  NOT NULL,
  questions_json JSONB        NOT NULL,
  created_at     TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX idx_ai_quizzes_lookup ON ai_quizzes(subject, chapter, topic, difficulty, class);
```

### 5.4 chapter_notes

```sql
CREATE TABLE chapter_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject     VARCHAR(50)  NOT NULL,
  chapter     VARCHAR(100) NOT NULL,
  class       VARCHAR(10)  NOT NULL,
  pdf_r2_key  VARCHAR(300) NOT NULL,
  page_count  INTEGER,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (subject, chapter, class)
);
```

### 5.5 mistake_bank

```sql
CREATE TABLE mistake_bank (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID REFERENCES students(id) ON DELETE CASCADE,
  subject      VARCHAR(50)  NOT NULL,
  question     TEXT         NOT NULL,
  correct_ans  VARCHAR(300) NOT NULL,
  wrong_ans    VARCHAR(300) NOT NULL,
  explanation  TEXT,
  source_mode  VARCHAR(15)  CHECK (source_mode IN ('precomputed','ai')),
  cleared      BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mistake_bank_student ON mistake_bank(student_id, cleared);
```

### 5.6 student_cosmetics

```sql
CREATE TABLE student_cosmetics (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID REFERENCES students(id) ON DELETE CASCADE,
  item_id      VARCHAR(50) NOT NULL,    -- e.g. 'scholar', 'blue', 'grid', 'crown'
  category     VARCHAR(20) NOT NULL CHECK (category IN ('shape','color','background','frame')),
  is_equipped  BOOLEAN DEFAULT FALSE,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, item_id)
);

CREATE INDEX idx_cosmetics_student ON student_cosmetics(student_id);
```

### 5.7 Leaderboard Views

```sql
-- Global: ranked by lifetime XP earned (xp_earned; never decremented)
CREATE VIEW leaderboard_global AS
  SELECT
    s.id          AS student_id,
    s.name,
    s.class,
    s.xp_earned   AS total_xp,
    s.streak,
    COUNT(qs.id)  AS quizzes_completed,
    RANK() OVER (ORDER BY s.xp_earned DESC) AS rank
  FROM students s
  LEFT JOIN quiz_sessions qs ON qs.student_id = s.id
  GROUP BY s.id;

-- Subject: ranked by XP earned in sessions for that subject
CREATE VIEW leaderboard_subject AS
  SELECT
    s.id              AS student_id,
    s.name,
    s.class,
    qs.subject,
    SUM(qs.xp_earned) AS subject_xp,
    RANK() OVER (PARTITION BY qs.subject ORDER BY SUM(qs.xp_earned) DESC) AS rank
  FROM students s
  JOIN quiz_sessions qs ON qs.student_id = s.id
  GROUP BY s.id, qs.subject;

-- Chapter: ranked by best score DESC, then fastest time ASC
CREATE VIEW leaderboard_chapter AS
  SELECT
    s.id               AS student_id,
    s.name,
    s.class,
    qs.chapter,
    qs.subject,
    MAX(qs.score)      AS best_score,
    MIN(qs.time_taken) AS best_time,
    RANK() OVER (
      PARTITION BY qs.chapter, qs.subject
      ORDER BY MAX(qs.score) DESC, MIN(qs.time_taken) ASC
    ) AS rank
  FROM students s
  JOIN quiz_sessions qs ON qs.student_id = s.id
  GROUP BY s.id, qs.chapter, qs.subject;
```

---

## 6. XP Calculation Formula

```js
// Per-question XP (evaluated on each correct answer)
const baseXP        = 10                              // +10 XP per correct answer
const speedBonus    = (timerAtSubmit >= 22) ? 5 : 0   // +5 XP if answered in <= 8s of 30s

// Session-level multipliers
const diffMult      = { spark: 1.0, blaze: 1.5, inferno: 2.0 }[difficulty]
const powerUpMult   = activePowerUp === 'doubleXp' ? 2.0 : 1.0
const aiBonus       = mode === 'ai' ? 1.2 : 1.0       // AI mode bonus (v1.1+ only)

// Final XP for session
const totalXP       = Math.floor(
  (correctAnswers * (baseXP + speedBonus)) * diffMult * powerUpMult * aiBonus
)

// Dual ledger update (both always increase together on earn)
xpEarned  += totalXP   // NEVER decremented; sole source for leaderboard rank
xpBalance += totalXP   // Decremented when purchasing cosmetics in Avatar Shop
```

**Mistake Bank bonuses (outside of quiz session, applied to both ledgers):**
- Correct re-attempt: **+10 XP**
- Clearing entire bank: **+50 XP Comeback Bonus**

---

## 7. OpenRouter API Integration (v1.1+)

### 7.1 System Prompt

```
You are an NCERT curriculum expert creating quiz questions for Indian school students.
You ALWAYS return ONLY a valid JSON array.
No preamble, no explanation, no markdown fences.
Every element must match the exact schema provided.
Questions must be factually accurate and age-appropriate for the specified class.
```

### 7.2 User Prompt Template

```
Generate {count} quiz questions on the topic "{topic}" from the chapter "{chapter}"
in {subject} for Class {class} NCERT textbook. Difficulty: {difficulty}.
Mix of MCQ and Fill in the Blank. Use natural, clear language.

Return a JSON array where every item matches this exact schema:
[{
  "type": "mcq" | "fill",
  "question": "string",
  "options": ["A", "B", "C", "D"],    // only for MCQ; omit for fill
  "answer": "string",                  // correct option text for MCQ; answer word for fill
  "explanation": "one sentence max"
}]
```

### 7.3 Response Validation Pipeline

```
1. JSON.parse() the response string
2. Confirm result is an array with length = requested count
3. For each item validate:
   - type        in { 'mcq', 'fill' }
   - question    → non-empty string
   - answer      → non-empty string
   - explanation → non-empty string
   - options     → array of exactly 4 strings (MCQ only)
   - answer      → must equal one of options[] (MCQ only)
4. If any validation fails → retry once with appended stricter instruction
5. Second attempt fails → return HTTP 500 { error: 'AI generation failed' }
6. All valid → INSERT INTO ai_quizzes → return { questions, mode: 'ai' }
```

### 7.4 Caching Strategy

| Property | Value |
|---|---|
| Cache key | `(subject, chapter, topic, difficulty, class)` composite index |
| Cache TTL | Indefinite (NCERT content is stable; purge manually on updates) |
| Cache hit | Return stored `questions_json`; skip API call entirely |
| Rate limit | 10 requests/min/IP on `/api/quiz/generate` to prevent abuse |
| Model | `OpenRouter Step3.5:Free` (cost-efficient; fast response for quiz generation) |

---

## 8. Cloudflare R2 File Structure

```
BrainBlaze-bucket/
  quizzes/
    {class}/
      {subject}/
        {chapter}/
          spark.json
          blaze.json
          inferno.json
  notes/
    {class}/
      {subject}/
        {chapter}.pdf
```

### 8.1 R2 Object Key Convention

```
quizzes/9/mathematics/polynomials/blaze.json
notes/9/mathematics/polynomials.pdf
```

All keys use lowercase, hyphen-separated words. Spaces replaced with hyphens. Class is numeric only (`9`, not `class-9`).

### 8.2 Quiz JSON Schema (per file)

```json
{
  "subject": "Mathematics",
  "chapter": "Polynomials",
  "class": "9",
  "difficulty": "blaze",
  "questions": [
    {
      "type": "mcq",
      "question": "Degree of 3x^2 + 2x + 1?",
      "options": ["1", "2", "3", "0"],
      "answer": "2",
      "explanation": "Highest power of x is 2."
    },
    {
      "type": "fill",
      "question": "Sqrt(144) = ?",
      "answer": "12",
      "explanation": "12 x 12 = 144."
    }
  ]
}
```

---

## 9. Power-Up System Design

### 9.1 Power-Up Inventory

| Power-Up | ID | Effect | Scope |
|---|---|---|---|
| Shield | `shield` | Protects streak from a missed day | 1 per activation |
| Time Freeze | `timeFreeze` | Pauses 30s timer for 15 seconds | 1 per quiz session |
| Double XP | `doubleXp` | Applies x2.0 multiplier to all XP this session | 1 per quiz session |
| Hint | `hint` | Removes one incorrect MCQ option | Up to 3 per session |

### 9.2 Activation Rules

```
1. User selects power-up on ChapterDetailScreen (optional; max 1 active per session)
2. Power-up card shows disabled state if inventory count = 0
3. On quiz start, activePowerUp is set in QuizContext
4. Power-up consumed at point of activation during quiz:
   - timeFreeze → consumed on "Freeze Timer" button tap; timer frozen 15s
   - hint       → consumed per "Hint" tap; tracked via hintsUsed (max 3)
   - doubleXp   → consumed on quiz start; Double XP banner shown throughout
   - shield     → consumed when streak-break detected on next app open
5. Inventory persisted to AsyncStorage (v1.0) / power_up_inventory table (v1.1)
```

---

## 10. Notification System

### 10.1 Notification Types

| ID | Trigger | Title | Body |
|---|---|---|---|
| `streak_reminder` | User hasn't opened app by 7 PM | Don't break your streak! | Study 10 mins today. |
| `quiz_available` | New quiz content pushed | New quiz is live | Subject quiz waiting! |
| `achievement_unlock` | Score >= 90% or leaderboard milestone | Achievement unlocked | Achievement name |
| `double_xp_active` | 7-day streak milestone | Double XP unlocked! | Active for your next quiz. |

### 10.2 v1.0 — Local Notifications (Expo Notifications)

```
1. On app install → request notification permission
2. Schedule local notification at 7 PM daily → streak_reminder
3. Cancel + reschedule on quiz completion
4. Achievement overlays shown in-app via AchievementOverlay component
```

### 10.3 v1.1 — Server-triggered Push

```
1. On login → register Expo Push Token with backend → store in students.push_token
2. Backend cron (daily 7 PM IST) → query students where last_active < today
   → send streak_reminder push via Expo Push API
3. On quiz submit where score >= 90% → server sends achievement_unlock push
4. New content deploys trigger quiz_available broadcast
```

---

## 11. Avatar Shop System Design

### 11.1 Item Categories and Pricing

| Category | Items | Free Tier | Max Cost |
|---|---|---|---|
| Shape | Student, Scholar, Genius, Champion | Student (0 XP) | 800 XP |
| Color | White, Blue, Peach, Mint | White (0 XP) | 500 XP |
| Background | Plain, Grid, Gradient | Plain (0 XP) | 800 XP |
| Frame | None, Thin Ring, Crown | None (0 XP) | 2,500 XP |

### 11.2 Purchase Flow

```
1. User taps item in AvatarShopScreen
2. Already owned → equip immediately; show "Equipped" toast
3. Not owned and xpBalance >= item.cost:
   a. Deduct item.cost from xpBalance ONLY (xpEarned unchanged)
   b. Add item.id to ownedCosmetics[]
   c. Set equippedCosmetics[category] = item.id
   d. Show "[Item] unlocked!" toast (Mint color)
4. Not owned and xpBalance < item.cost:
   a. Button disabled (bg3 fill + muted text)
   b. Toast: "Need {deficit} more XP" (Red color)
5. Sync to AsyncStorage (v1.0) / student_cosmetics table (v1.1)
```

**Key invariant:** `xp_earned` is NEVER decremented by shop purchases. Leaderboard rank is always based on total XP ever earned, making cosmetic purchases risk-free for competitive players.

---

## 12. Security Considerations

| Area | Measure |
|---|---|
| API Keys | OpenRouter + R2 keys in Railway env vars only; never in client bundle |
| JWT | HS256 signed; 7-day expiry; studentId + class in payload |
| Rate Limiting | 60 req/min global; 10 req/min on `/api/quiz/generate` |
| XP Integrity | v1.0: client-side (trust model); v1.1: server-authoritative |
| Fill Answer Exposure | Correct answers never sent to client before submission (v1.1) |
| R2 Notes | PDF URLs are signed with 15-minute expiry; no permanent public links |
| PII | Only name + class collected; no email, phone, or location data |

---

## 13. Project Folder Structure

```
frontend/
  app/                              ← Expo Router (file-based navigation)
    (onboarding)/
      index.jsx                     ← Onboarding 1: Name entry
      class.jsx                     ← Onboarding 2: Class selection
    (tabs)/
      index.jsx                     ← Dashboard
      quiz.jsx                      ← Subject Browser (Quiz tab)
      mistakes.jsx                  ← Mistake Bank
      leaderboard.jsx               ← Leaderboard (Global/Subject/Chapter)
      profile.jsx                   ← Profile
    subject/[name].jsx              ← Subject Browser (from Dashboard)
    chapter/[name].jsx              ← Chapter Detail
    quiz/[chapter].jsx              ← Active Quiz
    results.jsx                     ← Results Screen
    shop.jsx                        ← Avatar Shop

  src/
    api/                            ← API client + service files (v1.1+)
      client.js
      authApi.js
      quizApi.js
      leaderboardApi.js
      profileApi.js
      notesApi.js
      mistakeBankApi.js
      shopApi.js

    components/                     ← Shared UI components
      BottomNav.jsx
      ToastNotification.jsx
      AchievementOverlay.jsx
      NotificationPanel.jsx
      ProgressBar.jsx
      CircularTimer.jsx
      SegmentedProgress.jsx
      QuizOptionRow.jsx
      SubjectCard.jsx
      ChapterItem.jsx
      PowerUpCard.jsx
      ThemeToggle.jsx
      Tap.jsx                       ← Universal press handler (scale + brightness)

    contexts/
      AuthContext.jsx               ← name, cls, xpEarned, xpBalance, streak, jwt
      QuizContext.jsx               ← session state (currentQ, score, timer, etc.)
      ThemeContext.jsx              ← isDark + DARK_THEME / LIGHT_THEME export

    hooks/
      useTimer.js                   ← 30s countdown; pause/resume; color thresholds
      useQuiz.js                    ← question progression, submit, XP calc
      useXP.js                      ← addXp, spendXp, dual ledger sync
      useStreak.js                  ← checkAndUpdateStreak on app foreground
      useMistakeBank.js             ← add, remove, clear, re-attempt
      usePowerUp.js                 ← activate, consume, inventory check

    theme/
      colors.js                     ← DARK_THEME and LIGHT_THEME token objects
      typography.js                 ← font sizes, weights, line heights
      spacing.js                    ← base unit, padding, border-radius tokens

    utils/
      xpCalc.js                     ← XP formula (Section 6)
      streakCalc.js                 ← streak increment / reset logic
      fuzzyMatch.js                 ← fast-levenshtein for fill answer comparison
      formatTime.js                 ← seconds → "1m 12s" display

    assets/
      quizzes/                      ← Bundled precomputed JSON (v1.0 only)
        {subject}/
          {chapter}/
            spark.json
            blaze.json
            inferno.json

  backend/                          ← Node.js + Express (v1.1+)
    src/
      routes/
        auth.js
        quiz.js                     ← chapter fetch, AI generate, submit
        leaderboard.js
        profile.js
        notes.js
        shop.js
        mistakeBank.js
      middleware/
        jwt.js
        rateLimiter.js
        zodValidate.js
        errorHandler.js
      services/
        anthropic.js                ← Anthropic Claude API call + validation pipeline
        r2.js                       ← Cloudflare R2 fetch + signed URL generation
        supabase.js                 ← Supabase client singleton
      utils/
        xpCalc.js                   ← Server-authoritative XP formula (mirrors frontend)
        streakCalc.js
        promptBuilder.js            ← Build Claude prompt from quiz config
    index.js
    .env.example

  scripts/
    precompute-quizzes.js           ← Generate all difficulty JSONs + upload to R2
    upload-notes.js                 ← Upload PDF notes to R2 + register in DB
    seed-leaderboard.js             ← Seed mock leaderboard data for development
```


## 14. Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.1 | 2026-01 | Engineering Team | Initial HLD; React Native + Supabase stack |
| 0.5 | 2026-02 | Engineering Team | LLD: DB schema, XP formula, R2 structure |
| 1.0 | 2026-03 | Engineering Team | Aligned to BrainBlaze PRD v1.0 + SRS v1.0 + UI/UX v1.0; added Mistake Bank table, dual XP ledger, cosmetics schema, power-up system, notification system, Avatar Shop flow

---

*BrainBlaze System Design Document · Version 1.0 · HLD + LLD · Confidential*
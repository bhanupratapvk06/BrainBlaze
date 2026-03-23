# BrainBlaze — API Documentation

**Version:** v1.1 | **Date:** March 2026 | **Base URL:** `https://api.eduquest.app/api`

---

## Overview

The BrainBlaze API is a RESTful HTTP API served from the Node.js + Express backend hosted on Railway. All responses are JSON. All requests except `/auth/login` require a valid JWT in the `Authorization` header.

> **v1.0 note:** The core quiz experience (precomputed questions, XP, streak, Mistake Bank, Avatar Shop) runs entirely client-side using AsyncStorage in v1.0. This backend API is introduced in **v1.1** to add cloud sync, live leaderboards, AI Quiz generation, and server-authoritative XP. Endpoints marked **`[v1.1+]`** are not called in v1.0.

| Property | Value |
|---|---|
| Base URL | `https://api.eduquest.app/api` |
| Protocol | HTTPS only |
| Auth | Bearer JWT (HS256, **7-day** expiry) |
| Rate Limit | 60 requests / minute / IP (10 req/min on `/quiz/generate`) |
| Response Format | `application/json` |
| API Version | v1.1 (March 2026) |

---

## Authentication

BrainBlaze uses **JWT (JSON Web Tokens)** with HS256 signing. Pass the token in the `Authorization` header of every authenticated request.

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### JWT Payload

```json
{
  "studentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Rahul",
  "class": "9",
  "iat": 1711234567,
  "exp": 1711839367
}
```

- Token expiry: **7 days** (604,800 seconds)
- Clients must call `/auth/login` again after expiry
- Tokens are stateless — no server-side session storage
- `studentId` and `class` are included to avoid extra DB lookups on common routes

### Standard Error Response (all endpoints)

```json
{
  "error": "Human-readable message",
  "code": "ERROR_CODE_CONSTANT",
  "status": 401
}
```

### Global Error Codes

| HTTP | Code | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Request body / params failed Zod schema |
| 401 | `AUTH_REQUIRED` | Missing, expired, or malformed JWT |
| 403 | `FORBIDDEN` | Valid JWT but insufficient permission |
| 404 | `NOT_FOUND` | Resource does not exist |
| 429 | `RATE_LIMITED` | Request rate exceeded |
| 500 | `DB_ERROR` | Supabase write or read failed |
| 500 | `R2_ERROR` | Cloudflare R2 fetch failed |
| 500 | `AI_ERROR` | Anthropic Claude generation failed after retry |

---

## Endpoints

---

### 1. Authentication

#### `POST /auth/login` `[v1.1+]`

Creates or retrieves a student record and returns a JWT. BrainBlaze does not require email or password — only a name and class are needed. If a student with the same name + class already exists, their existing record is returned.

**Auth Required:** No

**Request Body:**

```json
{
  "name": "Rahul",
  "class": "9"
}
```

**Validation:**
- `name`: string, 1–60 characters, required (empty name allowed only on client skip — server default is `"Student"`)
- `class`: one of `"6"`, `"7"`, `"8"`, `"9"`, `"10"`, `"11"`, `"12"`, required

**Response — 200 OK:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "student": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Rahul",
    "class": "9",
    "xpEarned": 2450,
    "xpBalance": 1200,
    "streak": 5,
    "lastActive": "2026-03-22",
    "powerUps": {
      "shield": 2,
      "timeFreeze": 1,
      "doubleXp": 1,
      "hint": 3
    },
    "equippedCosmetics": {
      "shape": "student",
      "color": "white",
      "background": "plain",
      "frame": "none"
    },
    "ownedCosmetics": ["student", "white", "plain", "none"],
    "createdAt": "2026-01-15T10:00:00Z"
  }
}
```

> **Dual XP Ledger:** `xpEarned` is the lifetime total used for leaderboard rank and is **never decremented**. `xpBalance` is the spendable currency that decreases when purchasing Avatar Shop items. Both fields must be persisted to client storage after login.

**Error Codes:**

| HTTP | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Name is empty or class is not in range 6–12 |
| 500 | `DB_ERROR` | Supabase upsert failed |

---

### 2. Subjects

#### `GET /subjects/:class` `[v1.1+]`

Returns the subject list for a given class, including UI metadata (icon, color) used by `SubjectCard` components in the Dashboard and Subject Browser screens.

**Auth Required:** Yes

**Path Params:**
- `class` — string, one of `"6"` through `"12"`

**Response — 200 OK:**

```json
{
  "class": "9",
  "subjects": [
    {
      "name": "Mathematics",
      "slug": "mathematics",
      "icon": "📐",
      "color": "#A8DAB5",
      "chapterCount": 9,
      "description": "Number Systems to Probability"
    },
    {
      "name": "Science",
      "slug": "science",
      "icon": "🔬",
      "color": "#D4C5E2",
      "chapterCount": 9,
      "description": "Matter to Gravitation"
    },
    {
      "name": "History",
      "slug": "history",
      "icon": "🌍",
      "color": "#FFC2A6",
      "chapterCount": 8,
      "description": "French Revolution to Clothing"
    },
    {
      "name": "English",
      "slug": "english",
      "icon": "📖",
      "color": "#E8D5C4",
      "chapterCount": 8,
      "description": "Reading Comprehension & Grammar"
    },
    {
      "name": "Computer",
      "slug": "computer",
      "icon": "💻",
      "color": "#B8E0D2",
      "chapterCount": 8,
      "description": "IT Fundamentals to Networking"
    },
    {
      "name": "Art",
      "slug": "art",
      "icon": "🎨",
      "color": "#E2C3F0",
      "chapterCount": 8,
      "description": "Drawing Basics to Digital Art"
    }
  ]
}
```

**Error Codes:**

| HTTP | Code | When |
|---|---|---|
| 401 | `AUTH_REQUIRED` | Missing or invalid JWT |
| 404 | `NOT_FOUND` | No subjects defined for this class |

---

### 3. Chapters

#### `GET /chapters/:class/:subject` `[v1.1+]`

Returns all chapters for a subject with the authenticated student's per-chapter progress, difficulty completion flags, and notes availability. Used by the Subject Browser and Chapter Detail screens.

**Auth Required:** Yes

**Path Params:**
- `class` — string, e.g. `"9"`
- `subject` — slug, e.g. `"mathematics"`

**Response — 200 OK:**

```json
{
  "subject": "Mathematics",
  "class": "9",
  "chapters": [
    {
      "id": "uuid",
      "name": "Number Systems",
      "slug": "number-systems",
      "number": 1,
      "progress": 100,
      "difficultyProgress": {
        "spark": true,
        "blaze": true,
        "inferno": false
      },
      "xpEarned": 330,
      "quizCount": 3,
      "hasNotes": true,
      "lessonCount": 22,
      "estimatedMinutes": 105,
      "questionCount": 40
    },
    {
      "id": "uuid",
      "name": "Polynomials",
      "slug": "polynomials",
      "number": 2,
      "progress": 60,
      "difficultyProgress": {
        "spark": true,
        "blaze": false,
        "inferno": false
      },
      "xpEarned": 110,
      "quizCount": 1,
      "hasNotes": true,
      "lessonCount": 18,
      "estimatedMinutes": 90,
      "questionCount": 30
    }
  ]
}
```

> `lessonCount`, `estimatedMinutes`, and `questionCount` populate the info chips shown on the Chapter Detail screen (`📚 22 Lessons`, `⏱️ 1hr 45min`, `❓ 40 Questions`).

**Error Codes:**

| HTTP | Code | When |
|---|---|---|
| 401 | `AUTH_REQUIRED` | JWT missing or invalid |
| 404 | `NOT_FOUND` | Subject slug not found for this class |

---

### 4. Precomputed Quiz

#### `GET /quiz/chapter` `[v1.1+]`

Fetches a precomputed quiz JSON from Cloudflare R2 for a specific chapter and difficulty. In v1.0, the equivalent JSON is read directly from bundled app assets at `assets/quizzes/{subject}/{chapter}/{difficulty}.json`.

**Auth Required:** Yes

**Query Params:**

| Param | Type | Required | Description |
|---|---|---|---|
| `subject` | string | Yes | Slug, e.g. `"mathematics"` |
| `chapter` | string | Yes | Slug, e.g. `"polynomials"` |
| `class` | string | Yes | e.g. `"9"` |
| `difficulty` | string | Yes | `"spark"` \| `"blaze"` \| `"inferno"` |

**Response — 200 OK:**

```json
{
  "mode": "precomputed",
  "subject": "Mathematics",
  "chapter": "Polynomials",
  "class": "9",
  "difficulty": "blaze",
  "totalQuestions": 5,
  "questions": [
    {
      "id": "uuid",
      "type": "mcq",
      "question": "Degree of 3x² + 2x + 1?",
      "options": ["1", "2", "3", "0"],
      "answer": "2",
      "explanation": "Highest power of x is 2."
    },
    {
      "id": "uuid",
      "type": "fill",
      "question": "√144 = ?",
      "answer": "12",
      "explanation": "12 × 12 = 144."
    }
  ]
}
```

> **Answer security (v1.1):** Correct answers are included in this response for rendering feedback immediately after submission. In a future hardened version, answers could be withheld and validated server-side via `/quiz/submit`. For v1.1, client-side validation is acceptable given the non-monetary nature of XP.

**Error Codes:**

| HTTP | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing or invalid query params |
| 401 | `AUTH_REQUIRED` | JWT missing |
| 404 | `NOT_FOUND` | Quiz JSON not found in R2 for this combination |
| 500 | `R2_ERROR` | Cloudflare R2 fetch failed |

---

### 5. AI Topic Quiz

#### `POST /quiz/generate` `[v1.1+]`

Generates a custom AI quiz for a specific topic using the Anthropic Claude API (`claude-sonnet-4-6`). Checks the `ai_quizzes` cache table first. On cache miss, calls Claude, validates the response, caches it, and returns it.

**Auth Required:** Yes

**Rate Limit:** **10 requests / minute / IP** (stricter than global 60/min)

**Request Body:**

```json
{
  "subject": "Mathematics",
  "chapter": "Polynomials",
  "topic": "Degree of a Polynomial",
  "difficulty": "blaze",
  "class": "9",
  "count": 5
}
```

**Validation:**
- `subject`: string, required
- `chapter`: string, required
- `topic`: string, 3–150 characters, required
- `difficulty`: `"spark"` | `"blaze"` | `"inferno"`, required
- `class`: one of `"6"`–`"12"`, required
- `count`: integer, 5–30, default `5`

**Response — 200 OK:**

```json
{
  "mode": "ai",
  "cached": false,
  "subject": "Mathematics",
  "chapter": "Polynomials",
  "topic": "Degree of a Polynomial",
  "difficulty": "blaze",
  "class": "9",
  "generatedAt": "2026-03-21T14:30:00Z",
  "questions": [
    {
      "id": "uuid",
      "type": "mcq",
      "question": "What is the degree of the polynomial 5x³ + 2x² - x + 7?",
      "options": ["1", "2", "3", "7"],
      "answer": "3",
      "explanation": "Degree is the highest power of the variable, which is 3."
    },
    {
      "id": "uuid",
      "type": "fill",
      "question": "A polynomial with degree 0 is called a _____ polynomial.",
      "answer": "constant",
      "explanation": "A degree-0 polynomial has no variable term — it is a constant."
    }
  ]
}
```

> When `cached: true`, `generatedAt` reflects the original generation timestamp. The AI badge is shown in the Quiz screen UI whenever `mode === "ai"`.

**Claude Prompt (server-side — never exposed to client):**

```
System:
You are an NCERT curriculum expert creating quiz questions for Indian school students.
You ALWAYS return ONLY a valid JSON array.
No preamble, no explanation, no markdown fences.
Every element must match the exact schema provided.
Questions must be factually accurate and age-appropriate for the specified class.

User:
Generate 5 quiz questions on the topic "Degree of a Polynomial" from the chapter
"Polynomials" in Mathematics for Class 9 NCERT. Difficulty: blaze.
Mix of MCQ and Fill in the Blank. Use natural, clear language.

Return a JSON array where every item matches this exact schema:
[{
  "type": "mcq" | "fill",
  "question": "string",
  "options": ["A", "B", "C", "D"],
  "answer": "string",
  "explanation": "one sentence max"
}]
```

**Error Codes:**

| HTTP | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing topic or invalid params |
| 401 | `AUTH_REQUIRED` | JWT missing |
| 429 | `RATE_LIMITED` | 10 req/min IP limit reached |
| 500 | `AI_ERROR` | Claude generation failed after one retry |
| 500 | `INVALID_AI_RESPONSE` | Claude returned non-parseable JSON on both attempts |

---

### 6. Quiz Submission

#### `POST /quiz/submit` `[v1.1+]`

Saves a completed quiz session. Calculates XP server-side using the canonical formula, updates the student's `xp_earned`, `xp_balance`, and streak, inserts a `quiz_sessions` row, and syncs any new wrong answers to the `mistake_bank` table.

**Auth Required:** Yes

**Request Body:**

```json
{
  "subject": "Mathematics",
  "chapter": "Polynomials",
  "class": "9",
  "difficulty": "blaze",
  "mode": "precomputed",
  "activePowerUp": "doubleXp",
  "score": 4,
  "totalQ": 5,
  "timeTaken": 87,
  "wrongAnswers": [
    {
      "question": "HCF of 12 and 18?",
      "correctAnswer": "6",
      "userAnswer": "3",
      "explanation": "Largest common factor is 6."
    }
  ]
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|---|---|---|---|
| `subject` | string | Yes | Subject name |
| `chapter` | string | Yes | Chapter name |
| `class` | string | Yes | Student's class |
| `difficulty` | string | Yes | `"spark"` \| `"blaze"` \| `"inferno"` |
| `mode` | string | Yes | `"precomputed"` \| `"ai"` |
| `activePowerUp` | string \| null | Yes | `"shield"` \| `"timeFreeze"` \| `"doubleXp"` \| `"hint"` \| `null` |
| `score` | integer | Yes | Number of correct answers |
| `totalQ` | integer | Yes | Total questions in session |
| `timeTaken` | integer | Yes | Total seconds taken for session |
| `wrongAnswers` | array | Yes | Array of incorrectly answered questions (may be empty `[]`) |

**Server-side XP Calculation:**

```js
// Base: +10 XP per correct answer
// Speed bonus: +5 XP if entire session timeTaken < (totalQ * 8)
// i.e. answered all questions in under 8 seconds average
const avgTimePerQ   = timeTaken / totalQ
const speedBonus    = (avgTimePerQ < 8 && score > 0) ? 5 * score : 0
const baseXP        = (score * 10) + speedBonus

const diffMult      = { spark: 1.0, blaze: 1.5, inferno: 2.0 }[difficulty]
const powerUpMult   = activePowerUp === 'doubleXp' ? 2.0 : 1.0
const aiBonus       = mode === 'ai' ? 1.2 : 1.0

const totalXP       = Math.floor(baseXP * diffMult * powerUpMult * aiBonus)

// Both ledgers increase by totalXP
// xp_earned: NEVER decremented (leaderboard rank source)
// xp_balance: decremented by Avatar Shop purchases
```

**Response — 200 OK:**

```json
{
  "sessionId": "uuid",
  "xpEarned": 120,
  "xpEarnedTotal": 2570,
  "xpBalance": 1320,
  "newStreak": 6,
  "speedBonusApplied": false,
  "aiBonusApplied": false,
  "doubleXpApplied": true,
  "mistakesSaved": 1,
  "streakMilestone": null
}
```

> `streakMilestone` is non-null when the session triggers a milestone (e.g. `"7_day_streak"` unlocks Double XP notification). The client uses this to show the streak achievement overlay and dispatch a notification.

**Error Codes:**

| HTTP | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `score > totalQ`, missing fields, invalid difficulty |
| 401 | `AUTH_REQUIRED` | JWT missing |
| 500 | `DB_ERROR` | Supabase write failed |

---

### 7. Chapter Notes (PDF)

#### `GET /notes/:class/:subject/:chapter` `[v1.1+]`

Returns a signed Cloudflare R2 URL for the chapter PDF notes. **URL expires in 15 minutes.** The client must request a fresh URL on each view — the signed URL must not be cached locally.

**Auth Required:** Yes

**Path Params:**
- `class` — e.g. `"9"`
- `subject` — slug, e.g. `"mathematics"`
- `chapter` — slug, e.g. `"polynomials"`

**Response — 200 OK:**

```json
{
  "chapter": "Polynomials",
  "subject": "Mathematics",
  "class": "9",
  "pageCount": 14,
  "expiresIn": 900,
  "url": "https://pub-xxx.r2.dev/notes/9/mathematics/polynomials.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=900&..."
}
```

> In v1.0, the Download Notes button triggers a toast `"Notes downloading... ✓"` as a placeholder. The signed URL flow activates in v1.1 when this endpoint is available.

**Error Codes:**

| HTTP | Code | When |
|---|---|---|
| 401 | `AUTH_REQUIRED` | JWT missing |
| 404 | `NOT_FOUND` | No PDF uploaded for this chapter |
| 500 | `R2_SIGN_ERROR` | R2 URL signing failed |

---

### 8. Leaderboard — Global

#### `GET /leaderboard/global` `[v1.1+]`

Returns the top 50 students ranked by `xp_earned` (lifetime total — never decremented by shop purchases). Always appends the requesting student's own entry at the end even if outside top 50.

**Auth Required:** Yes

**Query Params (optional):**
- `limit` — integer, max `50`, default `50`

**Response — 200 OK:**

```json
{
  "tab": "global",
  "updatedAt": "2026-03-21T14:00:00Z",
  "leaderboard": [
    {
      "rank": 1,
      "studentId": "uuid",
      "name": "Priya Sharma",
      "class": "9",
      "avatar": "🐱",
      "xpEarned": 3200,
      "streak": 21,
      "quizzesCompleted": 48
    },
    {
      "rank": 2,
      "studentId": "uuid",
      "name": "Rahul Verma",
      "class": "9",
      "avatar": "🦊",
      "xpEarned": 2850,
      "streak": 15,
      "quizzesCompleted": 39
    }
  ],
  "currentStudent": {
    "rank": 10,
    "studentId": "uuid",
    "name": "Rahul",
    "class": "9",
    "avatar": "🐺",
    "xpEarned": 2450,
    "streak": 5,
    "quizzesCompleted": 24
  }
}
```

> `avatar` is the emoji used in the leaderboard podium and row UI. It is assigned at student creation and stored in the `students` table. The podium uses `rank 1 = center (tallest)`, `rank 2 = left`, `rank 3 = right` — matching the UI spec.

**Error Codes:**

| HTTP | Code | When |
|---|---|---|
| 401 | `AUTH_REQUIRED` | JWT missing |

---

### 9. Leaderboard — Subject

#### `GET /leaderboard/subject/:subject` `[v1.1+]`

Returns top 50 students ranked by XP earned specifically within a subject (sum of `xp_earned` across all `quiz_sessions` for that subject). Used by the Subject tab on the Leaderboard screen.

**Auth Required:** Yes

**Path Params:**
- `subject` — slug, e.g. `"mathematics"`

**Response — 200 OK:**

```json
{
  "tab": "subject",
  "subject": "Mathematics",
  "subjectIcon": "📐",
  "subjectColor": "#A8DAB5",
  "leaderboard": [
    {
      "rank": 1,
      "studentId": "uuid",
      "name": "Priya Sharma",
      "class": "9",
      "avatar": "🐱",
      "xpEarned": 890,
      "quizzesCompleted": 12
    }
  ],
  "currentStudent": {
    "rank": 4,
    "studentId": "uuid",
    "name": "Rahul",
    "class": "9",
    "avatar": "🐺",
    "xpEarned": 620,
    "quizzesCompleted": 8
  }
}
```

**Error Codes:**

| HTTP | Code | When |
|---|---|---|
| 401 | `AUTH_REQUIRED` | JWT missing |
| 404 | `NOT_FOUND` | Subject slug not recognized |

---

### 10. Leaderboard — Chapter

#### `GET /leaderboard/chapter/:chapter` `[v1.1+]`

Returns students ranked by best score (descending) then fastest time (ascending) for a specific chapter. Requires both `subject` and `chapter` to uniquely identify the content. Used by the Chapter tab on the Leaderboard screen — only shown after the user selects a subject and chapter.

**Auth Required:** Yes

**Path Params:**
- `chapter` — slug, e.g. `"polynomials"`

**Query Params:**
- `subject` — required, slug e.g. `"mathematics"`
- `class` — optional filter, e.g. `"9"`

**Response — 200 OK:**

```json
{
  "tab": "chapter",
  "chapter": "Polynomials",
  "subject": "Mathematics",
  "subjectIcon": "📐",
  "subjectColor": "#A8DAB5",
  "leaderboard": [
    {
      "rank": 1,
      "studentId": "uuid",
      "name": "Priya Sharma",
      "class": "9",
      "avatar": "🐱",
      "bestScore": 5,
      "totalQ": 5,
      "bestTime": 42,
      "xpEarned": 165
    },
    {
      "rank": 2,
      "studentId": "uuid",
      "name": "Rahul",
      "class": "9",
      "avatar": "🐺",
      "bestScore": 4,
      "totalQ": 5,
      "bestTime": 87,
      "xpEarned": 120
    }
  ],
  "currentStudent": {
    "rank": 2,
    "studentId": "uuid",
    "name": "Rahul",
    "bestScore": 4,
    "totalQ": 5,
    "bestTime": 87
  }
}
```

**Error Codes:**

| HTTP | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `subject` query param missing |
| 401 | `AUTH_REQUIRED` | JWT missing |
| 404 | `NOT_FOUND` | Chapter slug not recognized |

---

### 11. Profile

#### `GET /profile/:studentId` `[v1.1+]`

Returns the full profile data for a student. Includes the dual XP ledger, power-up inventory, streak calendar (35 days for heatmap), subject progress, achievements, and equipped cosmetics. Students can only access their own profile.

**Auth Required:** Yes

**Path Params:**
- `studentId` — UUID

**Response — 200 OK:**

```json
{
  "student": {
    "id": "uuid",
    "name": "Rahul",
    "class": "9",
    "avatar": "🐺",
    "xpEarned": 2450,
    "xpBalance": 1200,
    "streak": 5,
    "globalRank": 10,
    "quizzesCompleted": 24,
    "createdAt": "2026-01-15T00:00:00Z"
  },
  "powerUps": {
    "shield": 2,
    "timeFreeze": 1,
    "doubleXp": 1,
    "hint": 3
  },
  "equippedCosmetics": {
    "shape": "student",
    "color": "white",
    "background": "plain",
    "frame": "none"
  },
  "ownedCosmetics": ["student", "white", "plain", "none"],
  "heatmapData": {
    "days": [
      { "date": "2026-02-16", "activityLevel": 0 },
      { "date": "2026-02-17", "activityLevel": 2 },
      { "date": "2026-02-18", "activityLevel": 3 },
      { "date": "2026-03-21", "activityLevel": 1 },
      { "date": "2026-03-22", "activityLevel": 4 }
    ],
    "totalDays": 35
  },
  "barChartData": {
    "week": [
      { "day": "Mon", "pct": 65 },
      { "day": "Tue", "pct": 42 },
      { "day": "Wed", "pct": 88 },
      { "day": "Thu", "pct": 18 },
      { "day": "Fri", "pct": 100 },
      { "day": "Sat", "pct": 30 },
      { "day": "Sun", "pct": 55 }
    ]
  },
  "subjectProgress": [
    {
      "subject": "Mathematics",
      "icon": "📐",
      "color": "#A8DAB5",
      "progress": 72,
      "xpEarned": 890,
      "currentChapter": "Ch.4 Quadratics",
      "quizCount": 8
    },
    {
      "subject": "Science",
      "icon": "🔬",
      "color": "#D4C5E2",
      "progress": 45,
      "xpEarned": 620,
      "currentChapter": "Ch.2 Photosynthesis",
      "quizCount": 5
    }
  ],
  "achievements": [
    {
      "id": "streak_7",
      "icon": "🔥",
      "name": "7-Day Streak",
      "description": "7 days in a row",
      "unlocked": true,
      "unlockedAt": "2026-03-18T00:00:00Z"
    },
    {
      "id": "top_10",
      "icon": "🏆",
      "name": "Top 10",
      "description": "Leaderboard legend",
      "unlocked": true,
      "unlockedAt": "2026-03-20T00:00:00Z"
    },
    {
      "id": "perfect_score",
      "icon": "⭐",
      "name": "Perfect Score",
      "description": "100% on a quiz",
      "unlocked": false,
      "unlockedAt": null
    },
    {
      "id": "fast_learner",
      "icon": "⚡",
      "name": "Fast Learner",
      "description": "Speed bonus ×5",
      "unlocked": true,
      "unlockedAt": "2026-03-15T00:00:00Z"
    },
    {
      "id": "quiz_master",
      "icon": "🧠",
      "name": "Quiz Master",
      "description": "50 quizzes done",
      "unlocked": false,
      "unlockedAt": null
    },
    {
      "id": "mistake_slayer",
      "icon": "💪",
      "name": "Mistake Slayer",
      "description": "Cleared mistake bank",
      "unlocked": false,
      "unlockedAt": null
    }
  ],
  "recentSessions": [
    {
      "subject": "Mathematics",
      "chapter": "Polynomials",
      "difficulty": "blaze",
      "mode": "precomputed",
      "score": 4,
      "totalQ": 5,
      "xpEarned": 120,
      "createdAt": "2026-03-22T14:30:00Z"
    }
  ]
}
```

> `heatmapData.days` covers the last 35 days (5 weeks × 7 days) to populate the 35-cell activity heatmap on the Profile screen. `activityLevel` ranges from `0` (no activity) to `4` (high activity), mapped to the 4 opacity levels in the UI.

**Error Codes:**

| HTTP | Code | When |
|---|---|---|
| 401 | `AUTH_REQUIRED` | JWT missing |
| 403 | `FORBIDDEN` | Requesting another student's profile |
| 404 | `NOT_FOUND` | Student ID does not exist |

---

### 12. Avatar Shop — Get Items

#### `GET /shop/items` `[v1.1+]`

Returns all purchasable cosmetic items grouped by category, including each item's cost, the student's ownership status, and which item is currently equipped. Used to render the Avatar Shop screen.

**Auth Required:** Yes

**Response — 200 OK:**

```json
{
  "xpBalance": 1200,
  "categories": {
    "shape": [
      {
        "id": "student",
        "name": "Student",
        "icon": "🧑‍🎓",
        "cost": 0,
        "owned": true,
        "equipped": true
      },
      {
        "id": "scholar",
        "name": "Scholar",
        "icon": "👨‍💼",
        "cost": 300,
        "owned": false,
        "equipped": false
      },
      {
        "id": "genius",
        "name": "Genius",
        "icon": "🧠",
        "cost": 600,
        "owned": false,
        "equipped": false
      },
      {
        "id": "champion",
        "name": "Champion",
        "icon": "🏆",
        "cost": 800,
        "owned": false,
        "equipped": false
      }
    ],
    "color": [
      { "id": "white",  "name": "White", "hex": "#FFFFFF", "cost": 0,   "owned": true,  "equipped": true  },
      { "id": "blue",   "name": "Blue",  "hex": "#B8E0D2", "cost": 100, "owned": false, "equipped": false },
      { "id": "peach",  "name": "Peach", "hex": "#E8D5C4", "cost": 300, "owned": false, "equipped": false },
      { "id": "mint",   "name": "Mint",  "hex": "#A8DAB5", "cost": 500, "owned": false, "equipped": false }
    ],
    "background": [
      { "id": "plain",    "name": "Plain",    "cost": 0,   "owned": true,  "equipped": true  },
      { "id": "grid",     "name": "Grid",     "cost": 400, "owned": false, "equipped": false },
      { "id": "gradient", "name": "Gradient", "cost": 800, "owned": false, "equipped": false }
    ],
    "frame": [
      { "id": "none",   "name": "None",      "cost": 0,    "owned": true,  "equipped": true  },
      { "id": "thin",   "name": "Thin Ring", "cost": 500,  "owned": false, "equipped": false },
      { "id": "crown",  "name": "Crown",     "cost": 2500, "owned": false, "equipped": false }
    ]
  }
}
```

**Error Codes:**

| HTTP | Code | When |
|---|---|---|
| 401 | `AUTH_REQUIRED` | JWT missing |

---

### 13. Avatar Shop — Purchase Item

#### `POST /shop/purchase` `[v1.1+]`

Purchases or equips a cosmetic item. If already owned, equips it with no XP deduction. If not owned and the student has sufficient `xp_balance`, deducts cost and marks as owned + equipped. **Never deducts from `xp_earned`.**

**Auth Required:** Yes

**Request Body:**

```json
{
  "itemId": "scholar",
  "category": "shape"
}
```

**Validation:**
- `itemId`: string, must be a valid item ID in the given category
- `category`: one of `"shape"`, `"color"`, `"background"`, `"frame"`

**Response — 200 OK (purchase):**

```json
{
  "action": "purchased",
  "itemId": "scholar",
  "category": "shape",
  "costDeducted": 300,
  "xpBalance": 900,
  "xpEarned": 2450,
  "equippedCosmetics": {
    "shape": "scholar",
    "color": "white",
    "background": "plain",
    "frame": "none"
  },
  "message": "Scholar unlocked!"
}
```

**Response — 200 OK (equip only — already owned):**

```json
{
  "action": "equipped",
  "itemId": "scholar",
  "category": "shape",
  "costDeducted": 0,
  "xpBalance": 1200,
  "xpEarned": 2450,
  "equippedCosmetics": {
    "shape": "scholar",
    "color": "white",
    "background": "plain",
    "frame": "none"
  },
  "message": "Scholar equipped!"
}
```

> **Key invariant:** `xpEarned` in the response confirms it was not decremented. The client should update both `xpBalance` and `equippedCosmetics` in local AuthContext and AsyncStorage from this response.

**Error Codes:**

| HTTP | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid `itemId` or `category` |
| 400 | `INSUFFICIENT_BALANCE` | `xpBalance < item.cost` and item not owned |
| 401 | `AUTH_REQUIRED` | JWT missing |
| 500 | `DB_ERROR` | Supabase write failed |

---

### 14. Mistake Bank — Sync

#### `POST /mistake-bank/sync` `[v1.1+]`

Syncs the client's local Mistake Bank (from AsyncStorage) to the server. Uses upsert semantics — items already in the DB are not duplicated. Called after every quiz session that produced wrong answers, and on app foreground when backend is available.

**Auth Required:** Yes

**Request Body:**

```json
{
  "items": [
    {
      "localId": 1,
      "subject": "Science",
      "question": "Newton's 2nd law?",
      "correctAnswer": "F=ma",
      "userAnswer": "F=mv",
      "explanation": "Force = mass × acceleration",
      "sourceMode": "precomputed"
    },
    {
      "localId": 2,
      "subject": "Mathematics",
      "question": "Area of circle r=7?",
      "correctAnswer": "154",
      "userAnswer": "44",
      "explanation": "πr² = (22/7) × 49 = 154",
      "sourceMode": "precomputed"
    }
  ]
}
```

**Response — 200 OK:**

```json
{
  "synced": 2,
  "skipped": 0,
  "items": [
    { "localId": 1, "serverId": "uuid-1", "status": "created" },
    { "localId": 2, "serverId": "uuid-2", "status": "created" }
  ]
}
```

**Error Codes:**

| HTTP | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Malformed items array |
| 401 | `AUTH_REQUIRED` | JWT missing |
| 500 | `DB_ERROR` | Supabase upsert failed |

---

### 15. Mistake Bank — Clear Item

#### `DELETE /mistake-bank/:itemId` `[v1.1+]`

Marks a Mistake Bank item as cleared after the student successfully re-attempts it. Awards +10 XP server-side. If this is the last item, the server also awards the +50 XP Comeback Bonus.

**Auth Required:** Yes

**Path Params:**
- `itemId` — UUID (server-side ID from sync response)

**Response — 200 OK:**

```json
{
  "cleared": true,
  "itemId": "uuid-1",
  "xpAwarded": 10,
  "xpEarned": 2460,
  "xpBalance": 1210,
  "remainingItems": 1,
  "comebackBonus": false
}
```

**Response — 200 OK (last item cleared):**

```json
{
  "cleared": true,
  "itemId": "uuid-2",
  "xpAwarded": 60,
  "xpEarned": 2520,
  "xpBalance": 1270,
  "remainingItems": 0,
  "comebackBonus": true,
  "comebackBonusXp": 50
}
```

> When `comebackBonus: true`, the client shows the Mistake Bank celebration screen with the `+50 XP Comeback Bonus` card.

**Error Codes:**

| HTTP | Code | When |
|---|---|---|
| 401 | `AUTH_REQUIRED` | JWT missing |
| 403 | `FORBIDDEN` | Item belongs to a different student |
| 404 | `NOT_FOUND` | Item ID does not exist or already cleared |
| 500 | `DB_ERROR` | Supabase update failed |

---

## Data Models

### Question Object

```json
{
  "id": "uuid",
  "type": "mcq | fill",
  "question": "string",
  "options": ["A", "B", "C", "D"],
  "answer": "string",
  "explanation": "string"
}
```

- `options` is only present when `type === "mcq"`
- `answer` for MCQ is the correct option text (not an index)
- `answer` for fill is the expected string; matched case-insensitively with whitespace stripped on client

### Quiz Session Object (DB)

```json
{
  "id": "uuid",
  "studentId": "uuid",
  "subject": "string",
  "chapter": "string",
  "class": "string",
  "difficulty": "spark | blaze | inferno",
  "mode": "precomputed | ai",
  "powerUp": "shield | timeFreeze | doubleXp | hint | null",
  "score": 4,
  "totalQ": 5,
  "timeTaken": 87,
  "xpEarned": 120,
  "createdAt": "ISO timestamp"
}
```

### Mistake Bank Item Object (DB)

```json
{
  "id": "uuid",
  "studentId": "uuid",
  "subject": "string",
  "question": "string",
  "correctAnswer": "string",
  "userAnswer": "string",
  "explanation": "string",
  "sourceMode": "precomputed | ai",
  "cleared": false,
  "createdAt": "ISO timestamp"
}
```

### Cosmetic Item Object

```json
{
  "id": "string",
  "name": "string",
  "category": "shape | color | background | frame",
  "cost": 0,
  "owned": true,
  "equipped": false,
  "icon": "emoji (shape only)",
  "hex": "#RRGGBB (color only)"
}
```

### Achievement Object

```json
{
  "id": "string",
  "icon": "emoji",
  "name": "string",
  "description": "string",
  "unlocked": true,
  "unlockedAt": "ISO timestamp | null"
}
```

---

## XP Formula Reference

```js
// Per-question base
const baseXP       = correctAnswers * 10

// Speed bonus: average < 8s per question
const avgTime      = timeTaken / totalQ
const speedBonus   = (avgTime < 8 && score > 0) ? (5 * score) : 0

// Multipliers
const diffMult     = { spark: 1.0, blaze: 1.5, inferno: 2.0 }[difficulty]
const powerUpMult  = activePowerUp === 'doubleXp' ? 2.0 : 1.0
const aiBonus      = mode === 'ai' ? 1.2 : 1.0          // v1.1+ only

// Total
const totalXP      = Math.floor((baseXP + speedBonus) * diffMult * powerUpMult * aiBonus)

// Dual ledger (both always increase together on earn)
xpEarned  += totalXP   // NEVER decremented — leaderboard rank source
xpBalance += totalXP   // Decremented only by Avatar Shop purchases

// Mistake Bank bonuses (outside quiz session)
// Correct re-attempt:    +10 XP (both ledgers)
// Clear entire bank:     +50 XP Comeback Bonus (both ledgers)
```

---

## Rate Limiting

All endpoints share a global rate limit of **60 requests per minute per IP**. The AI quiz generation endpoint has a stricter limit.

| Endpoint | Limit |
|---|---|
| All endpoints | 60 req/min/IP |
| `POST /quiz/generate` | 10 req/min/IP |

When exceeded:

```
HTTP/1.1 429 Too Many Requests
Retry-After: 60

{
  "error": "Too many requests, please slow down.",
  "code": "RATE_LIMITED",
  "status": 429
}
```

---

## Endpoint Coverage vs UI Feature Matrix

The table below maps every UI screen and feature from the PRD/SRS to the API endpoint that backs it in v1.1+.

| UI Screen / Feature | SRS Ref | API Endpoint | v1.0 Fallback |
|---|---|---|---|
| Onboarding name + class | FR-ON-01–08 | `POST /auth/login` | AsyncStorage only |
| Dashboard XP + streak display | FR-DB-01 | `GET /profile/:id` | AsyncStorage |
| Dashboard power-up inventory | FR-DB-08 | `GET /profile/:id` | AsyncStorage |
| Subject tiles + colors | FR-DB-06 | `GET /subjects/:class` | Hardcoded constants |
| Chapter list + progress | FR-SB-01–04 | `GET /chapters/:class/:subject` | Bundled JSON |
| Precomputed quiz questions | FR-QE-06–16 | `GET /quiz/chapter` | Bundled asset JSON |
| AI Quiz generation | FR-QE-04 | `POST /quiz/generate` | Not available |
| Quiz submit + XP + streak | FR-QE-13–14 | `POST /quiz/submit` | Client-side calc |
| Download chapter notes PDF | FR-QE-05 | `GET /notes/:class/:subject/:chapter` | Toast placeholder |
| Leaderboard — Global tab | FR-LB-01–04 | `GET /leaderboard/global` | Mock static data |
| Leaderboard — Subject tab | FR-LB-05 | `GET /leaderboard/subject/:subject` | Mock static data |
| Leaderboard — Chapter tab | FR-LB-06 | `GET /leaderboard/chapter/:chapter` | Mock static data |
| Profile stats + heatmap + badges | FR-PR-01–06 | `GET /profile/:studentId` | AsyncStorage |
| Avatar Shop — view items | FR-AS-01–02 | `GET /shop/items` | AsyncStorage |
| Avatar Shop — purchase/equip | FR-AS-03–06 | `POST /shop/purchase` | AsyncStorage |
| Mistake Bank display | FR-MB-01 | `POST /mistake-bank/sync` | AsyncStorage |
| Mistake Bank re-attempt + clear | FR-MB-02–05 | `DELETE /mistake-bank/:itemId` | AsyncStorage |

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| v1.0 | March 2026 | Initial draft based on BrainBlaze API (OpenRouter, single XP field, 24h JWT) |
| v1.1 | March 2026 | Aligned to BrainBlaze PRD/SRS/System Design: renamed to BrainBlaze; dual XP ledger (`xpEarned` + `xpBalance`); JWT expiry 7 days; XP formula corrected (×10 base, timer≥22 speed bonus, powerUpMult); added `activePowerUp` to submit; added `avatar` field to leaderboard; heatmap + barChart + cosmetics + powerUps to profile; added endpoints 12–15 (Shop items, Shop purchase, Mistake Bank sync, Mistake Bank clear); Anthropic Claude replaces OpenRouter; added UI coverage matrix |
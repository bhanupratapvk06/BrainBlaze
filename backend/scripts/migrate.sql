-- ============================================================
-- BrainBlaze Database Migration
-- Run this in your Supabase SQL Editor:
--   Supabase Dashboard → SQL Editor → New query → Paste → Run
-- ============================================================

-- ── Enable UUID extension ─────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. students ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(60) NOT NULL,
  class        VARCHAR(10) NOT NULL CHECK (class IN ('6','7','8','9','10','11','12')),
  xp_earned    INTEGER     NOT NULL DEFAULT 0,  -- lifetime total; NEVER decremented
  xp_balance   INTEGER     NOT NULL DEFAULT 0,  -- spendable; decremented on shop purchase
  streak       INTEGER     NOT NULL DEFAULT 0,
  last_active  DATE,
  power_ups    JSONB       NOT NULL DEFAULT '{"shield":0,"timeFreeze":0,"doubleXp":0,"hint":0}',
  push_token   VARCHAR(200),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_xp      ON students(xp_earned DESC);
CREATE INDEX IF NOT EXISTS idx_students_name_cls ON students(name, class);

-- ── 2. chapters ───────────────────────────────────────────────────────────────
-- Stores chapter metadata. Subject slug references SUBJECTS_DATA in code.
CREATE TABLE IF NOT EXISTS chapters (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_slug      VARCHAR(50) NOT NULL,
  name              VARCHAR(100) NOT NULL,
  slug              VARCHAR(100) NOT NULL,
  number            INTEGER     NOT NULL,
  class             VARCHAR(10) NOT NULL,
  has_notes         BOOLEAN     NOT NULL DEFAULT FALSE,
  lesson_count      INTEGER     NOT NULL DEFAULT 0,
  estimated_minutes INTEGER     NOT NULL DEFAULT 0,
  question_count    INTEGER     NOT NULL DEFAULT 0,
  UNIQUE (subject_slug, slug, class)
);

CREATE INDEX IF NOT EXISTS idx_chapters_subject ON chapters(subject_slug, class);

-- ── 3. quiz_sessions ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject     VARCHAR(50)  NOT NULL,
  chapter     VARCHAR(100) NOT NULL,
  class       VARCHAR(10)  NOT NULL,
  difficulty  VARCHAR(10)  NOT NULL CHECK (difficulty IN ('spark','blaze','inferno')),
  mode        VARCHAR(15)  NOT NULL CHECK (mode IN ('precomputed','ai')),
  power_up    VARCHAR(20)  CHECK (power_up IN ('shield','timeFreeze','doubleXp','hint') OR power_up IS NULL),
  score       INTEGER     NOT NULL,
  total_q     INTEGER     NOT NULL,
  time_taken  INTEGER     NOT NULL,   -- seconds
  xp_earned   INTEGER     NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_student  ON quiz_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_chapter  ON quiz_sessions(chapter, subject);
CREATE INDEX IF NOT EXISTS idx_sessions_created  ON quiz_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_subject  ON quiz_sessions(student_id, subject);

-- ── 4. ai_quizzes (cache) ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_quizzes (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  subject        VARCHAR(50)  NOT NULL,
  chapter        VARCHAR(100) NOT NULL,
  topic          VARCHAR(150) NOT NULL,
  difficulty     VARCHAR(10)  NOT NULL,
  class          VARCHAR(10)  NOT NULL,
  questions_json JSONB        NOT NULL,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_quizzes_lookup
  ON ai_quizzes(subject, chapter, topic, difficulty, class);

-- ── 5. chapter_notes ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chapter_notes (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  subject     VARCHAR(50)  NOT NULL,
  chapter     VARCHAR(100) NOT NULL,
  class       VARCHAR(10)  NOT NULL,
  pdf_r2_key  VARCHAR(300) NOT NULL,
  page_count  INTEGER,
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (subject, chapter, class)
);

-- ── 6. mistake_bank ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mistake_bank (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID         NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject      VARCHAR(50)  NOT NULL,
  question     TEXT         NOT NULL,
  correct_ans  VARCHAR(300) NOT NULL,
  wrong_ans    VARCHAR(300) NOT NULL,
  explanation  TEXT,
  source_mode  VARCHAR(15)  CHECK (source_mode IN ('precomputed','ai')),
  cleared      BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mistake_bank_student
  ON mistake_bank(student_id, cleared);

-- ── 7. student_cosmetics ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_cosmetics (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  item_id      VARCHAR(50) NOT NULL,
  category     VARCHAR(20) NOT NULL CHECK (category IN ('shape','color','background','frame')),
  is_equipped  BOOLEAN     NOT NULL DEFAULT FALSE,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_cosmetics_student ON student_cosmetics(student_id);

-- ── 8. Leaderboard Views ──────────────────────────────────────────────────────

-- Global: ranked by lifetime xp_earned
CREATE OR REPLACE VIEW leaderboard_global AS
  SELECT
    s.id              AS student_id,
    s.name,
    s.class,
    s.xp_earned       AS total_xp,
    s.streak,
    COUNT(qs.id)      AS quizzes_completed,
    RANK() OVER (ORDER BY s.xp_earned DESC) AS rank
  FROM students s
  LEFT JOIN quiz_sessions qs ON qs.student_id = s.id
  GROUP BY s.id;

-- Subject: ranked by XP earned in sessions for that subject
CREATE OR REPLACE VIEW leaderboard_subject AS
  SELECT
    s.id              AS student_id,
    s.name,
    s.class,
    qs.subject,
    SUM(qs.xp_earned) AS subject_xp,
    COUNT(qs.id)      AS quizzes_completed,
    RANK() OVER (PARTITION BY qs.subject ORDER BY SUM(qs.xp_earned) DESC) AS rank
  FROM students s
  JOIN quiz_sessions qs ON qs.student_id = s.id
  GROUP BY s.id, s.name, s.class, qs.subject;

-- Chapter: ranked by best score DESC then fastest time ASC
CREATE OR REPLACE VIEW leaderboard_chapter AS
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
  GROUP BY s.id, s.name, s.class, qs.chapter, qs.subject;

-- ── 9. Seed: Default free cosmetics for each student ─────────────────────────
-- NOTE: This is handled in application code (auth.js login), not a DB trigger.
-- Free defaults: student (shape), white (color), plain (background), none (frame)

-- ── Done ─────────────────────────────────────────────────────────────────────
-- After running this script:
--   1. Copy .env.example to .env and fill in SUPABASE_URL + SUPABASE_SERVICE_KEY
--   2. Run: cd backend && npm install && npm run dev

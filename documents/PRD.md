# BrainBlaze — Product Requirements Document

> **Version:** 1.0 | **Status:** DRAFT | **Platform:** iOS · Android | **Classification:** CONFIDENTIAL

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Goals & Success Metrics](#2-product-goals--success-metrics)
3. [Target Users & Personas](#3-target-users--personas)
4. [Feature Set](#4-feature-set)
5. [XP Economy & Gamification](#5-xp-economy--gamification)
6. [Content Structure](#6-content-structure)
7. [Screen Inventory](#7-screen-inventory)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Dependencies & Risks](#9-dependencies--risks)
10. [Product Roadmap](#10-product-roadmap)

---

## 1. Executive Summary

BrainBlaze is a mobile-first, gamified learning application designed for Indian students in Classes 6–12. It transforms conventional academic revision into an engaging, reward-driven experience through interactive quizzes, AI-powered insights, streak mechanics, a mistake bank, avatar customization, and competitive leaderboards.

The platform targets the rapidly growing EdTech segment in India — particularly the 250M+ secondary school students who rely on self-study but struggle with engagement and consistent practice.

### 1.1 Vision Statement

> To be the most engaging academic companion for every Indian student — making daily revision as habitual and rewarding as playing a game.

### 1.2 Mission

Deliver an accessible, curriculum-aligned, gamified quiz experience that builds consistent study habits, surfaces learning gaps through AI, and rewards academic achievement with a structured progression system.

---

## 2. Product Goals & Success Metrics

### 2.1 Primary Goals

- Drive daily active learning through streaks and gamification mechanics
- Improve retention by surfacing mistakes in a dedicated Mistake Bank
- Foster healthy competition via class- and subject-level leaderboards
- Personalize the experience through AI-generated insights
- Reward progress through XP economy and avatar customization

### 2.2 Key Performance Indicators (KPIs)

| Metric | Target (Month 3) | Target (Month 12) |
|---|---|---|
| Daily Active Users | 10,000 | 250,000 |
| D7 Retention | 35% | 50% |
| Avg. Session Length | 8 minutes | 14 minutes |
| Quiz Completion Rate | 60% | 75% |
| Streak ≥ 7 Days | 15% of users | 35% of users |
| Mistake Bank Clears | 20% of sessions | 40% of sessions |

---

## 3. Target Users & Personas

### 3.1 Primary Persona — The Self-Studier

**Name:** Rahul Kumar, 15 years old, Class 9, Tier-2 city, CBSE board

- Studies 2–3 hours daily; relies on textbooks and YouTube
- Motivated by marks and rank in class
- Owns a mid-range Android phone; uses mobile for entertainment and study equally
- **Needs:** Quick revision, competitive validation, feeling of progress

### 3.2 Secondary Persona — The Competitive Scorer

**Name:** Priya Sharma, 17 years old, Class 11, Metro, JEE/NEET aspirant

- Highly motivated; wants granular performance analytics
- Competes with peers; leaderboard ranking is a strong motivator
- **Needs:** Subject-specific deep-dives, chapter-level rankings, accuracy tracking

### 3.3 Anti-Persona

University students and adult learners — out of scope for v1.0. Content and gamification are calibrated for school curriculum only.

---

## 4. Feature Set

### 4.1 Core Features (MVP)

| Feature | Description | Priority |
|---|---|---|
| Onboarding | 2-step name + class selection; no login required at v1.0 | **P0** |
| Subject Browser | Browse 6 subjects; filter by class; view chapter list with progress | **P0** |
| Quiz Engine | MCQ + fill-in-the-blank; 30s timer; XP rewards; instant feedback | **P0** |
| Streak System | Daily study streak with 7-day calendar; visual reward at milestones | **P0** |
| Mistake Bank | Automatically captures wrong answers; allows re-attempt; +50 XP bonus on clear | **P0** |
| Leaderboard | Global / Subject / Chapter tabs; live rank shown in sticky footer | **P0** |
| Dashboard | Personalized home; focus cards; AI insight snippet; subject tiles | **P0** |
| Profile & Stats | XP/balance display; activity heatmap; bar chart; achievement badges | **P1** |
| Avatar Shop | Cosmetic customization; XP currency; 4 categories of items | **P1** |
| Power-Ups | Shield / Time Freeze / Double XP / Hint per quiz session | **P1** |
| Notifications | Streak alerts; new quiz notifications; achievement unlocks | **P1** |
| AI Quiz Mode | Generate custom quiz from AI for any topic; requires API | **P2** |
| Challenge a Friend | Share score link; friend attempts same quiz; compare results | **P2** |

---

## 5. XP Economy & Gamification

### 5.1 XP Earning Rules

- Correct MCQ answer: **+10 XP**
- Correct fill-in-the-blank: **+10 XP**
- Speed bonus (answer within 8 seconds): **+5 XP**
- Difficulty multiplier — Blaze: ×1.5, Inferno: ×2.0
- Double XP power-up: ×2.0 on all earned XP that session
- Mistake Bank clear (all items): **+50 XP** bonus

### 5.2 XP Dual Ledger

BrainBlaze uses a dual-ledger system to separate achievement rank from spendable balance:

| Ledger | Description | Can Decrease? |
|---|---|---|
| **XP Earned** | Lifetime total; used for leaderboard ranking | ❌ Never |
| **XP Balance** | Spendable currency; reduced when purchasing cosmetics | ✅ Yes |

### 5.3 Difficulty Tiers

| Tier | Icon | XP Multiplier | Intended Use |
|---|---|---|---|
| Spark | 🟢 | ×1.0 | Beginners / Revision |
| Blaze | 🟡 | ×1.5 | Standard practice |
| Inferno | 🔴 | ×2.0 | Exam preparation |

---

## 6. Content Structure

### 6.1 Subjects Supported (v1.0)

| Subject | Icon | Sample Chapters |
|---|---|---|
| Mathematics | 📐 | Number Systems, Polynomials, Coordinate Geometry, Linear Equations, Triangles, Circles, Surface Areas, Statistics, Probability |
| Science | 🔬 | Matter, Atoms & Molecules, Cell Biology, Motion, Force, Gravitation |
| History | 🌍 | French Revolution, Socialism, Nazism, Forest Society, Peasants |
| English | 📖 | Reading comprehension and grammar chapters |
| Computer Science | 💻 | IT fundamentals, internet, MS Office, programming basics |
| Art | 🎨 | Drawing basics, color theory, sketching, perspective |

### 6.2 Question Types

| Type | Format | Answer Matching |
|---|---|---|
| **MCQ** | 4 options; one correct; with explanation | Index comparison |
| **Fill-in-the-Blank** | Short text input | Case-insensitive; whitespace-normalized |

### 6.3 AI Quiz Mode (P2)

Uses Anthropic Claude API to generate custom quiz questions for any user-specified topic. Questions are formatted consistently with the precomputed bank and delivered in the same quiz UI. API calls are proxied server-side — the client never holds the API key.

---

## 7. Screen Inventory

| Screen | Purpose | Navigation Trigger |
|---|---|---|
| Onboarding 1 | Collect user name | App launch |
| Onboarding 2 | Select class (6–12) | Step 1 complete |
| Dashboard | Home feed; focus cards; streak; subject tiles | Bottom nav: Home |
| Subject Browser | Chapter list with progress bars | Subject tile tap |
| Chapter Detail | Quiz mode select; difficulty; power-ups | Chapter tap |
| Quiz | Active quiz with timer, questions, feedback | Start Quiz button |
| Results | Score summary; XP earned; mistake review | Last question submit |
| Mistake Bank | Saved wrong answers; re-attempt flow | Bottom nav: Mistakes |
| Leaderboard | Global / Subject / Chapter rankings | Bottom nav: Ranks |
| Profile | Stats; activity graph; subject progress; badges | Bottom nav: Profile |
| Avatar Shop | Cosmetic items; purchase with XP balance | Avatar tap in Profile |
| Notifications | Streak reminders; quiz alerts; achievements | Bell icon in header |

---

## 8. Non-Functional Requirements

### 8.1 Performance

| Metric | Target |
|---|---|
| App launch to Dashboard | ≤ 2 seconds (mid-range Android) |
| Quiz question load time | ≤ 500ms |
| AI Quiz generation | ≤ 5 seconds with loading state |

### 8.2 Accessibility

- Minimum tap target: **44×44 points** (Apple HIG / Material standard)
- Color contrast ratio **≥ 4.5:1** (WCAG AA) for all text
- Dark mode and light mode fully supported

### 8.3 Compatibility

- iOS 14+ and Android 8.0+
- Minimum screen width: 320px; optimized for 375–430px
- Offline support for precomputed quiz bank (P1)

---

## 9. Dependencies & Risks

| Area | Risk | Mitigation |
|---|---|---|
| AI Quiz API | Latency or cost overrun from LLM calls | Rate limiting; response caching |
| Content Quality | Incorrect answers damage trust | Manual review pipeline for question bank |
| Curriculum Alignment | CBSE vs state board mismatch | Tag questions by board in v1.1 |
| Engagement Drop-off | Novelty wears off after 2–3 weeks | Weekly new content drops; seasonal events |
| Device Performance | Low-end Android devices lag on animations | Reduce animation on < 2GB RAM devices |

---

## 10. Product Roadmap

| Phase | Timeline | Deliverables |
|---|---|---|
| **Alpha** | Weeks 1–4 | Onboarding, Dashboard, Subject Browser, Quiz Engine, Results |
| **Beta** | Weeks 5–8 | Mistake Bank, Leaderboard, Profile, Streak System, Notifications |
| **v1.0** | Weeks 9–12 | Avatar Shop, Power-Ups, Dark/Light theme, Polish + QA |
| **v1.1** | Month 4–5 | AI Quiz Mode, Challenge a Friend, Offline support, Analytics |
| **v2.0** | Month 6+ | Live class battles, Teacher dashboard, Multi-board content, Social features |

---

*BrainBlaze PRD · Version 1.0 · Confidential*
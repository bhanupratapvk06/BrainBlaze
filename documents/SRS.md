# BrainBlaze — Software Requirements Specification

> **Version:** 1.0 | **Standard:** IEEE Std 830 | **Classification:** CONFIDENTIAL — INTERNAL USE ONLY

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [State & Data Models](#5-state--data-models)
6. [Constraints & Assumptions](#6-constraints--assumptions)
7. [Revision History](#7-revision-history)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the complete functional and non-functional requirements for BrainBlaze, a mobile gamified learning application for Indian school students (Classes 6–12). This document is intended for developers, QA engineers, designers, and product stakeholders.

### 1.2 Scope

BrainBlaze is a React Native mobile application (iOS + Android) that provides:

- Curriculum-aligned quiz sessions with MCQ and fill-in-the-blank formats
- A gamification layer including XP, streaks, leaderboards, and achievements
- An AI-powered quiz generation mode using the Anthropic Claude API
- A Mistake Bank for spaced-repetition review of incorrect answers
- Avatar customization with a dual XP economy

### 1.3 Definitions & Acronyms

| Term | Definition |
|---|---|
| **XP** | Experience Points — the primary in-app currency and rank metric |
| **XP Balance** | Spendable XP for cosmetics; does not affect leaderboard rank |
| **XP Earned** | Lifetime XP total; used only for leaderboard rank calculation |
| **Streak** | Consecutive days a user has completed at least one quiz |
| **Mistake Bank** | Saved collection of questions answered incorrectly |
| **Power-Up** | Single-use consumable item applied during a quiz session |
| **MCQ** | Multiple Choice Question — 4 options, 1 correct |
| **Difficulty Tier** | Spark (×1), Blaze (×1.5), Inferno (×2) — affects XP multiplier |
| **Cosmetic** | Visual-only avatar customization item with no gameplay effect |
| **LLM** | Large Language Model (Claude API) used for AI Quiz generation |

---

## 2. Overall Description

### 2.1 Product Perspective

BrainBlaze is a standalone mobile app in the EdTech category. In v1.0 it operates entirely client-side with a static question bank. AI Quiz mode (v1.1) introduces a backend proxy layer for LLM API calls to protect API keys. Future versions may add a cloud sync service for cross-device progress.

### 2.2 User Classes

| Class | Description | Access Level |
|---|---|---|
| Student (primary) | Indian student, Class 6–12, age 11–18 | Full app access |
| Guest | Unauthenticated first-time user (no login required v1.0) | All features; no cloud sync |
| Admin (future) | Content manager adding questions to the bank | CMS access only (out of scope v1.0) |

### 2.3 Operating Environment

- **Platform:** iOS 14+ / Android 8.0+
- **Screen density:** 1x, 2x, 3x (responsive layout)
- **Min device RAM:** 1.5 GB
- **Network:** Works offline for core quiz (precomputed bank); AI Quiz requires internet
- **Framework:** React Native (JavaScript)

---

## 3. Functional Requirements

### 3.1 Onboarding Module

#### 3.1.1 Name Entry — `Screen: Onboarding-1`

| ID | Priority | Requirement |
|---|---|---|
| FR-ON-01 | Must Have | System shall display a text input for the user to enter their name |
| FR-ON-02 | Must Have | System shall allow proceeding without a name (skip); default name = `Student` |
| FR-ON-03 | Must Have | Pressing Enter on keyboard shall trigger the same action as tapping Next |
| FR-ON-04 | Should Have | Name shall be persisted to local device storage |

#### 3.1.2 Class Selection — `Screen: Onboarding-2`

| ID | Priority | Requirement |
|---|---|---|
| FR-ON-05 | Must Have | System shall display class options 6 through 12 as selectable chips |
| FR-ON-06 | Must Have | Only one class may be selected at a time |
| FR-ON-07 | Must Have | Start Learning button shall be disabled until a class is selected |
| FR-ON-08 | Must Have | On completion, system shall navigate to Dashboard |

---

### 3.2 Dashboard Module

| ID | Priority | Requirement |
|---|---|---|
| FR-DB-01 | Must Have | Dashboard shall display user name, total XP, and streak count in header area |
| FR-DB-02 | Must Have | Today's Focus section shall display 4 stat cards: Quizzes Due, Goal, XP Earned, Accuracy |
| FR-DB-03 | Must Have | Streak section shall render a 7-day calendar with completed days highlighted |
| FR-DB-04 | Must Have | AI Insight card shall display a contextual study tip based on subject progress |
| FR-DB-05 | Must Have | Featured subject card (Maths) shall navigate to Subject Browser on tap |
| FR-DB-06 | Must Have | Horizontal scroll row shall display all 6 subjects as compact tiles |
| FR-DB-07 | Should Have | Notification bell shall show an unread dot indicator when new notifications exist |
| FR-DB-08 | Should Have | Power-up inventory (Shield, Freeze, Double XP) counts shall be visible in header |

---

### 3.3 Subject Browser Module

| ID | Priority | Requirement |
|---|---|---|
| FR-SB-01 | Must Have | Browser shall display a scrollable list of all chapters for the selected subject |
| FR-SB-02 | Must Have | Each chapter row shall show: name, difficulty badge, progress %, and progress bar |
| FR-SB-03 | Must Have | Class filter chips shall filter chapters by class level |
| FR-SB-04 | Must Have | Featured chapter card shall be pinned at top; tapping navigates to Chapter Detail |
| FR-SB-05 | Should Have | Search icon shall trigger a text search filter (v1.1) |

---

### 3.4 Quiz Engine Module

#### 3.4.1 Pre-Quiz Configuration — `Screen: Chapter Detail`

| ID | Priority | Requirement |
|---|---|---|
| FR-QE-01 | Must Have | User shall select difficulty: Spark, Blaze, or Inferno |
| FR-QE-02 | Must Have | User may select at most one active Power-Up per quiz session |
| FR-QE-03 | Must Have | Power-Up selection shall be disabled if the user has 0 units of that item |
| FR-QE-04 | Must Have | Quiz Mode toggle: Instant (precomputed) vs AI (LLM-generated) |
| FR-QE-05 | Should Have | Download Notes (PDF) button shall show a toast confirmation |

#### 3.4.2 Active Quiz — `Screen: Quiz`

| ID | Priority | Requirement |
|---|---|---|
| FR-QE-06 | Must Have | Timer shall count down from 30 seconds per question using a circular progress ring |
| FR-QE-07 | Must Have | Timer color shall change: green (>10s), orange (6–10s), red (≤5s) |
| FR-QE-08 | Must Have | On timer reaching 0, answer shall be auto-submitted as incorrect |
| FR-QE-09 | Must Have | MCQ: selecting an option shall highlight it; Submit button shall appear |
| FR-QE-10 | Must Have | Fill-in-the-blank: any non-empty input shall enable Submit button |
| FR-QE-11 | Must Have | On Submit: correct answer shown in green, wrong in red; explanation displayed |
| FR-QE-12 | Must Have | Correct MCQ: selected option and correct option show check icons |
| FR-QE-13 | Must Have | XP earned per question shall be calculated and displayed immediately |
| FR-QE-14 | Must Have | Speed bonus (+5 XP) if answered correctly in ≤ 8 seconds |
| FR-QE-15 | Must Have | Incorrect answers shall be automatically saved to Mistake Bank |
| FR-QE-16 | Must Have | Progress bar (segmented) at top shall update on each question advance |
| FR-QE-17 | Should Have | Hint power-up: removes one incorrect MCQ option (max 3 uses per session) |
| FR-QE-18 | Should Have | Time Freeze: pauses timer for 15 seconds; deducts 1 unit from inventory |
| FR-QE-19 | Should Have | Double XP: doubles all XP earned in session; shown in active banner |
| FR-QE-20 | Should Have | Fill answer comparison shall be case-insensitive and strip whitespace |

---

### 3.5 Results Module

| ID | Priority | Requirement |
|---|---|---|
| FR-RES-01 | Must Have | Animated radial score ring shall fill to percentage on screen load |
| FR-RES-02 | Must Have | Summary row: Correct count, Wrong count, Time taken |
| FR-RES-03 | Must Have | XP earned for session shall be displayed with highlight card |
| FR-RES-04 | Must Have | If wrong answers exist, Review Mistakes accordion shall expand per item |
| FR-RES-05 | Must Have | Try Again button shall reset quiz state and restart from Q1 |
| FR-RES-06 | Must Have | Score ≥ 90%: Achievement overlay shall display after 1.5s delay |
| FR-RES-07 | Should Have | Challenge a Friend: generate shareable link (toast confirmation) |

---

### 3.6 Mistake Bank Module

| ID | Priority | Requirement |
|---|---|---|
| FR-MB-01 | Must Have | Each card shows: question, user's wrong answer (strikethrough), correct answer, explanation |
| FR-MB-02 | Must Have | Re-attempt button opens inline text input for the user to retype the answer |
| FR-MB-03 | Must Have | Correct re-attempt removes the question from the bank; awards +10 XP |
| FR-MB-04 | Must Have | Incorrect re-attempt shows error toast; item remains in bank |
| FR-MB-05 | Must Have | Clearing all items shows celebration screen with +50 XP Comeback Bonus |
| FR-MB-06 | Should Have | Progress bar shows how many items cleared out of total for current session |

---

### 3.7 Leaderboard Module

| ID | Priority | Requirement |
|---|---|---|
| FR-LB-01 | Must Have | Three tabs: Global, Subject, Chapter — switch without page reload |
| FR-LB-02 | Must Have | Podium visual for ranks 1, 2, 3 with emoji avatars and XP |
| FR-LB-03 | Must Have | User's own entry highlighted with accent color and YOU badge |
| FR-LB-04 | Must Have | Sticky footer bar shows user's current rank and XP at all times |
| FR-LB-05 | Must Have | Subject tab: grid of 6 subject chips; selecting one filters the ranking list |
| FR-LB-06 | Must Have | Chapter tab: requires subject + chapter selection before ranking displays |
| FR-LB-07 | Must Have | Ranking is by XP Earned (lifetime) — not XP Balance |

---

### 3.8 Profile Module

| ID | Priority | Requirement |
|---|---|---|
| FR-PR-01 | Must Have | Display: name, class, XP Earned, XP Balance, rank badge |
| FR-PR-02 | Must Have | Study Activity toggles between Heatmap and Bar Chart tabs |
| FR-PR-03 | Must Have | Heatmap: 35-cell grid (5 weeks); 4 color levels indicating activity density |
| FR-PR-04 | Must Have | Bar chart: 7-day bars with labels; week/month/6-month filter |
| FR-PR-05 | Must Have | Subject Progress: one card per subject with progress bar and % label |
| FR-PR-06 | Must Have | Achievements section: grid of badge cards; tapping shows achievement overlay |
| FR-PR-07 | Should Have | Avatar tap navigates to Avatar Shop |

---

### 3.9 Avatar Shop Module

| ID | Priority | Requirement |
|---|---|---|
| FR-AS-01 | Must Have | 4 category tabs: Shape, Color, Background, Frame |
| FR-AS-02 | Must Have | Items owned by user show Equip button; equipped items show Equipped checkmark |
| FR-AS-03 | Must Have | Purchase deducts from XP Balance (not XP Earned); cannot go below 0 |
| FR-AS-04 | Must Have | Insufficient balance: disabled button and error toast with deficit shown |
| FR-AS-05 | Must Have | Avatar preview at top of screen updates live when item is equipped |
| FR-AS-06 | Must Have | Free items (cost: 0) show FREE badge; available to all users by default |

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-P-01 | App cold start to Dashboard render | < 2 seconds |
| NFR-P-02 | Quiz question transition animation | < 300ms |
| NFR-P-03 | AI Quiz generation (network dependent) | < 5 seconds |
| NFR-P-04 | Leaderboard data render (mock/local) | < 500ms |
| NFR-P-05 | XP balance update after quiz | Immediate (synchronous) |

### 4.2 Usability

- All interactive elements shall have minimum touch target **44×44 pt**
- Users shall be able to complete the onboarding flow in under **30 seconds**
- No more than **3 taps** required to start any quiz from Dashboard
- Error states shall always include a recovery action (retry/cancel)

### 4.3 Reliability

- App shall not crash on device rotation or backgrounding mid-quiz
- Quiz timer state shall pause when app is backgrounded
- Local state (XP, streak, mistake bank) shall persist across app restarts

### 4.4 Security

- AI Quiz API calls shall be proxied through backend; client never holds API key
- No personally identifiable information collected in v1.0
- Local storage shall use encrypted AsyncStorage for sensitive preferences

### 4.5 Accessibility — WCAG 2.1 AA

- Color contrast ratio **≥ 4.5:1** for all body text in both themes
- Interactive elements shall have accessible labels for screen readers
- Dark mode and light mode fully functional with user system preference respected

---

## 5. State & Data Models

### 5.1 Quiz Session State

| State Variable | Type | Description |
|---|---|---|
| `currentQ` | `number` (0-indexed) | Index of active question |
| `score` | `number` | Count of correct answers in session |
| `wrongAnswers` | `array` | Incorrect answers with question, user answer, correct, explanation |
| `timer` | `number` (0–30) | Countdown seconds for current question |
| `timerFrozen` | `boolean` | `true` when Time Freeze power-up is active |
| `submitted` | `boolean` | `true` after answer submitted; locks input; shows feedback |
| `hintsUsed` | `number` (0–3) | Running count of hints consumed in session |
| `activePowerUp` | `string \| null` | ID of selected power-up: `shield`, `timeFreeze`, `doubleXp`, `hint` |

### 5.2 User Persistent State

| Field | Type | Notes |
|---|---|---|
| `name` | `string` | User-entered name; defaults to `"Student"` |
| `cls` | `string` | e.g. `"Class 9"`; affects content display |
| `xpEarned` | `number` | Lifetime XP; used for leaderboard; **never decremented** |
| `xpBalance` | `number` | Spendable XP; decremented by shop purchases |
| `powerUps` | `{ shield, timeFreeze, doubleXp, hint }` | Item inventory counts |
| `mistakeBank` | `array` | List of `{ id, sub, q, ans, wrong, exp }` |
| `ownedCosmetics` | `string[]` | IDs of purchased shop items |
| `equippedCosmetics` | `{ shape, color, background, frame }` | Currently active cosmetic per slot |

### 5.3 Mistake Bank Item Schema

```json
{
  "id": 1,
  "sub": "Science",
  "q": "Newton's 2nd law?",
  "ans": "F=ma",
  "wrong": "F=mv",
  "exp": "Force = mass × acceleration"
}
```

### 5.4 XP Calculation Formula

```
xp_per_question = base_xp (10)
                + speed_bonus (5, if timer >= 22 and correct)

difficulty_multiplier = 1.0 (Spark) | 1.5 (Blaze) | 2.0 (Inferno)
powerup_multiplier    = 2.0 (if doubleXp active) | 1.0 (otherwise)

total_xp = floor(xp_per_question × difficulty_multiplier × powerup_multiplier)
```

---

## 6. Constraints & Assumptions

### 6.1 Constraints

- v1.0 content is precomputed and shipped with the app bundle; no CMS in scope
- Authentication and user accounts are out of scope for v1.0
- The XP economy is entirely local; no server-side validation in v1.0
- Avatar cosmetics are visual-only and provide zero gameplay advantage

### 6.2 Assumptions

- Users are Indian school students familiar with smartphone UX patterns
- English is the primary interface language; Hindi localization is v2.0
- The CBSE curriculum serves as the content baseline
- Internet connectivity is intermittent; core features must work offline

---

## 7. Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.1 | 2025-01 | Product Team | Initial draft — core quiz and gamification |
| 0.5 | 2025-03 | Product Team | Added AI Quiz, Avatar Shop, Power-Ups |
| 1.0 | 2025-06 | Product Team | Full feature set; leaderboard 3-tab; dual XP ledger |

---

*BrainBlaze SRS · Version 1.0 · IEEE Std 830 · Confidential*
# BrainBlaze — UI/UX Design Specification

> **Version:** 1.0 | **Design System** | **Mobile First** | **React Native**

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Design System](#2-design-system)
3. [Component Library](#3-component-library)
4. [Screen-by-Screen Specifications](#4-screen-by-screen-specifications)
5. [Key Interaction Patterns](#5-key-interaction-patterns)
6. [Accessibility & Inclusivity](#6-accessibility--inclusivity)
7. [Design Dos and Donts](#7-design-dos-and-donts)
8. [Design Changelog](#8-design-changelog)

---

## 1. Design Principles

BrainBlaze follows five core design principles that guide every decision — from color selection to interaction timing.

| Principle | Application in BrainBlaze |
|---|---|
| **1. Game-Feel First** | Every tap has a visual response (scale 0.96 on press). XP rewards animate immediately. Transitions < 300ms so the UI feels alive. |
| **2. Dark by Default** | Default dark theme (Deep Charcoal bg) reduces eye strain during evening study sessions. Light mode available for day use. |
| **3. Progress Visibility** | Progress bars appear on every chapter, subject card, and the quiz header. Users always know how far they have come. |
| **4. Friction Reduction** | No login required. Any quiz reachable in 3 taps. CTA buttons are always full-width and high-contrast at the bottom of each screen. |
| **5. Reward Salience** | XP gains animate with color. Achievement overlays interrupt flow. Streak milestones use large emoji and warm peach tone to celebrate wins. |

---

## 2. Design System

### 2.1 Color Palette — Dark Theme (Default)

| Swatch | Hex | Name | Usage |
|---|---|---|---|
| 🟩 | `#A8DAB5` | **Mint Green** | Primary CTA, correct answers, XP highlights, streak accent |
| 🟣 | `#D4C5E2` | **Soft Lavender** | Secondary cards, rank badges, science subject color |
| 🟠 | `#E8D5C4` | **Peach / Tan** | Streak warmth, secondary accents, speed bonus |
| ⬛ | `#1A1C1E` | **Deep Charcoal** | Primary background — the app canvas |
| 🌑 | `#212427` | **Off-Black Navy** | Card backgrounds, surface elevation 1 |
| 🌒 | `#2A2D31` | **Lighter Navy** | Nested cards, input backgrounds, elevation 2 |
| 🌓 | `#33373B` | **Dark Slate** | Borders on hover, dividers, elevation 3 |
| ⬜ | `#FFFFFF` | **Pure White** | Headings, high-emphasis text |
| 🔘 | `#71767B` | **Muted Slate** | Labels, secondary text, disabled states |
| 🔴 | `#FF8A8A` | **Soft Red** | Error states, incorrect answers, danger indicators |

### 2.2 Color Palette — Light Theme

| Swatch | Hex | Name | Usage |
|---|---|---|---|
| 🟩 | `#7CB38D` | **Forest Mint** | Primary CTA (desaturated for contrast on white) |
| 🟣 | `#A792C1` | **Muted Violet** | Secondary cards, science subject |
| 🟠 | `#D6A982` | **Warm Sand** | Streak, secondary accents |
| ⬜ | `#F8F9FA` | **Off White** | Primary background in light mode |
| ⬛ | `#1A1C1E` | **Near Black** | Body text on white backgrounds |
| 🔴 | `#E06B6B` | **Rose Red** | Error / incorrect states |

### 2.3 Subject Color Assignments

| Subject | Dark Theme | Light Theme | Notes |
|---|---|---|---|
| Mathematics | `#A8DAB5` | `#7CB38D` | Mint — primary subject; most-used color |
| Science | `#D4C5E2` | `#A792C1` | Lavender — complex/analytical feel |
| English | `#E8D5C4` | `#D6A982` | Peach — warm, expressive |
| History | `#FFC2A6` | `#E08A8A` | Warm orange-red — historic, earthy |
| Computer | `#B8E0D2` | `#7FB5A8` | Teal — tech, digital |
| Art | `#E2C3F0` | `#B892C8` | Lilac — creative, expressive |

### 2.4 Typography Scale

| Token | Size | Weight | Usage |
|---|---|---|---|
| Display XL | 40pt / 80px | 900 | App name, onboarding headlines |
| Display L | 32pt / 64px | 900 | Quiz score, XP totals, stat values |
| Heading 1 | 24pt / 48px | 900 | Section headers, modal titles |
| Heading 2 | 20pt / 40px | 800 | Card titles, chapter names |
| Heading 3 | 16pt / 32px | 800 | Sub-section labels, option text |
| Body | 14pt / 28px | 600 | Descriptions, explanations |
| Caption | 12pt / 24px | 700 | Tags, badges, metadata |
| Micro | 10pt / 20px | 700 + CAPS | Labels (XP EARNED), stat tags |

> **Primary font:** Inter / Plus Jakarta Sans (system fallback: `sans-serif`). Monospace (`font-family: monospace`) for the countdown timer display only.

### 2.5 Spacing & Grid

| Token | Value | Notes |
|---|---|---|
| Base unit | 4px | All spacing is multiples of 4 |
| Container max-width | 480px | Phone-first; centered on tablet |
| Horizontal page padding | 24px | Left and right on all screens |
| Card internal padding | 20–24px | Varies by card prominence |
| Bottom nav safe area | 24px below bar | Accounts for home indicator |
| Card border-radius | 20–28px | Large; soft, approachable feel |
| Chip / tag border-radius | 999px | Full pill shape |

### 2.6 Elevation & Glassmorphism

| Layer | Treatment |
|---|---|
| **Bottom Nav** | `backdrop-filter: blur(24px)` · `border: 1px solid rgba(Mint, 0.15)` · glass background |
| **Cards** | Solid `bg2` fill · `1px solid bdr` · no drop-shadow in dark mode |
| **Achievement Overlay** | `bg2` card · `scaleIn` animation · page dimmed to 85% opacity |
| **Notification Panel** | Slides down from top (`slideDown 0.3s`) · bottom corners rounded |

### 2.7 CSS Animation Keyframes

```css
@keyframes fadeIn        { from { opacity: 0 }               to { opacity: 1 } }
@keyframes fadeSlideDown { from { opacity: 0; transform: translateX(-50%) translateY(-20px) }
                           to   { opacity: 1; transform: translateX(-50%) translateY(0) } }
@keyframes slideDown     { from { transform: translateY(-100%) }  to { transform: translateY(0) } }
@keyframes scaleIn       { from { transform: scale(0.85); opacity: 0 } to { transform: scale(1); opacity: 1 } }
```

---

## 3. Component Library

### 3.1 The Tap Component — Universal Press Handler

Every interactive element wraps in a `<Tap>` container that provides three micro-interactions:

| Event | Effect |
|---|---|
| `mouseDown` | `scale(0.96)` — physical press feedback |
| `mouseEnter` | `brightness(0.95)` — subtle hover darken |
| `mouseLeave` / `mouseUp` | Return to identity — spring-back feel |

```
transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)
```

Disabled state: `cursor: not-allowed`; no hover/press effects applied.

---

### 3.2 Bottom Navigation

- **Position:** Fixed, bottom of screen; max-width 480px; glassmorphism background
- **Items:** Home · Quiz · Mistakes · Ranks · Profile (5 total)
- **Active state:** Pill-shaped highlight in Mint Green; shows icon **+** label
- **Inactive state:** Icon only; muted color
- **Active animation:** Width expands to reveal label (label slides in smoothly)
- **Visibility:** Shown on `dashboard`, `browser`, `mistakebank`, `leaderboard`, `profile` screens only

---

### 3.3 Toast Notification

- **Position:** Fixed, top center; `z-index: 400`
- **Entry animation:** `fadeSlideDown` 0.3s ease — drops in from 20px above
- **Auto-dismiss:** After 3000ms
- **Color variants:** Mint (success) · Red (error) · Custom accent (info)
- **Style:** White text on color background · rounded pill · bold 14pt

---

### 3.4 Achievement Overlay

- **Backdrop:** Full-screen at 85% opacity
- **Card entry:** `scaleIn` 0.28s ease — scales from 0.85
- **Rank badge:** Purple chip, positioned top-right of avatar circle
- **CTAs:** Keep Playing (Mint, primary) · Share Score (bg3, secondary)
- **Dismiss:** Tap outside card, or tap either CTA

---

### 3.5 Progress Bar

Used in 4 contexts: chapter list · featured card · subject tile · quiz header

| Property | Value |
|---|---|
| Height | 4–6px (context-dependent) |
| Fill color | Subject accent color |
| Border radius | 3px |
| Background | `bg3` (unfilled portion) |
| Animation | Fill animates on mount |

---

### 3.6 Circular Timer — Quiz Screen

```
SVG circle: stroke-dasharray + stroke-dashoffset for animated fill ring
Timer fill transition: stroke-dashoffset 0.9s linear (smooth per-second)
Color transitions:
  > 10s → Mint Green
  6–10s → Peach / Amber
  ≤  5s → Soft Red
Frozen state → Soft Lavender (timer label still visible, not counting)
Center label: monospace font · bold 900 · fontFamily: monospace
```

---

### 3.7 Segmented Progress Bar — Quiz Screen

- **N segments** — one per question — displayed horizontally below the quiz header
- **Answered:** Mint solid fill
- **Current question:** Mint at 40% opacity
- **Unanswered:** `bg3` (dark neutral)
- Each segment transitions `background-color: 0.3s`

---

### 3.8 Quiz Option Row — MCQ

| State | Border | Background | Letter Badge |
|---|---|---|---|
| Default, unselected | `bdr` (1px) | `bg2` | `bg3` fill |
| Selected (pre-submit) | Mint (2px) | Mint 15% tint | Mint fill |
| Correct (post-submit) | `ok` green | Green 15% tint | Green fill + ✓ |
| Wrong selected (post-submit) | `danger` red | Red 15% tint | Red fill + ✕ |
| Wrong unselected (post-submit) | `bdr` | `bg2` | `bg3` fill |

---

## 4. Screen-by-Screen Specifications

### 4.1 Onboarding 1 — Name Entry

> First impression; full-screen with illustration

- **Top 55vh:** Stylized brain SVG illustration with radial mint glow blur effect
- **Bottom 45vh:** Large headline ("Learn New Ways of Thinking") + subhead + full-width text input
- Input styling: `bg3` fill · `1px bdr` border · `20px` padding · `caretColor = Mint` · `18pt` font
- **Footer (fixed, bottom 40px):** Skip link (muted, left) + Next pill (right)
- Next pill: Mint fill when name entered; `bg3` when empty
- Background: subtle gradient `bg2 (top) → bg (bottom)`

---

### 4.2 Onboarding 2 — Class Select

> Personalization step with warm greeting

- Header uses user's name rendered in Mint accent color
- Class chips: 7 options (6–12) · pill shape · Mint fill when selected
- Back link (left) + Start Learning pill (right) at bottom
- Start Learning button disabled (`bg3`) until class selected
- Background: same gradient treatment as Onboarding 1

---

### 4.3 Dashboard

> Home screen; information-rich; all key stats visible above the fold

**Header Zone**
- Greeting label (small caps, muted) + user name (H1 weight 900)
- Right: Notification bell (dot indicator) + Profile avatar

**Stats Row**
- XP chip (Mint tint) · Streak chip · Power-up inventory (3 inline count badges)

**Today's Focus — 2×2 Grid**

| Card | Color | Feature |
|---|---|---|
| Quizzes Due | Lavender | CTA "Start →" button |
| Goal | Peach | Progress bar inside card |
| XP Earned | Mint | Today's XP only |
| Accuracy | textSub | Weekly average |

Each card: `24px` radius · subtle icon watermark at `opacity: 0.06`

**Daily Streak Card**
- 7-day horizontal calendar · completed days: Peach fill + ✓
- Today marker: outlined Peach border + →
- AI Insight card at bottom: `bg3` with left Peach bot icon + study tip

**Subject Section**
- Featured card (Maths): full-width hero with progress bar + circular play button
- Horizontal scroll: 5 compact subject tiles with `6px` color-coded left stripe

---

### 4.4 Subject Browser

> Chapter list with filtering and progress tracking

- **Sticky header:** Back arrow + subject name/icon + search icon
- **Class filter chips:** Horizontal scroll; active chip gets subject accent color fill
- **Featured chapter card:** Pinned at top · full `100%` progress bar · `FEATURED` badge
- **Chapter list rows:**
  - `6px` left border (subject color if `progress > 0`, else `bg3`)
  - Subject icon (44×44, rounded 14px) · chapter name · difficulty badge · progress %
  - Progress label: `Done ✓` / `X%` / `New`
- **Difficulty badges:** `🟢 Spark` · `🟡 Blaze` · `🔴 Inferno`

---

### 4.5 Chapter Detail

> Pre-quiz configuration hub; final screen before quiz starts

- **Hero area (35vh):** Large subject icon (opacity 0.04 watermark) · back button as glass pill
- Star rating badge (`4.8 ⭐`) pinned bottom-right of hero in Peach
- **Info chips (pill-shaped):** `📚 22 Lessons` · `⏱️ 1hr 45min` · `❓ 40 Questions`
- **Download Notes:** Full-width outlined button (toast on tap)
- **Mode toggle (2 side-by-side cards):**
  - `⚡ Instant Quiz` (from question bank)
  - `🤖 AI Quiz` (LLM-generated)
  - Selected card: accent border + bg tint
- **Difficulty row:** 3 pill chips; selected fills with its difficulty color
- **Power-Up grid (2×2):**
  - Selected: accent border + tinted bg
  - Disabled (0 count): `opacity: 0.5` + `cursor: not-allowed`
  - Count badge: top-right of each card (`×N`)
- **CTA:** Full-width Mint `Start Quiz →` button

---

### 4.6 Quiz Screen

> Core interactive experience; designed for focus and speed

**Header**
- Back arrow (navigates to Chapter Detail) · subject name + difficulty label · circular countdown timer

**Progress Area**
- `XX% done` badge · segmented N-step progress bar

**Active Power-Up Banner** *(if active)*
- `⚡ Double XP Active` — Mint-tinted strip below progress bar

**Question Card**
- `bg2` fill · subject icon watermark (`opacity: 0.04`) · difficulty badge top-right
- Question text: `20pt` · bold `800` · line-height `1.5`

**MCQ Options**
- Full-width rows with letter badge (A/B/C/D) + option text
- State transitions: selected → submitted → correct/incorrect (see Component 3.8)

**Fill-in-the-Blank Input**
- `bg2` card · full-width input · `border: none` · large `16pt` font · `caretColor = Mint`

**Feedback Card** *(post-submit)*
- Correct: `ok` green tint · `✅ Correct! +10 XP earned`
- Wrong: `danger` red tint · correct answer shown in green · explanation in muted italic

**Action Button (sticky bottom)**
- Pre-submit (answer selected): `Submit Answer` — Mint fill
- Post-submit: `Next Question →` or `See Results 🎉` — Lavender fill

---

### 4.7 Results Screen

> Reward and reflection moment; celebrates progress

**Score Ring**
- Centered SVG radial ring; animates from 0% to score on mount (`1.2s ease-out`)
- Ring color: Mint (≥90%) · Lavender (≥70%) · Peach (≥50%) · Red (<50%)
- Center: large bold percentage value

**Summary Row (3 columns)**
- ✅ Correct · ❌ Wrong · ⏱️ Time — each in `bg2` card with icon

**XP Highlight Card**
- Mint-tinted · `💎 X XP earned` in large bold

**Mistake Review** *(if wrong answers exist)*
- One card per wrong answer
- Wrong answer: strikethrough in danger red
- Correct answer: bold in `ok` green
- Explanation: muted italic

**Challenge a Friend Card**
- `bg2` · `Share2` icon · generate link CTA

**Bottom Action Row**
- `Try Again` (outlined, flex 1) · `Dashboard` (Mint, flex 2)

---

### 4.8 Mistake Bank

> Spaced repetition for wrong answers; gamified clearing mechanic

**Comeback Bonus Card (top)**
- Cleared / total as segmented bar
- `+50 XP` bonus for clearing all shown prominently

**Mistake Cards**
- Subject icon badge + name · question text (bold, 16pt)
- **Answer comparison (2-column):**
  - Left: `danger` tint · `YOUR ANSWER` label · strikethrough wrong answer
  - Right: `ok` tint · `CORRECT` label · correct answer
- Explanation: `bg3` card with `4px` left border in subject color
- `Re-attempt →` button (Mint, full-width)

**Re-attempt Inline State**
- Text input replaces review content
- `Submit Answer` (Mint) + `Cancel` (outlined) at bottom

**Empty / Cleared State**
- Large `CheckCircle` icon in ok green · `+50 XP Comeback Bonus` card

---

### 4.9 Leaderboard

> Competitive rankings with three different scopes

**Tab Selector**
- `🌍 Global` · `📚 Subject` · `📖 Chapter` — in `bg3` pill container
- Active tab: Mint fill + dark text

**Podium Visual (top 3)**
- 3-column layout with varying bar heights:
  - 🥇 1st: center · tallest (120px) · Lavender color
  - 🥈 2nd: left · medium (90px) · Mint color
  - 🥉 3rd: right · shortest (70px) · Peach color
- Rank number in large white bold on bar; emoji avatar + name + XP above bar

**Full Rankings List**
- Rank badge (medal for top 3, number otherwise)
- Emoji avatar (44×44, rounded 14px) · first name · class label · XP
- **User's own row:** Mint 15% tint bg · `6px` left accent bar · `YOU` badge (Mint pill)
- Top 3 rows: rank badge background tinted with respective podium color

**Sticky Footer**
- Always visible: user's rank number + XP in Mint-tinted card
- Shows `—` for rank when chapter is not yet selected

---

### 4.10 Profile

> Personal stats hub and progression overview

**Profile Header**
- 84×84px avatar (equipped cosmetic icon) · edit icon overlay (navigates to shop)
- Name (H1) · class chip · rank chip (Lavender tint)
- XP Earned chip (Mint) + XP Balance chip (Peach) side-by-side

**3-Stat Row**
- Quizzes · Day Streak · Global Rank
- Each card has `4px` colored top bar matching its metric color

**Study Activity Card**
- Toggle: `heatmap` ↔ `chart` in `bg3` pill
- **Heatmap:** 35-cell 7-column grid · 4 opacity levels (bg3 → Mint 44% → Mint 66% → Mint 100%)
- **Bar chart:** 7 bars by day · colored by performance (red < 20%, mixed for middle, Mint ≥ 90%)
- Time filter: Week / Month / 6 Month
- Summary stats: Lessons Complete + Hours Spent

**Subject Progress**
- One card per subject · subject icon · chapter label · progress bar · percentage
- Tap navigates to Subject Browser for that subject

**Achievements Grid (2-column)**
- Each badge card: `4px` colored top bar · icon in tinted bg · name · description
- Tapping shows Achievement overlay

---

### 4.11 Avatar Shop

> Cosmetic store powered by XP Balance economy

**Header**
- XP Balance chip (Peach) — spending XP here does not affect rank
- Subtitle: "Spending XP doesn't lower Rank"

**Live Avatar Preview**
- 96×96px rounded square at top · updates immediately on equip

**Category Tabs (horizontal scroll pills)**
- Shape · Color · Background · Frame

**Item Grid (2-column)**

| State | Button Text | Button Style |
|---|---|---|
| Equipped | `Equipped ✓` | `ok` green fill |
| Owned, not equipped | `Equip` | Outlined |
| Not owned, can afford | `Purchase` | Mint fill |
| Not owned, cannot afford | `Purchase` | `bg3` fill · muted text · disabled |

- Free items: `FREE` badge in `ok` green tint
- Paid items: `💎 X` cost badge in Peach tint

---

## 5. Key Interaction Patterns

### 5.1 Navigation Architecture

| Pattern | Details |
|---|---|
| Primary navigation | Bottom tab bar (5 items); always visible on main screens |
| Secondary navigation | Arrow-back button in sticky header for nested screens |
| Overlays | Notification panel (slide down) · Achievement overlay (fade + scale) |
| Tab active state | Active tab shows label + icon in pill; inactive shows icon only |
| Deep link path | Dashboard subject tile → Browser → Chapter → Chapter Detail (3 taps max) |

### 5.2 Animation Timing Tokens

| Element | Duration | Easing |
|---|---|---|
| Button press (scale) | 200ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` |
| Toast slide-in | 300ms | `ease` — drops from 20px above |
| Achievement scale-in | 280ms | `ease` — from 0.85 scale |
| Notification panel slide | 300ms | `ease` — slides down from top |
| Results ring fill | 1200ms | `ease-out` — long duration for drama |
| Timer ring update | 900ms | `linear` — matches 1-second tick |
| Theme toggle | 300ms | `ease` — background + color crossfade |
| Progress bar fill | 400ms | `ease` — on screen mount |

### 5.3 Feedback States

| Action | Visual Feedback | Additional Feedback |
|---|---|---|
| Correct answer | Green card tint + CheckCircle icon | `+XP` toast with amount |
| Wrong answer | Red tint + XCircle; correct highlighted green | Explanation text; saved to Mistake Bank |
| Speed bonus | `+5 Bonus XP 🚀` toast in Mint | Only shown on correct fast answers |
| XP purchase fail | Gray disabled button | Red toast: `Need X more XP` |
| Streak milestone | Peach fire emoji + highlighted day | AI Insight card updates |
| Mistake Bank clear | Full-screen celebration screen | `+50 XP Comeback Bonus` shown |
| Quiz score ≥ 90% | Achievement overlay with rank | 1.5s delay after results load |

---

## 6. Accessibility & Inclusivity

### 6.1 Touch Targets

- All tappable elements: minimum **44×44 points** (Apple HIG + Material Design standard)
- Bottom nav items: expanded tap area using padding
- Quiz option rows: ~56px height — easy to tap on small screens

### 6.2 Color & Contrast Ratios

| Color Pair | Ratio | Standard |
|---|---|---|
| White text on `#212427` | ~14.5:1 | Exceeds AAA |
| Muted `#71767B` on `#1A1C1E` | ~4.7:1 | Meets AA |
| Mint `#A8DAB5` on `#1A1C1E` | ~7.2:1 | Exceeds AAA |
| Error red `#FF8A8A` on dark bg | ~5.1:1 | Meets AA |

> Information is **never conveyed by color alone** — icons and text always accompany color-coded states.

### 6.3 Responsive Considerations

- Layout is **single-column** throughout; no horizontal layout switches
- Text sizes in `pt` (scalable); respect system font scale
- Max content width 480px; full-width below — works 320px to 430px without overflow
- Horizontal scroll containers for chips/tabs allow overflow without breaking layout

---

## 7. Design Dos and Donts

| ✅ Do | ❌ Don't |
|---|---|
| Use large border-radius (20–28px) on all cards | Use sharp corners — feels clinical and cold |
| Reserve Mint Green for primary CTAs and positive feedback | Use Mint for neutral or informational UI |
| Add icon watermarks (opacity 0.04) in card backgrounds | Use high-opacity background icons that distract from content |
| Show progress bars everywhere progress exists | Show empty progress bars at 0% — start at 2% minimum |
| Use full-width CTAs at the bottom of screens | Use multiple equal-weight CTAs — pick one primary action |
| Give every tap an immediate visual response | Allow dead/unresponsive taps — always confirm interaction |
| Use emoji as visual icons (subject tiles, streak) | Mix emoji and SVG icons in the same visual context |
| Keep disabled states clearly muted (`bg3` + muted color) | Hide disabled states — always show why action is unavailable |
| Use `scaleIn` / `slideDown` for overlays | Use instant/no-transition modal appearances |
| Animate XP rewards (toast + number) | Award XP silently without visual confirmation |

---

## 8. Design Changelog

| Version | Date | Changes |
|---|---|---|
| 0.1 | 2025-01 | Initial dark theme; quiz and dashboard wireframes |
| 0.3 | 2025-02 | Added subject color system; avatar shop; glassmorphism nav |
| 0.7 | 2025-04 | Light theme added; leaderboard podium; heatmap + bar chart |
| 1.0 | 2025-06 | Final design system; all screen specs; animation tokens documented |

---

*BrainBlaze UI/UX Design Specification · Version 1.0 · Design System · Mobile First*
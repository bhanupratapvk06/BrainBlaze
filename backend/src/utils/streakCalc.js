'use strict';

const STREAK_MILESTONES = [7, 14, 30, 60, 100];

/**
 * Calculates the new streak value given the last active date string.
 * Per SystemDesign §2.5
 *
 * @param {string|null} lastActive  ISO date string (YYYY-MM-DD) or null
 * @param {number}      currentStreak  Existing streak count
 * @returns {{ newStreak: number, streakMilestone: string|null }}
 */
function checkStreak(lastActive, currentStreak = 0) {
  const today     = todayISO();
  const yesterday = offsetDateISO(-1);

  let newStreak = currentStreak;

  if (!lastActive) {
    // First ever session
    newStreak = 1;
  } else if (lastActive === today) {
    // Already played today — no change
    newStreak = currentStreak;
  } else if (lastActive === yesterday) {
    // Consecutive day — increment
    newStreak = currentStreak + 1;
  } else {
    // Missed a day — reset to 1 (started again today)
    newStreak = 1;
  }

  // Check for milestone unlock
  const streakMilestone = STREAK_MILESTONES.includes(newStreak)
    ? `${newStreak}_day_streak`
    : null;

  return { newStreak, streakMilestone };
}

/** Returns today's date as YYYY-MM-DD (UTC+5:30 IST approximation via UTC) */
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function offsetDateISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

module.exports = { checkStreak };

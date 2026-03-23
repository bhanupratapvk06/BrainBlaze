/**
 * Calculates streak status based on last active date and current date.
 * 
 * @param {string} lastActiveDate - ISO string or Date of last activity.
 * @param {number} currentStreak - The current streak count.
 * @param {string} powerUp - Active power-up (e.g., 'Time Freeze').
 * @returns {number} The new streak count.
 */
export const calculateStreak = (lastActiveDate, currentStreak, powerUp = null) => {
  if (!lastActiveDate) return 1;

  const today = new Date();
  // Normalize to midnight for accurate day comparison
  today.setHours(0, 0, 0, 0);

  const lastActive = new Date(lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);

  const diffTime = Math.abs(today - lastActive);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Already active today
    return currentStreak;
  } else if (diffDays === 1) {
    // Active yesterday, maintain and increment
    return currentStreak + 1;
  } else {
    // Missed a day
    if (powerUp === 'Time Freeze') {
      // Time Freeze preserves the streak, and active today increments it
      return currentStreak + 1;
    }
    // Streak broken
    return 1;
  }
};

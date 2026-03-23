/**
 * Calculates XP earned based on various factors.
 * 
 * @param {number} base - The base XP for the activity.
 * @param {number} speedTime - Time taken in seconds.
 * @param {boolean} isHard - Whether the difficulty was Hard.
 * @param {string|null} powerUp - Active power-up (e.g., '2x XP').
 * @param {boolean} aiBonus - Whether an AI bonus applies.
 * @returns {number} The calculated XP to award.
 */
export const calculateXP = (base, speedTime = null, isHard = false, powerUp = null, aiBonus = false) => {
  let earned = base;
  
  // Speed bonus: +5 XP if completed in less than 10 seconds per question (or total, depending on logic context)
  // Assuming speedTime is time taken per question or total time if handled differently.
  if (speedTime !== null && speedTime < 10) {
    earned += 5;
  }
  
  // Difficulty multiplier
  if (isHard) {
    earned = Math.floor(earned * 1.5);
  }
  
  // Power-up multiplier
  if (powerUp === '2x XP' || powerUp === 'Double XP') {
    earned *= 2;
  }
  
  // AI Bonus
  if (aiBonus) {
    earned += 10;
  }
  
  return earned;
};

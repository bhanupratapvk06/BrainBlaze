'use strict';

/**
 * Server-authoritative XP calculation formula.
 * Mirror of frontend src/utils/xpCalc.js — per SystemDesign §6 and APIDocs §6.
 *
 * @param {object} params
 * @param {number} params.score         - Number of correct answers
 * @param {number} params.totalQ        - Total questions in session
 * @param {number} params.timeTaken     - Total seconds taken for session
 * @param {string} params.difficulty    - 'spark' | 'blaze' | 'inferno'
 * @param {string|null} params.activePowerUp - 'doubleXp' | 'shield' | 'timeFreeze' | 'hint' | null
 * @param {string} params.mode          - 'precomputed' | 'ai'
 * @returns {{ totalXP, speedBonusApplied, aiBonusApplied, doubleXpApplied }}
 */
function calculateXP({ score, totalQ, timeTaken, difficulty, activePowerUp, mode }) {
  const avgTimePerQ = totalQ > 0 ? timeTaken / totalQ : Infinity;

  // Speed bonus: +5 XP per correct answer if avg time < 8s
  const speedBonusApplied = avgTimePerQ < 8 && score > 0;
  const speedBonus        = speedBonusApplied ? 5 * score : 0;

  const baseXP = (score * 10) + speedBonus;

  const diffMult = { spark: 1.0, blaze: 1.5, inferno: 2.0 }[difficulty] ?? 1.0;

  const doubleXpApplied = activePowerUp === 'doubleXp';
  const powerUpMult     = doubleXpApplied ? 2.0 : 1.0;

  const aiBonusApplied = mode === 'ai';
  const aiBonus        = aiBonusApplied ? 1.2 : 1.0;

  const totalXP = Math.floor(baseXP * diffMult * powerUpMult * aiBonus);

  return { totalXP, speedBonusApplied, aiBonusApplied, doubleXpApplied };
}

module.exports = { calculateXP };

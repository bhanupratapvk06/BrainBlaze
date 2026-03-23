import { useAuth } from '../contexts/AuthContext';
import { calculateXP } from '../utils/xpCalc';

export const useXP = () => {
  const { user, saveUser } = useAuth();

  /**
   * Calculates and adds XP to the user's account.
   */
  const addXp = async (base, speedTime, isHard, powerUp, aiBonus) => {
    const earned = calculateXP(base, speedTime, isHard, powerUp, aiBonus);
    await saveUser({
      xpEarned: (user.xpEarned || 0) + earned,
      xpBalance: (user.xpBalance || 0) + earned
    });
    return earned;
  };

  const awardXp = async (amount) => {
    await saveUser({
      xpEarned: (user.xpEarned || 0) + amount,
      xpBalance: (user.xpBalance || 0) + amount
    });
  };

  const spendXp = async (amount) => {
    if ((user.xpBalance || 0) >= amount) {
      await saveUser({
        xpBalance: user.xpBalance - amount
      });
      return true;
    }
    return false;
  };

  return { 
    addXp, 
    awardXp,
    spendXp, 
    xpBalance: user.xpBalance || 0, 
    xpEarned: user.xpEarned || 0 
  };
};

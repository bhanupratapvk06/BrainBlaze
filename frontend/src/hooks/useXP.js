import { useAuth } from '../contexts/AuthContext';

/**
 * useXP — reads XP from AuthContext (which is synced from server after quiz submit).
 * Adding/spending XP is handled server-side via quiz/submit and shop/purchase.
 * These local methods remain for optimistic UI during sessions that haven't submitted yet.
 */
export const useXP = () => {
  const { user, saveUser, syncFromServer } = useAuth();

  /**
   * addXp — optimistic local increment only.
   * The server is the source of truth; call syncFromServer() after submit.
   */
  const addXp = async (amount) => {
    await saveUser({
      xpEarned:  (user.xpEarned  || 0) + amount,
      xpBalance: (user.xpBalance || 0) + amount,
    });
    return amount;
  };

  const awardXp = addXp;

  const spendXp = async (amount) => {
    if ((user.xpBalance || 0) >= amount) {
      await saveUser({ xpBalance: user.xpBalance - amount });
      return true;
    }
    return false;
  };

  return {
    addXp,
    awardXp,
    spendXp,
    syncFromServer,
    xpBalance: user.xpBalance || 0,
    xpEarned:  user.xpEarned  || 0,
  };
};

import { useAuth } from '../contexts/AuthContext';

export const usePowerUp = () => {
  const { user, saveUser } = useAuth();
  
  const activatePowerUp = async (powerUpId) => {
    const pUps = { ...(user.powerUps || {}) };
    
    if (pUps[powerUpId] > 0) {
      pUps[powerUpId] -= 1;
      await saveUser({ powerUps: pUps });
      return true;
    }
    return false;
  };

  const addPowerUp = async (powerUpId, amount = 1) => {
    const pUps = { ...(user.powerUps || {}) };
    pUps[powerUpId] = (pUps[powerUpId] || 0) + amount;
    await saveUser({ powerUps: pUps });
  };

  return { powerUps: user?.powerUps || {}, activatePowerUp, addPowerUp };
};

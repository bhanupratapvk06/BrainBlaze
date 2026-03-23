import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { calculateStreak } from '../utils/streakCalc';

export const useStreak = () => {
  const { user, saveUser } = useAuth();

  useEffect(() => {
    // Determine streak on mount/auth load
    if (user && user.name) {
      const newStreak = calculateStreak(user.lastActive, user.streak || 0, null);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastActive = user.lastActive ? new Date(user.lastActive) : null;
      if (lastActive) lastActive.setHours(0, 0, 0, 0);

      // Update if lastActive is not today or streak changed
      if (newStreak !== user.streak || !lastActive || today.getTime() !== lastActive.getTime()) {
        saveUser({
          streak: newStreak,
          lastActive: new Date().toISOString()
        });
      }
    }
  }, [user?.lastActive]);

  return { streak: user?.streak || 0 };
};

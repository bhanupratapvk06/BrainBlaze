import { useState, useEffect } from 'react';

/**
 * Hook to manage a countdown timer.
 * @param {number} initialTime - The starting time in seconds.
 * @param {Function} onTimeUp - Callback triggered when the timer hits zero.
 */
export const useTimer = (initialTime, onTimeUp) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let int;
    if (isActive && timeLeft > 0) {
      int = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (onTimeUp) onTimeUp();
    }
    return () => clearInterval(int);
  }, [isActive, timeLeft, onTimeUp]);

  const startTimer = () => setIsActive(true);
  const pauseTimer = () => setIsActive(false);
  const resetTimer = (newTime = initialTime) => {
    setIsActive(false);
    setTimeLeft(newTime);
  };

  return { 
    timeLeft, 
    setTimeLeft, 
    isActive, 
    startTimer, 
    pauseTimer, 
    resetTimer 
  };
};

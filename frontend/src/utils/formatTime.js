/**
 * Formats a time duration in seconds to MM:SS format.
 * 
 * @param {number} seconds - The time in seconds.
 * @returns {string} Formatted time string (e.g., "01:05").
 */
export const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

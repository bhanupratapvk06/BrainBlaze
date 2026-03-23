/**
 * Simple fuzzy match for search functionality.
 *
 * @param {string} search - The search term.
 * @param {string} text - The text to search within.
 * @returns {boolean} True if text matches the search term.
 */
export const fuzzyMatch = (search, text) => {
  if (!search) return true;
  if (!text) return false;
  
  const searchStr = search.toLowerCase();
  const targetStr = text.toLowerCase();
  
  return targetStr.includes(searchStr);
};

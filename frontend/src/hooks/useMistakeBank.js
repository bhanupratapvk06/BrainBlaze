import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mistakeBankApi } from '../api/mistakeBankApi';

/**
 * useMistakeBank — syncs with backend.
 * Loads from local AsyncStorage first for instant display,
 * then fetches from server to get server-assigned IDs.
 */
export const useMistakeBank = () => {
  const [mistakeBank, setMistakeBank] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load from local cache on mount
  useEffect(() => {
    loadMistakes();
  }, []);

  const loadMistakes = async () => {
    try {
      const stored = await AsyncStorage.getItem('mistakes');
      if (stored) setMistakeBank(JSON.parse(stored));
    } catch (e) {
      console.warn('[useMistakeBank] Failed to load local mistakes', e);
    }
  };

  /**
   * fetchFromServer — fetches uncleared mistakes for a subject from backend.
   * Pass 'all' for all subjects.
   */
  const fetchFromServer = useCallback(async (subjectId = 'all') => {
    setIsLoading(true);
    try {
      const res = await mistakeBankApi.getItems(subjectId);
      const items = (res.items || []).map(m => ({
        id:       m.id,
        subject:  m.subject,
        q:        m.question,
        correct:  m.correctAnswer,
        yours:    m.userAnswer,
        exp:      m.explanation,
        timestamp: m.createdAt,
      }));
      setMistakeBank(items);
      await AsyncStorage.setItem('mistakes', JSON.stringify(items));
      return items;
    } catch (err) {
      console.warn('[useMistakeBank] Server fetch failed (offline?), using local:', err.message);
      return mistakeBank;
    } finally {
      setIsLoading(false);
    }
  }, [mistakeBank]);

  /**
   * removeItem — deletes a mistake from the server (awards +10 XP).
   * Falls back to local removal on error.
   */
  const removeMistake = async (id) => {
    try {
      const res = await mistakeBankApi.removeItem(id);
      const updated = mistakeBank.filter(m => m.id !== id);
      setMistakeBank(updated);
      await AsyncStorage.setItem('mistakes', JSON.stringify(updated));
      return { xpAwarded: res.xpAwarded, comebackBonus: res.comebackBonus };
    } catch (err) {
      console.warn('[useMistakeBank] Remove failed (offline fallback):', err.message);
      const updated = mistakeBank.filter(m => m.id !== id);
      setMistakeBank(updated);
      await AsyncStorage.setItem('mistakes', JSON.stringify(updated));
      return { xpAwarded: 10, comebackBonus: false };
    }
  };

  // Legacy sync method: merge local items to state (called by screens)
  const addMistake = async (subject, chapter, questionData) => {
    if (mistakeBank.some(m => m.q === questionData.q)) return;
    const newMistake = {
      id:        Date.now().toString(),
      subject,
      chapter,
      ...questionData,
      timestamp: new Date().toISOString(),
    };
    const updated = [newMistake, ...mistakeBank];
    setMistakeBank(updated);
    await AsyncStorage.setItem('mistakes', JSON.stringify(updated));
  };

  const clearMistakes = async (subject = null) => {
    const updated = subject ? mistakeBank.filter(m => m.subject !== subject) : [];
    setMistakeBank(updated);
    if (updated.length) {
      await AsyncStorage.setItem('mistakes', JSON.stringify(updated));
    } else {
      await AsyncStorage.removeItem('mistakes');
    }
  };

  return {
    mistakeBank,
    setMistakeBank,
    addMistake,
    removeMistake,
    clearMistakes,
    fetchFromServer,
    isLoading,
  };
};

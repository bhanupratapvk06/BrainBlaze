import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useMistakeBank = () => {
  const [mistakes, setMistakes] = useState([]);

  useEffect(() => {
    loadMistakes();
  }, []);

  const loadMistakes = async () => {
    try {
      const stored = await AsyncStorage.getItem('mistakes');
      if (stored) {
        setMistakes(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load mistakes', e);
    }
  };

  const addMistake = async (subject, chapter, questionData) => {
    // avoid duplicates based on question text
    if (mistakes.some(m => m.q === questionData.q)) return;

    const newMistake = {
      id: Date.now().toString(),
      subject,
      chapter,
      ...questionData,
      timestamp: new Date().toISOString()
    };
    
    const updated = [newMistake, ...mistakes];
    setMistakes(updated);
    try {
      await AsyncStorage.setItem('mistakes', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save mistake', e);
    }
  };

  const removeMistake = async (id) => {
    const updated = mistakes.filter(m => m.id !== id);
    setMistakes(updated);
    try {
      await AsyncStorage.setItem('mistakes', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to delete mistake', e);
    }
  };

  const clearMistakes = async (subject = null) => {
    let updated;
    if (subject) {
      updated = mistakes.filter(m => m.subject !== subject);
    } else {
      updated = [];
    }
    setMistakes(updated);
    try {
      if (updated.length) {
        await AsyncStorage.setItem('mistakes', JSON.stringify(updated));
      } else {
        await AsyncStorage.removeItem('mistakes');
      }
    } catch(e) {
      console.warn('Failed to clear mistakes', e);
    }
  };

  return { mistakes, addMistake, removeMistake, clearMistakes };
};

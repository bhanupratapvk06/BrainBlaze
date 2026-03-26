import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/authApi';
import { profileApi } from '../api/profileApi';
import { shopApi } from '../api/shopApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: '',
    cls: '',
    xpEarned: 0,
    xpBalance: 0,
    streak: 0,
    lastActive: null,
    jwt: null,
    powerUps: {},
    equippedCosmetics: {
      shape: 'student',
      color: 'white',
      background: 'plain',
      frame: 'none',
    },
    ownedCosmetics: ['student', 'white', 'plain', 'none'],
    id: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  // ── Bootstrap: load persisted user on startup ─────────────────────────────
  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem('user_data');
        if (stored) setUser(JSON.parse(stored));
      } catch (e) {
        console.warn('[AuthContext] Error loading user data', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  // ── Persist user state to AsyncStorage ───────────────────────────────────
  const saveUser = useCallback(async (newUserData) => {
    const mergedData = { ...user, ...newUserData };
    setUser(mergedData);
    try {
      await AsyncStorage.setItem('user_data', JSON.stringify(mergedData));
    } catch (e) {
      console.warn('[AuthContext] Error saving user data', e);
    }
  }, [user]);

  // ── Login: calls backend, stores JWT, seeds state from server ────────────
  const login = async (name, cls) => {
    try {
      const response = await authApi.login(name, cls);
      const { token, student } = response;

      await AsyncStorage.setItem('jwt_token', token);

      const userData = {
        id:                student.id,
        name:              student.name,
        cls:               student.class,
        xpEarned:          student.xpEarned,
        xpBalance:         student.xpBalance,
        streak:            student.streak,
        lastActive:        student.lastActive,
        jwt:               token,
        powerUps:          student.powerUps || {},
        equippedCosmetics: student.equippedCosmetics || { shape: 'student', color: 'white', background: 'plain', frame: 'none' },
        ownedCosmetics:    student.ownedCosmetics || ['student', 'white', 'plain', 'none'],
        createdAt:         student.createdAt,
      };

      setUser(userData);
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      console.warn('[AuthContext] Login API failed:', err.message);
      // Graceful offline fallback — app still works locally
      const fallback = { name, cls, xpEarned: 0, xpBalance: 0, streak: 0 };
      setUser(prev => ({ ...prev, ...fallback }));
      await AsyncStorage.setItem('user_data', JSON.stringify({ ...user, ...fallback }));
      return { success: false, error: err.message };
    }
  };

  // ── Sync: pull latest stats from backend (call after quiz submit / shop) ─
  const syncFromServer = useCallback(async () => {
    try {
      const [statsRes, shopRes] = await Promise.all([
        profileApi.getStats(),
        shopApi.getItems(),
      ]);

      const equippedCosmetics = {};
      const ownedCosmetics = [];
      Object.entries(shopRes.categories || {}).forEach(([cat, items]) => {
        items.forEach(item => {
          if (item.owned)    ownedCosmetics.push(item.id);
          if (item.equipped) equippedCosmetics[cat] = item.id;
        });
      });

      await saveUser({
        xpEarned:          statsRes.xpEarned,
        xpBalance:         statsRes.xpBalance,
        streak:            statsRes.streak,
        lastActive:        statsRes.lastActive,
        equippedCosmetics: { shape: 'student', color: 'white', background: 'plain', frame: 'none', ...equippedCosmetics },
        ownedCosmetics,
      });
    } catch (err) {
      console.warn('[AuthContext] syncFromServer failed (offline?):', err.message);
    }
  }, [saveUser]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    const resetUser = {
      name: '', cls: '', xpEarned: 0, xpBalance: 0, streak: 0, lastActive: null,
      jwt: null, powerUps: {}, id: null,
      equippedCosmetics: { shape: 'student', color: 'white', background: 'plain', frame: 'none' },
      ownedCosmetics: ['student', 'white', 'plain', 'none'],
    };
    setUser(resetUser);
    await AsyncStorage.multiRemove(['user_data', 'jwt_token']);
  };

  // ── Shop helpers (delegate to API; optimistic fallback on error) ──────────
  const handleCosmeticPurchase = async (item) => {
    try {
      const res = await shopApi.purchaseItem(item.id);
      await saveUser({
        xpBalance:         res.xpBalance,
        equippedCosmetics: res.equippedCosmetics,
        ownedCosmetics:    [...(user.ownedCosmetics || []), item.id],
      });
      return true;
    } catch (err) {
      console.warn('[AuthContext] Purchase failed:', err.message);
      return false;
    }
  };

  const equipCosmetic = async (category, itemId) => {
    try {
      const res = await shopApi.equipItem(itemId);
      await saveUser({ equippedCosmetics: res.equippedCosmetics });
    } catch (err) {
      console.warn('[AuthContext] Equip API failed (local fallback):', err.message);
      await saveUser({ equippedCosmetics: { ...user.equippedCosmetics, [category]: itemId } });
    }
  };

  return (
    <AuthContext.Provider value={{
      user, saveUser, login, logout, isLoading, syncFromServer,
      handleCosmeticPurchase, equipCosmetic,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

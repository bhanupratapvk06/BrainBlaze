import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      shape: "student",
      color: "white",
      background: "plain",
      frame: "none"
    },
    ownedCosmetics: ["student", "white", "plain", "none"]
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user_data');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.warn("Error loading user data via context", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const saveUser = async (newUserData) => {
    const mergedData = { ...user, ...newUserData };
    setUser(mergedData);
    try {
      await AsyncStorage.setItem('user_data', JSON.stringify(mergedData));
    } catch (e) {
      console.warn("Error saving user data via context", e);
    }
  };

  const login = async (name, cls) => {
    await saveUser({ name, cls });
  };

  const logout = async () => {
    const resetUser = { 
      name: '', cls: '', xpEarned: 0, xpBalance: 0, streak: 0, lastActive: null, jwt: null,
      powerUps: {}, equippedCosmetics: { shape: "student", color: "white", background: "plain", frame: "none" },
      ownedCosmetics: ["student", "white", "plain", "none"]
    };
    setUser(resetUser);
    await AsyncStorage.removeItem('user_data');
  };

  return (
    <AuthContext.Provider value={{ user, saveUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

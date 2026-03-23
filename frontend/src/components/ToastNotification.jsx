import React, { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const ToastNotification = ({ msg, color, duration = 3000, onClose }) => {
  const { theme } = useTheme();

  useEffect(() => {
    if (!msg) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [msg, duration, onClose]);

  if (!msg) return null;

  return (
    <div style={{
      position: "fixed", 
      top: 24, 
      left: "50%", 
      transform: "translateX(-50%)", 
      zIndex: 400,
      backgroundColor: color || theme.bg3, 
      color: theme.onAcc,
      padding: "12px 24px", 
      borderRadius: 999, 
      fontWeight: 700, 
      fontSize: 14,
      boxShadow: "0 8px 30px rgba(0,0,0,0.3)", 
      whiteSpace: "nowrap", 
      animation: "fadeSlideDown 0.3s ease"
    }}>
      {msg}
    </div>
  );
};

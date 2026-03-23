import React from 'react';

const press = {
  onMouseEnter: e => e.currentTarget.style.filter = "brightness(0.95)",
  onMouseLeave: e => { 
    e.currentTarget.style.filter = "none"; 
    e.currentTarget.style.transform = "scale(1)"; 
  },
  onMouseDown: e => e.currentTarget.style.transform = "scale(0.96)",
  onMouseUp: e => e.currentTarget.style.transform = "scale(1)",
};

/**
 * Universal press handler component for micro-interactions (scale + brightness).
 */
export const Tap = ({ onClick, style = {}, children, disabled = false }) => (
  <div 
    onClick={disabled ? undefined : onClick} 
    {...(disabled ? {} : press)}
    style={{ 
      cursor: disabled ? "not-allowed" : "pointer", 
      transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)", 
      userSelect: "none", 
      ...style 
    }}
  >
    {children}
  </div>
);

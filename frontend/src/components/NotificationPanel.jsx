import React from 'react';
import { X, Flame, FileText, Trophy, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Tap } from './Tap';
import { NOTIFS } from '../assets/data';

export const NotificationPanel = ({ open, onClose }) => {
  const { theme: C } = useTheme();

  if (!open) return null;
  
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, display: "flex", flexDirection: "column", maxWidth: 480, width: "100%", left: "50%", transform: "translateX(-50%)" }}>
      <div style={{
        backgroundColor: C.bg2, borderBottom: `1px solid ${C.bdr}`, display: "flex", flexDirection: "column",
        height: "75vh", animation: "slideDown 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)", borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden", zIndex: 2
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "32px 24px 20px", borderBottom: `1px solid ${C.bdr}`, backgroundColor: C.bg }}>
          <span style={{ fontWeight: 900, fontSize: 24, color: C.text, letterSpacing: -0.5 }}>Updates ✨</span>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ color: C.acc, fontSize: 14, cursor: "pointer", fontWeight: 800 }}>Mark all read</span>
            <Tap onClick={onClose} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 12, backgroundColor: C.bg3, border: `1px solid ${C.bdr}` }}>
              <X size={20} color={C.text} />
            </Tap>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 0 32px 0" }}>
          {NOTIFS.map(n => (
            <div key={n.id} style={{
              display: "flex", alignItems: "center", gap: 18, padding: "20px 24px",
              borderBottom: `1px solid ${C.bdr}`, backgroundColor: n.unread ? C.acc + "0D" : "transparent",
              borderLeft: `4px solid ${n.unread ? n.color : "transparent"}`, transition: "background 0.2s"
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 16, backgroundColor: n.color + "22", border: `1px solid ${n.color}55`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                {n.id === 1 ? <Flame size={22} color={n.color} /> 
                  : n.id === 2 ? <FileText size={22} color={n.color} /> 
                  : n.id === 3 ? <Trophy size={22} color={n.color} /> 
                  : <Zap size={22} color={n.color} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 800, fontSize: 16, margin: "0 0 6px", color: n.unread ? C.text : C.muted }}>{n.title}</p>
                <p style={{ color: C.muted, fontSize: 14, margin: "0 0 6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.desc}</p>
                <p style={{ color: C.textSub, fontSize: 12, fontWeight: 700, margin: 0 }}>{n.time}</p>
              </div>
              {n.unread && <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: n.color, flexShrink: 0 }} />}
            </div>
          ))}
        </div>
        {/* Quick bottom padding drag handle indicator */}
        <div style={{ height: 24, display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: 10 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: C.bdr }} />
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, backgroundColor: C.overlay, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", zIndex: 1, animation: "fadeIn 0.3s ease" }} onClick={onClose} />
    </div>
  );
};

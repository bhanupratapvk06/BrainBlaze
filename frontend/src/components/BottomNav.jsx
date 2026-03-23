import React from 'react';
import { Home, Zap, BookOpen, Trophy, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Tap } from './Tap';

export const BottomNav = ({ page, nav }) => {
  const { theme: C } = useTheme();

  const items = [
    { id: "dashboard", l: "Home", Icon: Home },
    { id: "browser", l: "Quiz", Icon: Zap },
    { id: "mistakebank", l: "Mistakes", Icon: BookOpen },
    { id: "leaderboard", l: "Ranks", Icon: Trophy },
    { id: "profile", l: "Profile", Icon: User },
  ];

  const active = id =>
    page === id ||
    (page === "chapter" && id === "browser") ||
    (page === "quiz" && id === "browser") ||
    (page === "results" && id === "browser") ||
    (page === "shop" && id === "profile");

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 480,
      zIndex: 60,
      backgroundColor: C.bg2,
      borderTop: `1px solid ${C.bdr}`,
      display: "flex",
      alignItems: "stretch",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      {items.map(({ id, l, Icon }) => {
        const a = active(id);
        return (
          <Tap
            key={id}
            onClick={() => nav(id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 0 12px",
              gap: 4,
              position: "relative",
              color: a ? C.acc : C.muted,
              transition: "color 0.2s ease",
            }}
          >
            {/* Active indicator — top bar */}
            {a && (
              <div style={{
                position: "absolute",
                top: 0,
                left: "25%",
                right: "25%",
                height: 3,
                borderRadius: "0 0 3px 3px",
                backgroundColor: C.acc,
              }} />
            )}
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: a ? C.acc + "22" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s ease",
            }}>
              <Icon
                size={22}
                strokeWidth={a ? 2.5 : 1.8}
                color={a ? C.acc : C.muted}
              />
            </div>
            <span style={{
              fontSize: 10,
              fontWeight: a ? 800 : 600,
              letterSpacing: 0.2,
              color: a ? C.acc : C.muted,
            }}>
              {l}
            </span>
          </Tap>
        );
      })}
    </div>
  );
};

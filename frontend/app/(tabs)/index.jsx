import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Bell, User, Shield, Snowflake, Zap, Target, Award, Bot } from 'lucide-react';
import { useAuth, useTheme, useStreak, usePowerUp } from "../../src/hooks";
import { Tap, NotificationPanel, ThemeToggle } from "../../src/components";
import { makeSubjects } from "../../src/assets/data";
import { BottomNavSpacer } from '../../src/components/BottomNavSpacer';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme: C } = useTheme();
  const { streak } = useStreak();
  const { powerUps } = usePowerUp();
  const [notifOpen, setNotifOpen] = useState(false);

  const SUBJECTS = makeSubjects(C);
  const days = ["M", "T", "W", "T", "F", "S", "S"];

  const name = user?.name || "Student";
  const xpEarned = user?.xpEarned || 0;

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh", paddingBottom: 160 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "48px 24px 24px" }}>
        <div>
          <p style={{ color: C.muted, fontSize: 13, margin: "0 0 4px", fontWeight: 700, letterSpacing: 0.5 }}>GOOD MORNING ☀️</p>
          <h1 style={{ fontWeight: 900, fontSize: 30, color: C.text, margin: 0, lineHeight: 1.2 }}>Hi, {name}</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <ThemeToggle />
          <Tap onClick={() => setNotifOpen(true)}
            style={{
              width: 44, height: 44, borderRadius: 14, backgroundColor: C.bg2, border: `1px solid ${C.bdr}`,
              display: "flex", alignItems: "center", justifyContent: "center", position: "relative"
            }}>
            <Bell size={20} color={C.muted} strokeWidth={2} />
            <span style={{ position: "absolute", top: 9, right: 9, width: 8, height: 8, borderRadius: "50%", backgroundColor: C.danger, border: `2px solid ${C.bg2}` }} />
          </Tap>
          <Tap onClick={() => router.push('/(tabs)/profile')}
            style={{
              width: 44, height: 44, borderRadius: 14, backgroundColor: C.bg2, border: `2px solid ${C.acc}`,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
            <User size={20} color={C.acc} strokeWidth={2} />
          </Tap>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 10, padding: "0 24px 28px", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ backgroundColor: C.acc + "15", border: `1px solid ${C.acc}33`, borderRadius: 999, padding: "8px 14px", fontSize: 13, fontWeight: 800, color: C.acc }}>
          💎 {xpEarned} XP
        </div>
        <div style={{ backgroundColor: C.bg3, border: `1px solid ${C.bdr}`, borderRadius: 999, padding: "8px 14px", fontSize: 13, fontWeight: 700, color: C.text }}>
          🔥 {streak} Day Streak
        </div>
        <div style={{ flex: 1 }} />
        {[{ Icon: Shield, c: powerUps.shield || 0 }, { Icon: Snowflake, c: powerUps.timeFreeze || 0 }, { Icon: Zap, c: powerUps.doubleXp || 0 }].map((p, i) => (
          <div key={i} style={{ backgroundColor: C.bg2, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "6px 8px", fontSize: 12, display: "flex", alignItems: "center", gap: 4, color: C.text }}>
            <p.Icon size={13} color={C.textSub} /><span style={{ color: C.muted }}>×{p.c}</span>
          </div>
        ))}
      </div>

      {/* Today's Focus */}
      <div style={{ padding: "0 24px 28px" }}>
        <p style={{ fontWeight: 800, fontSize: 18, margin: "0 0 16px", color: C.text }}>Today's Focus</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "DUE", val: "3", sub: "Quizzes left", Icon: Zap, clr: C.sec, cta: true, dest: "/subject/Maths" },
            { label: "GOAL", val: "20", sub: "Questions target", Icon: Target, clr: C.hi, progress: 65 },
            { label: "EARNED", val: `+${xpEarned > 0 ? xpEarned : 130}`, sub: "XP today", Icon: Award, clr: C.acc },
            { label: "ACCURACY", val: "84%", sub: "This week", Icon: Target, clr: C.textSub },
          ].map((card, i) => (
            <div key={i} style={{
              borderRadius: 24, padding: 20, position: "relative", overflow: "hidden",
              backgroundColor: C.bg2, border: `1px solid ${C.bdr}`
            }}>
              <div style={{ position: "absolute", right: -10, top: -10, opacity: 0.06, pointerEvents: "none" }}>
                <card.Icon size={64} color={card.clr} strokeWidth={1} />
              </div>
              <p style={{ color: card.clr, fontSize: 11, fontWeight: 800, margin: "0 0 6px", letterSpacing: 1 }}>{card.label}</p>
              <p style={{ fontWeight: 900, fontSize: 32, color: C.text, margin: "0 0 4px", lineHeight: 1 }}>{card.val}</p>
              <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>{card.sub}</p>
              {card.progress && <div style={{ marginTop: 12 }}>
                <div style={{ width: "100%", height: 6, backgroundColor: C.bg3, borderRadius: 3 }}>
                  <div style={{ height: "100%", backgroundColor: card.clr, borderRadius: 3, width: card.progress + "%" }} />
                </div>
              </div>}
              {card.cta && <Tap onClick={() => router.push(card.dest)}
                style={{ backgroundColor: card.clr, color: C.bg, borderRadius: 999, padding: "8px 16px", fontSize: 12, fontWeight: 800, display: "inline-block", marginTop: 12 }}>
                Start →
              </Tap>}
            </div>
          ))}
        </div>
      </div>

      {/* Streak */}
      <div style={{ padding: "0 24px 28px" }}>
        <div style={{ borderRadius: 24, overflow: "hidden", border: `1px solid ${C.bdr}`, backgroundColor: C.bg2 }}>
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <p style={{ fontWeight: 900, fontSize: 18, margin: 0, color: C.text }}>Daily Streak 🔥</p>
                <p style={{ color: C.hi, fontSize: 13, fontWeight: 600, margin: "4px 0 0" }}>{streak} days — keep going!</p>
              </div>
              <div style={{
                width: 56, height: 56, borderRadius: 16, backgroundColor: C.hi,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
                boxShadow: `0 8px 24px ${C.hi}33`
              }}>🔥</div>
            </div>
            <div style={{ display: "flex", justifyContent: "spaceBetween", marginBottom: 20 }}>
              {days.map((d, i) => {
                const done = i < streak, today = i === streak; return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 12,
                      backgroundColor: done ? C.hi : today ? C.bg3 : "transparent",
                      border: today ? `2px solid ${C.hi}` : done ? "none" : `1px solid ${C.bdr}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: done ? 16 : 14, fontWeight: 900, color: done ? C.bg : today ? C.hi : C.muted
                    }}>
                      {done ? "✓" : today ? "→" : ""}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: done ? C.hi : C.muted }}>{d}</span>
                  </div>
                );
              })}
            </div>
            <div style={{
              backgroundColor: C.bg3, borderRadius: 16, padding: "14px 16px",
              border: `1px solid ${C.bdr}`, display: "flex", alignItems: "flex-start", gap: 12
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10, backgroundColor: C.hi,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <Bot size={16} color={C.bg} />
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 12, color: C.hi, margin: "0 0 4px" }}>AI Insight ✨</p>
                <p style={{ color: C.textSub, fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                  You're 70% done with Maths Ch.4. Review <strong style={{ color: C.text }}>Quadratic Equations</strong> today.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Subjects */}
      <div style={{ padding: "0 24px 12px" }}>
        <p style={{ fontWeight: 800, fontSize: 18, margin: 0, color: C.text }}>Popular Subjects</p>
      </div>
      <div style={{ padding: "0 24px 16px" }}>
        <Tap onClick={() => router.push('/subject/Maths')}
          style={{
            borderRadius: 24, padding: 24, position: "relative", overflow: "hidden",
            backgroundColor: C.bg2, border: `1px solid ${C.bdr}`
          }}>
          <div style={{ position: "absolute", right: 16, top: 16, fontSize: 84, opacity: 0.04, transform: "rotate(-10deg)" }}>📐</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ backgroundColor: C.acc, color: C.bg, borderRadius: 999, padding: "4px 12px", fontSize: 11, fontWeight: 800, display: "inline-block", marginBottom: 12 }}>FEATURED</div>
              <h2 style={{ color: C.acc, fontSize: 24, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>Maths</h2>
              <p style={{ color: C.muted, fontSize: 13, margin: "6px 0 0" }}>Ch.4 — Quadratic Equations</p>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: C.acc + "15", border: `1px solid ${C.acc}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📐</div>
          </div>
          <div style={{ width: "100%", height: 6, backgroundColor: C.bg3, borderRadius: 3, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ height: "100%", borderRadius: 3, backgroundColor: C.acc, width: "72%" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: C.muted, fontSize: 13, fontWeight: 600 }}>72% complete · 5 chapters left</span>
            <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: C.acc, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: C.bg }}>▶</div>
          </div>
        </Tap>
      </div>
      <div style={{ overflowX: "auto", display: "flex", gap: 16, padding: "0 24px 28px" }}>
        {SUBJECTS.slice(1).map((s, i) => (
          <Tap key={i} onClick={() => router.push(`/subject/${s.name}`)}
            style={{ minWidth: 160, borderRadius: 24, padding: 20, flexShrink: 0, backgroundColor: C.bg2, border: `1px solid ${C.bdr}`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -10, bottom: -10, fontSize: 64, opacity: 0.04 }}>{s.icon}</div>
            <div style={{ width: 36, height: 6, borderRadius: 3, backgroundColor: s.color, marginBottom: 12 }} />
            <p style={{ fontWeight: 800, fontSize: 18, margin: "0 0 4px", color: C.text }}>{s.name}</p>
            <p style={{ color: C.muted, fontSize: 12, margin: "0 0 16px" }}>{s.ch}</p>
            <div style={{ width: "100%", height: 4, backgroundColor: C.bg3, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 2, backgroundColor: s.color, width: `${s.pct}%` }} />
            </div>
            <p style={{ color: s.color, fontSize: 12, fontWeight: 800, margin: "8px 0 0" }}>{s.pct}%</p>
          </Tap>
        ))}
      </div>
      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      <BottomNavSpacer />
    </div>
  );
}

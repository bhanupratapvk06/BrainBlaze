import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Search, BookOpen, Flame, Trophy } from 'lucide-react';
import { useAuth, useTheme, useStreak } from "../../src/hooks";
import { Tap } from "../../src/components";
import { makeSubjects, SHOP } from "../../src/assets/data";
import { BottomNavSpacer } from '../../src/components/BottomNavSpacer';

export default function ProfileScreen() {
  const router = useRouter();
  const { theme: C } = useTheme();
  const { user } = useAuth();
  const { streak } = useStreak();

  const [actTab, setActTab] = useState("heatmap");

  const xpEarned = user?.xpEarned || 0;
  const xpBalance = user?.xpBalance || 0;
  const name = user?.name || "Student";
  const cls = user?.cls || "Class 9";
  const equippedCosmetics = user?.cosmetics?.equipped || { shape: "student", color: "white", background: "plain", frame: "none" };

  const SUBJECTS = makeSubjects(C);
  const curShape = SHOP.shape.find(s => s.id === equippedCosmetics.shape);

  // Mock data for UI
  const hm = Array.from({ length: 35 }).map(() => { const r = Math.random(); return r > 0.78 ? C.acc : r > 0.55 ? C.acc + "99" : r > 0.3 ? C.acc + "44" : C.bdr; });
  const bars = [65, 42, 88, 18, 100, 30, 55];
  const badges = [
    { i: "🔥", n: "7-Day Streak", d: "7 days in a row", clr: C.hi },
    { i: "🏆", n: "Top 10", d: "Leaderboard legend", clr: C.sec },
    { i: "⭐", n: "Perfect Score", d: "100% on a quiz", clr: C.ok },
    { i: "⚡", n: "Fast Learner", d: "Speed bonus ×5", clr: C.acc },
    { i: "🧠", n: "Quiz Master", d: "50 quizzes done", clr: C.sec },
    { i: "💪", n: "Mistake Slayer", d: "Cleared bank", clr: C.ok },
  ];

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh", paddingBottom: 160 }}>
      <div style={{ position: "relative", overflow: "hidden", backgroundColor: C.bg2, borderBottom: `1px solid ${C.bdr}` }}>
        <div style={{ padding: "56px 24px 32px", display: "flex", gap: 20, alignItems: "center" }}>
          <Tap onClick={() => router.push('/shop')} style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 84, height: 84, borderRadius: 24, backgroundColor: C.bg3, border: `2px solid ${C.acc}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42 }}>{curShape?.icon || "🧑‍🎓"}</div>
            <div style={{ position: "absolute", bottom: -4, right: -4, width: 28, height: 28, borderRadius: 10, backgroundColor: C.bg2, border: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Search size={14} color={C.text} />
            </div>
          </Tap>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontWeight: 900, fontSize: 26, margin: "0 0 6px", color: C.text }}>{name}</h1>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              <span style={{ backgroundColor: C.bg3, border: `1px solid ${C.bdr}`, fontSize: 12, padding: "4px 12px", borderRadius: 999, color: C.muted, fontWeight: 700 }}>Class {cls}</span>
              <span style={{ backgroundColor: C.sec + "15", border: `1px solid ${C.sec}33`, fontSize: 12, padding: "4px 12px", borderRadius: 999, color: C.sec, fontWeight: 800 }}>🏆 Rank #10</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ backgroundColor: C.acc + "15", border: `1px solid ${C.acc}33`, borderRadius: 14, padding: "8px 12px" }}>
                <p style={{ fontWeight: 900, fontSize: 15, color: C.acc, margin: 0, lineHeight: 1 }}>💎 {xpEarned.toLocaleString()}</p>
                <p style={{ color: C.muted, fontSize: 10, margin: "4px 0 0", letterSpacing: 1, fontWeight: 700 }}>XP EARNED</p>
              </div>
              <div style={{ backgroundColor: C.hi + "15", border: `1px solid ${C.hi}33`, borderRadius: 14, padding: "8px 12px" }}>
                <p style={{ fontWeight: 900, fontSize: 15, color: C.hi, margin: 0, lineHeight: 1 }}>💰 {xpBalance.toLocaleString()}</p>
                <p style={{ color: C.muted, fontSize: 10, margin: "4px 0 0", letterSpacing: 1, fontWeight: 700 }}>BALANCE</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, padding: "24px 24px" }}>
        {[{ v: "24", l: "Quizzes", Icon: BookOpen, clr: C.acc }, { v: streak || "0", l: "Day Streak", Icon: Flame, clr: C.hi }, { v: "#10", l: "Global Rank", Icon: Trophy, clr: C.sec }].map((s, i) => (
          <div key={i} style={{ backgroundColor: C.bg2, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.bdr}` }}>
            <div style={{ height: 4, backgroundColor: s.clr || C.acc }} />
            <div style={{ padding: "16px 12px 20px", textAlign: "center" }}>
              <div style={{ marginBottom: 8, color: s.clr, display: "flex", justifyContent: "center" }}>{s.Icon && <s.Icon size={24} />}</div>
              <p style={{ fontWeight: 900, fontSize: 28, color: C.text, margin: "0 0 4px", lineHeight: 1 }}>{s.v}</p>
              <p style={{ color: s.clr, fontSize: 11, margin: 0, fontWeight: 700 }}>{s.l}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 24px 24px" }}>
        <div style={{ backgroundColor: C.bg2, borderRadius: 24, overflow: "hidden", border: `1px solid ${C.bdr}` }}>
          <div style={{ height: 4, backgroundColor: C.sec }} />
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: C.sec + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📊</div>
                <p style={{ fontWeight: 900, fontSize: 18, margin: 0, color: C.text }}>Study Activity</p>
              </div>
              <div style={{ display: "flex", gap: 4, backgroundColor: C.bg3, borderRadius: 999, padding: 4 }}>
                {["heatmap", "chart"].map(t => (
                  <Tap key={t} onClick={() => setActTab(t)} style={{ padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 800, textTransform: "capitalize", backgroundColor: actTab === t ? C.sec : "transparent", color: actTab === t ? C.bg : C.muted }}>{t}</Tap>
                ))}
              </div>
            </div>
            {actTab === "heatmap" ? (
              <div style={{ paddingBottom: 8 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginBottom: 12 }}>
                  {hm.map((clr, i) => (<div key={i} style={{ aspectRatio: "1", borderRadius: 6, backgroundColor: clr }} />))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0 2px", marginBottom: 16 }}>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (<span key={d} style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>{d}</span>))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: C.muted, fontSize: 11, fontWeight: 600 }}>Less</span>
                  {[C.bdr, C.acc + "44", C.acc + "99", C.acc].map((clr, i) => (<div key={i} style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: clr }} />))}
                  <span style={{ color: C.muted, fontSize: 11, fontWeight: 600 }}>More</span>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  {["Week", "Month", "6 Month"].map((t, i) => (<Tap key={t} style={{ padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 800, backgroundColor: i === 0 ? C.sec : C.bg3, color: i === 0 ? C.bg : C.textSub }}>{t}</Tap>))}
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140, marginBottom: 12 }}>
                  {bars.map((h, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>{h}%</span>
                      <div style={{ width: "100%", borderRadius: "6px 6px 0 0", minHeight: 6, height: `${h}%`, backgroundColor: h < 20 ? C.danger : h >= 90 ? C.acc : i % 3 === 0 ? C.hi : C.acc + "88" }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-around", borderTop: `1px solid ${C.bdr}`, paddingTop: 10, marginBottom: 20 }}>
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (<span key={i} style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>{d}</span>))}
                </div>
                <div style={{ backgroundColor: C.bg3, borderRadius: 16, padding: "16px 20px", border: `1px solid ${C.bdr}`, display: "flex", justifyContent: "center", alignItems: "center", gap: 32 }}>
                  <div style={{ textAlign: "center" }}><p style={{ fontWeight: 900, fontSize: 32, color: C.sec, margin: 0, lineHeight: 1 }}>16</p><p style={{ color: C.muted, fontSize: 10, margin: "6px 0 0", letterSpacing: 2, fontWeight: 800 }}>LES. COMPLETE</p></div>
                  <div style={{ width: 2, height: 40, backgroundColor: C.bdr }} />
                  <div style={{ textAlign: "center" }}><p style={{ fontWeight: 900, fontSize: 32, color: C.hi, margin: 0, lineHeight: 1 }}>41</p><p style={{ color: C.muted, fontSize: 10, margin: "6px 0 0", letterSpacing: 2, fontWeight: 800 }}>HOURS SPENT</p></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: "0 24px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontWeight: 900, fontSize: 18, margin: 0, color: C.text }}>Subject Progress</p>
          <span style={{ color: C.acc, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>See all →</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {SUBJECTS.map((s, i) => (
            <Tap key={i} onClick={() => router.push(`/subject/${s.name}`)}
              style={{ borderRadius: 24, padding: 20, position: "relative", overflow: "hidden", backgroundColor: C.bg2, border: `1px solid ${C.bdr}` }}>
              <div style={{ position: "absolute", right: -10, top: -4, fontSize: 84, opacity: 0.04, transform: "rotate(-8deg)", userSelect: "none" }}>{s.icon}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: s.color + "15", border: `1px solid ${s.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{s.icon}</div>
                  <div>
                    <p style={{ fontWeight: 900, fontSize: 16, margin: 0, color: C.text }}>{s.name}</p>
                    <p style={{ color: C.muted, fontSize: 13, margin: "4px 0 0" }}>{s.ch}</p>
                  </div>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: C.bg, flexShrink: 0 }}>▶</div>
              </div>
              <div style={{ width: "100%", height: 6, backgroundColor: C.bg3, borderRadius: 3, overflow: "hidden", marginBottom: 10 }}>
                <div style={{ height: "100%", borderRadius: 3, backgroundColor: s.color, width: `${s.pct}%` }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: C.muted, fontSize: 12, fontWeight: 700 }}>{s.pct}% complete</span>
                <span style={{ color: s.color, fontSize: 13, fontWeight: 900 }}>{s.pct}%</span>
              </div>
            </Tap>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 24px" }}>
        <p style={{ fontWeight: 900, fontSize: 18, margin: "0 0 16px", color: C.text }}>Achievements 🏅</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {badges.map((b, i) => (
            <Tap key={i}
              style={{ backgroundColor: C.bg2, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.bdr}`, position: "relative" }}>
              <div style={{ height: 4, backgroundColor: b.clr }} />
              <div style={{ position: "absolute", right: -6, bottom: -6, fontSize: 56, opacity: 0.04, userSelect: "none" }}>{b.i}</div>
              <div style={{ padding: "16px" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: b.clr + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 12 }}>{b.i}</div>
                <p style={{ fontWeight: 900, fontSize: 14, margin: "0 0 4px", color: C.text }}>{b.n}</p>
                <p style={{ color: C.muted, fontSize: 12, margin: 0, lineHeight: 1.4 }}>{b.d}</p>
              </div>
            </Tap>
          ))}
        </div>
      </div>
      <BottomNavSpacer />
    </div>
  );
}

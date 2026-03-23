import React, { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Pencil, BookOpen, Flame, Trophy, ChevronRight } from 'lucide-react';
import { useAuth, useTheme, useStreak } from "../../src/hooks";
import { Tap } from "../../src/components";
import { makeSubjects, SHOP } from "../../src/assets/data";
import { BottomNavSpacer } from '../../src/components/BottomNavSpacer';

// ─── constants ───────────────────────────────────────────────────────────────

const LETTER_SPACING = 1;
const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAYS_LETTER = ["M", "T", "W", "T", "F", "S", "S"];
const CHART_RANGES = ["Week", "Month", "6 Month"];

const makeHeatmap = (seed, C) =>
  Array.from({ length: 35 }, (_, i) => {
    const r = ((i * seed * 9301 + 49297) % 233280) / 233280;
    return r > 0.78 ? C.acc : r > 0.55 ? C.acc + "99" : r > 0.3 ? C.acc + "44" : C.bdr;
  });

// ─── sub-components ──────────────────────────────────────────────────────────

// Horizontal stat row — icon + label left, value right
const StatRow = ({ Icon, label, value, clr, C, last }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 12,
    paddingBottom: last ? 0 : 14,
    marginBottom: last ? 0 : 14,
    borderBottom: last ? "none" : `1px solid ${C.bdr}`,
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: clr + "15",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <Icon size={18} color={clr} strokeWidth={2} />
    </div>
    <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: C.muted }}>{label}</span>
    <span style={{ fontSize: 20, fontWeight: 900, color: C.text }}>{value}</span>
  </div>
);

// ─── component ───────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const router = useRouter();
  const { theme: C } = useTheme();
  const { user } = useAuth();
  const { streak } = useStreak();

  const [actTab, setActTab] = useState("heatmap");
  const [chartRange, setChartRange] = useState("Week");

  const xpEarned = user?.xpEarned ?? 0;
  const xpBalance = user?.xpBalance ?? 0;
  const name = user?.name ?? "Student";
  const cls = user?.cls ?? "Class 9";

  const equippedCosmetics = user?.cosmetics?.equipped ?? {
    shape: "student", color: "white", background: "plain", frame: "none",
  };

  const SUBJECTS = makeSubjects(C);
  const curShape = SHOP.shape.find(s => s.id === equippedCosmetics.shape);

  const hm = useMemo(
    () => makeHeatmap(user?.id?.length ?? 7, C),
    [user?.id, C.acc, C.bdr]
  );

  const bars = [65, 42, 88, 18, 100, 30, 55];

  const badges = [
    { i: "🔥", n: "7-Day Streak", d: "7 days in a row", clr: C.hi },
    { i: "🏆", n: "Top 10", d: "Leaderboard legend", clr: C.sec },
    { i: "⭐", n: "Perfect Score", d: "100% on a quiz", clr: C.ok },
    { i: "⚡", n: "Fast Learner", d: "Speed bonus ×5", clr: C.acc },
    { i: "🧠", n: "Quiz Master", d: "50 quizzes done", clr: C.sec },
    { i: "💪", n: "Mistake Slayer", d: "Cleared bank", clr: C.ok },
  ];

  // Level derived from XP — replace with real formula if needed
  const level = Math.floor(xpEarned / 1000) + 1;
  const levelPct = (xpEarned % 1000) / 10; // 0–100

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh" }}>

      {/* ── Profile header ── */}
      <div style={{
        backgroundColor: C.bg2,
        borderBottom: `1px solid ${C.bdr}`,
        padding: "56px 24px 24px",
      }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20 }}>
          <Tap onClick={() => router.push('/shop')} style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: 80, height: 80, borderRadius: 24,
              backgroundColor: C.bg3, border: `2px solid ${C.acc}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 40,
            }}>
              {curShape?.icon ?? "🧑‍🎓"}
            </div>
            <div style={{
              position: "absolute", bottom: -4, right: -4,
              width: 26, height: 26, borderRadius: 8,
              backgroundColor: C.bg2, border: `1px solid ${C.bdr}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Pencil size={12} color={C.text} />
            </div>
          </Tap>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              fontWeight: 900, fontSize: 24, margin: "0 0 8px", color: C.text,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {name}
            </h1>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <span style={{
                backgroundColor: C.bg3, border: `1px solid ${C.bdr}`,
                fontSize: 11, padding: "3px 10px", borderRadius: 999,
                color: C.muted, fontWeight: 700,
              }}>
                {cls}
              </span>
              <span style={{
                backgroundColor: C.sec + "15", border: `1px solid ${C.sec}33`,
                fontSize: 11, padding: "3px 10px", borderRadius: 999,
                color: C.sec, fontWeight: 800,
              }}>
                🏆 Rank #10
              </span>
            </div>
          </div>
        </div>

        {/* XP balances */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <div style={{
            flex: 1, backgroundColor: C.acc + "12",
            border: `1px solid ${C.acc}28`, borderRadius: 14, padding: "10px 14px",
          }}>
            <p style={{ fontWeight: 900, fontSize: 16, color: C.acc, margin: 0, lineHeight: 1 }}>
              💎 {xpEarned.toLocaleString()}
            </p>
            <p style={{ color: C.muted, fontSize: 10, margin: "4px 0 0", letterSpacing: LETTER_SPACING, fontWeight: 700 }}>
              XP EARNED
            </p>
          </div>
          <div style={{
            flex: 1, backgroundColor: C.hi + "12",
            border: `1px solid ${C.hi}28`, borderRadius: 14, padding: "10px 14px",
          }}>
            <p style={{ fontWeight: 900, fontSize: 16, color: C.hi, margin: 0, lineHeight: 1 }}>
              💰 {xpBalance.toLocaleString()}
            </p>
            <p style={{ color: C.muted, fontSize: 10, margin: "4px 0 0", letterSpacing: LETTER_SPACING, fontWeight: 700 }}>
              BALANCE
            </p>
          </div>
        </div>

        {/* Level progress bar */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: C.muted }}>Level {level}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>
              {xpEarned % 1000} / 1000 XP
            </span>
          </div>
          <div style={{ width: "100%", height: 6, backgroundColor: C.bg3, borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 3,
              backgroundColor: C.acc,
              width: `${levelPct}%`,
            }} />
          </div>
        </div>
      </div>

      {/* ── Stats — horizontal list rows, no top bar ── */}
      <div style={{ padding: "20px 24px" }}>
        <div style={{
          backgroundColor: C.bg2, borderRadius: 20,
          border: `1px solid ${C.bdr}`, padding: "16px 20px",
        }}>
          <StatRow Icon={BookOpen} label="Quizzes taken" value="24" clr={C.acc} C={C} />
          <StatRow Icon={Flame} label="Day streak" value={streak ?? "0"} clr={C.hi} C={C} />
          <StatRow Icon={Trophy} label="Global rank" value="#10" clr={C.sec} C={C} last />
        </div>
      </div>

      {/* ── Study activity — left accent border, no top bar ── */}
      <div style={{ padding: "0 24px 24px" }}>
        <div style={{
          backgroundColor: C.bg2, borderRadius: 20,
          border: `1px solid ${C.bdr}`,
          borderLeft: `3px solid ${C.sec}`,
        }}>
          <div style={{ padding: "20px 20px 20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p style={{ fontWeight: 900, fontSize: 16, margin: 0, color: C.text }}>Study Activity</p>
              <div style={{ display: "flex", gap: 4, backgroundColor: C.bg3, borderRadius: 999, padding: 3 }}>
                {["heatmap", "chart"].map(t => (
                  <Tap key={t} onClick={() => setActTab(t)} style={{
                    padding: "5px 12px", borderRadius: 999,
                    fontSize: 11, fontWeight: 800, textTransform: "capitalize",
                    backgroundColor: actTab === t ? C.sec : "transparent",
                    color: actTab === t ? C.bg : C.muted,
                  }}>
                    {t}
                  </Tap>
                ))}
              </div>
            </div>

            {actTab === "heatmap" && (
              <div style={{ paddingBottom: 4 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5, marginBottom: 10 }}>
                  {hm.map((clr, i) => (
                    <div key={i} style={{ aspectRatio: "1", borderRadius: 5, backgroundColor: clr }} />
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                  {DAYS_SHORT.map(d => (
                    <span key={d} style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>{d}</span>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: C.muted, fontSize: 11, fontWeight: 600 }}>Less</span>
                  {[C.bdr, C.acc + "44", C.acc + "99", C.acc].map((clr, i) => (
                    <div key={i} style={{ width: 13, height: 13, borderRadius: 4, backgroundColor: clr }} />
                  ))}
                  <span style={{ color: C.muted, fontSize: 11, fontWeight: 600 }}>More</span>
                </div>
              </div>
            )}

            {actTab === "chart" && (
              <div>
                <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                  {CHART_RANGES.map(t => (
                    <Tap key={t} onClick={() => setChartRange(t)} style={{
                      padding: "5px 12px", borderRadius: 999,
                      fontSize: 11, fontWeight: 800,
                      backgroundColor: chartRange === t ? C.sec : C.bg3,
                      color: chartRange === t ? C.bg : C.muted,
                    }}>
                      {t}
                    </Tap>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120, marginBottom: 10 }}>
                  {bars.map((h, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: 9, color: C.muted, fontWeight: 700 }}>{h}%</span>
                      <div style={{
                        width: "100%", borderRadius: "4px 4px 0 0",
                        minHeight: 4, height: `${h}%`,
                        backgroundColor: h < 20 ? C.danger : h >= 90 ? C.acc : i % 3 === 0 ? C.hi : C.acc + "88",
                      }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-around", borderTop: `1px solid ${C.bdr}`, paddingTop: 8, marginBottom: 16 }}>
                  {DAYS_LETTER.map((d, i) => (
                    <span key={i} style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>{d}</span>
                  ))}
                </div>
                <div style={{
                  backgroundColor: C.bg3, borderRadius: 14,
                  padding: "14px 20px", border: `1px solid ${C.bdr}`,
                  display: "flex", justifyContent: "center", alignItems: "center", gap: 28,
                }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontWeight: 900, fontSize: 28, color: C.sec, margin: 0, lineHeight: 1 }}>16</p>
                    <p style={{ color: C.muted, fontSize: 10, margin: "4px 0 0", letterSpacing: LETTER_SPACING, fontWeight: 800 }}>LES. COMPLETE</p>
                  </div>
                  <div style={{ width: 1, height: 36, backgroundColor: C.bdr }} />
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontWeight: 900, fontSize: 28, color: C.hi, margin: 0, lineHeight: 1 }}>41</p>
                    <p style={{ color: C.muted, fontSize: 10, margin: "4px 0 0", letterSpacing: LETTER_SPACING, fontWeight: 800 }}>HOURS SPENT</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Subject progress — flat rows, no play button ── */}
      <div style={{ padding: "0 24px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <p style={{ fontWeight: 900, fontSize: 16, margin: 0, color: C.text }}>Subject Progress</p>
          <Tap onClick={() => router.push('/subjects')}>
            <span style={{ color: C.acc, fontSize: 13, fontWeight: 700 }}>See all →</span>
          </Tap>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {SUBJECTS.map((s, i) => (
            <Tap
              key={i}
              onClick={() => router.push(`/subject/${s.name}`)}
              style={{
                borderRadius: 16, padding: "14px 16px",
                backgroundColor: C.bg2, border: `1px solid ${C.bdr}`,
                display: "flex", alignItems: "center", gap: 14,
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                backgroundColor: s.color + "15", border: `1px solid ${s.color}22`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22,
              }}>
                {s.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <p style={{ fontWeight: 800, fontSize: 14, margin: 0, color: C.text }}>{s.name}</p>
                  <span style={{
                    fontSize: 12, fontWeight: 800, flexShrink: 0, marginLeft: 8,
                    color: s.pct > 0 ? s.color : C.muted,
                  }}>
                    {s.pct === 100 ? "✓ Done" : s.pct > 0 ? `${s.pct}%` : "New"}
                  </span>
                </div>
                <div style={{ width: "100%", height: 4, backgroundColor: C.bg3, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 2, backgroundColor: s.color, width: `${s.pct}%` }} />
                </div>
              </div>
              <ChevronRight size={16} color={C.muted} strokeWidth={2} style={{ flexShrink: 0 }} />
            </Tap>
          ))}
        </div>
      </div>

      {/* ── Achievements — tinted border accent, large watermark, no top bar ── */}
      <div style={{ padding: "0 24px" }}>
        <p style={{ fontWeight: 900, fontSize: 16, margin: "0 0 14px", color: C.text }}>Achievements 🏅</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {badges.map((b, i) => (
            <div
              key={i}
              style={{
                backgroundColor: C.bg2, borderRadius: 16,
                border: `1px solid ${b.clr}22`,
                position: "relative", overflow: "hidden",
                padding: "14px",
              }}
            >
              <div style={{
                position: "absolute", right: -8, bottom: -8,
                fontSize: 72, opacity: 0.06, userSelect: "none", lineHeight: 1,
              }}>
                {b.i}
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: b.clr + "15",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, marginBottom: 10,
              }}>
                {b.i}
              </div>
              <p style={{ fontWeight: 900, fontSize: 13, margin: "0 0 3px", color: C.text }}>{b.n}</p>
              <p style={{ color: C.muted, fontSize: 11, margin: 0, lineHeight: 1.4 }}>{b.d}</p>
            </div>
          ))}
        </div>
      </div>

      <BottomNavSpacer />
    </div>
  );
}
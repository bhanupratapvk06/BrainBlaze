import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useTheme, useAuth } from "../../src/hooks";
import { Tap } from "../../src/components";
import { makeSubjects, CHAPTERS, LB_DATA } from "../../src/assets/data";
import { BottomNavSpacer } from '../../src/components/BottomNavSpacer';
import { leaderboardApi } from '../../src/api/leaderboardApi';


// ─── constants ───────────────────────────────────────────────────────────────

const LETTER_SPACING = 1;

// Podium colors indexed by rank (1-based): gold, silver, bronze
const podiumColor = (rank, C) => {
  if (rank === 1) return C.acc;
  if (rank === 2) return C.sec;
  return C.hi;
};

// ─── helpers ─────────────────────────────────────────────────────────────────

// Stable seeded shuffle so subject/chapter data doesn't reshuffle on re-render
const seededSlice = (data, seed, count, xpMult) =>
  data.slice(0, count).map((u, i) => ({
    ...u,
    xp: Math.floor(u.xp * xpMult * (0.7 + ((i * seed * 9301 + 49297) % 233280) / 233280 * 0.6)),
  })).sort((a, b) => b.xp - a.xp);

// ─── component ───────────────────────────────────────────────────────────────

export default function LeaderboardScreen() {
  const router = useRouter();
  const { theme: C } = useTheme();
  const { user } = useAuth();

  const xpEarned = user?.xpEarned ?? 0;
  const SUBJECTS = makeSubjects(C);

  const [tab, setTab] = useState("global");
  const [selSubject, setSelSubject] = useState("Maths");
  const [selChapter, setSelChapter] = useState(CHAPTERS.Maths[0]);
  const [chapterReady, setChapterReady] = useState(false);
  const [liveData, setLiveData] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const sData = SUBJECTS.find(s => s.name === selSubject) ?? SUBJECTS[0];

  // ── Fetch from backend when tab/subject/chapter changes ───────────────────
  useEffect(() => {
    let cancelled = false;
    setIsFetching(true);
    const fetchData = async () => {
      try {
        let res;
        if (tab === 'global') {
          res = await leaderboardApi.getGlobal();
        } else if (tab === 'subject') {
          res = await leaderboardApi.getSubject(selSubject.toLowerCase());
        } else if (tab === 'chapter' && chapterReady) {
          res = await leaderboardApi.getChapter(encodeURIComponent(selChapter));
        } else {
          setLiveData(null);
          setIsFetching(false);
          return;
        }
        if (!cancelled) setLiveData(res);
      } catch (err) {
        console.warn('[leaderboard] API fetch failed (offline?):', err.message);
        if (!cancelled) setLiveData(null);
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [tab, selSubject, chapterReady ? selChapter : null, chapterReady]);

  const handleSubjectChange = (s) => {
    setSelSubject(s);
    setSelChapter(CHAPTERS[s]?.[0] ?? "");
    setChapterReady(false);
  };

  // ── Merge live data with static fallback ──────────────────────────────────
  const data = useMemo(() => {
    if (liveData?.leaderboard?.length) {
      return liveData.leaderboard.map(r => ({
        name: r.name,
        av:   '🐺',
        xp:   r.xpEarned ?? r.subjectXp ?? r.bestScore ?? 0,
        cls:  r.class,
        isYou: r.studentId === user?.id,
      }));
    }
    // Fallback to static demo data
    if (tab === "global") return LB_DATA;
    if (tab === "subject") return seededSlice(LB_DATA, selSubject.length, 7, 0.55);
    if (tab === "chapter" && chapterReady)
      return seededSlice(LB_DATA, selChapter.length, 6, 0.28);
    return [];
  }, [liveData, tab, selSubject, selChapter, chapterReady, user?.id]);

  // ── Only inject "You" when there's a real logged-in user ──────────────────
  const all = useMemo(() => {
    if (!user) return data;
    // If already in live data, don't duplicate
    if (data.some(d => d.isYou)) return [...data].sort((a, b) => b.xp - a.xp);
    const you = {
      name:  user.name ?? "You",
      av:    "🐺",
      xp:    xpEarned,
      cls:   user.cls ?? "Class 9",
      isYou: true,
    };
    return [...data, you].sort((a, b) => b.xp - a.xp);
  }, [data, user, xpEarned]);

  const subtitleText =
    isFetching ? "Fetching..." :
    tab === "global" ? "All students" :
    tab === "subject" ? `${selSubject} rankings` :
    `${selSubject} · ${selChapter}`;


  const podiumReady = (tab !== "chapter" || chapterReady) && all.length >= 3;

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{
        backgroundColor: C.bg,
        padding: "48px 24px 0",
        borderBottom: `1px solid ${C.bdr}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Tap
            onClick={() => router.push('/(tabs)')}
            style={{
              width: 44, height: 44, borderRadius: 14,
              backgroundColor: C.bg2, border: `1px solid ${C.bdr}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={20} color={C.text} strokeWidth={2} />
          </Tap>

          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontWeight: 900, fontSize: 22, margin: 0, color: C.text }}>Leaderboard</h1>
            <p style={{ color: C.muted, fontSize: 12, margin: "4px 0 0" }}>{subtitleText}</p>
          </div>

          <div style={{
            backgroundColor: C.acc + "15",
            border: `1px solid ${C.acc}33`,
            borderRadius: 14,
            padding: "8px 12px",
            textAlign: "center",
            flexShrink: 0,
          }}>
            <p style={{ fontWeight: 900, fontSize: 14, color: C.acc, margin: 0 }}>
              💎 {(xpEarned / 1000).toFixed(1)}k
            </p>
            <p style={{ color: C.muted, fontSize: 10, fontWeight: 700, margin: 0, letterSpacing: LETTER_SPACING }}>
              YOUR XP
            </p>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div style={{ display: "flex", backgroundColor: C.bg3, borderRadius: 16, padding: 6, gap: 4 }}>
          {["global", "subject", "chapter"].map(t => (
            <Tap
              key={t}
              onClick={() => { setTab(t); setChapterReady(false); }}
              style={{
                flex: 1,
                padding: "12px 0",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 800,
                textAlign: "center",
                backgroundColor: tab === t ? C.acc : "transparent",
                color: tab === t ? C.bg : C.muted,
                transition: "all 0.2s",
              }}
            >
              {t === "global" ? "🌍 Global" : t === "subject" ? "📚 Subject" : "📖 Chapter"}
            </Tap>
          ))}
        </div>
      </div>

      {/* ── Subject picker (subject tab) ── */}
      {tab === "subject" && (
        <div style={{ padding: "24px 24px 0" }}>
          <p style={{ color: C.muted, fontSize: 12, fontWeight: 800, margin: "0 0 12px", letterSpacing: LETTER_SPACING }}>
            SELECT SUBJECT
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {SUBJECTS.map(s => (
              <Tap
                key={s.name}
                onClick={() => setSelSubject(s.name)}
                style={{
                  borderRadius: 16, padding: "16px 10px", textAlign: "center",
                  border: `2px solid ${selSubject === s.name ? s.color : C.bdr}`,
                  backgroundColor: selSubject === s.name ? s.color + "15" : C.bg2,
                }}
              >
                <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div>
                <p style={{ fontWeight: 800, fontSize: 12, margin: 0, color: selSubject === s.name ? s.color : C.text }}>
                  {s.name}
                </p>
              </Tap>
            ))}
          </div>
        </div>
      )}

      {/* ── Subject + chapter picker (chapter tab) ── */}
      {tab === "chapter" && (
        <div style={{ padding: "24px 24px 0" }}>
          <p style={{ color: C.muted, fontSize: 12, fontWeight: 800, margin: "0 0 12px", letterSpacing: LETTER_SPACING }}>
            1 · PICK SUBJECT
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
            {SUBJECTS.map(s => (
              <Tap
                key={s.name}
                onClick={() => handleSubjectChange(s.name)}
                style={{
                  borderRadius: 16, padding: "16px 10px", textAlign: "center",
                  border: `2px solid ${selSubject === s.name ? s.color : C.bdr}`,
                  backgroundColor: selSubject === s.name ? s.color + "15" : C.bg2,
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                <p style={{ fontWeight: 800, fontSize: 12, margin: 0, color: selSubject === s.name ? s.color : C.text }}>
                  {s.name}
                </p>
              </Tap>
            ))}
          </div>

          <p style={{ color: C.muted, fontSize: 12, fontWeight: 800, margin: "0 0 12px", letterSpacing: LETTER_SPACING }}>
            2 · PICK CHAPTER
          </p>
          <div style={{ display: "flex", overflowX: "auto", gap: 10, marginBottom: 16 }}>
            {(CHAPTERS[selSubject] ?? []).map((ch, i) => (
              <Tap
                key={i}
                onClick={() => { setSelChapter(ch); setChapterReady(false); }}
                style={{
                  padding: "10px 18px", borderRadius: 999,
                  fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0,
                  border: `1px solid ${selChapter === ch ? sData.color : C.bdr}`,
                  backgroundColor: selChapter === ch ? sData.color + "15" : C.bg2,
                  color: selChapter === ch ? sData.color : C.text,
                }}
              >
                {ch}
              </Tap>
            ))}
          </div>

          <Tap
            onClick={() => setChapterReady(true)}
            style={{
              display: "block", width: "100%", boxSizing: "border-box",
              backgroundColor: chapterReady ? C.bg3 : sData.color,
              color: chapterReady ? C.muted : "#fff",
              borderRadius: 16, padding: "16px",
              textAlign: "center", fontWeight: 900, fontSize: 14,
              border: `1px solid ${chapterReady ? C.bdr : sData.color}`,
            }}
          >
            {chapterReady ? `✓ Showing: ${selSubject} · ${selChapter}` : "View Rankings →"}
          </Tap>
        </div>
      )}

      {/* ── Empty state (chapter tab, not ready) ── */}
      {tab === "chapter" && !chapterReady && (
        <div style={{ padding: "24px" }}>
          <div style={{
            borderRadius: 24, padding: 40, textAlign: "center",
            backgroundColor: C.bg2, border: `1px solid ${C.bdr}`,
          }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>{sData.icon}</div>
            <p style={{ fontWeight: 900, fontSize: 18, margin: "0 0 8px", color: C.text }}>
              Select a chapter above
            </p>
            <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>
              See who's leading in {selSubject}
            </p>
          </div>
        </div>
      )}

      {/* ── Podium ── */}
      {podiumReady && (
        <div style={{ padding: "24px 24px 0" }}>
          <div style={{
            borderRadius: 28, overflow: "hidden",
            border: `1px solid ${C.bdr}`,
            backgroundColor: C.bg2,
          }}>
            <div style={{ padding: "24px 24px 0", textAlign: "center" }}>
              <Trophy size={32} color={C.acc} strokeWidth={2} />
              <p style={{ color: C.muted, fontSize: 12, fontWeight: 700, margin: "8px 0 0" }}>
                {tab === "global"
                  ? "Global Rankings"
                  : tab === "subject"
                    ? <>{sData.icon} {selSubject}</>
                    : <>{sData.icon} {selSubject} · {selChapter}</>}
              </p>
            </div>

            {/* Podium slots: 2nd, 1st, 3rd */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 12, padding: "24px 24px 0" }}>
              {[
                { entry: all[1], height: 90, rank: 2 },
                { entry: all[0], height: 120, rank: 1 },
                { entry: all[2], height: 70, rank: 3 },
              ].map(({ entry, height, rank }, i) => {
                const clr = podiumColor(rank, C);
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "30%" }}>
                    <div style={{
                      width: rank === 1 ? 60 : 48,
                      height: rank === 1 ? 60 : 48,
                      borderRadius: "50%",
                      backgroundColor: clr + "15",
                      border: `2px solid ${clr}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: rank === 1 ? 32 : 26,
                      marginBottom: 8,
                    }}>
                      {entry?.av ?? "🐺"}
                    </div>
                    <p style={{ fontWeight: 800, fontSize: rank === 1 ? 14 : 12, margin: "0 0 2px", color: C.text, textAlign: "center" }}>
                      {entry?.name?.split(" ")[0] ?? "—"}
                    </p>
                    <p style={{ fontWeight: 800, fontSize: 11, color: clr, margin: "0 0 8px", textAlign: "center" }}>
                      💎 {entry?.xp?.toLocaleString() ?? "0"}
                    </p>
                    <div style={{
                      width: "100%", height,
                      backgroundColor: clr,
                      borderRadius: "16px 16px 0 0",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      gap: 4,
                    }}>
                      <span style={{ fontSize: rank === 1 ? 16 : 14 }}>
                        {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                      </span>
                      <span style={{ fontWeight: 900, color: "#fff", fontSize: rank === 1 ? 32 : 24, lineHeight: 1 }}>
                        {rank}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Full rankings list ── */}
      {(tab !== "chapter" || chapterReady) && (
        <div style={{ padding: "20px 24px 0" }}>
          <p style={{ color: C.muted, fontSize: 12, fontWeight: 800, margin: "0 0 12px", letterSpacing: LETTER_SPACING }}>
            FULL RANKINGS
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {all.map((u, i) => {
              const isTop3 = i < 3;
              const topClr = isTop3 ? podiumColor(i + 1, C) : null;
              return (
                <div
                  key={i}
                  style={{
                    borderRadius: 20, padding: "16px 18px",
                    display: "flex", alignItems: "center", gap: 16,
                    backgroundColor: u.isYou ? C.acc + "15" : C.bg2,
                    border: `1px solid ${u.isYou ? C.acc : C.bdr}`,
                    position: "relative", overflow: "hidden",
                  }}
                >
                  {u.isYou && (
                    <div style={{
                      position: "absolute", left: 0, top: 0, bottom: 0,
                      width: 5, backgroundColor: C.acc,
                    }} />
                  )}

                  {/* Rank badge */}
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    backgroundColor: isTop3 ? topClr + "22" : C.bg3,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontWeight: 900, fontSize: 14, color: isTop3 ? topClr : C.muted }}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                    </span>
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                    backgroundColor: C.bg3,
                    border: `2px solid ${u.isYou ? C.acc : C.bdr}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24,
                  }}>
                    {u.av}
                  </div>

                  {/* Name + class */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: 16, color: C.text }}>
                        {u.name.split(" ")[0]}
                      </span>
                      {u.isYou && (
                        <span style={{
                          backgroundColor: C.acc, color: "#fff",
                          fontSize: 10, padding: "2px 8px",
                          borderRadius: 6, fontWeight: 900,
                        }}>
                          YOU
                        </span>
                      )}
                    </div>
                    <span style={{ color: C.muted, fontSize: 12, fontWeight: 500 }}>{u.cls}</span>
                  </div>

                  {/* XP */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontWeight: 900, fontSize: 15, margin: 0, color: u.isYou ? C.acc : C.text }}>
                      💎 {u.xp.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <BottomNavSpacer />
    </div>
  );
}
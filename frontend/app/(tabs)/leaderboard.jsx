import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, Trophy, User } from 'lucide-react';
import { useTheme, useAuth } from "../../src/hooks";
import { Tap } from "../../src/components";
import { makeSubjects, CHAPTERS, LB_DATA } from "../../src/assets/data";
import { BottomNavSpacer } from '../../src/components/BottomNavSpacer';

export default function LeaderboardScreen() {
  const router = useRouter();
  const { theme: C } = useTheme();
  const { user } = useAuth();

  const xpEarned = user?.xpEarned || 0;
  const SUBJECTS = makeSubjects(C);

  const [tab, setTab] = useState("global");
  const [selSubject, setSelSubject] = useState("Maths");
  const [selChapter, setSelChapter] = useState(CHAPTERS.Maths[0]);
  const [chapterReady, setChapterReady] = useState(false);

  const handleSubjectChange = s => { setSelSubject(s); setSelChapter(CHAPTERS[s][0]); setChapterReady(false); };

  const data = tab === "global" ? LB_DATA : tab === "subject"
    ? LB_DATA.slice(0, 7).map(u => ({ ...u, xp: Math.floor(u.xp * (0.55 + Math.random() * 0.45)) })).sort((a, b) => b.xp - a.xp)
    : chapterReady ? LB_DATA.slice(0, 6).map(u => ({ ...u, xp: Math.floor(u.xp * 0.28 + Math.random() * 600) })).sort((a, b) => b.xp - a.xp) : [];

  const you = { name: "You", av: "🐺", xp: xpEarned, cls: user?.cls || "Class 9", isYou: true };
  const all = [...data, you].sort((a, b) => b.xp - a.xp);

  const sData = SUBJECTS.find(s => s.name === selSubject) || SUBJECTS[0];
  const podClr = [C.sec, C.acc, C.hi];

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh", paddingBottom: 160 }}>
      <div style={{ backgroundColor: C.bg, padding: "48px 24px 0", borderBottom: `1px solid ${C.bdr}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Tap onClick={() => router.push('/(tabs)')} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: C.bg2, border: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ArrowLeft size={20} color={C.text} strokeWidth={2} />
          </Tap>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontWeight: 900, fontSize: 22, margin: 0, color: C.text }}>Leaderboard</h1>
            <p style={{ color: C.muted, fontSize: 12, margin: "4px 0 0" }}>{tab === "global" ? "All students · Class 9" : tab === "subject" ? `${selSubject} rankings` : `${selSubject} · ${selChapter}`}</p>
          </div>
          <div style={{ backgroundColor: C.acc + "15", border: `1px solid ${C.acc}33`, borderRadius: 14, padding: "8px 12px", textAlign: "center" }}>
            <p style={{ fontWeight: 900, fontSize: 14, color: C.acc, margin: 0 }}>💎{(xpEarned / 1000).toFixed(1)}k</p>
            <p style={{ color: C.muted, fontSize: 10, fontWeight: 700, margin: 0 }}>YOUR XP</p>
          </div>
        </div>
        <div style={{ display: "flex", backgroundColor: C.bg3, borderRadius: 16, padding: 6, gap: 4, marginBottom: 0 }}>
          {["global", "subject", "chapter"].map(t => (
            <Tap key={t} onClick={() => { setTab(t); setChapterReady(false); }}
              style={{
                flex: 1, padding: "12px 0", borderRadius: 12, fontSize: 13, fontWeight: 800, textAlign: "center",
                backgroundColor: tab === t ? C.acc : "transparent", color: tab === t ? C.bg : C.textSub, transition: "all 0.2s"
              }}>
              {t === "global" ? "🌍 Global" : t === "subject" ? "📚 Subject" : "📖 Chapter"}
            </Tap>
          ))}
        </div>
      </div>

      {tab === "subject" && (
        <div style={{ padding: "24px 24px 0" }}>
          <p style={{ color: C.muted, fontSize: 12, fontWeight: 800, margin: "0 0 12px", letterSpacing: 1 }}>SELECT SUBJECT</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {SUBJECTS.map(s => (
              <Tap key={s.name} onClick={() => setSelSubject(s.name)}
                style={{ borderRadius: 16, padding: "16px 10px", textAlign: "center", border: `2px solid ${selSubject === s.name ? s.color : C.bdr}`, backgroundColor: selSubject === s.name ? s.color + "15" : C.bg2 }}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div>
                <p style={{ fontWeight: 800, fontSize: 12, margin: 0, color: selSubject === s.name ? s.color : C.text }}>{s.name}</p>
              </Tap>
            ))}
          </div>
        </div>
      )}

      {tab === "chapter" && (
        <div style={{ padding: "24px 24px 0" }}>
          <p style={{ color: C.muted, fontSize: 12, fontWeight: 800, margin: "0 0 12px", letterSpacing: 1 }}>1 · PICK SUBJECT</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
            {SUBJECTS.map(s => (
              <Tap key={s.name} onClick={() => handleSubjectChange(s.name)}
                style={{ borderRadius: 16, padding: "16px 10px", textAlign: "center", border: `2px solid ${selSubject === s.name ? s.color : C.bdr}`, backgroundColor: selSubject === s.name ? s.color + "15" : C.bg2 }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                <p style={{ fontWeight: 800, fontSize: 12, margin: 0, color: selSubject === s.name ? s.color : C.text }}>{s.name}</p>
              </Tap>
            ))}
          </div>
          <p style={{ color: C.muted, fontSize: 12, fontWeight: 800, margin: "0 0 12px", letterSpacing: 1 }}>2 · PICK CHAPTER</p>
          <div style={{ display: "flex", overflowX: "auto", gap: 10, marginBottom: 16 }}>
            {(CHAPTERS[selSubject] || []).map((ch, i) => (
              <Tap key={i} onClick={() => { setSelChapter(ch); setChapterReady(false); }}
                style={{ padding: "10px 18px", borderRadius: 999, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0, border: `1px solid ${selChapter === ch ? sData.color : C.bdr}`, backgroundColor: selChapter === ch ? sData.color + "15" : C.bg2, color: selChapter === ch ? sData.color : C.text }}>
                {ch}
              </Tap>
            ))}
          </div>
          <Tap onClick={() => setChapterReady(true)}
            style={{ display: "block", width: "100%", backgroundColor: chapterReady ? C.bg3 : sData.color, color: chapterReady ? C.muted : C.bg, borderRadius: 16, padding: "16px", textAlign: "center", fontWeight: 900, fontSize: 14, border: `1px solid ${chapterReady ? C.bdr : sData.color}`, boxSizing: "border-box" }}>
            {chapterReady ? `✓ Showing: ${selSubject} · ${selChapter}` : "View Rankings →"}
          </Tap>
        </div>
      )}

      {tab === "chapter" && !chapterReady && (
        <div style={{ padding: "24px" }}>
          <div style={{ borderRadius: 24, padding: 40, textAlign: "center", backgroundColor: C.bg2, border: `1px solid ${C.bdr}` }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>{sData.icon}</div>
            <p style={{ fontWeight: 900, fontSize: 18, margin: "0 0 8px", color: C.text }}>Select a chapter above</p>
            <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>See who's leading in {selSubject}</p>
          </div>
        </div>
      )}

      {(tab !== "chapter" || chapterReady) && all.length >= 3 && (
        <div style={{ padding: "24px 24px 0" }}>
          <div style={{ borderRadius: 28, overflow: "hidden", border: `1px solid ${C.bdr}`, position: "relative", backgroundColor: C.bg2 }}>
            <div style={{ padding: "24px 24px 0", textAlign: "center" }}>
              <Trophy size={32} color={C.acc} strokeWidth={2} />
              <p style={{ color: C.muted, fontSize: 12, fontWeight: 700, margin: "8px 0 0" }}>{tab === "global" ? "Global Rankings" : tab === "subject" ? `${sData.icon} ${selSubject}` : `${sData.icon} ${selSubject} · ${selChapter}`}</p>
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 12, padding: "24px 24px 0" }}>
              {[{ u: all[1], h: 90, rank: 2 }, { u: all[0], h: 120, rank: 1 }, { u: all[2], h: 70, rank: 3 }].map(({ u, h, rank }, i) => {
                const clr = podClr[rank - 1];
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "30%" }}>
                    <div style={{ width: rank === 1 ? 60 : 48, height: rank === 1 ? 60 : 48, borderRadius: "50%", backgroundColor: clr + "15", border: `2px solid ${clr}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: rank === 1 ? 32 : 26, marginBottom: 8 }}>{u?.av || "🐺"}</div>
                    <p style={{ fontWeight: 800, fontSize: rank === 1 ? 14 : 12, margin: "0 0 2px", color: C.text, textAlign: "center" }}>{u?.name?.split(" ")[0] || "?"}</p>
                    <p style={{ fontWeight: 800, fontSize: 11, color: clr, margin: "0 0 8px", textAlign: "center" }}>💎 {u?.xp?.toLocaleString() || "0"}</p>
                    <div style={{ width: "100%", height: h, backgroundColor: clr, borderRadius: "16px 16px 0 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, boxShadow: rank === 1 ? `0 -8px 24px ${clr}33` : "none" }}>
                      <span style={{ fontSize: rank === 1 ? 16 : 14 }}>{rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}</span>
                      <span style={{ fontWeight: 900, color: C.bg, fontSize: rank === 1 ? 32 : 24, lineHeight: 1 }}>{rank}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {(tab !== "chapter" || chapterReady) && (
        <div style={{ padding: "20px 24px 80px" }}>
          <p style={{ color: C.muted, fontSize: 12, fontWeight: 800, margin: "0 0 12px", letterSpacing: 1 }}>FULL RANKINGS</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {all.map((u, i) => {
              const isTop3 = i < 3, topClr = isTop3 ? podClr[i] : null;
              return (
                <div key={i} style={{
                  borderRadius: 20, padding: "16px 18px", display: "flex", alignItems: "center", gap: 16,
                  backgroundColor: u.isYou ? C.acc + "15" : C.bg2, border: `1px solid ${u.isYou ? C.acc : C.bdr}`,
                  position: "relative", overflow: "hidden"
                }}>
                  {u.isYou && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, backgroundColor: C.acc, borderRadius: "0 3px 3px 0" }} />}
                  <div style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, backgroundColor: isTop3 ? topClr + "22" : C.bg3, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontWeight: 900, fontSize: 14, color: isTop3 ? topClr : C.muted }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</span>
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0, backgroundColor: C.bg3, border: `2px solid ${u.isYou ? C.acc : C.bdr}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{u.av}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: 16, color: C.text }}>{u.name.split(" ")[0]}</span>
                      {u.isYou && <span style={{ backgroundColor: C.acc, color: C.bg, fontSize: 10, padding: "2px 8px", borderRadius: 6, fontWeight: 900 }}>YOU</span>}
                    </div>
                    <span style={{ color: C.muted, fontSize: 12, fontWeight: 500 }}>{u.cls}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 900, fontSize: 15, margin: 0, color: u.isYou ? C.acc : C.text }}>💎 {u.xp.toLocaleString()}</p>
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

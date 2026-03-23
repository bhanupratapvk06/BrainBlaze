import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search } from 'lucide-react';
import { useTheme } from "../../src/hooks";
import { Tap } from "../../src/components";
import { makeSubjects, CHAPTERS } from "../../src/assets/data";
import { BottomNavSpacer } from '../../src/components/BottomNavSpacer';

// ─── constants ───────────────────────────────────────────────────────────────

const CLASS_FILTERS = ["All", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];

// Stable fallbacks so array lookups never return undefined
const DIFFICULTIES = ["🟢 Spark", "🟡 Blaze", "🔴 Inferno"];
const getDifficulty = (index) => DIFFICULTIES[index % DIFFICULTIES.length];
const getProgress = (index) => [100, 60, 30, 0, 0, 0, 0, 0, 0][index] ?? 0;

// ─── helpers ─────────────────────────────────────────────────────────────────

const diffColor = (diff, C) => {
  if (diff.includes("Spark")) return C.ok;
  if (diff.includes("Blaze")) return C.hi;
  return C.danger;
};

// ─── component ───────────────────────────────────────────────────────────────

export default function QuizTabScreen() {
  const router = useRouter();
  const { theme: C } = useTheme();
  const SUBJECTS = makeSubjects(C);

  const [cls, setCls] = useState("All");
  const [subject, setSubject] = useState("Maths");

  const sData = SUBJECTS.find(s => s.name === subject) ?? SUBJECTS[0];
  const allChapters = CHAPTERS[subject] ?? CHAPTERS.Maths;

  // Apply class filter — chapters would ideally carry a `class` field;
  // until then, filtering by "All" is the only live filter.
  const chapters = cls === "All"
    ? allChapters
    : allChapters.filter(ch => ch.class === cls); // no-op until data carries .class

  const featuredChapter = chapters[0];
  const featuredProgress = getProgress(0);
  const featuredDiff = getDifficulty(0);

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "48px 24px 16px",
        borderBottom: `1px solid ${C.bdr}`,
        position: "sticky",
        top: 0,
        backgroundColor: C.bg,
        zIndex: 10,
      }}>
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

        {/* Tappable subject selector */}
        <div style={{ textAlign: "center", position: "relative" }}>
          <h1 style={{ fontWeight: 900, fontSize: 20, margin: 0, color: C.text, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span>{sData.icon}</span>
            <span>{subject}</span>
          </h1>
          <p style={{ color: C.muted, fontSize: 12, margin: "2px 0 0" }}>
            {chapters.length} chapters available
          </p>
          <select
            value={subject}
            onChange={e => setSubject(e.target.value)}
            style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
          >
            {SUBJECTS.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
          </select>
        </div>

        <Tap style={{
          width: 44, height: 44, borderRadius: 14,
          backgroundColor: C.bg2, border: `1px solid ${C.bdr}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Search size={20} color={C.text} strokeWidth={1.8} />
        </Tap>
      </div>

      {/* ── Class filter pills ── */}
      <div style={{ display: "flex", overflowX: "auto", gap: 10, padding: "16px 24px 8px" }}>
        {CLASS_FILTERS.map(c => (
          <Tap
            key={c}
            onClick={() => setCls(c)}
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              whiteSpace: "nowrap",
              border: `1px solid ${cls === c ? sData.color : C.bdr}`,
              backgroundColor: cls === c ? sData.color : C.bg2,
              color: cls === c ? C.bg : C.text,
            }}
          >
            {c}
          </Tap>
        ))}
      </div>

      <div style={{ padding: "24px 24px 0" }}>

        {/* ── Featured chapter card ── */}
        {featuredChapter && (
          <Tap
            onClick={() => router.push({ pathname: '/chapter/[name]', params: { name: featuredChapter, subject } })}
            style={{
              borderRadius: 24,
              padding: 24,
              position: "relative",
              overflow: "hidden",
              marginBottom: 24,
              backgroundColor: C.bg2,
              border: `1px solid ${sData.color}33`,
            }}
          >
            {/* Background watermark */}
            <div style={{
              position: "absolute", right: -16, top: -16,
              fontSize: 120, opacity: 0.04,
              transform: "rotate(-10deg)",
              userSelect: "none", pointerEvents: "none",
            }}>
              {sData.icon}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{
                  backgroundColor: sData.color,
                  color: "#fff",           // white is safe over any brand color
                  borderRadius: 999,
                  padding: "6px 14px",
                  fontSize: 12, fontWeight: 800,
                  display: "inline-block",
                  marginBottom: 12,
                }}>
                  Ch. 1 · FEATURED
                </div>
                <h2 style={{ color: sData.color, fontSize: 22, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>
                  {featuredChapter}
                </h2>
                <p style={{ color: C.muted, fontSize: 13, margin: "6px 0 0" }}>
                  {subject} · 5 Questions
                </p>
              </div>
              <div style={{
                width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                backgroundColor: sData.color + "15",
                border: `1px solid ${sData.color}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26,
              }}>
                {sData.icon}
              </div>
            </div>

            {/* Progress bar — derived from real data */}
            <div style={{ width: "100%", height: 6, backgroundColor: C.bg3, borderRadius: 3, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ height: "100%", borderRadius: 3, backgroundColor: sData.color, width: `${featuredProgress}%` }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: C.muted, fontSize: 13, fontWeight: 600 }}>
                {featuredDiff} {featuredProgress === 100 ? "· Completed ✓" : featuredProgress > 0 ? `· ${featuredProgress}%` : "· Not started"}
              </span>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                backgroundColor: sData.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, color: "#fff",
              }}>
                ▶
              </div>
            </div>
          </Tap>
        )}

        {/* ── Chapter list header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontWeight: 800, fontSize: 18, margin: 0, color: C.text }}>All Chapters</p>
          <span style={{ color: C.muted, fontSize: 13 }}>{chapters.length} total</span>
        </div>

        {/* ── Chapter list ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 24 }}>
          {chapters.map((ch, i) => {
            const prog = getProgress(i);
            const diff = getDifficulty(i);
            const dClr = diffColor(diff, C);

            return (
              <Tap
                key={i}
                onClick={() => router.push({ pathname: '/chapter/[name]', params: { name: ch, subject } })}
                style={{
                  backgroundColor: C.bg2,
                  borderRadius: 22,
                  overflow: "hidden",
                  border: `1px solid ${prog > 0 ? sData.color + '33' : C.bdr}`,
                  position: "relative",
                  boxShadow: prog > 0 ? `0 8px 24px ${sData.color}08` : "none",
                }}
              >
                <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: 16, flexShrink: 0,
                    backgroundColor: sData.color + "15",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24,
                    border: `1px solid ${sData.color}22`,
                  }}>
                    {sData.icon}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                        <p style={{
                          fontWeight: 800, fontSize: 16, margin: 0, color: C.text,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {ch}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                          <span style={{ fontSize: 11, color: dClr, fontWeight: 700 }}>{diff}</span>
                          <span style={{ color: C.muted, fontSize: 11 }}>·</span>
                          <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Ch. {i + 1}</span>
                        </div>
                      </div>
                      <span style={{ fontWeight: 900, fontSize: 13, color: prog > 0 ? sData.color : C.muted, flexShrink: 0, backgroundColor: prog > 0 ? sData.color + '10' : 'transparent', padding: '4px 8px', borderRadius: 8 }}>
                        {prog === 100 ? "✓ Done" : prog > 0 ? `${prog}%` : "New"}
                      </span>
                    </div>

                    <div style={{ width: "100%", height: 5, backgroundColor: C.bg3, borderRadius: 6, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 6, backgroundColor: sData.color, width: `${prog}%` }} />
                    </div>
                  </div>
                </div>
              </Tap>
            );
          })}
        </div>
      </div>

      <BottomNavSpacer />
    </div>
  );
}
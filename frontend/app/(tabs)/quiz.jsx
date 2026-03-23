import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search } from 'lucide-react';
import { useTheme } from "../../src/hooks";
import { Tap } from "../../src/components";
import { makeSubjects, CHAPTERS } from "../../src/assets/data";

export default function QuizTabScreen() {
  const router = useRouter();
  const { theme: C } = useTheme();
  const SUBJECTS = makeSubjects(C);

  const [cls, setCls] = useState("All");
  const [subject, setSubject] = useState("Maths");

  const sData = SUBJECTS.find(s => s.name === subject) || SUBJECTS[0];
  const chapters = CHAPTERS[subject] || CHAPTERS.Maths;

  const progArr = [100, 60, 30, 0, 0, 0, 0, 0, 0];
  const diffArr = ["🟢 Spark", "🟡 Blaze", "🔴 Inferno", "🟢 Spark", "🟡 Blaze", "🔴 Inferno", "🟢 Spark", "🟡 Blaze", "🔴 Inferno"];

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh", paddingBottom: 160 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "48px 24px 16px", borderBottom: `1px solid ${C.bdr}`, position: "sticky", top: 0, backgroundColor: C.bg, zIndex: 10 }}>
        <Tap onClick={() => router.push('/(tabs)')} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: C.bg2, border: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft size={20} color={C.text} strokeWidth={2} />
        </Tap>
        <div style={{ textAlign: "center", position: "relative" }}>
          <h1 style={{ fontWeight: 900, fontSize: 20, margin: 0, color: C.text }}>{sData.icon} {subject}</h1>
          <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>{chapters.length} chapters available</p>
          <select
            value={subject}
            onChange={e => setSubject(e.target.value)}
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
          >
            {SUBJECTS.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
          </select>
        </div>
        <Tap style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: C.bg2, border: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Search size={20} color={C.text} strokeWidth={1.8} />
        </Tap>
      </div>

      <div style={{ display: "flex", overflowX: "auto", gap: 10, padding: "16px 24px 8px" }}>
        {["All", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"].map(c => (
          <Tap key={c} onClick={() => setCls(c)}
            style={{
              padding: "10px 20px", borderRadius: 999, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
              border: `1px solid ${cls === c ? sData.color : C.bdr}`,
              backgroundColor: cls === c ? sData.color : C.bg2,
              color: cls === c ? C.bg : C.text
            }}>
            {c}
          </Tap>
        ))}
      </div>

      <div style={{ padding: "24px 24px 0" }}>
        <Tap onClick={() => router.push({ pathname: '/chapter/[name]', params: { name: chapters[0], subject } })}
          style={{
            borderRadius: 24, padding: 24, position: "relative", overflow: "hidden", marginBottom: 24,
            backgroundColor: C.bg2, border: `1px solid ${sData.color}33`
          }}>
          <div style={{ position: "absolute", right: -16, top: -16, fontSize: 120, opacity: 0.04, transform: "rotate(-10deg)", userSelect: "none", pointerEvents: "none" }}>{sData.icon}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ backgroundColor: sData.color, color: C.bg, borderRadius: 999, padding: "6px 14px", fontSize: 12, fontWeight: 800, display: "inline-block", marginBottom: 12 }}>Ch. 1 · FEATURED</div>
              <h2 style={{ color: sData.color, fontSize: 24, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>{chapters[0]}</h2>
              <p style={{ color: C.muted, fontSize: 13, margin: "6px 0 0" }}>{subject} · Class 9 · 5 Questions</p>
            </div>
            <div style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: sData.color + "15", border: `1px solid ${sData.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{sData.icon}</div>
          </div>
          <div style={{ width: "100%", height: 6, backgroundColor: C.bg3, borderRadius: 3, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ height: "100%", borderRadius: 3, backgroundColor: sData.color, width: "100%" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: C.muted, fontSize: 13, fontWeight: 600 }}>🟢 Spark · Completed ✓</span>
            <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: sData.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: C.bg }}>▶</div>
          </div>
        </Tap>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontWeight: 800, fontSize: 18, margin: 0, color: C.text }}>All Chapters</p>
          <span style={{ color: C.muted, fontSize: 13 }}>{chapters.length} total</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 24 }}>
          {chapters.map((ch, i) => {
            const prog = progArr[i] || 0;
            const diff = diffArr[i];
            const diffClr = diff.includes("Spark") ? C.ok : diff.includes("Blaze") ? C.hi : C.danger;

            return (
              <Tap key={i} onClick={() => router.push({ pathname: '/chapter/[name]', params: { name: ch, subject } })}
                style={{ backgroundColor: C.bg2, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.bdr}`, position: "relative" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, backgroundColor: prog > 0 ? sData.color : C.bg3 }} />
                <div style={{ padding: "16px 20px 16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, backgroundColor: sData.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{sData.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                        <p style={{ fontWeight: 800, fontSize: 15, margin: 0, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                          <span style={{ fontSize: 11, color: diffClr, fontWeight: 700 }}>{diff}</span>
                          <span style={{ color: C.muted }}>·</span>
                          <span style={{ fontSize: 11, color: C.muted }}>Ch. {i + 1}</span>
                        </div>
                      </div>
                      <span style={{ fontWeight: 900, fontSize: 14, color: prog > 0 ? sData.color : C.muted, flexShrink: 0 }}>
                        {prog === 100 ? "✓ Done" : prog > 0 ? `${prog}%` : "New"}
                      </span>
                    </div>
                    <div style={{ width: "100%", height: 4, backgroundColor: C.bg3, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 2, backgroundColor: sData.color, width: `${prog}%` }} />
                    </div>
                  </div>
                </div>
              </Tap>
            );
          })}
        </div>
      </div>
    </div>
  );
}

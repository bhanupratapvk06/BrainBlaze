import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from "../../src/contexts";
import { Tap } from "../../src/components";

export default function OnboardingNameScreen() {
  const router = useRouter();
  const { theme: C, isDark } = useTheme();
  const [name, setName] = useState('');

  const onNext = () => {
    router.push({ pathname: '/(onboarding)/class', params: { name: name.trim() || 'Student' } });
  };

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: C.bg, display: "flex", flexDirection: "column",
      background: isDark ? `linear-gradient(180deg, ${C.bg2} 0%, ${C.bg} 100%)` : `linear-gradient(180deg, ${C.bg3} 0%, ${C.bg} 100%)`
    }}>
      <div style={{ height: "55vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div style={{
          position: "absolute", width: 260, height: 260, borderRadius: "50%",
          background: `radial-gradient(circle,${C.acc}15 0%,transparent 70%)`, filter: "blur(30px)"
        }} />
        <svg width="220" height="220" viewBox="0 0 220 200" fill="none">
          <ellipse cx="110" cy="80" rx="62" ry="68" fill={C.bg3} />
          <ellipse cx="110" cy="80" rx="62" ry="68" fill="url(#brainGrad)" />
          <path d="M80 55 Q95 42 110 55 Q125 42 140 55" stroke={C.muted} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M72 72 Q85 60 98 72 Q111 60 124 72 Q137 60 148 72" stroke={C.muted} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <circle cx="106" cy="145" r="10" fill={C.acc} />
          <path d="M90 148 Q88 165 80 175" stroke={C.acc} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M110 152 Q110 170 108 182" stroke={C.acc} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M130 148 Q134 162 142 174" stroke={C.acc} strokeWidth="3" fill="none" strokeLinecap="round" />
          <defs>
            <radialGradient id="brainGrad" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor={C.bdr2} />
              <stop offset="100%" stopColor={C.bg2} />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <div style={{ flex: 1, padding: "0 32px 110px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <h1 style={{ fontWeight: 900, fontSize: 36, color: C.text, lineHeight: 1.1, margin: "0 0 16px", textAlign: "left" }}>
          Learn New<br />Ways of Thinking
        </h1>
        <p style={{ color: C.muted, fontSize: 16, fontWeight: 500, margin: "0 0 32px", textAlign: "left" }}>What should we call you?</p>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter your name..."
          onKeyDown={e => e.key === "Enter" && name.trim() && onNext()}
          style={{
            width: "100%", backgroundColor: C.bg3, border: `1px solid ${C.bdr}`,
            borderRadius: 16, padding: "20px", color: C.text, fontSize: 18, outline: "none", fontFamily: "inherit", caretColor: C.acc, boxSizing: "border-box"
          }}
        />
      </div>
      <div style={{
        position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)",
        width: "calc(100% - 64px)", maxWidth: 416, display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <Tap onClick={onNext} style={{ color: C.muted, fontSize: 15, fontWeight: 700 }}>Skip</Tap>
        <Tap onClick={() => name.trim() && onNext()}
          style={{
            backgroundColor: name.trim() ? C.acc : C.bg3, color: name.trim() ? C.onAcc : C.muted,
            borderRadius: 999, padding: "18px 32px", fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", gap: 8
          }}>
          Explore <span style={{ fontSize: 18 }}>›</span>
        </Tap>
      </div>
    </div>
  );
}

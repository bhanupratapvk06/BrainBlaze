import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme, useAuth } from "../../src/contexts";
import { Tap } from "../../src/components";

export default function OnboardingClassScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const name = params.name || 'Student';

  const { theme: C, isDark } = useTheme();
  const { login } = useAuth();

  const [cls, setCls] = useState('');

  const onNext = async () => {
    if (cls) {
      // Save locally to bypass auth for MVP
      await login(name, cls);
      // AuthContext will trigger layout redirect via useEffect in _layout.jsx
      // but we can manually push just in case
      router.replace('/(tabs)');
    }
  };

  const onBack = () => {
    router.back();
  };

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: C.bg, display: "flex", flexDirection: "column",
      background: isDark ? `linear-gradient(180deg, ${C.bg2} 0%, ${C.bg} 50%)` : `linear-gradient(180deg, ${C.bg3} 0%, ${C.bg} 50%)`
    }}>
      <div style={{ height: "50vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div style={{
          position: "absolute", width: 240, height: 240, borderRadius: "50%",
          background: `radial-gradient(circle,${C.acc}15 0%,transparent 70%)`, filter: "blur(30px)"
        }} />
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="80" fill={C.bg3} stroke={C.bdr} strokeWidth="1" />
          <rect x="44" y="48" width="112" height="120" rx="16" fill={C.bg2} stroke={C.bdr2} strokeWidth="2" />
          <rect x="62" y="70" width="76" height="8" rx="4" fill={C.acc} />
          <rect x="62" y="86" width="54" height="6" rx="3" fill={C.muted} fillOpacity="0.4" />
          <rect x="62" y="98" width="64" height="6" rx="3" fill={C.muted} fillOpacity="0.4" />
          <rect x="62" y="116" width="32" height="32" rx="8" fill={C.acc} fillOpacity="0.15" stroke={C.acc} strokeWidth="1.5" />
          <path d="M68 132 L74 138 L84 126" stroke={C.acc} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ flex: 1, padding: "0 32px 110px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <h1 style={{ fontWeight: 900, fontSize: 34, color: C.text, lineHeight: 1.2, margin: "0 0 12px", textAlign: "left" }}>
          Almost there,<br /><span style={{ color: C.acc }}>{name}!</span> 👋
        </h1>
        <p style={{ color: C.muted, fontSize: 16, fontWeight: 500, margin: "0 0 24px", textAlign: "left" }}>Which class are you in?</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {[6, 7, 8, 9, 10, 11, 12].map(c => (
            <Tap key={c} onClick={() => setCls(`${c}`)}
              style={{
                padding: "12px 24px", borderRadius: 999, fontSize: 15, fontWeight: 700,
                backgroundColor: cls === `${c}` ? C.acc : C.bg3,
                border: `1px solid ${cls === `${c}` ? C.acc : C.bdr}`,
                color: cls === `${c}` ? C.onAcc : C.text
              }}>
              Class {c}
            </Tap>
          ))}
        </div>
      </div>
      <div style={{
        position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)",
        width: "calc(100% - 64px)", maxWidth: 416, display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <Tap onClick={onBack} style={{ color: C.muted, fontSize: 15, fontWeight: 700 }}>Back</Tap>
        <Tap onClick={() => cls && onNext()}
          style={{
            backgroundColor: cls ? C.acc : C.bg3, color: cls ? C.onAcc : C.muted,
            borderRadius: 999, padding: "18px 32px", fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", gap: 8
          }}>
          Start Learning <span style={{ fontSize: 18 }}>›</span>
        </Tap>
      </div>
    </div>
  );
}

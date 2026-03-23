import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react';
import { useAuth, useTheme, useXP } from '../src/hooks';
import { Tap, ToastNotification } from '../src/components';
import { SHOP } from '../src/assets/data';

export default function ShopScreen() {
  const router = useRouter();
  const { theme: C } = useTheme();
  const { user, handleCosmeticPurchase, equipCosmetic } = useAuth();

  const xpBalance = user?.xpBalance || 0;
  const ownedCosmetics = user?.cosmetics?.owned || ["student", "white", "plain", "none"];
  const equippedCosmetics = user?.cosmetics?.equipped || { shape: "student", color: "white", background: "plain", frame: "none" };

  const [tab, setTab] = useState("shape");
  const [toast, setToast] = useState(null);
  const items = SHOP[tab] || [];

  const purchase = async (item) => {
    if (ownedCosmetics.includes(item.id)) {
      await equipCosmetic(tab, item.id);
      setToast({ msg: `${item.name} equipped ✓`, color: C.ok });
    } else if (xpBalance >= item.cost) {
      await handleCosmeticPurchase(item);
      await equipCosmetic(tab, item.id);
      setToast({ msg: `${item.name} unlocked! ✨`, color: C.acc });
    } else {
      setToast({ msg: `Need ${item.cost - xpBalance} more XP`, color: C.danger });
    }
  };

  const curShape = SHOP.shape.find(s => s.id === equippedCosmetics.shape);

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh", paddingBottom: 160 }}>
      {toast && <ToastNotification msg={toast.msg} color={toast.color} onClose={() => setToast(null)} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "48px 24px 16px", borderBottom: `1px solid ${C.bdr}`, position: "sticky", top: 0, backgroundColor: C.bg, zIndex: 10 }}>
        <Tap onClick={() => router.back()} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: C.bg2, border: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft size={20} color={C.text} strokeWidth={2} />
        </Tap>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontWeight: 900, fontSize: 18, margin: 0, color: C.text }}>Avatar Shop 🎓</h1>
          <p style={{ color: C.muted, fontSize: 11, margin: "2px 0 0" }}>Spending XP doesn't lower Rank</p>
        </div>
        <span style={{ backgroundColor: C.hi + "15", border: `1px solid ${C.hi}33`, borderRadius: 999, padding: "6px 12px", fontSize: 13, fontWeight: 800, color: C.hi }}>💰 {xpBalance}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 0 24px" }}>
        <div style={{ width: 96, height: 96, borderRadius: 28, border: `2px solid ${C.acc}`, backgroundColor: C.bg2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, boxShadow: `0 10px 30px rgba(0,0,0,0.4)` }}>{curShape?.icon || "🧑‍🎓"}</div>
        <p style={{ color: C.text, fontSize: 14, fontWeight: 800, marginTop: 12 }}>Your Avatar</p>
      </div>

      <div style={{ display: "flex", overflowX: "auto", gap: 10, padding: "0 24px 24px" }}>
        {["shape", "color", "background", "frame"].map(t => (
          <Tap key={t} onClick={() => setTab(t)} style={{ padding: "10px 20px", borderRadius: 999, fontSize: 13, fontWeight: 800, whiteSpace: "nowrap", border: `1px solid ${tab === t ? C.acc : C.bdr}`, backgroundColor: tab === t ? C.acc : C.bg2, color: tab === t ? C.bg : C.text, textTransform: "capitalize" }}>{t}</Tap>
        ))}
      </div>

      <div style={{ padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {items.map(item => {
          const owned = ownedCosmetics.includes(item.id), equipped = equippedCosmetics[tab] === item.id, canAfford = xpBalance >= item.cost;
          return (
            <div key={item.id} style={{ backgroundColor: C.bg2, borderRadius: 20, padding: 16, border: `${equipped ? 2 : 1}px solid ${equipped ? C.ok : C.bdr}` }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: C.bg3, border: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                {tab === "shape" ? <span style={{ fontSize: 32 }}>{item.icon}</span> : tab === "color" ? <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: item.hex }} /> : <span style={{ fontSize: 26 }}>✨</span>}
              </div>
              <p style={{ fontWeight: 800, fontSize: 14, textAlign: "center", margin: "0 0 8px", color: C.text }}>{item.name}</p>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                {item.cost === 0
                  ? <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 999, backgroundColor: C.ok + "15", color: C.ok }}>FREE</span>
                  : <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 999, backgroundColor: C.hi + "15", color: C.hi }}>💎 {item.cost}</span>}
              </div>
              <Tap onClick={() => purchase(item)} disabled={!owned && !canAfford}
                style={{
                  display: "block", width: "100%", padding: "12px 0", borderRadius: 14, fontSize: 13, fontWeight: 800, textAlign: "center",
                  border: `1px solid ${equipped ? C.ok : owned ? C.bdr : canAfford ? C.acc : C.bdr}`,
                  backgroundColor: equipped ? C.ok : owned ? "transparent" : canAfford ? C.acc : C.bg3,
                  color: equipped ? C.bg : owned ? C.text : canAfford ? C.bg : C.muted, boxSizing: "border-box"
                }}>
                {equipped ? "Equipped ✓" : owned ? "Equip" : "Purchase"}
              </Tap>
            </div>
          );
        })}
      </div>
    </div>
  );
}

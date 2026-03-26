import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react';
import { useAuth, useTheme } from '../src/hooks';
import { Tap, ToastNotification } from '../src/components';
import { SHOP } from '../src/assets/data';
import { shopApi } from '../src/api/shopApi';


// ─── constants ───────────────────────────────────────────────────────────────

const TABS = ["shape", "color", "background", "frame"];

// Per-tab preview renderer — gives each category a meaningful visual
const ItemPreview = ({ item, tab }) => {
  switch (tab) {
    case "shape":
      return <span style={{ fontSize: 32 }}>{item.icon}</span>;
    case "color":
      return (
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          backgroundColor: item.hex,
          border: "1px solid rgba(0,0,0,0.08)",
        }} />
      );
    case "background":
      return (
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          backgroundColor: item.hex ?? item.color ?? "transparent",
          border: "1px solid rgba(0,0,0,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20,
        }}>
          {item.icon ?? null}
        </div>
      );
    case "frame":
      return (
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: `3px solid ${item.hex ?? item.color ?? "#ccc"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
        }}>
          {item.icon ?? "🖼"}
        </div>
      );
    default:
      return <span style={{ fontSize: 26 }}>✨</span>;
  }
};

// ─── component ───────────────────────────────────────────────────────────────

export default function ShopScreen() {
  const router = useRouter();
  const { theme: C } = useTheme();
  const { user, handleCosmeticPurchase, equipCosmetic } = useAuth();

  const [tab, setTab] = useState("shape");
  const [toast, setToast] = useState(null);
  const [serverShop, setServerShop] = useState(null);

  // ── Load live shop items from backend on mount ───────────────────────────
  useEffect(() => {
    let cancelled = false;
    shopApi.getItems()
      .then(res => { if (!cancelled) setServerShop(res); })
      .catch(e => console.warn('[shop] Failed to load live items (offline?):', e.message));
    return () => { cancelled = true; };
  }, []);

  // ── Merge server data with local SHOP catalogue ──────────────────────────
  const xpBalance = serverShop?.xpBalance ?? user?.xpBalance ?? 0;

  // Build owned/equipped sets from server or user context
  const { ownedSet, equippedCosmetics } = useMemo(() => {
    const ownedSet = new Set(['student', 'white', 'plain', 'none']);
    const eq = { shape: 'student', color: 'white', background: 'plain', frame: 'none' };

    if (serverShop?.categories) {
      Object.entries(serverShop.categories).forEach(([cat, items]) => {
        items.forEach(item => {
          if (item.owned)    ownedSet.add(item.id);
          if (item.equipped) eq[cat] = item.id;
        });
      });
    } else if (user?.ownedCosmetics) {
      user.ownedCosmetics.forEach(id => ownedSet.add(id));
      Object.assign(eq, user.equippedCosmetics ?? {});
    }

    return { ownedSet, equippedCosmetics: eq };
  }, [serverShop, user]);

  const items = SHOP[tab] ?? [];
  const curShape = SHOP.shape.find(s => s.id === equippedCosmetics.shape);

  const purchase = async (item) => {
    const owned     = ownedSet.has(item.id);
    const canAfford = xpBalance >= item.cost;

    if (owned || item.cost === 0) {
      await equipCosmetic(tab, item.id);
      setToast({ msg: `${item.name} equipped ✓`, color: C.ok });
    } else if (canAfford) {
      const ok = await handleCosmeticPurchase(item);
      if (ok) {
        setToast({ msg: `${item.name} unlocked! ✨`, color: C.acc });
        // Refresh live shop data
        shopApi.getItems().then(res => setServerShop(res)).catch(() => {});
      } else {
        setToast({ msg: "Purchase failed — try again", color: C.danger });
      }
    } else {
      setToast({ msg: `Need ${item.cost - xpBalance} more XP`, color: C.danger });
    }
  };


  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh", paddingBottom: 40 }}>
      {toast && (
        <ToastNotification
          msg={toast.msg}
          color={toast.color}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Header ── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "48px 24px 16px",
        borderBottom: `1px solid ${C.bdr}`,
        position: "sticky", top: 0,
        backgroundColor: C.bg, zIndex: 10,
      }}>
        <Tap
          onClick={() => router.back()}
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
          <h1 style={{ fontWeight: 900, fontSize: 18, margin: 0, color: C.text }}>
            Avatar Shop 🎓
          </h1>
          <p style={{ color: C.muted, fontSize: 11, margin: "2px 0 0" }}>
            Spending XP doesn't lower Rank
          </p>
        </div>

        {/* XP balance — consistent with rest of codebase */}
        <span style={{
          backgroundColor: C.hi + "15",
          border: `1px solid ${C.hi}33`,
          borderRadius: 999, padding: "6px 12px",
          fontSize: 13, fontWeight: 800, color: C.hi,
          flexShrink: 0,
        }}>
          💰 {xpBalance.toLocaleString()}
        </span>
      </div>

      {/* ── Avatar preview — reflects active tab ── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 0 24px" }}>
        <div style={{
          width: 96, height: 96, borderRadius: 28,
          border: `2px solid ${C.acc}`,
          backgroundColor: C.bg2,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 48,
        }}>
          {curShape?.icon ?? "🧑‍🎓"}
        </div>
        <p style={{ color: C.muted, fontSize: 13, fontWeight: 700, marginTop: 10 }}>
          Your Avatar · Tap any item to preview
        </p>
      </div>

      {/* ── Category tabs ── */}
      <div style={{ display: "flex", overflowX: "auto", gap: 10, padding: "0 24px 24px" }}>
        {TABS.map(t => (
          <Tap
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "10px 20px", borderRadius: 999,
              fontSize: 13, fontWeight: 800, whiteSpace: "nowrap",
              border: `1px solid ${tab === t ? C.acc : C.bdr}`,
              backgroundColor: tab === t ? C.acc : C.bg2,
              color: tab === t ? C.bg : C.text,
              textTransform: "capitalize",
            }}
          >
            {t}
          </Tap>
        ))}
      </div>

      {/* ── Item grid ── */}
      <div style={{ padding: "0 24px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {items.map(item => {
          const owned = ownedSet.has(item.id);
          const equipped = equippedCosmetics[tab] === item.id;
          const canAfford = xpBalance >= item.cost;

          return (
            <div
              key={item.id}
              style={{
                backgroundColor: C.bg2,
                borderRadius: 16,
                padding: 12,
                border: `${equipped ? 2 : 1}px solid ${equipped ? C.ok : C.bdr}`,
              }}
            >
              {/* Preview — rounded square instead of circle, smaller */}
              <div style={{
                width: 48, height: 48,
                borderRadius: 14,              // square feels more app-native
                backgroundColor: C.bg3,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 10px",
              }}>
                <ItemPreview item={item} tab={tab} />
              </div>

              {/* Name + price on the same row — eliminates a stacked element */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <p style={{ fontWeight: 800, fontSize: 13, margin: 0, color: C.text }}>
                  {item.name}
                </p>
                {item.cost === 0 ? (
                  <span style={{
                    fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999,
                    backgroundColor: C.ok + "15", color: C.ok,
                  }}>
                    FREE
                  </span>
                ) : (
                  <span style={{
                    fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999,
                    backgroundColor: C.hi + "15", color: C.hi,
                  }}>
                    💎 {item.cost.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Action button */}
              <Tap
                onClick={() => purchase(item)}
                style={{
                  display: "block", width: "100%", boxSizing: "border-box",
                  padding: "9px 0", borderRadius: 10,
                  fontSize: 12, fontWeight: 800, textAlign: "center",
                  border: `1px solid ${equipped ? C.ok : owned ? C.bdr : canAfford ? C.acc : C.bdr}`,
                  backgroundColor: equipped ? C.ok : owned ? C.bg2 : canAfford ? C.acc : C.bg3,
                  color: equipped ? "#fff" : owned ? C.text : canAfford ? "#fff" : C.muted,
                  opacity: !owned && !canAfford ? 0.5 : 1,
                }}
              >
                {equipped ? "Equipped ✓" : owned ? "Equip" : canAfford ? "Purchase" : "Can't afford"}
              </Tap>
            </div>
          );
        })}
      </div>
    </div>
  );
}
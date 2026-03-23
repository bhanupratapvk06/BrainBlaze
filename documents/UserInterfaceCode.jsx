import React, { useState, useEffect, useCallback } from "react";
import {
    Home, Zap, BookOpen, Trophy, User, Bell, ArrowLeft, X,
    CheckCircle, XCircle, Clock, Target, Award, Flame,
    Shield, Snowflake, Lightbulb, Bot, Swords, RefreshCw,
    Share2, Search
} from "lucide-react";

/* ─────────────────────────────────────────
   THEME SYSTEM
───────────────────────────────────────── */
const DARK_THEME = {
    isDark: true,
    bg: "#1A1C1E",        // Deep Charcoal (Primary Background)
    bg2: "#212427",       // Off-Black / Navy (Card Backgrounds)
    bg3: "#2A2D31",       // Lighter Navy (Nested elements/Inputs)
    bg4: "#33373B",       // Borders/Hover states
    acc: "#A8DAB5",       // Mint Green (Primary Action/Positive)
    hi: "#E8D5C4",        // Peach / Tan (Warmth/Secondary accents)
    sec: "#D4C5E2",       // Soft Lavender (Secondary cards/Distinction)
    text: "#FFFFFF",      // Pure White (Headings/Currency)
    textSub: "#D4C5E2",   // Lavender Tinted White
    muted: "#71767B",     // Muted Slate (Secondary text/Labels)
    onAcc: "#1A1C1E",     // Charcoal on Mint Green
    onSec: "#1A1C1E",     // Charcoal on Lavender
    bdr: "#2A2D31",       // Subtle border
    bdr2: "#33373B",      // Emphasized border
    ok: "#A8DAB5",        // Mint Green
    danger: "#FF8A8A",    // Soft Red (Harmonized with pastel dark UI)
    overlay: "rgba(26,28,30,0.85)",
    glass: "rgba(33,36,39,0.85)",
    glassBdr: "rgba(168,218,181,0.15)",
    inputBg: "#1A1C1E",
    teal: "#A8DAB5", pri: "#D4C5E2", lime: "#E8D5C4", sec2: "#E8D5C4",
    card: "#212427", card2: "#2A2D31", olive: "#71767B",
    sMaths: "#A8DAB5", sSci: "#D4C5E2", sEng: "#E8D5C4",
    sHist: "#FFC2A6", sComp: "#B8E0D2", sArt: "#E2C3F0",
};

const LIGHT_THEME = {
    isDark: false,
    bg: "#F8F9FA", bg2: "#FFFFFF", bg3: "#F1F3F5", bg4: "#E9ECEF",
    acc: "#7CB38D", hi: "#D6A982", sec: "#A792C1",
    text: "#1A1C1E", textSub: "#495057", muted: "#71767B",
    onAcc: "#FFFFFF", onSec: "#FFFFFF",
    bdr: "#E9ECEF", bdr2: "#DEE2E6",
    ok: "#7CB38D", danger: "#E06B6B",
    overlay: "rgba(26,28,30,0.6)",
    glass: "rgba(255,255,255,0.85)",
    glassBdr: "rgba(124,179,141,0.2)",
    inputBg: "#F1F3F5",
    teal: "#7CB38D", pri: "#A792C1", lime: "#D6A982", sec2: "#A792C1",
    card: "#FFFFFF", card2: "#F1F3F5", olive: "#71767B",
    sMaths: "#7CB38D", sSci: "#A792C1", sEng: "#D6A982",
    sHist: "#E08A8A", sComp: "#7FB5A8", sArt: "#B892C8",
};

const norm = s => String(s || "").toLowerCase().trim().replace(/\s+/g, " ").replace(/[^a-z0-9\s\-']/g, "");

const QUIZ = {
    Maths: [
        { q: "Degree of 3x²+2x+1?", type: "mcq", options: ["1", "2", "3", "0"], correct: 1, exp: "Highest power of x is 2." },
        { q: "Solve: 2x + 5 = 13", type: "mcq", options: ["x=3", "x=4", "x=5", "x=6"], correct: 1, exp: "2x=8 → x=4." },
        { q: "Area of circle r=7 (π=22/7)?", type: "fill", correct: "154", exp: "πr²=(22/7)×49=154" },
        { q: "HCF of 12 and 18?", type: "mcq", options: ["6", "3", "9", "12"], correct: 0, exp: "Largest common factor is 6." },
        { q: "√144 = ?", type: "fill", correct: "12", exp: "12×12=144." },
    ],
    Science: [
        { q: "Powerhouse of the cell?", type: "mcq", options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi"], correct: 1, exp: "Mitochondria generates ATP." },
        { q: "Newton's 2nd Law?", type: "mcq", options: ["F=mv", "F=ma", "F=m/a", "F=v/t"], correct: 1, exp: "F = ma." },
        { q: "Chemical formula of water?", type: "fill", correct: "H2O", exp: "Two H + one O." },
        { q: "Gas absorbed in photosynthesis?", type: "mcq", options: ["O₂", "N₂", "CO₂", "H₂"], correct: 2, exp: "Plants absorb CO₂." },
        { q: "Speed of light (×10⁸ m/s)?", type: "fill", correct: "3", exp: "3×10⁸ m/s." },
    ],
    History: [
        { q: "First Maurya ruler?", type: "mcq", options: ["Ashoka", "Chandragupta", "Bindusara", "Harsha"], correct: 1, exp: "Chandragupta Maurya, 321 BCE." },
        { q: "India's independence year?", type: "mcq", options: ["1945", "1947", "1950", "1942"], correct: 1, exp: "Aug 15, 1947." },
        { q: "Quit India Movement year?", type: "fill", correct: "1942", exp: "Aug 8, 1942." },
        { q: "Who wrote Discovery of India?", type: "mcq", options: ["Gandhi", "Nehru", "Bose", "Patel"], correct: 1, exp: "Jawaharlal Nehru." },
        { q: "Akbar's capital?", type: "mcq", options: ["Lahore", "Agra", "Delhi", "Fatehpur Sikri"], correct: 3, exp: "Fatehpur Sikri." },
    ],
};
["English", "Computer", "Art"].forEach(s => { QUIZ[s] = QUIZ.Science; });

const CHAPTERS = {
    Maths: ["Number Systems", "Polynomials", "Coordinate Geometry", "Linear Equations", "Triangles", "Circles", "Surface Areas", "Statistics", "Probability"],
    Science: ["Matter", "Pure Substances", "Atoms & Molecules", "Structure of Atom", "Cell — Unit of Life", "Tissues", "Motion", "Force & Laws", "Gravitation"],
    History: ["French Revolution", "Socialism in Europe", "Nazism", "Forest Society", "Pastoralists", "Peasants", "History & Sport", "Clothing"],
    English: ["The Fun They Had", "Sound of Music", "The Little Girl", "A Truly Beautiful Mind", "Snake & Mirror", "My Childhood", "Packing", "Reach for the Top"],
    Computer: ["Intro to IT", "Fundamentals", "Internet Basics", "MS Office", "Programming", "Database Intro", "Cybersecurity", "Networking"],
    Art: ["Drawing Basics", "Color Theory", "Sketching", "Perspective", "Portraits", "Landscapes", "Abstract Art", "Digital Art"],
};

const makeSubjects = C => [
    { name: "Maths", icon: "📐", color: C.sMaths, pct: 72, ch: "Ch.4 Quadratics" },
    { name: "Science", icon: "🔬", color: C.sSci, pct: 45, ch: "Ch.2 Photosynthesis" },
    { name: "English", icon: "📖", color: C.sEng, pct: 88, ch: "Ch.6 Grammar" },
    { name: "History", icon: "🌍", color: C.sHist, pct: 30, ch: "Ch.1 Ancient India" },
    { name: "Computer", icon: "💻", color: C.sComp, pct: 55, ch: "Ch.3 Internet" },
    { name: "Art", icon: "🎨", color: C.sArt, pct: 20, ch: "Ch.1 Drawing" },
];

const LB_DATA = [
    { name: "Priya Sharma", av: "🐱", xp: 3200, cls: "Class 9" },
    { name: "Rahul Verma", av: "🦊", xp: 2850, cls: "Class 9" },
    { name: "Amit Singh", av: "🐼", xp: 2640, cls: "Class 9" },
    { name: "Sneha Patel", av: "🐯", xp: 2500, cls: "Class 9" },
    { name: "Karan Mehta", av: "🐸", xp: 2100, cls: "Class 10" },
    { name: "Neha Gupta", av: "🐻", xp: 1950, cls: "Class 9" },
    { name: "Vikram Rao", av: "🦁", xp: 1800, cls: "Class 10" },
    { name: "Pooja Das", av: "🐨", xp: 1600, cls: "Class 9" },
    { name: "Rohan Jha", av: "🐷", xp: 1500, cls: "Class 9" },
].sort((a, b) => b.xp - a.xp);

const NOTIFS = [
    { id: 1, color: "#FF8A8A", title: "Don't break your streak!", desc: "Study 10 mins today.", time: "2m", unread: true },
    { id: 2, color: "#D4C5E2", title: "Science quiz is live", desc: "10 questions waiting!", time: "1h", unread: true },
    { id: 3, color: "#E8D5C4", title: "You entered Top 10! 🎉", desc: "Keep climbing.", time: "3h", unread: false },
    { id: 4, color: "#A8DAB5", title: "Double XP unlocked!", desc: "From 7-day streak.", time: "Yesterday", unread: false },
];

const SHOP = {
    shape: [{ id: "student", name: "Student", icon: "🧑‍🎓", cost: 0 }, { id: "scholar", name: "Scholar", icon: "👨‍💼", cost: 300 }, { id: "genius", name: "Genius", icon: "🧠", cost: 600 }, { id: "champion", name: "Champion", icon: "🏆", cost: 800 }],
    color: [{ id: "white", name: "White", hex: "#FFF", cost: 0 }, { id: "blue", name: "Blue", hex: "#B8E0D2", cost: 100 }, { id: "gold", name: "Peach", hex: "#E8D5C4", cost: 300 }, { id: "green", name: "Mint", hex: "#A8DAB5", cost: 500 }],
    background: [{ id: "plain", name: "Plain", cost: 0 }, { id: "grid", name: "Grid", cost: 400 }, { id: "gradient", name: "Gradient", cost: 800 }],
    frame: [{ id: "none", name: "None", cost: 0 }, { id: "thin", name: "Thin Ring", cost: 500 }, { id: "crown", name: "Crown", cost: 2500 }],
};

const press = {
    onMouseEnter: e => e.currentTarget.style.filter = "brightness(0.95)",
    onMouseLeave: e => { e.currentTarget.style.filter = "none"; e.currentTarget.style.transform = "scale(1)" },
    onMouseDown: e => e.currentTarget.style.transform = "scale(0.96)",
    onMouseUp: e => e.currentTarget.style.transform = "scale(1)",
};

const Tap = ({ onClick, style = {}, children, disabled = false }) => (
    <div onClick={disabled ? undefined : onClick} {...(disabled ? {} : press)}
        style={{ cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)", userSelect: "none", ...style }}>
        {children}
    </div>
);

const Toast = ({ msg, color, C }) => (
    <div style={{
        position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", zIndex: 400,
        backgroundColor: color || C.bg3, color: C.onAcc,
        padding: "12px 24px", borderRadius: 999, fontWeight: 700, fontSize: 14,
        boxShadow: "0 8px 30px rgba(0,0,0,0.3)", whiteSpace: "nowrap", animation: "fadeSlideDown 0.3s ease"
    }}>
        {msg}
    </div>
);

const AchOverlay = ({ data, onClose, C }) => {
    if (!data) return null;
    return (
        <div onClick={onClose} style={{
            position: "fixed", inset: 0, backgroundColor: C.overlay,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 300,
            maxWidth: 480, left: "50%", transform: "translateX(-50%)", animation: "fadeIn 0.25s ease"
        }}>
            <div onClick={e => e.stopPropagation()} style={{
                backgroundColor: C.bg2, borderRadius: 28,
                border: `1px solid ${C.bdr2}`, padding: 36, width: "100%", display: "flex", flexDirection: "column",
                alignItems: "center", textAlign: "center", animation: "scaleIn 0.28s ease",
                boxShadow: `0 20px 40px rgba(0,0,0,0.4)`
            }}>
                <div style={{ position: "relative", marginBottom: 16 }}>
                    <div style={{
                        width: 96, height: 96, backgroundColor: C.bg3, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48,
                        border: `2px solid ${C.bdr2}`
                    }}>💎</div>
                    <div style={{
                        position: "absolute", top: -6, right: -6, backgroundColor: C.sec, color: C.onSec,
                        fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 8
                    }}>#{data.rank || 10}</div>
                </div>
                <p style={{ color: C.muted, fontSize: 14, fontWeight: 700, margin: "0 0 6px" }}>520 XP</p>
                <h2 style={{ color: C.text, fontSize: 26, fontWeight: 900, margin: "0 0 12px" }}>{data.title || "New High Score! 🎉"}</h2>
                <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, margin: "0 0 32px" }}>{data.desc || "Keep rising."}</p>
                <Tap onClick={onClose} style={{
                    width: "100%", backgroundColor: C.acc, color: C.onAcc, borderRadius: 16,
                    padding: "16px", fontWeight: 800, fontSize: 16, textAlign: "center", marginBottom: 12
                }}>
                    Keep Playing
                </Tap>
                <Tap onClick={onClose} style={{
                    width: "100%", backgroundColor: C.bg3, borderRadius: 16,
                    padding: "16px", fontWeight: 700, fontSize: 15, textAlign: "center", color: C.text
                }}>
                    Share Score
                </Tap>
            </div>
        </div>
    );
};

const NotifPanel = ({ open, onClose, C }) => {
    if (!open) return null;
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", maxWidth: 480, left: "50%", transform: "translateX(-50%)" }}>
            <div style={{
                backgroundColor: C.bg2, borderBottom: `1px solid ${C.bdr}`, display: "flex", flexDirection: "column",
                height: "70vh", animation: "slideDown 0.3s ease", borderBottomLeftRadius: 24, borderBottomRightRadius: 24
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px", borderBottom: `1px solid ${C.bdr}` }}>
                    <span style={{ fontWeight: 800, fontSize: 20, color: C.text }}>Notifications</span>
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        <span style={{ color: C.muted, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Mark all read</span>
                        <Tap onClick={onClose} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, backgroundColor: C.bg3 }}>
                            <X size={18} color={C.muted} />
                        </Tap>
                    </div>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
                    {NOTIFS.map(n => (
                        <div key={n.id} style={{
                            display: "flex", alignItems: "center", gap: 16, padding: "16px 24px",
                            borderBottom: `1px solid ${C.bdr}`, backgroundColor: n.unread ? C.bg3 : "transparent",
                            borderLeft: `4px solid ${n.unread ? n.color : "transparent"}`
                        }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: "50%", backgroundColor: n.color,
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0
                            }}>
                                {n.id === 1 ? "🔥" : n.id === 2 ? "📝" : n.id === 3 ? "🏆" : "⚡"}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: 800, fontSize: 15, margin: "0 0 4px", color: n.unread ? C.text : C.muted }}>{n.title}</p>
                                <p style={{ color: C.muted, fontSize: 13, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.desc}</p>
                            </div>
                            <span style={{ color: C.muted, fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{n.time}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ flex: 1, backgroundColor: C.overlay }} onClick={onClose} />
        </div>
    );
};

const BottomNav = ({ page, nav, C }) => {
    const items = [
        { id: "dashboard", l: "Home", Icon: Home },
        { id: "browser", l: "Quiz", Icon: Zap },
        { id: "mistakebank", l: "Mistakes", Icon: BookOpen },
        { id: "leaderboard", l: "Ranks", Icon: Trophy },
        { id: "profile", l: "Profile", Icon: User },
    ];
    const active = id => page === id || (page === "chapter" && id === "browser") || (page === "quiz" && id === "browser") || (page === "results" && id === "browser") || (page === "shop" && id === "profile");
    return (
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, zIndex: 60, padding: "0 20px 24px" }}>
            <div style={{
                background: C.glass, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                border: `1px solid ${C.glassBdr}`, borderRadius: 999, display: "flex", justifyContent: "space-between",
                alignItems: "center", padding: "10px 10px",
                boxShadow: `0 10px 40px rgba(0,0,0,0.5)`
            }}>
                {items.map(({ id, l, Icon }) => {
                    const a = active(id);
                    return (
                        <Tap key={id} onClick={() => nav(id)}
                            style={{
                                display: "flex", alignItems: "center", gap: 8, padding: a ? "12px 20px" : "12px 14px",
                                borderRadius: 999, backgroundColor: a ? C.acc : "transparent",
                                color: a ? C.onAcc : C.muted, transition: "all 0.3s ease"
                            }}>
                            <Icon size={a ? 20 : 22} strokeWidth={a ? 2.5 : 2} />
                            {a && <span style={{ fontSize: 13, fontWeight: 800 }}>{l}</span>}
                        </Tap>
                    );
                })}
            </div>
        </div>
    );
};

const ThemeToggle = ({ isDark, onToggle, C }) => (
    <Tap onClick={onToggle} style={{
        position: "fixed", bottom: 100, right: 24, zIndex: 70,
        width: 48, height: 48, borderRadius: 16, backgroundColor: C.bg3, border: `1px solid ${C.bdr2}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 8px 24px rgba(0,0,0,0.4)`
    }}>
        <span style={{ fontSize: 24 }}>{isDark ? "☀️" : "🌙"}</span>
    </Tap>
);

const PgOnboard1 = ({ name, setName, onNext, C }) => (
    <div style={{
        minHeight: "100vh", backgroundColor: C.bg, display: "flex", flexDirection: "column",
        background: C.isDark ? `linear-gradient(180deg, ${C.bg2} 0%, ${C.bg} 100%)` : `linear-gradient(180deg, ${C.bg3} 0%, ${C.bg} 100%)`
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
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name..."
                onKeyDown={e => e.key === "Enter" && name.trim() && onNext()}
                style={{
                    width: "100%", backgroundColor: C.bg3, border: `1px solid ${C.bdr}`,
                    borderRadius: 16, padding: "20px", color: C.text, fontSize: 18, outline: "none", fontFamily: "inherit", caretColor: C.acc
                }} />
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

const PgOnboard2 = ({ name, cls, setCls, onBack, onNext, C }) => (
    <div style={{
        minHeight: "100vh", backgroundColor: C.bg, display: "flex", flexDirection: "column",
        background: C.isDark ? `linear-gradient(180deg, ${C.bg2} 0%, ${C.bg} 50%)` : `linear-gradient(180deg, ${C.bg3} 0%, ${C.bg} 50%)`
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
                Almost there,<br /><span style={{ color: C.acc }}>{name || "Student"}!</span> 👋
            </h1>
            <p style={{ color: C.muted, fontSize: 16, fontWeight: 500, margin: "0 0 24px", textAlign: "left" }}>Which class are you in?</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {[6, 7, 8, 9, 10, 11, 12].map(c => (
                    <Tap key={c} onClick={() => setCls(`Class ${c}`)}
                        style={{
                            padding: "12px 24px", borderRadius: 999, fontSize: 15, fontWeight: 700,
                            backgroundColor: cls === `Class ${c}` ? C.acc : C.bg3,
                            border: `1px solid ${cls === `Class ${c}` ? C.acc : C.bdr}`,
                            color: cls === `Class ${c}` ? C.onAcc : C.text
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

const PgDashboard = ({ name, xpEarned, powerUps, setNotifOpen, nav, setAchievement, C }) => {
    const SUBJECTS = makeSubjects(C);
    const streak = 5;
    const days = ["M", "T", "W", "T", "F", "S", "S"];
    return (
        <div style={{ backgroundColor: C.bg, minHeight: "100vh", paddingBottom: 120 }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "48px 24px 24px" }}>
                <div>
                    <p style={{ color: C.muted, fontSize: 13, margin: "0 0 4px", fontWeight: 700, letterSpacing: 0.5 }}>GOOD MORNING ☀️</p>
                    <h1 style={{ fontWeight: 900, fontSize: 30, color: C.text, margin: 0, lineHeight: 1.2 }}>Hi, {name || "Rahul"}</h1>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <Tap onClick={() => setNotifOpen(true)}
                        style={{
                            width: 44, height: 44, borderRadius: 14, backgroundColor: C.bg2, border: `1px solid ${C.bdr}`,
                            display: "flex", alignItems: "center", justifyContent: "center", position: "relative"
                        }}>
                        <Bell size={20} color={C.muted} strokeWidth={2} />
                        <span style={{ position: "absolute", top: 9, right: 9, width: 8, height: 8, borderRadius: "50%", backgroundColor: C.danger, border: `2px solid ${C.bg2}` }} />
                    </Tap>
                    <Tap onClick={() => nav("profile")}
                        style={{
                            width: 44, height: 44, borderRadius: 14, backgroundColor: C.bg2, border: `2px solid ${C.acc}`,
                            display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                        <User size={20} color={C.acc} strokeWidth={2} />
                    </Tap>
                </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 10, padding: "0 24px 28px", alignItems: "center" }}>
                <div style={{ backgroundColor: C.acc + "15", border: `1px solid ${C.acc}33`, borderRadius: 999, padding: "8px 14px", fontSize: 13, fontWeight: 800, color: C.acc }}>
                    💎 {xpEarned} XP
                </div>
                <div style={{ backgroundColor: C.bg3, border: `1px solid ${C.bdr}`, borderRadius: 999, padding: "8px 14px", fontSize: 13, fontWeight: 700, color: C.text }}>
                    🔥 {streak} Day Streak
                </div>
                <div style={{ flex: 1 }} />
                {[{ Icon: Shield, c: powerUps.shield }, { Icon: Snowflake, c: powerUps.timeFreeze }, { Icon: Zap, c: powerUps.doubleXp }].map((p, i) => (
                    <div key={i} style={{ backgroundColor: C.bg2, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "6px 8px", fontSize: 12, display: "flex", alignItems: "center", gap: 4, color: C.text }}>
                        <p.Icon size={13} color={C.textSub} /><span style={{ color: C.muted }}>×{p.c}</span>
                    </div>
                ))}
            </div>

            {/* Today's Focus */}
            <div style={{ padding: "0 24px 28px" }}>
                <p style={{ fontWeight: 800, fontSize: 18, margin: "0 0 16px", color: C.text }}>Today's Focus</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {[
                        { label: "DUE", val: "3", sub: "Quizzes left", Icon: Zap, clr: C.sec, cta: true },    // Lavender
                        { label: "GOAL", val: "20", sub: "Questions target", Icon: Target, clr: C.hi, progress: 65 },  // Peach
                        { label: "EARNED", val: "+130", sub: "XP today", Icon: Award, clr: C.acc },        // Mint Green
                        { label: "ACCURACY", val: "84%", sub: "This week", Icon: Target, clr: C.textSub }, // Subdued White
                    ].map((card, i) => (
                        <div key={i} style={{
                            borderRadius: 24, padding: 20, position: "relative", overflow: "hidden",
                            backgroundColor: C.bg2, border: `1px solid ${C.bdr}`
                        }}>
                            <div style={{ position: "absolute", right: -10, top: -10, opacity: 0.06, pointerEvents: "none" }}>
                                <card.Icon size={64} color={card.clr} strokeWidth={1} />
                            </div>
                            <p style={{ color: card.clr, fontSize: 11, fontWeight: 800, margin: "0 0 6px", letterSpacing: 1 }}>{card.label}</p>
                            <p style={{ fontWeight: 900, fontSize: 32, color: C.text, margin: "0 0 4px", lineHeight: 1 }}>{card.val}</p>
                            <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>{card.sub}</p>
                            {card.progress && <div style={{ marginTop: 12 }}>
                                <div style={{ width: "100%", height: 6, backgroundColor: C.bg3, borderRadius: 3 }}>
                                    <div style={{ height: "100%", backgroundColor: card.clr, borderRadius: 3, width: card.progress + "%" }} />
                                </div>
                            </div>}
                            {card.cta && <Tap onClick={() => nav("browser", { subject: "Maths" })}
                                style={{ backgroundColor: card.clr, color: C.bg, borderRadius: 999, padding: "8px 16px", fontSize: 12, fontWeight: 800, display: "inline-block", marginTop: 12 }}>
                                Start →
                            </Tap>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Streak */}
            <div style={{ padding: "0 24px 28px" }}>
                <div style={{ borderRadius: 24, overflow: "hidden", border: `1px solid ${C.bdr}`, backgroundColor: C.bg2 }}>
                    <div style={{ padding: "20px 24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <div>
                                <p style={{ fontWeight: 900, fontSize: 18, margin: 0, color: C.text }}>Daily Streak 🔥</p>
                                <p style={{ color: C.hi, fontSize: 13, fontWeight: 600, margin: "4px 0 0" }}>{streak} days — keep going!</p>
                            </div>
                            <div style={{
                                width: 56, height: 56, borderRadius: 16, backgroundColor: C.hi,
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
                                boxShadow: `0 8px 24px ${C.hi}33`
                            }}>🔥</div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                            {days.map((d, i) => {
                                const done = i < streak, today = i === streak; return (
                                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 12,
                                            backgroundColor: done ? C.hi : today ? C.bg3 : "transparent",
                                            border: today ? `2px solid ${C.hi}` : done ? "none" : `1px solid ${C.bdr}`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: done ? 16 : 14, fontWeight: 900, color: done ? C.bg : today ? C.hi : C.muted
                                        }}>
                                            {done ? "✓" : today ? "→" : ""}
                                        </div>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: done ? C.hi : C.muted }}>{d}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{
                            backgroundColor: C.bg3, borderRadius: 16, padding: "14px 16px",
                            border: `1px solid ${C.bdr}`, display: "flex", alignItems: "flex-start", gap: 12
                        }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: 10, backgroundColor: C.hi,
                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                            }}>
                                <Bot size={16} color={C.bg} />
                            </div>
                            <div>
                                <p style={{ fontWeight: 800, fontSize: 12, color: C.hi, margin: "0 0 4px" }}>AI Insight ✨</p>
                                <p style={{ color: C.textSub, fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                                    You're 70% done with Maths Ch.4. Review <strong style={{ color: C.text }}>Quadratic Equations</strong> today.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Popular Subjects */}
            <div style={{ padding: "0 24px 12px" }}>
                <p style={{ fontWeight: 800, fontSize: 18, margin: 0, color: C.text }}>Popular Subjects</p>
            </div>
            <div style={{ padding: "0 24px 16px" }}>
                <Tap onClick={() => nav("browser", { subject: "Maths" })}
                    style={{
                        borderRadius: 24, padding: 24, position: "relative", overflow: "hidden",
                        backgroundColor: C.bg2, border: `1px solid ${C.bdr}`
                    }}>
                    <div style={{ position: "absolute", right: 16, top: 16, fontSize: 84, opacity: 0.04, transform: "rotate(-10deg)" }}>📐</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                        <div>
                            <div style={{ backgroundColor: C.acc, color: C.bg, borderRadius: 999, padding: "4px 12px", fontSize: 11, fontWeight: 800, display: "inline-block", marginBottom: 12 }}>FEATURED</div>
                            <h2 style={{ color: C.acc, fontSize: 24, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>Maths</h2>
                            <p style={{ color: C.muted, fontSize: 13, margin: "6px 0 0" }}>Ch.4 — Quadratic Equations</p>
                        </div>
                        <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: C.acc + "15", border: `1px solid ${C.acc}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📐</div>
                    </div>
                    <div style={{ width: "100%", height: 6, backgroundColor: C.bg3, borderRadius: 3, overflow: "hidden", marginBottom: 16 }}>
                        <div style={{ height: "100%", borderRadius: 3, backgroundColor: C.acc, width: "72%" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ color: C.muted, fontSize: 13, fontWeight: 600 }}>72% complete · 5 chapters left</span>
                        <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: C.acc, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: C.bg }}>▶</div>
                    </div>
                </Tap>
            </div>
            <div style={{ overflowX: "auto", display: "flex", gap: 16, padding: "0 24px 28px" }}>
                {SUBJECTS.slice(1).map((s, i) => (
                    <Tap key={i} onClick={() => nav("browser", { subject: s.name })}
                        style={{ minWidth: 160, borderRadius: 24, padding: 20, flexShrink: 0, backgroundColor: C.bg2, border: `1px solid ${C.bdr}`, position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", right: -10, bottom: -10, fontSize: 64, opacity: 0.04 }}>{s.icon}</div>
                        <div style={{ width: 36, height: 6, borderRadius: 3, backgroundColor: s.color, marginBottom: 12 }} />
                        <p style={{ fontWeight: 800, fontSize: 18, margin: "0 0 4px", color: C.text }}>{s.name}</p>
                        <p style={{ color: C.muted, fontSize: 12, margin: "0 0 16px" }}>{s.ch}</p>
                        <div style={{ width: "100%", height: 4, backgroundColor: C.bg3, borderRadius: 2, overflow: "hidden" }}>
                            <div style={{ height: "100%", borderRadius: 2, backgroundColor: s.color, width: `${s.pct}%` }} />
                        </div>
                        <p style={{ color: s.color, fontSize: 12, fontWeight: 800, margin: "8px 0 0" }}>{s.pct}%</p>
                    </Tap>
                ))}
            </div>
        </div>
    );
};

const PgBrowser = ({ subject, nav, C }) => {
    const SUBJECTS = makeSubjects(C);
    const [cls, setCls] = useState("All");
    const sData = SUBJECTS.find(s => s.name === subject) || SUBJECTS[0];
    const chapters = CHAPTERS[subject] || CHAPTERS.Maths;
    const progArr = [100, 60, 30, 0, 0, 0, 0, 0, 0];
    const diffArr = ["🟢 Spark", "🟡 Blaze", "🔴 Inferno", "🟢 Spark", "🟡 Blaze", "🔴 Inferno", "🟢 Spark", "🟡 Blaze", "🔴 Inferno"];

    return (
        <div style={{ backgroundColor: C.bg, minHeight: "100vh", paddingBottom: 120 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "48px 24px 16px", borderBottom: `1px solid ${C.bdr}`, position: "sticky", top: 0, backgroundColor: C.bg, zIndex: 10 }}>
                <Tap onClick={() => nav("dashboard")} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: C.bg2, border: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ArrowLeft size={20} color={C.text} strokeWidth={2} />
                </Tap>
                <div style={{ textAlign: "center" }}>
                    <h1 style={{ fontWeight: 900, fontSize: 20, margin: 0, color: C.text }}>{sData.icon} {subject}</h1>
                    <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>{chapters.length} chapters available</p>
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
                <Tap onClick={() => nav("chapter", { subject, chapter: chapters[0] })}
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
                            <Tap key={i} onClick={() => nav("chapter", { subject, chapter: ch })}
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
};

const PgChapter = ({ subject, chapter, difficulty, setDifficulty, activePowerUp, setActivePowerUp, powerUps, nav, showToast, startQuiz, C }) => {
    const SUBJECTS = makeSubjects(C);
    const [mode, setMode] = useState("precomputed");
    const sData = SUBJECTS.find(s => s.name === subject) || SUBJECTS[0];

    return (
        <div style={{ backgroundColor: C.bg, minHeight: "100vh", paddingBottom: 40 }}>
            <div style={{ height: "35vh", backgroundColor: C.bg2, position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 24, borderBottom: `1px solid ${C.bdr}` }}>
                <Tap onClick={() => nav("browser", { subject })} style={{ position: "absolute", top: 48, left: 24, zIndex: 2, width: 44, height: 44, borderRadius: "50%", backgroundColor: C.glass, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.bdr}` }}>
                    <ArrowLeft size={20} color={C.text} strokeWidth={2} />
                </Tap>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120, opacity: 0.04 }}>{sData.icon}</div>
                <h1 style={{ fontWeight: 900, fontSize: 32, margin: 0, position: "relative", zIndex: 1, color: C.text }}>{subject}</h1>
                <span style={{ position: "absolute", bottom: 24, right: 24, backgroundColor: C.hi, color: C.bg, fontSize: 13, fontWeight: 800, padding: "6px 12px", borderRadius: 999, zIndex: 2 }}>⭐ 4.8</span>
            </div>
            <div style={{ padding: 24 }}>
                <h2 style={{ fontWeight: 900, fontSize: 22, marginBottom: 12, color: C.text }}>{chapter}
                    <span style={{ backgroundColor: C.bg3, fontSize: 11, padding: "4px 10px", borderRadius: 999, marginLeft: 12, fontWeight: 700, color: C.muted, border: `1px solid ${C.bdr}` }}>Class 9</span>
                </h2>
                <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
                    {["📚 22 Lessons", "⏱️ 1hr 45min", "❓ 40 Questions"].map((t, i) => (
                        <span key={i} style={{ backgroundColor: C.bg2, border: `1px solid ${C.bdr}`, borderRadius: 999, padding: "8px 14px", fontSize: 13, fontWeight: 600, color: C.text }}>{t}</span>
                    ))}
                </div>
                <Tap onClick={() => showToast("Notes downloading... ✓", C.ok)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", border: `1px solid ${C.bdr}`, backgroundColor: C.bg2, borderRadius: 16, padding: "16px", textAlign: "center", fontSize: 15, fontWeight: 700, marginBottom: 24, color: C.text, boxSizing: "border-box" }}>
                    📥 Download Notes (PDF)
                </Tap>

                <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
                    {[{ id: "precomputed", t: "⚡ Instant Quiz", s: "From question bank" }, { id: "ai", t: "🤖 AI Quiz", s: "Custom topic quiz" }].map(m => (
                        <Tap key={m.id} onClick={() => setMode(m.id)}
                            style={{ flex: 1, backgroundColor: mode === m.id ? C.acc + "15" : C.bg2, borderRadius: 20, padding: 16, border: `2px solid ${mode === m.id ? C.acc : C.bdr}` }}>
                            <p style={{ fontWeight: 800, fontSize: 14, margin: "0 0 6px", color: mode === m.id ? C.acc : C.text }}>{m.t}</p>
                            <p style={{ color: C.muted, fontSize: 12, margin: "0 0 16px" }}>{m.s}</p>
                            <div style={{ backgroundColor: mode === m.id ? C.acc : C.bg3, color: mode === m.id ? C.bg : C.text, textAlign: "center", padding: "10px", borderRadius: 999, fontSize: 13, fontWeight: 800 }}>{m.id === "precomputed" ? "Start Now →" : "Generate →"}</div>
                        </Tap>
                    ))}
                </div>

                <p style={{ fontWeight: 800, fontSize: 16, margin: "0 0 12px", color: C.text }}>Difficulty</p>
                <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
                    {[{ id: "spark", l: "🟢 Spark", clr: C.ok }, { id: "blaze", l: "🟡 Blaze", clr: C.hi }, { id: "inferno", l: "🔴 Inferno", clr: C.danger }].map(d => (
                        <Tap key={d.id} onClick={() => setDifficulty(d.id)}
                            style={{
                                flex: 1, padding: "12px 0", borderRadius: 999, fontSize: 13, fontWeight: 700, textAlign: "center",
                                border: `1px solid ${difficulty === d.id ? d.clr : C.bdr}`,
                                backgroundColor: difficulty === d.id ? d.clr : C.bg2,
                                color: difficulty === d.id ? C.bg : C.text
                            }}>
                            {d.l}
                        </Tap>
                    ))}
                </div>

                <p style={{ fontWeight: 800, fontSize: 16, margin: "0 0 12px", color: C.text }}>Power-Up <span style={{ color: C.muted, fontWeight: 500, fontSize: 13 }}>(optional)</span></p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
                    {[{ id: "shield", Icon: Shield, n: "Shield", d: "Protects streak", clr: C.sec },
                    { id: "timeFreeze", Icon: Snowflake, n: "Time Freeze", d: "Pauses 15s", clr: C.hi },
                    { id: "doubleXp", Icon: Zap, n: "Double XP", d: "2× XP session", clr: C.acc },
                    { id: "hint", Icon: Lightbulb, n: "Hint", d: "Remove 1 wrong", clr: C.ok }].map(p => (
                        <Tap key={p.id} onClick={() => powerUps[p.id] > 0 ? setActivePowerUp(p.id === activePowerUp ? null : p.id) : null}
                            style={{
                                backgroundColor: activePowerUp === p.id ? p.clr + "15" : C.bg2, borderRadius: 16, padding: 16,
                                border: `2px solid ${activePowerUp === p.id ? p.clr : C.bdr}`,
                                position: "relative", opacity: powerUps[p.id] === 0 ? 0.5 : 1, cursor: powerUps[p.id] > 0 ? "pointer" : "not-allowed"
                            }}>
                            <span style={{ position: "absolute", top: 12, right: 12, backgroundColor: C.bg3, color: C.textSub, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>×{powerUps[p.id]}</span>
                            <div style={{ marginBottom: 10, color: p.clr }}><p.Icon size={28} /></div>
                            <p style={{ fontWeight: 800, fontSize: 14, margin: "0 0 4px", color: C.text }}>{p.n}</p>
                            <p style={{ color: C.muted, fontSize: 12, margin: 0, lineHeight: 1.4 }}>{p.d}</p>
                        </Tap>
                    ))}
                </div>
                <Tap onClick={startQuiz}
                    style={{ display: "block", width: "100%", backgroundColor: C.acc, color: C.bg, borderRadius: 20, padding: "18px", textAlign: "center", fontSize: 16, fontWeight: 900, boxSizing: "border-box" }}>
                    Start Quiz →
                </Tap>
            </div>
        </div>
    );
};

const PgQuiz = ({ subject, difficulty, activePowerUp, currentQ, setCurrentQ, score, setScore, wrongAnswers, setWrongAnswers, nav, addXp, showToast, setAchievement, hintsUsed, setHintsUsed, timer, setTimer, timerFrozen, setTimerFrozen, powerUps, setPowerUps, C }) => {
    const SUBJECTS = makeSubjects(C);
    const qs = QUIZ[subject] || QUIZ.Maths;
    const q = qs[currentQ];
    const sData = SUBJECTS.find(s => s.name === subject) || SUBJECTS[0];
    const [sel, setSel] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [fillAns, setFillAns] = useState("");
    const [hiddenOpt, setHiddenOpt] = useState(null);

    useEffect(() => { setSel(null); setSubmitted(false); setFillAns(""); setHiddenOpt(null); }, [currentQ]);
    useEffect(() => {
        if (submitted || timerFrozen) return;
        if (timer <= 0) { handleSubmit(q.type === "mcq" ? sel : fillAns); return; }
        const id = setInterval(() => setTimer(t => t - 1), 1000);
        return () => clearInterval(id);
    }, [timer, submitted, timerFrozen, q.type, sel, fillAns]); // Added missing dependencies

    const handleSubmit = (ans) => {
        if (submitted) return;
        setSubmitted(true);
        const correct = q.type === "fill" ? norm(ans) === norm(q.correct) : ans === q.correct;
        let xp = 0;
        if (correct) { setScore(s => s + 1); xp = 10; if (timer >= 22) { xp += 5; showToast("+5 Bonus XP 🚀", C.acc); } }
        else { setWrongAnswers(p => [...p, { q: q.q, yours: ans, correct: q.correct, exp: q.exp }]); }
        const mult = difficulty === "blaze" ? 1.5 : difficulty === "inferno" ? 2 : 1;
        const total = Math.floor(xp * mult * (activePowerUp === "doubleXp" ? 2 : 1));
        if (total > 0) addXp(total);
    };
    const next = () => {
        if (currentQ < qs.length - 1) { setCurrentQ(c => c + 1); setTimer(30); }
        else {
            nav("results");
            if (wrongAnswers.length > 0) setTimeout(() => showToast(`${wrongAnswers.length} Qs saved to Mistake Bank 📚`), 400);
            if (Math.round((score / qs.length) * 100) >= 90) setTimeout(() => setAchievement({ title: "New High Score! 🎉", desc: "You've cracked the Top 10! Keep rising." }), 1500);
        }
    };

    const isOk = submitted && (q.type === "fill" ? norm(fillAns) === norm(q.correct) : sel === q.correct);
    const oBg = i => { if (!submitted) return sel === i ? C.acc + "15" : C.bg2; if (i === q.correct) return C.ok + "15"; if (sel === i) return C.danger + "15"; return C.bg2; };
    const oBdrClr = i => { if (!submitted) return sel === i ? C.acc : C.bdr; if (i === q.correct) return C.ok; if (sel === i) return C.danger; return C.bdr; };
    const letterBg = i => { if (!submitted) return sel === i ? C.acc : C.bg3; if (i === q.correct) return C.ok; if (sel === i) return C.danger; return C.bg3; };

    const timerPct = (timer / 30) * 100;
    const timerClr = timerFrozen ? C.sec : timer <= 5 ? C.danger : timer <= 10 ? C.hi : C.acc;

    return (
        <div style={{ backgroundColor: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "48px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Tap onClick={() => nav("chapter")} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: C.bg2, border: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ArrowLeft size={20} color={C.muted} strokeWidth={2} />
                </Tap>
                <div style={{ textAlign: "center" }}>
                    <p style={{ fontWeight: 800, fontSize: 16, margin: 0, color: C.text }}>{subject}</p>
                    <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>{difficulty === "spark" ? "🟢 Spark" : difficulty === "blaze" ? "🟡 Blaze" : "🔴 Inferno"}</p>
                </div>
                <div style={{ position: "relative", width: 52, height: 52 }}>
                    <svg width={52} height={52} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
                        <circle cx={26} cy={26} r={22} stroke={C.bg3} strokeWidth={5} fill="none" />
                        <circle cx={26} cy={26} r={22} stroke={timerClr} strokeWidth={5} fill="none"
                            strokeDasharray={`${2 * Math.PI * 22}`} strokeDashoffset={`${2 * Math.PI * 22 * (1 - timerPct / 100)}`}
                            strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.9s linear,stroke 0.3s" }} />
                    </svg>
                    <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: timerClr, fontFamily: "monospace" }}>{timer}</span>
                </div>
            </div>
            <div style={{ padding: "20px 24px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ color: C.muted, fontSize: 13, fontWeight: 700 }}>Question {currentQ + 1} of {qs.length}</span>
                    <span style={{ backgroundColor: C.acc + "15", color: C.acc, borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 800, border: `1px solid ${C.acc}33` }}>
                        {Math.round((currentQ / qs.length) * 100)}% done
                    </span>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                    {qs.map((_, i) => (<div key={i} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: i < currentQ ? C.acc : i === currentQ ? C.acc + "66" : C.bg3, transition: "background-color 0.3s" }} />))}
                </div>
            </div>
            {activePowerUp === "doubleXp" && (
                <div style={{ margin: "16px 24px 0", backgroundColor: C.acc + "15", border: `1px solid ${C.acc}33`, borderRadius: 16, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                    <Zap size={18} color={C.acc} /><span style={{ color: C.acc, fontSize: 13, fontWeight: 800 }}>Double XP Active</span>
                </div>
            )}
            <div style={{ flex: 1, padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ backgroundColor: C.bg2, borderRadius: 24, overflow: "hidden", border: `1px solid ${C.bdr}`, position: "relative" }}>
                    <div style={{ position: "absolute", right: -10, top: 10, fontSize: 84, opacity: 0.04, userSelect: "none", pointerEvents: "none" }}>{sData.icon}</div>
                    <div style={{ padding: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 22 }}>{sData.icon}</span>
                                <span style={{ color: C.acc, fontSize: 13, fontWeight: 800 }}>{subject}</span>
                            </div>
                            <span style={{ backgroundColor: C.bg3, borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 800, color: C.muted }}>
                                {difficulty === "spark" ? "🟢" : difficulty === "blaze" ? "🟡" : "🔴"} {difficulty}
                            </span>
                        </div>
                        <p style={{ fontWeight: 800, fontSize: 20, lineHeight: 1.5, color: C.text, margin: 0 }}>{q.q}</p>
                    </div>
                </div>

                {q.type === "mcq"
                    ? <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {q.options.map((opt, i) => i === hiddenOpt ? null : (
                            <Tap key={i} onClick={() => !submitted && setSel(i)}
                                style={{ display: "flex", alignItems: "center", gap: 16, borderRadius: 20, padding: "18px 20px", overflow: "hidden", position: "relative", backgroundColor: oBg(i), border: `2px solid ${oBdrClr(i)}`, transition: "all 0.2s" }}>
                                <div style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: letterBg(i), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, flexShrink: 0, color: submitted && i === q.correct ? C.bg : submitted && sel === i ? C.bg : C.text }}>
                                    {submitted && i === q.correct ? "✓" : submitted && sel === i && i !== q.correct ? "✕" : ["A", "B", "C", "D"][i]}
                                </div>
                                <span style={{ fontSize: 16, color: C.text, fontWeight: 600, flex: 1 }}>{opt}</span>
                                {submitted && i === q.correct && <CheckCircle size={20} color={C.ok} />}
                            </Tap>
                        ))}
                    </div>
                    : <div style={{ backgroundColor: C.bg2, borderRadius: 20, border: `2px solid ${C.bdr}`, overflow: "hidden" }}>
                        <input value={fillAns} onChange={e => setFillAns(e.target.value)} disabled={submitted}
                            placeholder="Type your answer here..."
                            style={{ width: "100%", backgroundColor: C.inputBg, border: "none", padding: "20px 24px", color: C.text, fontSize: 16, outline: "none", fontFamily: "inherit", boxSizing: "border-box", caretColor: C.acc }} />
                    </div>
                }

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {!submitted && activePowerUp === "hint" && hintsUsed < 3 && (
                        <Tap onClick={() => { const w = q.options.findIndex((_, i) => i !== q.correct && i !== hiddenOpt); setHiddenOpt(w); setHintsUsed(h => h + 1); }}
                            style={{ backgroundColor: C.bg2, border: `1px solid ${C.bdr}`, borderRadius: 999, padding: "10px 20px", fontSize: 13, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
                            <Lightbulb size={16} color={C.ok} />Hint ({3 - hintsUsed} left)
                        </Tap>
                    )}
                    {!submitted && activePowerUp === "timeFreeze" && !timerFrozen && (
                        <Tap onClick={() => { setTimerFrozen(true); setPowerUps(p => ({ ...p, timeFreeze: p.timeFreeze - 1 })); setTimeout(() => setTimerFrozen(false), 15000); setActivePowerUp(null); }}
                            style={{ backgroundColor: C.hi + "15", border: `1px solid ${C.hi}44`, borderRadius: 999, padding: "10px 20px", fontSize: 13, fontWeight: 800, color: C.hi, display: "flex", alignItems: "center", gap: 8 }}>
                            <Snowflake size={16} />Freeze Timer
                        </Tap>
                    )}
                </div>

                {submitted && (
                    <div style={{ borderRadius: 20, padding: "16px 20px", backgroundColor: isOk ? C.ok + "15" : C.danger + "15", border: `1px solid ${isOk ? C.ok + "44" : C.danger + "44"}`, display: "flex", flexDirection: "column", gap: 6 }}>
                        <p style={{ fontWeight: 900, fontSize: 16, margin: 0, color: isOk ? C.ok : C.danger }}>
                            {isOk ? "✅ Correct! +10 XP earned" : "❌ Incorrect"}
                        </p>
                        {!isOk && <p style={{ fontSize: 13, margin: 0, color: C.textSub }}>
                            Correct: <span style={{ color: C.ok, fontWeight: 800 }}>{q.type === "fill" ? q.correct : ["A", "B", "C", "D"][q.correct] + ". " + q.options[q.correct]}</span>
                        </p>}
                        <p style={{ fontSize: 13, margin: 0, color: C.muted, fontStyle: "italic" }}>{q.exp}</p>
                    </div>
                )}

                <div style={{ marginTop: "auto", paddingTop: 8 }}>
                    {!submitted && (q.type === "mcq" ? sel !== null : fillAns !== "") && (
                        <Tap onClick={() => handleSubmit(q.type === "mcq" ? sel : fillAns)}
                            style={{ display: "block", width: "100%", backgroundColor: C.acc, color: C.bg, borderRadius: 20, padding: "18px", textAlign: "center", fontSize: 16, fontWeight: 900, boxSizing: "border-box" }}>
                            Submit Answer
                        </Tap>
                    )}
                    {submitted && (
                        <Tap onClick={next} style={{ display: "block", width: "100%", backgroundColor: C.sec, color: C.bg, borderRadius: 20, padding: "18px", textAlign: "center", fontSize: 16, fontWeight: 900, boxSizing: "border-box" }}>
                            {currentQ < qs.length - 1 ? "Next Question →" : "See Results 🎉"}
                        </Tap>
                    )}
                </div>
            </div>
        </div>
    );
};

const PgResults = ({ score, total, wrongAnswers, activePowerUp, difficulty, nav, startQuiz, showToast, C }) => {
    const pct = Math.round((score / total) * 100);
    const [off, setOff] = useState(283);
    useEffect(() => { setTimeout(() => setOff(283 - (pct / 100) * 283), 200); }, [pct]); // Fixed dependency
    const clr = pct >= 90 ? C.acc : pct >= 70 ? C.sec : pct >= 50 ? C.hi : C.danger;
    const mult = difficulty === "blaze" ? 1.5 : difficulty === "inferno" ? 2 : 1;
    const xp = Math.floor(score * 10 * (activePowerUp === "doubleXp" ? 2 : 1) * mult);

    return (
        <div style={{ backgroundColor: C.bg, minHeight: "100vh", paddingBottom: 40 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "64px 0 32px" }}>
                <div style={{ position: "relative", width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                    <svg width={140} height={140} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
                        <circle cx={70} cy={70} r={45} stroke={C.bg3} strokeWidth={12} fill="none" />
                        <circle cx={70} cy={70} r={45} stroke={clr} strokeWidth={12} fill="none"
                            strokeDasharray="283" strokeDashoffset={off} strokeLinecap="round"
                            style={{ transition: "stroke-dashoffset 1.2s ease-out" }} />
                    </svg>
                    <span style={{ fontSize: 38, fontWeight: 900, zIndex: 1, color: C.text }}>{pct}%</span>
                </div>
                <h1 style={{ fontWeight: 900, fontSize: 28, margin: "0 0 8px", color: C.text }}>Quiz Complete! 🎉</h1>
                <p style={{ fontWeight: 800, fontSize: 16, color: clr, margin: 0 }}>
                    {pct >= 90 ? "Outstanding! 🌟" : pct >= 70 ? "Great job! 💪" : pct >= 50 ? "Good effort! 📚" : "Don't give up! 🔄"}
                </p>
            </div>

            <div style={{ padding: "0 24px 32px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                    {[{ e: <CheckCircle size={24} color={C.ok} />, v: score, l: "Correct" }, { e: <XCircle size={24} color={C.danger} />, v: total - score, l: "Wrong" }, { e: <Clock size={24} color={C.sec} />, v: "1m 12s", l: "Time" }].map((s, i) => (
                        <div key={i} style={{ backgroundColor: C.bg2, borderRadius: 20, padding: "16px 12px", textAlign: "center", border: `1px solid ${C.bdr}` }}>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>{s.e}</div>
                            <p style={{ fontWeight: 900, fontSize: 22, margin: "0 0 4px", color: C.text }}>{s.v}</p>
                            <p style={{ color: C.muted, fontSize: 11, fontWeight: 700, margin: 0 }}>{s.l}</p>
                        </div>
                    ))}
                </div>
                <div style={{ backgroundColor: C.acc + "15", borderRadius: 20, padding: 16, textAlign: "center", border: `1px solid ${C.acc}33` }}>
                    <p style={{ fontWeight: 900, fontSize: 22, color: C.acc, margin: 0 }}>💎 {xp} XP earned</p>
                </div>
            </div>

            {wrongAnswers.length > 0 && (
                <div style={{ padding: "0 24px 32px" }}>
                    <p style={{ fontWeight: 900, fontSize: 18, marginBottom: 16, color: C.text }}>Review Mistakes</p>
                    {wrongAnswers.map((w, i) => (
                        <div key={i} style={{ backgroundColor: C.bg2, borderRadius: 20, padding: 20, border: `1px solid ${C.bdr}`, marginBottom: 12 }}>
                            <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 12, color: C.text }}>{w.q}</p>
                            <p style={{ color: C.danger, fontSize: 14, textDecoration: "line-through", marginBottom: 6 }}>Your: {typeof w.yours === "number" ? ["A", "B", "C", "D"][w.yours] : w.yours}</p>
                            <p style={{ color: C.ok, fontWeight: 800, fontSize: 14, marginBottom: 8 }}>✅ {typeof w.correct === "number" ? ["A", "B", "C", "D"][w.correct] : w.correct}</p>
                            <p style={{ color: C.muted, fontSize: 13, fontStyle: "italic", margin: 0 }}>{w.exp}</p>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ padding: "0 24px 32px" }}>
                <div style={{ borderRadius: 24, padding: 24, backgroundColor: C.bg2, border: `1px solid ${C.bdr}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: C.acc + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Swords size={22} color={C.acc} />
                        </div>
                        <p style={{ fontWeight: 900, fontSize: 18, margin: 0, color: C.text }}>Challenge a Friend</p>
                    </div>
                    <p style={{ color: C.muted, fontSize: 14, margin: "0 0 20px" }}>Share your score — can they beat it?</p>
                    <Tap onClick={() => showToast("Link copied! 📋", C.acc)}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: C.bg3, color: C.text, borderRadius: 16, padding: "16px", fontSize: 14, fontWeight: 800 }}>
                        <Share2 size={16} />Generate Link
                    </Tap>
                </div>
            </div>

            <div style={{ padding: "0 24px", display: "flex", gap: 16 }}>
                <Tap onClick={startQuiz} style={{ flex: 1, border: `2px solid ${C.bdr}`, borderRadius: 20, padding: "18px", textAlign: "center", fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: C.text }}>
                    <RefreshCw size={18} />Try Again
                </Tap>
                <Tap onClick={() => nav("dashboard")} style={{ flex: 2, backgroundColor: C.acc, color: C.bg, borderRadius: 20, padding: "18px", textAlign: "center", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <Home size={18} />Dashboard
                </Tap>
            </div>
        </div>
    );
};

const PgMistakeBank = ({ mistakeBank, setMistakeBank, addXp, showToast, nav, C }) => {
    const SUBJECTS = makeSubjects(C);
    const [activeId, setActiveId] = useState(null);
    const [vals, setVals] = useState({});
    const [cleared, setCleared] = useState(false);
    const total = 2;

    const attempt = (id, correct) => {
        if ((vals[id] || "").trim().toLowerCase() === correct.toLowerCase()) {
            const next = mistakeBank.filter(q => q.id !== id);
            setMistakeBank(next); addXp(10); showToast("+10 XP ✅", C.ok);
            if (next.length === 0) { setCleared(true); addXp(50); }
        } else showToast("Not quite — try again! ❌", C.danger);
        setActiveId(null);
    };

    if (cleared || mistakeBank.length === 0) return (
        <div style={{ backgroundColor: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
            <div style={{ width: 120, height: 120, borderRadius: 36, backgroundColor: C.ok + "15", border: `2px solid ${C.ok}33`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                <CheckCircle size={64} color={C.ok} strokeWidth={1.5} />
            </div>
            <h1 style={{ fontWeight: 900, fontSize: 32, marginBottom: 12, lineHeight: 1.2, color: C.text }}>Mistake Bank<br />Cleared! 🎉</h1>
            <div style={{ backgroundColor: C.acc + "15", border: `1px solid ${C.acc}33`, borderRadius: 20, padding: "20px 32px", marginBottom: 32 }}>
                <p style={{ fontWeight: 900, fontSize: 28, color: C.acc, margin: "0 0 4px" }}>+50 XP</p>
                <p style={{ color: C.muted, fontSize: 14, margin: 0, fontWeight: 600 }}>Comeback Bonus earned</p>
            </div>
            <Tap onClick={() => nav("dashboard")} style={{ backgroundColor: C.acc, color: C.bg, borderRadius: 20, padding: "18px 40px", fontWeight: 900, fontSize: 16 }}>Back to Dashboard</Tap>
        </div>
    );

    const cleared_count = total - mistakeBank.length;
    return (
        <div style={{ backgroundColor: C.bg, minHeight: "100vh", paddingBottom: 120 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "48px 24px 16px", borderBottom: `1px solid ${C.bdr}`, position: "sticky", top: 0, backgroundColor: C.bg, zIndex: 10 }}>
                <Tap onClick={() => nav("dashboard")} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: C.bg2, border: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ArrowLeft size={20} color={C.text} strokeWidth={2} />
                </Tap>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontWeight: 900, fontSize: 22, margin: 0, color: C.text }}>Mistake Bank 📖</h1>
                    <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>Review, retry, conquer</p>
                </div>
                <div style={{ backgroundColor: C.danger + "15", border: `1px solid ${C.danger}44`, borderRadius: 999, padding: "6px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                    <XCircle size={16} color={C.danger} />
                    <span style={{ color: C.danger, fontSize: 13, fontWeight: 800 }}>{mistakeBank.length} left</span>
                </div>
            </div>

            <div style={{ padding: "24px 24px" }}>
                <div style={{ backgroundColor: C.bg2, borderRadius: 24, overflow: "hidden", border: `1px solid ${C.bdr}`, marginBottom: 24, position: "relative" }}>
                    <div style={{ position: "absolute", right: -10, top: -10, opacity: 0.04, pointerEvents: "none" }}>
                        <Flame size={80} color={C.acc} />
                    </div>
                    <div style={{ padding: "20px 24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                            <div>
                                <p style={{ color: C.acc, fontSize: 12, fontWeight: 800, margin: "0 0 6px", letterSpacing: 1 }}>COMEBACK BONUS</p>
                                <p style={{ fontWeight: 900, fontSize: 20, color: C.text, margin: 0 }}>Clear all mistakes</p>
                                <p style={{ color: C.muted, fontSize: 13, margin: "4px 0 0" }}>Earn <span style={{ color: C.acc, fontWeight: 800 }}>+50 XP</span></p>
                            </div>
                            <div style={{ backgroundColor: C.acc + "15", border: `1px solid ${C.acc}33`, borderRadius: 14, padding: "10px 14px", textAlign: "center" }}>
                                <p style={{ color: C.acc, fontWeight: 900, fontSize: 20, margin: 0 }}>{cleared_count}/{total}</p>
                                <p style={{ color: C.muted, fontSize: 11, fontWeight: 700, margin: 0 }}>cleared</p>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                            {Array.from({ length: total }).map((_, i) => (<div key={i} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: i < cleared_count ? C.acc : C.bg3, transition: "background-color 0.4s" }} />))}
                        </div>
                    </div>
                </div>

                {mistakeBank.map(q => {
                    const sData = SUBJECTS.find(s => s.name === q.sub) || SUBJECTS[0];
                    return (
                        <div key={q.id} style={{ borderRadius: 24, overflow: "hidden", border: `1px solid ${C.bdr}`, marginBottom: 16, backgroundColor: C.bg2, position: "relative" }}>
                            <div style={{ position: "absolute", right: -10, top: 16, fontSize: 70, opacity: 0.04, userSelect: "none" }}>{sData.icon}</div>
                            <div style={{ padding: "20px 24px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: sData.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{sData.icon}</div>
                                    <span style={{ color: sData.color, fontSize: 12, fontWeight: 800 }}>{sData.name}</span>
                                </div>
                                <p style={{ fontWeight: 800, fontSize: 16, color: C.text, margin: "0 0 16px", lineHeight: 1.5 }}>{q.q}</p>

                                {activeId !== q.id ? (
                                    <>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                                            <div style={{ backgroundColor: C.danger + "15", border: `1px solid ${C.danger}33`, borderRadius: 14, padding: "12px 14px" }}>
                                                <p style={{ color: C.muted, fontSize: 11, fontWeight: 800, margin: "0 0 6px", letterSpacing: 1 }}>YOUR ANSWER</p>
                                                <p style={{ color: C.danger, fontSize: 14, fontWeight: 800, margin: 0, textDecoration: "line-through" }}>{q.wrong}</p>
                                            </div>
                                            <div style={{ backgroundColor: C.ok + "15", border: `1px solid ${C.ok}33`, borderRadius: 14, padding: "12px 14px" }}>
                                                <p style={{ color: C.muted, fontSize: 11, fontWeight: 800, margin: "0 0 6px", letterSpacing: 1 }}>CORRECT</p>
                                                <p style={{ color: C.ok, fontSize: 14, fontWeight: 800, margin: 0 }}>{q.ans}</p>
                                            </div>
                                        </div>
                                        <div style={{ backgroundColor: C.bg3, borderRadius: 12, padding: "12px 16px", marginBottom: 16, borderLeft: `4px solid ${sData.color}` }}>
                                            <p style={{ color: C.textSub, fontSize: 13, margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>{q.exp}</p>
                                        </div>
                                        <Tap onClick={() => setActiveId(q.id)} style={{ display: "block", backgroundColor: C.acc, color: C.bg, borderRadius: 16, padding: "16px", textAlign: "center", fontWeight: 900, fontSize: 14 }}>
                                            Re-attempt →
                                        </Tap>
                                    </>
                                ) : (
                                    <div style={{ backgroundColor: C.bg3, borderRadius: 16, padding: 16, border: `1px solid ${C.bdr}` }}>
                                        <p style={{ color: C.acc, fontSize: 12, fontWeight: 800, margin: "0 0 10px" }}>TYPE YOUR ANSWER</p>
                                        <input type="text" placeholder="Your answer..." value={vals[q.id] || ""}
                                            onChange={e => setVals(p => ({ ...p, [q.id]: e.target.value }))}
                                            onKeyDown={e => e.key === "Enter" && attempt(q.id, q.ans)}
                                            style={{ width: "100%", backgroundColor: C.bg2, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "14px 16px", color: C.text, fontSize: 15, marginBottom: 16, fontFamily: "inherit", outline: "none", boxSizing: "border-box", caretColor: C.acc }} />
                                        <div style={{ display: "flex", gap: 10 }}>
                                            <Tap onClick={() => setActiveId(null)} style={{ flex: 1, border: `1px solid ${C.bdr}`, borderRadius: 14, padding: "14px", textAlign: "center", fontSize: 13, fontWeight: 700, color: C.text }}>Cancel</Tap>
                                            <Tap onClick={() => attempt(q.id, q.ans)} style={{ flex: 2, backgroundColor: C.acc, color: C.bg, borderRadius: 14, padding: "14px", textAlign: "center", fontSize: 14, fontWeight: 900 }}>Submit Answer</Tap>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const PgLeaderboard = ({ xpEarned, nav, C }) => {
    const SUBJECTS = makeSubjects(C);
    const [tab, setTab] = useState("global");
    const [selSubject, setSelSubject] = useState("Maths");
    const [selChapter, setSelChapter] = useState(CHAPTERS.Maths[0]);
    const [chapterReady, setChapterReady] = useState(false);
    const handleSubjectChange = s => { setSelSubject(s); setSelChapter(CHAPTERS[s][0]); setChapterReady(false); };
    const data = tab === "global" ? LB_DATA : tab === "subject"
        ? LB_DATA.slice(0, 7).map(u => ({ ...u, xp: Math.floor(u.xp * (0.55 + Math.random() * 0.45)) })).sort((a, b) => b.xp - a.xp)
        : chapterReady ? LB_DATA.slice(0, 6).map(u => ({ ...u, xp: Math.floor(u.xp * 0.28 + Math.random() * 600) })).sort((a, b) => b.xp - a.xp) : [];
    const you = { name: "You", av: "🐺", xp: xpEarned, cls: "Class 9", isYou: true };
    const all = [...data, you].sort((a, b) => b.xp - a.xp);
    const myRank = all.findIndex(u => u.isYou) + 1;
    const sData = SUBJECTS.find(s => s.name === selSubject) || SUBJECTS[0];
    const podClr = [C.sec, C.acc, C.hi]; // Lavender(1st), Mint(2nd), Peach(3rd)

    return (
        <div style={{ backgroundColor: C.bg, minHeight: "100vh", paddingBottom: 140 }}>
            <div style={{ backgroundColor: C.bg, padding: "48px 24px 0", borderBottom: `1px solid ${C.bdr}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <Tap onClick={() => nav("dashboard")} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: C.bg2, border: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
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

            <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, zIndex: 30, padding: "16px 24px", backgroundColor: C.glass, backdropFilter: "blur(12px)", borderTop: `1px solid ${C.bdr}` }}>
                <div style={{ borderRadius: 20, padding: "16px 20px", backgroundColor: C.acc + "15", border: `1px solid ${C.acc}44`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: C.acc + "22", display: "flex", alignItems: "center", justifyContent: "center" }}><User size={20} color={C.acc} /></div>
                        <div>
                            <p style={{ fontWeight: 800, fontSize: 14, margin: 0, color: C.text }}>Your Rank</p>
                            <p style={{ color: C.textSub, fontSize: 12, margin: 0 }}>{tab === "chapter" && !chapterReady ? "Select a chapter" : tab === "global" ? "Global" : "Subject"}</p>
                        </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <p style={{ fontWeight: 900, fontSize: 26, color: C.acc, margin: 0, lineHeight: 1 }}>#{tab === "chapter" && !chapterReady ? "—" : myRank}</p>
                        <p style={{ color: C.acc, fontSize: 12, fontWeight: 700, margin: "4px 0 0" }}>💎 {xpEarned} XP</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PgProfile = ({ name, cls, xpEarned, xpBalance, equippedCosmetics, nav, setAchievement, C }) => {
    const SUBJECTS = makeSubjects(C);
    const [actTab, setActTab] = useState("heatmap");
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
    const curShape = SHOP.shape.find(s => s.id === equippedCosmetics.shape);

    return (
        <div style={{ backgroundColor: C.bg, minHeight: "100vh", paddingBottom: 120 }}>
            <div style={{ position: "relative", overflow: "hidden", backgroundColor: C.bg2, borderBottom: `1px solid ${C.bdr}` }}>
                <div style={{ padding: "56px 24px 32px", display: "flex", gap: 20, alignItems: "center" }}>
                    <Tap onClick={() => nav("shop")} style={{ position: "relative", flexShrink: 0 }}>
                        <div style={{ width: 84, height: 84, borderRadius: 24, backgroundColor: C.bg3, border: `2px solid ${C.acc}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42 }}>{curShape?.icon || "🧑‍🎓"}</div>
                        <div style={{ position: "absolute", bottom: -4, right: -4, width: 28, height: 28, borderRadius: 10, backgroundColor: C.bg2, border: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Search size={14} color={C.text} />
                        </div>
                    </Tap>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontWeight: 900, fontSize: 26, margin: "0 0 6px", color: C.text }}>{name || "Rahul Kumar"}</h1>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                            <span style={{ backgroundColor: C.bg3, border: `1px solid ${C.bdr}`, fontSize: 12, padding: "4px 12px", borderRadius: 999, color: C.muted, fontWeight: 700 }}>{cls || "Class 9"}</span>
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
                {[{ v: "24", l: "Quizzes", Icon: BookOpen, clr: C.acc }, { v: "5", l: "Day Streak", Icon: Flame, clr: C.hi }, { v: "#10", l: "Global Rank", Icon: Trophy, clr: C.sec }].map((s, i) => (
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
                        <Tap key={i} onClick={() => nav("browser", { subject: s.name })}
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
                        <Tap key={i} onClick={() => setAchievement({ title: b.n + " Unlocked!", desc: b.d })}
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
        </div>
    );
};

const PgShop = ({ xpBalance, ownedCosmetics, setOwnedCosmetics, equippedCosmetics, setEquippedCosmetics, nav, showToast, setXpBalance, C }) => {
    const [tab, setTab] = useState("shape");
    const items = SHOP[tab] || [];
    const purchase = item => {
        if (ownedCosmetics.includes(item.id)) { setEquippedCosmetics(p => ({ ...p, [tab]: item.id })); showToast(`${item.name} equipped ✓`, C.ok); }
        else if (xpBalance >= item.cost) { setXpBalance(b => b - item.cost); setOwnedCosmetics(p => [...p, item.id]); setEquippedCosmetics(p => ({ ...p, [tab]: item.id })); showToast(`${item.name} unlocked! ✨`, C.acc); }
        else showToast(`Need ${item.cost - xpBalance} more XP`, C.danger);
    };
    const curShape = SHOP.shape.find(s => s.id === equippedCosmetics.shape);

    return (
        <div style={{ backgroundColor: C.bg, minHeight: "100vh", paddingBottom: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "48px 24px 16px", borderBottom: `1px solid ${C.bdr}`, position: "sticky", top: 0, backgroundColor: C.bg, zIndex: 10 }}>
                <Tap onClick={() => nav("profile")} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: C.bg2, border: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
};

export default function App() {
    const [isDark, setIsDark] = useState(true);
    const C = isDark ? DARK_THEME : LIGHT_THEME;

    const [page, setPage] = useState("onboarding-1");
    const [pageData, setPageData] = useState({});
    const [name, setName] = useState("");
    const [cls, setCls] = useState("");
    const [xpEarned, setXpEarned] = useState(2450);
    const [xpBalance, setXpBalance] = useState(1200);
    const [subject, setSubject] = useState("Maths");
    const [chapter, setChapter] = useState("");
    const [difficulty, setDifficulty] = useState("spark");
    const [activePowerUp, setActivePowerUp] = useState(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [wrongAnswers, setWrongAnswers] = useState([]);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [timer, setTimer] = useState(30);
    const [timerFrozen, setTimerFrozen] = useState(false);
    const [powerUps, setPowerUps] = useState({ shield: 2, timeFreeze: 1, doubleXp: 1, hint: 3 });
    const [mistakeBank, setMistakeBank] = useState([
        { id: 1, sub: "Maths", q: "Area of circle r=7?", ans: "154", wrong: "44", exp: "πr²=(22/7)×49=154" },
        { id: 2, sub: "Science", q: "Newton's 2nd law?", ans: "F=ma", wrong: "F=mv", exp: "Force = mass × acceleration" },
    ]);
    const [equippedCosmetics, setEquippedCosmetics] = useState({ shape: "student", color: "white", background: "plain", frame: "none" });
    const [ownedCosmetics, setOwnedCosmetics] = useState(["student", "white", "plain", "none"]);
    const [notifOpen, setNotifOpen] = useState(false);
    const [achievement, setAchievement] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = useCallback((msg, color) => { setToast({ msg, color }); setTimeout(() => setToast(null), 3000); }, []);
    const addXp = useCallback((amt) => { setXpEarned(p => p + amt); setXpBalance(p => p + amt); }, []);
    const nav = useCallback((p, data = {}) => {
        setPage(p); setPageData(data);
        if (data.subject) setSubject(data.subject);
        if (data.chapter) setChapter(data.chapter);
    }, []);
    const startQuiz = useCallback(() => {
        setCurrentQ(0); setScore(0); setWrongAnswers([]); setHintsUsed(0); setTimer(30); setTimerFrozen(false); nav("quiz");
    }, [nav]);
    const showNav = ["dashboard", "browser", "mistakebank", "leaderboard", "profile"].includes(page);

    return (
        <div key={isDark ? "dark" : "light"} style={{
            fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif",
            color: C.text, backgroundColor: C.bg,
            minHeight: "100vh", maxWidth: 480, margin: "0 auto",
            position: "relative", overflow: "hidden",
            transition: "background-color 0.3s ease, color 0.3s ease"
        }}>
            <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{display:none;}
        input::placeholder{color:${C.muted};}
        input{color:${C.text};}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes fadeSlideDown{from{opacity:0;transform:translateX(-50%) translateY(-20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes slideDown{from{transform:translateY(-100%)}to{transform:translateY(0)}}
        @keyframes scaleIn{from{transform:scale(0.85);opacity:0}to{transform:scale(1);opacity:1}}
      `}</style>

            {page === "onboarding-1" && <PgOnboard1 name={name} setName={setName} onNext={() => nav("onboarding-2")} C={C} />}
            {page === "onboarding-2" && <PgOnboard2 name={name} cls={cls} setCls={setCls} onBack={() => nav("onboarding-1")} onNext={() => nav("dashboard")} C={C} />}
            {page === "dashboard" && <PgDashboard name={name} xpEarned={xpEarned} powerUps={powerUps} setNotifOpen={setNotifOpen} nav={nav} setAchievement={setAchievement} C={C} />}
            {page === "browser" && <PgBrowser subject={pageData.subject || subject} nav={nav} C={C} />}
            {page === "chapter" && <PgChapter subject={pageData.subject || subject} chapter={pageData.chapter || chapter} difficulty={difficulty} setDifficulty={setDifficulty} activePowerUp={activePowerUp} setActivePowerUp={setActivePowerUp} powerUps={powerUps} nav={nav} showToast={showToast} startQuiz={startQuiz} C={C} />}
            {page === "quiz" && <PgQuiz subject={subject} difficulty={difficulty} activePowerUp={activePowerUp} currentQ={currentQ} setCurrentQ={setCurrentQ} score={score} setScore={setScore} wrongAnswers={wrongAnswers} setWrongAnswers={setWrongAnswers} nav={nav} addXp={addXp} showToast={showToast} setAchievement={setAchievement} hintsUsed={hintsUsed} setHintsUsed={setHintsUsed} timer={timer} setTimer={setTimer} timerFrozen={timerFrozen} setTimerFrozen={setTimerFrozen} powerUps={powerUps} setPowerUps={setPowerUps} C={C} />}
            {page === "results" && <PgResults score={score} total={(QUIZ[subject] || QUIZ.Maths).length} wrongAnswers={wrongAnswers} activePowerUp={activePowerUp} difficulty={difficulty} nav={nav} startQuiz={startQuiz} showToast={showToast} C={C} />}
            {page === "mistakebank" && <PgMistakeBank mistakeBank={mistakeBank} setMistakeBank={setMistakeBank} addXp={addXp} showToast={showToast} nav={nav} C={C} />}
            {page === "leaderboard" && <PgLeaderboard xpEarned={xpEarned} nav={nav} C={C} />}
            {page === "shop" && <PgShop xpBalance={xpBalance} ownedCosmetics={ownedCosmetics} setOwnedCosmetics={setOwnedCosmetics} equippedCosmetics={equippedCosmetics} setEquippedCosmetics={setEquippedCosmetics} nav={nav} showToast={showToast} setXpBalance={setXpBalance} C={C} />}
            {page === "profile" && <PgProfile name={name} cls={cls} xpEarned={xpEarned} xpBalance={xpBalance} equippedCosmetics={equippedCosmetics} nav={nav} setAchievement={setAchievement} C={C} />}

            {showNav && <BottomNav page={page} nav={nav} C={C} />}
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark(d => !d)} C={C} />
            <NotifPanel open={notifOpen} onClose={() => setNotifOpen(false)} C={C} />
            <AchOverlay data={achievement} onClose={() => setAchievement(null)} C={C} />
            {toast && <Toast msg={toast.msg} color={toast.color} C={C} />}
        </div>
    );
}
import React from 'react';
import { Calculator, FlaskConical, Book, Globe, Monitor, Palette } from 'lucide-react';

export const QUIZ = {
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

export const CHAPTERS = {
    Maths: ["Number Systems", "Polynomials", "Coordinate Geometry", "Linear Equations", "Triangles", "Circles", "Surface Areas", "Statistics", "Probability"],
    Science: ["Matter", "Pure Substances", "Atoms & Molecules", "Structure of Atom", "Cell — Unit of Life", "Tissues", "Motion", "Force & Laws", "Gravitation"],
    History: ["French Revolution", "Socialism in Europe", "Nazism", "Forest Society", "Pastoralists", "Peasants", "History & Sport", "Clothing"],
    English: ["The Fun They Had", "Sound of Music", "The Little Girl", "A Truly Beautiful Mind", "Snake & Mirror", "My Childhood", "Packing", "Reach for the Top"],
    Computer: ["Intro to IT", "Fundamentals", "Internet Basics", "MS Office", "Programming", "Database Intro", "Cybersecurity", "Networking"],
    Art: ["Drawing Basics", "Color Theory", "Sketching", "Perspective", "Portraits", "Landscapes", "Abstract Art", "Digital Art"],
};

export const makeSubjects = C => [
    { name: "Maths", icon: <Calculator size={24} color={C.bg} />, color: C.sMaths, pct: 72, ch: "Ch.4 Quadratics" },
    { name: "Science", icon: <FlaskConical size={24} color={C.bg} />, color: C.sSci, pct: 45, ch: "Ch.2 Photosynthesis" },
    { name: "English", icon: <Book size={24} color={C.bg} />, color: C.sEng, pct: 88, ch: "Ch.6 Grammar" },
    { name: "History", icon: <Globe size={24} color={C.bg} />, color: C.sHist, pct: 30, ch: "Ch.1 Ancient India" },
    { name: "Computer", icon: <Monitor size={24} color={C.bg} />, color: C.sComp, pct: 55, ch: "Ch.3 Internet" },
    { name: "Art", icon: <Palette size={24} color={C.bg} />, color: C.sArt, pct: 20, ch: "Ch.1 Drawing" },
];

export const LB_DATA = [
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

export const NOTIFS = [
    { id: 1, color: "#FF8A8A", title: "Don't break your streak!", desc: "Study 10 mins today.", time: "2m", unread: true },
    { id: 2, color: "#D4C5E2", title: "Science quiz is live", desc: "10 questions waiting!", time: "1h", unread: true },
    { id: 3, color: "#E8D5C4", title: "You entered Top 10! 🎉", desc: "Keep climbing.", time: "3h", unread: false },
    { id: 4, color: "#A8DAB5", title: "Double XP unlocked!", desc: "From 7-day streak.", time: "Yesterday", unread: false },
];

export const SHOP = {
    shape: [{ id: "student", name: "Student", icon: "🧑‍🎓", cost: 0 }, { id: "scholar", name: "Scholar", icon: "👨‍💼", cost: 300 }, { id: "genius", name: "Genius", icon: "🧠", cost: 600 }, { id: "champion", name: "Champion", icon: "🏆", cost: 800 }],
    color: [{ id: "white", name: "White", hex: "#FFF", cost: 0 }, { id: "blue", name: "Blue", hex: "#B8E0D2", cost: 100 }, { id: "gold", name: "Peach", hex: "#E8D5C4", cost: 300 }, { id: "green", name: "Mint", hex: "#A8DAB5", cost: 500 }],
    background: [{ id: "plain", name: "Plain", cost: 0 }, { id: "grid", name: "Grid", cost: 400 }, { id: "gradient", name: "Gradient", cost: 800 }],
    frame: [{ id: "none", name: "None", cost: 0 }, { id: "thin", name: "Thin Ring", cost: 500 }, { id: "crown", name: "Crown", cost: 2500 }],
};

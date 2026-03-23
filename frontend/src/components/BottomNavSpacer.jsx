export const BottomNavSpacer = () => (
    <div style={{
        height: "calc(88px + env(safe-area-inset-bottom, 0px))",
        flexShrink: 0,
    }} />
);
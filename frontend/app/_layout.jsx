import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ThemeProvider, AuthProvider, QuizProvider, useAuth, useTheme } from "../src/contexts";
import { ToastNotification } from "../src/components";

const GlobalStyles = ({ bg }) => (
  <style type="text/css">{`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
    
    html, body {
      overflow-x: hidden;
      background-color: ${bg} !important;
    }
    
    /* Expo Web scrolls inside #root — target it directly */
    #root {
      overflow-x: hidden;
      overflow-y: auto !important;
      height: 100vh !important;
      background-color: ${bg} !important;
      /* Pushes all scrollable content above the fixed nav bar */
      padding-bottom: 90px !important;
    }
    
    * {
      font-family: 'Nunito', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
      box-sizing: border-box;
    }

    @keyframes fadeSlideDown {
      0% { opacity: 0; transform: translate(-50%, -20px); }
      100% { opacity: 1; transform: translate(-50%, 0); }
    }
    
    @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    
    @keyframes scaleIn {
      0% { opacity: 0; transform: scale(0.9); }
      100% { opacity: 1; transform: scale(1); }
    }
    
    @keyframes slideDown {
      0% { opacity: 0; transform: translateY(-50px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    
    /* ── Nav clearance: all pages get bottom padding equal to nav height ── */
    :root {
      --nav-height: 80px;
    }
    /* Every direct page wrapper div clears the fixed nav */
    html body > div > div > div > div[style*="min-height"],
    html body > div > div > div > div > div[style*="min-height"] {
      padding-bottom: var(--nav-height) !important;
    }
    
    /* Press animations for Tap component */
    .tap-element {
      transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      cursor: pointer;
      user-select: none;
    }
    .tap-element:active {
      transform: scale(0.96) !important;
    }
    .tap-element:hover {
      filter: brightness(0.95);
    }
  `}</style>
);

const RootContent = () => {
  const { user, isLoading } = useAuth();
  const { isDark, theme } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  // Basic Toast implementation
  const [toast, setToast] = useState({ msg: null, color: null });
  // Need to expose it globally or via a ToastProvider, but for now we'll handle it inside screens

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(onboarding)';
    const isLoggedIn = !!user.name && !!user.cls;

    if (!isLoggedIn && !inAuthGroup) {
      // Redirect to onboarding if not logged in
      router.replace('/(onboarding)');
    } else if (isLoggedIn && inAuthGroup) {
      // Redirect to app if logged in and in auth group
      router.replace('/(tabs)');
    }
  }, [user.name, user.cls, segments, isLoading]);

  if (isLoading) return null;

  return (
    <>
      <GlobalStyles bg={theme.bg} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg } }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="subject/[name]" />
        <Stack.Screen name="chapter/[name]" />
        <Stack.Screen name="quiz/[chapter]" />
        <Stack.Screen name="results" />
        <Stack.Screen name="shop" />
      </Stack>
      {toast.msg && <ToastNotification msg={toast.msg} color={toast.color} onClose={() => setToast({ msg: null, color: null })} />}
    </>
  );
};

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QuizProvider>
          <RootContent />
        </QuizProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

import React from 'react';
import { Slot, useRouter, usePathname } from 'expo-router';
import { BottomNav } from "../../src/components";
import { BottomNavSpacer } from '../../src/components/BottomNavSpacer';

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();

  let page = "dashboard";
  if (pathname.includes('/quiz')) page = "browser";
  if (pathname.includes('/mistakes')) page = "mistakebank";
  if (pathname.includes('/leaderboard')) page = "leaderboard";
  if (pathname.includes('/profile')) page = "profile";

  const nav = (id) => {
    if (id === "dashboard") router.replace('/(tabs)');
    if (id === "browser") router.replace('/(tabs)/quiz');
    if (id === "mistakebank") router.replace('/(tabs)/mistakes');
    if (id === "leaderboard") router.replace('/(tabs)/leaderboard');
    if (id === "profile") router.replace('/(tabs)/profile');
  };

  return (
    <>
      <Slot />
      <BottomNav page={page} nav={nav} />
    </>
  );
}

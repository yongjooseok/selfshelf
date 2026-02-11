import React, { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useProductStore } from '../src/store/productStore';
import { useHistoryStore } from '../src/store/historyStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { COLORS } from '../src/utils/constants';
import '../src/i18n';

export default function RootLayout() {
  const router = useRouter();
  const loadProducts = useProductStore((s) => s.load);
  const loadHistory = useHistoryStore((s) => s.load);
  const loadSettings = useSettingsStore((s) => s.load);
  const hasSeenOnboarding = useSettingsStore((s) => s.hasSeenOnboarding);
  const settingsLoaded = useSettingsStore((s) => s.loaded);

  const [storesReady, setStoresReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadProducts(), loadHistory(), loadSettings()]);
      setStoresReady(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (storesReady && settingsLoaded && !hasSeenOnboarding) {
      router.replace('/onboarding');
    }
  }, [storesReady, settingsLoaded, hasSeenOnboarding]);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="register"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="results" />
        <Stack.Screen
          name="paywall"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="onboarding"
          options={{ presentation: 'fullScreenModal' }}
        />
      </Stack>
    </>
  );
}

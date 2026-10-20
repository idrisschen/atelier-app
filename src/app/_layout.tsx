import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Colors } from '@/constants/theme';
import { StoreProvider, useStore } from '@/lib/store';

SplashScreen.preventAutoHideAsync();

const c = Colors.dark;
const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: c.background, card: c.backgroundElement, text: c.text, primary: c.accent, border: c.border } };

function Routes() {
  const { state, ready } = useStore();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <ThemeProvider value={theme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.background } }}>
        <Stack.Protected guard={!!state.profile}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="contenu/[id]" />
          <Stack.Screen name="contenu/nouveau" options={{ presentation: 'modal' }} />
          <Stack.Screen name="sortie/nouvelle" options={{ presentation: 'modal' }} />
          <Stack.Screen name="reglages" options={{ presentation: 'modal' }} />
        </Stack.Protected>
        <Stack.Protected guard={!state.profile}>
          <Stack.Screen name="bienvenue" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <StoreProvider>
      <Routes />
    </StoreProvider>
  );
}

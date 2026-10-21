import { DarkTheme, router, Stack, ThemeProvider, type Href } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Colors } from '@/constants/theme';
import { ecouterRappels, planifierRappels } from '@/lib/rappels';
import { StoreProvider, useStore } from '@/lib/store';

SplashScreen.preventAutoHideAsync();

const c = Colors.dark;
const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: c.background, card: c.backgroundElement, text: c.text, primary: c.accent, border: c.border } };

function Routes() {
  const { state, ready } = useStore();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  // Les rappels suivent l'état : un contenu publié, une sortie ajoutée ou cochée les replanifie.
  useEffect(() => {
    if (ready) planifierRappels(state).catch((e) => console.error('rappels', e));
  }, [ready, state.contenus, state.sorties, state.position, state.reglages.rappels]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => ecouterRappels((url) => router.push(url as Href)), []);

  if (!ready) return null;

  return (
    <ThemeProvider value={theme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.background } }}>
        <Stack.Protected guard={!!state.profile}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="contenu/[id]" />
          <Stack.Screen name="contenus" />
          <Stack.Screen name="objectif" options={{ presentation: 'modal' }} />
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

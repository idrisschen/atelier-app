// iOS 26 : la barre native est en liquid glass d'office. Icône et libellé court sous chaque onglet.
import { NativeTabs } from 'expo-router/native-tabs';

import { useTheme } from '@/hooks/use-theme';

const ONGLETS = [
  { name: 'index', label: 'Aujourd’hui', sf: { default: 'sun.max', selected: 'sun.max.fill' }, md: 'wb_sunny' },
  { name: 'creer', label: 'Créer', sf: { default: 'ticket', selected: 'ticket.fill' }, md: 'confirmation_number' },
  { name: 'sortir', label: 'Sortir', sf: { default: 'map', selected: 'map.fill' }, md: 'map' },
  { name: 'objectif', label: 'Objectif', sf: { default: 'flag', selected: 'flag.fill' }, md: 'flag' },
] as const;

export default function AppTabs() {
  const colors = useTheme();
  return (
    <NativeTabs tintColor={colors.accent} minimizeBehavior="onScrollDown">
      {ONGLETS.map((o) => (
        <NativeTabs.Trigger key={o.name} name={o.name}>
          <NativeTabs.Trigger.Label>{o.label}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={o.sf} md={o.md} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}

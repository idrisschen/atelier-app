// iOS 26 : la barre native est en liquid glass d'office. Trois onglets, et le + à part dans son rond (comme Flighty) :
// le rôle « search » est celui qu'iOS détache de la barre.
import { NativeTabs } from 'expo-router/native-tabs';

import { useTheme } from '@/hooks/use-theme';

const ONGLETS = [
  { name: 'index', label: 'Aujourd’hui', sf: { default: 'sun.max', selected: 'sun.max.fill' }, md: 'wb_sunny' },
  { name: 'sortir', label: 'Sortir', sf: { default: 'map', selected: 'map.fill' }, md: 'map' },
  { name: 'bilan', label: 'Bilan', sf: { default: 'person.text.rectangle', selected: 'person.text.rectangle.fill' }, md: 'badge' },
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
      <NativeTabs.Trigger name="creer" role="search">
        <NativeTabs.Trigger.Label>Créer</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="plus" md="add" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

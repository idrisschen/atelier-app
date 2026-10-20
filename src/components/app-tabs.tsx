import { NativeTabs } from 'expo-router/native-tabs';

import { useTheme } from '@/hooks/use-theme';

export default function AppTabs() {
  const colors = useTheme();

  return (
    <NativeTabs tintColor={colors.accent} labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Aujourd&apos;hui</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'sun.max', selected: 'sun.max.fill' }} md="today" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="creer">
        <NativeTabs.Trigger.Label>Créer</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'ticket', selected: 'ticket.fill' }} md="confirmation_number" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="sortir">
        <NativeTabs.Trigger.Label>Sortir</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'map', selected: 'map.fill' }} md="map" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="objectif">
        <NativeTabs.Trigger.Label>Objectif</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'flag', selected: 'flag.fill' }} md="flag" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

// Version web (aperçu navigateur) : capsule de verre flottante en bas, icônes seules, comme la barre iOS 26.
import { Tabs, TabList, TabTrigger, TabSlot, type TabTriggerSlotProps, type TabListProps } from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';

import { Glass } from '@/components/glass';
import { Icon, type NomIcone } from '@/components/icon';
import { Radius, Spacing } from '@/constants/theme';

const ONGLETS: { name: string; href: '/' | '/creer' | '/sortir' | '/objectif'; label: string; icon: NomIcone }[] = [
  { name: 'index', href: '/', label: 'Aujourd’hui', icon: 'aujourdhui' },
  { name: 'creer', href: '/creer', label: 'Créer', icon: 'creer' },
  { name: 'sortir', href: '/sortir', label: 'Sortir', icon: 'sortir' },
  { name: 'objectif', href: '/objectif', label: 'Objectif', icon: 'objectif' },
];

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <Bar>
          {ONGLETS.map((o) => (
            <TabTrigger key={o.name} name={o.name} href={o.href} asChild>
              <TabButton icon={o.icon} label={o.label} />
            </TabTrigger>
          ))}
        </Bar>
      </TabList>
    </Tabs>
  );
}

function TabButton({ isFocused, icon, label, ref: _ref, ...props }: TabTriggerSlotProps & { icon: NomIcone; label: string }) {
  return (
    <Pressable {...props} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: !!isFocused }} style={({ pressed }) => [styles.button, pressed && { transform: [{ scale: 0.92 }] }]}>
      <View style={[styles.pastille, isFocused && styles.active]}>
        <Icon name={icon} size={22} color={isFocused ? 'accent' : 'textSecondary'} />
      </View>
    </Pressable>
  );
}

function Bar(props: TabListProps) {
  return (
    <View style={styles.zone} pointerEvents="box-none">
      <Glass radius={Radius.pill} intensite={60} style={styles.bar}>
        <View {...props} style={styles.rangee}>
          {props.children}
        </View>
      </Glass>
    </View>
  );
}

const styles = StyleSheet.create({
  zone: { position: 'absolute', bottom: Spacing.three, left: 0, right: 0, alignItems: 'center' },
  bar: { padding: 6 },
  rangee: { flexDirection: 'row', gap: 4 },
  button: { width: 64, height: 48, alignItems: 'center', justifyContent: 'center' },
  pastille: { width: 56, height: 40, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  active: { backgroundColor: 'rgba(91,140,255,0.18)' },
});

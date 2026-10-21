// Version web (aperçu navigateur) : capsule de verre à trois onglets et le + à part dans son rond, comme la barre iOS 26.
import { Tabs, TabList, TabTrigger, TabSlot, type TabTriggerSlotProps, type TabListProps } from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Glass } from '@/components/glass';
import { Icon, type NomIcone } from '@/components/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const ONGLETS: { name: string; href: '/' | '/sortir' | '/bilan'; label: string; icon: NomIcone }[] = [
  { name: 'index', href: '/', label: 'Aujourd’hui', icon: 'aujourdhui' },
  { name: 'sortir', href: '/sortir', label: 'Sortir', icon: 'sortir' },
  { name: 'bilan', href: '/bilan', label: 'Bilan', icon: 'bilan' },
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
          <TabTrigger name="creer" href="/creer" asChild>
            <Plus />
          </TabTrigger>
        </Bar>
      </TabList>
    </Tabs>
  );
}

function TabButton({ isFocused, icon, label, ref: _ref, ...props }: TabTriggerSlotProps & { icon: NomIcone; label: string }) {
  const theme = useTheme();
  return (
    <Pressable {...props} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: !!isFocused }} style={({ pressed }) => [styles.button, pressed && { transform: [{ scale: 0.92 }] }]}>
      <View style={[styles.pastille, isFocused && styles.active]}>
        <Icon name={icon} size={20} color={isFocused ? 'accent' : 'textSecondary'} />
        <Text numberOfLines={1} style={[styles.label, { color: isFocused ? theme.accent : theme.textSecondary }]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function Plus({ isFocused, ref: _ref, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} accessibilityRole="tab" accessibilityLabel="Créer" accessibilityState={{ selected: !!isFocused }} style={({ pressed }) => [styles.plus, pressed && { transform: [{ scale: 0.92 }] }]}>
      <Glass radius={33} intensite={60} style={[styles.rond, isFocused && styles.active]}>
        <Icon name="ajouter" size={26} color={isFocused ? 'accent' : 'text'} />
      </Glass>
    </Pressable>
  );
}

// Le dernier enfant (le +) sort de la capsule : il a son propre rond, à côté.
function Bar({ children, ...props }: TabListProps) {
  const enfants = Array.isArray(children) ? children.flat() : [children];
  const plus = enfants.pop();
  return (
    <View style={styles.zone} pointerEvents="box-none">
      <View {...props} style={styles.ligne}>
        <Glass radius={Radius.pill} intensite={60} style={styles.bar}>
          <View style={styles.rangee}>{enfants}</View>
        </Glass>
        {plus}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  zone: { position: 'absolute', bottom: Spacing.three, left: 0, right: 0, alignItems: 'center' },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  plus: { width: 66, height: 66 },
  rond: { width: 66, height: 66, alignItems: 'center', justifyContent: 'center' },
  bar: { padding: 6 },
  rangee: { flexDirection: 'row', gap: 4 },
  button: { width: 84, height: 54, alignItems: 'center', justifyContent: 'center' },
  pastille: { width: 80, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', gap: 2 },
  label: { fontSize: 10, fontWeight: '600' },
  active: { backgroundColor: 'rgba(91,140,255,0.18)' },
});

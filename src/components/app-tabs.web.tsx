// Version web (aperçu navigateur) : barre d'onglets en bas, comme sur iPhone.
import { Tabs, TabList, TabTrigger, TabSlot, type TabTriggerSlotProps, type TabListProps } from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const ONGLETS = [
  { name: 'index', href: '/', label: "Aujourd'hui" },
  { name: 'creer', href: '/creer', label: 'Créer' },
  { name: 'sortir', href: '/sortir', label: 'Sortir' },
  { name: 'objectif', href: '/objectif', label: 'Objectif' },
] as const;

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <Bar>
          {ONGLETS.map((o) => (
            <TabTrigger key={o.name} name={o.name} href={o.href} asChild>
              <TabButton>{o.label}</TabButton>
            </TabTrigger>
          ))}
        </Bar>
      </TabList>
    </Tabs>
  );
}

function TabButton({ children, isFocused, ref: _ref, ...props }: TabTriggerSlotProps) {
  const theme = useTheme();
  return (
    <Pressable {...props} style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}>
      <Text style={[styles.label, { color: isFocused ? theme.accent : theme.textSecondary }]}>{children}</Text>
    </Pressable>
  );
}

function Bar(props: TabListProps) {
  const theme = useTheme();
  return (
    <View {...props} style={[styles.bar, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: Spacing.three,
    left: Spacing.three,
    right: Spacing.three,
    maxWidth: 560,
    marginHorizontal: 'auto',
    flexDirection: 'row',
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.one,
  },
  button: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontWeight: '700' },
});

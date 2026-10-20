import * as Haptics from 'expo-haptics';
import { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export const tap = () => {
  if (Platform.OS === 'ios') Haptics.selectionAsync();
};

// ---------- texte ----------

type Variant = 'display' | 'title' | 'heading' | 'body' | 'small' | 'overline';

export function Txt({ variant = 'body', color, style, ...rest }: TextProps & { variant?: Variant; color?: ThemeColor }) {
  const theme = useTheme();
  return <Text style={[{ color: theme[color ?? (variant === 'overline' ? 'textSecondary' : 'text')] }, text[variant], style]} {...rest} />;
}

const text = StyleSheet.create({
  display: { fontSize: 38, lineHeight: 40, fontWeight: '800', letterSpacing: -1.2 },
  title: { fontSize: 26, lineHeight: 30, fontWeight: '700', letterSpacing: -0.6 },
  heading: { fontSize: 18, lineHeight: 23, fontWeight: '700', letterSpacing: -0.2 },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  small: { fontSize: 14, lineHeight: 19, fontWeight: '400' },
  overline: { fontSize: 12, lineHeight: 16, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
});

// ---------- écran ----------

export function Screen({ title, kicker, children, right }: { title: string; kicker?: string; children: ReactNode; right?: ReactNode }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      contentContainerStyle={{
        paddingTop: insets.top + Spacing.four,
        paddingBottom: insets.bottom + BottomTabInset + Spacing.five,
        paddingHorizontal: Spacing.three,
        alignItems: 'center',
      }}>
      <View style={{ width: '100%', maxWidth: MaxContentWidth, gap: Spacing.three }}>
        <View style={styles.header}>
          <View style={{ flex: 1, gap: Spacing.one }}>
            {kicker ? <Txt variant="overline">{kicker}</Txt> : null}
            <Txt variant="display">{title}</Txt>
          </View>
          {right}
        </View>
        {children}
      </View>
    </ScrollView>
  );
}

// ---------- blocs ----------

export function Card({ children, style, tone = 'element' }: { children: ReactNode; style?: ViewStyle; tone?: 'element' | 'accent' }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        tone === 'accent'
          ? { backgroundColor: theme.accent, borderColor: theme.accent }
          : { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        style,
      ]}>
      {children}
    </View>
  );
}

export function Button({
  label,
  onPress,
  loading,
  disabled,
  kind = 'primary',
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  kind?: 'primary' | 'secondary' | 'ghost';
}) {
  const theme = useTheme();
  const off = disabled || loading;
  const bg = kind === 'primary' ? theme.text : kind === 'secondary' ? theme.backgroundSelected : 'transparent';
  const fg = kind === 'primary' ? theme.background : theme.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      disabled={off}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [styles.button, { backgroundColor: bg, opacity: off ? 0.45 : pressed ? 0.8 : 1 }]}>
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>}
    </Pressable>
  );
}

export function Field({ label, hint, style, ...rest }: TextInputProps & { label: string; hint?: string }) {
  const theme = useTheme();
  return (
    <View style={{ gap: Spacing.two }}>
      <Txt variant="overline">{label}</Txt>
      <TextInput
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.border },
          rest.multiline && { minHeight: 96, textAlignVertical: 'top' },
          style,
        ]}
        {...rest}
      />
      {hint ? <Txt variant="small" color="textSecondary">{hint}</Txt> : null}
    </View>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={() => {
        tap();
        onPress();
      }}
      style={[
        styles.chip,
        selected ? { backgroundColor: theme.text, borderColor: theme.text } : { borderColor: theme.border, backgroundColor: theme.backgroundElement },
      ]}>
      <Text style={{ color: selected ? theme.background : theme.text, fontSize: 15, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <Txt variant="small" color="accent" accessibilityLiveRegion="polite">
      {message}
    </Txt>
  );
}

export function DemoBadge() {
  const theme = useTheme();
  return (
    <View style={[styles.badge, { borderColor: theme.border }]}>
      <Txt variant="overline">Démo</Txt>
    </View>
  );
}

export function Divider() {
  const theme = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.border }} />;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.three, marginBottom: Spacing.two },
  card: { borderRadius: Radius.large, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.three, gap: Spacing.two },
  button: { minHeight: 52, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.four },
  buttonText: { fontSize: 16, fontWeight: '700' },
  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.medium, paddingHorizontal: Spacing.three, paddingVertical: 14, fontSize: 16 },
  chip: { borderWidth: 1, borderRadius: Radius.pill, paddingHorizontal: Spacing.three, paddingVertical: 10, minHeight: 44, justifyContent: 'center' },
  badge: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: Radius.pill, paddingHorizontal: Spacing.two, paddingVertical: 2 },
});

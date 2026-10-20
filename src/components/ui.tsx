import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
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

import { BottomTabInset, Fonts, MaxContentWidth, Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export const tap = () => {
  if (Platform.OS === 'ios') Haptics.selectionAsync();
};

export const succes = () => {
  if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

// ---------- texte ----------

type Variant = 'display' | 'title' | 'heading' | 'body' | 'small' | 'label';

export function Txt({ variant = 'body', color, style, ...rest }: TextProps & { variant?: Variant; color?: ThemeColor }) {
  const theme = useTheme();
  return <Text style={[{ color: theme[color ?? (variant === 'label' ? 'textSecondary' : 'text')] }, text[variant], style]} {...rest} />;
}

// Les chiffres : arrondis (SF Pro Rounded) et à chasse fixe pour ne pas danser quand ils changent.
export function Num({ size = 44, color, style, ...rest }: TextProps & { size?: number; color?: ThemeColor }) {
  const theme = useTheme();
  return (
    <Text
      style={[
        { color: theme[color ?? 'text'], fontSize: size, lineHeight: size * 1.08, fontFamily: Fonts.rounded, fontWeight: '700', letterSpacing: -size * 0.03, fontVariant: ['tabular-nums'] },
        style,
      ]}
      {...rest}
    />
  );
}

const text = StyleSheet.create({
  display: { fontSize: 34, lineHeight: 38, fontWeight: '800', letterSpacing: -0.8 },
  title: { fontSize: 22, lineHeight: 27, fontWeight: '700', letterSpacing: -0.4 },
  heading: { fontSize: 17, lineHeight: 22, fontWeight: '600', letterSpacing: -0.2 },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  small: { fontSize: 14, lineHeight: 19, fontWeight: '400' },
  label: { fontSize: 11, lineHeight: 14, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase' },
});

// ---------- écran ----------

export function Screen({ title, kicker, children, right, back }: { title: string; kicker?: string; children: ReactNode; right?: ReactNode; back?: boolean }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      contentContainerStyle={{
        paddingTop: insets.top + Spacing.three,
        paddingBottom: insets.bottom + BottomTabInset + Spacing.five,
        paddingHorizontal: Spacing.three,
        alignItems: 'center',
      }}>
      <View style={{ width: '100%', maxWidth: MaxContentWidth, gap: Spacing.three }}>
        {back ? (
          <Pressable accessibilityRole="button" hitSlop={12} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={{ alignSelf: 'flex-start' }}>
            <Txt color="accent" style={{ fontWeight: '600' }}>‹ Retour</Txt>
          </Pressable>
        ) : null}
        <View style={styles.header}>
          <View style={{ flex: 1, gap: 2 }}>
            {kicker ? <Txt variant="label">{kicker}</Txt> : null}
            <Txt variant="display">{title}</Txt>
          </View>
          {right}
        </View>
        {children}
      </View>
    </ScrollView>
  );
}

export function Section({ titre, action, children }: { titre: string; action?: ReactNode; children: ReactNode }) {
  return (
    <View style={{ gap: Spacing.two }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.two }}>
        <Txt variant="label" style={{ flex: 1 }}>{titre}</Txt>
        {action}
      </View>
      {children}
    </View>
  );
}

// Un titre et une rangée de puces qui passent à la ligne.
export function Groupe({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <View style={{ gap: Spacing.two }}>
      <Txt variant="label">{titre}</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two }}>{children}</View>
    </View>
  );
}

// ---------- blocs ----------

export function Card({ children, style, onPress, label }: { children: ReactNode; style?: ViewStyle; onPress?: () => void; label?: string }) {
  const theme = useTheme();
  const base = [styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [...base, pressed && { backgroundColor: theme.backgroundSelected }]}>
      {children}
    </Pressable>
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
  kind?: 'primary' | 'secondary' | 'ghost' | 'danger';
}) {
  const theme = useTheme();
  const off = disabled || loading;
  const bg = kind === 'primary' ? theme.accent : kind === 'secondary' ? theme.backgroundSelected : 'transparent';
  const fg = kind === 'primary' ? theme.accentText : kind === 'danger' ? theme.danger : theme.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      disabled={off}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [styles.button, { backgroundColor: bg, opacity: off ? 0.4 : pressed ? 0.8 : 1 }]}>
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>}
    </Pressable>
  );
}

export function Field({ label, hint, style, ...rest }: TextInputProps & { label: string; hint?: string }) {
  const theme = useTheme();
  return (
    <View style={{ gap: Spacing.two }}>
      <Txt variant="label">{label}</Txt>
      <TextInput
        placeholderTextColor={theme.textTertiary}
        keyboardAppearance="dark"
        style={[
          styles.input,
          { color: theme.text, backgroundColor: theme.backgroundSelected, borderColor: theme.border },
          rest.multiline && { minHeight: 88, textAlignVertical: 'top' },
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

// Pastille d'état : un point de couleur + un mot. La couleur ne sert qu'à ça.
export function Status({ label, color }: { label: string; color: ThemeColor }) {
  const theme = useTheme();
  return (
    <View style={[styles.status, { backgroundColor: theme.backgroundSelected }]}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: theme[color] }} />
      <Text style={{ color: theme[color], fontSize: 12, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

export function Check({ checked, label, onPress }: { checked: boolean; label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.check, { opacity: pressed ? 0.7 : 1 }]}>
      <View style={[styles.box, { borderColor: checked ? theme.success : theme.textTertiary, backgroundColor: checked ? theme.success : 'transparent' }]}>
        {checked ? <Text style={{ color: theme.background, fontSize: 13, fontWeight: '900' }}>✓</Text> : null}
      </View>
      <Txt style={{ flex: 1, color: checked ? theme.textSecondary : theme.text }}>{label}</Txt>
    </Pressable>
  );
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <Txt variant="small" color="danger" accessibilityLiveRegion="polite">
      {message}
    </Txt>
  );
}

export function Divider({ dashed }: { dashed?: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={
        dashed
          ? { borderTopWidth: 1, borderStyle: 'dashed', borderColor: theme.border }
          : { height: StyleSheet.hairlineWidth, backgroundColor: theme.border }
      }
    />
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.three, marginBottom: Spacing.one },
  card: { borderRadius: Radius.large, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.three, gap: Spacing.two },
  button: { minHeight: 50, borderRadius: Radius.medium, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.four },
  buttonText: { fontSize: 16, fontWeight: '700' },
  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.medium, paddingHorizontal: Spacing.three, paddingVertical: 13, fontSize: 16 },
  chip: { borderWidth: 1, borderRadius: Radius.pill, paddingHorizontal: Spacing.three, paddingVertical: 9, minHeight: 44, justifyContent: 'center' },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  check: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, minHeight: 40 },
  box: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});

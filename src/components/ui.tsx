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
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ambient } from '@/components/ambient';
import { Glass } from '@/components/glass';
import { Icon, type NomIcone } from '@/components/icon';
import { BottomTabInset, Fonts, MaxContentWidth, Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export const tap = () => {
  if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

export const succes = () => {
  if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

// Retour au toucher : la surface s'enfonce légèrement (transform, sans décaler la mise en page).
const presse = (pressed: boolean) => (pressed ? { transform: [{ scale: 0.97 }], opacity: 0.92 } : null);

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
  label: { fontSize: 12, lineHeight: 15, fontWeight: '600', letterSpacing: 0.4 },
});

// ---------- écran ----------

export function Screen({
  title,
  icon,
  children,
  right,
  back,
  accent,
}: {
  title: string;
  icon?: NomIcone;
  children: ReactNode;
  right?: ReactNode;
  back?: boolean;
  accent?: string;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1 }}>
      <Ambient accent={accent} />
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.three,
          paddingBottom: insets.bottom + BottomTabInset + Spacing.six,
          paddingHorizontal: Spacing.three,
          alignItems: 'center',
        }}>
        <View style={{ width: '100%', maxWidth: MaxContentWidth, gap: Spacing.three }}>
          <View style={styles.header}>
            {back ? <IconButton icon="retour" label="Retour" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} /> : null}
            {icon ? <Icon name={icon} size="lg" color="textSecondary" /> : null}
            <Txt variant="display" style={{ flex: 1 }} numberOfLines={1} adjustsFontSizeToFit>
              {title}
            </Txt>
            {right}
          </View>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

// Titre de section : une icône et un mot, l'action éventuelle à droite.
export function Section({ titre, icon, action, children }: { titre: string; icon?: NomIcone; action?: ReactNode; children: ReactNode }) {
  return (
    <View style={{ gap: Spacing.two }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.two, minHeight: 28 }}>
        {icon ? <Icon name={icon} size="sm" color="textSecondary" /> : null}
        <Txt variant="label" style={{ flex: 1 }}>{titre}</Txt>
        {action}
      </View>
      {children}
    </View>
  );
}

// Un titre et une rangée de puces qui passent à la ligne.
export function Groupe({ titre, icon, children }: { titre: string; icon?: NomIcone; children: ReactNode }) {
  return (
    <View style={{ gap: Spacing.two }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
        {icon ? <Icon name={icon} size="sm" color="textSecondary" /> : null}
        <Txt variant="label">{titre}</Txt>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two }}>{children}</View>
    </View>
  );
}

// ---------- blocs ----------

export function Card({
  children,
  style,
  onPress,
  label,
  teinte,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  label?: string;
  teinte?: string;
}) {
  const contenu = <View style={[styles.card, style]}>{children}</View>;
  if (!onPress) return <Glass teinte={teinte}>{contenu}</Glass>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => presse(pressed)}>
      <Glass teinte={teinte} interactif>
        {contenu}
      </Glass>
    </Pressable>
  );
}

export function Button({
  label,
  icon,
  onPress,
  loading,
  disabled,
  kind = 'primary',
}: {
  label: string;
  icon?: NomIcone;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  kind?: 'primary' | 'secondary' | 'ghost' | 'danger';
}) {
  const theme = useTheme();
  const off = disabled || loading;
  const fg: ThemeColor = kind === 'primary' ? 'accentText' : kind === 'danger' ? 'danger' : 'text';
  const corps = (
    <View style={styles.buttonInner}>
      {loading ? (
        <ActivityIndicator color={theme[fg]} />
      ) : (
        <>
          {icon ? <Icon name={icon} size="md" color={fg} /> : null}
          <Text style={[styles.buttonText, { color: theme[fg] }]}>{label}</Text>
        </>
      )}
    </View>
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      disabled={off}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [{ opacity: off ? 0.4 : 1 }, presse(pressed)]}>
      {kind === 'primary' ? (
        <View style={[styles.button, { backgroundColor: theme.accent, shadowColor: theme.accent }, styles.lueur]}>{corps}</View>
      ) : kind === 'ghost' ? (
        <View style={styles.button}>{corps}</View>
      ) : (
        <Glass radius={Radius.medium} style={styles.button} interactif>
          {corps}
        </Glass>
      )}
    </Pressable>
  );
}

// Bouton rond en verre, icône seule : le libellé reste lu par VoiceOver.
export function IconButton({ icon, label, onPress, color = 'text', taille = 44 }: { icon: NomIcone; label: string; onPress: () => void; color?: ThemeColor; taille?: number }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => presse(pressed)}>
      <Glass radius={taille / 2} style={{ width: taille, height: taille, alignItems: 'center', justifyContent: 'center' }} interactif>
        <Icon name={icon} size={taille * 0.42} color={color} />
      </Glass>
    </Pressable>
  );
}

export function Field({ label, icon, hint, style, ...rest }: TextInputProps & { label: string; icon?: NomIcone; hint?: string }) {
  const theme = useTheme();
  return (
    <View style={{ gap: Spacing.two }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
        {icon ? <Icon name={icon} size="sm" color="textSecondary" /> : null}
        <Txt variant="label">{label}</Txt>
      </View>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.textTertiary}
        keyboardAppearance="dark"
        selectionColor={theme.accent}
        style={[styles.input, { color: theme.text }, rest.multiline && { minHeight: 88, textAlignVertical: 'top' }, style]}
        {...rest}
      />
      {hint ? <Txt variant="small" color="textSecondary">{hint}</Txt> : null}
    </View>
  );
}

export function Chip({ label, icon, selected, onPress }: { label: string; icon?: NomIcone; selected: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => presse(pressed)}>
      {selected ? (
        <View style={[styles.chip, { backgroundColor: theme.text }]}>
          {icon ? <Icon name={icon} size="sm" color="background" /> : null}
          <Text style={[styles.chipText, { color: theme.background }]}>{label}</Text>
        </View>
      ) : (
        <Glass radius={Radius.pill} style={styles.chip} interactif>
          {icon ? <Icon name={icon} size="sm" color="textSecondary" /> : null}
          <Text style={[styles.chipText, { color: theme.text }]}>{label}</Text>
        </Glass>
      )}
    </Pressable>
  );
}

// Pastille d'état : une icône dans la couleur du statut + un mot. La couleur ne porte jamais le sens seule.
export function Status({ label, color, icon }: { label: string; color: ThemeColor; icon?: NomIcone }) {
  const theme = useTheme();
  return (
    <View style={[styles.status, { backgroundColor: `${theme[color]}22` }]}>
      {icon ? <Icon name={icon} size={12} color={color} /> : <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: theme[color] }} />}
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
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.check, presse(pressed)]}>
      <View style={[styles.box, { borderColor: checked ? theme.success : theme.textTertiary, backgroundColor: checked ? theme.success : 'transparent' }]}>
        {checked ? <Icon name="ok" size={13} color="background" /> : null}
      </View>
      <Txt style={{ flex: 1, color: checked ? theme.textSecondary : theme.text, textDecorationLine: checked ? 'line-through' : 'none' }}>{label}</Txt>
    </Pressable>
  );
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View style={{ flexDirection: 'row', gap: Spacing.two, alignItems: 'center' }} accessibilityLiveRegion="polite">
      <Icon name="attention" size="sm" color="danger" />
      <Txt variant="small" color="danger" style={{ flex: 1 }}>{message}</Txt>
    </View>
  );
}

export function Divider({ dashed }: { dashed?: boolean }) {
  return (
    <View
      style={
        dashed
          ? { borderTopWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.14)' }
          : { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.12)' }
      }
    />
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginBottom: Spacing.one, minHeight: 44 },
  card: { padding: Spacing.three, gap: Spacing.two },
  button: { minHeight: 52, borderRadius: Radius.medium, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.four },
  buttonInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two },
  buttonText: { fontSize: 16, fontWeight: '700' },
  lueur: { shadowOpacity: 0.45, shadowRadius: 18, shadowOffset: { width: 0, height: 6 } },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    paddingVertical: 13,
    fontSize: 16,
  },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, minHeight: 40, borderRadius: Radius.pill },
  chipText: { fontSize: 15, fontWeight: '600' },
  status: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', borderRadius: Radius.pill, paddingHorizontal: 9, paddingVertical: 4 },
  check: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, minHeight: 44 },
  box: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});

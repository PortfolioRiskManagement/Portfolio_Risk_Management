import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { forwardRef, type ComponentProps, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brand, useTheme, type Colors } from '../lib/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];
export type Tone = 'positive' | 'warning' | 'negative' | 'info';

export function toneColor(colors: Colors, tone: Tone) {
  if (tone === 'positive') return colors.positive;
  if (tone === 'warning') return colors.warning;
  if (tone === 'negative') return colors.negative;
  return colors.accent;
}

/** Scrollable page with the soft brand glow at the top, like the website. */
export function Screen({
  children,
  onRefresh,
  refreshing = false,
  edges = 'top',
}: {
  children: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  edges?: 'top' | 'none';
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={colors.isDark ? ['rgba(99,102,241,0.22)', 'rgba(99,102,241,0)'] : ['rgba(99,102,241,0.12)', 'rgba(99,102,241,0)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.8, y: 0 }}
        end={{ x: 0.3, y: 0.45 }}
        pointerEvents="none"
      />
      <ScrollView
        contentContainerStyle={{ paddingTop: edges === 'top' ? insets.top + 12 : 12, paddingBottom: 40, paddingHorizontal: 20, gap: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textMuted} /> : undefined}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: StyleSheet.hairlineWidth,
          borderRadius: 20,
          padding: 18,
        },
        !colors.isDark && styles.lightShadow,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Label({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const { colors } = useTheme();
  return <Text style={[styles.label, { color: colors.textMuted }, style]}>{children}</Text>;
}

export function Heading({ children, size = 'lg' }: { children: ReactNode; size?: 'xl' | 'lg' | 'md' }) {
  const { colors } = useTheme();
  const fontSize = size === 'xl' ? 30 : size === 'lg' ? 22 : 17;
  return <Text style={{ color: colors.text, fontSize, fontWeight: '700', letterSpacing: -0.5 }}>{children}</Text>;
}

export function Body({ children, muted = true, style }: { children: ReactNode; muted?: boolean; style?: StyleProp<TextStyle> }) {
  const { colors } = useTheme();
  return <Text style={[{ color: muted ? colors.textMuted : colors.text, fontSize: 15, lineHeight: 22 }, style]}>{children}</Text>;
}

/** Card header row: uppercase label on the left, optional action on the right. */
export function CardHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.cardHeader}>
      <Label>{title}</Label>
      {action && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '600' }}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function IconTile({ name, tone = 'info', size = 36 }: { name: IconName; tone?: Tone; size?: number }) {
  const { colors } = useTheme();
  const color = toneColor(colors, tone);
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.3, alignItems: 'center', justifyContent: 'center', backgroundColor: `${color}1f` }}>
      <Ionicons name={name} size={size * 0.48} color={color} />
    </View>
  );
}

export function Badge({ text, tone = 'info' }: { text: string; tone?: Tone | 'neutral' }) {
  const { colors } = useTheme();
  const color = tone === 'neutral' ? colors.textMuted : toneColor(colors, tone);
  return (
    <View style={{ backgroundColor: tone === 'neutral' ? colors.surfaceMuted : `${color}1f`, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
      <Text style={{ color, fontSize: 12, fontWeight: '600' }}>{text}</Text>
    </View>
  );
}

export function ScoreBar({ value, colors: barColors = brand.gradient }: { value: number; colors?: readonly [string, string, ...string[]] }) {
  const { colors } = useTheme();
  return (
    <View style={{ height: 6, borderRadius: 999, backgroundColor: colors.track, overflow: 'hidden' }}>
      <LinearGradient
        colors={barColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: '100%', width: `${Math.max(3, Math.min(100, value))}%`, borderRadius: 999 }}
      />
    </View>
  );
}

export function GradientButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={({ pressed }) => ({ opacity: disabled ? 0.5 : pressed ? 0.85 : 1 })}>
      <LinearGradient colors={['#2563eb', '#4f46e5', '#7c3aed']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.button}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            {icon && <Ionicons name={icon} size={18} color="#fff" />}
            <Text style={styles.buttonText}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

export function OutlineButton({ title, onPress, icon, tone }: { title: string; onPress: () => void; icon?: IconName; tone?: 'negative' }) {
  const { colors } = useTheme();
  const color = tone === 'negative' ? colors.negative : colors.text;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { borderWidth: 1, borderColor: colors.border, backgroundColor: pressed ? colors.surfaceMuted : colors.surface },
      ]}
    >
      {icon && <Ionicons name={icon} size={18} color={color} />}
      <Text style={[styles.buttonText, { color }]}>{title}</Text>
    </Pressable>
  );
}

export const Input = forwardRef<TextInput, TextInputProps & { label: string; hint?: string; right?: ReactNode }>(function Input(
  { label, hint, right, style, ...props },
  ref,
) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>{label}</Text>
      <View style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textSubtle}
          style={[{ flex: 1, color: colors.text, fontSize: 16, paddingVertical: 14 }, style]}
          {...props}
        />
        {right}
      </View>
      {hint && <Text style={{ color: colors.textSubtle, fontSize: 12 }}>{hint}</Text>}
    </View>
  );
});

export function ErrorBox({ message }: { message: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ borderRadius: 12, padding: 12, backgroundColor: `${colors.negative}1a`, borderWidth: 1, borderColor: `${colors.negative}40` }}>
      <Text style={{ color: colors.negative, fontSize: 14, lineHeight: 20 }}>{message}</Text>
    </View>
  );
}

/** The FIN/AI wordmark badge from the website. */
export function BrandMark({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const large = size === 'lg';
  return (
    <LinearGradient
      colors={brand.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: large ? 14 : 10, paddingHorizontal: large ? 16 : 11, paddingVertical: large ? 9 : 6, alignSelf: 'flex-start' }}
    >
      <Text style={{ color: '#fff', fontWeight: '900', letterSpacing: 1, fontSize: large ? 24 : 15 }}>FIN/AI</Text>
    </LinearGradient>
  );
}

export function Divider() {
  const { colors } = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />;
}

const styles = StyleSheet.create({
  lightShadow: {
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  button: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
});

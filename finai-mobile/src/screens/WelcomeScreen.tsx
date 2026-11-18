import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark, GradientButton, type IconName } from '../components/ui';
import { brand, useTheme } from '../lib/theme';
import type { AuthScreenProps } from '../navigation/types';

const POINTS: { icon: IconName; text: string }[] = [
  { icon: 'pulse-outline', text: 'Volatility, drawdown and concentration in plain language' },
  { icon: 'flask-outline', text: 'Stress-test your holdings against real market crises' },
  { icon: 'shield-checkmark-outline', text: 'Read-only access: we never move money or place trades' },
];

export default function WelcomeScreen({ navigation }: AuthScreenProps<'Welcome'>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={colors.isDark ? ['rgba(59,130,246,0.28)', 'rgba(168,85,247,0.18)', 'rgba(7,7,10,0)'] : ['rgba(59,130,246,0.16)', 'rgba(168,85,247,0.10)', 'rgba(244,245,251,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 0.7 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={{ flex: 1, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 20, paddingHorizontal: 24, justifyContent: 'space-between' }}>
        <BrandMark />

        <View style={{ gap: 20 }}>
          <View style={[styles.pill, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: brand.indigo }} />
            <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '600' }}>Portfolio risk, explained in plain language</Text>
          </View>
          <Text style={[styles.headline, { color: colors.text }]}>
            See the risk in your portfolio <Text style={{ color: colors.isDark ? '#a5b4fc' : brand.indigo }}>before the market does.</Text>
          </Text>
          <View style={{ gap: 14 }}>
            {POINTS.map((point) => (
              <View key={point.text} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <View style={[styles.pointIcon, { backgroundColor: colors.accentSoft }]}>
                  <Ionicons name={point.icon} size={17} color={colors.accent} />
                </View>
                <Text style={{ flex: 1, color: colors.textMuted, fontSize: 15, lineHeight: 21 }}>{point.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <GradientButton title="Create free account" icon="arrow-forward" onPress={() => navigation.navigate('Auth', { mode: 'signup' })} />
          <Pressable onPress={() => navigation.navigate('Auth', { mode: 'login' })} style={{ paddingVertical: 12, alignItems: 'center' }} hitSlop={8}>
            <Text style={{ color: colors.textMuted, fontSize: 15 }}>
              Already have an account? <Text style={{ color: colors.accent, fontWeight: '700' }}>Log in</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headline: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  pointIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

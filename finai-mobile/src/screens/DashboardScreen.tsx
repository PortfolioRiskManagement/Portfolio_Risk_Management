import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import PerformanceChart from '../components/PerformanceChart';
import { Badge, Card, CardHeader, IconTile, Label, Screen, ScoreBar, toneColor, type IconName } from '../components/ui';
import { DAILY_BRIEF, PERFORMANCE, RECENT_ACTIVITY } from '../data/sample';
import { displayName, useAuth } from '../lib/auth';
import { money, percent, signedMoney } from '../lib/format';
import { diversificationLabel, portfolioMetrics, riskLabel, TYPE_META } from '../lib/metrics';
import { useStore } from '../lib/store';
import { useTheme } from '../lib/theme';
import type { TabProps } from '../navigation/types';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function Stat({ icon, label, children }: { icon: IconName; label: string; children: React.ReactNode }) {
  return (
    <Card style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Label>{label}</Label>
        <IconTile name={icon} size={28} />
      </View>
      {children}
    </Card>
  );
}

export default function DashboardScreen({ navigation }: TabProps<'Dashboard'>) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { holdings } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const m = useMemo(() => portfolioMetrics(holdings), [holdings]);
  const risk = riskLabel(m.riskScore);
  const diversification = diversificationLabel(m.diversificationScore);
  const firstName = displayName(user).split(/\s+/)[0];
  const periodChange = ((PERFORMANCE[PERFORMANCE.length - 1].value - PERFORMANCE[0].value) / PERFORMANCE[0].value) * 100;
  const big = { color: colors.text, fontSize: 26, fontWeight: '800' as const, letterSpacing: -0.6, fontVariant: ['tabular-nums' as const] };

  // Sample data only for now; refreshing just gives the familiar pull-down feedback.
  function refresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  }

  return (
    <Screen onRefresh={refresh} refreshing={refreshing}>
      {/* Greeting */}
      <View style={{ gap: 4, marginBottom: 4 }}>
        <View style={[styles.syncPill, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.positive }} />
          <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600' }}>
            {holdings.length} holdings across {m.platforms || 1} platforms
          </Text>
        </View>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.8, marginTop: 10 }}>
          {greeting()}, {firstName}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 15 }}>Here’s where your portfolio stands today.</Text>
      </View>

      {/* Total value hero */}
      <Card>
        <Label>Total value</Label>
        <Text style={{ color: colors.text, fontSize: 38, fontWeight: '800', letterSpacing: -1.2, marginTop: 6, fontVariant: ['tabular-nums'] }}>
          {money(m.totalValue)}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, marginBottom: 16 }}>
          <Badge text={percent(m.gainPct)} tone={m.gain >= 0 ? 'positive' : 'negative'} />
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>{signedMoney(m.gain)} all time</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Label>Last 6 months</Label>
          <Text style={{ color: colors.positive, fontWeight: '700', fontSize: 13 }}>{percent(periodChange)}</Text>
        </View>
        <PerformanceChart data={PERFORMANCE} />
      </Card>

      {/* Risk + diversification */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Stat icon="shield-outline" label="Risk">
          <Text style={big}>
            {m.riskScore}
            <Text style={{ fontSize: 14, color: colors.textSubtle, fontWeight: '500' }}>/100</Text>
          </Text>
          <Text style={{ color: toneColor(colors, risk.tone), fontWeight: '700', fontSize: 13, marginVertical: 8 }}>{risk.text}</Text>
          <ScoreBar value={m.riskScore} colors={['#34d399', '#fbbf24', '#f43f5e']} />
        </Stat>
        <Stat icon="pie-chart-outline" label="Diversity">
          <Text style={big}>
            {m.diversificationScore}
            <Text style={{ fontSize: 14, color: colors.textSubtle, fontWeight: '500' }}>/100</Text>
          </Text>
          <Text style={{ color: toneColor(colors, diversification.tone), fontWeight: '700', fontSize: 13, marginVertical: 8 }} numberOfLines={1}>
            {diversification.text}
          </Text>
          <ScoreBar value={m.diversificationScore} />
        </Stat>
      </View>

      {/* Total assets + allocation */}
      <Card>
        <CardHeader title="Total assets" action="View all" onAction={() => navigation.navigate('Holdings')} />
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text style={big}>{holdings.length}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>holdings · {m.platforms || 1} platforms</Text>
        </View>
        <View style={styles.stackBar}>
          {m.byType.map((t) => (
            <View key={t.type} style={{ flex: t.weight, backgroundColor: TYPE_META[t.type].color }} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
          {m.byType.map((t) => (
            <View key={t.type} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: TYPE_META[t.type].color }} />
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                {TYPE_META[t.type].label} <Text style={{ color: colors.text, fontWeight: '700' }}>{t.weight.toFixed(0)}%</Text>
              </Text>
            </View>
          ))}
        </View>
        <View style={{ gap: 14 }}>
          {m.positions.slice(0, 5).map((p) => (
            <Pressable key={p.id} onPress={() => navigation.navigate('HoldingDetail', { id: p.id })}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>
                  {p.symbol} <Text style={{ color: colors.textMuted, fontWeight: '400' }}>{p.name}</Text>
                </Text>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14, fontVariant: ['tabular-nums'] }}>{p.weight.toFixed(1)}%</Text>
              </View>
              <View style={{ height: 5, borderRadius: 999, backgroundColor: colors.track, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${p.weight}%`, borderRadius: 999, backgroundColor: TYPE_META[p.type].color }} />
              </View>
            </Pressable>
          ))}
        </View>
      </Card>

      {/* AI brief */}
      <Card>
        <CardHeader title="AI daily brief" />
        <View style={{ gap: 16 }}>
          {DAILY_BRIEF.map((item) => (
            <View key={item.title} style={{ flexDirection: 'row', gap: 12 }}>
              <IconTile name={item.icon} tone={item.tone} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{item.title}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20, marginTop: 2 }}>{item.body}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* Activity */}
      <Card>
        <CardHeader title="Recent activity" />
        <View style={{ gap: 16 }}>
          {RECENT_ACTIVITY.map((item) => (
            <View key={item.text} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="ellipse" size={9} color={colors.accent} />
              <Text style={{ flex: 1, color: colors.text, fontSize: 14, fontWeight: '500' }}>{item.text}</Text>
              <Text style={{ color: colors.textSubtle, fontSize: 12 }}>{item.time}</Text>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  syncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  stackBar: {
    flexDirection: 'row',
    gap: 2,
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 14,
    marginBottom: 12,
  },
});

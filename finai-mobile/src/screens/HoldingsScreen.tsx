import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge, Body, Card, CardHeader, Divider, ErrorBox, GradientButton, Heading, Input, Label, OutlineButton, Screen } from '../components/ui';
import { PROVIDERS, type Holding } from '../data/sample';
import { money, percent, signedMoney } from '../lib/format';
import { portfolioMetrics, TYPE_META } from '../lib/metrics';
import { useStore } from '../lib/store';
import { brand, useTheme } from '../lib/theme';
import type { AppScreenProps, TabProps } from '../navigation/types';

const FILTERS = ['all', 'stock', 'etf', 'crypto'] as const;

function SymbolBadge({ holding }: { holding: Pick<Holding, 'symbol' | 'type'> }) {
  const color = TYPE_META[holding.type].color;
  return (
    <View style={[styles.symbol, { backgroundColor: `${color}22` }]}>
      <Text style={{ color, fontWeight: '800', fontSize: holding.symbol.length > 3 ? 11 : 13 }}>{holding.symbol.slice(0, 4)}</Text>
    </View>
  );
}

export default function HoldingsScreen({ navigation }: TabProps<'Holdings'>) {
  const { colors } = useTheme();
  const { holdings } = useStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const m = useMemo(() => portfolioMetrics(holdings), [holdings]);
  const visible = m.positions.filter((p) => filter === 'all' || p.type === filter);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <View style={{ gap: 4, flex: 1 }}>
          <Heading size="xl">Holdings</Heading>
          <Body>
            {holdings.length} positions · {money(m.totalValue)}
          </Body>
        </View>
        <Pressable
          onPress={() => navigation.navigate('AddHolding')}
          style={({ pressed }) => [styles.addButton, { backgroundColor: brand.indigo, opacity: pressed ? 0.85 : 1 }]}
          accessibilityLabel="Add holding"
        >
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.chip, { backgroundColor: active ? colors.text : colors.surface, borderColor: active ? colors.text : colors.border }]}
            >
              <Text style={{ color: active ? colors.background : colors.textMuted, fontWeight: '600', fontSize: 13 }}>
                {f === 'all' ? 'All' : TYPE_META[f].label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Card style={{ paddingVertical: 6 }}>
        {visible.map((p, i) => {
          const gainPct = ((p.price - p.entry) / p.entry) * 100;
          return (
            <View key={p.id}>
              {i > 0 && <Divider />}
              <Pressable onPress={() => navigation.navigate('HoldingDetail', { id: p.id })} style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}>
                <SymbolBadge holding={p} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{p.symbol}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 13 }} numberOfLines={1}>
                    {p.name} · {p.platform}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, fontVariant: ['tabular-nums'] }}>{money(p.value)}</Text>
                  <Text style={{ color: gainPct >= 0 ? colors.positive : colors.negative, fontSize: 13, fontWeight: '600' }}>{percent(gainPct)}</Text>
                </View>
              </Pressable>
            </View>
          );
        })}
        {visible.length === 0 && <Body style={{ textAlign: 'center', paddingVertical: 24 }}>No holdings of this type yet.</Body>}
      </Card>
    </Screen>
  );
}

export function HoldingDetailScreen({ route, navigation }: AppScreenProps<'HoldingDetail'>) {
  const { colors } = useTheme();
  const { holdings, removeHolding } = useStore();
  const m = useMemo(() => portfolioMetrics(holdings), [holdings]);
  const p = m.positions.find((h) => h.id === route.params.id);
  if (!p) return null;

  const cost = p.entry * p.quantity;
  const gain = p.value - cost;
  const rows: [string, string][] = [
    ['Quantity', p.quantity.toLocaleString()],
    ['Average price', money(p.entry, 2)],
    ['Current price', money(p.price, 2)],
    ['Cost basis', money(cost)],
    ['Platform', p.platform],
    ['Type', TYPE_META[p.type].label],
  ];

  function confirmRemove() {
    Alert.alert(`Remove ${p!.symbol}?`, 'This removes it from your holdings on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          removeHolding(p!.id);
          navigation.goBack();
        },
      },
    ]);
  }

  return (
    <Screen edges="none">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <SymbolBadge holding={p} />
        <View>
          <Heading>{p.symbol}</Heading>
          <Text style={{ color: colors.textMuted }}>{p.name}</Text>
        </View>
      </View>

      <Card>
        <Label>Market value</Label>
        <Text style={{ color: colors.text, fontSize: 34, fontWeight: '800', letterSpacing: -1, marginTop: 6 }}>{money(p.value)}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center' }}>
          <Badge text={percent((gain / cost) * 100)} tone={gain >= 0 ? 'positive' : 'negative'} />
          <Text style={{ color: colors.textMuted }}>{signedMoney(gain)} total return</Text>
        </View>
        <View style={{ marginTop: 16, gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>Share of portfolio</Text>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>{p.weight.toFixed(1)}%</Text>
          </View>
          <View style={{ height: 6, borderRadius: 999, backgroundColor: colors.track, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${p.weight}%`, backgroundColor: TYPE_META[p.type].color, borderRadius: 999 }} />
          </View>
        </View>
      </Card>

      <Card style={{ paddingVertical: 4 }}>
        {rows.map(([label, value], i) => (
          <View key={label}>
            {i > 0 && <Divider />}
            <View style={styles.detailRow}>
              <Text style={{ color: colors.textMuted, fontSize: 15 }}>{label}</Text>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>{value}</Text>
            </View>
          </View>
        ))}
      </Card>

      {p.weight > 25 && (
        <Card style={{ borderColor: `${colors.warning}55` }}>
          <CardHeader title="Concentration" />
          <Body muted={false}>
            {p.symbol} makes up {p.weight.toFixed(0)}% of your portfolio. A single position above 25% can swing your total value sharply.
          </Body>
        </Card>
      )}

      <OutlineButton title="Remove holding" icon="trash-outline" tone="negative" onPress={confirmRemove} />
    </Screen>
  );
}

export function AddHoldingScreen({ navigation }: AppScreenProps<'AddHolding'>) {
  const { colors } = useTheme();
  const { addHolding } = useStore();
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [entry, setEntry] = useState('');
  const [type, setType] = useState<Holding['type']>('stock');
  const [platform, setPlatform] = useState<string>(PROVIDERS[0].name);
  const [error, setError] = useState('');

  function save() {
    const qty = Number(quantity.replace(',', '.'));
    const price = Number(entry.replace(/[$,]/g, ''));
    if (!/^[A-Za-z.\-]{1,10}$/.test(symbol.trim())) return setError('Enter a ticker symbol, like AAPL or BTC.');
    if (!(qty > 0)) return setError('Enter how many units you own.');
    if (!(price > 0)) return setError('Enter the average price you paid.');
    addHolding({ symbol, name: name.trim() || symbol.trim().toUpperCase(), quantity: qty, entry: price, type, platform });
    navigation.goBack();
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen edges="none">
        <Input label="Ticker symbol" value={symbol} onChangeText={setSymbol} placeholder="AAPL" autoCapitalize="characters" autoCorrect={false} />
        <Input label="Name (optional)" value={name} onChangeText={setName} placeholder="Apple Inc." />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Input label="Quantity" value={quantity} onChangeText={setQuantity} placeholder="10" keyboardType="decimal-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Avg. price" value={entry} onChangeText={setEntry} placeholder="150.00" keyboardType="decimal-pad" />
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>Type</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(Object.keys(TYPE_META) as Holding['type'][]).map((t) => (
              <Pressable
                key={t}
                onPress={() => setType(t)}
                style={[styles.chip, { flex: 1, alignItems: 'center', backgroundColor: t === type ? colors.text : colors.surface, borderColor: t === type ? colors.text : colors.border }]}
              >
                <Text style={{ color: t === type ? colors.background : colors.textMuted, fontWeight: '600' }}>{TYPE_META[t].label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>Platform</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[...PROVIDERS.map((p) => p.name), 'Fidelity', 'Other'].map((name) => (
              <Pressable
                key={name}
                onPress={() => setPlatform(name)}
                style={[styles.chip, { backgroundColor: name === platform ? colors.text : colors.surface, borderColor: name === platform ? colors.text : colors.border }]}
              >
                <Text style={{ color: name === platform ? colors.background : colors.textMuted, fontWeight: '600' }}>{name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {error ? <ErrorBox message={error} /> : null}
        <GradientButton title="Add holding" icon="add" onPress={save} />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  symbol: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  addButton: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});

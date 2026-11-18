import { useMemo, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { Body, Card, GradientButton, Heading, Screen } from '../components/ui';
import { useStore } from '../lib/store';
import { useTheme } from '../lib/theme';
import { apiBaseUrl } from '../lib/snaptrade';
import type { AppScreenProps } from '../navigation/types';

const scenarios = [
  ['2008-financial-crisis', '2008 Financial Crisis'],
  ['covid-2020-crash', 'COVID-19 Crash'],
  ['dot-com-bubble', 'Dot-Com Bubble'],
  ['2022-bear-market', '2022 Bear Market'],
  ['covid-recovery-2020', 'COVID Recovery'],
] as const;

export default function ScenarioLabScreen({ navigation }: AppScreenProps<'ScenarioLab'>) {
  const { colors } = useTheme();
  const { holdings } = useStore();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const totalValue = useMemo(() => holdings.reduce((sum, holding) => sum + holding.quantity * (holding.entry), 0), [holdings]);

  async function run(id: string) {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch(`${apiBaseUrl()}/api/scenario/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: id,
          holdings: holdings.map((holding) => ({
            symbol: holding.symbol,
            quantity: holding.quantity,
            currentValue: holding.quantity * holding.entry,
            assetClass: holding.type === 'stock' ? 'stock' : holding.type,
          })),
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || 'Scenario failed');
      setResult(payload.data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Scenario failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Pressable onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start', marginBottom: 4 }}>
        <Text style={{ color: colors.accent, fontWeight: '700' }}>← Back</Text>
      </Pressable>
      <Heading size="xl">Scenario Lab</Heading>
      <Body>Test your linked portfolio against historical market events.</Body>
      <Card>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>Portfolio value</Text>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800', marginTop: 4 }}>
          ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </Text>
      </Card>
      {scenarios.map(([id, title]) => (
        <GradientButton key={id} title={title} loading={loading} onPress={() => run(id)} />
      ))}
      {error ? <Card><Text style={{ color: colors.negative }}>{error}</Text></Card> : null}
      {result ? (
        <Card>
          <Heading size="md">Scenario result</Heading>
          <Text style={{ color: colors.text, marginTop: 8 }}>Total return: {Number(result.totalReturn).toFixed(2)}%</Text>
          <Text style={{ color: colors.text, marginTop: 4 }}>Final value: ${Number(result.finalValue).toLocaleString(undefined, { maximumFractionDigits: 2 })}</Text>
        </Card>
      ) : null}
    </Screen>
  );
}

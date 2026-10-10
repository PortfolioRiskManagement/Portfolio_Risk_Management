import { SAMPLE_PRICES, type Holding } from '../data/sample';

// Same scoring as the website dashboard (finai-dashboard DashboardPage), so both show matching numbers.

export const priceOf = (h: Holding) => SAMPLE_PRICES[h.symbol.toUpperCase()] ?? h.entry;

export const TYPE_META: Record<Holding['type'], { label: string; color: string }> = {
  stock: { label: 'Stocks', color: '#3b82f6' },
  etf: { label: 'ETFs', color: '#6366f1' },
  crypto: { label: 'Crypto', color: '#a855f7' },
};

export function portfolioMetrics(holdings: Holding[]) {
  const investedValue = holdings.reduce((sum, h) => sum + h.entry * h.quantity, 0);
  const positions = holdings
    .map((h) => ({ ...h, price: priceOf(h), value: priceOf(h) * h.quantity }))
    .sort((a, b) => b.value - a.value);
  const totalValue = positions.reduce((sum, p) => sum + p.value, 0);
  const gain = totalValue - investedValue;
  const gainPct = investedValue > 0 ? (gain / investedValue) * 100 : 0;
  const platforms = new Set(holdings.map((h) => h.platform).filter(Boolean)).size;

  const weighted = positions.map((p) => ({ ...p, weight: totalValue > 0 ? (p.value / totalValue) * 100 : 0 }));
  const hhi = totalValue > 0 ? weighted.reduce((sum, p) => sum + (p.weight / 100) ** 2, 0) : 1;
  const count = weighted.filter((p) => p.value > 0).length;
  const diversificationScore =
    count > 1 ? Math.max(0, Math.min(100, Math.round(((1 - hhi) / (1 - 1 / count)) * 100))) : 0;

  const cryptoWeight = weighted.filter((p) => p.type === 'crypto').reduce((sum, p) => sum + p.weight, 0) / 100;
  const concentrationPenalty = Math.min(35, Math.max(0, (hhi - 0.2) * 120));
  const cryptoPenalty = Math.min(25, cryptoWeight * 100 * 0.6);
  const riskScore = Math.round(Math.max(1, Math.min(100, 35 + concentrationPenalty + cryptoPenalty)));

  const byType = (Object.keys(TYPE_META) as Holding['type'][])
    .map((type) => ({ type, weight: weighted.filter((p) => p.type === type).reduce((sum, p) => sum + p.weight, 0) }))
    .filter((t) => t.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  return { totalValue, investedValue, gain, gainPct, platforms, riskScore, diversificationScore, positions: weighted, byType };
}

export function riskLabel(score: number) {
  if (score < 40) return { text: 'Low risk', tone: 'positive' as const };
  if (score < 70) return { text: 'Moderate risk', tone: 'warning' as const };
  return { text: 'High risk', tone: 'negative' as const };
}

export function diversificationLabel(score: number) {
  if (score >= 70) return { text: 'Well diversified', tone: 'positive' as const };
  if (score >= 40) return { text: 'Moderately diversified', tone: 'warning' as const };
  return { text: 'Concentrated', tone: 'negative' as const };
}

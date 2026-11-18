import { useEffect, useState } from 'react'
import type { Holding } from './useHoldings'
import { fetchHistory } from './useHistoricalPrices'

export type PortfolioPoint = { time: number; value: number }

const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_MS = 7 * DAY_MS

/**
 * Value of the current holdings over time (quantity × each day's close), sampled weekly.
 * It shows how today's positions would have performed, not past trades.
 */
export function combineHistories(
  holdings: Pick<Holding, 'symbol' | 'quantity'>[],
  histories: Record<string, { prices: number[]; times: number[] }>,
  stepMs = WEEK_MS
): PortfolioPoint[] {
  const series = holdings
    .map(h => ({ qty: h.quantity, hist: histories[h.symbol.toUpperCase()] }))
    .filter(s => s.hist && s.hist.prices.length)
  if (!series.length) return []

  const start = Math.max(...series.map(s => s.hist.times[0]))
  const end = Math.max(...series.map(s => s.hist.times[s.hist.times.length - 1]))
  const sampleTimes: number[] = []
  for (let t = end; t >= start; t -= stepMs) sampleTimes.unshift(t)

  // Forward-fill: each sample uses the latest close on or before it (weekends, holidays)
  const cursors = series.map(() => 0)
  return sampleTimes.map(t => {
    let value = 0
    series.forEach((s, i) => {
      const { times, prices } = s.hist
      while (cursors[i] + 1 < times.length && times[cursors[i] + 1] <= t) cursors[i]++
      value += s.qty * prices[cursors[i]]
    })
    return { time: t, value }
  })
}

export function usePortfolioHistory(holdings: Holding[], days = 182) {
  const [points, setPoints] = useState<PortfolioPoint[] | null>(null)
  const key = holdings.map(h => `${h.symbol}:${h.quantity}`).join('|')

  useEffect(() => {
    let mounted = true
    setPoints(null)
    const symbols = [...new Set(holdings.map(h => h.symbol.toUpperCase()))]
    Promise.all(symbols.map(async s => [s, await fetchHistory(s, days)] as const)).then(results => {
      if (!mounted) return
      const histories: Record<string, { prices: number[]; times: number[] }> = {}
      for (const [s, h] of results) if (h) histories[s] = h
      setPoints(combineHistories(holdings, histories))
    })
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch only when positions change
  }, [key, days])

  return points
}

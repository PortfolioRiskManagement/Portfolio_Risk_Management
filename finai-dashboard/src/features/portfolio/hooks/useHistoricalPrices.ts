import { useEffect, useState } from 'react'
import apiClient from '../../../services/apiClient'

type HistoryResponse = { success: boolean; prices?: number[]; times?: number[] }

type CacheEntry = { ts: number; data: number[]; times: number[] }
const CACHE = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/** Daily closes for a symbol (cached for 5 minutes); null if unavailable. */
export async function fetchHistory(symbol: string, days: number): Promise<{ prices: number[]; times: number[] } | null> {
  const cacheKey = `${symbol.toUpperCase()}:${days}`
  const entry = CACHE.get(cacheKey)
  if (entry && Date.now() - entry.ts < CACHE_TTL) return { prices: entry.data, times: entry.times }
  try {
    const res = await apiClient.get<HistoryResponse>(
      `/api/history?symbol=${encodeURIComponent(symbol)}&days=${days}`
    )
    const prices = res.data.prices ?? []
    const times = res.data.times ?? []
    if (!prices.length) return null
    CACHE.set(cacheKey, { ts: Date.now(), data: prices, times })
    return { prices, times }
  } catch {
    return null
  }
}

/** Daily closing prices from Yahoo Finance (via the Flask backend) over the last `days` days. */
export function useHistoricalPrices(symbol: string, days = 30) {
  const [data, setData] = useState<number[] | null>(null)
  const [times, setTimes] = useState<number[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!symbol) return
    let mounted = true
    setData(null)
    setTimes(null)
    setError(false)
    fetchHistory(symbol, days).then(result => {
      if (!mounted) return
      if (!result) {
        setError(true)
        return
      }
      setData(result.prices)
      setTimes(result.times)
    })
    return () => { mounted = false }
  }, [symbol, days])

  return { data, times, error }
}

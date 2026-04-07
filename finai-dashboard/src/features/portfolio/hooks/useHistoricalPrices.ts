import { useEffect, useState } from 'react'

const COINGECKO_MAP: Record<string, string> = {
  btc: 'bitcoin',
  eth: 'ethereum',
}

function generateMockSeries(base: number, days = 30) {
  return Array.from({ length: days }, (_, i) => {
    const drift = 1 - (i / days) * 0.06
    const noise = 1 + (Math.random() - 0.5) * 0.03
    return +(base * drift * noise).toFixed(2)
  })
}

type CacheEntry = { ts: number; data: number[]; times: number[] }
const CACHE = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export function useHistoricalPrices(symbol: string, days = 30) {
  // returns { data: number[] | null, times: number[] | null }
  const [data, setData] = useState<number[] | null>(null)
  const [times, setTimes] = useState<number[] | null>(null)
  const s = symbol.toLowerCase()

  useEffect(() => {
    let mounted = true

    async function fetchFromAlpha(symbolUpper: string) {
      try {
        const key = (import.meta as any)?.VITE_ALPHA_VANTAGE_KEY
        if (!key) return null
        const res = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbolUpper}&outputsize=full&apikey=${key}`)
        const json = await res.json()
        const series = json['Time Series (Daily)'] || json['Time Series (Daily)']
        if (!series) return null
        const entries = Object.keys(series).sort() // ascending date
        const prices = entries.map((d: string) => Number(series[d]['4. close']))
        const timesArr = entries.map((d: string) => new Date(d).getTime())
        return { prices, timesArr }
      } catch {
        return null
      }
    }

    async function fetchData() {
      try {
        const cacheKey = `${s}:${days}`
        const now = Date.now()
        const entry = CACHE.get(cacheKey)
        if (entry && now - entry.ts < CACHE_TTL) {
          if (mounted) {
            setData(entry.data)
            setTimes(entry.times)
          }
          return
        }

        // prefer CoinGecko for crypto
        if (COINGECKO_MAP[s]) {
          const id = COINGECKO_MAP[s]
          const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`)
          const json = await res.json()
          const prices: number[] = (json?.prices || []).map((p: any) => Number(p[1]))
          const timesArr: number[] = (json?.prices || []).map((p: any) => Number(p[0]))
          if (mounted && prices.length) {
            setData(prices)
            setTimes(timesArr)
            CACHE.set(cacheKey, { ts: now, data: prices, times: timesArr })
          }
          return
        }

        // try Alpha Vantage for equities if key present
        const maybeAlpha = await fetchFromAlpha(symbol.toUpperCase())
        if (maybeAlpha && maybeAlpha.prices.length) {
          // slice last `days` values
          const prices = maybeAlpha.prices.slice(-days)
          const timesArr = maybeAlpha.timesArr.slice(-days)
          if (mounted) {
            setData(prices)
            setTimes(timesArr)
            CACHE.set(cacheKey, { ts: now, data: prices, times: timesArr })
          }
          return
        }

        // fallback: mock series for equities
        const base = symbol === 'SPY' ? 485 : symbol === 'AAPL' ? 185 : 100
        const mock = generateMockSeries(base, days)
        if (mounted) {
          const now = Date.now()
          const dayMs = 24 * 60 * 60 * 1000
          const timesArr = Array.from({ length: days }, (_, i) => now - (days - 1 - i) * dayMs)
          setData(mock)
          setTimes(timesArr)
          CACHE.set(cacheKey, { ts: now, data: mock, times: timesArr })
        }
      } catch {
        if (mounted) {
          const mock = generateMockSeries(100, days)
          const now = Date.now()
          const dayMs = 24 * 60 * 60 * 1000
          const timesArr = Array.from({ length: days }, (_, i) => now - (days - 1 - i) * dayMs)
          setData(mock)
          setTimes(timesArr)
        }
      }
    }

    fetchData()
    return () => { mounted = false }
  }, [symbol, days])

  return { data, times }
}

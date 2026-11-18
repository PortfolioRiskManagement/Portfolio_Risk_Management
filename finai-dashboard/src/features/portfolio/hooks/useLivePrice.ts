import { useEffect, useMemo, useState } from 'react'
import apiClient from '../../../services/apiClient'

type QuoteResponse = { success: boolean; price?: number; changePercent?: number | null }

export type QuoteDetails = { price: number; changePercent: number | null }

const REFRESH_MS = 60_000

// Shared across pages so navigating around doesn't refetch every quote
const CACHE = new Map<string, { ts: number; quote: QuoteDetails }>()

/** Price plus today's % change vs. the previous close. */
export async function fetchQuoteDetails(symbol: string): Promise<QuoteDetails | null> {
  try {
    const res = await apiClient.get<QuoteResponse>(`/api/quote?symbol=${encodeURIComponent(symbol)}`)
    if (typeof res.data.price !== 'number') return null
    const quote = { price: res.data.price, changePercent: res.data.changePercent ?? null }
    CACHE.set(symbol.toUpperCase(), { ts: Date.now(), quote })
    return quote
  } catch {
    return null
  }
}

export async function fetchQuote(symbol: string): Promise<number | null> {
  return (await fetchQuoteDetails(symbol))?.price ?? null
}

function cachedQuotes(list: string[]) {
  const out: Record<string, QuoteDetails> = {}
  for (const s of list) {
    const hit = CACHE.get(s)
    if (hit) out[s] = hit.quote
  }
  return out
}

/** Live Yahoo Finance quotes for several symbols, refreshed every minute. Missing entries are still loading or unavailable. */
export function useLiveQuotes(symbols: string[]) {
  const key = Array.from(new Set(symbols.map(s => s.toUpperCase()))).sort().join(',')
  const [quotes, setQuotes] = useState<Record<string, QuoteDetails>>(() => cachedQuotes(key ? key.split(',') : []))

  useEffect(() => {
    if (!key) return
    let mounted = true
    const list = key.split(',')

    async function refresh() {
      const now = Date.now()
      const results = await Promise.all(
        list.map(async s => {
          const hit = CACHE.get(s)
          const quote = hit && now - hit.ts < REFRESH_MS ? hit.quote : await fetchQuoteDetails(s)
          return [s, quote] as const
        })
      )
      if (!mounted) return
      setQuotes(prev => {
        const next = { ...prev }
        for (const [s, q] of results) if (q) next[s] = q
        return next
      })
    }

    refresh()
    const t = setInterval(refresh, REFRESH_MS)
    return () => { mounted = false; clearInterval(t) }
  }, [key])

  return quotes
}

/** Live Yahoo Finance prices for several symbols. Missing entries are still loading or unavailable. */
export function useLivePrices(symbols: string[]) {
  const quotes = useLiveQuotes(symbols)
  return useMemo(() => {
    const prices: Record<string, number> = {}
    for (const [s, q] of Object.entries(quotes)) prices[s] = q.price
    return prices
  }, [quotes])
}

/** Live Yahoo Finance price for one symbol; null until it loads. */
export function useLivePrice(symbol: string): number | null {
  const prices = useLivePrices(symbol ? [symbol] : [])
  return prices[symbol.toUpperCase()] ?? null
}

import { useEffect, useState } from "react"

export type Holding = {
  id: string
  symbol: string
  name: string
  quantity: number
  entry: number
  platform?: string
  type?: string
}

const STORAGE_KEY = "finai_holdings_v1"

const SAMPLE: Holding[] = [
  { id: "1", symbol: "AAPL", name: "Apple Inc.", quantity: 50, entry: 150.25, platform: "Wealthsimple", type: "Stock" },
  { id: "2", symbol: "TSLA", name: "Tesla Inc.", quantity: 25, entry: 245.8, platform: "Robinhood", type: "Stock" },
  { id: "3", symbol: "BTC", name: "Bitcoin", quantity: 0.5, entry: 42000, platform: "Coinbase", type: "Crypto" },
  { id: "4", symbol: "ETH", name: "Ethereum", quantity: 5, entry: 2200, platform: "Coinbase", type: "Crypto" },
  { id: "5", symbol: "SPY", name: "SPDR S&P 500 ETF", quantity: 100, entry: 425, platform: "Fidelity", type: "ETF" },
  { id: "6", symbol: "MSFT", name: "Microsoft Corporation", quantity: 30, entry: 320, platform: "Wealthsimple", type: "Stock" },
  { id: "7", symbol: "NVDA", name: "NVIDIA Corporation", quantity: 15, entry: 450, platform: "Robinhood", type: "Stock" },
]

export function useHoldings() {
  function dedupe(arr: Holding[]) {
    const map = new Map<string, Holding>()
    for (const h of arr) {
      const key = h.symbol.toUpperCase()
      if (!map.has(key)) {
        map.set(key, { ...h, symbol: key })
        continue
      }
      const ex = map.get(key)!
      const totalQty = ex.quantity + h.quantity
      const weightedEntry = totalQty > 0 ? ((ex.entry * ex.quantity) + (h.entry * h.quantity)) / totalQty : ex.entry
      map.set(key, { ...ex, quantity: totalQty, entry: Number(weightedEntry.toFixed(6)) })
    }
    return Array.from(map.values())
  }

  const [holdings, setHoldings] = useState<Holding[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return SAMPLE
      const parsed = JSON.parse(raw) as Holding[]
      return dedupe(parsed)
    } catch (e) {
      return SAMPLE
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings))
    } catch (e) {
      // ignore
    }
  }, [holdings])

  function addHolding(h: Omit<Holding, "id">) {
    const symbol = h.symbol.toUpperCase()
    setHoldings(prev => {
      const idx = prev.findIndex(p => p.symbol.toUpperCase() === symbol)
      if (idx === -1) {
        const newHolding: Holding = { ...h, id: String(Date.now()), symbol }
        return [newHolding, ...prev]
      }

      // merge with existing: sum quantities and compute weighted average entry
      const existing = prev[idx]
      const totalQty = existing.quantity + h.quantity
      const weightedEntry = totalQty > 0 ? ((existing.entry * existing.quantity) + (h.entry * h.quantity)) / totalQty : existing.entry
      const merged: Holding = {
        ...existing,
        quantity: totalQty,
        entry: Number(weightedEntry.toFixed(6)),
        // prefer existing platform/type, fallback to new
        platform: existing.platform ?? h.platform,
        type: existing.type ?? h.type,
      }

      const next = [...prev]
      next[idx] = merged
      return next
    })
  }

  function replaceHoldings(next: Holding[]) {
    setHoldings(next)
  }

  return { holdings, addHolding, replaceHoldings }
}

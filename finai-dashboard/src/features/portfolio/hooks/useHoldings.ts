import { useSyncExternalStore } from "react"
import type { AccountType } from "../types/portfolio.types"

export type Holding = {
  id: string
  symbol: string
  name: string
  quantity: number
  entry: number
  platform?: string
  type?: string
  /** Which account holds it (TFSA, RRSP, FHSA or a personal/taxable account). */
  account?: AccountType
}

const STORAGE_KEY = "finai_holdings_v1"

const SAMPLE: Holding[] = [
  { id: "1", symbol: "AAPL", name: "Apple Inc.", quantity: 50, entry: 150.25, platform: "Wealthsimple", type: "Stock", account: "TFSA" },
  { id: "2", symbol: "TSLA", name: "Tesla Inc.", quantity: 25, entry: 245.8, platform: "Robinhood", type: "Stock", account: "PERSONAL" },
  { id: "3", symbol: "BTC", name: "Bitcoin", quantity: 0.5, entry: 42000, platform: "Coinbase", type: "Crypto", account: "PERSONAL" },
  { id: "4", symbol: "ETH", name: "Ethereum", quantity: 5, entry: 2200, platform: "Coinbase", type: "Crypto", account: "PERSONAL" },
  { id: "5", symbol: "SPY", name: "SPDR S&P 500 ETF", quantity: 100, entry: 425, platform: "Fidelity", type: "ETF", account: "RRSP" },
  { id: "6", symbol: "MSFT", name: "Microsoft Corporation", quantity: 30, entry: 320, platform: "Wealthsimple", type: "Stock", account: "RRSP" },
  { id: "7", symbol: "NVDA", name: "NVIDIA Corporation", quantity: 15, entry: 450, platform: "Robinhood", type: "Stock", account: "FHSA" },
]

/** Holdings saved before accounts existed: keep the sample's account, otherwise treat as personal. */
function withAccount(h: Holding): Holding {
  if (h.account) return h
  const sample = SAMPLE.find(s => s.id === h.id && s.symbol === h.symbol)
  return { ...h, account: sample?.account ?? "PERSONAL" }
}

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

/** Current holdings from storage; usable outside React (e.g. the alert monitor). */
export function loadHoldings(): Holding[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return SAMPLE
    return dedupe(JSON.parse(raw) as Holding[]).map(withAccount)
  } catch {
    return SAMPLE
  }
}

// One shared copy for the whole app, so a change on any page shows up everywhere
let current: Holding[] | null = null
const listeners = new Set<() => void>()

function getSnapshot(): Holding[] {
  if (current === null) current = loadHoldings()
  return current
}

function setHoldings(next: Holding[]) {
  current = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
  listeners.forEach(l => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  // edits from another tab
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return
    current = loadHoldings()
    listener()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

export function addHolding(h: Omit<Holding, "id">) {
  const prev = getSnapshot()
  const symbol = h.symbol.toUpperCase()
  const idx = prev.findIndex(p => p.symbol.toUpperCase() === symbol)
  if (idx === -1) {
    setHoldings([{ ...h, id: String(Date.now()), symbol }, ...prev])
    return
  }

  // merge with existing: sum quantities and compute weighted average entry
  const existing = prev[idx]
  const totalQty = existing.quantity + h.quantity
  const weightedEntry = totalQty > 0 ? ((existing.entry * existing.quantity) + (h.entry * h.quantity)) / totalQty : existing.entry
  const next = [...prev]
  next[idx] = {
    ...existing,
    quantity: totalQty,
    entry: Number(weightedEntry.toFixed(6)),
    // prefer existing platform/type/account, fallback to new
    platform: existing.platform ?? h.platform,
    type: existing.type ?? h.type,
    account: existing.account ?? h.account,
  }
  setHoldings(next)
}

export function updateHolding(id: string, patch: Partial<Omit<Holding, "id">>) {
  setHoldings(getSnapshot().map(h => (h.id === id ? { ...h, ...patch } : h)))
}

export function removeHolding(id: string) {
  setHoldings(getSnapshot().filter(h => h.id !== id))
}

export function replaceHoldings(next: Holding[]) {
  setHoldings(next)
}

export function useHoldings() {
  const holdings = useSyncExternalStore(subscribe, getSnapshot)
  return { holdings, addHolding, updateHolding, removeHolding, replaceHoldings }
}

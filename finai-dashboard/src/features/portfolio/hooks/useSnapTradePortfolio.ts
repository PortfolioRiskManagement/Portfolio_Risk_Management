import { useEffect, useState } from "react"
import type { AccountType } from "../types/portfolio.types"

export type SnapTradeAccount = {
  id: string
  name: string
  type: AccountType
  balance: number
  currency: string
}

export type SnapTradeHolding = {
  id: string
  accountId: string
  accountType: AccountType
  symbol: string
  name: string
  quantity: number
  price: number
  value: number
  currency: string
  platform: string
  kind: string
}

type SnapTradePortfolio = {
  accountValueCad: number
  accountCount: number
  accounts: SnapTradeAccount[]
  holdings: SnapTradeHolding[]
  source: "live"
}

let cached: SnapTradePortfolio | null = null
let inflight: Promise<SnapTradePortfolio | null> | null = null

export async function fetchSnapTradePortfolio(): Promise<SnapTradePortfolio | null> {
  if (cached) return cached
  if (inflight) return inflight
  inflight = fetch("http://localhost:5001/api/snaptrade/portfolio")
    .then(async (response) => {
      const payload = await response.json() as SnapTradePortfolio & { success?: boolean }
      if (!response.ok || !payload.success) return null
      cached = payload
      return payload
    })
    .catch(() => null)
    .finally(() => { inflight = null })
  return inflight
}

export function invalidateSnapTradePortfolio() {
  cached = null
}

export function useSnapTradePortfolio() {
  const [data, setData] = useState<SnapTradePortfolio | null>(cached)
  const [isLoading, setIsLoading] = useState(!cached)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    if (!cached) {
      fetchSnapTradePortfolio().then((next) => {
        if (!active) return
        if (next) setData(next)
        else setError("SnapTrade portfolio data is unavailable")
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }
    return () => { active = false }
  }, [])

  return { data, isLoading, error, refresh: async () => {
    invalidateSnapTradePortfolio()
    const next = await fetchSnapTradePortfolio()
    setData(next)
  } }
}

import { useEffect, useState } from "react"

type Connection = {
  provider: string
  connected: boolean
  connectedAt?: string
  accountName?: string
}

const STORAGE_KEY = "finai_connections_v1"

const DEFAULT_PROVIDERS = [
  "Wealthsimple",
  "Robinhood",
  "Coinbase",
  "Binance",
]

function readFromStorage(): Connection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return DEFAULT_PROVIDERS.map((p) => ({ provider: p, connected: false }))
    }
    const parsed = JSON.parse(raw) as Connection[]
    // filter to only include default providers (removes old providers)
    const map = new Map(parsed.filter((c) => DEFAULT_PROVIDERS.includes(c.provider)).map((c) => [c.provider, c]))
    for (const p of DEFAULT_PROVIDERS) {
      if (!map.has(p)) map.set(p, { provider: p, connected: false })
    }
    return Array.from(map.values())
  } catch (e) {
    return DEFAULT_PROVIDERS.map((p) => ({ provider: p, connected: false }))
  }
}

function writeToStorage(next: Connection[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch (e) {
    // ignore
  }
}

export function useConnections() {
  const [connections, setConnections] = useState<Connection[]>(() => {
    if (typeof window === "undefined") return DEFAULT_PROVIDERS.map((p) => ({ provider: p, connected: false }))
    return readFromStorage()
  })

  useEffect(() => {
    writeToStorage(connections)
  }, [connections])

  function connect(provider: string, accountName?: string) {
    setConnections((prev) => {
      const next = prev.map((c) =>
        c.provider === provider
          ? { ...c, connected: true, connectedAt: new Date().toISOString(), accountName: accountName || c.accountName }
          : c
      )
      return next
    })
  }

  function disconnect(provider: string) {
    setConnections((prev) => prev.map((c) => (c.provider === provider ? { ...c, connected: false, connectedAt: undefined, accountName: undefined } : c)))
  }

  function isConnected(provider: string) {
    return connections.find((c) => c.provider === provider)?.connected ?? false
  }

  const connectedCount = connections.filter((c) => c.connected).length

  return { connections, connect, disconnect, isConnected, connectedCount }
}

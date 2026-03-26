import { useEffect, useState } from 'react'

const MOCK_PRICES: Record<string, number> = {
  AAPL: 185.4,
  TSLA: 198.5,
  BTC: 62500,
  ETH: 3100,
  SPY: 485.2,
  MSFT: 410.5,
  NVDA: 720.3,
}

export function useLivePrice(symbol: string) {
  const [price, setPrice] = useState<number>(MOCK_PRICES[symbol] ?? 0)

  useEffect(() => {
    let mounted = true
    async function fetchPrice() {
      try {
        const s = symbol.toLowerCase()
        // If crypto, try CoinGecko simple price
        if (s === 'btc' || s === 'eth') {
          const id = s === 'btc' ? 'bitcoin' : 'ethereum'
          const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`)
          const json = await res.json()
          const p = json?.[id]?.usd
          if (mounted && typeof p === 'number') setPrice(p)
          return
        }

        // fallback: use mock
        if (MOCK_PRICES[symbol]) setPrice(MOCK_PRICES[symbol])
      } catch (e) {
        // ignore
      }
    }

    fetchPrice()
    const t = setInterval(fetchPrice, 60_000)
    return () => { mounted = false; clearInterval(t) }
  }, [symbol])

  return price
}

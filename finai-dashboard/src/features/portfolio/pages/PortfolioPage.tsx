
import PageShell from "../../../components/layout/PageShell"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { useHoldings } from "../hooks/useHoldings"
import AssetCard from "../components/AssetCard"

// mock current prices
const PRICES: Record<string, number> = {
  AAPL: 185.4,
  TSLA: 198.5,
  BTC: 62500,
  ETH: 3100,
  SPY: 485.2,
  MSFT: 410.5,
  NVDA: 720.3,
}

export default function PortfolioPage() {
  const navigate = useNavigate()
  const { holdings } = useHoldings()
  const [query, setQuery] = useState("")
  const [platformFilter, setPlatformFilter] = useState("All Platforms")
  const [typeFilter, setTypeFilter] = useState("All Types")
  const [riskFilter, setRiskFilter] = useState("All Risk Levels")

  // helper: infer type from symbol if missing and normalize values for comparison
  function inferType(symbol: string) {
    const s = symbol.toUpperCase()
    if (s === "BTC" || s === "ETH" || s === "SOL" || s === "ADA") return "Crypto"
    if (s.includes("ETF") || s === "SPY" || s === "VTI") return "ETF"
    return "Stock"
  }

  function getTypeFor(h: any) {
    return (h.type ?? inferType(h.symbol)).toString()
  }

  return (
    <PageShell title="Assets">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl text-zinc-600 dark:text-zinc-400">Clean, simple view of your portfolio</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/portfolio/add")}
              title="Add Stock"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-zinc-900 shadow-sm transition-colors hover:bg-zinc-100 dark:border-white/8 dark:bg-white/6 dark:text-white dark:hover:bg-white/10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="font-medium">Add</span>
            </button>
          </div>
        </div>

        <div className="flex gap-3 mb-6 items-center">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search assets, symbol or name"
            className="flex-1 rounded-2xl border border-zinc-200 bg-white p-3 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800/50 dark:bg-zinc-900/60 dark:text-zinc-100 dark:placeholder-zinc-500"
          />
          <select className="rounded-2xl border border-zinc-200 bg-white p-3 text-zinc-900 dark:border-zinc-800/50 dark:bg-zinc-900/60 dark:text-zinc-100" value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}>
            <option>All Platforms</option>
            <option>Wealthsimple</option>
            <option>Robinhood</option>
            <option>Coinbase</option>
            <option>Fidelity</option>
          </select>
          <select className="rounded-2xl border border-zinc-200 bg-white p-3 text-zinc-900 dark:border-zinc-800/50 dark:bg-zinc-900/60 dark:text-zinc-100" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option>All Types</option>
            <option>Stock</option>
            <option>Crypto</option>
            <option>ETF</option>
          </select>
          <select className="rounded-2xl border border-zinc-200 bg-white p-3 text-zinc-900 dark:border-zinc-800/50 dark:bg-zinc-900/60 dark:text-zinc-100" value={riskFilter} onChange={e => setRiskFilter(e.target.value)}>
            <option>All Risk Levels</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>

        <div className="space-y-3">
          {holdings
            .filter(h => h.symbol.toLowerCase().includes(query.toLowerCase()) || h.name.toLowerCase().includes(query.toLowerCase()))
            .filter(h => {
              if (platformFilter === "All Platforms") return true
              return (h.platform ?? "").toLowerCase() === platformFilter.toLowerCase()
            })
            .filter(h => {
              if (typeFilter === "All Types") return true
              // normalize/compare inferred type
              return getTypeFor(h).toLowerCase() === typeFilter.toLowerCase()
            })
            .filter(h => {
              if (riskFilter === "All Risk Levels") return true
              const current = PRICES[h.symbol] ?? 0
              const pct = h.entry > 0 ? ((current - h.entry) / h.entry) * 100 : 0
              if (riskFilter === "High") return pct <= 0
              if (riskFilter === "Medium") return pct > 0 && pct <= 30
              if (riskFilter === "Low") return pct > 30
              return true
            })
            .map((h, i) => (
              <div key={h.id} style={{ animation: `fadeUp 220ms cubic-bezier(.2,.9,.2,1) ${i * 28}ms both` }}>
                <AssetCard holding={h} currentPrice={PRICES[h.symbol] ?? 0} />
              </div>
            ))}
        </div>
      </div>
    </PageShell>
  )
}

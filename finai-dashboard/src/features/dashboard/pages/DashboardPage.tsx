import PageShell from "../../../components/layout/PageShell"
import Card from "../../../components/ui/Card"
import Metric from "../../../components/ui/Metric"
import PortfolioChart from "../components/PortfolioChart"
import { useMemo } from "react"
import { useHoldings } from "../../portfolio/hooks/useHoldings"

const PRICES: Record<string, number> = {
  AAPL: 185.4,
  TSLA: 198.5,
  BTC: 62500,
  ETH: 3100,
  SPY: 485.2,
  MSFT: 410.5,
  NVDA: 720.3,
}

function inferPrice(symbol: string, fallback: number) {
  const normalized = symbol.toUpperCase()
  if (PRICES[normalized]) return PRICES[normalized]
  return fallback
}

function inferType(symbol: string, rawType?: string) {
  if (rawType) return rawType.toLowerCase()
  const s = symbol.toUpperCase()
  if (s === "BTC" || s === "ETH" || s.endsWith("-USD")) return "crypto"
  if (s === "SPY" || s === "VTI" || s === "VOO") return "etf"
  return "stock"
}


export default function DashboardPage() {
  const { holdings } = useHoldings()

  const metrics = useMemo(() => {
    const investedValue = holdings.reduce((sum, h) => sum + h.entry * h.quantity, 0)
    const totalValue = holdings.reduce((sum, h) => sum + inferPrice(h.symbol, h.entry) * h.quantity, 0)
    const gain = totalValue - investedValue
    const gainPct = investedValue > 0 ? (gain / investedValue) * 100 : 0
    const platforms = new Set(holdings.map((h) => h.platform).filter(Boolean)).size

    const weights = holdings
      .map((h) => inferPrice(h.symbol, h.entry) * h.quantity)
      .filter((v) => v > 0)
    const valueSum = weights.reduce((sum, value) => sum + value, 0)
    const hhi = valueSum > 0
      ? weights.reduce((sum, value) => {
          const w = value / valueSum
          return sum + (w * w)
        }, 0)
      : 1

    const diversificationScore = weights.length > 1
      ? Math.max(0, Math.min(100, Math.round(((1 - hhi) / (1 - (1 / weights.length))) * 100)))
      : 0

    const cryptoWeight = valueSum > 0
      ? holdings.reduce((sum, h) => {
          const isCrypto = inferType(h.symbol, h.type) === "crypto"
          return sum + (isCrypto ? inferPrice(h.symbol, h.entry) * h.quantity : 0)
        }, 0) / valueSum
      : 0

    const concentrationPenalty = Math.min(35, Math.max(0, (hhi - 0.2) * 120))
    const cryptoPenalty = Math.min(25, cryptoWeight * 100 * 0.6)
    const riskScore = Math.round(Math.max(1, Math.min(100, 35 + concentrationPenalty + cryptoPenalty)))

    return {
      totalValue,
      gain,
      gainPct,
      platforms,
      riskScore,
      diversificationScore,
      assetsCount: holdings.length,
    }
  }, [holdings])

  return (
    <PageShell title="Unified Intelligence Dashboard">
      {/* Status bar */}
      <div className="flex items-center gap-4 mb-6 text-sm text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span>Last synced 2 minutes ago</span>
        </div>
        <span>•</span>
        <span>4 platforms connected</span>
  </div>

  {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card>
          <Metric
            label="Total Portfolio Value"
            value={`$${metrics.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            subtext={`${metrics.gain >= 0 ? '+' : ''}${metrics.gain.toLocaleString(undefined, { maximumFractionDigits: 1 })} (${metrics.gainPct.toFixed(1)}%)`}
            trend="up"
          />
        </Card>

        <Card>
          <Metric
            label="Portfolio Risk Score"
            value={`${metrics.riskScore}`}
            subtext="Moderate risk"
            trend="neutral"
          />
        </Card>

        <Card>
          <Metric
            label="Diversification Score"
            value={`${metrics.diversificationScore}`}
            subtext="Well diversified"
            trend="up"
          />
        </Card>

        <Card>
          <Metric
            label="Total Assets"
            value={`${metrics.assetsCount}`}
            subtext={`${metrics.platforms || 1} platforms`}
            trend="up"
          />
        </Card>
      </div>

      {/* Chart and AI Brief */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <PortfolioChart />
        </div>

        <Card title="AI Daily Brief">
          <div className="space-y-3">
            <div className="bg-blue-950/30 border border-blue-800/50 rounded-lg p-3 text-sm">
              <p className="text-blue-200">
                Your portfolio is up 2.3% today driven by strong performance in tech sector. NVDA showing exceptional gains.
              </p>
            </div>
            <div className="bg-yellow-950/30 border border-yellow-800/50 rounded-lg p-3 text-sm">
              <p className="text-yellow-200">
                High tech concentration detected (65%). Consider rebalancing to reduce sector risk.
              </p>
            </div>
            <div className="bg-green-950/30 border border-green-800/50 rounded-lg p-3 text-sm">
              <p className="text-green-200">
                Federal Reserve rate hold signals positive outlook for equities. Good time to maintain positions.
              </p>
            </div>
          </div>
        </Card>
  </div>

  {/* Placeholder below chart and AI brief */}
      <div className="mt-4">
        <Card>
          <div className="h-40 flex items-center justify-center rounded-lg bg-zinc-900/40 border border-zinc-800/50 text-sm text-zinc-400">
            Placeholder for future content
          </div>
        </Card>
      </div>

    </PageShell>
  )
}

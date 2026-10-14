import { Link } from "react-router-dom"
import PageShell from "../../../components/layout/PageShell"
import Card from "../../../components/ui/Card"
import Icon, { type IconName } from "../../../components/ui/Icon"
import PortfolioChart from "../components/PortfolioChart"
import ConnectionsPanel from "../../connections/components/ConnectionsPanel"
import { useMemo } from "react"
import { useHoldings } from "../../portfolio/hooks/useHoldings"
import { useLiveQuotes } from "../../portfolio/hooks/useLivePrice"
import { usePortfolioHistory } from "../../portfolio/hooks/usePortfolioHistory"
import { useHoldingAlerts } from "../../alerts/hooks/useHoldingAlerts"
import { useAuth } from "../../../contexts/AuthContext"

function inferType(symbol: string, rawType?: string) {
  if (rawType) return rawType.toLowerCase()
  const s = symbol.toUpperCase()
  if (s === "BTC" || s === "ETH" || s.endsWith("-USD")) return "crypto"
  if (s === "SPY" || s === "VTI" || s === "VOO") return "etf"
  return "stock"
}

const TYPE_STYLES: Record<string, { label: string; bar: string }> = {
  stock: { label: "Stocks", bar: "bg-blue-500" },
  etf: { label: "ETFs", bar: "bg-indigo-500" },
  crypto: { label: "Crypto", bar: "bg-purple-500" },
}

function riskLabel(score: number) {
  if (score < 40) return { text: "Low risk", tone: "text-emerald-600 dark:text-emerald-400" }
  if (score < 70) return { text: "Moderate risk", tone: "text-amber-600 dark:text-amber-400" }
  return { text: "High risk", tone: "text-rose-600 dark:text-rose-400" }
}

function diversificationLabel(score: number) {
  if (score >= 70) return { text: "Well diversified", tone: "text-emerald-600 dark:text-emerald-400" }
  if (score >= 40) return { text: "Moderately diversified", tone: "text-amber-600 dark:text-amber-400" }
  return { text: "Concentrated", tone: "text-rose-600 dark:text-rose-400" }
}

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

const money = (value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`

type BriefItem = { tone: "positive" | "warning" | "info"; icon: IconName; title: string; body: string }

const pct = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`

function timeAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

const BRIEF_TONES = {
  positive: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  info: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
}

function StatTile({ icon, label, children }: { icon: IconName; label: string; children: React.ReactNode }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{label}</div>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-300">
          <Icon name={icon} className="h-4 w-4" />
        </span>
      </div>
      {children}
    </Card>
  )
}

function ScoreBar({ value, gradient }: { value: number; gradient: string }) {
  return (
    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/[0.06]">
      <div className={`h-full rounded-full ${gradient}`} style={{ width: `${Math.max(4, value)}%` }} />
    </div>
  )
}

export default function DashboardPage() {
  const { holdings } = useHoldings()
  const quotes = useLiveQuotes(holdings.map((h) => h.symbol))
  const history = usePortfolioHistory(holdings)
  const { alerts, unreadCount } = useHoldingAlerts()
  const { user } = useAuth()
  const firstName = (user?.user_metadata?.full_name as string | undefined)?.trim().split(/\s+/)[0]

  const metrics = useMemo(() => {
    // live price, or what was paid until the quote loads
    const priceOf = (h: { symbol: string; entry: number }) => quotes[h.symbol.toUpperCase()]?.price ?? h.entry
    const investedValue = holdings.reduce((sum, h) => sum + h.entry * h.quantity, 0)
    const totalValue = holdings.reduce((sum, h) => sum + priceOf(h) * h.quantity, 0)
    const gain = totalValue - investedValue
    const gainPct = investedValue > 0 ? (gain / investedValue) * 100 : 0
    const platforms = new Set(holdings.map((h) => h.platform).filter(Boolean)).size

    const weights = holdings
      .map((h) => priceOf(h) * h.quantity)
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
          return sum + (isCrypto ? priceOf(h) * h.quantity : 0)
        }, 0) / valueSum
      : 0

    const concentrationPenalty = Math.min(35, Math.max(0, (hhi - 0.2) * 120))
    const cryptoPenalty = Math.min(25, cryptoWeight * 100 * 0.6)
    const riskScore = Math.round(Math.max(1, Math.min(100, 35 + concentrationPenalty + cryptoPenalty)))

    // Positions by current value, largest first, for the allocation list.
    const positions = holdings
      .map((h) => ({ ...h, value: priceOf(h) * h.quantity }))
      .sort((a, b) => b.value - a.value)
      .map((p) => ({ ...p, weight: valueSum > 0 ? (p.value / valueSum) * 100 : 0 }))

    const byType = Object.entries(
      positions.reduce<Record<string, number>>((acc, p) => {
        const type = inferType(p.symbol, p.type)
        acc[type] = (acc[type] ?? 0) + p.weight
        return acc
      }, {}),
    ).sort((a, b) => b[1] - a[1])

    // Today's change: each position's move since yesterday's close
    const movers = holdings
      .map((h) => {
        const q = quotes[h.symbol.toUpperCase()]
        if (!q || q.changePercent === null) return null
        const value = q.price * h.quantity
        return { symbol: h.symbol, changePercent: q.changePercent, dayChange: value - value / (1 + q.changePercent / 100) }
      })
      .filter((m): m is { symbol: string; changePercent: number; dayChange: number } => m !== null)
    const dayChange = movers.reduce((sum, m) => sum + m.dayChange, 0)
    const dayChangePct = totalValue - dayChange > 0 ? (dayChange / (totalValue - dayChange)) * 100 : 0
    const topMover = [...movers].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))[0]

    return {
      totalValue,
      investedValue,
      dayChange,
      dayChangePct,
      topMover,
      quotesLoaded: movers.length > 0,
      gain,
      gainPct,
      platforms,
      riskScore,
      diversificationScore,
      assetsCount: holdings.length,
      positions,
      byType,
    }
  }, [holdings, quotes])

  const risk = riskLabel(metrics.riskScore)
  const diversification = diversificationLabel(metrics.diversificationScore)
  const isUp = metrics.gain >= 0
  const periodStart = history?.[0]?.value ?? 0
  const periodEnd = history?.[history.length - 1]?.value ?? 0
  const periodChange = periodStart > 0 ? ((periodEnd - periodStart) / periodStart) * 100 : 0

  const brief: BriefItem[] = []
  if (metrics.quotesLoaded) {
    const up = metrics.dayChange >= 0
    brief.push({
      tone: up ? "positive" : "warning",
      icon: up ? "trendUp" : "alert",
      title: `${up ? "Up" : "Down"} ${Math.abs(metrics.dayChangePct).toFixed(2)}% today (${up ? "+" : "-"}${money(Math.abs(metrics.dayChange))})`,
      body: metrics.topMover ? `Biggest move: ${metrics.topMover.symbol} ${pct(metrics.topMover.changePercent)}.` : "Prices are flat so far today.",
    })
  }
  const largest = metrics.positions[0]
  if (largest) {
    brief.push(
      largest.weight > 25
        ? { tone: "warning", icon: "alert", title: `${largest.symbol} is ${largest.weight.toFixed(0)}% of your portfolio`, body: "A single position this large drives most of your risk. Consider rebalancing." }
        : { tone: "positive", icon: "pie", title: "No position over 25%", body: `Your largest holding is ${largest.symbol} at ${largest.weight.toFixed(0)}%.` }
    )
  }
  brief.push({
    tone: unreadCount ? "warning" : "info",
    icon: unreadCount ? "bell" : "sparkle",
    title: unreadCount ? `${unreadCount} new alert${unreadCount === 1 ? "" : "s"}` : "No new alerts",
    body: unreadCount ? alerts.find((a) => !a.read)?.title ?? "" : "None of your holdings has made a big move or had major news.",
  })

  return (
    <PageShell title="Dashboard" subtitle="Your portfolio at a glance">
      {/* Greeting */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Tracking {metrics.assetsCount} holdings across {metrics.platforms || 1} platforms
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}
          </h2>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">Here's where your portfolio stands today.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/scenario"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
          >
            <Icon name="scenario" className="h-4 w-4" />
            Stress test
          </Link>
          <Link
            to="/portfolio/add"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-transform hover:-translate-y-0.5"
          >
            <Icon name="plus" className="h-4 w-4" />
            Add holding
          </Link>
        </div>
      </div>

      {/* Key numbers */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon="layers" label="Total value">
          <div className="text-3xl font-bold tracking-tight tabular-nums text-zinc-950 dark:text-white">{money(metrics.totalValue)}</div>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span
              className={`rounded-md px-1.5 py-0.5 font-semibold tabular-nums ${
                isUp ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              }`}
            >
              {isUp ? "+" : ""}
              {metrics.gainPct.toFixed(1)}%
            </span>
            <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
              {isUp ? "+" : "-"}
              {money(Math.abs(metrics.gain))} all time
            </span>
          </div>
        </StatTile>

        <StatTile icon="shield" label="Risk score">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold tracking-tight tabular-nums text-zinc-950 dark:text-white">{metrics.riskScore}</span>
            <span className="text-sm text-zinc-400">/100</span>
          </div>
          <div className={`mt-2 text-sm font-semibold ${risk.tone}`}>{risk.text}</div>
          <ScoreBar value={metrics.riskScore} gradient="bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500" />
        </StatTile>

        <StatTile icon="pie" label="Diversification">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold tracking-tight tabular-nums text-zinc-950 dark:text-white">{metrics.diversificationScore}</span>
            <span className="text-sm text-zinc-400">/100</span>
          </div>
          <div className={`mt-2 text-sm font-semibold ${diversification.tone}`}>{diversification.text}</div>
          <ScoreBar value={metrics.diversificationScore} gradient="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        </StatTile>

        <StatTile icon="portfolio" label="Total assets">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight tabular-nums text-zinc-950 dark:text-white">{metrics.assetsCount}</span>
            <span className="text-sm text-zinc-400">holdings</span>
          </div>
          <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Across {metrics.platforms || 1} platforms</div>
          <div className="mt-4 flex h-1.5 gap-0.5 overflow-hidden rounded-full">
            {metrics.byType.map(([type, weight]) => (
              <div key={type} className={TYPE_STYLES[type]?.bar ?? "bg-zinc-400"} style={{ width: `${weight}%` }} title={`${TYPE_STYLES[type]?.label ?? type} ${weight.toFixed(0)}%`} />
            ))}
          </div>
        </StatTile>
      </div>

      {/* Performance and allocation */}
      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">Performance</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight tabular-nums text-zinc-950 dark:text-white">{history?.length ? money(periodEnd) : "—"}</span>
                {history && history.length > 1 && (
                  <span className={`text-sm font-semibold ${periodChange >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {periodChange >= 0 ? "+" : ""}
                    {periodChange.toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Your current holdings at past prices</div>
            </div>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-white/5 dark:text-zinc-300">Last 6 months</span>
          </div>
          {history === null ? (
            <div className="flex h-64 items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">Loading price history…</div>
          ) : history.length < 2 ? (
            <div className="flex h-64 items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
              {holdings.length ? "Couldn't load price history. Is the backend running (python app.py)?" : "Add a holding to see performance."}
            </div>
          ) : (
            <PortfolioChart data={history} />
          )}
        </Card>

        <Card
          title="Allocation"
          action={
            <Link to="/assets" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              View all
            </Link>
          }
        >
          <div className="mb-5 flex flex-wrap gap-x-4 gap-y-1">
            {metrics.byType.map(([type, weight]) => (
              <div key={type} className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <span className={`h-2 w-2 rounded-full ${TYPE_STYLES[type]?.bar ?? "bg-zinc-400"}`} />
                {TYPE_STYLES[type]?.label ?? type} <span className="font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">{weight.toFixed(0)}%</span>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {metrics.positions.slice(0, 6).map((p) => (
              <Link key={p.id} to={`/assets/${p.id}`} className="group block">
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="w-12 font-semibold text-zinc-950 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-300">{p.symbol}</span>
                    <span className="truncate text-zinc-500 dark:text-zinc-400">{p.name}</span>
                  </div>
                  <span className="font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">{p.weight.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/[0.06]">
                  <div
                    className={`h-full rounded-full ${TYPE_STYLES[inferType(p.symbol, p.type)]?.bar ?? "bg-zinc-400"}`}
                    style={{ width: `${p.weight}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Brief, connections, activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Card
          title="AI daily brief"
          action={
            <Link to="/advisor" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              Ask the advisor
            </Link>
          }
        >
          <div className="space-y-4">
            {brief.map((item) => (
              <div key={item.title} className="flex gap-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${BRIEF_TONES[item.tone]}`}>
                  <Icon name={item.icon} className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-zinc-950 dark:text-white">{item.title}</div>
                  <p className="mt-0.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <ConnectionsPanel />

        <Card
          title="Recent alerts"
          className="lg:col-span-2 xl:col-span-1"
          action={
            <Link to="/alerts" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              View all
            </Link>
          }
        >
          {alerts.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No alerts yet. You'll see big moves and major news about your holdings here.</p>
          ) : (
            <ol className="relative space-y-5 border-l border-zinc-200 pl-5 dark:border-white/10">
              {alerts.slice(0, 4).map((item) => (
                <li key={item.id} className="relative">
                  <span
                    className={`absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-zinc-900 ${
                      item.kind === "news" ? "bg-indigo-500" : item.direction === "down" ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                  />
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.title}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{timeAgo(item.createdAt)}</div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </PageShell>
  )
}

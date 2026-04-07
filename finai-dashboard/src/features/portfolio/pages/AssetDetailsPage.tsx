import PageShell from "../../../components/layout/PageShell"
import { useParams, useNavigate } from "react-router-dom"
import Sparkline from "../components/Sparkline"
import { useHistoricalPrices } from "../hooks/useHistoricalPrices"
import { useHoldings } from "../hooks/useHoldings"
import { useLivePrice } from "../hooks/useLivePrice"
import { useState } from 'react'
// intent: simple hooks and utilities for details page

const MOCK_PRICES: Record<string, number> = {
  AAPL: 185.4,
  TSLA: 198.5,
  BTC: 62500,
  ETH: 3100,
  SPY: 485.2,
  MSFT: 410.5,
  NVDA: 720.3,
}

function formatCurrency(v: number) {
  return `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

export default function AssetDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { holdings } = useHoldings()
  const [timeframe, setTimeframe] = useState<number>(30)
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null)
  
  const h = holdings.find(x => x.id === id)
  const live = useLivePrice(h?.symbol ?? '')
  const { data: hist, times } = useHistoricalPrices(h?.symbol ?? '', timeframe)

  if (!h) {
    return (
      <PageShell title="Asset Not Found">
        <div className="text-zinc-600 dark:text-zinc-400">Holding not found.</div>
        <div className="mt-4">
          <button className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600" onClick={() => navigate('/assets')}>Back to Assets</button>
        </div>
      </PageShell>
    )
  }

  const currentPrice = live ?? (MOCK_PRICES[h.symbol] ?? 0)
  const totalValue = currentPrice * h.quantity
  const entryTotal = h.entry * h.quantity
  const gainLoss = totalValue - entryTotal
  const pct = h.entry > 0 ? ((currentPrice - h.entry) / h.entry) * 100 : 0

  const tagList = [h.platform, h.type].filter(Boolean)

  return (
    <PageShell title={`${h.symbol} Details`}>
      <div className="space-y-6 fade-up">
        <div className="flex items-start justify-between">
          <div>
            <button className="mb-2 text-sm text-zinc-600 dark:text-zinc-400" onClick={() => navigate('/assets')}>← Back to Assets</button>
            <div className="flex items-center gap-4">
              <div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{h.symbol} <span className="ml-2 text-base font-medium text-zinc-500 dark:text-zinc-400">{h.name}</span></div>
                <div className="mt-2 flex items-center gap-2">
                  {tagList.map(t => (
                    <div key={t} className="pill">{t}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-zinc-500 dark:text-zinc-400">Current Price</div>
            <div className="price-large text-3xl text-zinc-900 dark:text-white">{formatCurrency(currentPrice)}</div>
            <div className={`price-change mt-1 ${gainLoss >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>{gainLoss >= 0 ? '+' : '-'}{formatCurrency(Math.abs(gainLoss))} <span className="text-zinc-500 dark:text-zinc-500">({pct.toFixed(2)}%)</span></div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="metric-card">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Quantity</div>
            <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{h.quantity}</div>
          </div>
          <div className="metric-card">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Entry Price</div>
            <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{formatCurrency(h.entry)}</div>
          </div>
          <div className="metric-card">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Total Value</div>
            <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{formatCurrency(totalValue)}</div>
          </div>
          <div className="metric-card"> 
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Gain / Loss</div>
            <div className={`text-xl font-semibold ${gainLoss >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>{gainLoss >= 0 ? '+' : '-'}{formatCurrency(Math.abs(gainLoss))}</div>
          </div>
        </div>

        <div className="card"> 
          <div className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Price History</div>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Range</div>
              {[7,30,90,365,365*5].map(d => (
                <button key={d} onClick={() => { setTimeframe(d); setHighlightIndex(null) }} className={`rounded-full px-3 py-1 text-sm ${timeframe===d ? 'bg-zinc-100 text-zinc-900 dark:bg-white/6 dark:text-white' : 'bg-transparent text-zinc-600 dark:text-zinc-400'}`}>{d===7? '7D' : d===30? '30D' : d===90? '90D' : d===365? '1Y' : '5Y'}</button>
              ))}
            </div>

            <div className="h-96 rounded-lg overflow-visible relative">
              {(!hist || hist.length === 0) ? (
                <div className="flex h-96 items-center justify-center text-zinc-500 dark:text-zinc-500">Loading chart…</div>
              ) : (
                <>
                  <Sparkline data={hist} times={times ?? undefined} showLast highlightIndex={highlightIndex ?? undefined} height={220} />
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, hist.length - 1)}
                    value={highlightIndex ?? (hist.length - 1)}
                    onChange={e => setHighlightIndex(Number(e.target.value))}
                    className="w-full mt-4 accent-emerald-500"
                  />
                </>
              )}
            </div>
          </div>
        </div>

  {/* AI panel removed - moved to separate tab per UX */}
      </div>
    </PageShell>
  )
}

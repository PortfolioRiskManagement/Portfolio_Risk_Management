import { useNavigate } from "react-router-dom"
import type { Holding } from "../hooks/useHoldings"

type Props = {
  holding: Holding
  currentPrice: number
}

function formatCurrency(v: number) {
  return `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

export default function AssetCard({ holding, currentPrice }: Props) {
  const total = currentPrice * holding.quantity
  const entryTotal = holding.entry * holding.quantity
  const diff = total - entryTotal
  const pct = holding.entry > 0 ? ((currentPrice - holding.entry) / holding.entry) * 100 : 0

  const risk = pct > 30 ? "LOW" : pct > 0 ? "MEDIUM" : "HIGH"

  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/assets/${holding.id}`)}
      className="cursor-pointer w-full bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-4 border border-zinc-800/40 mb-4 transform transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl"
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-600 flex items-center justify-center text-sm font-bold text-white ring-1 ring-zinc-700">{holding.symbol}</div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="font-semibold text-zinc-100 truncate">{holding.symbol}</div>
              <div className="text-xs uppercase tracking-wider text-zinc-400 px-2 py-0.5 rounded-full bg-zinc-800/30">{holding.type ?? 'Asset'}</div>
            </div>
            <div className="text-sm text-zinc-400 truncate">{holding.name}</div>
            <div className="mt-2 text-xs text-zinc-500">{holding.platform}</div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center text-center min-w-[80px]">
            <div className="text-xs text-zinc-400">Qty</div>
            <div className="font-medium text-zinc-100">{holding.quantity}</div>
          </div>

          <div className="flex flex-col items-center text-center min-w-[120px]">
            <div className="text-xs text-zinc-400">Entry</div>
            <div className="font-medium text-zinc-100">{formatCurrency(holding.entry)}</div>
          </div>

          <div className="flex flex-col items-end min-w-[160px]">
            <div className="text-xs text-zinc-400">Current</div>
            <div className="font-bold text-zinc-100 text-lg">{formatCurrency(currentPrice)}</div>
            <div className={`mt-2 text-sm ${diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{diff >= 0 ? '+' : '-'}{formatCurrency(Math.abs(diff))} <span className="text-zinc-500">({pct.toFixed(2)}%)</span></div>
            <div className="mt-3">
              <div className={`text-xs px-3 py-1 rounded-full ${risk === 'HIGH' ? 'bg-rose-600 text-white' : risk === 'MEDIUM' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'}`}>{risk}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

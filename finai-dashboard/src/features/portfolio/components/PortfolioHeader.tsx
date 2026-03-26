import type { PortfolioSummary } from '../types/portfolio.types'
import { formatCurrency, formatPercent } from '../../../utils/formatCurrency'
import Card from '../../../components/ui/Card'

interface Props {
  summary: PortfolioSummary
}

export default function PortfolioHeader({ summary }: Props) {
  const registeredPercent = (summary.registeredBalance / summary.totalValue) * 100
  const nonRegisteredPercent = (summary.nonRegisteredBalance / summary.totalValue) * 100

  return (
    <div className="mb-8">
      {/* Hero Section */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white mb-2">Portfolio Command Center</h1>
        <p className="text-lg text-zinc-400">
          Optimize your account structure, maximize tax efficiency, and plan strategic contributions
        </p>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="col-span-2 md:col-span-1">
          <div className="text-zinc-400 text-xs mb-1 uppercase tracking-wide">Total Value</div>
          <div className="text-3xl font-bold text-white mb-1">{formatCurrency(summary.totalValue)}</div>
          <div className={`text-sm ${summary.totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(summary.totalGain)} ({formatPercent(summary.totalGainPercent)})
          </div>
        </Card>

        <Card>
          <div className="text-zinc-400 text-xs mb-1 uppercase tracking-wide">Health Score</div>
          <div className="text-3xl font-bold text-white mb-1">{summary.healthScore}</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  summary.healthScore >= 80
                    ? 'bg-green-500'
                    : summary.healthScore >= 60
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${summary.healthScore}%` }}
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-zinc-400 text-xs mb-1 uppercase tracking-wide">Room Available</div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatCurrency(summary.contributionRoomRemaining)}
          </div>
          <div className="text-xs text-zinc-500">Tax-advantaged</div>
        </Card>

        <Card>
          <div className="text-zinc-400 text-xs mb-1 uppercase tracking-wide">Active Accounts</div>
          <div className="text-3xl font-bold text-white mb-1">{summary.activeAccounts}</div>
          <div className="text-xs text-zinc-500">Across all types</div>
        </Card>

        <Card>
          <div className="text-zinc-400 text-xs mb-1 uppercase tracking-wide">Registered</div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatCurrency(summary.registeredBalance)}
          </div>
          <div className="text-xs text-emerald-400">{registeredPercent.toFixed(1)}% of portfolio</div>
        </Card>

        <Card>
          <div className="text-zinc-400 text-xs mb-1 uppercase tracking-wide">Non-Registered</div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatCurrency(summary.nonRegisteredBalance)}
          </div>
          <div className="text-xs text-zinc-400">{nonRegisteredPercent.toFixed(1)}% of portfolio</div>
        </Card>
      </div>
    </div>
  )
}

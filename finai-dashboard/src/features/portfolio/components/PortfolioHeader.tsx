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
        <h1 className="mb-2 text-4xl font-bold text-zinc-950 dark:text-white">Portfolio Command Center</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Optimize your account structure, maximize tax efficiency, and plan strategic contributions
        </p>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="col-span-2 md:col-span-1">
          <div className="mb-1 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Total Value</div>
          <div className="mb-1 text-3xl font-bold text-zinc-950 dark:text-white">{formatCurrency(summary.totalValue)}</div>
          <div className={`text-sm ${summary.totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(summary.totalGain)} ({formatPercent(summary.totalGainPercent)})
          </div>
        </Card>

        <Card>
          <div className="mb-1 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Health Score</div>
          <div className="mb-1 text-3xl font-bold text-zinc-950 dark:text-white">{summary.healthScore}</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
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
          <div className="mb-1 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Room Available</div>
          <div className="mb-1 text-2xl font-bold text-zinc-950 dark:text-white">
            {formatCurrency(summary.contributionRoomRemaining)}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-500">Tax-advantaged</div>
        </Card>

        <Card>
          <div className="mb-1 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Active Accounts</div>
          <div className="mb-1 text-3xl font-bold text-zinc-950 dark:text-white">{summary.activeAccounts}</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-500">Across all types</div>
        </Card>

        <Card>
          <div className="mb-1 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Registered</div>
          <div className="mb-1 text-2xl font-bold text-zinc-950 dark:text-white">
            {formatCurrency(summary.registeredBalance)}
          </div>
          <div className="text-xs text-emerald-400">{registeredPercent.toFixed(1)}% of portfolio</div>
        </Card>

        <Card>
          <div className="mb-1 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Non-Registered</div>
          <div className="mb-1 text-2xl font-bold text-zinc-950 dark:text-white">
            {formatCurrency(summary.nonRegisteredBalance)}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">{nonRegisteredPercent.toFixed(1)}% of portfolio</div>
        </Card>
      </div>
    </div>
  )
}

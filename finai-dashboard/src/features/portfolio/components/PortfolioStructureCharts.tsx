import type { Account } from '../types/portfolio.types'
import { formatCurrency } from '../../../utils/formatCurrency'
import Card from '../../../components/ui/Card'

interface Props {
  accounts: Account[]
}

export default function PortfolioStructureCharts({ accounts }: Props) {
  const totalValue = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  // Account distribution
  const accountDistribution = accounts.map((acc) => ({
    type: acc.type,
    name: acc.name,
    value: acc.balance,
    percentage: (acc.balance / totalValue) * 100,
    color: getAccountColor(acc.type),
  }))

  // Registered vs Non-Registered
  const registeredTypes = ['RRSP', 'TFSA', 'FHSA']
  const registeredValue = accounts
    .filter((acc) => registeredTypes.includes(acc.type))
    .reduce((sum, acc) => sum + acc.balance, 0)
  const nonRegisteredValue = totalValue - registeredValue
  const registeredPercent = (registeredValue / totalValue) * 100

  // Contribution room usage
  const contributionData = accounts
    .filter((acc) => acc.type !== 'PERSONAL')
    .map((acc) => ({
      type: acc.type,
      used: acc.contributionUsed,
      remaining: acc.contributionRoom,
      total: acc.contributionLimit,
      usedPercent: (acc.contributionUsed / acc.contributionLimit) * 100,
    }))

  return (
    <div className="mb-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">📊</span>
          <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">Portfolio Structure & Analytics</h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Visual breakdown of your account distribution and contribution room usage
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Distribution */}
        <Card className="border-blue-600/20 hover:border-blue-600/40 transition-all duration-300">
          <h3 className="mb-5 flex items-center gap-2 font-bold text-zinc-950 dark:text-white">
            <span className="text-lg">🏦</span>
            Account Distribution
          </h3>
          <div className="space-y-4">
            {accountDistribution.map((acc) => (
              <div key={acc.type} className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-zinc-700 transition-colors group-hover:text-blue-700 dark:text-zinc-300 dark:group-hover:text-blue-300">
                    {acc.name}
                  </span>
                  <span className="text-sm font-bold text-zinc-950 dark:text-white">{formatCurrency(acc.value)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 overflow-hidden rounded-full border border-zinc-200 bg-gradient-to-r from-zinc-200 to-zinc-100 dark:border-zinc-800/50 dark:from-zinc-800 dark:to-zinc-900">
                    <div
                      className="h-full rounded-full transition-all duration-500 shadow-lg"
                      style={{
                        width: `${acc.percentage}%`,
                        backgroundColor: acc.color,
                      }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm font-semibold text-zinc-500 transition-colors group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white">
                    {acc.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Registered vs Non-Registered */}
        <Card className="border-emerald-600/20 hover:border-emerald-600/40 transition-all duration-300">
          <h3 className="mb-5 flex items-center gap-2 font-bold text-zinc-950 dark:text-white">
            <span className="text-lg">🎯</span>
            Registered vs Non-Registered
          </h3>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-56 h-56">
              {/* Circular chart simulation */}
              <svg className="w-full h-full transform -rotate-90 drop-shadow-lg" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="20"
                  strokeDasharray={`${registeredPercent * 2.513} 251.3`}
                  opacity="0.9"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="20"
                  strokeDasharray={`${(100 - registeredPercent) * 2.513} 251.3`}
                  strokeDashoffset={`-${registeredPercent * 2.513}`}
                  opacity="0.9"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-400">{registeredPercent.toFixed(0)}%</div>
                  <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Registered</div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-4 transition-all hover:border-emerald-300 dark:border-emerald-600/30 dark:from-emerald-600/10 dark:to-emerald-500/5 dark:hover:border-emerald-600/50">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full"></div>
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Registered Accounts</span>
              </div>
              <span className="text-lg font-bold text-zinc-950 dark:text-white">{formatCurrency(registeredValue)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white p-4 transition-all hover:border-indigo-300 dark:border-indigo-600/30 dark:from-indigo-600/10 dark:to-indigo-500/5 dark:hover:border-indigo-600/50">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full"></div>
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Non-Registered</span>
              </div>
              <span className="text-lg font-bold text-zinc-950 dark:text-white">{formatCurrency(nonRegisteredValue)}</span>
            </div>
          </div>
        </Card>

        {/* Contribution Room Usage */}
        <Card className="lg:col-span-2 border-amber-600/20 hover:border-amber-600/40 transition-all duration-300">
          <h3 className="mb-6 flex items-center gap-2 font-bold text-zinc-950 dark:text-white">
            <span className="text-lg">💰</span>
            Contribution Room Usage
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {contributionData.length > 0 ? (
              contributionData.map((data) => (
                <div
                  key={data.type}
                  className="group rounded-xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-5 transition-all duration-300 hover:border-amber-300 dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-900 dark:hover:border-amber-600/40"
                >
                  <div className="text-center mb-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500 transition-colors group-hover:text-amber-500 dark:text-zinc-500 dark:group-hover:text-amber-400">
                      {data.type}
                    </div>
                    <div className="text-4xl font-bold text-zinc-950 transition-colors group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-300">
                      {data.usedPercent.toFixed(0)}%
                    </div>
                  </div>
                  <div className="mb-4 h-3 overflow-hidden rounded-full border border-zinc-200 bg-gradient-to-r from-zinc-200 to-zinc-100 dark:border-zinc-800/50 dark:from-zinc-800 dark:to-zinc-700">
                    <div
                      className={`h-full rounded-full transition-all duration-500 shadow-lg ${
                        data.usedPercent >= 90
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                          : data.usedPercent >= 50
                          ? 'bg-gradient-to-r from-blue-500 to-blue-400'
                          : 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                      }`}
                      style={{ width: `${Math.min(data.usedPercent, 100)}%` }}
                    />
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-zinc-500 dark:text-zinc-500">Used</span>
                      <span className="font-bold text-zinc-700 dark:text-zinc-200">{formatCurrency(data.used)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-zinc-500 dark:text-zinc-500">Remaining</span>
                      <span className="text-emerald-400 font-bold">{formatCurrency(data.remaining)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-zinc-200 pt-2 dark:border-zinc-800">
                      <span className="font-medium text-zinc-500 dark:text-zinc-500">Annual Limit</span>
                      <span className="font-bold text-zinc-950 dark:text-white">{formatCurrency(data.total)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-zinc-500 dark:text-zinc-400 lg:col-span-2">
                No contribution room data available
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

function getAccountColor(type: string): string {
  switch (type) {
    case 'TFSA':
      return '#10b981' // green
    case 'RRSP':
      return '#3b82f6' // blue
    case 'FHSA':
      return '#8b5cf6' // purple
    case 'PERSONAL':
      return '#6366f1' // indigo
    default:
      return '#6b7280' // gray
  }
}

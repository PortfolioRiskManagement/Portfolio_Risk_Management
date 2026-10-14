import type { Account } from '../types/portfolio.types'
import { formatCurrency } from '../../../utils/formatCurrency'
import Card from '../../../components/ui/Card'
import Icon, { type IconName } from '../../../components/ui/Icon'

function CardHeading({ icon, children }: { icon: IconName; children: React.ReactNode }) {
  return (
    <h3 className="mb-5 flex items-center gap-2.5 font-semibold text-zinc-950 dark:text-white">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-300">
        <Icon name={icon} className="h-4 w-4" />
      </span>
      {children}
    </h3>
  )
}

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
      usedPercent: acc.contributionLimit > 0 ? (acc.contributionUsed / acc.contributionLimit) * 100 : 0,
    }))

  return (
    <section>
      <div className="mb-6">
        <h2 className="mb-1 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Structure & analytics</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Visual breakdown of your account distribution and contribution room usage
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Distribution */}
        <Card>
          <CardHeading icon="layers">Account distribution</CardHeading>
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
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/[0.06]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
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
        <Card>
          <CardHeading icon="pie">Registered vs non-registered</CardHeading>
          <div className="flex items-center justify-center mb-6">
            <div className="relative h-48 w-48">
              {/* Circular chart simulation */}
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeDasharray={`${registeredPercent * 2.513} 251.3`}
                  
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="12"
                  strokeDasharray={`${(100 - registeredPercent) * 2.513} 251.3`}
                  strokeDashoffset={`-${registeredPercent * 2.513}`}
                  
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold tracking-tight text-zinc-950 dark:text-white">{registeredPercent.toFixed(0)}%</div>
                  <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Registered</div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 dark:bg-white/[0.03]">
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Registered Accounts</span>
              </div>
              <span className="font-bold tabular-nums text-zinc-950 dark:text-white">{formatCurrency(registeredValue)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 dark:bg-white/[0.03]">
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-indigo-500"></div>
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Non-Registered</span>
              </div>
              <span className="font-bold tabular-nums text-zinc-950 dark:text-white">{formatCurrency(nonRegisteredValue)}</span>
            </div>
          </div>
        </Card>

        {/* Contribution Room Usage */}
        <Card className="lg:col-span-2">
          <CardHeading icon="piggy">Contribution room usage</CardHeading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {contributionData.length > 0 ? (
              contributionData.map((data) => (
                <div
                  key={data.type}
                  className="rounded-xl bg-zinc-50 p-5 dark:bg-white/[0.03]"
                >
                  <div className="text-center mb-4">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                      {data.type}
                    </div>
                    <div className="text-4xl font-bold tracking-tight tabular-nums text-zinc-950 dark:text-white">
                      {data.usedPercent.toFixed(0)}%
                    </div>
                  </div>
                  <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/[0.08]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500"
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
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(data.remaining)}</span>
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
    </section>
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

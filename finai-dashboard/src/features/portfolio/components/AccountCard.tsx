import { useState } from 'react'
import type { Account } from '../types/portfolio.types'
import { formatCurrency, formatPercent } from '../../../utils/formatCurrency'
import Card from '../../../components/ui/Card'
import Icon, { type IconName } from '../../../components/ui/Icon'

interface Props {
  account: Account
}

const STATUS_BADGES: Record<string, { text: string; className: string }> = {
  optimized: { text: 'Optimized', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
  underused: { text: 'Underused', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
  overused: { text: 'Over limit', className: 'bg-rose-500/10 text-rose-700 dark:text-rose-400' },
  normal: { text: 'On track', className: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300' },
}

const ACCOUNT_STYLES: Record<string, { icon: IconName; tile: string }> = {
  RRSP: { icon: 'piggy', tile: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  TFSA: { icon: 'trendUp', tile: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  FHSA: { icon: 'home', tile: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  PERSONAL: { icon: 'portfolio', tile: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
}

export default function AccountCard({ account }: Props) {
  const [showDetails, setShowDetails] = useState(false)

  const statusBadge = STATUS_BADGES[account.status] ?? STATUS_BADGES.normal
  const style = ACCOUNT_STYLES[account.type] ?? ACCOUNT_STYLES.PERSONAL
  // Non-registered accounts have no contribution limit, so there is no room to track.
  const hasContributionLimit = account.type !== 'PERSONAL'
  const isOver = account.contributionRoom < 0
  const contributionPercent = hasContributionLimit ? (account.contributionUsed / account.contributionLimit) * 100 : 0
  const isUp = account.gain >= 0

  return (
    <Card className="flex h-full flex-col transition-shadow duration-300 hover:shadow-lg hover:shadow-indigo-500/5">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.tile}`}>
            <Icon name={style.icon} className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-zinc-950 dark:text-white">{account.name}</h3>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{account.purpose}</p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge.className}`}>{statusBadge.text}</span>
      </div>

      {/* Balance */}
      <div className="mb-5">
        <div className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">Balance</div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-3xl font-bold tracking-tight tabular-nums text-zinc-950 dark:text-white">{formatCurrency(account.balance)}</span>
          <span
            className={`rounded-md px-1.5 py-0.5 text-sm font-semibold tabular-nums ${
              isUp ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
            }`}
          >
            {isUp ? '+' : ''}
            {formatCurrency(account.gain)} ({formatPercent(account.gainPercent)})
          </span>
        </div>
      </div>

      {/* Contribution room */}
      <div className="mb-5 rounded-xl bg-zinc-50 p-4 dark:bg-white/[0.03]">
        {hasContributionLimit ? (
          <>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Contribution room</span>
              <span className={`font-semibold tabular-nums ${isOver ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-950 dark:text-white'}`}>
                {isOver ? `${formatCurrency(-account.contributionRoom)} over` : `${formatCurrency(account.contributionRoom)} left`}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/[0.08]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500'}`}
                style={{ width: `${Math.min(contributionPercent, 100)}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
              <span>{formatCurrency(account.contributionUsed)} used</span>
              <span>{formatCurrency(account.contributionLimit)} limit</span>
            </div>
            {account.contributionNote && (
              <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{account.contributionNote}</p>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Contribution room</span>
            <span className="text-zinc-500 dark:text-zinc-400">No annual limit</span>
          </div>
        )}
      </div>

      {/* Tax advantage */}
      <div className="mb-4 flex gap-3">
        <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          <span className="font-semibold text-zinc-950 dark:text-white">Tax advantage. </span>
          {account.taxBenefit}
        </p>
      </div>

      {/* Expandable details */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${showDetails ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="space-y-3 border-t border-zinc-200/80 pt-4 text-sm dark:border-white/[0.06]">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">Role in portfolio</span>
            <span className="font-semibold text-zinc-950 dark:text-white">Priority #{account.priority}</span>
          </div>
          {account.recommendedAction && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3">
              <div className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400">Recommended action</div>
              <div className="text-zinc-700 dark:text-zinc-200">{account.recommendedAction}</div>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        aria-expanded={showDetails}
        className="mt-auto inline-flex items-center gap-1 self-start pt-3 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        {showDetails ? 'Hide details' : 'Show details'}
        <Icon name="chevronDown" className={`h-4 w-4 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} />
      </button>
    </Card>
  )
}

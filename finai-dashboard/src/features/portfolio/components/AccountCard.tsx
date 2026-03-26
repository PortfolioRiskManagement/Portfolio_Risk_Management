import { useState } from 'react'
import type { Account } from '../types/portfolio.types'
import { formatCurrency, formatPercent } from '../../../utils/formatCurrency'
import Card from '../../../components/ui/Card'

interface Props {
  account: Account
}

export default function AccountCard({ account }: Props) {
  const [showDetails, setShowDetails] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'optimized':
        return {
          text: 'Optimized',
          color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          icon: '✓',
        }
      case 'underused':
        return {
          text: 'Underused',
          color: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
          icon: '⚠',
        }
      case 'overused':
        return {
          text: 'Over Limit',
          color: 'bg-red-500/10 border-red-500/30 text-red-400',
          icon: '!',
        }
      default:
        return {
          text: 'Normal',
          color: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          icon: '•',
        }
    }
  }

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'TFSA':
        return '🌱'
      case 'RRSP':
        return '🏦'
      case 'FHSA':
        return '🏡'
      case 'PERSONAL':
        return '💼'
      default:
        return '💰'
    }
  }

  const statusBadge = getStatusBadge(account.status)
  const contributionPercent = (account.contributionUsed / account.contributionLimit) * 100

  return (
    <Card className="group relative overflow-hidden hover:border-blue-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/10">
      {/* Gradient accent on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative">
        {/* Header with Icon and Status */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="text-4xl bg-gradient-to-br from-white/10 to-white/5 p-3 rounded-xl group-hover:from-blue-500/20 group-hover:to-blue-400/10 transition-all duration-300">
              {getAccountIcon(account.type)}
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg group-hover:text-blue-300 transition-colors duration-300">
                {account.name}
              </h3>
              <p className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">{account.purpose}</p>
            </div>
          </div>
          <div
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm transition-all duration-300 ${statusBadge.color}`}
          >
            <span>{statusBadge.icon}</span>
            {statusBadge.text}
          </div>
        </div>

        {/* Balance and Performance - Enhanced */}
        <div className="mb-5 pb-5 border-b border-zinc-800/50">
          <div className="text-xs uppercase tracking-widest text-zinc-500 mb-2 font-semibold">Current Balance</div>
          <div className="flex items-baseline gap-3">
            <div className="text-3xl font-bold text-white">{formatCurrency(account.balance)}</div>
            <div
              className={`text-sm font-semibold px-2.5 py-1 rounded-lg ${
                account.gain >= 0
                  ? 'text-green-400 bg-green-500/10 border border-green-500/30'
                  : 'text-red-400 bg-red-500/10 border border-red-500/30'
              }`}
            >
              {account.gain >= 0 ? '+' : ''}{formatCurrency(account.gain)} ({formatPercent(account.gainPercent)})
            </div>
          </div>
        </div>

        {/* Contribution Room - Enhanced */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">Contribution Room</span>
            <span className="text-sm font-bold text-emerald-400">{formatCurrency(account.contributionRoom)} left</span>
          </div>
          <div className="h-2.5 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                contributionPercent >= 90
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : contributionPercent >= 50
                  ? 'bg-gradient-to-r from-blue-500 to-blue-400'
                  : 'bg-gradient-to-r from-yellow-500 to-yellow-400'
              }`}
              style={{ width: `${Math.min(contributionPercent, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-zinc-500">{formatCurrency(account.contributionUsed)} used</span>
            <span className="text-xs text-zinc-500">{formatCurrency(account.contributionLimit)} limit</span>
          </div>
        </div>

        {/* Tax Benefit - Enhanced */}
        <div className="mb-5 p-3.5 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30 rounded-lg">
          <div className="text-xs font-bold text-blue-400 mb-1 uppercase tracking-widest">Tax Advantage</div>
          <div className="text-sm text-blue-200">{account.taxBenefit}</div>
        </div>

        {/* Expandable Details - Smooth Animation */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            showDetails ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-3 pt-4 border-t border-zinc-800/50">
            <div>
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Role in Portfolio</div>
              <div className="text-sm text-zinc-300 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/30 backdrop-blur-sm">
                Priority #{account.priority} in your overall portfolio strategy
              </div>
            </div>

            {account.recommendedAction && (
              <div>
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Recommended Action</div>
                <div className="text-sm text-emerald-200 bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-lg backdrop-blur-sm">
                  {account.recommendedAction}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button - Enhanced */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full mt-4 py-2.5 px-4 bg-gradient-to-r from-zinc-900 to-zinc-950 hover:from-blue-950/40 hover:to-blue-900/20 border border-zinc-800 hover:border-blue-600/50 rounded-lg text-sm font-semibold text-zinc-400 hover:text-blue-300 transition-all duration-300"
        >
          {showDetails ? '▲ Hide details' : '▼ Show details'}
        </button>
      </div>
    </Card>
  )
}

import type { ContributionPlan } from '../types/portfolio.types'
import { formatCurrency } from '../../../utils/formatCurrency'
import Card from '../../../components/ui/Card'

interface Props {
  contributionPlans: ContributionPlan[]
  monthlyBudget: number
}

export default function ContributionPlanSection({ contributionPlans, monthlyBudget }: Props) {
  const getAccountIcon = (accountType: string) => {
    switch (accountType) {
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

  const getAccountLabel = (accountType: string) => {
    switch (accountType) {
      case 'TFSA':
        return 'Tax-Free Savings Account'
      case 'RRSP':
        return 'Registered Retirement Savings Plan'
      case 'FHSA':
        return 'First Home Savings Account'
      case 'PERSONAL':
        return 'Personal Investment Account'
      default:
        return accountType
    }
  }

  const totalAllocated = contributionPlans.reduce((sum, plan) => sum + plan.monthlyAmount, 0)
  const remaining = monthlyBudget - totalAllocated
  const budgetUsagePercent =
    monthlyBudget > 0 ? Math.min((totalAllocated / monthlyBudget) * 100, 100) : 0

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h2 className="mb-1 text-2xl font-bold text-zinc-950 dark:text-white">Recommended Contribution Plan</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Optimal monthly contribution strategy based on your profile and tax situation
        </p>
      </div>

      {/* Budget Overview */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="mb-1 text-sm text-zinc-500 dark:text-zinc-400">Monthly Budget</div>
            <div className="text-3xl font-bold text-zinc-950 dark:text-white">{formatCurrency(monthlyBudget)}</div>
          </div>
          <div className="text-right">
            <div className="mb-1 text-sm text-zinc-500 dark:text-zinc-400">Allocated</div>
            <div className="text-2xl font-bold text-emerald-400">{formatCurrency(totalAllocated)}</div>
          </div>
          {remaining > 0 && (
            <div className="text-right">
              <div className="mb-1 text-sm text-zinc-500 dark:text-zinc-400">Remaining</div>
              <div className="text-2xl font-bold text-blue-400">{formatCurrency(remaining)}</div>
            </div>
          )}
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500"
            style={{ width: `${budgetUsagePercent}%` }}
          />
        </div>
      </Card>

      {/* Contribution Plans */}
      <div className="space-y-3">
        {contributionPlans.map((plan) => (
          <Card
            key={plan.accountType}
            className="transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-2xl dark:border-zinc-800 dark:bg-zinc-950">
                {getAccountIcon(plan.accountType)}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-7 h-7 bg-blue-600 rounded-full text-white text-sm font-bold">
                      {plan.priority}
                    </div>
                    <div>
                    <div className="font-semibold text-zinc-950 dark:text-white">{plan.accountType}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-500">{getAccountLabel(plan.accountType)}</div>
                    </div>
                  </div>

                <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">{plan.reasoning}</p>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="mb-1 text-xs text-zinc-500 dark:text-zinc-500">Recommended Monthly</div>
                    <div className="text-xl font-bold text-zinc-950 dark:text-white">{formatCurrency(plan.monthlyAmount)}</div>
                  </div>

                  {plan.taxSavings && plan.taxSavings > 0 && (
                    <div className="flex-1">
                      <div className="mb-1 text-xs text-zinc-500 dark:text-zinc-500">Estimated Annual Tax Savings</div>
                      <div className="text-xl font-bold text-emerald-400">{formatCurrency(plan.taxSavings)}</div>
                    </div>
                  )}

                  <div className="flex-1 text-right">
                    <div className="mb-1 text-xs text-zinc-500 dark:text-zinc-500">Annual Total</div>
                    <div className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
                      {formatCurrency(plan.monthlyAmount * 12)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {contributionPlans.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📋</div>
            <p className="mb-2 text-zinc-600 dark:text-zinc-400">Complete your portfolio profile to see recommendations</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">We need your income and contribution budget to generate a personalized plan</p>
          </div>
        </Card>
      )}
    </div>
  )
}

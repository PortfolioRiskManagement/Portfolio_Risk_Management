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
        <h2 className="text-2xl font-bold text-white mb-1">Recommended Contribution Plan</h2>
        <p className="text-sm text-zinc-400">
          Optimal monthly contribution strategy based on your profile and tax situation
        </p>
      </div>

      {/* Budget Overview */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm text-zinc-400 mb-1">Monthly Budget</div>
            <div className="text-3xl font-bold text-white">{formatCurrency(monthlyBudget)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-zinc-400 mb-1">Allocated</div>
            <div className="text-2xl font-bold text-emerald-400">{formatCurrency(totalAllocated)}</div>
          </div>
          {remaining > 0 && (
            <div className="text-right">
              <div className="text-sm text-zinc-400 mb-1">Remaining</div>
              <div className="text-2xl font-bold text-blue-400">{formatCurrency(remaining)}</div>
            </div>
          )}
        </div>

        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
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
            className="hover:border-zinc-700 transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-xl text-2xl">
                {getAccountIcon(plan.accountType)}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-7 h-7 bg-blue-600 rounded-full text-white text-sm font-bold">
                    {plan.priority}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{plan.accountType}</div>
                    <div className="text-xs text-zinc-500">{getAccountLabel(plan.accountType)}</div>
                  </div>
                </div>

                <p className="text-sm text-zinc-400 mb-3">{plan.reasoning}</p>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-xs text-zinc-500 mb-1">Recommended Monthly</div>
                    <div className="text-xl font-bold text-white">{formatCurrency(plan.monthlyAmount)}</div>
                  </div>

                  {plan.taxSavings && plan.taxSavings > 0 && (
                    <div className="flex-1">
                      <div className="text-xs text-zinc-500 mb-1">Estimated Annual Tax Savings</div>
                      <div className="text-xl font-bold text-emerald-400">{formatCurrency(plan.taxSavings)}</div>
                    </div>
                  )}

                  <div className="flex-1 text-right">
                    <div className="text-xs text-zinc-500 mb-1">Annual Total</div>
                    <div className="text-lg font-semibold text-zinc-300">
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
            <p className="text-zinc-400 mb-2">Complete your portfolio profile to see recommendations</p>
            <p className="text-sm text-zinc-500">We need your income and contribution budget to generate a personalized plan</p>
          </div>
        </Card>
      )}
    </div>
  )
}

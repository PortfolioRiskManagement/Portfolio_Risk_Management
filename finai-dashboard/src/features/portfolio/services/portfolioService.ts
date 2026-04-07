import type {
  Account,
  PortfolioSummary,
  UserProfile,
  ContributionPlan,
  Recommendation,
  PortfolioInsight,
} from '../types/portfolio.types'

// Mock data for demonstration
export const mockAccounts: Account[] = [
  {
    id: '1',
    type: 'RRSP',
    name: 'Registered Retirement Savings Plan',
    balance: 48520,
    gain: 14234,
    gainPercent: 41.5,
    contributionRoom: 15230,
    contributionUsed: 12000,
    contributionLimit: 27230,
    purpose: 'Tax-deferred retirement savings account',
    taxBenefit: 'Contributions are tax-deductible. Growth is tax-deferred until withdrawal.',
    status: 'normal',
    priority: 2,
    recommendedAction: 'Continue contributions at current pace. Consider maximizing before year-end for tax deduction.',
  },
  {
    id: '2',
    type: 'TFSA',
    name: 'Tax-Free Savings Account',
    balance: 31250,
    gain: 7812,
    gainPercent: 33.3,
    contributionRoom: 70000,
    contributionUsed: 25000,
    contributionLimit: 95000,
    purpose: 'Tax-free investment growth and withdrawals',
    taxBenefit: 'No tax on growth or withdrawals. Ideal for flexibility and tax-free compounding.',
    status: 'underused',
    priority: 1,
    recommendedAction: 'Strong underutilization detected. Prioritize TFSA contributions for maximum tax-free growth.',
  },
  {
    id: '3',
    type: 'FHSA',
    name: 'First Home Savings Account',
    balance: 8000,
    gain: 256,
    gainPercent: 3.3,
    contributionRoom: 0,
    contributionUsed: 8000,
    contributionLimit: 8000,
    purpose: 'Tax-free savings for your first home purchase',
    taxBenefit: 'Contributions are tax-deductible and withdrawals for first home are tax-free.',
    status: 'optimized',
    priority: 3,
    recommendedAction: 'Contribution limit reached for this year. Excellent progress toward home ownership goal.',
  },
  {
    id: '4',
    type: 'PERSONAL',
    name: 'Personal Investment Account',
    balance: 44852,
    gain: 5816,
    gainPercent: 14.9,
    contributionRoom: 0,
    contributionUsed: 0,
    contributionLimit: 0,
    purpose: 'Non-registered taxable investment account',
    taxBenefit: 'Capital gains taxed at 50%. Dividends receive favorable tax treatment.',
    status: 'normal',
    priority: 4,
    recommendedAction: 'Consider moving future contributions to registered accounts to maximize tax efficiency.',
  },
]

export function getPortfolioSummary(accounts: Account[]): PortfolioSummary {
  const totalValue = accounts.reduce((sum, acc) => sum + acc.balance, 0)
  const totalGain = accounts.reduce((sum, acc) => sum + acc.gain, 0)
  const totalGainPercent = (totalGain / (totalValue - totalGain)) * 100

  const registeredTypes = ['RRSP', 'TFSA', 'FHSA']
  const registeredBalance = accounts
    .filter((acc) => registeredTypes.includes(acc.type))
    .reduce((sum, acc) => sum + acc.balance, 0)
  const nonRegisteredBalance = totalValue - registeredBalance

  const contributionRoomRemaining = accounts
    .filter((acc) => acc.type !== 'PERSONAL')
    .reduce((sum, acc) => sum + acc.contributionRoom, 0)

  // Calculate health score based on various factors
  const healthScore = calculateHealthScore(accounts, contributionRoomRemaining, registeredBalance, totalValue)

  return {
    totalValue,
    totalGain,
    totalGainPercent,
    healthScore,
    contributionRoomRemaining,
    activeAccounts: accounts.length,
    registeredBalance,
    nonRegisteredBalance,
  }
}

function calculateHealthScore(
  accounts: Account[],
  contributionRoomRemaining: number,
  registeredBalance: number,
  totalValue: number
): number {
  let score = 50 // Base score

  // Bonus for high registered account usage
  const registeredPercent = (registeredBalance / totalValue) * 100
  if (registeredPercent > 70) score += 20
  else if (registeredPercent > 50) score += 10

  // Bonus for contribution room utilization
  const totalContribLimit = accounts
    .filter((acc) => acc.type !== 'PERSONAL')
    .reduce((sum, acc) => sum + acc.contributionLimit, 0)
  const utilizationPercent = ((totalContribLimit - contributionRoomRemaining) / totalContribLimit) * 100
  if (utilizationPercent > 60) score += 15
  else if (utilizationPercent > 40) score += 10

  // Bonus for diversification
  if (accounts.length >= 3) score += 10

  // Bonus for positive overall returns
  const avgGainPercent = accounts.reduce((sum, acc) => sum + acc.gainPercent, 0) / accounts.length
  if (avgGainPercent > 20) score += 5

  return Math.min(score, 100)
}

export function generateRecommendations(accounts: Account[], profile: UserProfile): Recommendation[] {
  const recommendations: Recommendation[] = []

  // Check TFSA utilization
  const tfsa = accounts.find((acc) => acc.type === 'TFSA')
  if (tfsa && tfsa.contributionRoom > 40000) {
    recommendations.push({
      id: 'tfsa-underused',
      title: 'Maximize TFSA Benefits',
      description: `You have $${tfsa.contributionRoom.toLocaleString()} in unused TFSA room. This is valuable tax-free growth potential.`,
      impact: 'high',
      category: 'tax-optimization',
      action: 'Prioritize TFSA contributions to take advantage of tax-free growth and flexible withdrawals.',
    })
  }

  // Check if FHSA should be prioritized
  if (profile.hasHomePurchaseGoal) {
    const fhsa = accounts.find((acc) => acc.type === 'FHSA')
    if (fhsa && fhsa.contributionRoom > 0) {
      recommendations.push({
        id: 'fhsa-priority',
        title: 'Fund FHSA for Home Purchase',
        description: 'With your home-buying goal, FHSA offers both tax deduction and tax-free withdrawal.',
        impact: 'high',
        category: 'goal-alignment',
        action: `Contribute $${fhsa.contributionRoom.toLocaleString()} to FHSA before other accounts for maximum home-buying benefit.`,
      })
    }
  }

  // Check income vs RRSP
  if (profile.annualIncome && profile.annualIncome > 70000) {
    const rrsp = accounts.find((acc) => acc.type === 'RRSP')
    if (rrsp && rrsp.contributionRoom > 10000) {
      recommendations.push({
        id: 'rrsp-tax-benefit',
        title: 'RRSP Tax Deduction at High Income',
        description: `At your income level ($${profile.annualIncome.toLocaleString()}), RRSP contributions provide significant tax savings.`,
        impact: 'high',
        category: 'tax-optimization',
        action: 'Maximize RRSP contributions to reduce taxable income and defer taxes on investment growth.',
      })
    }
  }

  // Check non-registered exposure
  const personal = accounts.find((acc) => acc.type === 'PERSONAL')
  const totalRegisteredRoom = accounts
    .filter((acc) => acc.type !== 'PERSONAL')
    .reduce((sum, acc) => sum + acc.contributionRoom, 0)

  if (personal && personal.balance > 30000 && totalRegisteredRoom > 20000) {
    recommendations.push({
      id: 'reduce-taxable',
      title: 'Reduce Taxable Account Exposure',
      description: 'You have significant registered contribution room available while holding taxable investments.',
      impact: 'medium',
      category: 'tax-optimization',
      action: 'Consider reallocating future contributions from personal account to registered accounts.',
    })
  }

  // Check contribution pacing
  if (profile.monthlyContributionBudget && profile.monthlyContributionBudget > 500) {
    recommendations.push({
      id: 'contribution-automation',
      title: 'Set Up Automated Contributions',
      description: 'With a monthly budget, automated contributions help maintain discipline and capture market time.',
      impact: 'medium',
      category: 'contribution',
      action: 'Set up recurring monthly transfers to your priority accounts for consistent growth.',
    })
  }

  return recommendations.slice(0, 6) // Limit to top 6
}

export function generateContributionPlan(accounts: Account[], profile: UserProfile): ContributionPlan[] {
  if (!profile.monthlyContributionBudget || profile.monthlyContributionBudget === 0) {
    return []
  }

  const plans: ContributionPlan[] = []
  let remainingBudget = profile.monthlyContributionBudget

  // Priority 1: FHSA if home purchase goal
  if (profile.hasHomePurchaseGoal) {
    const fhsa = accounts.find((acc) => acc.type === 'FHSA')
    if (fhsa && fhsa.contributionRoom > 0) {
      const monthlyFHSA = Math.min(fhsa.contributionRoom / 12, remainingBudget * 0.4)
      plans.push({
        accountType: 'FHSA',
        priority: 1,
        monthlyAmount: Math.round(monthlyFHSA),
        reasoning: 'Home purchase goal active. FHSA offers tax deduction on contribution and tax-free withdrawal.',
        taxSavings: Math.round(monthlyFHSA * 12 * 0.3), // Estimated 30% tax bracket
      })
      remainingBudget -= monthlyFHSA
    }
  }

  // Priority 2: TFSA (always good)
  const tfsa = accounts.find((acc) => acc.type === 'TFSA')
  if (tfsa && tfsa.contributionRoom > 0 && remainingBudget > 0) {
    const monthlyTFSA = Math.min(tfsa.contributionRoom / 12, remainingBudget * 0.5)
    plans.push({
      accountType: 'TFSA',
      priority: plans.length + 1,
      monthlyAmount: Math.round(monthlyTFSA),
      reasoning: 'Tax-free growth with flexible withdrawals. Best all-around account for most situations.',
    })
    remainingBudget -= monthlyTFSA
  }

  // Priority 3: RRSP if income is high enough
  if (profile.annualIncome && profile.annualIncome > 60000) {
    const rrsp = accounts.find((acc) => acc.type === 'RRSP')
    if (rrsp && rrsp.contributionRoom > 0 && remainingBudget > 0) {
      const monthlyRRSP = Math.min(rrsp.contributionRoom / 12, remainingBudget * 0.7)
      plans.push({
        accountType: 'RRSP',
        priority: plans.length + 1,
        monthlyAmount: Math.round(monthlyRRSP),
        reasoning: 'Strong tax deduction at your income level. Builds long-term retirement security.',
        taxSavings: Math.round(monthlyRRSP * 12 * 0.35), // Estimated 35% tax bracket
      })
      remainingBudget -= monthlyRRSP
    }
  }

  // Priority 4: Personal account if registered room exhausted
  if (remainingBudget > 50) {
    plans.push({
      accountType: 'PERSONAL',
      priority: plans.length + 1,
      monthlyAmount: Math.round(remainingBudget),
      reasoning: 'After maximizing registered accounts, personal account provides unlimited flexibility.',
    })
  }

  return plans
}

export function generateInsights(accounts: Account[], profile: UserProfile): PortfolioInsight[] {
  const insights: PortfolioInsight[] = []

  // Check for underused tax-advantaged room
  const totalRoom = accounts
    .filter((acc) => acc.type !== 'PERSONAL')
    .reduce((sum, acc) => sum + acc.contributionRoom, 0)

  if (totalRoom > 50000) {
    insights.push({
      type: 'friction',
      title: 'Significant Unused Registered Room',
      description: 'You have substantial tax-advantaged contribution room that is not being utilized.',
      metric: `$${totalRoom.toLocaleString()} available`,
      severity: 'warning',
    })
  }

  // Check non-registered exposure
  const personal = accounts.find((acc) => acc.type === 'PERSONAL')
  const totalValue = accounts.reduce((sum, acc) => sum + acc.balance, 0)
  if (personal && personal.balance / totalValue > 0.4 && totalRoom > 10000) {
    insights.push({
      type: 'friction',
      title: 'High Taxable Account Exposure',
      description: 'A large portion of your portfolio is in taxable accounts while registered room is available.',
      metric: `${((personal.balance / totalValue) * 100).toFixed(0)}% in taxable`,
      severity: 'warning',
    })
  }

  // Check FHSA optimization
  const fhsa = accounts.find((acc) => acc.type === 'FHSA')
  if (fhsa && fhsa.status === 'optimized' && profile.hasHomePurchaseGoal) {
    insights.push({
      type: 'opportunity',
      title: 'FHSA Fully Utilized',
      description: 'Your First Home Savings Account is optimized for your home purchase goal.',
      metric: `$${fhsa.balance.toLocaleString()} saved`,
    })
  }

  // Check contribution consistency
  if (!profile.monthlyContributionBudget || profile.monthlyContributionBudget === 0) {
    insights.push({
      type: 'friction',
      title: 'No Regular Contribution Plan',
      description: 'Setting a monthly contribution budget enables better portfolio growth planning.',
      severity: 'info',
    })
  }

  // Check positive balance across all accounts
  const allPositive = accounts.every((acc) => acc.gain > 0)
  if (allPositive) {
    const avgGain = accounts.reduce((sum, acc) => sum + acc.gainPercent, 0) / accounts.length
    insights.push({
      type: 'opportunity',
      title: 'Strong Portfolio Performance',
      description: 'All accounts are showing positive returns, indicating good investment selection.',
      metric: `${avgGain.toFixed(1)}% average gain`,
    })
  }

  // Check retirement readiness if age is known
  if (profile.age && profile.targetRetirementAge) {
    const yearsToRetirement = profile.targetRetirementAge - profile.age
    const rrsp = accounts.find((acc) => acc.type === 'RRSP')
    if (yearsToRetirement < 20 && rrsp && rrsp.balance < 100000) {
      insights.push({
        type: 'friction',
        title: 'Retirement Account Pacing',
        description: `With ${yearsToRetirement} years to retirement, consider increasing RRSP contributions.`,
        severity: 'warning',
      })
    }
  }

  // Check goal alignment
  if (profile.hasHomePurchaseGoal && !fhsa) {
    insights.push({
      type: 'friction',
      title: 'Missing FHSA Account',
      description: 'You have a home purchase goal but no FHSA account to maximize tax benefits.',
      severity: 'critical',
    })
  }

  return insights
}

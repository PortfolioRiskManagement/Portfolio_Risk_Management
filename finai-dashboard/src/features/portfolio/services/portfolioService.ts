import type {
  Account,
  AccountType,
  PortfolioSummary,
  UserProfile,
  ContributionPlan,
  Recommendation,
  PortfolioInsight,
} from '../types/portfolio.types'

import { calculateFhsaRoom, calculateRrspRoom, calculateTfsaRoom, type RoomResult } from './contributionRules'

type AccountBase = Pick<Account, 'id' | 'type' | 'name' | 'purpose' | 'taxBenefit' | 'priority'>

/** A holding's live market value and what was paid for it. */
export type Position = { account: AccountType; value: number; cost: number }

export const ACCOUNT_DEFINITIONS: AccountBase[] = [
  {
    id: '1',
    type: 'RRSP',
    name: 'Registered Retirement Savings Plan',
    purpose: 'Tax-deferred retirement savings account',
    taxBenefit: 'Contributions are tax-deductible. Growth is tax-deferred until withdrawal.',
    priority: 2,
  },
  {
    id: '2',
    type: 'TFSA',
    name: 'Tax-Free Savings Account',
    purpose: 'Tax-free investment growth and withdrawals',
    taxBenefit: 'No tax on growth or withdrawals. Withdrawals are added back to your room the next January.',
    priority: 1,
  },
  {
    id: '3',
    type: 'FHSA',
    name: 'First Home Savings Account',
    purpose: 'Tax-free savings for your first home purchase',
    taxBenefit: 'Contributions are tax-deductible and withdrawals for a qualifying first home are tax-free.',
    priority: 3,
  },
  {
    id: '4',
    type: 'PERSONAL',
    name: 'Personal Investment Account',
    purpose: 'Non-registered taxable investment account',
    taxBenefit: 'Capital gains taxed at 50%. Dividends receive favorable tax treatment.',
    priority: 4,
  },
]

/**
 * Contribution history from the profile; until it's filled in, assume what was paid for the
 * holdings in the account is what was contributed.
 */
function roomFor(type: AccountType, profile: UserProfile, year: number, costBasis: number): RoomResult | null {
  const age = profile.age ?? 0
  if (type === 'TFSA') {
    return calculateTfsaRoom({
      age,
      year,
      totalContributions: profile.tfsaContributions ?? costBasis,
      withdrawalsBeforeThisYear: profile.tfsaWithdrawals ?? 0,
    })
  }
  if (type === 'FHSA') {
    return calculateFhsaRoom({
      age,
      year,
      yearOpened: profile.fhsaYearOpened,
      contributionsBeforeThisYear: profile.fhsaContributionsBeforeThisYear ?? costBasis,
      contributionsThisYear: profile.fhsaContributionsThisYear ?? 0,
    })
  }
  if (type === 'RRSP') {
    return calculateRrspRoom({
      year,
      annualIncome: profile.annualIncome ?? 0,
      deductionLimitFromNoa: profile.rrspDeductionLimit,
      contributionsThisYear: profile.rrspContributionsThisYear ?? 0,
    })
  }
  return null
}

function statusFor(room: RoomResult): Account['status'] {
  if (room.remaining < 0) return 'overused'
  if (room.limit === 0) return 'normal'
  if (room.remaining === 0) return 'optimized'
  if (room.remaining / room.limit > 0.5) return 'underused'
  return 'normal'
}

function actionFor(type: AccountType, room: RoomResult): string {
  const left = `$${Math.abs(room.remaining).toLocaleString()}`
  if (room.remaining < 0) {
    return `Over-contributed by ${left}. CRA charges 1% per month on the excess until it's withdrawn.`
  }
  if (type === 'FHSA' && room.limit === 0) return 'Open an FHSA to start building room. Unused room only carries forward after the account exists.'
  if (room.remaining === 0) return 'No room left this year. New room is added on January 1.'
  if (type === 'TFSA') return `${left} of TFSA room available. Unused room carries forward indefinitely.`
  if (type === 'FHSA') return `${left} of FHSA room this year. Up to $8,000 of unused room carries into next year.`
  return `${left} of RRSP room. Contributions until March 1 next year can be deducted on this year's return.`
}

/**
 * Accounts with balances from the holdings in each one, and contribution room calculated
 * from the profile using CRA rules.
 */
export function buildAccounts(profile: UserProfile, positions: Position[] = [], year = new Date().getFullYear()): Account[] {
  return ACCOUNT_DEFINITIONS.map((def) => {
    const inAccount = positions.filter((p) => p.account === def.type)
    const balance = inAccount.reduce((sum, p) => sum + p.value, 0)
    const cost = inAccount.reduce((sum, p) => sum + p.cost, 0)
    const base = {
      ...def,
      balance,
      gain: balance - cost,
      gainPercent: cost > 0 ? ((balance - cost) / cost) * 100 : 0,
    }

    const room = roomFor(def.type, profile, year, cost)
    if (!room) {
      return { ...base, contributionRoom: 0, contributionUsed: 0, contributionLimit: 0, status: 'normal' as const }
    }
    return {
      ...base,
      contributionLimit: room.limit,
      contributionUsed: room.used,
      contributionRoom: room.remaining,
      contributionNote: room.note,
      status: statusFor(room),
      recommendedAction: actionFor(base.type, room),
    }
  })
}

export function getPortfolioSummary(accounts: Account[]): PortfolioSummary {
  const totalValue = accounts.reduce((sum, acc) => sum + acc.balance, 0)
  const totalGain = accounts.reduce((sum, acc) => sum + acc.gain, 0)
  const totalGainPercent = totalValue - totalGain > 0 ? (totalGain / (totalValue - totalGain)) * 100 : 0

  const registeredTypes = ['RRSP', 'TFSA', 'FHSA']
  const registeredBalance = accounts
    .filter((acc) => registeredTypes.includes(acc.type))
    .reduce((sum, acc) => sum + acc.balance, 0)
  const nonRegisteredBalance = totalValue - registeredBalance

  const contributionRoomRemaining = accounts
    .filter((acc) => acc.type !== 'PERSONAL')
    .reduce((sum, acc) => sum + Math.max(0, acc.contributionRoom), 0)

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
  const registeredPercent = totalValue > 0 ? (registeredBalance / totalValue) * 100 : 0
  if (registeredPercent > 70) score += 20
  else if (registeredPercent > 50) score += 10

  // Bonus for contribution room utilization
  const totalContribLimit = accounts
    .filter((acc) => acc.type !== 'PERSONAL')
    .reduce((sum, acc) => sum + acc.contributionLimit, 0)
  const utilizationPercent = totalContribLimit > 0 ? ((totalContribLimit - contributionRoomRemaining) / totalContribLimit) * 100 : 0
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

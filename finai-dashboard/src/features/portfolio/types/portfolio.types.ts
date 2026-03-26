export type AccountType = 'RRSP' | 'TFSA' | 'FHSA' | 'PERSONAL'

export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive'
export type InvestingExperience = 'beginner' | 'intermediate' | 'advanced'
export type TimeHorizon = 'short' | 'medium' | 'long'
export type InvestmentGoal = 'growth' | 'balanced' | 'income' | 'preservation'

export interface Account {
  id: string
  type: AccountType
  name: string
  balance: number
  gain: number
  gainPercent: number
  contributionRoom: number
  contributionUsed: number
  contributionLimit: number
  purpose: string
  taxBenefit: string
  status: 'optimized' | 'underused' | 'overused' | 'normal'
  priority: number
  recommendedAction?: string
}

export interface PortfolioSummary {
  totalValue: number
  totalGain: number
  totalGainPercent: number
  healthScore: number
  contributionRoomRemaining: number
  activeAccounts: number
  registeredBalance: number
  nonRegisteredBalance: number
}

export interface UserProfile {
  annualIncome?: number
  age?: number
  province?: string
  riskTolerance?: RiskTolerance
  investingExperience?: InvestingExperience
  monthlyContributionBudget?: number
  lumpSumAvailable?: number
  hasHomePurchaseGoal?: boolean
  targetRetirementAge?: number
  liquidityNeed?: 'low' | 'medium' | 'high'
  timeHorizon?: TimeHorizon
  investmentGoal?: InvestmentGoal
  hasDebtPriority?: boolean
}

export interface ContributionPlan {
  accountType: AccountType
  priority: number
  monthlyAmount: number
  reasoning: string
  taxSavings?: number
}

export interface Recommendation {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: 'tax-optimization' | 'contribution' | 'allocation' | 'goal-alignment'
  action: string
}

export interface PortfolioInsight {
  type: 'opportunity' | 'friction'
  title: string
  description: string
  metric?: string
  severity?: 'info' | 'warning' | 'critical'
}

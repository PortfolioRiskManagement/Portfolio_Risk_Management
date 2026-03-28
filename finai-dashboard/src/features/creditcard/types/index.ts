export type EmploymentStatus = "student" | "employed" | "self_employed" | "seeking" | "retired"
export type IncomeRange = "under_30k" | "30k_60k" | "60k_80k" | "80k_plus"
export type SpendingPriority = "groceries" | "dining" | "travel" | "gas" | "streaming" | "cashback" | "no_fee"

export interface UserProfile {
	employment: EmploymentStatus | null
	income: IncomeRange | null
	priorities: SpendingPriority[]
}

export type RewardType = "points" | "cashback" | "hybrid"
export type AccessTier = "now" | "student" | "post_grad" | "premium"

export interface EarnRate {
	category: string
	rate: string
}

export interface CreditCard {
	id: string
	name: string
	institution: string
	institutionId: string
	annualFee: number
	feeWaivable: boolean
	feeWaiverNote: string | null
	minIncome: number | null
	rewardType: RewardType
	rewardProgram: string
	topEarnRates: EarnRate[]
	baseRate: string
	welcomeBonus: string | null
	welcomeBonusValue: string | null
	noForeignTransactionFee: boolean
	accessTier: AccessTier
	keyPerks: string[]
	studentNote: string | null
	score?: number
}

export interface Institution {
	id: string
	name: string
	accentColor: string
	cards: CreditCard[]
}

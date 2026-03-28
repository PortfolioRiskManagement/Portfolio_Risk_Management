export type EmploymentStatus = "student" | "employed" | "self-employed" | "unemployed" | "retired"
export type IncomeRange = "$0-30k" | "$30-50k" | "$50-75k" | "$75-100k" | "$100k+"
export type SpendingCategory = "travel" | "dining" | "shopping" | "groceries" | "streaming" | "balance"

export interface UserProfile {
	employmentStatus?: EmploymentStatus
	incomeRange?: IncomeRange
	spendingCategories?: SpendingCategory[]
	isStudent?: boolean
}

export interface CreditCardBenefit {
	name: string
	description: string
	value?: string
}

export interface CreditCard {
	id: string
	name: string
	institution: Institution
	annualFee: number
	minIncome?: string
	welcomeBonus?: string
	topEarnRates: CreditCardBenefit[]
	baseRate: string
	program: string
	foreignExchangeFee: string
	keyPerks: CreditCardBenefit[]
	studentRating?: number
	isStudentOptimized?: boolean
	isPremium?: boolean
	isPostGrad?: boolean
	highlights?: string[]
	specialConditions?: string[]
}

export type Institution = "Amex" | "Scotiabank" | "BMO" | "TD" | "RBC" | "CIBC" | "National Bank" | "Tangerine" | "PC Financial"

export interface CreditCardFilterResult {
	card: CreditCard
	matchScore: number
	relevantBenefits: string[]
	whyRecommended: string
}

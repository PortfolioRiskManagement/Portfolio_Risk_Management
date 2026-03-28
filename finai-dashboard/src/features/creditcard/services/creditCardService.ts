import type { CreditCard, CreditCardFilterResult, UserProfile, Institution } from "../types"

// Credit card database organized by institution
const creditCardDatabase: CreditCard[] = [
	// American Express
	{
		id: "amex-cobalt",
		name: "Amex Cobalt™ Card",
		institution: "Amex",
		annualFee: 191.88,
		minIncome: "No income requirement",
		welcomeBonus: "Up to 15,000 pts (Earn 1250 pts/month for 12 months when you spend $750/mo)",
		topEarnRates: [
			{ name: "Groceries", value: "5x" },
			{ name: "Restaurants, food delivery", value: "2x" },
			{ name: "Streaming (Netflix, Spotify, etc.), transit", value: "2x" }
		],
		baseRate: "1x",
		program: "Membership Rewards",
		foreignExchangeFee: "2.5%",
		keyPerks: [
			{ name: "Mobile device insurance (up to $1,000)", description: "" },
			{ name: "Purchase protection + extended warranty", description: "" },
			{ name: "Flexible transfer to Aeroplan, Marriott, Hilton & more", description: "" }
		],
		highlights: [
			"Best overall for young professionals",
			"No foreign transaction fees (NONE ✓)",
			"Highest earning on groceries and dining"
		]
	},
	{
		id: "amex-gold",
		name: "Amex Gold Card",
		institution: "Amex",
		annualFee: 0,
		minIncome: "None",
		welcomeBonus: "Up to 15,000 pts (Earn 1250 pts/month for 12 months when you spend $750/mo)",
		topEarnRates: [
			{ name: "Groceries", value: "5x" },
			{ name: "Restaurants, food delivery", value: "2x" },
			{ name: "Streaming, transit", value: "2x" }
		],
		baseRate: "1x",
		program: "Membership Rewards",
		foreignExchangeFee: "2.5%",
		keyPerks: [
			{ name: "No annual fee", description: ""}
		],
		isStudentOptimized: true,
		highlights: [
			"No annual fee",
			"Perfect for students starting credit journey",
			"Same rewards as Cobalt but without the fee"
		]
	},
	// Scotiabank
	{
		id: "scotiabank-gold",
		name: "Scotiabank Gold American Express® Card",
		institution: "Scotiabank",
		annualFee: 120,
		minIncome: "$12,000+/yr",
		welcomeBonus: "Up to 45,000 pts (5,000 after $21 spent in first 3 months, + 30% pts after $7.5k in Year 1)",
		topEarnRates: [
			{ name: "Sobeys, IGA groceries", value: "6x" },
			{ name: "Dining, streaming, travel", value: "2x" },
			{ name: "All other grocery, delivery", value: "5x" }
		],
		baseRate: "1x",
		program: "Scene+",
		foreignExchangeFee: "NONE ✓",
		keyPerks: [
			{ name: "No foreign transaction fees" , description: "" },
			{ name: "Travel emergency medical ($1M up to 25 days)", description: "" },
			{ name: "Trip cancellation/interruption insurance", description: "" },
			{ name: "Rental car collision/loss coverage ($50k MSRP-49 days)", description: "" },
			{ name: "Purchase protection + extended warranty", description: "" },
			{ name: "Hotel/motel burglary insurance", description: "" },
			{ name: "Visa of Amex acceptance varies", description: "" }
		],
		isPostGrad: true,
		highlights: [
			"Best for Sobeys/grocery shoppers",
			"Strong travel benefits",
			"Premium cards for emerging professionals"
		]
	},
	{
		id: "scotiabank-passport",
		name: "Scotiabank Passport™ Visa Infinite*",
		institution: "Scotiabank",
		annualFee: 150,
		minIncome: "$48k+ personal, $100k+ household",
		welcomeBonus: "Up to 35,000 pts (~$258)",
		topEarnRates: [
			{ name: "Sobeys, affiliated cards", value: "3x" },
			{ name: "Dining, entertainment, transit", value: "2x" }
		],
		baseRate: "1x",
		program: "Scene+",
		foreignExchangeFee: "NONE ✓",
		keyPerks: [
			{ name: "6 free airport lounges annually (Visa Airport Companion)", description: "" },
			{ name: "Travel emergency medical", description: "" },
			{ name: "Trip cancellation/interruption insurance", description: "" },
			{ name: "Rental car coverage ($50k MSRP-49 days)", description: "" },
			{ name: "Purchase protection + extended warranty", description: "" },
			{ name: "Hotel/motel burglary insurance", description: "" },
			{ name: "Visa Infinite Concierge service", description: "" }
		],
		isPremium: true,
		highlights: [
			"Premium card for frequent travelers",
			"Airport lounge access",
			"Enhanced travel protections"
		]
	},
	{
		id: "scotiabank-scene-visa",
		name: "Scotiabank* Scene+ Visa® Card",
		institution: "Scotiabank",
		annualFee: 0,
		minIncome: "None",
		welcomeBonus: "Up to 10,000 pts (~$100)",
		topEarnRates: [
			{ name: "Sobeys, Safeway, FreshCo", value: "2x" },
			{ name: "Cineplex purchases, movies", value: "2x" }
		],
		baseRate: "1x",
		program: "Scene+",
		foreignExchangeFee: "2.5%",
		keyPerks: [
			{ name: "2x at Cineplex - free movies!", description: "" },
			{ name: "2x at Sobeys ecosystem - great for groceries", description: "" },
			{ name: "Purchase protection", description: "" }
		],
		isStudentOptimized: true,
		highlights: [
			"No annual fee",
			"Student-friendly option",
			"Best for budget-conscious grocery shoppers"
		],
		specialConditions: ["Starter credit building card"]
	},
	// BMO
	{
		id: "bmo-cashback",
		name: "BMO CashBack® Mastercard**",
		institution: "BMO",
		annualFee: 0,
		minIncome: "None",
		welcomeBonus: "No welcome bonus",
		topEarnRates: [
			{ name: "Groceries (up to $30/month)", value: "0.5%" },
			{ name: "Other purchases", value: "1%" },
			{ name: "Recurring bills (Netflix, phone, etc.)", value: "1%" }
		],
		baseRate: "1% cash back anytime",
		program: "Cash Back",
		foreignExchangeFee: "2.5%",
		keyPerks: [
			{ name: "Redeem cash back anytime via email/statement credit", description: "" },
			{ name: "Restaurant (3-months free)", description: "" },
			{ name: "Resident cash back on any purchase", description: "" },
			{ name: "Purchase protection", description: "" }
		],
		isStudentOptimized: true,
		highlights: [
			"Simple 1% cash back on everything",
			"No annual fee/spending minimums",
			"Straightforward cash back rewards"
		]
	},
	{
		id: "bmo-eclipse-infinite",
		name: "BMO eclipse™ Visa Infinite*",
		institution: "BMO",
		annualFee: 120,
		minIncome: "$60k+",
		welcomeBonus: "Up to 70,000 pts (~$470)",
		topEarnRates: [
			{ name: "Groceries", value: "5x" },
			{ name: "Grocery cash back", value: "1%" },
			{ name: "Travel, gas, transit, streaming", value: "1x" },
			{ name: "Large welcome bonus", value: "Check current terms" }
		],
		baseRate: "1x",
		program: "BMO Rewards",
		foreignExchangeFee: "2.5%",
		keyPerks: [
			{ name: "$50 annual lifestyle credit (upgrade between categories)", description: "Capped annual value" },
			{ name: "6-month Statement credit + $50/transaction", description: "Travel/Instant credit" },
			{ name: "Purchase protection + extended warranty", description: "" },
			{ name: "Rental car loss/collision insurance", description: "" },
			{ name: "Emergency travel medical (31 days)", description: "" },
			{ name: "Visa Infinite Concierge service", description: "" }
		],
		isPremium: true,
		highlights: [
			"Premium lifestyle card for young professionals",
			"Strong grocery rewards (5x points)",
			"Annual lifestyle credit softens $120 fee"
		]
	},
	{
		id: "bmo-ascend-world",
		name: "BMO Ascend™ World Elite* Mastercard**",
		institution: "BMO",
		annualFee: 150,
		minIncome: "Waivable with BMO Premium Plan",
		welcomeBonus: "Up to 115,000 pts (~$786)",
		topEarnRates: [
			{ name: "Groceries (cash back equivalent)", value: "5x" },
			{ name: "Transit, Subways", value: "4x" },
			{ name: "Contingency bonus", value: "Check current terms" }
		],
		baseRate: "1x",
		program: "BMO Rewards",
		foreignExchangeFee: "2.5%",
		keyPerks: [
			{ name: "4 free airport lounge", description: "Visit/Mastercard Pass Complimentary, Travel Pass" },
			{ name: "Travel emergency medical", description: "(31 days)" },
			{ name: "Trip cancellation/interruption insurance", description: "" },
			{ name: "Rental car loss/collision insurance", description: "" },
			{ name: "Purchase protection + extended warranty", description: "" },
			{ name: "Emergency travel medical ($1M up to 25 years)", description: "" },
			{ name: "Visa Infinite Concierge service", description: "" }
		],
		isPremium: true,
		highlights: [
			"Best for luxury travelers needing lounge access",
			"Excellent bonus structure",
			"Year post-grad upgrade path"
		]
	},
	// TD Bank
	{
		id: "td-cashback-vision",
		name: "TD® Cash Back Visa Card",
		institution: "TD",
		annualFee: 0,
		minIncome: "None",
		welcomeBonus: "$25-50 bonus",
		topEarnRates: [
			{ name: "Groceries, gas", value: "1%" },
			{ name: "Recurring bills", value: "1%" },
			{ name: "All other purchases", value: "0.5%" }
		],
		baseRate: "0.5%",
		program: "Cash Back",
		foreignExchangeFee: "2.5%",
		keyPerks: [
			{ name: "No annual fee", description: "" },
			{ name: "1% on groceries and gas (best no-fee option)", description: "" },
			{ name: "Purchase protection", description: "" }
		],
		isStudentOptimized: true,
		highlights: [
			"No annual fee",
			"Good groceries/gas rewards (1%)",
			"Best for simple cash back needs"
		]
	},
	// RBC
	{
		id: "rbc-ion-1percent",
		name: "RBC ION Visa Card 1.5%",
		institution: "RBC",
		annualFee: 0,
		minIncome: "None",
		welcomeBonus: "$25 intro bonus",
		topEarnRates: [
			{ name: "All purchases", value: "1.5%" }
		],
		baseRate: "1.5% cash back on everything",
		program: "Cash Back",
		foreignExchangeFee: "2%",
		keyPerks: [
			{ name: "1.5% cash back on all purchases - flat rate!", description: "" },
			{ name: "No annual fee/minimum spend", description: "" },
			{ name: "No categories to track", description: "" },
			{ name: "Purchase protection", description: "" }
		],
		isStudentOptimized: true,
		highlights: [
			"Highest flat rate cash back (1.5%)",
			"No annual fee",
			"Simplest rewards (all purchases earn same rate)"
		]
	},
	// CIBC
	{
		id: "cibc-dividend-cashback",
		name: "CIBC Dividend Visa Card",
		institution: "CIBC",
		annualFee: 0,
		minIncome: "None",
		welcomeBonus: "$25+ bonus",
		topEarnRates: [
			{ name: "Groceries, dining", value: "1%" },
			{ name: "Gas, transit", value: "1%" },
			{ name: "Everything else", value: "0.5%" }
		],
		baseRate: "0.5%",
		program: "Dividend Cash Back",
		foreignExchangeFee: "2%",
		keyPerks: [
			{ name: "1% on groceries and dining", description: "" },
			{ name: "Deposit as statement credit or chequing account", description: "" },
			{ name: "No annual fee", description: "" }
		],
		isStudentOptimized: true,
		highlights: [
			"No annual fee",
			"Good rotations for daily spend",
			"Simple statement credit redemption"
		]
	},
	// National Bank
	{
		id: "national-bank-mastercard",
		name: "National Bank Mastercard",
		institution: "National Bank",
		annualFee: 0,
		minIncome: "None",
		welcomeBonus: "$25 intro",
		topEarnRates: [
			{ name: "All purchases", value: "1.5%" }
		],
		baseRate: "1.5% cash back",
		program: "Cash Back",
		foreignExchangeFee: "2%",
		keyPerks: [
			{ name: "1.5% cash back on all purchases", description: "" },
			{ name: "No annual fee", description: "" },
			{ name: "Rewards never expire", description: "" }
		],
		isStudentOptimized: true,
		highlights: [
			"Competitive flat rate cash back",
			"Rewards don't expire",
			"Great for simplicity"
		]
	},
	// Tangerine
	{
		id: "tangerine-moneyback-visa",
		name: "Tangerine Money-Back Visa Card",
		institution: "Tangerine",
		annualFee: "FREE",
		minIncome: "None",
		welcomeBonus: "Pick pharmacy + recurring bills = $100 annual household loyalty bonus",
		topEarnRates: [
			{ name: "Customizable categories (pick yours!)", value: "2%" },
			{ name: "All other purchases", value: "0.5%" }
		],
		baseRate: "0.5%",
		program: "Cash Back",
		foreignExchangeFee: "2.5%",
		keyPerks: [
			{ name: "2% on up to 2 categories you choose (things other cards miss!)", description: "(pharmacy, groceries, utilities, subscriptions, recurring bills)" },
			{ name: "Annual $100-$200 cash back welcome bonus", description: "Customizable (Tangerine, direct deposit required)" },
			{ name: "Purchase protection + extended warranty", description: "" },
			{ name: "Best cash back in Canada for pharmacy!", description: "" }
		],
		highlights: [
			"Best customizable rewards structure",
			"Unique 2% on pharmacy + recurring bills combo",
			"No annual fee"
		]
	},
	// PC Financial  
	{
		id: "pc-world-elite",
		name: "PC World Elite Mastercard",
		institution: "PC Financial",
		annualFee: 0,
		minIncome: "None",
		welcomeBonus: "$25+ intro (conditions apply)",
		topEarnRates: [
			{ name: "PC Plus eligible purchases", value: "Up to 4x" },
			{ name: "Groceries (Loblaws brands)", value: "Up to 3x" }
		],
		baseRate: "3% PC Plus points on eligible purchases",
		program: "PC Plus Points",
		foreignExchangeFee: "2%",
		keyPerks: [
			{ name: "Up to 3% PC Points on groceries (Loblaws brands) - Great for No Frills path", description: "" },
			{ name: "Up to 4x on PC Plus redemption potential", description: "" },
			{ name: "No annual fee", description: "" },
			{ name: "Purchase protection", description: "" }
		],
		isStudentOptimized: true,
		highlights: [
			"Best for Loblaws/No Frills/Shoppers shoppers",
			"No annual fee",
			"High earn rates at partner stores"
		]
	}
]

/**
 * Matches credit cards to user profile
 * Returns cards sorted by relevance score
 */
export function matchCardsToProfile(profile: UserProfile): CreditCardFilterResult[] {
	const results: CreditCardFilterResult[] = []

	creditCardDatabase.forEach((card) => {
		let matchScore = 0
		let relevantBenefits: string[] = []
		let whyRecommended = ""

		// Student benefits
		if (profile.employmentStatus === "student" && card.isStudentOptimized) {
			matchScore += 30
			relevantBenefits.push("Student-optimized card")
			whyRecommended = "Perfect for your student status"
		}

		// Post-grad transition
		if (profile.employmentStatus === "employed" && profile.incomeRange === "$30-50k") {
			if (card.isPostGrad) {
				matchScore += 25
				relevantBenefits.push("Designed for career starters")
				whyRecommended = "Great transition from student life"
			}
		}

		// Premium cards for higher income
		if ((profile.incomeRange === "$75-100k" || profile.incomeRange === "$100k+") && card.isPremium) {
			matchScore += 20
			relevantBenefits.push("Premium benefits matching your income")
			whyRecommended = "Premium perks for your income level"
		}

		// Spending category matching
		if (profile.spendingCategories && profile.spendingCategories.length > 0) {
			profile.spendingCategories.forEach((category) => {
				switch (category) {
					case "travel":
						if (card.keyPerks.some((p) => p.name.toLowerCase().includes("travel"))) {
							matchScore += 15
							relevantBenefits.push("Travel-focused benefits")
						}
						break
					case "dining":
						if (card.topEarnRates.some((r) => r.name.toLowerCase().includes("dining"))) {
							matchScore += 12
							relevantBenefits.push("Best dining rewards")
						}
						break
					case "groceries":
						if (
							card.topEarnRates.some((r) => r.name.toLowerCase().includes("groceries")) ||
							card.topEarnRates.some((r) => r.name.toLowerCase().includes("grocery"))
						) {
							matchScore += 12
							relevantBenefits.push("Top grocery rewards")
						}
						break
					case "shopping":
						if (card.keyPerks.some((p) => p.name.toLowerCase().includes("purchase protection"))) {
							matchScore += 10
							relevantBenefits.push("Strong purchase protection")
						}
						break
					case "streaming":
						if (card.topEarnRates.some((r) => r.name.toLowerCase().includes("streaming"))) {
							matchScore += 10
							relevantBenefits.push("Streaming rewards")
						}
						break
				}
			})
		}

		// Balance builders - beginner-friendly
		if (profile.spendingCategories?.includes("balance") || !profile.employmentStatus) {
			if (card.annualFee === 0 && !card.isPremium) {
				matchScore += 15
				relevantBenefits.push("Beginner-friendly, no fee")
				whyRecommended = "Great for building credit history"
			}
		}

		// Income requirement check
		if (card.minIncome) {
			const minIncomeCheck = checkIncomeRequirement(profile.incomeRange, card.minIncome)
			if (!minIncomeCheck) {
				matchScore = Math.max(0, matchScore - 50)
			}
		}

		if (!whyRecommended) {
			if (matchScore > 0) {
				whyRecommended = `Strong fit based on your profile (${
					profile.employmentStatus ? `${profile.employmentStatus} ` : ""
				}${profile.incomeRange ? `earning ${profile.incomeRange}` : ""})`
			} else {
				whyRecommended = "Solid general-purpose card"
			}
		}

		results.push({
			card,
			matchScore,
			relevantBenefits: [...new Set(relevantBenefits)],
			whyRecommended
		})
	})

	return results.sort((a, b) => b.matchScore - a.matchScore)
}

/**
 * Get all cards grouped by institution
 */
export function getCardsByInstitution(): Record<Institution, CreditCard[]> {
	const grouped: Record<string, CreditCard[]> = {}

	creditCardDatabase.forEach((card) => {
		if (!grouped[card.institution]) {
			grouped[card.institution] = []
		}
		grouped[card.institution].push(card)
	})

	return grouped as Record<Institution, CreditCard[]>
}

/**
 * Get all institutions in order
 */
export function getInstitutions(): Institution[] {
	const institutions = new Set<Institution>()
	creditCardDatabase.forEach((card) => institutions.add(card.institution))
	return Array.from(institutions) as Institution[]
}

/**
 * Check if income meets requirement
 */
function checkIncomeRequirement(userIncome?: string, requirement?: string): boolean {
	if (!requirement || !userIncome) return true
	if (requirement.toLowerCase().includes("no")) return true

	const incomeOrder: Record<string, number> = {
		"$0-30k": 1,
		"$30-50k": 2,
		"$50-75k": 3,
		"$75-100k": 4,
		"$100k+": 5
	}

	const extractAmount = (str: string): number => {
		const match = str.match(/\$[\d,k+]+/g)
		if (!match) return 0
		const first = match[0].replace(/[$,k]/g, "")
		return parseInt(first) * (match[0].includes("k") ? 1000 : 1)
	}

	const userAmount = extractAmount(userIncome)
	const reqAmount = extractAmount(requirement)

	return userAmount >= reqAmount
}

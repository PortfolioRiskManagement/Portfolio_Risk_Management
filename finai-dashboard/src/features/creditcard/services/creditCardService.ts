import type { CreditCard, Institution, UserProfile } from "../types"

const ALL_CARDS: CreditCard[] = [
	// AMERICAN EXPRESS
	{
		id: "amex-cobalt",
		name: "Cobalt® Card",
		institution: "American Express",
		institutionId: "amex",
		annualFee: 191.88,
		feeWaivable: false,
		feeWaiverNote: null,
		minIncome: null,
		rewardType: "points",
		rewardProgram: "Membership Rewards",
			topEarnRates: [
			{ category: "Groceries, dining, food delivery, bars, cafés", rate: "5x" },
			{ category: "Streaming, transit, rideshare, gas", rate: "2x" },
		],
		baseRate: "1x",
		welcomeBonus: "Up to 15,000 pts (1,250 pts/mo for 12 months, $750/mo spend)",
		welcomeBonusValue: "~$150",
		noForeignTransactionFee: false,
		accessTier: "now",
		keyPerks: [
			"Mobile device insurance up to $1,000",
			"Purchase protection + extended warranty",
			"Emergency travel medical ($5M, 15 days)",
			"Rental car insurance",
			"Hotel Collection: upgrade + $100 USD credit",
		],
		studentNote:
			"No income requirement - best card you can get right now as a student. The $192/yr fee pays for itself if you spend $150+/mo on food.",
	},
	{
		id: "amex-simplycash",
		name: "SimplyCash® Card",
		institution: "American Express",
		institutionId: "amex",
		annualFee: 0,
		feeWaivable: false,
		feeWaiverNote: null,
		minIncome: null,
		rewardType: "cashback",
		rewardProgram: "Cash Back",
		topEarnRates: [{ category: "All purchases (flat rate)", rate: "1.25%" }],
		baseRate: "1.25%",
		welcomeBonus: "5% cash back for first 3 months (up to $2,000)",
		welcomeBonusValue: "Up to $100",
		noForeignTransactionFee: false,
		accessTier: "now",
		keyPerks: [
			"Purchase protection (90 days)",
			"Extended warranty (+1 year)",
			"Rental car discounts (National, Alamo, Enterprise)",
		],
		studentNote: "Solid backup Amex at $0 fee for flat-rate simplicity.",
	},
	{
		id: "amex-simplycash-preferred",
		name: "SimplyCash® Preferred Card",
		institution: "American Express",
		institutionId: "amex",
		annualFee: 119.88,
		feeWaivable: false,
		feeWaiverNote: null,
		minIncome: null,
		rewardType: "cashback",
		rewardProgram: "Cash Back",
		topEarnRates: [{ category: "All purchases (flat rate - no categories needed)", rate: "2%" }],
		baseRate: "2%",
		welcomeBonus: "10% cash back for first 3 months (up to $2,000)",
		welcomeBonusValue: "Up to $200",
		noForeignTransactionFee: false,
		accessTier: "now",
		keyPerks: [
			"Best flat-rate cash back card in Canada",
			"Purchase protection + extended warranty",
			"Rental car discounts",
		],
		studentNote: "Great if you hate category tracking. 2% on everything is elite for a non-Infinite card.",
	},

	// SCOTIABANK
	{
		id: "scotia-gold-amex",
		name: "Gold American Express® Card",
		institution: "Scotiabank",
		institutionId: "scotiabank",
		annualFee: 120,
		feeWaivable: true,
		feeWaiverNote: "Waived with Scotia Ultimate Package chequing (maintain $6,000 balance)",
		minIncome: 12000,
		rewardType: "points",
		rewardProgram: "Scene+",
		topEarnRates: [
			{ category: "Sobeys, IGA, Safeway, FreshCo (capped $50k/yr)", rate: "6x" },
			{ category: "All other grocery, dining, delivery, entertainment (capped $50k/yr)", rate: "5x" },
			{ category: "Gas, transit, streaming (Netflix, Spotify, etc.)", rate: "3x" },
		],
		baseRate: "1x",
		welcomeBonus: "25k pts after $2k spend in 3 mo + 20k pts after $7.5k in year 1",
		welcomeBonusValue: "Up to $450",
		noForeignTransactionFee: true,
		accessTier: "post_grad",
		keyPerks: [
			"No foreign transaction fees",
			"Travel emergency medical ($1M, 25 days)",
			"Trip cancellation/interruption insurance",
			"Rental car collision/loss coverage",
			"Purchase protection + extended warranty",
		],
		studentNote:
			"Only requires $12,000 income - you may qualify NOW. Best card to apply for immediately upon or before graduation. No FX fees alone is massive for any travel.",
	},
	{
		id: "scotia-passport-vi",
		name: "Passport® Visa Infinite*",
		institution: "Scotiabank",
		institutionId: "scotiabank",
		annualFee: 150,
		feeWaivable: true,
		feeWaiverNote:
			"First year free with welcome offer. Waived with Scotia Ultimate Package ($6,000 balance)",
		minIncome: 60000,
		rewardType: "points",
		rewardProgram: "Scene+",
		topEarnRates: [
			{ category: "Sobeys, IGA, FreshCo and affiliated stores", rate: "3x" },
			{ category: "All other grocery, dining, entertainment, transit", rate: "2x" },
		],
		baseRate: "1x",
		welcomeBonus: "25k pts after $1k spend in 3 months + first year free",
		welcomeBonusValue: "Up to $400",
		noForeignTransactionFee: true,
		accessTier: "premium",
		keyPerks: [
			"No foreign transaction fees",
			"6 free airport lounge visits per year (Visa Airport Companion)",
			"Travel emergency medical insurance",
			"Trip cancellation/interruption coverage",
			"Rental car coverage",
		],
		studentNote: "Target 6-12 months post-grad once income hits $60k. Best Visa with no FX fee and lounge access.",
	},
	{
		id: "scotia-scene-visa",
		name: "Scene+™ Visa* Card",
		institution: "Scotiabank",
		institutionId: "scotiabank",
		annualFee: 0,
		feeWaivable: false,
		feeWaiverNote: null,
		minIncome: null,
		rewardType: "points",
		rewardProgram: "Scene+",
		topEarnRates: [
			{ category: "Sobeys, Safeway, IGA, FreshCo, Foodland", rate: "2x" },
			{ category: "Cineplex theatres + cineplex.com", rate: "2x" },
			{ category: "Home Hardware", rate: "2x" },
		],
		baseRate: "1x",
		welcomeBonus: "Up to 10,000 pts in first 3 months",
		welcomeBonusValue: "~$100",
		noForeignTransactionFee: false,
		accessTier: "student",
		keyPerks: [
			"2x at Cineplex - free movies accumulate fast",
			"2x at Sobeys grocery ecosystem",
			"Purchase protection included",
			"No annual fee",
		],
		studentNote:
			"Excellent no-fee starter, especially if you shop at Sobeys or go to Cineplex. A great gateway into the Scene+ ecosystem for a future Gold Amex upgrade.",
	},
	{
		id: "scotia-momentum-vi",
		name: "Momentum® Visa Infinite*",
		institution: "Scotiabank",
		institutionId: "scotiabank",
		annualFee: 120,
		feeWaivable: true,
		feeWaiverNote: "Waived with Scotia Ultimate Package ($6,000 balance)",
		minIncome: 60000,
		rewardType: "cashback",
		rewardProgram: "Cash Back",
		topEarnRates: [
			{ category: "Groceries, recurring bills, subscriptions (Netflix, utilities)", rate: "4%" },
			{ category: "Gas, daily transit", rate: "2%" },
		],
		baseRate: "1%",
		welcomeBonus: "10% cash back for first 3 months (capped)",
		welcomeBonusValue: "Best cash back welcome bonus in Canada",
		noForeignTransactionFee: false,
		accessTier: "premium",
		keyPerks: [
			"Travel emergency medical (15 days)",
			"Trip cancellation/interruption",
			"Rental car coverage",
			"Purchase protection + extended warranty",
			"Visa Infinite Concierge",
		],
		studentNote:
			"Best pure cash-back card in Canada. Target after getting $60k job. 4% on groceries and recurring bills is top-tier value.",
	},

	// BMO
	{
		id: "bmo-cashback",
		name: "CashBack® Mastercard®*",
		institution: "BMO",
		institutionId: "bmo",
		annualFee: 0,
		feeWaivable: false,
		feeWaiverNote: null,
		minIncome: null,
		rewardType: "cashback",
		rewardProgram: "Cash Back",
		topEarnRates: [
			{ category: "Groceries (up to $500/mo, then 1%)", rate: "3%" },
			{ category: "Recurring bills (Netflix, phone, etc.)", rate: "1%" },
		],
		baseRate: "0.5%",
		welcomeBonus: "5% cash back for first 3 months (up to $2,500)",
		welcomeBonusValue: "Up to $125",
		noForeignTransactionFee: false,
		accessTier: "now",
		keyPerks: [
			"Best no-fee grocery rate in Canada (3%)",
			"Redeem cash back anytime via BMO app (no minimum wait)",
			"3 months Instacart+ free",
			"Purchase protection",
		],
		studentNote: "Best no-fee grocery card in Canada. Simple, effective, and redeems anytime.",
	},
	{
		id: "bmo-eclipse-vi",
		name: "eclipse Visa Infinite*",
		institution: "BMO",
		institutionId: "bmo",
		annualFee: 120,
		feeWaivable: true,
		feeWaiverNote:
			"First year FREE with welcome offer. Waived with BMO Premium Plan chequing ($4,000 balance)",
		minIncome: 60000,
		rewardType: "points",
		rewardProgram: "BMO Rewards",
		topEarnRates: [
			{
				category:
					"Grocery, restaurants, food delivery, gas, transit, EV charging, rideshare, streaming, drugstores",
				rate: "5x",
			},
		],
		baseRate: "1x",
		welcomeBonus: "Up to 70,000 pts + $50 lifestyle credit + first year annual fee free",
		welcomeBonusValue: "~$470 + $50 credit",
		noForeignTransactionFee: false,
		accessTier: "premium",
		keyPerks: [
			"$50 annual lifestyle credit (use on anything)",
			"6-month Instacart+ + $10/mo Instacart credit",
			"Mobile device insurance",
			"Emergency travel medical (21 days)",
			"Visa Infinite Concierge",
		],
		studentNote:
			"Best lifestyle card for young Canadians. Target immediately after graduation - first year is FREE and 5x covers essentially all your daily spend.",
	},
	{
		id: "bmo-ascend-we",
		name: "Ascend™ World Elite® Mastercard®*",
		institution: "BMO",
		institutionId: "bmo",
		annualFee: 150,
		feeWaivable: true,
		feeWaiverNote: "Waived with BMO Premium Plan chequing ($4,000 balance)",
		minIncome: 80000,
		rewardType: "cashback",
		rewardProgram: "BMO Rewards",
		topEarnRates: [
			{ category: "Groceries", rate: "5%" },
			{ category: "Transit (bus, subway, rideshare)", rate: "4%" },
			{ category: "Gas, EV charging", rate: "3%" },
			{ category: "Recurring bills", rate: "2%" },
		],
		baseRate: "1%",
		welcomeBonus: "Up to 115,000 pts - check current promotion",
		welcomeBonusValue: "~$766",
		noForeignTransactionFee: false,
		accessTier: "premium",
		keyPerks: [
			"4 free airport lounge visits per year (Mastercard Travel Pass)",
			"Travel emergency medical (21 days)",
			"Trip cancellation/interruption",
			"Rental car collision insurance",
			"Mobile device insurance ($1,000)",
		],
		studentNote: "A 2-3 year post-grad upgrade target once income clears $80k.",
	},

	// TD
	{
		id: "td-rewards-visa",
		name: "Rewards Visa* Card",
		institution: "TD",
		institutionId: "td",
		annualFee: 0,
		feeWaivable: false,
		feeWaiverNote: null,
		minIncome: null,
		rewardType: "points",
		rewardProgram: "TD Rewards",
		topEarnRates: [
			{ category: "Expedia for TD (travel bookings)", rate: "4x" },
			{ category: "Grocery, recurring bills", rate: "3x" },
			{ category: "Gas, transit", rate: "2x" },
		],
		baseRate: "1x",
		welcomeBonus: "Check current TD offer",
		welcomeBonusValue: "Varies",
		noForeignTransactionFee: false,
		accessTier: "student",
		keyPerks: [
			"Earn extra points at Starbucks (link card)",
			"Purchase security + extended warranty",
			"Rental car discounts (Avis/Budget)",
		],
		studentNote: "Decent starter but the RBC ION+ and Scotiabank Scene+ Visa offer better value at $0.",
	},
	{
		id: "td-first-class-vi",
		name: "First Class Travel® Visa Infinite*",
		institution: "TD",
		institutionId: "td",
		annualFee: 139,
		feeWaivable: true,
		feeWaiverNote: "Waived with TD All-Inclusive Banking Plan (maintain $5,000 balance)",
		minIncome: 60000,
		rewardType: "points",
		rewardProgram: "TD Rewards",
		topEarnRates: [
			{ category: "Expedia for TD", rate: "8x" },
			{ category: "Dining, groceries", rate: "6x" },
			{ category: "Recurring bills", rate: "4x" },
		],
		baseRate: "2x",
		welcomeBonus: "Up to 165,000 pts + first year annual fee rebated",
		welcomeBonusValue: "Up to ~$1,400 first-year value",
		noForeignTransactionFee: false,
		accessTier: "premium",
		keyPerks: [
			"$100 annual TD travel credit (Expedia for TD)",
			"4 free airport lounge visits per year (Visa Airport Companion)",
			"Emergency travel medical ($2M, 21 days)",
			"Trip cancellation/interruption",
			"Rental car coverage",
		],
		studentNote: "Strong post-grad pick. $100 travel credit nearly offsets the fee. Add lounge access and this is excellent value.",
	},
	{
		id: "td-aeroplan-vi",
		name: "Aeroplan® Visa Infinite*",
		institution: "TD",
		institutionId: "td",
		annualFee: 139,
		feeWaivable: true,
		feeWaiverNote:
			"Waived with TD All-Inclusive Banking Plan ($5,000 balance). First year rebated with welcome offer.",
		minIncome: 60000,
		rewardType: "points",
		rewardProgram: "Aeroplan",
		topEarnRates: [
			{ category: "Gas, groceries, Air Canada purchases", rate: "1.5x" },
			{ category: "Earn Aeroplan twice at 170+ partner retailers", rate: "+bonus" },
		],
		baseRate: "1x",
		welcomeBonus: "Up to 45,000 Aeroplan pts (multi-stage)",
		welcomeBonusValue: "Up to ~$1,450 first-year value",
		noForeignTransactionFee: false,
		accessTier: "premium",
		keyPerks: [
			"Free first checked bag on Air Canada (primary + 8 companions)",
			"Preferred pricing on Aeroplan award flights",
			"Emergency travel medical",
			"Trip cancellation/interruption",
		],
		studentNote:
			"If you fly Air Canada regularly from Ottawa (YOW), the free checked bag alone saves $30+ per trip. Great post-grad pick for flyers.",
	},

	// RBC
	{
		id: "rbc-ion",
		name: "ION Visa",
		institution: "RBC",
		institutionId: "rbc",
		annualFee: 0,
		feeWaivable: false,
		feeWaiverNote: null,
		minIncome: null,
		rewardType: "points",
		rewardProgram: "Avion Rewards",
		topEarnRates: [
			{
				category:
					"Groceries, gas, rideshare, transit, streaming, digital gaming, subscriptions",
				rate: "1.5x",
			},
		],
		baseRate: "1x",
		welcomeBonus: "Up to 11,000 Avion pts",
		welcomeBonusValue: "~$75",
		noForeignTransactionFee: false,
		accessTier: "now",
		keyPerks: [
			"Save 3¢/L at Petro-Canada (link card)",
			"50 Be Well pts per $1 at Rexall (linked)",
			"3-month DashPass subscription",
			"Purchase security + extended warranty",
		],
		studentNote: "Good entry into Avion, but the ION+ is dramatically better - get that one instead.",
	},
	{
		id: "rbc-ion-plus",
		name: "ION+ Visa",
		institution: "RBC",
		institutionId: "rbc",
		annualFee: 48,
		feeWaivable: true,
		feeWaiverNote:
			"FREE with RBC Advantage Banking for Students account (age 24 or under). Also waived with RBC Signature No Limit Banking ($4,000 balance).",
		minIncome: null,
		rewardType: "points",
		rewardProgram: "Avion Rewards",
		topEarnRates: [
			{
				category:
					"Groceries, restaurants, food delivery, gas, transit, EV charging, rideshare, streaming, digital gaming, subscriptions",
				rate: "3x",
			},
		],
		baseRate: "1x",
		welcomeBonus: "Up to 21,000 Avion pts",
		welcomeBonusValue: "~$150",
		noForeignTransactionFee: false,
		accessTier: "student",
		keyPerks: [
			"FREE with student banking - effectively $0 annual fee",
			"Mobile device insurance (2 years, up to $1,000)",
			"Save 3¢/L at Petro-Canada (link card)",
			"50 Be Well pts per $1 at Rexall (linked)",
			"3-month DashPass subscription",
		],
		studentNote:
			"THE BEST STUDENT CARD in Canada. Free with RBC student banking. 3x on groceries, restaurants, transit, gas, streaming - everything you spend on daily. Get this first.",
	},
	{
		id: "rbc-avion-vi",
		name: "Avion Visa Infinite",
		institution: "RBC",
		institutionId: "rbc",
		annualFee: 120,
		feeWaivable: true,
		feeWaiverNote: "Waived with RBC Signature No Limit Banking ($4,000 balance) or RBC VIP Banking",
		minIncome: 60000,
		rewardType: "points",
		rewardProgram: "Avion Rewards (Elite)",
		topEarnRates: [{ category: "All purchases (flat rate - no categories needed)", rate: "1.25x" }],
		baseRate: "1.25x",
		welcomeBonus: "Up to 55,000 Avion pts",
		welcomeBonusValue: "~$1,100 in travel",
		noForeignTransactionFee: false,
		accessTier: "premium",
		keyPerks: [
			"Unlocks Elite Avion tier - transfer to BA Avios, AA AAdvantage, WestJet 1:1",
			"Pool points with ION+ at 1:1 ratio",
			"Emergency travel medical",
			"Trip cancellation/interruption",
			"Visa Infinite Concierge + Hotel Collection",
		],
		studentNote:
			"Get this post-grad to unlock full Avion Elite value. Pairs perfectly with the ION+ - pool all your points and transfer to airlines.",
	},

	// CIBC
	{
		id: "cibc-dividend-visa",
		name: "Dividend® Visa* Card",
		institution: "CIBC",
		institutionId: "cibc",
		annualFee: 0,
		feeWaivable: false,
		feeWaiverNote: null,
		minIncome: null,
		rewardType: "cashback",
		rewardProgram: "Cash Back",
		topEarnRates: [{ category: "Groceries, gas, EV charging, transit, restaurants, recurring bills", rate: "1%" }],
		baseRate: "0.5%",
		welcomeBonus: "10% cash back on first 4 statements + $50 pre-auth payment bonus",
		welcomeBonusValue: "Up to ~$250",
		noForeignTransactionFee: false,
		accessTier: "now",
		keyPerks: [
			"Redeem any time via CIBC Online/Mobile (min $25)",
			"Save up to 10¢/L at Journie Rewards gas stations",
			"Purchase protection + extended warranty",
		],
		studentNote: "Fine if you bank with CIBC, but the BMO CashBack card offers better grocery rates at $0.",
	},
	{
		id: "cibc-dividend-vi",
		name: "Dividend® Visa Infinite*",
		institution: "CIBC",
		institutionId: "cibc",
		annualFee: 120,
		feeWaivable: true,
		feeWaiverNote: "Waived with CIBC Smart Plus Account (maintain $6,000 balance)",
		minIncome: 60000,
		rewardType: "cashback",
		rewardProgram: "Cash Back",
		topEarnRates: [
			{ category: "Groceries, gas", rate: "4%" },
			{ category: "Dining, daily transit, recurring bills", rate: "2%" },
		],
		baseRate: "1%",
		welcomeBonus: "10% cash back on first 4 statements + $50 pre-auth bonus",
		welcomeBonusValue: "Up to $400 first year",
		noForeignTransactionFee: false,
		accessTier: "premium",
		keyPerks: [
			"12-month Skip+ subscription FREE (~$120 value)",
			"Travel emergency medical (15 days)",
			"Trip cancellation/interruption",
			"Rental car loss/collision coverage",
			"Mobile device insurance",
		],
		studentNote:
			"Top post-grad pick if you prefer cash back. Skip+ alone is worth $120. 4% on groceries and gas is unbeatable in the cash-back category.",
	},
	{
		id: "cibc-aeroplan-student",
		name: "Aeroplan® Visa* for Students",
		institution: "CIBC",
		institutionId: "cibc",
		annualFee: 0,
		feeWaivable: false,
		feeWaiverNote: null,
		minIncome: null,
		rewardType: "points",
		rewardProgram: "Aeroplan",
		topEarnRates: [
			{ category: "Groceries, gas, Air Canada & Air Canada Vacations", rate: "1pt/$1" },
			{ category: "Earn Aeroplan twice at 170+ partner retailers", rate: "+bonus" },
		],
		baseRate: "1pt/$1.50",
		welcomeBonus: "Welcome bonus + referral program: $50/referral up to $500/yr",
		welcomeBonusValue: "Check CIBC for current offer",
		noForeignTransactionFee: false,
		accessTier: "student",
		keyPerks: [
			"No annual fee for students",
			"Preferred pricing on Aeroplan award flights",
			"Earn Aeroplan twice at 170+ retail partners",
			"Purchase protection + extended warranty",
		],
		studentNote:
			"Best no-fee Aeroplan student card. If you fly Air Canada from Ottawa (YOW), miles accumulate at $0 cost.",
	},

	// NATIONAL BANK
	{
		id: "nb-platinum",
		name: "Platinum Mastercard®",
		institution: "National Bank",
		institutionId: "national_bank",
		annualFee: 70,
		feeWaivable: false,
		feeWaiverNote: "First year annual fee FREE with welcome offer",
		minIncome: null,
		rewardType: "points",
		rewardProgram: "À la carte Rewards",
		topEarnRates: [
			{ category: "Groceries, restaurants", rate: "2x" },
			{ category: "Gas, EV charging, public transit", rate: "1.5x" },
		],
		baseRate: "1x",
		welcomeBonus: "First year annual fee waived",
		welcomeBonusValue: "$70 savings",
		noForeignTransactionFee: false,
		accessTier: "post_grad",
		keyPerks: [
			"Milesopedia Best Young Professional Card 2026",
			"Flexible redemptions: travel, gift cards, statement credits",
			"Purchase protection + extended warranty",
			"Basic travel insurance included",
		],
		studentNote:
			"Named best young professional card in Canada for 2026. Low fee, first year free, and accessible income requirements. Apply near graduation.",
	},
	{
		id: "nb-world-elite",
		name: "World Elite Mastercard®",
		institution: "National Bank",
		institutionId: "national_bank",
		annualFee: 150,
		feeWaivable: true,
		feeWaiverNote: "May be waived with certain NBC banking packages",
		minIncome: 80000,
		rewardType: "points",
		rewardProgram: "À la carte Rewards",
		topEarnRates: [
			{ category: "Groceries, restaurants", rate: "5x" },
			{ category: "Gas, EV charging, transit, travel", rate: "2x" },
		],
		baseRate: "1x",
		welcomeBonus: "Check National Bank's current promotion",
		welcomeBonusValue: "Varies",
		noForeignTransactionFee: true,
		accessTier: "premium",
		keyPerks: [
			"No foreign transaction fees",
			"Lounge access included",
			"Top-rated comprehensive travel insurance in Canada",
			"Trip cancellation/interruption",
		],
		studentNote: "Long-term target. Best insurance in Canada + no FX fees + 5x grocery. Needs $80k income.",
	},

	// TANGERINE
	{
		id: "tangerine-money-back",
		name: "Money-Back Credit Card",
		institution: "Tangerine",
		institutionId: "tangerine",
		annualFee: 0,
		feeWaivable: false,
		feeWaiverNote: null,
		minIncome: null,
		rewardType: "cashback",
		rewardProgram: "Cash Back",
		topEarnRates: [
			{ category: "2 categories of your choice (or 3 with Tangerine savings deposit)", rate: "2%" },
			{
				category:
					"Available categories: Groceries, dining, gas, pharmacy, recurring bills, entertainment, home improvement, hotels, transit, furniture",
				rate: "↑ pick 2",
			},
		],
		baseRate: "0.5%",
		welcomeBonus: "5% cash back for first 2 months (up to $4,000)",
		welcomeBonusValue: "Up to $200",
		noForeignTransactionFee: false,
		accessTier: "now",
		keyPerks: [
			"Choose your 2% categories - fully customizable to your life",
			"Cash back deposited monthly (not annually)",
			"Get a 3rd 2% category by depositing rewards to a Tangerine savings account",
			"Purchase protection",
		],
		studentNote:
			"Best strategy: pick \"pharmacy\" and \"recurring bills\" as your 2% categories (gaps that most other cards miss) and use ION+ or Cobalt for groceries/dining.",
	},

	// PC FINANCIAL
	{
		id: "pc-world-elite",
		name: "PC® World Elite Mastercard®",
		institution: "PC Financial",
		institutionId: "pc_financial",
		annualFee: 0,
		feeWaivable: false,
		feeWaiverNote: null,
		minIncome: 80000,
		rewardType: "points",
		rewardProgram: "PC Optimum",
		topEarnRates: [
			{ category: "Everywhere Mastercard is accepted", rate: "45pts/$1" },
			{ category: "Esso and Mobil gas stations", rate: "30pts/$1" },
			{ category: "Bonus at Loblaws, No Frills, Shoppers Drug Mart, Real Canadian Superstore", rate: "+extra" },
		],
		baseRate: "45pts/$1",
		welcomeBonus: "Welcome points on first qualifying purchase - check PC Financial",
		welcomeBonusValue: "Varies",
		noForeignTransactionFee: false,
		accessTier: "premium",
		keyPerks: [
			"No annual fee even at premium tier",
			"Points stack with in-store PC Optimum bonus events",
			"Travel emergency medical (16 days)",
			"Trip cancellation/interruption",
			"Rental car coverage",
			"Redeem at Shoppers, Loblaws family stores, Esso, PC Travel",
		],
		studentNote:
			"Target post-grad once income hits $80k. The only premium card in Canada with $0 fee AND travel insurance. If you shop at Shoppers/Loblaws regularly, this is a must-add to your wallet.",
	},

	// NEO FINANCIAL
	{
		id: "neo-mastercard",
		name: "Mastercard®",
		institution: "Neo Financial",
		institutionId: "neo",
		annualFee: 0,
		feeWaivable: false,
		feeWaiverNote: null,
		minIncome: null,
		rewardType: "cashback",
		rewardProgram: "Neo Cash Back",
		topEarnRates: [
			{ category: "Average at 10,000+ Neo partner merchants (grocery, gas, restaurants, retail)", rate: "~5%" },
			{ category: "Gas, grocery (minimum guaranteed)", rate: "1%" },
		],
		baseRate: "0.5%",
		welcomeBonus: "$25 after first qualifying partner purchase",
		welcomeBonusValue: "$25",
		noForeignTransactionFee: false,
		accessTier: "now",
		keyPerks: [
			"Instant approval - great for building credit history",
			"Clean modern app with real-time spending insights",
			"10,000+ partner merchants across Canada",
		],
		studentNote:
			"Great if you shop at Neo partners. Best used as a supplementary Mastercard or for building initial credit history.",
	},
]

export const INSTITUTIONS: Institution[] = [
	{ id: "amex", name: "American Express", accentColor: "#006fcf", cards: ALL_CARDS.filter((c) => c.institutionId === "amex") },
	{ id: "scotiabank", name: "Scotiabank", accentColor: "#d42027", cards: ALL_CARDS.filter((c) => c.institutionId === "scotiabank") },
	{ id: "bmo", name: "BMO", accentColor: "#0079c1", cards: ALL_CARDS.filter((c) => c.institutionId === "bmo") },
	{ id: "td", name: "TD", accentColor: "#3e7c1f", cards: ALL_CARDS.filter((c) => c.institutionId === "td") },
	{ id: "rbc", name: "RBC", accentColor: "#005daa", cards: ALL_CARDS.filter((c) => c.institutionId === "rbc") },
	{ id: "cibc", name: "CIBC", accentColor: "#a71930", cards: ALL_CARDS.filter((c) => c.institutionId === "cibc") },
	{ id: "national_bank", name: "National Bank", accentColor: "#e2001a", cards: ALL_CARDS.filter((c) => c.institutionId === "national_bank") },
	{ id: "tangerine", name: "Tangerine", accentColor: "#f26522", cards: ALL_CARDS.filter((c) => c.institutionId === "tangerine") },
	{ id: "pc_financial", name: "PC Financial", accentColor: "#004b87", cards: ALL_CARDS.filter((c) => c.institutionId === "pc_financial") },
	{ id: "neo", name: "Neo Financial", accentColor: "#6366f1", cards: ALL_CARDS.filter((c) => c.institutionId === "neo") },
]

export function scoreCards(cards: CreditCard[], profile: UserProfile): CreditCard[] {
	return cards
		.map((card) => {
			let score = 50

			if (card.minIncome !== null && profile.income) {
				const incomeFloors: Record<string, number> = {
					under_30k: 15000,
					"30k_60k": 45000,
					"60k_80k": 70000,
					"80k_plus": 90000,
				}
				const userIncome = incomeFloors[profile.income]
				if (card.minIncome > userIncome + 20000) {
					score -= 40
				}
			}

			if (profile.employment === "student") {
				if (card.accessTier === "student") score += 25
				if (card.accessTier === "now") score += 15
				if (card.accessTier === "premium") score -= 20
				if (card.annualFee === 0) score += 10
				if (card.feeWaivable && card.id === "rbc-ion-plus") score += 20
			}
			if (profile.employment === "employed") {
				if (card.accessTier === "premium") score += 10
				if (card.accessTier === "student") score -= 5
			}

			if (profile.income === "under_30k" || profile.income === "30k_60k") {
				if (card.annualFee === 0) score += 15
				if (card.annualFee > 120) score -= 15
				if (card.feeWaivable) score += 8
			}
			if (profile.income === "60k_80k" || profile.income === "80k_plus") {
				if (card.accessTier === "premium") score += 15
			}

			if (profile.priorities.includes("groceries")) {
				if (
					card.topEarnRates.some(
						(r) =>
							r.category.toLowerCase().includes("groceri") &&
							(parseFloat(r.rate) >= 3 ||
								r.rate.startsWith("3") ||
								r.rate.startsWith("4") ||
								r.rate.startsWith("5")),
					)
				) {
					score += 20
				}
			}
			if (profile.priorities.includes("dining")) {
				if (
					card.topEarnRates.some(
						(r) =>
							(r.category.toLowerCase().includes("dining") ||
								r.category.toLowerCase().includes("restaurant")) &&
							parseInt(r.rate, 10) >= 3,
					)
				) {
					score += 20
				}
			}
			if (profile.priorities.includes("travel")) {
				if (card.noForeignTransactionFee) score += 20
				if (card.keyPerks.some((p) => p.toLowerCase().includes("lounge"))) score += 10
				if (["aeroplan", "avion rewards", "membership rewards", "scene+"].includes(card.rewardProgram.toLowerCase())) {
					score += 10
				}
			}
			if (profile.priorities.includes("gas")) {
				if (card.topEarnRates.some((r) => r.category.toLowerCase().includes("gas"))) score += 15
			}
			if (profile.priorities.includes("streaming")) {
				if (card.topEarnRates.some((r) => r.category.toLowerCase().includes("stream"))) score += 15
			}
			if (profile.priorities.includes("cashback")) {
				if (card.rewardType === "cashback") score += 15
			}
			if (profile.priorities.includes("no_fee")) {
				if (card.annualFee === 0) score += 25
				if (card.annualFee > 0 && !card.feeWaivable) score -= 15
			}

			return { ...card, score }
		})
		.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
}

export function getTopPicks(profile: UserProfile, count = 3): CreditCard[] {
	const scored = scoreCards(ALL_CARDS, profile)
	return scored.slice(0, count)
}

export function getCardsByInstitution(profile: UserProfile | null): Institution[] {
	if (!profile) return INSTITUTIONS
	const scored = scoreCards(ALL_CARDS, profile)
	return INSTITUTIONS.map((inst) => ({
		...inst,
		cards: scored.filter((c) => c.institutionId === inst.id),
	}))
}

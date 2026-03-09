export interface HistoricalScenario {
	id: string
	name: string
	description: string
	dateRange: {
		start: string // ISO date
		end: string
	}
	category: 'crash' | 'bull_run' | 'volatility' | 'recovery'
	icon: string
	severity?: number // For crashes, 1-10 scale
	averageReturn?: number // Historical average return during period
}

export interface ScenarioDataPoint {
	date: string
	portfolioValue: number
	percentChange: number
	timestamp: number
}

export interface ScenarioImpact {
	scenarioId: string
	totalReturn: number
	maxDrawdown: number
	recoveryDays: number
	volatility: number
	affectedAssets: AssetImpact[]
	timeline: ScenarioDataPoint[]
}

export interface AssetImpact {
	symbol: string
	name: string
	initialValue: number
	finalValue: number
	percentChange: number
	contribution: number // Contribution to overall portfolio change
}

export interface ScenarioRequest {
	portfolioId?: string
	holdings: PortfolioHolding[]
	scenarioId: string
}

export interface PortfolioHolding {
	symbol: string
	quantity: number
	currentValue: number
	assetClass: 'stock' | 'crypto' | 'bond' | 'etf' | 'commodity'
}

export const HISTORICAL_SCENARIOS: HistoricalScenario[] = [
	{
		id: '2008-financial-crisis',
		name: '2008 Financial Crisis',
		description: 'Global financial meltdown triggered by subprime mortgage collapse',
		dateRange: {
			start: '2007-10-09',
			end: '2009-03-09'
		},
		category: 'crash',
		icon: '📉',
		severity: 10,
		averageReturn: -56.8
	},
	{
		id: 'covid-2020-crash',
		name: 'COVID-19 Crash',
		description: 'Rapid market decline due to global pandemic lockdowns',
		dateRange: {
			start: '2020-02-19',
			end: '2020-03-23'
		},
		category: 'crash',
		icon: '🦠',
		severity: 9,
		averageReturn: -33.9
	},
	{
		id: 'dot-com-bubble',
		name: 'Dot-Com Bubble Burst',
		description: 'Tech stock crash after internet speculation bubble',
		dateRange: {
			start: '2000-03-10',
			end: '2002-10-09'
		},
		category: 'crash',
		icon: '💻',
		severity: 9,
		averageReturn: -49.1
	},
	{
		id: 'covid-recovery-2020',
		name: 'COVID Recovery Bull Run',
		description: 'Historic V-shaped recovery fueled by stimulus and tech growth',
		dateRange: {
			start: '2020-03-23',
			end: '2021-11-08'
		},
		category: 'bull_run',
		icon: '🚀',
		averageReturn: 114.4
	},
	{
		id: 'post-2008-recovery',
		name: 'Post-2008 Bull Market',
		description: 'Longest bull run in history following financial crisis',
		dateRange: {
			start: '2009-03-09',
			end: '2020-02-19'
		},
		category: 'bull_run',
		icon: '📈',
		averageReturn: 401.5
	},
	{
		id: 'crypto-winter-2022',
		name: '2022 Crypto Winter',
		description: 'Crypto market collapse following Fed rate hikes and FTX bankruptcy',
		dateRange: {
			start: '2021-11-10',
			end: '2022-11-21'
		},
		category: 'crash',
		icon: '❄️',
		severity: 8,
		averageReturn: -76.5
	},
	{
		id: 'black-monday-1987',
		name: 'Black Monday 1987',
		description: 'Single largest one-day percentage drop in stock market history',
		dateRange: {
			start: '1987-10-14',
			end: '1987-10-19'
		},
		category: 'crash',
		icon: '⚡',
		severity: 10,
		averageReturn: -22.6
	},
	{
		id: '2022-bear-market',
		name: '2022 Bear Market',
		description: 'Inflation concerns and aggressive Fed tightening',
		dateRange: {
			start: '2022-01-03',
			end: '2022-10-12'
		},
		category: 'crash',
		icon: '🐻',
		severity: 6,
		averageReturn: -25.4
	}
]

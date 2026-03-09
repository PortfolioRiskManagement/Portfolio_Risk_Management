import apiClient from '../../../services/apiClient'
import type { 
	ScenarioImpact, 
	ScenarioRequest,
	PortfolioHolding 
} from '../types/scenario.types'

class ScenarioService {
	private readonly baseUrl = '/api/scenario'

	/**
	 * Calculate scenario impact on portfolio
	 * Backend will compute how portfolio would perform during historical event
	 * based on asset correlations and historical data
	 */
	async calculateScenario(request: ScenarioRequest): Promise<ScenarioImpact> {
		console.log('🎯 Scenario Lab: Requesting calculation from backend...', request)
		
		try {
			const response = await apiClient.post<{ success: boolean, data: ScenarioImpact }>(
				`${this.baseUrl}/calculate`,
				request
			)
			
			// Check if backend returned success
			if (response.data.success && response.data.data) {
				console.log('✅ Scenario Lab: Using REAL HISTORICAL DATA from yfinance backend')
				console.log('📊 Total Return:', response.data.data.totalReturn.toFixed(2) + '%')
				console.log('📉 Max Drawdown:', response.data.data.maxDrawdown.toFixed(2) + '%')
				return response.data.data
			}
			
			// Fallback to mock data if backend response is invalid
			console.warn('⚠️ Backend returned invalid response, using mock data')
			return this.getMockScenarioImpact(request)
			
		} catch (error) {
			console.error('❌ Error calculating scenario:', error)
			console.warn('⚠️ Backend unavailable - using mock data as fallback')
			console.warn('💡 Make sure Flask backend is running on port 5001')
			return this.getMockScenarioImpact(request)
		}
	}

	/**
	 * Get historical performance data for a specific asset during a scenario
	 */
	async getAssetHistoricalData(symbol: string, scenarioId: string) {
		try {
			const response = await apiClient.get(
				`${this.baseUrl}/asset/${symbol}/scenario/${scenarioId}`
			)
			return response.data
		} catch (error) {
			console.error('Error fetching asset historical data:', error)
			throw error
		}
	}

	/**
	 * Mock data generator for frontend development
	 * This simulates what the backend will return
	 */
	private getMockScenarioImpact(request: ScenarioRequest): ScenarioImpact {
		const { scenarioId, holdings } = request
		const startValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)
		
		// Different scenarios have different impacts based on asset classes
		const scenarioMultipliers: Record<string, Record<string, number>> = {
			'2008-financial-crisis': {
				stock: -0.57,
				etf: -0.55,
				bond: 0.05,
				crypto: -0.90, // Bitcoin wasn't really around
				commodity: -0.45
			},
			'covid-2020-crash': {
				stock: -0.34,
				etf: -0.33,
				bond: 0.08,
				crypto: -0.50, // Bitcoin actually recovered fast
				commodity: -0.25
			},
			'covid-recovery-2020': {
				stock: 1.20,
				etf: 1.15,
				bond: 0.03,
				crypto: 4.50, // Bitcoin soared
				commodity: 0.40
			},
			'crypto-winter-2022': {
				stock: -0.18,
				etf: -0.18,
				bond: -0.13,
				crypto: -0.77,
				commodity: 0.15
			},
			'post-2008-recovery': {
				stock: 4.00,
				etf: 3.85,
				bond: 0.45,
				crypto: 100000.00, // Bitcoin went from pennies to thousands
				commodity: 0.20
			},
			'dot-com-bubble': {
				stock: -0.49,
				etf: -0.45,
				bond: 0.20,
				crypto: 0,
				commodity: -0.10
			},
			'black-monday-1987': {
				stock: -0.226,
				etf: -0.226,
				bond: 0.02,
				crypto: 0,
				commodity: -0.15
			},
			'2022-bear-market': {
				stock: -0.25,
				etf: -0.24,
				bond: -0.14,
				crypto: -0.64,
				commodity: 0.25
			}
		}

		const multipliers = scenarioMultipliers[scenarioId] || {
			stock: -0.20,
			etf: -0.20,
			bond: 0,
			crypto: -0.30,
			commodity: -0.10
		}

		// Calculate impact per asset
		const affectedAssets = holdings.map(holding => {
			const multiplier = multipliers[holding.assetClass] || -0.20
			const finalValue = holding.currentValue * (1 + multiplier)
			const percentChange = multiplier * 100

			return {
				symbol: holding.symbol,
				name: holding.symbol, // In real impl, fetch full name
				initialValue: holding.currentValue,
				finalValue,
				percentChange,
				contribution: ((finalValue - holding.currentValue) / startValue) * 100
			}
		})

		const endValue = affectedAssets.reduce((sum, a) => sum + a.finalValue, 0)
		const totalReturn = ((endValue - startValue) / startValue) * 100

		// Generate timeline with realistic animation points
		const timeline = this.generateTimeline(startValue, endValue, scenarioId)

		// Calculate max drawdown
		const minValue = Math.min(...timeline.map(p => p.portfolioValue))
		const maxDrawdown = ((minValue - startValue) / startValue) * 100

		return {
			scenarioId,
			totalReturn,
			maxDrawdown,
			recoveryDays: Math.abs(Math.round(totalReturn * 5)), // Mock recovery time
			volatility: Math.abs(totalReturn * 0.5), // Mock volatility
			affectedAssets,
			timeline
		}
	}

	/**
	 * Generate realistic timeline for animation
	 * Creates data points that show gradual change with acceleration/deceleration
	 */
	private generateTimeline(startValue: number, endValue: number, scenarioId: string): any[] {
		const points = 60 // 60 frames for smooth animation
		const timeline = []
		const change = endValue - startValue
		const isCrash = change < 0

		for (let i = 0; i <= points; i++) {
			const t = i / points
			
			// Different easing based on scenario type
			let easedT: number
			if (isCrash) {
				// Crashes accelerate (fast drop, then plateau)
				if (scenarioId === 'black-monday-1987') {
					// Very sudden drop
					easedT = Math.pow(t, 0.5)
				} else {
					// Gradual acceleration
					easedT = t * t
				}
			} else {
				// Bull runs are more gradual
				easedT = 1 - Math.pow(1 - t, 3)
			}

			// Add some noise for realism
			const noise = (Math.random() - 0.5) * (Math.abs(change) * 0.02)
			const value = startValue + (change * easedT) + noise
			const percentChange = ((value - startValue) / startValue) * 100

			timeline.push({
				date: new Date(Date.now() + i * 50).toISOString(),
				portfolioValue: value,
				percentChange,
				timestamp: Date.now() + i * 50
			})
		}

		return timeline
	}

	/**
	 * Convert current portfolio to holdings format for scenario calculation
	 */
	convertPortfolioToHoldings(portfolio: any): PortfolioHolding[] {
		// This will be implemented based on actual portfolio structure
		// For now, return mock structure
		if (!portfolio?.accounts) return []

		const holdings: PortfolioHolding[] = []
		
		portfolio.accounts.forEach((account: any) => {
			account.positions?.forEach((position: any) => {
				holdings.push({
					symbol: position.symbol || position.ticker,
					quantity: position.quantity || position.shares,
					currentValue: position.marketValue || position.value,
					assetClass: this.determineAssetClass(position.symbol)
				})
			})
		})

		return holdings
	}

	/**
	 * Determine asset class from symbol
	 * In production, this should be fetched from backend/database
	 */
	private determineAssetClass(symbol: string): 'stock' | 'crypto' | 'bond' | 'etf' | 'commodity' {
		const crypto = ['BTC', 'ETH', 'BITCOIN', 'ETHEREUM', 'BNB', 'SOL', 'ADA', 'DOT']
		const etf = ['SPY', 'VOO', 'VFV', 'VTI', 'QQQ', 'IVV', 'VEA', 'IEFA', 'AGG', 'BND']
		const bond = ['TLT', 'IEF', 'SHY', 'LQD', 'HYG', 'MUB', 'BOND']
		const commodity = ['GLD', 'SLV', 'USO', 'UNG', 'DBA', 'GOLD', 'SILVER']

		const upperSymbol = symbol.toUpperCase()
		
		if (crypto.some(c => upperSymbol.includes(c))) return 'crypto'
		if (etf.some(e => upperSymbol === e)) return 'etf'
		if (bond.some(b => upperSymbol === b)) return 'bond'
		if (commodity.some(c => upperSymbol === c)) return 'commodity'
		
		return 'stock'
	}
}

export default new ScenarioService()

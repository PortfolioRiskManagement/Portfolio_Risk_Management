import { useState, useEffect } from 'react'
import scenarioService from '../services/scenarioService'
import type { ScenarioImpact, PortfolioHolding } from '../types/scenario.types'

export function useScenarioLab() {
	const [currentPortfolio, setCurrentPortfolio] = useState<any>(null)
	const [holdings, setHoldings] = useState<PortfolioHolding[]>([])
	const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null)
	const [scenarioImpact, setScenarioImpact] = useState<ScenarioImpact | null>(null)
	const [isAnimating, setIsAnimating] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Fetch current portfolio on mount
	useEffect(() => {
		fetchPortfolio()
	}, [])

	const fetchPortfolio = async () => {
		try {
			// Mock portfolio for now - in production, fetch from portfolio service
			const mockPortfolio = {
				totalValue: 150000,
				accounts: [
					{
						id: '1',
						name: 'TFSA',
						positions: [
							{ symbol: 'VOO', quantity: 100, marketValue: 45000, assetClass: 'etf' },
							{ symbol: 'BTC', quantity: 0.5, marketValue: 30000, assetClass: 'crypto' },
							{ symbol: 'AAPL', quantity: 200, marketValue: 35000, assetClass: 'stock' },
							{ symbol: 'GLD', quantity: 150, marketValue: 25000, assetClass: 'commodity' },
							{ symbol: 'BND', quantity: 300, marketValue: 15000, assetClass: 'bond' }
						]
					}
				]
			}
			
			setCurrentPortfolio(mockPortfolio)
			const portfolioHoldings = scenarioService.convertPortfolioToHoldings(mockPortfolio)
			setHoldings(portfolioHoldings)
		} catch (err) {
			console.error('Error fetching portfolio:', err)
			setError('Failed to load portfolio')
		}
	}

	const runScenario = async (scenarioId: string) => {
		if (!holdings.length) {
			setError('No portfolio holdings available')
			return
		}

		setIsLoading(true)
		setError(null)
		setSelectedScenarioId(scenarioId)

		try {
			const impact = await scenarioService.calculateScenario({
				holdings,
				scenarioId
			})
			
			setScenarioImpact(impact)
			setIsAnimating(true)
		} catch (err) {
			console.error('Error running scenario:', err)
			setError('Failed to calculate scenario impact')
			setIsAnimating(false)
		} finally {
			setIsLoading(false)
		}
	}

	const resetScenario = () => {
		setSelectedScenarioId(null)
		setScenarioImpact(null)
		setIsAnimating(false)
		setError(null)
	}

	const updateHoldings = (newHoldings: PortfolioHolding[]) => {
		setHoldings(newHoldings)
		// Update portfolio total value
		const newTotalValue = newHoldings.reduce((sum, h) => sum + h.currentValue, 0)
		setCurrentPortfolio({
			...currentPortfolio,
			totalValue: newTotalValue
		})
	}

	return {
		currentPortfolio,
		holdings,
		selectedScenarioId,
		scenarioImpact,
		isAnimating,
		isLoading,
		error,
		runScenario,
		resetScenario,
		setIsAnimating,
		updateHoldings
	}
}

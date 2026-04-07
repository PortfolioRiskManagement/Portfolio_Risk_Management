import { useState, useEffect } from 'react'
import scenarioService from '../services/scenarioService'
import type { ScenarioImpact, PortfolioHolding } from '../types/scenario.types'
import { useHoldings, type Holding } from '../../portfolio/hooks/useHoldings'

type PortfolioViewModel = {
	totalValue: number
	accounts: Array<{
		id: string
		name: string
		positions: Array<{
			symbol: string
			quantity: number
			marketValue: number
			assetClass: PortfolioHolding['assetClass']
		}>
	}>
}

const ASSET_TYPE_MAP: Record<string, PortfolioHolding['assetClass']> = {
	stock: 'stock',
	crypto: 'crypto',
	bond: 'bond',
	etf: 'etf',
	commodity: 'commodity'
}

function inferAssetClass(type?: string): PortfolioHolding['assetClass'] {
	if (!type) return 'stock'
	const key = type.trim().toLowerCase()
	return ASSET_TYPE_MAP[key] ?? 'stock'
}

function convertSharedHoldingToScenarioHolding(holding: Holding): PortfolioHolding {
	const currentValue = Math.max(0, holding.quantity * holding.entry)

	return {
		symbol: holding.symbol.toUpperCase(),
		quantity: holding.quantity,
		currentValue,
		assetClass: inferAssetClass(holding.type)
	}
}

function buildPortfolioViewModel(nextHoldings: PortfolioHolding[]): PortfolioViewModel {
	return {
		totalValue: nextHoldings.reduce((sum, h) => sum + h.currentValue, 0),
		accounts: [
			{
				id: '1',
				name: 'Unified Portfolio',
				positions: nextHoldings.map((h) => ({
					symbol: h.symbol,
					quantity: h.quantity,
					marketValue: h.currentValue,
					assetClass: h.assetClass
				}))
			}
		]
	}
}

export function useScenarioLab() {
	const { holdings: sharedHoldings } = useHoldings()
	const [currentPortfolio, setCurrentPortfolio] = useState<PortfolioViewModel | null>(null)
	const [holdings, setHoldings] = useState<PortfolioHolding[]>([])
	const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null)
	const [scenarioImpact, setScenarioImpact] = useState<ScenarioImpact | null>(null)
	const [isAnimating, setIsAnimating] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Keep Scenario Lab portfolio in sync with the shared holdings used across app pages.
	useEffect(() => {
		const scenarioHoldings = sharedHoldings.map(convertSharedHoldingToScenarioHolding)
		setHoldings(scenarioHoldings)
		setCurrentPortfolio(buildPortfolioViewModel(scenarioHoldings))
	}, [sharedHoldings])

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
		setCurrentPortfolio(buildPortfolioViewModel(newHoldings))
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

import { useState } from 'react'
import { useScenarioLab } from '../hooks/useScenarioLab'
import { ScenarioGrid } from '../components/ScenarioGrid'
import { AnimatedScenarioGraph } from '../components/AnimatedScenarioGraph'
import { ScenarioResultsModal } from '../components/ScenarioResultsModal'
import { PortfolioEditorForScenario } from '../components/PortfolioEditorForScenario'
import { HISTORICAL_SCENARIOS } from '../types/scenario.types'
import PageShell from '../../../components/layout/PageShell'

export default function ScenarioLabPage() {
	const {
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
	} = useScenarioLab()

	const [showResults, setShowResults] = useState(false)
	const [hasProceeded, setHasProceeded] = useState(false)

	const selectedScenario = HISTORICAL_SCENARIOS.find(s => s.id === selectedScenarioId)
	const initialValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)

	const handleScenarioSelect = (scenarioId: string) => {
		if (isAnimating) return
		runScenario(scenarioId)
	}

	const handleAnimationComplete = () => {
		setIsAnimating(false)
		setShowResults(true)
	}

	const handleCloseResults = () => {
		setShowResults(false)
		resetScenario()
	}

	return (
		<PageShell title="Scenario Lab">
			<div className="space-y-6">
				{/* Info Section */}
				<div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl overflow-hidden shadow-lg">
					<div className="p-6">
						<div className="flex items-center gap-4 text-left mb-4">
							<div className="text-4xl">💡</div>
							<div>
								<h3 className="text-xl font-bold text-white mb-1">How Scenario Lab Works</h3>
								<p className="text-sm text-zinc-400">
									Test your portfolio against historical market events
								</p>
							</div>
						</div>
						<div className="space-y-2">
							<div className="group cursor-default">
								<div className="flex items-start gap-3 p-4 rounded-lg hover:bg-purple-500/10 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 border border-transparent hover:border-purple-500/30">
									<span className="text-purple-400 mt-1 text-xl group-hover:scale-125 transition-transform">▸</span>
									<span className="text-zinc-300 group-hover:text-white transition-colors text-sm leading-relaxed">
										<strong>Real Historical Data:</strong> Simulations use actual market data from yfinance to show how your portfolio would have performed
									</span>
								</div>
							</div>
							<div className="group cursor-default">
								<div className="flex items-start gap-3 p-4 rounded-lg hover:bg-blue-500/10 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 border border-transparent hover:border-blue-500/30">
									<span className="text-blue-400 mt-1 text-xl group-hover:scale-125 transition-transform">▸</span>
									<span className="text-zinc-300 group-hover:text-white transition-colors text-sm leading-relaxed">
										<strong>Asset-Specific Impact:</strong> Different assets react differently - Bitcoin soared during COVID recovery while bonds stayed stable
									</span>
								</div>
							</div>
							<div className="group cursor-default">
								<div className="flex items-start gap-3 p-4 rounded-lg hover:bg-purple-500/10 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 border border-transparent hover:border-purple-500/30">
									<span className="text-purple-400 mt-1 text-xl group-hover:scale-125 transition-transform">▸</span>
									<span className="text-zinc-300 group-hover:text-white transition-colors text-sm leading-relaxed">
										<strong>Live Animation:</strong> Watch your portfolio value change in real-time with dramatic pause points showing key moments
									</span>
								</div>
							</div>
							<div className="group cursor-default">
								<div className="flex items-start gap-3 p-4 rounded-lg hover:bg-blue-500/10 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 border border-transparent hover:border-blue-500/30">
									<span className="text-blue-400 mt-1 text-xl group-hover:scale-125 transition-transform">▸</span>
									<span className="text-zinc-300 group-hover:text-white transition-colors text-sm leading-relaxed">
										<strong>Detailed Breakdown:</strong> Get per-asset analysis, volatility metrics, and actionable insights after each simulation
									</span>
								</div>
							</div>
						</div>
						{!hasProceeded && (
							<div className="mt-5">
								<button
									onClick={() => setHasProceeded(true)}
									className="px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 transition-all"
								>
									Proceed
								</button>
							</div>
						)}
					</div>
				</div>

				{hasProceeded && !selectedScenarioId && currentPortfolio && (
					<PortfolioEditorForScenario
						holdings={holdings}
						onUpdateHoldings={updateHoldings}
						totalValue={currentPortfolio.totalValue}
					/>
				)}

				{/* Error Display */}
				{error && (
					<div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
						<p className="text-red-400">{error}</p>
					</div>
				)}

				{/* Main Content Area */}
				{!hasProceeded ? null : !selectedScenarioId ? (
					/* Scenario Selection */
					<div>
						<ScenarioGrid 
							onSelectScenario={handleScenarioSelect}
							selectedScenarioId={selectedScenarioId}
							disabled={isLoading}
						/>
					</div>
				) : (
					/* Animation & Results Area */
					<div className="space-y-6">
						{/* Back Button */}
						<div className="flex items-center justify-between">
							<button
								onClick={handleCloseResults}
								disabled={isAnimating}
								className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
								<span>Back to Scenarios</span>
							</button>
							{selectedScenario && (
								<div className="text-right">
									<div className="text-white font-semibold">{selectedScenario.icon} {selectedScenario.name}</div>
									{isAnimating && <div className="text-sm text-purple-400">Simulating...</div>}
								</div>
							)}
						</div>

						{/* Animated Graph */}
						{scenarioImpact && selectedScenario && (
							<AnimatedScenarioGraph
								timeline={scenarioImpact.timeline}
								startValue={initialValue}
								isAnimating={isAnimating}
								onAnimationComplete={handleAnimationComplete}
								scenarioName={selectedScenario.name}
								scenarioIcon={selectedScenario.icon}
							/>
						)}

						{/* Quick Stats During Animation */}
						{isAnimating && scenarioImpact && (
							<div className="grid grid-cols-3 gap-4">
								<div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-center">
									<div className="text-zinc-500 text-sm mb-1">Max Drawdown</div>
									<div className="text-xl font-bold text-orange-400">
										{scenarioImpact.maxDrawdown.toFixed(1)}%
									</div>
								</div>
								<div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-center">
									<div className="text-zinc-500 text-sm mb-1">Volatility</div>
									<div className="text-xl font-bold text-yellow-400">
										{scenarioImpact.volatility.toFixed(1)}%
									</div>
								</div>
								<div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-center">
									<div className="text-zinc-500 text-sm mb-1">Assets Affected</div>
									<div className="text-xl font-bold text-blue-400">
										{scenarioImpact.affectedAssets.length}
									</div>
								</div>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Results Modal */}
			{showResults && scenarioImpact && selectedScenario && (
				<ScenarioResultsModal
					isOpen={showResults}
					onClose={handleCloseResults}
					impact={scenarioImpact}
					scenario={selectedScenario}
					initialValue={initialValue}
				/>
			)}
		</PageShell>
	)
}

import { useState } from 'react'
import { useScenarioLab } from '../hooks/useScenarioLab'
import { ScenarioGrid } from '../components/ScenarioGrid'
import { AnimatedScenarioGraph } from '../components/AnimatedScenarioGraph'
import { ScenarioResultsModal } from '../components/ScenarioResultsModal'
import { PortfolioEditorForScenario } from '../components/PortfolioEditorForScenario'
import { HISTORICAL_SCENARIOS } from '../types/scenario.types'
import PageShell from '../../../components/layout/PageShell'
import { SpinnerLoader } from '../../../components/ui/SpinnerLoader'

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
	const [showInfoPanel, setShowInfoPanel] = useState(true)
	const [canOpenResults, setCanOpenResults] = useState(false)

	const selectedScenario = HISTORICAL_SCENARIOS.find(s => s.id === selectedScenarioId)
	const initialValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)

	const handleScenarioSelect = (scenarioId: string) => {
		if (isAnimating) return
		setCanOpenResults(false)
		setShowResults(false)
		runScenario(scenarioId)
	}

	const handleAnimationComplete = () => {
		setIsAnimating(false)
		setCanOpenResults(true)
	}

	const handleCloseResults = () => {
		setShowResults(false)
	}

	const handleBackToScenarios = () => {
		setShowResults(false)
		setCanOpenResults(false)
		resetScenario()
	}

	const handleReturnToInfo = () => {
		setShowResults(false)
		setCanOpenResults(false)
		setHasProceeded(false)
		setShowInfoPanel(true)
		resetScenario()
	}

	const infoItems = [
		{
			title: 'Real Historical Data',
			description: 'Simulations use real market behavior from yfinance-backed data.',
		},
		{
			title: 'Asset-Specific Impact',
			description: 'Each holding reacts differently based on real asset performance patterns.',
		},
		{
			title: 'Live Animation',
			description: 'Watch portfolio movement continuously from left to right over the scenario timeline.',
		},
		{
			title: 'Detailed Breakdown',
			description: 'Get per-asset impact, drawdown, and risk context in a focused report.',
		},
	]

	return (
		<PageShell title="Scenario Lab">
			<div className="space-y-6">
				{hasProceeded && (
					<div className="flex justify-center">
						<button
							onClick={handleReturnToInfo}
							className="group relative flex items-center justify-center w-10 hover:w-28 h-10 rounded-full border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 transition-all duration-300 ease-out overflow-hidden"
							title="Go back to info"
						>
							<span className="shrink-0 text-lg">💡</span>
							<span className="max-w-0 opacity-0 -translate-x-1 group-hover:max-w-16 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-sm font-medium whitespace-nowrap">
								Info
							</span>
						</button>
					</div>
				)}

				{(!hasProceeded || showInfoPanel) && (
					<div className="max-w-5xl mx-auto w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-lg">
						<div className="text-center mb-6">
							<div className="text-4xl mb-2">💡</div>
							<h3 className="text-2xl font-bold text-white mb-2">How Scenario Lab Works</h3>
							<p className="text-sm text-zinc-400">
								Test your portfolio against historical market events using real backend data.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{infoItems.map((item) => (
								<div key={item.title} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 text-center">
									<div className="text-sm font-semibold text-white mb-1">{item.title}</div>
									<div className="text-xs leading-relaxed text-zinc-400">{item.description}</div>
								</div>
							))}
						</div>

						{!hasProceeded && (
							<div className="mt-6 flex justify-center">
								<button
									onClick={() => {
										setHasProceeded(true)
										setShowInfoPanel(false)
									}}
									className="px-7 py-3 rounded-lg font-semibold text-white bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-colors"
								>
									Proceed
								</button>
							</div>
						)}
					</div>
				)}

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
					<div className="max-w-6xl mx-auto w-full">
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
								onClick={handleBackToScenarios}
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

						{selectedScenario && isLoading && !scenarioImpact && (
							<div className="w-full h-[500px] bg-zinc-900/50 rounded-xl border border-zinc-800 flex items-center justify-center">
								<SpinnerLoader size={160} />
							</div>
						)}

						{scenarioImpact && selectedScenario && !isAnimating && canOpenResults && (
							<div className="flex justify-center">
								<button
									onClick={() => setShowResults(true)}
									className="px-6 py-3 rounded-lg font-semibold text-white bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-colors"
								>
									See Key Insights & Report
								</button>
							</div>
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

import type { ScenarioImpact, HistoricalScenario } from '../types/scenario.types'

interface ScenarioResultsModalProps {
	isOpen: boolean
	onClose: () => void
	impact: ScenarioImpact
	scenario: HistoricalScenario
	initialValue: number
}

export function ScenarioResultsModal({ 
	isOpen, 
	onClose, 
	impact, 
	scenario,
	initialValue 
}: ScenarioResultsModalProps) {
	if (!isOpen) return null

	const finalValue = initialValue * (1 + impact.totalReturn / 100)
	const absoluteChange = finalValue - initialValue

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
			<div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-900 rounded-2xl border-2 border-zinc-800 shadow-2xl">
				{/* Header */}
				<div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 z-10">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-4">
							<div className="text-5xl">{scenario.icon}</div>
							<div>
								<h2 className="text-2xl font-bold text-white">{scenario.name}</h2>
								<p className="text-zinc-400 text-sm mt-1">{scenario.description}</p>
							</div>
						</div>
						<button
							onClick={onClose}
							className="text-zinc-500 hover:text-white transition-colors p-2"
						>
							<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="p-6 space-y-6">
					{/* Summary Cards */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
							<div className="text-zinc-500 text-sm mb-1">Total Return</div>
							<div className={`text-2xl font-bold ${impact.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
								{impact.totalReturn >= 0 ? '+' : ''}{impact.totalReturn.toFixed(2)}%
							</div>
							<div className="text-zinc-400 text-xs mt-1">
								{absoluteChange >= 0 ? '+' : ''}${Math.abs(absoluteChange).toLocaleString('en-US', { maximumFractionDigits: 0 })}
							</div>
						</div>

						<div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
							<div className="text-zinc-500 text-sm mb-1">Max Drawdown</div>
							<div className="text-2xl font-bold text-orange-400">
								{impact.maxDrawdown.toFixed(2)}%
							</div>
							<div className="text-zinc-400 text-xs mt-1">Worst point</div>
						</div>

						<div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
							<div className="text-zinc-500 text-sm mb-1">Volatility</div>
							<div className="text-2xl font-bold text-yellow-400">
								{impact.volatility.toFixed(2)}%
							</div>
							<div className="text-zinc-400 text-xs mt-1">Fluctuation</div>
						</div>

						<div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
							<div className="text-zinc-500 text-sm mb-1">Recovery Time</div>
							<div className="text-2xl font-bold text-blue-400">
								{impact.recoveryDays}
							</div>
							<div className="text-zinc-400 text-xs mt-1">Days estimated</div>
						</div>
					</div>

					{/* Portfolio Value Comparison */}
					<div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700">
						<h3 className="text-lg font-semibold text-white mb-4">Portfolio Impact</h3>
						<div className="flex items-center justify-between mb-2">
							<div>
								<div className="text-zinc-500 text-sm">Initial Value</div>
								<div className="text-2xl font-bold text-white">
									${initialValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
								</div>
							</div>
							<div className="flex-1 mx-8 flex items-center">
								<div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
									<div 
										className={`h-full ${impact.totalReturn >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
										style={{ width: `${Math.abs(impact.totalReturn)}%` }}
									/>
								</div>
								<div className={`ml-4 font-semibold ${impact.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
									{impact.totalReturn >= 0 ? '↗' : '↘'} {Math.abs(impact.totalReturn).toFixed(1)}%
								</div>
							</div>
							<div>
								<div className="text-zinc-500 text-sm text-right">Final Value</div>
								<div className="text-2xl font-bold text-white">
									${finalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
								</div>
							</div>
						</div>
					</div>

					{/* Asset Breakdown */}
					<div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700">
						<h3 className="text-lg font-semibold text-white mb-4">Asset Performance Breakdown</h3>
						<div className="space-y-3">
							{impact.affectedAssets
								.sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange))
								.map((asset) => (
								<div 
									key={asset.symbol}
									className="flex items-center gap-4 p-3 bg-zinc-900/50 rounded-lg hover:bg-zinc-900 transition-colors"
								>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<div className="font-semibold text-white">{asset.symbol}</div>
											<div className="text-zinc-500 text-sm truncate">{asset.name}</div>
										</div>
									</div>
									
									<div className="text-right">
										<div className="text-white font-medium">
											${asset.initialValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
											<span className="text-zinc-600 mx-2">→</span>
											${asset.finalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
										</div>
									</div>

									<div className="w-24 text-right">
										<div className={`font-bold ${asset.percentChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
											{asset.percentChange >= 0 ? '+' : ''}{asset.percentChange.toFixed(2)}%
										</div>
									</div>

									<div className="w-32">
										<div className="text-xs text-zinc-500 mb-1">Portfolio Impact</div>
										<div className="w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
											<div 
												className={`h-full ${asset.contribution >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
												style={{ width: `${Math.min(Math.abs(asset.contribution) * 5, 100)}%` }}
											/>
										</div>
										<div className={`text-xs mt-1 ${asset.contribution >= 0 ? 'text-green-400' : 'text-red-400'}`}>
											{asset.contribution >= 0 ? '+' : ''}{asset.contribution.toFixed(2)}%
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Insights */}
					<div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-6">
						<h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
							<span>💡</span>
							Key Insights
						</h3>
						<ul className="space-y-2 text-sm text-zinc-300">
							{impact.totalReturn < -20 && (
								<li className="flex items-start gap-2">
									<span className="text-red-400 mt-1">▸</span>
									<span>Significant portfolio decline. Diversification across asset classes could help reduce impact.</span>
								</li>
							)}
							{impact.maxDrawdown < -30 && (
								<li className="flex items-start gap-2">
									<span className="text-orange-400 mt-1">▸</span>
									<span>Large drawdown detected. Consider protective strategies like stop-losses or hedging.</span>
								</li>
							)}
							{impact.volatility > 20 && (
								<li className="flex items-start gap-2">
									<span className="text-yellow-400 mt-1">▸</span>
									<span>High volatility observed. Bonds and stable assets can help smooth returns.</span>
								</li>
							)}
							{impact.totalReturn > 50 && (
								<li className="flex items-start gap-2">
									<span className="text-green-400 mt-1">▸</span>
									<span>Exceptional returns during this period. Your portfolio composition benefited strongly.</span>
								</li>
							)}
							<li className="flex items-start gap-2">
								<span className="text-blue-400 mt-1">▸</span>
								<span>Historical scenarios help understand risk exposure. Past performance doesn't guarantee future results.</span>
							</li>
						</ul>
					</div>
				</div>

				{/* Footer Actions */}
				<div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-800 p-6 flex gap-3">
					<button
						onClick={onClose}
						className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors font-medium"
					>
						Try Another Scenario
					</button>
					<button
						className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg transition-all font-medium"
					>
						<span className="flex items-center gap-2">
							<span>Export Report</span>
							<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
						</span>
					</button>
				</div>
			</div>
		</div>
	)
}

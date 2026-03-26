import { HISTORICAL_SCENARIOS, type HistoricalScenario } from '../types/scenario.types'

interface ScenarioCardProps {
	scenario: HistoricalScenario
	onSelect: (scenarioId: string) => void
	isSelected: boolean
	disabled?: boolean
}

export function ScenarioCard({ scenario, onSelect, isSelected, disabled }: ScenarioCardProps) {
	const categoryColors = {
		crash: 'from-zinc-900 to-zinc-900 border-zinc-800',
		bull_run: 'from-zinc-900 to-zinc-900 border-zinc-800',
		volatility: 'from-zinc-900 to-zinc-900 border-zinc-800',
		recovery: 'from-zinc-900 to-zinc-900 border-zinc-800'
	}

	const categoryTextColors = {
		crash: 'text-red-400',
		bull_run: 'text-green-400',
		volatility: 'text-yellow-400',
		recovery: 'text-blue-400'
	}

	const getSeverityColor = (severity?: number) => {
		if (!severity) return ''
		if (severity >= 9) return 'text-red-500'
		if (severity >= 7) return 'text-orange-500'
		return 'text-yellow-500'
	}

	return (
		<button
			onClick={() => onSelect(scenario.id)}
			disabled={disabled}
			className={`
				relative p-6 rounded-xl border-2 transition-all duration-300
				bg-gradient-to-br ${categoryColors[scenario.category]}
				hover:border-zinc-700 hover:-translate-y-0.5
				disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
				${isSelected ? 'ring-2 ring-zinc-600 border-zinc-600' : ''}
				text-left w-full
			`}
		>
			{/* Icon */}
			<div className="text-5xl mb-3">{scenario.icon}</div>

			{/* Title */}
			<h3 className="text-xl font-bold text-white mb-2">{scenario.name}</h3>

			{/* Description */}
			<p className="text-sm text-zinc-400 mb-4 line-clamp-2">
				{scenario.description}
			</p>

			{/* Stats */}
			<div className="flex items-center justify-between text-sm">
				<div className="flex items-center gap-3">
					{scenario.severity && (
						<div className="flex items-center gap-1">
							<span className="text-zinc-500">Severity:</span>
							<span className={`font-bold ${getSeverityColor(scenario.severity)}`}>
								{scenario.severity}/10
							</span>
						</div>
					)}
					{scenario.averageReturn !== undefined && (
						<div className="flex items-center gap-1">
							<span className={categoryTextColors[scenario.category]}>
								{scenario.averageReturn >= 0 ? '+' : ''}
								{scenario.averageReturn.toFixed(1)}%
							</span>
						</div>
					)}
				</div>
			</div>

			{/* Date Range */}
			<div className="mt-3 text-xs text-zinc-500">
				{new Date(scenario.dateRange.start).toLocaleDateString('en-US', { 
					month: 'short', 
					year: 'numeric' 
				})} 
				{' → '}
				{new Date(scenario.dateRange.end).toLocaleDateString('en-US', { 
					month: 'short', 
					year: 'numeric' 
				})}
			</div>

			{/* Selected Indicator */}
			{isSelected && (
				<div className="absolute top-3 right-3">
					<div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
				</div>
			)}
		</button>
	)
}

interface ScenarioGridProps {
	onSelectScenario: (scenarioId: string) => void
	selectedScenarioId: string | null
	disabled?: boolean
}

export function ScenarioGrid({ onSelectScenario, selectedScenarioId, disabled }: ScenarioGridProps) {
	const crashes = HISTORICAL_SCENARIOS.filter(s => s.category === 'crash')
	const bullRuns = HISTORICAL_SCENARIOS.filter(s => s.category === 'bull_run')

	return (
		<div className="space-y-8">
			{/* Crashes Section */}
			<div>
				<h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
					<span>📉</span>
					Market Crashes
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{crashes.map(scenario => (
						<ScenarioCard
							key={scenario.id}
							scenario={scenario}
							onSelect={onSelectScenario}
							isSelected={selectedScenarioId === scenario.id}
							disabled={disabled}
						/>
					))}
				</div>
			</div>

			{/* Bull Runs Section */}
			<div>
				<h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
					<span>📈</span>
					Bull Runs
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{bullRuns.map(scenario => (
						<ScenarioCard
							key={scenario.id}
							scenario={scenario}
							onSelect={onSelectScenario}
							isSelected={selectedScenarioId === scenario.id}
							disabled={disabled}
						/>
					))}
				</div>
			</div>
		</div>
	)
}

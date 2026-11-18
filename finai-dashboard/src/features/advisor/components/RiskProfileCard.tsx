type Props = {
	report: any
}

export default function RiskProfileCard({ report }: Props) {
	const alignment = report.risk_alignment
	const isAligned = alignment.status === "aligned"

	return (
		<div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/30 dark:shadow-none">
			<h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Risk Profile</h3>
			<div className="space-y-3 text-sm">
				<div className="flex justify-between">
					<span className="text-zinc-500 dark:text-zinc-400">Classification</span>
					<span className="font-medium capitalize text-zinc-950 dark:text-white">{report.portfolio_risk_classification}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-zinc-500 dark:text-zinc-400">Volatility</span>
					<span className="font-medium text-zinc-950 dark:text-white">{(report.volatility * 100).toFixed(2)}%</span>
				</div>
				<div className="flex justify-between">
					<span className="text-zinc-500 dark:text-zinc-400">Max Drawdown</span>
					<span className="font-medium text-red-400">{(report.max_drawdown * 100).toFixed(2)}%</span>
				</div>
				<div className="flex justify-between">
					<span className="text-zinc-500 dark:text-zinc-400">Sharpe Ratio</span>
					<span className="font-medium text-green-400">{report.sharpe_ratio.toFixed(2)}</span>
				</div>
			</div>
			<div className={`mt-4 pt-3 border-t ${isAligned ? "border-green-500/30" : "border-yellow-500/30"}`}>
				<p className={`text-xs font-medium ${isAligned ? "text-green-400" : "text-yellow-400"}`}>
					{isAligned ? "✓ Aligned" : "⚠ Misaligned"}
				</p>
			</div>
		</div>
	)
}

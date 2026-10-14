type Props = {
	report: any
}

export default function DiversificationCard({ report }: Props) {
	const div = report.diversification
	const score = div.diversification_score

	return (
		<div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/30 dark:shadow-none">
			<h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Diversification</h3>
			<div className="space-y-3">
				<div>
					<div className="flex justify-between mb-2">
						<span className="text-sm text-zinc-500 dark:text-zinc-400">Score</span>
						<span className="text-sm font-bold text-zinc-950 dark:text-white">{score.toFixed(0)}/100</span>
					</div>
					<div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700/50">
						<div
							className={`h-full rounded-full transition ${
								score > 70 ? "bg-green-500" : score > 50 ? "bg-yellow-500" : "bg-red-500"
							}`}
							style={{ width: `${Math.min(score, 100)}%` }}
						/>
					</div>
				</div>
				<div className="flex justify-between border-t border-zinc-200 pt-2 text-sm dark:border-zinc-700">
					<span className="text-zinc-500 dark:text-zinc-400">Effective Assets</span>
					<span className="font-medium text-zinc-950 dark:text-white">{div.effective_number_of_assets.toFixed(1)}/{div.actual_number_of_assets}</span>
				</div>
			</div>
		</div>
	)
}

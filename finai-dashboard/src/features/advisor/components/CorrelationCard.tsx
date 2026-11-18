type Props = {
	report: any
}

export default function CorrelationCard({ report }: Props) {
	const corr = report.correlation_analysis

	return (
		<div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/30 dark:shadow-none">
			<h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Correlation</h3>
			<div className="space-y-3">
				<div>
					<p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">Average Pairwise</p>
					<p className="text-2xl font-bold text-zinc-950 dark:text-white">{corr.average_pairwise_correlation.toFixed(2)}</p>
				</div>
				<p className="text-xs italic text-zinc-600 dark:text-zinc-300">{corr.assessment}</p>
			</div>
		</div>
	)
}

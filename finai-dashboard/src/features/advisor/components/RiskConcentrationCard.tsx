type Props = {
	report: any
}

export default function RiskConcentrationCard({ report }: Props) {
	const conc = report.risk_concentration

	return (
		<div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/30 dark:shadow-none">
			<h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Risk Contributors</h3>
			<div className="space-y-3">
				{conc.top_contributors.map((item: any, idx: number) => (
					<div key={idx}>
						<div className="flex justify-between mb-1">
							<span className="text-sm text-zinc-950 dark:text-white">{item.ticker}</span>
							<span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">{item.risk_contribution_pct.toFixed(1)}%</span>
						</div>
						<div className="h-1 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700/50">
							<div
								className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
								style={{ width: `${item.risk_contribution_pct}%` }}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

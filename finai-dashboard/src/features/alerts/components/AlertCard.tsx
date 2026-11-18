export type Alert = {
	id: string
	title: string
	description: string
	source: string
	timestamp: string
	impact: "high" | "medium" | "low"
	category: "stock" | "market" | "economy" | "sector"
	relatedTickers: string[]
	link?: string
}

type Props = {
	alert: Alert
	showTickers?: boolean
}

export default function AlertCard({ alert, showTickers = false }: Props) {
	const impactStyles = {
		high: {
			card: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800/60",
			badge: "border border-red-200 bg-red-100 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300",
		},
		medium: {
			card: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800/60",
			badge: "border border-yellow-200 bg-yellow-100 text-yellow-800 dark:border-yellow-500/30 dark:bg-yellow-500/15 dark:text-yellow-300",
		},
		low: {
			card: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/60",
			badge: "border border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-300",
		},
	}

	const categoryConfig = {
		stock: {
			icon: "📈",
			label: "Stock",
		},
		market: {
			icon: "📊",
			label: "Market",
		},
		economy: {
			icon: "💹",
			label: "Economy",
		},
		sector: {
			icon: "🏭",
			label: "Sector",
		},
	}

	const getTimeAgo = (timestamp: string) => {
		const date = new Date(timestamp)
		const now = new Date()
		const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

		if (seconds < 60) return "Just now"
		if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
		if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
		return `${Math.floor(seconds / 86400)}d ago`
	}

	const currentImpact = impactStyles[alert.impact]
	const currentCategory = categoryConfig[alert.category]

	return (
		<div
			className={`rounded-xl border p-4 transition hover:shadow-lg hover:shadow-black/10 ${currentImpact.card}`}
		>
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-start gap-3 flex-1 min-w-0">
					<div className="text-2xl leading-none mt-0.5">{currentCategory.icon}</div>

					<div className="flex-1 min-w-0">
						<div className="flex flex-wrap items-center gap-2 mb-2">
							<span className="rounded-md border border-white/60 bg-white/80 px-2 py-1 text-[11px] text-zinc-600 dark:border-white/10 dark:bg-white/10 dark:text-zinc-300">
								{currentCategory.label}
							</span>
						</div>

						<h3 className="mb-1 text-sm font-semibold leading-5 text-zinc-950 dark:text-white">
							{alert.title}
						</h3>

						<p className="text-xs leading-5 text-zinc-700 dark:text-zinc-300">
							{alert.description}
						</p>
					</div>
				</div>

				<div className="shrink-0">
					<span
						className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-medium capitalize ${currentImpact.badge}`}
					>
						{alert.impact} Impact
					</span>
				</div>
			</div>

			{showTickers && alert.relatedTickers.length > 0 && (
				<div className="mt-4 border-t border-zinc-200 pt-4 dark:border-white/10">
					<p className="mb-2 text-[11px] text-zinc-500 dark:text-zinc-400">Affected Assets</p>
					<div className="flex flex-wrap gap-2">
						{alert.relatedTickers.map((ticker) => (
							<span
								key={ticker}
								className="rounded-md border border-white/60 bg-white/80 px-2.5 py-1 text-xs font-medium text-zinc-900 dark:border-white/10 dark:bg-white/10 dark:text-white"
							>
								{ticker}
							</span>
						))}
					</div>
				</div>
			)}

			<div className="mt-4 flex items-center justify-between gap-3 border-t border-zinc-200 pt-4 text-xs dark:border-white/10">
				<span className="truncate text-zinc-500 dark:text-zinc-400">
					{alert.source} • {getTimeAgo(alert.timestamp)}
				</span>

				{alert.link && (
					<a
						href={alert.link}
						target="_blank"
						rel="noopener noreferrer"
						className="shrink-0 text-blue-400 hover:text-blue-300 transition font-medium"
					>
						Read More →
					</a>
				)}
			</div>
		</div>
	)
}

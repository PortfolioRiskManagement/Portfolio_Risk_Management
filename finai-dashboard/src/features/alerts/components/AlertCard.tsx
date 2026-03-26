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
			card: "bg-red-950/30 border-red-800/60",
			badge: "bg-red-500/15 text-red-300 border border-red-500/30",
		},
		medium: {
			card: "bg-yellow-950/30 border-yellow-800/60",
			badge: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
		},
		low: {
			card: "bg-blue-950/30 border-blue-800/60",
			badge: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
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
							<span className="text-[11px] px-2 py-1 rounded-md bg-white/10 text-zinc-300 border border-white/10">
								{currentCategory.label}
							</span>
						</div>

						<h3 className="text-sm font-semibold text-white mb-1 leading-5">
							{alert.title}
						</h3>

						<p className="text-xs text-zinc-300 leading-5">
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
				<div className="mt-4 pt-4 border-t border-white/10">
					<p className="text-[11px] text-zinc-400 mb-2">Affected Assets</p>
					<div className="flex flex-wrap gap-2">
						{alert.relatedTickers.map((ticker) => (
							<span
								key={ticker}
								className="text-xs font-medium px-2.5 py-1 rounded-md bg-white/10 text-white border border-white/10"
							>
								{ticker}
							</span>
						))}
					</div>
				</div>
			)}

			<div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-3 text-xs">
				<span className="text-zinc-400 truncate">
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
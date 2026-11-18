type Props = {
	holdings: Array<{
		Ticker: string
		Percentage: number
		Value: number
	}>
}

export default function PortfolioPieChart({ holdings }: Props) {
	const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"]
	let cumulativePercentage = 0
	const pathData = holdings.map((item, idx) => {
		const startAngle = (cumulativePercentage / 100) * 360
		const endAngle = ((cumulativePercentage + item.Percentage) / 100) * 360
		cumulativePercentage += item.Percentage
		const radius = 100
		const startRad = (startAngle - 90) * (Math.PI / 180)
		const endRad = (endAngle - 90) * (Math.PI / 180)
		const x1 = 150 + radius * Math.cos(startRad)
		const y1 = 150 + radius * Math.sin(startRad)
		const x2 = 150 + radius * Math.cos(endRad)
		const y2 = 150 + radius * Math.sin(endRad)
		const largeArc = item.Percentage > 50 ? 1 : 0
		const path = `M 150 150 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
		return { path, color: colors[idx % colors.length], ...item }
	})

	return (
		<div className="flex flex-col lg:flex-row gap-6 items-center justify-center">
			<svg viewBox="0 0 300 300" className="w-full lg:w-64 h-64">
				{pathData.map((item, idx) => (
					<path key={idx} d={item.path} fill={item.color} stroke="#0f172a" strokeWidth="2" />
				))}
			</svg>
			<div className="w-full space-y-2 lg:w-auto">
				{pathData.map((item, idx) => (
					<div key={idx} className="flex items-center gap-3">
						<div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
						<div className="flex-1">
							<p className="text-sm font-medium text-zinc-950 dark:text-white">{item.Ticker}</p>
							<p className="text-xs text-zinc-500 dark:text-zinc-400">{item.Percentage.toFixed(1)}% • ${item.Value.toFixed(2)}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

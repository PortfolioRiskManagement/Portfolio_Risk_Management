import type { CSSProperties } from "react"
import { useInView } from "./Reveal"
import { useCountUp } from "../hooks/useCountUp"

// Illustrative sample portfolio used only for the marketing preview.
const CHART_VALUES = [42, 48, 45, 53, 51, 58, 55, 62, 60, 57, 66, 64, 71, 69, 76, 74, 82, 80, 88, 92]

const HOLDINGS = [
	{ symbol: "SPY", name: "S&P 500 ETF", weight: 30, color: "bg-blue-500" },
	{ symbol: "AAPL", name: "Apple", weight: 22, color: "bg-indigo-500" },
	{ symbol: "MSFT", name: "Microsoft", weight: 18, color: "bg-violet-500" },
	{ symbol: "BTC", name: "Bitcoin", weight: 12, color: "bg-purple-500" },
]

const METRICS = [
	{ label: "Volatility", value: "14.2%", level: 48, tone: "bg-amber-400" },
	{ label: "Max drawdown", value: "-18.6%", level: 62, tone: "bg-rose-400" },
	{ label: "Diversification", value: "7.4/10", level: 74, tone: "bg-emerald-400" },
]

function buildChartPath(values: number[], width: number, height: number) {
	const max = Math.max(...values)
	const min = Math.min(...values)
	const step = width / (values.length - 1)
	const points = values.map((v, i) => [i * step, height - ((v - min) / (max - min)) * (height - 12) - 6])

	// Smooth curve through the points using horizontal control handles.
	let line = `M ${points[0][0]} ${points[0][1]}`
	for (let i = 1; i < points.length; i++) {
		const [x0, y0] = points[i - 1]
		const [x1, y1] = points[i]
		const cx = (x0 + x1) / 2
		line += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`
	}
	const area = `${line} L ${width} ${height} L 0 ${height} Z`
	return { line, area }
}

const { line, area } = buildChartPath(CHART_VALUES, 520, 150)

export default function ProductPreview() {
	const { ref, inView } = useInView<HTMLDivElement>(0.25)
	const total = useCountUp(128420.55, inView, 1800)

	return (
		<div ref={ref} className={`relative ${inView ? "is-visible" : ""}`}>
			{/* Glow behind the card */}
			<div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-500/25 via-indigo-500/20 to-purple-500/25 blur-2xl" />

			<div className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/90 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90">
				{/* Window chrome */}
				<div className="flex items-center gap-2 border-b border-zinc-200/80 px-5 py-3 dark:border-zinc-800">
					<span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
					<span className="ml-3 text-xs font-medium text-zinc-400">finai / dashboard</span>
				</div>

				<div className="space-y-5 p-5 sm:p-6">
					<div className="flex flex-wrap items-end justify-between gap-3">
						<div>
							<div className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total portfolio</div>
							<div className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
								${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
							</div>
						</div>
						<div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
							<span className="lp-pulse h-1.5 w-1.5 rounded-full bg-emerald-500" />
							+2.4% today
						</div>
					</div>

					<svg viewBox="0 0 520 150" className="h-36 w-full overflow-visible" preserveAspectRatio="none" aria-hidden="true">
						<defs>
							<linearGradient id="lp-line" x1="0" x2="1" y1="0" y2="0">
								<stop offset="0%" stopColor="#3b82f6" />
								<stop offset="55%" stopColor="#6366f1" />
								<stop offset="100%" stopColor="#a855f7" />
							</linearGradient>
							<linearGradient id="lp-area" x1="0" x2="0" y1="0" y2="1">
								<stop offset="0%" stopColor="#6366f1" stopOpacity="0.28" />
								<stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
							</linearGradient>
						</defs>
						<path d={area} fill="url(#lp-area)" className="lp-fade-area" />
						<path d={line} fill="none" stroke="url(#lp-line)" strokeWidth="3" strokeLinecap="round" className="lp-draw" vectorEffect="non-scaling-stroke" />
					</svg>

					<div className="grid grid-cols-3 gap-3">
						{METRICS.map((m, i) => (
							<div key={m.label} className="rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
								<div className="truncate text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{m.label}</div>
								<div className="mt-1 text-base font-semibold tabular-nums text-zinc-900 sm:text-lg dark:text-white">{m.value}</div>
								<div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
									<div
										className={`lp-bar h-full rounded-full ${m.tone}`}
										style={{ "--lp-w": `${m.level}%`, "--lp-delay": `${600 + i * 150}ms` } as CSSProperties}
									/>
								</div>
							</div>
						))}
					</div>

					<div className="space-y-2.5">
						{HOLDINGS.map((h, i) => (
							<div key={h.symbol} className="flex items-center gap-3 text-sm">
								<span className="w-12 font-semibold text-zinc-900 dark:text-white">{h.symbol}</span>
								<span className="hidden w-24 truncate text-zinc-500 sm:inline dark:text-zinc-400">{h.name}</span>
								<div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
									<div
										className={`lp-bar h-full rounded-full ${h.color}`}
										style={{ "--lp-w": `${h.weight * 3}%`, "--lp-delay": `${900 + i * 120}ms` } as CSSProperties}
									/>
								</div>
								<span className="w-10 text-right tabular-nums text-zinc-600 dark:text-zinc-300">{h.weight}%</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Floating insight chips */}
			<div className="lp-float absolute -left-10 top-[58%] hidden rounded-2xl border border-amber-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur md:block dark:border-amber-500/30 dark:bg-zinc-900/95">
				<div className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Concentration alert</div>
				<div className="mt-0.5 text-sm font-medium text-zinc-800 dark:text-zinc-100">Tech is 49% of your portfolio</div>
			</div>
			<div className="lp-float-delayed absolute -bottom-6 -right-4 hidden rounded-2xl border border-indigo-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur md:block dark:border-indigo-500/30 dark:bg-zinc-900/95">
				<div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">Scenario · 2008 crisis</div>
				<div className="mt-0.5 text-sm font-medium text-zinc-800 dark:text-zinc-100">Estimated impact −31.2%</div>
			</div>
		</div>
	)
}

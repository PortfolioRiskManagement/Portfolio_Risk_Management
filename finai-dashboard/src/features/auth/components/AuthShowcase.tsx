import type { CSSProperties } from "react"

const POINTS = [
	"Volatility, drawdown and concentration in plain language",
	"Stress-test your holdings against real market crises",
	"Read-only access: we never move money or place trades",
]

/** Decorative brand panel shown beside the login and sign-up forms on large screens. */
export default function AuthShowcase() {
	return (
		<div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 lg:flex lg:flex-col lg:justify-center lg:px-16">
			<div className="lp-blob -top-24 -left-16 h-80 w-80 bg-white/30" />
			<div className="lp-blob -right-20 -bottom-24 h-96 w-96 bg-fuchsia-300/50" style={{ animationDelay: "-7s" }} />
			<div
				className="absolute inset-0 opacity-20"
				style={{
					backgroundImage:
						"linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)",
					backgroundSize: "48px 48px",
				}}
			/>

			<div className="relative max-w-md">
				<h2 className="lp-enter text-4xl font-semibold leading-tight tracking-tight text-white" style={{ "--lp-delay": "100ms" } as CSSProperties}>
					Invest with clarity, not guesswork.
				</h2>
				<ul className="mt-10 space-y-5">
					{POINTS.map((point, i) => (
						<li key={point} className="lp-enter flex items-start gap-3 text-white/90" style={{ "--lp-delay": `${250 + i * 120}ms` } as CSSProperties}>
							<span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm">✓</span>
							<span className="leading-relaxed">{point}</span>
						</li>
					))}
				</ul>

				<div className="lp-enter lp-float mt-14 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md" style={{ "--lp-delay": "700ms" } as CSSProperties}>
					<div className="flex items-center justify-between text-sm text-white/70">
						<span>Portfolio risk score</span>
						<span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs font-semibold text-emerald-200">Balanced</span>
					</div>
					<div className="mt-2 text-3xl font-semibold text-white">6.2 / 10</div>
					<div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
						<div className="h-full w-[62%] rounded-full bg-gradient-to-r from-emerald-300 via-amber-300 to-rose-300" />
					</div>
				</div>
			</div>
		</div>
	)
}

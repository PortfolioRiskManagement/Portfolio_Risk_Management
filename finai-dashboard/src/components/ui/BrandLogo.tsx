import { Link } from "react-router-dom"

type BrandLogoProps = {
	to?: string
	/** Hide the "Intelligence Overlay" tagline for tight spaces. */
	compact?: boolean
	/** Force white tagline text when placed on a dark gradient. */
	onDark?: boolean
}

/** FIN/AI wordmark matching the sidebar badge, for pages that render outside the app shell. */
export default function BrandLogo({ to = "/", compact = false, onDark = false }: BrandLogoProps) {
	return (
		<Link to={to} className="group inline-flex items-center gap-3" aria-label="FIN/AI home">
			<span className="relative inline-flex items-center justify-center overflow-hidden rounded-lg border border-white/15 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 px-3 py-1.5 shadow-lg shadow-indigo-500/20 transition-transform duration-300 group-hover:-translate-y-0.5">
				<span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
				<span className="relative text-lg font-black leading-none tracking-wide text-white">FIN/AI</span>
			</span>
			{!compact && (
				<span
					className={`hidden text-[10px] font-semibold uppercase tracking-[0.18em] sm:inline ${
						onDark ? "text-white/70" : "text-zinc-500 dark:text-zinc-400"
					}`}
				>
					Intelligence Overlay
				</span>
			)}
		</Link>
	)
}

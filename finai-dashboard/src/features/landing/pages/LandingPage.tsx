import { useEffect, useState, type CSSProperties, type ReactNode } from "react"
import { Link } from "react-router-dom"
import BrandLogo from "../../../components/ui/BrandLogo"
import { useAuth } from "../../../contexts/AuthContext"
import { useTheme } from "../../../hooks/useTheme"
import Reveal, { useInView } from "../components/Reveal"
import ProductPreview from "../components/ProductPreview"
import "../landing.css"

const PROVIDERS = ["Wealthsimple", "Robinhood", "Coinbase", "Binance", "Questrade", "Interactive Brokers", "Kraken", "Fidelity"]

type Feature = { title: string; body: string; icon: ReactNode }

function Icon({ d }: { d: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
			<path d={d} />
		</svg>
	)
}

const FEATURES: Feature[] = [
	{
		title: "Risk metrics that make sense",
		body: "Volatility, drawdown and concentration, each with a plain-language note on what it means for you.",
		icon: <Icon d="M3 3v18h18M7 15l4-4 3 3 5-6" />,
	},
	{
		title: "Scenario Lab",
		body: "Replay 2008, the COVID-19 crash and rate shocks on your actual holdings and watch the impact unfold.",
		icon: <Icon d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3M7 14h10" />,
	},
	{
		title: "AI Advisor",
		body: "Diversification, correlation and clustering analysis, with suggestions you can test before acting.",
		icon: <Icon d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />,
	},
	{
		title: "News that matters to you",
		body: "Alerts filtered to the companies you own, ranked by how much they could move your portfolio.",
		icon: <Icon d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0" />,
	},
	{
		title: "Every account, one view",
		body: "Bring your TFSA, RRSP, brokerage and crypto accounts together to see your true exposure.",
		icon: <Icon d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />,
	},
	{
		title: "Credit card assistant",
		body: "Answer a few questions and get cards matched to how you actually spend.",
		icon: <Icon d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM2 10h20M6 15h4" />,
	},
]

const STEPS = [
	{ title: "Create your account", body: "Sign up with your email in under a minute." },
	{ title: "Connect your accounts", body: "Link your brokerages and exchanges, or add holdings manually." },
	{ title: "Understand your risk", body: "Get clear metrics, stress tests and suggestions tailored to you." },
]

// Illustrative results for a sample 60/40-style portfolio.
const SCENARIOS = [
	{ name: "Dot-com bust (2000–02)", impact: -38.9 },
	{ name: "Global financial crisis (2008)", impact: -31.2 },
	{ name: "COVID-19 crash (2020)", impact: -22.8 },
	{ name: "Rate shock (2022)", impact: -14.5 },
]

const SECURITY = [
	{
		title: "Read-only by design",
		body: "FIN/AI can view balances and positions, but it can never move money or place trades.",
		icon: <Icon d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />,
	},
	{
		title: "Your passwords stay with your broker",
		body: "Accounts are linked through your provider's own secure sign-in. We never see or store your brokerage password.",
		icon: <Icon d="M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4" />,
	},
	{
		title: "Private to you",
		body: "Your data is encrypted in transit and at rest, and database rules make sure only you can access it.",
		icon: <Icon d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6zM9 12l2 2 4-4" />,
	},
]

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
	return (
		<Reveal className="mx-auto max-w-2xl text-center">
			<div className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">{eyebrow}</div>
			<h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">{title}</h2>
			{body && <p className="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">{body}</p>}
		</Reveal>
	)
}

function ScenarioBars() {
	const { ref, inView } = useInView<HTMLDivElement>(0.3)
	const worst = Math.max(...SCENARIOS.map((s) => Math.abs(s.impact)))

	return (
		<div ref={ref} className={`space-y-5 ${inView ? "is-visible" : ""}`}>
			{SCENARIOS.map((s, i) => (
				<div key={s.name}>
					<div className="mb-2 flex items-center justify-between text-sm">
						<span className="font-medium text-zinc-800 dark:text-zinc-200">{s.name}</span>
						<span className="font-semibold tabular-nums text-rose-600 dark:text-rose-400">{s.impact.toFixed(1)}%</span>
					</div>
					<div className="h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
						<div
							className="lp-bar h-full rounded-full bg-gradient-to-r from-rose-400 via-rose-500 to-fuchsia-500"
							style={{ "--lp-w": `${(Math.abs(s.impact) / worst) * 100}%`, "--lp-delay": `${i * 180}ms` } as CSSProperties}
						/>
					</div>
				</div>
			))}
			<p className="pt-1 text-xs text-zinc-500 dark:text-zinc-500">Example results for a sample diversified portfolio.</p>
		</div>
	)
}

export default function LandingPage() {
	const { user } = useAuth()
	const { theme, toggleTheme } = useTheme()
	const [scrolled, setScrolled] = useState(false)

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 12)
		onScroll()
		window.addEventListener("scroll", onScroll, { passive: true })
		return () => window.removeEventListener("scroll", onScroll)
	}, [])

	const primaryCta = user ? { to: "/dashboard", label: "Open dashboard" } : { to: "/signup", label: "Get started" }

	return (
		<div className="min-h-screen overflow-x-hidden bg-white text-zinc-900 dark:bg-[#0b0b0c] dark:text-zinc-100">
			{/* Navigation */}
			<header
				className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
					scrolled ? "border-b border-zinc-200/70 bg-white/80 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-black/70" : "border-b border-transparent"
				}`}
			>
				<nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
					<BrandLogo />
					<div className="hidden items-center gap-8 text-sm font-medium text-zinc-600 md:flex dark:text-zinc-400">
						<a href="#features" className="transition-colors hover:text-zinc-950 dark:hover:text-white">Features</a>
						<a href="#how" className="transition-colors hover:text-zinc-950 dark:hover:text-white">How it works</a>
						<a href="#scenarios" className="transition-colors hover:text-zinc-950 dark:hover:text-white">Scenarios</a>
						<a href="#security" className="transition-colors hover:text-zinc-950 dark:hover:text-white">Security</a>
					</div>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={toggleTheme}
							aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
							className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
						>
							{theme === "dark" ? (
								<Icon d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
							) : (
								<Icon d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
							)}
						</button>
						{!user && (
							<Link to="/login" className="hidden rounded-full px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-950 sm:inline-block dark:text-zinc-300 dark:hover:text-white">
								Log in
							</Link>
						)}
						<Link
							to={primaryCta.to}
							className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
						>
							{primaryCta.label}
						</Link>
					</div>
				</nav>
			</header>

			{/* Hero */}
			<section className="relative isolate pt-32 pb-20 sm:pt-40 sm:pb-28">
				<div className="lp-grid" />
				<div className="lp-blob -top-24 left-[8%] h-80 w-80 bg-blue-400" />
				<div className="lp-blob top-10 right-[6%] h-96 w-96 bg-purple-400" style={{ animationDelay: "-6s" }} />
				<div className="lp-blob top-72 left-[38%] h-72 w-72 bg-indigo-400" style={{ animationDelay: "-11s" }} />

				<div className="relative mx-auto grid max-w-6xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr]">
					<div className="text-center lg:text-left">
						<div
							className="lp-enter inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-600 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300"
							style={{ "--lp-delay": "0ms" } as CSSProperties}
						>
							<span className="lp-pulse h-1.5 w-1.5 rounded-full bg-indigo-500" />
							Portfolio risk, explained in plain language
						</div>
						<h1
							className="lp-enter mt-6 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl dark:text-white"
							style={{ "--lp-delay": "120ms", lineHeight: 1.05 } as CSSProperties}
						>
							See the risk in your portfolio <span className="lp-gradient-text">before the market does.</span>
						</h1>
						<p
							className="lp-enter mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-600 lg:mx-0 dark:text-zinc-400"
							style={{ "--lp-delay": "240ms" } as CSSProperties}
						>
							FIN/AI brings your accounts together, measures volatility, concentration and drawdown, and stress-tests your
							holdings against real market crises, then explains what it all means.
						</p>
						<div
							className="lp-enter mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
							style={{ "--lp-delay": "360ms" } as CSSProperties}
						>
							<Link
								to={primaryCta.to}
								className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/40 sm:w-auto"
							>
								{primaryCta.label}
								<span className="transition-transform group-hover:translate-x-1">→</span>
							</Link>
							<a
								href="#how"
								className="inline-flex w-full items-center justify-center rounded-full border border-zinc-300 bg-white/60 px-7 py-3.5 text-base font-semibold text-zinc-800 backdrop-blur transition-colors hover:border-zinc-400 hover:bg-white sm:w-auto dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
							>
								See how it works
							</a>
						</div>
						<div
							className="lp-enter mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-zinc-500 lg:justify-start dark:text-zinc-500"
							style={{ "--lp-delay": "480ms" } as CSSProperties}
						>
							<span>✓ Read-only access</span>
							<span>✓ We never place trades</span>
							<span>✓ Private by default</span>
						</div>
					</div>

					<div className="lp-enter" style={{ "--lp-delay": "300ms" } as CSSProperties}>
						<ProductPreview />
					</div>
				</div>
			</section>

			{/* Providers strip */}
			<section className="border-y border-zinc-200/70 bg-zinc-50/60 py-10 dark:border-zinc-800/70 dark:bg-zinc-950/40">
				<p className="text-center text-sm font-medium text-zinc-500 dark:text-zinc-400">Designed for the accounts you already use</p>
				<div className="lp-marquee mt-6 overflow-hidden">
					<div className="lp-marquee-track">
						{[...PROVIDERS, ...PROVIDERS].map((p, i) => (
							<span key={`${p}-${i}`} className="mx-8 whitespace-nowrap text-xl font-semibold tracking-tight text-zinc-400 transition-colors hover:text-zinc-700 dark:text-zinc-600 dark:hover:text-zinc-300">
								{p}
							</span>
						))}
					</div>
				</div>
			</section>

			{/* Features */}
			<section id="features" className="scroll-mt-20 py-24 sm:py-32">
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<SectionHeading
						eyebrow="Features"
						title="Everything you need to understand your risk"
						body="Most apps show you numbers. FIN/AI tells you what they mean and what could happen next."
					/>
					<div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{FEATURES.map((f, i) => (
							<Reveal key={f.title} delay={(i % 3) * 110}>
								<div className="lp-lift h-full rounded-3xl border border-zinc-200 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700">
									<div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 via-indigo-500/15 to-purple-500/15 text-indigo-600 ring-1 ring-indigo-500/20 dark:text-indigo-300">
										{f.icon}
									</div>
									<h3 className="mt-5 text-lg font-semibold text-zinc-950 dark:text-white">{f.title}</h3>
									<p className="mt-2 leading-relaxed text-zinc-600 dark:text-zinc-400">{f.body}</p>
								</div>
							</Reveal>
						))}
					</div>
				</div>
			</section>

			{/* How it works */}
			<section id="how" className="scroll-mt-20 bg-zinc-50/70 py-24 sm:py-32 dark:bg-zinc-950/50">
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<SectionHeading eyebrow="How it works" title="From sign-up to insight in three steps" />
					<div className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-6">
						<div className="absolute top-7 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-blue-500/0 via-indigo-500/50 to-purple-500/0 md:block" />
						{STEPS.map((s, i) => (
							<Reveal key={s.title} delay={i * 160} className="relative text-center">
								<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-lg font-bold text-white shadow-lg shadow-indigo-500/30">
									{i + 1}
								</div>
								<h3 className="mt-6 text-lg font-semibold text-zinc-950 dark:text-white">{s.title}</h3>
								<p className="mx-auto mt-2 max-w-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{s.body}</p>
							</Reveal>
						))}
					</div>
				</div>
			</section>

			{/* Scenario spotlight */}
			<section id="scenarios" className="scroll-mt-20 py-24 sm:py-32">
				<div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
					<Reveal>
						<div className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">Scenario Lab</div>
						<h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
							What if 2008 happened tomorrow?
						</h2>
						<p className="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
							Run your real holdings through history's biggest market shocks. See how deep the drop could go, which positions
							hurt most, and how long a recovery might take, before it ever happens.
						</p>
						<Link
							to={primaryCta.to}
							className="mt-8 inline-flex items-center gap-2 font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
						>
							Stress-test your portfolio <span aria-hidden="true">→</span>
						</Link>
					</Reveal>
					<Reveal delay={150}>
						<div className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-xl shadow-zinc-200/50 sm:p-9 dark:border-zinc-800 dark:bg-zinc-900/60 dark:shadow-none">
							<ScenarioBars />
						</div>
					</Reveal>
				</div>
			</section>

			{/* Security */}
			<section id="security" className="scroll-mt-20 bg-zinc-50/70 py-24 sm:py-32 dark:bg-zinc-950/50">
				<div className="mx-auto max-w-6xl px-4 sm:px-6">
					<SectionHeading eyebrow="Security" title="Built to protect what matters" body="Your financial data is personal. We treat it that way." />
					<div className="mt-16 grid gap-5 md:grid-cols-3">
						{SECURITY.map((s, i) => (
							<Reveal key={s.title} delay={i * 110}>
								<div className="h-full rounded-3xl border border-zinc-200 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-900/50">
									<div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400">
										{s.icon}
									</div>
									<h3 className="mt-5 text-lg font-semibold text-zinc-950 dark:text-white">{s.title}</h3>
									<p className="mt-2 leading-relaxed text-zinc-600 dark:text-zinc-400">{s.body}</p>
								</div>
							</Reveal>
						))}
					</div>
				</div>
			</section>

			{/* Final call to action */}
			<section className="px-4 py-24 sm:px-6 sm:py-32">
				<Reveal className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-6 py-16 text-center shadow-2xl shadow-indigo-500/30 sm:px-16">
					<div className="lp-blob -top-20 -left-10 h-64 w-64 bg-white/40" />
					<div className="lp-blob -right-10 -bottom-24 h-72 w-72 bg-fuchsia-300/60" style={{ animationDelay: "-8s" }} />
					<h2 className="relative text-3xl font-semibold tracking-tight text-white sm:text-4xl">Know your risk. Invest with confidence.</h2>
					<p className="relative mx-auto mt-4 max-w-xl text-lg text-white/80">
						Create your account and see your portfolio the way a risk analyst would.
					</p>
					<Link
						to={primaryCta.to}
						className="relative mt-9 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-indigo-700 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
					>
						{primaryCta.label} <span aria-hidden="true">→</span>
					</Link>
				</Reveal>
			</section>

			{/* Footer */}
			<footer className="border-t border-zinc-200 py-12 dark:border-zinc-800">
				<div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 md:flex-row md:items-start md:justify-between">
					<div className="max-w-md">
						<BrandLogo />
						<p className="mt-4 text-sm leading-relaxed text-zinc-500 dark:text-zinc-500">
							FIN/AI provides educational portfolio analysis only and is not financial advice. FIN/AI does not execute trades.
						</p>
					</div>
					<div className="flex gap-8 text-sm text-zinc-600 dark:text-zinc-400">
						<a href="#features" className="hover:text-zinc-950 dark:hover:text-white">Features</a>
						<a href="#security" className="hover:text-zinc-950 dark:hover:text-white">Security</a>
						<Link to="/login" className="hover:text-zinc-950 dark:hover:text-white">Log in</Link>
					</div>
				</div>
				<div className="mx-auto mt-10 max-w-6xl px-4 text-xs text-zinc-400 sm:px-6 dark:text-zinc-600">© {new Date().getFullYear()} FIN/AI. All rights reserved.</div>
			</footer>
		</div>
	)
}

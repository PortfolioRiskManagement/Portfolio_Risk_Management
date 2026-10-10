import { Link, NavLink } from "react-router-dom"
import Icon, { type IconName } from "../ui/Icon"

interface SidebarProps {
	isCollapsed: boolean
	onToggle: () => void
	/** Drawer state on small screens, where the sidebar slides over the page. */
	isMobileOpen: boolean
	onMobileClose: () => void
}

type NavItem = { to: string; label: string; icon: IconName; end?: boolean }

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
	{
		label: "Overview",
		items: [
			{ to: "/dashboard", label: "Dashboard", icon: "dashboard", end: true },
			{ to: "/portfolio", label: "Portfolio", icon: "portfolio" },
			{ to: "/assets", label: "Assets", icon: "assets" },
		],
	},
	{
		label: "Insights",
		items: [
			{ to: "/advisor", label: "AI Advisor", icon: "advisor" },
			{ to: "/scenario", label: "Scenario Lab", icon: "scenario" },
			{ to: "/news", label: "News & Impact", icon: "news" },
			{ to: "/alerts", label: "Alerts", icon: "bell" },
		],
	},
	{
		label: "Tools",
		items: [
			{ to: "/creditcard", label: "Credit Cards", icon: "card" },
			{ to: "/connections", label: "Connections", icon: "link" },
			{ to: "/settings", label: "Settings", icon: "settings" },
		],
	},
]

function navItemClassName(isActive: boolean, isCollapsed: boolean) {
	return `group relative flex items-center gap-3 rounded-xl py-2 text-sm transition-colors ${
		isCollapsed ? "justify-center px-0" : "px-3"
	} ${
		isActive
			? "bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 font-semibold text-indigo-700 dark:from-blue-500/15 dark:via-indigo-500/15 dark:to-purple-500/15 dark:text-white"
			: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
	}`
}

export default function Sidebar({ isCollapsed, onToggle, isMobileOpen, onMobileClose }: SidebarProps) {
	// The drawer always shows labels; collapsing only applies on large screens.
	const collapsed = isCollapsed && !isMobileOpen

	return (
		<>
			{isMobileOpen && (
				<div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden" onClick={onMobileClose} aria-hidden="true" />
			)}

			<aside
				className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-zinc-200/80 bg-white/95 backdrop-blur-xl transition-all duration-300 dark:border-white/[0.06] dark:bg-zinc-950/95 ${
					collapsed ? "w-[72px]" : "w-64"
				} ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
			>
				<button
					onClick={onToggle}
					className="absolute right-0 top-[30px] z-50 hidden h-6 w-6 translate-x-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm transition-colors hover:text-zinc-900 lg:flex dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white"
					title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
					aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
					type="button"
				>
					<Icon name="chevronLeft" className={`h-3.5 w-3.5 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
				</button>

				{/* Brand */}
				<div className={`flex h-[76px] shrink-0 items-center ${collapsed ? "justify-center px-2" : "justify-between px-5"}`}>
					<Link to="/dashboard" onClick={onMobileClose} className="group inline-flex items-center gap-3" aria-label="FIN/AI dashboard">
						<span className="relative inline-flex items-center justify-center overflow-hidden rounded-lg border border-white/15 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 px-2.5 py-1.5 shadow-lg shadow-indigo-500/20 transition-transform duration-300 group-hover:-translate-y-0.5">
							<span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
							<span className="relative text-base font-black leading-none tracking-wide text-white">{collapsed ? "F/A" : "FIN/AI"}</span>
						</span>
						{!collapsed && (
							<span className="text-[10px] font-semibold uppercase leading-tight tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
								Intelligence
								<br />
								Overlay
							</span>
						)}
					</Link>
					{isMobileOpen && (
						<button
							type="button"
							onClick={onMobileClose}
							className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 lg:hidden dark:text-zinc-400 dark:hover:bg-white/5"
							aria-label="Close menu"
						>
							<Icon name="close" className="h-5 w-5" />
						</button>
					)}
				</div>

				{/* Navigation */}
				<nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6 pt-2">
					{NAV_GROUPS.map((group) => (
						<div key={group.label}>
							{collapsed ? (
								<div className="mx-auto mb-2 h-px w-6 bg-zinc-200 dark:bg-white/10" />
							) : (
								<div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
									{group.label}
								</div>
							)}
							<div className="space-y-0.5">
								{group.items.map((item) => (
									<NavLink
										key={item.to}
										to={item.to}
										end={item.end}
										title={item.label}
										onClick={onMobileClose}
										className={({ isActive }) => navItemClassName(isActive, collapsed)}
									>
										{({ isActive }) => (
											<>
												{isActive && (
													<span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-blue-500 to-purple-500" />
												)}
												<Icon
													name={item.icon}
													className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-indigo-600 dark:text-indigo-300" : ""}`}
												/>
												{!collapsed && <span className="truncate">{item.label}</span>}
											</>
										)}
									</NavLink>
								))}
							</div>
						</div>
					))}
				</nav>

				{/* Trust note */}
				{!collapsed && (
					<div className="m-3 rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-blue-500/[0.06] via-indigo-500/[0.06] to-purple-500/[0.08] p-4 dark:border-white/[0.06]">
						<div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
							<Icon name="shield" className="h-4 w-4 text-indigo-500" />
							Read-only access
						</div>
						<p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
							FIN/AI can never move money or place trades.
						</p>
					</div>
				)}
			</aside>
		</>
	)
}

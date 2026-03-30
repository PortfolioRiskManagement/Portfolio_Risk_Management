import { NavLink } from "react-router-dom"
import { useLoading } from "../../contexts/LoadingContext"

interface SidebarProps {
	isCollapsed: boolean
	onToggle: () => void
}

function navItemClassName(isActive: boolean) {
	return `block rounded-lg px-3 py-2 transition-colors ${
		isActive
			? "bg-zinc-900 text-white font-medium dark:bg-zinc-800 dark:text-white"
			: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
	}`
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
	const { triggerLoading } = useLoading()

	const handleLogoClick = () => {
		triggerLoading()
	}

	return (
		<aside
			className={`fixed left-0 top-0 z-30 h-screen overflow-visible border-r border-zinc-200 bg-white text-zinc-900 transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white ${
				isCollapsed ? "w-16" : "w-64"
			}`}
		>
			<button
				onClick={onToggle}
				className="absolute right-0 top-1/2 z-[60] flex h-7 w-7 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-700 shadow-xl transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
				title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
				type="button"
			>
				<svg
					className={`h-3.5 w-3.5 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
				</svg>
			</button>

			<div className={isCollapsed ? "px-2 pb-4 pt-14" : "p-6"}>
				<style>{`
					.logo-wrap {
						display: inline-flex;
						flex-direction: column;
						align-items: center;
						gap: 4px;
						cursor: pointer;
					}

					.logo-badge {
						background: linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #a855f7 100%);
						border-radius: 8px;
						padding: 5px 12px;
						transition: all 0.3s ease;
						position: relative;
						overflow: hidden;
						display: inline-flex;
						align-items: center;
						justify-content: center;
						box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.12);
						border: 1px solid rgba(255, 255, 255, 0.12);
					}

					.logo-badge::before {
						content: '';
						position: absolute;
						top: 0;
						left: 0;
						right: 0;
						height: 50%;
						background: linear-gradient(180deg, rgba(255, 255, 255, 0.2), transparent);
						border-radius: 12px 12px 0 0;
					}

					.logo-badge:hover {
						box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.12);
						transform: translateY(-1px) scale(1.01);
					}

					.logo-text {
						font-size: 22px;
						font-weight: 900;
						color: white;
						text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
						position: relative;
						z-index: 1;
						letter-spacing: 0.8px;
						line-height: 1;
					}

					.logo-subtitle {
						font-size: 9px;
						text-transform: uppercase;
						background: linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #a855f7 100%);
						-webkit-background-clip: text;
						background-clip: text;
						-webkit-text-fill-color: transparent;
						letter-spacing: 1px;
						position: relative;
						z-index: 1;
						font-weight: 600;
					}
				`}</style>

				{!isCollapsed ? (
					<div className="mb-8">
						<button
							onClick={handleLogoClick}
							className="logo-wrap"
							title="Click to reload"
							type="button"
						>
							<span className="logo-badge">
								<span className="logo-text">FIN/AI</span>
							</span>
							<span className="logo-subtitle">Intelligence Overlay</span>
						</button>
					</div>
				) : (
					<div className="mb-6 flex justify-center">
						<button
							onClick={handleLogoClick}
							className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-bold text-white"
							title="Reload"
							type="button"
						>
							FA
						</button>
					</div>
				)}

				<nav className="space-y-1">
					<NavLink to="/" className={({ isActive }) => navItemClassName(isActive)} end title="Dashboard">
						<span className="flex items-center gap-2">
							<span>📊</span>
							{!isCollapsed && <span>Dashboard</span>}
						</span>
					</NavLink>
					<NavLink to="/portfolio" className={({ isActive }) => navItemClassName(isActive)} title="Portfolio">
						<span className="flex items-center gap-2">
							<span>💼</span>
							{!isCollapsed && <span>Portfolio</span>}
						</span>
					</NavLink>
					<NavLink to="/assets" className={({ isActive }) => navItemClassName(isActive)} title="Assets">
						<span className="flex items-center gap-2">
							<span>📈</span>
							{!isCollapsed && <span>Assets</span>}
						</span>
					</NavLink>
					<NavLink to="/advisor" className={({ isActive }) => navItemClassName(isActive)} title="AI Advisor">
						<span className="flex items-center gap-2">
							<span>🤖</span>
							{!isCollapsed && <span>AI Advisor</span>}
						</span>
					</NavLink>
					<NavLink to="/news" className={({ isActive }) => navItemClassName(isActive)} title="News & Impact">
						<span className="flex items-center gap-2">
							<span>📰</span>
							{!isCollapsed && <span>News & Impact</span>}
						</span>
					</NavLink>
					<NavLink to="/scenario" className={({ isActive }) => navItemClassName(isActive)} title="Scenario Lab">
						<span className="flex items-center gap-2">
							<span>🧪</span>
							{!isCollapsed && <span>Scenario Lab</span>}
						</span>
					</NavLink>
					<NavLink to="/creditcard" className={({ isActive }) => navItemClassName(isActive)} title="Credit Card Assistant">
						<span className="flex items-center gap-2">
							<span>💳</span>
							{!isCollapsed && <span>Credit Cards</span>}
						</span>
					</NavLink>
					<NavLink to="/alerts" className={({ isActive }) => navItemClassName(isActive)} title="Alerts">
						<span className="flex items-center gap-2">
							<span>🔔</span>
							{!isCollapsed && <span>Alerts</span>}
						</span>
					</NavLink>
					<NavLink to="/connections" className={({ isActive }) => navItemClassName(isActive)} title="Connections">
						<span className="flex items-center gap-2">
							<span>🔗</span>
							{!isCollapsed && <span>Connections</span>}
						</span>
					</NavLink>
					<NavLink to="/settings" className={({ isActive }) => navItemClassName(isActive)} title="Settings">
						<span className="flex items-center gap-2">
							<span>⚙️</span>
							{!isCollapsed && <span>Settings</span>}
						</span>
					</NavLink>
				</nav>
			</div>
		</aside>
	)
}

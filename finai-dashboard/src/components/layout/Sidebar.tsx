import { NavLink } from "react-router-dom"
import { useLoading } from "../../contexts/LoadingContext"
import { useState } from "react"

export default function Sidebar() {
	const { triggerLoading } = useLoading()
	const [isCollapsed, setIsCollapsed] = useState(false)

	const handleLogoClick = () => {
		triggerLoading()
	}

	return (
		<aside 
			className={`bg-zinc-900 border-r border-zinc-800 text-white transition-all duration-300 relative overflow-x-hidden ${
				isCollapsed ? 'w-16' : 'w-64'
			}`}
		>
			{/* Toggle Button */}
			<button
				onClick={() => setIsCollapsed(!isCollapsed)}
				className="absolute -right-3 top-6 z-50 w-6 h-6 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors shadow-lg"
				title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
			>
				<svg 
					className={`w-3 h-3 text-white transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
					fill="none" 
					viewBox="0 0 24 24" 
					stroke="currentColor"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
				</svg>
			</button>

			<div className={`${isCollapsed ? 'px-2 pt-14 pb-4' : 'p-6'}`}>
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
					box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
					border: 1px solid rgba(255, 255, 255, 0.1);
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
					box-shadow: 0 6px 16px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
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
						className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-bold"
						title="Reload"
					>
						FA
					</button>
				</div>
			)}
			<nav className="space-y-1 text-zinc-400">
				<NavLink
					to="/"
					className={({ isActive }) =>
						`block py-2 px-3 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors ${
							isActive ? "bg-zinc-800 text-white font-medium" : ""
						}`
					}
					end
					title="Dashboard"
				>
					<span className="flex items-center gap-2">
						<span>📊</span>
						{!isCollapsed && <span>Dashboard</span>}
					</span>
				</NavLink>
				<NavLink
					to="/portfolio"
					className={({ isActive }) =>
						`block py-2 px-3 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors ${
							isActive ? "bg-zinc-800 text-white font-medium" : ""
						}`
					}
					title="Portfolio"
				>
					<span className="flex items-center gap-2">
						<span>💼</span>
						{!isCollapsed && <span>Portfolio</span>}
					</span>
				</NavLink>
				<NavLink
					to="/assets"
					className={({ isActive }) =>
						`block py-2 px-3 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors ${
							isActive ? "bg-zinc-800 text-white font-medium" : ""
						}`
					}
					title="Assets"
				>
					<span className="flex items-center gap-2">
						<span>📈</span>
						{!isCollapsed && <span>Assets</span>}
					</span>
				</NavLink>
				<NavLink
					to="/advisor"
					className={({ isActive }) =>
						`block py-2 px-3 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors ${
							isActive ? "bg-zinc-800 text-white font-medium" : ""
						}`
					}
					title="AI Advisor"
				>
					<span className="flex items-center gap-2">
						<span>🤖</span>
						{!isCollapsed && <span>AI Advisor</span>}
					</span>
				</NavLink>
				<NavLink
					to="/news"
					className={({ isActive }) =>
						`block py-2 px-3 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors ${
							isActive ? "bg-zinc-800 text-white font-medium" : ""
						}`
					}
					title="News & Impact"
				>
					<span className="flex items-center gap-2">
						<span>📰</span>
						{!isCollapsed && <span>News & Impact</span>}
					</span>
				</NavLink>
				<NavLink
					to="/scenario"
					className={({ isActive }) =>
						`block py-2 px-3 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors ${
							isActive ? "bg-zinc-800 text-white font-medium" : ""
						}`
					}
					title="Scenario Lab"
				>
					<span className="flex items-center gap-2">
						<span>🧪</span>
						{!isCollapsed && <span>Scenario Lab</span>}
					</span>
				</NavLink>
				<NavLink
					to="/alerts"
					className={({ isActive }) =>
						`block py-2 px-3 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors ${
							isActive ? "bg-zinc-800 text-white font-medium" : ""
						}`
					}
					title="Alerts"
				>
					<span className="flex items-center gap-2">
						<span>🔔</span>
						{!isCollapsed && <span>Alerts</span>}
					</span>
				</NavLink>
				<NavLink
					to="/connections"
					className={({ isActive }) =>
						`block py-2 px-3 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors ${
							isActive ? "bg-zinc-800 text-white font-medium" : ""
						}`
					}
					title="Connections"
				>
					<span className="flex items-center gap-2">
						<span>🔗</span>
						{!isCollapsed && <span>Connections</span>}
					</span>
				</NavLink>
				<NavLink
					to="/settings"
					className={({ isActive }) =>
						`block py-2 px-3 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors ${
							isActive ? "bg-zinc-800 text-white font-medium" : ""
						}`
					}
					title="Settings"
				>
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
import { NavLink } from "react-router-dom"
import { useLoading } from "../../contexts/LoadingContext"

export default function Sidebar() {
	const { triggerLoading } = useLoading()

	const handleLogoClick = () => {
		triggerLoading()
	}

	return (
		<aside className="w-64 bg-zinc-900 border-r border-zinc-800 text-white p-6">
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
			<nav className="space-y-1 text-zinc-400">
				<NavLink
					to="/"
					className={({ isActive }) =>
						`block py-2 px-3 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors ${
							isActive ? "bg-zinc-800 text-white font-medium" : ""
						}`
					}
					end
				>
					📊 Dashboard
				</NavLink>
				<NavLink
					to="/portfolio"
					className={({ isActive }) =>
						`block py-2 px-3 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors ${
							isActive ? "bg-zinc-800 text-white font-medium" : ""
						}`
					}
				>
					💼 Portfolio
				</NavLink>
				<NavLink
					to="/assets"
					className={({ isActive }) =>
						`block py-2 px-3 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors ${
							isActive ? "bg-zinc-800 text-white font-medium" : ""
						}`
					}
				>
					📈 Assets
				</NavLink>
				<NavLink
					to="/advisor"
					className={({ isActive }) =>
						`block py-2 px-3 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors ${
							isActive ? "bg-zinc-800 text-white font-medium" : ""
						}`
					}
				>
					🤖 AI Advisor
				</NavLink>
				<NavLink
					to="/news"
					className={({ isActive }) =>
						`block py-2 px-3 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors ${
							isActive ? "bg-zinc-800 text-white font-medium" : ""
						}`
					}
				>
					📰 News & Impact
				</NavLink>
				<NavLink
					to="/scenario"
					className={({ isActive }) =>
						`block py-2 px-3 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors ${
							isActive ? "bg-zinc-800 text-white font-medium" : ""
						}`
					}
				>
					🧪 Scenario Lab
				</NavLink>
				<NavLink
					to="/alerts"
					className={({ isActive }) =>
						`block py-2 px-3 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors ${
							isActive ? "bg-zinc-800 text-white font-medium" : ""
						}`
					}
				>
					🔔 Alerts
				</NavLink>
				<NavLink
					to="/connections"
					className={({ isActive }) =>
						`block py-2 px-3 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors ${
							isActive ? "bg-zinc-800 text-white font-medium" : ""
						}`
					}
				>
					🔗 Connections
				</NavLink>
				<NavLink
					to="/settings"
					className={({ isActive }) =>
						`block py-2 px-3 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors ${
							isActive ? "bg-zinc-800 text-white font-medium" : ""
						}`
					}
				>
					⚙️ Settings
				</NavLink>
			</nav>
		</aside>
	)
}
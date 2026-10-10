import type { ReactNode } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import ConnectionsPage from "../features/connections/pages/ConnectionsPage"
import DashboardPage from "../features/dashboard/pages/DashboardPage"
import PortfolioPage from "../features/portfolio/pages/PortfolioPage"
import AddStockPage from "../features/portfolio/pages/AddStockPage"
import AssetDetailsPage from "../features/portfolio/pages/AssetDetailsPage"
import PortfolioAccountsPage from "../features/portfolio/pages/PortfolioAccountsPage"
import RiskDetailsPage from "../features/risk/pages/RiskDetailsPage"
import PageShell from "../components/layout/PageShell"
import AdvisorPage from "../features/advisor/pages/AdvisorPage"
import AlertsPage from "../features/alerts/pages/AlertsPage"
import ScenarioLabPage from "../features/scenario/pages/ScenarioLabPage"
import CreditCardPage from "../features/creditcard/pages/CreditCardPage"
import LandingPage from "../features/landing/pages/LandingPage"
import AuthPage from "../features/auth/pages/AuthPage"
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage"
import ProtectedRoute from "../components/auth/ProtectedRoute"

type StubProps = {
	title: string
	subtitle: string
}

function StubPage({ title, subtitle }: StubProps) {
	return (
		<PageShell title={title}>
			<div className="text-zinc-400">{subtitle}</div>
		</PageShell>
	)
}

function guard(element: ReactNode) {
	return <ProtectedRoute>{element}</ProtectedRoute>
}

export default function AppRoutes() {
	return (
		<Routes>
			{/* Public pages */}
			<Route path="/" element={<LandingPage />} />
			<Route path="/login" element={<AuthPage key="login" initialMode="login" />} />
			<Route path="/signup" element={<AuthPage key="signup" initialMode="signup" />} />
			<Route path="/reset-password" element={<ResetPasswordPage />} />

			{/* Signed-in pages */}
			<Route path="/dashboard" element={guard(<DashboardPage />)} />
			<Route path="/portfolio" element={guard(<PortfolioAccountsPage />)} />
			<Route path="/assets" element={guard(<PortfolioPage />)} />
			<Route path="/portfolio/add" element={guard(<AddStockPage />)} />
			<Route path="/portfolio/:id" element={guard(<AssetDetailsPage />)} />
			<Route path="/assets/:id" element={guard(<AssetDetailsPage />)} />
			<Route path="/risk" element={guard(<RiskDetailsPage />)} />
			<Route path="/advisor" element={guard(<AdvisorPage />)} />
			<Route
				path="/news"
				element={guard(<StubPage
						title="News & Impact"
						subtitle="Market news and impact summaries will appear here."
					/>)}
			/>
			<Route
				path="/scenario"
				element={guard(<ScenarioLabPage />)}
			/>
			<Route
				path="/creditcard"
				element={guard(<CreditCardPage />)}
			/>
			<Route
				path="/alerts"
				element={guard(<PageShell title="My News">
						<AlertsPage
							portfolioTickers={["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA", "META", "GLD"]}
							portfolioHoldings={[
								{ ticker: "AAPL", shares: 100, value: 18000, percentageOfPortfolio: 15 },
								{ ticker: "MSFT", shares: 50, value: 20000, percentageOfPortfolio: 17 },
								{ ticker: "GOOGL", shares: 30, value: 8000, percentageOfPortfolio: 7 },
								{ ticker: "TSLA", shares: 25, value: 5000, percentageOfPortfolio: 4 },
								{ ticker: "NVDA", shares: 20, value: 6000, percentageOfPortfolio: 5 },
								{ ticker: "META", shares: 15, value: 3000, percentageOfPortfolio: 2 },
								{ ticker: "GLD", shares: 10, value: 2200, percentageOfPortfolio: 3, companyName: "SPDR Gold Shares", sector: "Commodities" },
							]}
						/>
					</PageShell>)}
			/>
			<Route path="/connections" element={guard(<ConnectionsPage />)} />
			<Route
				path="/settings"
				element={guard(<StubPage
						title="Settings"
						subtitle="Preferences and configuration will appear here."
					/>)}
			/>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	)
}

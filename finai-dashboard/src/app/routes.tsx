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
import NewsPage from "../features/alerts/pages/NewsPage"
import ScenarioLabPage from "../features/scenario/pages/ScenarioLabPage"
import CreditCardPage from "../features/creditcard/pages/CreditCardPage"
import SettingsPage from "../features/settings/pages/SettingsPage"
import LandingPage from "../features/landing/pages/LandingPage"
import AuthPage from "../features/auth/pages/AuthPage"
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage"
import ProtectedRoute from "../components/auth/ProtectedRoute"

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
			<Route path="/news" element={guard(<PageShell title="News & Impact"><NewsPage /></PageShell>)} />
			<Route
				path="/scenario"
				element={guard(<ScenarioLabPage />)}
			/>
			<Route
				path="/creditcard"
				element={guard(<CreditCardPage />)}
			/>
			<Route path="/alerts" element={guard(<PageShell title="Alerts"><AlertsPage /></PageShell>)} />
			<Route path="/connections" element={guard(<ConnectionsPage />)} />
			<Route path="/settings" element={guard(<SettingsPage />)} />
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	)
}

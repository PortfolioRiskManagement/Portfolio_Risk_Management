import { Routes, Route } from "react-router-dom"
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

export default function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<DashboardPage />} />
			<Route path="/portfolio" element={<PortfolioAccountsPage />} />
			<Route path="/assets" element={<PortfolioPage />} />
			<Route path="/portfolio/add" element={<AddStockPage />} />
			<Route path="/portfolio/:id" element={<AssetDetailsPage />} />
			<Route path="/assets/:id" element={<AssetDetailsPage />} />
			<Route path="/risk" element={<RiskDetailsPage />} />
			<Route path="/advisor" element={<AdvisorPage />} />
			<Route
				path="/news"
				element={
					<StubPage
						title="News & Impact"
						subtitle="Market news and impact summaries will appear here."
					/>
				}
			/>
			<Route
				path="/scenario"
				element={<ScenarioLabPage />}
			/>
			<Route
				path="/creditcard"
				element={<CreditCardPage />}
			/>
			<Route
				path="/alerts"
				element={
					<PageShell title="My News">
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
					</PageShell>
				}
			/>
			<Route
				path="/connections"
				element={
					<StubPage
						title="Connections"
						subtitle="Connect your brokerages and accounts here."
					/>
				}
			/>
			<Route
				path="/settings"
				element={
					<StubPage
						title="Settings"
						subtitle="Preferences and configuration will appear here."
					/>
				}
			/>
		</Routes>
	)
}

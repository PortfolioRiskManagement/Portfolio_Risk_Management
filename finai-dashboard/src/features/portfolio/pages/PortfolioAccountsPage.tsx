import PageShell from "../../../components/layout/PageShell"
import { usePortfolio } from "../hooks/usePortfolio"
import PortfolioProfile from "../components/PortfolioProfile"
import PortfolioStructureCharts from "../components/PortfolioStructureCharts"
import AccountCard from "../components/AccountCard"
import Card from "../../../components/ui/Card"
import { formatCurrency } from "../../../utils/formatCurrency"

export default function PortfolioAccountsPage() {
  const {
    accounts,
    profile,
    summary,
    isLoading,
    updateProfile,
  } = usePortfolio()

  if (isLoading) {
    return (
      <PageShell title="Portfolio">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-zinc-400">Loading portfolio intelligence...</div>
          </div>
        </div>
      </PageShell>
    )
  }

  if (!summary) {
    return (
      <PageShell title="Portfolio">
        <div className="text-zinc-400">Unable to load portfolio data</div>
      </PageShell>
    )
  }

  return (
    <PageShell title="">
      <div className="space-y-8">
        {/* 1. ACCOUNTS SECTION - HERO */}
        <div>
          {/* Header with Quick Stats */}
          <div className="mb-6">
            <div className="flex items-end justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Your Accounts</h1>
                <p className="text-zinc-400">Manage and monitor your investment accounts</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-zinc-400 mb-1">Total Portfolio</div>
                <div className="text-3xl font-bold text-white">{formatCurrency(summary.totalValue)}</div>
                <div className={`text-sm font-medium ${summary.totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {summary.totalGain >= 0 ? '+' : ''}{formatCurrency(summary.totalGain)}
                </div>
              </div>
            </div>
          </div>

          {/* Account Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        </div>

        {/* 2. PORTFOLIO STRUCTURE & ANALYTICS */}
        <PortfolioStructureCharts accounts={accounts} />

        {/* 3. PROFILE SECTION */}
        <PortfolioProfile profile={profile} onUpdate={updateProfile} />
      </div>
    </PageShell>
  )
}

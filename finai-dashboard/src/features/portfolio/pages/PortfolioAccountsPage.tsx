import PageShell from "../../../components/layout/PageShell"
import { usePortfolio } from "../hooks/usePortfolio"
import PortfolioProfile from "../components/PortfolioProfile"
import PortfolioStructureCharts from "../components/PortfolioStructureCharts"
import AccountCard from "../components/AccountCard"
import { formatCurrency } from "../../../utils/formatCurrency"
import { useSnapTradePortfolio } from "../hooks/useSnapTradePortfolio"
import type { Account } from "../types/portfolio.types"

export default function PortfolioAccountsPage() {
  const { data: snapTradePortfolio } = useSnapTradePortfolio()
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
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
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

  const liveAccounts: Account[] = snapTradePortfolio?.accounts.map((account, index) => ({
    id: account.id,
    type: account.type,
    name: account.name,
    balance: account.balance,
    gain: 0,
    gainPercent: 0,
    contributionRoom: 0,
    contributionUsed: 0,
    contributionLimit: 0,
    purpose: account.type === "PERSONAL" ? "Non-registered investment account" : "Registered investment account",
    taxBenefit: account.type === "PERSONAL"
      ? "Capital gains are taxable. Dividends receive favorable tax treatment."
      : "Tax treatment is determined by the account category.",
    status: "normal",
    priority: index + 1,
  })) ?? []

  const displayedAccounts = liveAccounts.length > 0 ? liveAccounts : accounts
  const displayedTotal = liveAccounts.length > 0
    ? snapTradePortfolio?.accountValueCad ?? 0
    : summary.totalValue

  return (
    <PageShell title="Portfolio" subtitle="Your registered and personal accounts">
      <div className="space-y-10">
        <section>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">Your accounts</h2>
              <p className="mt-1 text-zinc-500 dark:text-zinc-400">Balances, contribution room and tax treatment in one place.</p>
            </div>
            <div className="rounded-2xl border border-zinc-200/80 bg-white/80 px-5 py-3 sm:text-right dark:border-white/[0.07] dark:bg-zinc-900/50">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">Total portfolio</div>
              <div className="flex items-baseline gap-2 sm:justify-end">
                <span className="text-2xl font-bold tracking-tight tabular-nums text-zinc-950 dark:text-white">{formatCurrency(displayedTotal)}</span>
                <span className={`text-sm font-semibold tabular-nums ${summary.totalGain >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {summary.totalGain >= 0 ? '+' : ''}{formatCurrency(summary.totalGain)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {displayedAccounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        </section>

        <PortfolioStructureCharts accounts={accounts} />

        <PortfolioProfile profile={profile} onUpdate={updateProfile} />
      </div>
    </PageShell>
  )
}

import PageShell from "../../../components/layout/PageShell"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useHoldings } from "../hooks/useHoldings"
import { useLivePrice } from "../hooks/useLivePrice"
import scenarioService from "../../scenario/services/scenarioService"
import type { AssetSearchResult } from "../../scenario/types/scenario.types"
import type { AccountType } from "../types/portfolio.types"
import { ACCOUNT_OPTIONS } from "../utils/accounts"

const TYPE_LABELS: Record<AssetSearchResult["type"], string> = {
  stock: "Stock",
  crypto: "Crypto",
  etf: "ETF",
  bond: "Bond",
  commodity: "Commodity",
}

const fieldClass = "mb-4 w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"

function formatCurrency(v: number) {
  return `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function AddStockPage() {
  const navigate = useNavigate()
  const { addHolding } = useHoldings()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<AssetSearchResult[]>([])
  const [selected, setSelected] = useState<AssetSearchResult | null>(null)
  const [entry, setEntry] = useState("")
  const [qty, setQty] = useState<number>(1)
  const [platform, setPlatform] = useState<string>("Manual")
  const [account, setAccount] = useState<AccountType>("TFSA")

  // shown as a hint next to the entry price field
  const livePrice = useLivePrice(selected?.symbol ?? "")

  useEffect(() => {
    if (selected && query === `${selected.symbol} - ${selected.name}`) return
    const q = query.trim()
    if (!q) {
      setResults([])
      return
    }
    let cancelled = false
    const t = setTimeout(async () => {
      const found = await scenarioService.searchAssets(q)
      if (!cancelled) setResults(found)
    }, 250)
    return () => { cancelled = true; clearTimeout(t) }
  }, [query, selected])

  function choose(r: AssetSearchResult) {
    setSelected(r)
    setQuery(`${r.symbol} - ${r.name}`)
    setResults([])
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const entryPrice = Number(entry)
    if (!selected || !(entryPrice > 0) || qty <= 0) return
    addHolding({
      symbol: selected.symbol,
      name: selected.name,
      quantity: qty,
      entry: entryPrice,
      platform,
      account,
      type: TYPE_LABELS[selected.type],
    })
    navigate("/assets")
  }

  const canSubmit = selected !== null && Number(entry) > 0 && qty > 0

  return (
    <PageShell title="Add Stock">
      <form onSubmit={submit} className="mx-auto max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <label className="mb-2 block text-zinc-700 dark:text-zinc-200">Stock</label>
        <div className="relative">
          <input
            className={fieldClass}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(null) }}
            placeholder="Search by symbol or name, e.g. AAPL"
            autoComplete="off"
          />
          {results.length > 0 && (
            <ul className="absolute z-10 -mt-3 max-h-64 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
              {results.map(r => (
                <li key={r.symbol}>
                  <button
                    type="button"
                    onClick={() => choose(r)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-700"
                  >
                    <span><span className="font-semibold">{r.symbol}</span> <span className="text-zinc-500 dark:text-zinc-400">{r.name}</span></span>
                    <span className="text-xs uppercase text-zinc-400">{TYPE_LABELS[r.type]}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <label className="mb-2 block text-zinc-700 dark:text-zinc-200">
          Entry Price <span className="text-sm text-zinc-500 dark:text-zinc-400">(the price you bought it at)</span>
        </label>
        <input
          className={fieldClass}
          type="number"
          min="0"
          step="any"
          value={entry}
          onChange={e => setEntry(e.target.value)}
          placeholder={livePrice !== null ? `Current price: ${formatCurrency(livePrice)}` : "e.g. 150.00"}
        />

        <label className="mb-2 block text-zinc-700 dark:text-zinc-200">Account</label>
        <select className={fieldClass} value={account} onChange={e => setAccount(e.target.value as AccountType)}>
          {ACCOUNT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <label className="mb-2 block text-zinc-700 dark:text-zinc-200">Platform</label>
        <select className={fieldClass} value={platform} onChange={e => setPlatform(e.target.value)}>
          <option>Manual</option>
          <option>Wealthsimple</option>
          <option>Robinhood</option>
          <option>Coinbase</option>
          <option>Fidelity</option>
        </select>

        <label className="mb-2 block text-zinc-700 dark:text-zinc-200">Quantity</label>
        <input className={fieldClass} type="number" min="0" step="any" value={qty} onChange={e => setQty(Number(e.target.value))} />

        {Number(entry) > 0 && qty > 0 && (
          <div className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Total cost: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatCurrency(Number(entry) * qty)}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button className="rounded bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={!canSubmit}>Add</button>
        </div>
      </form>
    </PageShell>
  )
}

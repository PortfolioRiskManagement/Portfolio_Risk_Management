import PageShell from "../../../components/layout/PageShell"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useHoldings } from "../hooks/useHoldings"

const STOCKS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF" },
  { symbol: "MSFT", name: "Microsoft Corp." },
  { symbol: "NVDA", name: "NVIDIA Corp." },
]

export default function AddStockPage() {
  const navigate = useNavigate()
  const { addHolding } = useHoldings()
  const [symbol, setSymbol] = useState(STOCKS[0].symbol)
  const [entry, setEntry] = useState<number>(0)
  const [qty, setQty] = useState<number>(1)
  const [platform, setPlatform] = useState<string>("Manual")
  const [type, setType] = useState<string>("Stock")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const stock = STOCKS.find(s => s.symbol === symbol)!
  addHolding({ symbol, name: stock.name, quantity: qty, entry, platform, type })
    navigate("/assets")
  }

  return (
    <PageShell title="Add Stock">
      <form onSubmit={submit} className="max-w-lg mx-auto bg-zinc-900 p-6 rounded">
        <label className="block mb-2 text-zinc-200">Stock</label>
        <select className="w-full p-2 rounded bg-zinc-800 mb-4" value={symbol} onChange={e => setSymbol(e.target.value)}>
          {STOCKS.map(s => (
            <option key={s.symbol} value={s.symbol}>{s.symbol} - {s.name}</option>
          ))}
        </select>

        <label className="block mb-2 text-zinc-200">Entry Price</label>
        <input className="w-full p-2 rounded bg-zinc-800 mb-4" type="number" value={entry} onChange={e => setEntry(Number(e.target.value))} />

        <label className="block mb-2 text-zinc-200">Platform</label>
        <select className="w-full p-2 rounded bg-zinc-800 mb-4" value={platform} onChange={e => setPlatform(e.target.value)}>
          <option>Manual</option>
          <option>Wealthsimple</option>
          <option>Robinhood</option>
          <option>Coinbase</option>
          <option>Fidelity</option>
        </select>

        <label className="block mb-2 text-zinc-200">Quantity</label>
        <input className="w-full p-2 rounded bg-zinc-800 mb-4" type="number" value={qty} onChange={e => setQty(Number(e.target.value))} />

        <label className="block mb-2 text-zinc-200">Type</label>
        <select className="w-full p-2 rounded bg-zinc-800 mb-4" value={type} onChange={e => setType(e.target.value)}>
          <option>Stock</option>
          <option>Crypto</option>
          <option>ETF</option>
        </select>

        <div className="flex justify-end">
          <button className="bg-blue-600 px-4 py-2 rounded text-white" type="submit">Add</button>
        </div>
      </form>
    </PageShell>
  )
}

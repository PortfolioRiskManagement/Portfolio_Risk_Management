import { useState } from "react"

type PortfolioItem = {
    Ticker: string
    Weight: number
}

type Props = {
    isOpen: boolean
    onClose: () => void
    onAnalyze: (portfolio: PortfolioItem[]) => void
    loading: boolean
}

export default function PortfolioEditorModal({ isOpen, onClose, onAnalyze, loading }: Props) {
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
    const [newTicker, setNewTicker] = useState("")
    const [newWeight, setNewWeight] = useState(10)

    const totalWeight = portfolio.reduce((sum, item) => sum + item.Weight, 0)
    const isValid = Math.abs(totalWeight - 100) < 0.1 && portfolio.length > 0

    const addStock = () => {
        if (newTicker.trim()) {
            setPortfolio([...portfolio, { Ticker: newTicker.toUpperCase(), Weight: newWeight }])
            setNewTicker("")
            setNewWeight(10)
        }
    }

    const removeStock = (index: number) => {
        setPortfolio(portfolio.filter((_, i) => i !== index))
    }

    const updateWeight = (index: number, weight: number) => {
        const updated = [...portfolio]
        updated[index].Weight = weight
        setPortfolio(updated)
    }

    const handleAnalyze = () => {
        if (isValid) {
            const normalized = portfolio.map(item => ({
                Ticker: item.Ticker,
                Weight: item.Weight / 100,
            }))
            onAnalyze(normalized)
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-zinc-900 border-b border-zinc-700 p-4 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">Edit Portfolio</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition text-2xl">×</button>
                </div>

                <div className="p-4 space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-3">Current Holdings</h3>
                        <div className="space-y-2 mb-4">
                            {portfolio.map((item, idx) => (
                                <div key={idx} className="bg-zinc-800 rounded p-3 flex items-center justify-between gap-2">
                                    <span className="text-sm font-medium text-white min-w-12">{item.Ticker}</span>
                                    <input
                                        type="number"
                                        value={item.Weight}
                                        onChange={(e) => updateWeight(idx, parseFloat(e.target.value) || 0)}
                                        className="flex-1 bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm text-white"
                                        min="0"
                                        step="0.1"
                                    />
                                    <span className="text-xs text-zinc-400 w-10 text-right">{item.Weight.toFixed(1)}%</span>
                                    <button onClick={() => removeStock(idx)} className="text-red-400 hover:text-red-300 text-lg transition">−</button>
                                </div>
                            ))}
                        </div>

                        <div className={`text-xs p-2 rounded mb-4 ${isValid ? "bg-green-500/10 text-green-400 border border-green-500/30" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"}`}>
                            Total: {totalWeight.toFixed(1)}% {isValid ? "✓" : "⚠ Must equal 100%"}
                        </div>
                    </div>

                    <div className="bg-zinc-800 rounded p-3 space-y-2">
                        <h3 className="text-sm font-semibold text-white">Add Stock</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTicker}
                                onChange={(e) => setNewTicker(e.target.value)}
                                placeholder="Ticker"
                                className="flex-1 bg-zinc-700 border border-zinc-600 rounded px-3 py-1.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <input
                                type="number"
                                value={newWeight}
                                onChange={(e) => setNewWeight(parseFloat(e.target.value) || 0)}
                                placeholder="Weight %"
                                className="w-20 bg-zinc-700 border border-zinc-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                min="0"
                                step="0.1"
                            />
                            <button onClick={addStock} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition">Add</button>
                        </div>
                    </div>
                </div>

                <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-700 p-4 flex gap-2">
                    <button onClick={onClose} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-2 rounded transition">Cancel</button>
                    <button onClick={handleAnalyze} disabled={!isValid || loading} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded transition">{loading ? "Analyzing..." : "Compare"}</button>
                </div>
            </div>
        </div>
    )
}
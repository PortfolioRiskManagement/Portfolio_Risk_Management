import { useState } from 'react'
import type { PortfolioHolding } from '../types/scenario.types'

interface PortfolioEditorProps {
	holdings: PortfolioHolding[]
	onUpdateHoldings: (holdings: PortfolioHolding[]) => void
	totalValue: number
}

export function PortfolioEditorForScenario({ holdings, onUpdateHoldings, totalValue }: PortfolioEditorProps) {
	const [isEditing, setIsEditing] = useState(false)
	const [editedHoldings, setEditedHoldings] = useState<PortfolioHolding[]>(holdings)
	const [newStock, setNewStock] = useState<{
		symbol: string
		quantity: number
		currentValue: number
		assetClass: 'stock' | 'etf' | 'crypto' | 'bond' | 'commodity'
	}>({
		symbol: '',
		quantity: 1,
		currentValue: 0,
		assetClass: 'stock'
	})

	const handleStartEdit = () => {
		setEditedHoldings([...holdings])
		setIsEditing(true)
	}

	const handleCancelEdit = () => {
		setEditedHoldings([...holdings])
		setIsEditing(false)
		setNewStock({ symbol: '', quantity: 1, currentValue: 0, assetClass: 'stock' })
	}

	const handleSaveEdit = () => {
		onUpdateHoldings(editedHoldings)
		setIsEditing(false)
		setNewStock({ symbol: '', quantity: 1, currentValue: 0, assetClass: 'stock' })
	}

	const handleRemoveHolding = (symbol: string) => {
		setEditedHoldings(editedHoldings.filter(h => h.symbol !== symbol))
	}

	const handleUpdateHolding = (symbol: string, field: keyof PortfolioHolding, value: any) => {
		setEditedHoldings(editedHoldings.map(h => 
			h.symbol === symbol ? { ...h, [field]: value } : h
		))
	}

	const handleAddStock = () => {
		if (!newStock.symbol || newStock.currentValue <= 0) return
		
		const holding: PortfolioHolding = {
			symbol: newStock.symbol.toUpperCase(),
			quantity: newStock.quantity || 1,
			currentValue: newStock.currentValue,
			assetClass: newStock.assetClass
		}
		
		setEditedHoldings([...editedHoldings, holding])
		setNewStock({ symbol: '', quantity: 1, currentValue: 0, assetClass: 'stock' })
	}

	const assetClassOptions = [
		{ value: 'stock', label: 'Stock' },
		{ value: 'etf', label: 'ETF' },
		{ value: 'crypto', label: 'Crypto' },
		{ value: 'bond', label: 'Bond' },
		{ value: 'commodity', label: 'Commodity' }
	]

	if (!isEditing) {
		return (
			<div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-xl p-6">
				<div className="flex items-center justify-between mb-4">
					<div>
						<div className="text-zinc-500 text-sm mb-1">Portfolio for Testing</div>
						<div className="text-3xl font-bold text-white">
							${totalValue.toLocaleString('en-US')}
						</div>
					</div>
					<button
						onClick={handleStartEdit}
						className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-medium"
					>
						Edit Portfolio
					</button>
				</div>

				<div className="flex gap-2 flex-wrap">
					{holdings.slice(0, 10).map(holding => (
						<div 
							key={holding.symbol}
							className="px-3 py-1.5 bg-zinc-800 rounded-lg text-sm"
						>
							<span className="font-semibold text-white">{holding.symbol}</span>
							<span className="text-zinc-500 ml-2">
								${(holding.currentValue / 1000).toFixed(0)}K
							</span>
						</div>
					))}
					{holdings.length > 10 && (
						<div className="px-3 py-1.5 bg-zinc-800 rounded-lg text-sm text-zinc-400">
							+{holdings.length - 10} more
						</div>
					)}
				</div>
			</div>
		)
	}

	const editedTotalValue = editedHoldings.reduce((sum, h) => sum + h.currentValue, 0)

	return (
		<div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-xl p-6">
			<div className="flex items-center justify-between mb-6">
				<div>
					<div className="text-zinc-500 text-sm mb-1">Editing Portfolio</div>
					<div className="text-3xl font-bold text-white">
						${editedTotalValue.toLocaleString('en-US')}
					</div>
				</div>
				<div className="flex gap-2">
					<button
						onClick={handleCancelEdit}
						className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors font-medium"
					>
						Cancel
					</button>
					<button
						onClick={handleSaveEdit}
						className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
					>
						Save Changes
					</button>
				</div>
			</div>

			<div className="space-y-3 mb-6 max-h-[360px] overflow-y-auto">
				{editedHoldings.map(holding => (
					<div 
						key={holding.symbol}
						className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 flex items-center gap-4"
					>
						<div className="flex-1 grid grid-cols-4 gap-4">
							<div>
								<label className="text-xs text-zinc-500 mb-1 block">Symbol</label>
								<input
									type="text"
									value={holding.symbol}
									disabled
									className="w-full px-3 py-2 bg-zinc-900 text-white rounded border border-zinc-700 text-sm font-mono"
								/>
							</div>
							<div>
								<label className="text-xs text-zinc-500 mb-1 block">Quantity</label>
								<input
									type="number"
									value={holding.quantity}
									onChange={(e) => handleUpdateHolding(holding.symbol, 'quantity', parseFloat(e.target.value) || 0)}
									className="w-full px-3 py-2 bg-zinc-900 text-white rounded border border-zinc-700 text-sm"
								/>
							</div>
							<div>
								<label className="text-xs text-zinc-500 mb-1 block">Value ($)</label>
								<input
									type="number"
									value={holding.currentValue}
									onChange={(e) => handleUpdateHolding(holding.symbol, 'currentValue', parseFloat(e.target.value) || 0)}
									className="w-full px-3 py-2 bg-zinc-900 text-white rounded border border-zinc-700 text-sm"
								/>
							</div>
							<div>
								<label className="text-xs text-zinc-500 mb-1 block">Asset Class</label>
								<select
									value={holding.assetClass}
									onChange={(e) => handleUpdateHolding(holding.symbol, 'assetClass', e.target.value)}
									className="w-full px-3 py-2 bg-zinc-900 text-white rounded border border-zinc-700 text-sm"
								>
									{assetClassOptions.map(opt => (
										<option key={opt.value} value={opt.value}>{opt.label}</option>
									))}
								</select>
							</div>
						</div>
						<button
							onClick={() => handleRemoveHolding(holding.symbol)}
							className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors"
							title="Remove"
						>
							<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</button>
					</div>
				))}
			</div>

			<div className="bg-zinc-800/50 border border-purple-500/30 rounded-lg p-4">
				<div className="text-white font-semibold mb-3">Add Stock</div>
				<div className="grid grid-cols-4 gap-3">
					<div>
						<label className="text-xs text-zinc-500 mb-1 block">Symbol</label>
						<input
							type="text"
							value={newStock.symbol}
							onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value.toUpperCase() })}
							placeholder="AAPL"
							className="w-full px-3 py-2 bg-zinc-900 text-white rounded border border-zinc-700 text-sm"
						/>
					</div>
					<div>
						<label className="text-xs text-zinc-500 mb-1 block">Quantity</label>
						<input
							type="number"
							value={newStock.quantity}
							onChange={(e) => setNewStock({ ...newStock, quantity: parseFloat(e.target.value) || 1 })}
							className="w-full px-3 py-2 bg-zinc-900 text-white rounded border border-zinc-700 text-sm"
						/>
					</div>
					<div>
						<label className="text-xs text-zinc-500 mb-1 block">Value ($)</label>
						<input
							type="number"
							value={newStock.currentValue || ''}
							onChange={(e) => setNewStock({ ...newStock, currentValue: parseFloat(e.target.value) || 0 })}
							className="w-full px-3 py-2 bg-zinc-900 text-white rounded border border-zinc-700 text-sm"
						/>
					</div>
					<div>
						<label className="text-xs text-zinc-500 mb-1 block">Type</label>
						<select
							value={newStock.assetClass}
							onChange={(e) => setNewStock({ ...newStock, assetClass: e.target.value as 'stock' | 'etf' | 'crypto' | 'bond' | 'commodity' })}
							className="w-full px-3 py-2 bg-zinc-900 text-white rounded border border-zinc-700 text-sm"
						>
							{assetClassOptions.map(opt => (
								<option key={opt.value} value={opt.value}>{opt.label}</option>
							))}
						</select>
					</div>
				</div>
				<button
					onClick={handleAddStock}
					disabled={!newStock.symbol || newStock.currentValue <= 0}
					className="mt-3 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
				>
					Add to Portfolio
				</button>
			</div>
		</div>
	)
}

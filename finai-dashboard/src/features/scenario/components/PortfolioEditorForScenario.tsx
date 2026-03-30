import { useEffect, useMemo, useState } from 'react'
import scenarioService from '../services/scenarioService'
import type { AssetSearchResult, PortfolioHolding } from '../types/scenario.types'

interface PortfolioEditorProps {
	holdings: PortfolioHolding[]
	onUpdateHoldings: (holdings: PortfolioHolding[]) => void
	totalValue: number
}

export function PortfolioEditorForScenario({ holdings, onUpdateHoldings, totalValue }: PortfolioEditorProps) {
	const [isEditing, setIsEditing] = useState(false)
	const [editedHoldings, setEditedHoldings] = useState<PortfolioHolding[]>(holdings)
	const [symbolSuggestions, setSymbolSuggestions] = useState<AssetSearchResult[]>([])
	const [isSearchingSymbols, setIsSearchingSymbols] = useState(false)
	const [newStock, setNewStock] = useState<{
		symbol: string
		name?: string
		quantity: number
		currentValue: number
	}>({
		symbol: '',
		name: '',
		quantity: 1,
		currentValue: 0
	})

	useEffect(() => {
		setEditedHoldings(holdings)
	}, [holdings])

	useEffect(() => {
		if (!isEditing) {
			setSymbolSuggestions([])
			return
		}

		const query = newStock.symbol.trim()
		if (query.length < 1) {
			setSymbolSuggestions([])
			setIsSearchingSymbols(false)
			return
		}

		let isCancelled = false
		setIsSearchingSymbols(true)

		const timer = window.setTimeout(async () => {
			const results = await scenarioService.searchAssets(query)
			if (!isCancelled) {
				setSymbolSuggestions(results)
				setIsSearchingSymbols(false)
			}
		}, 250)

		return () => {
			isCancelled = true
			window.clearTimeout(timer)
		}
	}, [newStock.symbol, isEditing])

	const handleStartEdit = () => {
		setEditedHoldings([...holdings])
		setIsEditing(true)
	}

	const handleCancelEdit = () => {
		setEditedHoldings([...holdings])
		setIsEditing(false)
		setNewStock({ symbol: '', name: '', quantity: 1, currentValue: 0 })
		setSymbolSuggestions([])
	}

	const handleSaveEdit = () => {
		const deduped = new Map<string, PortfolioHolding>()
		editedHoldings.forEach((holding) => {
			const symbol = holding.symbol.trim().toUpperCase()
			if (!symbol || holding.currentValue <= 0) return

			const existing = deduped.get(symbol)
			if (!existing) {
				deduped.set(symbol, {
					...holding,
					symbol,
					quantity: Math.max(1, holding.quantity),
					currentValue: Math.max(0, holding.currentValue)
				})
				return
			}

			deduped.set(symbol, {
				...existing,
				quantity: existing.quantity + Math.max(1, holding.quantity),
				currentValue: existing.currentValue + Math.max(0, holding.currentValue)
			})
		})

		const normalized = Array.from(deduped.values())
		onUpdateHoldings(normalized)
		setEditedHoldings(normalized)
		setIsEditing(false)
		setNewStock({ symbol: '', name: '', quantity: 1, currentValue: 0 })
		setSymbolSuggestions([])
	}

	const handleRemoveHolding = (symbol: string) => {
		setEditedHoldings(editedHoldings.filter(h => h.symbol !== symbol))
	}

	// handleUpdateHolding removed; use handleValueChange and other helpers instead

	const resolveAssetClass = async (symbol: string): Promise<PortfolioHolding['assetClass']> => {
		const results = await scenarioService.searchAssets(symbol)
		const upperSymbol = symbol.toUpperCase()
		const exact = results.find((r) => r.symbol.toUpperCase() === upperSymbol)
		return exact?.type ?? results[0]?.type ?? 'stock'
	}

	const handleAddStock = async () => {
		if (!newStock.symbol || newStock.currentValue <= 0) return
		const symbol = newStock.symbol.toUpperCase().trim()
		if (!symbol) return
		const assetClass = await resolveAssetClass(symbol)
		
		const holding: PortfolioHolding = {
			symbol,
			quantity: newStock.quantity || 1,
			currentValue: newStock.currentValue,
			assetClass
		}

		setEditedHoldings((prev) => {
			const existingIndex = prev.findIndex((h) => h.symbol.toUpperCase() === symbol)
			if (existingIndex === -1) return [...prev, holding]

			const next = [...prev]
			next[existingIndex] = {
				...next[existingIndex],
				currentValue: next[existingIndex].currentValue + holding.currentValue
			}
			return next
		})

		setNewStock({ symbol: '', name: '', quantity: 1, currentValue: 0 })
		setSymbolSuggestions([])
	}

	const handleSuggestionSelect = (suggestion: AssetSearchResult) => {
		setNewStock((prev) => ({
			...prev,
			symbol: suggestion.symbol.toUpperCase(),
			name: suggestion.name
		}))
		setSymbolSuggestions([])
	}

	const editedTotalValue = editedHoldings.reduce((sum, h) => sum + h.currentValue, 0)
	const hasAtLeastOneHolding = useMemo(
		() => editedHoldings.some((holding) => holding.currentValue > 0 && holding.symbol.trim().length > 0),
		[editedHoldings]
	)
	const canSave = hasAtLeastOneHolding

	if (!isEditing) {
		const averagePosition = holdings.length ? totalValue / holdings.length : 0
		const largestHolding = holdings.reduce((max, h) => (h.currentValue > max.currentValue ? h : max), holdings[0] ?? {
			symbol: '--',
			quantity: 0,
			currentValue: 0,
			assetClass: 'stock' as const,
		})

		return (
			<div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
				<div className="flex items-center justify-between mb-5">
					<div>
						<div className="text-zinc-500 text-sm mb-1">Portfolio for Testing</div>
						<div className="text-3xl font-bold text-white">
							${totalValue.toLocaleString('en-US')}
						</div>
					</div>
					<button
						onClick={handleStartEdit}
						className="px-4 py-2.5 bg-gradient-to-r from-zinc-700 to-zinc-600 hover:from-zinc-600 hover:to-zinc-500 border border-zinc-500/70 text-white rounded-lg transition-all font-semibold shadow-md"
					>
						Edit Portfolio
					</button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
					<div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3">
						<div className="text-xs text-zinc-500 mb-1">Assets</div>
						<div className="text-xl font-bold text-white">{holdings.length}</div>
					</div>
					<div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3">
						<div className="text-xs text-zinc-500 mb-1">Avg Position</div>
						<div className="text-xl font-bold text-white">
							${averagePosition.toLocaleString('en-US', { maximumFractionDigits: 0 })}
						</div>
					</div>
					<div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3">
						<div className="text-xs text-zinc-500 mb-1">Largest Holding</div>
						<div className="text-xl font-bold text-white">{largestHolding.symbol}</div>
					</div>
				</div>

				<div className="flex gap-2.5 flex-wrap justify-center">
					{holdings.slice(0, 10).map(holding => (
						<div 
							key={holding.symbol}
							className="inline-flex items-center gap-2.5 px-3 py-2 bg-gradient-to-t from-black to-zinc-800 border border-zinc-700 rounded-full text-sm transition-transform duration-200 hover:-translate-y-1"
						>
							<span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-semibold text-zinc-200 border border-zinc-700">
								{holding.symbol.slice(0, 3)}
							</span>
							<span className="font-semibold text-white">{holding.symbol}</span>
							<span className="text-zinc-500">
								${(holding.currentValue / 1000).toFixed(0)}K
							</span>
						</div>
					))}
					{holdings.length > 10 && (
						<div className="px-3 py-2 bg-gradient-to-t from-black to-zinc-800 border border-zinc-700 rounded-full text-sm text-zinc-400">
							+{holdings.length - 10} more
						</div>
					)}
				</div>
			</div>
		)
	}

	const handleValueChange = (symbol: string, val: number) => {
		setEditedHoldings(prev => prev.map(h => h.symbol === symbol ? { ...h, currentValue: Math.max(0, val) } : h))
	}

	return (
		<div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
			{/* Header */}
			<div className="flex items-center justify-between mb-5">
				<div>
					<div className="text-zinc-500 text-sm mb-1">Editing Portfolio</div>
					<div className="text-2xl font-bold text-white">
						${editedTotalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
					</div>
					<div className="text-xs text-zinc-500 mt-1">Allocation is auto-calculated from current total value.</div>
				</div>
				<div className="flex items-center gap-3">
					<button onClick={handleCancelEdit} className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors text-sm">
						Cancel
					</button>
					<button
						onClick={handleSaveEdit}
						disabled={!canSave}
						className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold text-sm"
					>
						Save Changes
					</button>
				</div>
			</div>

			{/* Add Asset */}
			<div className="border border-zinc-800 rounded-xl p-4 mb-5 bg-zinc-950/40">
				<div className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wide">Add Asset</div>
				<div className="flex items-end gap-3 flex-wrap">
					<div className="relative">
						<label className="text-xs text-zinc-500 mb-1 block">Symbol</label>
						<input
							type="text"
							value={newStock.symbol}
							onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value.toUpperCase() })}
							placeholder="AAPL"
							className="w-32 px-3 py-2 bg-zinc-900 text-white rounded border border-zinc-700 text-sm focus:outline-none focus:border-zinc-500"
						/>
						{isSearchingSymbols && (
							<div className="absolute left-0 right-0 mt-1 rounded-lg border border-zinc-700 bg-zinc-900 text-xs text-zinc-400 px-2 py-1.5 z-20">
								Searching...
							</div>
						)}
						{!isSearchingSymbols && symbolSuggestions.length > 0 && (
							<div className="absolute left-0 right-0 mt-1 rounded-lg border border-zinc-700 bg-zinc-900 overflow-hidden z-20 max-h-52 overflow-y-auto">
								{symbolSuggestions.map((suggestion) => (
									<button
										type="button"
										key={`${suggestion.symbol}-${suggestion.name}`}
										onClick={() => handleSuggestionSelect(suggestion)}
										className="w-full text-left px-3 py-2 hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-b-0"
									>
										<div className="text-sm text-white font-medium">{suggestion.symbol}</div>
										<div className="text-xs text-zinc-400 truncate">{suggestion.name}</div>
									</button>
								))}
							</div>
						)}
					</div>
					<div>
						<label className="text-xs text-zinc-500 mb-1 block">Value ($)</label>
						<input
							type="number"
							value={newStock.currentValue || ''}
							onChange={(e) => setNewStock({ ...newStock, currentValue: parseFloat(e.target.value) || 0 })}
							className="w-36 px-3 py-2 bg-zinc-900 text-white rounded border border-zinc-700 text-sm focus:outline-none focus:border-zinc-500"
						/>
					</div>
					<button
						onClick={handleAddStock}
						disabled={!newStock.symbol || newStock.currentValue <= 0}
						className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
					>
						+ Add
					</button>
				</div>
			</div>

			{/* Column headers */}
			<div className="flex items-center justify-between px-4 mb-2 text-xs text-zinc-600 font-medium uppercase tracking-wide">
				<div className="w-20 shrink-0">Symbol</div>
				<div className="w-28 text-center">Allocation %</div>
				<div className="w-40 text-right">Value ($)</div>
			</div>

			{/* Holding rows */}
			<div className="space-y-2 max-h-[360px] overflow-y-auto mb-5">
				{editedHoldings.map(holding => {
					const pct = editedTotalValue > 0 ? (holding.currentValue / editedTotalValue) * 100 : 0
					return (
						<div key={holding.symbol} className="flex items-center justify-between gap-4 bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-3">
							<div className="w-20 shrink-0">
								<span className="font-mono font-bold text-white text-sm">{holding.symbol}</span>
							</div>
							<div className="w-28 text-center">
								<span className="inline-flex px-3 py-1 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-200 text-sm min-w-[76px] justify-center">
									{pct.toFixed(1)}%
								</span>
							</div>
							<div className="flex items-center gap-1.5 ml-auto">
								<span className="text-zinc-600 text-sm">$</span>
								<input
									type="number"
									min={0}
									step={100}
									value={Math.round(holding.currentValue)}
									onChange={e => handleValueChange(holding.symbol, parseFloat(e.target.value) || 0)}
									className="w-36 px-3 py-1.5 bg-zinc-900 text-white rounded border border-zinc-700 text-sm text-right focus:outline-none focus:border-zinc-500"
								/>
							</div>
							<button
								onClick={() => handleRemoveHolding(holding.symbol)}
								className="shrink-0 p-1.5 text-zinc-600 hover:text-red-400 transition-colors rounded"
								title="Remove"
							>
								<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
					)
				})}
			</div>
		</div>
	)
}

// src/services/alertsService.ts

import type { Alert } from "../components/AlertCard"

export interface PortfolioHolding {
	ticker: string
	percentageOfPortfolio: number
	shares?: number
	value?: number
	companyName?: string
	sector?: string
}

interface FinnhubNewsItem {
	id: number
	category: string
	datetime: number
	headline: string
	image?: string
	related?: string
	source: string
	summary: string
	url: string
}

interface FinnhubQuote {
	c: number
	d: number
	dp: number
	h: number
	l: number
	o: number
	pc: number
	t: number
}

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY
const FINNHUB_BASE_URL = "https://finnhub.io/api/v1"

const MAX_MARKET_NEWS = 10
const MAX_COMPANY_NEWS_PER_TICKER = 4
const MAX_TICKERS = 10
const MAX_QUOTE_TICKERS = 10
let quoteRotationCursor = 0

function buildUrl(endpoint: string, params: Record<string, string | number>) {
	const url = new URL(`${FINNHUB_BASE_URL}${endpoint}`)

	Object.entries(params).forEach(([key, value]) => {
		url.searchParams.set(key, String(value))
	})

	url.searchParams.set("token", FINNHUB_API_KEY)
	return url.toString()
}

async function fetchJson<T>(url: string): Promise<T> {
	const response = await fetch(url)

	if (!response.ok) {
		throw new Error(`Finnhub request failed: ${response.status} ${response.statusText}`)
	}

	return response.json()
}

function normalizeTicker(ticker: string) {
	return ticker.trim().toUpperCase()
}

function uniqueBy<T>(items: T[], getKey: (item: T) => string): T[] {
	const seen = new Set<string>()

	return items.filter((item) => {
		const key = getKey(item)
		if (seen.has(key)) return false
		seen.add(key)
		return true
	})
}

function getDateRange(daysBack = 7) {
	const to = new Date()
	const from = new Date()
	from.setDate(to.getDate() - daysBack)

	return {
		from: from.toISOString().split("T")[0],
		to: to.toISOString().split("T")[0],
	}
}

function detectImpact(headline: string, summary: string, relatedTickers: string[] = []): Alert["impact"] {
	const text = `${headline} ${summary}`.toLowerCase()

	const highWords = [
		"earnings",
		"guidance cut",
		"guidance raised",
		"downgrade",
		"upgrade",
		"lawsuit",
		"investigation",
		"sec",
		"bankruptcy",
		"merger",
		"acquisition",
		"layoffs",
		"rate cut",
		"rate hike",
		"inflation",
		"cpi",
		"gdp",
		"recession",
	]

	const mediumWords = [
		"forecast",
		"outlook",
		"analyst",
		"partnership",
		"product launch",
		"expansion",
		"demand",
		"supply",
		"contract",
		"sector",
	]

	if (highWords.some((word) => text.includes(word))) return "high"
	if (relatedTickers.length >= 2) return "high"
	if (mediumWords.some((word) => text.includes(word))) return "medium"

	return "low"
}

function detectImpactFromPriceMove(percentChange: number): Alert["impact"] | null {
	const absMove = Math.abs(percentChange)

	if (absMove >= 5) return "high"
	if (absMove >= 2) return "medium"

	return null
}

function pickQuoteTickers(tickers: string[]): string[] {
	if (tickers.length <= MAX_QUOTE_TICKERS) return tickers

	const chosen: string[] = []

	// Keep META included when available because user requested META move visibility.
	if (tickers.includes("META")) chosen.push("META")

	// Rotate through remaining tickers so all holdings get quote coverage over time.
	const start = quoteRotationCursor % tickers.length
	for (let i = 0; i < tickers.length && chosen.length < MAX_QUOTE_TICKERS; i++) {
		const idx = (start + i) % tickers.length
		const ticker = tickers[idx]
		if (!chosen.includes(ticker)) {
			chosen.push(ticker)
		}
	}

	quoteRotationCursor += 1

	return chosen
}

function detectCategory(
	item: FinnhubNewsItem,
	relatedTickers: string[],
	holdings?: PortfolioHolding[]
): Alert["category"] {
	const text = `${item.category} ${item.headline} ${item.summary}`.toLowerCase()

	if (
		text.includes("economy") ||
		text.includes("inflation") ||
		text.includes("cpi") ||
		text.includes("gdp") ||
		text.includes("interest rate") ||
		text.includes("fed") ||
		text.includes("recession") ||
		text.includes("jobs report") ||
		text.includes("central bank")
	) {
		return "economy"
	}

	if (
		text.includes("sector") ||
		text.includes("semiconductor") ||
		text.includes("technology sector") ||
		text.includes("banking sector") ||
		text.includes("energy sector")
	) {
		return "sector"
	}

	if (relatedTickers.length > 0) {
		const matchedHolding = holdings?.find((holding) =>
			relatedTickers.includes(normalizeTicker(holding.ticker))
		)

		if (matchedHolding?.sector) {
			const sectorText = matchedHolding.sector.toLowerCase()
			if (text.includes(sectorText)) return "sector"
		}

		return "stock"
	}

	return "market"
}

function buildAliasMap(tickers: string[], holdings?: PortfolioHolding[]) {
	const aliasMap = new Map<string, string[]>()

	for (const rawTicker of tickers) {
		const ticker = normalizeTicker(rawTicker)
		const aliases = new Set<string>([ticker])

		const holding = holdings?.find((h) => normalizeTicker(h.ticker) === ticker)

		if (holding?.companyName) {
			aliases.add(holding.companyName.toLowerCase())

			holding.companyName
				.toLowerCase()
				.split(/\s+/)
				.filter((word) => word.length > 2)
				.forEach((word) => aliases.add(word))
		}

		if (ticker === "GOOGL" || ticker === "GOOG") {
			aliases.add("google")
			aliases.add("alphabet")
		}
		if (ticker === "META") aliases.add("facebook")
		if (ticker === "AMZN") aliases.add("amazon")
		if (ticker === "AAPL") aliases.add("apple")
		if (ticker === "MSFT") aliases.add("microsoft")
		if (ticker === "TSLA") aliases.add("tesla")
		if (ticker === "NVDA") aliases.add("nvidia")
		if (ticker === "GLD" || ticker === "XAUUSD") {
			aliases.add("gold")
			aliases.add("bullion")
			aliases.add("precious metal")
		}

		aliasMap.set(ticker, [...aliases])
	}

	return aliasMap
}

function matchRelatedTickers(
	headline: string,
	summary: string,
	tickers: string[],
	holdings?: PortfolioHolding[]
): string[] {
	const text = `${headline} ${summary}`.toLowerCase()
	const aliasMap = buildAliasMap(tickers, holdings)
	const matches: string[] = []

	for (const [ticker, aliases] of aliasMap.entries()) {
		if (aliases.some((alias) => text.includes(alias.toLowerCase()))) {
			matches.push(ticker)
		}
	}

	return matches
}

function mapNewsToAlert(
	item: FinnhubNewsItem,
	tickers: string[],
	holdings?: PortfolioHolding[]
): Alert {
	const relatedFromApi =
		item.related
			?.split(",")
			.map((ticker) => normalizeTicker(ticker))
			.filter((ticker) => tickers.includes(ticker)) ?? []

	const relatedFromText = matchRelatedTickers(item.headline, item.summary, tickers, holdings)

	const relatedTickers = [...new Set([...relatedFromApi, ...relatedFromText])]

	return {
		id: `news-${item.id}`,
		title: item.headline,
		description: item.summary || "No summary available.",
		source: item.source,
		timestamp: new Date(item.datetime * 1000).toISOString(),
		impact: detectImpact(item.headline, item.summary, relatedTickers),
		category: detectCategory(item, relatedTickers, holdings),
		relatedTickers,
		link: item.url,
	}
}

function mapQuoteToAlert(ticker: string, quote: FinnhubQuote): Alert | null {
	const impact = detectImpactFromPriceMove(quote.dp)

	if (!impact) return null

	const direction = quote.dp >= 0 ? "up" : "down"
	const absPercent = Math.abs(quote.dp).toFixed(2)
	const absDollar = Math.abs(quote.d).toFixed(2)

	return {
		id: `price-${ticker}-${quote.t}`,
		title: `${ticker} is ${direction} ${absPercent}% today`,
		description: `${ticker} moved ${direction} by $${absDollar} and is now trading at $${quote.c.toFixed(2)}.`,
		source: "Finnhub Quote",
		timestamp: new Date((quote.t || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
		impact,
		category: "stock",
		relatedTickers: [ticker],
		link: `https://finance.yahoo.com/quote/${ticker}`,
	}
}

async function fetchMarketNews(): Promise<FinnhubNewsItem[]> {
	const url = buildUrl("/news", { category: "general" })
	const data = await fetchJson<FinnhubNewsItem[]>(url)
	return data.slice(0, MAX_MARKET_NEWS)
}

async function fetchCompanyNews(ticker: string, daysBack = 7): Promise<FinnhubNewsItem[]> {
	const { from, to } = getDateRange(daysBack)

	const url = buildUrl("/company-news", {
		symbol: ticker,
		from,
		to,
	})

	const data = await fetchJson<FinnhubNewsItem[]>(url)
	return data.slice(0, MAX_COMPANY_NEWS_PER_TICKER)
}

async function fetchQuote(ticker: string): Promise<FinnhubQuote> {
	const url = buildUrl("/quote", { symbol: ticker })
	return fetchJson<FinnhubQuote>(url)
}

function sortAlerts(alerts: Alert[]): Alert[] {
	const impactRank = {
		high: 3,
		medium: 2,
		low: 1,
	}

	return [...alerts].sort((a, b) => {
		const impactDiff = impactRank[b.impact] - impactRank[a.impact]
		if (impactDiff !== 0) return impactDiff

		return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
	})
}

export async function fetchPortfolioAlerts(
	portfolioTickers: string[],
	portfolioHoldings: PortfolioHolding[] = []
): Promise<Alert[]> {
	if (!FINNHUB_API_KEY) {
		throw new Error("Missing VITE_FINNHUB_API_KEY")
	}

	const tickers = [...new Set(portfolioTickers.map(normalizeTicker))].filter(Boolean)
	const limitedTickers = tickers.slice(0, MAX_TICKERS)
	const quoteTickers = pickQuoteTickers(limitedTickers)

	const [marketNews, companyNewsResults, quoteResults] = await Promise.all([
		fetchMarketNews().catch(() => []),
		Promise.all(limitedTickers.map((ticker) => fetchCompanyNews(ticker).catch(() => []))),
		Promise.all(quoteTickers.map((ticker) => fetchQuote(ticker).catch(() => null))),
	])

	const marketAlerts = marketNews.map((item) => mapNewsToAlert(item, tickers, portfolioHoldings))

	const companyAlerts = companyNewsResults
		.flat()
		.map((item) => mapNewsToAlert(item, tickers, portfolioHoldings))

	const priceAlerts = quoteResults
		.map((quote, index) => {
			if (!quote) return null
			return mapQuoteToAlert(quoteTickers[index], quote)
		})
		.filter((alert): alert is Alert => alert !== null)

	const merged = uniqueBy(
		[...marketAlerts, ...companyAlerts, ...priceAlerts],
		(alert) => `${alert.title}-${alert.source}-${alert.timestamp}`
	)

	return sortAlerts(merged)
}

export async function fetchPortfolioOnlyAlerts(
	portfolioTickers: string[],
	portfolioHoldings: PortfolioHolding[] = []
): Promise<Alert[]> {
	if (!FINNHUB_API_KEY) {
		throw new Error("Missing VITE_FINNHUB_API_KEY")
	}

	const tickers = [...new Set(portfolioTickers.map(normalizeTicker))].filter(Boolean)
	const limitedTickers = tickers.slice(0, MAX_TICKERS)
	const quoteTickers = pickQuoteTickers(limitedTickers)

	const [companyNewsResults, quoteResults] = await Promise.all([
		Promise.all(limitedTickers.map((ticker) => fetchCompanyNews(ticker).catch(() => []))),
		Promise.all(quoteTickers.map((ticker) => fetchQuote(ticker).catch(() => null))),
	])

	const companyAlerts = companyNewsResults
		.flat()
		.map((item) => mapNewsToAlert(item, tickers, portfolioHoldings))
		.filter((alert) => alert.relatedTickers.length > 0)

	const priceAlerts = quoteResults
		.map((quote, index) => {
			if (!quote) return null
			return mapQuoteToAlert(quoteTickers[index], quote)
		})
		.filter((alert): alert is Alert => alert !== null)

	const merged = uniqueBy(
		[...companyAlerts, ...priceAlerts],
		(alert) => `${alert.title}-${alert.source}-${alert.timestamp}`
	)

	return sortAlerts(merged)
}
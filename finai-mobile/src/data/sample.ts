// Hardcoded sample data, mirroring the website (finai-dashboard), until real brokerage
// connections are ready. Replace these with live data once the connection service lands.

export type Holding = {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  /** Average price paid per unit. */
  entry: number;
  platform: string;
  type: 'stock' | 'etf' | 'crypto';
};

export const SAMPLE_HOLDINGS: Holding[] = [
  { id: '1', symbol: 'AAPL', name: 'Apple Inc.', quantity: 50, entry: 150.25, platform: 'Wealthsimple', type: 'stock' },
  { id: '2', symbol: 'TSLA', name: 'Tesla Inc.', quantity: 25, entry: 245.8, platform: 'Robinhood', type: 'stock' },
  { id: '3', symbol: 'BTC', name: 'Bitcoin', quantity: 0.5, entry: 42000, platform: 'Coinbase', type: 'crypto' },
  { id: '4', symbol: 'ETH', name: 'Ethereum', quantity: 5, entry: 2200, platform: 'Coinbase', type: 'crypto' },
  { id: '5', symbol: 'SPY', name: 'SPDR S&P 500 ETF', quantity: 100, entry: 425, platform: 'Fidelity', type: 'etf' },
  { id: '6', symbol: 'MSFT', name: 'Microsoft Corporation', quantity: 30, entry: 320, platform: 'Wealthsimple', type: 'stock' },
  { id: '7', symbol: 'NVDA', name: 'NVIDIA Corporation', quantity: 15, entry: 450, platform: 'Robinhood', type: 'stock' },
];

/** Latest sample prices; holdings without one are valued at their entry price. */
export const SAMPLE_PRICES: Record<string, number> = {
  AAPL: 185.4,
  TSLA: 198.5,
  BTC: 62500,
  ETH: 3100,
  SPY: 485.2,
  MSFT: 410.5,
  NVDA: 720.3,
};

export const PERFORMANCE = [
  { month: 'Jan', value: 104000 },
  { month: 'Feb', value: 108000 },
  { month: 'Mar', value: 112000 },
  { month: 'Apr', value: 118000 },
  { month: 'May', value: 124000 },
  { month: 'Jun', value: 132622 },
];

export type Account = {
  id: string;
  type: 'RRSP' | 'TFSA' | 'FHSA' | 'PERSONAL';
  name: string;
  purpose: string;
  balance: number;
  gain: number;
  gainPercent: number;
  contributionRoom: number;
  contributionUsed: number;
  contributionLimit: number;
  taxBenefit: string;
  status: 'optimized' | 'underused' | 'overused' | 'normal';
  recommendedAction: string;
};

export const SAMPLE_ACCOUNTS: Account[] = [
  {
    id: '1',
    type: 'RRSP',
    name: 'Registered Retirement Savings Plan',
    purpose: 'Tax-deferred retirement savings',
    balance: 48520,
    gain: 14234,
    gainPercent: 41.5,
    contributionRoom: 15230,
    contributionUsed: 12000,
    contributionLimit: 27230,
    taxBenefit: 'Contributions are tax-deductible. Growth is tax-deferred until withdrawal.',
    status: 'normal',
    recommendedAction: 'Continue contributions at current pace. Consider maximizing before year-end for the tax deduction.',
  },
  {
    id: '2',
    type: 'TFSA',
    name: 'Tax-Free Savings Account',
    purpose: 'Tax-free growth and withdrawals',
    balance: 31250,
    gain: 7812,
    gainPercent: 33.3,
    contributionRoom: 70000,
    contributionUsed: 25000,
    contributionLimit: 95000,
    taxBenefit: 'No tax on growth or withdrawals. Ideal for flexibility and tax-free compounding.',
    status: 'underused',
    recommendedAction: 'You have lots of unused room. Prioritize TFSA contributions for maximum tax-free growth.',
  },
  {
    id: '3',
    type: 'FHSA',
    name: 'First Home Savings Account',
    purpose: 'Tax-free savings for your first home',
    balance: 8000,
    gain: 256,
    gainPercent: 3.3,
    contributionRoom: 0,
    contributionUsed: 8000,
    contributionLimit: 8000,
    taxBenefit: 'Contributions are tax-deductible and withdrawals for a first home are tax-free.',
    status: 'optimized',
    recommendedAction: 'Contribution limit reached for this year. Excellent progress toward your home goal.',
  },
  {
    id: '4',
    type: 'PERSONAL',
    name: 'Personal Investment Account',
    purpose: 'Non-registered taxable account',
    balance: 44852,
    gain: 5816,
    gainPercent: 14.9,
    contributionRoom: 0,
    contributionUsed: 0,
    contributionLimit: 0,
    taxBenefit: 'Capital gains taxed at 50%. Dividends receive favourable tax treatment.',
    status: 'normal',
    recommendedAction: 'Consider moving future contributions to registered accounts to maximize tax efficiency.',
  },
];

export const PROVIDERS = [
  { name: 'Wealthsimple', color: '#111111', letter: 'W', kind: 'Brokerage' },
  { name: 'Robinhood', color: '#16a34a', letter: 'R', kind: 'Brokerage' },
  { name: 'Coinbase', color: '#2563eb', letter: 'C', kind: 'Crypto exchange' },
  { name: 'Binance', color: '#f59e0b', letter: 'B', kind: 'Crypto exchange' },
] as const;

export const DAILY_BRIEF = [
  { tone: 'positive', icon: 'trending-up', title: 'Up 2.3% today', body: 'Driven by strong performance in the tech sector, led by NVDA.' },
  { tone: 'warning', icon: 'warning-outline', title: 'High tech concentration (65%)', body: 'Consider rebalancing to reduce sector risk.' },
  { tone: 'info', icon: 'sparkles-outline', title: 'Fed holds rates', body: 'A steady rate outlook is supportive for equities. No action needed.' },
] as const;

export const RECENT_ACTIVITY = [
  { text: 'Synced Coinbase', time: '2m ago' },
  { text: 'Imported 3 holdings from Fidelity', time: '1h ago' },
  { text: 'Connected Robinhood', time: 'Yesterday' },
];

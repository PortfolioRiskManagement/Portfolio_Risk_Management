import { Platform } from 'react-native';

export type SnapTradeAccount = {
  id: string;
  name: string;
  type: 'RRSP' | 'TFSA' | 'FHSA' | 'PERSONAL' | 'CASH' | 'UNKNOWN';
  balance: number;
  currency: string;
};

export type SnapTradeHolding = {
  id: string;
  accountId: string;
  accountType: SnapTradeAccount['type'];
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  value: number;
  currency: string;
  platform: string;
  kind: 'stock' | 'etf' | 'crypto' | 'cash' | 'bond' | 'commodity';
};

export type SnapTradePortfolio = {
  success: boolean;
  accountValueCad: number;
  accountCount: number;
  accounts: SnapTradeAccount[];
  holdings: SnapTradeHolding[];
  source: 'live';
};

export type HistoryPoint = { time: number; value: number };

export function apiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  if (Platform.OS === 'android') return 'http://10.0.2.2:5001';
  return 'http://127.0.0.1:5001';
}

export async function fetchSnapTradePortfolio(): Promise<SnapTradePortfolio | null> {
  try {
    const response = await fetch(`${apiBaseUrl()}/api/snaptrade/portfolio`);
    const payload = await response.json();
    return response.ok && payload.success ? payload : null;
  } catch {
    return null;
  }
}

export async function fetchSnapTradeHistory(days: number): Promise<HistoryPoint[]> {
  try {
    const response = await fetch(`${apiBaseUrl()}/api/snaptrade/history?days=${days}`);
    const payload = await response.json();
    return response.ok && payload.success && Array.isArray(payload.points) ? payload.points : [];
  } catch {
    return [];
  }
}

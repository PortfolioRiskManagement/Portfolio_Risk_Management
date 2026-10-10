import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { SAMPLE_HOLDINGS, type Holding } from '../data/sample';

// Holdings and connection status live on the device for now (sample data plus anything the
// person adds). Swap this for Supabase once real brokerage connections are available.

const HOLDINGS_KEY = 'finai_holdings_v1';
const CONNECTIONS_KEY = 'finai_connections_v1';

type StoreValue = {
  holdings: Holding[];
  addHolding: (holding: Omit<Holding, 'id'>) => void;
  removeHolding: (id: string) => void;
  resetHoldings: () => void;
  connected: Record<string, boolean>;
  setConnected: (provider: string, value: boolean) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [holdings, setHoldings] = useState<Holding[]>(SAMPLE_HOLDINGS);
  const [connected, setConnectedState] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(HOLDINGS_KEY), AsyncStorage.getItem(CONNECTIONS_KEY)])
      .then(([rawHoldings, rawConnections]) => {
        if (rawHoldings) setHoldings(JSON.parse(rawHoldings));
        if (rawConnections) setConnectedState(JSON.parse(rawConnections));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(HOLDINGS_KEY, JSON.stringify(holdings)).catch(() => {});
  }, [holdings, loaded]);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(CONNECTIONS_KEY, JSON.stringify(connected)).catch(() => {});
  }, [connected, loaded]);

  function addHolding(input: Omit<Holding, 'id'>) {
    const symbol = input.symbol.trim().toUpperCase();
    setHoldings((prev) => {
      const existing = prev.find((h) => h.symbol === symbol);
      if (!existing) return [{ ...input, symbol, id: String(Date.now()) }, ...prev];
      // Same symbol again: combine into one position with a weighted average price.
      const quantity = existing.quantity + input.quantity;
      const entry = (existing.entry * existing.quantity + input.entry * input.quantity) / quantity;
      return prev.map((h) => (h.id === existing.id ? { ...h, quantity, entry } : h));
    });
  }

  return (
    <StoreContext.Provider
      value={{
        holdings,
        addHolding,
        removeHolding: (id) => setHoldings((prev) => prev.filter((h) => h.id !== id)),
        resetHoldings: () => setHoldings(SAMPLE_HOLDINGS),
        connected,
        setConnected: (provider, value) => setConnectedState((prev) => ({ ...prev, [provider]: value })),
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
}

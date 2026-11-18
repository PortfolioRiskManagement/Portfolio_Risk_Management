import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';

// Brand colours match the website: blue → indigo → purple.
export const brand = {
  gradient: ['#3b82f6', '#6366f1', '#a855f7'] as const,
  blue: '#3b82f6',
  indigo: '#6366f1',
  purple: '#a855f7',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
};

const dark = {
  isDark: true,
  background: '#07070a',
  surface: '#111114',
  surfaceMuted: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  text: '#ffffff',
  textMuted: '#a1a1aa',
  textSubtle: '#71717a',
  track: 'rgba(255,255,255,0.08)',
  accent: '#a5b4fc',
  accentSoft: 'rgba(99,102,241,0.16)',
  positive: '#34d399',
  warning: '#fbbf24',
  negative: '#fb7185',
};

const light: typeof dark = {
  isDark: false,
  background: '#f4f5fb',
  surface: '#ffffff',
  surfaceMuted: '#f4f4f5',
  border: '#e4e4e7',
  text: '#09090b',
  textMuted: '#52525b',
  textSubtle: '#a1a1aa',
  track: '#ececf1',
  accent: '#4f46e5',
  accentSoft: 'rgba(99,102,241,0.10)',
  positive: '#059669',
  warning: '#d97706',
  negative: '#e11d48',
};

export type Colors = typeof dark;

type ThemeContextValue = {
  colors: Colors;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const STORAGE_KEY = 'finai_theme_preference';
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'light' || stored === 'dark' || stored === 'system') setPreferenceState(stored);
      })
      .catch(() => {});
  }, []);

  function setPreference(next: ThemePreference) {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }

  const value = useMemo(() => {
    const mode = preference === 'system' ? (system === 'light' ? 'light' : 'dark') : preference;
    return { colors: mode === 'dark' ? dark : light, preference, setPreference };
  }, [preference, system]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}

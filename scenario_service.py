"""
Scenario Service - Historical scenario backtesting for portfolios

Uses yfinance to fetch actual historical data during specific market events
and calculates how a given portfolio would have performed.

This is a NEW service and does NOT modify or depend on dataload/ files.
"""

import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime

class ScenarioService:
    """Calculate portfolio performance during historical scenarios"""
    
    # Historical scenario date ranges
    SCENARIOS = {
        '2008-financial-crisis': {
            'start': '2007-10-09',
            'end': '2009-03-09',
            'name': '2008 Financial Crisis'
        },
        'covid-2020-crash': {
            'start': '2020-02-19',
            'end': '2020-03-23',
            'name': 'COVID-19 Crash'
        },
        'covid-recovery-2020': {
            'start': '2020-03-23',
            'end': '2021-11-08',
            'name': 'COVID Recovery'
        },
        'dot-com-bubble': {
            'start': '2000-03-10',
            'end': '2002-10-09',
            'name': 'Dot-Com Bubble'
        },
        'post-2008-recovery': {
            'start': '2009-03-09',
            'end': '2020-02-19',
            'name': 'Post-2008 Bull Market'
        },
        'crypto-winter-2022': {
            'start': '2021-11-10',
            'end': '2022-11-21',
            'name': '2022 Crypto Winter'
        },
        'black-monday-1987': {
            'start': '1987-10-14',
            'end': '1987-10-19',
            'name': 'Black Monday 1987'
        },
        '2022-bear-market': {
            'start': '2022-01-03',
            'end': '2022-10-12',
            'name': '2022 Bear Market'
        }
    }
    
    # Proxy tickers for asset classes when specific ticker isn't available
    PROXY_TICKERS = {
        'stock': '^GSPC',    # S&P 500 index with deep history
        'etf': '^GSPC',      # ETF fallback to market index for older periods
        'bond': '^TNX',      # 10Y Treasury yield proxy with older history
        'crypto': 'BTC-USD', # Bitcoin (available from ~2014)
        'commodity': 'GC=F'  # Gold futures with older history
    }

    CRYPTO_SYMBOL_MAP = {
        'BTC': 'BTC-USD',
        'ETH': 'ETH-USD',
        'SOL': 'SOL-USD',
        'ADA': 'ADA-USD',
        'DOT': 'DOT-USD',
        'BNB': 'BNB-USD',
        'XRP': 'XRP-USD',
        'DOGE': 'DOGE-USD',
    }

    KNOWN_INCEPTION_DATES = {
        'SPY': '1993-01-29',
        'QQQ': '1999-03-10',
        'NVDA': '1999-01-22',
        'TSLA': '2010-06-29',
        'BTC-USD': '2014-09-17',
        'ETH-USD': '2017-11-09',
        'SOL-USD': '2020-04-10',
        'ADA-USD': '2017-10-01',
        'DOT-USD': '2020-08-20',
        'BNB-USD': '2017-10-01',
        'XRP-USD': '2014-09-17',
        'DOGE-USD': '2014-09-17',
    }
    
    def __init__(self):
        self._price_cache = {}

    def _is_before_symbol_inception(self, symbol, start_date, end_date):
        inception = self.KNOWN_INCEPTION_DATES.get(symbol)
        if not inception:
            return False

        period_end = datetime.strptime(end_date, '%Y-%m-%d').date()
        inception_date = datetime.strptime(inception, '%Y-%m-%d').date()
        return period_end < inception_date

    def _normalize_symbol(self, symbol, asset_class):
        s = str(symbol).strip().upper()

        if asset_class == 'crypto':
            if s.endswith('-USD'):
                return s
            return self.CRYPTO_SYMBOL_MAP.get(s, f"{s}-USD")

        return s

    def _extract_close_series(self, data):
        if data is None or data.empty:
            return None

        close_data = data.get('Close')
        if close_data is None:
            return None

        if isinstance(close_data, pd.DataFrame):
            # yfinance may return a single-column DataFrame or MultiIndex columns.
            close_series = close_data.iloc[:, 0]
        else:
            close_series = close_data

        close_series = pd.to_numeric(close_series, errors='coerce').dropna()
        if close_series.empty:
            return None

        return close_series

    def _download_close_series(self, symbol, start_date, end_date):
        cache_key = (symbol, start_date, end_date)
        if cache_key in self._price_cache:
            return self._price_cache[cache_key]

        if self._is_before_symbol_inception(symbol, start_date, end_date):
            self._price_cache[cache_key] = None
            return None

        data = yf.download(
            symbol,
            start=start_date,
            end=end_date,
            progress=False,
            auto_adjust=True,
            threads=False,
        )
        close_series = self._extract_close_series(data)
        self._price_cache[cache_key] = close_series
        return close_series

    def _get_effective_series(self, symbol, asset_class, start_date, end_date):
        normalized_symbol = self._normalize_symbol(symbol, asset_class)
        symbol_series = self._download_close_series(normalized_symbol, start_date, end_date)

        if symbol_series is not None and len(symbol_series) >= 2:
            return symbol_series, normalized_symbol, False

        proxy = self.PROXY_TICKERS.get(asset_class, 'SPY')
        proxy_series = self._download_close_series(proxy, start_date, end_date)

        if proxy_series is not None and len(proxy_series) >= 2:
            return proxy_series, proxy, True

        return None, normalized_symbol, True
    
    def calculate_scenario(self, holdings, scenario_id):
        """
        Calculate how portfolio would perform in historical scenario
        
        Args:
            holdings: List of dicts with {symbol, quantity, currentValue, assetClass}
            scenario_id: ID of the scenario to simulate
            
        Returns:
            Dict with totalReturn, maxDrawdown, volatility, affectedAssets, timeline
        """
        if scenario_id not in self.SCENARIOS:
            raise ValueError(f"Unknown scenario: {scenario_id}")
        
        scenario = self.SCENARIOS[scenario_id]
        start_date = scenario['start']
        end_date = scenario['end']

        # Reset request-scoped cache to keep repeated downloads low and deterministic.
        self._price_cache = {}
        
        # Calculate initial portfolio value
        initial_value = float(sum(float(h.get('currentValue', 0) or 0) for h in holdings))
        if initial_value <= 0:
            raise ValueError("Portfolio total value must be greater than zero")
        
        # Fetch historical data for all holdings
        affected_assets = []
        for holding in holdings:
            symbol = holding['symbol']
            asset_class = holding['assetClass']
            current_value = float(holding['currentValue'])
            
            # Get historical performance
            asset_impact = self._calculate_asset_impact(
                symbol, 
                asset_class, 
                start_date, 
                end_date,
                current_value
            )
            
            affected_assets.append(asset_impact)
        
        # Calculate portfolio-level metrics
        final_value = sum(a['finalValue'] for a in affected_assets)
        total_return = ((final_value - initial_value) / initial_value) * 100
        
        # Generate timeline (60 points for smooth animation)
        timeline = self._generate_timeline(
            holdings, 
            start_date, 
            end_date, 
            initial_value
        )
        
        # Calculate max drawdown from timeline
        portfolio_values = [point['portfolioValue'] for point in timeline]
        max_drawdown = self._calculate_max_drawdown(portfolio_values, initial_value)
        
        # Calculate volatility
        returns = [
            (portfolio_values[i] - portfolio_values[i - 1]) / portfolio_values[i - 1]
            for i in range(1, len(portfolio_values))
            if portfolio_values[i - 1] != 0
        ]
        volatility = float(np.std(returns) * np.sqrt(252) * 100) if returns else 0.0  # Annualized
        
        # Estimate recovery days (simplified)
        recovery_days = max(0, abs(int(total_return * 5)))
        
        return {
            'scenarioId': scenario_id,
            'totalReturn': total_return,
            'maxDrawdown': max_drawdown,
            'recoveryDays': recovery_days,
            'volatility': volatility,
            'affectedAssets': affected_assets,
            'timeline': timeline
        }
    
    def _calculate_asset_impact(self, symbol, asset_class, start_date, end_date, current_value):
        """Calculate impact on a single asset"""
        try:
            series, used_symbol, used_proxy = self._get_effective_series(
                symbol,
                asset_class,
                start_date,
                end_date
            )

            if series is None:
                return {
                    'symbol': symbol,
                    'name': symbol,
                    'initialValue': float(current_value),
                    'finalValue': float(current_value),
                    'percentChange': 0.0,
                    'contribution': 0.0
                }

            first_price = float(series.iloc[0])
            last_price = float(series.iloc[-1])
            if first_price == 0:
                return {
                    'symbol': symbol,
                    'name': symbol,
                    'initialValue': float(current_value),
                    'finalValue': float(current_value),
                    'percentChange': 0.0,
                    'contribution': 0.0
                }

            percent_change = ((last_price - first_price) / first_price) * 100

            # Add extra volatility only when crypto falls back to proxy.
            if used_proxy and asset_class == 'crypto':
                percent_change *= 1.5
            
            final_value = current_value * (1 + percent_change / 100)
            contribution = ((final_value - current_value) / current_value) * 100
            
            return {
                'symbol': symbol,
                'name': symbol,
                'initialValue': float(current_value),
                'finalValue': float(final_value),
                'percentChange': float(percent_change),
                'contribution': float(contribution),
                'sourceSymbol': used_symbol
            }
            
        except Exception as e:
            print(f"Error fetching {symbol}: {e}")
            return {
                'symbol': symbol,
                'name': symbol,
                'initialValue': float(current_value),
                'finalValue': float(current_value),
                'percentChange': 0.0,
                'contribution': 0.0
            }
    
    def _use_proxy_calculation(self, symbol, asset_class, start_date, end_date, current_value):
        """Use proxy ticker when asset data not available"""
        proxy = self.PROXY_TICKERS.get(asset_class, 'SPY')
        
        try:
            data = yf.download(
                proxy, 
                start=start_date, 
                end=end_date, 
                progress=False,
                auto_adjust=True
            )
            
            if not data.empty and len(data) >= 2:
                first_price = data['Close'].iloc[0]
                last_price = data['Close'].iloc[-1]
                percent_change = ((last_price - first_price) / first_price) * 100
                
                # Apply volatility multiplier for certain asset classes
                if asset_class == 'crypto':
                    percent_change *= 1.5  # Crypto is more volatile
                elif asset_class == 'bond':
                    percent_change *= 0.3  # Bonds are less volatile
                
                final_value = current_value * (1 + percent_change / 100)
                contribution = ((final_value - current_value) / current_value) * 100
                
                return {
                    'symbol': symbol,
                    'name': symbol,
                    'initialValue': current_value,
                    'finalValue': final_value,
                    'percentChange': percent_change,
                    'contribution': contribution
                }
        except Exception as e:
            print(f"Error with proxy {proxy}: {e}")
        
        # Ultimate fallback: assume no change
        return {
            'symbol': symbol,
            'name': symbol,
            'initialValue': current_value,
            'finalValue': current_value,
            'percentChange': 0.0,
            'contribution': 0.0
        }
    
    def _generate_timeline(self, holdings, start_date, end_date, initial_value):
        """Generate timeline with 60 points for smooth animation"""
        timeline = []

        # Build aligned value paths for each holding.
        all_paths = []
        for holding in holdings:
            symbol = holding['symbol']
            asset_class = holding['assetClass']

            try:
                series, _, used_proxy = self._get_effective_series(
                    symbol,
                    asset_class,
                    start_date,
                    end_date
                )

                if series is None or len(series) < 2:
                    continue

                start_price = float(series.iloc[0])
                if start_price == 0:
                    continue

                normalized = series / start_price
                value_path = normalized * float(holding['currentValue'])

                if used_proxy and asset_class == 'crypto':
                    # Increase movement around start value when crypto uses proxy path.
                    value_path = float(holding['currentValue']) + (value_path - float(holding['currentValue'])) * 1.5

                all_paths.append(value_path.rename(symbol))
            except Exception as e:
                print(f"Error in timeline for {symbol}: {e}")
                continue

        if not all_paths:
            # Fallback: linear interpolation
            for i in range(60):
                timeline.append({
                    'date': start_date,
                    'portfolioValue': initial_value,
                    'percentChange': 0.0,
                    'timestamp': int(datetime.now().timestamp() * 1000) + i * 50
                })
            return timeline

        combined = pd.concat(all_paths, axis=1, join='inner').dropna()
        if combined.empty:
            # Fallback
            for i in range(60):
                timeline.append({
                    'date': start_date,
                    'portfolioValue': initial_value,
                    'percentChange': 0.0,
                    'timestamp': int(datetime.now().timestamp() * 1000) + i * 50
                })
            return timeline

        portfolio_series = combined.sum(axis=1)

        # Sample 60 points evenly across the timeline
        indices = np.linspace(0, len(portfolio_series) - 1, min(60, len(portfolio_series)), dtype=int)

        for idx in indices:
            date = portfolio_series.index[idx]
            portfolio_value = float(portfolio_series.iloc[idx])
            percent_change = ((portfolio_value - initial_value) / initial_value) * 100

            timeline.append({
                'date': date.strftime('%Y-%m-%d'),
                'portfolioValue': portfolio_value,
                'percentChange': float(percent_change),
                'timestamp': int(date.timestamp() * 1000)
            })

        return timeline
    
    def _calculate_max_drawdown(self, values, initial_value):
        """Calculate maximum drawdown as percentage"""
        numeric_values = np.asarray(values, dtype=float)
        if numeric_values.size == 0:
            return 0.0
        min_value = float(np.min(numeric_values))
        max_drawdown = ((min_value - initial_value) / initial_value) * 100
        return float(max_drawdown)


# Singleton instance
scenario_service = ScenarioService()

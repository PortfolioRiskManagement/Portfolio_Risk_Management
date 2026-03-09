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
        'stock': 'SPY',      # S&P 500 as proxy for general stocks
        'etf': 'SPY',        # S&P 500 as proxy for ETFs
        'bond': 'TLT',       # Long-term Treasury bonds
        'crypto': 'BTC-USD', # Bitcoin (available from ~2014)
        'commodity': 'GLD'   # Gold
    }
    
    def __init__(self):
        pass
    
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
        
        # Calculate initial portfolio value
        initial_value = sum(h['currentValue'] for h in holdings)
        
        # Fetch historical data for all holdings
        affected_assets = []
        timeline_data = []
        
        for holding in holdings:
            symbol = holding['symbol']
            asset_class = holding['assetClass']
            current_value = holding['currentValue']
            
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
        returns = [(portfolio_values[i] - portfolio_values[i-1]) / portfolio_values[i-1] 
                   for i in range(1, len(portfolio_values))]
        volatility = np.std(returns) * np.sqrt(252) * 100  # Annualized
        
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
            # Try to fetch actual historical data
            data = yf.download(
                symbol, 
                start=start_date, 
                end=end_date, 
                progress=False,
                auto_adjust=True
            )
            
            if data.empty or len(data) < 2:
                # Use proxy if data not available
                return self._use_proxy_calculation(
                    symbol, 
                    asset_class, 
                    start_date, 
                    end_date, 
                    current_value
                )
            
            # Calculate return for this period
            first_price = data['Close'].iloc[0]
            last_price = data['Close'].iloc[-1]
            percent_change = ((last_price - first_price) / first_price) * 100
            
            final_value = current_value * (1 + percent_change / 100)
            contribution = ((final_value - current_value) / current_value) * 100
            
            return {
                'symbol': symbol,
                'name': symbol,  # In production, fetch full name
                'initialValue': current_value,
                'finalValue': final_value,
                'percentChange': percent_change,
                'contribution': contribution
            }
            
        except Exception as e:
            print(f"Error fetching {symbol}: {e}")
            return self._use_proxy_calculation(
                symbol, 
                asset_class, 
                start_date, 
                end_date, 
                current_value
            )
    
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
        
        # Fetch historical data for all holdings
        all_data = {}
        for holding in holdings:
            symbol = holding['symbol']
            asset_class = holding['assetClass']
            
            try:
                data = yf.download(
                    symbol, 
                    start=start_date, 
                    end=end_date, 
                    progress=False,
                    auto_adjust=True
                )
                
                if not data.empty:
                    all_data[symbol] = {
                        'data': data,
                        'weight': holding['currentValue'] / initial_value
                    }
                else:
                    # Use proxy
                    proxy = self.PROXY_TICKERS.get(asset_class, 'SPY')
                    proxy_data = yf.download(
                        proxy, 
                        start=start_date, 
                        end=end_date, 
                        progress=False,
                        auto_adjust=True
                    )
                    if not proxy_data.empty:
                        all_data[symbol] = {
                            'data': proxy_data,
                            'weight': holding['currentValue'] / initial_value
                        }
            except Exception as e:
                print(f"Error in timeline for {symbol}: {e}")
                continue
        
        if not all_data:
            # Fallback: linear interpolation
            for i in range(60):
                t = i / 59
                timeline.append({
                    'date': start_date,
                    'portfolioValue': initial_value,
                    'percentChange': 0.0,
                    'timestamp': int(datetime.now().timestamp() * 1000) + i * 50
                })
            return timeline
        
        # Get common date index
        all_dates = None
        for symbol_data in all_data.values():
            if all_dates is None:
                all_dates = symbol_data['data'].index
            else:
                all_dates = all_dates.intersection(symbol_data['data'].index)
        
        if len(all_dates) == 0:
            # Fallback
            for i in range(60):
                timeline.append({
                    'date': start_date,
                    'portfolioValue': initial_value,
                    'percentChange': 0.0,
                    'timestamp': int(datetime.now().timestamp() * 1000) + i * 50
                })
            return timeline
        
        # Sample 60 points evenly across the timeline
        indices = np.linspace(0, len(all_dates) - 1, min(60, len(all_dates)), dtype=int)
        
        for idx in indices:
            date = all_dates[idx]
            portfolio_value = 0
            
            for symbol, info in all_data.items():
                if date in info['data'].index:
                    first_price = info['data']['Close'].iloc[0]
                    current_price = info['data'].loc[date, 'Close']
                    return_pct = (current_price - first_price) / first_price
                    portfolio_value += initial_value * info['weight'] * (1 + return_pct)
            
            percent_change = ((portfolio_value - initial_value) / initial_value) * 100
            
            timeline.append({
                'date': date.strftime('%Y-%m-%d'),
                'portfolioValue': portfolio_value,
                'percentChange': percent_change,
                'timestamp': int(date.timestamp() * 1000)
            })
        
        return timeline
    
    def _calculate_max_drawdown(self, values, initial_value):
        """Calculate maximum drawdown as percentage"""
        min_value = min(values)
        max_drawdown = ((min_value - initial_value) / initial_value) * 100
        return max_drawdown


# Singleton instance
scenario_service = ScenarioService()

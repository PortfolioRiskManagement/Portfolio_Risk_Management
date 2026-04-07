# Scenario Lab Feature 🧪

## Overview
The Scenario Lab is an interactive tool that allows users to visualize how their current portfolio would have performed during historical market events. It features **REAL HISTORICAL DATA** from yfinance, real-time animated simulations, and an editable portfolio interface.

## ✅ Real Data Verification
This feature uses **ACTUAL HISTORICAL PRICES** from yfinance, NOT simulated or mocked data. 

Check the browser console when running a scenario:
```
✅ Scenario Lab: Using REAL HISTORICAL DATA from yfinance backend
📊 Total Return: -61.18%
📉 Max Drawdown: -61.18%
```

If you see a warning about mock data, ensure the Flask backend is running on port 5001.

## Key Features

### 📊 Real Historical Data
- Fetches actual historical prices via yfinance
- Asset-specific proxy tickers for missing data
- See `/scenario_service.py` for implementation

### ✏️ Interactive Portfolio Editor
- **Edit** holdings: Adjust quantity and value
- **Remove** holdings: Test different compositions
- **Add new stocks**: Live search with backend API
- Real-time scenario recalculation

### 🎬 Dramatic Animation
- 60-point smooth timeline
- Pause at dramatic moments (2.5 seconds)
- 20 FPS for cinematic effect
- Canvas-based rendering

## Architecture

### Directory Structure
```
src/features/scenario/
├── components/
│   ├── AnimatedScenarioGraph.tsx         # Real-time animated graph with canvas rendering
│   ├── ScenarioGrid.tsx                  # Scenario selection cards (crashes, bull runs)
│   ├── ScenarioResultsModal.tsx          # Detailed results breakdown after animation
│   └── PortfolioEditorForScenario.tsx    # NEW: Interactive portfolio editor with search
├── hooks/
│   └── useScenarioLab.ts                 # Main state management hook + updateHoldings()
├── pages/
│   └── ScenarioLabPage.tsx               # Main page component (wrapped in PageShell)
├── services/
│   └── scenarioService.ts                # API integration with real data verification
└── types/
    └── scenario.types.ts                 # TypeScript definitions
```

## Backend
```
scenario_service.py                        # Python service using yfinance for real data
app.py                                     # Flask routes: /api/scenario/calculate, /api/search
```

## Key Features

### 1. Historical Scenarios
8 pre-configured scenarios including:
- **Crashes**: 2008 Financial Crisis, COVID-2020, Dot-Com Bubble, Black Monday 1987, Crypto Winter 2022, 2022 Bear Market
- **Bull Runs**: COVID Recovery 2020, Post-2008 Recovery

Each scenario includes:
- Historical date ranges
- Severity ratings (for crashes)
- Historical average returns
- Descriptive information

### 2. Asset-Class Specific Calculations
The service calculates impact based on asset classes:
- **Stocks**: Standard market correlation
- **ETFs**: Similar to stocks but slightly smoothed
- **Bonds**: Often inverse or neutral to crashes
- **Crypto**: High volatility, unique patterns (e.g., COVID recovery surge)
- **Commodities**: Mixed responses depending on scenario

### 3. Real-Time Animation
- 60 FPS smooth animation
- Canvas-based rendering for performance
- Easing functions that match historical patterns:
  - Crashes: Accelerated drop (quadratic easing)
  - Bull runs: Gradual growth (cubic easing)
  - Black Monday: Sudden vertical drop
- Dynamic popup appears at dramatic moment (60% for crashes, 80% for gains)

### 4. Detailed Analytics
Post-animation modal shows:
- Total return %
- Maximum drawdown
- Portfolio volatility
- Recovery time estimate
- Per-asset breakdown with contribution analysis
- Automated insights based on results

## Backend Integration Strategy

### Current Implementation (Mock Data)
The service currently generates realistic mock data based on:
- Asset class multipliers per scenario
- Portfolio composition
- Historical patterns

### Production Backend Requirements

#### Endpoint: `/api/scenario/calculate`
**Request:**
```typescript
{
  portfolioId?: string,
  holdings: [
    {
      symbol: string,
      quantity: number,
      currentValue: number,
      assetClass: 'stock' | 'crypto' | 'bond' | 'etf' | 'commodity'
    }
  ],
  scenarioId: string
}
```

**Response:**
```typescript
{
  scenarioId: string,
  totalReturn: number,
  maxDrawdown: number,
  recoveryDays: number,
  volatility: number,
  affectedAssets: [
    {
      symbol: string,
      name: string,
      initialValue: number,
      finalValue: number,
      percentChange: number,
      contribution: number  // % contribution to overall portfolio change
    }
  ],
  timeline: [
    {
      date: string,
      portfolioValue: number,
      percentChange: number,
      timestamp: number
    }
  ]
}
```

#### Backend Calculation Logic
1. **Fetch Historical Data**: Get actual historical prices for each asset during scenario period
2. **Handle Missing Data**: For assets that didn't exist (e.g., Bitcoin in 2008), use proxy correlations:
   - Crypto → High-beta tech stocks multiplied by volatility factor
   - New ETFs → Use underlying index historical data
3. **Calculate Timeline**: Generate 60-100 data points across the scenario period
4. **Asset Correlations**: Use actual historical correlations between assets
5. **Volatility Adjustments**: Account for different volatility regimes

### Data Sources for Backend
- **Stock/ETF data**: Yahoo Finance, Alpha Vantage, Polygon.io
- **Crypto data**: CoinGecko, CryptoCompare
- **Bonds**: Treasury Direct, Bloomberg
- **Correlations**: Calculate from historical covariance matrices

## Component Details

### AnimatedScenarioGraph
- Uses HTML5 Canvas for high-performance rendering
- Implements custom easing functions per scenario type
- Shows real-time value updates
- Displays dramatic popup at calculated moment
- Progress bar shows animation completion

### ScenarioGrid
- Categorizes scenarios (crashes vs bull runs)
- Visual severity indicators
- Hover effects and selection states
- Disabled state during animation

### ScenarioResultsModal
- Comprehensive breakdown of all impacts
- Visual comparison bars
- Per-asset contribution analysis
- Automated insights generation
- Export functionality (placeholder)

## Usage Flow

1. **Load Page**: User sees current portfolio value and holdings preview
2. **Select Scenario**: Grid of historical scenarios with icons and descriptions
3. **Animation Start**: Graph begins animating from current value
4. **Dramatic Moment**: Popup appears showing event details
5. **Animation Complete**: Results modal opens with full breakdown
6. **Review Results**: User sees detailed impact on each asset
7. **Try Another**: Reset and select different scenario

## Technical Considerations

### Performance
- Canvas rendering for smooth 60 FPS animation
- Timeline limited to 60 points for optimal performance
- Memoization in components to prevent unnecessary re-renders

### State Management
- Centralized in `useScenarioLab` hook
- Clear separation of animation state vs. results state
- Error handling for API failures with graceful fallback to mock data

### Accessibility
- Keyboard navigation support on scenario cards
- Clear visual feedback for selection and loading states
- Descriptive text for screen readers

## Future Enhancements

1. **Custom Scenarios**: Let users create custom date ranges
2. **Multi-Scenario Comparison**: Show multiple scenarios side-by-side
3. **What-If Analysis**: Adjust portfolio allocation and re-run
4. **Stress Testing**: Combine multiple events (e.g., crash + inflation)
5. **PDF Export**: Generate detailed PDF reports
6. **Save Favorite Scenarios**: Bookmark scenarios to track over time
7. **Real-Time Backtesting**: Use actual historical prices from backend
8. **Machine Learning**: Predict portfolio behavior in future scenarios based on ML models

## Dependencies
- React 18+
- TypeScript
- Tailwind CSS
- Canvas API (native)
- Existing API client service

## Testing Strategy
1. **Unit Tests**: Test calculations in scenarioService
2. **Integration Tests**: Test hook with various portfolio compositions
3. **Visual Tests**: Verify animations render correctly
4. **Performance Tests**: Ensure 60 FPS maintained on various devices
5. **End-to-End**: Full flow from selection to results

## Notes for Backend Team
- The frontend expects 60-100 timeline points for smooth animation
- Asset class detection is currently basic - backend should provide accurate classifications
- Consider caching scenario calculations since they're deterministic
- Rate limiting may be needed if calculations are expensive
- Consider pre-calculating common portfolio archetypes

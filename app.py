from flask import Flask, request, jsonify
from flask_cors import CORS

from dataload.data_loader import PortfolioLoader
from dataload.portfolio_analyzer import PortfolioAnalyzer
from scenario_service import scenario_service

app = Flask(__name__)

# Enable CORS with explicit configuration
CORS(app, 
     origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"],
     allow_headers=["Content-Type"],
     methods=["GET", "POST", "OPTIONS"],
     supports_credentials=True)

@app.route('/api/portfolio/analyze', methods=['POST', 'OPTIONS'])
def analyze_portfolio():
    if request.method == "OPTIONS":
        return "", 204
    
    try:
        data = request.json
        risk_tolerance = data.get("risk_tolerance", "medium")
        lookback_days = data.get("lookback_days", 504)
        
        # Use provided portfolio or create mock
        portfolio_data = data.get("portfolio_data")
        if not portfolio_data:
            df = PortfolioLoader.create_mock_portfolio()
        else:
            import pandas as pd
            df = pd.DataFrame(portfolio_data)
        
        analyzer = PortfolioAnalyzer(
            portfolio_data=df,
            risk_tolerance=risk_tolerance,
            lookback_days=lookback_days
        )
        
        report = analyzer.get_summary_report()
        return jsonify({"success": True, "data": report}), 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/mock-portfolio', methods=['GET', 'OPTIONS'])
def get_mock_portfolio():
    if request.method == "OPTIONS":
        return "", 204
    
    try:
        df = PortfolioLoader.create_mock_portfolio()
        portfolio = dict(zip(df['Ticker'], df['Weight']))
        return jsonify(portfolio)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/scenario/calculate', methods=['POST', 'OPTIONS'])
def calculate_scenario():
    """
    Calculate historical scenario impact on portfolio
    
    Request body:
    {
        "holdings": [
            {
                "symbol": "AAPL",
                "quantity": 10,
                "currentValue": 1500,
                "assetClass": "stock"
            }
        ],
        "scenarioId": "2008-financial-crisis"
    }
    """
    if request.method == "OPTIONS":
        return "", 204
    
    try:
        data = request.json
        holdings = data.get('holdings', [])
        scenario_id = data.get('scenarioId')
        
        if not holdings:
            return jsonify({"success": False, "error": "No holdings provided"}), 400
        
        if not scenario_id:
            return jsonify({"success": False, "error": "No scenarioId provided"}), 400
        
        # Calculate scenario impact
        result = scenario_service.calculate_scenario(holdings, scenario_id)
        
        return jsonify({"success": True, "data": result}), 200
        
    except Exception as e:
        print(f"Scenario calculation error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/search', methods=['GET', 'OPTIONS'])
def search_stock():
    """
    Search for stock/crypto/asset by symbol or name
    Query param: q (search query)
    """
    if request.method == "OPTIONS":
        return "", 204
    
    try:
        query = request.args.get('q', '').upper().strip()
        
        if not query:
            return jsonify({"success": False, "error": "No search query provided"}), 400
        
        # Simple search - in production, use a proper API like yfinance Ticker.info
        # For now, return the query as a valid symbol
        results = []
        
        # Common symbols that might match
        common_stocks = {
            'AAPL': {'name': 'Apple Inc.', 'type': 'stock'},
            'MSFT': {'name': 'Microsoft Corporation', 'type': 'stock'},
            'GOOGL': {'name': 'Alphabet Inc.', 'type': 'stock'},
            'AMZN': {'name': 'Amazon.com Inc.', 'type': 'stock'},
            'TSLA': {'name': 'Tesla Inc.', 'type': 'stock'},
            'BTC-USD': {'name': 'Bitcoin USD', 'type': 'crypto'},
            'ETH-USD': {'name': 'Ethereum USD', 'type': 'crypto'},
            'VOO': {'name': 'Vanguard S&P 500 ETF', 'type': 'etf'},
            'SPY': {'name': 'SPDR S&P 500 ETF Trust', 'type': 'etf'},
            'GLD': {'name': 'SPDR Gold Shares', 'type': 'commodity'},
            'BND': {'name': 'Vanguard Total Bond Market ETF', 'type': 'bond'},
            'TLT': {'name': 'iShares 20+ Year Treasury Bond ETF', 'type': 'bond'}
        }
        
        # Exact match
        if query in common_stocks:
            results.append({
                'symbol': query,
                'name': common_stocks[query]['name'],
                'type': common_stocks[query]['type']
            })
        
        # Partial matches
        for symbol, info in common_stocks.items():
            if query in symbol or query in info['name'].upper():
                if symbol != query:  # Don't duplicate exact match
                    results.append({
                        'symbol': symbol,
                        'name': info['name'],
                        'type': info['type']
                    })
        
        # If no matches, assume it's a valid symbol
        if not results:
            results.append({
                'symbol': query,
                'name': query,
                'type': 'stock'
            })
        
        return jsonify({"success": True, "results": results[:10]}), 200
        
    except Exception as e:
        print(f"Search error: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 400

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5001)

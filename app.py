from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from urllib.parse import quote
from urllib.request import urlopen, Request

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
        query = request.args.get('q', '').strip()
        
        if not query:
            return jsonify({"success": False, "error": "No search query provided"}), 400

        encoded_query = quote(query)
        search_url = f"https://query1.finance.yahoo.com/v1/finance/search?q={encoded_query}&quotesCount=10&newsCount=0"
        req = Request(search_url, headers={"User-Agent": "Mozilla/5.0"})

        with urlopen(req, timeout=6) as response:
            payload = json.loads(response.read().decode('utf-8'))

        quotes = payload.get('quotes', []) if isinstance(payload, dict) else []

        def classify_asset(quote_entry):
            quote_type = (quote_entry.get('quoteType') or '').lower()
            symbol = (quote_entry.get('symbol') or '').upper()
            exchange = (quote_entry.get('exchange') or '').upper()

            if quote_type == 'cryptocurrency' or symbol.endswith('-USD'):
                return 'crypto'
            if quote_type == 'etf':
                return 'etf'
            if quote_type in ['mutualfund', 'money market']:
                return 'bond'
            if exchange in ['CBT', 'CMX', 'NYM']:
                return 'commodity'
            return 'stock'

        results = []
        seen_symbols = set()

        for quote_entry in quotes:
            symbol = (quote_entry.get('symbol') or '').upper().strip()
            if not symbol or symbol in seen_symbols:
                continue

            name = (quote_entry.get('shortname') or quote_entry.get('longname') or symbol).strip()
            results.append({
                'symbol': symbol,
                'name': name,
                'type': classify_asset(quote_entry)
            })
            seen_symbols.add(symbol)

        if not results:
            results.append({
                'symbol': query.upper(),
                'name': query.upper(),
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

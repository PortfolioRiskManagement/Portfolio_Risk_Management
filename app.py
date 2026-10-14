from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from urllib.parse import quote
from urllib.request import urlopen, Request
import time

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
        data = request.get_json(silent=True) or {}
        risk_tolerance = data.get("risk_tolerance", "medium")
        lookback_days = data.get("lookback_days", 504)

        if not isinstance(risk_tolerance, str) or not risk_tolerance.strip():
            return jsonify({"success": False, "error": "risk_tolerance must be a non-empty string"}), 400
        if isinstance(lookback_days, bool) or not isinstance(lookback_days, int) or lookback_days <= 0:
            return jsonify({"success": False, "error": "lookback_days must be a positive integer"}), 400
        
        # Use provided portfolio or create mock
        portfolio_data = data.get("portfolio_data")
        if not portfolio_data:
            df = PortfolioLoader.create_mock_portfolio()
        else:
            import pandas as pd
            df = pd.DataFrame(portfolio_data)
            if 'Ticker' in df.columns:
                df['Ticker'] = df['Ticker'].astype(str).str.upper().map(yahoo_symbol)
        
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

CRYPTO_SYMBOLS = {"BTC", "ETH", "SOL", "ADA", "DOGE", "XRP", "LTC"}

def yahoo_symbol(symbol):
    """Yahoo lists crypto as BTC-USD, ETH-USD, etc."""
    return f"{symbol}-USD" if symbol in CRYPTO_SYMBOLS else symbol

def fetch_yahoo_chart(symbol, params):
    chart_url = f"https://query1.finance.yahoo.com/v8/finance/chart/{quote(yahoo_symbol(symbol))}?{params}"
    req = Request(chart_url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=6) as response:
        payload = json.loads(response.read().decode('utf-8'))
    result = payload.get('chart', {}).get('result', []) if isinstance(payload, dict) else []
    return result[0] if result else None

@app.route('/api/quote', methods=['GET', 'OPTIONS'])
def get_quote():
    """
    Fetch current market price for a ticker symbol from Yahoo Finance
    Query param: symbol (ticker)
    """
    if request.method == "OPTIONS":
        return "", 204

    try:
        symbol = request.args.get('symbol', '').strip().upper()
        if not symbol:
            return jsonify({"success": False, "error": "No symbol provided"}), 400

        entry = fetch_yahoo_chart(symbol, "interval=1d&range=1d")
        if not entry:
            return jsonify({"success": False, "error": "Symbol not found"}), 404

        meta = entry.get('meta', {}) if isinstance(entry, dict) else {}
        price = meta.get('regularMarketPrice')
        if price is None:
            return jsonify({"success": False, "error": "Price unavailable"}), 404

        previous_close = meta.get('previousClose') or meta.get('chartPreviousClose')
        change_percent = (
            (float(price) - float(previous_close)) / float(previous_close) * 100
            if previous_close else None
        )

        return jsonify({
            "success": True,
            "symbol": symbol,
            "price": float(price),
            "previousClose": float(previous_close) if previous_close else None,
            "changePercent": change_percent,
        }), 200

    except Exception as e:
        print(f"Quote error: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/history', methods=['GET', 'OPTIONS'])
def get_history():
    """
    Fetch daily closing prices from Yahoo Finance
    Query params: symbol (ticker), days (lookback window, default 30)
    """
    if request.method == "OPTIONS":
        return "", 204

    try:
        symbol = request.args.get('symbol', '').strip().upper()
        if not symbol:
            return jsonify({"success": False, "error": "No symbol provided"}), 400
        days = max(1, min(int(request.args.get('days', 30)), 3650))

        end = int(time.time())
        start = end - days * 86400
        entry = fetch_yahoo_chart(symbol, f"interval=1d&period1={start}&period2={end}")
        if not entry:
            return jsonify({"success": False, "error": "Symbol not found"}), 404

        timestamps = entry.get('timestamp') or []
        closes = ((entry.get('indicators') or {}).get('quote') or [{}])[0].get('close') or []

        # Yahoo leaves gaps as null on non-trading days; drop them
        points = [(t * 1000, float(c)) for t, c in zip(timestamps, closes) if c is not None]

        return jsonify({
            "success": True,
            "symbol": symbol,
            "times": [t for t, _ in points],
            "prices": [c for _, c in points],
        }), 200

    except Exception as e:
        print(f"History error: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 400

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5001)

import time
import yfinance as yf
from backend.models import Stock, StockFactory

CATEGORIES = {
    "tech": [
        "NVDA", "AAPL", "MSFT", "META", "GOOGL", "AMD", "INTC", "PLTR", "NFLX", "CRM",
        "ORCL", "ADBE", "AVGO", "QCOM", "CSCO", "IBM", "NOW", "UBER", "SHOP", "PANW"
    ],
    "finance": [
        "JPM", "BAC", "WFC", "GS", "MS", "V", "MA", "PYPL", "XYZ", "COIN",
        "C", "AXP", "BLK", "SCHW", "USB", "PNC", "COF", "BK", "HOOD", "SOFI"
    ],
    "energy": [
        "XOM", "CVX", "COP", "SLB", "EOG", "MPC", "PSX", "OXY", "VLO", "HAL",
        "BKR", "KMI", "WMB", "OKE", "DVN", "FANG", "APA", "EQT", "TRGP", "CTRA"
    ],
    "crypto": [
        "BTC-USD", "ETH-USD", "SOL-USD", "DOGE-USD", "XRP-USD", "ADA-USD", "BNB-USD", "TRX-USD", "AVAX-USD", "SHIB-USD",
        "LINK-USD", "DOT-USD", "BCH-USD", "LTC-USD", "NEAR-USD", "XLM-USD", "HBAR-USD", "ATOM-USD", "ICP-USD", "AAVE-USD"
    ]
}

# Cache stores results per category: { "tech": {"time": 123456, "stocks": [...]} }
_cache: dict[str, dict] = {}
CACHE_TTL = 60  # seconds


def calc_pct(current: float, past: float) -> float:
    if past == 0:
        return 0.0
    return round(((current - past) / past) * 100, 2)


def get_stocks_by_category(category: str) -> list[Stock]:
    category = category.lower()
    if category not in CATEGORIES:
        category = "tech"

    now = time.time()
    if category in _cache and (now - _cache[category]["time"] < CACHE_TTL):
        return _cache[category]["stocks"]

    tickers = CATEGORIES[category]

    df = yf.download(
        tickers,
        period="1y",
        interval="1d",
        group_by="ticker",
        progress=False
    )

    stocks: list[Stock] = []

    for symbol in tickers:
        try:
            closes = df[symbol]["Close"].dropna()
            if len(closes) < 2:
                continue

            curr_price = float(closes.iloc[-1])
            price_1d_ago = float(closes.iloc[-2])
            price_2d_ago = float(closes.iloc[-3]) if len(closes) >= 3 else price_1d_ago
            price_1w_ago = float(closes.iloc[-6]) if len(closes) >= 6 else float(closes.iloc[0])
            price_1y_ago = float(closes.iloc[0])

            stock_obj = StockFactory.create_stock(
                symbol=symbol,
                category=category,
                price=curr_price,
                pct_1d=calc_pct(curr_price, price_1d_ago),
                pct_1w=calc_pct(curr_price, price_1w_ago),
                pct_1y=calc_pct(curr_price, price_1y_ago),
                pct_prev_1d=calc_pct(price_1d_ago, price_2d_ago) if price_2d_ago else None
            )
            stocks.append(stock_obj)

        except Exception as e:
            print(f"Skipping {symbol}: {e}")

    _cache[category] = {"time": now, "stocks": stocks}
    return stocks
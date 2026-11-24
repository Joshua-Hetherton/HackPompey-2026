from flask import Flask, jsonify, render_template
from flask_cors import CORS
from backend import CATEGORIES, get_stocks_by_category

app = Flask(__name__, static_folder="frontend", template_folder="templates")
CORS(app)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/categories")
def api_categories():
    """Returns the list of available categories so the frontend can build tabs."""
    return jsonify({
        "status": "ok",
        "categories": list(CATEGORIES.keys())
    })

@app.route("/test")
def test_page():
    return render_template("test.html")

@app.route("/api/market")
@app.route("/api/market/<category>")
def api_market(category="tech"):
    """Returns the Stock objects for a category (defaults to 'tech')."""
    stocks = get_stocks_by_category(category)
    return jsonify({
        "status": "ok",
        "category": category.lower(),
        "souls": [stock.to_dict() for stock in stocks]
    })


if __name__ == "__main__":
    app.run(debug=True, port=9000)
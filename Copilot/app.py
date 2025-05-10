from flask import Flask, render_template, request, jsonify
import requests
from flask_cors import CORS
import logging
from config import API_KEY

app = Flask(__name__, static_folder='static', static_url_path='/static')
CORS(app)  # Enable CORS for all routes

# AIML API Configuration
URL = "https://api.aimlapi.com/v1/chat/completions"

# Configure logging
logging.basicConfig(level=logging.INFO)

@app.route("/")
def home():
    logging.info("🏠 Home route accessed")
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    logging.info("📥 /chat route accessed")
    try:
        user_input = request.json.get("message")
        logging.info(f"📩 Received user input: {user_input}")

        if not user_input:
            return jsonify({"reply": "⚠️ No message provided"}), 400

        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }

        data = {
            "model": "chatgpt-4o-latest",
            "messages": [
                {"role": "system", "content": "You are a predictive maintenance assistant. Answer only queries related to machine failure, logs, and technician notes. Be precise and technical."},
                {"role": "user", "content": user_input}
            ]
        }

        try:
            response = requests.post(URL, headers=headers, json=data, timeout=10)
            if response.status_code == 200:
                ai_reply = response.json().get("choices", [{}])[0].get("message", {}).get("content", "No reply received.")
                return jsonify({"reply": ai_reply})
            else:
                error_message = response.json().get("error", {}).get("message", "Unknown error")
                logging.error(f"⚠️ Error from AI API: {error_message}")
                return jsonify({"reply": f"⚠️ Error contacting AI model: {error_message}"}), 500
        except requests.exceptions.Timeout:
            logging.error("⚠️ Timeout occurred")
            return jsonify({"reply": "⚠️ Request timed out. Please try again later."}), 504

    except Exception as e:
        logging.error(f"❌ Exception: {e}")
        return jsonify({"reply": "⚠️ Server error. Please check your request and try again."}), 500

@app.errorhandler(404)
def page_not_found(e):
    logging.error("❌ 404 Error: Page not found")
    return jsonify({"error": "404 Not Found. Please check the URL or route."}), 404

if __name__ == "__main__":
    logging.info("🚀 Starting Flask server...")
    app.run(debug=True, use_reloader=False)

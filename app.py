

from flask import Flask, request, jsonify, send_from_directory
from pathlib import Path
import sqlite3

app = Flask(__name__)
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "messages.db"

# Create the database table automatically
def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                subject TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

init_db()


# Open the homepage
@app.route("/")
def home():
    return send_from_directory(BASE_DIR, "index.html")


# Serve the website's existing HTML pages
@app.route("/<page>.html")
def pages(page):
    allowed_pages = {"index", "about", "menu", "contact"}
    if page not in allowed_pages:
        return "Page not found", 404
    return send_from_directory(BASE_DIR, f"{page}.html")


# Serve CSS, JavaScript and images
@app.route("/css/<path:filename>")
def css_files(filename):
    return send_from_directory(BASE_DIR / "css", filename)


@app.route("/js/<path:filename>")
def js_files(filename):
    return send_from_directory(BASE_DIR / "js", filename)


@app.route("/images/<path:filename>")
def image_files(filename):
    return send_from_directory(BASE_DIR / "images", filename)


# Receive and save contact messages
@app.route("/api/contact", methods=["POST"])
def contact():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid request."}), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    subject = data.get("subject", "").strip()
    message = data.get("message", "").strip()

    if not all([name, email, subject, message]):
        return jsonify({"error": "Please fill in every field."}), 400

    if len(name) < 2 or len(name) > 100:
        return jsonify({"error": "Name must be 2–100 characters."}), 400

    if len(email) > 254 or "@" not in email:
        return jsonify({"error": "Please enter a valid email address."}), 400

    if subject not in {"general", "visit", "feedback", "other"}:
        return jsonify({"error": "Please choose a valid topic."}), 400

    if len(message) < 10 or len(message) > 5000:
        return jsonify({"error": "Message must be 10–5000 characters."}), 400

    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """INSERT INTO messages (name, email, subject, message)
               VALUES (?, ?, ?, ?)""",
            (name, email, subject, message)
        )

    return jsonify({"message": "Your message has been saved successfully!"}), 201


if __name__ == "__main__":
    app.run(debug=True)

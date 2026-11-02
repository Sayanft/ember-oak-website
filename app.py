


from flask import Flask, request, jsonify, send_from_directory
from pathlib import Path
import sqlite3
import os
import psycopg

app = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "messages.db"

DATABASE_URL = os.environ.get("DATABASE_URL")

# Support both Render and local SQLite
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgres://", "postgresql://", 1
    )


# Create database table
def init_db():
    if DATABASE_URL:
        with psycopg.connect(DATABASE_URL) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    subject TEXT NOT NULL,
                    message TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
    else:
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


@app.route("/")
def home():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/<page>.html")
def pages(page):
    allowed_pages = {"index", "about", "menu", "contact"}

    if page not in allowed_pages:
        return "Page not found", 404

    return send_from_directory(BASE_DIR, f"{page}.html")


@app.route("/css/<path:filename>")
def css_files(filename):
    return send_from_directory(BASE_DIR / "css", filename)


@app.route("/js/<path:filename>")
def js_files(filename):
    return send_from_directory(BASE_DIR / "js", filename)


@app.route("/images/<path:filename>")
def image_files(filename):
    return send_from_directory(BASE_DIR / "images", filename)


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

    if DATABASE_URL:
        with psycopg.connect(DATABASE_URL) as conn:
            conn.execute(
                """
                INSERT INTO messages (name, email, subject, message)
                VALUES (%s, %s, %s, %s)
                """,
                (name, email, subject, message)
            )
    else:
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute(
                """
                INSERT INTO messages (name, email, subject, message)
                VALUES (?, ?, ?, ?)
                """,
                (name, email, subject, message)
            )

    return jsonify({
        "message": "Your message has been saved successfully!"
    }), 201


if __name__ == "__main__":
    app.run(debug=True)


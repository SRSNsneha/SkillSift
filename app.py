from flask import Flask, render_template, jsonify
from flask_cors import CORS
from feature1_backend import feature1_routes
from feature2_backend import feature2_routes
from threading import Lock
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
# Supabase setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_API_KEY = os.getenv("SUPABASE_API_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_API_KEY)

# Flask app setup
app = Flask(__name__)
CORS(app)
app.register_blueprint(feature1_routes)
app.register_blueprint(feature2_routes)

# Lock to avoid race conditions
counter_lock = Lock()
@app.route("/visitor_count")
def visitor_count():
    with counter_lock:
        try:
            # Fetch the current visitor count (assuming one row only)
            response = supabase.table("visitor_counter").select("*").single().execute()
            current_count = response.data.get("count", 0)

            # Increment and update
            new_count = current_count + 1
            supabase.table("visitor_counter").update({"count": new_count}).eq("id", response.data["id"]).execute()

            return jsonify({"count": new_count})

        except Exception as e:
            return jsonify({"error": str(e)}), 500

# Routes
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/feature1")
def feature1_page():
    return render_template("feature1.html")

@app.route("/feature2")
def feature2_page():
    return render_template("feature2.html")

# Run the app
if __name__ == "__main__":
    app.run(debug=True)

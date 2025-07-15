from flask import Flask, render_template
from flask_cors import CORS
from feature1_backend import feature1_routes
from feature2_backend import feature2_routes
from flask import jsonify
from threading import Lock
import os

app = Flask(__name__)
CORS(app)
app.register_blueprint(feature1_routes)
app.register_blueprint(feature2_routes)

counter_lock = Lock()
counter_file = "visitor_counter.txt"

@app.route("/visitor_count")
def visitor_count():
    with counter_lock:
        if not os.path.exists(counter_file):
            with open(counter_file, "w") as f:
                f.write("0")

        with open(counter_file, "r+") as f:
            try:
                count = int(f.read().strip())
            except ValueError:
                count = 0
            count += 1
            f.seek(0)
            f.write(str(count))
            f.truncate()

    return jsonify({"count": count})

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/feature1")
def feature1_page():
    return render_template("feature1.html")

@app.route("/feature2")
def feature2_page():
    return render_template("feature2.html")

if __name__ == "__main__":
    app.run(debug=True)

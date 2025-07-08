from flask import Flask, render_template
from flask_cors import CORS
from feature1_backend import feature1_routes
from feature2_backend import feature2_routes

app = Flask(__name__)
CORS(app)
app.register_blueprint(feature1_routes)
app.register_blueprint(feature2_routes)

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

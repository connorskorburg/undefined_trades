
import requests
from flask import Flask, request, jsonify, render_template, redirect
import json
import time
import datetime
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app)
app.config["CORS_HEADERS"] = "Content-Type"

@app.route("/")
@cross_origin()
def main():
    return jsonify({ "message": "hello world" })

if __name__ == "__main__":
    app.run(debug=True)


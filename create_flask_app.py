import os
template_content = """
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
"""

folder = input("Name of Directory:\n")
if not folder:
    folder = 'app'
os.system('mkdir {}'.format(folder))
requirements = input("List your requirements with a space between them(ex: flask django requests):\n")
if not requirements:
    requirements = 'flask requests flask_cors'
    print('no requirements listed, providing default flask app')
os.system("cd {} && python3 -m venv venv && . venv/bin/activate && pip install {} && pip freeze > requirements.txt".format(folder, requirements))
os.system("cd {} && echo '{}' > {}.py".format(folder, template_content, folder))
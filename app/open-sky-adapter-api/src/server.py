from flask import Flask
app = Flask(__name__)

@app.route("/healthprobe")
def healthprobe():
  return "I'm healthy!"

@app.route("/readinessprobe")
def readinessprobe():
  return "I'm ready!"
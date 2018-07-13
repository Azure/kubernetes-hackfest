from flask import Flask
server = Flask(__name__)

@server.route("/")
def index():
    return "Hello!"

@server.route("/flights/<type>/<code>")
def flights(type, code):
  return 'Hello %s %s.' %(type, code)

@server.route("/healthprobe")
def healthprobe():
  return "I'm healthy!"

@server.route("/readinessprobe")
def readinessprobe():
  return "I'm ready!"


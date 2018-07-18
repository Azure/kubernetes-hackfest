from flask import Flask
from flask import jsonify
import logging
import requests

server = Flask(__name__)

@server.route("/")
def index():
    return "Hello! you probably want the /geojson path."

@server.route("/geojson")
def flights(type, country_code):
  # return 'Hello %s %s.' %(type, country_code)

  data = getOpenSkyLightDataJSON()
  geoJSON = buildGeoJSON(data)

  return jsonify(geoJSON)

@server.route("/healthprobe")
def healthprobe():
  return "I'm healthy!"

@server.route("/readinessprobe")
def readinessprobe():
  return "I'm ready!"

def getOpenSkyLightDataJSON():
  url = 'https://opensky-network.org/api/states/all'
  headers = {'User-Agent': 'Python-Requests'}

  response = requests.get(url=url, headers=headers)
  return response.json()

def buildGeoJSON(data):
  logging.info('Processing files for %d', len(data["states"]))

  rawFlights = data["states"]
  outputFlights = []

  for flight in rawFlights:
    logging.info('Processing flight %s' % flight[1])

    if flight[8] or flight[5]==None:
      logging.info('Flight on ground, ingnoring')
      continue
    else:
      feature = {
        'type': 'Feature',
        'properties': {
          'FlightNumber': "".join(flight[1].split()),
          'Altitude': flight[7],
          'AirSpeed': flight[9],
          'Heading': flight[10]
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [ flight[5], flight[6] ]
        }
      }

      outputFlights.append(feature)
      logging.info('Flight %s processed' % flight[1])
    
  logging.info('All files have been processed successfully')
  logging.info('%d' % len(outputFlights))

  return outputFlights

      


if __name__ == "__server__":
    app.run(host='0.0.0.0', debug=True)
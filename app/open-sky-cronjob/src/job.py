import os
import json
import logging

import requests
import redis

redisHost = 'localhost'
redisPort = 6379
redisServerDB = 0

if 'REDISSERVERHOST' in os.environ:
  redisHost = os.environ['REDISSERVERHOST']

if 'REDISSERVERPORT' in os.environ:
  redisPort = os.environ['REDISSERVERPORT']

if 'REDISSERVERDB' in os.environ:
  redisDB = os.environ['REDISSERVERDB']

redisClient = redis.StrictRedis(host=redisHost, port=redisPort, db=redisServerDB)

pubsub = redisClient.pubsub()

def getOpenSkyDataJSON():
  url = 'https://opensky-network.org/api/states/all'
  headers = {'User-Agent': 'Python-Requests'}

  response = requests.get(url=url, headers=headers)
  originalFlightsJSON = response.json()["states"]
  fixedData = fixRawData(originalFlightsJSON)

def fixRawData(originalFlightJSONData):
  fixedData = []

  for flight in originalFlightJSONData:
    if flight[8] or flight[5]==None:
      continue
    modifiedFlight = fixFlightCode(flight)
    fixedData.append(modifiedFlight)
  
  return fixedData

def fixFlightCode(flight):
  flight[1] = "".join(flight[1].split())
  return flight

rawData = getOpenSkyDataJSON()

pubsub.publish('flights/states/all', rawData)
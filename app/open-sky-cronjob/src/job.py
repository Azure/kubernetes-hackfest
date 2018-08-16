import sys
import os
import json
import logging

import requests
import redis
from pymongo import MongoClient

#############################
# Setup all the things      #
#############################

#############################
# Redis settings            #
#############################
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

#############################
# Mongo Settings            #
#############################
mongoServer = 'localhost'
mongoPort = '27017'
mongoUser = None
mongoPassword = None

if 'MONGOSERVERHOST' in os.environ:
  mongoServer = os.environ['MONGOSERVERHOST']

if 'MONGOSERVERPORT' in os.environ:
  mongoPort = os.environ['MONGOSERVERPORT']

if 'MONGOSERVERUSER' in os.environ:
  mongoUser = os.environ['MONGOSERVERUSER']

if 'MONGOSERVERPASSWORD' in os.environ:
  mongoPassword = os.environ['MONGOSERVERPASSWORD']

mongoClient = MongoClient(mongoServer, mongoPort, username=mongoUser, password=mongoPassword, ssl=True)

#############################
# Custom Functions          #
#############################
def getOpenSkyDataJSON():
  url = 'https://opensky-network.org/api/states/all'
  headers = {'User-Agent': 'Python-Requests'}

  response = requests.get(url=url, headers=headers)
  originalFlightsJSON = response.json()["states"]
  fixedData = fixRawData(originalFlightsJSON)
  rawJSON = json.dumps(fixedData)
  return rawJSON

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

#############################
# Run the actual job        #
#############################
# 1. Get the raw original open sky data
rawData = getOpenSkyDataJSON()

# 2. Publish the current flight data to the cache channel
redisClient.publish('/flights/states/all', rawData)

# 3. Insert documents into Mongo DB server
mongoClient.flights.insert_many(rawData)

# 4. exit job
sys.exit()
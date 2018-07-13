# Open Sky Adapter API Microservice

This microservice will communicate with the [Open Sky](https://opensky-network.org/apidoc/) flight data service and cache the information into our local data stores for current/short term (hot path) and future/long term (cold path) data processing.  This service is trigged by making an http ```GET``` request to ```/geojson```.
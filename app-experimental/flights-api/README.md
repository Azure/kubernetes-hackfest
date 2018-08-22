# Flight-API

This microservice receive and proxy RESTful requests to the backend data store.

It will:
1. Attempt to request data from the ```cache-api```
    - if successful, json will be returned to the ```flight-api```
    - if unsuccessful, the ```data-api``` will be called
    - if successful, json will be returned to the ```flight-api```

2. When data is returned from data services (```cache-api``` or ```data-api```) ```flight-api``` will return json to the requesting client (i.e. ```web-ui```)

3. If there is no data or an error has been returned from data services, ```flight-api``` will send a corresponding http error

## Service Dependencies

1. ```cache-api``` this is the primary source for data
2. ```data-api``` this is the secondary source for data, and is called if ```cache-api``` does not have any data

**NOTE:**
- There is a Time To Live (TTL) for the cache.  If the ```cache-api``` has not been accessed in ```X``` seconds (default is 60 seconds in ```src/server.js```, see [.env_examples](src/.env_examples) for the needed ENV VARS), the key will be removed altogether from ```cache-api```.
- Any successful non-empty queries from ```data-api``` will automatically save to the ```cache-api``` as well
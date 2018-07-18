# Data-API microservice

This API is responsible for querying the persistent data store (mongo or cosmos db).  If data is found, it will be returned to the client (e.g. ```flight-api```) **AND** it will send a POST request to a cache service (e.g. ```cache-api```) for caching.  The ```flight-api``` always queries ```cache-api``` first, and only queries ```data-api``` if no results are found.

Data is queried via a RESTful path and is subsequently stored into cache using the RESTful url path as the key.  For example:

```:bash
# Given the following URL request for data:
http://domain.name/flights/country/can

# the path will be
/flights/country/can

# the key used in the cache will also be
/flights/country/can
```

**NOTE:**
- There is a Time To Live (TTL) for the cache.  If the ```cache-api``` has not been accessed in ```X``` seconds (default is 60 seconds in ```src/server.js```, see [.env_examples](src/.env_examples) for the needed ENV VARS), the key will be removed altogether from ```cache-api```.
- Any successful non-empty queries from ```data-api``` will automatically save to the ```cache-api``` as well
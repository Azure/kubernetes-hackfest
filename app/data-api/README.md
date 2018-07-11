# Data-API microservice

This microservice is responsible for executing the the underlying query against the data stores for flight information.

This service receives RESTful requests with a JSON payload as its body.  It will then try the data cache layer for data, if it fails it catch the exception and try the Persistent Data Store (Mongo/Cosmos DB) or will return a corresponding error message.

## Data Stores

### Cached Data Storage Layer

### Persistent Data Storage Layer


## Troubleshooting


### Import JSON into Database (Cosmos)
```
mongoimport -u cosmos-name -p cosmos-password --host cosmos-name.documents.azure.com:10255 --db dbname --collection collectioname --type json --file /path/to/json_data.json  --jsonArray --ssl --sslAllowInvalidCertificates
```

### Using Mongo CLI to test connection
```
mongo -u cosmos-name -p cosmos-password --host cosmos-name.documents.azure.com:10255 --ssl --sslAllowInvalidCertificates
```
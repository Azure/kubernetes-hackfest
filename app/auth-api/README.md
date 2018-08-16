
## auth-api
> Azure Kubernetes Hackfest

#### Install dependences (via NPM)
``` bash
# install dependencies
npm install
```

#### Create an instance of CosmosDB (with MongoDB API)
``` bash
# ensure you have the Azure CLI installed
#
# Variable: MY_LOCATION
# Choose an Azure Region (eastus, westus, etc)
MY_LOCATION="eastus"
#
#
# Variable: CORE_ID
# This is a random 8 alphanumeric character ID for naming of resources
CORE_ID="$(LC_CTYPE=C tr -dc a-z0-9 < /dev/urandom | head -c 8 | xargs)"
#
#
# Variable: MY_RESOURCE_GROUP
# Concatenate RG_ + your CORE_ID
MY_RESOURCE_GROUP="$(echo $CORE_ID | awk '{print "rg-"$1}')"
# Create the resource group
az group create -n $MY_RESOURCE_GROUP -l $MY_LOCATION
#
#
# Variable: MY_INSTANCE 
# The CosmosDB instance
MY_INSTANCE="$(echo $CORE_ID | awk '{print "cosmos-"$1}')"
#
# Create the cosmosdb instance with a mongodb api
az cosmosdb create -n $MY_INSTANCE -g $MY_RESOURCE_GROUP --kind MongoDB
#
#
# Variable: MY_DB_NAME
# The database in your cosmosdb instance
MY_DB_NAME="k8shackfest"
# create the database in the cosmosdb instance
az cosmosdb database create --db-name $MY_DB_NAME -n $MY_INSTANCE -g $MY_RESOURCE_GROUP
#
# Collections in MongoDB are like tables in sql databases
# create the users collection
az cosmosdb collection create --collection-name 'users' --db-name $MY_DB_NAME -g $MY_RESOURCE_GROUP -n $MY_INSTANCE 
#
#
# Variable: FULL_CONN_STRING
# retrieve connection string to variable
FULL_CONN_STRING=$(az cosmosdb list-connection-strings -g $MY_RESOURCE_GROUP -n $MY_INSTANCE --query 'connectionStrings[0].connectionString')
# Adjust for MY_DB_NAME path
DB_PATH=${FULL_CONN_STRING/?ssl=true/$MY_DB_NAME}
# 
# Variable: CONN_STRING
# Connection string with db name and ssl
CONN_STRING=${DB_PATH//'"'/''}
CONN_STRING=$(printf "%s?ssl=true" "$CONN_STRING")

# in the root of the auth-api folder, create a .env file
touch .env
echo MONGODB_URI=$(printf "'%s'" "$CONN_STRING") >> .env
```

#### serve at localhost:3000
``` bash
# Run with NPM 
npm run dev

```

#### navigate to url to create admin user
http://localhost:3000/admin/create
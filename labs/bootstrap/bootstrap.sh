#!/bin/bash

##Set step flags to zero to start
CREATE_CLUSTER=0
BUILD_APP=0
DEPLOY_APP=0

##Check command args and set step flags
while getopts ":123" opt; do
  case $opt in
    1 ) CREATE_CLUSTER=1;echo "Create Cluster: $CREATE_CLUSTER";      ;;
    2 ) BUILD_APP=1;echo "Build App: $BUILD_APP"   ;;
    3 ) DEPLOY_APP=1;echo "Deploy App: $DEPLOY_APP"   ;;
    * ) echo -e "Provide an option:\n-1 Create cluster\n-2 Build the app\n-3 Deploy the app\n-123 Run all 3" >&2
       exit 1
  esac
done
if [ $OPTIND -eq 1 ]; then echo -e "Provide an option:\n-1 Create cluster\n-2 Build the app\n-3 Deploy the app\n-123 Run all 3"; fi

##If Create Cluster step flag set, execute create cluster
if  [ $CREATE_CLUSTER -eq 1 ]
then
echo "Building the cluster...."

##Create Service Principal
echo "Creating service principal"
SP_FULL=$(az ad sp create-for-rbac --skip-assignment -o json)

APPID=$(echo $SP_FULL|jq -r '.appId')
echo "Application ID: $APPID"
# Persist for Later Sessions in Case of Timeout
# First run through will overwrite the file
echo export APPID=$APPID > ./env.sh

CLIENTSECRET=$(echo $SP_FULL|jq -r '.password')
echo "Client Secret: $CLIENTSECRET"
# Persist for Later Sessions in Case of Timeout
echo export CLIENTSECRET=$CLIENTSECRET >> ./env.sh

##Create Unique Suffix for later use
UNIQUE_SUFFIX=$USER$RANDOM
# Remove Underscores and Dashes (Not Allowed in AKS and ACR Names)
UNIQUE_SUFFIX="${UNIQUE_SUFFIX//_}"
UNIQUE_SUFFIX="${UNIQUE_SUFFIX//-}"
# Check Unique Suffix Value (Should be No Underscores or Dashes)
echo "Unique Suffix: $UNIQUE_SUFFIX"
# Persist for Later Sessions in Case of Timeout
echo export UNIQUE_SUFFIX=$UNIQUE_SUFFIX >> ./env.sh

##Create Resource Group
# Set Resource Group Name using the unique suffix
RGNAME=aks-rg-$UNIQUE_SUFFIX
# Persist for Later Sessions in Case of Timeout
echo export RGNAME=$RGNAME >> ./env.sh
# Set Region (Location)
LOCATION=eastus
# Persist for Later Sessions in Case of Timeout
echo export LOCATION=eastus >> ./env.sh
# Create Resource Group
az group create -n $RGNAME -l $LOCATION

##Create the Cluster
# Set AKS Cluster Name
CLUSTERNAME=aks${UNIQUE_SUFFIX}
# Look at AKS Cluster Name for Future Reference
echo $CLUSTERNAME
# Persist for Later Sessions in Case of Timeout
echo export CLUSTERNAME=aks${UNIQUE_SUFFIX} >> ./env.sh

##Set a specific version of Kubernetes
K8SVERSION=1.15.7

# Create AKS Cluster
az aks create -n $CLUSTERNAME -g $RGNAME \
--kubernetes-version $K8SVERSION \
--service-principal $APPID \
--client-secret $CLIENTSECRET \
--generate-ssh-keys -l $LOCATION \
--node-count 3 \
--enable-addons monitoring

#Get cluster credientials
echo "Get cluster credentials..."
az aks get-credentials -n $CLUSTERNAME -g $RGNAME

#Get Nodes
echo "Testing cluster connectivity..."
kubectl get nodes

#Create the hackfest namespace
echo "Creating the hackfest namespace..."
kubectl create ns hackfest

echo "Completed Cluster Creation!!!"

fi

##If Build App step flag set, execute the application build
if  [ $BUILD_APP -eq 1 ]
then
echo "Building the application...."

#Reload variables
source env.sh

#Make sure your set to use the aks credentials
az aks get-credentials -n $CLUSTERNAME -g $RGNAME

# Set Azure Container Registry Name
export ACRNAME=acrhackfest$UNIQUE_SUFFIX
# Check ACR Name (Can Only Container lowercase)
echo $ACRNAME
# Persist for Later Sessions in Case of Timeout
echo export ACRNAME=acrhackfest$UNIQUE_SUFFIX >> ./env.sh
# Create Azure Container Registry
az acr create --resource-group $RGNAME --name $ACRNAME --sku Basic

# Set the service principal as a user on the ACR
sh ../../labs/build-application/reg-acr.sh $RGNAME $CLUSTERNAME $ACRNAME

# Create a unique application insights name
APPINSIGHTSNAME=appInsightshackfest$UNIQUE_SUFFIX
# Deploy the appinsights ARM template   
az group deployment create --resource-group $RGNAME --template-file ../../labs/build-application/app-Insights.json --parameters type=Node.js name=$APPINSIGHTSNAME regionId=eastus

export MONGODB_USER='dbuser'
export MONGODB_PASSWORD='dbpassword'
export APPINSIGHTS_INSTRUMENTATIONKEY='6dc23005-a1d0-418a-82bd-b232498b5221'
kubectl create secret generic cosmos-db-secret --from-literal=user=$MONGODB_USER --from-literal=pwd=$MONGODB_PASSWORD --from-literal=appinsights=$APPINSIGHTS_INSTRUMENTATIONKEY -n hackfest

az acr build -t hackfest/data-api:1.0 -r $ACRNAME -o json ../../app/data-api
az acr build -t hackfest/flights-api:1.0 -r $ACRNAME -o json ../../app/flights-api
az acr build -t hackfest/quakes-api:1.0 -r $ACRNAME -o json ../../app/quakes-api
az acr build -t hackfest/weather-api:1.0 -r $ACRNAME -o json ../../app/weather-api
az acr build -t hackfest/service-tracker-ui:1.0 -r $ACRNAME -o json ../../app/service-tracker-ui

echo "Application build complete!!!"

fi

##If Deploy App step flag set, execute application deployment
if  [ $DEPLOY_APP -eq 1 ]
then
echo "Deploying the application...."
#Make sure your set to use the aks credentials
az aks get-credentials -n $CLUSTERNAME -g $RGNAME


#Reload variables
source env.sh

#Deploy the mongo db
kubectl apply -f ./manifests/mongodb.yaml
kubectl apply -f ./manifests/data-api.yaml  

ACRFQDN=$ACRNAME.azurecr.io
echo ACR FQDN: $ACRFQDN

helm upgrade --install quakes-api ../../charts/quakes-api --namespace hackfest --set deploy.acrServer=$ACRFQDN
helm upgrade --install weather-api ../../charts/weather-api --namespace hackfest --set deploy.acrServer=$ACRFQDN
helm upgrade --install flights-api ../../charts/flights-api --namespace hackfest --set deploy.acrServer=$ACRFQDN
helm upgrade --install service-tracker-ui ../../charts/service-tracker-ui --namespace hackfest --set deploy.acrServer=$ACRFQDN

echo "Application deployment complete!!!"

fi
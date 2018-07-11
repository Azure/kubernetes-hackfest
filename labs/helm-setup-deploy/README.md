# Lab: Helm Setup and Deploy Application

In this lab we will setup Helm in our AKS cluster and deploy our application with Helm charts.

## Prerequisites 

* Clone this repo in Azure Cloud Shell.
* Complete previous labs for [AKS](labs/create-aks-cluster/README.md) and [ACR](labs/build-application/README.md).

## Instructions

1. Initialize Helm



    * Use the same resource group that was created for AKS (in lab 1)
    * In this step, you will need a unique name for your ACR instance. Use the following step to create the ACR name and then deploy.

        ```
        export RGNAME=kubernetes-hackfest
        export ACRNAME=acrhackfest$RANDOM

        az acr create --resource-group $RGNAME --name $ACRNAME --sku Basic
        ```

2. Deploy Cosmos DB
    * In this step, create a Cosmos DB account for the Mongo api. Again, we will create a random, unique name.
        
        ```
        export RGNAME=kubernetes-hackfest
        export COSMOSNAME=acrhackfest$RANDOM

        az cosmosdb create --name $COSMOSNAME --resource-group $RGNAME --kind MongoDB
        ```
    
    * Show your connection string

        ```
        az cosmosdb list-connection-strings --name $COSMOSNAME --resource-group $RGNAME
        ```
 

3. Create Docker containers in ACR
    * In this step we will create a Docker container image for each of our microservices. We will use ACR Builder functionality to build and store these images in the cloud. 

        ```
        # the $ACRNAME variable should be set from step 1

        az acr build -t hackfest/data-api:v1 -r $ACRNAME ./app/data-api

        # for the rest of the builds, we will add the --no-logs flag to return control to the shell

        az acr build -t hackfest/auth-api:v1 -r $ACRNAME --no-logs ./app/auth-api
        az acr build -t hackfest/flights-api:v1 -r $ACRNAME --no-logs ./app/flights-api
        az acr build -t hackfest/web-ui:v1 -r $ACRNAME --no-logs ./app/web-ui
        ```

    * You can see the status of the builds by running the command below.
        
        ```
        az acr build-task list-builds -r $ACRNAME -o table

        az acr build-task logs --build-id aa1 -r $ACRNAME
        ```
    
    * Browse to your ACR instance in the Azure portal and validate that the images are in "Repositories." 


## Troubleshooting / Debugging


## Docs / References

* Helm. http://helm.sh
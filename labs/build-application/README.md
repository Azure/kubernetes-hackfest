# Lab: Build Application Components

In this lab we will build Docker containers for each of the application components and setup the back-end database. 

## Prerequisites 

* Clone this repo in Azure Cloud Shell.
* Complete previous labs:
    * [AKS](../create-aks-cluster/README.md)

## Instructions

1. Create Azure Container Registry (ACR)
    * Use the same resource group that was created for AKS (in lab 1)
    * In this step, you will need a unique name for your ACR instance. Use the following step to create the ACR name and then deploy.

        ```
        # Use the UNIQUE_SUFFIX from the first lab. Validate that the value is still set.
        echo $UNIQUE_SUFFIX

        export RGNAME=kubernetes-hackfest
        export ACRNAME=acrhackfest$UNIQUE_SUFFIX

        az acr create --resource-group $RGNAME --name $ACRNAME --sku Basic
        ```

2. Deploy Cosmos DB
    * In this step, create a Cosmos DB account for the Mongo api. Again, we will create a random, unique name.
        
        ```
        # Use the UNIQUE_SUFFIX from the first lab. Validate that the value is still set.
        echo $UNIQUE_SUFFIX

        export RGNAME=kubernetes-hackfest
        export COSMOSNAME=cosmos$UNIQUE_SUFFIX

        az cosmosdb create --name $COSMOSNAME --resource-group $RGNAME --kind MongoDB
        ```
    
    * You can validate your Cosmos instance in the portal. The credentials and connect string will be used in the next lab.


3. Create Docker containers in ACR
    * In this step we will create a Docker container image for each of our microservices. We will use ACR Builder functionality to build and store these images in the cloud. 

        ```
        cd ~/kubernetes-hackfest

        # the $ACRNAME variable should be set from step 1
        echo $ACRNAME

        # set a version (make this anything you would like)
        export VERSION=v4

        az acr build -t hackfest/data-api:$VERSION -r $ACRNAME --no-logs ./app/data-api
        az acr build -t hackfest/flights-api:$VERSION -r $ACRNAME --no-logs ./app/flights-api
        az acr build -t hackfest/quakes-api:$VERSION -r $ACRNAME --no-logs ./app/quakes-api
        az acr build -t hackfest/weather-api:$VERSION -r $ACRNAME --no-logs ./app/weather-api
        az acr build -t hackfest/service-tracker-ui:$VERSION -r $ACRNAME --no-logs ./app/service-tracker-ui
        ```

    * You can see the status of the builds by running the command below.
        
        ```
        az acr build-task list-builds -r $ACRNAME -o table

        az acr build-task logs -r $ACRNAME --build-id aa1
        ```
    
    * Browse to your ACR instance in the Azure portal and validate that the images are in "Repositories."

#### Next Lab: [Helm Setup and Deploy Application](labs/helm-setup-deploy/README.md)


## Troubleshooting / Debugging


## Docs / References

* Azure Container Registry Docs. https://docs.microsoft.com/en-us/azure/container-registry 
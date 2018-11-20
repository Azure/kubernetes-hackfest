# Lab: Build Application Components

In this lab we will build Docker containers for each of the application components and setup the back-end database.

## Prerequisites

* Complete previous labs:
    * [Azure Kubernetes Service](../create-aks-cluster/README.md)

## Instructions

1. Create Azure Container Registry (ACR)
    * Use the same resource group that was created for AKS (in lab 1)
    * In this step, you will need a unique name for your ACR instance. Use the following step to create the ACR name and then deploy.

    ```bash
    # Use the UNIQUE_SUFFIX from the first lab. Validate that the value is still set.
    echo $UNIQUE_SUFFIX
    # Set Azure Container Registry Name
    export ACRNAME=acrhackfest$UNIQUE_SUFFIX
    # Check ACR Name (Can Only Container lowercase)
    echo $ACRNAME
    # Persist for Later Sessions in Case of Timeout
    echo export ACRNAME=acrhackfest$UNIQUE_SUFFIX >> ~/.bashrc
    # Create Azure Container Registry
    ** Skip This Step Of You Used Terraform To Deploy AKS **
    az acr create --resource-group $RGNAME --name $ACRNAME --sku Basic
    ```

2. Run bash script to authenticate with Azure Container Registry from AKS

    Running this script will grant the Service Principal created at cluster creation time access to ACR.

    **NOTE: If the below role assignment fails due to permissions, we will do it the hard way and create an Image Pull Secret.**

    ```bash
    cd ~/kubernetes-hackfest/labs/build-application

    sh reg-acr.sh $RGNAME $CLUSTERNAME $ACRNAME
    ```

    ```bash
    # !!!!!!!!!!
    # Only do these steps if the above Service Principal Role Assignment fails.
    # !!!!!!!!!!

    # Extract Container Registry details needed for Login
    # Login Server
    az acr show -n ${ACRNAME} --query "{acrLoginServer:loginServer}" -o table
    # Registry Username and Password
    az acr credential show -n ${ACRNAME}

    # Use the login and credential information from above
    kubectl create secret docker-registry regcred \
      --docker-server=<LOGIN SERVER GOES HERE> \
      --docker-username=<USERNAME GOES HERE> \
      --docker-password=<PASSWORD GOES HERE>

    # !!!!!!!!!!
    # Only do these steps if the above Service Principal Role Assignment fails.
    # !!!!!!!!!!
    ```

3. Deploy Cosmos DB

    In this step, create a Cosmos DB account for the Mongo api. Again, we will create a random, unique name.

    ```bash
    export COSMOSNAME=cosmos$UNIQUE_SUFFIX
    # Check COSMOS Name
    echo $COSMOSNAME
    # Persist for Later Sessions in Case of Timeout
    echo export COSMOSNAME=cosmos$UNIQUE_SUFFIX >> ~/.bashrc
    # Create Cosmos DB
    az cosmosdb create --name $COSMOSNAME --resource-group $RGNAME --kind MongoDB
    ```

    You can validate your Cosmos instance in the portal. The credentials and connect string will be used in the next lab.

4. Create Docker containers in ACR

    In this step we will create a Docker container image for each of our microservices. We will use ACR Builder functionality to build and store these images in the cloud. 

    ```bash
    cd ~/kubernetes-hackfest

    az acr build -t hackfest/data-api:1.0 -r $ACRNAME --no-logs ./app/data-api
    az acr build -t hackfest/flights-api:1.0 -r $ACRNAME --no-logs ./app/flights-api
    az acr build -t hackfest/quakes-api:1.0 -r $ACRNAME --no-logs ./app/quakes-api
    az acr build -t hackfest/weather-api:1.0 -r $ACRNAME --no-logs ./app/weather-api
    az acr build -t hackfest/service-tracker-ui:1.0 -r $ACRNAME --no-logs ./app/service-tracker-ui
    ```

    You can see the status of the builds by running the command below.

    ```bash
    az acr task list-runs -r $ACRNAME -o table

    az acr task logs -r $ACRNAME --run-id aa1
    ```

    Browse to your ACR instance in the Azure portal and validate that the images are in "Repositories."

## Troubleshooting / Debugging

* Make sure all of you ACR Task commands are pointing to the correct Azure Container Registry. You can check repositories by navigating to your ACR in the Azure Portal UI.

## Docs / References

* Azure Container Registry Docs. https://docs.microsoft.com/en-us/azure/container-registry 

#### Next Lab: [Helm Setup and Deploy Application](../helm-setup-deploy/README.md)

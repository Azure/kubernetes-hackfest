# Lab: Build Application Components and Prerequisites

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
    az acr create --resource-group $RGNAME --name $ACRNAME --sku Basic
    ```

1. Run bash script to authenticate with Azure Container Registry from AKS

    Running this script will grant the Managed Identity created at cluster creation time access to ACR.

    **NOTE: If the below role assignment fails due to permissions, we will do it the hard way and create an Image Pull Secret.**

    ```bash
    sh labs/build-application/reg-acr.sh $RGNAME $CLUSTERNAME $ACRNAME
    ```

1. Deploy Azure SQL DB

    In this step, create an Azure SQL DB for used by the application. Again, we will create a random, unique name.

    ```bash
    export SQLSERVERNAME=sql$UNIQUE_SUFFIX
    # Check COSMOS Name
    echo $SQLSERVERNAME
    # Persist for Later Sessions in Case of Timeout
    echo export SQLSERVERNAME=sql$UNIQUE_SUFFIX >> ~/.bashrc

    export SQLSERVERPASSWD=@sqlpw$UNIQUE_SUFFIX
    echo export SQLSERVERPASSWD=@sql1$UNIQUE_SUFFIX >> ~/.bashrc
    # Create SQL Server
    az sql server create --name $SQLSERVERNAME --resource-group $RGNAME --admin-user sqladmin --admin-password $SQLSERVERPASSWD

    # Create SQL DB
    az sql db create --resource-group $RGNAME --server $SQLSERVERNAME --name jabbr --edition GeneralPurpose
    az sql server firewall-rule create --resource-group $RGNAME --server $SQLSERVERNAME -n AllowYourIp --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0
    ```

    You can validate your Azure SQL DB instance in the portal. The credentials and connect string will be used in the next lab.

1. Create Kubernetes secrets for access to the Jabbr database in your Azure SQL DB

    You will use a secret to hold the credentials for our backend database. In the next lab, you will use this secret as a part of your deployment manifests.

    Once the secret is created, these envvars are no longer needed.

    * Set the Azure SQL DB user and password

    ```bash
    kubectl create secret generic sql-db-secret --from-literal=user=sqladmin --from-literal=pwd=$SQLSERVERPASSWD -n jabbr
    ```

6. Create Docker containers in ACR

    In this step we will create a Docker container image for each of our microservices. We will use ACR Builder functionality to build and store these images in the cloud.

    ```bash
    git clone https://github.com/swgriffith/JabbR
    az acr build -t jabbr:1.0 -r $ACRNAME --no-logs -o json JabbR --platform Windows
    ```

    You can see the status of the builds by running the command below.

    ```bash
    az acr task list-runs -r $ACRNAME -o table

    az acr task logs -r $ACRNAME --run-id <run id>
    ```

    Browse to your ACR instance in the Azure portal and validate that the images are in "Repositories."

## Troubleshooting / Debugging

* Make sure all of you ACR Task commands are pointing to the correct Azure Container Registry. You can check repositories by navigating to your ACR in the Azure Portal UI.

## Docs / References

* Azure Container Registry Docs. https://docs.microsoft.com/en-us/azure/container-registry 

#### Next Lab: [Helm Setup and Deploy Application](../helm-setup-deploy/README.md)

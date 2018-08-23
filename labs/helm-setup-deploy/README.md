# Lab: Helm Setup and Deploy Application

In this lab we will setup Helm in our AKS cluster and deploy our application with Helm charts.

## Prerequisites 

* Clone this repo in Azure Cloud Shell.
* Complete previous labs:
    * [Azure Kubernetes Service](../create-aks-cluster/README.md)
    * [Build Application Components in Azure Container Registry](../build-application/README.md)

## Instructions

1. Initialize Helm
    
    Helm helps you manage Kubernetes applications — Helm Charts helps you define, install, and upgrade even the most complex Kubernetes application. Helm has a CLI component and a server side component called Tiller. 
    * Initialize Helm and Tiller:

        ```
        cd ~/kubernetes-hackfest
        kubectl apply -f ./labs/helm-setup-deploy/rbac-config.yaml

        helm init --service-account tiller --upgrade
        ```

    * Validate the install (in this case, we are using Helm version 2.9.1):
        ```
        helm version

        Client: &version.Version{SemVer:"v2.9.1", GitCommit:"20adb27c7c5868466912eebdf6664e7390ebe710", GitTreeState:"clean"}
        Server: &version.Version{SemVer:"v2.9.1", GitCommit:"20adb27c7c5868466912eebdf6664e7390ebe710", GitTreeState:"clean"}
        ```

        > It can take a minute or so for Tiller to start

2. Create Application Insights Instance

    * In your Azure portal, click "Create a resource" and pick "Application Insights"
    * Click Create
    * Pick a unique name (you can use the unique identifier created in the 1st lab)
    * Use "Node.js Application" for the app type
    * Select "kubernetes-hackfest" for the Resource Group
    * Use "East US" for location
    * When this is completed, click on "Getting Started" and note the Instrumentation Key

3. Review the Helm Chart components

    In this repo, there is a folder for `charts` with a sub-folder for each specific app chart. In our case each application has its own chart. 

    The `values.yaml` file has the parameters that allow you to customize release. This file has the defaults, but they can be overridden on the command line. 

    The `templates` folder holds the yaml files for the specific kubernetes resources for our application. Here you will see how Helm inserts the parameters into resources with this bracketed notation: eg -  `{{.Values.deploy.image}}`


4. Customize Chart Parameters

    In each chart we will need to update the values file with our specific Azure Container Registry. 

    * Get the value of your ACR Login Server:

    ```
    az acr list -o table --query "[].loginServer"

    Result
    -------------------
    youracr.azurecr.io

    ```
    
    * Replace the `acrServer` value below with the Login server from previous step. You will make this change in all 4 of the charts. 

    Example:
    ```
    # Default values for chart

    service:
    type: LoadBalancer
    port: 4567

    deploy:
    name: data-api-deploy
    replicas: 2
    acrServer: "youracr.azurecr.io"
    imageTag: "v1"
    containerPort: 4567
    ```

5. Create Kubernetes secrets for access to Cosmos DB and App Insights

    For now, we are creating a secret that holds the credentials for our backend database. The application deployment puts these secrets in environment variables. 

    ```
    # Customize these values from your Cosmos DB instance deployed in a previous lab. Use the ticks provided for strings
    export MONGODB_URI=''
    export MONGODB_USER=''
    export MONGODB_PASSWORD=''
    export APPINSIGHTS_INSTRUMENTATIONKEY=''

    kubectl create secret generic cosmos-db-secret --from-literal=uri='$MONGODB_URI' --from-literal=user='$MONGODB_USER' --from-literal=pwd='$MONGODB_PASSWORD' --from-literal=appinsights='$APPINSIGHTS_INSTRUMENTATIONKEY'
    ```


6. Deploy Charts

    Install each chart as below:

    ```
    # Application charts
    helm upgrade --install node-data-api ./charts/node-data-api
    helm upgrade --install flights-api ./charts/flights-api
    helm upgrade --install web-ui ./charts/web-ui
    helm upgrade --install cache-api ./charts/cache-api

    # Use the public redis chart
    helm install stable/redis
    ```

6. Validate application




## Troubleshooting / Debugging


## Docs / References

* Helm. http://helm.sh
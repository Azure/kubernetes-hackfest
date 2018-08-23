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
    
    * Replace the `acrServer` value below with the Login server from previous step. You will make this change in all of the charts. 

    Example:
    ```
    # Default values for chart

    service:
    type: LoadBalancer
    port: 3009

    deploy:
    name: node-data-api-deploy
    replicas: 1
    acrServer: "youracr.azurecr.io"
    imageTag: "v1"
    containerPort: 3009
    ```

5. Create Kubernetes secrets for access to Cosmos DB and App Insights

    For now, we are creating a secret that holds the credentials for our backend database. The application deployment puts these secrets in environment variables. 

    ```
    # Customize these values from your Cosmos DB instance deployed in a previous lab. Use the ticks provided for strings
    export MONGODB_URI=''
    export MONGODB_USER=''
    export MONGODB_PASSWORD=''
    export APPINSIGHTS_INSTRUMENTATIONKEY=''

    kubectl create secret generic cosmos-db-secret --from-literal=uri=$MONGODB_URI --from-literal=user=$MONGODB_USER --from-literal=pwd=$MONGODB_PASSWORD --from-literal=appinsights=$APPINSIGHTS_INSTRUMENTATIONKEY
    ```


6. Deploy Charts

    Install each chart as below:

    ```
    # Application charts 

    helm upgrade --install node-data-api ./charts/node-data-api
    helm upgrade --install node-flights-api ./charts/node-flights-api
    helm upgrade --install web-ui ./charts/web-ui
    ```

6. Initialize application

    * First check to see if pods and services are working correctly

    ```
    kubectl get pod,svc

    NAME                                           READY     STATUS    RESTARTS   AGE
    pod/node-data-api-deploy-d45ddb647-b5qv2       1/1       Running   0          41m
    pod/node-flights-api-deploy-787c5bd654-dhw59   1/1       Running   0          24m
    pod/web-ui-deploy-54979b5759-dg5x9             1/1       Running   0          1m

    NAME                       TYPE           CLUSTER-IP   EXTERNAL-IP      PORT(S)          AGE
    service/kubernetes         ClusterIP      10.0.0.1     <none>           443/TCP          2h
    service/node-data-api      LoadBalancer   10.0.40.1    138.51.127.106   3009:31173/TCP   58m
    service/node-flights-api   LoadBalancer   10.0.214.7   137.35.98.30     3003:32481/TCP   24m
    service/web-ui             LoadBalancer   10.0.129.0   104.41.198.147   80:31014/TCP     1m
    ```

    * Next call one of the api's to initialize the CosmosDB instance

    ```
    # get the public IP for the flights API
    kubectl get service node-flights-api

    NAME               TYPE           CLUSTER-IP   EXTERNAL-IP     PORT(S)          AGE
    node-flights-api   LoadBalancer   10.0.214.7   137.35.98.30    3003:32481/TCP   21m

    # browse to that address using the port and path below
    http://<your-public-up>:3003/refresh
    ```

    * Browse the web UI and profit!

    ```
    kubectl get service web-ui

    NAME      TYPE           CLUSTER-IP   EXTERNAL-IP     PORT(S)          AGE
    web-ui    LoadBalancer   10.0.82.74   40.16.218.139   8080:31346/TCP   8m
    ```

    Open the browser to http://40.76.218.139:8080 (your IP will be different #obvious)


## Troubleshooting / Debugging


## Docs / References

* Helm. http://helm.sh
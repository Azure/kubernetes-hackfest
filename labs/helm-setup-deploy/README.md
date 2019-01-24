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

        ```bash
        kubectl apply -f ~/kubernetes-hackfest/labs/helm-setup-deploy/rbac-config.yaml
        helm init --service-account tiller --upgrade
        ```

    * Validate the install (the Helm version may be newer in your lab):
        ```bash
        helm version
        ```

        ```bash
        Client: &version.Version{SemVer:"v2.12.1", GitCommit:"20adb27c7c5868466912eebdf6664e7390ebe710", GitTreeState:"clean"}
        Server: &version.Version{SemVer:"v2.12.2", GitCommit:"20adb27c7c5868466912eebdf6664e7390ebe710", GitTreeState:"clean"}
        ```

        > Note: It can take a minute or so for Tiller to start

2. Review the Helm Chart components

    In this repo, there is a folder for `charts` with a sub-folder for each specific app chart. In our case each application has its own chart. 

    The `values.yaml` file has the parameters that allow you to customize release. This file has the defaults, but they can be overridden on the command line. 

    The `templates` folder holds the yaml files for the specific kubernetes resources for our application. Here you will see how Helm inserts the parameters into resources with this bracketed notation: eg -  `{{.Values.deploy.image}}`

3. Customize Chart Parameters

    In each chart we will need to update the values file with our specific Azure Container Registry. 

    * Get the value of your ACR Login Server:

        ```bash
        az acr list -o table --query "[].loginServer"

        Result
        -------------------
        youracr.azurecr.io

        ```

    * Replace the `acrServer` value below with the Login server from previous step. In the Azure Cloud Shell, select the file editor '{}'.  Navigate to the yaml files below.  To save changes, select the elipticals on the right hand side and select Save. You will make this change in all of the charts below (except cache-api)
    
        [charts/service-tracker-ui/values.yaml](../../charts/service-tracker-ui/values.yaml)

        [charts/weather-api/values.yaml](../../charts/weather-api/values.yaml)

        [charts/flights-api/values.yaml](../../charts/flights-api/values.yaml)

        [charts/quakes-api/values.yaml](../../charts/quakes-api/values.yaml)

        [charts/data-api/values.yaml](../../charts/data-api/values.yaml)

        Example:
        ```yaml
        # Default values for chart

        service:
        type: ClusterIP
        port: 3009

        deploy:
        name: data-api
        replicas: 1
        acrServer: "youracr.azurecr.io"
        imageTag: "1.0"
        containerPort: 3009
        ```

    * Valdiate that the `imageTag` parameter matches the tag you created in Azure Container Registry in the previous lab.

    * Add `imagePullSecret` to each deployment.yaml file for each microservice

        **NOTE: Only do iIf the Service Principal role assignment in Build Application lab failed. You will need to add the Docker Registry secret that was created to each deployment via a mechanism called an imagePullSecret.**

        [charts/service-tracker-ui/templates/deployment.yaml](../../charts/service-tracker-ui/templates/deployment.yaml)

        [charts/weather-api/templates/deployment.yaml](../../charts/weather-api/templates/deployment.yaml)

        [charts/flights-api/templates/deployment.yaml](../../charts/flights-api/templates/deployment.yaml)

        [charts/quakes-api/templates/deployment.yaml](../../charts/quakes-api/templates/deployment.yaml)

        [charts/data-api/templates/deployment.yaml](../../charts/data-api/templates/deployment.yaml)

        Example Before:
        ```yaml
        ...

        containers:
          - image: "{{.Values.deploy.acrServer}}/hackfest/weather-api:{{.Values.deploy.imageTag}}"
            imagePullPolicy: Always

        ...
        ```

        Example After (2 imagePullSecrets lines added):
        ```yaml
        ...

        imagePullSecrets:
        - name: regcred
        containers:
          - image: "{{.Values.deploy.acrServer}}/hackfest/weather-api:{{.Values.deploy.imageTag}}"
            imagePullPolicy: Always

        ...
        ```

4. Deploy Charts

    Ensure namespace was created earlier:
    ```bash
    kubectl get ns hackfest

    NAME       STATUS    AGE
    hackfest   Active    4m
    ```

    Install each chart as below:

    ```bash
    # Application charts

    helm upgrade --install data-api ~/kubernetes-hackfest/charts/data-api --namespace hackfest
    helm upgrade --install quakes-api ~/kubernetes-hackfest/charts/quakes-api --namespace hackfest
    helm upgrade --install weather-api ~/kubernetes-hackfest/charts/weather-api --namespace hackfest
    helm upgrade --install flights-api ~/kubernetes-hackfest/charts/flights-api --namespace hackfest
    helm upgrade --install service-tracker-ui ~/kubernetes-hackfest/charts/service-tracker-ui --namespace hackfest
    ```

5. Initialize application

    * First check to see if pods and services are working correctly

    ```bash
    kubectl get pod,svc -n hackfest

    NAME                                      READY     STATUS    RESTARTS   AGE
    pod/data-api-555688c8d-xb76d              1/1       Running   0          1m
    pod/flights-api-69b9d9dfc-8b9z8           1/1       Running   0          1m
    pod/quakes-api-7d95bccfc8-5x9hw           1/1       Running   0          1m
    pod/service-tracker-ui-7db967b8c9-p27s5   1/1       Running   0          54s
    pod/weather-api-7448ff75b7-7bptj          1/1       Running   0          1m

    NAME                         TYPE           CLUSTER-IP     EXTERNAL-IP    PORT(S)          AGE
    service/data-api             LoadBalancer   10.0.89.66     <none>         3009:31779/TCP   9m
    service/flights-api          LoadBalancer   10.0.210.195   <none>         3003:30862/TCP   8m
    service/kubernetes           ClusterIP      10.0.0.1       <none>         443/TCP          20h
    service/quakes-api           LoadBalancer   10.0.134.0     <none>         3003:31950/TCP   8m
    service/service-tracker-ui   LoadBalancer   10.0.90.157    23.96.11.115   8080:32324/TCP   8m
    service/weather-api          LoadBalancer   10.0.179.66    <none>         3003:31951/TCP   8m
    ```

    * Browse to the web UI

    ```bash
    kubectl get service service-tracker-ui -n hackfest

    NAME                TYPE           CLUSTER-IP   EXTERNAL-IP     PORT(S)          AGE
    service-tracker-ui  LoadBalancer   10.0.82.74   23.96.11.115    8080:31346/TCP   8m
    ```

    Open the browser to http://23.96.11.115:8080 (your IP will be different #obvious)

    * You will need to click "REFRESH DATA" for each service to load the data sets.

        ![Service Tracker UI](service-tracker-ui.png)

    * Browse each map view and have some fun.

## Troubleshooting / Debugging

* Make sure Helm version on the client and server are the same to ensure compatibility.

## Docs / References

* [Helm](http://helm.sh)

#### Next Lab: [CI/CD Automation](../cicd-automation/README.md)

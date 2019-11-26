# Lab: Helm Setup and Deploy Application

In this lab we will setup Helm in our AKS cluster and deploy our application with Helm charts.

## Prerequisites

* Clone this repo in Azure Cloud Shell.
* Complete previous labs:
    * [Azure Kubernetes Service](../create-aks-cluster/README.md)
    * [Build Application Components in Azure Container Registry](../build-application/README.md)

## Instructions

>Note: Step 1 'Initialize Helm' below is only required if you're using a Helm version below version Helm 3. The Azure Cloud Shell now defaults to Helm 3. As of Helm 3 the 'Tiller' pod is no longer required, so the RBAC setup that follows is no longer needed. Run the following to confirm:
```bash
helm version
```

1. Initialize Helm

    Helm helps you manage Kubernetes applications — Helm Charts helps you define, install, and upgrade even the most complex Kubernetes application. Helm has a CLI component and a server side component called Tiller. 
    * Initialize Helm and Tiller:

        ```bash
        kubectl apply -f labs/helm-setup-deploy/rbac-config.yaml
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

    helm upgrade --install data-api charts/data-api --namespace hackfest
    helm upgrade --install quakes-api charts/quakes-api --namespace hackfest
    helm upgrade --install weather-api charts/weather-api --namespace hackfest
    helm upgrade --install flights-api charts/flights-api --namespace hackfest
    helm upgrade --install service-tracker-ui charts/service-tracker-ui --namespace hackfest
    ```

5. Initialize application

    * First check to see if pods and services are working correctly

    ```bash
    kubectl get pod,svc -n hackfest

    NAME                                     READY   STATUS    RESTARTS   AGE
    pod/data-api-5bdc5c94b4-8xfq2            1/1     Running   3          5d3h
    pod/flights-api-77f77464df-n7jb4         1/1     Running   4          5d15h
    pod/quakes-api-7c8b96b594-vm5qd          1/1     Running   4          5d15h
    pod/service-tracker-ui-c4476d778-hpn5q   1/1     Running   3          5d6h
    pod/weather-api-56d6c57b89-cds8v         1/1     Running   4          5d15h

    NAME                         TYPE           CLUSTER-IP     EXTERNAL-IP   PORT(S)          AGE
    service/data-api             ClusterIP      10.0.179.206   <none>        3009/TCP         7d4h
    service/flights-api          ClusterIP      10.0.255.59    <none>        3003/TCP         7d4h
    service/quakes-api           ClusterIP      10.0.122.46    <none>        3012/TCP         7d4h
    service/service-tracker-ui   LoadBalancer   10.0.24.184    40.71.20.1    8080:30757/TCP   5d6h
    service/weather-api          ClusterIP      10.0.124.80    <none>        3015/TCP         7d4h
    ```

    * Browse to the web UI

    ```bash
    kubectl get service service-tracker-ui -n hackfest

    NAME                 TYPE           CLUSTER-IP    EXTERNAL-IP   PORT(S)          AGE
    service-tracker-ui   LoadBalancer   10.0.24.184   40.71.20.1    8080:30757/TCP   5d6h
    ```

    Open the browser to http://40.71.20.1:8080 (your IP will be different #obvious)

    * You will need to click "REFRESH DATA" for each service to load the data sets.

        ![Service Tracker UI](service-tracker-ui.png)

    * Browse each map view and have some fun.

## Troubleshooting / Debugging

* Make sure Helm version on the client and server are the same to ensure compatibility.

## Docs / References

* [Helm](http://helm.sh)

#### Next Lab: [CI/CD Automation](../cicd-automation/README.md)

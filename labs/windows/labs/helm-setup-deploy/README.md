# Lab: Helm Deploy Application

In this lab we will use helm to deploy our Jabbr application.

## Prerequisites

* Helm Version 3+
* Clone this repo in Azure Cloud Shell.
* Complete previous labs:
    * [Build Application Components in Azure Container Registry](../build-application/README.md)
    * [Create AKS Cluster](../create-aks-cluster/README.md)

## Instructions

>Note: The following lab assumes Helm version 3. Run the following to confirm your Helm version:
```bash
helm version

# Example Output:
version.BuildInfo{Version:"v3.8.0", GitCommit:"d14138609b01886f544b2025f5000351c9eb092e", GitTreeState:"clean", GoVersion:"go1.17.5"}
```

1. Create a registry credential secret in your Kubernetes cluster to be used by AKS when pulling your image:

    ```bash
    kubectl create -n jabbr secret docker-registry regcred \
    --docker-server=$ACRUSERNAME.azurecr.io \
    --docker-username=$ACRUSERNAME \
    --docker-password=$ACRPASSWD
    ```

1. Create Kubernetes secrets for access to the Jabbr database in your Azure SQL DB

    You will use a secret to hold the credentials for our backend database. In the next lab, you will use this secret as a part of your deployment manifests.

    Once the secret is created, these envvars are no longer needed.

    * Set the Azure SQL DB user and password

    ```bash
    # Get the SQL Server FQDN
    SQLFQDN=$(az sql server show -g $RGNAME -n $SQLSERVERNAME -o tsv --query fullyQualifiedDomainName)

    CONNSTR="Server=tcp:$SQLFQDN,1433;Initial Catalog=jabbr;Persist Security Info=False;User ID=sqladmin;Password=$SQLSERVERPASSWD;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

    kubectl create secret generic sql-db-conn-secret --from-literal="connstr=$CONNSTR" -n jabbr
    ```

1. Review the Helm Chart components

    ```bash
    # Go to the Jabbr Application Directory
    cd ~/JabbR
    ```

    In the folder for this lab there's a folder called `chart` with a sub-folder for the Kubernetes manifests to be deployed.

    The `values.yaml` file has the parameters that allow you to customize release. This file has the defaults, but they can be overridden on the command line.

    The `templates` folder holds the yaml files for the specific kubernetes resources for our application. Here you will see how Helm inserts the parameters into resources with this bracketed notation: eg -  `{{.Values.deploy.image}}`

1. Customize Chart Parameters

    In each chart we will need to update the values file with our specific Azure Container Registry. 

    * Get the value of your ACR Login Server:

        ```bash
        az acr list -o table --query "[].loginServer"

        Result
        -------------------
        youracr.azurecr.io

        ```

    * Replace the `acrServer` value below with the Login server from previous step. In the Azure Cloud Shell, select the file editor '{}'.  Navigate to the yaml files below.  To save changes, select the elipticals on the right hand side and select Save. You will make this change in the chart below:
    
        [chart/values.yaml](chart/values.yaml)

        Example:
        ```yaml
        # Default values for chart

        service:
        type: LoadBalancer
        port: 80

        deploy:
        name: jabbr
        acr: acrhackfeststeve7535.azurecr.io
        imageTag: "1.0"
        containerPort: 80
        ```

1. Deploy Chart

    Ensure namespace was created earlier:
    ```bash
    kubectl get ns jabbr

    NAME       STATUS    AGE
    hackfest   Active    4m
    ```

    Install the chart:

    ```bash
    # Application charts

    helm install jabbr chart -n jabbr
    ```
    **NOTE: This app has a large image size, so it will take up to 10min for the first start due to the large initial image pull size. Later pulls will be faster as the base layers are already present.**

1. Initialize application

    * First check to see if pods and services are working correctly

    ```bash
    watch kubectl get svc,pods -n jabbr

    NAME            TYPE           CLUSTER-IP    EXTERNAL-IP     PORT(S)        AGE
    service/jabbr   LoadBalancer   10.0.130.57   52.191.98.101   80:31043/TCP   6m47s

    NAME                         READY   STATUS    RESTARTS   AGE
    pod/jabbr-6f78997fd8-npkl7   1/1     Running   0          6m47s
    ```

    * Browse to the web UI

    ```bash
    kubectl get service jabbr -n jabbr

    NAME    TYPE           CLUSTER-IP    EXTERNAL-IP     PORT(S)        AGE
    jabbr   LoadBalancer   10.0.130.57   52.191.98.101   80:31043/TCP   4m4s
    ```

    Open the browser to http://52.191.98.101 (your IP will be different #obvious). Initial load time may take a minute or two as the application warms up.

    Once the page loads you can click 'Register' to create a new JabbR user and sign in.


## Troubleshooting / Debugging

* Make sure Helm version on the client and server are the same to ensure compatibility.

## Docs / References

* [Helm](http://helm.sh)

#### Next Lab: [Ingress Control](../ingress/README.md)
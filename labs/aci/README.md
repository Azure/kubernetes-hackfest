# Lab: Azure Container Instances and AKS Virtual Nodes

## Prerequisites

* Complete previous labs:
    * [Azure Kubernetes Service](../create-aks-cluster/README.md)
    * [Build Application Components in Azure Container Registry](../build-application/README.md)
    * [Helm Setup and Deploy Application](../helm-setup-deploy/README.md)

## Instructions

This lab has 2 components. First we will use Azure Container Instances to deploy a batch process to periodically update our CosmosDB collection. Then we will use the AKS Virtual Nodes feature to scale out our application using ACI.

### Azure Container Instance

1. Create container for batch processing

    ```bash
    az acr build -t hackfest/data-updater:1.0 -r $ACRNAME --no-logs ~/kubernetes-hackfest/app/data-updater
    ```

2. Gather environment variables needed for running ACI

    This container uses the following envvars to run. You may need to look these up in the Azure portal or use commands from lab 2 to obtain.

    ```bash
    # set these values for your lab
    export MONGODB_USER=
    export MONGODB_PASSWORD=
    export APPINSIGHTS_INSTRUMENTATIONKEY=
    ```

3. Create ACI using the Azure CLI. Note: You can also complete this step using the Azure portal

    ```bash
    az container create --name data-updater --image $ACRNAME/hackfest/data-updater:1.0 --resource-group $RGNAME --location eastus --cpu 1 --memory 2 -e MONGODB_USER=$MONGODB_USER -e MONGODB_PASSWORD=$MONGODB_PASSWORD -e APPINSIGHTS_INSTRUMENTATIONKEY=$APPINSIGHTS_INSTRUMENTATIONKEY -e UPDATE_INTERVAL=180000
    ```

    > Note: we are also using an envvar called UPDATE_INTERVAL to determine how often the update will occur in milliseconds.

4. Check the status of your ACI in the Azure portal



5. Validate the ACI logs and verify your Flights collection is being updated.




### Azure Kubernetes Service Virtual Nodes








## Troubleshooting / Debugging

* 

## Docs / References

* ACI Docs. https://docs.microsoft.com/en-us/azure/container-instances/container-instances-overview 
* AKS Virtual Nodes. https://docs.microsoft.com/en-us/azure/aks/virtual-nodes-cli
* Virtual Kubelet. https://github.com/virtual-kubelet/virtual-kubelet 
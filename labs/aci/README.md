# Lab: Azure Container Instance

This section shows how to extend your AKS Cluster to leverage the power of Azure Container Instance (ACI) and Serverless Containers. Serverless Containers allow you to quickly provision a Container without having to setup any additional infrastructure. It is great for burst capacity scenarios or scenarios where you might only need something to run for a short period of time.

## Prerequisites

* Clone this repo in Azure Cloud Shell.
* Complete previous labs for [AKS](../create-aks-cluster/README.md) and [ACR](../build-application/README.md).

## Instructions

1. Setup Helm for dev Namespace

    * Ensure Helm is setup correctly for an RBAC enabled cluster.

    ```bash
    # Grant Tiller appopriate Cluster Permissions for Deployment
    kubectl apply -f rbac-config.yaml
    # Initialize Helm
    helm init --service-account=tiller
    # Check to see that tiller is Running
    kubectl get all --all-namespaces | grep tiller
    ```

2. Install ACI Connector

    * Install the AKS Cluster ACI Connector to be able to extend the cluster and deploy workloads to Serverless Containers.

    ```bash
    # Environment Setup
    USERINITIALS="<REPLACE-WITH-USER-INITIALS>"
    RG="${USERINITIALS}aksrbac-rg"
    LOC="eastus"
    NAME="${USERINITIALS}aksrbac"
    # Install ACI Connector
    az aks install-connector -g ${RG} -n ${NAME} --connector-name akslab-aci-connector --os-type Both
    # Check to see the new Nodes that have been added to the AKS Cluster
    kubectl get nodes -o wide
    # Check list of Helm Packages and take note of ACI Connectors
    helm list
    ```

3. Deploy Windows Workload via ACI to dev Namespace

    * AKS does not support Windows Containers today, but we can deploy Windows workloads via the AKS Cluster ACI Connector.

    ```bash
    az provider show -n Microsoft.ContainerInstance
    az provider register -n Microsoft.ContainerInstance  
    # Check to see that the ACI Connector pods are running
    kubectl get pods -o wide
    # See that the ACI Node is set to NoSchedule
    kubectl describe node virtual-kubelet-akslab-aci-connector-win | grep -i taint
    # Take a look at hte iis-pod.yaml manifest and take note of the nodeName and tolerations
    code iis-pod.yaml
    # Deploy the IIS Pod to the Dev Namespace
    # Note: This will take a while as Windows Containers are BIG
    kubectl apply -f iis-pod.yaml
    # Check that the pod is Running
    # Reminder: This can take a while (5 to 10 mins)
    kubectl get pods -o wide
    # List ACI and get Public IP Endpoint
    az container list -o table
    az container show -g "MC_${RG}_${NAME}_${LOC}" -n default-iis-winsvrcore --query "{IP:ipAddress.ip,ProvisioningState:provisioningState}" -o table
    # Delete Windows IIS Container
    kubectl delete -f iis-pod.yaml
    # Remove Connector
    az aks remove-connector -g ${RG} -n ${NAME} --connector-name akslab-aci-connector --os-type Both --graceful
    ```

## Troubleshooting / Debugging

* Check to make sure that both the Windows and Linux nodes show as Ready.
* Check to make sure the ACI Connector Pods for both Windows and Linux are running. If not, check the logs for errors.
* Be patient on the Creation of the Windows Container as it is a large image and takes a while to download.

## Docs / References

* [az aks install-connector](https://docs.microsoft.com/en-us/cli/azure/aks?view=azure-cli-latest#az-aks-install-connector)
* [Bursting from AKS to ACI Sample](https://azure.microsoft.com/en-us/resources/samples/virtual-kubelet-aci-burst/)

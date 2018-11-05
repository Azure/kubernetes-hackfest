# Lab 1: Create AKS Cluster

## Prerequisites 

1. Azure Account

## Instructions

1. Login to Azure Portal at http://portal.azure.com.
2. Open the Azure Cloud Shell and choose Bash Shell (do not choose Powershell)

    ![Azure Cloud Shell](img-cloud-shell.png "Azure Cloud Shell")

3. The first time Cloud Shell is started will require you to create a storage account.

4. Once your cloud shell is started, clone the workshop repo into the cloud shell environment
    ```bash
    git clone https://github.com/Azure/kubernetes-hackfest

    cd kubernetes-hackfest/labs/create-aks-cluster
    ```

    > Note: In the cloud shell, you are automatically logged into your Azure subscription.

5. Create Azure Service Prinicpal to use through the labs

    ```bash
    az ad sp create-for-rbac --skip-assignment
    ```
    This will return the following. !!!IMPORTANT!!! - Please copy this information down as you'll need it for labs going forward.

    ```bash
    "appId": "7248f250-0000-0000-0000-dbdeb8400d85",
    "displayName": "azure-cli-2017-10-15-02-20-15",
    "name": "http://azure-cli-2017-10-15-02-20-15",
    "password": "77851d2c-0000-0000-0000-cb3ebc97975a",
    "tenant": "72f988bf-0000-0000-0000-2d7cd011db47"
    ```

    Set the values from above as variables **(replace <appId> and <password> with your values)**.

    DON'T MESS THIS STEP UP. REPLACE THE VALUES IN BRACKETS!!!

    ```bash
    # Persist for Later Sessions in Case of Timeout
    APPID=<appId>
    echo export APPID=$APPID >> ~/.bashrc
    CLIENTSECRET=<password>
    echo export CLIENTSECRET=$CLIENTSECRET >> ~/.bashrc
    ```

6. Create a  unique identifier suffix for resources to be created in this lab.
    
    ```bash
    UNIQUE_SUFFIX=$USER$RANDOM
    # Remove Underscores and Dashes (Not Allowed in AKS and ACR Names)
    UNIQUE_SUFFIX="${UNIQUE_SUFFIX//_}"
    UNIQUE_SUFFIX="${UNIQUE_SUFFIX//-}"
    export ${UNIQUE_SUFFIX}
    # Check Unique Suffix Value (Should be No Underscores or Dashes)
    echo ${UNIQUE_SUFFIX}
    # Persist for Later Sessions in Case of Timeout
    echo export UNIQUE_SUFFIX=$UNIQUE_SUFFIX >> ~/.bashrc
    ```

    *** Note this value as it will be used in the next couple labs. ***

7. Create an Azure Resource Group in East US.

    ```bash
    # Set Resource Group Name
    export RGNAME=kubernetes-hackfest
    # Persist for Later Sessions in Case of Timeout
    echo export RGNAME=kubernetes-hackfest >> ~/.bashrc
    # Set Region (Location)
    export LOCATION=eastus
    # Persist for Later Sessions in Case of Timeout
    echo export LOCATION=eastus >> ~/.bashrc
    # Create Resource Group
    az group create -n $RGNAME -l $LOCATION
    ```

8. Create your AKS cluster in the resource group created above with 3 nodes, targeting Kubernetes version 1.10.3, with Container Insights, and HTTP Application Routing Enabled. You will use the Service Principal information from step 5.

    Use Unique CLUSTERNAME

    ```bash
    # Set AKS Cluster Name
    export CLUSTERNAME=aks${UNIQUE_SUFFIX}
    # Check AKS Cluster Name
    echo $CLUSTERNAME
    # Persist for Later Sessions in Case of Timeout
    echo export CLUSTERNAME=aks${UNIQUE_SUFFIX} >> ~/.bashrc
    ```  
    > The below command can take 10-20 minutes to run as it is creating the AKS cluster. Please be PATIENT and grab a coffee...

    ```bash
    # Create AKS Cluster
    az aks create -n $CLUSTERNAME -g $RGNAME -k 1.11.3 \
    --service-principal $APPID \
    --client-secret $CLIENTSECRET \
    --generate-ssh-keys -l $LOCATION \
    --node-count 3 \
    --enable-addons http_application_routing,monitoring
    ```

9. Verify your cluster status. The `ProvisioningState` should be `Succeeded`
    ```bash
    az aks list -o table
    ```

    ```bash
    Name                 Location    ResourceGroup         KubernetesVersion    ProvisioningState    Fqdn
    -------------------  ----------  --------------------  -------------------  -------------------  -------------------------------------------------------------------
    ODLaks-v2-gbb-16502  eastus   ODL_aks-v2-gbb-16502  1.8.6                Succeeded odlaks-v2--odlaks-v2-gbb-16-b23acc-17863579.hcp.centralus.azmk8s.io
    ```

10. Get the Kubernetes config files for your new AKS cluster

    ```bash
    az aks get-credentials -n $CLUSTERNAME -g $RGNAME
    ```
     
11. Verify you have API access to your new AKS cluster
    
      > Note: It can take 5 minutes for your nodes to appear and be in READY state. You can run `watch kubectl get nodes` to monitor status.

     ```bash
     kubectl get nodes
     ```
    ```bash
     NAME                       STATUS    ROLES     AGE       VERSION
     aks-nodepool1-26522970-0   Ready     agent     33m       v1.10.3
     ```
 
     To see more details about your cluster:

     ```bash
     kubectl cluster-info
     ```
     ```bash
     Kubernetes master is running at https://cluster-dw-kubernetes-hackf-80066e-a44f3eb0.hcp.eastus.azmk8s.io:443

     addon-http-application-routing-default-http-backend is running at https://cluster-dw-kubernetes-hackf-80066e-a44f3eb0.hcp.eastus.azmk8s.io:443/api/v1/namespaces/kube-system/services/addon-http-application-routing-default-http-backend/proxy

     addon-http-application-routing-nginx-ingress is running at http://168.62.191.18:80 http://168.62.191.18:443

     Heapster is running at https://cluster-dw-kubernetes-hackf-80066e-a44f3eb0.hcp.eastus.azmk8s.io:443/api/v1/namespaces/kube-system/services/heapster/proxy

     KubeDNS is running at https://cluster-dw-kubernetes-hackf-80066e-a44f3eb0.hcp.eastus.azmk8s.io:443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

     kubernetes-dashboard is running at https://cluster-dw-kubernetes-hackf-80066e-a44f3eb0.hcp.eastus.azmk8s.io:443/api/v1/namespaces/kube-system/services/kubernetes-dashboard/proxy 
     ```

     You should now have a Kubernetes cluster running with 3 nodes. You do not see the master servers for the cluster because these are managed by Microsoft. The Control Plane services which manage the Kubernetes cluster such as scheduling, API access, configuration data store and object controllers are all provided as services to the nodes.
     

## Troubleshooting / Debugging
<!--To further debug and diagnose cluster problems, use `cluster-info dump` command

`cluster-info dump` dumps cluster info out suitable for debugging and diagnosing cluster problems.  By default, dumps everything to stdout. You can optionally specify a directory with --output-directory.  If you specify a directory, kubernetes will build a set of files in that directory.  By default only dumps things in the 'kube-system' namespace, but you can switch to a different namespace with the --namespaces flag, or specify --all-namespaces to dump all namespaces.

The command also dumps the logs of all of the pods in the cluster, these logs are dumped into different directories based on namespace and pod name.

```bash
kubectl cluster-info dump
```
-->

## Docs / References

[Troubleshoot Kubernetes Clusters](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-cluster/)

# Lab 1a: Create AKS Cluster Namespaces

This lab creates namespaces that reflect a representative example of an organization's environments. In this case DEV, UAT and PROD. We will also apply the appopriate permissions, limits and resource quotas to each of the namespaces.

## Prerequisites

1. Build AKS Cluster (from above)

## Instructions

1. Create Three Namespaces

    ```bash
    # Create namespaces
    kubectl apply -f create-namespaces.yaml

    # Look at namespaces
    kubectl get ns
    ```

2. Assign CPU, Memory and Storage Limits to Namespaces

    ```bash
    # Create namespace limits
    kubectl apply -f namespace-limitranges.yaml

    # Get list of namespaces and drill into one
    kubectl get ns
    kubectl describe ns uat
    ```

3. Assign CPU, Memory and Storage Quotas to Namespaces

    ```bash
    # Create namespace quotas
    kubectl apply -f namespace-quotas.yaml

    # Get list of namespaces and drill into one
    kubectl get ns
    kubectl describe ns dev
    ```

4. Test out Limits and Quotas in **dev** Namespace

    ```bash
    # Test Limits - Forbidden due to assignment of CPU too low
    kubectl run nginx-limittest --image=nginx --restart=Never --replicas=1 --port=80 --requests='cpu=100m,memory=256Mi' -n dev
    # Test Limits - Pass due to automatic assignment within limits via defaults
    kubectl run nginx-limittest --image=nginx --restart=Never --replicas=1 --port=80 -n dev
    # Check running pod and dev Namespace Allocations
    kubectl get po -n dev
    kubectl describe ns dev
    # Test Quotas - Forbidden due to memory quota exceeded
    kubectl run nginx-quotatest --image=nginx --restart=Never --replicas=1 --port=80 --requests='cpu=500m,memory=1Gi' -n dev
    # Test Quotas - Pass due to memory within quota
    kubectl run nginx-quotatest --image=nginx --restart=Never --replicas=1 --port=80 --requests='cpu=500m,memory=512Mi' -n dev
    # Check running pod and dev Namespace Allocations
    kubectl get po -n dev
    kubectl describe ns dev
    ```

5. Clean up limits, quotas, pods

    ```
    kubectl delete -f namespace-limitranges.yaml
    kubectl delete -f namespace-quotas.yaml
    kubectl delete po nginx-limittest nginx-quotatest -n dev

    kubectl describe ns dev
    kubectl describe ns uat
    kubectl describe ns prod
    ```

## Troubleshooting / Debugging

* The limits and quotas of a namespace can be found via the **kubectl describe ns <...>** command. You will also be able to see current allocations.
* If pods are not deploying then check to make sure that CPU, Memory and Storage amounts are within the limits and do not exceed the overall quota of the namespace.

## Docs / References

* [Kubernetes Namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)
* [Default CPU Requests and Limits for a Namespace](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/cpu-default-namespace/)
* [Configure Min and Max CPU Constraints for a Namespace](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/cpu-constraint-namespace/)
* [Configure Memory and CPU Quotas for a Namespace](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/)

#### Next Lab: [Build Application Components](labs/build-application/README.md)

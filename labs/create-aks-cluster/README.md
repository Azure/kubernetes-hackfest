# Lab 1: Create AKS Cluster

## Prerequisites 

1. Azure Account

## Instructions



1. Login to Azure Portal at http://portal.azure.com.
2. Open the Azure Cloud Shell

    ![Azure Cloud Shell](img-cloud-shell.png "Azure Cloud Shell")

3. The first time Cloud Shell is started will require you to create a storage account.

4. Once your cloud shell is started, clone the workshop repo into the cloud shell environment
    ```bash
    git clone https://github.com/Azure/kubernetes-hackfest
    ```
    ```bash
    cd kubernetes-hackfest/labs/create-aks-cluster
    ```

5. In the cloud shell, you are automatically logged into your Azure subscription.

6. Create an Azure Resource Group in East US.

    ```bash
    export RGNAME=kubernetes-hackfest
    ```  
    ```bash
    export LOCATION=eastus
    ```

    ```bash
    az group create -n $RGNAME -l $LOCATION 
7. Create Log Analytics Workspace for Container Insight Monitoring
   ```bash
   export LARG=kubernetes-log
   ```

   ```bash
   export LALOCATION=eastus
   ```

   ```bash
   export LANAME=k8monitor
   ```
   Workspace Name must be unique
   ```bash
   export WORKSPACENAME=k8logs-<unique>
   ```

   Create and Azure Resource Group for the Log Analytics workspace.

   ```bash
   az group create --name $LARG --location $LALOCATION
   ```

8. Deploy Log Analytics Workspace
   ```bash
   az group deployment create -n $WORKSPACENAME -g $LARG --template-file azuredeploy-loganalytics.json \
   --parameters workspaceName=$WORKSPACENAME \
   --parameters location=$LALOCATION \
   --parameters sku="Standalone"
   ```
   Get Worspace ID 
   ```bash
   az group deployment list -g kubernetes-log -o tsv  --query "[].id" | grep "k8logs"
   ```
   Export WorkspaceID based output above
   ```bash
   export WORKSPACEID=<value>
   ```

9. Create your AKS cluster in the resource group created above with 3 nodes, targeting Kubernetes version 1.10.3, with Container Insights, and HTTP Application Routing Enabled.
   * Use unique CONSTERNATE

    ```bash
    export CLUSTERNAME=cluster-<unique>
    ```  
    #### This command can take 10-20 minutes to run as it is creating the AKS cluster. Please be PATIENT...
    ```bash
    az aks create -n $CLLUSTERNAME -g $RGNAME -c 1 -k 1.10.3 \
    --generate-ssh-keys -l $LOCATION \
    --node-count 3 \
    --enable-addons http_application_routing,monitoring \
    --workspace-resource-id $WORKSPACEID
    ```

10. Verify your cluster status. The `ProvisioningState` should be `Succeeded`
    ```bash
    az aks list -o table

    Name                 Location    ResourceGroup         KubernetesVersion    ProvisioningState    Fqdn
    -------------------  ----------  --------------------  -------------------  -------------------  -------------------------------------------------------------------
    ODLaks-v2-gbb-16502  eastus   ODL_aks-v2-gbb-16502  1.8.6                Succeeded odlaks-v2--odlaks-v2-gbb-16-b23acc-17863579.hcp.centralus.azmk8s.io
    ```

11.  Get the Kubernetes config files for your new AKS cluster
     ```bash
      az aks get-credentials -n CLUSTER_NAME -g NAME
     ```
12. Download your kube config, which will allow you to access         your Kubernetes cluster

     ```bash
     az aks get-credentials -g $RGNAME -n $CLUSTERNAME --admin
     ```
13.  Verify you have API access to your new AKS cluster

      > Note: It can take 5 minutes for your nodes to appear and be in READY state. You can run `watch kubectl get nodes` to monitor status.
     ```bash
     kubectl get nodes
    
     NAME                       STATUS    ROLES     AGE       VERSION
     aks-nodepool1-26522970-0   Ready     agent     33m       v1.10.3
     ```
 
     To see more details about your cluster:

     ```bash
     kubectl cluster-info

     Kubernetes master is running at https://cluster-dw-kubernetes-hackf-80066e-a44f3eb0.hcp.eastus.azmk8s.io:443
     addon-http-application-routing-default-http-backend is running at https://cluster-dw-kubernetes-hackf-80066e-a44f3eb0.hcp.eastus.azmk8s.io:443/api/v1/namespaces/kube-system/services/addon-http-application-routing-default-http-backend/proxy
     addon-http-application-routing-nginx-ingress is running at http://168.62.191.18:80 http://168.62.191.18:443
    Heapster is running at https://cluster-dw-kubernetes-hackf-80066e-a44f3eb0.hcp.eastus.azmk8s.io:443/api/v1/namespaces/kube-system/services/heapster/proxy
    KubeDNS is running at https://cluster-dw-kubernetes-hackf-80066e-a44f3eb0.hcp.eastus.azmk8s.io:443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
    kubernetes-dashboard is running at https://cluster-dw-kubernetes-hackf-80066e-a44f3eb0.hcp.eastus.azmk8s.io:443/api/v1/namespaces/kube-system/services/kubernetes-dashboard/proxy 
     ```

     You should now have a Kubernetes cluster running with 3 nodes. You do not see the master servers for the cluster because these are managed by Microsoft. The Control Plane services which manage the Kubernetes cluster such as scheduling, API access, configuration data store and object controllers are all provided as services to the nodes.
     
     Download your kube config, which will allow you to access your Kubernetes cluster

     ```bash
     az aks get-credentials -g $RGNAME -n $CLUSTERNAME --admin
     ```


## Troubleshooting / Debugging
To further debug and diagnose cluster problems, use

     ```bash
     kubectl cluster-info dump
     ```

## Docs / References

# Lab 2: Create AKS Cluster Namespaces

This lab creates namespaces that reflect a representative example of an organization's environments. In this case DEV, UAT and PROD. We will also apply the appopriate permissions, limits and resource quotas to each of the namespaces.

## Prerequisites

1. Built AKS Cluster

## Instructions

1. Create Three Namespaces

    ```bash
    # Create Namespaces
    kubectl apply -f create-namespaces.yaml

    # Look at Namespaces
    kubectl get ns
    ```

2. Assign CPU, Memory and Storage Limits to Namespaces

    ```bash
    # Create Namespace Limits
    kubectl apply -f namespace-limitranges.yaml

    # Get List of Namespaces and Drill into One
    kubectl get ns
    kubectl describe ns <INSERT-NAMESPACE-NAME-HERE>
    ```

3. Assign CPU, Memory and Storage Quotas to Namespaces

    ```bash
    # Create Namespace Quotas
    kubectl apply -f namespace-quotas.yaml

    # Get List of Namespaces and Drill into One
    kubectl get ns
    kubectl describe ns <INSERT-NAMESPACE-NAME-HERE>
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

## Troubleshooting / Debugging

* The limits and quotas of a namespace can be found via the **kubectl describe ns <...>** command. You will also be able to see current allocations.
* If pods are not deploying then check to make sure that CPU, Memory and Storage amounts are within the limits and do not exceed the overall quota of the namespace.

## Docs / References

* [Kubernetes Namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)
* [Default CPU Requests and Limits for a Namespace](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/cpu-default-namespace/)
* [Configure Min and Max CPU Constraints for a Namespace](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/cpu-constraint-namespace/)
* [Configure Memory and CPU Quotas for a Namespace](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/)


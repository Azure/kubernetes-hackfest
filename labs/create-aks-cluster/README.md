# Lab: Create AKS Cluster

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

   ```bash
   export WORSPACEID=<value>
   ```

9. Create your AKS cluster in the resource group created above with 3 nodes, targeting Kubernetes version 1.10.3, with Container Insights, and HTTP Application Routing Enabled.
   * Use unique CONSTERNATE

    ```bash
    export CLUSTERNAME=cluster-<unique>
    ```  
    #### This command can take 10-20 minutes to run as it is creating the AKS cluster. Please be PATIENT...
    ```bash
    az aks create -n $CLLUSTERNAME -g $RGNAME -c 1 -k 1.10.3  --generate-ssh-keys -l $LOCATION
    --enable-addons http_application_routing,monitoring
    --workspace-resource-id $WORKSPACEIDURL
    --no-wait  
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
12.  Verify you have API access to your new AKS cluster

      > Note: It can take 5 minutes for your nodes to appear and be in READY state. You can run `watch kubectl get nodes` to monitor status.
     ```bash
     kubectl get nodes
    
     NAME                       STATUS    ROLES     AGE        VERSION
     aks-nodepool1-20004257-0   Ready     agent     4m         v1.10.3
     aks-nodepool1-20004257-1   Ready     agent     4m         v1.10.3
     ```
 
     To see more details about your cluster:

     ```bash
     kubectl cluster-info

     Kubernetes master is running at https://odlaks-v2--odlaks-v2-gbb-11-b23acc-115da6a3.hcp.centralus.azmk8s.io:443
     Heapster is running at https://odlaks-v2--odlaks-v2-gbb-11-b23acc-115da6a3.hcp.centralus.azmk8s.io:443/api/v1/namespaces/kube-system/services/heapster/proxy
     KubeDNS is running at https://odlaks-v2--odlaks-v2-gbb-11-b23acc-115da6a3.hcp.centralus.azmk8s.io:443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
     kubernetes-dashboard is running at https://odlaks-v2--odlaks-v2-gbb-11-b23acc-115da6a3.hcp.centralus.azmk8s.io:443/api/v1/namespaces/kube-system/services/kubernetes-dashboard/proxy
     ```

     To further debug and diagnose cluster problems, use

     ```bash
     kubectl cluster-info dump
     ```

     You should now have a Kubernetes cluster running with 1 node. You do not see the master servers for the cluster because these are managed by Microsoft. The Control Plane services which manage the Kubernetes cluster such as scheduling, API access, configuration data store and object controllers are all provided as services to the nodes.



## Troubleshooting / Debugging

## Docs / References


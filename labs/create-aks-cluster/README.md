# Lab 1: Create AKS Cluster

In this lab we will create our Azure Kubernetes Services (AKS) distributed compute cluster.

## Prerequisites

- Azure Account

## Instructions

1. Login to Azure Portal at http://portal.azure.com.
2. Open the Azure Cloud Shell and choose Bash Shell (do not choose Powershell)

   ![Azure Cloud Shell](img-cloud-shell.png "Azure Cloud Shell")

3. The first time Cloud Shell is started will require you to create a storage account.

4. Once your cloud shell is started, clone the workshop repo into the cloud shell environment

   ```bash
   git clone https://github.com/Azure/kubernetes-hackfest
   ```

   > Note: In the cloud shell, you are automatically logged into your Azure subscription.

5. Ensure you are using the correct Azure subscription you want to deploy AKS to.

   ```
   # View subscriptions
   az account list
   ```

   ```
   # Verify selected subscription
   az account show
   ```

   ```
   # Set correct subscription (if needed)
   az account set --subscription <subscription_id>

   # Verify correct subscription is now set
   az account show
   ```

6. Create Azure Service Principal to use through the labs

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

    >**Warning:** Several of the following steps have you echo values to your .bashrc file. This is done so that you can get those values back if your session reconnects. You will want to remember to clean these up at the end of the training, in particular if you're running on your own, or your company's, subscription.

    DON'T MESS THIS STEP UP. REPLACE THE VALUES IN BRACKETS!!!

    ```bash
    # Persist for Later Sessions in Case of Timeout
    APPID=<appId>
    echo export APPID=$APPID >> ~/.bashrc
    CLIENTSECRET=<password>
    echo export CLIENTSECRET=$CLIENTSECRET >> ~/.bashrc
    ```

7. Create a unique identifier suffix for resources to be created in this lab.

   ```bash
   UNIQUE_SUFFIX=$USER$RANDOM
   # Remove Underscores and Dashes (Not Allowed in AKS and ACR Names)
   UNIQUE_SUFFIX="${UNIQUE_SUFFIX//_}"
   UNIQUE_SUFFIX="${UNIQUE_SUFFIX//-}"
   # Check Unique Suffix Value (Should be No Underscores or Dashes)
   echo $UNIQUE_SUFFIX
   # Persist for Later Sessions in Case of Timeout
   echo export UNIQUE_SUFFIX=$UNIQUE_SUFFIX >> ~/.bashrc
   ```

   **_ Note this value as it will be used in the next couple labs. _**

8. Create an Azure Resource Group in East US.

   ```bash
   # Set Resource Group Name using the unique suffix
   RGNAME=aks-rg-$UNIQUE_SUFFIX
   # Persist for Later Sessions in Case of Timeout
   echo export RGNAME=$RGNAME >> ~/.bashrc
   # Set Region (Location)
   LOCATION=eastus
   # Persist for Later Sessions in Case of Timeout
   echo export LOCATION=eastus >> ~/.bashrc
   # Create Resource Group
   az group create -n $RGNAME -l $LOCATION
   ```

9. Create your AKS cluster in the resource group created above with 3 nodes. We will check for a recent version of kubnernetes before proceeding. We are also including the monitoring add-on for Azure Container Insights. You will use the Service Principal information from step 5.

   Use Unique CLUSTERNAME

   ```bash
   # Set AKS Cluster Name
   CLUSTERNAME=aks${UNIQUE_SUFFIX}
   # Look at AKS Cluster Name for Future Reference
   echo $CLUSTERNAME
   # Persist for Later Sessions in Case of Timeout
   echo export CLUSTERNAME=aks${UNIQUE_SUFFIX} >> ~/.bashrc
   ```

   Get available kubernetes versions for the region. You will likely see more recent versions in your lab.

   ```bash
   az aks get-versions -l $LOCATION --output table

   KubernetesVersion    Upgrades
   -------------------  -------------------------------------------------
   1.18.2(preview)      None available
   1.18.1(preview)      1.18.2(preview)
   1.17.5(preview)      1.18.1(preview), 1.18.2(preview)
   1.17.4(preview)      1.17.5(preview), 1.18.1(preview), 1.18.2(preview)
   1.16.9               1.17.4(preview), 1.17.5(preview)
   1.16.8               1.16.9, 1.17.4(preview), 1.17.5(preview)
   1.15.11              1.16.8, 1.16.9
   1.15.10              1.15.11, 1.16.8, 1.16.9
   1.14.8               1.15.10, 1.15.11
   1.14.7               1.14.8, 1.15.10, 1.15.11
   ```

   For this lab we'll use 1.15.11.

   ```bash
   K8SVERSION=1.15.11
   ```

   > The below command can take 10-20 minutes to run as it is creating the AKS cluster. Please be PATIENT and grab a coffee...

   ```bash
   # Create AKS Cluster
   az aks create -n $CLUSTERNAME -g $RGNAME \
   --kubernetes-version $K8SVERSION \
   --service-principal $APPID \
   --client-secret $CLIENTSECRET \
   --generate-ssh-keys -l $LOCATION \
   --node-count 3 \
   --no-wait
   ```

10. Verify your cluster status. The `ProvisioningState` should be `Succeeded`

    ```bash
    az aks list -o table
    ```

    ```bash
    Name             Location    ResourceGroup            KubernetesVersion    ProvisioningState    Fqdn
    ---------------  ----------  -----------------------  -------------------  -------------------  ----------------------------------------------------------------
    aksstephen14260  eastus      aks-rg-stephen14260      1.15.7             Succeeded            aksstephen-aks-rg-stephen14-62afe9-9aa48ae4.hcp.eastus.azmk8s.io
    ```

11. Get the Kubernetes config files for your new AKS cluster

    ```bash
    az aks get-credentials -n $CLUSTERNAME -g $RGNAME
    ```

12. Verify you have API access to your new AKS cluster

    > Note: It can take 5 minutes for your nodes to appear and be in READY state. You can run `watch kubectl get nodes` to monitor status.

    ```bash
    kubectl get nodes
    ```

    ```bash
    NAME                                STATUS   ROLES   AGE    VERSION
    aks-nodepool1-33525724-vmss000000   Ready    agent   177m   v1.15.7
    aks-nodepool1-33525724-vmss000001   Ready    agent   177m   v1.15.7
    aks-nodepool1-33525724-vmss000002   Ready    agent   177m   v1.15.7
    ```

    To see more details about your cluster:

    ```bash
    kubectl cluster-info
    ```

    ```bash
    Kubernetes master is running at https://aksstephen-aks-rg-stephen14-62afe9-9aa48ae4.hcp.eastus.azmk8s.io:443
    Heapster is running at https://aksstephen-aks-rg-stephen14-62afe9-9aa48ae4.hcp.eastus.azmk8s.io:443/api/v1/namespaces/kube-system/services/heapster/proxy
    CoreDNS is running at https://aksstephen-aks-rg-stephen14-62afe9-9aa48ae4.hcp.eastus.azmk8s.io:443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
    kubernetes-dashboard is running at https://aksstephen-aks-rg-stephen14-62afe9-9aa48ae4.hcp.eastus.azmk8s.io:443/api/v1/namespaces/kube-system/services/kubernetes-dashboard/proxy
    Metrics-server is running at https://aksstephen-aks-rg-stephen14-62afe9-9aa48ae4.hcp.eastus.azmk8s.io:443/api/v1/namespaces/kube-system/services/https:metrics-server:/proxy
    ```

    You should now have a Kubernetes cluster running with 3 nodes. You do not see the master servers for the cluster because these are managed by Microsoft. The Control Plane services which manage the Kubernetes cluster such as scheduling, API access, configuration data store and object controllers are all provided as services to the nodes.

## Namespaces Setup

This lab creates namespaces that reflect a representative example of an organization's environments. In this case dev, uat and prod. We will also apply the appopriate permissions, limits and resource quotas to each of the namespaces.

1. Navigate to the directory of the cloned repository

   ```bash
   cd kubernetes-hackfest
   ```

2. Create three namespaces

   ```bash
   # Create namespaces
   kubectl apply -f labs/create-aks-cluster/create-namespaces.yaml

   # Look at namespaces
   kubectl get ns
   ```

3. Assign CPU, memory and storage limits to namespaces

   ```bash
   # Create namespace limits
   kubectl apply -f labs/create-aks-cluster/namespace-limitranges.yaml

   # Get list of namespaces and drill into one
   kubectl get ns
   kubectl describe ns <ns-name>
   ```

4. Assign CPU, Memory and Storage Quotas to Namespaces

   ```bash
   # Create namespace quotas
   kubectl apply -f labs/create-aks-cluster/namespace-quotas.yaml

   # Get list of namespaces and drill into one
   kubectl get ns
   kubectl describe ns dev
   ```

5. Test out Limits and Quotas in **dev** Namespace

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

6. Clean up limits, quotas, pods

   ```bash
   kubectl delete -f labs/create-aks-cluster/namespace-limitranges.yaml
   kubectl delete -f labs/create-aks-cluster/namespace-quotas.yaml
   kubectl delete po nginx-limittest nginx-quotatest -n dev

   kubectl describe ns dev
   kubectl describe ns uat
   kubectl describe ns prod
   ```

7. Create namespace for our application. This will be used in subsequent labs.

   ```bash
   kubectl create ns hackfest
   ```

## Troubleshooting / Debugging

- The limits and quotas of a namespace can be found via the **kubectl describe ns <...>** command. You will also be able to see current allocations.
- If pods are not deploying then check to make sure that CPU, Memory and Storage amounts are within the limits and do not exceed the overall quota of the namespace.

## Docs / References

- [Troubleshoot Kubernetes Clusters](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-cluster)
- [Kubernetes Namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)
- [Default CPU Requests and Limits for a Namespace](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/cpu-default-namespace/)
- [Configure Min and Max CPU Constraints for a Namespace](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/cpu-constraint-namespace/)
- [Configure Memory and CPU Quotas for a Namespace](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/)
- [Use Ansible to deploy AKS](https://docs.microsoft.com/en-us/azure/ansible/ansible-create-configure-aks?toc=%2Fen-us%2Fazure%2Faks%2FTOC.json&bc=%2Fen-us%2Fazure%2Fbread%2Ftoc.json)
- [Use Terraform to deploy AKS](https://docs.microsoft.com/en-us/azure/terraform/terraform-create-k8s-cluster-with-tf-and-aks?toc=%2Fen-us%2Fazure%2Faks%2FTOC.json&bc=%2Fen-us%2Fazure%2Fbread%2Ftoc.json)

#### Next Lab: [Build Application Components and Prerequisites](../build-application/README.md)

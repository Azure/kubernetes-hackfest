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

6. Create a unique identifier suffix for resources to be created in this lab.

   > *NOTE:* In the following sections we'll be generating and setting some environment variables. If you're terminal session restarts you may need to reset these variables. You can use that via the following command:
   >
   > source ~/workshopvars.env

   ```bash
   echo "# Start AKS Hackfest Lab Params">>~/workshopvars.env
   UNIQUE_SUFFIX=$USER$RANDOM
   # Remove Underscores and Dashes (Not Allowed in AKS and ACR Names)
   UNIQUE_SUFFIX="${UNIQUE_SUFFIX//_}"
   UNIQUE_SUFFIX="${UNIQUE_SUFFIX//-}"
   # Check Unique Suffix Value (Should be No Underscores or Dashes)
   echo $UNIQUE_SUFFIX
   # Persist for Later Sessions in Case of Timeout
   echo export UNIQUE_SUFFIX=$UNIQUE_SUFFIX >> ~/workshopvars.env
   ```

7. Create an Azure Resource Group in East US.

   ```bash
   # Set Resource Group Name using the unique suffix
   RGNAME=aks-rg-$UNIQUE_SUFFIX
   # Persist for Later Sessions in Case of Timeout
   echo export RGNAME=$RGNAME >> ~/workshopvars.env
   # Set Region (Location)
   LOCATION=eastus
   # Persist for Later Sessions in Case of Timeout
   echo export LOCATION=eastus >> ~/workshopvars.env
   # Create Resource Group
   az group create -n $RGNAME -l $LOCATION
   ```

8. Create your AKS cluster in the resource group created above with 3 nodes. We will check for a recent version of kubnernetes before proceeding. We are also including the monitoring add-on for Azure Container Insights. You will use the Service Principal information from step 5.

   Use Unique CLUSTERNAME

   ```bash
   # Set AKS Cluster Name
   CLUSTERNAME=aks${UNIQUE_SUFFIX}
   # Look at AKS Cluster Name for Future Reference
   echo $CLUSTERNAME
   # Persist for Later Sessions in Case of Timeout
   echo export CLUSTERNAME=aks${UNIQUE_SUFFIX} >> ~/workshopvars.env
   ```

   Get available kubernetes versions for the region. You will likely see more recent versions in your lab.

   ```bash
   az aks get-versions -l $LOCATION --output table

   KubernetesVersion    Upgrades
   -------------------  ----------------------
   1.23.5               None available
   1.23.3               1.23.5
   1.22.6               1.23.3, 1.23.5
   1.22.4               1.22.6, 1.23.3, 1.23.5
   1.21.9               1.22.4, 1.22.6
   1.21.7               1.21.9, 1.22.4, 1.22.6
   ```

   For this lab we'll use 1.23.5

   ```bash
   K8SVERSION=1.23.5
   ```

   > The below command can take 3-5 minutes to run as it is creating the AKS cluster. 

   ```bash
   # Create AKS Cluster
   az aks create -n $CLUSTERNAME -g $RGNAME \
   --kubernetes-version $K8SVERSION \
   --enable-managed-identity \
   --generate-ssh-keys -l $LOCATION \
   --node-count 3 \
   --no-wait
   ```

9.  Verify your cluster status. The `ProvisioningState` should be `Succeeded`

   ```bash
   az aks list -o table
   # Or
   watch az aks list -o table
   ```

   ```bash
      Name            Location    ResourceGroup      KubernetesVersion    ProvisioningState    Fqdn
      --------------  ----------  -----------------  -------------------  -------------------  ----------------------------------------------------------------
      aks25415        eastus      aks-rg-25415       1.23.5               Succeeded            aks25415-aks-rg-25415-62afe9-3a0152d0.hcp.eastus.azmk8s.io
   ```

10.  Get the Kubernetes config files for your new AKS cluster

   ```bash
     az aks get-credentials -n $CLUSTERNAME -g $RGNAME
   ```

12.  Verify you have API access to your new AKS cluster

   ```bash
   kubectl get nodes
   ```

   ```bash
   NAME                                STATUS   ROLES   AGE     VERSION
   aks-nodepool1-25335207-vmss000000   Ready    agent   2m1s    v1.23.5
   aks-nodepool1-25335207-vmss000001   Ready    agent   2m5s    v1.23.5
   aks-nodepool1-25335207-vmss000002   Ready    agent   2m13s   v1.23.5
   ```

   To see more details about your cluster:

   ```bash
    kubectl cluster-info
   
   Kubernetes control plane is running at https://akssteve10-aks-rg-steve1075-62afe9-631a3ab4.hcp.eastus.azmk8s.io:443
   CoreDNS is running at https://akssteve10-aks-rg-steve1075-62afe9-631a3ab4.hcp.eastus.azmk8s.io:443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
   Metrics-server is running at https://akssteve10-aks-rg-steve1075-62afe9-631a3ab4.hcp.eastus.azmk8s.io:443/api/v1/namespaces/kube-system/services/https:metrics-server:/proxy

   To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
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

   # Get list of namespaces and describe each
   kubectl get ns
   kubectl describe ns dev uat prod
   ```

4. Assign CPU, Memory and Storage Quotas to Namespaces

   ```bash
   # Create namespace quotas
   kubectl apply -f labs/create-aks-cluster/namespace-quotas.yaml

   # Get list of namespaces and describe each
   kubectl get ns
   kubectl describe ns dev uat prod
   ```

5. Test out Limits and Quotas in **dev** Namespace

   ```bash
   # Test Limits - Forbidden due to assignment of CPU too low
   cat <<EOF | kubectl apply -f -
   apiVersion: v1
   kind: Pod
   metadata:
      name: nginx-limittest
      namespace: dev
      labels:
         run: nginx-limittest
   spec:
      containers:
      - image: nginx
        name: nginx-limittest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
   EOF
   ```

   ```bash
   # Test Limits - Pass due to automatic assignment within limits via defaults
   kubectl run nginx-limittest --image=nginx --restart=Never --port=80 -n dev

   # Check running pod and dev Namespace Allocations
   kubectl get po -n dev
   kubectl describe ns dev
   ```

   ```bash
   # Test Quotas - Forbidden due to memory quota exceeded
   cat <<EOF | kubectl apply -f -
   apiVersion: v1
   kind: Pod
   metadata:
      name: nginx-quotatest
      namespace: dev
      labels:
         run: nginx-quotatest
   spec:
      containers:
      - image: nginx
        name: nginx-quotatest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
   EOF
   ```

   ```bash
   # Test Quotas - Pass due to memory within quota
   cat <<EOF | kubectl apply -f -
   apiVersion: v1
   kind: Pod
   metadata:
      name: nginx-quotatest
      namespace: dev
      labels:
         run: nginx-quotatest
   spec:
      containers:
      - image: nginx
        name: nginx-quotatest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
   EOF

   # Check running pod and dev Namespace Allocations
   kubectl get po -n dev
   kubectl describe ns dev
   ```

6. Clean up limits, quotas, pods

   ```bash
   kubectl delete ns dev
   kubectl delete ns uat
   kubectl delete ns prod
   ```

7. Create namespace for our application. This will be used in subsequent labs.

   ```bash
   kubectl create ns hackfest
   ```

## Troubleshooting / Debugging

- The limits and quotas of a namespace can be found via the **kubectl describe ns <...>** command. You will also be able to see current allocations.
- If pods are not deploying then check to make sure that CPU, Memory and Storage amounts are within the limits and do not exceed the overall quota of the namespace.

## Docs / References

- [Troubleshoot Kubernetes Clusters](https://kubernetes.io/docs/tasks/debug/debug-cluster/)
- [Kubernetes Namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)
- [Default CPU Requests and Limits for a Namespace](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/cpu-default-namespace/)
- [Configure Min and Max CPU Constraints for a Namespace](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/cpu-constraint-namespace/)
- [Configure Memory and CPU Quotas for a Namespace](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/)
- [Use Ansible to deploy AKS](https://docs.microsoft.com/en-us/azure/ansible/ansible-create-configure-aks?toc=%2Fen-us%2Fazure%2Faks%2FTOC.json&bc=%2Fen-us%2Fazure%2Fbread%2Ftoc.json)
- [Use Terraform to deploy AKS](https://docs.microsoft.com/en-us/azure/terraform/terraform-create-k8s-cluster-with-tf-and-aks?toc=%2Fen-us%2Fazure%2Faks%2FTOC.json&bc=%2Fen-us%2Fazure%2Fbread%2Ftoc.json)

#### Next Lab: [Build Application Components and Prerequisites](../build-application/README.md)

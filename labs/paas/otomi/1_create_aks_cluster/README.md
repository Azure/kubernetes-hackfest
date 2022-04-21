# Lab 1: Creating an AKS cluster

In this lab, we'll be using the Azure CLI to create a Azure Kubernetes Service (AKS) cluster and configure `kubectl` access to it.

## Prerequisites

- Azure account with required permissions to create and manage K8s clusters

## Instructions

1. Login to Azure Portal at <http://portal.azure.com>.
2. Open the Azure Cloud Shell and choose Bash Shell (do not choose Powershell)

   ![Azure Cloud Shell](img-cloud-shell.png "Azure Cloud Shell")

3. The first time Cloud Shell is started will require you to create a storage account.

4. Once your cloud shell is started, clone the workshop repo into the cloud shell environment:

   ```bash
   git clone https://github.com/Azure/kubernetes-hackfest
   ```

   > Note: In the cloud shell, you are automatically logged into your Azure subscription.

5. Ensure you are using the correct Azure subscription you want to deploy AKS to:

   ```bash
   # View subscriptions
   az account list
   ```

   ```bash
   # Verify selected subscription
   az account show
   ```

   ```bash
   # Set correct subscription (if needed)
   az account set --subscription <subscription_id>

   # Verify correct subscription is now set
   az account show
   ```

6. Create a unique identifier suffix for resources to be created in this lab:

   ```bash
   echo -e "\n# Start AKS Otomi Hackfest Lab Params">>~/.bashrc
   UNIQUE_SUFFIX=$USER$RANDOM
   # Remove Underscores and Dashes (Not Allowed in AKS and ACR Names)
   UNIQUE_SUFFIX="${UNIQUE_SUFFIX//_}"
   UNIQUE_SUFFIX="${UNIQUE_SUFFIX//-}"
   # Check Unique Suffix Value (Should be No Underscores or Dashes)
   echo $UNIQUE_SUFFIX
   # Persist for Later Sessions in Case of Timeout
   echo export UNIQUE_SUFFIX=$UNIQUE_SUFFIX >> ~/.bashrc
   ```

7. Create an Azure Resource Group in `East US`:

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

8. Create an AKS cluster:

    ```bash
    # Set AKS Cluster Name
    CLUSTERNAME=aks${UNIQUE_SUFFIX}
    # Look at AKS Cluster Name for Future Reference
    echo $CLUSTERNAME
    # Persist for Later Sessions in Case of Timeout
    echo export CLUSTERNAME=aks${UNIQUE_SUFFIX} >> ~/.bashrc
    ```

    ```bash
    # Create AKS cluster
    az aks create --name $CLUSTERNAME \
    --resource-group $RGNAME \
    --location $LOCATION \
    --zones 1 2 \
    --vm-set-type VirtualMachineScaleSets \
    --nodepool-name otomipool \
    --node-count 2 \
    --node-vm-size Standard_D5_v2 \
    --kubernetes-version 1.21.9 \
    --enable-cluster-autoscaler \
    --min-count 2 \
    --max-count 3 \
    --max-pods 100 \
    --network-plugin azure \
    --network-policy calico \
    --outbound-type loadBalancer \
    --uptime-sla \
    --generate-ssh-keys
    ```

9. Verify your cluster status. The `ProvisioningState` should be `Succeeded`:

    ```bash
     az aks list -o table
    ```

10. Get the Kubernetes config files for your new AKS cluster:

    ```bash
    az aks get-credentials -n $CLUSTERNAME -g $RGNAME
    ```

11. Verify you have API access to your new AKS cluster:

    ```bash
    kubectl get nodes
    ```

Go to the [next lab](../2_install_otomi/README.md)
